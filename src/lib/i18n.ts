/* Locales.

   The site publishes English only. Everything here exists so that adding a language later is
   configuration and translation rather than a refactor — and so the decisions that are painful
   to reverse (where strings live, how URLs are shaped, what the canonical is) are made once,
   now, while the codebase is small.

   Adding a language: see I18N.md. It is deliberately a short document.
*/

export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Locales other than the default. Empty today; drives the language switcher and hreflang. */
export const ALT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
export const isMultilingual = () => ALT_LOCALES.length > 0;

/** Human names, in the language itself — never translate a language name. */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English" };

/** The BCP-47 tag for <html lang>. Kept separate from our own keys in case they diverge. */
export const HTML_LANG: Record<Locale, string> = { en: "en-AU" };

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

/**
 * The URL a page has in a given locale.
 * Default locale keeps the bare path — /towns/bright, never /en/towns/bright — so the
 * existing URLs, and anything already linking to them, never move.
 */
export function localePath(path: string, locale: Locale = DEFAULT_LOCALE): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? p : `/${locale}${p}`;
}

/**
 * Next.js `alternates` for a page's metadata: the canonical, plus one hreflang per locale.
 * While English is alone this emits a canonical and nothing else, which is exactly right —
 * an hreflang set of one is noise.
 */
export function alternatesFor(path: string): {
  canonical: string;
  languages?: Record<string, string>;
} {
  const canonical = localePath(path);
  if (!isMultilingual()) return { canonical };
  const languages: Record<string, string> = { "x-default": canonical };
  for (const l of LOCALES) languages[HTML_LANG[l]] = localePath(path, l);
  return { canonical, languages };
}
