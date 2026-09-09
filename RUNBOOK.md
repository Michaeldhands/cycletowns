# Cycletowns — operations runbook

Everything needed to keep cycletowns.com running, or to hand it to somebody else.
If you are reading this because something is broken, skip to **[Incidents](#incidents)**.

Operated by Sport2040 (ABN 73 680 648 855), Level 15, 461 Bourke Street, Melbourne VIC 3000.
Last reviewed: September 2026.

---

## 1. What it's made of

| Layer | Service | What it does | If it dies |
|---|---|---|---|
| Hosting | **Netlify** — project `cycletowns-site` | Serves the site, runs server code as functions, handles form submissions | Site is down |
| Code | **GitHub** — `Michaeldhands/cycletowns` | Source of truth. Push to `main` → Netlify builds and deploys | Can't deploy; site keeps running |
| Database + auth | **Supabase** — project ref `rynvynsnidkndyamjkzx` | Riders, partners, reviews, towns, trips, loops; sign-in | Site loads, but nothing personalised works |
| Payments | **Stripe** (live mode) | Membership checkout, billing portal, webhooks | Nobody can join or manage membership |
| Email | **Resend** | Sign-in links and account email | Nobody can sign in by email (Google still works) |
| Routing | **OpenRouteService** | Builds loops on real roads | Loop builder shows an honest error; rest of site fine |
| Maps | **OpenStreetMap** tiles via Leaflet | Draws maps | Maps blank; routes still download as GPX |
| DNS | **VentraIP** | cycletowns.com → Netlify | Site unreachable by name |

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Leaflet.

---

## 2. Accounts and credentials

Every one of these must live in the password manager, and a second trusted person must
have emergency access. **This is the single biggest operational risk in the project:**
today, most of it is reachable only from one Google account.

| Account | Notes |
|---|---|
| GitHub | Code. Push access = deploy access. |
| Netlify | Login `backstagewithdj@gmail.com`. Holds every production secret. |
| Supabase | All rider and partner data. |
| Stripe | Live payments. Treat as financial-grade. |
| Google Cloud | OAuth client for "Sign in with Google". |
| Resend | Sending domain for cycletowns.com. |
| OpenRouteService | Free routing API key. |
| VentraIP | DNS. Losing this loses the domain. |
| Strava | API application for ride verification. |

**Never** paste a secret into chat, a ticket, or a commit. They belong in Netlify's
environment variables and the password manager, nowhere else.

### Environment variables (Netlify → Site configuration → Environment variables)

| Variable | Secret? | Scope | Where it comes from |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | no | All | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | All | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | Functions | Supabase → Settings → API. Bypasses all access rules — webhook use only |
| `STRIPE_SECRET_KEY` | **yes** | Functions | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | **yes** | Functions | Stripe → the webhook destination → signing secret |
| `ORS_API_KEY` | **yes** | Functions | openrouteservice.org account. Same key works on the new host |
| `ORS_BASE_URL` | no | All | Optional override. Only set it if HeiGIT move the endpoint again |
| `NEXT_PUBLIC_SITE_URL` | no | All | `https://cycletowns.com` |
| `STRAVA_CLIENT_ID` | no | All | Strava → Settings → My API Application |
| `STRAVA_CLIENT_SECRET` | **yes** | Functions | Same page. Without both, ride verification hides itself and reviews still publish |
| `ATTIO_API_KEY` | **yes** | Functions | Attio → Settings → Developers. Optional; without it enquiries still save |

Two traps, both of which have bitten us:

- A variable flagged "Contains secret values" **cannot** be given "All scopes" — tick
  **Functions**. Without it the running site cannot read the value and features silently
  switch off.
- Netlify only picks up variable changes **on a new build**. After editing one, always
  trigger a deploy.

### Setting up ride verification (Strava)

All of this happens inside Strava, on the Cycletowns Strava account — nothing here touches
Netlify until step 4.

1. Log in to Strava → **strava.com/settings/api** (Settings → My API Application). Create one
   if it doesn't exist. Strava's own docs say creating an application requires a Strava
   subscription; confirm on the page before assuming otherwise.
2. Fill in Application Name (`Cycletowns`), Category, Website (`https://cycletowns.com`),
   description and icon. The description and icon are what a rider sees on the "allow
   Cycletowns to…" screen, so write them properly.
3. **Authorization Callback Domain** must be exactly `cycletowns.com` — no scheme, no path,
   no `www`. Strava rejects the sign-in silently if this is wrong, and it is the single most
   common reason the connect button appears to do nothing.
4. Copy **Client ID** and **Client Secret** from that page into Netlify as above, then
   **trigger a deploy**. Ignore the Access Token and Refresh Token also shown there — those
   authorise the owner's own account for testing and the site does not use them.
5. Check `/api/health` — `optional.ride_verification` should be `true`.
6. Sign in on the live site, go to **Account → Ride verification**, connect, then verify a
   review on a town you've actually ridden.

**The athlete cap — plan around this.** A new Strava application starts in effectively
single-player mode: only the account that owns it can authorise it. From the settings page
you can raise it to **10 connected athletes**. Beyond 10 you must **submit the app to Strava
for review**, and that approval is not instant.

So the rollout has three stages, and it is worth starting the review application well before
you need it:

| Stage | Who can verify | What to do |
|---|---|---|
| Fresh app | Michael only | Enough to prove it works end to end |
| Raised in settings | 10 riders | Enough for a friends-and-family test |
| After Strava's review | Everyone | Apply from the API settings page |

A rider who tries to connect past the cap gets a **403 "limit of connected athletes
exceeded"** from Strava. The site treats that as a failed connection and the rider's review
still publishes and still counts — but the message they see won't explain the real cause, so
if testers report the connect button failing, check the cap first.

**Rate limits.** Strava's default is roughly 100 requests per 15 minutes and 1,000 per day.
Each verification attempt is 1–5 requests. If riders ever hit that, the site returns "Strava
is rate-limiting us right now" and nothing breaks — but it's the number to watch if
verification ever gets popular. Note the daily limit and the athlete cap are separate things
and are raised separately.

**What we store, and why it's kept small.** `strava_accounts` holds OAuth tokens and is
reachable only with the service-role key — row-level security is on with *no policies*, so
no signed-in user can read it, only the server. Against a review we keep `verified_at` and
the id of the activity that satisfied the check. We never store GPS tracks, routes, times,
titles or distances: the coordinates are compared in memory and discarded. When a rider
disconnects we revoke at Strava and delete both the tokens and the stored activity ids.

If Strava ever objects to the integration, removing `STRAVA_CLIENT_ID` and
`STRAVA_CLIENT_SECRET` from Netlify and redeploying turns the whole feature off cleanly —
existing reviews stay published, they just stop being weighted as verified.

---

## 3. Deploying

Normal path: commit to `main` and push (GitHub Desktop → *Push origin*). Netlify builds
and deploys automatically, usually in two to four minutes.

```bash
npm install       # first time
npm run dev       # local development at localhost:3000
npx next build    # must pass before pushing
npx eslint src    # must be free of errors
```

**Rolling back:** Netlify → Deploys → pick the last good deploy → **Publish deploy**.
Instant, and does not need a git revert. Do this first in an incident; fix the code after.

**If a local build fails with `ENOTEMPTY` or `EPERM`:** delete the `.next` folder and
build again. macOS file-sync leaves duplicate directories inside it (`app 2`, `chunks 3`).

---

## 4. The database

Six migrations in `supabase/migrations/`, applied in order through the Supabase SQL editor:

| File | Adds |
|---|---|
| `0001_schema.sql` | Core tables, row-level security, `town_scores`, `award_points()` |
| `0002_storage.sql` | `media` storage bucket and its policies |
| `0003_membership.sql` | Stripe columns on profiles, double points for Insiders, `offers` |
| `0004_partners.sql` | Partner claims, field protection, `verified_places` |
| `0005_trips.sql` | Saved trip plans |
| `0006_loops.sql` | Saved loop routes |

Fifteen tables: `towns, places, races, articles, profiles, saved_towns, reviews, groups,
group_members, posts, point_events, partners, offers, trips, loops`.

**Row-level security is on for every table that holds user data.** Riders can only read
and write their own rows. Admin rights come from `is_admin()`, a `security definer`
function reading `profiles.is_admin` — which riders cannot set on themselves, because a
trigger blocks changes to protected fields.

**Making someone an admin:** Supabase → Table Editor → `profiles` → tick `is_admin`.
Do it in the Table Editor, not with SQL — a `WHERE email = …` that matches nothing still
reports "Success", which has wasted an afternoon before.

### Backups

- **Daily**, kept 7 days — Supabase Pro, automatic. Restore from Database → Backups.
- **Weekly off-site**, kept 90 days — GitHub Actions (`.github/workflows/backup.yml`),
  Sundays 15:00 UTC. Needs the `SUPABASE_DB_URL` repository secret. Run it by hand from
  the Actions tab before any risky migration.

**Restoring from the off-site dump:**

```bash
# download the artifact from the Actions run, then:
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "$SUPABASE_DB_URL" cycletowns-YYYY-MM-DD.dump
```

Test this on a scratch Supabase project at least once a year. A backup nobody has
restored is a hope, not a backup.

---

## 5. Monitoring

- `https://cycletowns.com/api/health` — returns **200** only when the database, Stripe
  and the routing service all answer and the required secrets are present. **503** names
  the failing one. Check this first in any incident.
- **UptimeRobot** — checks the health endpoint and the homepage every 5 minutes, alerts
  by email and SMS.
- **Sentry** — server and browser errors.
- **Netlify → Logs → Functions** — live server logs. Where webhook and API failures show up.

---

## 6. Incidents

**Always, first:** open `/api/health`. It usually names the problem in one line.

| Symptom | Almost always | Fix |
|---|---|---|
| Whole site down | Bad deploy | Netlify → Deploys → publish the last good one |
| "Payments aren't switched on yet" | `STRIPE_SECRET_KEY` missing, wrong scope, or no deploy since it was added | Set it, scope **Functions**, redeploy |
| Someone paid but isn't an Insider | Webhook not delivering | Stripe → the webhook destination → check recent deliveries for non-200s; confirm `STRIPE_WEBHOOK_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are set |
| Sign-in link fails | Resend SMTP misconfigured, or Supabase redirect URLs wrong | Supabase → Auth → URL Configuration must allow `https://cycletowns.com/**`. Turning custom SMTP off restores logins immediately |
| "Unable to exchange external code" | Google client secret wrong in Supabase | Re-copy the secret from Google Cloud; regenerate it if it won't reveal |
| Loop builder errors | ORS key or quota | `/api/health` says `routing` down. Free tier is 2,000 requests/day |
| Forms silently fail (404 on submit) | Netlify form detection off | Site configuration → Forms → enable detection, then redeploy |
| Maps blank | OpenStreetMap tiles | Nothing to do but wait; GPX downloads still work |

**If rider data is lost or exposed:** stop writes, restore from the most recent backup,
work out what was affected and when. Australian law requires notifying affected people
and the OAIC for an eligible data breach. Do not wait to be certain before starting the
clock — get advice the same day.

---

## 7. Routine maintenance

**Weekly** — glance at Sentry and UptimeRobot; check the backup workflow ran.
**Monthly** — `npm audit`, Supabase security advisors, Stripe for failed payments.
**Quarterly** — restore a backup to a scratch project; review who has access to what;
check the ORS free-tier quota is still enough.
**Yearly** — review the privacy policy and terms against what the site actually does now.

---

## 8. If Michael is unavailable

Everything needed is in this file plus the password manager. In order:

1. Get access to the password manager through its emergency-access contact.
2. Confirm the site is up (`/api/health`) and that billing on Netlify, Supabase and
   Stripe is current — an expired card takes the site down more often than a bug does.
3. Anyone comfortable with Next.js can clone the repo, `npm install`, and deploy.
4. Rider and partner data is in Supabase, exportable at any time. It is not locked to
   any vendor here.
