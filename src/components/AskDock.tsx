"use client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AskConcierge } from "./AskConcierge";
import { ASK_OPEN } from "@/lib/ask/open";

/* Ask Cycletowns, available on every page without leaving it.

   A slide-over on desktop, a full-screen sheet on a phone. It lives in the root layout, so the
   conversation survives moving between pages: ask for a plan, tap the town card, read the guide,
   and the plan is still there when the panel comes back. Opened by the small button in the
   corner, by the home page's ask box, or by "Ask about <town>". */

type Status = { enabled: boolean; signedIn: boolean; greeting: string | null; starters: string[] };

const HIDDEN_ON = [/^\/ask/, /^\/admin/, /^\/login/, /^\/join/, /^\/auth/];

export function AskDock() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [pending, setPending] = useState<{ q: string; n: number } | null>(null);

  const load = useCallback(async () => {
    if (status) return;
    try {
      const r = await fetch("/api/ask/status");
      setStatus((await r.json()) as Status);
    } catch {
      setStatus({ enabled: false, signedIn: false, greeting: null, starters: [] });
    }
  }, [status]);

  useEffect(() => {
    (window as unknown as { __askDock?: boolean }).__askDock = true;
    const onOpen = (e: Event) => {
      const q = (e as CustomEvent<{ q?: string }>).detail?.q;
      setOpen(true);
      load();
      if (q) setPending((p) => ({ q, n: (p?.n || 0) + 1 }));
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener(ASK_OPEN, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      (window as unknown as { __askDock?: boolean }).__askDock = false;
      window.removeEventListener(ASK_OPEN, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [load]);

  // On a phone the sheet covers the page, so following a card's link should reveal it.
  const onClickCapture = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    if (a && a.getAttribute("href")?.startsWith("/") && window.innerWidth < 760) setOpen(false);
  };

  const hidden = HIDDEN_ON.some((r) => r.test(path));
  if (hidden && !open) return null;

  return (
    <>
      {!open && !hidden && (
        <button type="button" className="askfab" onClick={() => { setOpen(true); load(); }} aria-label="Ask Cycletowns">
          <span className="askfab-dot" aria-hidden="true" />
          <span className="askfab-long">Ask Cycletowns</span>
          <span className="askfab-short">Ask</span>
        </button>
      )}
      <div className={"askdock" + (open ? " open" : "")} role="dialog" aria-modal="false" aria-label="Ask Cycletowns" aria-hidden={!open} onClickCapture={onClickCapture}>
        <div className="askdock-h">
          <div>
            <b>Ask Cycletowns</b>
            <span>Victoria · answers from our guides</span>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="askdock-b">
          {status ? (
            <AskConcierge enabled={status.enabled} signedIn={status.signedIn} greeting={status.greeting} starters={status.starters} pending={pending} compact />
          ) : (
            <div className="askstatus" style={{ padding: 16 }}>Opening…</div>
          )}
        </div>
      </div>
    </>
  );
}
