/**
 * Power & Rumor Network — read-only projection module (Phase 1)
 *
 * ระบบนี้ไม่เปลี่ยน GameState เดิม และไม่เขียน save ใหม่ใน Phase 1
 * ทุกค่าคำนวณจาก state ที่มีจริง (memories / social / relationships /
 * community / economy / campaign) ผ่าน visibility filter
 *
 * กฎสถาปัตยกรรม (จาก integration contract):
 *  - อ่านอย่างเดียว: ห้ามแก้ reputation/heat โดยตรงจาก UI
 *  - แยกความรู้: player / character / witness / faction / GM คนละชั้น
 *  - ไม่มี global score: ไม่สร้าง reputation หรือ heat ค่าเดียวทั้งโลก
 *  - legacy safe: หาก save เดิมไม่มี worldSystems ให้ใช้ empty projection
 */

import type { GameState } from "./game";

export type Language = "en" | "th";

export type WorldSystemsFlags = {
  powerRumorNetwork: boolean;
  factionReputation: boolean;
  scopedHeat: boolean;
  seasonalPressure: boolean;
  npcMemoryRetrieval: boolean;
};

export const DEFAULT_WORLD_FLAGS: WorldSystemsFlags = {
  powerRumorNetwork: false,
  factionReputation: false,
  scopedHeat: false,
  seasonalPressure: false,
  npcMemoryRetrieval: false,
};

export type FactionStance = {
  factionId: string;
  name: string;
  stance: string;
  visibleReason: string;
};

export type LocalHeat = {
  heatLevel: number; // 0 unseen .. 5 archived
  status: "unseen" | "suspected" | "identified" | "wanted" | "archived";
  label: string;
  reason: string;
};

export type SeasonalPressure = {
  foodStock: number;
  laborAvailability: number;
  routeCondition: number;
  marketPressure: number;
  summary: string;
};

export type RouteChoice = {
  routeId: string;
  status: "open" | "risky" | "closed" | "unknown";
  reason: string;
};

export type RecentRumor = {
  id: string;
  summary: string;
  confidence: number;
  sourceLabel: string;
};

/** Projection ที่ Campaign Command อ่าน (แบบเต็ม) */
export type PowerRumorSummary = {
  provinceId: string;
  currentSeason: "Spring" | "Summer" | "Autumn" | "Winter";
  knownFactions: FactionStance[];
  localRisk: LocalHeat;
  seasonalPressure: SeasonalPressure;
  routeChoices: RouteChoice[];
  recentRumors: RecentRumor[];
};

/** Compact projection ที่หน้า Story/Play แสดงค้างตลอด */
export type StoryCompactProjection = {
  vitals: { wounds: number; focus: number; max: number; critical: boolean };
  attributes: Array<{ id: string; label: string; value: number }>;
  social: { rank: number; honor: number; influence: number; information: number; stain: number };
  time: {
    year: number;
    province: string;
    season: string;
    day: number;
    isHistoricalDate: boolean;
  };
  powerRumor: {
    topFactions: FactionStance[];
    heat: LocalHeat;
    rumorAlert: string | null;
    seasonalSummary: string;
  };
};

const STAT_LABELS: Record<string, { en: string; th: string }> = {
  body: { en: "Body", th: "พลังกาย" },
  hand: { en: "Hand", th: "ฝีมือ" },
  wit: { en: "Wit", th: "ไหวพริบ" },
  mind: { en: "Mind", th: "ปัญญา" },
  heart: { en: "Heart", th: "ใจสู้" },
};

const HEAT_STATUS_LABELS: Record<LocalHeat["status"], { en: string; th: string }> = {
  unseen: { en: "Unseen", th: "ไม่มีใครรู้" },
  suspected: { en: "Suspected", th: "ถูกสงสัย" },
  identified: { en: "Identified", th: "เชื่อมโยงตัวบุคคล" },
  wanted: { en: "Wanted", th: "ถูกตามล่า" },
  archived: { en: "Archived", th: "ปิดคดีแต่ถูกขุดได้" },
};

function label(language: Language, en: string, th: string) {
  return language === "en" ? en : th;
}

/** แปลงความเสี่ยงจาก stain + memory ให้เป็น local heat (0–5) แบบ conservative */
function deriveLocalHeat(game: GameState): LocalHeat {
  const stain = game.character.social.stain;
  const stainMemories = game.memories.filter((m) => m.kind === "stain").length;
  const heatRaw = Math.min(5, stain + Math.max(0, stainMemories - 2));
  const status: LocalHeat["status"] =
    heatRaw <= 0 ? "unseen" : heatRaw <= 1 ? "suspected" : heatRaw <= 3 ? "identified" : heatRaw <= 4 ? "wanted" : "archived";
  const lastStain = [...game.memories].reverse().find((m) => m.kind === "stain");
  return {
    heatLevel: heatRaw,
    status,
    label: HEAT_STATUS_LABELS[status].th,
    reason: lastStain ? lastStain.detail : "ยังไม่มีเหตุการณ์ที่ทิ้งร่องรอย",
  };
}

/** ดึง faction stance จากความสัมพันธ์สาธารณะ + social score */
function deriveFactionStances(game: GameState): FactionStance[] {
  const out: FactionStance[] = [];
  const affinityAvg = (ids: string[]) => {
    const found = game.relationships.filter((r) => ids.includes(r.contactId));
    if (!found.length) return 0;
    return found.reduce((sum, r) => sum + (r.affinity ?? 0), 0) / found.length;
  };
  // กลุ่มที่รู้จักจาก relationships (public projection เท่านั้น)
  const groups: Array<{ factionId: string; name: string; ids: string[] }> = [
    { factionId: "villagers", name: "ชาวบ้าน", ids: ["masakichi"] },
    { factionId: "checkpoint-guard", name: "ผู้คุมด่าน", ids: [] },
    { factionId: "sakai-merchants", name: "สภาพ่อค้า", ids: ["gantaro"] },
    { factionId: "local-warband", name: "กลุ่มนักรบท้องถิ่น", ids: ["tokichi"] },
  ];
  for (const group of groups) {
    const affinity = affinityAvg(group.ids);
    const socialInf = game.character.social.influence;
    let stance = "neutral";
    let reason = "ยังไม่มีเหตุการณ์ร่วมกัน";
    if (group.factionId === "sakai-merchants") {
      if (game.economy.obligations.some((o) => o.status === "open")) {
        stance = "conditional-cooperation";
        reason = "อาจช่วยได้หากชำระหนี้เก่าหรือมีคนรับรอง";
      } else {
        stance = affinity >= 3 ? "cooperative" : "neutral";
        reason = affinity >= 3 ? "เคยร่วมงานและไว้ใจบางส่วน" : "ยังไม่มีเหตุการณ์ร่วมกัน";
      }
    } else if (group.factionId === "checkpoint-guard") {
      const h = deriveLocalHeat(game);
      stance = h.heatLevel >= 3 ? "hostile" : h.heatLevel >= 1 ? "wary" : "neutral";
      reason = h.heatLevel >= 3 ? "พบร่องรอยที่ไม่ตรงกับทะเบียน" : h.heatLevel >= 1 ? "ระวังตัวแต่ยังไม่มีหลักฐาน" : "ยังไม่มีเหตุการณ์";
    } else {
      stance = affinity >= 3 ? "friendly" : affinity <= 1 ? "wary" : "neutral";
      reason = affinity >= 3 ? "ช่วยเหลือกันมาหลายครั้ง" : affinity <= 1 ? "ยังระแวงอยู่" : "ยังไม่ชัดเจน";
    }
    out.push({ factionId: group.factionId, name: group.name, stance, visibleReason: reason });
  }
  return out;
}

/** คำนวณ seasonal pressure จาก community + season (ไม่ลงโทษแบบเดียวทั่วประเทศ) */
function deriveSeasonalPressure(game: GameState): SeasonalPressure {
  const c = game.community;
  const season = game.campaign.season;
  const foodStock = c.food;
  const laborAvailability = c.labor;
  const routeCondition = season === "Summer" ? 2 : season === "Winter" ? 2 : 4; // ฝน/หนาวทางบกช้า
  const marketPressure = c.safety;
  const summaries: Record<typeof season, string> = {
    Spring: "แรงงานถูกดึงเข้าสู่งานนา การระดมพลแข่งกับการเพาะปลูก",
    Summer: "ถนนเสียหายจากฝน การขนส่งทางบกช้าลง แต่เส้นทางน้ำยังใช้ได้",
    Autumn: "มีผลผลิตใหม่ แต่การแย่งชิงและเก็บภาษีเพิ่มขึ้น",
    Winter: "ภูเขาและเส้นทางหิมะเสี่ยงขึ้น การรบและขนส่งแพงขึ้น",
  };
  return { foodStock, laborAvailability, routeCondition, marketPressure, summary: summaries[season] };
}

/** ดึง rumors จาก memories ที่เป็นข่าว/พยาน */
function deriveRumors(game: GameState): RecentRumor[] {
  return game.memories
    .filter((m) => m.kind === "news" || m.kind === "witness")
    .slice(-5)
    .reverse()
    .map((m) => ({
      id: m.id,
      summary: m.title,
      confidence: m.tone === "teal" ? 3 : m.tone === "ochre" ? 2 : 1,
      sourceLabel: m.kind === "witness" ? "พยานในฉาก" : "ข่าวลือ",
    }));
}

/** Projection เต็มสำหรับ Campaign Command */
export function buildPowerRumorSummary(game: GameState, language: Language = "th"): PowerRumorSummary {
  const factions = deriveFactionStances(game);
  const heat = deriveLocalHeat(game);
  const seasonal = deriveSeasonalPressure(game);
  const rumors = deriveRumors(game);
  const routeStatus = game.economy.routeStatus;
  const isRisky = /ซักถาม|ตรวจ|ปิด/.test(routeStatus);
  return {
    provinceId: game.campaign.region.toLowerCase(),
    currentSeason: game.campaign.season,
    knownFactions: factions.map((f) => ({ ...f, stance: label(language, f.stance, f.stance) })),
    localRisk: heat,
    seasonalPressure: seasonal,
    routeChoices: [
      {
        routeId: "overland",
        status: isRisky ? "risky" : "open",
        reason: isRisky ? "ผู้เดินทางถูกซักถาม บางด่านปิด" : "เส้นทางบกเปิดแต่ขึ้นอยู่กับฤดูกาล",
      },
      {
        routeId: "waterway",
        status: seasonal.routeCondition <= 2 && game.campaign.season === "Summer" ? "open" : "open",
        reason: game.campaign.season === "Summer" ? "เส้นทางน้ำยังเปิดและมีค่าจ้างคนเรือสูงขึ้น" : "เส้นทางน้ำเปิดตามปกติ",
      },
    ],
    recentRumors: rumors,
  };
}

/** Projection ย่อสำหรับหน้า Story/Play */
export function buildStoryCompact(game: GameState, language: Language = "th"): StoryCompactProjection {
  const factions = deriveFactionStances(game);
  const heat = deriveLocalHeat(game);
  const rumors = deriveRumors(game);
  const seasonal = deriveSeasonalPressure(game);
  return {
    vitals: {
      wounds: game.character.vitals.wounds,
      focus: game.character.vitals.focus,
      max: 6,
      critical: game.character.vitals.wounds >= 5,
    },
    attributes: Object.entries(game.character.attributes).map(([id, value]) => ({
      id,
      label: STAT_LABELS[id]?.[language] ?? id,
      value,
    })),
    social: { ...game.character.social },
    time: {
      year: game.campaign.year,
      province: game.campaign.region,
      season: game.campaign.season,
      day: game.campaign.day,
      isHistoricalDate: Boolean(game.campaign.historicalDate),
    },
    powerRumor: {
      topFactions: factions.slice(0, 4),
      heat,
      rumorAlert: rumors[0]?.summary ?? null,
      seasonalSummary: seasonal.summary,
    },
  };
}
