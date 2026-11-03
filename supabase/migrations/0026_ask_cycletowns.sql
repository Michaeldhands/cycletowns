-- Ask Cycletowns — the ride concierge. Victoria first.
--
-- Three small tables:
--   rider_memories  things a signed-in rider has told the concierge and asked it to keep
--                   ("I ride gravel", "home is Geelong"). Theirs to read and delete.
--   ask_usage       a daily message counter per rider (or per anonymous visitor hash), so one
--                   person can't run up the bill. No message content is stored.
--   ask_signals     anonymous demand: which town, discipline and month riders ask about. No
--                   user id, no text. This is what a region's dashboard is eventually built on.
--
-- Conversations themselves are not stored. They go to the model to be answered and are gone.

create table if not exists rider_memories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  fact        text not null check (char_length(fact) between 3 and 280),
  kind        text not null default 'preference'
                check (kind in ('riding', 'preference', 'home', 'travel', 'goal', 'other')),
  created_at  timestamptz not null default now()
);
create index if not exists rider_memories_user on rider_memories(user_id, created_at desc);

alter table rider_memories enable row level security;
drop policy if exists rm_read on rider_memories;
create policy rm_read on rider_memories for select using (auth.uid() = user_id);
drop policy if exists rm_insert on rider_memories;
create policy rm_insert on rider_memories for insert with check (auth.uid() = user_id);
drop policy if exists rm_delete on rider_memories;
create policy rm_delete on rider_memories for delete using (auth.uid() = user_id);
-- No update policy: a memory is replaced, not edited, so the rider always sees what was said.

-- Daily counter. Written only through ask_bump(), which is atomic and enforces the cap.
create table if not exists ask_usage (
  bucket  text not null,
  day     date not null default (now() at time zone 'Australia/Melbourne')::date,
  n       integer not null default 0,
  primary key (bucket, day)
);
alter table ask_usage enable row level security;   -- no policies: nobody reads it directly

/** Adds one to a bucket's count for today and says whether it is still within the cap. */
create or replace function ask_bump(p_bucket text, p_cap integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v integer;
begin
  insert into ask_usage(bucket, day, n) values (p_bucket, (now() at time zone 'Australia/Melbourne')::date, 1)
  on conflict (bucket, day) do update set n = ask_usage.n + 1
  returning n into v;
  return v <= p_cap;
end;
$$;
revoke all on function ask_bump(text, integer) from public;
grant execute on function ask_bump(text, integer) to anon, authenticated;

-- Anonymous demand signals.
create table if not exists ask_signals (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  tool        text not null,
  town_id     text,
  place       text,
  discipline  text,
  month       text
);
create index if not exists ask_signals_time on ask_signals(created_at desc);
alter table ask_signals enable row level security;
drop policy if exists as_insert on ask_signals;
create policy as_insert on ask_signals for insert with check (true);
drop policy if exists as_read on ask_signals;
create policy as_read on ask_signals for select using (is_admin());

select 'ask tables ready' as status;
