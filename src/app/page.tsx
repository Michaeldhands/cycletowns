import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { LpCarousel } from "@/components/Carousel";
import { TownCard } from "@/components/Cards";
import { Photo } from "@/components/Photo";
import { HeroSearch } from "@/components/HeroSearch";
import { ridePic } from "@/lib/images";
import { CAT_DEFS, rankedTowns } from "@/lib/towns";
import originals from "@/data/originals.json";
import { OriginalCard, type Original } from "@/components/NewsCards";

const CAT_IMG: Record<string, string> = { road: "road", climb: "climb", gravel: "gravel", mtb: "mtb", ebike: "ebike", alpine: "alpine", pro: "group" };

export default function Home() {
  const feat = rankedTowns().slice(0, 8);
  return (
    <>
      <SiteNav />

      {/* HERO */}
      <div className="hero">
        <Photo src={ridePic("road", "hero", 1600)} className="heroimg" />
        <div className="in" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-l">
            <h1>
              Find your
              <br />
              next great ride.
            </h1>
            <div className="lede">
              The world’s best <b>Cycletowns</b> — ranked by the riders who rode them.
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
      <div className="drcband">
        Discover <b>·</b> Ride <b>·</b> Connect
      </div>

      {/* CATEGORIES */}
      <div className="sec2">
        <div className="in">
          <div className="kick">How do you ride?</div>
          <div className="h2">What&apos;s your ride?</div>
          <div className="lead">Whatever you ride, there’s a town for it — explore by the kind of riding you love.</div>
          <LpCarousel>
            {CAT_DEFS.map((c) => (
              <Link key={c.id} href={`/rankings/${c.id}`} className="cat">
                <Photo src={ridePic(CAT_IMG[c.id] || "road", "cat-" + c.id, 440)} />
                <span className="cl">{c.label}</span>
              </Link>
            ))}
          </LpCarousel>
        </div>
      </div>

      {/* PARTNER SLOT */}
      <div className="sec2" style={{ paddingTop: 0 }}>
        <div className="in">
          <div className="adbanner hc">
            <div className="adimg">
              <Photo src={ridePic("road", "ad-1", 760)} />
              <span className="adlabel">Partner offer</span>
            </div>
            <div className="adbody">
              <div className="adbrand">Your brand here</div>
              <h3>Reach riders who actually go.</h3>
              <p>
                Bike brands, tourism boards, stays and events can put an offer in front of Cycletowns riders right here — on
                the front page and on the town guides that matter to them.
              </p>
              <div className="adcta btnpair">
                <Link href="/partners" className="lk-coral big">
                  🤝 Become a partner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO WAYS TO ROLL */}
      <div className="sec2" id="how">
        <div className="in">
          <div className="kick">Two ways to roll</div>
          <div className="h2">Get the most out of Cycletowns</div>
          <div className="lead">
            However you ride, there’s a lane for you — kick back and ride the wave of what other riders already know, or get
            stuck in and help build it. Either way, your next trip gets better.
          </div>
          <div className="lanes">
            <div className="lane wave">
              <div className="laneimg">
                <Photo src={ridePic("group", "lane-1", 520)} />
                <span className="lanetag">🌊 Just here to ride</span>
              </div>
              <div className="laneb">
                <h3>Ride the wave</h3>
                <p className="lanesub">
                  All the local intel, none of the homework. Tap into what other riders already know — no account, no effort.
                </p>
                <div className="lsteps">
                  <div className="ls">
                    <span className="lsi">🔎</span>
                    <div>
                      <b>Discover</b> every town, ranked by the riders who actually rode it — free to browse, no sign-up.
                    </div>
                  </div>
                  <div className="ls">
                    <span className="lsi">🗺️</span>
                    <div>
                      <b>Plan</b> your trip: your dates and style in, a ride-ready itinerary out.
                    </div>
                  </div>
                </div>
                <Link href="/towns" className="lk-coral big">
                  Start exploring ›
                </Link>
              </div>
            </div>
            <div className="lane build">
              <div className="laneimg">
                <Photo src={ridePic("group", "lane-2", 520)} />
                <span className="lanetag alt">🤝 Here to build it</span>
              </div>
              <div className="laneb">
                <h3>Get involved</h3>
                <p className="lanesub">
                  Help build the most honest rankings in cycling — and get rewarded as you go. This is the bit the corporates
                  can’t buy.
                </p>
                <div className="lsteps">
                  <div className="ls">
                    <span className="lsi">👥</span>
                    <div>
                      <b>Connect</b> — join groups and crews, and meet locals and visitors wherever you ride.
                    </div>
                  </div>
                  <div className="ls">
                    <span className="lsi">⭐</span>
                    <div>
                      <b>Contribute</b> — log rides, drop café and route intel, leave reviews. Every bit makes your town richer.
                    </div>
                  </div>
                </div>
                <Link href="/join" className="lk-coral big">
                  Join the bunch ›
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED TOWNS */}
      <div className="sec2 alt" id="towns">
        <div className="in">
          <div className="kick">Top ranked</div>
          <div className="h2">The world’s best Cycletowns</div>
          <div className="lead">
            Ranked by riders. Swipe through and dive into any town — its rides, café stops, bike shops, groups and things to do.
            No sign-up needed.
          </div>
          <LpCarousel>
            {feat.map((t) => (
              <TownCard key={t.id} t={t} />
            ))}
          </LpCarousel>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/rankings" className="lk-coral big">
              See the full leaderboard ›
            </Link>
          </div>
        </div>
      </div>

      {/* NEWS TEASER */}
      <div className="sec2 alt" id="news" style={{ paddingTop: 0 }}>
        <div className="in">
          <div className="kick">The hub · Originals · Socials · World</div>
          <div className="h2">Cycletowns News</div>
          <div className="lead">
            Original features from our correspondents — including the <b>Town in Focus</b> series — plus the best stories
            from around the world.
          </div>
          <LpCarousel>
            {(originals as Original[]).map((a, i) => (
              <OriginalCard key={i} a={a} idx={i} />
            ))}
          </LpCarousel>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <Link href="/news" className="lk-coral big">
              Open the News hub ›
            </Link>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP TEASER */}
      <div className="sec2">
        <div className="in">
          <div className="concierge">
            <div className="cgl">
              <div className="cgtag">Cycletowns Club · join free</div>
              <h2>Member rates, local guides &amp; rewards</h2>
              <p>
                Sign up free to save towns, rate the places you ride, join groups and unlock member offers from our partners.
                Earn status as you contribute and unlock even more.
              </p>
              <div className="cgfeat">
                <span>♥ Save towns &amp; trips</span>
                <span>⭐ Rate what you ride</span>
                <span>🤝 Join groups</span>
                <span>🎟️ Member offers</span>
              </div>
              <Link href="/membership" className="lk-coral big">
                See member rewards
              </Link>
            </div>
            <div className="cgr">
              <Photo src={ridePic("group", "club", 900)} />
            </div>
          </div>
        </div>
      </div>

      {/* PARTNERS */}
      <div className="sec2 alt" id="partners">
        <div className="in">
          <div className="kick">For partners</div>
          <div className="h2">Run a business riders love?</div>
          <div className="lead">
            Cafés, bike shops, stays, brands, tourism boards and travel partners — reach riders who actually go. Enquire and
            we’ll show you the rest.
          </div>
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <Link href="/partners" className="lk-coral big">
              🤝 Enquire to partner ›
            </Link>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="sec2 alt" style={{ paddingTop: 0 }}>
        <div className="in">
          <div className="finalcta">
            <h2>Get amongst it.</h2>
            <p>Find your town, find your people, and help build the most honest rankings in cycling. Free, obviously.</p>
            <Link href="/join" className="lk-coral big">
              Join the bunch
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
