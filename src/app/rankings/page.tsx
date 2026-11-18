import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { RankTable } from "@/components/RankTable";
import { CAT_DEFS } from "@/lib/towns";
import { loadCatalog, rankTowns } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The guide — the world’s best cycling towns",
  description: "Every town in the Cycletowns guide, by distinction: worth a ride, worth a weekend, worth the trip.",
};

export default async function RankingsPage() {
  const c = await loadCatalog();
  return (
    <>
      <TopBar />
      <div className="sec2" id="rankings">
        <div className="in">
          <div className="kick">The guide</div>
          <div className="h2">The world’s best Cycletowns</div>
          <div className="lead">
            {c.towns.length} towns in the guide, and {c.lite.length} more on our radar. Each carries a distinction — our
            verdict on whether the riding is worth a ride, a weekend, or the whole trip.
          </div>
          <div className="rankmeta">
            Distinctions are ours alone. No town, business or partner can pay for one, and rider reviews sit beside them
            rather than changing them. Until a town has been inspected in person, its distinction is marked{" "}
            <b>provisional</b>. <Link href="/how-rankings-work" style={{ color: "inherit" }}>How the guide works ›</Link>
          </div>
          <div className="catbar" style={{ justifyContent: "center", marginBottom: 18 }}>
            {CAT_DEFS.map((c) => (
              <Link key={c.id} href={`/rankings/${c.id}`} className="catchip" style={{ textDecoration: "none" }}>
                {c.icon} {c.label}
              </Link>
            ))}
          </div>
          <RankTable full={rankTowns(c)} lite={c.lite} />
        </div>
      </div>
      <Footer />
    </>
  );
}
