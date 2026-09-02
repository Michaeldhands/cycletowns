import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PartnerDashboardForm, type Partner } from "@/components/PartnerClaim";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { hasStripe } from "@/lib/stripe/server";
import { getTown } from "@/lib/towns";

export const metadata: Metadata = { title: "Partner dashboard" };
export const dynamic = "force-dynamic";

export default async function PartnerDashboard({ searchParams }: PageProps<"/partners/dashboard">) {
  const sp = await searchParams;
  const me = await currentUser();
  if (!me) redirect("/login?next=/partners/dashboard");
  const sb = await supabaseServer();
  const { data } = await sb.from("partners").select("*").eq("owner_id", me.id).order("created_at");
  const listings = (data as Partner[]) || [];
  // demand signals for the partner's towns
  const townIds = [...new Set(listings.map((l) => l.town_id).filter(Boolean))] as string[];
  const stats: Record<string, { saved: number; reviews: number; groups: number }> = {};
  for (const id of townIds) {
    const [{ count: saved }, { count: reviews }, { count: groups }] = await Promise.all([
      sb.from("saved_towns").select("*", { count: "exact", head: true }).eq("town_id", id),
      sb.from("reviews").select("*", { count: "exact", head: true }).eq("town_id", id),
      sb.from("groups").select("*", { count: "exact", head: true }).eq("town_id", id),
    ]);
    stats[id] = { saved: saved ?? 0, reviews: reviews ?? 0, groups: groups ?? 0 };
  }
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in" style={{ maxWidth: 980 }}>
          <div className="kick">Partners</div>
          <div className="h2">Your listings</div>
          {sp.claimed && <div className="unlocknote" style={{ fontSize: 14, padding: 14, margin: "0 auto 18px", maxWidth: 640 }}>✅ Claim received. We verify every listing by hand — usually within one business day — and email you when the badge is live.</div>}
          {sp.upgraded && <div className="unlocknote" style={{ fontSize: 14, padding: 14, margin: "0 auto 18px", maxWidth: 640 }}>🎉 Thanks — your plan is active. It can take a few seconds to show here.</div>}
          {listings.length === 0 && (
            <div className="lead">You haven’t claimed a listing yet. <Link href="/partners/claim">Claim yours ›</Link></div>
          )}
          {listings.map((l) => {
            const t = l.town_id ? getTown(l.town_id) : null;
            const s = l.town_id ? stats[l.town_id] : null;
            return (
              <div key={l.id} style={{ marginBottom: 34 }}>
                <div className="wh" style={{ marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 30 }}>{l.business}</h2>
                    <span className="wsub">{t ? `${t.name} · ` : ""}{l.type} · {l.status === "active" ? "✓ Verified" : l.status === "enquiry" ? "Verification pending" : "Paused"}</span>
                  </div>
                  {t && <Link href={`/towns/${t.id}`} className="lk-ghost" style={{ padding: "7px 13px", fontSize: 12.5 }}>View town guide ›</Link>}
                </div>
                {s && (
                  <div className="kpis" style={{ marginBottom: 14 }}>
                    <div className="kpi"><div className="k">Riders who saved {t?.name}</div><div className="v">{s.saved}</div></div>
                    <div className="kpi"><div className="k">Rider reviews</div><div className="v">{s.reviews}</div></div>
                    <div className="kpi"><div className="k">Groups riding here</div><div className="v">{s.groups}</div></div>
                  </div>
                )}
                <PartnerDashboardForm partner={l} enabled={hasStripe()} />
              </div>
            );
          })}
          {listings.length > 0 && <p style={{ textAlign: "center" }}><Link href="/partners/claim">Claim another listing ›</Link></p>}
        </div>
      </div>
      <Footer />
    </>
  );
}
