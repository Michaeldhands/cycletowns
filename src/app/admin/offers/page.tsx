import { AdminShell } from "@/components/admin/AdminShell";
import { OffersEditor, type OfferRow } from "@/components/admin/OffersEditor";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOffers() {
  const sb = await supabaseServer();
  const [{ data: offers }, { data: towns }, { data: members }] = await Promise.all([
    sb.from("offers").select("*").order("sort"),
    sb.from("towns").select("id,name").eq("status", "full").order("name"),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("membership", "insider"),
  ]);
  void members;
  return (
    <AdminShell active="Offers">
      <div className="adtop"><h1>Offers & membership</h1></div>
      <OffersEditor offers={(offers as OfferRow[]) || []} towns={towns || []} />
    </AdminShell>
  );
}
