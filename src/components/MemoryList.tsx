"use client";
import { useState } from "react";

type Mem = { id: string; fact: string; kind: string; created_at: string };

/** The rider's remembered facts, each deletable, plus a forget-everything button. */
export function MemoryList({ initial }: { initial: Mem[] }) {
  const [items, setItems] = useState(initial);
  const [err, setErr] = useState<string | null>(null);
  const del = async (body: { id?: string; all?: boolean }) => {
    setErr(null);
    const res = await fetch("/api/ask/memory", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return setErr("Couldn’t delete that — try again.");
    setItems(body.all ? [] : items.filter((m) => m.id !== body.id));
  };
  if (!items.length) return <div className="unlocknote" style={{ fontSize: 14, padding: 16 }}>Nothing remembered. Tell Ask Cycletowns how you ride and it will keep it here.</div>;
  return (
    <>
      <ul className="memlist">
        {items.map((m) => (
          <li key={m.id}>
            <div><b>{m.fact}</b><span>{m.kind} · {new Date(m.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span></div>
            <button type="button" className="lk-ghost" onClick={() => del({ id: m.id })}>Forget</button>
          </li>
        ))}
      </ul>
      {err && <p className="asknotice">{err}</p>}
      <button type="button" className="lk-ghost" style={{ marginTop: 14 }} onClick={() => confirm("Forget everything Ask Cycletowns remembers about you?") && del({ all: true })}>
        Forget everything
      </button>
    </>
  );
}
