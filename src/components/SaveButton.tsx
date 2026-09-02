"use client";
import { useSyncExternalStore } from "react";

/* Saved towns live in the browser until accounts arrive (phase 2), then sync to the rider's profile. */
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
/** Current saved ids, kept in sync across components and tabs. Empty on the server. */
export function useSaved(): string[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export function toggleSaved(id: string) {
  const cur = readSaved();
  writeSaved(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

export function SaveButton({ id, light = false }: { id: string; light?: boolean }) {
  const saved = useSaved().includes(id);
  return (
    <button
      className="lk-ghost big"
      style={light ? { color: "#fff", borderColor: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.1)" } : undefined}
      onClick={() => toggleSaved(id)}
      aria-pressed={saved}
    >
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
