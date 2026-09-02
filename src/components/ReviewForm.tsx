"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DIM_LABELS, type ScoreDims } from "@/lib/towns";

const DIMS = Object.keys(DIM_LABELS) as (keyof ScoreDims)[];
const RIDE_TYPES = ["Road", "Gravel", "MTB", "E-bike", "Touring", "Family"];

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="stars" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} className={"star" + (n <= value ? " on" : "")} onClick={() => onChange(n)} aria-label={`${n} of 5`}>
          ★
        </button>
      ))}
    </span>
  );
}

/** Rate a town on the five Cyclist Score dimensions. One review per rider per town (editing replaces it). */
export function ReviewForm({ townId, townName, userId, existing }: { townId: string; townName: string; userId: string | null; existing?: Partial<Record<keyof ScoreDims, number>> & { body?: string; ride_type?: string | null } }) {
  const router = useRouter();
  const [dims, setDims] = useState<Record<keyof ScoreDims, number>>({
    cafes: existing?.cafes || 0, routes: existing?.routes || 0, safety: existing?.safety || 0, climbs: existing?.climbs || 0, storage: existing?.storage || 0,
  });
  const [body, setBody] = useState(existing?.body || "");
  const [rideType, setRideType] = useState(existing?.ride_type || "Road");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (!userId)
    return (
      <div className="unlocknote" style={{ fontSize: 14, padding: 16 }}>
        <Link href={`/join?review=${townId}`}>Join free</Link> or <Link href={`/login?next=/towns/${townId}%23review`}>log in</Link> to review {townName}. Reviews earn 50 points.
      </div>
    );
  const complete = DIMS.every((d) => dims[d] > 0);
  const submit = async () => {
    if (!complete) return setMsg("Give every dimension a star rating first.");
    setState("busy");
    setMsg("");
    const { error } = await supabaseBrowser().from("reviews").upsert(
      { user_id: userId, town_id: townId, ...dims, body: body.trim(), ride_type: rideType, updated_at: new Date().toISOString() },
      { onConflict: "user_id,town_id" },
    );
    if (error) {
      setMsg(error.message);
      setState("error");
    } else {
      setState("done");
      router.refresh();
    }
  };
  if (state === "done")
    return (
      <div className="unlocknote" style={{ fontSize: 14, padding: 16 }}>
        ⭐ Thanks — your review of {townName} is live and counts toward its Cyclist Score.
      </div>
    );
  return (
    <div className="wscorebox" style={{ maxWidth: "none" }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{existing ? "Update your review" : `Rate ${townName}`}</h3>
      <div className="csub" style={{ color: "var(--grey-m)", fontSize: 12, marginBottom: 10 }}>Five things that matter. Be honest — it’s the whole point.</div>
      {DIMS.map((d) => (
        <div className="dimrow" key={d} style={{ margin: "10px 0" }}>
          <span className="dl" style={{ width: 120 }}>{DIM_LABELS[d][0]} {DIM_LABELS[d][1]}</span>
          <Stars value={dims[d]} onChange={(v) => setDims({ ...dims, [d]: v })} />
        </div>
      ))}
      <div className="field" style={{ marginTop: 12 }}>
        <label>How did you ride it?</label>
        <div className="filterchips">
          {RIDE_TYPES.map((r) => (
            <button key={r} type="button" className={"filterchip" + (rideType === r ? " on" : "")} onClick={() => setRideType(r)}>{r}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Your review (optional)</label>
        <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="The rides, the coffee, the roads — what should the next rider know?" maxLength={2000} />
      </div>
      <button className="lk-coral big" onClick={submit} disabled={state === "busy"}>{state === "busy" ? "Saving…" : "Publish review"}</button>
      {msg && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
