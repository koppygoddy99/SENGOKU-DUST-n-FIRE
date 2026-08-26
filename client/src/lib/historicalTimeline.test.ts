import { describe, expect, it } from "vitest";
import { describe, expect, it } from "vitest";
import { HISTORICAL_TIMELINE, HISTORICAL_YEAR_LEDGER, SENGOKU_66_PROVINCE_IDS, SENGOKU_ISLAND_PROVINCE_IDS, historicalBriefForCampaign, timelineForCampaign, timelineRegionKey } from "./historicalTimeline";

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

  it("keeps an offline ledger for every year in the stated range and distinguishes 66 provinces from the two island provinces", () => {
    expect(HISTORICAL_YEAR_LEDGER).toHaveLength(149);
    expect(HISTORICAL_YEAR_LEDGER[0]).toMatchObject({ year: 1467 });
    expect(HISTORICAL_YEAR_LEDGER.at(-1)).toMatchObject({ year: 1615 });
    expect(SENGOKU_66_PROVINCE_IDS).toHaveLength(66);
    expect(SENGOKU_ISLAND_PROVINCE_IDS).toEqual(["iki", "tsushima"]);
    expect(HISTORICAL_YEAR_LEDGER.find((entry) => entry.year === 1500)?.status).toBe("no-reviewed-event");
  });

  it("withholds exact-date events until the campaign supplies a player-confirmed civil date", () => {
    const base = { year: 1570, season: "Summer", region: "Omi", day: 30 };
    const synthetic = historicalBriefForCampaign(base);
    expect(synthetic.dateGate.kind).toBe("synthetic-scene-day");
    expect(synthetic.exactRecords).toEqual([]);
    const confirmed = historicalBriefForCampaign({ ...base, historicalDate: { month: 7, day: 30, source: "player-confirmed" as const } });
    expect(confirmed.dateGate.kind).toBe("player-confirmed");
    expect(confirmed.exactRecords.map((entry) => entry.id)).toContain("1570-anegawa");
  });
});
