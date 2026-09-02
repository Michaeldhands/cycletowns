import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { hasStripe, siteUrl, stripe } from "@/lib/stripe/server";

/** Open Stripe's billing portal so members can change plan, update card or cancel. */
export async function POST() {
  if (!hasStripe()) return NextResponse.json({ error: "Payments aren’t switched on yet." }, { status: 503 });
  const me = await currentUser();
  if (!me?.profile?.stripe_customer_id) return NextResponse.json({ error: "No billing account yet." }, { status: 400 });
  const session = await stripe().billingPortal.sessions.create({ customer: me.profile.stripe_customer_id, return_url: `${siteUrl()}/account` });
  return NextResponse.json({ url: session.url });
}
