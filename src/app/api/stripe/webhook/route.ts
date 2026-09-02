import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe, syncSubscription } from "@/lib/stripe/server";

export const runtime = "nodejs";

/** Stripe → Cycletowns: keeps membership status in step with the subscription. */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  if (!sig) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    console.warn("Stripe webhook signature verification failed", (e as Error).message);
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const subscription = await stripe().subscriptions.retrieve(subscriptionId);
          if (!subscription.metadata?.user_id && !subscription.metadata?.partner_id) {
            subscription.metadata = {
              ...subscription.metadata,
              ...(session.metadata || {}),
              user_id: session.client_reference_id || session.metadata?.user_id || "",
            };
          }
          await syncSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (e) {
    console.error("Stripe webhook processing failed", { eventId: event.id, eventType: event.type, error: (e as Error).message });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
