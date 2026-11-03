import type { Metadata } from "next";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { AskConcierge } from "@/components/AskConcierge";
import { currentUser } from "@/lib/supabase/server";
import { hasAsk } from "@/lib/ask/config";

export const metadata: Metadata = {
  title: "Ask Cycletowns",
  description: "A ride concierge for Victoria: where to ride, what to enter and how to spend a weekend on the bike — answered from our researched guides.",
};
export const dynamic = "force-dynamic";

export default async function AskPage({ searchParams }: PageProps<"/ask">) {
  const sp = await searchParams;
  const me = await currentUser();
  const q = typeof sp.q === "string" ? sp.q.slice(0, 300) : undefined;
  return (
    <>
      <TopBar />
      <div className="sec2" style={{ paddingTop: 34 }}>
        <div className="in" style={{ maxWidth: 820 }}>
          <div className="kick">Ask Cycletowns · Victoria</div>
          <div className="h2">Where are we riding?</div>
          <div className="lead">
            Tell it how you ride and what you&rsquo;re after. It answers from our researched guides, builds loops on real
            roads and plans the days — and says so when it doesn&rsquo;t know.
          </div>
          <AskConcierge enabled={hasAsk()} signedIn={Boolean(me)} initial={q} autoSend={Boolean(q) && sp.go === "1"} />
        </div>
      </div>
      <Footer />
    </>
  );
}
