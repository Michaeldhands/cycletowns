import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { RankTable } from "@/components/RankTable";
import { CAT_DEFS } from "@/lib/towns";
import { loadCatalog, rankTowns } from "@/lib/content";
import { fetchAllScores } from "@/lib/reviews";
import { REVIEWS_TO_TAKE_OVER } from "@/lib/reviews-types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Rankings — the world’s best cycling towns",
  description: "The Cycletowns leaderboard: every cycling town ranked by the Cyclist Score.",
};

export default async function RankingsPage() {
  const [c, scores] = await Promise.all([loadCatalog(), fetchAllScores()]);
  return (
    <>
      <TopBar />
      <div className="sec2" id="rankings">
        <div className="in">
          <div className="kick">Global rankings</div>
          <div className="h2">The world’s best Cycletowns</div>
          <div className="lead">
            {c.towns.length} towns with a full guide, ranked. {c.lite.length} more on our radar. Free to browse — filter by
            region, or by the kind of riding you do.
          </div>
          <div className="rankmeta">
            Ranked by the <b>Cyclist Score</b> across the five things that matter most: routes, café culture, road safety,
            climbs and bike storage. Launch scores are editorial; <b>rider reviews take over at {REVIEWS_TO_TAKE_OVER}</b>,
            and we always show you which of the two a town is ranked on. <b>No paid placements, ever.</b>{" "}
            <Link href="/how-rankings-work" style={{ color: "inherit" }}>How it’s calculated ›</Link>
          </div>
          <div className="catbar" style={{ justifyContent: "center", marginBottom: 18 }}>
            {CAT_DEFS.map((c) => (
              <Link key={c.id} href={`/rankings/${c.id}`} className="catchip" style={{ textDecoration: "none" }}>
                {c.icon} {c.label}
              </Link>
            ))}
          </div>
          <RankTable full={rankTowns(c, scores)} lite={c.lite} scores={scores} />
          <div style={{ marginTop: 26 }} />
          <div className="awardband">
            <div>
              <div className="aw-kick">🏆 The Cycletowns Crown — coming</div>
              <h3>Who’s the World’s Best Cycletown?</h3>
              <p>
                We’re building an annual crown: weighted towards the Cyclist Score, with a capped rider vote alongside it.
                Earned by riders, never bought. <b>No vote is open yet</b> — we’ll announce it in the newsletter.
              </p>
              <div className="aw-btns">
                <Link
                  href="/how-rankings-work"
                  className="lk-ghost big"
                  style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.08)" }}
                >
                  How it’s decided
                </Link>
              </div>
            </div>
            <div className="aw-tro">🏆</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
