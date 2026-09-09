import "server-only";
import { supabaseAdmin } from "@/lib/stripe/server";

/* Aggregate demand signals.

   saved_towns is protected by `saved_own` — a rider may only read their own rows, which is
   correct and stays that way. Counting saves through the request-scoped client therefore
   returns the *caller's* saves, not the site's: the admin overview read a near-zero number
   under a "Live data" badge, and every partner's dashboard reported 0 riders saved.

   These read with the service key and return counts only. No rider is ever identified, and
   nothing here returns a user_id. A partner learns how many people saved their town, never
   which people.
*/

const rows = async (): Promise<{ town_id: string }[]> => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const { data } = await supabaseAdmin().from("saved_towns").select("town_id").limit(50000);
  return (data as { town_id: string }[]) || [];
};

/** How many riders have saved each town. */
export async function savedCounts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  (await rows()).forEach((r) => (out[r.town_id] = (out[r.town_id] || 0) + 1));
  return out;
}

/** Total saves across the site. */
export async function savedTotal(): Promise<number> {
  return (await rows()).length;
}
