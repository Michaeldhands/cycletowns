import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { ridePic } from "@/lib/images";
import { CAT_DEFS, CAT_HERO, SCOPES, catDef, catScore, regionOf, placeLine } from "@/lib/towns";
import { loadCatalog } from "@/lib/content";
import { DISTINCTIONS, distinctionOf, guideOrder } from "@/lib/distinctions";
import { Wheels } from "@/components/Distinction";

export const dynamicParams = false;
export function generateStaticParams() {
  return CAT_DEFS.map((c) => ({ category: c.id }));
}
export async function generateMetadata({ params }: PageProps<"/rankings/[category]">): Promise<Metadata> {
  const { category } = await params;
  const d = catDef(category);
  return d ? { title: `Best ${d.label} cycling towns`, description: d.blurb } : {};
}

const CAT_IMG: Record<string, string> = { road: "road", climb: "climb", gravel: "gravel", mtb: "mtb", ebike: "ebike", alpine: "alpine", pro: "group" };

export default async function CategoryPage({ params, searchParams }: PageProps<"/rankings/[category]">) {
  const { category } = await params;
  const sp = await searchParams;
  const scope = typeof sp.region === "string" ? sp.region : "all";
  const d = catDef(category);
  if (!d) notFound();
  const c = await loadCatalog();
  // Towns known for this kind of riding first, then the rest of the guide — each with its distinction.
  const full = c.towns.slice().sort((a, b) => catScore(b, d.id) - catScore(a, d.id) || guideOrder(a, b)).filter((t) => scope === "all" || regionOf(t.country) === scope);
  // radar towns named as heroes for this category
  const heroNames = new Set(CAT_HERO[d.id] || []);
  const lite = c.lite.filter((t) => heroNames.has(t.name) && (scope === "all" || regionOf(t.country) === scope));
  const scopeName = SCOPES.find((s) => s.id === scope)?.label || "🌏 Worldwide";
  return (
    <>
      <TopBar back={{ href: "/rankings", label: "The guide" }} />
      <div className="whero" style={{ height: 300 }}>
        <Photo src={ridePic(CAT_IMG[d.id] || d.tag, "cathero-" + d.id, 1400)} />
        <div className="wov">
          <div className="winner">
            <div className="bc">
              <Link href="/">Cycletowns</Link> › <Link href="/rankings">The guide</Link> › <b>{d.label}</b>
            </div>
            <div className="awards">
              <span className="award alt">
                {d.icon} {d.label}
              </span>
            </div>
            <h1>The best {d.label} Cycletowns</h1>
            <div className="lede" style={{ color: "#fff", opacity: 0.95, maxWidth: 660 }}>
              {d.blurb} The towns in the guide for {d.label.toLowerCase()} riding.
            </div>
          </div>
        </div>
      </div>
      <div className="wsec" style={{ paddingBottom: 0 }}>
        <div className="kick">What&apos;s your ride?</div>
        <div className="catbar">
          {CAT_DEFS.map((c) => (
            <Link
              key={c.id}
              href={`/rankings/${c.id}${scope !== "all" ? `?region=${scope}` : ""}`}
              className={"catchip" + (c.id === d.id ? " on" : "")}
              style={{ textDecoration: "none" }}
            >
              {c.icon} {c.label}
            </Link>
          ))}
        </div>
        <div className="scopebar">
          {SCOPES.map((s) => (
            <Link
              key={s.id}
              href={`/rankings/${d.id}${s.id !== "all" ? `?region=${s.id}` : ""}`}
              className={"scopechip" + (s.id === scope ? " on" : "")}
              style={{ textDecoration: "none" }}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
      {full.length === 0 && lite.length === 0 ? (
        <div className="wsec">
          <div className="unlocknote">No {d.label} towns in this region yet — try 🌏 Worldwide.</div>
        </div>
      ) : (
        <div className="wsec" style={{ paddingTop: 0 }}>
          <div className="ranktbl">
            {full.map((t) => (
              <Link href={`/towns/${t.id}`} className="rankrow" key={t.id} style={{ textDecoration: "none", color: "inherit" }}>
                <span className="rnum"><Wheels level={distinctionOf(t).level} size={13} /></span>
                <span className="rfl">{t.flag}</span>
                <span className="rnm">
                  {t.name}
                  <small>
                    {placeLine(t.region, t.country)}
                  </small>
                </span>
                <span className="catfit">{(CAT_HERO[d.id] || []).includes(t.name) ? `${d.icon} known for ${d.label.toLowerCase()}` : ""}</span>
                <span className="rsc" style={{ fontSize: 12.5 }}>{DISTINCTIONS[distinctionOf(t).level].short}</span>
                <span className="rgo">View ›</span>
              </Link>
            ))}
            {lite.map((t) => (
              <Link href={`/towns/${t.slug}`} className="rankrow lk" key={t.slug} style={{ textDecoration: "none", color: "inherit" }}>
                <span className="rnum">·</span>
                <span className="rfl">{t.flag}</span>
                <span className="rnm">
                  {t.name}
                  <small>
                    {placeLine(t.region, t.country)}
                  </small>
                </span>
                <span className="catfit">{d.icon} on the radar</span>
                <span className="rsc" style={{ color: "var(--grey-m)" }}>
                  —
                </span>
                <span className="rgo" style={{ color: "var(--teal)" }}>
                  Preview ›
                </span>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 14, color: "var(--grey-m)", fontSize: 13, fontWeight: 700 }}>
            {full.length} {d.label} Cycletowns with full guides · {scopeName} · tap any town to explore
          </div>
        </div>
      )}
      <div className="wsec" style={{ textAlign: "center", paddingTop: 6, paddingBottom: 40 }}>
        <Link href="/plan" className="lk-coral big">
          ✨ Plan a trip
        </Link>{" "}
        &nbsp;{" "}
        <Link href="/" className="lk-ghost big">
          ‹ Back to home
        </Link>
      </div>
      <Footer />
    </>
  );
}
