import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAction } from "@/components/AdminAction";
import { supabaseServer } from "@/lib/supabase/server";
import type { Partner } from "@/components/PartnerClaim";
import { getTown } from "@/lib/towns";

export const dynamic = "force-dynamic";

export default async function AdminPartners() {
  const sb = await supabaseServer();
  const { data } = await sb.from("partners").select("*, profiles(display_name)").order("status").order("created_at", { ascending: false });
  const rows = (data as (Partner & { email: string | null; contact_name: string | null; created_at: string; profiles: { display_name: string | null } | null })[]) || [];
  return (
    <AdminShell active="Partners">
      <div className="adtop"><h1>Partners</h1><span className="wsub">{rows.filter((r) => r.status === "enquiry").length} awaiting verification</span></div>
      <div className="acard">
        <table className="tbl"><thead><tr><th>Business</th><th>Town</th><th>Contact</th><th>Plan</th><th>Status</th><th>Since</th><th></th></tr></thead><tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td><b>{p.business}</b><br /><small style={{ color: "var(--grey-m)" }}>{p.type}{p.website ? ` · ${p.website}` : ""}</small></td>
              <td>{p.town_id ? getTown(p.town_id)?.name || p.town_id : "—"}</td>
              <td>{p.contact_name || p.profiles?.display_name || "—"}<br /><small style={{ color: "var(--grey-m)" }}>{p.email}</small></td>
              <td>{p.plan}</td>
              <td>{p.status === "active" ? <b style={{ color: "#177245" }}>Verified</b> : p.status === "enquiry" ? <b style={{ color: "var(--coral-700)" }}>Pending</b> : "Paused"}</td>
              <td>{new Date(p.created_at).toLocaleDateString("en-AU")}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                {p.status !== "active" && <AdminAction table="partners" id={p.id} patch={{ status: "active" }} label="Verify" />}{" "}
                {p.status === "active" && <AdminAction table="partners" id={p.id} patch={{ status: "paused" }} label="Pause" />}
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7}>No partner claims yet. Enquiries from the <Link href="/partners">partner page</Link> form arrive in Netlify → Forms.</td></tr>}
        </tbody></table>
      </div>
    </AdminShell>
  );
}
