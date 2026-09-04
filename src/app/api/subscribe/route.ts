import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, siteUrl } from "@/lib/stripe/server";
import { confirmEmail, hasEmail, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The exact wording shown beside the subscribe button. Stored with each sign-up, so a
    consent can always be evidenced against what the person was actually told. */
export const NEWSLETTER_CONSENT =
  "Send me the Cycletowns newsletter — new town guides, routes and features. Unsubscribe any time.";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Row = { email: string; confirmed: boolean; confirm_token: string; confirm_sent_at: string | null };

export async function POST(req: NextRequest) {
  const { email, source, website } = (await req.json().catch(() => ({}))) as {
    email?: string; source?: string; website?: string;
  };

  // Honeypot: a real person never fills a hidden field. Answer as if it worked.
  if (website) return NextResponse.json({ ok: true, state: "sent" });

  const addr = (email || "").trim().toLowerCase();
  if (!EMAIL.test(addr) || addr.length > 200) {
    return NextResponse.json({ error: "That email address doesn’t look right." }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Subscriptions aren’t switched on yet." }, { status: 503 });
  }

  const db = supabaseAdmin();
  const { data: existing } = await db
    .from("subscribers")
    .select("email, confirmed, confirm_token, confirm_sent_at")
    .eq("email", addr)
    .maybeSingle<Row>();

  // Already on the list: say so without confirming to a stranger that this address subscribes.
  if (existing?.confirmed) return NextResponse.json({ ok: true, state: "sent" });

  // Don't let the form be used to mail someone repeatedly.
  const recentlySent = existing?.confirm_sent_at && Date.now() - new Date(existing.confirm_sent_at).getTime() < 10 * 60 * 1000;

  const { data: row, error } = await db
    .from("subscribers")
    .upsert(
      {
        email: addr,
        source: (source || "news").slice(0, 40),
        consent_text: NEWSLETTER_CONSENT,
        unsubscribed_at: null, // re-subscribing after leaving is a fresh consent
      },
      { onConflict: "email" },
    )
    .select("confirm_token")
    .single<{ confirm_token: string }>();

  if (error || !row) {
    console.error("subscribe", error?.message);
    return NextResponse.json({ error: "Couldn’t save that just now. Try again in a moment." }, { status: 500 });
  }

  if (!hasEmail()) {
    // No mail service configured: be honest rather than claiming an email is on its way.
    return NextResponse.json({ ok: true, state: "pending_no_email" });
  }
  if (recentlySent) return NextResponse.json({ ok: true, state: "sent" });

  const url = `${siteUrl()}/api/subscribe/confirm?t=${row.confirm_token}`;
  const mail = confirmEmail(url);
  const sent = await sendEmail(addr, mail.subject, mail.html, mail.text);
  if (!sent.ok) {
    return NextResponse.json({ error: "We saved your address but couldn’t send the confirmation email. Try again shortly, or email hello@cycletowns.com." }, { status: 502 });
  }
  await db.from("subscribers").update({ confirm_sent_at: new Date().toISOString() }).eq("email", addr);
  return NextResponse.json({ ok: true, state: "sent" });
}
