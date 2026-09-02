"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TOWNS, LITE_TOWNS } from "@/lib/towns";

/** Hero search box: jumps straight to a town when there's a clear match, otherwise to the towns list. */
export function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const go = () => {
    const s = q.trim().toLowerCase();
    if (!s) return router.push("/towns");
    const full = TOWNS.find((t) => t.name.toLowerCase().startsWith(s) || t.id === s);
    if (full) return router.push(`/towns/${full.id}`);
    const lite = LITE_TOWNS.find((t) => t.name.toLowerCase().startsWith(s));
    if (lite) return router.push(`/towns/${lite.slug}`);
    router.push(`/towns?q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <div className="herosearch">
      <input
        placeholder="Search a town, e.g. Bright or Girona…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go();
        }}
        aria-label="Search towns"
      />
      <button onClick={go}>Search</button>
    </div>
  );
}
