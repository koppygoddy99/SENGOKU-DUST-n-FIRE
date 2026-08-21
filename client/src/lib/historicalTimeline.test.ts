import { describe, expect, it } from "vitest";
import { HISTORICAL_TIMELINE, timelineForCampaign, timelineRegionKey } from "./historicalTimeline";

describe("historical timeline boundary", () => {
  it("keeps year-only records year-level when a reviewed source has no month", () => {
    const nijo = HISTORICAL_TIMELINE.find((record) => record.id === "1569-nijo-palace");
    expect(nijo).toMatchObject({ kind: "event", year: 1569, precision: "year" });
    expect(nijo?.month).toBeUndefined();
    expect(nijo?.season).toBeUndefined();
  });

  it("keeps battle and event records distinct while exposing regional relevance without mutating game state", () => {
    const omiRecords = timelineForCampaign(1570, "Omi");
    expect(omiRecords.find((record) => record.id === "1570-anegawa")).toMatchObject({ kind: "battle", relevance: "regional" });
    expect(omiRecords.find((record) => record.id === "1570-ishiyama-war")).toMatchObject({ kind: "event", relevance: "national" });
    expect(omiRecords.every((record) => record.source.url.startsWith("https://"))).toBe(true);
  });

  it("maps the Saika/Sakai campaign context to Izumi without fabricating a territorial rule", () => {
    expect(timelineRegionKey("Sakai / Izumi")).toBe("izumi");
    expect(timelineForCampaign(1569, "Sakai / Izumi").every((record) => record.relevance === "national")).toBe(true);
  });
});
