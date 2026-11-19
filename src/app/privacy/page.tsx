import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Privacy policy" };

/* Written to describe what the site actually does. If you change what is collected,
   or add a third-party service, change this page in the same commit. */
export default function Page() {
  return (
    <ProsePage kick="Legal" title="Privacy policy" lead="What we collect, why we collect it, and how to get rid of it.">
      <div className="wprose">
        <p><b>Last updated:</b> 19 November 2026</p>

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
          <li><b>Points</b> recorded before we retired rewards in November 2026, if you earned any. They no longer do anything.</li>
        </ul>

        <h3>What is public and what is not</h3>
        <p>
          Your reviews, posts, and your display name and profile picture are visible to anyone using the site — that is
          the point of riders having their say. Saved loops are shareable by link. <b>Your email address is never shown
          publicly</b> and is not visible to other riders. Towns you save and trip plans you have not shared are
          private to your account.
        </p>

        <h3>Payments</h3>
        <p>
          Membership is billed through Stripe. <b>We never see or store your card details</b> — those go
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
        <p>
          <b>The newsletter.</b> You can subscribe without an account. We keep your email address, the page you signed
          up from, the exact wording you agreed to, and when you confirmed — so we can show you asked to hear from us. We
          only send it once you click the confirmation link we email you. Unsubscribe with one click from any issue; we
          then stop sending and keep only the record that you unsubscribed, so you are never added back by mistake.
        </p>

        <h3>Ride verification with Strava</h3>
        <p>
          If you choose to connect Strava, we look for one of your own rides starting near a town you have reviewed,
          around the date you gave. We read only each ride&rsquo;s start point and date — never your routes, times or
          ride names. We keep whether the check passed and the id of the ride that passed it, plus the access tokens
          Strava gives us to make the check. Disconnect at any time from your account page and we revoke our access and
          delete all of it.
        </p>

        <h3>Partner enquiries</h3>
        <p>
          If you enquire about partnering with us or claim a business listing, we keep the details you give us — your
          name, business, email, the type of business and town, and your message — to reply and manage the
          relationship, including in our customer-relationship system.
        </p>

        <h3>Ask Cycletowns</h3>
        <p>
          Ask Cycletowns is a ride concierge built on an AI model from Anthropic. When you ask it something, your
          question and the conversation so far are sent to Anthropic to generate the answer, together with what we
          know about how you ride if you are signed in. Anthropic processes this to provide the service and, under its
          commercial terms, does not use it to train its models. We do not store the conversations themselves.
        </p>
        <p>
          If you are signed in and tell it something lasting about your riding — your discipline, pace, home base — it
          may save that as a short note so later answers start from it. You can see and delete every note at{" "}
          <a href="/account/memory">What Ask remembers</a>. We don&rsquo;t save health or other sensitive details. We
          also count how many questions each person asks per day, to keep the service affordable, and record anonymous
          topics (which town, discipline or month was asked about) with no link to you, to understand demand.
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
          <li><b>Resend</b> — delivery of sign-in, account and newsletter emails.</li>
          <li><b>Strava</b> — only if you connect it, to verify a ride for a review.</li>
          <li><b>Attio</b> — our customer-relationship system, for partner and business enquiries.</li>
          <li>
            <b>Sentry</b> — error monitoring. When something breaks it receives technical details of the error. It is set
            not to receive your email address or IP address, and it never records your screen.
          </li>
          <li><b>Anthropic</b> — the AI model behind Ask Cycletowns, which receives your questions to answer them.</li>
          <li><b>OpenStreetMap Nominatim</b> — finding a start point when you ask Ask Cycletowns for a loop from a named place.</li>
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
          trip plans and loops. Reviews and posts may remain, with your name removed, because they are part of
          what riders say about a town — tell us if you want yours taken down entirely and we will remove them. Payment
          records are kept for as long as Australian tax and record-keeping law requires. Partner enquiries are kept
          while we are in touch, and deleted on request.
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
