import eventsJson from "@/data/events.json";
import { hashStr, photoURL, ridePic } from "@/lib/images";

/* Cycling events riders travel for. Every entry here was checked against the organiser's own
   site on the date in `verified` — nothing is inferred, and where an organiser hasn't published
   a date we say "annually in <month>" rather than guessing one. */

export type CtEvent = {
  slug: string;
  name: string;
  organiser: string | null;
  url: string | null;
  country: string | null;
  region: string | null;
  town_id: string | null;
  next_date: string | null;
  window: string | null;
  km: number[];
  vert: number | null;
  discipline: "road" | "gravel" | "mtb" | "mixed";
  month: string | null;
  note: string;
  verified: string | null;
  img?: string | null;
};

export const EVENTS = eventsJson as unknown as CtEvent[];

export const DISCIPLINES: { id: CtEvent["discipline"]; label: string; emoji: string }[] = [
  { id: "road", label: "Road", emoji: "🚴" },
  { id: "gravel", label: "Gravel", emoji: "🌾" },
  { id: "mtb", label: "MTB", emoji: "⛰️" },
  { id: "mixed", label: "Mixed", emoji: "🔀" },
];

export const disciplineLabel = (d: string) => DISCIPLINES.find((x) => x.id === d)?.label || d;
export const disciplineEmoji = (d: string) => DISCIPLINES.find((x) => x.id === d)?.emoji || "🚴";

/** A published date that has already passed tells a rider nothing useful — fall back to the pattern. */
export const isUpcoming = (e: CtEvent) => Boolean(e.next_date && new Date(e.next_date) >= new Date(new Date().toDateString()));

export function whenLabel(e: CtEvent): string {
  if (isUpcoming(e)) {
    return new Date(e.next_date!).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  }
  return e.window || (e.month ? `${e.month}, annually` : "Dates to be announced");
}

/** How far away it is, for sorting and for a small hint on the card. */
export function daysAway(e: CtEvent): number | null {
  if (!isUpcoming(e)) return null;
  return Math.round((new Date(e.next_date!).getTime() - Date.now()) / 86400000);
}

export function countdown(e: CtEvent): string | null {
  const d = daysAway(e);
  if (d === null) return null;
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 31) return `In ${d} days`;
  const months = Math.round(d / 30);
  return `In about ${months} month${months === 1 ? "" : "s"}`;
}

export const distanceLabel = (km: number[]) =>
  km.length === 0 ? "Distances on the official site" : km.length === 1 ? `${km[0]} km` : `${Math.min(...km)}–${Math.max(...km)} km`;

/** Dated events first, soonest to furthest; then everything that runs to a pattern. */
export function sortEvents(list: CtEvent[]): CtEvent[] {
  return [...list].sort((a, b) => {
    const da = daysAway(a);
    const db = daysAway(b);
    if (da !== null && db !== null) return da - db;
    if (da !== null) return -1;
    if (db !== null) return 1;
    return a.name.localeCompare(b.name);
  });
}

/** A photo for an event: the uploaded one if there is one, otherwise a rider shot chosen
    deterministically from the discipline, so the page never flickers or looks empty. */
const KIND: Record<string, string> = { road: "road", gravel: "gravel", mtb: "mtb", mixed: "group" };
export function eventPhoto(e: CtEvent, w = 900): string {
  if (e.img) return photoURL(e.img, w);
  return ridePic(KIND[e.discipline] || "road", `event-${e.slug}-${hashStr(e.slug) % 7}`, w);
}

export const eventsForTown = (list: CtEvent[], townId: string) => sortEvents(list.filter((e) => e.town_id === townId));
export const getEvent = (list: CtEvent[], slug: string) => list.find((e) => e.slug === slug) || null;
