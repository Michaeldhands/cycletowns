import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { NewsGridCard } from "@/components/NewsCards";
import { ridePic } from "@/lib/images";
import { articleSlug } from "@/lib/news";
import { loadArticles } from "@/lib/content";
import { Subscribe } from "@/components/Subscribe";

export const revalidate = 300;

export const metadata: Metadata = { title: "News", description: "Cycletowns Originals — Town in Focus and features from the world of cycle tourism." };

export default async function News() {
  const ARTICLES = await loadArticles();
  const [feat, ...rest] = ARTICLES;
  return (
    <>
      <TopBar />
      <div className="sec2 alt" id="news">
        <div className="in">
          <div className="kick">The hub · Originals</div>
          <div className="h2">Cycletowns News</div>
          <div className="lead">Original features from the Cycletowns team — including the <b>Town in Focus</b> series — plus the stories that matter in cycle tourism.</div>
          <div className="newshero">
            <Link href={`/news/${articleSlug(feat)}`} className="nfeat" style={{ textDecoration: "none", color: "#fff" }}>
              <Photo src={ridePic(feat.img, "feat-0", 900)} />
              <div className="nov">
                <span className="ntag">★ Cycletowns Original{feat.series ? ` · ${feat.series}` : ""}</span>
                <h3>{feat.title}</h3>
                <p>{feat.dek}</p>
                <div className="nmeta">Cycletowns Originals</div>
              </div>
            </Link>
            <div className="nsmall">
              {rest.slice(0, 3).map((a, i) => (
                <Link href={`/news/${articleSlug(a)}`} className="ncard" key={i} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="nimg"><Photo src={ridePic(a.img, "small-" + i, 300)} /></div>
                  <div className="nb">
                    <div className="ntag">★ Original</div>
                    <h4>{a.title}</h4>
                    <div className="nmeta">{a.series ? `${a.series} · Ep ${a.ep}` : a.kind || "Feature"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="nbandhd"><h3>🎬 Cycletowns Originals</h3><span className="wsub">Feature stories &amp; films by our team — including the <b>Town in Focus</b> series</span></div>
          <div className="newsgrid">
            {ARTICLES.map((a, i) => <NewsGridCard key={i} a={a} idx={i} />)}
          </div>
          <div className="wscorebox" style={{ maxWidth: "none", marginTop: 34 }}>
            <h3 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 26, marginBottom: 4 }}>Get it in your inbox.</h3>
            <p className="wsub" style={{ display: "block", marginBottom: 14 }}>
              New town guides, routes worth travelling for, and the odd long read. No fixed schedule — we send it when
              there&rsquo;s something worth your time.
            </p>
            <Subscribe source="news" />
          </div>
          <div className="nbandhd" style={{ marginTop: 34 }}><h3>📣 From @cycletowns</h3><span className="wsub">Follow the journey on Instagram, TikTok &amp; YouTube</span></div>
          <div className="wbar" style={{ marginTop: 8 }}>
            <a className="lk-ghost" href="https://www.instagram.com/cycletowns" target="_blank" rel="noopener">📷 Instagram</a>
            <a className="lk-ghost" href="https://www.youtube.com/@cycletownshq" target="_blank" rel="noopener">▶ YouTube</a>
            <a className="lk-ghost" href="https://www.linkedin.com/company/cycletowns/" target="_blank" rel="noopener">in LinkedIn</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
