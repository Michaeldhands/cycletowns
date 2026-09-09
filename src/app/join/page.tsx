import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProsePage } from "@/components/Prose";
import { AuthForm } from "@/components/AuthForm";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Join the bunch" };

export default async function Join({ searchParams }: PageProps<"/join">) {
  const sp = await searchParams;
  const me = await currentUser();
  if (me) redirect("/account");
  const review = typeof sp.review === "string" ? sp.review : undefined;
  const town = typeof sp.town === "string" ? sp.town : undefined;
  // ?next was being ignored, so five flows (membership, partner claim, a built plan, a built
  // loop, Strava connect) dropped the rider on /account instead of back where they were.
  const raw = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : undefined;
  const next = review ? `/towns/${review}#review` : town ? `/towns/${town}` : raw || "/account";
  return (
    <ProsePage
      kick="Join the bunch"
      title="Free, obviously."
      lead="Save towns, rate what you ride, join groups and unlock member offers. Free, and it stays free — Insider is optional."
    >
      <AuthForm mode="join" next={next} />
    </ProsePage>
  );
}
