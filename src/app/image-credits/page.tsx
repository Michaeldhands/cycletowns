import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { TOWNS } from "@/lib/towns";
import credits from "@/data/photo-credits.json";
import { EVENT_PHOTO_CREDITS, EVENTS } from "@/lib/events";

export const metadata: Metadata = { title: "Image credits" };

type Credit = { file: string; caption: string; author: string; licence: string };
const CREDITS = credits as Record<string, Credit>;
const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export default function Credits() {
  const rows = TOWNS.map((t) => ({ town: t.name, id: t.id, c: CREDITS[t.id] })).filter((r) => r.c);
  return (
    <ProsePage kick="Credits" title="Image credits." lead="Every photograph presented as a place on this site really is that place. Where we use a generic riding photo — a town still awaiting its guide, an event we haven’t shot — we say so on the picture.">
      <div className="wprose">
        <p>
          Town and event photographs come from Wikimedia Commons under Creative Commons licences that permit commercial reuse
          with attribution. Each is credited below, with a link to the original file and its licence.
        </p>
        <p>
          <b>Where we don&rsquo;t have a real photograph of somewhere, we don&rsquo;t show one.</b> Cafés, bike shops,
          routes and things to do are shown as designed cards rather than stock photography, because a photo of some
          other café above the name of a real one is a small lie we&rsquo;d rather not tell. Businesses that claim their
          listing can upload their own photo. Every event photograph says what it shows: the event itself, the
          professional race on the same roads, or a place on the route. Where we have none, an event shows the
          photograph of its town, labelled as such, or no photograph at all.
        </p>

        <h3>Town photographs</h3>
        <table className="tbl" style={{ fontSize: 13.5 }}>
          <thead><tr><th>Town</th><th>Photograph</th><th>By</th><th>Licence</th></tr></thead>
          <tbody>
            {rows.map(({ town, id, c }) => (
              <tr key={id}>
                <td><b>{town}</b></td>
                <td><a href={commons(c.file)} target="_blank" rel="noopener">{c.caption}</a></td>
                <td>{c.author}</td>
                <td>{c.licence}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Event photographs</h3>
        <table className="tbl" style={{ fontSize: 13.5 }}>
          <thead><tr><th>Event</th><th>Photograph</th><th>By</th><th>Licence</th></tr></thead>
          <tbody>
            {EVENTS.filter((e) => EVENT_PHOTO_CREDITS[e.slug]).map((e) => {
              const c = EVENT_PHOTO_CREDITS[e.slug];
              return (
                <tr key={e.slug}>
                  <td><b><Link href={`/events/${e.slug}`}>{e.name}</Link></b></td>
                  <td><a href={commons(c.file)} target="_blank" rel="noopener">{c.caption}</a></td>
                  <td>{c.author}</td>
                  <td>{c.licence}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3>Everything else</h3>
        <p>
          Map tiles are © OpenStreetMap contributors; routing is by OpenRouteService. Rider photography used in
          editorial and marketing contexts is licensed stock from Pexels, and is never presented as a specific place.
        </p>
        <p>
          If you own an image shown here and would like it credited differently or removed, email{" "}
          <a href="mailto:hello@cycletowns.com">hello@cycletowns.com</a> and we&rsquo;ll action it promptly.{" "}
          <Link href="/contact">Contact us ›</Link>
        </p>
      </div>
    </ProsePage>
  );
}
