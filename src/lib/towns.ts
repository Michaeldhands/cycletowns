import townsJson from "@/data/towns.json";
import geoJson from "@/data/town-geo.json";
import extraJson from "@/data/town-extra.json";
import seedoJson from "@/data/town-seedo.json";
import whenJson from "@/data/town-when.json";
import racesJson from "@/data/races.json";
import lockedJson from "@/data/rank-locked.json";
import catDefsJson from "@/data/cat-defs.json";
import catHeroJson from "@/data/cat-hero.json";
import personasJson from "@/data/personas.json";

/* ---------- types ---------- */
export type Place = { n: string; s: number; note: string; hire?: boolean; price?: number };
export type Bookable = { type: string; name: string; price: number };
export type ScoreDims = { cafes: number; routes: number; safety: number; climbs: number; storage: number };
export type Town = {
  id: string;
  name: string;
  region: string;
  country: string;
  flag: string;
  cur: string;
  score: number;
  photo?: string;
  gallery?: string[];
  tags: string[];
  personas: string[];
  blurb: string;
  scoreDims: ScoreDims;
  cafes: Place[];
  shops: Place[];
  routes: Place[];
  book?: Bookable[];
};
export type Geo = { lat: number; lng: number };
export type TownExtra = { season?: string; getThere?: string; reviews?: [string, number, string][] };
export type SeeDo = [string, string, string]; // emoji, name, note
export type WhenInfo = {
  ride: number[];
  crowd: number[];
  best: string;
  peak: string;
  quiet: string;
  climate?: string;
};
export type Race = {
  kind: "pro" | "fondo" | "mtb";
  badge: string;
  name: string;
  series?: string;
  km: number;
  vert: number;
  date?: string;
  status?: string;
  disc?: string;
  note?: string;
  illustrative?: boolean;
};
export type CatDef = { id: string; label: string; icon: string; tag: string; blurb: string };
export type Persona = { id: string; e: string; n: string; t: string; d: string };

/* Towns with a full guide (photo, cafés, routes, shops…) */
export const TOWNS = townsJson as Town[];
export const TOWN_GEO = geoJson as Record<string, Geo>;
export const TOWN_EXTRA = extraJson as unknown as Record<string, TownExtra>;
export const TOWN_SEEDO = seedoJson as unknown as Record<string, SeeDo[]>;
export const TOWN_WHEN = whenJson as Record<string, WhenInfo>;
const racesRaw = racesJson as unknown as Record<string, Race[]>;
/** Real races only — entries the demo marked "illustrative" are invented and never shown. */
export const RACES: Record<string, Race[]> = Object.fromEntries(
  Object.entries(racesRaw).map(([k, v]) => [k, v.filter((r) => !r.illustrative)]),
);
export const CAT_DEFS = catDefsJson as CatDef[];
export const CAT_HERO = catHeroJson as Record<string, string[]>;
export const PERSONAS = personasJson as Persona[];

/* Towns on the radar but without a full guide yet (name, region, country, flag) */
export type LiteTown = { slug: string; name: string; region: string; country: string; flag: string };
export const LITE_TOWNS: LiteTown[] = (lockedJson as [string, string, string, string][]).map((x) => ({
  slug: slugify(x[0]),
  name: x[0],
  region: x[1],
  country: x[2],
  flag: x[3],
}));

/* ---------- helpers ---------- */
export function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getTown(id: string): Town | undefined {
  return TOWNS.find((t) => t.id === id);
}
export function getLiteTown(slug: string): LiteTown | undefined {
  return LITE_TOWNS.find((t) => t.slug === slug);
}
export function persona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
export function catDef(id: string): CatDef | undefined {
  return CAT_DEFS.find((c) => c.id === id);
}

/** Full-guide towns sorted by Cyclist Score (desc). */
export function rankedTowns(): Town[] {
  return TOWNS.slice().sort((a, b) => b.score - a.score);
}
export function rankOf(id: string): number {
  return rankedTowns().findIndex((t) => t.id === id) + 1;
}

export type Region = "oceania" | "europe" | "americas" | "asia" | "africa";
export function regionOf(country: string): Region {
  if (country === "Australia" || country === "New Zealand") return "oceania";
  if (["United States", "USA", "Canada", "Argentina", "Chile", "Colombia"].includes(country)) return "americas";
  if (["Thailand", "Japan", "Taiwan", "Nepal", "Vietnam", "Indonesia", "South Korea", "Malaysia", "China", "India"].includes(country)) return "asia";
  if (country === "South Africa") return "africa";
  return "europe";
}
export const SCOPES: { id: "all" | Region; label: string }[] = [
  { id: "all", label: "🌏 Worldwide" },
  { id: "oceania", label: "🇦🇺 Australia & NZ" },
  { id: "europe", label: "🇪🇺 Europe" },
  { id: "americas", label: "🌎 Americas" },
  { id: "asia", label: "🌏 Asia" },
];

export const DIM_LABELS: Record<keyof ScoreDims, [string, string]> = {
  cafes: ["☕", "Café culture"],
  routes: ["🗺️", "Routes"],
  safety: ["🛡️", "Road safety"],
  climbs: ["⛰️", "Climbs"],
  storage: ["🅿️", "Bike storage"],
};
/** The dimension a town scores highest on, e.g. "⛰️ Climbs". */
export function knownFor(t: Town): string {
  let best: keyof ScoreDims = "routes";
  let bv = -1;
  (Object.keys(t.scoreDims) as (keyof ScoreDims)[]).forEach((k) => {
    if (t.scoreDims[k] > bv) {
      bv = t.scoreDims[k];
      best = k;
    }
  });
  const l = DIM_LABELS[best];
  return `${l[0]} ${l[1]}`;
}

/* ---------- categories ---------- */
/** Score a town for a category: base score plus a boost if it's a hero town for that category. */
export function catScore(t: { id: string; name: string; score: number; tags?: string[] }, cat: string): number {
  const heroes = CAT_HERO[cat] || [];
  let boost = 0;
  heroes.forEach((h, i) => {
    if (h === t.id || h === t.name) boost = Math.max(boost, 0.35 - i * 0.02);
  });
  const def = catDef(cat);
  if (def && t.tags && t.tags.some((x) => x.toLowerCase().includes(def.tag))) boost += 0.05;
  return t.score + boost;
}
export function categoryTowns(cat: string): Town[] {
  return TOWNS.slice().sort((a, b) => catScore(b, cat) - catScore(a, cat));
}

/* ---------- routes ---------- */
export type Discipline = "road" | "gravel" | "mtb" | "climbs";
export function rideDiscipline(p: Place): Discipline {
  const s = `${p.n || ""} ${p.note || ""}`.toLowerCase();
  if (/rail trail|rail-trail|greenway|bikeway|cycleway|cycle path|bike path|sealed path|promenade|bike route/.test(s)) return "road";
  if (/gravel/.test(s)) return "gravel";
  if (/\bmtb\b|singletrack|single track|bike park|downhill|enduro|flow|trail/.test(s)) return "mtb";
  if (/climb|summit|\bhc\b| hill|gap|\bpass\b|\bcol\b|ascent|kom|switchback|peak/.test(s)) return "climbs";
  return "road";
}

export function gmaps(q: string): string {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
}
export function money(cur: string, n: number): string {
  return (cur || "$") + Number(n).toLocaleString();
}
