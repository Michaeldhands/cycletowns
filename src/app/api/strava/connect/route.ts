import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { authorizeURL, hasStrava } from "@/lib/strava";
import { siteUrl } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Send the rider to Strava. A nonce cookie guards the round trip. */
export async function GET(req: NextRequest) {
  const back = req.nextUrl.searchParams.get("next") || "/";
  // NOT req.nextUrl.origin. Behind Netlify that resolves to the deploy-specific host
  // (https://<deploy-id>--cycletowns-site.netlify.app), which never matches the callback
  // domain registered with Strava, and every connection attempt is rejected as an invalid
  // redirect_uri. The canonical site URL is the only thing safe to hand a third party.
  const origin = siteUrl();
  if (!hasStrava()) return NextResponse.redirect(new URL(`${back}?strava=off`, origin));

  const me = await currentUser();
  if (!me) return NextResponse.redirect(new URL(`/join?next=${encodeURIComponent(back)}`, origin));

  const nonce = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeURL(`${origin}/api/strava/callback`, nonce));
  res.cookies.set("st_nonce", nonce, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 600 });
  res.cookies.set("st_next", back, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 600 });
  return res;
}
