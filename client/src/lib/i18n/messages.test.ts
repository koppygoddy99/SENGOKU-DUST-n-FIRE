import { describe, expect, it } from "vitest";
import { uiMessages } from "./generated/messages";
import { lookup, t } from "./index";
import type { Language } from "../localization";

describe("i18n catalog invariants", () => {
  it("has a non-empty English value for every key (en is REQUIRED)", () => {
    for (const [key, entry] of Object.entries(uiMessages)) {
      expect(entry.en.trim().length, `key "${key}" must have non-empty en`).toBeGreaterThan(0);
    }
  });

  it("never renders a blank string in th — empty th falls back to en", () => {
    for (const [key, entry] of Object.entries(uiMessages)) {
      if (entry.th === "") {
        expect(t("th", key as keyof typeof uiMessages)).toBe(entry.en);
      }
    }
  });

  it("t() returns the th value when translated and en when the language is en", () => {
    expect(t("en", "page.label")).toBe("Page");
    expect(t("th", "page.label")).toBe("หน้า");
  });

  it("returns the keyId itself for unknown keys (loud, not crash)", () => {
    expect(t("en", "not.a.key" as never)).toBe("not.a.key");
    expect(lookup("en", "not.a.key")).toBeUndefined();
  });

  it("resolves every committed locale JSON in lockstep with the catalog", () => {
    // Guarded end-to-end by `pnpm i18n:check` (wired into pnpm test); this asserts the runtime module shape.
    const keys = Object.keys(uiMessages);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(lookup("en", key)).toBe(uiMessages[key as keyof typeof uiMessages].en);
    }
  });
});
