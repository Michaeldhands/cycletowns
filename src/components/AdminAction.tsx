"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** One-click admin update on a row (RLS only lets admins do this). */
export function AdminAction({ table, id, patch, label }: { table: string; id: string; patch: Record<string, unknown>; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="lk-ghost"
      style={{ padding: "5px 10px", fontSize: 12 }}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await supabaseBrowser().from(table).update(patch).eq("id", id);
        setBusy(false);
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
