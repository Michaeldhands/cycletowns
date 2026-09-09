/* Ride verification through Strava.

   What this does: asks Strava whether the signed-in rider has an activity that started near the
   town they are reviewing, around the time they say they were there. If one exists, we stamp the
   review as ride-verified.

   What this deliberately does NOT do: store activity streams, GPS tracks, titles, distances,
   times, or anything else about the ride. The coordinates are compared in memory and thrown
   away; the only things kept are a boolean-ish timestamp and the activity id that satisfied the
   check, and the id is deleted the moment the rider disconnects. If we ever want to show ride
   details we would have to ask for that separately — see RUNBOOK.md.

   Strava requires a "Powered by Strava" credit wherever their data is used; that lives in
   VerifyRide.tsx and on /how-rankings-work.
*/

export const STRAVA_AUTH = "https://www.strava.com/oauth/authorize";
export const STRAVA_TOKEN = "https://www.strava.com/oauth/token";
export const STRAVA_API = "https://www.strava.com/api/v3";

/** How close to the town centre a ride has to start to count. Generous: riders stay out of town. */
export const VERIFY_RADIUS_KM = 30;
/** How far either side of the stated visit date we look. */
export const VERIFY_WINDOW_DAYS = 14;

export const hasStrava = () => Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);

export type StravaTokens = { access_token: string; refresh_token: string; expires_at: number; athlete_id: number; scope?: string };

export function authorizeURL(redirectUri: string, state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    // activity:read is the narrowest scope that lists a rider's own activities. We never ask
    // for write, and never for activity:read_all — private activities stay private.
    scope: "read,activity:read",
    state,
  });
  return `${STRAVA_AUTH}?${p}`;
}

type TokenResponse = { access_token: string; refresh_token: string; expires_at: number; scope?: string; athlete?: { id: number } };

async function tokenCall(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(STRAVA_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET, ...body }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`strava token ${res.status} ${(await res.text().catch(() => "")).slice(0, 200)}`);
  return (await res.json()) as TokenResponse;
}

export async function exchangeCode(code: string): Promise<StravaTokens> {
  const t = await tokenCall({ code, grant_type: "authorization_code" });
  return { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at, athlete_id: t.athlete?.id ?? 0, scope: t.scope };
}

export async function refresh(refreshToken: string): Promise<Omit<StravaTokens, "athlete_id">> {
  const t = await tokenCall({ refresh_token: refreshToken, grant_type: "refresh_token" });
  return { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at, scope: t.scope };
}

/** Best-effort revoke. A rider who disconnects here should not stay connected there. */
export async function deauthorize(accessToken: string): Promise<void> {
  await fetch("https://www.strava.com/oauth/deauthorize", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
}

/** Kilometres between two points. */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type Activity = { id: number; type?: string; sport_type?: string; start_latlng?: [number, number] | null; start_date?: string };

const RIDE_TYPES = /^(Ride|VirtualRide|EBikeRide|GravelRide|MountainBikeRide|Handcycle|Velomobile)$/;

export type VerifyOutcome =
  | { ok: true; activityId: string }
  | { ok: false; reason: "no_match" | "rate_limited" | "no_location" | "error"; detail?: string };

/**
 * Look for a ride starting within VERIFY_RADIUS_KM of the town, inside the window.
 * Returns only the id of the first match — nothing else about the activity is returned,
 * so nothing else can accidentally be stored by a caller.
 */
export async function findRideNear(
  accessToken: string,
  town: { lat: number; lng: number },
  visitedOn: string | null,
): Promise<VerifyOutcome> {
  const centre = new Date(visitedOn ? `${visitedOn}T12:00:00Z` : Date.now());
  if (Number.isNaN(centre.getTime())) return { ok: false, reason: "error", detail: "bad date" };

  const day = 86400;
  // With a stated date we look either side of it. Without one we sweep the last two years,
  // because "I rode there" with no date is still a claim worth checking.
  const after = visitedOn ? Math.floor(centre.getTime() / 1000) - VERIFY_WINDOW_DAYS * day : Math.floor(Date.now() / 1000) - 730 * day;
  const before = visitedOn ? Math.floor(centre.getTime() / 1000) + VERIFY_WINDOW_DAYS * day : Math.floor(Date.now() / 1000);

  let sawLocation = false;
  for (let page = 1; page <= 5; page++) {
    const url = `${STRAVA_API}/athlete/activities?after=${after}&before=${before}&per_page=200&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(15000) });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: "error", detail: `${res.status}` };

    const list = (await res.json()) as Activity[];
    if (!Array.isArray(list) || list.length === 0) break;

    for (const a of list) {
      const kind = a.sport_type || a.type || "";
      if (!RIDE_TYPES.test(kind)) continue;
      const ll = a.start_latlng;
      if (!ll || ll.length !== 2) continue;
      sawLocation = true;
      if (km({ lat: ll[0], lng: ll[1] }, town) <= VERIFY_RADIUS_KM) return { ok: true, activityId: String(a.id) };
    }
    if (list.length < 200) break;
  }
  return { ok: false, reason: sawLocation ? "no_match" : "no_location" };
}
