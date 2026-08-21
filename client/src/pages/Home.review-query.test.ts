// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { reviewMapRegionFromUrl, reviewRailCollapsedFromUrl } from "./Home";

const originalPath = window.location.href;

afterEach(() => window.history.replaceState({}, "", originalPath));

describe("review rail query", () => {
  it("collapses the ledger rail only in an explicit review route", () => {
    window.history.replaceState({}, "", "/?review=home&rail=collapsed");
    expect(reviewRailCollapsedFromUrl()).toBe(true);

    window.history.replaceState({}, "", "/?review=home");
    expect(reviewRailCollapsedFromUrl()).toBe(false);

    window.history.replaceState({}, "", "/?rail=collapsed");
    expect(reviewRailCollapsedFromUrl()).toBe(false);
  });

  it("uses a supported map region only on an explicit review route", () => {
    window.history.replaceState({}, "", "/?review=home&mapRegion=Kii");
    expect(reviewMapRegionFromUrl()).toBe("Kii");

    window.history.replaceState({}, "", "/?review=home&mapRegion=Unknown");
    expect(reviewMapRegionFromUrl()).toBeUndefined();

    window.history.replaceState({}, "", "/?mapRegion=Kii");
    expect(reviewMapRegionFromUrl()).toBeUndefined();
  });
});
