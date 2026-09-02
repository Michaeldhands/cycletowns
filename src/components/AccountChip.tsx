"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { hasSupabaseClient, supabaseBrowser } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";

type Me = { name: string; avatar: string | null; points: number };
let cached: Me | null | undefined; // undefined = not loaded yet

/** Log-in button for guests; avatar + points for signed-in riders. Reads the session in the browser so pages stay static. */
export function AccountChip({ compact = false }: { compact?: boolean }) {
  const [me, setMe] = useState<Me | null | undefined>(cached);
  useEffect(() => {
    if (!hasSupabaseClient()) return;
    const sb = supabaseBrowser();
    const load = async () => {
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        cached = null;
        setMe(null);
        return;
      }
      const { data: p } = await sb.from("profiles").select("display_name, avatar_url, points").eq("id", data.user.id).maybeSingle();
      cached = { name: p?.display_name || data.user.email?.split("@")[0] || "Rider", avatar: p?.avatar_url || null, points: p?.points || 0 };
      setMe(cached);
    };
    load();
    const { data: sub } = sb.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);
  if (!me)
    return (
      <Link href="/login" className={"lk-ghost" + (compact ? "" : " navdesk")} style={{ textDecoration: "none" }}>
        Log in
      </Link>
    );
  return (
    <Link href="/account" className="savepill" style={{ textDecoration: "none", padding: "5px 12px 5px 5px" }} title={me.name}>
      <Avatar name={me.name} url={me.avatar} size={28} />
      <span style={{ fontSize: 12.5 }}>★ {me.points}</span>
    </Link>
  );
}
