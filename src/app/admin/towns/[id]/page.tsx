import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlacesEditor, RacesEditor, TownForm } from "@/components/admin/TownEditor";
import { supabaseServer } from "@/lib/supabase/server";
import type { PlaceRow, RaceRow, TownRow } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditTown({ params }: PageProps<"/admin/towns/[id]">) {
  const { id } = await params;
  const sb = await supabaseServer();
  const [{ data: town }, { data: places }, { data: races }] = await Promise.all([
    sb.from("towns").select("*").eq("id", id).maybeSingle(),
    sb.from("places").select("*").eq("town_id", id).order("sort"),
    sb.from("races").select("*").eq("town_id", id).order("sort"),
  ]);
  if (!town) notFound();
  return (
    <AdminShell active="Towns">
      <div className="adtop"><h1>{town.flag} {town.name}</h1><Link href="/admin/towns" className="lk-ghost">‹ All towns</Link></div>
      <div style={{ display: "grid", gap: 16 }}>
        <TownForm town={town as TownRow} />
        {town.status === "full" && <PlacesEditor townId={id} places={(places as PlaceRow[]) || []} />}
        {town.status === "full" && <RacesEditor townId={id} races={(races as RaceRow[]) || []} />}
        {town.status !== "full" && <div className="unlocknote">Set the status to “Full guide” and save to add places and races.</div>}
      </div>
    </AdminShell>
  );
}
