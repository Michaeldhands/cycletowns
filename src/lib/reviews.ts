import { hasSupabase, supabasePublic } from "@/lib/supabase/server";
import type { ScoreDims, Town } from "@/lib/towns";

export type Review = {
  id: string;
  user_id: string;
  town_id: string;
  cafes: number;
  routes: number;
  safety: number;
  climbs: number;
  storage: number;
  body: string;
  ride_type: string | null;
  visited_on: string | null;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null; tier: string; home_town: string | null } | null;
};
export type TownScore = { review_count: number; score: number } & ScoreDims;

/** Rider reviews take over from the editorial launch score once a town has this many. */
export const REVIEWS_TO_TAKE_OVER = 5;

export async function fetchTownReviews(townId: string): Promise<{ reviews: Review[]; score: TownScore | null }> {
  if (!hasSupabase()) return { reviews: [], score: null };
  const sb = supabasePublic();
  const [{ data: reviews }, { data: score }] = await Promise.all([
    sb.from("reviews").select("*, profiles(display_name, avatar_url, tier, home_town)").eq("town_id", townId).eq("status", "published").order("created_at", { ascending: false }).limit(30),
    sb.from("town_scores").select("*").eq("town_id", townId).maybeSingle(),
  ]);
  return { reviews: (reviews as Review[]) || [], score: (score as TownScore) || null };
}

/** All town scores keyed by town id (for rankings). */
export async function fetchAllScores(): Promise<Record<string, TownScore>> {
  if (!hasSupabase()) return {};
  const { data } = await supabasePublic().from("town_scores").select("*");
  const out: Record<string, TownScore> = {};
  (data || []).forEach((r: TownScore & { town_id: string }) => (out[r.town_id] = r));
  return out;
}

/** The score to show: rider reviews once there are enough, else the editorial launch score. */
export function effectiveScore(t: Town, s: TownScore | null | undefined): { score: number; dims: ScoreDims; source: "riders" | "editorial"; count: number } {
  if (s && s.review_count >= REVIEWS_TO_TAKE_OVER) {
    return { score: Number(s.score), dims: { cafes: +s.cafes, routes: +s.routes, safety: +s.safety, climbs: +s.climbs, storage: +s.storage }, source: "riders", count: s.review_count };
  }
  return { score: t.score, dims: t.scoreDims, source: "editorial", count: s?.review_count ?? 0 };
}
