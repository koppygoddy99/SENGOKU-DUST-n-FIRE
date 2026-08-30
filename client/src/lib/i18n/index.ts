/**
 * Public i18n API — the single translation function for keyed UI text.
 *
 * Contract (en-first):
 *  - `en` is always present for every key in the catalog.
 *  - `th` may be "" (not translated yet) → falls back to `en`, never to a blank screen.
 *  - Unknown keys return the keyId itself, so a missing key is loud in review, not a crash.
 *
 * Add new text in `messages.json`, then run `pnpm i18n:extract` (enforced by `pnpm test`).
 */
import { uiMessages, type UiMessageKey } from "./generated/messages";
import type { Language } from "../localization";

export { uiMessages };
export type { UiMessageKey };

export function t(language: Language, key: UiMessageKey): string {
  const entry: { en: string; th: string } | undefined = uiMessages[key];
  if (!entry) return key;
  return language === "th" && entry.th !== "" ? entry.th : entry.en;
}

/** Type-safe lookup when the key is dynamic (returns undefined instead of the keyId). */
export function lookup(language: Language, key: string): string | undefined {
  const entry = (uiMessages as Record<string, { en: string; th: string }>)[key];
  if (!entry) return undefined;
  return language === "th" && entry.th !== "" ? entry.th : entry.en;
}
