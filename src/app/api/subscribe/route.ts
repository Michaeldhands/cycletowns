import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The exact wording shown beside the subscribe button. Stored with each sign-up, so a
    consent can always be evidenced against what the person was actually told. */
export const NEWSLETTER_CONSENT =
  "Send me the Cycletowns newsletter — new town guides, routes and features. Unsubscribe any time.";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const { email, source, website } = (await req.json().catch(() => ({}))) as {
    email?: string; source?: string; website?: string;
  };

  // Honeypot: a real person never fills a hidden field. Answer as if it worked.
  if (website) return NextResponse.json({ ok: true });

  const addr = (email || "").trim().toLowerCase();
  if (!EMAIL.test(addr) || addr.length > 200) {
    return NextResponse.json({ error: "That email address doesn’t look right." }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Subscriptions aren’t switched on yet." }, { status: 503 });
  }

  const { error } = await supabaseAdmin()
    .from("subscribers")
    .upsert(
      {
        email: addr,
        source: (source || "news").slice(0, 40),
        consent_text: NEWSLETTER_CONSENT,
        unsubscribed_at: null, // re-subscribing after leaving is allowed, and is a fresh consent
      },
      { onConflict: "email" },
    );

  if (error) {
    console.error("subscribe", error.message);
    return NextResponse.json({ error: "Couldn’t save that just now. Try again in a moment." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
