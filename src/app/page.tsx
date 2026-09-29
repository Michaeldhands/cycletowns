import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { bannerAlt, bannerSrc } from "@/lib/banners";
import { loadBanners } from "@/lib/banners-data";
import { LpCarousel } from "@/components/Carousel";
import { TownCard } from "@/components/Cards";
import { Photo } from "@/components/Photo";
import { HeroSearch } from "@/components/HeroSearch";
import { CAT_DEFS } from "@/lib/towns";
import { loadArticles, loadCatalog, rankTowns } from "@/lib/content";
import { fetchAllScores } from "@/lib/reviews";
import { OriginalCard } from "@/components/NewsCards";
import { REVIEWS_TO_TAKE_OVER as RIDER_THRESHOLD } from "@/lib/reviews-types";

export const revalidate = 300;

/* The home page, in the order a first-time visitor needs it:
   what this is → pick your riding → the towns → what we've written → the tool nobody else has →
   why the rankings can be trusted → one invitation to join.

   Deliberately absent: an empty "your brand here" slot, a second newsletter form (the footer has
   one on every page), and three separate sign-up pitches saying the same thing. */

export default async function Home() {
  const [c, articles, banners, scores] = await Promise.all([loadCatalog(), loadArticles(), loadBanners(), fetchAllScores()]);
  const ranked = rankTowns(c, scores);
  const feat = ranked.slice(0, 8);
  const loopTown = c.towns.find((t) => t.id === "bright") || ranked[0];
  const anyRiderRanked = ranked.some((t) => (scores?.[t.id]?.review_count ?? 0) >= RIDER_THRESHOLD);

  return (
    <>
      <SiteNav />

      {/* HERO */}
      <div className="hero">
        <Photo src={bannerSrc(banners, "home-hero", 1600)} alt={bannerAlt(banners, "home-hero")} className="heroimg" />
        <div className="in" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-l">
            <h1>
              Find your
              <br />
              next great ride.
            </h1>
            <div className="lede">
              The world’s best <b>Cycletowns</b> — researched by us, then ranked by the riders who’ve been there.
            </div>
            <HeroSearch />
            <div className="btns">
              <Link href="/towns" className="lk-coral big">
                Explore towns
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIDE TYPES */}
      <div className="sec2">
        <div className="in">
          <div className="h2">What&apos;s your ride?</div>
          <div className="lead">Whatever you ride, there’s a town for it — explore by the kind of riding you love.</div>
          <LpCarousel>
            {CAT_DEFS.map((cat) => (
              <Link key={cat.id} href={`/rankings/${cat.id}`} className="cat">
                <Photo src={bannerSrc(banners, `cat-${cat.id}`, 440)} alt={bannerAlt(banners, `cat-${cat.id}`)} />
                <span className="cl">{cat.label}</span>
              </Link>
            ))}
          </LpCarousel>
        </div>
      </div>

      {/* TOP RANKED */}
      <div className="sec2 alt" id="towns">
        <div className="in">
          <div className="kick">The leaderboard</div>
          <div className="h2">The world’s best Cycletowns</div>
          <div className="lead">
            {anyRiderRanked
              ? "Ranked by riders where enough have reviewed a town, and on our own research where they haven’t yet."
              : `Ranked on our own research for now — once a town has ${RIDER_THRESHOLD} rider reviews, their score takes over.`}{" "}
            <span className="nowrap">✎ marks an editorial score.</span> No paid placements, ever.
          </div>
          <LpCarousel>
            {feat.map((t, i) => (
              <TownCard key={t.id} t={t} rank={i + 1} />
            ))}
          </LpCarousel>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/rankings" className="lk-coral big">
              See the full leaderboard ›
            </Link>
          </div>
        </div>
      </div>

      {/* NEWS */}
      <div className="sec2 alt" id="news" style={{ paddingTop: 0 }}>
        <div className="in">
          <div className="kick">Written by the Cycletowns team</div>
          <div className="h2">Cycletowns News</div>
          <div className="lead">Town guides, route guides and features.</div>
          <LpCarousel>
            {articles.slice(0, 8).map((a, i) => (
              <OriginalCard key={i} a={a} idx={i} />
            ))}
          </LpCarousel>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <Link href="/news" className="lk-coral big">
              Read the News ›
            </Link>
          </div>
        </div>
      </div>

      {/* LOOP BUILDER — the tool nobody else has, so it gets its own section */}
      <div className="sec2" id="loop">
        <div className="in">
          <div className="hometool">
            <div className="htl">
              <div className="kick" style={{ textAlign: "left" }}>Route planner</div>
              <h2>Build your own loop.</h2>
              <p>
                Pick a town, drop a pin where you’re staying and choose how far you feel like going. We find a loop on real
                roads and paths, show you the climbing, and hand you a GPX for your head unit.
              </p>
              <ul className="htlist">
                <li>
                  <b>Real roads.</b> Routed on OpenStreetMap for road, gravel, MTB or e-bike.
                </li>
                <li>
                  <b>Your pace.</b> Distance, climbing and a time estimate at the speed you actually ride.
                </li>
                <li>
                  <b>Straight to your device.</b> Download the GPX, or join free to save it.
                </li>
              </ul>
              <div className="btnpair">
                <Link href={`/loop?town=${loopTown.id}`} className="lk-coral big">
                  Build a loop in {loopTown.name} ›
                </Link>
                <Link href="/plan" className="lk-ghost big">
                  Plan a whole trip
                </Link>
              </div>
            </div>
            <div className="htr" aria-hidden="true">
              <div className="htstat">
                <span>Distance</span>
                <b>you choose</b>
              </div>
              <div className="htstat">
                <span>Climbing</span>
                <b>shown</b>
              </div>
              <div className="htstat">
                <span>Your time</span>
                <b>at your pace</b>
              </div>
              <div className="htstat">
                <span>GPX</span>
                <b>one tap</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY TRUST IT */}
      <div className="sec2 alt" id="trust">
        <div className="in">
          <div className="kick">Why trust the rankings</div>
          <div className="h2">Nothing here is for sale.</div>
          <div className="trustgrid">
            <div>
              <b>No paid placements, ever.</b>
              <p>A town’s rank comes from its score. Partners can’t buy a position on the leaderboard.</p>
            </div>
            <div>
              <b>Every score is labelled.</b>
              <p>
                ✎ is our research. ★ is riders. You always see which one a town is ranked on — and riders take over at{" "}
                {RIDER_THRESHOLD} reviews.
              </p>
            </div>
            <div>
              <b>Verified rides count double.</b>
              <p>Connect Strava and we check you actually rode there — rolling out as Strava approves us. Recent reviews count for more than old ones.</p>
            </div>
            <div>
              <b>Checked, not scraped.</b>
              <p>Events are checked against the organiser’s own site. Photos are what they say they are, and credited.</p>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <Link href="/how-rankings-work" className="lk-ghost big">
              How rankings work
            </Link>
          </div>
        </div>
      </div>

      {/* ONE INVITATION */}
      <div className="sec2 alt" style={{ paddingTop: 0 }}>
        <div className="in">
          <div className="finalcta">
            <h2>Rode somewhere good?</h2>
            <p>
              Join free to save towns and trips, and review the places you’ve ridden. Your reviews are how a town’s score
              stops being ours and starts being riders’.
            </p>
            <div className="fcbtns">
              <Link href="/join" className="lk-coral big">
                Join free
              </Link>
              <Link href="/membership" className="lk-ghost big fcghost">
                Membership &amp; rewards
              </Link>
            </div>
            <p className="finalsub">
              Run a café, shop, stay or tour riders visit? <Link href="/partners">Partner with us ›</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
