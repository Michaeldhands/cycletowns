"use client";
import Link from "next/link";
import { useState } from "react";

/** Join Insider (Stripe Checkout) or manage an existing membership (billing portal). */
export function JoinInsider({ userId, member, enabled }: { userId: string | null; member: boolean; enabled: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const go = async (path: string, body?: unknown) => {
    setBusy(path);
    setErr("");
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (j.url) window.location.href = j.url;
    else {
      setErr(j.error || "Something went wrong — try again.");
      setBusy(null);
    }
  };
  if (!userId)
    return (
      <div className="wbar">
        <Link href="/join?next=/membership" className="lk-coral big">Join free first</Link>
        <span className="wsub">You need a rider account before going Insider.</span>
      </div>
    );
  if (member)
    return (
      <div className="wbar" style={{ alignItems: "center" }}>
        <span className="award alt" style={{ background: "var(--coral)" }}>★ You’re an Insider</span>
        <button className="lk-ghost" onClick={() => go("/api/stripe/portal")} disabled={!!busy}>{busy ? "Opening…" : "Manage membership"}</button>
        {err && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{err}</span>}
      </div>
    );
  if (!enabled)
    return <div className="unlocknote" style={{ fontSize: 14, padding: 14 }}>Insider membership opens shortly — you’ll be able to join right here.</div>;
  return (
    <div className="wbar" style={{ alignItems: "center" }}>
      <button className="lk-coral big" onClick={() => go("/api/stripe/checkout", { plan: "year" })} disabled={!!busy}>{busy === "year" ? "Opening…" : "Go Insider — A$80 / year"}</button>
      <button className="lk-ghost big" onClick={() => go("/api/stripe/checkout", { plan: "month" })} disabled={!!busy}>{busy === "month" ? "Opening…" : "A$7 / month"}</button>
      {err && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{err}</span>}
    </div>
  );
}
