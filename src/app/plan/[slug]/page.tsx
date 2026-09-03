import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PlanView } from "@/components/PlanBuilder";
import { supabaseServer } from "@/lib/supabase/server";
import { loadCatalog } from "@/lib/content";
import type { Plan } from "@/lib/planner";

export const dynamic = "force-dynamic";

type Trip = { slug: string; town_id: string; title: string; days: number; ability: string | null; discipline: string | null; plan: Plan; created_at: string };

async function getTrip(slug: string) {
  const sb = await supabaseServer();
  const { data } = await sb.from("trips").select("*").eq("slug", slug).maybeSingle();
  return (data as Trip) || null;
}

export async function generateMetadata({ params }: PageProps<"/plan/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);
  return trip ? { title: trip.title, description: trip.plan?.headline } : {};
}

export default async function SavedTrip({ params }: PageProps<"/plan/[slug]">) {
  const { slug } = await params;
  const [trip, c] = await Promise.all([getTrip(slug), loadCatalog()]);
  if (!trip) notFound();
  const town = c.towns.find((t) => t.id === trip.town_id);
  return (
    <>
      <TopBar back={town ? { href: `/towns/${town.id}`, label: town.name } : undefined} />
      <div className="sec2">
        <div className="in" style={{ maxWidth: 880 }}>
          <div className="kick noprint">A rider’s plan</div>
          <div className="h2">{trip.title}</div>
          <div className="lead noprint">
            {[trip.ability, trip.discipline === "mixed" ? "a bit of everything" : trip.discipline].filter(Boolean).join(" · ")} ·
            built from the {town?.name || trip.town_id} guide
          </div>
          <PlanView plan={trip.plan} townName={town?.name || trip.town_id} />
          <div className="wbar noprint" style={{ marginTop: 20, justifyContent: "center" }}>
            <Link href={`/plan?town=${trip.town_id}`} className="lk-coral big">Build your own version</Link>
            {town && <Link href={`/towns/${town.id}`} className="lk-ghost big">The {town.name} guide ›</Link>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
