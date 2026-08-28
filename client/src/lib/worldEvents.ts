/**
 * Power & Rumor Network — Phase 3: Event-driven reputation & heat
 *
 * ระบบนี้เริ่ม "จำผลลัพธ์" จริงๆ:
 *  - ทุกครั้งที่ผู้เล่นทอยเสร็จ หรือซื้อของ หรือสร้างหนี้ ระบบจะบันทึกเป็น "เหตุการณ์"
 *  - ชื่อเสียงต่อฝ่าย / ความเสี่ยงระดับพื้นที่ จะเปลี่ยนตามเหตุการณ์นั้น
 *    (ไม่ใช่เดาตาม stain ทั่วไปเหมือน Phase 1)
 *
 * กฎสำคัญ (จากรายงานวิจัย + prompt):
 *  - ชื่อเสียงแยกตามฝ่าย ไม่มีคะแนนเดียวสำหรับทั้งโลก
 *  - ความเสี่ยงแยกตามพื้นที่/ด่าน/ฝ่าย
 *  - ทุกการเปลี่ยนต้องมีเหตุการณ์อ้างอิงได้ (sourceEventIds)
 *  - อ่านอย่างเดียวจาก state เดิม ไม่สร้าง runtime ใหม่
 */

import type { GameState, RollRecord } from "./game";
import type { Language } from "./localization";

export type WorldEventKind =
  | "roll_resolved"
  | "market_exchanged"
  | "debt_created"
  | "debt_settled"
  | "favor_called_in"
  | "witness_created"
  | "rumor_created"
  | "reputation_changed"
  | "heat_changed"
  | "travel_delayed";

export type WorldEvent = {
  id: string;
  kind: WorldEventKind;
  actorId: "player";
  provinceId: string;
  locationId: string;
  factionIds: string[];
  witnesses: string[];
  tick: number;
  inGameDay: number;
  detail: string;
  /** ผลกระทบที่คำนวณได้: เปลี่ยนชื่อเสียง/ความเสี่ยงอย่างไร */
  effects: {
    reputation?: Array<{ factionId: string; delta: number; reason: string }>;
    heat?: number; // + บวกเพิ่มความเสี่ยง, - ลด
    heatReason?: string;
  };
  sourceEventIds: string[];
};

export type FactionStanceValue =
  | "allies"
  | "friendly"
  | "helpful"
  | "cooperative"
  | "neutral"
  | "conditional-cooperation"
  | "wary"
  | "interfering"
  | "hostile"
  | "war";

export type FactionReputation = {
  factionId: string;
  name: string;
  score: number; // -3 .. +3 (จากรายงานวิจัย Blades-in-the-Dark แนวทาง)
  stance: FactionStanceValue;
  trend: "improving" | "steady" | "worsening";
  lastChangedBy?: string;
  reasons: string[];
};

export type FactionHeat = {
  provinceId: string;
  locationId: string;
  level: number; // 0 unseen .. 5 wanted/archived
  status: "unseen" | "suspected" | "identified" | "wanted" | "archived";
  reasons: string[];
};

export type PowerRumorState = {
  schemaVersion: 1;
  factions: FactionReputation[];
  heatTracks: FactionHeat[];
  events: WorldEvent[];
};

export const FACTION_NAMES: Record<string, string> = {
  villagers: "ชาวบ้าน",
  "checkpoint-guard": "ผู้คุมด่าน",
  "sakai-merchants": "สภาพ่อค้า",
  "local-warband": "กลุ่มนักรบท้องถิ่น",
  "temple-shrine": "วัดหรือศาลเจ้า",
};

/** คะแนนพื้นฐานของแต่ละ stance (ลบ = ไม่ไว้ใจ, บวก = เชื่อใจ) — ใช้ตั้งค่าเริ่มต้นจากภูมิภาค */
const STANCE_SCORE: Record<FactionStanceValue, number> = {
  allies: 3,
  friendly: 2,
  helpful: 1,
  cooperative: 0.5,
  neutral: 0,
  "conditional-cooperation": -0.5,
  wary: -1,
  interfering: -2,
  hostile: -3,
  war: -3,
};

/** แปลง stance → คะแนนเริ่มต้น (-3..+3) */
export function stanceScore(stance: FactionStanceValue): number {
  return STANCE_SCORE[stance] ?? 0;
}

/** แปลงระดับ heat (0..5) → status ตามเกณฑ์ระบบ */
export function heatStatus(level: number): FactionHeat["status"] {
  const l = Math.max(0, Math.min(5, level));
  return l <= 0 ? "unseen" : l <= 1 ? "suspected" : l <= 3 ? "identified" : l <= 4 ? "wanted" : "archived";
}

function stanceFromScore(score: number): FactionReputation["stance"] {
  if (score >= 3) return "allies";
  if (score >= 1.5) return "friendly";
  if (score >= 0.5) return "helpful";
  if (score > -0.5) return "neutral";
  if (score > -1.5) return "interfering";
  if (score > -3) return "hostile";
  return "war";
}

function clampScore(value: number): number {
  return Math.max(-3, Math.min(3, value));
}

/** สร้าง state ว่างเริ่มต้น (legacy-safe) */
export function emptyPowerRumorState(): PowerRumorState {
  return { schemaVersion: 1, factions: [], heatTracks: [], events: [] };
}

/** ดึงหรือสร้าง reputation ของฝ่าย */
function getOrCreateFaction(state: PowerRumorState, factionId: string): FactionReputation {
  const found = state.factions.find((f) => f.factionId === factionId);
  if (found) return found;
  const created: FactionReputation = {
    factionId,
    name: FACTION_NAMES[factionId] ?? factionId,
    score: 0,
    stance: "neutral",
    trend: "steady",
    reasons: [],
  };
  state.factions.push(created);
  return created;
}

/** คำนวณผลจากเหตุการณ์หนึ่ง แล้วเขียนลง state (mutates a copy) */
export function applyWorldEvent(state: PowerRumorState, event: WorldEvent): PowerRumorState {
  const next: PowerRumorState = {
    ...state,
    factions: state.factions.map((f) => ({ ...f })),
    heatTracks: state.heatTracks.map((h) => ({ ...h })),
    events: [...state.events, event],
  };

  // เปลี่ยนชื่อเสียงต่อฝ่าย
  if (event.effects.reputation) {
    for (const change of event.effects.reputation) {
      const faction = getOrCreateFaction(next, change.factionId);
      const before = faction.score;
      faction.score = clampScore(before + change.delta);
      faction.stance = stanceFromScore(faction.score);
      faction.trend = change.delta > 0 ? "improving" : change.delta < 0 ? "worsening" : "steady";
      faction.lastChangedBy = event.id;
      faction.reasons = [change.reason, ...faction.reasons].slice(0, 4);
    }
  }

  // เปลี่ยนความเสี่ยงระดับพื้นที่
  if (event.effects.heat !== undefined) {
    const level = Math.max(0, Math.min(5, (next.heatTracks.find((h) => h.provinceId === event.provinceId && h.locationId === event.locationId)?.level ?? 0) + event.effects.heat));
    const status: FactionHeat["status"] =
      level <= 0 ? "unseen" : level <= 1 ? "suspected" : level <= 3 ? "identified" : level <= 4 ? "wanted" : "archived";
    const existing = next.heatTracks.find((h) => h.provinceId === event.provinceId && h.locationId === event.locationId);
    const reason = event.effects.heatReason ?? event.detail;
    if (existing) {
      existing.level = level;
      existing.status = status;
      existing.reasons = [reason, ...existing.reasons].slice(0, 4);
    } else {
      next.heatTracks.push({ provinceId: event.provinceId, locationId: event.locationId, level, status, reasons: [reason] });
    }
  }

  return next;
}

/** สร้าง event จากผลทอย (เรียกใน applyRoll) */
export function eventFromRoll(game: GameState, record: RollRecord): WorldEvent {
  const provinceId = game.campaign.region.toLowerCase();
  const locationId = game.currentScene.location;
  const failure = record.outcome === "failure_with_consequence";
  const partial = record.outcome === "partial_success";
  const heat = failure ? 1 : 0;
  const reputation = [] as Array<{ factionId: string; delta: number; reason: string }>;

  if (failure) {
    // ล้มเหลว → ผู้คุมด่านระแวง, ชาวบ้านอาจสงสารแต่ไม่ไว้ใจ
    reputation.push({ factionId: "checkpoint-guard", delta: -1, reason: `ล้มเหลวในเหตุการณ์: ${record.consequence ?? record.summary}` });
    if (game.economy.obligations.some((o) => o.status === "open")) {
      reputation.push({ factionId: "sakai-merchants", delta: -1, reason: "มีหนี้ค้างและงานล้มเหลว" });
    }
  }
  if (partial) {
    reputation.push({ factionId: "villagers", delta: 1, reason: "ช่วยเหลือได้บางส่วนโดยไม่สร้างความเดือดร้อน" });
  }
  if (record.outcome === "success_with_cost" || record.outcome === "decisive_success") {
    reputation.push({ factionId: "villagers", delta: 1, reason: `สำเร็จ: ${record.summary}` });
  }

  return {
    id: `evt-roll-${record.id}`,
    kind: "roll_resolved",
    actorId: "player",
    provinceId,
    locationId,
    factionIds: reputation.map((r) => r.factionId),
    witnesses: record.witnesses ?? [],
    tick: record.tick,
    inGameDay: game.campaign.day,
    detail: record.consequence ?? record.summary ?? "การกระทำจบลง",
    effects: {
      reputation: reputation.length ? reputation : undefined,
      heat: heat || undefined,
      heatReason: heat ? "การกระทำล้มเหลวทิ้งร่องรอย" : undefined,
    },
    sourceEventIds: [],
  };
}

/** สร้าง event จากการสร้างหนี้ (เรียกใน buyMarketOffer เมื่อค้างหนี้) */
export function eventFromDebt(game: GameState, transactionId: string, counterpart: string): WorldEvent {
  const provinceId = game.campaign.region.toLowerCase();
  const locationId = game.currentScene.location;
  return {
    id: `evt-debt-${transactionId}`,
    kind: "debt_created",
    actorId: "player",
    provinceId,
    locationId,
    factionIds: ["sakai-merchants"],
    witnesses: [counterpart],
    tick: game.tick,
    inGameDay: game.campaign.day,
    detail: `สร้างหนี้กับ ${counterpart}`,
    effects: {
      reputation: [{ factionId: "sakai-merchants", delta: -1, reason: "ค้างหนี้กับสภาพ่อค้า" }],
    },
    sourceEventIds: [],
  };
}

/** สรุปสำหรับ UI (อ่านง่าย ไม่โชว์ตัวเลขดิบ) */
export function describeFaction(faction: FactionReputation, language: Language = "th") {
  const stanceTh: Record<FactionReputation["stance"], string> = {
    allies: "เป็นพันธมิตร",
    friendly: "เป็นมิตร",
    helpful: "ยินดีช่วย",
    cooperative: "ร่วมมือ",
    neutral: "เป็นกลาง",
    "conditional-cooperation": "ร่วมมือแบบมีเงื่อนไข",
    wary: "ระแวง",
    interfering: "ก่อกวน",
    hostile: "เป็นศัตรู",
    war: "ทำสงคราม",
  };
  const stanceEn: Record<FactionReputation["stance"], string> = {
    allies: "Allies",
    friendly: "Friendly",
    helpful: "Helpful",
    cooperative: "Cooperative",
    neutral: "Neutral",
    "conditional-cooperation": "Conditional cooperation",
    wary: "Wary",
    interfering: "Interfering",
    hostile: "Hostile",
    war: "War",
  };
  return {
    name: faction.name,
    stance: language === "en" ? stanceEn[faction.stance] : stanceTh[faction.stance],
    reason: faction.reasons[0] ?? "ยังไม่มีเหตุการณ์",
  };
}
