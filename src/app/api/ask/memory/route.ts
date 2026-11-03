import type { NextRequest } from "next/server";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Forget one remembered fact, or all of them. Row-level security means a rider can only touch their own. */
export async function DELETE(req: NextRequest) {
  const me = await currentUser();
  if (!me) return Response.json({ error: "Sign in first." }, { status: 401 });
  const { id, all } = (await req.json().catch(() => ({}))) as { id?: string; all?: boolean };
  const sb = await supabaseServer();
  const q = sb.from("rider_memories").delete().eq("user_id", me.id);
  const { error } = all ? await q : id ? await q.eq("id", id) : { error: { message: "Nothing to delete." } };
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
