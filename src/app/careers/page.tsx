import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Careers" };

export default function Careers() {
  return (
    <ProsePage
      kick="Careers"
      title="Build the hub you always wanted."
      lead="We’re a small team of riders and builders making cycle tourism better for everyone. Ride-first, honest by default, built in the open."
    >
      <div className="wprose">
        <p>
          We’re not hiring for specific roles right now, but we always want to hear from great people who ride — engineers,
          community builders, correspondents who can film a town from the saddle, and partnership people who know the cafés,
          shops and stays riders love.
        </p>
        <p>
          <Link href="/contact">Drop us a line ›</Link>
        </p>
      </div>
    </ProsePage>
  );
}
