import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* What is actually in the database, versus what the code says.

   Content seeded at setup is invisible to a code review: the fabricated "Cycletowns
   Originals" survived a full audit of the repo because loadArticles() reads the articles
   table first and only falls back to the bundled JSON, so the file that was reviewed was
   never the file being served. This endpoint exists so that blind spot can be checked.

   Admin only. It returns published CONTENT — towns, places, articles, events, offers,
   partners, banners — and, for anything involving people, counts only. No rider, subscriber
   or enquiry row is ever returned: those are not a content-honesty question and there is no
   reason to move them through here.
*/

/** Things that suggest demo-stage or invented content rather than something researched. */
const SUSPECT: [RegExp, string][] = [
  [/lorem ipsum/i, "placeholder text"],
  [/\b(TODO|TBD|FIXME|XXX)\b/, "unfinished marker"],
  [/illustrative|for the demo|demo only|sample data|placeholder/i, "demo-stage wording"],
  [/coming (friday|monday|next week|soon)|new this week|next week/i, "stale relative date"],
  [/our (correspondent|reporter|photographer)|correspondent ·/i, "claimed correspondent"],
  [/launch film|our film|documentary/i, "claimed video that may not exist"],
  [/\bexample\.(com|org)\b|test@|@test\./i, "placeholder contact"],
  [/verified (cycletowns )?partner/i, "asserted commercial relationship"],
  [/\b\d+(\.\d+)?%\s*(uplift|increase|conversion|more|lift)/i, "performance claim"],
  [/est\.\s*A?\$|\bA?\$\s?[\d,]+(k|m|\s?million)\b/i, "money figure"],
];

const flag = (v: unknown): string[] => {
  const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
  return SUSPECT.filter(([re]) => re.test(s)).map(([, why]) => why);
};

type Row = Record<string, unknown>;

/** Scan a table's text fields and report only what looks worth a human look. */
async function scan(table: string, fields: string[], label = table) {
  const db = supabaseAdmin();
  const { data, error, count } = await db.from(table).select("*", { count: "exact" }).limit(1000);
  if (error) return { table: label, error: error.message, rows: 0, flagged: [] };
  const rows = (data as Row[]) || [];
  const flagged = rows
    .map((r) => {
      const reasons = [...new Set(fields.flatMap((f) => flag(r[f])))];
      if (!reasons.length) return null;
      return {
        id: String(r.id ?? r.slug ?? r.town_id ?? "?"),
        name: String(r.title ?? r.name ?? r.slug ?? ""),
        reasons,
        sample: fields.map((f) => (typeof r[f] === "string" ? (r[f] as string).slice(0, 240) : "")).filter(Boolean)[0] || "",
      };
    })
    .filter(Boolean);
  return { table: label, rows: count ?? rows.length, flagged };
}

/** Rows that exist but nothing publishes — the ones a review would never look at. */
async function unpublished() {
  const db = supabaseAdmin();
  const [towns, articles, offers, partners] = await Promise.all([
    db.from("towns").select("id, name, status", { count: "exact" }).eq("status", "hidden"),
    db.from("articles").select("slug, title", { count: "exact" }).eq("published", false),
    db.from("offers").select("id, title", { count: "exact" }).eq("active", false),
    db.from("partners").select("id, business, status, plan", { count: "exact" }).neq("status", "active"),
  ]);
  return {
    hidden_towns: towns.data ?? [],
    unpublished_articles: articles.data ?? [],
    inactive_offers: offers.data ?? [],
    non_live_partners: partners.data ?? [],
  };
}

export async function GET() {
  const me = await currentUser();
  if (!me?.profile?.is_admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Service key not configured." }, { status: 503 });

  const db = supabaseAdmin();
  const countOf = async (t: string) => {
    const { count } = await db.from(t).select("*", { count: "exact", head: true });
    return count ?? 0;
  };

  const [content, people, notPublished] = await Promise.all([
    Promise.all([
      scan("articles", ["title", "dek", "body", "series"]),
      scan("towns", ["name", "blurb"]),
      scan("places", ["name", "note"]),
      scan("events", ["name", "note", "organiser", "url"]),
      scan("offers", ["title", "description", "code", "partner"]),
      scan("partners", ["business", "type", "email"]),
      scan("races", ["name", "note", "series"]),
      scan("banners", ["alt", "credit"]),
    ]),
    // Counts only. Deliberately no rows: none of this is content, and it is not ours to page
    // through looking for problems.
    Promise.all(["profiles", "reviews", "posts", "groups", "saved_towns", "subscribers", "enquiries"].map(async (t) => ({ table: t, rows: await countOf(t) }))),
    unpublished(),
  ]);

  const flaggedTotal = content.reduce((n, c) => n + (c.flagged?.length ?? 0), 0);

  return NextResponse.json(
    { checked_at: new Date().toISOString(), flagged_total: flaggedTotal, content, people, not_published: notPublished },
    { headers: { "Cache-Control": "no-store" } },
  );
}
