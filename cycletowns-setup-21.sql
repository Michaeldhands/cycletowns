-- Launch-town photos, and one duplicate on the leaderboard.
--
-- 1. Photos. Every launch town has a researched, credited Wikimedia photo in the bundled data,
--    but some database rows never got theirs. The site read the database first, found nothing,
--    and fell back to the same stock rider for every one of them — four of the top eight town
--    cards wore one picture. The code now falls back to the bundled photo too; this puts the
--    photo where it belongs so the admin shows it. Only fills blanks: nothing you've uploaded
--    in the admin is touched.
--
-- 2. Chiang Mai was both a full guide (#13) and an "on the radar" preview. Any preview town
--    whose name matches a full guide is hidden. The code filters these out as well.

update towns t set photo = v.photo
from (values
  ('bright', 'Tower Hill Lookout overlooking Bright Victoria Australia in Autumn.png'),
  ('adelaide-hills', 'Stirling main street 2006.jpg'),
  ('beechworth', 'Beechworth Main Street.jpg'),
  ('noosa', 'Noosa Heads and Weyba Creek.JPG'),
  ('derby', 'Main Street, Derby, Tasmania.jpg'),
  ('girona', 'Onyar River Houses.JPG'),
  ('mallorca', 'The top of the descent to Sa Calobra, Mallorca.JPG'),
  ('bentonville', 'Downtown Bentonville, AR.jpg'),
  ('hualien', 'Taiwan 2009 HuaLien Taroko Gorge Narrow Gap and Road PB140025.jpg'),
  ('dalat', 'Da Lat - Xuan Huong Lake.jpg'),
  ('hagiang', 'Mountain road at Mã Pí Lèng Pass, Hà Giang Province, Vietnam.jpg'),
  ('onomichi', 'Shimanami Kaido Bikeway View from Imabari Wikivoyage banner.jpg'),
  ('chiangmai', '201703291201a P Chiang Mai, City Wall and Moat.jpg'),
  ('pokhara', 'Phewa Lake and Annapurna Range, Pokhara.jpg'),
  ('ubud', '1 Tegalalang rice terrace ubud bali.jpg'),
  ('jeju', 'Jeju - Seongsan Ilchulbong 1.JPG'),
  ('sunmoonlake', 'Sun Moon Lake overview (Taiwan 2018) (38825748754).jpg'),
  ('medellin', 'Medellín skyline02.jpg')
) as v(id, photo)
where t.id = v.id and (t.photo is null or t.photo = '');

update towns r set status = 'hidden'
where r.status = 'radar'
  and exists (select 1 from towns f where f.status = 'full' and lower(f.name) = lower(r.name) and f.id <> r.id);

-- What changed:
select id, name, status, left(coalesce(photo, '(none)'), 60) as photo from towns where status in ('full') order by editorial_score desc;
