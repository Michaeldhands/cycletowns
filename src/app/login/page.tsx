import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProsePage } from "@/components/Prose";
import { AuthForm } from "@/components/AuthForm";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Log in" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const me = await currentUser();
  if (me) redirect("/account");
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/account";
  const err = sp.error === "link";
  return (
    <ProsePage kick="Log in" title="Welcome back." lead={err ? "That sign-in link has expired or was already used — request a fresh one below." : "We’ll email you a link — no password to remember."}>
      <AuthForm mode="login" next={next} />
    </ProsePage>
  );
}
