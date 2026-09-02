import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
/** True when the site is wired to a Supabase project (false in a bare build → features degrade gracefully). */
export const hasSupabase = () => Boolean(SUPABASE_URL && SUPABASE_ANON);

/** Server-side client bound to the current request's cookies (App Router). */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (all) => {
        try {
          all.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — the proxy refreshes sessions instead */
        }
      },
    },
  });
}

/** Anonymous client for public reads (no cookies) — safe in static/ISR rendering. */
export function supabasePublic() {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, { cookies: { getAll: () => [], setAll: () => {} } });
}

export type Profile = {
  id: string;
  handle: string | null;
  display_name: string | null;
  avatar_url: string | null;
  home_town: string | null;
  country: string | null;
  rider_type: string | null;
  ability: string | null;
  bio: string | null;
  points: number;
  tier: "rider" | "insider" | "champion";
  is_admin: boolean;
  onboarded: boolean;
  stripe_customer_id?: string | null;
  membership?: "free" | "insider";
  membership_interval?: string | null;
  membership_until?: string | null;
};

/** Active Insider member? */
export const isMember = (p: Profile | null | undefined) => !!p && p.membership === "insider" && (!p.membership_until || new Date(p.membership_until).getTime() > Date.now() - 3 * 86400000);

/** Current user + profile, or null. */
export async function currentUser(): Promise<{ id: string; email: string | null; profile: Profile | null } | null> {
  if (!hasSupabase()) return null;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  return { id: data.user.id, email: data.user.email ?? null, profile: (profile as Profile) ?? null };
}
