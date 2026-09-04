-- Double opt-in for the newsletter.
-- A subscriber is only on the list once they have clicked a link in an email sent to that
-- address — which proves the address belongs to them, and means nobody can be signed up by
-- someone else. Unconfirmed rows are held briefly and then cleared.

alter table subscribers add column if not exists confirm_token uuid not null default gen_random_uuid();
alter table subscribers add column if not exists confirmed_at  timestamptz;
alter table subscribers add column if not exists confirm_sent_at timestamptz;

create index if not exists subscribers_confirm on subscribers(confirm_token);

-- Only confirmed, still-subscribed addresses are ever part of the list.
create or replace function newsletter_audience()
returns table (email text, name text, source text, consented_at timestamptz)
language sql security definer set search_path = public, auth as $$
  select u.email::text, p.display_name, 'rider profile'::text, p.marketing_opt_in_at
  from profiles p join auth.users u on u.id = p.id
  where p.marketing_opt_in and is_admin()
  union
  select s.email, null::text, coalesce(s.source, 'newsletter form'), s.confirmed_at
  from subscribers s
  where s.confirmed and s.unsubscribed_at is null and is_admin()
$$;
revoke all on function newsletter_audience() from public, anon;
grant execute on function newsletter_audience() to authenticated;

/** Housekeeping: an address that never confirmed is not a subscriber, and keeping it
    forever is holding someone's email for no reason. Run occasionally, or from a schedule. */
create or replace function purge_unconfirmed_subscribers(older_than interval default '30 days')
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if not is_admin() then raise exception 'admin only'; end if;
  delete from subscribers where not confirmed and created_at < now() - older_than;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function purge_unconfirmed_subscribers(interval) from public, anon;
grant execute on function purge_unconfirmed_subscribers(interval) to authenticated;
