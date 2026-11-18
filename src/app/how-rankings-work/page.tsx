import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { Wheels } from "@/components/Distinction";
import { CRITERIA, DISTINCTIONS, type Level } from "@/lib/distinctions";
import { VERIFY_RADIUS_KM, VERIFY_WINDOW_DAYS } from "@/lib/strava";

export const metadata: Metadata = {
  title: "How the guide works",
  description: "Distinctions, the five things we judge, anonymous inspections and why no one can pay for a place in the Cycletowns guide.",
};

const LEVELS: Level[] = [3, 2, 1, 0];

export default function HowTheGuideWorks() {
  return (
    <ProsePage
      kick="How the guide works"
      title="Chosen, not bought."
      lead="Every town in the guide is a good place to ride. The best carry a distinction. Here is how they are given — and what isn't built yet."
    >
      <div className="distlegend">
        {LEVELS.map((l) => (
          <div key={l} className="distlegend-row">
            <span className="distlegend-mark">{l ? <Wheels level={l} size={20} /> : <span className="dist-sel">Selected</span>}</span>
            <span>
              <b>{DISTINCTIONS[l].name}</b> — {DISTINCTIONS[l].short.toLowerCase()}
              <small>{DISTINCTIONS[l].line}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="wprose">
        <h3>What we judge</h3>
        <p>The same five things, in every town, whatever the riding:</p>
        <ul>
          {CRITERIA.map((c) => (
            <li key={c.dim}>
              <b>{c.name}.</b> {c.what}
            </li>
          ))}
        </ul>
        <p>
          A distinction is a judgement of the whole, not a sum of the parts. We don’t publish decimal scores: the difference
          between a 4.6 and a 4.7 is false precision, and it invites people to argue about the wrong thing.
        </p>

        <h3>Inspected anonymously, at our expense</h3>
        <p>
          Our inspectors ride each town as any visitor would — unannounced, booking and paying for their own rooms, coffees and
          repairs. Nobody in town knows they are there, so nobody gets special treatment. They are paid by Cycletowns and by no
          one else.
        </p>
        <p>
          <b>Where we are today:</b> inspections are only just beginning, and we are recruiting inspectors. Until a town has
          been inspected its distinction is marked <b>provisional</b> — set from desk research: published routes, local
          knowledge and the people who ride there. The third wheel is never awarded provisionally. It has to be earned in
          person.
        </p>

        <h3>No one pays for a distinction</h3>
        <p>
          Not towns, not regions, not businesses, not brands. Nobody can buy a wheel, a place in the guide, or a word of what we
          write. Partners can advertise, and a business can claim and update its own listing — neither changes a distinction,
          and both are labelled as what they are.
        </p>
        <p>
          If a region or tourism body ever funds our coverage of an area — so that inspectors can get there sooner — we will
          say so plainly on every page of that coverage. Funding can decide <i>when</i> we look. It never decides what we find.
        </p>

        <h3>Riders say</h3>
        <p>
          Beside every town sits what riders think of it — reviews from signed-in Cycletowns accounts, one per rider per town.
          It is shown separately and never changes the distinction, so a town can’t be talked up (or down) into one.
        </p>
        <ul>
          <li>
            <b>Recent counts for more.</b> A review’s weight halves every 18 months from when the rider was there. Cafés close,
            roads get resurfaced.
          </li>
          <li>
            <b>Verified rides count double.</b> Connect Strava and we look for one of your rides starting within{" "}
            {VERIFY_RADIUS_KM} km of the town, within {VERIFY_WINDOW_DAYS} days of the date on your review. We read the start
            point and date and nothing else; disconnect and we delete what we kept. <i>Powered by Strava.</i>
          </li>
        </ul>

        <h3>What we haven’t built yet</h3>
        <p>
          Ride verification works with Strava only — a GPX upload is the obvious next step and isn’t built. We don’t yet
          re-check on a schedule that each café or shop we list is still open. And most towns are still provisional.
        </p>
        <p style={{ color: "var(--grey-m)" }}>If we ever change how the guide works, this page changes with it on the same day.</p>
      </div>
      <div className="row btnpair" style={{ gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <Link href="/rankings" className="lk-coral big">See the guide</Link>
        <Link href="/about" className="lk-ghost big">About Cycletowns</Link>
      </div>
    </ProsePage>
  );
}
