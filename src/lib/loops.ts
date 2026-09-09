/* Loop routes — real roads and paths from OpenRouteService, turned into a rideable loop and a GPX file.
   Nothing here is invented: if the router can't build a loop we say so rather than drawing a squiggle. */

export type LoopPoint = [number, number, number?]; // lng, lat, elevation (m)
export type LoopResult = {
  coords: LoopPoint[];
  distance_m: number;
  ascent_m: number;
  descent_m: number;
  /** What the rider asked for, when the router couldn't land on it. */
  requested_m?: number;
};

export const LOOP_DISCIPLINES = [
  { id: "road", label: "Road", profile: "cycling-road" },
  { id: "gravel", label: "Gravel & backroads", profile: "cycling-regular" },
  { id: "mtb", label: "MTB & trails", profile: "cycling-mountain" },
  { id: "ebike", label: "E-bike", profile: "cycling-electric" },
];
export const profileFor = (d: string) => LOOP_DISCIPLINES.find((x) => x.id === d)?.profile || "cycling-regular";

export const km = (m: number) => `${(m / 1000).toFixed(1)} km`;
export const metres = (m: number) => `${Math.round(m).toLocaleString()} m`;

/* Ride time.

   The old model charged half an hour for every 500 m of climbing on top of a rolling-terrain
   average speed, which double-counted the hills and produced badly pessimistic numbers — a
   50 km loop with 1,200 m came out at four and a half hours, nearly twice what it takes.

   The model now: distance at your own average speed, plus a smaller correction for climbing.
   The correction is ~30 minutes per 1,000 m, which is what's left once you accept that the
   descents on the other side of those climbs give most of the time back. Sanity checks —
   Peaks Challenge (235 km / 4,000 m) lands near 11½ hours, and a flat 50 km at 25 km/h is
   two hours flat, both about right.

   Every rider is different, which is why the speed is theirs to set rather than ours to
   guess. These are averages including stops-you-don't-take, not race pace. */

/** Typical moving average by discipline, km/h. The starting point, not the answer. */
export const DEFAULT_SPEED: Record<string, number> = { road: 25, gravel: 20, mtb: 14, ebike: 24 };
export const SPEED_MIN = 8;
export const SPEED_MAX = 40;
/** Hours added per metre climbed, after descents are taken into account. */
const CLIMB_HOURS_PER_M = 1 / 2000;

export function defaultSpeed(discipline: string): number {
  return DEFAULT_SPEED[discipline] ?? 21;
}

export function estimateHours(distance_m: number, ascent_m: number, discipline: string, speedKmh?: number): number {
  const speed = Math.max(SPEED_MIN, Math.min(SPEED_MAX, speedKmh || defaultSpeed(discipline)));
  return distance_m / 1000 / speed + ascent_m * CLIMB_HOURS_PER_M;
}

/** The average speed this ride works out at, once climbing is counted. What a computer shows. */
export function impliedSpeed(distance_m: number, hours: number): number {
  return hours > 0 ? distance_m / 1000 / hours : 0;
}
export function prettyHours(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return hh ? `${hh}h ${String(mm).padStart(2, "0")}m` : `${mm}m`;
}

/** How hard the loop is, from its own numbers. */
export function loopGrade(distance_m: number, ascent_m: number): { label: string; color: string } {
  const d = ascent_m + (distance_m / 1000) * 5;
  if (d < 400) return { label: "Easy", color: "#177245" };
  if (d < 1000) return { label: "Moderate", color: "#0a6a86" };
  if (d < 2200) return { label: "Hard", color: "#E2872A" };
  return { label: "Epic", color: "#FD3D35" };
}

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** GPX 1.1 track — opens in Garmin Connect, Wahoo, Komoot, Strava, Ride with GPS. */
export function toGpx(name: string, coords: LoopPoint[], townName: string): string {
  const pts = coords
    .map(([lng, lat, ele]) => `      <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}">${ele != null ? `<ele>${Math.round(ele)}</ele>` : ""}</trkpt>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Cycletowns" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(name)}</name>
    <desc>A loop from ${esc(townName)}, built on cycletowns.com. Routing data © OpenRouteService, map data © OpenStreetMap contributors.</desc>
  </metadata>
  <trk>
    <name>${esc(name)}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>
`;
}

/** Points for a small elevation profile, normalised to a 0–100 box. */
export function elevationPath(coords: LoopPoint[], width = 600, height = 90): { d: string; min: number; max: number } | null {
  const eles = coords.map((c) => c[2]).filter((e): e is number => typeof e === "number");
  if (eles.length < 4) return null;
  const min = Math.min(...eles);
  const max = Math.max(...eles);
  const span = Math.max(1, max - min);
  const step = Math.max(1, Math.floor(eles.length / width));
  const pts: string[] = [];
  for (let i = 0; i < eles.length; i += step) {
    const x = (i / (eles.length - 1)) * width;
    const y = height - ((eles[i] - min) / span) * height;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return { d: `M0,${height} L${pts.join(" L")} L${width},${height} Z`, min, max };
}
