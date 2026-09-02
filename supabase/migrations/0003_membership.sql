-- Rider membership (Stripe subscriptions) + partner offers
alter table profiles add column if not exists stripe_customer_id text unique;
alter table profiles add column if not exists membership text not null default 'free' check (membership in ('free','insider'));
alter table profiles add column if not exists membership_interval text;          -- month / year
alter table profiles add column if not exists membership_until timestamptz;      -- current period end
alter table profiles add column if not exists stripe_subscription_id text;

-- members earn double points
create or replace function award_points(p_user uuid, p_kind text, p_points int, p_ref text)
returns void language plpgsql security definer set search_path = public as $$
declare mult int := 1;
begin
  select case when membership = 'insider' and (membership_until is null or membership_until > now()) then 2 else 1 end
    into mult from profiles where id = p_user;
  p_points := p_points * coalesce(mult, 1);
  perform set_config('ct.award', '1', true);
  insert into point_events(user_id, kind, points, ref_id) values (p_user, p_kind, p_points, p_ref);
  update profiles set points = points + p_points,
    tier = case when points + p_points >= 1000 then 'champion' when points + p_points >= 250 then 'insider' else tier end
  where id = p_user;
  perform set_config('ct.award', '', true);
end $$;

-- membership fields can only be changed by the server (service role, no auth.uid) or admins
create or replace function protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_admin() and coalesce(current_setting('ct.award', true), '') <> '1' then
    new.is_admin := old.is_admin;
    new.points   := old.points;
    new.tier     := old.tier;
    new.stripe_customer_id := old.stripe_customer_id;
    new.membership := old.membership;
    new.membership_interval := old.membership_interval;
    new.membership_until := old.membership_until;
    new.stripe_subscription_id := old.stripe_subscription_id;
  end if;
  return new;
end $$;

-- partner offers, members-only
create table if not exists offers (
  id          uuid primary key default gen_random_uuid(),
  partner     text not null,
  title       text not null,
  description text not null default '',
  code        text,
  url         text,
  town_id     text references towns(id) on delete set null,
  members_only boolean not null default true,
  active      boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);
alter table offers enable row level security;
drop policy if exists offers_read on offers;
create policy offers_read on offers for select using (active or is_admin());
drop policy if exists offers_admin on offers;
create policy offers_admin on offers for all using (is_admin()) with check (is_admin());
