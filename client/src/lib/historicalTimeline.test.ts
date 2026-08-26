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

  it("keeps newly reviewed Suō and Funaokayama context at the evidence-supported regional and month/year precision", () => {
    const ouchiRestoration = HISTORICAL_TIMELINE.find((record) => record.id === "1507-ouchi-yoshitane-restoration");
    expect(ouchiRestoration).toMatchObject({ year: 1507, precision: "year", regionKeys: ["suo"] });
    expect(ouchiRestoration?.month).toBeUndefined();
    expect(ouchiRestoration?.day).toBeUndefined();

    const funaokayama = HISTORICAL_TIMELINE.find((record) => record.id === "1511-funaokayama-kyoto-recapture");
    expect(funaokayama).toMatchObject({ kind: "battle", year: 1511, precision: "month", month: 8, regionKeys: ["yamashiro"] });
    expect(funaokayama?.day).toBeUndefined();
    expect(funaokayama?.source.url).toContain("ja.kyoto.travel");

    const mutsuTsunami = HISTORICAL_TIMELINE.find((record) => record.id === "1585-mutsu-tsunami-famine-report");
    expect(mutsuTsunami).toMatchObject({ kind: "disaster", year: 1585, precision: "exact-date", month: 10, day: 21, regionKeys: ["mutsu"] });
    expect(mutsuTsunami?.source.url).toContain("hi.u-tokyo.ac.jp");
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
    expect(HISTORICAL_YEAR_LEDGER.some((entry) => entry.status === "no-reviewed-event")).toBe(true);
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

  it("covers every canonical province and island with a cited record while preserving exact-date requirements", () => {
    const canonicalKeys = [...SENGOKU_66_PROVINCE_IDS, ...SENGOKU_ISLAND_PROVINCE_IDS];
    expect(canonicalKeys.every((key) => HISTORICAL_TIMELINE.some((record) => record.regionKeys.includes(key)))).toBe(true);
    expect(HISTORICAL_TIMELINE.every((record) => record.source.label.length > 0 && record.source.url.startsWith("https://"))).toBe(true);
    expect(HISTORICAL_TIMELINE.filter((record) => record.precision === "exact-date").every((record) => record.month && record.day)).toBe(true);
  });
});
