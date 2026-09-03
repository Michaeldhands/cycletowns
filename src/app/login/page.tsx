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
  const why = typeof sp.why === "string" ? sp.why : "";
  return (
    <ProsePage kick="Log in" title="Welcome back." lead={err ? "That sign-in didn’t complete — request a fresh link below." : "We’ll email you a link — no password to remember."}>
      {err && why && (
        <p style={{ fontSize: 12.5, color: "var(--grey-m)", textAlign: "center", marginBottom: 14 }}>
          Reason given: <code>{why}</code>
        </p>
      )}
      <AuthForm mode="login" next={next} />
    </ProsePage>
  );
}
