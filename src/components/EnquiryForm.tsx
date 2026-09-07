"use client";
import { useState } from "react";

type PType = { id: string; name: string };

/** Partner enquiry — saved to our own database, pushed to the CRM, and it emails you. */
export function EnquiryForm({ types, towns }: { types: PType[]; towns: { id: string; name: string }[] }) {
  const [f, setF] = useState({ business: "", type: types[0]?.id || "cafe", town: "", name: "", email: "", message: "" });
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setState("busy");
    try {
      const r = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, website, source: "partners" }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (r.ok) setState("done");
      else { setMsg(j.error || "That didn’t send."); setState("error"); }
    } catch {
      setMsg("Couldn’t reach us just now — please email partners@cycletowns.com.");
      setState("error");
    }
  };

  if (state === "done")
    return (
      <div className="unlocknote" style={{ fontSize: 14.5, padding: 18 }}>
        ✅ <b>Got it.</b> A real person will read this and reply within one business day, to <b>{f.email}</b>. If it’s
        urgent, email partners@cycletowns.com directly.
      </div>
    );

  return (
    <form onSubmit={submit} className="enqform">
      <div className="field"><label>Business name</label><input value={f.business} onChange={(e) => set("business", e.target.value)} placeholder="e.g. Sixpence Coffee" required /></div>
      <div className="field"><label>Partner type</label>
        <select value={f.type} onChange={(e) => set("type", e.target.value)}>{types.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </div>
      <div className="field"><label>Town</label>
        <select value={f.town} onChange={(e) => set("town", e.target.value)}>
          <option value="">Somewhere else / not listed</option>
          {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="field"><label>Your name</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" required /></div>
      <div className="field"><label>Email</label><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@business.com" required /></div>
      <div className="field"><label>Anything we should know? <span style={{ fontWeight: 500, color: "var(--grey-m)" }}>optional</span></label>
        <textarea rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="What you're hoping to get out of it." />
      </div>
      <label style={{ position: "absolute", left: -9999 }} aria-hidden="true">Leave empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      <button type="submit" className="btn btn-coral" style={{ borderRadius: 13, width: "100%" }} disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : "Request my partner pack ›"}
      </button>
      {state === "error" && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{msg}</div>}
      <div className="wsub" style={{ textAlign: "center", marginTop: 10, fontSize: 12, display: "block" }}>No spam. A real human replies within one business day · partners@cycletowns.com</div>
    </form>
  );
}
