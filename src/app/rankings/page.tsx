import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { RankTable } from "@/components/RankTable";
import { CAT_DEFS, LITE_TOWNS, TOWNS } from "@/lib/towns";

export const metadata: Metadata = {
  title: "Rankings — the world’s best cycling towns",
  description: "The Cycletowns leaderboard: every cycling town ranked by the Cyclist Score.",
};

export default function RankingsPage() {
  const total = TOWNS.length + LITE_TOWNS.length;
  return (
    <>
      <TopBar />
      <div className="sec2" id="rankings">
        <div className="in">
          <div className="kick">Global rankings</div>
          <div className="h2">{total} Cycletowns ranked</div>
          <div className="lead">
            A living leaderboard of the world’s cycling towns — every one free to browse. Going global, or just want what’s
            close to home? Filter by region. Towns with a full guide are scored; the rest are on our radar and open a preview.
          </div>
          <div className="rankmeta">
            Ranked by the <b>Cyclist Score</b> across the five things that matter most: routes, café culture, road safety,
            climbs and bike storage. Launch scores are editorial; as <b>verified rider reviews</b> come in they take over,
            with more reviews and more-recent rides counting for more. <b>No paid placements, ever.</b>
          </div>
          <div className="catbar" style={{ justifyContent: "center", marginBottom: 18 }}>
            {CAT_DEFS.map((c) => (
              <Link key={c.id} href={`/rankings/${c.id}`} className="catchip" style={{ textDecoration: "none" }}>
                {c.icon} {c.label}
              </Link>
            ))}
          </div>
          <div className="awardband">
            <div>
              <div className="aw-kick">🏆 The Cycletowns Crown</div>
              <h3>Who’s the World’s Best Cycletown?</h3>
              <p>
                Each year we crown the winner — decided <b>70% by the Cyclist Score</b> (verified rider reviews) and{" "}
                <b>30% by a rider People’s Choice vote</b>. Earned by riders, never bought.
              </p>
              <div className="aw-btns">
                <Link href="/join" className="lk-coral big">
                  🗳️ Join to vote for your town
                </Link>
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
          <RankTable />
          <div style={{ textAlign: "center", marginTop: 14, color: "var(--grey-m)", fontSize: 13, fontWeight: 700 }}>
            ↕ Scroll the leaderboard — every Cycletown, free to browse
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
