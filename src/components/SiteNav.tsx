"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { AccountChip } from "./AccountChip";

const LINKS: [string, string][] = [
  ["Towns", "/towns"],
  ["Rankings", "/rankings"],
  ["Routes", "/loop"],
  ["News", "/news"],
  ["Feed", "/feed"],
  ["Shop", "/shop"],
  ["Membership", "/membership"],
  ["Partners", "/partners"],
];

/** Landing-page style navigation (full links). */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lpnav">
      <div className="in">
        <Link href="/" aria-label="Cycletowns home">
          <Logo h={30} />
        </Link>
        <div className="links">
          {LINKS.map(([l, href]) => (
            <Link key={href} href={href}>
              {l}
            </Link>
          ))}
        </div>
        <div className="cta">
          <Link href="/saved" className="savepill">
            <span className="hc">♡</span> Saved
          </Link>
          <AccountChip />
          <Link href="/plan" className="lk-coral navdesk" style={{ textDecoration: "none" }}>
            ✨ Plan my trip
          </Link>
          <button className="navtog" onClick={() => setOpen(!open)} aria-label="Open menu">
            ☰
          </button>
        </div>
      </div>
      <div className={"mobnav" + (open ? " open" : "")} id="mobNav">
        {LINKS.map(([l, href]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {l}
          </Link>
        ))}
        <div className="mobcta">
          <Link href="/login" className="lk-ghost" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link href="/plan" className="lk-coral" onClick={() => setOpen(false)}>
            ✨ Plan my trip
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Compact top bar used on inner pages (town guides, rankings, news…). */
export function TopBar({ back }: { back?: { href: string; label: string } }) {
  return (
    <div className="wtop">
      <div className="in">
        <Link href="/" aria-label="Cycletowns home">
          <Logo h={26} />
        </Link>
        <div className="cta">
          {back && (
            <Link href={back.href} className="lk-ghost" style={{ textDecoration: "none" }}>
              ‹ {back.label}
            </Link>
          )}
          <Link href="/towns" className="lk-ghost" style={{ textDecoration: "none" }}>
            All towns
          </Link>
          <Link href="/saved" className="savepill">
            <span className="hc">♡</span> Saved
          </Link>
          <Link href="/shop" className="lk-ghost navdesk" style={{ textDecoration: "none" }}>
            🛍️ Shop
          </Link>
          <Link href="/membership" className="lk-ghost navdesk" style={{ textDecoration: "none" }}>
            ★ Rewards
          </Link>
          <AccountChip compact />
          <Link href="/join" className="lk-coral navdesk" style={{ textDecoration: "none" }}>
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}
