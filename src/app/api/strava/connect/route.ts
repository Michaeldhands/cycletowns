import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { authorizeURL, hasStrava } from "@/lib/strava";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Send the rider to Strava. A nonce cookie guards the round trip. */
export async function GET(req: NextRequest) {
  const back = req.nextUrl.searchParams.get("next") || "/";
  if (!hasStrava()) return NextResponse.redirect(new URL(`${back}?strava=off`, req.nextUrl.origin));

  const me = await currentUser();
  if (!me) return NextResponse.redirect(new URL(`/join?next=${encodeURIComponent(back)}`, req.nextUrl.origin));

  const nonce = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeURL(`${req.nextUrl.origin}/api/strava/callback`, nonce));
  res.cookies.set("st_nonce", nonce, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 600 });
  res.cookies.set("st_next", back, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 600 });
  return res;
}
