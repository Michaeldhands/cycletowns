"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export type OfferRow = { id: string; partner: string; title: string; description: string; code: string | null; url: string | null; town_id: string | null; members_only: boolean; active: boolean; sort: number };
const blank = (): OfferRow => ({ id: "", partner: "", title: "", description: "", code: "", url: "", town_id: null, members_only: true, active: true, sort: 0 });

export function OffersEditor({ offers: initial, towns }: { offers: OfferRow[]; towns: { id: string; name: string }[] }) {
  const [offers, setOffers] = useState(initial);
  const [e, setE] = useState<OfferRow | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!e || !e.partner.trim() || !e.title.trim()) return;
    setBusy(true);
    const { id, ...rest } = { ...e, code: e.code || null, url: e.url || null, town_id: e.town_id || null };
    const { data, error } = await (id ? supabaseBrowser().from("offers").update(rest).eq("id", id).select().single() : supabaseBrowser().from("offers").insert({ ...rest, sort: offers.length }).select().single());
    setBusy(false);
    if (error || !data) return alert(error?.message || "Save failed");
    setOffers(id ? offers.map((o) => (o.id === id ? (data as OfferRow) : o)) : [...offers, data as OfferRow]);
    setE(null);
  };
  const remove = async (o: OfferRow) => {
    if (!confirm(`Delete “${o.title}”?`)) return;
    await supabaseBrowser().from("offers").delete().eq("id", o.id);
    setOffers(offers.filter((x) => x.id !== o.id));
  };
  return (
    <div className="acard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3>Partner offers</h3><button className="lk-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setE(blank())}>+ Add offer</button></div>
      <div className="csub">Shown on /offers. Members-only offers hide their code from free riders.</div>
      <table className="tbl"><thead><tr><th>Partner</th><th>Offer</th><th>Code</th><th>Who</th><th>Status</th><th></th></tr></thead><tbody>
        {offers.map((o) => (
          <tr key={o.id} style={{ opacity: o.active ? 1 : 0.55 }}>
            <td><b>{o.partner}</b>{o.town_id && <small style={{ color: "var(--grey-m)" }}> · {towns.find((t) => t.id === o.town_id)?.name}</small>}</td>
            <td>{o.title}</td><td>{o.code || "—"}</td><td>{o.members_only ? "Insiders" : "Everyone"}</td><td>{o.active ? "Live" : "Off"}</td>
            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }} onClick={() => setE(o)}>Edit</button>{" "}
              <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px", borderColor: "var(--coral)", color: "var(--coral-700)" }} onClick={() => remove(o)}>Delete</button>
            </td>
          </tr>
        ))}
        {!offers.length && <tr><td colSpan={6}>No offers yet.</td></tr>}
      </tbody></table>
      {e && (
        <div className="backdrop on" style={{ display: "flex" }} onClick={(ev) => ev.target === ev.currentTarget && setE(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <button className="x" onClick={() => setE(null)}>✕</button>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{e.id ? "Edit" : "Add"} offer</h3>
            <div className="field"><label>Partner</label><input value={e.partner} onChange={(ev) => setE({ ...e, partner: ev.target.value })} placeholder="e.g. Sixpence Coffee" /></div>
            <div className="field"><label>Offer</label><input value={e.title} onChange={(ev) => setE({ ...e, title: ev.target.value })} placeholder="10% off for Cycletowns riders" /></div>
            <div className="field"><label>Details</label><textarea rows={2} value={e.description} onChange={(ev) => setE({ ...e, description: ev.target.value })} /></div>
            <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field"><label>Code</label><input value={e.code || ""} onChange={(ev) => setE({ ...e, code: ev.target.value })} /></div>
              <div className="field"><label>Town</label><select value={e.town_id || ""} onChange={(ev) => setE({ ...e, town_id: ev.target.value || null })}><option value="">—</option>{towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            </div>
            <div className="field"><label>Link</label><input value={e.url || ""} onChange={(ev) => setE({ ...e, url: ev.target.value })} placeholder="https://…" /></div>
            <div className="field"><label style={{ fontWeight: 600 }}><input type="checkbox" checked={e.members_only} onChange={(ev) => setE({ ...e, members_only: ev.target.checked })} /> Insiders only</label>{" "}<label style={{ fontWeight: 600, marginLeft: 14 }}><input type="checkbox" checked={e.active} onChange={(ev) => setE({ ...e, active: ev.target.checked })} /> Live</label></div>
            <div className="wbar"><button className="lk-coral" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button><button className="lk-ghost" onClick={() => setE(null)}>Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
