"use client";
import Link from "next/link";
import { useState } from "react";

/** Join as a member (Stripe Checkout) or manage an existing membership (billing portal). */
export function JoinMember({ userId, member, enabled }: { userId: string | null; member: boolean; enabled: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const go = async (path: string, plan: string, body?: unknown) => {
    setBusy(plan);
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
        <Link href="/join?next=/membership%23join" className="lk-coral big">Join — start with a free account</Link>
        <span className="wsub">Membership is linked to your account, so we ask for your email first.</span>
      </div>
    );
  if (member)
    return (
      <div className="wbar" style={{ alignItems: "center" }}>
        <span className="award alt" style={{ background: "var(--coral)" }}>♥ You’re a member — thank you</span>
        <button className="lk-ghost" onClick={() => go("/api/stripe/portal", "portal")} disabled={!!busy}>{busy ? "Opening…" : "Manage membership"}</button>
        {err && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{err}</span>}
      </div>
    );
  if (!enabled)
    return <div className="unlocknote" style={{ fontSize: 14, padding: 14 }}>Membership opens shortly — you’ll be able to join right here.</div>;
  return (
    <div className="wbar" style={{ alignItems: "center" }}>
      <button className="lk-coral big" onClick={() => go("/api/stripe/checkout", "year", { plan: "year" })} disabled={!!busy}>{busy === "year" ? "Opening…" : "Join — A$80 / year"}</button>
      <button className="lk-ghost big" onClick={() => go("/api/stripe/checkout", "month", { plan: "month" })} disabled={!!busy}>{busy === "month" ? "Opening…" : "A$7 / month"}</button>
      {err && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{err}</span>}
    </div>
  );
}
