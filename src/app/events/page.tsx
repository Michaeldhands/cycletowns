import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { EventBrowser } from "@/components/EventCards";
import { loadEvents } from "@/lib/events-data";
import { TOWNS } from "@/lib/towns";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cycling events",
  description:
    "Gran fondos, stage races and mass-participation rides worth travelling for — with dates, distances and a link to every official site.",
};

export default async function EventsIndex() {
  const events = await loadEvents();
  const townNames = Object.fromEntries(TOWNS.map((t) => [t.id, t.name]));
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in">
          <div className="kick">Ride the calendar</div>
          <div className="h2">Cycling events</div>
          <div className="lead">
            The gran fondos, stage races and mass rides riders actually book flights for. Every entry links to the
            organiser&rsquo;s own site — that is where you enter, and where the current details live.
          </div>
          <EventBrowser events={events} townNames={townNames} />

          <div className="unlocknote" style={{ marginTop: 26, fontSize: 13.5 }}>
            <b>How this list works.</b> Each event was checked against the organiser&rsquo;s official site on the date
            shown on its page. Where an organiser hasn&rsquo;t published next year&rsquo;s date yet, we show the pattern
            (&ldquo;first Sunday in July&rdquo;) rather than invent one. Entries, dates and routes change — always
            confirm on the official site before you book anything.{" "}
            <Link href="/contact">Know an event we&rsquo;re missing?</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
