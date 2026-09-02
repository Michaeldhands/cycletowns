/* Client-safe types & helpers for community features (no server imports). */
export type Group = {
  id: string;
  town_id: string;
  name: string;
  description: string;
  privacy: "public" | "private";
  ride_day: string | null;
  ride_time: string | null;
  discipline: string | null;
  created_by: string | null;
  created_at: string;
  member_count?: number;
};
export type Member = { user_id: string; role: "member" | "admin" | "pending"; profiles: { display_name: string | null; avatar_url: string | null; tier: string } | null };
export type Post = {
  id: string;
  user_id: string;
  town_id: string | null;
  group_id: string | null;
  body: string;
  image_url: string | null;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null; tier: string; home_town: string | null } | null;
  groups?: { name: string } | null;
};

export function timeAgo(iso: string): string {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}
