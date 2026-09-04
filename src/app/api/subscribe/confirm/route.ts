import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The click in the confirmation email. Proves the address belongs to whoever asked. */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("t") || "";
  if (!/^[0-9a-f-]{36}$/i.test(token) || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(`${origin}/subscribed?ok=0`);
  }
  const { data, error } = await supabaseAdmin()
    .from("subscribers")
    .update({ confirmed: true, confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("confirm_token", token)
    .select("unsub_token")
    .maybeSingle<{ unsub_token: string }>();

  if (error || !data) return NextResponse.redirect(`${origin}/subscribed?ok=0`);
  // Hand over the unsubscribe link straight away — leaving should never be harder than joining.
  return NextResponse.redirect(`${origin}/subscribed?ok=1&u=${data.unsub_token}`);
}
