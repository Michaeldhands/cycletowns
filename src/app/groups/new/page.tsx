import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProsePage } from "@/components/Prose";
import { CreateGroupForm } from "@/components/Community";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Start a group" };
export const dynamic = "force-dynamic";

export default async function NewGroup({ searchParams }: PageProps<"/groups/new">) {
  const sp = await searchParams;
  const town = typeof sp.town === "string" ? sp.town : undefined;
  const me = await currentUser();
  if (!me) redirect(`/login?next=${encodeURIComponent(`/groups/new${town ? `?town=${town}` : ""}`)}`);
  return (
    <ProsePage kick="Groups" title="Start a group." lead="A bunch, a club, a Saturday crew — give riders in your town somewhere to find each other.">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CreateGroupForm userId={me.id} townId={town} />
      </div>
    </ProsePage>
  );
}
