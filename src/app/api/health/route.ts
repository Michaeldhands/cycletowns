import { NextResponse } from "next/server";
import { SUPABASE_ANON, SUPABASE_URL, hasSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Health check for uptime monitoring. Returns 200 only when every dependency the
   site needs is answering, so one alert tells you which one broke. Deliberately
   leaks nothing: names of services and up/down, never keys, counts or user data. */

type Check = { name: string; ok: boolean; ms: number; note?: string };

const timed = async (name: string, fn: () => Promise<{ ok: boolean; note?: string }>): Promise<Check> => {
  const t0 = Date.now();
  try {
    const r = await fn();
    return { name, ...r, ms: Date.now() - t0 };
  } catch (e) {
    return { name, ok: false, ms: Date.now() - t0, note: (e as Error).name };
  }
};

const ping = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(6000), cache: "no-store" });
  return { ok: res.ok || res.status === 401 || res.status === 403, note: res.ok ? undefined : `status ${res.status}` };
};

export async function GET() {
  const checks: Check[] = await Promise.all([
    // The database: a cheap authenticated read against a table that always exists.
    timed("database", async () => {
      if (!hasSupabase()) return { ok: false, note: "not configured" };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/towns?select=id&limit=1`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      });
      return { ok: res.ok, note: res.ok ? undefined : `status ${res.status}` };
    }),
    // Payments: reachable and the key is accepted.
    timed("payments", async () => {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) return { ok: false, note: "not configured" };
      const res = await fetch("https://api.stripe.com/v1/prices?limit=1", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      });
      return { ok: res.ok, note: res.ok ? undefined : `status ${res.status}` };
    }),
    // Routing: the loop builder's dependency. 401/403 still means the service is up.
    timed("routing", async () => {
      if (!process.env.ORS_API_KEY) return { ok: false, note: "not configured" };
      return ping("https://api.openrouteservice.org/v2/health");
    }),
  ]);

  // Config that must simply be present for the site to behave correctly.
  const config = {
    webhook_secret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    service_role_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
  const configOk = Object.values(config).every(Boolean);
  const ok = checks.every((c) => c.ok) && configOk;

  return NextResponse.json(
    { ok, checked_at: new Date().toISOString(), checks, config },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
