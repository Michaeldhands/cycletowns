import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import en, { type Messages } from "./en";

/* Reading a message.

   Usage is deliberately plain:

     import { t } from "@/i18n";
     t("nav.towns")                          -> "Towns"
     t("town.ranked", { rank: 4 })           -> "#4 ranked"

   No provider, no hook, no client bundle cost: while there is one locale this compiles down
   to a lookup in a frozen object, and it works identically in server and client components.
   When a second locale arrives, `messagesFor(locale)` is the only thing that has to learn
   about request context.
*/

const CATALOGUES: Record<Locale, Messages> = { en };

export function messagesFor(locale: Locale = DEFAULT_LOCALE): Messages {
  return CATALOGUES[locale] ?? en;
}

/** Every valid dotted key, derived from the catalogue — a typo is a type error. */
type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;

function lookup(messages: Messages, key: string): string | undefined {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * A message, with {placeholders} filled in.
 *
 * A key that doesn't resolve returns the key itself rather than throwing or rendering empty:
 * a visible `town.missingThing` on the page is a bug you notice in a second, where an empty
 * string is one you ship.
 */
export function t(key: MessageKey, vars?: Record<string, string | number>, locale: Locale = DEFAULT_LOCALE): string {
  const raw = lookup(messagesFor(locale), key);
  if (raw === undefined) {
    if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing message: ${key}`);
    return key;
  }
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

export { en };
export type { Messages };
