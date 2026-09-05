import { EVENTS, type CtEvent } from "@/lib/events";
import { hasSupabase, supabasePublic } from "@/lib/supabase/server";

/* Server-only loading, kept out of lib/events.ts because client components import that file. */

/** Database first, bundled file as the fallback, so the site still builds if Supabase is away. */
export async function loadEvents(): Promise<CtEvent[]> {
  if (!hasSupabase()) return EVENTS;
  try {
    const { data } = await supabasePublic().from("events").select("*").eq("status", "published");
    const rows = (data as CtEvent[] | null) || [];
    return rows.length ? rows.map((r) => ({ ...r, km: r.km || [] })) : EVENTS;
  } catch {
    return EVENTS;   // never let a database blip take the events page down
  }
}
