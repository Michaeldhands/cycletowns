import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Subscribed", robots: { index: false } };

export default async function Subscribed({ searchParams }: PageProps<"/subscribed">) {
  const sp = await searchParams;
  const ok = sp.ok !== "0";
  const unsub = typeof sp.u === "string" ? sp.u : "";
  return (
    <ProsePage kick="Newsletter" title={ok ? "You're on the list." : "That link didn't work."}>
      <div className="wprose">
        {ok ? (
          <>
            <p>
              Confirmed. You&rsquo;ll get the Cycletowns newsletter — new town guides, routes worth travelling for, and the
              occasional long read. No fixed schedule: we send it when there&rsquo;s something worth your time.
            </p>
            <p>
              Every email has an unsubscribe link. If you&rsquo;d rather keep one handy now, here it is —{" "}
              {unsub ? <a href={`/api/unsubscribe?t=${unsub}`}>unsubscribe</a> : "it's in the footer of every email"}.
            </p>
            <p><Link href="/news">Read the latest ›</Link></p>
          </>
        ) : (
          <>
            <p>
              We couldn&rsquo;t match that confirmation link. It may have been truncated by your email app, or already used —
              if you&rsquo;ve confirmed once, you&rsquo;re already on the list and there&rsquo;s nothing more to do.
            </p>
            <p>
              Still stuck? Email <a href="mailto:hello@cycletowns.com">hello@cycletowns.com</a> or{" "}
              <Link href="/news">sign up again ›</Link>
            </p>
          </>
        )}
      </div>
    </ProsePage>
  );
}
