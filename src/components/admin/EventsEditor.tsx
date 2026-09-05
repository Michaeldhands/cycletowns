"use client";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ImageUpload } from "./Upload";
import { DISCIPLINES, type CtEvent } from "@/lib/events";

export type EventRow = CtEvent & { id: string; status: "published" | "hidden"; sort: number };

const blank = (): EventRow => ({
  id: "", slug: "", name: "", organiser: "", url: "", country: "", region: "", town_id: null,
  next_date: null, window: "", km: [], vert: null, discipline: "road", month: "", note: "",
  verified: new Date().toISOString().slice(0, 10), img: null, status: "published", sort: 0,
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const today = () => new Date().toISOString().slice(0, 10);

/** True when a published date has already gone by — the thing most likely to be wrong on this page. */
const datePassed = (e: EventRow) => Boolean(e.next_date && e.next_date < today());
const staleCheck = (e: EventRow) => !e.verified || e.verified < new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10);

export function EventsEditor({ events: initial, towns }: { events: EventRow[]; towns: { id: string; name: string }[] }) {
  const [events, setEvents] = useState(initial);
  const [e, setE] = useState<EventRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const needsCheck = useMemo(() => events.filter((x) => datePassed(x) || staleCheck(x)), [events]);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return events.filter((x) => !n || `${x.name} ${x.country} ${x.region}`.toLowerCase().includes(n));
  }, [events, q]);

  const save = async () => {
    if (!e || !e.name.trim()) return alert("An event needs a name.");
    if (!e.url?.trim()) return alert("An event needs its official site — that link is the whole point of the listing.");
    setBusy(true);
    const { id, ...rest } = {
      ...e,
      slug: e.slug || slugify(e.name),
      next_date: e.next_date || null,
      vert: e.vert === null || Number.isNaN(e.vert) ? null : e.vert,
      km: e.km.filter((k) => Number.isFinite(k)),
      organiser: e.organiser || null,
      verified: e.verified || null,
    };
    const sb = supabaseBrowser();
    const { data, error } = await (id
      ? sb.from("events").update(rest).eq("id", id).select().single()
      : sb.from("events").insert({ ...rest, sort: events.length }).select().single());
    setBusy(false);
    if (error || !data) return alert(error?.message || "Save failed");
    const row = data as EventRow;
    setEvents(id ? events.map((x) => (x.id === id ? row : x)) : [...events, row]);
    setE(null);
  };

  const remove = async (row: EventRow) => {
    if (!confirm(`Delete “${row.name}”? If it simply isn't running this year, set it to Hidden instead.`)) return;
    const { error } = await supabaseBrowser().from("events").delete().eq("id", row.id);
    if (error) return alert(error.message);
    setEvents(events.filter((x) => x.id !== row.id));
  };

  /** Confirming you've re-checked an event against its official site. */
  const markChecked = async (row: EventRow) => {
    const { error } = await supabaseBrowser().from("events").update({ verified: today() }).eq("id", row.id);
    if (error) return alert(error.message);
    setEvents(events.map((x) => (x.id === row.id ? { ...x, verified: today() } : x)));
  };

  return (
    <div className="acard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3>Events</h3>
        <button className="lk-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setE(blank())}>+ Add event</button>
      </div>
      <div className="csub">
        Shown on /events and on the town guide of any event with a town. Every listing needs the organiser&rsquo;s official
        site — riders enter there, not here.
      </div>

      {needsCheck.length > 0 && (
        <div className="unlocknote" style={{ fontSize: 13, padding: 12, margin: "12px 0" }}>
          <b>{needsCheck.length} event{needsCheck.length === 1 ? "" : "s"} to re-check.</b> A date that has passed, or
          nothing confirmed in six months. Open the organiser&rsquo;s site, update what changed, then mark it checked.
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {needsCheck.map((x) => (
              <button key={x.id} className="lk-ghost" style={{ fontSize: 11.5, padding: "4px 9px" }} onClick={() => setE(x)}>
                {datePassed(x) ? "📅 " : "⏳ "}{x.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        value={q}
        onChange={(ev) => setQ(ev.target.value)}
        placeholder="Filter events…"
        style={{ width: "100%", maxWidth: 300, padding: "8px 11px", borderRadius: 10, border: "1.5px solid var(--line)", fontSize: 13, margin: "10px 0" }}
      />

      <table className="tbl">
        <thead><tr><th>Event</th><th>When</th><th>Where</th><th>Checked</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {shown.map((x) => (
            <tr key={x.id} style={{ opacity: x.status === "published" ? 1 : 0.55 }}>
              <td>
                <b>{x.name}</b>
                <small style={{ color: "var(--grey-m)", display: "block" }}>{x.discipline}{x.town_id ? ` · ${towns.find((t) => t.id === x.town_id)?.name || x.town_id}` : ""}</small>
              </td>
              <td style={{ color: datePassed(x) ? "var(--coral-700)" : undefined, fontWeight: datePassed(x) ? 800 : undefined }}>
                {x.next_date || x.window || "—"}{datePassed(x) && " · passed"}
              </td>
              <td>{x.country}</td>
              <td style={{ color: staleCheck(x) ? "var(--coral-700)" : undefined }}>{x.verified || "never"}</td>
              <td>{x.status === "published" ? "Live" : "Hidden"}</td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }} onClick={() => setE(x)}>Edit</button>{" "}
                <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }} onClick={() => markChecked(x)}>Checked</button>{" "}
                <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px", borderColor: "var(--coral)", color: "var(--coral-700)" }} onClick={() => remove(x)}>Delete</button>
              </td>
            </tr>
          ))}
          {!shown.length && <tr><td colSpan={6}>No events match.</td></tr>}
        </tbody>
      </table>

      {e && (
        <div className="backdrop on" style={{ display: "flex" }} onClick={(ev) => ev.target === ev.currentTarget && setE(null)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <button className="x" onClick={() => setE(null)}>✕</button>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{e.id ? "Edit" : "Add"} event</h3>

            <div className="field"><label>Name</label><input value={e.name} onChange={(ev) => setE({ ...e, name: ev.target.value })} placeholder="Peaks Challenge Falls Creek" /></div>
            <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field"><label>Organiser</label><input value={e.organiser || ""} onChange={(ev) => setE({ ...e, organiser: ev.target.value })} /></div>
              <div className="field"><label>Discipline</label>
                <select value={e.discipline} onChange={(ev) => setE({ ...e, discipline: ev.target.value as CtEvent["discipline"] })}>
                  {DISCIPLINES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Official site <b style={{ color: "var(--coral)" }}>·  required</b></label><input value={e.url || ""} onChange={(ev) => setE({ ...e, url: ev.target.value })} placeholder="https://…" /></div>

            <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div className="field"><label>Country</label><input value={e.country || ""} onChange={(ev) => setE({ ...e, country: ev.target.value })} /></div>
              <div className="field"><label>Region</label><input value={e.region || ""} onChange={(ev) => setE({ ...e, region: ev.target.value })} /></div>
              <div className="field"><label>Town</label>
                <select value={e.town_id || ""} onChange={(ev) => setE({ ...e, town_id: ev.target.value || null })}>
                  <option value="">— none —</option>
                  {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field">
                <label>Next date</label>
                <input type="date" value={e.next_date || ""} onChange={(ev) => setE({ ...e, next_date: ev.target.value || null })} />
                <small style={{ color: "var(--grey-m)", fontSize: 11.5 }}>Only if the organiser has published it. Otherwise leave empty.</small>
              </div>
              <div className="field">
                <label>When it normally runs</label>
                <input value={e.window || ""} onChange={(ev) => setE({ ...e, window: ev.target.value })} placeholder="First Sunday in July, annually" />
                <small style={{ color: "var(--grey-m)", fontSize: 11.5 }}>Shown whenever there&rsquo;s no confirmed date.</small>
              </div>
            </div>

            <div className="cardgrid" style={{ gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
              <div className="field">
                <label>Distances (km)</label>
                <input
                  value={e.km.join(", ")}
                  onChange={(ev) => setE({ ...e, km: ev.target.value.split(",").map((k) => parseInt(k.trim(), 10)).filter((k) => Number.isFinite(k)) })}
                  placeholder="45, 90, 122"
                />
              </div>
              <div className="field"><label>Climbing (m)</label><input type="number" value={e.vert ?? ""} onChange={(ev) => setE({ ...e, vert: ev.target.value === "" ? null : parseInt(ev.target.value, 10) })} /></div>
              <div className="field"><label>Month</label><input value={e.month || ""} onChange={(ev) => setE({ ...e, month: ev.target.value })} placeholder="March" /></div>
            </div>

            <div className="field">
              <label>What the ride actually is</label>
              <textarea rows={4} value={e.note} onChange={(ev) => setE({ ...e, note: ev.target.value })} placeholder="Terrain, character, why riders travel for it. Two or three sentences." />
            </div>

            <div className="field">
              <label>Photo</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <ImageUpload folder={`events/${e.slug || slugify(e.name) || "new"}`} onDone={(url) => setE({ ...e, img: url })} label={e.img ? "Replace photo" : "Upload photo"} />
                {e.img && <button className="lk-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setE({ ...e, img: null })}>Remove</button>}
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview only */}
                {e.img && <img src={e.img} alt="" style={{ height: 46, borderRadius: 8 }} />}
              </div>
              <small style={{ color: "var(--grey-m)", fontSize: 11.5 }}>Use a photo you have the right to use. Without one, a generic riding shot is shown.</small>
            </div>

            <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field">
                <label>Last checked against the official site</label>
                <input type="date" value={e.verified || ""} onChange={(ev) => setE({ ...e, verified: ev.target.value || null })} />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={e.status} onChange={(ev) => setE({ ...e, status: ev.target.value as EventRow["status"] })}>
                  <option value="published">Live on the site</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <div className="wbar">
              <button className="lk-coral" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
              <button className="lk-ghost" onClick={() => setE(null)}>Cancel</button>
              {e.url && <a href={e.url} target="_blank" rel="noopener" className="lk-ghost" style={{ textDecoration: "none" }}>Open official site ↗</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
