import Link from "next/link";
import { Photo } from "./Photo";
import { townHero } from "@/lib/images";
import { gmaps, plural, type Place, type SeeDo, type Town, rideDiscipline, placeLine } from "@/lib/towns";
import { distinctionOf } from "@/lib/distinctions";
import { Distinction } from "./Distinction";

/** Landing / listing town card — photograph, the guide's distinction, name, place. Nothing else competes. */
export function TownCard({ t }: { t: Town }) {
  const d = distinctionOf(t);
  return (
    <Link href={`/towns/${t.id}`} className="tcard" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="hero">
        <Photo src={townHero(t, 900)} alt={t.name} />
      </div>
      <div className="meta">
        <Distinction level={d.level} status={d.status} />
        <div className="nm">{t.name}</div>
        <div className="rg">
          {t.flag} {placeLine(t.region, t.country)}
        </div>
        <div className="tags">
          {t.tags.slice(0, 3).map((x) => (
            <span className="tag" key={x}>
              {x}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

const DISC_LABEL: Record<string, string> = { road: "Road", gravel: "Gravel", mtb: "MTB", climbs: "Climb" };

export function RideCard({ t, p }: { t: Town; p: Place }) {
  const d = rideDiscipline(p);
  return (
    <a className={`wcard d-${d}`} href={gmaps(`${p.n} ${t.name} ${t.country}`)} target="_blank" rel="noopener">
      <div className={`wcap d-${d}`}>
        <span className="wpill">{DISC_LABEL[d]}</span>
        {p.km != null && <span className="wcapkm">{p.km} km{p.vert != null ? ` · ${p.vert.toLocaleString()} m` : ""}</span>}
      </div>
      <div className="wcb">
        <div className="wcn">{p.n}</div>
        <div className="wcd">{p.note}</div>
        <span className="wlink">View route on map ↗</span>
      </div>
    </a>
  );
}

export function CafeCard({ t, p }: { t: Town; p: Place }) {
  return (
    <a className="wcard" href={gmaps(`${p.n} ${t.name}`)} target="_blank" rel="noopener">
      <div className="wcap cafe">
        <span className="wcapem">☕</span>
        {p.verified && <span className="wpill vpill">✓ Verified bike-friendly</span>}
      </div>
      <div className="wcb">
        <div className="wcn">{p.n}</div>
        <div className="wcd">{p.note}</div>
        <span className="wlink">Open in Google Maps ↗</span>
      </div>
    </a>
  );
}

export function ShopCard({ t, p }: { t: Town; p: Place }) {
  const ebike = /e-?bike|e-?mtb/i.test((p.note || "") + p.n);
  return (
    <a className="wcard" href={gmaps(`${p.n} ${t.name}`)} target="_blank" rel="noopener">
      <div className="wcap shop">
        <span className="wcapem">🔧</span>
        {p.verified ? <span className="wpill vpill">✓ Verified bike-friendly</span> : p.hire ? <span className="wpill">{ebike ? "⚡ E-bike hire" : "🔧 Hire"}</span> : null}
      </div>
      <div className="wcb">
        <div className="wcn">{p.n}</div>
        <div className="wcd">{p.note}</div>
        <span className="wlink">Open in Google Maps ↗</span>
      </div>
    </a>
  );
}

export function ThingCard({ t, s }: { t: Town; s: SeeDo }) {
  return (
    <a className="wcard" href={gmaps(`${s[1]} ${t.name}`)} target="_blank" rel="noopener">
      <div className="wcap thing">
        <span className="wcapem">📍</span>
        <span className="wpill">{s[0]}</span>
      </div>
      <div className="wcb">
        <div className="wcn">{s[1]}</div>
        <div className="wcd">{s[2]}</div>
        <span className="wlink">See on map ↗</span>
      </div>
    </a>
  );
}
