import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/* robots.txt.

   The site had none, which is not fatal — absent robots.txt means "crawl everything" — but it
   also meant no sitemap reference, and crawlers were free to spend their budget on account
   pages and API routes that will never rank.

   Disallow is not a privacy control: it keeps well-behaved crawlers out of pages that waste
   their time, nothing more. Anything that actually needs protecting is behind auth and
   row-level security, and /admin additionally carries a noindex tag.
*/

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",          // no crawlable content, and some routes are side-effectful
          "/admin",         // operational surface; also noindex
          "/account",       // personal
          "/saved",         // personal
          "/partners/dashboard",
          "/partners/claim",
          "/join",
          "/login",
          "/auth/",
          "/subscribed",    // one-time confirmation landings, carried by token
          "/unsubscribed",
          "/thanks",
          "/membership/thanks",
          "/offline",       // service-worker fallback, meaningless to a crawler
          "/*?strava=",     // OAuth outcome flags — same page, different query
        ],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
