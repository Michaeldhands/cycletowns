import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Avatar } from "@/components/Avatar";
import { AdminAction } from "@/components/AdminAction";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { getTown } from "@/lib/towns";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { overview: "Overview", riders: "Riders", reviews: "Reviews", groups: "Groups", posts: "Posts" };

export default async function Admin({ searchParams }: PageProps<"/admin">) {
  const me = await currentUser();
  if (!me) redirect("/login?next=/admin");
  if (!me.profile?.is_admin)
    return (
      <div className="sec2">
        <div className="in" style={{ maxWidth: 640, textAlign: "center" }}>
          <div className="kick">Admin</div>
          <div className="h2">Admins only.</div>
          <p style={{ color: "var(--grey-d)" }}>Your account isn’t an admin. <Link href="/account">Back to your account ›</Link></p>
        </div>
      </div>
    );
  const sp = await searchParams;
  const s = typeof sp.s === "string" ? sp.s : "overview";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const sb = await supabaseServer();

  return (
    <AdminShell active={LABEL[s] || "Overview"}>
      {s === "overview" && <Overview />}
      {s === "riders" && <Riders q={q} />}
      {s === "reviews" && <Reviews />}
      {s === "groups" && <Groups />}
      {s === "posts" && <Posts />}
    </AdminShell>
  );

  async function count(table: string, sinceIso?: string) {
    const b = sb.from(table).select("*", { count: "exact", head: true });
    const { count } = sinceIso ? await b.gte("created_at", sinceIso) : await b;
    return count ?? 0;
  }

  async function Overview() {
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const [riders, ridersWeek, reviews, groups, posts, saved, partners] = await Promise.all([
      count("profiles"),
      count("profiles", since),
      count("reviews"),
      count("groups"),
      count("posts"),
      count("saved_towns"),
      count("partners"),
    ]);
    type Recent = { town_id: string; created_at: string; cafes: number; routes: number; safety: number; climbs: number; storage: number; profiles: { display_name: string | null } | null };
    const { data: recentRaw } = await sb.from("reviews").select("town_id, created_at, cafes, routes, safety, climbs, storage, profiles(display_name)").order("created_at", { ascending: false }).limit(8);
    const recent = (recentRaw as unknown as Recent[]) || [];
    const { data: scores } = await sb.from("town_scores").select("*").order("review_count", { ascending: false }).limit(10);
    const { data: topSaved } = await sb.from("saved_towns").select("town_id").limit(2000);
    const savedCounts: Record<string, number> = {};
    (topSaved || []).forEach((r: { town_id: string }) => (savedCounts[r.town_id] = (savedCounts[r.town_id] || 0) + 1));
    const topSavedList = Object.entries(savedCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return (
      <>
        <div className="adtop"><h1>Overview</h1><span className="live"><span className="pulse" /> Live data</span></div>
        <div className="kpis">
          {[["Riders", riders, `+${ridersWeek} this week`], ["Reviews", reviews, ""], ["Groups", groups, ""], ["Posts", posts, ""], ["Saved towns", saved, ""], ["Partners", partners, ""]].map(([k, v, d]) => (
            <div className="kpi" key={k as string}><div className="k">{k}</div><div className="v">{v}</div>{d && <div className="d up">{d}</div>}</div>
          ))}
        </div>
        <div className="cardgrid">
          <div className="acard">
            <h3>Most reviewed towns</h3><div className="csub">rider score vs editorial</div>
            {(scores || []).length === 0 && <p className="wsub" style={{ display: "block" }}>No reviews yet.</p>}
            {(scores || []).map((r: { town_id: string; review_count: number; score: number }) => (
              <div className="grow" key={r.town_id}><span>{getTown(r.town_id)?.name || r.town_id} · {r.review_count} review{r.review_count === 1 ? "" : "s"}</span><b>★ {Number(r.score).toFixed(1)} <span style={{ color: "var(--grey-m)" }}>/ {getTown(r.town_id)?.score.toFixed(1)}</span></b></div>
            ))}
          </div>
          <div className="acard">
            <h3>Most saved towns</h3><div className="csub">wishlist demand</div>
            {topSavedList.length === 0 && <p className="wsub" style={{ display: "block" }}>Nothing saved yet.</p>}
            {topSavedList.map(([id, n]) => <div className="grow" key={id}><span>{getTown(id)?.name || id}</span><b>{n}</b></div>)}
          </div>
          <div className="acard full">
            <h3>Latest reviews</h3><div className="csub">newest first</div>
            <table className="tbl"><thead><tr><th>Town</th><th>Rider</th><th>Score</th><th>When</th></tr></thead><tbody>
              {recent.map((r, i) => (
                <tr key={i}><td>{getTown(r.town_id)?.name || r.town_id}</td><td>{r.profiles?.display_name || "Rider"}</td><td>★ {((r.cafes + r.routes + r.safety + r.climbs + r.storage) / 5).toFixed(1)}</td><td>{new Date(r.created_at).toLocaleString("en-AU")}</td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </>
    );
  }

  async function Riders({ q }: { q: string }) {
    let b = sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    if (q) b = b.or(`display_name.ilike.%${q}%,home_town.ilike.%${q}%,handle.ilike.%${q}%`);
    const { data } = await b;
    return (
      <>
        <div className="adtop"><h1>Riders</h1>
          <form style={{ display: "flex", gap: 8 }}><input type="hidden" name="s" value="riders" /><input name="q" defaultValue={q} placeholder="Search name or town" style={{ padding: "9px 12px", border: "1.5px solid var(--line)", borderRadius: 10, fontFamily: "var(--ui)" }} /><button className="lk-ghost">Search</button></form>
        </div>
        <div className="acard">
          <table className="tbl"><thead><tr><th>Rider</th><th>Home</th><th>Rides</th><th>Tier</th><th>Points</th><th>Joined</th><th></th></tr></thead><tbody>
            {(data || []).map((p) => (
              <tr key={p.id}>
                <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={p.display_name || "R"} url={p.avatar_url} size={26} />{p.display_name || "—"}{p.is_admin && <b style={{ fontSize: 10, color: "var(--teal)" }}>ADMIN</b>}</span></td>
                <td>{[p.home_town, p.country].filter(Boolean).join(", ") || "—"}</td>
                <td>{[p.rider_type, p.ability].filter(Boolean).join(" · ") || "—"}</td>
                <td>{p.tier}</td><td>{p.points}</td>
                <td>{new Date(p.created_at).toLocaleDateString("en-AU")}</td>
                <td>{p.id !== me!.id && <AdminAction table="profiles" id={p.id} patch={{ is_admin: !p.is_admin }} label={p.is_admin ? "Remove admin" : "Make admin"} />}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </>
    );
  }

  async function Reviews() {
    const { data } = await sb.from("reviews").select("*, profiles(display_name)").order("created_at", { ascending: false }).limit(200);
    return (
      <>
        <div className="adtop"><h1>Reviews</h1></div>
        <div className="acard">
          <table className="tbl"><thead><tr><th>Town</th><th>Rider</th><th>Score</th><th>Review</th><th>Status</th><th></th></tr></thead><tbody>
            {(data || []).map((r) => (
              <tr key={r.id} style={{ opacity: r.status === "hidden" ? 0.55 : 1 }}>
                <td>{getTown(r.town_id)?.name || r.town_id}</td><td>{r.profiles?.display_name || "Rider"}</td>
                <td>★ {((r.cafes + r.routes + r.safety + r.climbs + r.storage) / 5).toFixed(1)}</td>
                <td style={{ maxWidth: 420 }}>{r.body || <i style={{ color: "var(--grey-m)" }}>no text</i>}</td>
                <td>{r.status}</td>
                <td><AdminAction table="reviews" id={r.id} patch={{ status: r.status === "hidden" ? "published" : "hidden" }} label={r.status === "hidden" ? "Unhide" : "Hide"} /></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </>
    );
  }

  async function Groups() {
    const { data } = await sb.from("groups").select("*, group_members(count)").order("created_at", { ascending: false }).limit(200);
    return (
      <>
        <div className="adtop"><h1>Groups</h1></div>
        <div className="acard">
          <table className="tbl"><thead><tr><th>Group</th><th>Town</th><th>Privacy</th><th>Members</th><th>Created</th></tr></thead><tbody>
            {(data || []).map((g) => (
              <tr key={g.id}><td><Link href={`/groups/${g.id}`}>{g.name}</Link></td><td>{getTown(g.town_id)?.name || g.town_id}</td><td>{g.privacy}</td><td>{g.group_members?.[0]?.count ?? 0}</td><td>{new Date(g.created_at).toLocaleDateString("en-AU")}</td></tr>
            ))}
          </tbody></table>
        </div>
      </>
    );
  }

  async function Posts() {
    const { data } = await sb.from("posts").select("*, profiles(display_name), groups(name)").order("created_at", { ascending: false }).limit(200);
    return (
      <>
        <div className="adtop"><h1>Posts</h1></div>
        <div className="acard">
          <table className="tbl"><thead><tr><th>Rider</th><th>Where</th><th>Post</th><th>Status</th><th></th></tr></thead><tbody>
            {(data || []).map((p) => (
              <tr key={p.id} style={{ opacity: p.status === "hidden" ? 0.55 : 1 }}>
                <td>{p.profiles?.display_name || "Rider"}</td><td>{[getTown(p.town_id)?.name, p.groups?.name].filter(Boolean).join(" · ") || "—"}</td>
                <td style={{ maxWidth: 480 }}>{p.body}</td><td>{p.status}</td>
                <td><AdminAction table="posts" id={p.id} patch={{ status: p.status === "hidden" ? "published" : "hidden" }} label={p.status === "hidden" ? "Unhide" : "Hide"} /></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </>
    );
  }
}
