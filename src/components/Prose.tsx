import type { ReactNode } from "react";
import { TopBar } from "./SiteNav";
import { Footer } from "./Footer";
import { NetlifyForm } from "./NetlifyForm";

/** Simple centred prose page (About, How rankings work, Contact…). */
export function ProsePage({ kick, title, lead, children, wide = false }: { kick: string; title: ReactNode; lead?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in" style={{ maxWidth: wide ? 1160 : 880 }}>
          <div className="kick">{kick}</div>
          <div className="h2">{title}</div>
          {lead && <div className="lead">{lead}</div>}
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}

/** Interest form handled by Netlify Forms (no backend needed). Each `form` name becomes its own list in Netlify. */
export function WaitlistForm({ form, cta = "Keep me posted", placeholder = "you@email.com", hidden }: { form: string; cta?: string; placeholder?: string; hidden?: Record<string, string> }) {
  return (
    <NetlifyForm name={form} className="herosearch" style={{ margin: "14px 0 0", maxWidth: 480, boxShadow: "var(--shadow-sm)", border: "1px solid var(--line)" }}>
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="email" name="email" required placeholder={placeholder} aria-label="Email address" />
      <button type="submit">{cta}</button>
    </NetlifyForm>
  );
}
