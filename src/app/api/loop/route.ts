import { NextResponse, type NextRequest } from "next/server";
import { profileFor, type LoopPoint } from "@/lib/loops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORS = "https://api.openrouteservice.org/v2/directions";
export const hasRouter = () => Boolean(process.env.ORS_API_KEY);

type Body = { lat?: number; lng?: number; km?: number; discipline?: string; seed?: number };

/** Build a round trip on real roads from a start point, via OpenRouteService. */
export async function POST(req: NextRequest) {
  const key = process.env.ORS_API_KEY;
  if (!key) return NextResponse.json({ error: "Route building isn’t switched on yet." }, { status: 503 });

  const { lat, lng, km = 40, discipline = "road", seed = 1 } = (await req.json().catch(() => ({}))) as Body;
  if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "That start point doesn’t look right." }, { status: 400 });
  }
  const length = Math.round(Math.max(10, Math.min(200, km)) * 1000);
  const points = Math.max(3, Math.min(8, Math.round(length / 15000)));

  let res: Response;
  try {
    res = await fetch(`${ORS}/${profileFor(discipline)}/geojson`, {
      method: "POST",
      headers: { Authorization: key, "Content-Type": "application/json", Accept: "application/geo+json" },
      body: JSON.stringify({
        coordinates: [[lng, lat]],
        elevation: true,
        instructions: false,
        options: { round_trip: { length, points, seed: Math.round(seed) } },
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    return NextResponse.json({ error: "The route service didn’t answer. Try again in a moment." }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    let message = "The route service couldn’t build a loop from there.";
    if (res.status === 403 || res.status === 401) message = "Route building is misconfigured — the API key was rejected.";
    else if (res.status === 429) message = "Too many routes being built right now. Give it a minute.";
    else if (/2010|Could not find routable point|point.*not found/i.test(detail)) {
      message = "No rideable roads found near that start point. Try a café closer to town, or a different discipline.";
    } else if (/2004|distance|length/i.test(detail)) {
      message = "That distance is too far for this start point. Try something shorter.";
    }
    console.error("ORS", res.status, detail.slice(0, 400));
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const data = (await res.json().catch(() => null)) as {
    features?: { geometry?: { coordinates?: LoopPoint[] }; properties?: { summary?: { distance?: number }; ascent?: number; descent?: number } }[];
  } | null;
  const f = data?.features?.[0];
  const coords = f?.geometry?.coordinates;
  if (!coords || coords.length < 10) {
    return NextResponse.json({ error: "The route service returned an empty loop. Try a different distance." }, { status: 502 });
  }
  return NextResponse.json({
    coords,
    distance_m: Math.round(f?.properties?.summary?.distance ?? 0),
    ascent_m: Math.round(f?.properties?.ascent ?? 0),
    descent_m: Math.round(f?.properties?.descent ?? 0),
  });
}
