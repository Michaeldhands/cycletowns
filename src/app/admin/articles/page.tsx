import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabaseServer } from "@/lib/supabase/server";
import type { ArticleRow } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminArticles() {
  const sb = await supabaseServer();
  const { data } = await sb.from("articles").select("*").order("published", { ascending: false }).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
  const rows = (data as ArticleRow[]) || [];
  return (
    <AdminShell active="News">
      <div className="adtop"><h1>News</h1><Link href="/admin/articles/new" className="lk-coral">+ New article</Link></div>
      <div className="acard">
        <table className="tbl"><thead><tr><th>Title</th><th>Kind</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td><Link href={`/admin/articles/${a.id}`}><b>{a.title}</b></Link><br /><small style={{ color: "var(--grey-m)" }}>{a.dek}</small></td>
              <td>{[a.series ? `${a.series} · Ep ${a.episode}` : a.kind].filter(Boolean).join("") || "—"}</td>
              <td>{a.published ? <b style={{ color: "#177245" }}>Live</b> : <span style={{ color: "var(--grey-m)" }}>Draft</span>}</td>
              <td>{a.published_at ? new Date(a.published_at).toLocaleDateString("en-AU") : "—"}</td>
              <td style={{ textAlign: "right" }}><Link href={`/admin/articles/${a.id}`} className="lk-ghost" style={{ fontSize: 12, padding: "4px 9px" }}>Edit</Link></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5}>No articles yet.</td></tr>}
        </tbody></table>
      </div>
    </AdminShell>
  );
}
