import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
export const metadata: Metadata = { title: "Join the bunch" };
export default function Join() {
  return (
    <ComingSoon kick="Join the bunch" title="Rider accounts open soon." lead="Save towns, rate what you ride, join groups and unlock member offers. Leave your email and you’ll be first in when accounts open." form="join-waitlist" cta="Put me first in line">
      <p>Founding riders get Insider status from day one.</p>
    </ComingSoon>
  );
}
