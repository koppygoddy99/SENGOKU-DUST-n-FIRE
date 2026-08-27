export type StarterProfileInput = { eraId: string; templateId: string; seed: number };

export type ServerStarterProfile = {
  id: string;
  year: number;
  region: string;
  location: string;
  origin: string;
  variation: 1 | 2 | 3;
};

const ERA_YEARS: Record<string, readonly number[]> = {
  "fractured-realm": [1467, 1477, 1488],
  "rival-houses": [1493, 1507, 1511],
  "rising-warlords": [1531, 1543, 1548],
  "shifting-frontiers": [1549, 1555, 1561],
  "unification-campaigns": [1565, 1569, 1575, 1580],
  "late-unification": [1583, 1588, 1590, 1595],
  "new-order": [1600, 1604, 1610, 1615],
};

const ERA_TEMPLATE_IDS: Record<string, readonly string[]> = {
  "fractured-realm": ["village_scribe", "jizamurai", "warrior_monk", "ronin"],
  "rival-houses": ["jizamurai", "ronin", "village_scribe", "shinobi"],
  "rising-warlords": ["jizamurai", "warrior_monk", "shinobi", "daimyo_attendant"],
  "shifting-frontiers": ["arms_craftsworker", "sakai_boat_crew", "shinobi", "mounted_samurai", "ronin"],
  "unification-campaigns": ["daimyo_attendant", "mounted_samurai", "arms_craftsworker", "sakai_boat_crew", "warrior_monk"],
  "late-unification": ["daimyo_attendant", "sakai_boat_crew", "coastal_sailor", "arms_craftsworker", "ronin"],
  "new-order": ["daimyo_attendant", "ronin", "village_scribe", "coastal_sailor"],
};

const ORIGIN_POOLS: Record<string, { start: string; regions: readonly string[] }> = {
  village_scribe: { start: "มิกาวะหรือชินาโนะ", regions: ["Mikawa", "Shinano"] },
  jizamurai: { start: "โอมิหรือโอวาริ", regions: ["Omi", "Owari"] },
  ronin: { start: "ยามะชิโระหรือเซตสึ", regions: ["Yamashiro", "Settsu"] },
  sakai_boat_crew: { start: "ซาไก แคว้นอิซุมิ", regions: ["Sakai", "Izumi", "Settsu"] },
  arms_craftsworker: { start: "คุนิโทโมะหรือคิอิ", regions: ["Omi", "Kii"] },
  shinobi: { start: "อิกะหรือโคงะ", regions: ["Iga", "Koga"] },
  warrior_monk: { start: "คากะ ยามาโตะ หรือคิอิ", regions: ["Kaga", "Yamato", "Kii"] },
  daimyo_attendant: { start: "อะซุจิ แคว้นโอมิ", regions: ["Omi"] },
  mounted_samurai: { start: "มุซาชิหรือชินาโนะ", regions: ["Musashi", "Shinano"] },
  coastal_sailor: { start: "อิโยะหรือชิมะ", regions: ["Iyo", "Shima"] },
};

export function isStarterProfileSelectionValid(eraId: string, templateId: string) {
  return ERA_TEMPLATE_IDS[eraId]?.includes(templateId) && Boolean(ORIGIN_POOLS[templateId]);
}

export function selectServerStarterProfile(input: StarterProfileInput): ServerStarterProfile {
  const seed = Math.abs(Math.trunc(input.seed)) || 1;
  const years = ERA_YEARS[input.eraId] ?? ERA_YEARS["unification-campaigns"];
  const pool = ORIGIN_POOLS[input.templateId] ?? ORIGIN_POOLS.ronin;
  const variation = ((seed % 3) + 1) as 1 | 2 | 3;
  const region = pool.regions[seed % pool.regions.length];
  const origin = variation === 1 ? pool.start : variation === 2 ? `${pool.start} · เส้นทางงานของครอบครัว` : `${pool.start} · คนในชุมชนยังจำชื่อเจ้าได้`;
  return { id: `${input.eraId}-${input.templateId}-${variation}`, year: years[seed % years.length], variation, region, location: pool.start, origin };
}
