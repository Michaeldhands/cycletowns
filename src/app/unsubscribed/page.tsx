import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Unsubscribed", robots: { index: false } };

export default async function Unsubscribed({ searchParams }: PageProps<"/unsubscribed">) {
  const ok = (await searchParams).ok !== "0";
  return (
    <ProsePage kick="Newsletter" title={ok ? "You're unsubscribed." : "That link didn't work."}>
      <div className="wprose">
        {ok ? (
          <>
            <p>Done — no more newsletters. It takes effect immediately, so nothing already queued will reach you.</p>
            <p>
              You&rsquo;ll still get email about your account if you have one: sign-in links, and anything about a
              membership. Those aren&rsquo;t marketing and you can&rsquo;t unsubscribe from them without closing the account.
            </p>
            <p>Changed your mind? <Link href="/news">Sign up again from the news page ›</Link></p>
          </>
        ) : (
          <>
            <p>
              We couldn&rsquo;t match that unsubscribe link — it may have been truncated by an email client, or already used.
            </p>
            <p>
              Email <a href="mailto:hello@cycletowns.com">hello@cycletowns.com</a> and we&rsquo;ll take you off the list by
              hand. You don&rsquo;t need an account and you won&rsquo;t need to ask twice.
            </p>
          </>
        )}
      </div>
    </ProsePage>
  );
}
