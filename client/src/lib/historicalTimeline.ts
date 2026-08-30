/**
 * Compatibility re-export. The canonical implementation now lives in
 * `shared/historicalTimeline` so server code can import it without crossing
 * the client/server boundary. This file remains so any existing
 * `@/lib/historicalTimeline` import paths keep resolving to the same data.
 */
export type { Season, TimelineKind, DatePrecision, TimelineCopy, HistoricalScope, HistoricalTimelineRecord, HistoricalYearLedger, SengokuProvinceId } from "@shared/historicalTimeline";
export { SENGOKU_66_PROVINCE_IDS, SENGOKU_ISLAND_PROVINCE_IDS, HISTORICAL_TIMELINE, HISTORICAL_YEAR_LEDGER, timelineRegionKey, timelineForCampaign, historicalYearLedger, historicalBriefForCampaign } from "@shared/historicalTimeline";