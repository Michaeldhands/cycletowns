import type { MetadataRoute } from "next";
import { loadCatalog, loadArticles, articleSlugOf } from "@/lib/content";
import { loadEvents } from "@/lib/events-data";
import { CAT_DEFS } from "@/lib/towns";
import { ALT_LOCALES, DEFAULT_LOCALE, HTML_LANG, LOCALES, localePath, isMultilingual } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

/* The sitemap.

   Until now the site had none, and no robots.txt either, so the only way Google could find a
   town guide was by crawling a link to it from a page it had already found. For a new domain
   with few inbound links that is slow and unreliable, and it is the first thing to check when
   Search Console reports pages "discovered but not indexed".

   Built from live content, so a town added in the admin appears here without anyone
   remembering to do anything. Locale alternates are emitted automatically once a second
   locale exists — see @/lib/i18n.
*/

type Entry = MetadataRoute.Sitemap[number];

/** Static routes worth indexing, with a rough sense of how often each changes. */
const STATIC: [path: string, changeFrequency: Entry["changeFrequency"], priority: number][] = [
  ["/", "daily", 1.0],
  ["/towns", "weekly", 0.9],
  ["/rankings", "daily", 0.9],
  ["/events", "weekly", 0.8],
  ["/news", "weekly", 0.7],
  ["/loop", "monthly", 0.7],
  ["/plan", "monthly", 0.7],
  ["/how-rankings-work", "monthly", 0.6],
  ["/membership", "monthly", 0.6],
  ["/partners", "monthly", 0.6],
  ["/about", "monthly", 0.5],
  ["/offers", "weekly", 0.4],
  ["/creators", "monthly", 0.3],
  ["/careers", "monthly", 0.3],
  ["/contact", "yearly", 0.3],
  ["/image-credits", "monthly", 0.2],
  ["/privacy", "yearly", 0.2],
  ["/terms", "yearly", 0.2],
];

/** hreflang alternates for one path — omitted entirely while English is the only locale. */
function alts(path: string): Entry["alternates"] {
  if (!isMultilingual()) return undefined;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HTML_LANG[l]] = `${siteUrl()}${localePath(path, l)}`;
  return { languages };
}

const entry = (path: string, changeFrequency: Entry["changeFrequency"], priority: number, lastModified?: Date): Entry => ({
  url: `${siteUrl()}${localePath(path, DEFAULT_LOCALE)}`,
  lastModified: lastModified ?? new Date(),
  changeFrequency,
  priority,
  ...(alts(path) ? { alternates: alts(path) } : {}),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [c, articles, events] = await Promise.all([loadCatalog(), loadArticles(), loadEvents()]);

  const out: MetadataRoute.Sitemap = STATIC.map(([p, f, pr]) => entry(p, f, pr));

  // Full guides rank; radar towns are thin pages, so they are listed but weighted low.
  for (const t of c.towns) out.push(entry(`/towns/${t.id}`, "weekly", 0.8));
  for (const t of c.lite) out.push(entry(`/towns/${t.slug}`, "monthly", 0.3));

  for (const cat of CAT_DEFS) out.push(entry(`/rankings/${cat.id}`, "weekly", 0.6));

  for (const e of events) {
    const last = e.verified ? new Date(e.verified) : undefined;
    out.push(entry(`/events/${e.slug}`, "monthly", 0.6, last));
  }

  for (const a of articles) out.push(entry(`/news/${articleSlugOf(a)}`, "monthly", 0.5));

  return out;
}

// Anything that needs a signed-in session, holds someone's data, or is an operational
// surface is left out on purpose — see robots.ts, which disallows the same set.
export const EXCLUDED_FROM_SITEMAP = [
  "/admin", "/account", "/saved", "/feed", "/groups", "/join", "/login",
  "/subscribed", "/unsubscribed", "/thanks", "/offline", "/shop",
  "/partners/claim", "/partners/dashboard", "/membership/thanks",
] as const;
void ALT_LOCALES;
