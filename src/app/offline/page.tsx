import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "You're offline" };

/** Shown when a rider opens Cycletowns with no signal. Kept deliberately plain — it has to
    render from cache with no data, no fonts guaranteed and no network. */
export default function Offline() {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 46, marginBottom: 12 }}>🚴</div>
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 34, lineHeight: 0.95, marginBottom: 10 }}>
          No signal out here.
        </h1>
        <p style={{ color: "var(--grey-d)", fontSize: 15, marginBottom: 18 }}>
          You&rsquo;re offline, so we can&rsquo;t load anything new. Town guides you&rsquo;ve already opened on this device
          should still work — and any GPX you&rsquo;ve downloaded is on your head unit, not here.
        </p>
        <Link href="/" className="lk-coral big" style={{ textDecoration: "none" }}>Try again</Link>
      </div>
    </div>
  );
}
