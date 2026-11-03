/* Opening suggestions for Ask Cycletowns, chosen by the Victorian season so the first thing a
   rider sees is relevant this week, not generic. Melbourne time decides the month. */

const melbourneMonth = () => Number(new Intl.DateTimeFormat("en-AU", { month: "numeric", timeZone: "Australia/Melbourne" }).format(new Date())) - 1;

const SEASONAL: Record<"summer" | "autumn" | "winter" | "spring", string[]> = {
  summer: ["Where can I ride in summer without cooking?", "A summer weekend in the High Country"],
  autumn: ["Where's best for autumn colours on the bike?", "A gravel weekend away from Melbourne"],
  winter: ["Where's good riding in a Victorian winter?", "A short winter road loop near Melbourne"],
  spring: ["A spring weekend away from Melbourne", "Where's good for a first gravel trip?"],
};

export function seasonOf(m = melbourneMonth()): keyof typeof SEASONAL {
  if (m === 11 || m <= 1) return "summer";
  if (m <= 4) return "autumn";
  if (m <= 7) return "winter";
  return "spring";
}

/** Four suggestions: two for the season, then the tools people most want to try. */
export function starters(): string[] {
  return [...SEASONAL[seasonOf()], "What events are on in the next three months?", "Plan three days in Bright"];
}

/** For a returning rider who has told us how they ride. */
export const RETURNING = ["What would suit me this month?", "Plan a weekend that fits how I ride"];
