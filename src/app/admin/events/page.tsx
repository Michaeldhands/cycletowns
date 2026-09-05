import { AdminShell } from "@/components/admin/AdminShell";
import { EventsEditor, type EventRow } from "@/components/admin/EventsEditor";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminEvents() {
  const sb = await supabaseServer();
  const [{ data: events }, { data: towns }] = await Promise.all([
    sb.from("events").select("*").order("next_date", { ascending: true, nullsFirst: false }),
    sb.from("towns").select("id,name").eq("status", "full").order("name"),
  ]);
  return (
    <AdminShell active="Events">
      <div className="adtop"><h1>Cycling events</h1></div>
      <EventsEditor events={(events as EventRow[]) || []} towns={towns || []} />
    </AdminShell>
  );
}
