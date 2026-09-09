"use client";
import Link from "next/link";
import { useState } from "react";
import { DIM_LABELS, SCOPES, knownFor, plural, regionOf, type LiteTown, type Region, type ScoreDims, type Town } from "@/lib/towns";
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
      <div className="ranktbl scrollrank" id="rankTbl">
        <div className="rankhead">
          <span className="rnum">#</span>
          <span className="rfl"></span>
          <span className="rnm">Cycletown</span>
          <span className="rstrength">Known for</span>
          <span className="rrev">Editorial</span>
          <span className="rmv">Riders</span>
          <span className="rsc">Ranked on</span>
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
                  <small>
                    {t.region} · {t.country}
                  </small>
                </Link>
                <span className="rstrength">{knownFor(t)}</span>
                <span className="rrev flat">
                  ✎ {t.score.toFixed(1)}
                </span>
                <span className="rmv flat">
                  {e.riders ? `★ ${e.score.toFixed(1)}` : "—"}
                  <small>{e.riders ? plural(e.count, "review") : `${e.count} of ${REVIEWS_TO_TAKE_OVER} reviews`}</small>
                </span>
                <span className="rsc">
                  {e.score.toFixed(1)}
                  <small style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--grey-m)", letterSpacing: ".04em" }}>
                    {e.riders ? "RIDERS" : "EDITORIAL"}
                  </small>
                </span>
                <button className="rgo rwhy" onClick={() => setOpen(isOpen ? null : t.id)} aria-expanded={isOpen}>
                  {isOpen ? "Hide ▲" : "Why? ▾"}
                </button>
              </div>
              {isOpen && (
                <div className="rankwhy">
                  <div className="rankwhyh">
                    {e.riders
                      ? `Ranked on the rider score — ${plural(e.count, "published review")}${e.verified ? `, ${e.verified} ride-verified` : ""}. Recent rides and verified ones count for more, and a town with more reviews is ordered ahead of a thinly-reviewed one on the same average.`
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
        {lite.map((t) => (
          <Link href={`/towns/${t.slug}`} className="rankrow lb lk" key={t.slug} style={{ textDecoration: "none", color: "inherit" }}>
            <span className="rnum">·</span>
            <span className="rfl">{t.flag}</span>
            <span className="rnm">
              {t.name}
              <small>
                {t.region} · {t.country}
              </small>
            </span>
            <span className="rstrength">On the radar</span>
            <span className="rrev">In progress</span>
            <span className="rmv flat">
              —<small>not yet rated</small>
            </span>
            <span className="rsc" style={{ color: "var(--grey-m)" }}>
              —
            </span>
            <span className="rgo" style={{ color: "var(--teal)" }}>
              Preview ›
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
