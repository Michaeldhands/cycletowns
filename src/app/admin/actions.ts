"use server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/supabase/server";

/** Purge cached pages after an admin edits content. */
export async function revalidateContent() {
  const me = await currentUser();
  if (!me?.profile?.is_admin) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
