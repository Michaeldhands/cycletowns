-- Partner enquiries, stored here rather than only in the form provider — so they can be pushed
-- to a CRM, answered from the admin, and counted. Contact details for real businesses: admins only.

create table if not exists enquiries (
  id          uuid primary key default gen_random_uuid(),
  business    text not null,
  contact     text not null,
  email       text not null,
  type        text,
  town_id     text references towns(id) on delete set null,
  message     text,
  source      text,                                  -- which page it came from
  status      text not null default 'new' check (status in ('new','contacted','won','lost')),
  crm_synced  boolean not null default false,        -- whether it reached the CRM
  crm_error   text,                                  -- why it didn't, if it didn't
  note        text,                                  -- your own notes on the lead
  created_at  timestamptz not null default now()
);
create index if not exists enquiries_new on enquiries(created_at desc);

alter table enquiries enable row level security;
-- No public read and no public insert: submissions come through the server, which uses the
-- service-role key. That keeps this from becoming an open write endpoint.
drop policy if exists enquiries_admin on enquiries;
create policy enquiries_admin on enquiries for all using (is_admin()) with check (is_admin());
