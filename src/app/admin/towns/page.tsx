import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabaseServer } from "@/lib/supabase/server";
import type { TownRow } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminTowns() {
  const sb = await supabaseServer();
  const [{ data: towns }, { data: scores }] = await Promise.all([
    sb.from("towns").select("id,name,region,country,flag,status,editorial_score,updated_at").order("status").order("editorial_score", { ascending: false }),
    sb.from("town_scores").select("town_id, review_count, score"),
  ]);
  const sc: Record<string, { review_count: number; score: number }> = {};
  (scores || []).forEach((r) => (sc[r.town_id] = r));
  const rows = (towns as (TownRow & { updated_at: string })[]) || [];
  return (
    <AdminShell active="Towns">
      <div className="adtop"><h1>Towns</h1><Link href="/admin/towns/new" className="lk-coral">+ New town</Link></div>
      {(["full", "radar", "hidden"] as const).map((st) => {
        const list = rows.filter((t) => t.status === st);
        if (!list.length) return null;
        return (
          <div className="acard" key={st} style={{ marginBottom: 16 }}>
            <h3>{st === "full" ? "Full guides" : st === "radar" ? "On the radar" : "Hidden"} · {list.length}</h3>
            <table className="tbl"><thead><tr><th>Town</th><th>Editorial</th><th>Rider score</th><th>Reviews</th><th>Updated</th><th></th></tr></thead><tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td><Link href={`/admin/towns/${t.id}`}><b>{t.flag} {t.name}</b></Link><small style={{ color: "var(--grey-m)" }}> · {t.region}, {t.country}</small></td>
                  <td>{t.editorial_score != null ? `★ ${Number(t.editorial_score).toFixed(1)}` : "—"}</td>
                  <td>{sc[t.id] ? `★ ${Number(sc[t.id].score).toFixed(1)}` : "—"}</td>
                  <td>{sc[t.id]?.review_count ?? 0}</td>
                  <td>{new Date(t.updated_at).toLocaleDateString("en-AU")}</td>
                  <td style={{ textAlign: "right" }}><Link href={`/admin/towns/${t.id}`} className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }}>Edit</Link></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        );
      })}
    </AdminShell>
  );
}
