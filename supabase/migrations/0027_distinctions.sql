-- 0027 · Michelin-style distinctions.
-- The guide now awards Selected (0), One Wheel (1), Two Wheels (2) or Three Wheels (3), each
-- either provisional (desk research) or inspected (ridden in person, unannounced). Rider reviews
-- no longer move a town; they are shown separately as "Riders say".
alter table towns add column if not exists distinction smallint check (distinction between 0 and 3);
alter table towns add column if not exists distinction_status text not null default 'provisional'
  check (distinction_status in ('provisional', 'inspected'));
alter table towns add column if not exists inspected_at date;

-- Seed provisional distinctions from the existing research score. Nothing is "inspected" yet,
-- and three wheels are never given provisionally.
update towns set distinction = case
    when editorial_score >= 4.9 then 2
    when editorial_score >= 4.7 then 1
    else 0 end
  where status = 'full' and distinction is null;

select id, name, editorial_score, distinction, distinction_status from towns where status = 'full' order by distinction desc, name;
