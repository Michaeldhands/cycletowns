"use client";
import type { ReactNode } from "react";
import { askHref, openAsk } from "@/lib/ask/open";

/** A link that opens Ask Cycletowns in place with a question, or goes to /ask if the dock isn't ready. */
export function AskButton({ q, className, children }: { q?: string; className?: string; children: ReactNode }) {
  return (
    <a href={askHref(q)} className={className} onClick={(e) => { if (openAsk(q)) e.preventDefault(); }}>
      {children}
    </a>
  );
}
