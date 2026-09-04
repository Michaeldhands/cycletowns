/* Cycletowns service worker.
   Deliberately conservative: stale JavaScript chunks break a Next.js app far more
   often than a cold cache slows one down. So:
     · hashed build assets  → cache-first (their URL changes when they change)
     · public pages         → network-first, cache only as an offline fallback
     · anything personal or transactional → never cached at all
*/

const VERSION = "ct-v1";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const OFFLINE_URL = "/offline";

// Pages safe to keep for offline reading. Everything else falls through to the network.
const PUBLIC = [/^\/$/, /^\/towns(\/|$)/, /^\/loop(\/|$)/, /^\/plan(\/|$)/, /^\/news(\/|$)/, /^\/rankings(\/|$)/, /^\/about$/, /^\/how-rankings-work$/, /^\/offline$/];
// Never cached: sessions, money, admin, anything that writes.
const PRIVATE = [/^\/api\//, /^\/auth\//, /^\/account/, /^\/admin/, /^\/partners\/dashboard/, /^\/saved/, /^\/feed/, /^\/groups/, /^\/login/, /^\/join/, /^\/membership/];

const isPublicPage = (p) => !PRIVATE.some((r) => r.test(p)) && PUBLIC.some((r) => r.test(p));

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll([OFFLINE_URL])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Signing out wipes anything we kept, so a shared device never shows the last person's pages.
self.addEventListener("message", (e) => {
  if (e.data === "ct-clear-cache") e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // tiles, fonts and APIs handle themselves

  // Hashed build output and static files: safe to serve from cache first.
  if (url.pathname.startsWith("/_next/static/") || /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((hit) =>
        hit || fetch(request).then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(ASSETS).then((c) => c.put(request, copy)); }
          return res;
        }),
      ),
    );
    return;
  }

  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && isPublicPage(url.pathname)) {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(request)) || (await caches.match(OFFLINE_URL)) || Response.error()),
  );
});
