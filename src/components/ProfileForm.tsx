"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/server";
import riderTypes from "@/data/rider-types.json";
import ability from "@/data/ability.json";
import countries from "@/data/countries.json";

export function ProfileForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter();
  const [f, setF] = useState({
    display_name: profile?.display_name || "",
    home_town: profile?.home_town || "",
    country: profile?.country || "",
    rider_type: profile?.rider_type || "",
    ability: profile?.ability || "",
    bio: profile?.bio || "",
  });
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });
  const save = async () => {
    setState("busy");
    const { error } = await supabaseBrowser().from("profiles").update({ ...f, onboarded: true }).eq("id", userId);
    if (error) {
      setMsg(error.message);
      setState("error");
    } else {
      setState("saved");
      router.refresh();
    }
  };
  return (
    <div className="wscorebox" style={{ maxWidth: "none" }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Rider profile</h3>
      <div className="field"><label>Name</label><input value={f.display_name} onChange={(e) => set("display_name", e.target.value)} maxLength={60} /></div>
      <div className="field"><label>Home town</label><input value={f.home_town} onChange={(e) => set("home_town", e.target.value)} placeholder="e.g. Ballarat" maxLength={60} /></div>
      <div className="field"><label>Country</label>
        <select value={f.country} onChange={(e) => set("country", e.target.value)}>
          <option value="">Choose…</option>
          {(countries as string[]).map((c) => <option key={c}>{c}</option>)}
          <option>Other</option>
        </select>
      </div>
      <div className="field"><label>How do you mostly ride?</label>
        <div className="filterchips">{(riderTypes as string[]).map((r) => <button key={r} type="button" className={"filterchip" + (f.rider_type === r ? " on" : "")} onClick={() => set("rider_type", r)}>{r}</button>)}</div>
      </div>
      <div className="field"><label>Ability</label>
        <div className="filterchips">{(ability as string[]).map((r) => <button key={r} type="button" className={"filterchip" + (f.ability === r ? " on" : "")} onClick={() => set("ability", r)}>{r}</button>)}</div>
      </div>
      <div className="field"><label>Bio</label><textarea rows={3} value={f.bio} onChange={(e) => set("bio", e.target.value)} maxLength={300} placeholder="Where you ride, what you chase." /></div>
      <button className="lk-coral big" onClick={save} disabled={state === "busy"}>{state === "busy" ? "Saving…" : "Save profile"}</button>
      {state === "saved" && <span style={{ marginLeft: 12, fontWeight: 700, color: "#177245", fontSize: 13 }}>Saved ✓</span>}
      {state === "error" && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
