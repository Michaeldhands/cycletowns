/* What Ask Cycletowns shows besides words. Shared by the API route (which builds them from real
   records) and the chat panel (which renders them with the site's own styling). A card is only
   ever built from a database row or a routing result — never from the model's own text. */

export type TownCardData = {
  id: string;
  name: string;
  region: string;
  blurb: string;
  score: number | null;      // editorial score; null for towns without a guide yet
  tags: string[];
  guide: boolean;            // false = "on our radar", no researched guide yet
};

export type PlaceLite = { n: string; note: string; km?: number; vert?: number; verified?: boolean };

export type TownGuideCard = {
  id: string;
  name: string;
  blurb: string;
  score: number;
  best?: string;
  routes: PlaceLite[];
  cafes: PlaceLite[];
  shops: PlaceLite[];
};

export type EventLite = {
  slug: string;
  name: string;
  when: string;
  discipline: string;
  km: number[];
  region: string | null;
  url: string | null;
};

export type LoopCard = {
  place: string;
  townId?: string;
  discipline: string;
  distance_m: number;
  ascent_m: number;
  requested_m: number;
  hours: number;
  speed: number;
  coords: [number, number, number?][];   // thinned for the chat; the route planner rebuilds at full detail
};

export type PlanCard = {
  townId: string;
  townName: string;
  headline: string;
  days: { day: number; date?: string; kind: string; title: string; subtitle?: string; route?: string; cafe?: string }[];
};

export type Card =
  | { type: "towns"; towns: TownCardData[] }
  | { type: "town"; town: TownGuideCard }
  | { type: "events"; events: EventLite[] }
  | { type: "loop"; loop: LoopCard }
  | { type: "plan"; plan: PlanCard }
  | { type: "remembered"; fact: string };

/** One line of the NDJSON stream from /api/ask. */
export type AskEvent =
  | { t: "text"; v: string }
  | { t: "card"; card: Card }
  | { t: "status"; v: string }
  | { t: "error"; v: string }
  | { t: "done"; remaining?: number | null };

export type AskTurn = { role: "user" | "assistant"; text: string };
