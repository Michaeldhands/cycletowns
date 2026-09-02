"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Upload an image to the public media bucket and hand back its URL. */
export function ImageUpload({ folder, onDone, label = "Upload image" }: { folder: string; onDone: (url: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <label className="lk-ghost" style={{ cursor: "pointer", display: "inline-flex", fontSize: 12.5, padding: "7px 12px" }}>
      {busy ? "Uploading…" : label}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        disabled={busy}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          setErr("");
          const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
          const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const sb = supabaseBrowser();
          const { error } = await sb.storage.from("media").upload(path, f, { cacheControl: "31536000", upsert: false });
          setBusy(false);
          if (error) return setErr(error.message);
          onDone(sb.storage.from("media").getPublicUrl(path).data.publicUrl);
        }}
      />
      {err && <span style={{ color: "var(--coral-700)", marginLeft: 8 }}>{err}</span>}
    </label>
  );
}
