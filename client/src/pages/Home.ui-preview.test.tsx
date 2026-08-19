import { describe, expect, it } from "vitest";
import { openLocalPreview, shouldFetchProfileCredits, shouldUseLocalRules } from "./Home";

describe("UI preview mode", () => {
  it("keeps authenticated users on the local rules path while UI preview is active", () => {
    expect(shouldUseLocalRules(true, true)).toBe(true);
    expect(shouldUseLocalRules(true, false)).toBe(true);
  });

  it("allows the live AI path only when UI preview is off and the user is authenticated", () => {
    expect(shouldUseLocalRules(false, false)).toBe(true);
    expect(shouldUseLocalRules(false, true)).toBe(false);
  });

  it("does not fetch account credits while the UI preview is active", () => {
    expect(shouldFetchProfileCredits(true, true)).toBe(false);
    expect(shouldFetchProfileCredits(true, false)).toBe(false);
    expect(shouldFetchProfileCredits(false, true)).toBe(true);
  });

  it("opens Play when the user chooses Try UI Preview", () => {
    const opened: string[] = [];
    openLocalPreview((page) => opened.push(page));
    expect(opened).toEqual(["play"]);
  });
});
