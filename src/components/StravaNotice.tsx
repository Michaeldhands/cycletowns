"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Says what happened after a trip out to Strava. Without this the rider is redirected back
 * to a page that looks exactly as it did before, which reads as "nothing happened".
 */
const MSG: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Strava connected. On any town you’ve reviewed you can now have the ride verified." },
  denied: { ok: false, text: "You didn’t grant access, so nothing changed. Your reviews still publish and still count." },
  noscope: {
    ok: false,
    text: "Strava connected, but without permission to see your activities — which is the only thing we need. Try again and leave the activity permission ticked.",
  },
  cap: {
    ok: false,
    text: "Strava won’t let any more riders connect to Cycletowns yet: our app is still under their connected-athlete cap while it goes through review. This is our problem, not yours. Your review still publishes and still counts.",
  },
  badstate: { ok: false, text: "That sign-in didn’t come back the way it left. Nothing was changed — please try again." },
  off: { ok: false, text: "Ride verification isn’t switched on yet." },
  failed: { ok: false, text: "We couldn’t complete that connection. Nothing was changed — please try again shortly." },
};

export function StravaNotice() {
  const sp = useSearchParams();
  const code = sp.get("strava");
  const [gone, setGone] = useState(false);

  // Take it out of the URL so a refresh or a shared link doesn't repeat the message.
  useEffect(() => {
    if (!code) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("strava");
    window.history.replaceState({}, "", url.toString());
  }, [code]);

  if (!code || gone) return null;
  const m = MSG[code] || MSG.failed;

  return (
    <div className={"stnotice" + (m.ok ? " ok" : "")} role="status">
      <span>{m.text}</span>
      <button onClick={() => setGone(true)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
