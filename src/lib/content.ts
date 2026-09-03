/* Town, place, race and article content — read from the database, with the bundled launch data as a fallback
   so the site still builds and renders if Supabase is unreachable. */
import { hasSupabase, supabasePublic } from "@/lib/supabase/server";
import { LITE_TOWNS, RACES, TOWNS, TOWN_GEO, TOWN_SEEDO, TOWN_WHEN, slugify, type LiteTown, type Race, type SeeDo, type Town, type WhenInfo } from "@/lib/towns";
import { ARTICLES, type Article } from "@/lib/news";

export type TownRow = {
  id: string; name: string; region: string; country: string; flag: string; currency: string; status: "full" | "radar" | "hidden";
  editorial_score: number | null; editorial_dims: Town["scoreDims"] | null; photo: string | null; gallery: string[]; tags: string[]; personas: string[];
  blurb: string; lat: number | null; lng: number | null; when_info: WhenInfo | null; see_do: SeeDo[] | null;
};
export type PlaceRow = {
  id: string; town_id: string; kind: "cafe" | "shop" | "route" | "stay" | "thing"; name: string; note: string; editorial_rating: number | null;
  hire: boolean; price: number | null; discipline: string | null; km: number | null; vert: number | null; lat: number | null; lng: number | null; sort: number;
};
export type RaceRow = { id: string; town_id: string; kind: Race["kind"]; badge: string; name: string; series: string | null; km: number | null; vert: number | null; race_date: string | null; status: string | null; discipline: string | null; note: string | null; sort: number };
export type ArticleRow = { id: string; slug: string; title: string; dek: string; body: string; kind: string | null; series: string | null; episode: number | null; town_id: string | null; image_kind: string; image_url: string | null; published: boolean; published_at: string | null; created_at: string };

const toPlace = (p: PlaceRow) => ({ n: p.name, s: Number(p.editorial_rating ?? 0), note: p.note, hire: p.hire, price: p.price ?? undefined, km: p.km ?? undefined, vert: p.vert ?? undefined });

/** Convert a DB town + its places into the Town shape the components use. */
export function rowToTown(t: TownRow, places: PlaceRow[]): Town {
  const mine = places.filter((p) => p.town_id === t.id).sort((a, b) => a.sort - b.sort);
  return {
    id: t.id, name: t.name, region: t.region, country: t.country, flag: t.flag, cur: t.currency || "$",
    score: Number(t.editorial_score ?? 4), photo: t.photo ?? undefined, gallery: t.gallery || [], tags: t.tags || [], personas: t.personas || [],
    blurb: t.blurb || "", scoreDims: t.editorial_dims || { cafes: 4, routes: 4, safety: 4, climbs: 4, storage: 4 },
    cafes: mine.filter((p) => p.kind === "cafe").map(toPlace),
    shops: mine.filter((p) => p.kind === "shop").map(toPlace),
    routes: mine.filter((p) => p.kind === "route").map(toPlace),
    book: mine.filter((p) => p.kind === "stay").map((p) => ({ type: "Stay", name: p.name, price: Number(p.price ?? 0) })),
  };
}

export type Catalog = {
  towns: Town[];                       // full guides, DB order
  lite: LiteTown[];                    // radar towns
  geo: Record<string, { lat: number; lng: number }>;
  when: Record<string, WhenInfo>;
  seeDo: Record<string, SeeDo[]>;
  races: Record<string, Race[]>;
  source: "db" | "bundled";
};

const bundled = (): Catalog => ({ towns: TOWNS, lite: LITE_TOWNS, geo: TOWN_GEO, when: TOWN_WHEN, seeDo: TOWN_SEEDO, races: RACES, source: "bundled" });

/** Everything needed to render town lists and guides. One query set per request; pages cache via `revalidate`. */
export async function loadCatalog(): Promise<Catalog> {
  if (!hasSupabase()) return bundled();
  const sb = supabasePublic();
  const [{ data: towns }, { data: places }, { data: races }] = await Promise.all([
    sb.from("towns").select("*").neq("status", "hidden").order("editorial_score", { ascending: false }),
    sb.from("places").select("*"),
    sb.from("races").select("*").order("sort"),
  ]);
  if (!towns || !towns.length) return bundled();
  const rows = towns as TownRow[];
  const full = rows.filter((t) => t.status === "full");
  const geo: Catalog["geo"] = {}, when: Catalog["when"] = {}, seeDo: Catalog["seeDo"] = {}, rc: Catalog["races"] = {};
  full.forEach((t) => {
    if (t.lat != null && t.lng != null) geo[t.id] = { lat: t.lat, lng: t.lng };
    if (t.when_info) when[t.id] = t.when_info;
    if (t.see_do) seeDo[t.id] = t.see_do;
  });
  ((races as RaceRow[]) || []).forEach((r) => {
    (rc[r.town_id] ||= []).push({ kind: r.kind, badge: r.badge, name: r.name, series: r.series ?? undefined, km: Number(r.km ?? 0), vert: Number(r.vert ?? 0), date: r.race_date ?? undefined, status: r.status ?? undefined, disc: r.discipline ?? undefined, note: r.note ?? undefined });
  });
  return {
    towns: full.map((t) => rowToTown(t, (places as PlaceRow[]) || [])),
    lite: rows.filter((t) => t.status === "radar").map((t) => ({ slug: t.id, name: t.name, region: t.region, country: t.country, flag: t.flag })),
    geo, when, seeDo, races: rc, source: "db",
  };
}

export const rankTowns = (c: Catalog) => c.towns.slice().sort((a, b) => b.score - a.score);
export const rankIn = (c: Catalog, id: string) => rankTowns(c).findIndex((t) => t.id === id) + 1;

/* ---------- articles ---------- */
const bundledArticles = (): Article[] => ARTICLES;
export function rowToArticle(a: ArticleRow): Article & { id: string; published: boolean; image_url?: string | null } {
  return { id: a.id, title: a.title, dek: a.dek, body: a.body, kind: a.kind ?? undefined, series: a.series ?? undefined, ep: a.episode ?? undefined, town: a.town_id ?? undefined, img: a.image_kind || "road", published: a.published, image_url: a.image_url };
}
export async function loadArticles(): Promise<Article[]> {
  if (!hasSupabase()) return bundledArticles();
  const { data } = await supabasePublic().from("articles").select("*").eq("published", true).order("published_at", { ascending: false });
  if (!data || !data.length) return bundledArticles();
  return (data as ArticleRow[]).map(rowToArticle);
}
export const articleSlugOf = (a: Article) => slugify(a.title);
