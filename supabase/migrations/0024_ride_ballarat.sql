-- Ride Ballarat — charity ride for the Fiona Elsey Cancer Research Institute.
-- Checked against rideballarat.com (home, Long Mac and Short Mac pages) on 29 September 2026.

insert into events (slug, name, organiser, url, country, region, town_id, next_date, "window", km, vert, discipline, month, note, verified, img)
values ('ride-ballarat', 'Ride Ballarat', 'Ride Ballarat, for the Fiona Elsey Cancer Research Institute', 'https://rideballarat.com/', 'Australia', 'Ballarat, Victoria', null, '2026-11-15', 'Mid-November, annually', '{103,55}'::integer[], 1333, 'road', 'November', 'A fully supported charity ride, not a race, from Mars Stadium in Ballarat through rolling farmland towards Daylesford, raising money for cancer research at the Fiona Elsey Cancer Research Institute. The Long Mac (103 km, 1,333 m) and Short Mac (55 km) both include short sections of unsealed road, under a tenth of each course. It is the new form of the Ballarat Cycle Classic, and the weekend opens with a cocktail party on the Saturday night.', '2026-09-29', 'Mars Stadium Aerial.jpg')
on conflict (slug) do nothing;
