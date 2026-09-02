import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { supabaseServer } from "@/lib/supabase/server";
import type { ArticleRow } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function NewArticle() {
  const sb = await supabaseServer();
  const { data: towns } = await sb.from("towns").select("id,name").eq("status", "full").order("name");
  const empty: ArticleRow = { id: "", slug: "", title: "", dek: "", body: "", kind: "Feature", series: null, episode: null, town_id: null, image_kind: "road", image_url: null, published: false, published_at: null, created_at: "" };
  return (
    <AdminShell active="News">
      <div className="adtop"><h1>New article</h1><Link href="/admin/articles" className="lk-ghost">‹ All articles</Link></div>
      <ArticleEditor article={empty} towns={towns || []} isNew />
    </AdminShell>
  );
}
