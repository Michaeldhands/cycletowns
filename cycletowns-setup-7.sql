-- Marketing consent, recorded properly.
-- The Spam Act 2003 requires consent before commercial email, and the practical test is
-- being able to show WHEN someone consented and what they were told. So we store the
-- choice, the moment it changed, and the wording they agreed to.

alter table profiles add column if not exists marketing_opt_in     boolean not null default false;
alter table profiles add column if not exists marketing_opt_in_at  timestamptz;
alter table profiles add column if not exists marketing_consent_text text;

-- Stamp the time whenever the choice actually changes, in the database rather than the
-- browser, so the record can't be back-dated by a client.
create or replace function stamp_marketing_consent() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    new.marketing_opt_in_at := now();
    if not new.marketing_opt_in then
      new.marketing_consent_text := null;   -- withdrawn: keep no stale wording
    end if;
  end if;
  return new;
end $$;

-- Name matters: Postgres fires BEFORE triggers alphabetically, and this must run after
-- profiles_protect so the timestamp it sets is the one that survives.
drop trigger if exists trg_stamp_marketing_consent on profiles;
create trigger trg_stamp_marketing_consent before update on profiles
  for each row execute function stamp_marketing_consent();

comment on column profiles.marketing_opt_in is
  'Consent to marketing email. Off by default; only the rider can change it. Never inferred from signing up.';

-- The only supported way to build a marketing list: admins only, opted-in riders only.
-- Exporting the whole profiles table by hand is how a business ends up emailing people
-- who never agreed, so make the correct path the easy one.
create or replace function marketing_audience()
returns table (email text, display_name text, consented_at timestamptz)
language sql security definer set search_path = public, auth as $$
  select u.email::text, p.display_name, p.marketing_opt_in_at
  from profiles p
  join auth.users u on u.id = p.id
  where p.marketing_opt_in
    and is_admin()
  order by p.marketing_opt_in_at desc
$$;
revoke all on function marketing_audience() from public, anon;
grant execute on function marketing_audience() to authenticated;

-- The rider owns this field, so protect_profile_fields() must NOT reset it. Restated here
-- in full so the two migrations can be applied in either order without losing a rule.
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
    new.marketing_opt_in_at := old.marketing_opt_in_at;  -- the timestamp is ours to set, not theirs
  end if;
  return new;
end $$;
