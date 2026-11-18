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
          great cycling towns, chosen and judged by us, with riders free to have their say beside it.
        </p>
        <h3>Why we’re different</h3>
        <p>
          No one pays for a place in the guide, ever. Every town is judged on the same five things — the riding, the climbing,
          the roads, the stops and the welcome — and the best carry one, two or three wheels. Our inspectors ride
          unannounced and pay their own way; until they have, a distinction is marked provisional. What riders think sits
          beside it, never inside it. <Link href="/how-rankings-work">How the guide works ›</Link>
        </p>
        <h3>What you can do</h3>
        <p>
          Discover and compare towns, find the best rides, café stops and bike shops, find mass-participation events worth
          entering, build your own loops, and plan your trip around when each town rides best. Browse it all free — no account needed.
        </p>
        <h3>The community</h3>
        <p>
          Join free to contribute — review the towns you’ve ridden, and post ride reports.
          Points earn you status, from Rider to
          Insider to <b>Champion</b> — but status is recognition only: every rider’s review is weighted the same way.
        </p>
        <h3>For partners</h3>
        <p>
          Cafés, bike shops, stays, brands and tourism boards can partner with us to reach riders who actually go. Partners
          never buy a place or a distinction in the guide. <Link href="/partners">Partner with us ›</Link>
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
        <Link href="/how-rankings-work" className="lk-ghost big">How the guide works</Link>
      </div>
    </ProsePage>
  );
}
