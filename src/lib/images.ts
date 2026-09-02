import ridepics from "@/data/ridepics.json";
import townPix from "@/data/town-pix.json";
import vpix from "@/data/vpix.json";
import { TOWNS, type Town } from "@/lib/towns";

/* NOTE: phase 1 keeps the demo's image strategy — licensed rider photos hotlinked from Pexels
   and town photos from Wikimedia Commons. Phase 2 moves these into our own storage. */

export type RidePic = { id: number; k: string };
const RIDEPICS = ridepics as RidePic[];
const TOWN_PIX = townPix as number[];
const VPIX = vpix as Record<string, number[]>;

export function pexURL(id: number, w = 800): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}`;
}
export function photoURL(file: string, w = 1000): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;
}

/** Stable hash → deterministic images per page (no flicker between server and client). */
export function hashStr(s: string): number {
  let h = 5;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Picks a rider photo of the given kind, deterministically from a seed. */
export function ridePic(kind: string | null, seed: string, w = 800): string {
  const pool = kind ? RIDEPICS.filter((p) => p.k === kind) : RIDEPICS;
  const arr = pool.length ? pool : RIDEPICS;
  return pexURL(arr[hashStr(seed) % arr.length].id, w);
}
/** Venue-style photo (café, shop, thing) deterministically from a seed. */
export function venuePic(cat: "cafe" | "shop" | "thing", seed: string, w = 520): string {
  const arr = VPIX[cat] || [];
  if (!arr.length) return ridePic(null, seed, w);
  return pexURL(arr[hashStr(seed) % arr.length], w);
}

/** Hero image for a town: its licensed photo, or a distinct rider photo if it has none. */
export function townHero(t: Town, w = 1000): string {
  if (t.photo) return photoURL(t.photo, w);
  const photoless = TOWNS.filter((x) => !x.photo);
  const i = Math.max(0, photoless.findIndex((x) => x.id === t.id));
  return pexURL(TOWN_PIX[i % TOWN_PIX.length], w);
}
export function townImages(t: Town): string[] {
  return [t.photo, ...(t.gallery || [])].filter(Boolean) as string[];
}
