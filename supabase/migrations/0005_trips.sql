-- Saved trip plans (the "Plan my trip" builder)
create table if not exists trips (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  user_id     uuid references profiles(id) on delete cascade,
  town_id     text not null references towns(id) on delete cascade,
  title       text not null default '',
  start_date  date,
  days        integer not null default 4,
  ability     text,
  discipline  text,
  bring_bike  boolean not null default true,
  plan        jsonb not null,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists trips_user on trips(user_id, created_at desc);

alter table trips enable row level security;
drop policy if exists trips_read on trips;
create policy trips_read on trips for select using (is_public or auth.uid() = user_id or is_admin());
drop policy if exists trips_insert on trips;
create policy trips_insert on trips for insert with check (auth.uid() = user_id);
drop policy if exists trips_update on trips;
create policy trips_update on trips for update using (auth.uid() = user_id or is_admin());
drop policy if exists trips_delete on trips;
create policy trips_delete on trips for delete using (auth.uid() = user_id or is_admin());
