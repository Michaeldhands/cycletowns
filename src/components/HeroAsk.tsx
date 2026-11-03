"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TOWNS, LITE_TOWNS } from "@/lib/towns";
import { askHref, openAsk } from "@/lib/ask/open";

/* The home page's front door. One box that does two jobs: type a town and it takes you there;
   type anything else — "a gravel weekend near Melbourne" — and Ask Cycletowns answers it. */

const townFor = (s: string) => {
  const q = s.trim().toLowerCase();
  if (!q || q.split(/\s+/).length > 3) return null;
  const full = TOWNS.find((t) => t.name.toLowerCase() === q || t.id === q || (q.length >= 4 && t.name.toLowerCase().startsWith(q)));
  if (full) return `/towns/${full.id}`;
  const lite = LITE_TOWNS.find((t) => t.name.toLowerCase() === q || (q.length >= 4 && t.name.toLowerCase().startsWith(q)));
  return lite ? `/towns/${lite.slug}` : null;
};

export function HeroAsk({ chips }: { chips: string[] }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const ask = (text: string) => {
    const s = text.trim();
    if (!s) return router.push("/towns");
    const town = townFor(s);
    if (town) return router.push(town);
    setQ("");
    if (!openAsk(s)) router.push(askHref(s));
  };
  return (
    <div className="heroaskbox">
      <form className="herosearch" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
        <input
          placeholder="Ask anything, or type a town"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Ask Cycletowns, or search for a town"
        />
        <button type="submit">Ask</button>
      </form>
      <div className="herochips">
        {chips.map((c) => (
          <button key={c} type="button" onClick={() => ask(c)}>{c}</button>
        ))}
      </div>
    </div>
  );
}
