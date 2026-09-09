-- The five 'Cycletowns Originals' were seeded into the articles table at setup, under
-- invented correspondents — Mara Velasco, Tom Hapgood, Sofía Duarte, Kenji Mori — describing
-- reporting that never happened, alongside "our launch film", which does not exist, and two
-- episodes dated "Coming Friday" that rendered as published.
--
-- Rewriting src/data/originals.json was not enough: loadArticles() reads this table first and
-- only falls back to the bundled file when it is empty, so the fabricated rows are what the
-- site has been serving. This replaces them with the honest versions — town and route guides,
-- no bylines, no claimed trips — and drops the series/episode framing for a series that was
-- never filmed.
--
-- Old rows are removed by slug rather than truncating the table, so anything written in the
-- admin since launch is untouched.

delete from articles where slug in (
  'town-in-focus-girona-the-town-that-adopted-the-pro-peloton',
  'town-in-focus-bright-inside-australias-alpine-cycling-heart',
  'town-in-focus-medellin-climbing-at-altitude-with-the-locals',
  'why-gravel-travel-is-the-fastest-growing-way-to-see-the-world',
  'seven-bridges-at-first-light-the-shimanami-kaido-in-photographs'
);

insert into articles (slug,title,dek,body,kind,series,episode,town_id,image_kind,published,published_at)
values ('girona-the-town-that-adopted-the-pro-peloton','Girona: the town that adopted the pro peloton','Why a medieval Catalan city became the unofficial base of professional cycling — and what that means for anyone else riding there.','<p>Girona didn’t set out to become a cycling town. Professionals moved there for reasons that are easy to list and hard to replicate: quiet roads that empty within minutes of the old town, a climate that allows riding almost year-round, an airport an hour away in Barcelona, and a compact centre where everything a rider needs is walkable.</p><p>What followed was self-reinforcing. Riders drew mechanics, mechanics drew bike shops, and the cafés adapted to a clientele that arrives in lycra at nine in the morning. The Rocacorba climb became a benchmark by being the nearest hard thing to ride.</p><p>For a visiting rider, the practical version is this: you do not need a car, the road surfaces are good, gravel starts where the tarmac ends, and you will not be the only person in cycling kit. Our Girona guide has the routes, cafés and shops.</p>','Town guide',null,null,'girona','girona',true,now())
on conflict (slug) do update set
  title = excluded.title, dek = excluded.dek, body = excluded.body, kind = excluded.kind,
  series = null, episode = null, town_id = excluded.town_id, image_kind = excluded.image_kind;

insert into articles (slug,title,dek,body,kind,series,episode,town_id,image_kind,published,published_at)
values ('bright-inside-australia-s-alpine-cycling-heart','Bright: inside Australia’s alpine cycling heart','Three of the country’s great climbs on the doorstep, a rail trail through the valley, and a main street built around bikes.','<p>Bright punches well above its size. Mount Buffalo, Mount Hotham and Falls Creek are all rideable from the town, which is why the Victorian High Country draws riders through the warmer half of the year and why Peaks Challenge starts up the road at Falls Creek.</p><p>It is not only a climber’s town. The Murray to Mountains Rail Trail runs flat and sealed through the valley to Wandiligong and Myrtleford, which makes Bright unusually workable for mixed-ability groups and families — the rare place where one rider can go up Buffalo while another rides to a bakery.</p><p>The main street does the rest: cafés that open early, bike shops that hire and repair, and enough beds to absorb a busy weekend. Our Bright guide has the detail.</p>','Town guide',null,null,'bright','bright',true,now())
on conflict (slug) do update set
  title = excluded.title, dek = excluded.dek, body = excluded.body, kind = excluded.kind,
  series = null, episode = null, town_id = excluded.town_id, image_kind = excluded.image_kind;

insert into articles (slug,title,dek,body,kind,series,episode,town_id,image_kind,published,published_at)
values ('medellin-climbing-at-altitude-with-the-locals','Medellín: climbing at altitude with the locals','The city that keeps producing Grand Tour riders, and what it’s like to ride there as a visitor.','<p>Medellín sits in a valley at around 1,500 metres, which means every ride out of the city is a climb and every rider who lives there is training at altitude without trying. Las Palmas, Alto de Boquerón and Santa Elena all rise straight out of town.</p><p>Colombia’s record in Grand Tours is not an accident of talent alone — it is what happens when climbing is simply the shape of the terrain. Sunday mornings bring closed roads for the ciclovía and a volume of riders that visitors from quieter countries find startling.</p><p>Riding here as a visitor takes some planning: traffic on the valley floor is heavy, the climbs are long, and the weather turns in the afternoon. Our Medellín guide covers the routes worth the trip.</p>','Town guide',null,null,'medellin','medellin',true,now())
on conflict (slug) do update set
  title = excluded.title, dek = excluded.dek, body = excluded.body, kind = excluded.kind,
  series = null, episode = null, town_id = excluded.town_id, image_kind = excluded.image_kind;

insert into articles (slug,title,dek,body,kind,series,episode,town_id,image_kind,published,published_at)
values ('why-gravel-travel-is-the-fastest-growing-way-to-see-the-world','Why gravel travel is the fastest-growing way to see the world','The boom reshaping where — and how — people ride, and what it means for the towns at the end of the road.','<p>Gravel has moved from niche to a defining part of modern cycling, and it is changing travel with it. Riders who once planned trips around famous climbs are increasingly planning them around unsealed backcountry: quieter, cheaper, and far more likely to pass through small towns than a coastal tourist road.</p><p>That shift matters to the places on the receiving end. A gravel rider stops more often, stays longer and spends in towns that never appeared on a cycling itinerary. Several of the towns we rank are on this list precisely because of it — Beechworth, the Adelaide Hills, Bentonville.</p><p>The catch is that gravel is harder to plan than road. Surfaces vary wildly, resupply is sparse, and local knowledge matters more. It is the part of cycle tourism most in need of good information, which is a reasonable summary of why this site exists.</p>','Feature',null,null,null,'gravel',true,now())
on conflict (slug) do update set
  title = excluded.title, dek = excluded.dek, body = excluded.body, kind = excluded.kind,
  series = null, episode = null, town_id = excluded.town_id, image_kind = excluded.image_kind;

insert into articles (slug,title,dek,body,kind,series,episode,town_id,image_kind,published,published_at)
values ('seven-bridges-at-first-light-riding-the-shimanami-kaido','Seven bridges at first light: riding the Shimanami Kaido','Japan’s island-hopping cycleway, and what to know before you ride it.','<p>The Shimanami Kaido runs about 70 kilometres from Onomichi on Honshu to Imabari on Shikoku, crossing six islands on seven bridges built with dedicated cycle lanes. It is one of very few long-distance routes anywhere designed for bikes rather than adapted for them.</p><p>The riding is gentle — the bridge approaches spiral up at a steady gradient, and the island roads between them are flat and quiet. It is comfortably a day for a fit rider and a very good two days for anyone else, with the island of Ōmishima the usual overnight stop.</p><p>Practicalities that catch people out: bikes can be hired at one end and returned at the other, the bridge tolls for cyclists are small but real, and the route is well signposted with a blue line on the road surface. Ride it early and you will have the bridges to yourself.</p>','Route guide',null,null,null,'shimanami',true,now())
on conflict (slug) do update set
  title = excluded.title, dek = excluded.dek, body = excluded.body, kind = excluded.kind,
  series = null, episode = null, town_id = excluded.town_id, image_kind = excluded.image_kind;
