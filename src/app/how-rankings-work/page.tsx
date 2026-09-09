import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { REVIEWS_TO_TAKE_OVER } from "@/lib/reviews-types";

export const metadata: Metadata = { title: "How rankings work" };

const EXAMPLE: [string, number][] = [["Cafés", 4.8], ["Routes", 4.9], ["Road safety", 4.6], ["Climbs", 4.7], ["Bike storage", 4.5]];

export default function HowRankings() {
  return (
    <ProsePage
      kick="How rankings work"
      title="Every Cycletown earns its place."
      lead="No town can buy its place. Here is exactly how the Cyclist Score is calculated today, and what we haven't built yet."
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
          Every town is scored on the same five dimensions — café culture, routes &amp; rides, road safety, climbs, and bike
          storage. Together they capture what actually makes a town great to ride.
        </p>
        <h3>Two scores, kept apart</h3>
        <p>
          A town carries an <b>editorial score</b> and, once riders have reviewed it, a <b>rider score</b>. We show both
          separately and never blend them, so you can always see which one a town is ranked on.
        </p>
        <p>
          The <b>editorial score</b> is set by the Cycletowns team from published route data, local knowledge and riding the
          place. It is research, not riders — a starting point, and we label it as one.
        </p>
        <p>
          The <b>rider score</b> is the plain average of every published review across the five dimensions. At{" "}
          <b>{REVIEWS_TO_TAKE_OVER} reviews</b> it replaces the editorial score, and from then on that is what the town is ranked on. Each
          review counts once and counts the same, whether it was written today or a year ago.
        </p>
        <h3>Who can review</h3>
        <p>
          Reviews come from signed-in Cycletowns accounts, one per rider per town, and they publish straight away. We remove
          anything we can’t stand behind. We do <b>not</b> yet check that a reviewer has actually ridden the town — see
          below.
        </p>
        <h3>No pay-to-play — ever</h3>
        <p>
          Brands and destinations can advertise, and a business can claim and update its own listing. Neither moves a town
          up the leaderboard, and neither ever will. Placement is earned, never sold. It’s the whole point.
        </p>
        <h3>What we haven’t built yet</h3>
        <p>
          Three things we intend to add, and which the score does <i>not</i> do today:{" "}
          <b>recency weighting</b>, so a town reflects how it rides now rather than how it rode three years ago;{" "}
          <b>volume confidence</b>, so a town with sixty reviews outranks one with five at the same average; and{" "}
          <b>ride verification</b>, connecting a rider’s logged activity so a review can be marked as coming from someone
          who was demonstrably there.
        </p>
        <p>
          The <b>Cycletowns Crown</b> — an annual World’s Best Cycletown, weighted towards the Cyclist Score with a capped
          rider vote alongside it — is planned, not running. No crown has been awarded and no vote is open.
        </p>
        <p style={{ color: "var(--grey-m)" }}>
          If we ever change how the score is calculated, this page changes with it on the same day.
        </p>
      </div>
      <div className="row btnpair" style={{ gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <Link href="/rankings" className="lk-coral big">See the leaderboard</Link>
        <Link href="/join" className="lk-ghost big">Vote for your town</Link>
      </div>
    </ProsePage>
  );
}
