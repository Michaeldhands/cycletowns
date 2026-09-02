# Cycletowns — build plan

The original MVP demo (`reference/demo.html`) is a single static HTML file with demo data.
This project turns it into a live product in phases. Design, copy and data are carried over from the demo;
anything the demo faked (rider counts, reviews, KOMs, partner logos, world news) is left out until it is real.

## Stack
- Next.js (App Router, TypeScript) — real URLs for every town, category and article, statically rendered for SEO.
- Netlify hosting + Netlify Forms (contact, partner enquiry and waitlists — no backend needed for phase 1).
- Supabase (phase 2): Postgres, auth (email + Google), storage for photos.
- Stripe (phase 3): rider membership and partner plans.
- Leaflet + OpenStreetMap for maps.

## Phase 1 — public site (this release)
Landing, all towns, town guides (`/towns/[slug]`), rankings + category rankings, news hub + articles,
about / how rankings work / careers / contact, partners page with real enquiry form, membership page,
and honest "coming soon + waitlist" pages for join / log in / plan / shop / creators.
Saved towns are kept in the browser until accounts exist.

## Phase 2 — accounts & community (Supabase)
Status: schema + seed in `supabase/` (run `supabase/setup.sql` once in the Supabase SQL editor; regenerate the
seed with `node scripts/build-seed-sql.js`). Auth (magic link + Google), rider profiles, saved towns synced to the
account, reviews with the score taking over from editorial at 5 reviews, points/tiers. Groups, feed, admin next.
Schema + seed from `src/data/*.json`; email/Google auth; onboarding; saved towns synced; rider reviews
(the five Cyclist Score dimensions) that take over from editorial launch scores; groups; feed; profiles; points;
admin area (towns, places, articles, users, partners) and dashboards on live data; venue geocoding for map pins.

## Phase 3 — revenue & content
Stripe membership; partner self-serve (claim listing, member/featured plans, offer codes, dashboards);
news CMS; shop (Stripe or Shopify); trip planner; loop builder; social wall via Instagram/TikTok APIs.

## Working notes
- `node scripts/extract-demo-data.js` regenerates `src/data/*.json` from the demo file.
- Images are hotlinked from Pexels/Wikimedia for now — move to Supabase storage in phase 2.
