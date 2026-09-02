"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { timeAgo, type Post } from "@/lib/community-types";
import { Avatar } from "./Avatar";
import { TOWNS } from "@/lib/towns";

/** Write a post to a town feed or a group. */
export function PostComposer({ userId, townId, groupId, towns }: { userId: string | null; townId?: string; groupId?: string; towns?: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [town, setTown] = useState(townId || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!userId)
    return (
      <div className="unlocknote" style={{ fontSize: 14, padding: 14 }}>
        <Link href="/join">Join free</Link> or <Link href="/login">log in</Link> to post. Every post earns 10 points.
      </div>
    );
  const send = async () => {
    if (body.trim().length < 3) return setMsg("Say a little more.");
    if (towns && !town) return setMsg("Pick a town.");
    setBusy(true);
    setMsg("");
    const { error } = await supabaseBrowser().from("posts").insert({ user_id: userId, town_id: town || null, group_id: groupId || null, body: body.trim() });
    setBusy(false);
    if (error) return setMsg(error.message);
    setBody("");
    router.refresh();
  };
  return (
    <div className="wscorebox" style={{ maxWidth: "none", marginBottom: 16 }}>
      {towns && (
        <div className="field">
          <label>Town</label>
          <select value={town} onChange={(e) => setTown(e.target.value)}>
            <option value="">Choose a town…</option>
            {TOWNS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}
      <div className="field" style={{ marginBottom: 10 }}>
        <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="A ride, a café find, a road to avoid — share it with the bunch." maxLength={1000} />
      </div>
      <div className="wbar" style={{ alignItems: "center" }}>
        <button className="lk-coral" onClick={send} disabled={busy}>{busy ? "Posting…" : "Post"}</button>
        {msg && <span style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700 }}>{msg}</span>}
      </div>
    </div>
  );
}

export function PostCard({ p, showTown = false }: { p: Post; showTown?: boolean }) {
  const name = p.profiles?.display_name || "Rider";
  const town = p.town_id ? TOWNS.find((t) => t.id === p.town_id) : null;
  return (
    <div className="post">
      <div className="ph">
        <Avatar name={name} url={p.profiles?.avatar_url} size={36} />
        <div>
          <div className="who">{name}{p.profiles?.tier === "champion" ? " 👑" : ""}</div>
          <div className="when">{timeAgo(p.created_at)}{p.profiles?.home_town ? ` · ${p.profiles.home_town}` : ""}</div>
        </div>
      </div>
      <div className="body" style={{ whiteSpace: "pre-wrap" }}>{p.body}</div>
      {(showTown && town) || p.groups?.name ? (
        <div className="tagline">
          {showTown && town && <Link href={`/towns/${town.id}`}>📍 {town.name}</Link>}
          {showTown && town && p.groups?.name ? " · " : ""}
          {p.groups?.name && p.group_id && <Link href={`/groups/${p.group_id}`}>👥 {p.groups.name}</Link>}
        </div>
      ) : null}
    </div>
  );
}

/** Join / leave / request buttons for a group. */
export function GroupJoin({ groupId, privacy, userId, role }: { groupId: string; privacy: "public" | "private"; userId: string | null; role: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!userId) return <Link href={`/login?next=/groups/${groupId}`} className="lk-coral">{privacy === "public" ? "Join group" : "Request to join"}</Link>;
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  };
  const sb = () => supabaseBrowser();
  if (role === "pending") return <button className="lk-ghost" disabled>Request sent</button>;
  if (role) return <button className="lk-ghost" disabled={busy} onClick={() => act(() => sb().from("group_members").delete().eq("group_id", groupId).eq("user_id", userId))}>Leave group</button>;
  return (
    <button className="lk-coral" disabled={busy} onClick={() => act(() => sb().from("group_members").insert({ group_id: groupId, user_id: userId, role: privacy === "public" ? "member" : "pending" }))}>
      {privacy === "public" ? "Join group" : "Request to join"}
    </button>
  );
}

/** Approve a pending member (group admins). */
export function ApproveMember({ groupId, memberId }: { groupId: string; memberId: string }) {
  const router = useRouter();
  return (
    <button className="lk-coral" style={{ padding: "5px 10px", fontSize: 12 }} onClick={async () => { await supabaseBrowser().from("group_members").update({ role: "member" }).eq("group_id", groupId).eq("user_id", memberId); router.refresh(); }}>
      Approve
    </button>
  );
}

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DISC = ["Road", "Gravel", "MTB", "E-bike", "Mixed"];

export function CreateGroupForm({ userId, townId }: { userId: string; townId?: string }) {
  const router = useRouter();
  const [f, setF] = useState({ town_id: townId || "", name: "", description: "", privacy: "public", ride_day: "Saturday", ride_time: "7:00 am", discipline: "Road" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });
  const create = async () => {
    if (!f.town_id || f.name.trim().length < 3) return setMsg("Pick a town and give the group a name.");
    setBusy(true);
    const sb = supabaseBrowser();
    const { data, error } = await sb.from("groups").insert({ ...f, name: f.name.trim(), description: f.description.trim(), created_by: userId }).select("id").single();
    if (error || !data) {
      setBusy(false);
      return setMsg(error?.message || "Something went wrong");
    }
    await sb.from("group_members").insert({ group_id: data.id, user_id: userId, role: "admin" });
    router.push(`/groups/${data.id}`);
  };
  return (
    <div className="wscorebox" style={{ maxWidth: 640 }}>
      <div className="field"><label>Town</label>
        <select value={f.town_id} onChange={(e) => set("town_id", e.target.value)}>
          <option value="">Choose…</option>
          {TOWNS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="field"><label>Group name</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Bright Saturday Bunch" maxLength={60} /></div>
      <div className="field"><label>What’s it about?</label><textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Pace, distance, coffee stop, who it’s for." maxLength={400} /></div>
      <div className="field"><label>Riding</label><div className="filterchips">{DISC.map((d) => <button key={d} type="button" className={"filterchip" + (f.discipline === d ? " on" : "")} onClick={() => set("discipline", d)}>{d}</button>)}</div></div>
      <div className="field"><label>Regular ride day</label><div className="filterchips">{DAYS.map((d) => <button key={d} type="button" className={"filterchip" + (f.ride_day === d ? " on" : "")} onClick={() => set("ride_day", d)}>{d}</button>)}</div></div>
      <div className="field"><label>Roll-out time</label><input value={f.ride_time} onChange={(e) => set("ride_time", e.target.value)} placeholder="7:00 am" maxLength={20} /></div>
      <div className="field"><label>Privacy</label>
        <div className="filterchips">
          <button type="button" className={"filterchip" + (f.privacy === "public" ? " on" : "")} onClick={() => set("privacy", "public")}>Public — anyone can join</button>
          <button type="button" className={"filterchip" + (f.privacy === "private" ? " on" : "")} onClick={() => set("privacy", "private")}>🔒 Private — approve requests</button>
        </div>
      </div>
      <button className="lk-coral big" onClick={create} disabled={busy}>{busy ? "Creating…" : "Create group"}</button>
      {msg && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
