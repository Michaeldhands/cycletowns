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
        // Drop anything the service worker kept, so a shared device shows nothing of this session.
        try { navigator.serviceWorker?.controller?.postMessage("ct-clear-cache"); } catch {}
        router.push("/");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
