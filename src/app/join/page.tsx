import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProsePage } from "@/components/Prose";
import { AuthForm } from "@/components/AuthForm";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Create a free account" };

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
      kick="Free account"
      title="Free, and it stays free."
      lead="Save towns and trips, add your view to Riders say, and let Ask Cycletowns remember how you ride. Membership is optional."
    >
      <AuthForm mode="join" next={next} />
    </ProsePage>
  );
}
