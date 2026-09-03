-- Rider-built loops from the route planner
create table if not exists loops (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  user_id     uuid references profiles(id) on delete cascade,
  town_id     text not null references towns(id) on delete cascade,
  name        text not null default '',
  start_name  text,
  discipline  text,
  distance_m  integer not null default 0,
  ascent_m    integer not null default 0,
  geometry    jsonb not null,              -- [[lng,lat,ele], …] as returned by the router
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists loops_user on loops(user_id, created_at desc);
create index if not exists loops_town on loops(town_id, created_at desc);

alter table loops enable row level security;
drop policy if exists loops_read on loops;
create policy loops_read on loops for select using (is_public or auth.uid() = user_id or is_admin());
drop policy if exists loops_insert on loops;
create policy loops_insert on loops for insert with check (auth.uid() = user_id);
drop policy if exists loops_update on loops;
create policy loops_update on loops for update using (auth.uid() = user_id or is_admin());
drop policy if exists loops_delete on loops;
create policy loops_delete on loops for delete using (auth.uid() = user_id or is_admin());
