import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";
import { PartnerClaim } from "@/components/PartnerClaim";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Claim your listing" };
export const dynamic = "force-dynamic";

export default async function Claim() {
  const me = await currentUser();
  const sb = await supabaseServer();
  const [{ data: towns }, { data: places }] = await Promise.all([
    sb.from("towns").select("id,name").eq("status", "full").order("name"),
    sb.from("places").select("id,town_id,kind,name").order("name"),
  ]);
  return (
    <ProsePage kick="Partners" title="Claim your listing." lead="Cafés, bike shops, stays and guides: claim your place on the town guide, earn the verified bike-friendly badge, and hear from the riders heading your way.">
      <PartnerClaim userId={me?.id ?? null} email={me?.email ?? null} towns={towns || []} places={places || []} />
    </ProsePage>
  );
}
