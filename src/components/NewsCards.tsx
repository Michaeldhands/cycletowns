import Link from "next/link";
import { Photo } from "./Photo";
import { ridePic, townHero } from "@/lib/images";
import { getTown, slugify } from "@/lib/towns";

export type Original = {
  kind?: string;
  series?: string;
  ep?: number;
  town?: string;
  img: string;
  date?: string;
  title: string;
  dek: string;
  body: string;
  cat?: string;
  image_url?: string | null;
};

export function articleSlug(a: Original): string {
  return slugify(a.title);
}

/** An article about a town shows that town's own licensed photo, never a stock rider shot —
    a generic photo under a place name is the thing the image-credits page promises we don't do. */
export function articleImage(a: Original, w: number, seed: string): string {
  if (a.image_url) return a.image_url;
  const t = a.town ? getTown(a.town) : null;
  if (t) return townHero(t, w);
  return ridePic(a.img, seed, w);
}

/** Card for a Cycletowns Original (series episode / feature). */
export function OriginalCard({ a, idx }: { a: Original; idx: number }) {
  return (
    <Link href={`/news/${articleSlug(a)}`} className="norig" style={{ textDecoration: "none" }}>
      <div className="norigimg">
        <Photo src={articleImage(a, 520, "orig-" + idx)} alt={a.title} />
        <span className="nbadge">{a.series ? `▶ ${a.series} · Ep ${a.ep}` : a.kind}</span>
      </div>
      <div className="norigb">
        <h4>{a.title}</h4>
        <p>{a.dek}</p>
        <div className="nbyline">
          <span>{a.series || a.kind || "Feature"} · Cycletowns Originals</span>
        </div>
      </div>
    </Link>
  );
}

/** Grid card used on the News hub. */
export function NewsGridCard({ a, idx }: { a: Original; idx: number }) {
  return (
    <Link href={`/news/${articleSlug(a)}`} className={`ngcard cat-${(a.cat || "original").toLowerCase()}`} style={{ textDecoration: "none" }}>
      <div className="ngimg">
        <Photo src={articleImage(a, 520, "news-" + idx)} alt={a.title} />
      </div>
      <div className="ngb">
        <div className="ntag">{a.series ? `${a.series} · Ep ${a.ep}` : a.kind || a.cat || "Original"}</div>
        <h4>{a.title}</h4>
        <p>{a.dek}</p>
        <div className="nmeta">Cycletowns Originals</div>
      </div>
    </Link>
  );
}
