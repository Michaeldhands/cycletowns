"use client";
import { useEffect, useSyncExternalStore } from "react";
import { hasSupabaseClient, supabaseBrowser } from "@/lib/supabase/client";

/* Saved towns: kept in the browser for guests; synced to the rider's account when signed in. */
const KEY = "ct_saved";
const EVT = "ct-saved-change";

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) || "[]";
  } catch {
    return "[]";
  }
}
export function readSaved(): string[] {
  try {
    const v = JSON.parse(readRaw());
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function writeSaved(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}
function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}
export function useSaved(): string[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

let syncedFor: string | null = null;
/** Once per session for a signed-in rider: merge browser saves into the account and pull the account list back. */
export function useSyncSaved(userId?: string | null) {
  useEffect(() => {
    if (!userId || !hasSupabaseClient() || syncedFor === userId) return;
    syncedFor = userId;
    (async () => {
      const sb = supabaseBrowser();
      const local = readSaved();
      if (local.length) await sb.from("saved_towns").upsert(local.map((town_id) => ({ user_id: userId, town_id })), { onConflict: "user_id,town_id" });
      const { data } = await sb.from("saved_towns").select("town_id").eq("user_id", userId);
      if (data) writeSaved(data.map((r: { town_id: string }) => r.town_id));
    })();
  }, [userId]);
}

export async function toggleSaved(id: string, userId?: string | null) {
  const cur = readSaved();
  const on = !cur.includes(id);
  writeSaved(on ? [...cur, id] : cur.filter((x) => x !== id));
  if (userId && hasSupabaseClient()) {
    const sb = supabaseBrowser();
    if (on) await sb.from("saved_towns").upsert({ user_id: userId, town_id: id }, { onConflict: "user_id,town_id" });
    else await sb.from("saved_towns").delete().eq("user_id", userId).eq("town_id", id);
  }
}

export function SaveButton({ id, light = false, userId }: { id: string; light?: boolean; userId?: string | null }) {
  useSyncSaved(userId);
  const saved = useSaved().includes(id);
  return (
    <button
      className="lk-ghost big"
      style={light ? { color: "#fff", borderColor: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.1)" } : undefined}
      onClick={() => toggleSaved(id, userId)}
      aria-pressed={saved}
    >
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
