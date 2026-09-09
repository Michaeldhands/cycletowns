import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { StravaCapError, exchangeCode } from "@/lib/strava";
import { siteUrl } from "@/lib/stripe/server";
import { saveTokens } from "@/lib/strava-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const back = req.cookies.get("st_next")?.value || "/";
  const done = (q: string) => {
    // Same reason as in connect/: send the rider back to the real site, not the deploy host.
    const res = NextResponse.redirect(new URL(`${back}${back.includes("?") ? "&" : "?"}${q}`, siteUrl()));
    res.cookies.delete("st_nonce");
    res.cookies.delete("st_next");
    return res;
  };

  if (sp.get("error")) return done("strava=denied");

  const nonce = req.cookies.get("st_nonce")?.value;
  if (!nonce || sp.get("state") !== nonce) return done("strava=badstate");

  const code = sp.get("code");
  const me = await currentUser();
  if (!code || !me) return done("strava=failed");

  // Strava grants scopes à la carte; without activity:read we can't check anything.
  if (!(sp.get("scope") || "").includes("activity:read")) return done("strava=noscope");

  try {
    await saveTokens(me.id, await exchangeCode(code));
    return done("strava=connected");
  } catch (err) {
    console.error("strava callback", (err as Error).message);
    return done(err instanceof StravaCapError ? "strava=cap" : "strava=failed");
  }
}
