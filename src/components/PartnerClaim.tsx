"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import partnerTypes from "@/data/partner-types.json";

type PType = { id: string; name: string };
type Place = { id: string; town_id: string; kind: string; name: string };
const clean = (s: string) => s.replace(/&amp;/g, "&");
const KIND_TYPE: Record<string, string> = { cafe: "cafe", shop: "cafe", stay: "stay", route: "guide", thing: "tourism" };

/** Claim an existing place on a town guide, or register a business that isn't listed yet. */
export function PartnerClaim({ userId, email, towns, places }: { userId: string | null; email: string | null; towns: { id: string; name: string }[]; places: Place[] }) {
  const router = useRouter();
  const [town, setTown] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [business, setBusiness] = useState("");
  const [type, setType] = useState("cafe");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const inTown = places.filter((p) => p.town_id === town && p.kind !== "route" && p.kind !== "thing");
  const submit = async () => {
    const biz = placeId ? inTown.find((p) => p.id === placeId)?.name || business : business;
    if (!town || !biz.trim()) return setMsg("Pick your town and tell us the business name.");
    if (!userId) return router.push(`/join?next=${encodeURIComponent("/partners/claim")}`);
    setBusy(true);
    const { data, error } = await supabaseBrowser().from("partners").insert({
      business: biz.trim(), type: placeId ? KIND_TYPE[inTown.find((p) => p.id === placeId)?.kind || "cafe"] || "cafe" : type,
      town_id: town, place_id: placeId || null, contact_name: name.trim() || null, email, owner_id: userId, plan: "claim", status: "enquiry",
    }).select("id").single();
    setBusy(false);
    if (error || !data) return setMsg(error?.message || "Something went wrong");
    router.push("/partners/dashboard?claimed=1");
  };
  return (
    <div className="wscorebox" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="field"><label>Your town</label>
        <select value={town} onChange={(e) => { setTown(e.target.value); setPlaceId(""); }}>
          <option value="">Choose…</option>
          {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div style={{ fontSize: 11.5, color: "var(--grey-m)", marginTop: 4 }}>Town not listed yet? <Link href="/partners#enquire">Send an enquiry</Link> and we’ll add it.</div>
      </div>
      {town && (
        <div className="field"><label>Is your business already on the {towns.find((t) => t.id === town)?.name} guide?</label>
          <select value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
            <option value="">No — add my business</option>
            {inTown.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.kind})</option>)}
          </select>
        </div>
      )}
      {town && !placeId && (
        <>
          <div className="field"><label>Business name</label><input value={business} onChange={(e) => setBusiness(e.target.value)} maxLength={80} /></div>
          <div className="field"><label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>{(partnerTypes as PType[]).map((p) => <option key={p.id} value={p.id}>{clean(p.name)}</option>)}</select>
          </div>
        </>
      )}
      <div className="field"><label>Your name</label><input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></div>
      <button className="lk-coral big" onClick={submit} disabled={busy}>{busy ? "Sending…" : userId ? "Claim this listing" : "Continue — join free to claim"}</button>
      {msg && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{msg}</div>}
      <p style={{ fontSize: 12, color: "var(--grey-m)", marginTop: 12 }}>Claiming is free. We check every claim by hand (usually within one business day) before the verified badge goes live.</p>
    </div>
  );
}

export type Partner = { id: string; business: string; type: string; town_id: string | null; place_id: string | null; plan: "claim" | "member" | "featured" | "custom"; status: "enquiry" | "active" | "paused"; description: string; website: string | null; phone: string | null; plan_until: string | null; stripe_customer_id: string | null };

/** Partner's own listing editor + plan upgrade. */
export function PartnerDashboardForm({ partner, enabled }: { partner: Partner; enabled: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ description: partner.description || "", website: partner.website || "", phone: partner.phone || "" });
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const save = async () => {
    setState("busy");
    await supabaseBrowser().from("partners").update(f).eq("id", partner.id);
    setState("saved");
    router.refresh();
  };
  const go = async (path: string, body?: unknown) => {
    setBusy(path + JSON.stringify(body || {}));
    setErr("");
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (j.url) window.location.href = j.url;
    else { setErr(j.error || "Something went wrong"); setBusy(null); }
  };
  return (
    <div className="twocol">
      <div className="wscorebox" style={{ maxWidth: "none" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Your listing</h3>
        <div className="field"><label>Description riders see</label><textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={300} placeholder="What makes you bike-friendly? Storage, wash bay, early opening, group bookings…" /></div>
        <div className="field"><label>Website</label><input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} placeholder="https://" /></div>
        <div className="field"><label>Phone</label><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <button className="lk-coral" onClick={save} disabled={state === "busy"}>{state === "busy" ? "Saving…" : "Save"}</button>
        {state === "saved" && <b style={{ marginLeft: 10, color: "#177245", fontSize: 13 }}>Saved ✓</b>}
      </div>
      <div className="wscorebox" style={{ maxWidth: "none" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Plan: {partner.plan === "claim" ? "Claimed (free)" : partner.plan[0].toUpperCase() + partner.plan.slice(1)}</h3>
        <p className="wsub" style={{ display: "block", marginBottom: 12 }}>
          {partner.status === "enquiry" ? "We’re verifying your claim — the badge and plans unlock once it’s approved." : partner.plan === "claim" ? "Verified. Upgrade for the dashboard, audience insights and member offers." : `Active${partner.plan_until ? ` · renews ${new Date(partner.plan_until).toLocaleDateString("en-AU")}` : ""}`}
        </p>
        {partner.status === "active" && (
          <div className="wbar" style={{ alignItems: "center" }}>
            {partner.plan === "claim" && enabled && <button className="lk-coral" onClick={() => go("/api/stripe/checkout", { plan: "partner_member", partnerId: partner.id })} disabled={!!busy}>Member — A$49 / mo</button>}
            {partner.plan !== "featured" && enabled && <button className={partner.plan === "claim" ? "lk-ghost" : "lk-coral"} onClick={() => go("/api/stripe/checkout", { plan: "partner_featured", partnerId: partner.id })} disabled={!!busy}>Featured — A$290 / mo</button>}
            {partner.plan !== "claim" && partner.stripe_customer_id && <button className="lk-ghost" onClick={() => go("/api/stripe/portal")} disabled={!!busy}>Manage billing</button>}
            {!enabled && partner.plan === "claim" && <span className="wsub">Paid plans open shortly.</span>}
            {err && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{err}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
