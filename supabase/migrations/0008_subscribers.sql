-- Newsletter subscribers.
-- Separate from profiles on purpose: someone can follow the newsletter without holding a
-- rider account, and a rider's newsletter choice lives on their profile. Both record what
-- was consented to and when, because the Spam Act 2003 asks you to be able to show it.

create table if not exists subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  source        text,                        -- which page the sign-up came from
  consent_text  text not null,               -- the exact wording shown at the time
  confirmed     boolean not null default false,
  unsub_token   uuid not null default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create index if not exists subscribers_active on subscribers(created_at desc) where unsubscribed_at is null;

alter table subscribers enable row level security;

-- Nobody reads this table from the browser — not even the person who signed up, since the
-- email address is the only key and knowing an address shouldn't reveal a subscription.
drop policy if exists subscribers_admin_read on subscribers;
create policy subscribers_admin_read on subscribers for select using (is_admin());
drop policy if exists subscribers_admin_write on subscribers;
create policy subscribers_admin_write on subscribers for update using (is_admin());

-- Signing up and unsubscribing both go through the server, which uses the service-role key.
-- No public insert policy: that stops the table being used as an open write endpoint.

/** Everyone who has asked for the newsletter — riders who ticked the box on their profile,
    plus standalone subscribers — deduplicated. Admins only. This is the list to sync to the
    email tool; never export the raw tables. */
create or replace function newsletter_audience()
returns table (email text, name text, source text, consented_at timestamptz)
language sql security definer set search_path = public, auth as $$
  select u.email::text, p.display_name, 'rider profile'::text, p.marketing_opt_in_at
  from profiles p join auth.users u on u.id = p.id
  where p.marketing_opt_in and is_admin()
  union
  select s.email, null::text, coalesce(s.source, 'newsletter form'), s.created_at
  from subscribers s
  where s.unsubscribed_at is null and is_admin()
$$;
revoke all on function newsletter_audience() from public, anon;
grant execute on function newsletter_audience() to authenticated;
