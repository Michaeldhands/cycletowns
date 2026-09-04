import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One-click unsubscribe from a token in the email footer. Required by the Spam Act, and it
    has to work without signing in — someone leaving a list should never have to log in first. */
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("t") || "";
  const origin = new URL(req.url).origin;
  if (!/^[0-9a-f-]{36}$/i.test(token) || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(`${origin}/unsubscribed?ok=0`);
  }
  const { error, count } = await supabaseAdmin()
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() }, { count: "exact" })
    .eq("unsub_token", token);

  return NextResponse.redirect(`${origin}/unsubscribed?ok=${!error && (count ?? 0) > 0 ? 1 : 0}`);
}
