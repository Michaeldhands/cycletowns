/* One way to open Ask Cycletowns from anywhere on the page. The dock in the root layout listens;
   if it isn't there (JavaScript still loading, or an old cached page) the caller falls back to
   the full /ask page. */

export const ASK_OPEN = "cycletowns:ask";

export function openAsk(q?: string): boolean {
  if (typeof window === "undefined" || !(window as unknown as { __askDock?: boolean }).__askDock) return false;
  window.dispatchEvent(new CustomEvent(ASK_OPEN, { detail: { q } }));
  return true;
}

export const askHref = (q?: string) => (q ? `/ask?q=${encodeURIComponent(q)}&go=1` : "/ask");
