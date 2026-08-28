/**
 * Power & Rumor Network — projection module (Phase 1 → Phase 3)
 *
 * Phase 1: อ่านจาก state เดิมแบบตื้นๆ (fallback)
 * Phase 3: ถ้ามี worldSystems.powerRumor (คำนวณจากเหตุการณ์จริงใน worldEvents.ts)
 *          ให้นำค่านั้นมาแสดงเป็นหลัก — กลไกขยับได้จริงตามที่ผู้เล่นทำ
 *
 * หลักการ redesign (จากคำขอผู้ใช้):
 *  - ผู้เล่นเข้าใจสถานการณ์ใน 5 วินาที
 *  - ทุกค่ามี impact hint บอก "ถ้าค่านี้แย่ → จะเกิดอะไร"
 *  - อะไรต้องตัดสินใจตอนนี้ ให้ขึ้นก่อน (priority)
 *  - ภาษาง่าย บอกผลกระทบตรงๆ ไม่ใช่ศัพท์เกม
 *
 * กฎสถาปัตยกรรม (integration contract):
 *  - อ่านอย่างเดียว: ห้ามแก้ reputation/heat โดยตรงจาก UI
 *  - ไม่มี global score: ไม่สร้าง reputation หรือ heat ค่าเดียวทั้งโลก
 *  - legacy safe: หาก save เดิมไม่มี worldSystems ให้ใช้ empty projection (Phase 1)
 */

import type { GameState } from "./game";
import { describeFaction, type FactionReputation, type FactionHeat, type PowerRumorState } from "./worldEvents";

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

/** ท่าทีฝ่าย (แสดงชื่อ + สถานะ + ผลกระทบถ้าแย่) */
export type FactionStance = {
  factionId: string;
  name: string;
  stance: string;
  /** คำอธิบายสั้นๆ ว่าเกิดอะไรขึ้นล่าสุด (1 บรรทัด) */
  visibleReason: string;
  /** ถ้าค่านี้แย่ลง → จะเกิดอะไรกับผู้เล่น (ภาษาชาวบ้าน) */
  impactHint: string;
};

export type LocalHeat = {
  heatLevel: number; // 0 unseen .. 5 archived
  status: "unseen" | "suspected" | "identified" | "wanted" | "archived";
  label: string;
  /** 2-3 บรรทัดอธิบายสั้นๆ */
  reason: string;
  /** ถ้า heat สูง → ผลกระทบตรงๆ */
  impactHint: string;
};

export type SeasonalPressure = {
  foodStock: number;
  laborAvailability: number;
  routeCondition: number;
  marketPressure: number;
  /** สั้นๆ ฤดูกาลี้กระทบอะไรในเกม */
  summary: string;
  /** icon + label สั้น */
  shortLabel: string;
};

export type RouteChoice = {
  routeId: string;
  status: "open" | "risky" | "closed" | "unknown";
  reason: string;
  /** ถ้า risky/closed → ผลกระทบตรงๆ */
  impactHint: string;
  /** ลำดับความสำคัญ: ตัวเลขน้อย = ต้องตัดสินใจก่อน */
  priority: number;
};

export type RecentRumor = {
  id: string;
  summary: string;
  confidence: number;
  sourceLabel: string;
};

/** กลุ่มที่ต้องทำอะไร "ตอนนี้" (priority สูงสุด) */
export type ActionNow = {
  id: string;
  icon: "route" | "heat" | "faction" | "season";
  message: string; // ภาษาชาวบ้าน บอกว่าควรระวังอะไร
  severity: "calm" | "watch" | "warn" | "danger";
  priority: number; // น้อย = ต้องทำก่อน
};

/** Projection ที่ Campaign Command อ่าน (แบบเต็ม) */
export type PowerRumorSummary = {
  provinceId: string;
  currentSeason: "Spring" | "Summer" | "Autumn" | "Winter";
  /** สิ่งที่ผู้เล่นควรทำ/ระวังตอนนี้ — ขึ้นบนสุด */
  actionNow: ActionNow[];
  /** เส้นทางเลือก — เรียงตาม priority (ต้องตัดสินใจก่อน) */
  routeChoices: RouteChoice[];
  knownFactions: FactionStance[];
  localRisk: LocalHeat;
  seasonalPressure: SeasonalPressure;
  recentRumors: RecentRumor[];
  /** true ถาดึงค่าจริงจาก Phase 3 event-driven */
  eventDriven: boolean;
};

/** Compact projection ที่หน้า Story/Play แสดงค้างตลอด */
export type StoryCompactProjection = {
  vitals: { blood: number; focus: number; maxBlood: number; maxFocus: number; critical: boolean };
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
    actionNow: ActionNow[];
  };
};

const STAT_LABELS: Record<string, { en: string; th: string }> = {
  body: { en: "Body", th: "พลังกาย" },
  hand: { en: "Hand", th: "ฝีมือ" },
  wit: { en: "Wit", th: "ไหวพริบ" },
  mind: { en: "Mind", th: "ปัญญา" },
  heart: { en: "Heart", th: "ใจสู้" },
};

/**
 * Social Record — แบบ C (ตัวเลข 0..5 ซ่อนข้างใน + โชว์คำระดับใน UI)
 *
 * ค่าเก็บเป็นทศนิยมครึ่งหน่วย (เพิ่มยาก 2x: ทุก 0.5 ต่อเหตุการณ์สำคัญ)
 * แต่ผู้เล่นเห็นแค่ Math.floor(value) แปลงเป็นคำระดับต่อเนื่อง เช่นเดียวกับ heat status
 * — ต้องได้ "ครึ่ง 2 ครั้ง" จึงขึ้น 1 ระดับบนหน้าจอ
 *
 * cap: honor 5 · influence 4 (เพราะฝ่ายมีจำกัด) · information 5 · stain 5
 */
export type SocialField = "honor" | "influence" | "information" | "stain";

const SOCIAL_TIER_TH: Record<SocialField, string[]> = {
  honor: ["ไร้ชื่อ", "เรื่อยเปื่อย", "พอมีชื่อ", "ได้รับนับถือ", "เลื่องชื่อ", "เกียรติยศเต็มภูมิ"],
  influence: ["ไร้สายสัมพันธ์", "รู้จักบางคน", "มีคนฟัง", "มีเครือข่าย", "มีอำนาจต่อรอง"],
  information: ["หูตาห่าง", "รู้บ้าง", "ค่อนข้างรู้รอบ", "ช่างสืบ", "รู้ถึงความลับ", "รู้ราวเล่า"],
  stain: ["ไร้รอย", "เริ่มมีรอย", "มีผู้จดจำ", "ถูกจับตามอง", "รอยชัด", "อัปมงคล"],
};

const SOCIAL_TIER_EN: Record<SocialField, string[]> = {
  honor: ["Nameless", "Ordinary", "Respected", "Esteemed", "Renowned", "Flawless honor"],
  influence: ["No ties", "Known to some", "People listen", "Networked", "Power to bargain"],
  information: ["Cut off", "Knows a little", "Well-informed", "Sleuth", "Knows secrets", "Sees through rumor"],
  stain: ["Clean record", "A mark begins", "Remembered", "Under watch", "Stained", "Ill-omened"],
};

/** แปลงค่าตัวเลข (0..cap) → คำระดับภาษาไทย/อังกฤษที่ผู้เล่นเห็น (Math.floor เพื่อกันเศษครึ่ง) */
export function socialTierLabel(language: Language, field: SocialField, value: number): string {
  const tier = Math.max(0, Math.min(5, Math.floor(value)));
  const table = language === "en" ? SOCIAL_TIER_EN[field] : SOCIAL_TIER_TH[field];
  return table[Math.min(tier, table.length - 1)];
}

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

/** ดึง state Phase 3 จาก save (ถ้ามี) */
function getEventDrivenState(game: GameState): PowerRumorState | null {
  const ws = game.worldSystems;
  if (ws && ws.powerRumor && ws.powerRumor.factions.length >= 0 && ws.powerRumor.schemaVersion === 1) {
    return ws.powerRumor;
  }
  return null;
}

/** แปลงความเสี่ยงจาก stain + memory ให้เป็น local heat (0–5) แบบ conservative (Phase 1 fallback) */
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
    impactHint:
      heatRaw >= 3
        ? "ระวังด่านตรวจ: มีคนจำหน้าได้ อาจถูกเรียกค้นตัวหรือจับกุม"
        : heatRaw >= 1
          ? "คนบางกลุ่มเริ่มจับตา หลบไม่ให้หน้าตาติดตา"
          : "ยังปลอดภัย ไม่มีใครจำได้",
  };
}

/** Local heat จาก Phase 3 event-driven tracks */
function heatFromEvents(state: PowerRumorState, game: GameState): LocalHeat {
  const locationId = game.currentScene.location;
  const provinceId = game.campaign.region.toLowerCase();
  const track = state.heatTracks.find((h) => h.locationId === locationId && h.provinceId === provinceId)
    ?? state.heatTracks[0];
  if (!track) return deriveLocalHeat(game);
  const status = track.status;
  const reasons = track.reasons ?? [];
  return {
    heatLevel: track.level,
    status,
    label: HEAT_STATUS_LABELS[status].th,
    reason: reasons[0] ?? "ยังไม่มีเหตุการณ์ที่ทิ้งร่องรอย",
    impactHint:
      track.level >= 3
        ? "ระวังด่านตรวจ: มีคนจำหน้าได้ อาจถูกเรียกค้นตัวหรือจับกุม"
        : track.level >= 1
          ? "คนบางกลุ่มเริ่มจับตา หลบไม่ให้หน้าตาติดตา"
          : "ยังปลอดภัย ไม่มีใครจำได้",
  };
}

/** คำอธิบายผลกระทบถ้าฝ่ายนี้แย่ลง */
function factionImpactHint(factionId: string, stance: string): string {
  const hints: Record<string, string> = {
    villagers: "ชาวบ้านไม่ช่วยเวลาต้องการที่ซ่อนหรือเสบียง",
    "checkpoint-guard": "ผู้คุมด่านค้นตัวเข้มขึ้น หลบการตรวจไม่พ้น",
    "sakai-merchants": "สภาพ่อค้าไม่ยอมขายหรือให้หนี้เพิ่ม ของราคาแพงขึ้น",
    "local-warband": "นักรบท้องถิ่นอาจเข้าหาฝ่ายตรงข้ามหรือซุ่มโจมตี",
    "temple-shrine": "วัดไม่ให้ที่พักหรือพร ไม่มีพื้นที่สงบให้ซ่อนตัว",
  };
  const base = hints[factionId] ?? "ฝ่ายนี้ไม่ยอมช่วยเมื่อคุณติดเรื่อง";
  if (stance === "hostile" || stance === "war") return `แย่แล้ว: ${base}`;
  if (stance === "wary" || stance === "interfering") return `ระวัง: ${base}`;
  return base;
}

/** ดึง faction stance จาก Phase 3 events (ถ้ามี) ไม่งั้น fallback Phase 1 */
function deriveFactionStances(game: GameState, eventState: PowerRumorState | null): FactionStance[] {
  const groups: Array<{ factionId: string; name: string }> = [
    { factionId: "villagers", name: "ชาวบ้าน" },
    { factionId: "checkpoint-guard", name: "ผู้คุมด่าน" },
    { factionId: "sakai-merchants", name: "สภาพ่อค้า" },
    { factionId: "local-warband", name: "กลุ่มนักรบท้องถิ่น" },
    { factionId: "temple-shrine", name: "วัดหรือศาลเจ้า" },
  ];

  if (eventState) {
    // ใช้ค่าจริงจาก events
    const out: FactionStance[] = [];
    for (const group of groups) {
      const f = eventState.factions.find((x) => x.factionId === group.factionId);
      if (!f) continue; // ซ่อนฝ่ายที่ยังไม่เคยปรากฏ (clean UI)
      const d = describeFaction(f, "th");
      out.push({
        factionId: group.factionId,
        name: group.name,
        stance: f.stance,
        visibleReason: f.reasons?.[0] ?? "ยังไม่มีเหตุการณ์",
        impactHint: factionImpactHint(group.factionId, f.stance),
      });
    }
    return out;
  }

  // Phase 1 fallback
  const affinityAvg = (ids: string[]) => {
    const found = game.relationships.filter((r) => ids.includes(r.contactId));
    if (!found.length) return 0;
    return found.reduce((sum, r) => sum + (r.affinity ?? 0), 0) / found.length;
  };
  const map: Array<{ factionId: string; name: string; ids: string[] }> = [
    { factionId: "villagers", name: "ชาวบ้าน", ids: ["masakichi"] },
    { factionId: "checkpoint-guard", name: "ผู้คุมด่าน", ids: [] },
    { factionId: "sakai-merchants", name: "สภาพ่อค้า", ids: ["gantaro"] },
    { factionId: "local-warband", name: "กลุ่มนักรบท้องถิ่น", ids: ["tokichi"] },
  ];
  return map.map((group) => {
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
    return { factionId: group.factionId, name: group.name, stance, visibleReason: reason, impactHint: factionImpactHint(group.factionId, stance) };
  });
}

/** คำนวณ seasonal pressure จาก community + season */
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
  const short: Record<typeof season, string> = {
    Spring: "🌱 เพาะปลูกแย่งแรงงาน",
    Summer: "🌧️ ฝนทำถนนพัง",
    Autumn: "🍂 เก็บเกี่ยวแต่ภาษีแพง",
    Winter: "❄️ หิมะปิดเส้นทาง",
  };
  return {
    foodStock,
    laborAvailability,
    routeCondition,
    marketPressure,
    summary: summaries[season],
    shortLabel: short[season],
  };
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

/** สร้างรายการ "ควรทำ/ระวังตอนนี้" เรียงตาม priority */
function buildActionNow(
  routeChoices: RouteChoice[],
  heat: LocalHeat,
  factions: FactionStance[],
  seasonal: SeasonalPressure,
): ActionNow[] {
  const actions: ActionNow[] = [];

  for (const r of routeChoices) {
    if (r.status === "closed") {
      actions.push({ id: `route-${r.routeId}`, icon: "route", severity: "danger", message: `เส้นทาง${r.routeId === "overland" ? "บก" : "น้ำ"}ปิดแล้ว — หาทางอื่นหรือรอ`, priority: 1 });
    } else if (r.status === "risky") {
      actions.push({ id: `route-${r.routeId}`, icon: "route", severity: "warn", message: `เส้นทาง${r.routeId === "overland" ? "บก" : "น้ำ"}เสี่ยง — โอกาสโดนซุ่มโจมตีสูง`, priority: 2 });
    }
  }

  if (heat.heatLevel >= 3) {
    actions.push({ id: "heat", icon: "heat", severity: "danger", message: "ความเสี่ยงระดับพื้นที่สูง — มีคนจำหน้าได้ ระวังด่านตรวจ", priority: 1 });
  } else if (heat.heatLevel >= 1) {
    actions.push({ id: "heat", icon: "heat", severity: "watch", message: "เริ่มมีคนจับตา — อย่าทำตัวโดดเด่น", priority: 3 });
  }

  const hostile = factions.filter((f) => f.stance === "hostile" || f.stance === "war");
  if (hostile.length) {
    actions.push({ id: "faction-hostile", icon: "faction", severity: "warn", message: `${hostile.map((f) => f.name).join(" และ ")}เป็นศัตรูกับคุณแล้ว`, priority: 2 });
  }

  if (seasonal.routeCondition <= 2) {
    actions.push({ id: "season", icon: "season", severity: "watch", message: seasonal.shortLabel, priority: 4 });
  }

  // เรียง priority น้อยไปมาก
  return actions.sort((a, b) => a.priority - b.priority);
}

/** Projection เต็มสำหรับ Campaign Command */
export function buildPowerRumorSummary(game: GameState, language: Language = "th"): PowerRumorSummary {
  const eventState = getEventDrivenState(game);
  const factions = deriveFactionStances(game, eventState);
  const heat = eventState ? heatFromEvents(eventState, game) : deriveLocalHeat(game);
  const seasonal = deriveSeasonalPressure(game);
  const rumors = deriveRumors(game);
  const routeStatus = game.economy.routeStatus;
  const isRisky = /ซักถาม|ตรวจ|ปิด/.test(routeStatus);

  const routeChoices: RouteChoice[] = ([
    {
      routeId: "overland",
      status: isRisky ? "risky" : "open",
      reason: isRisky ? "ผู้เดินทางถูกซักถาม บางด่านปิด" : "เส้นทางบกเปิดแต่ขึ้นอยู่กับฤดูกาล",
      impactHint: isRisky ? "ถ้าเลือกทางบก มีโอกาสโดนซุ่มโจมตีหรือค้นตัวสูง" : "ทางบกปลอดโปร่ง แต่ slower ในฤดูฝน/หนาว",
      priority: isRisky ? 2 : 5,
    },
    {
      routeId: "waterway",
      status: seasonal.routeCondition <= 2 && game.campaign.season === "Summer" ? "open" : "open",
      reason: game.campaign.season === "Summer" ? "เส้นทางน้ำยังเปิดและมีค่าจ้างคนเรือสูงขึ้น" : "เส้นทางน้ำเปิดตามปกติ",
      impactHint: "ทางน้ำเร็วและซ่อนตัวง่าย แต่พึ่งพาคนเรือ",
      priority: 5,
    },
  ] as RouteChoice[]).sort((a, b) => a.priority - b.priority);

  const actionNow = buildActionNow(routeChoices, heat, factions, seasonal);

  return {
    provinceId: game.campaign.region.toLowerCase(),
    currentSeason: game.campaign.season,
    actionNow,
    routeChoices,
    knownFactions: factions.map((f) => ({ ...f, stance: label(language, f.stance, f.stance) })),
    localRisk: heat,
    seasonalPressure: seasonal,
    recentRumors: rumors,
    eventDriven: Boolean(eventState),
  };
}

/** Projection ย่อสำหรับหน้า Story/Play */
export function buildStoryCompact(game: GameState, language: Language = "th"): StoryCompactProjection {
  const eventState = getEventDrivenState(game);
  const factions = deriveFactionStances(game, eventState);
  const heat = eventState ? heatFromEvents(eventState, game) : deriveLocalHeat(game);
  const rumors = deriveRumors(game);
  const seasonal = deriveSeasonalPressure(game);
  const routeChoices: RouteChoice[] = [
    { routeId: "overland", status: /ซักถาม|ตรวจ|ปิด/.test(game.economy.routeStatus) ? "risky" : "open", reason: "", impactHint: "", priority: 5 },
    { routeId: "waterway", status: "open", reason: "", impactHint: "", priority: 5 },
  ];
  const actionNow = buildActionNow(routeChoices, heat, factions, seasonal);
  return {
    vitals: {
      blood: game.character.vitals.blood,
      focus: game.character.vitals.focus,
      maxBlood: Math.max(1, Math.min(10, Math.round(game.character.vitals.maxBlood ?? 6))),
      maxFocus: Math.max(1, Math.min(10, Math.round(game.character.vitals.maxFocus ?? 6))),
      critical: game.character.vitals.blood <= 2,
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
      actionNow,
    },
  };
}
