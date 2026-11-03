"use client";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { AskEvent, AskTurn, Card, EventLite, LoopCard, PlanCard, TownCardData, TownGuideCard } from "@/lib/ask/cards";
import { elevationPath, loopGrade, prettyHours, toGpx } from "@/lib/loops";
import { starters as seasonalStarters } from "@/lib/ask/starters";

/* The Ask Cycletowns panel. The conversation lives in this component's state only — reload and
   it's gone, which is the honest default until riders choose otherwise. */

type Part = { kind: "text"; text: string } | { kind: "card"; card: Card };
type Msg = { role: "user" | "assistant"; parts: Part[] };


const msgText = (m: Msg) => m.parts.map((p) => (p.kind === "text" ? p.text : cardSummary(p.card))).join("").trim();

/** What the model sees of a card on later turns — enough to say "that loop" or "the second event". */
function cardSummary(c: Card): string {
  switch (c.type) {
    case "towns": return `\n[Shown: towns ${c.towns.map((t) => t.name).join(", ")}]`;
    case "town": return `\n[Shown: ${c.town.name} guide]`;
    case "events": return `\n[Shown: events ${c.events.map((e) => e.name).join(", ")}]`;
    case "loop": return `\n[Shown: ${(c.loop.distance_m / 1000).toFixed(1)} km ${c.loop.discipline} loop from ${c.loop.place}]`;
    case "plan": return `\n[Shown: ${c.plan.days.length}-day plan for ${c.plan.townName}]`;
    case "remembered": return "";
  }
}

export type AskProps = {
  enabled: boolean;
  signedIn: boolean;
  /** Text to start with. Sent straight away when `autoSend` is true, otherwise left in the box. */
  initial?: string;
  autoSend?: boolean;
  /** A question pushed in from outside (the hero box, "Ask about Bright"). `n` changes each time. */
  pending?: { q: string; n: number } | null;
  starters?: string[];
  greeting?: string | null;
  compact?: boolean;
};

export function AskConcierge({ enabled, signedIn, initial, autoSend, pending, starters, greeting, compact }: AskProps) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState(autoSend ? "" : initial || "");
  const [chips] = useState(() => starters || seasonalStarters());
  const sent = useRef<number | string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, status]);

  // Questions that arrive from elsewhere on the page. The ref stops the same one being sent twice.
  useEffect(() => {
    const q = pending?.q || (autoSend ? initial : undefined);
    const key = pending ? pending.n : autoSend ? "initial" : null;
    if (!q || key === null || sent.current === key) return;
    sent.current = key;
    const t = setTimeout(() => ask(q), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending?.n, autoSend, initial]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setNotice(null);
    setInput("");
    const history: Msg[] = [...msgs, { role: "user", parts: [{ kind: "text", text: q }] }];
    setMsgs([...history, { role: "assistant", parts: [] }]);
    setBusy(true);
    setStatus("Thinking…");

    const turns: AskTurn[] = history.map((m) => ({ role: m.role, text: msgText(m) })).filter((t) => t.text);
    const push = (p: Part) =>
      setMsgs((cur) => {
        const copy = cur.slice();
        const last = { ...copy[copy.length - 1], parts: copy[copy.length - 1].parts.slice() };
        const tail = last.parts[last.parts.length - 1];
        if (p.kind === "text" && tail?.kind === "text") last.parts[last.parts.length - 1] = { kind: "text", text: tail.text + p.text };
        else last.parts.push(p);
        copy[copy.length - 1] = last;
        return copy;
      });

    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ turns }) });
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setMsgs(history);
        setInput(q);
        setNotice(j.error || "Ask Cycletowns couldn’t answer just now.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          let ev: AskEvent;
          try { ev = JSON.parse(line) as AskEvent; } catch { continue; }
          if (ev.t === "text") { setStatus(null); push({ kind: "text", text: ev.v }); }
          else if (ev.t === "card") push({ kind: "card", card: ev.card });
          else if (ev.t === "status") setStatus(ev.v);
          else if (ev.t === "error") setNotice(ev.v);
        }
      }
    } catch {
      setNotice("The connection dropped. Try that again.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }

  if (!enabled) {
    return (
      <div className="unlocknote" style={{ fontSize: 14, padding: 16 }}>
        Ask Cycletowns is being switched on. In the meantime, the <Link href="/plan">trip planner</Link> and{" "}
        <Link href="/loop">loop builder</Link> do the same work by hand.
      </div>
    );
  }

  return (
    <div className={"ask" + (compact ? " compact" : "")}>
      {msgs.length === 0 && (
        <div className="askstart">
          {greeting && <p className="askgreet">{greeting}</p>}
          <p>Ask about where to ride, what to enter, or how to spend a weekend on the bike. Victoria for now.</p>
          <div className="askchips">
            {chips.map((s) => (
              <button key={s} type="button" className="askchip" onClick={() => ask(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="asklog" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={"askmsg " + m.role}>
            {m.parts.map((p, j) => (p.kind === "text" ? <Prose key={j} text={p.text} /> : <CardView key={j} card={p.card} />))}
          </div>
        ))}
        {status && <div className="askstatus">{status}</div>}
        <div ref={end} />
      </div>

      {notice && <div className="asknotice">{notice} {!signedIn && /join/i.test(notice) && <Link href="/join?next=/ask">Join free ›</Link>}</div>}

      <form className="askform" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
          placeholder="Ask about riding in Victoria…"
          rows={2}
          maxLength={1500}
          aria-label="Your question"
        />
        <button type="submit" className="lk-coral" disabled={busy || !input.trim()}>{busy ? "…" : "Ask"}</button>
      </form>
      <p className="askfoot">
        {signedIn ? (
          <>Ask Cycletowns remembers what you tell it about how you ride. <Link href="/account/memory">See or delete what it knows ›</Link></>
        ) : (
          <><Link href="/join?next=/ask">Join free</Link> and Ask Cycletowns remembers how you ride.</>
        )}{" "}
        Answers come from our guides; always check conditions before you ride.
      </p>
    </div>
  );
}

/* ---------- text: a deliberately small markdown subset, built as elements (no HTML injection) ---------- */

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[1]) out.push(<b key={m.index}>{m[1]}</b>);
    else {
      const href = m[3];
      if (href.startsWith("/")) out.push(<Link key={m.index} href={href}>{m[2]}</Link>);
      else if (/^https:\/\//.test(href)) out.push(<a key={m.index} href={href} target="_blank" rel="noopener nofollow">{m[2]}</a>);
      else out.push(m[2]);
    }
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

function Prose({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/).filter(Boolean);
  if (!blocks.length) return null;
  return (
    <div className="askprose">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>)}</ul>;
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l.replace(/^#+\s*/, ""))}</Fragment>)}</p>;
      })}
    </div>
  );
}

/* ---------- cards ---------- */

function CardView({ card }: { card: Card }) {
  switch (card.type) {
    case "towns": return <TownsCard towns={card.towns} />;
    case "town": return <TownCardView t={card.town} />;
    case "events": return <EventsCard events={card.events} />;
    case "loop": return <LoopCardView l={card.loop} />;
    case "plan": return <PlanCardView p={card.plan} />;
    case "remembered": return <div className="askmem">Remembered: {card.fact}</div>;
  }
}

function TownsCard({ towns }: { towns: TownCardData[] }) {
  if (!towns.length) return null;
  return (
    <div className="askcards">
      {towns.map((t) => (
        <Link key={t.id} href={`/towns/${t.id}`} className="askcard">
          <div className="ack">{t.region}{t.score != null && <span className="acs" title="Our editorial score">✎ {t.score.toFixed(1)}</span>}</div>
          <div className="acn">{t.name}</div>
          <div className="acd">{t.blurb}</div>
          <div className="actags">{t.tags.map((x) => <span key={x}>{x}</span>)}</div>
        </Link>
      ))}
    </div>
  );
}

function TownCardView({ t }: { t: TownGuideCard }) {
  return (
    <div className="askpanel">
      <div className="aph">
        <div>
          <div className="acn">{t.name}</div>
          <div className="ack">Our editorial score ✎ {t.score.toFixed(1)}</div>
          {t.best && <div className="acd" style={{ marginTop: 4 }}>Best riding: {t.best}</div>}
        </div>
        <Link href={`/towns/${t.id}`} className="lk-ghost">Full guide ›</Link>
      </div>
      <div className="apcols">
        <div>
          <h4>Rides</h4>
          <ul>{t.routes.slice(0, 5).map((r) => <li key={r.n}><b>{r.n}</b>{r.km ? ` · ${r.km} km` : ""}{r.vert ? ` · ${r.vert.toLocaleString()} m` : ""}<span>{r.note}</span></li>)}</ul>
        </div>
        <div>
          <h4>Café stops</h4>
          <ul>{t.cafes.slice(0, 4).map((c) => <li key={c.n}><b>{c.n}</b>{c.verified && <em className="vbadge">✓ Verified</em>}<span>{c.note}</span></li>)}</ul>
          {t.shops.length > 0 && (
            <>
              <h4>Bike shops</h4>
              <ul>{t.shops.slice(0, 3).map((c) => <li key={c.n}><b>{c.n}</b><span>{c.note}</span></li>)}</ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EventsCard({ events }: { events: EventLite[] }) {
  return (
    <div className="askcards">
      {events.map((e) => (
        <Link key={e.slug} href={`/events/${e.slug}`} className="askcard">
          <div className="ack">{e.discipline === "mtb" ? "MTB" : e.discipline[0].toUpperCase() + e.discipline.slice(1)} · {e.when}</div>
          <div className="acn">{e.name}</div>
          <div className="acd">{e.region}{e.km.length ? ` · ${e.km.length === 1 ? e.km[0] : `${Math.min(...e.km)}–${Math.max(...e.km)}`} km` : ""}</div>
        </Link>
      ))}
    </div>
  );
}

function LoopCardView({ l }: { l: LoopCard }) {
  const grade = loopGrade(l.distance_m, l.ascent_m);
  const prof = elevationPath(l.coords, 600, 70);
  const gpx = () => {
    const name = `${(l.distance_m / 1000).toFixed(0)} km ${l.discipline} loop from ${l.place}`;
    const blob = new Blob([toGpx(name, l.coords, l.place)], { type: "application/gpx+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cycletowns-${l.place.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.round(l.distance_m / 1000)}km.gpx`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="askpanel">
      <div className="aph">
        <div>
          <div className="acn">{(l.distance_m / 1000).toFixed(1)} km from {l.place}</div>
          <div className="ack">{l.discipline} · generated from OpenStreetMap — not ridden by us</div>
        </div>
        <span className="apgrade" style={{ color: grade.color }}>{grade.label}</span>
      </div>
      <div className="apstats">
        <div><span>Climbing</span><b>{l.ascent_m.toLocaleString()} m</b></div>
        <div><span>Your time</span><b>{prettyHours(l.hours)}</b></div>
        <div><span>At</span><b>{Math.round(l.speed)} km/h</b></div>
      </div>
      {prof && (
        <svg viewBox="0 0 600 70" className="apelev" preserveAspectRatio="none" aria-hidden="true">
          <path d={`${prof.d} L600,70 L0,70 Z`} />
        </svg>
      )}
      <div className="apbtns">
        <button type="button" className="lk-coral" onClick={gpx}>⬇ GPX</button>
        <Link href={l.townId ? `/loop?town=${l.townId}` : "/loop"} className="lk-ghost">Open the route planner ›</Link>
      </div>
    </div>
  );
}

function PlanCardView({ p }: { p: PlanCard }) {
  return (
    <div className="askpanel">
      <div className="aph">
        <div>
          <div className="acn">{p.townName}: {p.days.length} days</div>
          <div className="ack">{p.headline}</div>
        </div>
        <Link href={`/plan?town=${p.townId}`} className="lk-ghost">Edit &amp; save ›</Link>
      </div>
      <ol className="apdays">
        {p.days.map((d) => (
          <li key={d.day} className={d.kind}>
            <b>Day {d.day}{d.date ? ` · ${new Date(d.date + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}` : ""}</b> — {d.title}
            {d.route && d.route !== d.title && <span> Ride: {d.route}.</span>}
            {d.cafe && <span> Stop: {d.cafe}.</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
