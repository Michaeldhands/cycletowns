"use client";
import { useState } from "react";

const CONSENT = "Send me the Cycletowns newsletter — new town guides, routes and features. Unsubscribe any time.";

/** Newsletter sign-up. One field, one button, and the consent wording visible before you click —
    not buried in a policy nobody opens. */
export function Subscribe({ source = "news", compact = false }: { source?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("busy");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setState("done");
      else {
        setMsg(j.error || "Couldn’t sign you up just now.");
        setState("error");
      }
    } catch {
      setMsg("Couldn’t reach us just now. Try again in a moment.");
      setState("error");
    }
  };

  if (state === "done")
    return (
      <div className="unlocknote" style={{ fontSize: 14, padding: 14, margin: 0 }}>
        ✉️ You&rsquo;re on the list. We&rsquo;ll email you when there&rsquo;s something worth reading — and there&rsquo;s an
        unsubscribe link in every one.
      </div>
    );

  return (
    <form onSubmit={submit} style={{ maxWidth: compact ? 520 : 620 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Your email address"
          style={{ flex: "1 1 220px", minWidth: 0, padding: "12px 14px", borderRadius: 12, border: "1.6px solid var(--line)", fontSize: 15, fontFamily: "inherit" }}
        />
        <button type="submit" className="lk-coral big" disabled={state === "busy"} style={{ whiteSpace: "nowrap" }}>
          {state === "busy" ? "Signing you up…" : "Subscribe"}
        </button>
      </div>
      <label style={{ position: "absolute", left: -9999 }} aria-hidden="true">
        Leave this empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      <p style={{ fontSize: 12, color: "var(--grey-m)", marginTop: 8, lineHeight: 1.45 }}>
        {CONSENT} We don&rsquo;t share your address, and we don&rsquo;t email you about anything else.
      </p>
      {state === "error" && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 6 }}>{msg}</div>}
    </form>
  );
}
