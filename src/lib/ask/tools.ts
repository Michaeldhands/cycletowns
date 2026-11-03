import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { loadCatalog, type Catalog } from "@/lib/content";
import { loadEvents } from "@/lib/events-data";
import { daysAway, isUpcoming, sortEvents, whenLabel, type CtEvent } from "@/lib/events";
import { buildLoop } from "@/lib/ors";
import { defaultSpeed, estimateHours } from "@/lib/loops";
import { ABILITIES, buildPlan, type Ability } from "@/lib/planner";
import { rideDiscipline, type Place, type Town } from "@/lib/towns";
import type { Card, EventLite, PlaceLite, TownCardData } from "./cards";

/* The concierge's hands. Every fact the model can state comes back from one of these, out of the
   same records the rest of the site is built on. Scope is Victoria: that is where the guides are
   deepest and where the first paying regions are, and a concierge that is good in one state is
   worth more than one that is vague everywhere. */

export type ToolCtx = {
  signedIn: boolean;
  remember: (fact: string, kind: string) => Promise<boolean>;
  signal: (s: { tool: string; town_id?: string | null; place?: string | null; discipline?: string | null; month?: string | null }) => void;
};

export type ToolOutput = { result: unknown; card?: Card };

const isVic = (region: string | null | undefined, country: string | null | undefined) =>
  (country || "").toLowerCase() === "australia" && /victoria/i.test(region || "");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const lite = (p: Place): PlaceLite => ({ n: p.n, note: p.note, km: p.km, vert: p.vert, verified: p.verified || undefined });

/* ---------- tool definitions, as the model sees them ---------- */

const BASE_TOOLS: Anthropic.Tool[] = [
  {
    name: "find_towns",
    description:
      "List Victorian cycling towns Cycletowns covers: towns with a full researched guide, and towns on the radar (no guide yet). Use this before recommending where to ride.",
    input_schema: {
      type: "object",
      properties: {
        discipline: { type: "string", enum: ["any", "road", "climbs", "gravel", "mtb", "family"], description: "Kind of riding the rider wants." },
      },
    },
  },
  {
    name: "town_guide",
    description:
      "The full Cycletowns guide for one Victorian town: routes with distance and climbing, café stops, bike shops, when to go, things to do and events there. Use whenever you talk about a specific town's riding.",
    input_schema: {
      type: "object",
      properties: { town_id: { type: "string", description: "Town id from find_towns, e.g. 'bright'." } },
      required: ["town_id"],
    },
  },
  {
    name: "find_events",
    description:
      "Mass-participation cycling events in Victoria (gran fondos, gravel races, MTB events, charity rides), each checked against the organiser's site. Filter by discipline, month, or how soon.",
    input_schema: {
      type: "object",
      properties: {
        discipline: { type: "string", enum: ["any", "road", "gravel", "mtb", "mixed"] },
        month: { type: "string", description: "Month name, e.g. 'March'." },
        within_days: { type: "integer", description: "Only events with a published date in the next N days." },
      },
    },
  },
  {
    name: "build_loop",
    description:
      "Generate a round-trip ride on real roads from OpenStreetMap, starting from a Cycletowns town or any named place in Victoria. Returns distance, climbing and a time estimate. The route is generated, not ridden by us — say so.",
    input_schema: {
      type: "object",
      properties: {
        town_id: { type: "string", description: "Cycletowns town id to start from, if it has a guide." },
        place: { type: "string", description: "Any Victorian town or suburb to start from, e.g. 'Daylesford'. Use when there is no town_id." },
        km: { type: "number", description: "Target distance in km, 10–100." },
        discipline: { type: "string", enum: ["road", "gravel", "mtb", "ebike"] },
        speed_kmh: { type: "number", description: "The rider's average speed on the flat, if known." },
      },
      required: ["km", "discipline"],
    },
  },
  {
    name: "plan_trip",
    description:
      "Build a day-by-day riding trip in a Victorian town with a full guide, from its real routes and cafés, with rest days placed for the rider's ability.",
    input_schema: {
      type: "object",
      properties: {
        town_id: { type: "string" },
        days: { type: "integer", description: "1–14." },
        ability: { type: "string", enum: ABILITIES as unknown as string[] },
        discipline: { type: "string", enum: ["mixed", "road", "climbs", "gravel", "mtb"] },
        start_date: { type: "string", description: "YYYY-MM-DD, if the rider gave dates." },
        bring_bike: { type: "boolean", description: "False if they want to hire." },
      },
      required: ["town_id", "days", "ability", "discipline"],
    },
  },
];

const REMEMBER_TOOL: Anthropic.Tool = {
  name: "remember",
  description:
    "Save one durable fact the rider has told you about their own riding, so future conversations start from it: discipline, pace, home base, who they ride with, goals, bike, travel style. Only things they said, never your guesses. Never health, medical, financial or other sensitive details.",
  input_schema: {
    type: "object",
    properties: {
      fact: { type: "string", description: "Short, in the third person, e.g. 'Rides gravel, about 22 km/h on the flat'." },
      kind: { type: "string", enum: ["riding", "preference", "home", "travel", "goal", "other"] },
    },
    required: ["fact", "kind"],
  },
};

export const toolsFor = (signedIn: boolean): Anthropic.Tool[] => (signedIn ? [...BASE_TOOLS, REMEMBER_TOOL] : BASE_TOOLS);

/* ---------- execution ---------- */

let cached: { at: number; c: Catalog; events: CtEvent[] } | null = null;
async function data() {
  if (cached && Date.now() - cached.at < 5 * 60_000) return cached;
  const [c, events] = await Promise.all([loadCatalog(), loadEvents()]);
  cached = { at: Date.now(), c, events };
  return cached;
}

const vicTowns = (c: Catalog) => c.towns.filter((t) => isVic(t.region, t.country));

const townCard = (t: Town): TownCardData => ({ id: t.id, name: t.name, region: t.region, blurb: t.blurb, score: t.score, tags: t.tags.slice(0, 3), guide: true });

const disciplineMatches = (t: Town, d: string) => {
  if (!d || d === "any") return true;
  if (d === "family") return t.tags.some((x) => /family|rail trail/i.test(x)) || t.routes.some((r) => /family|flat|rail trail/i.test(r.note));
  return t.routes.some((r) => rideDiscipline(r) === d) || t.tags.some((x) => x.toLowerCase().includes(d === "climbs" ? "climb" : d));
};

const eventLite = (e: CtEvent): EventLite => ({ slug: e.slug, name: e.name, when: whenLabel(e), discipline: e.discipline, km: e.km, region: e.region, url: e.url });

/** Thin a route to at most `max` points so the card stays small; the shape survives. */
const thin = <T,>(a: T[], max = 240): T[] => (a.length <= max ? a : a.filter((_, i) => i % Math.ceil(a.length / max) === 0));

/** Find a Victorian place on OpenStreetMap. Used only to pick a start point for a loop. */
async function geocodeVic(place: string): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    const u = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=3&countrycodes=au&q=${encodeURIComponent(place + ", Victoria, Australia")}`;
    const res = await fetch(u, { headers: { "User-Agent": "Cycletowns/1.0 (hello@cycletowns.com)" }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat: string; lon: string; display_name: string; name?: string; address?: { state?: string } }[];
    const hit = rows.find((r) => /victoria/i.test(r.address?.state || ""));
    return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), name: hit.name || hit.display_name.split(",")[0] } : null;
  } catch {
    return null;
  }
}

export async function runTool(name: string, input: Record<string, unknown>, ctx: ToolCtx): Promise<ToolOutput> {
  const { c, events } = await data();
  const str = (k: string) => (typeof input[k] === "string" ? (input[k] as string).trim() : "");
  const num = (k: string) => (typeof input[k] === "number" ? (input[k] as number) : undefined);

  switch (name) {
    case "find_towns": {
      const d = str("discipline") || "any";
      const guides = vicTowns(c).filter((t) => disciplineMatches(t, d));
      const radar = c.lite.filter((l) => isVic(l.region, l.country));
      ctx.signal({ tool: name, discipline: d });
      return {
        result: {
          with_full_guide: guides.map((t) => ({ id: t.id, name: t.name, blurb: t.blurb, editorial_score: t.score, tags: t.tags })),
          on_radar_no_guide_yet: radar.map((l) => l.name),
          note: "Scores are Cycletowns editorial scores until five rider reviews take over.",
        },
        card: { type: "towns", towns: guides.map(townCard) },
      };
    }

    case "town_guide": {
      const id = str("town_id").toLowerCase();
      const t = c.towns.find((x) => x.id === id);
      if (!t) return { result: { error: `No guide for '${id}'. Use find_towns for ids.` } };
      if (!isVic(t.region, t.country)) return { result: { error: `${t.name} is outside Victoria. Ask Cycletowns covers Victoria for now; the guide is at /towns/${t.id}.` } };
      const w = c.when[t.id];
      const ev = sortEvents(events.filter((e) => e.town_id === t.id));
      ctx.signal({ tool: name, town_id: t.id });
      return {
        result: {
          id: t.id, name: t.name, blurb: t.blurb, editorial_score: t.score, tags: t.tags,
          routes: t.routes.map((r) => ({ name: r.n, note: r.note, km: r.km, climbing_m: r.vert, discipline: rideDiscipline(r) })),
          cafes: t.cafes.map((p) => ({ name: p.n, note: p.note, verified_bike_friendly: !!p.verified })),
          bike_shops: t.shops.map((p) => ({ name: p.n, note: p.note, hire: !!p.hire })),
          when_to_go: w ? { best: w.best, peak_crowds: w.peak, best_value: w.quiet } : null,
          things_to_do: (c.seeDo[t.id] || []).map((s) => s[1]),
          events: ev.map(eventLite),
          link: `/towns/${t.id}`,
        },
        card: {
          type: "town",
          town: { id: t.id, name: t.name, blurb: t.blurb, score: t.score, best: w?.best, routes: t.routes.map(lite), cafes: t.cafes.map(lite), shops: t.shops.map(lite) },
        },
      };
    }

    case "find_events": {
      const d = str("discipline");
      const m = str("month");
      const within = num("within_days");
      let list = events.filter((e) => isVic(e.region, e.country) || (e.town_id && vicTowns(c).some((t) => t.id === e.town_id)));
      if (d && d !== "any") list = list.filter((e) => e.discipline === d);
      if (m) {
        const want = m.slice(0, 3).toLowerCase();
        list = list.filter((e) => (isUpcoming(e) ? MONTHS[new Date(e.next_date!).getMonth()] : e.month || "").toLowerCase().startsWith(want));
      }
      if (within) list = list.filter((e) => { const x = daysAway(e); return x !== null && x <= within; });
      list = sortEvents(list).slice(0, 8);
      ctx.signal({ tool: name, discipline: d || null, month: m || null });
      return {
        result: { events: list.map((e) => ({ ...eventLite(e), note: e.note, link: `/events/${e.slug}` })), count: list.length },
        card: list.length ? { type: "events", events: list.map(eventLite) } : undefined,
      };
    }

    case "build_loop": {
      const d = ["road", "gravel", "mtb", "ebike"].includes(str("discipline")) ? str("discipline") : "road";
      const km = Math.max(10, Math.min(100, num("km") || 40));
      let start: { lat: number; lng: number; name: string; townId?: string } | null = null;
      const id = str("town_id").toLowerCase();
      if (id && c.geo[id]) {
        const t = c.towns.find((x) => x.id === id);
        start = { ...c.geo[id], name: t?.name || id, townId: id };
      } else if (str("place")) {
        start = await geocodeVic(str("place"));
      }
      if (!start) return { result: { error: "Couldn't find that start point in Victoria. Ask the rider for a nearby town." } };
      const r = await buildLoop(start.lat, start.lng, km, d, 1 + Math.floor(Math.random() * 50));
      ctx.signal({ tool: name, town_id: start.townId || null, place: start.townId ? null : start.name, discipline: d });
      if ("err" in r) return { result: { error: r.err } };
      const speed = num("speed_kmh") || defaultSpeed(d);
      const hours = estimateHours(r.ok.distance_m, r.ok.ascent_m, d, speed);
      return {
        result: {
          start: start.name, distance_km: +(r.ok.distance_m / 1000).toFixed(1), climbing_m: r.ok.ascent_m,
          estimated_hours: +hours.toFixed(2), assumed_speed_kmh: speed, requested_km: km,
          caveat: "Generated from OpenStreetMap, not ridden by Cycletowns. Check surfaces and traffic.",
        },
        card: {
          type: "loop",
          loop: { place: start.name, townId: start.townId, discipline: d, distance_m: r.ok.distance_m, ascent_m: r.ok.ascent_m, requested_m: r.ok.requested_m, hours, speed, coords: thin(r.ok.coords) },
        },
      };
    }

    case "plan_trip": {
      const id = str("town_id").toLowerCase();
      const t = c.towns.find((x) => x.id === id);
      if (!t || !isVic(t.region, t.country)) return { result: { error: "Trips can be planned for Victorian towns with a full guide. Use find_towns." } };
      const ability = (ABILITIES as string[]).includes(str("ability")) ? (str("ability") as Ability) : "Regular";
      const start = /^\d{4}-\d{2}-\d{2}$/.test(str("start_date")) ? str("start_date") : undefined;
      const plan = buildPlan(
        { id: t.id, name: t.name, region: t.region, country: t.country, routes: t.routes, cafes: t.cafes, shops: t.shops, seeDo: c.seeDo[t.id] || [], when: c.when[t.id], races: c.races[t.id] || [] },
        { days: Math.max(1, Math.min(14, num("days") || 3)), ability, discipline: str("discipline") || "mixed", startDate: start, bringBike: input.bring_bike !== false },
      );
      ctx.signal({ tool: name, town_id: t.id, discipline: str("discipline") || null, month: start ? MONTHS[new Date(start + "T00:00:00").getMonth()] : null });
      const days = plan.days.map((d) => ({ day: d.day, date: d.date, kind: d.kind, title: d.title, subtitle: d.subtitle, route: d.route?.name, cafe: d.cafe?.name }));
      return {
        result: { town: t.name, headline: plan.headline, when_note: plan.whenNote, days, kit: plan.kit, link: `/plan?town=${t.id}` },
        card: { type: "plan", plan: { townId: t.id, townName: t.name, headline: plan.headline, days } },
      };
    }

    case "remember": {
      if (!ctx.signedIn) return { result: { error: "Rider isn't signed in; nothing saved." } };
      const fact = str("fact").slice(0, 280);
      if (fact.length < 3) return { result: { error: "Nothing to save." } };
      const ok = await ctx.remember(fact, str("kind") || "other");
      return ok ? { result: { saved: true }, card: { type: "remembered", fact } } : { result: { error: "Couldn't save that just now." } };
    }
  }
  return { result: { error: `Unknown tool ${name}` } };
}
