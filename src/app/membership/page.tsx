import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { JoinMember } from "@/components/MembershipButtons";
import { Subscribe } from "@/components/Subscribe";
import { currentUser, isMember } from "@/lib/supabase/server";
import { hasStripe } from "@/lib/stripe/server";

export const metadata: Metadata = {
  title: "Subscribe or join",
  description: "Subscribe free for the newsletter, or join as a member to support an independent guide to cycling towns and a stronger voice for riders.",
};
export const dynamic = "force-dynamic";

/* Two doors, nothing else. Subscribe is free and builds the audience; joining is paid and is
   about backing the work, not unlocking perks. No points, tiers or rewards — they made an
   independent guide look like a loyalty scheme. */
export default async function Membership() {
  const me = await currentUser();
  const member = isMember(me?.profile);
  return (
    <>
      <TopBar />
      <div className="sec2" style={{ paddingBottom: 10 }}>
        <div className="in" style={{ textAlign: "center" }}>
          <div className="kick">Riders</div>
          <div className="h2">Subscribe, or join us.</div>
          <div className="lead">Cycletowns is an independent guide. No town, business or brand can pay for a place in it — so it is paid for by the people who ride.</div>
        </div>
      </div>

      <div className="wsec">
        <div className="doors">
          <section className="door" id="subscribe">
            <div className="doork">Free</div>
            <h2>Subscribe</h2>
            <p>The Cycletowns newsletter: new towns as they enter the guide, routes, events worth entering and what our inspectors find.</p>
            <Subscribe source="membership" />
            <p className="doorfine">
              Want to save towns and trips, have Ask Cycletowns remember how you ride, or add your view to Riders say?{" "}
              {me ? <Link href="/account">That’s your free account ›</Link> : <Link href="/join">Create a free account ›</Link>}
            </p>
          </section>

          <section className="door door-join" id="join">
            <div className="doork">A$7 a month · A$80 a year</div>
            <h2>Join</h2>
            <p>Members pay for the work: anonymous inspections, honest writing, and a guide no one can buy. And they help give riders a voice — with councils, regions and road authorities — for safer roads and towns that welcome bikes.</p>
            <ul className="doorlist">
              <li>Inspections paid for by riders, not by the towns we review</li>
              <li>A stronger case for cyclists, made with evidence from the guide</li>
              <li>More Ask Cycletowns questions each day, as our thanks</li>
            </ul>
            <JoinMember userId={me?.id ?? null} member={member} enabled={hasStripe()} />
            <p className="doorfine">Australian dollars, GST inclusive. Cancel any time from your account — you stay a member until the end of the period you’ve paid for.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
