import type { ScoreDims } from "@/lib/towns";
export type TownScore = { review_count: number; score: number } & ScoreDims;
/** Rider reviews take over from the editorial launch score once a town has this many. */
export const REVIEWS_TO_TAKE_OVER = 5;
