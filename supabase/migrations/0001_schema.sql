-- Cycletowns — phase 2 schema
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to re-run: everything is IF NOT EXISTS / OR REPLACE.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- towns & content
create table if not exists towns (
  id          text primary key,              -- slug, e.g. 'bright'
  name        text not null,
  region      text not null,
  country     text not null,
  flag        text not null default '',
  currency    text not null default '$',
  status      text not null default 'full' check (status in ('full','radar','hidden')),
  editorial_score numeric(3,1),              -- launch score until reviews take over
  editorial_dims  jsonb,                     -- {cafes,routes,safety,climbs,storage}
  photo       text,                          -- Wikimedia file name or storage URL
  gallery     text[] not null default '{}',
  tags        text[] not null default '{}',
  personas    text[] not null default '{}',
  blurb       text not null default '',
  lat         double precision,
  lng         double precision,
  when_info   jsonb,                         -- ride/crowd months, best/peak/quiet, climate…
  see_do      jsonb,                         -- [[emoji,name,note],…]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists places (
  id          uuid primary key default gen_random_uuid(),
  town_id     text not null references towns(id) on delete cascade,
  kind        text not null check (kind in ('cafe','shop','route','stay','thing')),
  name        text not null,
  note        text not null default '',
  editorial_rating numeric(2,1),
  hire        boolean not null default false,
  price       numeric,
  discipline  text,                          -- routes: road/gravel/mtb/climbs
  km          numeric,
  vert        integer,
  lat         double precision,
  lng         double precision,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists places_town_kind on places(town_id, kind, sort);

create table if not exists races (
  id          uuid primary key default gen_random_uuid(),
  town_id     text not null references towns(id) on delete cascade,
  kind        text not null check (kind in ('pro','fondo','mtb')),
  badge       text not null default '🏁',
  name        text not null,
  series      text,
  km          numeric,
  vert        integer,
  race_date   date,
  status      text,
  discipline  text,
  note        text,
  sort        integer not null default 0
);

create table if not exists articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  dek         text not null default '',
  body        text not null default '',     -- HTML
  kind        text,                          -- Series / Feature
  series      text,
  episode     integer,
  town_id     text references towns(id) on delete set null,
  image_kind  text not null default 'road',
  image_url   text,
  published   boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- riders
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      text unique,
  display_name text,
  avatar_url  text,
  home_town   text,
  country     text,
  rider_type  text,                          -- Road / Gravel / …
  ability     text,
  bio         text,
  points      integer not null default 0,
  tier        text not null default 'rider' check (tier in ('rider','insider','champion')),
  is_admin    boolean not null default false,
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- create a profile row automatically when a user signs up
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create table if not exists saved_towns (
  user_id     uuid not null references profiles(id) on delete cascade,
  town_id     text not null,                 -- may be a radar slug without a towns row
  created_at  timestamptz not null default now(),
  primary key (user_id, town_id)
);

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  town_id     text not null references towns(id) on delete cascade,
  cafes       smallint not null check (cafes between 1 and 5),
  routes      smallint not null check (routes between 1 and 5),
  safety      smallint not null check (safety between 1 and 5),
  climbs      smallint not null check (climbs between 1 and 5),
  storage     smallint not null check (storage between 1 and 5),
  body        text not null default '',
  ride_type   text,
  visited_on  date,
  status      text not null default 'published' check (status in ('published','hidden')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, town_id)
);
create index if not exists reviews_town on reviews(town_id, status);

-- per-town score: average of the five dimensions across published reviews, recency-weighted
create or replace view town_scores as
select
  r.town_id,
  count(*)::int as review_count,
  round(avg((r.cafes+r.routes+r.safety+r.climbs+r.storage)/5.0)::numeric, 1) as score,
  round(avg(r.cafes)::numeric,1)  as cafes,
  round(avg(r.routes)::numeric,1) as routes,
  round(avg(r.safety)::numeric,1) as safety,
  round(avg(r.climbs)::numeric,1) as climbs,
  round(avg(r.storage)::numeric,1) as storage
from reviews r
where r.status = 'published'
group by r.town_id;

-- ---------------------------------------------------------------- community
create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  town_id     text not null references towns(id) on delete cascade,
  name        text not null,
  description text not null default '',
  privacy     text not null default 'public' check (privacy in ('public','private')),
  ride_day    text,
  ride_time   text,
  discipline  text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create table if not exists group_members (
  group_id    uuid not null references groups(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        text not null default 'member' check (role in ('member','admin','pending')),
  created_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);
create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  town_id     text references towns(id) on delete cascade,
  group_id    uuid references groups(id) on delete cascade,
  body        text not null,
  image_url   text,
  status      text not null default 'published' check (status in ('published','hidden')),
  created_at  timestamptz not null default now()
);
create index if not exists posts_town on posts(town_id, created_at desc);
create index if not exists posts_group on posts(group_id, created_at desc);

create table if not exists point_events (
  id          bigserial primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  kind        text not null,                 -- review / post / place / referral …
  points      integer not null,
  ref_id      text,
  created_at  timestamptz not null default now()
);

-- award points and keep profiles.points in sync
create or replace function award_points(p_user uuid, p_kind text, p_points int, p_ref text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('ct.award', '1', true);   -- lets the profile-protection trigger through
  insert into point_events(user_id, kind, points, ref_id) values (p_user, p_kind, p_points, p_ref);
  update profiles set points = points + p_points,
    tier = case when points + p_points >= 1000 then 'champion' when points + p_points >= 250 then 'insider' else tier end
  where id = p_user;
  perform set_config('ct.award', '', true);
end $$;

create or replace function on_review_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform award_points(new.user_id, 'review', 50, new.id::text);
  return new;
end $$;
drop trigger if exists reviews_award on reviews;
create trigger reviews_award after insert on reviews for each row execute function on_review_insert();

create or replace function on_post_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform award_points(new.user_id, 'post', 10, new.id::text);
  return new;
end $$;
drop trigger if exists posts_award on posts;
create trigger posts_award after insert on posts for each row execute function on_post_insert();

-- ---------------------------------------------------------------- partners & waitlists
create table if not exists partners (
  id          uuid primary key default gen_random_uuid(),
  business    text not null,
  type        text not null,
  town_id     text references towns(id) on delete set null,
  contact_name text,
  email       text,
  plan        text not null default 'claim' check (plan in ('claim','member','featured','custom')),
  status      text not null default 'enquiry' check (status in ('enquiry','active','paused')),
  owner_id    uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- row level security
alter table towns          enable row level security;
alter table places         enable row level security;
alter table races          enable row level security;
alter table articles       enable row level security;
alter table profiles       enable row level security;
alter table saved_towns    enable row level security;
alter table reviews        enable row level security;
alter table groups         enable row level security;
alter table group_members  enable row level security;
alter table posts          enable row level security;
alter table point_events   enable row level security;
alter table partners       enable row level security;

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

-- public content: anyone can read; only admins write
do $$ begin
  perform 1;
  drop policy if exists towns_read on towns;      create policy towns_read on towns for select using (status <> 'hidden' or is_admin());
  drop policy if exists towns_admin on towns;     create policy towns_admin on towns for all using (is_admin()) with check (is_admin());
  drop policy if exists places_read on places;    create policy places_read on places for select using (true);
  drop policy if exists places_admin on places;   create policy places_admin on places for all using (is_admin()) with check (is_admin());
  drop policy if exists races_read on races;      create policy races_read on races for select using (true);
  drop policy if exists races_admin on races;     create policy races_admin on races for all using (is_admin()) with check (is_admin());
  drop policy if exists articles_read on articles; create policy articles_read on articles for select using (published or is_admin());
  drop policy if exists articles_admin on articles; create policy articles_admin on articles for all using (is_admin()) with check (is_admin());

  -- profiles: readable by all (public rider profiles), editable by the owner
  drop policy if exists profiles_read on profiles;   create policy profiles_read on profiles for select using (true);
  drop policy if exists profiles_update on profiles; create policy profiles_update on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  drop policy if exists profiles_admin on profiles;  create policy profiles_admin on profiles for update using (is_admin());

  drop policy if exists saved_own on saved_towns;    create policy saved_own on saved_towns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

  drop policy if exists reviews_read on reviews;     create policy reviews_read on reviews for select using (status = 'published' or auth.uid() = user_id or is_admin());
  drop policy if exists reviews_insert on reviews;   create policy reviews_insert on reviews for insert with check (auth.uid() = user_id);
  drop policy if exists reviews_update on reviews;   create policy reviews_update on reviews for update using (auth.uid() = user_id or is_admin());
  drop policy if exists reviews_delete on reviews;   create policy reviews_delete on reviews for delete using (auth.uid() = user_id or is_admin());

  drop policy if exists groups_read on groups;       create policy groups_read on groups for select using (true);
  drop policy if exists groups_insert on groups;     create policy groups_insert on groups for insert with check (auth.uid() = created_by);
  drop policy if exists groups_update on groups;     create policy groups_update on groups for update using (auth.uid() = created_by or is_admin());
  drop policy if exists gm_read on group_members;    create policy gm_read on group_members for select using (true);
  drop policy if exists gm_own on group_members;     create policy gm_own on group_members for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id or is_admin());

  drop policy if exists posts_read on posts;         create policy posts_read on posts for select using (status = 'published' or auth.uid() = user_id or is_admin());
  drop policy if exists posts_insert on posts;       create policy posts_insert on posts for insert with check (auth.uid() = user_id);
  drop policy if exists posts_own on posts;          create policy posts_own on posts for update using (auth.uid() = user_id or is_admin());
  drop policy if exists posts_del on posts;          create policy posts_del on posts for delete using (auth.uid() = user_id or is_admin());

  drop policy if exists points_read on point_events; create policy points_read on point_events for select using (auth.uid() = user_id or is_admin());

  drop policy if exists partners_admin on partners;  create policy partners_admin on partners for all using (is_admin()) with check (is_admin());
  drop policy if exists partners_owner on partners;  create policy partners_owner on partners for select using (auth.uid() = owner_id);
end $$;

-- nobody can promote themselves: only admins may change is_admin / points / tier
create or replace function protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() and coalesce(current_setting('ct.award', true), '') <> '1' then
    new.is_admin := old.is_admin;
    new.points   := old.points;
    new.tier     := old.tier;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect on profiles;
create trigger profiles_protect before update on profiles for each row execute function protect_profile_fields();

grant select on town_scores to anon, authenticated;
