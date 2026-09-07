import { photoURL, ridePic } from "@/lib/images";

/* Named banner slots. Each has a stock fallback so the site never looks broken, and each can be
   replaced from the admin with a real photo. These are decorative riding shots, not claims about
   a specific place — the moment a photo sits under the name of a business or town, it has to be
   a real photo of it, which is why those are handled separately. */

export type Banner = { slot: string; img: string | null; alt: string | null; credit: string | null };

export type SlotDef = { slot: string; label: string; where: string; kind: string; seed: string; ratio: string };

export const SLOTS: SlotDef[] = [
  { slot: "home-hero", label: "Home hero", where: "The big image behind the headline on the home page", kind: "road", seed: "hero", ratio: "wide" },
  { slot: "home-partner", label: "Home partner slot", where: "The 'Your brand here' panel on the home page", kind: "road", seed: "ad-1", ratio: "wide" },
  { slot: "home-lane-1", label: "Home — 'Just here to ride'", where: "First of the two lanes on the home page", kind: "group", seed: "lane-1", ratio: "square" },
  { slot: "home-lane-2", label: "Home — second lane", where: "Second of the two lanes on the home page", kind: "group", seed: "lane-2", ratio: "square" },
  { slot: "home-club", label: "Home — Cycletowns Club", where: "Beside the club sign-up on the home page", kind: "group", seed: "club", ratio: "wide" },
  { slot: "membership-hero", label: "Membership hero", where: "Top of the membership page", kind: "alpine", seed: "membership-hero", ratio: "wide" },
  { slot: "membership-insider", label: "Membership — Insider panel", where: "Beside the Insider pitch", kind: "group", seed: "insider", ratio: "wide" },
  { slot: "partners-hero", label: "Partners hero", where: "Top of the partners page", kind: "group", seed: "partners-hero", ratio: "wide" },
  { slot: "cat-road", label: "Category — Road", where: "The 'What's your ride?' tiles", kind: "road", seed: "cat-road", ratio: "square" },
  { slot: "cat-climb", label: "Category — Climbing", where: "The 'What's your ride?' tiles", kind: "climb", seed: "cat-climb", ratio: "square" },
  { slot: "cat-gravel", label: "Category — Gravel", where: "The 'What's your ride?' tiles", kind: "gravel", seed: "cat-gravel", ratio: "square" },
  { slot: "cat-mtb", label: "Category — MTB", where: "The 'What's your ride?' tiles", kind: "mtb", seed: "cat-mtb", ratio: "square" },
  { slot: "cat-ebike", label: "Category — E-bike", where: "The 'What's your ride?' tiles", kind: "ebike", seed: "cat-ebike", ratio: "square" },
  { slot: "cat-alpine", label: "Category — Alpine", where: "The 'What's your ride?' tiles", kind: "alpine", seed: "cat-alpine", ratio: "square" },
  { slot: "cat-pro", label: "Category — Pro roads", where: "The 'What's your ride?' tiles", kind: "group", seed: "cat-pro", ratio: "square" },
];

export const slotDef = (slot: string) => SLOTS.find((s) => s.slot === slot);

export type BannerMap = Record<string, Banner>;

/** The image for a slot: whatever the admin uploaded, or the stock photo the page ships with. */
export function bannerSrc(banners: BannerMap, slot: string, w = 1200): string {
  const b = banners[slot];
  if (b?.img) return photoURL(b.img, w);
  const d = slotDef(slot);
  return ridePic(d?.kind || "road", d?.seed || slot, w);
}

/** Alt text: what the admin said the photo shows, or nothing — a decorative image needs no alt. */
export const bannerAlt = (banners: BannerMap, slot: string): string => banners[slot]?.alt || "";
