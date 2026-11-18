import type { Town } from "@/lib/towns";

/* The Cycletowns distinctions — the guide's verdict on a town, in the spirit of the Michelin Guide.

   Being in the guide at all is the first honour ("Selected"). Above that, one to three wheels.
   The verdict belongs to the inspectors. Rider reviews are shown beside it as "Riders say" and
   never change it; no town, business, region or partner can pay for one.

   Until a town has been inspected in person, its distinction is provisional — set from our
   research — and capped at two wheels. The third wheel is only ever given after an inspection. */

export type Level = 0 | 1 | 2 | 3;
export type DistinctionStatus = "provisional" | "inspected";

export const DISTINCTIONS: Record<Level, { name: string; short: string; line: string }> = {
  0: { name: "Selected", short: "In the guide", line: "A good place to ride, chosen for the guide." },
  1: { name: "One Wheel", short: "Worth a ride", line: "Very good riding. Worth a ride if you're in the area." },
  2: { name: "Two Wheels", short: "Worth a weekend", line: "Excellent riding. Worth planning a weekend around." },
  3: { name: "Three Wheels", short: "Worth the trip", line: "Exceptional riding. Worth a journey in its own right." },
};

/** The five things an inspection weighs, in the order we publish them — one per score dimension. */
export const CRITERIA: { dim: "routes" | "climbs" | "safety" | "cafes" | "storage"; name: string; what: string }[] = [
  { dim: "routes", name: "The riding", what: "The quality and variety of rides from the town's door — road, gravel and trail." },
  { dim: "climbs", name: "The climbing", what: "Climbs worth the trip, from short and sharp to long and alpine." },
  { dim: "safety", name: "The roads", what: "How safe and pleasant they are to ride: traffic, surfaces, shoulders, signage." },
  { dim: "cafes", name: "The stops", what: "Cafés and bakeries that welcome riders, open when riders need them." },
  { dim: "storage", name: "The welcome", what: "Somewhere to lock a bike, a workshop that can fix one, stays that store one." },
];

/** Provisional distinction from the research score, for towns the database hasn't set one for. */
export function levelFromScore(score: number): Level {
  if (score >= 4.9) return 2;
  if (score >= 4.7) return 1;
  return 0;
}

export function distinctionOf(t: Pick<Town, "score" | "distinction" | "distinctionStatus">): { level: Level; status: DistinctionStatus } {
  const status: DistinctionStatus = t.distinctionStatus === "inspected" ? "inspected" : "provisional";
  let level = (typeof t.distinction === "number" ? t.distinction : levelFromScore(t.score)) as Level;
  if (level > 3) level = 3;
  if (level < 0) level = 0;
  if (status === "provisional" && level > 2) level = 2;   // the third wheel needs an inspection
  return { level, status };
}

/** Guide order: distinction first, then alphabetical — no league table inside a tier. */
export function guideOrder<T extends Pick<Town, "score" | "distinction" | "distinctionStatus" | "name">>(a: T, b: T): number {
  return distinctionOf(b).level - distinctionOf(a).level || a.name.localeCompare(b.name);
}
