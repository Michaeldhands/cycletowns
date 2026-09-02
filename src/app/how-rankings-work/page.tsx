import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "How rankings work" };

const EXAMPLE: [string, number][] = [["Cafés", 4.8], ["Routes", 4.9], ["Road safety", 4.6], ["Climbs", 4.7], ["Bike storage", 4.5]];

export default function HowRankings() {
  return (
    <ProsePage
      kick="How rankings work"
      title="Every Cycletown earns its place."
      lead="The Cyclist Score is the most honest ranking in cycling — built from real riders, and impossible to buy."
    >
      <div className="wscorebox" style={{ maxWidth: "none", margin: "8px 0 6px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800 }}>The Cyclist Score — five things that matter</h3>
        <div className="csub" style={{ color: "var(--grey-m)", fontSize: 12, margin: "2px 0 8px" }}>An example breakdown</div>
        {EXAMPLE.map(([l, v]) => (
          <div className="dimrow" key={l}>
            <span className="dl">{l}</span>
            <span className="dt"><i style={{ width: `${(v / 5) * 100}%` }} /></span>
            <span className="dv">{v.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="wprose">
        <p>
          The score is the average of <b>verified rider reviews</b> across those five dimensions — café culture, routes &amp;
          rides, road safety, climbs, and bike storage. Together they capture what actually makes a town great to ride.
        </p>
        <h3>Launch scores</h3>
        <p>
          Until a town has enough rider reviews, its score is an editorial launch score set by the Cycletowns team from
          riding it, local knowledge and published route data. It’s clearly marked on every town page, and it hands over to
          rider reviews as they come in.
        </p>
        <h3>Recency &amp; volume weighting</h3>
        <p>
          More reviews and more-recent rides count for more, so a town’s score reflects how it rides <i>today</i> — not five
          years ago. A town can rise or fall as the community keeps riding.
        </p>
        <h3>Verified, not anonymous</h3>
        <p>Reviews count when they come from riders with logged activity. That keeps the leaderboard honest and the intel trustworthy.</p>
        <h3>No pay-to-play — ever</h3>
        <p>
          Brands and destinations can advertise, but they can <b>never</b> buy a ranking. Placement is earned, never sold.
          It’s the whole point.
        </p>
        <h3>The Cycletowns Crown</h3>
        <p>
          Each year we crown the <b>World’s Best Cycletown</b>, decided <b>70% by the Cyclist Score</b> and{" "}
          <b>30% by a capped rider People’s Choice vote</b> — earned by riders, never bought, and built so it can’t be gamed.
        </p>
      </div>
      <div className="row btnpair" style={{ gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <Link href="/rankings" className="lk-coral big">See the leaderboard</Link>
        <Link href="/join" className="lk-ghost big">Vote for your town</Link>
      </div>
    </ProsePage>
  );
}
