/* The canonical address of this site.

   Do not derive an outbound URL from the incoming request. Behind Netlify, `req.url` and
   `req.nextUrl.origin` resolve to the deploy-specific host —

     https://6aa1dd7ed1311c0008967a27--cycletowns-site.netlify.app

   — which changes on every deploy. Anything built from it either fails outright (a third
   party rejecting an unregistered redirect URI) or, worse, quietly works: the rider is
   redirected onto a hostname that is not cycletowns.com, where the session cookies set for
   the real domain do not apply, so they arrive apparently signed out.

   The rule: request origin for links inside a page, siteUrl() for anything that leaves the
   server — redirects, OAuth callbacks, links in email.
*/

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cycletowns.com";

/** Canonical origin, no trailing slash. */
export const siteUrl = () => SITE_URL.replace(/\/+$/, "");

/** An absolute URL on this site from a path or a relative target. */
export const siteLink = (path: string) => new URL(path.startsWith("/") ? path : `/${path}`, siteUrl()).toString();
