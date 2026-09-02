import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe, syncSubscription } from "@/lib/stripe/server";

/** Stripe → Cycletowns: keeps membership status in step with the subscription. */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `Bad signature: ${(e as Error).message}` }, { status: 400 });
  }
  const s = stripe();
  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.mode === "subscription" && cs.subscription) {
        const sub = await s.subscriptions.retrieve(typeof cs.subscription === "string" ? cs.subscription : cs.subscription.id);
        if (!sub.metadata?.user_id && cs.client_reference_id) sub.metadata = { ...sub.metadata, user_id: cs.client_reference_id };
        await syncSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
  }
  return NextResponse.json({ received: true });
}
