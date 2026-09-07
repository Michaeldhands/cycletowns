"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export type EnquiryRow = {
  id: string; business: string; contact: string; email: string; type: string | null;
  town_id: string | null; message: string | null; source: string | null;
  status: "new" | "contacted" | "won" | "lost"; crm_synced: boolean; crm_error: string | null;
  note: string | null; created_at: string;
};

const STATUS: EnquiryRow["status"][] = ["new", "contacted", "won", "lost"];
const COLOUR: Record<string, string> = { new: "var(--coral-700)", contacted: "var(--teal)", won: "#177245", lost: "var(--grey-m)" };

/** Partner enquiries — your pipeline, whether or not a CRM is connected. */
export function EnquiriesTable({ rows: initial, crmOn }: { rows: EnquiryRow[]; crmOn: boolean }) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);

  const setStatus = async (r: EnquiryRow, status: EnquiryRow["status"]) => {
    const { error } = await supabaseBrowser().from("enquiries").update({ status }).eq("id", r.id);
    if (error) return alert(error.message);
    setRows(rows.map((x) => (x.id === r.id ? { ...x, status } : x)));
  };
  const setNote = async (r: EnquiryRow, note: string) => {
    const { error } = await supabaseBrowser().from("enquiries").update({ note: note || null }).eq("id", r.id);
    if (error) return alert(error.message);
    setRows(rows.map((x) => (x.id === r.id ? { ...x, note } : x)));
  };

  const unsynced = rows.filter((r) => !r.crm_synced && r.crm_error);

  return (
    <div className="acard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Partner enquiries</h3>
        <span className="csub" style={{ margin: 0 }}>{crmOn ? "CRM connected" : "No CRM connected — enquiries are kept here"}</span>
      </div>
      <div className="csub">Every enquiry from the partners page. Saved here first, so nothing is lost if the CRM is down.</div>

      {unsynced.length > 0 && (
        <div className="unlocknote" style={{ fontSize: 13, padding: 12, margin: "12px 0" }}>
          <b>{unsynced.length} didn&rsquo;t reach the CRM.</b> They&rsquo;re safe here — add them by hand, or fix the
          connection and they&rsquo;ll sync on the next enquiry. Last error: <code>{unsynced[0].crm_error}</code>
        </div>
      )}

      <table className="tbl">
        <thead><tr><th>Business</th><th>Contact</th><th>Where</th><th>Received</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <b>{r.business}</b>
                <small style={{ color: "var(--grey-m)", display: "block" }}>{r.type || "—"}{!r.crm_synced && crmOn ? " · not in CRM" : ""}</small>
              </td>
              <td>{r.contact}<br /><a href={`mailto:${r.email}`}>{r.email}</a></td>
              <td>{r.town_id || "—"}</td>
              <td>{new Date(r.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</td>
              <td>
                <select value={r.status} onChange={(e) => setStatus(r, e.target.value as EnquiryRow["status"])}
                  style={{ fontSize: 12, padding: "3px 6px", borderRadius: 8, border: "1px solid var(--line)", color: COLOUR[r.status], fontWeight: 800 }}>
                  {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td style={{ textAlign: "right" }}>
                <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }} onClick={() => setOpen(open === r.id ? null : r.id)}>
                  {open === r.id ? "Close" : "Open"}
                </button>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6}>No enquiries yet.</td></tr>}
        </tbody>
      </table>

      {open && (() => {
        const r = rows.find((x) => x.id === open)!;
        return (
          <div className="sandbox" style={{ marginTop: 14, background: "var(--paper)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{r.business}</div>
            {r.message && <p style={{ fontSize: 14, marginBottom: 10 }}>{r.message}</p>}
            <div className="field">
              <label>Your notes</label>
              <textarea rows={3} defaultValue={r.note || ""} onBlur={(e) => setNote(r, e.target.value)} placeholder="What you agreed, when you called…" />
            </div>
            <a className="lk-coral" href={`mailto:${r.email}?subject=${encodeURIComponent("Cycletowns partner pack — " + r.business)}`} style={{ textDecoration: "none" }}>
              Reply by email ›
            </a>
          </div>
        );
      })()}
    </div>
  );
}
