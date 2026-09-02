import Link from "next/link";
import { Photo } from "./Photo";
import { ridePic } from "@/lib/images";
import { slugify } from "@/lib/towns";

export type Original = {
  kind?: string;
  series?: string;
  ep?: number;
  town?: string;
  by?: string;
  role?: string;
  img: string;
  date?: string;
  title: string;
  dek: string;
  body: string;
  cat?: string;
};

export function articleSlug(a: Original): string {
  return slugify(a.title);
}

/** Card for a Cycletowns Original (series episode / feature). */
export function OriginalCard({ a, idx }: { a: Original; idx: number }) {
  return (
    <Link href={`/news/${articleSlug(a)}`} className="norig" style={{ textDecoration: "none" }}>
      <div className="norigimg">
        <Photo src={ridePic(a.img, "orig-" + idx, 520)} />
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
        <Photo src={ridePic(a.img, "news-" + idx, 520)} />
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
