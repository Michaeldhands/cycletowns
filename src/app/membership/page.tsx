import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { ridePic } from "@/lib/images";

export const metadata: Metadata = { title: "Membership & rewards" };

export default function Membership() {
  return (
    <>
      <TopBar />
      <div className="whero" style={{ height: 300 }}>
        <Photo src={ridePic("alpine", "membership-hero", 1400)} />
        <div className="wov">
          <div className="winner">
            <div className="awards"><span className="award alt">Cycletowns Club · join free</span></div>
            <h1>Ride more. Pay less.<br />Go further.</h1>
            <div className="meta"><span className="rk">Free to join</span><span className="sc">Save towns &amp; trips</span><span className="sc">Rate what you ride</span></div>
          </div>
        </div>
      </div>
      <div className="wsec">
        <div className="wh"><div><h2>Unlock the moment you join</h2><span className="wsub">free — no card required</span></div></div>
        <div className="wgrid">
          {[
            ["♥", "Save towns & trips", "Keep a shortlist of the places you want to ride, synced across your devices."],
            ["⭐", "Rate what you ride", "Your reviews shape each town’s Cyclist Score. Verified riders, honest rankings."],
            ["🤝", "Groups & rides", "Join local crews and visiting bunches, and find a ride wherever you land."],
            ["🎟️", "Member offers", "Partner offers from bike brands, stays and destinations — riders only."],
          ].map(([e, t, s]) => (
            <div className="wcard" style={{ padding: 18 }} key={t}>
              <div style={{ fontSize: 30 }}>{e}</div>
              <div className="wcn" style={{ marginTop: 8 }}>{t}</div>
              <div className="wcd" style={{ WebkitLineClamp: 4 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="wsec">
        <div className="wh"><div><h2>Earn your status</h2><span className="wsub">contribute → climb tiers → bigger rewards</span></div></div>
        <div className="wgrid g3">
          {[
            ["Rider", "Free to join", "Browse everything, save trips, rate towns and unlock member offers."],
            ["Insider", "Top contributors", "Early access to new towns and features, plus exclusive partner offers."],
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
      <div className="wsec">
        <div className="wscorebox" style={{ maxWidth: "none" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>How rewards work</h3>
          <div className="grow"><span>Write a review with photos</span><b>+50 pts</b></div>
          <div className="grow"><span>Post a ride with #cycletowns</span><b>+40 pts</b></div>
          <div className="grow"><span>Add a café, route or shop</span><b>+30 pts</b></div>
          <div className="grow"><span>Refer a riding mate</span><b>+25 pts</b></div>
          <div className="grow"><span>Reach Champion (top 10%)</span><b>Best perks</b></div>
          <p className="wsub" style={{ marginTop: 10 }}>We never trade rewards for positive reviews — points are for contributing, not for praise.</p>
        </div>
      </div>
      <div className="wsec" style={{ textAlign: "center", padding: "32px 22px 40px" }}>
        <Link href="/join" className="lk-coral big">Join free</Link>
        <div className="wsub" style={{ marginTop: 10, display: "block" }}>No card required</div>
      </div>
      <Footer />
    </>
  );
}
