import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { bannerAlt, bannerSrc } from "@/lib/banners";
import { loadBanners } from "@/lib/banners-data";
import { Photo } from "@/components/Photo";
import { ridePic } from "@/lib/images";
import partnerTypes from "@/data/partner-types.json";
import { EnquiryForm } from "@/components/EnquiryForm";
import { TOWNS } from "@/lib/towns";

export const metadata: Metadata = {
  title: "Partner with Cycletowns",
  description: "Cafés, bike shops, stays, brands, tourism boards and travel partners — reach riders who actually go.",
};

type PType = { id: string; e: string; name: string; pitch: string; now: string[]; next: string[] };
const clean = (s: string) => s.replace(/&amp;/g, "&");

export default async function Partners() {
  const banners = await loadBanners();
  const types = partnerTypes as PType[];
  return (
    <>
      <TopBar />
      <div className="whero" style={{ height: 330 }}>
        <Photo src={bannerSrc(banners, "partners-hero", 1400)} alt={bannerAlt(banners, "partners-hero")} />
        <div className="wov">
          <div className="winner">
            <div className="bc"><Link href="/">Cycletowns</Link> › <b>Partner with us</b></div>
            <div className="awards"><span className="award alt">🤝 Partner with Cycletowns</span></div>
            <h1>Get in front of riders<br />who actually go.</h1>
            <div className="lede" style={{ color: "#fff", opacity: 0.95, maxWidth: 680 }}>
              Riders use Cycletowns to choose where to go and to plan what they do when they get there. Founding partners
              get in early, shape the product, and lock in launch pricing.
            </div>
            <div className="wbar" style={{ marginTop: 14 }}>
              <Link href="/partners/claim" className="lk-coral big">Claim your listing — free</Link>
              <a href="#enquire" className="lk-ghost big" style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.1)" }}>Request a partner pack</a>
            </div>
          </div>
        </div>
      </div>

      <div className="whyband" style={{ background: "linear-gradient(135deg,#012a38,#01536C)" }}>
        <div className="in">
          <div className="kick">What you get, plainly</div>
          <h2>Live today.<br />And what’s next.</h2>
          <div className="sub">
            Everything below is marked either <b>live</b> or <b>next</b>. We’re early, and we’d rather you knew exactly what
            you’re paying for than find out later.
          </div>
          <div className="whygrid whygrid3">
            {[
              ["📊", "Your dashboard", "Live: riders saving your town, its reviews and groups, and your listing’s status. Next: views and enquiries for your own listing."],
              ["✓", "Verified bike-friendly", "Live: a badge on your place card in the town guide, once we’ve checked your listing with you."],
              ["🎟️", "One simple membership", "A flat monthly fee, no agency markup. New reporting is added to your tier as it ships, at the same price."],
            ].map(([e, t, s]) => (
              <div className="whycell" key={t}>
                <div style={{ fontSize: 30 }}>{e}</div>
                <div className="wl" style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 8 }}>{t}</div>
                <div className="ws" style={{ color: "rgba(255,255,255,.78)", fontSize: 13.5, lineHeight: 1.45 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wsec">
        <div className="wh"><div><h2>Built for every partner</h2><span className="wsub">pick your lane</span></div></div>
        <div className="psplit">
          {types.map((p) => (
            <div className="ptype" key={p.id} id={p.id}>
              <div className="pem">{p.e}</div>
              <h3>{clean(p.name)}</h3>
              <p>{clean(p.pitch)}</p>
              <ul className="pnow">{p.now.map((b) => <li key={b}><span className="plive">Live</span>{clean(b)}</li>)}</ul>
              {p.next.length > 0 && <ul className="pnext">{p.next.map((b) => <li key={b}><span className="pnx">Next</span>{clean(b)}</li>)}</ul>}
              <div className="pbtns"><a href={`#enquire`} className="lk-coral">Enquire ›</a></div>
            </div>
          ))}
        </div>
      </div>

      <div className="wsec">
        <div className="wh"><div><h2>Membership tiers</h2><span className="wsub">claim your spot free · become a member for the growth tools</span></div></div>
        <div className="pkg">
          <div className="pkgcard"><div className="pn">Claim</div><div className="pp">Free</div><div className="pd">Claim your business, earn the verified bike-friendly badge and collect honest rider reviews. <Link href="/partners/claim">Claim now ›</Link></div></div>
          <div className="pkgcard feat"><div className="pn">Member</div><div className="pp">A$49<span style={{ fontSize: 13 }}>/mo</span></div><div className="pd">Your dashboard and member offers to riders — with new reporting added as it ships, at the same price.</div></div>
          <div className="pkgcard"><div className="pn">Featured</div><div className="pp">A$290<span style={{ fontSize: 13 }}>/mo</span></div><div className="pd">Everything in Member, plus a richer, photo-led listing shown first in its section of your town guide and marked Featured. It never changes a town’s rank or a review.</div></div>
          <div className="pkgcard"><div className="pn">Brand &amp; Tourism</div><div className="pp">Custom</div><div className="pd">For brands, boards &amp; travel partners — promo codes, regional features and co-op campaigns, scoped with you.</div></div>
        </div>
        <div className="csub" style={{ textAlign: "center", margin: "16px auto 0", maxWidth: 680 }}>
          Founding-partner pricing — locked in for partners who join before public launch. Rankings are never for sale: no tier
          buys a town a better position, and no partner can change or remove a review.
        </div>
      </div>

      <div className="wsec alt2" id="enquire" style={{ paddingBottom: 40 }}>
        <div className="wh"><div><h2>Secure your spot</h2><span className="wsub">tell us about your business — we’ll send a tailored pack within one business day</span></div></div>
        <EnquiryForm types={types.map((p) => ({ id: p.id, name: clean(p.name) }))} towns={TOWNS.map((t) => ({ id: t.id, name: t.name }))} />
      </div>
      <Footer />
    </>
  );
}
