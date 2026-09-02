-- Partner listings: claim, plans, verification
alter table partners add column if not exists place_id uuid references places(id) on delete set null;
alter table partners add column if not exists description text not null default '';
alter table partners add column if not exists website text;
alter table partners add column if not exists phone text;
alter table partners add column if not exists logo_url text;
alter table partners add column if not exists stripe_subscription_id text;
alter table partners add column if not exists stripe_customer_id text;
alter table partners add column if not exists plan_until timestamptz;
alter table partners add column if not exists updated_at timestamptz not null default now();

-- anyone can send an enquiry; owners can read/update their own listing (but not plan/status)
drop policy if exists partners_enquire on partners;
create policy partners_enquire on partners for insert with check (status = 'enquiry' and plan = 'claim' and (owner_id is null or owner_id = auth.uid()));
drop policy if exists partners_owner_update on partners;
create policy partners_owner_update on partners for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create or replace function protect_partner_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_admin() then
    new.plan := old.plan; new.status := old.status; new.plan_until := old.plan_until;
    new.stripe_subscription_id := old.stripe_subscription_id; new.stripe_customer_id := old.stripe_customer_id;
    new.owner_id := old.owner_id;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists partners_protect on partners;
create trigger partners_protect before update on partners for each row execute function protect_partner_fields();

-- verified badge on place cards: a place is verified when an active partner owns it
create or replace view verified_places as
  select distinct place_id from partners where status = 'active' and place_id is not null;
grant select on verified_places to anon, authenticated;
