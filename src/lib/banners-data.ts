import type { Banner, BannerMap } from "@/lib/banners";
import { hasSupabase, supabasePublic } from "@/lib/supabase/server";

/** Server-only. Never lets a database blip take a page down — an empty map means stock photos. */
export async function loadBanners(): Promise<BannerMap> {
  if (!hasSupabase()) return {};
  try {
    const { data } = await supabasePublic().from("banners").select("*");
    const rows = (data as Banner[] | null) || [];
    return Object.fromEntries(rows.map((b) => [b.slot, b]));
  } catch {
    return {};
  }
}
