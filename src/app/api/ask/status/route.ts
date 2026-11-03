import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { hasAsk } from "@/lib/ask/config";
import { RETURNING, starters } from "@/lib/ask/starters";

export const dynamic = "force-dynamic";

/** What the dock needs before it opens: is it on, who's asking, and what to suggest first. No model call. */
export async function GET() {
  const me = await currentUser();
  let remembered = 0;
  if (me) {
    const sb = await supabaseServer();
    const { count } = await sb.from("rider_memories").select("id", { count: "exact", head: true }).eq("user_id", me.id);
    remembered = count || 0;
  }
  const first = (me?.profile?.display_name || "").split(" ")[0] || null;
  return Response.json(
    {
      enabled: hasAsk(),
      signedIn: Boolean(me),
      greeting: me ? (first ? `Welcome back, ${first}.` : "Welcome back.") : null,
      starters: me && remembered ? [...RETURNING, ...starters().slice(0, 2)] : starters(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
