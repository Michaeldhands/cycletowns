import { AdminShell } from "@/components/admin/AdminShell";
import { EnquiriesTable, type EnquiryRow } from "@/components/admin/EnquiriesTable";
import { supabaseServer } from "@/lib/supabase/server";
import { hasCrm } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function AdminEnquiries() {
  const sb = await supabaseServer();
  const { data } = await sb.from("enquiries").select("*").order("created_at", { ascending: false });
  return (
    <AdminShell active="Enquiries">
      <div className="adtop"><h1>Partner enquiries</h1></div>
      <EnquiriesTable rows={(data as EnquiryRow[]) || []} crmOn={hasCrm()} />
    </AdminShell>
  );
}
