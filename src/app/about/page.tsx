import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <ProsePage
      kick="About"
      title="Made by cyclists, for cyclists."
      lead="Cycletowns is the discovery hub for cycle tourism — the place riders go to find the world’s best towns to ride, plan the trip, and connect with the people who ride them."
    >
      <div className="wprose">
        <p>
          It started with a simple frustration: the best intel about where to ride lives in riders’ heads, not on the sites
          trying to sell you a holiday. So we built the place that puts riders first — a living, global guide to the world’s
          great cycling towns, ranked by the people who actually rode them.
        </p>
        <h3>Why we’re different</h3>
        <p>
          No paid placements, ever. Every town earns its <b>Cyclist Score</b> from verified rider reviews across the five
          things that matter most — routes, café culture, road safety, climbs and bike storage. The more reviews and the more
          recent the rides, the more they count. <Link href="/how-rankings-work">See exactly how rankings work ›</Link>
        </p>
        <h3>What you can do</h3>
        <p>
          Discover and compare towns, find the best rides, café stops and bike shops, ride historic pro stages and gran
          fondos, and plan your trip around when each town rides best. Browse it all free — no account needed.
        </p>
        <h3>The community</h3>
        <p>
          Sign up to contribute — log rides, add café and route intel, write reviews — and climb from rider to creator to{" "}
          <b>Champion</b>, the top 10% whose reviews shape each town’s score. It’s the bit the corporates can’t buy.
        </p>
        <h3>For partners</h3>
        <p>
          Cafés, bike shops, stays, brands and tourism boards partner with us to reach riders who actually go — measured,
          consented and on their terms. <Link href="/partners">Partner with us ›</Link>
        </p>
        <h3>The vision</h3>
        <p>
          Cycling has never just been about the ride — it’s about the people you share it with. Cycletowns is built to{" "}
          <b>connect the cycle-tourism community</b>: riders, locals, creators and the businesses that look after them, all in
          one place. A home for everyone who shares the passion — where like-minded riders find the best places to ride, find
          their people, and pass on what they know, so every trip after gets a little better.
        </p>
      </div>
      <div className="row btnpair" style={{ gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <Link href="/towns" className="lk-coral big">Explore towns</Link>
        <Link href="/how-rankings-work" className="lk-ghost big">How rankings work</Link>
      </div>
    </ProsePage>
  );
}
