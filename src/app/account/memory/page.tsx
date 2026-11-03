import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProsePage } from "@/components/Prose";
import { MemoryList } from "@/components/MemoryList";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "What Cycletowns remembers", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  const me = await currentUser();
  if (!me) redirect("/login?next=/account/memory");
  const sb = await supabaseServer();
  const { data } = await sb.from("rider_memories").select("id, fact, kind, created_at").eq("user_id", me.id).order("created_at", { ascending: false });
  return (
    <ProsePage
      kick="Your account"
      title="What Ask Cycletowns remembers."
      lead="These are the things you’ve told the concierge about how you ride. It uses them to tailor answers, and nothing else. Forget any of them, or all of them, whenever you like."
    >
      <MemoryList initial={(data as { id: string; fact: string; kind: string; created_at: string }[] | null) || []} />
      <p className="photocredit" style={{ marginTop: 22 }}>
        Your conversations themselves aren&rsquo;t stored — only these notes. <Link href="/ask">Back to Ask Cycletowns ›</Link>{" "}
        · <Link href="/privacy">Privacy</Link>
      </p>
    </ProsePage>
  );
}
