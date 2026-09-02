"use client";
import Link from "next/link";
import { useState } from "react";
import { SCOPES, knownFor, regionOf, type LiteTown, type Region, type Town } from "@/lib/towns";
import { REVIEWS_TO_TAKE_OVER, type TownScore } from "@/lib/reviews-types";

/** Leaderboard with a region filter. Full-guide towns are ranked; radar towns are listed unscored. */
export function RankTable({ full: allFull, lite: allLite, scores = {}, initialScope = "all" }: { full: Town[]; lite: LiteTown[]; scores?: Record<string, TownScore>; initialScope?: "all" | Region }) {
  const [scope, setScope] = useState<"all" | Region>(initialScope);
  const eff = (t: Town) => {
    const s = scores[t.id];
    return s && s.review_count >= REVIEWS_TO_TAKE_OVER ? Number(s.score) : t.score;
  };
  const full = allFull.filter((t) => scope === "all" || regionOf(t.country) === scope).sort((a, b) => eff(b) - eff(a));
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
      <div className="ranktbl scrollrank" id="rankTbl">
        <div className="rankhead">
          <span className="rnum">#</span>
          <span className="rfl"></span>
          <span className="rnm">Cycletown</span>
          <span className="rstrength">Known for</span>
          <span className="rrev">Guide</span>
          <span className="rmv">Reviews</span>
          <span className="rsc">Score</span>
          <span className="rgo"></span>
        </div>
        {full.map((t, i) => (
          <Link href={`/towns/${t.id}`} className="rankrow lb" key={t.id} style={{ textDecoration: "none", color: "inherit" }}>
            <span className="rnum">{i + 1}</span>
            <span className="rfl">{t.flag}</span>
            <span className="rnm">
              {t.name}
              <small>
                {t.region} · {t.country}
              </small>
            </span>
            <span className="rstrength">{knownFor(t)}</span>
            <span className="rrev">Full guide</span>
            <span className="rmv flat">
              {scores[t.id]?.review_count || 0}<small>{scores[t.id]?.review_count === 1 ? "review" : "reviews"}</small>
            </span>
            <span className="rsc">★ {eff(t).toFixed(1)}</span>
            <span className="rgo">View ›</span>
          </Link>
        ))}
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
