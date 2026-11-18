"use client";
import Link from "next/link";
import { useState } from "react";
import { SCOPES, knownFor, plural, regionOf, type LiteTown, type Region, type Town, placeLine } from "@/lib/towns";
import { CRITERIA, DISTINCTIONS, distinctionOf, guideOrder, type Level } from "@/lib/distinctions";
import type { TownScore } from "@/lib/reviews-types";
import { Wheels } from "./Distinction";

/* The guide, grouped by distinction — the way the Michelin Guide lists restaurants. No league
   table inside a tier: a town either is worth the trip or it isn't. Rider reviews appear beside
   each town as "Riders say" and never move it. */

export function RankTable({ full: allFull, lite: allLite, scores = {}, initialScope = "all" }: { full: Town[]; lite: LiteTown[]; scores?: Record<string, TownScore>; initialScope?: "all" | Region }) {
  const [scope, setScope] = useState<"all" | Region>(initialScope);
  const [open, setOpen] = useState<string | null>(null);

  const full = allFull.filter((t) => scope === "all" || regionOf(t.country) === scope).sort(guideOrder);
  const lite = allLite.filter((t) => scope === "all" || regionOf(t.country) === scope);
  const tiers = ([3, 2, 1, 0] as Level[]).map((lv) => ({ lv, towns: full.filter((t) => distinctionOf(t).level === lv) }));

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

      {tiers.map(({ lv, towns }) => (
        <section className="tier" key={lv}>
          <div className="tierh">
            <Wheels level={lv} size={20} />
            <div>
              <h3>{DISTINCTIONS[lv].name}{lv > 0 && <span> · {DISTINCTIONS[lv].short}</span>}</h3>
              <p>{DISTINCTIONS[lv].line}</p>
            </div>
          </div>
          {towns.length === 0 ? (
            <p className="tierempty">
              {lv === 3
                ? "None yet. The third wheel is only awarded after an inspection in person — and our inspections are just beginning."
                : "None in this region yet."}
            </p>
          ) : (
            <ul className="tierlist">
              {towns.map((t) => {
                const d = distinctionOf(t);
                const s = scores[t.id];
                const isOpen = open === t.id;
                return (
                  <li key={t.id}>
                    <div className="tierrow">
                      <span className="tflag">{t.flag}</span>
                      <Link href={`/towns/${t.id}`} className="tname">
                        {t.name}
                        <small>{placeLine(t.region, t.country)}</small>
                      </Link>
                      <span className="tknown">{knownFor(t)}</span>
                      <span className="triders" title="Riders say — published rider reviews, shown beside our verdict; they never change it">
                        {s && s.review_count > 0 ? <>★ {Number(s.score).toFixed(1)} <small>{plural(s.review_count, "rider review")}</small></> : <small>No rider reviews yet</small>}
                      </span>
                      <span className="tstat">{d.status === "provisional" ? "Provisional" : "Inspected"}</span>
                      <button className="rwhy" onClick={() => setOpen(isOpen ? null : t.id)} aria-expanded={isOpen}>
                        {isOpen ? "Hide ▲" : "Why? ▾"}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="rankwhy">
                        <div className="rankwhyh">
                          {d.status === "provisional"
                            ? "A provisional distinction, from our research. It becomes final — up or down — once an inspector has ridden the town."
                            : "Awarded after an inspection in person."}{" "}
                          How it measures up on the five things we judge:
                        </div>
                        <div className="rankwhyg">
                          {CRITERIA.map((c) => (
                            <div className="rwd" key={c.dim}>
                              <span className="rwdl">{c.name}</span>
                              <span className="rwdbar"><i style={{ width: `${(t.scoreDims[c.dim] / 5) * 100}%` }} /></span>
                            </div>
                          ))}
                        </div>
                        <Link href={`/towns/${t.id}`} className="rankwhyl">Read the {t.name} guide ›</Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}

      {lite.length > 0 && (
        <div className="radarlist">
          <h3>On our radar · {lite.length}</h3>
          <p>Not in the guide yet. Researched next — tap one for what we know so far.</p>
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
