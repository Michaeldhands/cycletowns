import { NextResponse, type NextRequest } from "next/server";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { PLANS, ensurePrice, hasStripe, siteUrl, stripe, type PlanKey } from "@/lib/stripe/server";

/** Start a Stripe Checkout session for Insider membership. Body: { plan: "month" | "year" } */
export async function POST(req: NextRequest) {
  if (!hasStripe()) return NextResponse.json({ error: "Payments aren’t switched on yet." }, { status: 503 });
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const { plan, partnerId } = (await req.json().catch(() => ({}))) as { plan?: PlanKey; partnerId?: string };
  if (!plan || !PLANS[plan]) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  const isPartner = plan.startsWith("partner_");
  if (isPartner) {
    if (!partnerId) return NextResponse.json({ error: "Missing listing." }, { status: 400 });
    const sb = await supabaseServer();
    const { data: partner } = await sb.from("partners").select("id, owner_id").eq("id", partnerId).maybeSingle();
    if (!partner || partner.owner_id !== me.id) return NextResponse.json({ error: "That listing isn’t yours." }, { status: 403 });
  }
  const s = stripe();
  const price = await ensurePrice(plan);
  const meta: Record<string, string> = isPartner ? { partner_id: partnerId!, user_id: me.id } : { user_id: me.id };
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer: me.profile?.stripe_customer_id || undefined,
    customer_email: me.profile?.stripe_customer_id ? undefined : me.email || undefined,
    client_reference_id: me.id,
    subscription_data: { metadata: meta },
    metadata: meta,
    allow_promotion_codes: true,
    success_url: isPartner ? `${siteUrl()}/partners/dashboard?upgraded=1` : `${siteUrl()}/membership/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: isPartner ? `${siteUrl()}/partners/dashboard` : `${siteUrl()}/membership`,
  });
  return NextResponse.json({ url: session.url });
}
