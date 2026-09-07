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
