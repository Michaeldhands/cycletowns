"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DISCIPLINES, countdown, disciplineEmoji, distanceLabel, eventPhoto, sortEvents, whenLabel, type CtEvent } from "@/lib/events";
import { Photo } from "./Photo";

/** One event, as it appears in a list. */
export function EventCard({ e, townName }: { e: CtEvent; townName?: string }) {
  const soon = countdown(e);
  return (
    <Link href={`/events/${e.slug}`} className="evcard" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="evimg"><Photo src={eventPhoto(e, 560)} alt="" /></div>
      <div className="evbody">
      <div className="evtop">
        <span className="evdisc">{disciplineEmoji(e.discipline)} {e.discipline === "mtb" ? "MTB" : e.discipline[0].toUpperCase() + e.discipline.slice(1)}</span>
        {soon && <span className="evsoon">{soon}</span>}
      </div>
      <h3>{e.name}</h3>
      <div className="evwhen">{whenLabel(e)}</div>
      <div className="evmeta">
        <span>{distanceLabel(e.km)}</span>
        {e.vert != null && <span>· {e.vert.toLocaleString()} m climbing</span>}
      </div>
      <p>{e.note}</p>
      <div className="evfoot">
        {townName ? `${townName} · ${e.country}` : `${e.region ? e.region + " · " : ""}${e.country}`}
      </div>
      </div>
    </Link>
  );
}

/** The events index, filtered client-side — the list is small enough that this beats a round trip. */
export function EventBrowser({ events, townNames }: { events: CtEvent[]; townNames: Record<string, string> }) {
  const [disc, setDisc] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [q, setQ] = useState("");

  const countries = useMemo(() => [...new Set(events.map((e) => e.country).filter(Boolean))].sort() as string[], [events]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sortEvents(
      events.filter(
        (e) =>
          (!disc || e.discipline === disc) &&
          (!country || e.country === country) &&
          (!needle || `${e.name} ${e.region} ${e.country} ${e.note}`.toLowerCase().includes(needle)),
      ),
    );
  }, [events, disc, country, q]);

  return (
    <>
      <div className="evfilters">
        <input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder="Search events, places…"
          aria-label="Search events"
          className="evsearch"
        />
        <div className="filterchips">
          <button type="button" className={"filterchip" + (disc === "" ? " on" : "")} onClick={() => setDisc("")}>All disciplines</button>
          {DISCIPLINES.map((d) => (
            <button key={d.id} type="button" className={"filterchip" + (disc === d.id ? " on" : "")} onClick={() => setDisc(d.id)}>
              {d.emoji} {d.label}
            </button>
          ))}
        </div>
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country" className="evselect">
          <option value="">Everywhere</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="evcount">{shown.length} event{shown.length === 1 ? "" : "s"}</div>

      {shown.length === 0 ? (
        <div className="unlocknote" style={{ fontSize: 14, padding: 16 }}>
          Nothing matches that. Try clearing a filter — or <Link href="/contact">tell us about an event we&rsquo;re missing</Link>.
        </div>
      ) : (
        <div className="evgrid">
          {shown.map((e) => <EventCard key={e.slug} e={e} townName={e.town_id ? townNames[e.town_id] : undefined} />)}
        </div>
      )}
    </>
  );
}
