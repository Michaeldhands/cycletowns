import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { supabaseServer } from "@/lib/supabase/server";
import type { ArticleRow } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditArticle({ params }: PageProps<"/admin/articles/[id]">) {
  const { id } = await params;
  const sb = await supabaseServer();
  const [{ data: a }, { data: towns }] = await Promise.all([sb.from("articles").select("*").eq("id", id).maybeSingle(), sb.from("towns").select("id,name").eq("status", "full").order("name")]);
  if (!a) notFound();
  return (
    <AdminShell active="News">
      <div className="adtop"><h1>Edit article</h1><Link href="/admin/articles" className="lk-ghost">‹ All articles</Link></div>
      <ArticleEditor article={a as ArticleRow} towns={towns || []} />
    </AdminShell>
  );
}
