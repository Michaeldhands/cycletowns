import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCards";
import { countdown, disciplineEmoji, disciplineLabel, eventPhoto, getEvent, isUpcoming, sortEvents, whenLabel } from "@/lib/events";
import { loadEvents } from "@/lib/events-data";
import { Photo } from "@/components/Photo";
import { getTown } from "@/lib/towns";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const e = getEvent(await loadEvents(), (await params).slug);
  if (!e) return { title: "Event" };
  return { title: e.name, description: e.note.slice(0, 155) };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const all = await loadEvents();
  const e = getEvent(all, (await params).slug);
  if (!e) notFound();
  const town = e.town_id ? getTown(e.town_id) : null;
  const soon = countdown(e);
  const related = sortEvents(all.filter((x) => x.slug !== e.slug && (x.country === e.country || x.discipline === e.discipline))).slice(0, 3);

  return (
    <>
      <TopBar back={{ href: "/events", label: "All events" }} />
      <div className="evhero">
        <Photo src={eventPhoto(e, 1400)} alt={e.name} />
      </div>
      <div className="sec2" style={{ paddingTop: 22 }}>
        <div className="in" style={{ maxWidth: 880 }}>
          <div className="bc">
            <Link href="/">Cycletowns</Link> › <Link href="/events">Events</Link> › <b>{e.name}</b>
          </div>
          <div className="awards" style={{ marginTop: 10 }}>
            <span className="award alt">{disciplineEmoji(e.discipline)} {disciplineLabel(e.discipline)}</span>
            {soon && <span className="award">{soon}</span>}
          </div>
          <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 46, lineHeight: 0.95, margin: "10px 0 6px" }}>
            {e.name}
          </h1>
          <div className="lead" style={{ marginBottom: 18 }}>
            {[e.region, e.country].filter(Boolean).join(" · ")}
            {e.organiser && <> · organised by {e.organiser}</>}
          </div>

          <div className="kpis" style={{ marginBottom: 18 }}>
            <div className="kpi"><div className="k">When</div><div className="v" style={{ fontSize: 20 }}>{whenLabel(e)}</div></div>
            <div className="kpi">
              <div className="k">Distances</div>
              <div className="v" style={{ fontSize: 20 }}>{e.km.length ? e.km.map((k) => `${k}`).join(" · ") + " km" : "See official site"}</div>
            </div>
            <div className="kpi">
              <div className="k">Climbing</div>
              <div className="v" style={{ fontSize: 20 }}>{e.vert != null ? `${e.vert.toLocaleString()} m` : "Not published"}</div>
            </div>
          </div>

          <div className="wprose">
            <p style={{ fontSize: 17 }}>{e.note}</p>
          </div>

          <div className="wbar" style={{ marginTop: 18 }}>
            {e.url && (
              <a href={e.url} target="_blank" rel="noopener" className="lk-coral big" style={{ textDecoration: "none" }}>
                Official site &amp; entries ›
              </a>
            )}
            {town && (
              <Link href={`/towns/${town.id}`} className="lk-ghost big" style={{ textDecoration: "none" }}>
                Riding guide: {town.name} ›
              </Link>
            )}
            {town && (
              <Link href={`/plan?town=${town.id}`} className="lk-ghost big" style={{ textDecoration: "none" }}>
                ✨ Plan the trip
              </Link>
            )}
          </div>

          {!isUpcoming(e) && (
            <div className="unlocknote" style={{ marginTop: 18, fontSize: 13.5 }}>
              The organiser hasn&rsquo;t published the next date yet, so we&rsquo;re showing when it normally runs rather
              than guessing. The official site will have it first.
            </div>
          )}

          <p className="photocredit" style={{ marginTop: 18 }}>
            Checked against the organiser&rsquo;s official site{e.verified ? ` on ${new Date(e.verified).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
            Dates, routes and entry conditions change — confirm on the official site before booking flights or accommodation.
            We are not the organiser and take no entries.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="wsec alt2" style={{ paddingBottom: 40 }}>
          <div className="wh"><div><h2>Riders who do this one also do</h2></div></div>
          <div className="evgrid">
            {related.map((x) => <EventCard key={x.slug} e={x} />)}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
