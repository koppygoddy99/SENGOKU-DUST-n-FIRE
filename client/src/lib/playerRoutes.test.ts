import { describe, expect, it } from "vitest";
import { REVIEW_SCREEN_MANIFEST, reviewPageFromSearch, reviewScreenFor } from "./playerRoutes";

describe("review screen manifest", () => {
  it("defines the complete 17-screen review set with unique routes, titles, seeds, and file names", () => {
    expect(REVIEW_SCREEN_MANIFEST).toHaveLength(17);
    expect(new Set(REVIEW_SCREEN_MANIFEST.map((screen) => screen.reviewQuery)).size).toBe(17);
    expect(new Set(REVIEW_SCREEN_MANIFEST.map((screen) => screen.screenshotFile)).size).toBe(17);
    expect(new Set(REVIEW_SCREEN_MANIFEST.map((screen) => screen.pageTitle)).size).toBe(17);
    expect(new Set(REVIEW_SCREEN_MANIFEST.map((screen) => screen.seed)).size).toBe(17);
    expect(REVIEW_SCREEN_MANIFEST.every((screen) => screen.screenshotFile.match(/^\d{2}-.+\.png$/))).toBe(true);
  });

  it("resolves review queries from one authoritative source and defaults invalid routes to Campaign Command", () => {
    expect(reviewPageFromSearch("?review=play")).toBe("play");
    expect(reviewPageFromSearch("?review=unknown")).toBe("home");
    expect(reviewScreenFor("home")).toMatchObject({
      pageTitle: "Campaign Command",
      screenshotFile: "03-campaign-command.png",
      seed: "saika-command",
    });
  });
});
