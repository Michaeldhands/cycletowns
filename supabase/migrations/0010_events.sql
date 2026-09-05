-- Global cycling events — gran fondos, stage races and mass-participation rides.
-- Separate from the older per-town `races` table: an event is a thing in its own right that
-- may or may not sit near one of our towns, and riders search for it by name.

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  organiser   text,
  url         text,                                  -- the official event site, always
  country     text,
  region      text,
  town_id     text references towns(id) on delete set null,
  next_date   date,                                  -- only when the organiser has published it
  "window"    text,                                  -- "First Sunday in July, annually" when they haven't.
                                                     -- Quoted: window is a reserved word in Postgres.
  km          integer[] not null default '{}',       -- route options offered
  vert        integer,
  discipline  text not null default 'road' check (discipline in ('road','gravel','mtb','mixed')),
  month       text,
  note        text not null default '',
  verified    date,                                  -- when a human last checked this against the official site
  status      text not null default 'published' check (status in ('published','hidden')),
  sort        integer not null default 0,
  updated_at  timestamptz not null default now()
);
create index if not exists events_town on events(town_id);
create index if not exists events_date on events(next_date);

alter table events enable row level security;
drop policy if exists events_read on events;
create policy events_read on events for select using (status = 'published' or is_admin());
drop policy if exists events_write on events;
create policy events_write on events for all using (is_admin()) with check (is_admin());

drop trigger if exists events_touch on events;
create trigger events_touch before update on events for each row execute function touch_updated_at();

/** Events whose published date has passed, so the admin knows what to re-check.
    A date nobody has confirmed since it went by is worse than no date at all. */
create or replace function stale_events()
returns table (slug text, name text, next_date date, verified date, url text)
language sql security definer set search_path = public as $$
  select e.slug, e.name, e.next_date, e.verified, e.url
  from events e
  where is_admin()
    and (
      (e.next_date is not null and e.next_date < current_date)
      or (e.verified is null or e.verified < current_date - interval '180 days')
    )
  order by e.next_date nulls last
$$;
revoke all on function stale_events() from public, anon;
grant execute on function stale_events() to authenticated;
