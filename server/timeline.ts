import { HISTORICAL_TIMELINE, timelineForCampaign } from "../client/src/lib/historicalTimeline";

export function buildHistoricalTimeline(year: number, region: string) {
  return {
    year,
    region,
    records: timelineForCampaign(year, region),
    boundary: "Read-only reviewed historical context. Records never mutate rolls, missions, player Local Save, or campaign fiction automatically.",
  };
}

export function buildTimelineOperationsFacts() {
  return {
    storage: "source-controlled catalog",
    reviewedYears: Array.from(new Set(HISTORICAL_TIMELINE.map((record) => record.year))).sort((left, right) => left - right),
    recordCount: HISTORICAL_TIMELINE.length,
    sourceCount: new Set(HISTORICAL_TIMELINE.map((record) => record.source.url)).size,
    policy: "Every record retains a source URL and date precision; unreviewed years remain visibly incomplete instead of being filled with invented history.",
  };
}
