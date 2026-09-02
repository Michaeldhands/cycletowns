import Link from "next/link";
import { ProsePage, WaitlistForm } from "./Prose";

/** Feature page that isn't live yet: explains what's coming and collects interest. */
export function ComingSoon({ kick, title, lead, form, cta, children }: { kick: string; title: string; lead: string; form: string; cta?: string; children?: React.ReactNode }) {
  return (
    <ProsePage kick={kick} title={title} lead={lead}>
      <div className="wprose" style={{ margin: "0 auto", textAlign: "center" }}>
        {children}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <WaitlistForm form={form} cta={cta} />
        </div>
        <p style={{ marginTop: 22 }}>
          <Link href="/towns">Explore towns in the meantime ›</Link>
        </p>
      </div>
    </ProsePage>
  );
}
