import Link from "next/link";
import { Photo } from "./Photo";
import { townHero, ridePic, venuePic } from "@/lib/images";
import { gmaps, rankOf, type Place, type SeeDo, type Town, rideDiscipline } from "@/lib/towns";

/** Landing / listing town card. */
export function TownCard({ t }: { t: Town }) {
  return (
    <Link href={`/towns/${t.id}`} className="tcard" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="hero">
        <Photo src={townHero(t, 900)} alt={t.name} />
        <div className="rankbadge">#{rankOf(t.id)}</div>
        <div className="flag">{t.flag}</div>
        <div className="badge">
          <span className="s">★</span> {t.score.toFixed(1)}
        </div>
      </div>
      <div className="meta">
        <div className="nm">{t.name}</div>
        <div className="rg">
          {t.region} · {t.country}
        </div>
        <div className="tags">
          {t.tags.slice(0, 3).map((x) => (
            <span className="tag" key={x}>
              {x}
            </span>
          ))}
        </div>
        <div className="rd">
          {t.routes.length} routes · {t.cafes.length} cafés · {t.shops.length} shops
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
      <div className="wph">
        <Photo src={ridePic(d === "climbs" ? "climb" : d, t.id + p.n, 520)} />
        <span className="wpill">{DISC_LABEL[d]}</span>
        <span className="wsc">★ {p.s.toFixed(1)}</span>
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
      <div className="wph">
        <Photo src={venuePic("cafe", t.id + p.n, 520)} />
        <span className="wsc">★ {p.s.toFixed(1)}</span>
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
      <div className="wph">
        <Photo src={venuePic("shop", t.id + p.n, 520)} />
        <span className="wsc">★ {p.s.toFixed(1)}</span>
        {p.hire && <span className="wpill">{ebike ? "⚡ E-bike hire" : "🔧 Hire"}</span>}
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
      <div className="wph">
        <Photo src={venuePic("thing", t.id + s[1], 520)} />
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
