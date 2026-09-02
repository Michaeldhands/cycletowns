import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const PLANS = {
  month: { lookup: "insider_monthly", amount: 700, interval: "month" as const, label: "A$7 / month", product: "Cycletowns Insider", description: "Rider membership — double points, ad-free browsing, members-only partner offers and early access." },
  year: { lookup: "insider_yearly", amount: 8000, interval: "year" as const, label: "A$80 / year", product: "Cycletowns Insider", description: "Rider membership — double points, ad-free browsing, members-only partner offers and early access." },
  partner_member: { lookup: "partner_member", amount: 4900, interval: "month" as const, label: "A$49 / month", product: "Cycletowns Partner — Member", description: "Verified listing, live dashboard, member offers." },
  partner_featured: { lookup: "partner_featured", amount: 29000, interval: "month" as const, label: "A$290 / month", product: "Cycletowns Partner — Featured", description: "Everything in Member plus priority placement on town and category pages." },
};
export type PlanKey = keyof typeof PLANS;

export const hasStripe = () => Boolean(process.env.STRIPE_SECRET_KEY);
export function stripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "");
}
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "https://cycletowns.com";

/** Find-or-create the Insider product and its two prices, keyed by lookup key so we never duplicate them. */
export async function ensurePrice(plan: PlanKey): Promise<string> {
  const s = stripe();
  const p = PLANS[plan];
  const found = await s.prices.list({ lookup_keys: [p.lookup], active: true, limit: 1 });
  if (found.data[0]) return found.data[0].id;
  let product = (await s.products.search({ query: `name:'${p.product}'` })).data[0];
  if (!product) product = await s.products.create({ name: p.product, description: p.description });
  const price = await s.prices.create({ product: product.id, currency: "aud", unit_amount: p.amount, recurring: { interval: p.interval }, lookup_key: p.lookup });
  return price.id;
}

/** Server-only Supabase client that bypasses RLS (webhooks). Needs SUPABASE_SERVICE_ROLE_KEY. */
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", { auth: { persistSession: false } });
}

/** Mirror a Stripe subscription onto the rider's profile, or a partner listing. */
export async function syncSubscription(sub: Stripe.Subscription) {
  if (sub.metadata?.partner_id) return syncPartnerSubscription(sub);
  const userId = sub.metadata?.user_id;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const active = ["active", "trialing", "past_due"].includes(sub.status);
  const item = sub.items.data[0];
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null;
  const patch = {
    stripe_customer_id: customer,
    stripe_subscription_id: sub.id,
    membership: active ? "insider" : "free",
    membership_interval: item?.price?.recurring?.interval ?? null,
    membership_until: periodEnd,
  };
  const db = supabaseAdmin();
  const q = userId ? db.from("profiles").update(patch).eq("id", userId) : db.from("profiles").update(patch).eq("stripe_customer_id", customer);
  const { error } = await q;
  if (error) throw new Error(`Could not sync rider subscription: ${error.message}`);
}

async function syncPartnerSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const active = ["active", "trialing", "past_due"].includes(sub.status);
  const key = item?.price?.lookup_key || "";
  const plan = !active ? "claim" : key === "partner_featured" ? "featured" : "member";
  const { error } = await supabaseAdmin().from("partners").update({
    plan,
    status: "active",
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    plan_until: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
  }).eq("id", sub.metadata.partner_id);
  if (error) throw new Error(`Could not sync partner subscription: ${error.message}`);
}
