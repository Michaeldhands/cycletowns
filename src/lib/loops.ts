/* Loop routes — real roads and paths from OpenRouteService, turned into a rideable loop and a GPX file.
   Nothing here is invented: if the router can't build a loop we say so rather than drawing a squiggle. */

export type LoopPoint = [number, number, number?]; // lng, lat, elevation (m)
export type LoopResult = {
  coords: LoopPoint[];
  distance_m: number;
  ascent_m: number;
  descent_m: number;
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

/** Rough ride time: flat-ish speeds by discipline, plus a penalty for climbing. */
export function estimateHours(distance_m: number, ascent_m: number, discipline: string): number {
  const base: Record<string, number> = { road: 25, gravel: 20, mtb: 14, ebike: 24 };
  const speed = base[discipline] ?? 21;
  const flat = distance_m / 1000 / speed;
  const climbing = ascent_m / 500; // ~30 min per 500 m of climbing
  return flat + climbing;
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
