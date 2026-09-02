"use client";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="lk-ghost"
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        try { localStorage.removeItem("ct_saved"); } catch {}
        router.push("/");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
