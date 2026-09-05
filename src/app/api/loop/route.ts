import { NextResponse, type NextRequest } from "next/server";
import { profileFor, type LoopPoint } from "@/lib/loops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORS = "https://api.openrouteservice.org/v2/directions";
/** The routing service refuses round trips longer than this. */
export const MAX_LOOP_KM = 100;
export const hasRouter = () => Boolean(process.env.ORS_API_KEY);

type Body = { lat?: number; lng?: number; km?: number; discipline?: string; seed?: number };
type Attempt = { coords: LoopPoint[]; distance_m: number; ascent_m: number; descent_m: number };

type OrsResponse = {
  features?: { geometry?: { coordinates?: LoopPoint[] }; properties?: { summary?: { distance?: number }; ascent?: number; descent?: number } }[];
};

/** Build a round trip on real roads from a start point, via OpenRouteService. */
export async function POST(req: NextRequest) {
  const key = process.env.ORS_API_KEY;
  if (!key) return NextResponse.json({ error: "Route building isn’t switched on yet." }, { status: 503 });

  const { lat, lng, km = 40, discipline = "road", seed = 1 } = (await req.json().catch(() => ({}))) as Body;
  if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "That start point doesn’t look right." }, { status: 400 });
  }
  // OpenRouteService caps round-trip queries at 100 km. Asking for more is refused, so
  // clamp here rather than letting the rider hit an error they can't act on.
  const wanted = Math.round(Math.max(10, Math.min(MAX_LOOP_KM, km)) * 1000);
  const profile = profileFor(discipline);

  /** One call to the router. Returns the loop, or an error message to show the rider. */
  const ask = async (length: number): Promise<{ ok: Attempt } | { err: string }> => {
    const points = Math.max(3, Math.min(10, Math.round(length / 12000)));
    let res: Response;
    try {
      res = await fetch(`${ORS}/${profile}/geojson`, {
        method: "POST",
        headers: { Authorization: key, "Content-Type": "application/json", Accept: "application/geo+json" },
        body: JSON.stringify({
          coordinates: [[lng, lat]],
          elevation: true,
          instructions: false,
          options: { round_trip: { length: Math.round(length), points, seed: Math.round(seed) } },
        }),
        signal: AbortSignal.timeout(25000),
      });
    } catch {
      return { err: "The route service didn’t answer. Try again in a moment." };
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("ORS", res.status, detail.slice(0, 400));

      // Read what the service actually said before falling back to the status code — it
      // answers 403 both for a bad key and for a request beyond its limits, and telling a
      // rider their key is wrong when the loop was simply too long helps nobody.
      let message = "The route service couldn’t build a loop from there.";
      if (/2010|Could not find routable point|point.*not found|unable to find/i.test(detail)) {
        message = "No rideable roads found near that start point. Try dropping the pin closer to town, or a different discipline.";
      } else if (/2004|exceed|too (long|large)|maximum|limit/i.test(detail)) {
        message = `That's beyond what the route service will plan in one loop — ${MAX_LOOP_KM} km is the ceiling. Try shorter.`;
      } else if (/quota|rate limit|too many/i.test(detail) || res.status === 429) {
        message = "The route service is rate-limiting us right now. Give it a minute and try again.";
      } else if (res.status === 401 || /api\s*key|unauthori[sz]ed|invalid.*key/i.test(detail)) {
        message = "Route building is misconfigured — the API key was rejected.";
      } else if (res.status === 403) {
        message = "The route service refused that request. It may be past its daily limit — try again later.";
      }
      return { err: message };
    }
    const data = (await res.json().catch(() => null)) as OrsResponse | null;
    const f = data?.features?.[0];
    const coords = f?.geometry?.coordinates;
    if (!coords || coords.length < 10) return { err: "The route service returned an empty loop. Try a different distance." };
    return {
      ok: {
        coords,
        distance_m: Math.round(f?.properties?.summary?.distance ?? 0),
        ascent_m: Math.round(f?.properties?.ascent ?? 0),
        descent_m: Math.round(f?.properties?.descent ?? 0),
      },
    };
  };

  // The router treats `length` as a loose suggestion and often overshoots badly on hilly terrain.
  // Ask again with a corrected length until the loop is close enough, and keep whichever attempt landed nearest.
  const tolerance = 0.15;
  let request = wanted;
  let best: Attempt | null = null;
  for (let i = 0; i < 3; i++) {
    const r = await ask(request);
    if ("err" in r) {
      if (best) break; // we already have something usable — show it rather than the error
      return NextResponse.json({ error: r.err }, { status: 502 });
    }
    const got = r.ok;
    if (!best || Math.abs(got.distance_m - wanted) < Math.abs(best.distance_m - wanted)) best = got;
    const ratio = got.distance_m / wanted;
    if (Math.abs(ratio - 1) <= tolerance) break;
    // Scale the ask by how far off we were, clamped so one wild result can't send the next attempt somewhere silly.
    request = Math.max(5000, Math.min(MAX_LOOP_KM * 1000, request / Math.max(0.4, Math.min(2.5, ratio))));
  }

  if (!best) return NextResponse.json({ error: "The route service couldn’t build a loop from there." }, { status: 502 });
  return NextResponse.json({ ...best, requested_m: wanted });
}
