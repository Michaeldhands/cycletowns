"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { revalidateContent } from "@/app/admin/actions";
import { ImageUpload } from "./Upload";
import { photoURL } from "@/lib/images";
import type { PlaceRow, RaceRow, TownRow } from "@/lib/content";

const DIMS = ["cafes", "routes", "safety", "climbs", "storage"] as const;
const DIM_LABEL: Record<string, string> = { cafes: "Café culture", routes: "Routes", safety: "Road safety", climbs: "Climbs", storage: "Bike storage" };
const KINDS: { id: PlaceRow["kind"]; label: string }[] = [
  { id: "route", label: "Rides & climbs" },
  { id: "cafe", label: "Cafés" },
  { id: "shop", label: "Bike shops & hire" },
  { id: "stay", label: "Stays" },
  { id: "thing", label: "Things to do" },
];
const csv = (a: string[]) => a.join(", ");
const uncsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "var(--grey-m)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- town details */
export function TownForm({ town, isNew }: { town: TownRow; isNew?: boolean }) {
  const router = useRouter();
  const [t, setT] = useState<TownRow>({ ...town, editorial_dims: town.editorial_dims || { cafes: 4, routes: 4, safety: 4, climbs: 4, storage: 4 } });
  const [tags, setTags] = useState(csv(town.tags || []));
  const [gallery, setGallery] = useState<string[]>(town.gallery || []);
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");
  const set = <K extends keyof TownRow>(k: K, v: TownRow[K]) => setT({ ...t, [k]: v });
  const save = async () => {
    if (!t.id.match(/^[a-z0-9-]+$/) || !t.name.trim()) return setMsg("Needs a slug (lowercase letters, numbers, dashes) and a name.");
    setState("busy");
    setMsg("");
    const row = { ...t, tags: uncsv(tags), gallery, editorial_score: t.editorial_score === null || t.editorial_score === undefined ? null : Number(t.editorial_score), lat: t.lat === null ? null : Number(t.lat), lng: t.lng === null ? null : Number(t.lng) };
    const { error } = await supabaseBrowser().from("towns").upsert(row, { onConflict: "id" });
    if (error) {
      setMsg(error.message);
      setState("error");
      return;
    }
    await revalidateContent();
    setState("saved");
    if (isNew) router.push(`/admin/towns/${t.id}`);
    else router.refresh();
  };
  return (
    <div className="acard">
      <h3>Town details</h3>
      <div className="csub">What riders see on the guide and in rankings. Save publishes immediately.</div>
      <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Slug (URL)" hint="cycletowns.com/towns/…">
          <input value={t.id} disabled={!isNew} onChange={(e) => set("id", e.target.value.toLowerCase())} />
        </Field>
        <Field label="Status">
          <select value={t.status} onChange={(e) => set("status", e.target.value as TownRow["status"])}>
            <option value="full">Full guide (ranked)</option>
            <option value="radar">On the radar (preview only)</option>
            <option value="hidden">Hidden</option>
          </select>
        </Field>
        <Field label="Name"><input value={t.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Region"><input value={t.region} onChange={(e) => set("region", e.target.value)} /></Field>
        <Field label="Country"><input value={t.country} onChange={(e) => set("country", e.target.value)} /></Field>
        <Field label="Flag emoji"><input value={t.flag} onChange={(e) => set("flag", e.target.value)} /></Field>
        <Field label="Currency symbol"><input value={t.currency} onChange={(e) => set("currency", e.target.value)} /></Field>
        <Field label="Editorial launch score (0–5)" hint="Used until the town has 5 rider reviews">
          <input type="number" step="0.1" min="0" max="5" value={t.editorial_score ?? ""} onChange={(e) => set("editorial_score", e.target.value === "" ? null : (Number(e.target.value) as unknown as number))} />
        </Field>
        <Field label="Latitude"><input type="number" step="0.0001" value={t.lat ?? ""} onChange={(e) => set("lat", e.target.value === "" ? null : Number(e.target.value))} /></Field>
        <Field label="Longitude"><input type="number" step="0.0001" value={t.lng ?? ""} onChange={(e) => set("lng", e.target.value === "" ? null : Number(e.target.value))} /></Field>
      </div>
      <Field label="Tags" hint="Comma separated, first three show on cards — e.g. Alpine climbs, Gravel, Cafés">
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </Field>
      <Field label="Blurb"><textarea rows={3} value={t.blurb} onChange={(e) => set("blurb", e.target.value)} /></Field>
      <div className="field">
        <label>Score breakdown (editorial)</label>
        {DIMS.map((d) => (
          <div className="dimrow" key={d}>
            <span className="dl" style={{ width: 110 }}>{DIM_LABEL[d]}</span>
            <input type="range" min="1" max="5" step="0.1" value={t.editorial_dims?.[d] ?? 4} onChange={(e) => set("editorial_dims", { ...(t.editorial_dims || { cafes: 4, routes: 4, safety: 4, climbs: 4, storage: 4 }), [d]: Number(e.target.value) })} style={{ flex: 1 }} />
            <span className="dv">{(t.editorial_dims?.[d] ?? 4).toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="field">
        <label>Hero photo</label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {t.photo && <span style={{ position: "relative", width: 120, height: 76, borderRadius: 10, overflow: "hidden", display: "inline-block" }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={photoURL(t.photo, 400)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></span>}
          <ImageUpload folder={`towns/${t.id || "new"}`} onDone={(u) => set("photo", u)} label={t.photo ? "Replace photo" : "Upload photo"} />
          {t.photo && <button className="lk-ghost" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => set("photo", null)}>Remove</button>}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--grey-m)", marginTop: 4 }}>Or a Wikimedia Commons file name: <input value={t.photo && !t.photo.startsWith("http") ? t.photo : ""} onChange={(e) => set("photo", e.target.value || null)} placeholder="Onyar River Houses.JPG" style={{ width: 260, padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 8 }} /></div>
      </div>
      <div className="field">
        <label>Gallery</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {gallery.map((g, i) => (
            <span key={i} style={{ position: "relative", width: 88, height: 62, borderRadius: 8, overflow: "hidden", display: "inline-block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoURL(g, 300)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setGallery(gallery.filter((_, j) => j !== i))} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,.6)", color: "#fff", border: 0, borderRadius: 6, fontSize: 11, cursor: "pointer" }}>✕</button>
            </span>
          ))}
          <ImageUpload folder={`towns/${t.id || "new"}`} onDone={(u) => setGallery([...gallery, u])} label="+ Add" />
        </div>
      </div>
      <div className="wbar" style={{ alignItems: "center" }}>
        <button className="lk-coral big" onClick={save} disabled={state === "busy"}>{state === "busy" ? "Saving…" : isNew ? "Create town" : "Save town"}</button>
        {state === "saved" && <b style={{ color: "#177245", fontSize: 13 }}>Saved ✓</b>}
        {msg && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{msg}</span>}
        {!isNew && <Link href={`/towns/${t.id}`} className="lk-ghost" target="_blank">View live ›</Link>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- places */
const blank = (town_id: string, kind: PlaceRow["kind"]): PlaceRow => ({ id: "", town_id, kind, name: "", note: "", editorial_rating: 4.5, hire: false, price: null, discipline: kind === "route" ? "road" : null, km: null, vert: null, lat: null, lng: null, sort: 0 });

export function PlacesEditor({ townId, places: initial }: { townId: string; places: PlaceRow[] }) {
  const [places, setPlaces] = useState(initial);
  const [editing, setEditing] = useState<PlaceRow | null>(null);
  const [busy, setBusy] = useState(false);
  const sb = () => supabaseBrowser();
  const save = async () => {
    if (!editing || !editing.name.trim()) return;
    setBusy(true);
    const row = { ...editing, town_id: townId, editorial_rating: editing.editorial_rating === null ? null : Number(editing.editorial_rating), price: editing.price === null || editing.price === ("" as unknown) ? null : Number(editing.price), km: editing.km ? Number(editing.km) : null, vert: editing.vert ? Number(editing.vert) : null };
    const { id, ...rest } = row;
    const q = id ? sb().from("places").update(rest).eq("id", id).select().single() : sb().from("places").insert({ ...rest, sort: places.filter((p) => p.kind === rest.kind).length }).select().single();
    const { data, error } = await q;
    setBusy(false);
    if (error || !data) return alert(error?.message || "Save failed");
    setPlaces(id ? places.map((p) => (p.id === id ? (data as PlaceRow) : p)) : [...places, data as PlaceRow]);
    setEditing(null);
    revalidateContent();
  };
  const remove = async (p: PlaceRow) => {
    if (!confirm(`Delete “${p.name}”?`)) return;
    await sb().from("places").delete().eq("id", p.id);
    setPlaces(places.filter((x) => x.id !== p.id));
    revalidateContent();
  };
  return (
    <div className="acard">
      <h3>Places</h3>
      <div className="csub">Rides, cafés, shops, stays and things to do. Venue cards link to Google Maps by name, so spell names the way Maps does.</div>
      {KINDS.map((k) => (
        <div key={k.id} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <b style={{ fontSize: 13 }}>{k.label} <span style={{ color: "var(--grey-m)", fontWeight: 600 }}>· {places.filter((p) => p.kind === k.id).length}</span></b>
            <button className="lk-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setEditing(blank(townId, k.id))}>+ Add</button>
          </div>
          <table className="tbl"><tbody>
            {places.filter((p) => p.kind === k.id).sort((a, b) => a.sort - b.sort).map((p) => (
              <tr key={p.id}>
                <td style={{ width: "30%" }}><b>{p.name}</b>{p.hire && <span className="wpill" style={{ position: "static", marginLeft: 6 }}>hire</span>}</td>
                <td style={{ color: "var(--grey-d)" }}>{p.note}</td>
                <td style={{ whiteSpace: "nowrap" }}>{p.editorial_rating != null && `★ ${Number(p.editorial_rating).toFixed(1)}`}{p.kind === "route" && p.discipline ? ` · ${p.discipline}` : ""}</td>
                <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }} onClick={() => setEditing(p)}>Edit</button>{" "}
                  <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px", borderColor: "var(--coral)", color: "var(--coral-700)" }} onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody></table>
        </div>
      ))}
      {editing && (
        <div className="backdrop on" style={{ display: "flex" }} onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <button className="x" onClick={() => setEditing(null)}>✕</button>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{editing.id ? "Edit" : "Add"} {KINDS.find((k) => k.id === editing.kind)?.label.toLowerCase()}</h3>
            <Field label="Name"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Note" hint="One line riders will see on the card"><input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></Field>
            {editing.kind !== "thing" && editing.kind !== "stay" && (
              <Field label="Editorial rating (0–5)"><input type="number" step="0.1" min="0" max="5" value={editing.editorial_rating ?? ""} onChange={(e) => setEditing({ ...editing, editorial_rating: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
            )}
            {editing.kind === "route" && (
              <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <Field label="Discipline">
                  <select value={editing.discipline || "road"} onChange={(e) => setEditing({ ...editing, discipline: e.target.value })}>
                    <option value="road">Road</option><option value="climbs">Climb</option><option value="gravel">Gravel</option><option value="mtb">MTB</option>
                  </select>
                </Field>
                <Field label="km"><input type="number" value={editing.km ?? ""} onChange={(e) => setEditing({ ...editing, km: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
                <Field label="Elevation m"><input type="number" value={editing.vert ?? ""} onChange={(e) => setEditing({ ...editing, vert: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
              </div>
            )}
            {editing.kind === "shop" && (
              <Field label="Bike hire"><label style={{ fontWeight: 600, fontSize: 14 }}><input type="checkbox" checked={editing.hire} onChange={(e) => setEditing({ ...editing, hire: e.target.checked })} /> Offers hire</label></Field>
            )}
            {editing.kind === "stay" && <Field label="From price (per night)"><input type="number" value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: e.target.value === "" ? null : Number(e.target.value) })} /></Field>}
            {editing.kind === "thing" && <Field label="Emoji + note" hint="Note above should start with an emoji, e.g. 🌸 Pine forests and lakes"><span /></Field>}
            <div className="wbar"><button className="lk-coral" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button><button className="lk-ghost" onClick={() => setEditing(null)}>Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- races */
const blankRace = (town_id: string): RaceRow => ({ id: "", town_id, kind: "fondo", badge: "🏆", name: "", series: "", km: null, vert: null, race_date: null, status: "annual", discipline: "road", note: "", sort: 0 });

export function RacesEditor({ townId, races: initial }: { townId: string; races: RaceRow[] }) {
  const [races, setRaces] = useState(initial);
  const [editing, setEditing] = useState<RaceRow | null>(null);
  const [busy, setBusy] = useState(false);
  const sb = () => supabaseBrowser();
  const save = async () => {
    if (!editing || !editing.name.trim()) return;
    setBusy(true);
    const { id, ...rest } = { ...editing, km: editing.km ? Number(editing.km) : null, vert: editing.vert ? Number(editing.vert) : null, race_date: editing.race_date || null, series: editing.series || null };
    const { data, error } = await (id ? sb().from("races").update(rest).eq("id", id).select().single() : sb().from("races").insert({ ...rest, sort: races.length }).select().single());
    setBusy(false);
    if (error || !data) return alert(error?.message || "Save failed");
    setRaces(id ? races.map((r) => (r.id === id ? (data as RaceRow) : r)) : [...races, data as RaceRow]);
    setEditing(null);
    revalidateContent();
  };
  const remove = async (r: RaceRow) => {
    if (!confirm(`Delete “${r.name}”?`)) return;
    await sb().from("races").delete().eq("id", r.id);
    setRaces(races.filter((x) => x.id !== r.id));
    revalidateContent();
  };
  return (
    <div className="acard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3>Races & events</h3><button className="lk-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setEditing(blankRace(townId))}>+ Add</button></div>
      <div className="csub">Pro stages, gran fondos and MTB races riders can ride themselves. Only list real events.</div>
      <table className="tbl"><tbody>
        {races.map((r) => (
          <tr key={r.id}>
            <td><b>{r.badge} {r.name}</b><br /><small style={{ color: "var(--grey-m)" }}>{r.series}</small></td>
            <td>{r.km} km · {r.vert} m</td>
            <td>{r.race_date || r.status}</td>
            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }} onClick={() => setEditing(r)}>Edit</button>{" "}
              <button className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px", borderColor: "var(--coral)", color: "var(--coral-700)" }} onClick={() => remove(r)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody></table>
      {editing && (
        <div className="backdrop on" style={{ display: "flex" }} onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <button className="x" onClick={() => setEditing(null)}>✕</button>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{editing.id ? "Edit" : "Add"} race</h3>
            <Field label="Name"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Series / organiser"><input value={editing.series || ""} onChange={(e) => setEditing({ ...editing, series: e.target.value })} /></Field>
            <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="Type">
                <select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as RaceRow["kind"], badge: e.target.value === "pro" ? "🏔️" : e.target.value === "mtb" ? "🚵" : "🏆" })}>
                  <option value="fondo">Gran fondo</option><option value="pro">Pro stage</option><option value="mtb">MTB race</option>
                </select>
              </Field>
              <Field label="km"><input type="number" value={editing.km ?? ""} onChange={(e) => setEditing({ ...editing, km: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
              <Field label="Elevation m"><input type="number" value={editing.vert ?? ""} onChange={(e) => setEditing({ ...editing, vert: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
            </div>
            <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Next date" hint="Leave blank for historic routes"><input type="date" value={editing.race_date || ""} onChange={(e) => setEditing({ ...editing, race_date: e.target.value || null })} /></Field>
              <Field label="Status">
                <select value={editing.status || "annual"} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="upcoming">Upcoming</option><option value="annual">Annual</option><option value="historic">Historic route</option><option value="epic">Bucket-list epic</option>
                </select>
              </Field>
            </div>
            <Field label="Note"><textarea rows={2} value={editing.note || ""} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></Field>
            <div className="wbar"><button className="lk-coral" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button><button className="lk-ghost" onClick={() => setEditing(null)}>Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
