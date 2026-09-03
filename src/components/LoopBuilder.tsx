"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LoopMap } from "./LoopMap";
import { LOOP_DISCIPLINES, elevationPath, estimateHours, km as fmtKm, loopGrade, metres, prettyHours, toGpx, type LoopResult } from "@/lib/loops";
import { slugify } from "@/lib/towns";

export type LoopTown = { id: string; name: string; lat: number | null; lng: number | null };

export function LoopStats({ result, discipline }: { result: LoopResult; discipline: string }) {
  const grade = loopGrade(result.distance_m, result.ascent_m);
  const prof = elevationPath(result.coords);
  return (
    <>
      <div className="kpis" style={{ marginBottom: 14 }}>
        <div className="kpi"><div className="k">Distance</div><div className="v">{fmtKm(result.distance_m)}</div></div>
        <div className="kpi"><div className="k">Climbing</div><div className="v">{metres(result.ascent_m)}</div></div>
        <div className="kpi"><div className="k">Rough time</div><div className="v">{prettyHours(estimateHours(result.distance_m, result.ascent_m, discipline))}</div></div>
        <div className="kpi"><div className="k">Grade</div><div className="v" style={{ color: grade.color }}>{grade.label}</div></div>
      </div>
      {prof && (
        <div className="elebox">
          <div className="elehead">Elevation · {Math.round(prof.min)}–{Math.round(prof.max)} m</div>
          <svg viewBox="0 0 600 90" preserveAspectRatio="none" className="elesvg" role="img" aria-label="Elevation profile">
            <path d={prof.d} fill="rgba(1,83,108,.16)" stroke="#01536C" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      )}
    </>
  );
}

export function LoopBuilder({ towns, initialTown, userId, routerOn }: { towns: LoopTown[]; initialTown?: string; userId: string | null; routerOn: boolean }) {
  const [townId, setTownId] = useState(initialTown && towns.some((t) => t.id === initialTown) ? initialTown : "");
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState(50);
  const [discipline, setDiscipline] = useState("road");
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState<LoopResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const town = towns.find((t) => t.id === townId);
  const origin = start || (town && town.lat != null && town.lng != null ? { lat: town.lat, lng: town.lng } : null);
  const startName = start ? "your pin" : town ? `${town.name} town centre` : "";

  const build = async (nextSeed?: number) => {
    if (!origin) return setErr("That town doesn’t have map coordinates yet — drop a pin on the map instead.");
    const s = nextSeed ?? seed;
    setBusy(true);
    setErr("");
    setSaved(null);
    try {
      const r = await fetch("/api/loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: origin.lat, lng: origin.lng, km: distance, discipline, seed: s }),
      });
      const j = await r.json();
      if (!r.ok) setErr(j.error || "Couldn’t build that loop.");
      else {
        setResult(j as LoopResult);
        setSeed(s);
      }
    } catch {
      setErr("Couldn’t reach the route service. Try again in a moment.");
    }
    setBusy(false);
  };

  const download = () => {
    if (!result || !town) return;
    const name = `${town.name} ${fmtKm(result.distance_m)} loop`;
    const blob = new Blob([toGpx(name, result.coords, town.name)], { type: "application/gpx+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(name)}.gpx`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const save = async () => {
    if (!result || !town || !userId) return;
    setBusy(true);
    const slug = `${town.id}-${Math.round(result.distance_m / 1000)}km-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await supabaseBrowser().from("loops").insert({
      slug, user_id: userId, town_id: town.id, name: `${town.name} ${fmtKm(result.distance_m)} loop`,
      start_name: startName, discipline, distance_m: result.distance_m, ascent_m: result.ascent_m, geometry: result.coords,
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSaved(slug);
  };

  return (
    <>
      <div className="wscorebox" style={{ maxWidth: "none" }}>
        <div className="field">
          <label>Town</label>
          <select value={townId} onChange={(e) => { setTownId(e.target.value); setStart(null); setResult(null); setErr(""); }}>
            <option value="">Choose a town…</option>
            {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {town && !result && origin && (
          <div className="field">
            <label>Start point — {start ? "your pin" : "town centre"}</label>
            <LoopMap coords={[]} start={{ lat: origin.lat, lng: origin.lng, name: startName }} height={260} onPick={(p) => { setStart(p); setErr(""); }} />
            <div style={{ fontSize: 11.5, color: "var(--grey-m)", marginTop: 4 }}>
              Click the map to start somewhere else — your accommodation, a car park, the café you always meet at.
              {start && <> <button className="lk-ghost" style={{ padding: "2px 8px", fontSize: 11.5, marginLeft: 6 }} onClick={() => setStart(null)}>Reset to town centre</button></>}
            </div>
          </div>
        )}
        <div className="field">
          <label>How far? <b style={{ color: "var(--coral)" }}>{distance} km</b></label>
          <input type="range" min={15} max={160} step={5} value={distance} onChange={(e) => setDistance(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div className="field">
          <label>What are you riding?</label>
          <div className="filterchips">
            {LOOP_DISCIPLINES.map((d) => (
              <button key={d.id} type="button" className={"filterchip" + (discipline === d.id ? " on" : "")} onClick={() => setDiscipline(d.id)}>{d.label}</button>
            ))}
          </div>
        </div>
        {!routerOn ? (
          <div className="unlocknote" style={{ fontSize: 14, padding: 14 }}>
            Route building isn’t switched on yet — it needs the routing service connected. Everything else on the site works as normal.
          </div>
        ) : (
          <div className="wbar" style={{ alignItems: "center" }}>
            <button className="lk-coral big" onClick={() => build(Math.floor(Math.random() * 9999))} disabled={!townId || busy}>
              {busy ? "Finding roads…" : result ? "Build another" : "Build my loop"}
            </button>
            {result && !busy && <button className="lk-ghost" onClick={() => build(Math.floor(Math.random() * 9999))}>🎲 Different loop, same distance</button>}
          </div>
        )}
        {err && <div style={{ color: "var(--coral-700)", fontWeight: 700, fontSize: 13, marginTop: 10 }}>{err}</div>}
      </div>

      {result && town && (
        <div style={{ marginTop: 24 }}>
          <div className="wh">
            <div>
              <h2 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 31 }}>{fmtKm(result.distance_m)} from {startName}</h2>
              <span className="wsub">
                On real roads and paths. Check it against local conditions before you ride it.
                {result.requested_m != null && Math.abs(result.distance_m - result.requested_m) / result.requested_m > 0.15 && (
                  <> This is the closest loop the roads around here allow to your {Math.round(result.requested_m / 1000)} km — try rolling for another.</>
                )}
              </span>
            </div>
            <div className="wbar">
              <button className="lk-ghost" onClick={download}>⬇ GPX</button>
              {userId ? (
                <button className="lk-coral" onClick={save} disabled={busy || !!saved}>{saved ? "Saved ✓" : "Save loop"}</button>
              ) : (
                <Link href={`/join?next=${encodeURIComponent(`/loop?town=${town.id}`)}`} className="lk-coral">Join free to save</Link>
              )}
            </div>
          </div>
          {saved && <div className="unlocknote" style={{ marginBottom: 14 }}>Saved. Share it: <Link href={`/loop/${saved}`}>cycletowns.com/loop/{saved}</Link></div>}
          <LoopStats result={result} discipline={discipline} />
          <div style={{ marginTop: 14 }}>
            <LoopMap coords={result.coords} start={origin ? { lat: origin.lat, lng: origin.lng, name: startName } : undefined} />
          </div>
          <p className="photocredit" style={{ marginTop: 12 }}>
            Generated automatically from OpenStreetMap data — it follows real roads and paths, but nobody has ridden this
            exact loop for you. Check surfaces, traffic and gates before you commit, and carry the GPX rather than relying on signage.
          </p>
        </div>
      )}
    </>
  );
}
