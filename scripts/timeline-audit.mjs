import {
  HISTORICAL_TIMELINE,
  HISTORICAL_YEAR_LEDGER,
  SENGOKU_66_PROVINCE_IDS,
  SENGOKU_ISLAND_PROVINCE_IDS,
} from "../shared/historicalTimeline.ts";

const canonicalProvinceKeys = [...SENGOKU_66_PROVINCE_IDS, ...SENGOKU_ISLAND_PROVINCE_IDS];
const provinceKeysWithRecords = new Set(HISTORICAL_TIMELINE.flatMap((record) => record.regionKeys));
const countBy = (values) => Object.fromEntries([...values.entries()].sort(([a], [b]) => a.localeCompare(b)));

const kindCounts = new Map();
const scopeCounts = new Map();
const precisionCounts = new Map();
const sourceCounts = new Map();
for (const record of HISTORICAL_TIMELINE) {
  kindCounts.set(record.kind, (kindCounts.get(record.kind) ?? 0) + 1);
  scopeCounts.set(record.scope, (scopeCounts.get(record.scope) ?? 0) + 1);
  precisionCounts.set(record.precision, (precisionCounts.get(record.precision) ?? 0) + 1);
  sourceCounts.set(record.source.label, (sourceCounts.get(record.source.label) ?? 0) + 1);
}

const output = {
  yearRange: [HISTORICAL_YEAR_LEDGER.at(0)?.year, HISTORICAL_YEAR_LEDGER.at(-1)?.year],
  yearlyLedger: {
    totalYears: HISTORICAL_YEAR_LEDGER.length,
    reviewedYears: HISTORICAL_YEAR_LEDGER.filter((entry) => entry.status === "reviewed-events").length,
    blankYears: HISTORICAL_YEAR_LEDGER.filter((entry) => entry.status === "no-reviewed-event").length,
    blankYearList: HISTORICAL_YEAR_LEDGER.filter((entry) => entry.status === "no-reviewed-event").map((entry) => entry.year),
  },
  records: {
    total: HISTORICAL_TIMELINE.length,
    kinds: countBy(kindCounts),
    scopes: countBy(scopeCounts),
    datePrecision: countBy(precisionCounts),
    distinctSources: sourceCounts.size,
  },
  regionalCoverage: {
    canonicalKeys: canonicalProvinceKeys.length,
    keysWithRecords: canonicalProvinceKeys.filter((key) => provinceKeysWithRecords.has(key)).length,
    missingKeys: canonicalProvinceKeys.filter((key) => !provinceKeysWithRecords.has(key)),
  },
  sources: countBy(sourceCounts),
};

console.log(JSON.stringify(output, null, 2));
