import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
export const metadata: Metadata = { title: "Log in" };
export default function Login() {
  return <ComingSoon kick="Log in" title="Accounts are almost here." lead="Rider log-in opens with the next release. Leave your email and we’ll let you know the moment it’s live." form="join-waitlist" cta="Notify me" />;
}
