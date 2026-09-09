"use client";
import { useState } from "react";

type State = { busy: boolean; msg: string; ok: boolean | null };

/**
 * Ride verification for the rider's own review. Shown only once they've written one.
 * Strava's terms require the credit line below wherever their data is used.
 */
export function VerifyRide({ townId, townName, verified, connected }: { townId: string; townName: string; verified: boolean; connected: boolean }) {
  const [s, setS] = useState<State>({ busy: false, msg: "", ok: verified ? true : null });

  if (s.ok === true)
    return (
      <div className="vrbox done">
        <span className="vrtick">✓</span>
        <div>
          <b>Ride verified</b>
          <span>
            We found one of your rides starting near {townName}, so your review counts for more. <i>Powered by Strava.</i>
          </span>
        </div>
      </div>
    );

  const verify = async () => {
    setS({ busy: true, msg: "", ok: null });
    try {
      const res = await fetch("/api/strava/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ town: townId }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string; reconnect?: boolean };
      if (j.ok) return setS({ busy: false, msg: "", ok: true });
      setS({ busy: false, msg: j.error || "That didn’t work. Try again shortly.", ok: false });
    } catch {
      setS({ busy: false, msg: "Couldn’t reach us just then. Try again.", ok: false });
    }
  };

  return (
    <div className="vrbox">
      <div>
        <b>Verify your ride</b>
        <span>
          Connect Strava and we’ll check for one of your own rides starting near {townName}. Verified reviews count for
          more in the rider score. We read only the start point and date — never your routes, times or ride names — and we
          delete what we hold the moment you disconnect.
        </span>
      </div>
      <div className="wbar" style={{ marginTop: 10, gap: 8, alignItems: "center" }}>
        {connected ? (
          <button className="lk-coral" onClick={verify} disabled={s.busy}>
            {s.busy ? "Checking your rides…" : "Check my rides"}
          </button>
        ) : (
          <a className="lk-coral" href={`/api/strava/connect?next=${encodeURIComponent(`/towns/${townId}#review`)}`}>
            Connect Strava
          </a>
        )}
        <span className="vrpow">Powered by Strava</span>
      </div>
      {s.msg && <div className="vrmsg">{s.msg}</div>}
    </div>
  );
}
