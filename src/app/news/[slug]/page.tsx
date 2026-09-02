import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { TownCard } from "@/components/Cards";
import { NewsGridCard } from "@/components/NewsCards";
import { ridePic } from "@/lib/images";
import { ARTICLES, articleSlug, getArticle } from "@/lib/news";
import { getTown } from "@/lib/towns";

export const dynamicParams = false;
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: articleSlug(a) }));
}
export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  return a ? { title: a.title, description: a.dek } : {};
}

export default async function ArticlePage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const idx = ARTICLES.indexOf(a);
  const town = a.town ? getTown(a.town) : undefined;
  const more = ARTICLES.filter((x) => x !== a).slice(0, 3);
  return (
    <>
      <TopBar back={{ href: "/news", label: "News" }} />
      <div className="whero" style={{ height: 360 }}>
        <Photo src={ridePic(a.img, "art-" + idx, 1400)} />
        <div className="wov">
          <div className="winner">
            <div className="bc"><Link href="/">Cycletowns</Link> › <Link href="/news">News</Link> › <b>{a.series || a.kind || "Feature"}</b></div>
            <div className="awards"><span className="award alt">★ Cycletowns Original{a.series ? ` · ${a.series} · Ep ${a.ep}` : ""}</span></div>
            <h1 style={{ fontSize: 46 }}>{a.title}</h1>
          </div>
        </div>
      </div>
      <div className="wsec">
        <div className="wprose" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 18, color: "var(--ink)" }}>{a.dek}</p>
          <div dangerouslySetInnerHTML={{ __html: a.body }} />
        </div>
        {town && (
          <div style={{ marginTop: 24, maxWidth: 300 }}>
            <div className="kick" style={{ textAlign: "left", marginBottom: 8 }}>Featured town</div>
            <TownCard t={town} />
          </div>
        )}
      </div>
      <div className="wsec" style={{ paddingBottom: 40 }}>
        <div className="wh"><div><h2>More from Cycletowns</h2></div></div>
        <div className="newsgrid">{more.map((x, i) => <NewsGridCard key={i} a={x} idx={ARTICLES.indexOf(x)} />)}</div>
      </div>
      <Footer />
    </>
  );
}
