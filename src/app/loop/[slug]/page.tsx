import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { LoopMap } from "@/components/LoopMap";
import { LoopStats } from "@/components/LoopBuilder";
import { LoopDownload } from "@/components/LoopDownload";
import { supabaseServer } from "@/lib/supabase/server";
import { loadCatalog } from "@/lib/content";
import { km as fmtKm, type LoopPoint } from "@/lib/loops";

export const dynamic = "force-dynamic";

type LoopRow = { slug: string; town_id: string; name: string; start_name: string | null; discipline: string | null; distance_m: number; ascent_m: number; geometry: LoopPoint[]; created_at: string };

async function getLoop(slug: string) {
  const sb = await supabaseServer();
  const { data } = await sb.from("loops").select("*").eq("slug", slug).maybeSingle();
  return (data as LoopRow) || null;
}

export async function generateMetadata({ params }: PageProps<"/loop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const l = await getLoop(slug);
  return l ? { title: l.name, description: `${fmtKm(l.distance_m)} loop with ${l.ascent_m} m of climbing.` } : {};
}

export default async function SavedLoop({ params }: PageProps<"/loop/[slug]">) {
  const { slug } = await params;
  const [loop, c] = await Promise.all([getLoop(slug), loadCatalog()]);
  if (!loop) notFound();
  const town = c.towns.find((t) => t.id === loop.town_id);
  const geo = c.geo[loop.town_id];
  return (
    <>
      <TopBar back={town ? { href: `/towns/${town.id}`, label: town.name } : undefined} />
      <div className="sec2">
        <div className="in" style={{ maxWidth: 880 }}>
          <div className="kick">A rider’s loop</div>
          <div className="h2">{loop.name}</div>
          <div className="lead">
            {[loop.start_name ? `From ${loop.start_name}` : null, loop.discipline].filter(Boolean).join(" · ")}
          </div>
          <div className="wbar" style={{ justifyContent: "center", marginBottom: 18 }}>
            <LoopDownload name={loop.name} coords={loop.geometry} townName={town?.name || loop.town_id} />
            <Link href={`/loop?town=${loop.town_id}`} className="lk-coral">Build your own</Link>
          </div>
          <LoopStats result={{ coords: loop.geometry, distance_m: loop.distance_m, ascent_m: loop.ascent_m, descent_m: loop.ascent_m }} discipline={loop.discipline || "road"} />
          <div style={{ marginTop: 14 }}>
            <LoopMap coords={loop.geometry} start={geo ? { lat: geo.lat, lng: geo.lng } : undefined} />
          </div>
          <p className="photocredit" style={{ marginTop: 12 }}>
            Generated from OpenStreetMap data — it follows real roads and paths, but check surfaces, traffic and gates
            before you ride it.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
