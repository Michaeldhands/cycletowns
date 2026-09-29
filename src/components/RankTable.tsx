"use client";
import Link from "next/link";
import { useState } from "react";
import { DIM_LABELS, SCOPES, knownFor, plural, regionOf, type LiteTown, type Region, type ScoreDims, type Town, placeLine } from "@/lib/towns";
import { REVIEWS_TO_TAKE_OVER, rankValue, type TownScore } from "@/lib/reviews-types";

const DIMS = Object.keys(DIM_LABELS) as (keyof ScoreDims)[];

/** Leaderboard with a region filter. Full-guide towns are ranked; radar towns are listed unscored. */
export function RankTable({ full: allFull, lite: allLite, scores = {}, initialScope = "all" }: { full: Town[]; lite: LiteTown[]; scores?: Record<string, TownScore>; initialScope?: "all" | Region }) {
  const [scope, setScope] = useState<"all" | Region>(initialScope);
  const [open, setOpen] = useState<string | null>(null);

  /** Which score a town is ranked on, and what it's built from. */
  const eff = (t: Town) => {
    const s = scores[t.id];
    const count = s?.review_count || 0;
    if (s && count >= REVIEWS_TO_TAKE_OVER) {
      return { score: Number(s.score), dims: { cafes: +s.cafes, routes: +s.routes, safety: +s.safety, climbs: +s.climbs, storage: +s.storage } as ScoreDims, riders: true, count, verified: s.verified_count || 0 };
    }
    return { score: t.score, dims: t.scoreDims, riders: false, count, verified: 0 };
  };

  const full = allFull.filter((t) => scope === "all" || regionOf(t.country) === scope).sort((a, b) => rankValue(b.score, scores[b.id]) - rankValue(a.score, scores[a.id]));
  const lite = allLite.filter((t) => scope === "all" || regionOf(t.country) === scope);

  return (
    <>
      <div className="scopebar" id="rankScopeBar">
        <span className="scopelab">📍 Show me:</span>
        {SCOPES.map((s) => (
          <button key={s.id} className={"scopechip" + (s.id === scope ? " on" : "")} onClick={() => setScope(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="rankkey">
        <span>
          <b>✎ Editorial</b> — our own score, from published route, café and safety research.
        </span>
        <span>
          <b>★ Riders</b> — built from riders’ published reviews, weighted towards recent and ride-verified ones. It
          replaces the editorial score at {REVIEWS_TO_TAKE_OVER} reviews, and that is the score a town is ranked on.
        </span>
      </div>
      <div className="ranktbl v2" id="rankTbl">
        <div className="rankhead">
          <span className="rnum">#</span>
          <span className="rfl"></span>
          <span className="rnm">Cycletown</span>
          <span className="rstrength">Known for</span>
          <span className="rsc">Score</span>
          <span className="rmv">Rider reviews</span>
          <span className="rgo"></span>
        </div>
        {full.map((t, i) => {
          const e = eff(t);
          const isOpen = open === t.id;
          return (
            <div key={t.id}>
              <div className="rankrow lb">
                <span className="rnum">{i + 1}</span>
                <span className="rfl">{t.flag}</span>
                <Link href={`/towns/${t.id}`} className="rnm" style={{ textDecoration: "none", color: "inherit" }}>
                  {t.name}
                  <small>{placeLine(t.region, t.country)}</small>
                </Link>
                <span className="rstrength">{knownFor(t)}</span>
                <span className="rsc" title={e.riders ? "Rider score" : "Our editorial score — riders take over at " + REVIEWS_TO_TAKE_OVER + " reviews"}>
                  {e.riders ? "★" : "✎"} {e.score.toFixed(1)}
                  <small className="rsrc">{e.riders ? "riders" : "editorial"}</small>
                </span>
                <span className="rmv flat">
                  {e.riders ? plural(e.count, "review") : `${e.count} of ${REVIEWS_TO_TAKE_OVER}`}
                  <small>{e.riders ? (e.verified ? `${e.verified} ride-verified` : "published") : "to take over"}</small>
                </span>
                <button className="rgo rwhy" onClick={() => setOpen(isOpen ? null : t.id)} aria-expanded={isOpen}>
                  {isOpen ? "Hide ▲" : "Why? ▾"}
                </button>
              </div>
              {isOpen && (
                <div className="rankwhy">
                  <div className="rankwhyh">
                    {e.riders
                      ? `Ranked on the rider score — ${plural(e.count, "published review")}${e.verified ? `, ${e.verified} ride-verified` : ""}. Recent rides and verified ones count for more, and a town with more reviews is ordered ahead of a thinly-reviewed one on the same average. Our editorial score was ${t.score.toFixed(1)}.`
                      : `Ranked on our editorial score. No rider score yet — reviews take over at ${REVIEWS_TO_TAKE_OVER}, and there ${e.count === 1 ? "is 1" : `are ${e.count}`} so far.`}
                  </div>
                  <div className="rankwhyg">
                    {DIMS.map((k) => (
                      <div className="rwd" key={k}>
                        <span className="rwdl">
                          {DIM_LABELS[k][0]} {DIM_LABELS[k][1]}
                        </span>
                        <span className="rwdbar">
                          <i style={{ width: `${(e.dims[k] / 5) * 100}%` }} />
                        </span>
                        <span className="rwdv">{e.dims[k].toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/towns/${t.id}#review`} className="rankwhyl">
                    Ridden {t.name}? Add your score ›
                  </Link>
                </div>
              )}
            </div>
          );
        })}
        {full.length === 0 && <div className="rankrow" style={{ color: "var(--grey-m)" }}>No full guides in this region yet.</div>}
      </div>

      {lite.length > 0 && (
        <div className="radarlist">
          <h3>On our radar · {lite.length}</h3>
          <p>Guides in progress. Unscored until we’ve researched them — tap one for a preview.</p>
          <div className="radarchips">
            {lite.map((t) => (
              <Link href={`/towns/${t.slug}`} key={t.slug} className="radarchip">
                <span>{t.flag}</span> {t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
