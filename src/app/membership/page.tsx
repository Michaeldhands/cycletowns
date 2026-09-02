import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { JoinInsider } from "@/components/MembershipButtons";
import { ridePic } from "@/lib/images";
import { currentUser, isMember } from "@/lib/supabase/server";
import { hasStripe } from "@/lib/stripe/server";

export const metadata: Metadata = { title: "Membership & rewards" };
export const dynamic = "force-dynamic";

export default async function Membership() {
  const me = await currentUser();
  const member = isMember(me?.profile);
  return (
    <>
      <TopBar />
      <div className="whero" style={{ height: 300 }}>
        <Photo src={ridePic("alpine", "membership-hero", 1400)} />
        <div className="wov">
          <div className="winner">
            <div className="awards"><span className="award alt">Cycletowns Club</span></div>
            <h1>Ride more. Pay less.<br />Go further.</h1>
            <div className="meta"><span className="rk">Free to join</span><span className="sc">Insider from A$7 / month</span><span className="sc">Cancel anytime</span></div>
          </div>
        </div>
      </div>

      <div className="wsec">
        <div className="wh"><div><h2>Free, for every rider</h2><span className="wsub">no card required</span></div></div>
        <div className="wgrid">
          {[
            ["♥", "Save towns & trips", "Keep a shortlist of the places you want to ride, synced across your devices."],
            ["⭐", "Rate what you ride", "Your reviews shape each town’s Cyclist Score. Verified riders, honest rankings."],
            ["🤝", "Groups & rides", "Join local crews and visiting bunches, and find a ride wherever you land."],
            ["📣", "The feed", "Ride reports, café finds and road intel from riders in every Cycletown."],
          ].map(([e, t, s]) => (
            <div className="wcard" style={{ padding: 18 }} key={t}><div style={{ fontSize: 30 }}>{e}</div><div className="wcn" style={{ marginTop: 8 }}>{t}</div><div className="wcd" style={{ WebkitLineClamp: 4 }}>{s}</div></div>
          ))}
        </div>
        {!me && <div style={{ marginTop: 16 }}><Link href="/join" className="lk-coral big">Join free</Link></div>}
      </div>

      <div className="wsec" id="insider">
        <div className="concierge">
          <div className="cgl">
            <div className="cgtag">★ Insider · A$7 / month or A$80 / year</div>
            <h2>Go Insider. Back the bunch.</h2>
            <p>Insider is how Cycletowns stays independent — no paid rankings, no selling your data. Members get the good stuff and keep the lights on.</p>
            <div className="cgfeat">
              <span>⚡ Double points on everything</span>
              <span>🚫 Ad-free browsing</span>
              <span>🎟️ Members-only partner offers</span>
              <span>🔭 Early access to new town guides</span>
              <span>★ Insider badge on your reviews</span>
            </div>
            <JoinInsider userId={me?.id ?? null} member={member} enabled={hasStripe()} />
            <p style={{ fontSize: 12, opacity: 0.8, marginTop: 12 }}>Prices in Australian dollars, GST inclusive. Cancel anytime from your account — you keep Insider until the end of the period you’ve paid for.</p>
          </div>
          <div className="cgr"><Photo src={ridePic("group", "insider", 900)} /></div>
        </div>
      </div>

      <div className="wsec">
        <div className="wh"><div><h2>Earn your status</h2><span className="wsub">contribute → climb tiers → bigger rewards</span></div></div>
        <div className="wgrid g3">
          {[
            ["Rider", "Free to join", "Browse everything, save trips, rate towns, join groups."],
            ["Insider", "Members & top contributors", "Double points, ad-free, partner offers, early access. Reach it by subscribing or by earning 250 points."],
            ["Champion", "Top 10% of riders", "Your reviews carry the most weight, profile placement on town pages, and the best partner perks."],
          ].map(([n, s, d], i) => (
            <div className="wcard" style={{ padding: 20, border: i === 2 ? "2px solid var(--coral)" : "1px solid var(--line)" }} key={n}>
              <div className="pcr" style={{ textAlign: "left" }}>{i === 2 ? "★ Top tier" : "Tier"}</div>
              <div style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 27, lineHeight: 1 }}>{n}</div>
              <div className="wsub" style={{ margin: "3px 0 8px" }}>{s}</div>
              <div className="wcd" style={{ WebkitLineClamp: 5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="wsec" style={{ paddingBottom: 40 }}>
        <div className="wscorebox" style={{ maxWidth: "none" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>How points work</h3>
          <div className="grow"><span>Write a review</span><b>+50 pts</b></div>
          <div className="grow"><span>Post a ride report</span><b>+10 pts</b></div>
          <div className="grow"><span>Insider multiplier</span><b>×2</b></div>
          <div className="grow"><span>Reach Insider tier</span><b>250 pts</b></div>
          <div className="grow"><span>Reach Champion</span><b>1,000 pts</b></div>
          <p className="wsub" style={{ marginTop: 10 }}>We never trade rewards for positive reviews — points are for contributing, not for praise.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
