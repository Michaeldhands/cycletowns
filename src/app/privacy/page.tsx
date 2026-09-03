import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Privacy policy" };

/* Written to describe what the site actually does. If you change what is collected,
   or add a third-party service, change this page in the same commit. */
export default function Page() {
  return (
    <ProsePage kick="Legal" title="Privacy policy" lead="What we collect, why we collect it, and how to get rid of it.">
      <div className="wprose">
        <p><b>Last updated:</b> 3 September 2026</p>

        <p>
          Cycletowns is operated by <b>Sport2040</b> (ABN 73 680 648 855), based in Australia. This policy explains what personal information the site collects,
          what we do with it, who else can see it, and how you can get a copy of it or have it deleted. If anything
          here is unclear, email <a href="mailto:hello@cycletowns.com">hello@cycletowns.com</a> and we will answer you.
        </p>

        <h3>You can use most of the site without giving us anything</h3>
        <p>
          Town guides, rankings, news, the trip planner and the loop builder all work without an account. We do not
          run advertising trackers, and we do not use analytics or profiling cookies. We do not sell personal
          information, and we never will.
        </p>

        <h3>What we collect when you make an account</h3>
        <ul>
          <li><b>Your email address.</b> Required — it is how you sign in, because we do not use passwords.</li>
          <li>
            <b>Basic Google profile details</b>, if you choose to sign in with Google: your name, email address and
            profile picture. Google does not give us access to anything else in your Google account.
          </li>
          <li>
            <b>Anything you choose to add to your profile:</b> display name, home town, country, how you ride, your
            ability level, a short bio, and a photo if you upload one. All of these are optional.
          </li>
          <li>
            <b>What you contribute:</b> reviews and ratings of towns, posts, groups you join, cafés and routes you
            suggest, towns you save, trip plans and loops you save.
          </li>
          <li><b>Your points balance</b> and the record of how you earned it.</li>
        </ul>

        <h3>What is public and what is not</h3>
        <p>
          Your reviews, posts, and your display name and profile picture are visible to anyone using the site — that is
          the point of a rider-ranked guide. Saved loops are shareable by link. <b>Your email address is never shown
          publicly</b> and is not visible to other riders. Towns you save and trip plans you have not shared are
          private to your account.
        </p>

        <h3>Payments</h3>
        <p>
          Insider membership is billed through Stripe. <b>We never see or store your card details</b> — those go
          straight to Stripe, which is certified to handle them. We keep a Stripe customer reference, whether your
          membership is active, whether it is monthly or annual, and when it runs to. Stripe&rsquo;s own privacy policy
          governs what it does with the payment data it holds.
        </p>

        <h3>Email</h3>
        <p>
          We email you sign-in links, and messages about your account or membership when there is something you need to
          know. We will not add you to a marketing list without asking you first, and any marketing email we do send
          will have a working unsubscribe link.
        </p>

        <h3>Cookies</h3>
        <p>
          We set cookies for one reason: to keep you signed in and to complete the sign-in process securely. There are
          no advertising or tracking cookies on this site. Clearing them signs you out; nothing else breaks.
        </p>

        <h3>Who else handles your information</h3>
        <p>These are the services the site runs on. Each only receives what it needs to do its job.</p>
        <ul>
          <li><b>Supabase</b> — the database and sign-in system that stores your account and contributions.</li>
          <li><b>Netlify</b> — hosting. It keeps standard server logs, including IP addresses, for security and diagnostics.</li>
          <li><b>Stripe</b> — payments and subscriptions, if you become a member.</li>
          <li><b>Google</b> — only if you choose to sign in with Google.</li>
          <li><b>Resend</b> — delivery of sign-in and account emails.</li>
          <li>
            <b>OpenRouteService and OpenStreetMap</b> — building loop routes and drawing maps. When you build a loop, the
            start point and distance are sent to OpenRouteService. This is not tied to your account, and we do not send
            it your identity.
          </li>
        </ul>
        <p>
          Some of these providers operate servers outside Australia, so your information may be stored or processed
          overseas, including in the United States and the European Union.
        </p>

        <h3>How long we keep it</h3>
        <p>
          We keep your account for as long as it exists. If you delete your account we remove your profile, saved towns,
          trip plans and loops. Reviews and posts may remain, with your name removed, because other riders&rsquo;
          rankings depend on them — tell us if you want yours taken down entirely and we will remove them. Payment
          records are kept for as long as Australian tax and record-keeping law requires.
        </p>

        <h3>Your rights</h3>
        <p>
          You can ask us for a copy of everything we hold about you, ask us to correct it, or ask us to delete your
          account and its contents. Email <a href="mailto:hello@cycletowns.com">hello@cycletowns.com</a> and we will
          action it within 30 days. You can edit or delete most of it yourself from your account page at any time. If
          you are in the UK or EU, you also have the right to object to processing and to lodge a complaint with your
          local data protection authority; in Australia you can complain to the Office of the Australian Information
          Commissioner.
        </p>

        <h3>Children</h3>
        <p>
          Cycletowns is not intended for children under 16, and we do not knowingly collect their information. If you
          believe a child has made an account, tell us and we will remove it.
        </p>

        <h3>Security</h3>
        <p>
          The site is served over HTTPS, sign-in uses one-time links rather than passwords, and the database enforces
          per-row access rules so riders can only read and change their own data. No system is perfect; if we ever have
          a breach affecting you, we will tell you and the relevant regulator as the law requires.
        </p>

        <h3>Changes</h3>
        <p>
          If we change this policy we will update the date at the top, and for anything significant we will tell account
          holders by email rather than quietly editing the page.
        </p>

        <h3>Contact</h3>
        <p>
          Privacy questions, access requests and complaints: <a href="mailto:hello@cycletowns.com">hello@cycletowns.com</a>.
        </p>
        <p>
          Sport2040 (ABN 73 680 648 855)<br />
          Level 15, 461 Bourke Street<br />
          Melbourne VIC 3000<br />
          Australia
        </p>
      </div>
    </ProsePage>
  );
}
