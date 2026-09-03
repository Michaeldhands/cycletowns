import type { Metadata } from "next";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { LoopBuilder, type LoopTown } from "@/components/LoopBuilder";
import { loadCatalog } from "@/lib/content";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Route planner — build a loop",
  description: "Build a rideable loop from any Cycletown on real roads and paths, with elevation and a GPX for your head unit.",
};
export const dynamic = "force-dynamic";

export default async function LoopPage({ searchParams }: PageProps<"/loop">) {
  const sp = await searchParams;
  const [c, me] = await Promise.all([loadCatalog(), currentUser()]);
  const towns: LoopTown[] = c.towns.map((t) => ({ id: t.id, name: t.name, lat: c.geo[t.id]?.lat ?? null, lng: c.geo[t.id]?.lng ?? null }));
  const initial = typeof sp.town === "string" ? sp.town : undefined;
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in" style={{ maxWidth: 880 }}>
          <div className="kick">Route planner</div>
          <div className="h2">Build your own loop.</div>
          <div className="lead">
            Pick a town, a start point and how far you feel like going. We’ll find a loop on real roads and paths, show you
            the climbing, and hand you a GPX for your head unit.
          </div>
          <LoopBuilder towns={towns} initialTown={initial} userId={me?.id ?? null} routerOn={Boolean(process.env.ORS_API_KEY)} />
        </div>
      </div>
      <Footer />
    </>
  );
}
