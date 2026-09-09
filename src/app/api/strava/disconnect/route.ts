import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { deauthorize } from "@/lib/strava";
import { accessTokenFor, forget } from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Revoke at Strava, then delete everything we hold. */
export async function POST() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const token = await accessTokenFor(me.id);
  if (token) await deauthorize(token);
  await forget(me.id);
  return NextResponse.json({ ok: true });
}
