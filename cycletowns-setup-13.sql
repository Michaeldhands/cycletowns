-- Site banner images, so the hero photography can be changed from the admin rather than in code.
-- Each row is one named slot. A slot with no row falls back to the stock photo the page ships with.

create table if not exists banners (
  slot       text primary key,
  img        text,                 -- uploaded URL, or a Wikimedia Commons file name
  alt        text,                 -- what the photo shows, for screen readers
  credit     text,                 -- photographer / source, shown on /image-credits when set
  updated_at timestamptz not null default now()
);

alter table banners enable row level security;
drop policy if exists banners_read on banners;
create policy banners_read on banners for select using (true);
drop policy if exists banners_write on banners;
create policy banners_write on banners for all using (is_admin()) with check (is_admin());

drop trigger if exists banners_touch on banners;
create trigger banners_touch before update on banners for each row execute function touch_updated_at();
-- Two more verified events: Noosa (Sunshine Coast) and the Adelaide Hills.
insert into events (slug, name, organiser, url, country, region, town_id, next_date, "window", km, vert, discipline, month, note, verified)
values
  ('sunny-coast-century','Sunny Coast Century','Cycle Sunshine Coast','https://www.cyclesunshinecoast.com.au/events/sunny-coast-century','Australia','Sunshine Coast hinterland, Queensland','noosa',null,'Annually — next date not yet published','{97}'::integer[],null,'road',null,'A timed gran fondo from Eudlo in the Sunshine Coast hinterland, about 45 km south of Noosa, on a course laid out by former professional Henk Vogels that takes in the Montville and Postmans Track climbs. Open entry, with part of the fee going to its charity partner.','2026-09-07'),
  ('tour-down-under-group-rides','Santos Tour Down Under Group Rides','Santos Tour Down Under and AusCycling','https://tourdownunder.com.au/ride/group-rides','Australia','Adelaide and the Adelaide Hills','adelaide-hills',null,'Tour week, 16–24 January 2027','{}'::integer[],null,'road','January','The public riding programme that runs alongside the professional Tour Down Under — guided social rides out of the Tour Village in Victoria Square, a carpark climb and a family ride, on the Adelaide Hills roads the race uses. Successor to the old Bupa Challenge Tour. Routes and distances for 2027 have not been published yet.','2026-09-07')
on conflict (slug) do nothing;
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
