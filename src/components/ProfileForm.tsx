"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/server";
import riderTypes from "@/data/rider-types.json";
import ability from "@/data/ability.json";
import countries from "@/data/countries.json";

/** The exact wording a rider agrees to. Stored with the consent so it can be evidenced later —
    if this sentence changes, existing consents keep the wording they were actually given. */
const CONSENT_TEXT = "Email me the Cycletowns newsletter — new town guides, routes and member offers.";

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
  const [optIn, setOptIn] = useState(Boolean(profile?.marketing_opt_in));
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });
  const save = async () => {
    setState("busy");
    const patch: Record<string, unknown> = { ...f, onboarded: true, marketing_opt_in: optIn };
    // Record the exact wording consented to, so the consent can be evidenced later.
    if (optIn && !profile?.marketing_opt_in) patch.marketing_consent_text = CONSENT_TEXT;
    const { error } = await supabaseBrowser().from("profiles").update(patch).eq("id", userId);
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
      <div className="field" style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 4 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", fontWeight: 600 }}>
          <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>
            {CONSENT_TEXT}
            <span style={{ display: "block", color: "var(--grey-m)", fontWeight: 500, marginTop: 3 }}>
              Optional — leave it unticked and we&rsquo;ll only email you about your account. Unsubscribe any time.
            </span>
          </span>
        </label>
      </div>
      <div className="field"><label>Bio</label><textarea rows={3} value={f.bio} onChange={(e) => set("bio", e.target.value)} maxLength={300} placeholder="Where you ride, what you chase." /></div>
      <button className="lk-coral big" onClick={save} disabled={state === "busy"}>{state === "busy" ? "Saving…" : "Save profile"}</button>
      {state === "saved" && <span style={{ marginLeft: 12, fontWeight: 700, color: "#177245", fontSize: 13 }}>Saved ✓</span>}
      {state === "error" && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
