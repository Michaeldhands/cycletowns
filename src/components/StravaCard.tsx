"use client";
import { useState } from "react";

/** Connect / disconnect Strava, on the account page. */
export function StravaCard({ connected: initial, athleteId }: { connected: boolean; athleteId?: number | null }) {
  const [connected, setConnected] = useState(initial);
  const [busy, setBusy] = useState(false);

  const disconnect = async () => {
    if (!confirm("Disconnect Strava? We'll revoke our access and delete the tokens and activity ids we hold. Reviews you've already had verified stay verified.")) return;
    setBusy(true);
    const res = await fetch("/api/strava/disconnect", { method: "POST" });
    setBusy(false);
    if (res.ok) setConnected(false);
    else alert("That didn't work. Try again shortly.");
  };

  return (
    <div className="wscorebox" style={{ maxWidth: "none", marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Ride verification</h3>
      <p className="wsub" style={{ display: "block", marginBottom: 10 }}>
        {connected
          ? `Strava connected${athleteId ? ` · athlete ${athleteId}` : ""}. On any town you've reviewed you can now have the ride verified, which makes your review count for more.`
          : "Connect Strava and your reviews can be ride-verified — we check for one of your own rides starting near the town. We read only each ride's start point and date, never routes, times or names."}
      </p>
      <div className="wbar" style={{ gap: 8, alignItems: "center" }}>
        {connected ? (
          <button className="lk-ghost" onClick={disconnect} disabled={busy}>
            {busy ? "Disconnecting…" : "Disconnect Strava"}
          </button>
        ) : (
          <a className="lk-coral" href="/api/strava/connect?next=/account">
            Connect Strava
          </a>
        )}
        <span className="vrpow">Powered by Strava</span>
      </div>
    </div>
  );
}
