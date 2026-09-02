import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { PLANS, ensurePrice, hasStripe, siteUrl, stripe, type PlanKey } from "@/lib/stripe/server";

/** Start a Stripe Checkout session for Insider membership. Body: { plan: "month" | "year" } */
export async function POST(req: NextRequest) {
  if (!hasStripe()) return NextResponse.json({ error: "Payments aren’t switched on yet." }, { status: 503 });
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const { plan } = (await req.json().catch(() => ({}))) as { plan?: PlanKey };
  if (!plan || !PLANS[plan]) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  const s = stripe();
  const price = await ensurePrice(plan);
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer: me.profile?.stripe_customer_id || undefined,
    customer_email: me.profile?.stripe_customer_id ? undefined : me.email || undefined,
    client_reference_id: me.id,
    subscription_data: { metadata: { user_id: me.id } },
    metadata: { user_id: me.id },
    allow_promotion_codes: true,
    success_url: `${siteUrl()}/membership/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/membership`,
  });
  return NextResponse.json({ url: session.url });
}
