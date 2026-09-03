/* Trip planner — turns a town's real routes, café stops and things to do into a day-by-day plan.
   Pure functions, no invented bookings or prices: everything here comes from the town guide. */
import type { Place, Race, SeeDo, WhenInfo } from "@/lib/towns";
import { rideDiscipline } from "@/lib/towns";

export type Ability = "Chill" | "Regular" | "Strong" | "Racer";
export const ABILITIES: Ability[] = ["Chill", "Regular", "Strong", "Racer"];
export const DISCIPLINES = [
  { id: "mixed", label: "A bit of everything" },
  { id: "road", label: "Road" },
  { id: "climbs", label: "Climbs" },
  { id: "gravel", label: "Gravel" },
  { id: "mtb", label: "MTB" },
];

export type PlanInput = {
  days: number;
  startDate?: string;      // ISO yyyy-mm-dd
  ability: Ability;
  discipline: string;
  bringBike: boolean;
};
export type PlanDay = {
  day: number;
  date?: string;
  kind: "ride" | "rest" | "race";
  title: string;
  subtitle?: string;
  route?: { name: string; note: string; discipline: string; effort: string };
  cafe?: { name: string; note: string };
  things?: SeeDo[];
  notes: string[];
};
export type Plan = { days: PlanDay[]; headline: string; whenNote?: string; kit: string[] };

export type PlanTown = {
  id: string;
  name: string;
  region: string;
  country: string;
  routes: Place[];
  cafes: Place[];
  shops: Place[];
  seeDo: SeeDo[];
  when?: WhenInfo & { getting?: string; terrain?: string; tip?: string; currency?: string };
  races: Race[];
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** How hard a route looks, from its numbers if we have them, else from its wording. */
function effortOf(p: Place): { score: number; label: string } {
  const km = (p as Place & { km?: number }).km;
  const vert = (p as Place & { vert?: number }).vert;
  const d = rideDiscipline(p);
  if (km || vert) {
    const s = (vert || 0) + (km || 0) * 5;
    if (s < 400) return { score: 1, label: "Easy" };
    if (s < 1000) return { score: 2, label: "Moderate" };
    if (s < 2200) return { score: 3, label: "Hard" };
    return { score: 4, label: "Epic" };
  }
  if (d === "climbs") return { score: 3, label: "Hard" };
  if (d === "mtb") return { score: 3, label: "Hard" };
  if (d === "gravel") return { score: 2, label: "Moderate" };
  return { score: 2, label: "Moderate" };
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (start: string, n: number) => {
  const d = new Date(start + "T00:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const prettyDate = (s?: string) =>
  s ? new Date(s + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) : "";

/** Rest-day cadence: gentler riders get more days off the bike. */
const restEvery: Record<Ability, number> = { Chill: 3, Regular: 4, Strong: 5, Racer: 6 };
/** How much climbing each ability wants on their biggest day. */
const maxEffort: Record<Ability, number> = { Chill: 2, Regular: 3, Strong: 4, Racer: 4 };

export function buildPlan(t: PlanTown, input: PlanInput): Plan {
  const days = Math.max(1, Math.min(14, Math.round(input.days)));
  const wantsAll = input.discipline === "mixed";
  const cap = maxEffort[input.ability];

  // Rank routes: preferred discipline first, then the best-rated, then hardest last so the trip builds.
  const scored = t.routes.map((r) => ({ r, disc: rideDiscipline(r), eff: effortOf(r) }));
  const preferred = scored.filter((x) => wantsAll || x.disc === input.discipline);
  const rest = scored.filter((x) => !preferred.includes(x));
  const pool = [...preferred, ...rest].filter((x) => x.eff.score <= cap + 1);
  const usable = pool.length ? pool : scored;

  // Races inside the window become their own day.
  const raceOn: Record<string, Race> = {};
  if (input.startDate) {
    t.races.forEach((rc) => {
      if (!rc.date) return;
      for (let i = 0; i < days; i++) if (addDays(input.startDate!, i) === rc.date) raceOn[rc.date] = rc;
    });
  }

  const cafes = [...t.cafes].sort((a, b) => (b.s || 0) - (a.s || 0));
  const cafeFor = (i: number) => (cafes.length ? cafes[i % cafes.length] : undefined);

  // Pass 1 — what kind of day each one is.
  type Slot = { kind: "ride" | "rest" | "race"; date?: string; race?: Race };
  const slots: Slot[] = [];
  let sinceRest = 0;
  for (let i = 0; i < days; i++) {
    const date = input.startDate ? addDays(input.startDate, i) : undefined;
    const race = date ? raceOn[date] : undefined;
    const first = i === 0;
    const last = i === days - 1 && days > 1;
    sinceRest++;
    if (race) {
      sinceRest = 0;
      slots.push({ kind: "race", date, race });
    } else if (!first && !last && days >= 4 && sinceRest >= restEvery[input.ability]) {
      sinceRest = 0;
      slots.push({ kind: "rest", date });
    } else {
      slots.push({ kind: "ride", date });
    }
  }

  // Pass 2 — one clear peak, with easier days either side of it. A race in the window IS the peak,
  // so we don't send anyone up a mountain the morning after 160 km.
  const rideIdx = slots.map((s, i) => (s.kind === "ride" ? i : -1)).filter((i) => i >= 0);
  const raceIdx = slots.findIndex((s) => s.kind === "race");
  const midRide = rideIdx.length > 2 ? rideIdx[Math.max(1, Math.round((rideIdx.length - 1) / 2))] : rideIdx[rideIdx.length - 1];
  const peak = raceIdx >= 0 ? raceIdx : midRide;
  const bigDay = raceIdx >= 0 ? -1 : midRide;   // -1 = no ride day is "the big one"
  const target = (i: number): number => {
    if (days > 1 && (i === rideIdx[0] || i === rideIdx[rideIdx.length - 1])) return 1; // travel days: spin
    return Math.max(1, cap - Math.abs(i - peak));                                       // taper away from the peak
  };

  // Pass 3 — give each ride day the route closest to its target effort.
  // Assign the big day first so the queen stage never lands on a travel day; small towns
  // reuse their best routes rather than padding the trip with filler.
  type Pick = { r: Place; disc: string; eff: { score: number; label: string } };
  let bank: Pick[] = [...usable].sort((a, b) => (b.r.s || 0) - (a.r.s || 0));
  const seen = new Set<string>();
  /** Take a route from the bank, refilling when a small town runs out of them.
      `want` of null means "the hardest there is" — that's the peak day. */
  const take = (want: number | null): { pick?: Pick; repeat: boolean } => {
    if (!bank.length) bank = [...usable];
    if (!bank.length) return { repeat: false };
    let best = 0;
    bank.forEach((x, i) => {
      const cur = bank[best];
      const better = want === null
        ? x.eff.score > cur.eff.score || (x.eff.score === cur.eff.score && (x.r.s || 0) > (cur.r.s || 0))
        : Math.abs(x.eff.score - want) < Math.abs(cur.eff.score - want) ||
          (Math.abs(x.eff.score - want) === Math.abs(cur.eff.score - want) && (x.r.s || 0) > (cur.r.s || 0));
      if (better) best = i;
    });
    const pick = bank.splice(best, 1)[0];
    const repeat = seen.has(pick.r.n);
    seen.add(pick.r.n);
    return { pick, repeat };
  };

  const chosen = new Map<number, { pick?: Pick; repeat: boolean }>();
  const firstRide = rideIdx[0];
  const lastRide = rideIdx[rideIdx.length - 1];
  // The peak day claims the hardest ride first; every other day takes what suits it best.
  if (bigDay >= 0) chosen.set(bigDay, take(null));
  [...rideIdx]
    .filter((i) => i !== bigDay)
    .sort((a, b) => target(b) - target(a) || Math.abs(a - peak) - Math.abs(b - peak))
    .forEach((i) => chosen.set(i, take(target(i))));

  const out: PlanDay[] = [];
  slots.forEach((slot, i) => {
    const day = i + 1;
    if (slot.kind === "race" && slot.race) {
      const rc = slot.race;
      out.push({
        day, date: slot.date, kind: "race", title: rc.name,
        subtitle: [rc.km ? `${rc.km} km` : "", rc.vert ? `${rc.vert.toLocaleString()} m` : ""].filter(Boolean).join(" · "),
        notes: [rc.note || "", "Entries and start times come from the organiser — check before you travel."].filter(Boolean),
      });
      return;
    }
    if (slot.kind === "rest") {
      const c = cafeFor(i);
      out.push({
        day, date: slot.date, kind: "rest", title: "Legs up", subtitle: "coffee, a wander, no alarm",
        things: t.seeDo.slice(0, 3),
        cafe: c ? { name: c.n, note: c.note } : undefined,
        notes: t.seeDo.length ? [] : ["Spin the legs out for an hour if you can't sit still."],
      });
      return;
    }
    const { pick, repeat } = chosen.get(i) || { repeat: false };
    const cafe = cafeFor(i);
    const notes: string[] = [];
    const isFirst = i === firstRide;
    const isLast = i === lastRide && days > 1;
    if (isFirst) {
      notes.push((pick?.eff.score ?? 0) >= 3
        ? "Arrival day. If you've travelled a long way, save this one for tomorrow and just spin."
        : "Arrival day — build the bike, spin the travel out of your legs, get your bearings.");
      if (!input.bringBike && t.shops.length) {
        const hire = t.shops.find((s) => s.hire) || t.shops[0];
        notes.push(`Hiring: ${hire.n}${hire.note ? ` — ${hire.note}` : ""}.`);
      }
    }
    if (i === bigDay && !isFirst && (pick?.eff.score ?? 0) >= 3) notes.push("The big one. Start early, take food, and check the forecast the night before.");
    if (raceIdx >= 0 && i === raceIdx + 1) notes.push("Day after the race — spin the legs, don't chase anyone.");
    if (repeat) notes.push("Worth a second lap — ride it the other way, or take it easy and enjoy the view this time.");
    if (isLast && !isFirst) notes.push(pick && pick.eff.score >= 3 ? "One more before you travel — leave yourself time to clean up and pack." : "Last spin before you travel — keep it short and finish with coffee.");
    const discLabel = pick ? (pick.disc === "climbs" ? "Climb" : pick.disc === "mtb" ? "MTB" : pick.disc[0].toUpperCase() + pick.disc.slice(1)) : "";
    out.push({
      day, date: slot.date, kind: "ride",
      title: pick ? pick.r.n : "Explore on feel",
      subtitle: pick ? `${pick.eff.label} · ${discLabel}` : "your call — the town guide has the full list",
      route: pick ? { name: pick.r.n, note: pick.r.note, discipline: pick.disc, effort: pick.eff.label } : undefined,
      cafe: cafe ? { name: cafe.n, note: cafe.note } : undefined,
      notes,
    });
  });

  // When-to-go note for the month they're travelling.
  let whenNote: string | undefined;
  if (input.startDate && t.when) {
    const m = new Date(input.startDate + "T00:00:00").getMonth();
    const q = t.when.ride?.[m];
    const busy = t.when.crowd?.[m] >= 2;
    const monthName = MONTHS[m];
    if (q >= 2) whenNote = `${monthName} is prime riding in ${t.name}.${busy ? " It's also peak season, so book beds early." : ""}`;
    else if (q === 1) whenNote = `${monthName} still rides well in ${t.name} — expect mixed conditions.${busy ? " It's a busy month, too." : ""}`;
    else whenNote = `${monthName} is off-season in ${t.name}. ${t.when.best || "Check conditions before you commit."}`;
  }

  const kit = ["Spares and a plan for a flat a long way from town", "Layers — mountain weather turns"];
  if (t.when?.tip) kit.push(t.when.tip);
  if (!input.bringBike) kit.push("Book hire ahead in peak months — good bikes go first");

  const rides = out.filter((d) => d.kind === "ride").length;
  const restDays = out.filter((d) => d.kind === "rest").length;
  const raceDays = out.filter((d) => d.kind === "race").length;
  const builds = days >= 4 && bigDay >= 0 && (chosen.get(bigDay)?.pick?.eff.score ?? 0) >= 3;
  const bits = [`${rides} ride${rides === 1 ? "" : "s"}`];
  if (raceDays) bits.push(`${raceDays} race day${raceDays === 1 ? "" : "s"}`);
  if (restDays) bits.push(restDays === 1 ? "a day off the bike" : `${restDays} days off the bike`);
  const headline = `${days} day${days === 1 ? "" : "s"} in ${t.name}${input.startDate ? ` from ${prettyDate(input.startDate)}` : ""} — ${bits.join(", ")}${builds ? ", building to the big one" : ""}.`;
  return { days: out, headline, whenNote, kit };
}
