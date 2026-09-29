import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { bannerAlt, bannerSrc } from "@/lib/banners";
import { loadBanners } from "@/lib/banners-data";
import { Photo } from "@/components/Photo";
import { JoinInsider } from "@/components/MembershipButtons";
import { ridePic } from "@/lib/images";
import { currentUser, isMember } from "@/lib/supabase/server";
import { hasStripe } from "@/lib/stripe/server";

export const metadata: Metadata = { title: "Membership & rewards" };
export const dynamic = "force-dynamic";

export default async function Membership() {
  const banners = await loadBanners();
  const me = await currentUser();
  const member = isMember(me?.profile);
  return (
    <>
      <TopBar />
      <div className="whero" style={{ height: 300 }}>
        <Photo src={bannerSrc(banners, "membership-hero", 1400)} alt={bannerAlt(banners, "membership-hero")} />
        <div className="wov">
          <div className="winner">
            <div className="awards"><span className="award alt">Cycletowns Club</span></div>
            <h1>Join free.<br />Back the bunch.</h1>
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
            <p>Insider is how Cycletowns stays independent — no paid rankings, no selling your data. It’s mostly a way to back the site. Here’s exactly what it gets you today.</p>
            <div className="cgfeat">
              <span>⚡ Double points on everything</span>
              <span>★ Insider status straight away</span>
              <span>🎟️ Member offers, as partners come on board</span>
            </div>
            <p style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>No member offers are live yet — the first partners are being signed now. Insider doesn’t change how much your reviews count: every rider’s review is weighted the same way.</p>
            <JoinInsider userId={me?.id ?? null} member={member} enabled={hasStripe()} />
            <p style={{ fontSize: 12, opacity: 0.8, marginTop: 12 }}>Prices in Australian dollars, GST inclusive. Cancel anytime from your account — you keep Insider until the end of the period you’ve paid for.</p>
          </div>
          <div className="cgr"><Photo src={bannerSrc(banners, "membership-insider", 900)} alt={bannerAlt(banners, "membership-insider")} /></div>
        </div>
      </div>

      <div className="wsec">
        <div className="wh"><div><h2>Earn your status</h2><span className="wsub">contribute → climb tiers → bigger rewards</span></div></div>
        <div className="wgrid g3">
          {[
            ["Rider", "Free to join", "Browse everything, save trips, review towns, join groups."],
            ["Insider", "Subscribe, or earn 250 points", "Double points, and member offers as partners come on board."],
            ["Champion", "Earn 1,000 points", "A 👑 beside your name on your reviews and posts. Recognition, not extra weight — the score counts every rider’s review the same way."],
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
