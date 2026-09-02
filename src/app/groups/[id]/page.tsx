import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { Avatar } from "@/components/Avatar";
import { ApproveMember, GroupJoin, PostCard, PostComposer } from "@/components/Community";
import { fetchGroup } from "@/lib/community";
import { currentUser } from "@/lib/supabase/server";
import { ridePic } from "@/lib/images";
import { getTown } from "@/lib/towns";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/groups/[id]">): Promise<Metadata> {
  const { id } = await params;
  const g = await fetchGroup(id);
  return g ? { title: `${g.group.name} · ${getTown(g.group.town_id)?.name || "Group"}` } : {};
}

export default async function GroupPage({ params }: PageProps<"/groups/[id]">) {
  const { id } = await params;
  const [data, me] = await Promise.all([fetchGroup(id), currentUser()]);
  if (!data) notFound();
  const { group: g, members, posts } = data;
  const town = getTown(g.town_id);
  const mine = me ? members.find((m) => m.user_id === me.id) : undefined;
  const isAdmin = mine?.role === "admin" || !!me?.profile?.is_admin;
  const active = members.filter((m) => m.role !== "pending");
  const pending = members.filter((m) => m.role === "pending");
  const canPost = !!mine && mine.role !== "pending";
  return (
    <>
      <TopBar back={town ? { href: `/towns/${town.id}`, label: town.name } : undefined} />
      <div className="whero" style={{ height: 300 }}>
        <Photo src={ridePic("group", "grp-" + g.id, 1400)} />
        <div className="wov">
          <div className="winner">
            <div className="bc"><Link href="/">Cycletowns</Link> › {town && <Link href={`/towns/${town.id}`}>{town.name}</Link>} › <b>{g.name}</b></div>
            <div className="awards">
              <span className="award alt">{g.privacy === "public" ? "Public group" : "🔒 Private group"}</span>
              {g.discipline && <span className="award">{g.discipline}</span>}
              {g.ride_day && <span className="award">{g.ride_day}{g.ride_time ? ` · ${g.ride_time}` : ""}</span>}
            </div>
            <h1 style={{ fontSize: 48 }}>{g.name}</h1>
            <div className="wbar" style={{ marginTop: 12 }}>
              <GroupJoin groupId={g.id} privacy={g.privacy} userId={me?.id ?? null} role={mine?.role ?? null} />
            </div>
          </div>
        </div>
      </div>
      <div className="wsec" style={{ paddingBottom: 40 }}>
        <div className="twocol">
          <div>
            {g.description && <p style={{ fontSize: 15.5, color: "var(--grey-d)", lineHeight: 1.55, marginBottom: 18 }}>{g.description}</p>}
            <div className="wh"><div><h2>Group feed</h2><span className="wsub">{posts.length} posts</span></div></div>
            {canPost ? <PostComposer userId={me!.id} townId={g.town_id} groupId={g.id} /> : me ? <div className="unlocknote" style={{ fontSize: 14, padding: 14, marginBottom: 14 }}>Join the group to post.</div> : <PostComposer userId={null} />}
            {posts.length === 0 && <p className="wsub" style={{ display: "block" }}>Nothing posted yet — first ride report wins.</p>}
            {posts.map((p) => <PostCard key={p.id} p={p} />)}
          </div>
          <div>
            <div className="wscorebox" style={{ maxWidth: "none" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>{active.length} member{active.length === 1 ? "" : "s"}</h3>
              {active.map((m) => (
                <div className="grow" key={m.user_id} style={{ alignItems: "center", gap: 10, justifyContent: "flex-start" }}>
                  <Avatar name={m.profiles?.display_name || "Rider"} url={m.profiles?.avatar_url} size={30} />
                  <span style={{ color: "var(--ink)", fontWeight: 700 }}>{m.profiles?.display_name || "Rider"}</span>
                  {m.role === "admin" && <b style={{ marginLeft: "auto", fontSize: 11, color: "var(--teal)" }}>ADMIN</b>}
                </div>
              ))}
              {isAdmin && pending.length > 0 && (
                <>
                  <h3 style={{ fontSize: 13, fontWeight: 800, margin: "16px 0 6px" }}>Requests</h3>
                  {pending.map((m) => (
                    <div className="grow" key={m.user_id} style={{ alignItems: "center", gap: 10, justifyContent: "flex-start" }}>
                      <Avatar name={m.profiles?.display_name || "Rider"} url={m.profiles?.avatar_url} size={30} />
                      <span style={{ color: "var(--ink)", fontWeight: 700 }}>{m.profiles?.display_name || "Rider"}</span>
                      <span style={{ marginLeft: "auto" }}><ApproveMember groupId={g.id} memberId={m.user_id} /></span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
