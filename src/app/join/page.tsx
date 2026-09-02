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
  const next = review ? `/towns/${review}#review` : town ? `/towns/${town}` : "/account";
  return (
    <ProsePage
      kick="Join the bunch"
      title="Free, obviously."
      lead="Save towns, rate what you ride, join groups and unlock member offers. Founding riders get Insider status from day one."
    >
      <AuthForm mode="join" next={next} />
    </ProsePage>
  );
}
