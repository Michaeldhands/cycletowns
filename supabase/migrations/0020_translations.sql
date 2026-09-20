-- Translating content, without a schema change per language.
--
-- The site publishes English only today. This table exists so that adding a language later is
-- data entry rather than a migration against eight tables — and so nobody is ever tempted to
-- add blurb_de, blurb_fr, blurb_es columns, which is the mistake that makes the fifth
-- language cost as much as the first four.
--
-- One row per translated field: which table, which row, which column, which locale.
--
--   ('towns', 'bright', 'blurb', 'de', 'Bright liegt am Fuß …')
--
-- Reading is a single join or a lookup map built once per request. Nothing reads it yet.

create table if not exists translations (
  id          uuid primary key default gen_random_uuid(),
  table_name  text not null,
  row_id      text not null,
  column_name text not null,
  locale      text not null,
  value       text not null,
  -- How this translation came to exist. A machine translation that nobody has read is not the
  -- same thing as one a rider checked, and a site that publishes rankings it says are honest
  -- should not quietly blur that line.
  source      text not null default 'machine' check (source in ('machine', 'reviewed', 'human')),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  updated_at  timestamptz not null default now(),
  unique (table_name, row_id, column_name, locale)
);

create index if not exists translations_lookup on translations(locale, table_name, row_id);

comment on table translations is
  'Locale overrides for content columns. The English text stays in its own table and is the '
  'source of truth; a missing translation falls back to it rather than showing an empty page.';

alter table translations enable row level security;

-- Readable by anyone, because it is the page text. Written only by admins: a translation is
-- published content, and the whole point of the source column is that it can be trusted.
drop policy if exists translations_read on translations;
create policy translations_read on translations for select using (true);

drop policy if exists translations_admin on translations;
create policy translations_admin on translations for all using (is_admin()) with check (is_admin());

-- Which locales are published. Adding a row here is how a language goes live, so it can be
-- turned on and off without a deploy — and a half-translated locale can sit here disabled
-- while it is being filled in.
create table if not exists locales (
  code       text primary key,
  name       text not null,            -- in the language itself: "Deutsch", not "German"
  html_lang  text not null,            -- BCP-47 for <html lang> and hreflang
  published  boolean not null default false,
  sort       integer not null default 0
);

insert into locales (code, name, html_lang, published, sort)
values ('en', 'English', 'en-AU', true, 0)
on conflict (code) do nothing;

alter table locales enable row level security;
drop policy if exists locales_read on locales;
create policy locales_read on locales for select using (true);
drop policy if exists locales_admin on locales;
create policy locales_admin on locales for all using (is_admin()) with check (is_admin());
