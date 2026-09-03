import type { Metadata } from "next";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PlanBuilder, type TownOption } from "@/components/PlanBuilder";
import { loadCatalog } from "@/lib/content";
import { currentUser } from "@/lib/supabase/server";
import type { PlanTown } from "@/lib/planner";

export const metadata: Metadata = {
  title: "Plan my trip",
  description: "Build a day-by-day cycling trip from any Cycletown’s real routes, café stops and best months to ride.",
};
export const dynamic = "force-dynamic";

export default async function Plan({ searchParams }: PageProps<"/plan">) {
  const sp = await searchParams;
  const [c, me] = await Promise.all([loadCatalog(), currentUser()]);
  const towns: TownOption[] = c.towns.map((t) => ({ id: t.id, name: t.name, region: t.region, country: t.country, flag: t.flag }));
  const data: Record<string, PlanTown> = {};
  c.towns.forEach((t) => {
    data[t.id] = {
      id: t.id, name: t.name, region: t.region, country: t.country,
      routes: t.routes, cafes: t.cafes, shops: t.shops,
      seeDo: c.seeDo[t.id] || [], when: c.when[t.id], races: c.races[t.id] || [],
    };
  });
  const initial = typeof sp.town === "string" ? sp.town : undefined;
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in" style={{ maxWidth: 880 }}>
          <div className="kick noprint">Plan my trip</div>
          <div className="h2 noprint">Turn up and ride.</div>
          <div className="lead noprint">
            Tell us where you’re headed and how you ride. We’ll build a day-by-day plan from that town’s real routes and
            café stops — the ride order, where the big day sits, and when to take a day off. No bookings, no sales pitch.
          </div>
          <PlanBuilder towns={towns} data={data} initialTown={initial} userId={me?.id ?? null} />
        </div>
      </div>
      <Footer />
    </>
  );
}
