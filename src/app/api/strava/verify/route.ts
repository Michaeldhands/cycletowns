import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/stripe/server";
import { loadCatalog } from "@/lib/content";
import { findRideNear, hasStrava, VERIFY_RADIUS_KM, VERIFY_WINDOW_DAYS } from "@/lib/strava";
import { accessTokenFor } from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Verify the signed-in rider's own review of one town against their Strava rides. */
export async function POST(req: NextRequest) {
  if (!hasStrava()) return NextResponse.json({ error: "Ride verification isn’t switched on yet." }, { status: 503 });

  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { town } = (await req.json().catch(() => ({}))) as { town?: string };
  if (!town) return NextResponse.json({ error: "Which town?" }, { status: 400 });

  const token = await accessTokenFor(me.id);
  if (!token) return NextResponse.json({ error: "Connect Strava first.", reconnect: true }, { status: 400 });

  const db = supabaseAdmin();
  const { data: review } = await db
    .from("reviews")
    .select("id, visited_on, verified_at")
    .eq("user_id", me.id)
    .eq("town_id", town)
    .maybeSingle<{ id: string; visited_on: string | null; verified_at: string | null }>();

  if (!review) return NextResponse.json({ error: "Write your review first, then verify it." }, { status: 404 });
  if (review.verified_at) return NextResponse.json({ ok: true, already: true });

  const geo = (await loadCatalog()).geo[town];
  if (!geo) return NextResponse.json({ error: "We don’t have coordinates for that town yet." }, { status: 400 });

  const found = await findRideNear(token, geo, review.visited_on);
  if (!found.ok) {
    const msg: Record<string, string> = {
      no_match: review.visited_on
        ? `We couldn’t find a ride starting within ${VERIFY_RADIUS_KM} km of there, within ${VERIFY_WINDOW_DAYS} days of the date on your review. Check the date is right and try again — your review still counts either way.`
        : `We couldn’t find a ride starting within ${VERIFY_RADIUS_KM} km of there in your last two years. Adding the date you visited makes this much more likely to find it.`,
      no_location: "None of your rides in that window have a start location on Strava, so there’s nothing for us to match. Your review still counts.",
      rate_limited: "Strava is rate-limiting us right now. Try again in fifteen minutes.",
      error: "Strava didn’t answer that. Try again shortly.",
    };
    return NextResponse.json({ ok: false, error: msg[found.reason] || msg.error }, { status: found.reason === "rate_limited" ? 429 : 200 });
  }

  await db
    .from("reviews")
    .update({ verified_at: new Date().toISOString(), verify_source: "strava", verify_ref: found.activityId })
    .eq("id", review.id);

  return NextResponse.json({ ok: true });
}
