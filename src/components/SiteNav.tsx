"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { AccountChip } from "./AccountChip";
import { t, type MessageKey } from "@/i18n";

// Label keys, not labels: the nav is the most-seen text on the site and the first thing a
// translator needs. See @/i18n/en.ts.
const LINKS: [key: MessageKey, href: string][] = [
  ["nav.towns", "/towns"],
  ["nav.rankings", "/rankings"],
  ["nav.routes", "/loop"],
  ["nav.events", "/events"],
  ["nav.news", "/news"],
  ["nav.feed", "/feed"],
  ["nav.shop", "/shop"],
  ["nav.membership", "/membership"],
  ["nav.partners", "/partners"],
];

/** Landing-page style navigation (full links). */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lpnav">
      <div className="in">
        <Link href="/" aria-label={t("nav.home")}>
          <Logo h={30} />
        </Link>
        <div className="links">
          {LINKS.map(([key, href]) => (
            <Link key={href} href={href}>
              {t(key)}
            </Link>
          ))}
        </div>
        <div className="cta">
          <Link href="/saved" className="savepill">
            <span className="hc">♡</span> {t("nav.saved")}
          </Link>
          <AccountChip />
          <Link href="/plan" className="lk-coral navdesk" style={{ textDecoration: "none" }}>
            ✨ {t("nav.planMyTrip")}
          </Link>
          <button className="navtog" onClick={() => setOpen(!open)} aria-label={t("nav.openMenu")}>
            ☰
          </button>
        </div>
      </div>
      <div className={"mobnav" + (open ? " open" : "")} id="mobNav">
        {LINKS.map(([key, href]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {t(key)}
          </Link>
        ))}
        <div className="mobcta">
          <Link href="/login" className="lk-ghost" onClick={() => setOpen(false)}>
            {t("nav.logIn")}
          </Link>
          <Link href="/plan" className="lk-coral" onClick={() => setOpen(false)}>
            ✨ {t("nav.planMyTrip")}
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
        <Link href="/" aria-label={t("nav.home")}>
          <Logo h={26} />
        </Link>
        <div className="cta">
          {back && (
            <Link href={back.href} className="lk-ghost" style={{ textDecoration: "none" }}>
              ‹ {back.label}
            </Link>
          )}
          <Link href="/towns" className="lk-ghost" style={{ textDecoration: "none" }}>
            {t("nav.allTowns")}
          </Link>
          <Link href="/saved" className="savepill">
            <span className="hc">♡</span> {t("nav.saved")}
          </Link>
          <Link href="/shop" className="lk-ghost navdesk" style={{ textDecoration: "none" }}>
            🛍️ {t("nav.shop")}
          </Link>
          <Link href="/membership" className="lk-ghost navdesk" style={{ textDecoration: "none" }}>
            ★ {t("nav.rewards")}
          </Link>
          <AccountChip compact />
          <Link href="/join" className="lk-coral navdesk" style={{ textDecoration: "none" }}>
            {t("nav.getStarted")}
          </Link>
        </div>
      </div>
    </div>
  );
}
