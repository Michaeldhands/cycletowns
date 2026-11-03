import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { buildLoop } from "@/lib/ors";

type Body = { lat?: number; lng?: number; km?: number; discipline?: string; seed?: number };

/** Build a round trip on real roads from a start point, via OpenRouteService. */
export async function POST(req: NextRequest) {
  if (!process.env.ORS_API_KEY) return NextResponse.json({ error: "Route building isn’t switched on yet." }, { status: 503 });
  const { lat, lng, km = 40, discipline = "road", seed = 1 } = (await req.json().catch(() => ({}))) as Body;
  if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "That start point doesn’t look right." }, { status: 400 });
  }
  const r = await buildLoop(lat, lng, km, discipline, seed);
  if ("err" in r) return NextResponse.json({ error: r.err }, { status: 502 });
  return NextResponse.json(r.ok);
}
