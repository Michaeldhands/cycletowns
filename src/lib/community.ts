import { hasSupabase, supabasePublic, supabaseServer } from "@/lib/supabase/server";

export type { Group, Member, Post } from "@/lib/community-types";
import type { Group, Member, Post } from "@/lib/community-types";

const withCounts = async (groups: Group[]) => {
  if (!groups.length) return groups;
  const sb = supabasePublic();
  const { data } = await sb.from("group_members").select("group_id").in("group_id", groups.map((g) => g.id)).neq("role", "pending");
  const counts: Record<string, number> = {};
  (data || []).forEach((m: { group_id: string }) => (counts[m.group_id] = (counts[m.group_id] || 0) + 1));
  return groups.map((g) => ({ ...g, member_count: counts[g.id] || 0 }));
};

export async function fetchTownGroups(townId: string): Promise<Group[]> {
  if (!hasSupabase()) return [];
  const { data } = await supabasePublic().from("groups").select("*").eq("town_id", townId).order("created_at");
  const groups = await withCounts((data as Group[]) || []);
  return groups.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
}

export async function fetchGroup(id: string): Promise<{ group: Group; members: Member[]; posts: Post[] } | null> {
  if (!hasSupabase()) return null;
  const sb = await supabaseServer();
  const { data: group } = await sb.from("groups").select("*").eq("id", id).maybeSingle();
  if (!group) return null;
  const [{ data: members }, { data: posts }] = await Promise.all([
    sb.from("group_members").select("user_id, role, profiles(display_name, avatar_url, tier)").eq("group_id", id).order("created_at"),
    sb.from("posts").select("*, profiles(display_name, avatar_url, tier, home_town)").eq("group_id", id).eq("status", "published").order("created_at", { ascending: false }).limit(50),
  ]);
  return { group: group as Group, members: (members as unknown as Member[]) || [], posts: (posts as unknown as Post[]) || [] };
}

export async function fetchFeed(opts: { townId?: string; limit?: number } = {}): Promise<Post[]> {
  if (!hasSupabase()) return [];
  let q = supabasePublic()
    .from("posts")
    .select("*, profiles(display_name, avatar_url, tier, home_town), groups(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(opts.limit || 40);
  if (opts.townId) q = q.eq("town_id", opts.townId);
  const { data } = await q;
  return (data as unknown as Post[]) || [];
}

