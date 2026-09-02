import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Photo } from "@/components/Photo";
import { ridePic } from "@/lib/images";
import partnerTypes from "@/data/partner-types.json";

export const metadata: Metadata = {
  title: "Partner with Cycletowns",
  description: "Cafés, bike shops, stays, brands, tourism boards and travel partners — reach riders who actually go.",
};

type PType = { id: string; e: string; name: string; pitch: string; bullets: string[] };
const clean = (s: string) => s.replace(/&amp;/g, "&");

export default function Partners() {
  const types = partnerTypes as PType[];
  return (
    <>
      <TopBar />
      <div className="whero" style={{ height: 330 }}>
        <Photo src={ridePic("group", "partners-hero", 1400)} />
        <div className="wov">
          <div className="winner">
            <div className="bc"><Link href="/">Cycletowns</Link> › <b>Partner with us</b></div>
            <div className="awards"><span className="award alt">🤝 Partner with Cycletowns</span></div>
            <h1>Get in front of riders<br />who actually go.</h1>
            <div className="lede" style={{ color: "#fff", opacity: 0.95, maxWidth: 680 }}>
              A high-intent, travel-ready cycling audience — by town, discipline and intent. Founding partners get in early,
              shape the product, and lock in launch pricing.
            </div>
            <div className="wbar" style={{ marginTop: 14 }}>
              <a href="#enquire" className="lk-coral big">Request your partner pack</a>
            </div>
          </div>
        </div>
      </div>

      <div className="whyband" style={{ background: "linear-gradient(135deg,#012a38,#01536C)" }}>
        <div className="in">
          <div className="kick">More than a listing</div>
          <h2>The growth tools,<br />in your hands.</h2>
          <div className="sub">
            Membership puts rider intent, a live dashboard and honest rider feedback to work for your business. We bring the
            audience and the intel — you run the show.
          </div>
          <div className="whygrid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            {[
              ["🧠", "Your audience, in focus", "See who rides near you, where they’re headed and what they’re after — anonymised, consented insights you can act on."],
              ["📊", "A live dashboard", "Views, saves, enquiries and redemptions for your listing — scoped to your business, updated as riders use the site."],
              ["🎟️", "One simple membership", "A flat monthly fee unlocks the dashboard, insights and member offers. No agency markup."],
            ].map(([e, t, s]) => (
              <div className="whycell" key={t}>
                <div style={{ fontSize: 30 }}>{e}</div>
                <div className="wl" style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 8 }}>{t}</div>
                <div className="ws" style={{ color: "rgba(255,255,255,.72)" }}>{s}</div>
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
              <ul>{p.bullets.map((b) => <li key={b}>{clean(b)}</li>)}</ul>
              <div className="pbtns"><a href={`#enquire`} className="lk-coral">Enquire ›</a></div>
            </div>
          ))}
        </div>
      </div>

      <div className="wsec">
        <div className="wh"><div><h2>Membership tiers</h2><span className="wsub">claim your spot free · become a member for the growth tools</span></div></div>
        <div className="pkg">
          <div className="pkgcard"><div className="pn">Claim</div><div className="pp">Free</div><div className="pd">Claim your business, earn the verified bike-friendly badge and collect honest rider reviews.</div></div>
          <div className="pkgcard feat"><div className="pn">Member</div><div className="pp">$49<span style={{ fontSize: 13 }}>/mo</span></div><div className="pd">Your live dashboard, audience insights and member offers — the tools to win more riders.</div></div>
          <div className="pkgcard"><div className="pn">Featured</div><div className="pp">$290<span style={{ fontSize: 13 }}>/mo</span></div><div className="pd">Everything in Member, plus priority placement on your town &amp; category pages and a richer, photo-led profile.</div></div>
          <div className="pkgcard"><div className="pn">Brand &amp; Tourism</div><div className="pp">Custom</div><div className="pd">For brands, boards &amp; travel partners — promo codes, deeper audience insights and co-op campaigns with attributed ROI.</div></div>
        </div>
        <div className="csub" style={{ textAlign: "center", margin: "16px auto 0", maxWidth: 680 }}>
          Founding-partner pricing — locked in for partners who join before public launch.
        </div>
      </div>

      <div className="wsec alt2" id="enquire" style={{ paddingBottom: 40 }}>
        <div className="wh"><div><h2>Secure your spot</h2><span className="wsub">tell us about your business — we’ll send a tailored pack within one business day</span></div></div>
        <form name="partner-enquiry" method="POST" action="/thanks" data-netlify="true" netlify-honeypot="website" className="enqform">
          <input type="hidden" name="form-name" value="partner-enquiry" />
          <p style={{ display: "none" }}><label>Leave this empty: <input name="website" /></label></p>
          <div className="field"><label>Business name</label><input name="business" placeholder="e.g. Sixpence Coffee" required /></div>
          <div className="field"><label>Partner type</label>
            <select name="type" defaultValue="cafe">{types.map((p) => <option key={p.id} value={p.id}>{clean(p.name)}</option>)}</select>
          </div>
          <div className="field"><label>Town</label><input name="town" placeholder="e.g. Bright, Victoria" /></div>
          <div className="field"><label>Your name</label><input name="name" placeholder="Full name" required /></div>
          <div className="field"><label>Email</label><input name="email" type="email" placeholder="you@business.com" required /></div>
          <button type="submit" className="btn btn-coral" style={{ borderRadius: 13, width: "100%" }}>Request my partner pack ›</button>
          <div className="wsub" style={{ textAlign: "center", marginTop: 10, fontSize: 12, display: "block" }}>No spam. A real human replies within one business day · partners@cycletowns.com</div>
        </form>
      </div>
      <Footer />
    </>
  );
}
