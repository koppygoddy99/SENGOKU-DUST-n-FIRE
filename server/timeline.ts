import { HISTORICAL_TIMELINE, HISTORICAL_YEAR_LEDGER, SENGOKU_66_PROVINCE_IDS, SENGOKU_ISLAND_PROVINCE_IDS, historicalYearLedger, timelineForCampaign } from "../client/src/lib/historicalTimeline";

export function buildHistoricalTimeline(year: number, region: string) {
  return {
    year,
    region,
    records: timelineForCampaign(year, region),
    ledger: historicalYearLedger(year),
    boundary: "Read-only reviewed historical context. Records never mutate rolls, missions, player Local Save, or campaign fiction automatically.",
  };
}

export function buildTimelineOperationsFacts() {
  return {
    storage: "source-controlled catalog",
    reviewedYears: HISTORICAL_YEAR_LEDGER.filter((entry) => entry.status === "reviewed-events").map((entry) => entry.year),
    ledgerRange: { first: HISTORICAL_YEAR_LEDGER[0]?.year, last: HISTORICAL_YEAR_LEDGER.at(-1)?.year, count: HISTORICAL_YEAR_LEDGER.length },
    coverageSet: { provinces: SENGOKU_66_PROVINCE_IDS, islandProvinces: SENGOKU_ISLAND_PROVINCE_IDS },
    recordCount: HISTORICAL_TIMELINE.length,
    sourceCount: new Set(HISTORICAL_TIMELINE.map((record) => record.source.url)).size,
    policy: "Every record retains a source URL and date precision; unreviewed years remain visibly incomplete instead of being filled with invented history.",
  };
}
