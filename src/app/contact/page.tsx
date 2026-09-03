import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { NetlifyForm } from "@/components/NetlifyForm";

export const metadata: Metadata = { title: "Contact" };

const CARDS: [string, string, string][] = [
  ["💬", "General", "hello@cycletowns.com"],
  ["🤝", "Partnerships", "partners@cycletowns.com"],
  ["📰", "Press", "press@cycletowns.com"],
  ["🛟", "Rider support", "support@cycletowns.com"],
];

export default function Contact() {
  return (
    <ProsePage
      kick="Contact"
      title="Get in touch."
      lead="Whether you ride, run a business riders love, or want to write about us — we’d love to hear from you."
    >
      <div style={{ marginTop: 10 }}>
        {CARDS.map(([e, n, m]) => (
          <div className="corole" key={n}>
            <div>
              <div className="con">{e} {n}</div>
              <div className="cod">{m}</div>
            </div>
            <a className="lk-teal" href={`mailto:${m}`}>Email us</a>
          </div>
        ))}
      </div>
      <NetlifyForm name="contact" className="wprose" style={{ marginTop: 22 }}>
        <h3>Or send a message</h3>
        <div className="field"><label>Your name</label><input name="name" required /></div>
        <div className="field"><label>Email</label><input type="email" name="email" required /></div>
        <div className="field"><label>Message</label><textarea name="message" rows={5} required /></div>
        <button type="submit" className="lk-coral big">Send</button>
      </NetlifyForm>
      <div className="wprose" style={{ marginTop: 8 }}>
        <p>
          Business enquiry? The fastest route is the <Link href="/partners">partner page ›</Link>. Follow the journey on{" "}
          <a href="https://www.instagram.com/cycletowns" target="_blank" rel="noopener">Instagram</a>,{" "}
          <a href="https://www.youtube.com/@cycletownshq" target="_blank" rel="noopener">YouTube</a> and{" "}
          <a href="https://www.linkedin.com/company/cycletowns/" target="_blank" rel="noopener">LinkedIn</a>.
        </p>
        <p>
          <b>Cycletowns</b> is a Sport2040 project (ABN 73 680 648 855).<br />
          Level 15, 461 Bourke Street, Melbourne VIC 3000, Australia.
        </p>
      </div>
    </ProsePage>
  );
}
