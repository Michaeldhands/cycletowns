"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { revalidateContent } from "@/app/admin/actions";
import { ImageUpload } from "./Upload";
import { slugify } from "@/lib/towns";
import type { ArticleRow } from "@/lib/content";

/** Turn plain text with blank-line paragraphs into simple HTML; leave real HTML alone. */
function toHtml(s: string) {
  if (/<p[\s>]|<h[1-6][\s>]/i.test(s)) return s;
  return s.split(/\n{2,}/).map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`).join("\n");
}
function fromHtml(s: string) {
  if (!/<p[\s>]/i.test(s)) return s;
  return s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p[^>]*>/gi, "\n\n").replace(/<\/?p[^>]*>/gi, "").trim();
}

export function ArticleEditor({ article, towns, isNew }: { article: ArticleRow; towns: { id: string; name: string }[]; isNew?: boolean }) {
  const router = useRouter();
  const [a, setA] = useState<ArticleRow>(article);
  const [body, setBody] = useState(fromHtml(article.body || ""));
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");
  const set = <K extends keyof ArticleRow>(k: K, v: ArticleRow[K]) => setA({ ...a, [k]: v });
  const save = async (publish?: boolean) => {
    if (!a.title.trim()) return setMsg("Give it a title.");
    setState("busy");
    setMsg("");
    const published = publish ?? a.published;
    const row = { ...a, slug: a.slug || slugify(a.title), body: toHtml(body), published, published_at: published ? a.published_at || new Date().toISOString() : a.published_at, episode: a.episode ? Number(a.episode) : null, town_id: a.town_id || null, series: a.series || null, kind: a.kind || null };
    const { id, created_at, ...rest } = row;
    void created_at;
    const { data, error } = await (id ? supabaseBrowser().from("articles").update(rest).eq("id", id).select().single() : supabaseBrowser().from("articles").insert(rest).select().single());
    if (error || !data) {
      setMsg(error?.message || "Save failed");
      setState("error");
      return;
    }
    await revalidateContent();
    setA(data as ArticleRow);
    setState("saved");
    if (isNew) router.replace(`/admin/articles/${(data as ArticleRow).id}`);
  };
  return (
    <div className="acard">
      <div className="cardgrid" style={{ gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div className="field"><label>Title</label><input value={a.title} onChange={(e) => setA({ ...a, title: e.target.value, slug: isNew ? slugify(e.target.value) : a.slug })} /></div>
        <div className="field"><label>Slug</label><input value={a.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
      </div>
      <div className="field"><label>Standfirst (dek)</label><input value={a.dek} onChange={(e) => set("dek", e.target.value)} maxLength={220} /></div>
      <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
        <div className="field"><label>Kind</label><select value={a.kind || ""} onChange={(e) => set("kind", e.target.value)}><option value="">—</option><option>Series</option><option>Feature</option><option>Guide</option><option>News</option></select></div>
        <div className="field"><label>Series</label><input value={a.series || ""} onChange={(e) => set("series", e.target.value)} placeholder="Town in Focus" /></div>
        <div className="field"><label>Episode</label><input type="number" value={a.episode ?? ""} onChange={(e) => set("episode", e.target.value === "" ? null : Number(e.target.value))} /></div>
        <div className="field"><label>Town</label><select value={a.town_id || ""} onChange={(e) => set("town_id", e.target.value || null)}><option value="">—</option>{towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      <div className="field">
        <label>Body</label>
        <textarea rows={16} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write in plain text — a blank line starts a new paragraph. HTML is fine too." style={{ fontFamily: "var(--ui)", lineHeight: 1.55 }} />
      </div>
      <div className="field">
        <label>Cover image</label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {a.image_url && <span style={{ width: 120, height: 76, borderRadius: 10, overflow: "hidden", display: "inline-block" }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={a.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></span>}
          <ImageUpload folder="articles" onDone={(u) => set("image_url", u)} label={a.image_url ? "Replace" : "Upload cover"} />
          {a.image_url && <button className="lk-ghost" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => set("image_url", null)}>Remove</button>}
          <span style={{ fontSize: 12, color: "var(--grey-m)" }}>No cover? A stock rider photo is used:</span>
          <select value={a.image_kind} onChange={(e) => set("image_kind", e.target.value)} style={{ padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8 }}>{["road", "climb", "gravel", "mtb", "group", "alpine", "ebike"].map((k) => <option key={k}>{k}</option>)}</select>
        </div>
      </div>
      <div className="wbar" style={{ alignItems: "center" }}>
        <button className="lk-ghost big" onClick={() => save(false)} disabled={state === "busy"}>Save draft</button>
        <button className="lk-coral big" onClick={() => save(true)} disabled={state === "busy"}>{a.published ? "Save & keep published" : "Publish"}</button>
        {a.published && <button className="lk-ghost" onClick={() => save(false)} disabled={state === "busy"}>Unpublish</button>}
        {state === "saved" && <b style={{ color: "#177245", fontSize: 13 }}>Saved ✓ {a.published ? "· live" : "· draft"}</b>}
        {msg && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{msg}</span>}
        {a.published && a.slug && <Link href={`/news/${a.slug}`} className="lk-ghost" target="_blank">View live ›</Link>}
      </div>
    </div>
  );
}
