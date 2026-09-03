import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { SectionCarousel } from "@/components/Carousel";
import { CafeCard, RideCard, ShopCard, ThingCard, TownCard } from "@/components/Cards";
import { TownMap } from "@/components/TownMap";
import { SaveButton } from "@/components/SaveButton";
import { ReviewForm } from "@/components/ReviewForm";
import { Avatar } from "@/components/Avatar";
import { currentUser } from "@/lib/supabase/server";
import { REVIEWS_TO_TAKE_OVER, effectiveScore, fetchTownReviews } from "@/lib/reviews";
import { fetchFeed, fetchTownGroups } from "@/lib/community";
import { loadCatalog, rankIn, rankTowns, type Catalog } from "@/lib/content";
import { PostCard, PostComposer } from "@/components/Community";
import { photoURL, ridePic, townHero, townImages } from "@/lib/images";
import {
  DIM_LABELS,
  LITE_TOWNS,
  TOWNS,
  catScore,
  regionOf,
  rideDiscipline,
  type Race,
  type ScoreDims,
  type Town,
  type WhenInfo,
} from "@/lib/towns";

export const dynamicParams = true;
export const dynamic = "force-dynamic";
export function generateStaticParams() {
  return [...TOWNS.map((t) => ({ slug: t.id })), ...LITE_TOWNS.map((t) => ({ slug: t.slug }))];
}

export async function generateMetadata({ params }: PageProps<"/towns/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadCatalog();
  const t = c.towns.find((x) => x.id === slug);
  if (t) {
    return {
      title: `${t.name} cycling guide — routes, cafés, bike shops`,
      description: t.blurb,
      openGraph: { images: [townHero(t, 1200)] },
    };
  }
  const l = c.lite.find((x) => x.slug === slug);
  return l ? { title: `${l.name} — Cycletown` } : {};
}

/* ---------- helpers ---------- */
const MON = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const RMON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function whenFor(c: Catalog, t: Town): WhenInfo & { getting?: string; terrain?: string; tip?: string; currency?: string } {
  const w = c.when[t.id] as WhenInfo & { getting?: string; terrain?: string; tip?: string; currency?: string };
  if (w) return w;
  const geo = c.geo[t.id];
  const south = (geo && geo.lat < 0) || regionOf(t.country) === "oceania" || t.country === "South Africa";
  return {
    ride: south ? [2, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 2] : [0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 0, 0],
    crowd: south ? [2, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2] : [0, 0, 1, 1, 1, 2, 2, 2, 1, 1, 0, 0],
    best: south ? "Oct–Apr — the warmer, drier half of the year." : "May–Sep — long days and settled weather.",
    peak: south ? "Summer school holidays (Dec–Jan)." : "Peak summer (Jul–Aug).",
    quiet: "The shoulder weeks either side of peak — milder roads and better value.",
    climate: "Best riding comes in the warmer, drier months; check local conditions before you go.",
    terrain: "A mix of road, gravel and trail riding — see Top rides above.",
    tip: "Ride early to beat heat and traffic in the busy season.",
  };
}

function raceWhen(r: Race): { text: string; upcoming: boolean } {
  if (!r.date) {
    return {
      text: r.status === "historic" ? "Historic route" : r.status === "epic" ? "Bucket-list epic" : "Annual event · dates via organiser",
      upcoming: false,
    };
  }
  const d = new Date(r.date + "T00:00:00");
  const ds = `${d.getDate()} ${RMON[d.getMonth()]} ${d.getFullYear()}`;
  const days = Math.round((d.getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `Most recent: ${ds}`, upcoming: false };
  if (days === 0) return { text: `Today · ${ds}`, upcoming: true };
  return { text: `In ${days} days · ${ds}`, upcoming: true };
}
function raceLevel(km: number, vert: number) {
  const d = vert + km * 5;
  if (d < 400) return { level: "Easy", ability: "Chill", color: "#177245" };
  if (d < 1000) return { level: "Moderate", ability: "Regular", color: "#0a6a86" };
  if (d < 2200) return { level: "Hard", ability: "Strong", color: "#E2872A" };
  return { level: "Epic", ability: "Racer", color: "#FD3D35" };
}
const KIND_LABEL: Record<string, string> = { pro: "Pro stage", mtb: "MTB race", fondo: "Gran fondo" };

function DimBar({ label, v }: { label: string; v: number }) {
  return (
    <div className="dimrow">
      <span className="dl">{label}</span>
      <span className="dt">
        <i style={{ width: `${(v / 5) * 100}%` }} />
      </span>
      <span className="dv">{v.toFixed(1)}</span>
    </div>
  );
}

/* ---------- page ---------- */
export default async function TownPage({ params }: PageProps<"/towns/[slug]">) {
  const { slug } = await params;
  const [c, me] = await Promise.all([loadCatalog(), currentUser()]);
  const t = c.towns.find((x) => x.id === slug);
  if (!t) return <LiteTownPage c={c} slug={slug} userId={me?.id ?? null} />;

  const [{ reviews, score }, groups, posts] = await Promise.all([fetchTownReviews(t.id), fetchTownGroups(t.id), fetchFeed({ townId: t.id, limit: 6 })]);
  const eff = effectiveScore(t, score);
  const mine = me ? reviews.find((r) => r.user_id === me.id) : undefined;
  const imgs = townImages(t);
  const rk = rankIn(c, t.id);
  const geo = c.geo[t.id];
  const w = whenFor(c, t);
  const races = c.races[t.id] || [];
  const seedo = c.seeDo[t.id] || [];
  const dims = Object.keys(DIM_LABELS) as (keyof ScoreDims)[];
  const related = rankTowns(c).filter((x) => x.id !== t.id && regionOf(x.country) === regionOf(t.country)).slice(0, 4);
  const cat = t.tags[0]?.toLowerCase() || "road";
  const more = related.length >= 2 ? related : c.towns.slice().sort((a, b) => catScore(b, cat) - catScore(a, cat)).filter((x) => x.id !== t.id).slice(0, 4);

  return (
    <>
      <TopBar back={{ href: "/rankings", label: "Rankings" }} />

      <div className="whero">
        <Photo src={imgs.length ? photoURL(imgs[0], 1400) : townHero(t, 1400)} alt={t.name} />
        <div className="wov">
          <div className="winner">
            <div className="bc">
              <Link href="/">Cycletowns</Link> › {t.region} › <b>{t.name}</b>
            </div>
            <div className="awards">
              <span className="award alt">#{rk} ranked Cycletown</span>
              {t.tags.slice(0, 3).map((x) => (
                <span className="award" key={x}>
                  {x}
                </span>
              ))}
            </div>
            <h1>{t.name}</h1>
            <div className="meta">
              <span className="rk">#{rk} ranked</span>
              <span className="sc">★ {eff.score.toFixed(1)} Cyclist Score{eff.count ? ` · ${eff.count} review${eff.count === 1 ? "" : "s"}` : ""}</span>
              <span className="sc">
                {t.flag} {t.region} · {t.country}
              </span>
              <span className="sc">{t.routes.length} routes · {t.cafes.length} cafés · {t.shops.length} shops</span>
            </div>
            <div className="wbar">
              <Link href={`/plan?town=${t.id}`} className="lk-coral big">
                ✨ Plan my trip here
              </Link>
              <Link href={`/loop?town=${t.id}`} className="lk-ghost big">
                🔁 Build a loop
              </Link>
              <SaveButton id={t.id} light userId={me?.id ?? null} />
            </div>
          </div>
        </div>
      </div>

      <div className="wsec">
        <p style={{ fontSize: 16, color: "var(--grey-d)", maxWidth: 800, lineHeight: 1.55 }}>{t.blurb}</p>
        {imgs.length > 1 && (
          <div className="gallery" style={{ marginTop: 14 }}>
            {imgs.map((f) => (
              <div className="gth" key={f}>
                <Photo src={photoURL(f, 360)} alt={t.name} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="wsec">
        <div className="twocol">
          <div>
            {geo && <TownMap name={t.name} geo={geo} />}
            <div className="maplegend">
              <span>
                <i style={{ background: "#FD3D35" }} /> Ride start
              </span>
              <span style={{ fontWeight: 600 }}>Café, shop and route pins are coming as we map each town.</span>
            </div>
          </div>
          <div className="wscorebox" style={{ maxWidth: "none" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800 }}>Cyclist Score breakdown</h3>
            <div className="csub" style={{ color: "var(--grey-m)", fontSize: 12, margin: "2px 0 8px" }}>
              {eff.source === "riders"
                ? `From ${eff.count} verified rider reviews`
                : `Editorial launch score · rider reviews take over at ${REVIEWS_TO_TAKE_OVER}${eff.count ? ` (${eff.count} so far)` : ""}`}
            </div>
            {dims.map((k) => (
              <DimBar key={k} label={DIM_LABELS[k][1]} v={eff.dims[k]} />
            ))}
            <div style={{ marginTop: 12 }}>
              <a href="#review" className="lk-coral" style={{ fontSize: 13 }}>
                ⭐ {mine ? "Update your review" : `Review ${t.name}`}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PLAN YOUR VISIT */}
      <div className="wsec">
        <div className="wh">
          <div>
            <h2>Plan your visit</h2>
            <span className="wsub">when to ride, when it’s busy, and what to know</span>
          </div>
        </div>
        <div className="whenwrap">
          <div className="whenbox">
            <h3>When to go</h3>
            <div className="monrow">
              {w.ride.map((rq, i) => (
                <div className={"moncell" + (w.crowd[i] >= 2 ? " peak" : "")} key={i}>
                  <div className="dot" />
                  <div className="bar" style={{ background: rq >= 2 ? "#01536C" : rq === 1 ? "#86b6c6" : "#e1e6e8" }} />
                  <div className="m">{MON[i]}</div>
                </div>
              ))}
            </div>
            <div className="monleg">
              <span>
                <i style={{ background: "#01536C" }} /> Prime riding
              </span>
              <span>
                <i style={{ background: "#86b6c6" }} /> Still good
              </span>
              <span>
                <i style={{ background: "#e1e6e8" }} /> Off-season
              </span>
              <span>
                <i style={{ background: "#FD3D35", borderRadius: "50%" }} /> Peak crowds
              </span>
            </div>
            <div className="whenlines">
              <div className="wl">
                🚴
                <div>
                  <b>Best riding:</b> {w.best}
                </div>
              </div>
              <div className="wl">
                👥
                <div>
                  <b>Peak crowds:</b> {w.peak}
                </div>
              </div>
              <div className="wl">
                💸
                <div>
                  <b>Best value:</b> {w.quiet}
                </div>
              </div>
            </div>
          </div>
          <div className="gtkbox">
            <h3>Good to know</h3>
            <div className="gtkgrid">
              {w.getting && (
                <div className="f">
                  <span className="fi">📍</span>
                  <div>
                    <b>Getting there.</b> {w.getting}
                  </div>
                </div>
              )}
              {w.terrain && (
                <div className="f">
                  <span className="fi">⛰️</span>
                  <div>
                    <b>Terrain.</b> {w.terrain}
                  </div>
                </div>
              )}
              {w.climate && (
                <div className="f">
                  <span className="fi">🌤️</span>
                  <div>
                    <b>Climate.</b> {w.climate}
                  </div>
                </div>
              )}
              {w.currency && (
                <div className="f">
                  <span className="fi">💶</span>
                  <div>
                    <b>Currency &amp; language.</b> {w.currency}
                  </div>
                </div>
              )}
              {w.tip && (
                <div className="f">
                  <span className="fi">💡</span>
                  <div>
                    <b>Local tip.</b> {w.tip}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIDES */}
      <SectionCarousel
        title={`Top rides in ${t.name}`}
        sub={`${t.routes.length} routes & climbs`}
        filters={[
          { id: "road", label: "Road" },
          { id: "gravel", label: "Gravel" },
          { id: "mtb", label: "MTB" },
          { id: "climbs", label: "Climbs" },
        ]}
        items={t.routes.map((p) => ({ key: p.n, filter: rideDiscipline(p), node: <RideCard t={t} p={p} /> }))}
      />

      {/* RACES */}
      {races.length > 0 && (
        <div className="wsec">
          <div className="wh">
            <h2>🏁 Ride the races</h2>
            <span className="wsub">Pro stages &amp; gran fondos here — ride the route yourself</span>
          </div>
          <div className="racegrid">
            {races.map((r, i) => {
              const rw = raceWhen(r);
              const lv = raceLevel(r.km, r.vert);
              return (
                <div className="racecard" key={i}>
                  <div className="rctop">
                    <span className={`rcbadge ${r.kind}`}>
                      {r.badge} {KIND_LABEL[r.kind] || r.kind}
                    </span>
                    {rw.upcoming && <span className="rcup">Upcoming</span>}
                  </div>
                  <div className="rcname">{r.name}</div>
                  {r.series && <div className="rcseries">{r.series}</div>}
                  <div className="rcstats">
                    <span>📏 {r.km} km</span>
                    <span>⛰️ {r.vert.toLocaleString()} m</span>
                    <span className="rclvl" style={{ color: lv.color }}>
                      ● {lv.level} · {lv.ability}
                    </span>
                  </div>
                  <div className={"rcwhen" + (rw.upcoming ? " up" : "")}>
                    {rw.upcoming ? "⏳ " : ""}
                    {rw.text}
                  </div>
                  {r.note && <div className="rcnote">{r.note}</div>}
                </div>
              );
            })}
          </div>
          <div className="wsub" style={{ marginTop: 10, fontSize: 12.5, display: "block" }}>
            Dates &amp; distances are indicative — always confirm on the organiser’s site.
          </div>
        </div>
      )}

      {/* GROUPS */}
      <div className="wsec">
        <div className="wh">
          <div>
            <h2>Groups in {t.name}</h2>
            <span className="wsub">{groups.length ? `${groups.length} club${groups.length === 1 ? "" : "s"} & crews to join` : "clubs & crews to join"}</span>
          </div>
          <Link href={`/groups/new?town=${t.id}`} className="lk-ghost" style={{ padding: "7px 13px", fontSize: 12.5 }}>+ Start a group</Link>
        </div>
        {groups.length === 0 ? (
          <div className="unlocknote" style={{ fontSize: 14, padding: 14 }}>
            No groups here yet. Ride here regularly? <Link href={`/groups/new?town=${t.id}`}>Start the first one</Link> and riders visiting {t.name} will find you.
          </div>
        ) : (
          <div className="wgrid">
            {groups.slice(0, 8).map((g) => (
              <Link href={`/groups/${g.id}`} className="wcard" key={g.id} style={{ textDecoration: "none" }}>
                <div className="wph" style={{ height: 110 }}>
                  <Photo src={ridePic("group", "grp-" + g.id, 520)} />
                  <span className="wpill">{g.privacy === "public" ? "Public" : "🔒 Private"}</span>
                </div>
                <div className="wcb">
                  <div className="wcn">{g.name}</div>
                  <div className="wcd">{g.description || [g.discipline, g.ride_day, g.ride_time].filter(Boolean).join(" · ")}</div>
                  <span className="wlink">{g.member_count} member{g.member_count === 1 ? "" : "s"} · View ›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* TOWN FEED */}
      <div className="wsec">
        <div className="wh">
          <div>
            <h2>From the saddle in {t.name}</h2>
            <span className="wsub">ride reports & intel from riders here</span>
          </div>
          <Link href="/feed" className="lk-ghost" style={{ padding: "7px 13px", fontSize: 12.5 }}>Whole feed ›</Link>
        </div>
        <div className="twocol">
          <div>
            {posts.length === 0 && <p className="wsub" style={{ display: "block", marginBottom: 10 }}>Nothing posted yet — be the first to report a ride in {t.name}.</p>}
            {posts.map((p) => <PostCard key={p.id} p={p} />)}
          </div>
          <PostComposer userId={me?.id ?? null} townId={t.id} />
        </div>
      </div>

      {/* CAFÉS / SHOPS / THINGS */}
      <SectionCarousel
        title="Best café stops"
        sub={`${t.cafes.length} rider-rated cafés`}
        items={t.cafes.map((p) => ({ key: p.n, node: <CafeCard t={t} p={p} /> }))}
      />
      <SectionCarousel
        title="Bike shops & hire"
        sub={`${t.shops.length} shops & hire`}
        items={t.shops.map((p) => ({ key: p.n, node: <ShopCard t={t} p={p} /> }))}
      />
      {seedo.length > 0 && (
        <SectionCarousel
          title={`Things to do in ${t.name}`}
          sub="beyond the bike"
          items={seedo.map((s) => ({ key: s[1], node: <ThingCard t={t} s={s} /> }))}
        />
      )}

      {/* REVIEWS */}
      <div className="wsec" id="review">
        <div className="wh">
          <div>
            <h2>Rider reviews</h2>
            <span className="wsub">{reviews.length ? `${eff.count} honest reviews from riders who’ve ridden here` : "honest, from riders who’ve actually ridden here"}</span>
          </div>
        </div>
        <div className="twocol">
          <div>
            {reviews.length === 0 && (
              <div className="unlocknote" style={{ fontSize: 14, padding: 16, marginBottom: 14 }}>
                No reviews yet — be the first to rate {t.name}. The first {REVIEWS_TO_TAKE_OVER} reviews switch the score from editorial to rider-built.
              </div>
            )}
            <div className="wgrid g2">
              {reviews.map((r) => {
                const avg = (r.cafes + r.routes + r.safety + r.climbs + r.storage) / 5;
                return (
                  <div className="rvcard" key={r.id}>
                    <div className="rvtop">
                      <Avatar name={r.profiles?.display_name || "Rider"} url={r.profiles?.avatar_url} size={38} />
                      <div>
                        <div className="rvname">{r.profiles?.display_name || "Rider"}{r.profiles?.tier === "champion" ? " 👑" : ""}</div>
                        <div className="rvmeta">{[r.ride_type, r.profiles?.home_town].filter(Boolean).join(" · ")} · {new Date(r.created_at).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}</div>
                      </div>
                      <span className="rvsc">★ {avg.toFixed(1)}</span>
                    </div>
                    {r.body && <p className="rvbody">{r.body}</p>}
                  </div>
                );
              })}
            </div>
          </div>
          <ReviewForm townId={t.id} townName={t.name} userId={me?.id ?? null} existing={mine} />
        </div>
      </div>

      {/* MORE TOWNS */}
      {more.length > 0 && (
        <div className="wsec" style={{ paddingBottom: 40 }}>
          <div className="wh">
            <div>
              <h2>More Cycletowns nearby</h2>
              <span className="wsub">keep exploring</span>
            </div>
          </div>
          <div className="wgrid">
            {more.map((x) => (
              <TownCard key={x.id} t={x} rank={rankIn(c, x.id)} />
            ))}
          </div>
          <div className="photocredit" style={{ margin: "26px 0 0" }}>
            {t.photo ? "Town photos via Wikimedia Commons (CC). " : ""}Rider and venue imagery is licensed stock; venue cards link to Google Maps.
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

/* ---------- towns without a full guide yet ---------- */
function LiteTownPage({ c, slug, userId }: { c: Catalog; slug: string; userId: string | null }) {
  const l = c.lite.find((x) => x.slug === slug);
  if (!l) notFound();
  const nearby = rankTowns(c).filter((x) => regionOf(x.country) === regionOf(l.country)).slice(0, 4);
  return (
    <>
      <TopBar back={{ href: "/rankings", label: "Rankings" }} />
      <div className="whero" style={{ height: 320 }}>
        <Photo src={ridePic(null, "lite-" + slug, 1400)} />
        <div className="wov">
          <div className="winner">
            <div className="bc">
              <Link href="/">Cycletowns</Link> › {l.region} › <b>{l.name}</b>
            </div>
            <h1>{l.name}</h1>
            <div className="meta">
              <span className="sc">
                {l.flag} {l.region} · {l.country}
              </span>
              <span className="sc">Guide in progress</span>
            </div>
          </div>
        </div>
      </div>
      <div className="wsec">
        <div className="concierge">
          <div className="cgl">
            <div className="cgtag">On our radar</div>
            <h2>{l.name} is on the Cycletowns list — the full guide is coming.</h2>
            <p>
              We’re building out routes, café stops, bike shops and rider reviews for {l.name}. Know it well? Join free and be
              the first to add the local intel that makes a Cycletown.
            </p>
            <div className="wbar">
              <Link href={`/join?town=${slug}`} className="lk-coral big">
                Help build {l.name}
              </Link>
              <SaveButton id={slug} light userId={userId} />
            </div>
          </div>
          <div className="cgr">
            <Photo src={ridePic("group", "lite2-" + slug, 900)} />
          </div>
        </div>
      </div>
      {nearby.length > 0 && (
        <div className="wsec" style={{ paddingBottom: 40 }}>
          <div className="wh">
            <div>
              <h2>Full guides in the region</h2>
            </div>
          </div>
          <div className="wgrid">
            {nearby.map((x) => (
              <TownCard key={x.id} t={x} rank={rankIn(c, x.id)} />
            ))}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
