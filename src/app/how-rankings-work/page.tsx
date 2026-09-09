import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { REVIEWS_TO_TAKE_OVER } from "@/lib/reviews-types";
import { VERIFY_RADIUS_KM, VERIFY_WINDOW_DAYS } from "@/lib/strava";

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
          The <b>rider score</b> is built from every published review of that town. At{" "}
          <b>{REVIEWS_TO_TAKE_OVER} reviews</b> it replaces the editorial score, and from then on that is what the town is
          ranked on. Two things change how much a given review counts:
        </p>
        <ul>
          <li>
            <b>How recent it is.</b> A review’s weight halves every 18 months from the date the rider says they were
            there. Cafés close, bike lanes open, roads get resurfaced — a score should follow.
          </li>
          <li>
            <b>Whether the ride is verified.</b> A review with a verified ride counts twice what an unverified one does.
            Everyone’s review still counts.
          </li>
        </ul>
        <h3>Ride verification</h3>
        <p>
          A rider can connect Strava, and we check for one of their own rides starting within {VERIFY_RADIUS_KM} km of the
          town, within {VERIFY_WINDOW_DAYS} days of the date on their review. If we find one, the review is marked{" "}
          <b>✓ Ride verified</b>.
        </p>
        <p>
          We read each ride’s start point and date and nothing else — no routes, times, names, or anything we could show
          to anyone. We keep that the check passed and the id of the ride that passed it; disconnect and we revoke our
          access and delete both. <i>Powered by Strava.</i>
        </p>
        <h3>More reviews beat fewer</h3>
        <p>
          A town with sixty reviews averaging 4.5 is a safer bet than one with five averaging 4.6, and the leaderboard
          orders them that way — on the score minus one standard error, so a thin review count is held to a higher bar.
          This affects <i>order only</i>. The number we show you is always the weighted average the riders actually gave;
          we never display a figure adjusted for our own confidence. For the same reason a town still on its editorial
          score is ordered a little below its face value: evidence from riders should move a town up the board, never
          down.
        </p>
        <h3>Who can review</h3>
        <p>
          Reviews come from signed-in Cycletowns accounts, one per rider per town, and they publish straight away. We
          remove anything we can’t stand behind.
        </p>
        <h3>No pay-to-play — ever</h3>
        <p>
          Brands and destinations can advertise, and a business can claim and update its own listing. Neither moves a town
          up the leaderboard, and neither ever will. Placement is earned, never sold. It’s the whole point.
        </p>
        <h3>What we haven’t built yet</h3>
        <p>
          Verification works with <b>Strava</b> only. Record on a Garmin, Wahoo or Komoot without syncing to Strava and
          there is currently no way to verify your ride — a GPX upload is the obvious next step and isn’t built. We don’t
          re-check on any schedule that a café or shop we list is still open. And most towns don’t yet have enough reviews
          for the weighting above to be doing much work.
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
        <Link href="/join" className="lk-ghost big">Review a town you’ve ridden</Link>
      </div>
    </ProsePage>
  );
}
