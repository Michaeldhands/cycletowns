"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ABILITIES, DISCIPLINES, buildPlan, prettyDate, type Ability, type Plan, type PlanTown } from "@/lib/planner";
import { slugify } from "@/lib/towns";

export type TownOption = { id: string; name: string; region: string; country: string; flag: string };

const KIND_ICON: Record<string, string> = { ride: "🚴", rest: "☕", race: "🏁" };

export function PlanView({ plan, townName }: { plan: Plan; townName: string }) {
  return (
    <div className="planout">
      <p className="planhead">{plan.headline}</p>
      {plan.whenNote && <div className="unlocknote" style={{ marginBottom: 14 }}>📅 {plan.whenNote}</div>}
      <div className="plandays">
        {plan.days.map((d) => (
          <div className={"planday " + d.kind} key={d.day}>
            <div className="pdnum">
              <b>Day {d.day}</b>
              {d.date && <small>{prettyDate(d.date)}</small>}
            </div>
            <div className="pdbody">
              <div className="pdtitle">
                <span aria-hidden="true">{KIND_ICON[d.kind]}</span> {d.title}
              </div>
              {d.subtitle && <div className="pdsub">{d.subtitle}</div>}
              {d.route?.note && <p className="pdnote">{d.route.note}</p>}
              {d.cafe && (
                <div className="pdline">
                  ☕ <b>{d.cafe.name}</b>
                  {d.cafe.note ? ` — ${d.cafe.note}` : ""}
                </div>
              )}
              {d.things && d.things.length > 0 && (
                <div className="pdline">
                  {d.things.map((s, i) => (
                    <span key={i} style={{ marginRight: 12 }}>
                      {s[0]} {s[1]}
                    </span>
                  ))}
                </div>
              )}
              {d.notes.map((n, i) => (
                <p className="pdnote" key={i}>
                  {n}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {plan.kit.length > 0 && (
        <div className="wscorebox" style={{ maxWidth: "none", marginTop: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Before you go</h3>
          {plan.kit.map((k, i) => (
            <div className="grow" key={i}>
              <span>{k}</span>
            </div>
          ))}
          <p className="wsub" style={{ marginTop: 10, display: "block" }}>
            Routes, cafés and shops come from the {townName} guide — rider-checked, not sponsored. Always confirm opening
            hours and conditions locally.
          </p>
        </div>
      )}
    </div>
  );
}

export function PlanBuilder({ towns, data, initialTown, userId }: { towns: TownOption[]; data: Record<string, PlanTown>; initialTown?: string; userId: string | null }) {
  const [townId, setTownId] = useState(initialTown && data[initialTown] ? initialTown : "");
  const [days, setDays] = useState(4);
  const [startDate, setStartDate] = useState("");
  const [ability, setAbility] = useState<Ability>("Regular");
  const [discipline, setDiscipline] = useState("mixed");
  const [bringBike, setBringBike] = useState(true);
  const [built, setBuilt] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const town = townId ? data[townId] : undefined;
  const plan = useMemo(() => (town ? buildPlan(town, { days, startDate: startDate || undefined, ability, discipline, bringBike }) : null), [town, days, startDate, ability, discipline, bringBike]);

  const save = async () => {
    if (!plan || !town || !userId) return;
    setBusy(true);
    setErr("");
    const slug = `${slugify(town.name)}-${days}d-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await supabaseBrowser().from("trips").insert({
      slug, user_id: userId, town_id: town.id, title: `${days} days in ${town.name}`,
      start_date: startDate || null, days, ability, discipline, bring_bike: bringBike, plan,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setSaved(slug);
  };

  return (
    <>
      <div className="wscorebox planform" style={{ maxWidth: "none" }}>
        <div className="cardgrid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field">
            <label>Where are you riding?</label>
            <select value={townId} onChange={(e) => { setTownId(e.target.value); setBuilt(false); setSaved(null); }}>
              <option value="">Choose a town…</option>
              {towns.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flag} {t.name} — {t.region}, {t.country}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Arriving (optional)</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>How many days? <b style={{ color: "var(--coral)" }}>{days}</b></label>
          <input type="range" min={1} max={10} value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div className="field">
          <label>How do you ride?</label>
          <div className="filterchips">
            {ABILITIES.map((a) => (
              <button key={a} type="button" className={"filterchip" + (ability === a ? " on" : "")} onClick={() => setAbility(a)}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>What are you here for?</label>
          <div className="filterchips">
            {DISCIPLINES.map((d) => (
              <button key={d.id} type="button" className={"filterchip" + (discipline === d.id ? " on" : "")} onClick={() => setDiscipline(d.id)}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Bike</label>
          <div className="filterchips">
            <button type="button" className={"filterchip" + (bringBike ? " on" : "")} onClick={() => setBringBike(true)}>Bringing my own</button>
            <button type="button" className={"filterchip" + (!bringBike ? " on" : "")} onClick={() => setBringBike(false)}>Hiring there</button>
          </div>
        </div>
        <button className="lk-coral big" onClick={() => setBuilt(true)} disabled={!townId}>
          {townId ? "Build my plan" : "Pick a town first"}
        </button>
      </div>

      {built && plan && town && (
        <div style={{ marginTop: 26 }}>
          <div className="wh noprint">
            <div>
              <h2 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 31 }}>Your {town.name} plan</h2>
              <span className="wsub">Adjust anything above and it rebuilds instantly.</span>
            </div>
            <div className="wbar">
              <button className="lk-ghost" onClick={() => window.print()}>🖨 Print</button>
              {userId ? (
                <button className="lk-coral" onClick={save} disabled={busy || !!saved}>{saved ? "Saved ✓" : busy ? "Saving…" : "Save this plan"}</button>
              ) : (
                <Link href={`/join?next=${encodeURIComponent(`/plan?town=${town.id}`)}`} className="lk-coral">Join free to save it</Link>
              )}
            </div>
          </div>
          {saved && (
            <div className="unlocknote" style={{ marginBottom: 14 }}>
              Saved to your account. Share it: <Link href={`/plan/${saved}`}>cycletowns.com/plan/{saved}</Link>
            </div>
          )}
          {err && <div style={{ color: "var(--coral-700)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{err}</div>}
          <PlanView plan={plan} townName={town.name} />
          <div className="wbar noprint" style={{ marginTop: 18 }}>
            <Link href={`/towns/${town.id}`} className="lk-ghost">Open the {town.name} guide ›</Link>
          </div>
        </div>
      )}
    </>
  );
}
