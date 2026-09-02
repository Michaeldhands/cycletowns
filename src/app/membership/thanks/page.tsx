import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const dynamic = "force-dynamic";

export default function Thanks() {
  return (
    <ProsePage kick="Insider" title="You’re in. Welcome, Insider." lead="Thanks for backing the bunch. Your membership is active — double points, ad-free browsing and partner offers are yours from now.">
      <div style={{ textAlign: "center", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/offers" className="lk-coral big">See member offers</Link>
        <Link href="/account" className="lk-ghost big">Your account</Link>
      </div>
      <p style={{ textAlign: "center", color: "var(--grey-m)", fontSize: 12.5, marginTop: 16 }}>It can take a few seconds for your account to update — refresh if the badge isn’t showing yet.</p>
    </ProsePage>
  );
}
