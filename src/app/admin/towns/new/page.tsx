import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { TownForm } from "@/components/admin/TownEditor";
import type { TownRow } from "@/lib/content";

export const dynamic = "force-dynamic";

const EMPTY: TownRow = { id: "", name: "", region: "", country: "", flag: "", currency: "$", status: "radar", editorial_score: 4.5, editorial_dims: { cafes: 4.5, routes: 4.5, safety: 4.5, climbs: 4.5, storage: 4.5 }, photo: null, gallery: [], tags: [], personas: [], blurb: "", lat: null, lng: null, when_info: null, see_do: null };

export default function NewTown() {
  return (
    <AdminShell active="Towns">
      <div className="adtop"><h1>New town</h1><Link href="/admin/towns" className="lk-ghost">‹ All towns</Link></div>
      <TownForm town={EMPTY} isNew />
    </AdminShell>
  );
}
