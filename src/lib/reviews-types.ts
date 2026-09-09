import type { ScoreDims } from "@/lib/towns";

export type TownScore = {
  review_count: number;
  /** How many of those had a ride we could verify. */
  verified_count: number;
  /** Sum of the review weights after recency and verification — the "effective" number of reviews. */
  weighted_n: number;
  /** The honest weighted average. This is the number we show. */
  score: number;
  /** Score minus one standard error. Used for ordering only, never displayed. */
  rank_score: number;
} & ScoreDims;

/** Rider reviews take over from the editorial launch score once a town has this many. */
export const REVIEWS_TO_TAKE_OVER = 5;

/** A review's weight halves after this many days. Mirrors 0016_weighted_scores.sql. */
export const RECENCY_HALF_LIFE_DAYS = 548;

/** An unverified review counts this much against a verified one's 1.0. */
export const UNVERIFIED_WEIGHT = 0.5;

/**
 * Ordering penalty applied to a town still on its editorial score, so that handing over to
 * riders is a promotion rather than a demotion. It is roughly the confidence penalty a town
 * carries at the takeover threshold — evidence from riders should move a town up, not down.
 * Ordering only: no displayed number is ever reduced by it.
 */
export const EDITORIAL_RANK_PENALTY = 0.35;

/** What a town is ordered on. Never shown to anyone. */
export function rankValue(editorial: number, s: TownScore | null | undefined): number {
  if (s && s.review_count >= REVIEWS_TO_TAKE_OVER) return Number(s.rank_score);
  return editorial - EDITORIAL_RANK_PENALTY;
}
