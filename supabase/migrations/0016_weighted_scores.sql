-- Recency weighting, volume confidence and ride verification.
--
-- Until now town_scores was a plain average of every published review, which is what
-- /how-rankings-work now says. This migration makes the three things that page lists as
-- "not built yet" real. Change this file and that page together, always.
--
--   Recency   — a review's weight halves every 548 days (18 months) from the date the rider
--               says they were there, falling back to when they wrote it. A town's score
--               should reflect how it rides now, not how it rode when a café was still open.
--   Verified  — a review with a verified ride counts double an unverified one (1.0 vs 0.5).
--               Everyone's review still counts; the ones we can stand behind count more.
--   Volume    — the DISPLAYED score is the honest weighted average and nothing else. The
--               ranking uses rank_score: that average minus one standard error, so a town
--               with sixty reviews at 4.5 outranks one with five at 4.6. We never show a
--               number the riders didn't give.

-- ---------------------------------------------------------------- verification on a review
alter table reviews add column if not exists verified_at   timestamptz;
alter table reviews add column if not exists verify_source text;
alter table reviews add column if not exists verify_ref    text;   -- provider's activity id

do $$ begin
  alter table reviews add constraint reviews_verify_source_ck
    check (verify_source is null or verify_source in ('strava','gpx'));
exception when duplicate_object then null; end $$;

comment on column reviews.verify_ref is
  'Provider activity id only. We never store activity streams, GPS tracks, titles or any other '
  'athlete data — the check happens in memory and only its result is kept.';

create index if not exists reviews_verified on reviews(town_id) where verified_at is not null;

-- ---------------------------------------------------------------- the scoring view
drop view if exists town_scores;
create view town_scores as
with r as (
  select
    v.town_id,
    (v.cafes + v.routes + v.safety + v.climbs + v.storage) / 5.0 as x,
    v.cafes, v.routes, v.safety, v.climbs, v.storage,
    (v.verified_at is not null) as verified,
    -- 18-month half-life on the ride date, halved again if the ride isn't verified
    power(0.5, greatest(0, current_date - coalesce(v.visited_on, v.created_at::date))::numeric / 548.0)
      * (case when v.verified_at is not null then 1.0 else 0.5 end) as wt
  from reviews v
  where v.status = 'published'
),
agg as (
  select
    town_id,
    count(*)::int                                  as review_count,
    count(*) filter (where verified)::int          as verified_count,
    sum(wt)                                        as wn,
    sum(wt * x)       / nullif(sum(wt), 0)         as wmean,
    sum(wt * cafes)   / nullif(sum(wt), 0)         as cafes,
    sum(wt * routes)  / nullif(sum(wt), 0)         as routes,
    sum(wt * safety)  / nullif(sum(wt), 0)         as safety,
    sum(wt * climbs)  / nullif(sum(wt), 0)         as climbs,
    sum(wt * storage) / nullif(sum(wt), 0)         as storage
  from r
  group by town_id
),
spread as (
  -- weighted standard deviation, for the confidence penalty below
  select r.town_id, sqrt(sum(r.wt * power(r.x - a.wmean, 2)) / nullif(sum(r.wt), 0)) as sd
  from r join agg a using (town_id)
  group by r.town_id
)
select
  a.town_id,
  a.review_count,
  a.verified_count,
  round(a.wn::numeric, 2)      as weighted_n,
  round(a.wmean::numeric, 1)   as score,
  round(a.cafes::numeric, 1)   as cafes,
  round(a.routes::numeric, 1)  as routes,
  round(a.safety::numeric, 1)  as safety,
  round(a.climbs::numeric, 1)  as climbs,
  round(a.storage::numeric, 1) as storage,
  -- one standard error below the average. A lone review carries the full 0.8 default spread,
  -- so it can't vault a town to the top; sixty reviews barely move it.
  round((a.wmean - coalesce(nullif(s.sd, 0), 0.8) / sqrt(greatest(a.wn, 1)))::numeric, 3) as rank_score
from agg a
join spread s using (town_id);

grant select on town_scores to anon, authenticated;

-- ---------------------------------------------------------------- Strava connection
-- Tokens live here and nowhere else. No policy grants any role access: this table is
-- reachable only with the service-role key, from the server. RLS on with zero policies
-- means every anon/authenticated read and write is denied.
create table if not exists strava_accounts (
  user_id       uuid primary key references profiles(id) on delete cascade,
  athlete_id    bigint not null,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  scope         text,
  connected_at  timestamptz not null default now(),
  last_used_at  timestamptz
);
alter table strava_accounts enable row level security;

comment on table strava_accounts is
  'Strava OAuth tokens, service-role only. Deleted when the rider disconnects, at which point '
  'we also clear reviews.verify_ref for that rider — we keep that we checked, not what we saw.';

-- A rider disconnecting takes the provider''s activity ids with them.
create or replace function strava_forget(p_user uuid)
returns void language sql security definer set search_path = public as $$
  delete from strava_accounts where user_id = p_user;
  update reviews set verify_ref = null where user_id = p_user and verify_source = 'strava';
$$;
revoke all on function strava_forget(uuid) from public, anon, authenticated;
