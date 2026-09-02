import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { TownCard } from "@/components/Cards";
import { LITE_TOWNS, SCOPES, rankedTowns, regionOf } from "@/lib/towns";

export const metadata: Metadata = {
  title: "All Cycletowns",
  description: "Every cycling town on Cycletowns — full guides with routes, cafés and bike shops, ranked by riders.",
};

export default async function TownsPage({ searchParams }: PageProps<"/towns">) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().toLowerCase();
  const scope = typeof sp.region === "string" ? sp.region : "all";
  const match = (name: string, region: string, country: string) =>
    !q || `${name} ${region} ${country}`.toLowerCase().includes(q);
  const towns = rankedTowns().filter((t) => (scope === "all" || regionOf(t.country) === scope) && match(t.name, t.region, t.country));
  const lite = LITE_TOWNS.filter((t) => (scope === "all" || regionOf(t.country) === scope) && match(t.name, t.region, t.country));
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in">
          <div className="kick">Explore</div>
          <div className="h2">{q ? `Towns matching “${q}”` : "All Cycletowns"}</div>
          <div className="lead">
            Full guides — routes, café stops, bike shops, races and when to go — for every town below. Tap a region to
            narrow it down.
          </div>
          <div className="scopebar" style={{ justifyContent: "center", marginBottom: 26 }}>
            <span className="scopelab">📍 Show me:</span>
            {SCOPES.map((s) => (
              <Link
                key={s.id}
                href={`/towns?region=${s.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={"scopechip" + (scope === s.id ? " on" : "")}
                style={{ textDecoration: "none" }}
              >
                {s.label}
              </Link>
            ))}
          </div>
          {towns.length === 0 && lite.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--grey-d)" }}>
              Nothing matched. Try another spelling, or <Link href="/towns">browse every town</Link>.
            </p>
          )}
          <div className="wgrid">
            {towns.map((t) => (
              <TownCard key={t.id} t={t} />
            ))}
          </div>
          {lite.length > 0 && (
            <>
              <div className="kick" style={{ marginTop: 48 }}>
                On our radar
              </div>
              <div className="h2" style={{ fontSize: 32 }}>
                Guides in progress
              </div>
              <div className="lead">Towns we’re building out next. Know one well? Help write the guide.</div>
              <div className="litegrid">
                {lite.map((t) => (
                  <Link key={t.slug} href={`/towns/${t.slug}`} className="litechip">
                    <span>{t.flag}</span>
                    <b>{t.name}</b>
                    <small>
                      {t.region} · {t.country}
                    </small>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
