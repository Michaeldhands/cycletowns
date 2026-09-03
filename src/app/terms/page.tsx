import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <ProsePage kick="Legal" title="Terms of use" lead="The deal between you and Cycletowns.">
      <div className="wprose">
        <p><b>Last updated:</b> 3 September 2026</p>

        <p>
          By using cycletowns.com you agree to these terms. If you do not agree with them, please do not use the site.
          Cycletowns is operated by <b>Sport2040</b> (ABN 73 680 648 855), based in Australia. These terms are governed
          by the law of Victoria, Australia.
        </p>

        <h3>Your account</h3>
        <p>
          You need to be at least 16 to hold an account. Sign-in is by a one-time link sent to your email, or through
          Google — keep access to that email account secure, because anyone who can read it can sign in as you. One
          account per person. You can close your account whenever you like from your account page or by emailing us.
        </p>

        <h3>What you post</h3>
        <p>
          You keep ownership of your reviews, photos and posts. By posting them you give us permission to display them
          on Cycletowns and to use them to promote the site. Only post things you have the right to post — your own
          photos, your own words, your own honest opinion of a place you have actually been.
        </p>
        <p>Don&rsquo;t post:</p>
        <ul>
          <li>Reviews of places you have not visited, or reviews written in exchange for payment or free product.</li>
          <li>Reviews of a business you own, work for, or compete with.</li>
          <li>Anything false, abusive, harassing, or that identifies someone without their consent.</li>
          <li>Anything unlawful, or anything that infringes someone else&rsquo;s copyright.</li>
          <li>Automated or bulk content, or anything designed to game the rankings or points.</li>
        </ul>
        <p>
          We can remove content and close accounts that break these rules. We would rather explain than delete, so we
          will usually tell you why.
        </p>

        <h3>Rankings and points</h3>
        <p>
          Rankings are built from rider ratings alongside our own editorial scoring, and how that works is set out on
          our <a href="/how-rankings-work">How rankings work</a> page. Points and rewards have no cash value, cannot be
          transferred or sold, and we may adjust or remove points obtained by gaming the system. We may change how
          points are earned; we will not take away points you have already fairly earned without telling you.
        </p>

        <h3>Membership</h3>
        <p>
          Insider membership is A$7 per month or A$80 per year, billed through Stripe, and renews automatically until
          you cancel. You can cancel any time from your account page — you keep your benefits until the end of the
          period you have already paid for. We do not refund part-periods, but if something has genuinely gone wrong,
          email us and we will sort it out. If we change the price we will tell you before it applies to you. Nothing
          in these terms limits your rights under the Australian Consumer Law.
        </p>

        <h3>Partners and advertising</h3>
        <p>
          Businesses can claim and pay for a listing. Paid placement is always labelled as such, and paying does not
          buy a better ranking or a better rider rating.
        </p>

        <h3>Routes, plans and riding — read this one</h3>
        <p>
          Routes, loops, GPX files and trip plans on this site are provided for general information. They are generated
          from public map data and from rider contributions, and <b>nobody from Cycletowns has necessarily ridden
          them</b>. Road surfaces, traffic, gates, closures, weather and conditions change. You are responsible for
          assessing whether a route is safe and suitable for you before you ride it, for obeying local road rules, and
          for carrying whatever you need. Cycling carries risk of injury or death. To the extent the law allows, we
          accept no liability for loss or injury arising from your use of a route, plan or recommendation found here.
        </p>

        <h3>Accuracy</h3>
        <p>
          We try hard to keep town guides, opening hours, races and prices accurate, and we would much rather publish
          nothing than publish something invented. Even so, details go out of date. Check with the business or event
          organiser before relying on anything here. If you spot something wrong, tell us — that is how the site gets
          better.
        </p>

        <h3>Availability</h3>
        <p>
          We do not promise the site will always be available or error-free. We may change or withdraw features. If we
          discontinue a paid feature, we will refund the unused portion of your membership.
        </p>

        <h3>Our content</h3>
        <p>
          The Cycletowns name, logo, design, editorial writing and rankings are ours. Please don&rsquo;t copy the site
          wholesale, scrape it, or republish our guides as your own. Quoting us with a link is welcome.
        </p>

        <h3>Liability</h3>
        <p>
          To the extent permitted by law, our total liability to you for anything connected with the site is limited to
          the amount you have paid us in the previous twelve months. Some rights under the Australian Consumer Law
          cannot be excluded, and nothing here tries to exclude them.
        </p>

        <h3>Changes to these terms</h3>
        <p>
          We may update these terms. The date at the top shows when. For significant changes we will tell account
          holders by email, and continuing to use the site after that means you accept the new terms.
        </p>

        <h3>Contact</h3>
        <p>
          Questions, complaints, or something we have got wrong: <a href="mailto:hello@cycletowns.com">hello@cycletowns.com</a>.
        </p>
      </div>
    </ProsePage>
  );
}
