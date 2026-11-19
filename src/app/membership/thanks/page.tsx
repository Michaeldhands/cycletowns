import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const dynamic = "force-dynamic";

export default function Thanks() {
  return (
    <ProsePage kick="Member" title="Thank you for joining." lead="Your membership is active. It pays for inspections no town can buy, and gives riders a stronger voice. We’re glad you’re with us.">
      <div style={{ textAlign: "center", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/rankings" className="lk-coral big">See the guide</Link>
        <Link href="/account" className="lk-ghost big">Your account</Link>
      </div>
      <p style={{ textAlign: "center", color: "var(--grey-m)", fontSize: 12.5, marginTop: 16 }}>It can take a few seconds for your account to update — refresh if it isn’t showing yet.</p>
    </ProsePage>
  );
}
