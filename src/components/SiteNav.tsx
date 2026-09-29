"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { AccountChip } from "./AccountChip";
import { t, type MessageKey } from "@/i18n";

/* One navigation for the whole site.

   It used to be two: a nine-link bar on the home page and a different set of pill buttons on
   every inner page (with Shop and Rewards but no Rankings, Events or News). On a phone the inner
   one stacked seven buttons into a 185px block that covered the town name.

   Five primary links, because those are the five things a first-time visitor came for. Pages
   that are still filling up (feed, shop, offers) and the business-facing ones live in the phone
   menu and the footer, where people who want them will find them. */

const PRIMARY: [key: MessageKey, href: string][] = [
  ["nav.towns", "/towns"],
  ["nav.rankings", "/rankings"],
  ["nav.routes", "/loop"],
  ["nav.events", "/events"],
  ["nav.news", "/news"],
];

const SECONDARY: [key: MessageKey, href: string][] = [
  ["nav.planTrip", "/plan"],
  ["nav.feed", "/feed"],
  ["nav.membership", "/membership"],
  ["nav.shop", "/shop"],
  ["nav.partners", "/partners"],
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="lpnav">
      <div className="in">
        <Link href="/" aria-label={t("nav.home")}>
          <Logo h={30} />
        </Link>
        <nav className="links" aria-label="Main">
          {PRIMARY.map(([key, href]) => (
            <Link key={href} href={href}>
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="cta">
          <Link href="/saved" className="savepill" aria-label={t("nav.saved")}>
            <span className="hc">♡</span>
            <span className="navdesk">{t("nav.saved")}</span>
          </Link>
          <AccountChip />
          <Link href="/plan" className="lk-coral navdesk">
            ✨ {t("nav.planMyTrip")}
          </Link>
          <button className="navtog" onClick={() => setOpen(!open)} aria-label={t("nav.openMenu")} aria-expanded={open}>
            ☰
          </button>
        </div>
      </div>
      <div className={"mobnav" + (open ? " open" : "")} id="mobNav">
        {PRIMARY.map(([key, href]) => (
          <Link key={href} href={href} onClick={close}>
            {t(key)}
          </Link>
        ))}
        <div className="mobsec">More</div>
        {SECONDARY.map(([key, href]) => (
          <Link key={href} href={href} onClick={close} className="mobsm">
            {t(key)}
          </Link>
        ))}
        <div className="mobcta">
          <Link href="/login" className="lk-ghost" onClick={close}>
            {t("nav.logIn")}
          </Link>
          <Link href="/plan" className="lk-coral" onClick={close}>
            ✨ {t("nav.planMyTrip")}
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Inner pages used to have their own compact bar. They now share the one navigation, so the
 * site reads the same wherever you land. `back` is accepted for compatibility and ignored —
 * breadcrumbs on the page do that job.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TopBar(_props: { back?: { href: string; label: string } } = {}) {
  return <SiteNav />;
}
