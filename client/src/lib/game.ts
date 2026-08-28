/**
 * Dust & Fire game-state contract.
 * Ledger of Ash reminder: the player sees consequences, sources, and choices—not hidden intent.
 */

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";
export type StatId = "body" | "hand" | "wit" | "mind" | "heart";
export type Outcome = "decisive_success" | "success_with_cost" | "partial_success" | "failure_with_consequence";
export type MissionState = "offered" | "active" | "resolved" | "failed" | "retired";
export type MissionRole = "main" | "side";
export type MissionVisibility = "visible" | "hidden";
export type ItemKind = "immediate" | "reserve" | "equipment" | "document" | "status" | "bond";
export type CurrencyUnit = "mon";
export type InventoryCategory = "weapon" | "food" | "medicine" | "story" | "tool" | "status";
export type Currency = { unit: CurrencyUnit; amount: number };
export type MemoryKind = "news" | "witness" | "debt" | "favor" | "oath" | "stain" | "injury" | "market_change" | "community_change" | "actor_relation";

import { emptyPowerRumorState, applyWorldEvent, eventFromRoll, eventFromDebt } from "./worldEvents";
import { regionInitialState, FACTION_NAMES } from "./regionInitialState";
import { voiceReplyFor, factionOfSpeaker } from "./factionVoice";
import { timelineRegionKey } from "./historicalTimeline";
import type { FactionReputation, FactionHeat } from "./worldEvents";

export const STATS: { id: StatId; en: string; th: string; hint: string }[] = [
  { id: "body", en: "strength", th: "พลังกาย", hint: "แรง อึด แบก ฝ่าอุปสรรค" },
  { id: "hand", en: "Finesse", th: "ฝีมือ", hint: "อาวุธ งานช่าง การลงมือแม่น" },
  { id: "wit", en: "Instinct", th: "ไหวพริบ", hint: "หลบ ลวง สังเกต อ่านจังหวะ" },
  { id: "mind", en: "Insight", th: "ปัญญา", hint: "เอกสาร ข่าว แผน และเหตุผล" },
  { id: "heart", en: "Grit", th: "ใจสู้", hint: "ยืนหยัด คำสัตย์ และแรงกดดัน" },
];

export type Attributes = Record<StatId, number>;
export type StatXp = Record<StatId, { xp: number; totalXp: number }>;

export type StatPractice = {
  stat: StatId;
  gained: number;
  valueBefore: number;
  valueAfter: number;
  xp: number;
  xpNeeded: number;
  note?: string;
};

export type Mastery = {
  id: string;
  label: string;
  level: number;
  rank?: number;
  xp?: number;
  totalXp?: number;
  masteryMark?: string;
  origin: string;
  tags: string[];
};

export type TimeSegment = "dawn" | "day" | "dusk" | "night";

export type SkillPractice = {
  masteryId: string;
  masteryLabel: string;
  gained: number;
  rankBefore: number;
  rankAfter: number;
  xp: number;
  xpNeeded: number;
  masteryMark?: string;
  note?: string;
};

export type TimeMark = {
  from: TimeSegment;
  to: TimeSegment;
  advancedDays: number;
  leafAdvanced: boolean;
  message: string;
};

export type VitalEvent = { id: string; type: "wounds" | "focus"; delta: number; reason: string; source: "roll" | "rest" | "milestone"; tick: number };

export type ProgressionState = {
  leaf: number;
  segment: TimeSegment;
  timeMarksSinceLeaf: number;
  daysSinceLeaf: number;
  ageAtCampaignStart: number;
  currentAge: number;
  birthSeason: Season;
  campaignStartYear: number;
  lastPractice?: SkillPractice;
  lastStatPractice?: StatPractice;
  lastTimeMark?: TimeMark;
  growthPoints?: number;
  milestonePoints?: number;
  vitalEvents?: VitalEvent[];
};

export type InventoryItem = {
  id: string;
  label: string;
  kind: ItemKind;
  /** Player-facing category; legacy saves may omit it and are classified during normalization. */
  category?: InventoryCategory;
  slots: number;
  description: string;
  functions: ("unlock" | "bonus" | "exchange")[];
  bonus?: { stat?: StatId; value: number; tags: string[] };
  special?: { mode: "auto_pass" | "dn_zero"; tags: string[]; reason: string };
  condition: "usable" | "used" | "damaged" | "evidence";
  location?: "carried" | "safehouse" | "stored" | "hidden";
  ownership?: "owned" | "borrowed" | "held_for_other" | "disputed";
};

export type RelationshipPull = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  weight: number;
};

export type Character = {
  id: string;
  name: string;
  identity: string;
  occupationId: string;
  occupation: string;
  origin: string;
  strength: string;
  weakness: string;
  flaws: string[];
  attributes: Attributes;
  statXp: StatXp;
  masteries: Mastery[];
  vitals: { wounds: number; focus: number; maxWounds?: number; maxFocus?: number };
  social: { rank: number; honor: number; influence: number; information: number; stain: number };
  resources: { property: number; supplies: number; credit: number; currency?: Currency };
  /** `property` and `credit` remain as legacy compatibility aliases; UI must use currency/obligations. */
  inventory: InventoryItem[];
  pulls: RelationshipPull[];
};

export type CampaignContext = {
  id: string;
  title: string;
  year: number;
  season: Season;
  region: string;
  location: string;
  /** Era/profile are created at campaign start; legacy saves remain valid without them. */
  eraId?: string;
  openingProfileId?: string;
  selectionSeed?: number;
  warShadow: number;
  day: number;
  /** A real civil date is optional; synthetic scene days must never be treated as a historical calendar date. */
  historicalDate?: { month: number; day: number; source: "player-confirmed" };
};

export type Community = {
  food: number;
  labor: number;
  voice: number;
  safety: number;
  cohesion: number;
  lastChange: string;
};

export type Mission = {
  id: string;
  issuer: string;
  issuerType: "commoner" | "samurai" | "merchant" | "temple" | "ruler";
  title: string;
  request: string;
  pressure: string;
  deadline: string;
  state: MissionState;
  /** Legacy saves omit these fields; normalizeGameState upgrades them deterministically. */
  role?: MissionRole;
  visibility?: MissionVisibility;
  challenge?: "ordinary" | "elevated";
  reward: string;
  risk: string;
  options: string[];
  canon?: { premise: string; protectedTerms: string[]; evidence: string[] };
  retiredReason?: string;
  supersededBy?: string;
  progress?: { current: number; required: number; triggerPhrases: string[]; rewardItem?: Omit<InventoryItem, "id">; resolvedBy?: string; rewardGranted?: boolean };
};

export const MAX_VISIBLE_ACTIVE_MAIN_THREADS = 1;
export const MAX_VISIBLE_ACTIVE_SIDE_LEADS = 2;

export type MissionChangeNotice = {
  kind: "main-replaced" | "main-retired" | "side-revealed" | "side-created" | "none";
  title: string;
  detail: string;
};

export type MissionDirectiveInput = {
  kind: "keep" | "advance" | "resolve" | "fail" | "replace_main" | "create_hidden_side" | "reveal_side" | "retire_side";
  targetMissionId: string | null;
  reason: string;
  evidence: string[];
  replacement: { title: string; giver: string; objective: string; pressure: string; deadline: string; reward: string; risk: string; options: string[]; canonTerms: string[] } | null;
};

export type MarketOffer = {
  id: string;
  label: string;
  price: number;
  priceUnit?: CurrencyUnit;
  debtAllowed?: boolean;
  kind: "goods" | "service" | "information";
  slots?: number;
  note: string;
  available: boolean;
  priceReason?: string;
};

export type MarketService = {
  id: string;
  provider: string;
  role: string;
  affiliation: string;
  request: string;
  price: string;
  timeCost: string;
  requirement: string;
  witnessRisk: string;
  availability: "available" | "limited" | "unavailable";
};

export type Obligation = {
  id: string;
  kind: "credit" | "debt" | "favor";
  /** Human-readable obligation; never a numeric player credit balance. */
  holder: string;
  subject: string;
  due: string;
  witness: string;
  status: "open" | "settled" | "called_in";
  note: string;
};

export type ExchangeRecord = {
  id: string;
  kind: "purchase" | "credit_purchase" | "service" | "gift" | "debt" | "favor";
  title: string;
  counterpart: string;
  payment: string;
  witness: string;
  consequence: string;
  tick: number;
};

export type EconomyState = {
  marketTitle: string;
  marketContext: string;
  routeStatus: string;
  sellerNetwork: string;
  services: MarketService[];
  obligations: Obligation[];
  transactions: ExchangeRecord[];
};

export type WorldMemory = {
  id: string;
  kind: MemoryKind;
  title: string;
  detail: string;
  tick: number;
  tone: "teal" | "ochre" | "vermilion" | "navy";
};

export type BilingualText = { en: string; th: string };
export type RelationshipEventSource = "roll" | "memory" | "mission" | "exchange";
export type RelationshipTone = "navy" | "vermilion" | "ochre" | "teal" | "charcoal";

/**
 * This is intentionally the only contact shape stored in GameState/local save.
 * Internal motivation and GM direction belong to server-only dossiers.
 */
export type PublicRelationshipEvent = {
  id: string;
  sourceType: RelationshipEventSource;
  sourceId: string;
  inGameDay: number;
  tick: number;
  title: BilingualText;
  detail: BilingualText;
  tone: "teal" | "ochre" | "vermilion" | "navy";
};

export type PublicRelationshipDailyLog = {
  id: string;
  inGameDay: number;
  status: "pending" | "ready";
  summary: BilingualText;
  eventIds: string[];
  confidence?: "low" | "medium" | "high";
};

export type PublicRelationshipContact = {
  contactId: "gantaro" | "tokichi" | "masakichi" | "genshiro";
  nameTh: string;
  nameEn: string;
  iconKey: string;
  colorTone: RelationshipTone;
  publicStatus: BilingualText;
  publicPersona: BilingualText[];
  earnedKnowledge: BilingualText[];
  blankSpace: BilingualText[];
  relationshipRole: BilingualText;
  familiarity: number;
  affinity: number;
  visibleSummary?: BilingualText;
  latestDailyLog?: PublicRelationshipDailyLog;
  events: PublicRelationshipEvent[];
};

export type HistoricalStatus = "fact-supported" | "contextual-play" | "campaign-fiction" | "insufficient-evidence";

export type HistoricalBoundary = {
  status: HistoricalStatus;
  fence: string;
};

export type RollPreview = {
  action: string;
  isRiskOnly?: boolean;
  intent: string;
  method: string;
  stat: StatId;
  mastery?: Mastery;
  contextBonus: number;
  contextReason?: string;
  difficulty: Difficulty;
  difficultyReason?: string;
  specialItem?: { itemId: string; label: string; mode: "auto_pass" | "dn_zero"; reason: string };
  flawTriggered?: boolean;
  flawBonus?: -2 | 0;
  triggeredFlaw?: string;
  flawReason?: string;
  risks: string[];
  witnesses: string[];
  historical?: HistoricalBoundary;
};

export type RollRecord = RollPreview & {
  id: string;
  dice: [number, number];
  total: number;
  margin: number;
  outcome: Outcome;
  summary: string;
  narrative: string;
  reward?: string;
  consequence?: string;
  tick: number;
  practice?: SkillPractice;
  statPractice?: StatPractice;
  timeMark?: TimeMark;
  missionUpdate?: { missionId: string; current: number; required: number; state: MissionState; reward?: string };
};

/** Narrative-only chapter retained for reading and later canon analysis. */
export type StoryRecord = {
  id: string;
  tick: number;
  inGameDay: number;
  title: string;
  prose: string;
  location: string;
};

export type Scene = {
  id: string;
  chapter: string;
  title: string;
  location: string;
  publicContext: string;
  body: string[];
  speaker: string;
  prompt: string;
  pressure: string;
  suggestedActions: string[];
};

export type WorldSystemsFlags = {
  powerRumorNetwork: boolean;
  factionReputation: boolean;
  scopedHeat: boolean;
  seasonalPressure: boolean;
  npcMemoryRetrieval: boolean;
};

/**
 * Phase 1 placeholder: โครงสร้าง worldSystems ถูกเพิ่มเป็น optional
 * ห้ามเปลี่ยน GameState เดิม และห้ามเขียน save ใหม่ใน Phase 1
 * Projection ทั้งหมดคำนวณจาก state ที่มีจริงผ่าน powerRumor.ts
 */
export type WorldSystems = {
  schemaVersion: 1;
  flags?: WorldSystemsFlags;
  /** Phase 3: state ที่คำนวณจากเหตุการณ์จริง (event-driven) */
  powerRumor?: import("./worldEvents").PowerRumorState;
  vitalProgression?: { maxWounds: number; maxFocus: number; growthPoints: number; milestonePoints: number };
};

export type GameState = {
  schemaVersion: number;
  credits: number;
  campaign: CampaignContext;
  character: Character;
  community: Community;
  currentScene: Scene;
  missions: Mission[];
  market: MarketOffer[];
  economy: EconomyState;
  memories: WorldMemory[];
  rolls: RollRecord[];
  storyRecords?: StoryRecord[];
  relationships: PublicRelationshipContact[];
  historicalBoundary?: HistoricalBoundary & { tick: number };
  progression?: ProgressionState;
  worldSystems?: WorldSystems;
  tick: number;
};

const relationshipText = (en: string, th: string): BilingualText => ({ en, th });

const relationshipFoundationEvent = (contactId: PublicRelationshipContact["contactId"], title: BilingualText, detail: BilingualText, tone: PublicRelationshipEvent["tone"]): PublicRelationshipEvent => ({
  id: `relationship-foundation-${contactId}`,
  sourceType: "memory",
  sourceId: `relationship-foundation-${contactId}`,
  inGameDay: 1,
  tick: 1,
  title,
  detail,
  tone,
});

export function saikaRelationshipFoundationMemories(): WorldMemory[] {
  return [
    { id: "relationship-foundation-gantaro", kind: "actor_relation", title: "กันทาโร่รับซาเนฟุยุเข้ากลุ่ม", detail: "กันทาโร่ยอมรับฝีมือของซาเนฟุยุจากการประลอง แต่เหตุการณ์ที่ร้านเอจิยะทำให้ความไว้ใจลดลงอย่างเห็นได้ชัด", tick: 1, tone: "vermilion" },
    { id: "relationship-foundation-tokichi", kind: "actor_relation", title: "โทคิจิรู้สัญลักษณ์คูกิ", detail: "โทคิจิเป็นคู่หูเฉพาะกิจที่เคยร่วมรบและช่วยชีวิตซาเนฟุยุ เขารู้เรื่องสัญลักษณ์คูกิและชอบต่อรองค่าปิดปากเป็นเหล้า", tick: 1, tone: "ochre" },
    { id: "relationship-foundation-masakichi", kind: "actor_relation", title: "มาซาคิจิยังระวังซาเนฟุยุ", detail: "มาซาคิจกับซาเนฟุยุเคยพากันรอดมาได้ แต่เขายังไม่ลืมเหตุที่ถูกหลอกและเกือบเสียชีวิต", tick: 1, tone: "navy" },
    { id: "relationship-foundation-genshiro", kind: "actor_relation", title: "เก็นชิโร่ตามหาผู้หักดาบ", detail: "เก็นชิโร่ต้องการตามตัวซาเนฟุยุหลังเหตุหักดาบ แต่ยังไม่มีหลักฐานว่าเขามาถึงซาไกแล้ว", tick: 1, tone: "vermilion" },
  ];
}

/** Public-only contact cards, based solely on the player-visible NPC source material. */
export function saikaPublicRelationships(): PublicRelationshipContact[] {
  const gantaroEvent = relationshipFoundationEvent("gantaro", relationshipText("Gantaro accepted Sanefuyu into the Saika group", "กันทาโร่รับซาเนฟุยุเข้ากลุ่ม"), relationshipText("He recognized your skill after the trial, yet the affair at Echiya has visibly thinned his trust.", "เขายอมรับฝีมือจากการประลอง แต่เหตุที่ร้านเอจิยะทำให้ความไว้ใจลดลงอย่างเห็นได้ชัด"), "vermilion");
  const tokichiEvent = relationshipFoundationEvent("tokichi", relationshipText("Tokichi knows the Kuki mark", "โทคิจิรู้สัญลักษณ์คูกิ"), relationshipText("A companion in danger who knows your secret and turns silence into a bargain for drink.", "คู่หูยามคับขันที่รู้ความลับและมักต่อรองค่าปิดปากเป็นเหล้า"), "ochre");
  const masakichiEvent = relationshipFoundationEvent("masakichi", relationshipText("Masakichi has not forgotten", "มาซาคิจิยังไม่ลืม"), relationshipText("You survived together, but he remembers the deceit that nearly cost him his life.", "พวกเจ้ารอดมาด้วยกัน แต่เขายังจำเหตุที่เคยถูกหลอกและเกือบเสียชีวิต"), "navy");
  const genshiroEvent = relationshipFoundationEvent("genshiro", relationshipText("Genshiro seeks the one who broke his sword", "เก็นชิโร่ตามหาผู้หักดาบ"), relationshipText("He seeks to restore his honor after the broken sword, though you do not know whether he has reached Sakai.", "เขาต้องการกู้เกียรติหลังเหตุหักดาบ แต่ยังไม่รู้ว่าเขามาถึงซาไกหรือยัง"), "vermilion");
  return [
    {
      contactId: "gantaro", nameTh: "กันทาโร่", nameEn: "Gantaro", iconKey: "gantaro", colorTone: "navy",
      publicStatus: relationshipText("Saika checkpoint captain and small-unit leader", "หัวหน้าด่าน/หัวหน้ากลุ่มย่อยของไซกะ"),
      publicPersona: [relationshipText("Large and hard-built, with gunpowder soot on a cotton-covered dō-maru, a chipped tooth, and a well-used jingasa.", "ร่างใหญ่แข็งแรง เกราะโดมารุทับผ้าฝ้ายมีคราบเขม่าปืน ฟันบิ่นหนึ่งซี่ และหมวกจินงาสะที่ผ่านการใช้งานจริง"), relationshipText("Blunt, loud, and quick to judge a person by their stance and the way they hold a weapon.", "โผงผาง พูดดัง และมักประเมินคนจากท่ายืนกับการจับอาวุธ")],
      earnedKnowledge: [relationshipText("He accepted your ability after the trial, but his trust has declined since the Echiya affair.", "เขายอมรับฝีมือจากการประลอง แต่ความไว้ใจลดลงหลังเหตุที่ร้านเอจิยะ")],
      blankSpace: [relationshipText("What does he truly value when he judges a person, and where is the edge of his patience for your mistakes?", "ลึก ๆ แล้วเขาให้คุณค่ากับคนจากอะไร และเส้นแบ่งความอดทนต่อความผิดพลาดของเจ้าอยู่ตรงไหน?")],
      relationshipRole: relationshipText("Employer", "นายจ้าง"), familiarity: 3, affinity: -1,
      visibleSummary: relationshipText("The safehouse still shelters you, but trust is no longer freely given.", "ที่ซ่อนยังคุ้มครองเจ้าอยู่ แต่ความไว้ใจไม่ถูกมอบให้ง่ายเหมือนเดิม"), events: [gantaroEvent],
    },
    {
      contactId: "tokichi", nameTh: "โทคิจิ", nameEn: "Tokichi", iconKey: "tokichi", colorTone: "ochre",
      publicStatus: relationshipText("Saika hired fighter assigned to the Sakai affair", "ทหารรับจ้างไซกะผู้ร่วมภารกิจซาไก"),
      publicPersona: [relationshipText("Lean, yellow-toothed, and rarely far from his spear.", "ผอมแกร็น ฟันเหลือง และหอกมักติดมือเสมอ"), relationshipText("He waits by posts or in dark corners, jokes and bargains, and retreats when danger turns sharp.", "ชอบยืนพิงเสาหรือหลบตามมุมมืด เล่นมุก ต่อรองเก่ง และพร้อมถอยเมื่อสถานการณ์เริ่มเสี่ยง")],
      earnedKnowledge: [relationshipText("A partner in danger who knows your Kuki mark and regularly asks for drink as the price of silence.", "สหายร่วมรบที่รู้ความลับเรื่องสัญลักษณ์คูกิ และมักรีดค่าปิดปากเป็นเหล้า")],
      blankSpace: [relationshipText("Does his loyalty have a breaking point, and what would make him betray you or keep silent for good?", "ใต้ความขี้ขลาดและเห็นแก่เงิน เขามีเส้นตายความภักดีหรือไม่ อะไรจะทำให้เขาหักหลังหรือปิดปากเงียบอย่างแท้จริง?")],
      relationshipRole: relationshipText("Companion of necessity", "คู่หูเฉพาะกิจ"), familiarity: 3, affinity: 0,
      visibleSummary: relationshipText("He knows too much, but has not yet chosen to spend that knowledge against you.", "เขารู้มากเกินไป แต่ยังไม่เลือกใช้ความรู้นั้นเล่นงานเจ้า"), events: [tokichiEvent],
    },
    {
      contactId: "masakichi", nameTh: "มาซาคิจิ", nameEn: "Masakichi", iconKey: "masakichi", colorTone: "teal",
      publicStatus: relationshipText("Saika gun repairer; formerly a bell and metal worker from Mino", "ช่างซ่อมปืนในค่ายไซกะ อดีตช่างหล่อระฆังและช่างโลหะจากมิโนะ"),
      publicPersona: [relationshipText("Slightly stooped, with scarred fingers hardened by burns and metal.", "ไหล่ค่อมเล็กน้อย นิ้วแข็งกระด้าง มีรอยไหม้และคราบโลหะฝังแน่นที่มือ"), relationshipText("He speaks slowly while his attention remains on tools and the fit of a gun's parts.", "มักพูดช้า ๆ ขณะสายตาจดจ่ออยู่กับเครื่องมือและความพอดีของชิ้นส่วนปืน")],
      earnedKnowledge: [relationshipText("You survived together and trust has begun to grow, but he remembers that you once deceived him and nearly killed him.", "พวกเจ้าพากันเอาชีวิตรอดจนความไว้ใจเริ่มเพิ่มขึ้น แต่เขายังจำได้ว่าเจ้าเคยหลอกและเกือบฆ่าเขา")],
      blankSpace: [relationshipText("What binds him to the Oda network, and what would earn the help of a person wary of being used?", "อดีตของเขากับเครือข่ายโอดะคืออะไร และต้องใช้อะไรจึงจะซื้อใจคนที่กลัวการถูกหลอกใช้ให้ยอมช่วยงานอันตราย?")],
      relationshipRole: relationshipText("Wary ally", "พันธมิตรที่ระแวงกัน"), familiarity: 2, affinity: -1,
      visibleSummary: relationshipText("You have shared survival, not yet easy faith.", "เจ้าร่วมรอดมาได้ด้วยกัน แต่ยังไม่ใช่ความไว้ใจที่ง่ายดาย"), events: [masakichiEvent],
    },
    {
      contactId: "genshiro", nameTh: "เก็นชิโร่", nameEn: "Genshiro", iconKey: "genshiro", colorTone: "vermilion",
      publicStatus: relationshipText("Samurai overseeing supplies at the port of Toba", "ซามูไรผู้ดูแลเสบียงท่าเรือโทบะ"),
      publicPersona: [relationshipText("Immaculately kept clothing, weapons, and equipment.", "แต่งกายเป็นระเบียบเรียบร้อย อาวุธและอุปกรณ์ได้รับการดูแลอย่างดีเยี่ยม"), relationshipText("Controlled even in anger, he speaks in the decisive register of orders and duty.", "นิ่งและควบคุมอารมณ์ได้ดีแม้กำลังโกรธ พูดจาเด็ดขาดแบบออกคำสั่งและเน้นย้ำเรื่องยศกับหน้าที่")],
      earnedKnowledge: [relationshipText("You broke his sword. He seeks to hunt you down and return you for punishment, but there is no certain sign that he has reached Sakai.", "เจ้าเคยหักดาบของเขา เขาต้องการล่าตัวเจ้ากลับไปรับโทษ แต่ยังไม่มีเบาะแสแน่ชัดว่าเขาตามมาถึงซาไกหรือยัง")],
      blankSpace: [relationshipText("If his discipline is only the outer surface, what could finally make this controlled samurai lose command of himself?", "หากความเจ้าระเบียบคือเปลือกนอก อะไรจะทำให้ซามูไรผู้คุมสติตัวเองได้ดีคนนี้สติแตกในที่สุด?")],
      relationshipRole: relationshipText("Personal adversary", "ศัตรูคู่อาฆาต"), familiarity: 1, affinity: -3,
      visibleSummary: relationshipText("His pursuit is personal; his present distance from Sakai remains unknown.", "การตามล่าของเขาเป็นเรื่องส่วนตัว แต่ระยะห่างของเขาจากซาไกยังไม่แน่ชัด"), events: [genshiroEvent],
    },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function readText(value: unknown, fallback: BilingualText): BilingualText { return isRecord(value) && typeof value.en === "string" && typeof value.th === "string" ? { en: value.en, th: value.th } : fallback; }
function clampRelationship(value: unknown, minimum: number, maximum: number, fallback: number): number { return typeof value === "number" && Number.isFinite(value) ? Math.max(minimum, Math.min(maximum, Math.round(value))) : fallback; }

function missionIsOpen(mission: Mission) {
  return mission.state === "offered" || mission.state === "active";
}

export function missionRoleOf(mission: Mission): MissionRole {
  return mission.role ?? "main";
}

export function missionVisibilityOf(mission: Mission): MissionVisibility {
  return mission.visibility ?? "visible";
}

/**
 * This enforces campaign structure at the save boundary. It never invents a
 * story: malformed legacy excess threads are kept as hidden side leads rather
 * than silently discarded.
 */
export function normalizeMissionThreads(missions: Mission[]): Mission[] {
  let openMainCount = 0;
  let visibleSideCount = 0;
  return missions.map((mission, index) => {
    let role: MissionRole = mission.role ?? (index === 0 ? "main" : "side");
    let visibility: MissionVisibility = mission.visibility ?? "visible";
    if (missionIsOpen(mission) && role === "main") {
      if (openMainCount >= MAX_VISIBLE_ACTIVE_MAIN_THREADS) {
        role = "side";
        visibility = "hidden";
      } else {
        openMainCount += 1;
      }
    }
    if (missionIsOpen(mission) && role === "side" && visibility === "visible") {
      if (visibleSideCount >= MAX_VISIBLE_ACTIVE_SIDE_LEADS) visibility = "hidden";
      else visibleSideCount += 1;
    }
    return { ...mission, role, visibility };
  });
}

export function activeMainMission(state: Pick<GameState, "missions">): Mission | undefined {
  return state.missions.find((mission) => missionIsOpen(mission) && missionRoleOf(mission) === "main" && missionVisibilityOf(mission) === "visible");
}

export function visibleSideLeads(state: Pick<GameState, "missions">): Mission[] {
  return state.missions.filter((mission) => missionIsOpen(mission) && missionRoleOf(mission) === "side" && missionVisibilityOf(mission) === "visible");
}

function compactTerms(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length >= 2))).slice(0, 8);
}

function directiveText(input: MissionDirectiveInput) {
  return [input.reason, ...input.evidence, input.replacement?.title, input.replacement?.giver, input.replacement?.objective, input.replacement?.pressure, input.replacement?.reward, input.replacement?.risk, ...(input.replacement?.options ?? [])].filter(Boolean).join(" ").toLowerCase();
}

/** Refuses an obvious violent betrayal of a person protected by an open thread. */
export function missionDirectiveIsCanonConsistent(state: Pick<GameState, "missions">, directive: MissionDirectiveInput) {
  if (!directive.replacement) return true;
  const text = directiveText(directive);
  if (!/(ฆ่า|สังหาร|ทำร้าย|เผา|ลอบฆ่า|kill|murder|burn|betray)/.test(text)) return true;
  const protectedTerms = state.missions
    .filter((mission) => missionIsOpen(mission))
    .flatMap((mission) => compactTerms([mission.issuer, ...(mission.canon?.protectedTerms ?? [])]));
  return !protectedTerms.some((term) => text.includes(term.toLowerCase()));
}

function directiveMission(id: string, source: NonNullable<MissionDirectiveInput["replacement"]>, role: MissionRole, visibility: MissionVisibility, challenge: Mission["challenge"], evidence: string[]): Mission {
  const canonTerms = compactTerms([source.giver, ...source.canonTerms]);
  return {
    id,
    issuer: source.giver,
    issuerType: "commoner",
    title: source.title,
    request: source.objective,
    pressure: source.pressure,
    deadline: source.deadline,
    state: "offered",
    role,
    visibility,
    challenge,
    reward: source.reward,
    risk: source.risk,
    options: source.options.slice(0, 3),
    canon: { premise: source.objective, protectedTerms: canonTerms, evidence: evidence.slice(0, 4) },
    progress: { current: 0, required: challenge === "elevated" ? 3 : 2, triggerPhrases: source.options.slice(0, 3) },
  };
}

export function applyMissionDirective(state: GameState, directive: MissionDirectiveInput): { state: GameState; notice: MissionChangeNotice } {
  const none = { state, notice: { kind: "none", title: "", detail: "" } as MissionChangeNotice };
  if (!missionDirectiveIsCanonConsistent(state, directive)) return none;
  const main = activeMainMission(state);
  const target = directive.targetMissionId ? state.missions.find((mission) => mission.id === directive.targetMissionId) : undefined;
  const safeReason = directive.reason.trim().slice(0, 300);
  if (directive.kind === "replace_main") {
    if (!main || directive.targetMissionId !== main.id || !directive.replacement) return none;
    const replacementId = `mission-main-${state.tick + 1}`;
    const replacement = directiveMission(replacementId, directive.replacement, "main", "visible", "elevated", directive.evidence);
    const missions = normalizeMissionThreads(state.missions.map((mission) => mission.id === main.id ? { ...mission, state: "retired" as const, retiredReason: safeReason, supersededBy: replacementId } : mission).concat(replacement));
    return { state: { ...state, missions }, notice: { kind: "main-replaced", title: replacement.title, detail: safeReason } };
  }
  if (directive.kind === "create_hidden_side") {
    if (!directive.replacement) return none;
    const openSides = state.missions.filter((mission) => missionIsOpen(mission) && missionRoleOf(mission) === "side");
    if (openSides.length >= MAX_VISIBLE_ACTIVE_SIDE_LEADS) return none;
    const side = directiveMission(`mission-side-${state.tick + 1}-${openSides.length + 1}`, directive.replacement, "side", "hidden", "ordinary", directive.evidence);
    return { state: { ...state, missions: normalizeMissionThreads([...state.missions, side]) }, notice: { kind: "side-created", title: side.title, detail: safeReason } };
  }
  if (directive.kind === "reveal_side") {
    if (!target || missionRoleOf(target) !== "side" || missionVisibilityOf(target) !== "hidden" || visibleSideLeads(state).length >= MAX_VISIBLE_ACTIVE_SIDE_LEADS) return none;
    const missions = state.missions.map((mission) => mission.id === target.id ? { ...mission, visibility: "visible" as const } : mission);
    return { state: { ...state, missions }, notice: { kind: "side-revealed", title: target.title, detail: safeReason } };
  }
  if (directive.kind === "retire_side") {
    if (!target || missionRoleOf(target) !== "side" || !missionIsOpen(target)) return none;
    const missions = state.missions.map((mission) => mission.id === target.id ? { ...mission, state: "retired" as const, retiredReason: safeReason } : mission);
    return { state: { ...state, missions }, notice: { kind: "main-retired", title: target.title, detail: safeReason } };
  }
  if (directive.kind === "resolve" || directive.kind === "fail") {
    if (!target || !missionIsOpen(target)) return none;
    const stateName: MissionState = directive.kind === "resolve" ? "resolved" : "failed";
    const missions = state.missions.map((mission) => mission.id === target.id ? { ...mission, state: stateName } : mission);
    return { state: { ...state, missions }, notice: { kind: "none", title: target.title, detail: safeReason } };
  }
  return none;
}

/** Whitelists public fields so any legacy/private keys are never carried forward into the browser save. */
export function sanitizePublicRelationships(value: unknown): PublicRelationshipContact[] {
  if (!Array.isArray(value)) return [];
  const seeded = new Map(saikaPublicRelationships().map((contact) => [contact.contactId, contact]));
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.contactId !== "string") return [];
    const seed = seeded.get(entry.contactId as PublicRelationshipContact["contactId"]);
    if (!seed) return [];
    const publicPersona = Array.isArray(entry.publicPersona) ? entry.publicPersona.map((item, index) => readText(item, seed.publicPersona[index] ?? seed.publicPersona.at(-1)!)) : seed.publicPersona;
    const earnedKnowledge = Array.isArray(entry.earnedKnowledge) ? entry.earnedKnowledge.map((item, index) => readText(item, seed.earnedKnowledge[index] ?? seed.earnedKnowledge.at(-1)!)) : seed.earnedKnowledge;
    const blankSpace = Array.isArray(entry.blankSpace) ? entry.blankSpace.map((item, index) => readText(item, seed.blankSpace[index] ?? seed.blankSpace.at(-1)!)) : seed.blankSpace;
    return [{
      contactId: seed.contactId,
      nameTh: typeof entry.nameTh === "string" ? entry.nameTh : seed.nameTh,
      nameEn: typeof entry.nameEn === "string" ? entry.nameEn : seed.nameEn,
      iconKey: typeof entry.iconKey === "string" ? entry.iconKey : seed.iconKey,
      colorTone: ["navy", "vermilion", "ochre", "teal", "charcoal"].includes(String(entry.colorTone)) ? entry.colorTone as RelationshipTone : seed.colorTone,
      publicStatus: readText(entry.publicStatus, seed.publicStatus), publicPersona, earnedKnowledge, blankSpace,
      relationshipRole: readText(entry.relationshipRole, seed.relationshipRole),
      familiarity: clampRelationship(entry.familiarity, 0, 5, seed.familiarity), affinity: clampRelationship(entry.affinity, -3, 3, seed.affinity),
      ...(isRecord(entry.visibleSummary) ? { visibleSummary: readText(entry.visibleSummary, seed.visibleSummary ?? seed.relationshipRole) } : {}),
      events: seed.events,
    }];
  });
}

export type CharacterDraft = {
  name: string;
  identity: string;
  templateId: string;
  freeformOccupation: string;
  origin: string;
  strength: string;
  weakness: string;
  skills?: string[];
  flaws?: string[];
  answers: Record<string, string>;
  eraId?: string;
};

export type StarterTemplate = {
  id: string;
  label: string;
  short: string;
  start: string;
  age: number;
  pressure: string;
  compatibleRegions: string[];
  attributes: Attributes;
  social: Character["social"];
  resources: Character["resources"];
  masteries: Mastery[];
  inventory: InventoryItem[];
  mission: Omit<Mission, "id" | "state">;
};

export type StarterEra = {
  id: string;
  label: string;
  summary: string;
  years: readonly number[];
  templateIds: readonly string[];
};

/**
 * Player-facing eras constrain starting paths before any campaign is made.
 * Exact place/year eligibility remains an origin-profile concern and will not
 * be inferred from this display policy alone.
 */
export const STARTER_ERAS: StarterEra[] = [
  { id: "fractured-realm", label: "Fractured Realm · แผ่นดินแตกร้าว", summary: "ชุมชน วัด และบ้านเล็ก ๆ กำลังประคองตัวหลังความแตกแยก", years: [1467, 1477, 1488], templateIds: ["village_scribe", "jizamurai", "warrior_monk", "ronin"] },
  { id: "rival-houses", label: "Rival Houses · บ้านใหญ่ชิงอำนาจ", summary: "ข่าว ด่าน เอกสาร และผู้ค้ำเริ่มมีน้ำหนักพอ ๆ กับคมดาบ", years: [1493, 1507, 1511], templateIds: ["jizamurai", "ronin", "village_scribe", "shinobi"] },
  { id: "rising-warlords", label: "Rising Warlords · ขุนศึกผงาด", summary: "การรวมกำลังระดับแคว้นกดทับชุมชน วัด และผู้รับใช้บ้านใหญ่", years: [1531, 1543, 1548], templateIds: ["jizamurai", "warrior_monk", "shinobi", "daimyo_attendant"] },
  { id: "shifting-frontiers", label: "Shifting Frontiers · พรมแดนที่เปลี่ยน", summary: "งานช่าง ท่าเรือ ข่าว และกำลังเคลื่อนที่เริ่มเปลี่ยนรูปของสงคราม", years: [1549, 1555, 1561], templateIds: ["arms_craftsworker", "sakai_boat_crew", "shinobi", "mounted_samurai", "ronin"] },
  { id: "unification-campaigns", label: "Unification Campaigns · ศึกสู่การรวมแผ่นดิน", summary: "คำสั่ง เสบียง โรงช่าง และการเคลื่อนทัพกดดันทุกคน", years: [1565, 1569, 1575, 1580], templateIds: ["daimyo_attendant", "mounted_samurai", "arms_craftsworker", "sakai_boat_crew", "warrior_monk"] },
  { id: "late-unification", label: "Late Unification · ปลายยุครวมแผ่นดิน", summary: "เครือข่ายเมืองท่า การเดินเรือ และคำสั่งจากบ้านใหญ่ขยายตัว", years: [1583, 1588, 1590, 1595], templateIds: ["daimyo_attendant", "sakai_boat_crew", "coastal_sailor", "arms_craftsworker", "ronin"] },
  { id: "new-order", label: "A New Order · ระเบียบใหม่", summary: "เอกสาร ที่ดิน การเดินทาง และคนหลุดจากสังกัดกำหนดชีวิตในระเบียบใหม่", years: [1600, 1604, 1610, 1615], templateIds: ["daimyo_attendant", "ronin", "village_scribe", "coastal_sailor"] },
];

export function starterEraById(id: string | undefined) {
  return STARTER_ERAS.find((era) => era.id === id) ?? STARTER_ERAS[4];
}

export function starterTemplatesForEra(eraId: string | undefined) {
  const eligible = new Set(starterEraById(eraId).templateIds);
  return STARTER_TEMPLATES.filter((template) => eligible.has(template.id));
}

export type StarterOriginSelection = {
  id: string;
  year: number;
  region: string;
  location: string;
  origin: string;
  age: number;
};

/** Deterministic campaign-start selection; callers persist the returned id/seed in Local Save. */
export function selectStarterOrigin(eraId: string | undefined, templateId: string, seed: number): StarterOriginSelection {
  const era = starterEraById(eraId);
  const template = templateById(templateId);
  const normalizedSeed = Math.abs(Math.trunc(seed)) || 1;
  const year = era.years[normalizedSeed % era.years.length] ?? era.years[0];
  const region = template.compatibleRegions[normalizedSeed % template.compatibleRegions.length] ?? template.compatibleRegions[0] ?? "Japan";
  const variant = normalizedSeed % 3;
  return {
    id: `${era.id}-${template.id}-${variant + 1}`,
    year,
    region,
    location: template.start,
    origin: variant === 0 ? template.start : variant === 1 ? `${template.start} · เส้นทางงานของครอบครัว` : `${template.start} · คนในชุมชนยังจำชื่อเจ้าได้`,
    age: template.age,
  };
}

const item = (id: string, label: string, kind: ItemKind, description: string, slots: number, functions: InventoryItem["functions"], bonus?: InventoryItem["bonus"], special?: InventoryItem["special"]): InventoryItem => ({ id, label, kind, description, slots, functions, bonus, special, condition: "usable" });
export const MAX_MASTERY_LEVEL = 5;
export const MASTERY_PROGRESS_PER_LEVEL = 5;
export const MIN_STAT_VALUE = 1;
export const MAX_STAT_VALUE = 10;
export type Difficulty = 0 | 8 | 12 | 16 | 20 | 24 | 28 | 32;

export function normalizeStatValue(value: number) {
  return Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, Math.round(value)));
}

export function traitValueForRoll(value: number) {
  return normalizeStatValue(value);
}

export function traitProgressNeededForLevel(value: number) {
  const normalized = normalizeStatValue(value);
  if (normalized >= MAX_STAT_VALUE) return 0;
  if (normalized <= 3) return 3;
  if (normalized <= 6) return 4;
  if (normalized <= 8) return 5;
  return 6;
}

export function statXpNeededForValue(value: number) {
  return traitProgressNeededForLevel(value);
}

export function defaultStatXp(): StatXp {
  return { body: { xp: 0, totalXp: 0 }, hand: { xp: 0, totalXp: 0 }, wit: { xp: 0, totalXp: 0 }, mind: { xp: 0, totalXp: 0 }, heart: { xp: 0, totalXp: 0 } };
}

export function traitLevelDetails(level: number) {
  const normalized = normalizeStatValue(level);
  const levels = [
    { en: "Unseasoned", th: "ยังไม่ผ่านมือ", note: "เพิ่งเริ่มเห็นว่าตนรับมือเรื่องนี้ได้อย่างไร" },
    { en: "Grounded", th: "ตั้งหลักได้", note: "มีพื้นฐานพอจะลงมือในสถานการณ์ที่คุ้นเคย" },
    { en: "Capable", th: "ทำได้จริง", note: "เริ่มเป็นกำลังที่พึ่งพาได้ในเรื่องทั่วไป" },
    { en: "Honed", th: "ผ่านมือ", note: "Milestone แรก: วิธีของตัวละครเริ่มชัด" },
    { en: "Seasoned", th: "ช่ำชอง", note: "รับมือแรงกดดันโดยไม่เสียจังหวะง่าย" },
    { en: "Proven", th: "ผ่านบทพิสูจน์", note: "มีร่องรอยจากงานจริงรองรับฝีมือ" },
    { en: "Remarkable", th: "โดดเด่น", note: "Milestone สอง: คนรอบตัวเริ่มมองเห็นความต่าง" },
    { en: "Renowned", th: "มีชื่อ", note: "ชื่อเสียงในสายงานเริ่มนำหน้าตัวละคร" },
    { en: "Exceptional", th: "หาได้ยาก", note: "ทำสิ่งที่คนทั่วไปต้องพึ่งการเตรียมตัวมากกว่านี้" },
    { en: "Signature", th: "ลายมือของตน", note: "Milestone สุดท้าย: เป็นจุดสูงสุดของ Trait นี้" },
  ] as const;
  return levels[normalized - 1];
}

export function canonicalDifficulty(value: number): Difficulty {
  if (value <= 10) return 8;
  if (value <= 14) return 12;
  if (value <= 18) return 16;
  if (value <= 22) return 20;
  if (value <= 26) return 24;
  if (value <= 30) return 28;
  return 32;
}

/** แปลง stance เป็นคะแนนเริ่มต้นสำหรับ FactionReputation (สอดคล้อง worldEvents.stanceFromScore) */
function stanceScore(stance: string): number {
  switch (stance) {
    case "allies": return 3;
    case "friendly": return 2;
    case "helpful": case "cooperative": return 1.5;
    case "neutral": case "conditional-cooperation": return 0;
    case "wary": return -1;
    case "interfering": return -2;
    case "hostile": return -3;
    case "war": return -3;
    default: return 0;
  }
}

/** แปลงระดับ heat (0..5) เป็น status ตรงกับ worldEvents.applyWorldEvent */
function heatStatus(level: number): FactionHeat["status"] {
  if (level <= 0) return "unseen";
  if (level <= 1) return "suspected";
  if (level <= 3) return "identified";
  if (level <= 4) return "wanted";
  return "archived";
}

export function xpNeededForMasteryLevel(level: number) {
  return level >= MAX_MASTERY_LEVEL ? 0 : MASTERY_PROGRESS_PER_LEVEL;
}

export function masteryBonusForLevel(level: number) {
  return Math.max(0, Math.min(MAX_MASTERY_LEVEL, Math.round(level)));
}

export function masteryLevelDetails(level: number) {
  const normalized = masteryBonusForLevel(level);
  const levels = [
    { id: "untrained", en: "Untrained", th: "ยังไม่ชำนาญ", bonus: 0, note: "ทำได้ด้วยเหตุผลในเรื่อง แต่ไม่มีการฝึกเฉพาะทาง" },
    { id: "familiar", en: "Familiar", th: "คุ้นมือ", bonus: 1, note: "เริ่มทำสิ่งนี้ได้เป็นระบบ" },
    { id: "skilled", en: "Skilled", th: "ชำนาญ", bonus: 2, note: "เป็นคนที่ทีมพึ่งพาได้ในงานนี้" },
    { id: "expert", en: "Expert", th: "เชี่ยวชาญ", bonus: 3, note: "รับมือกับความกดดันและงานยากได้" },
    { id: "master", en: "Master", th: "อาจารย์", bonus: 4, note: "ความเชี่ยวชาญหายาก มีชื่อในสายงานนั้น" },
    { id: "peerless", en: "Peerless", th: "หาตัวจับไม่ได้", bonus: 5, note: "ในแผ่นดินหาคนฝีมือใกล้กันแทบไม่ได้" },
  ] as const;
  return levels[normalized];
}

function levelForLegacyMastery(entry: Mastery) {
  if (typeof entry.level === "number") return masteryBonusForLevel(entry.level);
  const legacyRank = entry.rank ?? 0;
  if (legacyRank >= 17) return 5;
  if (legacyRank >= 13) return 4;
  if (legacyRank >= 9) return 3;
  if (legacyRank >= 5) return 2;
  return legacyRank > 0 ? 1 : 0;
}

export function normalizeMasteryProgress(entry: Mastery, legacy = false): Mastery {
  const level = legacy ? levelForLegacyMastery(entry) : masteryBonusForLevel(entry.level);
  return { ...entry, rank: level, level, xp: level >= MAX_MASTERY_LEVEL ? 0 : Math.max(0, Math.min(entry.xp ?? 0, xpNeededForMasteryLevel(level) - 1)), totalXp: Math.max(0, entry.totalXp ?? 0) };
}

function defaultProgression(context: CampaignContext, ageAtCampaignStart = 20, birthSeason: Season = context.season): ProgressionState {
  return { leaf: 1, segment: "day", timeMarksSinceLeaf: 0, daysSinceLeaf: 0, ageAtCampaignStart, currentAge: ageAtCampaignStart, birthSeason, campaignStartYear: context.year, growthPoints: 0, milestonePoints: 0, vitalEvents: [] };
}

const mastery = (id: string, label: string, level: number, origin: string, tags: string[]): Mastery => normalizeMasteryProgress({ id, label, level, origin, tags });

export const RELATIONSHIP_QUESTIONS = [
  ["life_before", "ก่อนหน้านี้เจ้ามีชีวิตอย่างไร", ["past", "home", "work"]],
  ["stance", "เจ้ายืนหยัดเพื่ออะไร หรือไม่ยืนหยัดเพื่ออะไรเลย", ["conviction", "refusal", "allegiance"]],
] as const;

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "village_scribe", label: "เสมียนหมู่บ้าน / คนคัดบัญชีชุมชน", short: "คนหนุ่มผู้รู้บัญชีข้าว จดหมาย และความลับที่ทุกบ้านไม่อยากให้หลุด", start: "มิกาวะหรือชินาโนะ", age: 19, pressure: "บัญชีข้าวไม่ตรงกับคำสั่งเกณฑ์ และชื่อในกระดาษอาจทำร้ายทั้งหมู่บ้าน", compatibleRegions: ["Mikawa", "Shinano"],
    attributes: { body: 1, hand: 1, wit: 2, mind: 4, heart: 2 }, social: { rank: 0, honor: 1, influence: 1, information: 2, stain: 0 }, resources: { property: 1, supplies: 2, credit: 1 }, masteries: [mastery("village-ledger", "บัญชีข้าวและแรงงาน", 3, "คัดตัวเลขให้ชุมชน", ["ledger", "rice", "labor"]), mastery("plain-script", "จดหมายและตรารับรอง", 2, "เรียนจากเสมียนเฒ่า", ["document", "letter"]), mastery("village-listening", "ฟังข่าวในชุมชน", 1, "คนส่งข่าวมักพูดต่อหน้าคนเขียน", ["news", "social"])], inventory: [item("village-ledger", "สมุดบัญชีข้าว", "document", "ตัวเลขที่คุ้มครองคนบางคนได้ และมัดมือคนเขียนด้วย", 1, ["unlock", "bonus"], { stat: "mind", value: 1, tags: ["ledger", "rice"] }), item("ink-case", "กล่องหมึกกับตราไม้", "equipment", "เครื่องเขียนเล็ก ๆ สำหรับคัดสำเนาและตรวจรอยแก้", 1, ["bonus"], { stat: "hand", value: 1, tags: ["document", "inspection"] })], mission: { issuer: "ผู้ใหญ่บ้าน", issuerType: "commoner", title: "รายชื่อที่ไม่ควรถูกส่ง", request: "หาทางแก้บัญชีแรงงานก่อนนายกองมารับรายชื่อชายหนุ่ม", pressure: "มีชื่อคนป่วยและลูกหนี้ปะปนอยู่ในกระดาษ", deadline: "ก่อนยามพลบ", reward: "คำค้ำจากชุมชนและเสบียง", risk: "ถูกกล่าวหาว่าปลอมบัญชี", options: ["ตรวจบัญชี", "หาคนแทน", "ต่อรองรายชื่อ"] }
  },
  {
    id: "jizamurai", label: "จิซามูไร / ซามูไรชาวนา", short: "ผู้ถือดาบและผืนนาเล็ก ๆ ที่ต้องรักษาคนของตนโดยไม่ขัดคำสั่งจนพัง", start: "โอมิหรือโอวาริ", age: 20, pressure: "ฤดูเก็บเกี่ยวปะทะการเกณฑ์แรงงาน", compatibleRegions: ["Omi", "Owari"],
    attributes: { body: 3, hand: 2, wit: 1, mind: 2, heart: 2 }, social: { rank: 1, honor: 1, influence: 1, information: 1, stain: 0 }, resources: { property: 2, supplies: 3, credit: 0 }, masteries: [mastery("field-command", "คุมคนในท้องนา", 3, "งานของบ้าน", ["village", "leadership", "labor"]), mastery("spear-drill", "หอกและแนวรบ", 2, "การฝึกตามคำสั่ง", ["fight", "weapon"]), mastery("water-rights", "คลองและผลผลิต", 1, "ดูแลผืนนา", ["rice", "water"])], inventory: [item("field-spear", "หอกไม้ประจำบ้าน", "equipment", "อาวุธที่ใช้ได้ทั้งคุ้มกันบ้านและยืนแนว", 2, ["bonus"], { stat: "body", value: 1, tags: ["fight", "weapon"] }), item("harvest-ledger", "บัญชีผลผลิต", "document", "หลักฐานจำนวนข้าวและแรงงานของหมู่บ้าน", 1, ["unlock"], { stat: "mind", value: 1, tags: ["ledger", "rice"] })], mission: { issuer: "ผู้ใหญ่บ้าน", issuerType: "commoner", title: "คนทำนากับคนถือหอก", request: "กันแรงงานสำคัญไม่ให้ถูกเรียกออกไปก่อนเก็บเกี่ยว", pressure: "นายกองยืนยันคำสั่งเกณฑ์", deadline: "2 วัน", reward: "เสบียงและคำค้ำจากชุมชน", risk: "ขัดคำสั่งต่อหน้าพยาน", options: ["ยื่นบัญชี", "หาคนแทน", "ต่อรองข้าว"] }
  },
  {
    id: "ronin", label: "โรนิน / ผู้ไร้นาย", short: "นักรบหนุ่มที่ยังมีฝีมือ แต่ไม่มีตราบ้าน ผู้ค้ำ หรือรายได้แน่นอน", start: "ยามะชิโระหรือเซตสึ", age: 20, pressure: "ด่านถามว่าเจ้าเป็นคนของใคร", compatibleRegions: ["Yamashiro", "Settsu"],
    attributes: { body: 2, hand: 3, wit: 2, mind: 1, heart: 2 }, social: { rank: 0, honor: 1, influence: 0, information: 1, stain: 1 }, resources: { property: 1, supplies: 2, credit: 0 }, masteries: [mastery("sword-work", "ดาบและระยะประชิด", 3, "อดีตการรับใช้", ["fight", "weapon"]), mastery("road-sense", "อ่านถนนและทางหนี", 2, "ชีวิตบนเส้นทาง", ["travel", "route", "escape"]), mastery("camp-survival", "เอาตัวรอดนอกบ้าน", 1, "ไม่มีหลังคาค้ำ", ["camp", "supply"])], inventory: [item("travel-pass", "หนังสือผ่านทางเก่า", "document", "เอกสารที่ยังพอใช้ต่อรองได้ แต่ถูกตรวจละเอียด", 1, ["unlock"], { stat: "mind", value: 1, tags: ["gate", "travel"] }), item("worn-blade", "ดาบเก่าที่ลับคมเอง", "equipment", "อาวุธมีรอยใช้ แต่ไม่ใช่ตราของบ้านใด", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "weapon"] })], mission: { issuer: "เจ้าของขบวนสินค้า", issuerType: "merchant", title: "ค่าจ้างระหว่างทาง", request: "พาคนส่งสารข้ามด่านก่อนผู้คุมเปลี่ยนเวร", pressure: "เอกสารของผู้ว่าจ้างไม่สมบูรณ์", deadline: "ก่อนด่านปิด", reward: "ค่าจ้างและผู้ค้ำชั่วคราว", risk: "ผู้คุมจดชื่อและอาวุธ", options: ["คุ้มกันตรง", "ลอบผ่าน", "ต่อรองค่าผ่านทาง"] }
  },
  {
    id: "sakai_boat_crew", label: "ลูกน้องคนเรือเมืองซาไก", short: "แรงงานเรือหนุ่มที่รู้กระแสน้ำ ข่าวท่า และหนี้ค่าจ้างมากกว่าราคาสินค้า", start: "ซาไก แคว้นอิซุมิ", age: 19, pressure: "นายเรือหายตัวไปพร้อมค่าแรง ส่วนเรือจะออกเมื่อกระแสน้ำเปลี่ยน", compatibleRegions: ["Sakai", "Izumi", "Settsu"],
    attributes: { body: 2, hand: 2, wit: 3, mind: 1, heart: 2 }, social: { rank: 0, honor: 1, influence: 1, information: 2, stain: 0 }, resources: { property: 1, supplies: 3, credit: 1 }, masteries: [mastery("sakai-waterway", "กระแสน้ำและท่าเรือ", 3, "งานลากเรือและเทียบท่า", ["water", "route", "boat"]), mastery("cargo-handling", "ยกของและผูกสัมภาระ", 2, "งานใต้ท้องเรือ", ["cargo", "body"]), mastery("dock-rumors", "ฟังข่าวท่า", 1, "คนงานได้ยินก่อนคนมีเงิน", ["news", "market"])], inventory: [item("boat-hook", "ขอเกี่ยวเรือและเชือกปอ", "equipment", "ใช้ผูก ลาก และปีนในพื้นที่ท่า", 2, ["bonus"], { stat: "body", value: 1, tags: ["water", "boat"] }), item("dock-token", "ไม้บากค่าจ้าง", "bond", "หลักฐานว่ามีคนติดค่าแรงเจ้าอยู่", 0, ["unlock", "exchange"], { stat: "wit", value: 1, tags: ["dock", "debt"] })], mission: { issuer: "แม่ครัวเรือ", issuerType: "commoner", title: "ค่าแรงใต้ท้องเรือ", request: "ตามหานายเรือหรือหลักฐานค่าแรงก่อนเรือออกจากซาไก", pressure: "คนงานสองกลุ่มเริ่มโทษกันว่าใครเอาเงินไป", deadline: "ก่อนน้ำขึ้น", reward: "ค่าจ้างค้างและทางขึ้นเรือ", risk: "ถูกขับจากท่าหรือมีหนี้กับลูกเรือ", options: ["ถามคนท่า", "ตรวจไม้บาก", "ขึ้นเรือกลางคืน"] }
  },
  {
    id: "arms_craftsworker", label: "ช่างยุทโธปกรณ์ / ช่างปืนไฟ", short: "ช่างหนุ่มที่ถูกต้องการเพราะมือแม่น และถูกจับตาเพราะรู้ว่างานใดไปถึงใคร", start: "คุนิโทโมะหรือคิอิ", age: 20, pressure: "คำสั่งผลิต วัตถุดิบ และร่องรอยงาน", compatibleRegions: ["Omi", "Kii"],
    attributes: { body: 2, hand: 4, wit: 1, mind: 2, heart: 1 }, social: { rank: 0, honor: 1, influence: 1, information: 1, stain: 0 }, resources: { property: 2, supplies: 2, credit: 1 }, masteries: [mastery("metal-and-lock", "โลหะและกลไก", 3, "งานช่าง", ["repair", "metal", "craft"]), mastery("inspection", "ตรวจร่องรอยงาน", 2, "โรงช่าง", ["evidence", "inspection"]), mastery("materials", "จัดหาวัตถุดิบ", 1, "เครือข่ายช่าง", ["market", "materials"])], inventory: [item("tool-roll", "เครื่องมือช่าง", "equipment", "เครื่องมือสำหรับตรวจและซ่อมงานละเอียด", 2, ["bonus"], { stat: "hand", value: 1, tags: ["repair", "craft"] }), item("charcoal-mark", "ตราถ่านโรงช่าง", "bond", "รอยหมายที่พาคนกลับไปถึงโรงช่างเดิมได้", 0, ["unlock"], { stat: "mind", value: 1, tags: ["metal", "workshop"] })], mission: { issuer: "หัวหน้าโรงช่าง", issuerType: "samurai", title: "ลำกล้องที่มีรอยบิ่น", request: "ตรวจอาวุธที่ถูกกล่าวหาว่าถูกส่งให้คนผิดฝ่าย", pressure: "ผู้คุมคลังต้องการชื่อผู้รับผิด", deadline: "ภายในคืนนี้", reward: "วัสดุและสิทธิ์ใช้โรงช่าง", risk: "ชื่อถูกโยงกับการผลิต", options: ["ตรวจของ", "แก้รอย", "เปิดบัญชีคลัง"] }
  },
  {
    id: "shinobi", label: "สายลับชิโนบิ / ผู้สืบข่าว", short: "คนทำงานเงียบที่ใช้การสังเกต การปลอมตัว และทางหนี มากกว่าตำนานนักฆ่า", start: "อิกะหรือโคงะ", age: 19, pressure: "ข่าวที่ถืออยู่ช่วยคนหนึ่งกลุ่ม และทำร้ายอีกกลุ่ม", compatibleRegions: ["Iga", "Koga"],
    attributes: { body: 1, hand: 2, wit: 4, mind: 2, heart: 1 }, social: { rank: 0, honor: 1, influence: 0, information: 2, stain: 1 }, resources: { property: 1, supplies: 2, credit: 1 }, masteries: [mastery("surveillance", "เฝ้าดูและอ่านช่องว่าง", 3, "งานสืบข่าว", ["hide", "watch", "secret"]), mastery("disguise", "ปลอมตัวและผ่านคน", 2, "ทางเล็กของอิกะ", ["social", "wit", "travel"]), mastery("signals", "สัญญาณและจุดนัด", 1, "เครือข่ายคนส่งข่าว", ["network", "route"])], inventory: [item("signal-cord", "เชือกสัญญาณถัก", "bond", "ใช้ยืนยันจุดนัดและคนในเครือข่ายบางส่วน", 0, ["unlock"], { stat: "wit", value: 1, tags: ["network", "route"] }), item("plain-cloak", "เสื้อคลุมไร้ตรา", "equipment", "เสื้อเดินทางที่ไม่บอกว่าเป็นคนของใคร", 1, ["bonus"], { stat: "wit", value: 1, tags: ["hide", "travel"] })], mission: { issuer: "คนส่งสารของหมู่บ้าน", issuerType: "commoner", title: "ข่าวที่ไม่ควรถูกอ่าน", request: "นำข่าวผ่านด่านโดยไม่ให้ผู้คุมยึดเอกสาร", pressure: "คำสั่งในข่าวอาจทำร้ายชุมชน", deadline: "ก่อนรุ่งเช้า", reward: "ข่าวและทางลัด", risk: "ถูกสงสัยว่าเป็นสาย", options: ["ลอบผ่าน", "ใช้คนกลาง", "ทำสำเนา"] }
  },
  {
    id: "warrior_monk", label: "พระนักรบ", short: "นักบวชติดอาวุธที่รักษาทางวัด คนพักพิง และของที่ไม่ควรถูกยึดง่าย ๆ", start: "คากะ ยามาโตะ หรือคิอิ", age: 20, pressure: "ผู้ลี้ภัยขอที่พัก ขณะที่คนถืออำนาจขอรายชื่อ", compatibleRegions: ["Kaga", "Yamato", "Kii"],
    attributes: { body: 3, hand: 2, wit: 1, mind: 2, heart: 3 }, social: { rank: 0, honor: 2, influence: 1, information: 1, stain: 0 }, resources: { property: 1, supplies: 3, credit: 0 }, masteries: [mastery("naginata-guard", "ง้าวและการคุ้มกัน", 3, "ยามทางวัด", ["fight", "weapon", "protect"]), mastery("temple-routes", "ทางวัดและที่พักพิง", 2, "การเดินทางของศาสนสถาน", ["temple", "shelter", "travel"]), mastery("vows", "คำสัตย์และการไกล่เกลี่ย", 1, "หน้าที่ต่อผู้ขอพึ่ง", ["oath", "talk"])], inventory: [item("temple-letter", "จดหมายรับรองของวัด", "document", "เอกสารขอที่พักพิงและเปิดการเจรจา", 1, ["unlock", "bonus"], { stat: "heart", value: 1, tags: ["temple", "request"] }), item("travel-naginata", "ง้าวเดินทาง", "equipment", "อาวุธที่เห็นได้ชัดว่าใช้คุ้มกัน ไม่ใช่ซ่อนตัว", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "protect"] })], mission: { issuer: "ผู้ดูแลวัด", issuerType: "temple", title: "คนที่ขอหลบใต้ชายคา", request: "หาทางให้ครอบครัวผู้ลี้ภัยผ่านด่านโดยไม่ทำให้วัดถูกกล่าวหาว่าเลือกข้าง", pressure: "ผู้คุมขอรายชื่อคนพัก", deadline: "ภายในวัน", reward: "ที่พักและข่าวจากวัด", risk: "วัดมีหนี้หรือถูกจับตา", options: ["ไกล่เกลี่ย", "ยื่นจดหมาย", "พาออกทางน้ำ"] }
  },
  {
    id: "daimyo_attendant", label: "คนรับใช้บ้านไดเมียว / ผู้ถือคำสั่ง", short: "ผู้ช่วยหนุ่มในบ้านใหญ่ที่เข้าถึงเอกสารได้บ้าง แต่ยังไม่มีอำนาจพอจะปฏิเสธคำสั่ง", start: "อะซุจิ แคว้นโอมิ", age: 19, pressure: "คำสั่งเร็วและความหวาดระแวงในบ้านใหญ่", compatibleRegions: ["Omi"],
    attributes: { body: 1, hand: 2, wit: 2, mind: 3, heart: 2 }, social: { rank: 1, honor: 1, influence: 1, information: 1, stain: 0 }, resources: { property: 2, supplies: 2, credit: 1 }, masteries: [mastery("orders-and-seals", "คำสั่งและตราปิดผนึก", 3, "งานรับใช้บ้านใหญ่", ["document", "authority"]), mastery("room-reading", "อ่านอารมณ์ในห้องสั่งการ", 2, "งานเฝ้าประตู", ["social", "wit"]), mastery("escort", "คุ้มกันระยะใกล้", 1, "หน้าที่คนถือของ", ["protect", "fight"])], inventory: [item("sealed-order", "คำสั่งปิดผนึก", "document", "คำสั่งที่เปิดประตูได้ แต่ไม่ควรถูกอ่านต่อหน้าคนผิด", 1, ["unlock", "bonus"], { stat: "mind", value: 1, tags: ["order", "authority"] }, { mode: "auto_pass", tags: ["order", "authority", "คำสั่ง", "ตรา", "ด่าน", "ผู้คุม", "ผ่าน"], reason: "คำสั่งปิดผนึกแท้เปิดทางตามขอบเขตของเอกสาร" }), item("house-badge", "ป้ายผ้าของบ้าน", "status", "สวมแล้วผ่านบางประตูได้ แต่ทำให้คนรู้ว่าเจ้าอยู่ฝ่ายใด", 0, ["unlock"], { stat: "heart", value: 1, tags: ["house", "authority"] })], mission: { issuer: "เสมียนของบ้าน", issuerType: "ruler", title: "คำสั่งที่มาถึงเร็วเกินไป", request: "นำคำสั่งไปถึงผู้รับโดยไม่ทำให้ข่าวรั่ว", pressure: "คนในบ้านกำลังจับตาว่าคำสั่งเกี่ยวกับใคร", deadline: "ก่อนประชุม", reward: "คำรับรองและสิทธิ์เข้าถึง", risk: "ถูกโยงกับการกวาดล้าง", options: ["ส่งตรง", "ใช้คนกลาง", "อ่านอารมณ์ผู้รับ"] }
  },
  {
    id: "mounted_samurai", label: "นักรบม้าซามูไร / นายกองทหารม้า", short: "นักรบหนุ่มที่นำคนไม่กี่คนได้ในสนาม แต่ยังต้องพิสูจน์ว่าคำสั่งของตนคุ้มกับชีวิตผู้ใต้บังคับ", start: "มุซาชิหรือชินาโนะ", age: 20, pressure: "ม้าหายหนึ่งตัว และคำสั่งลาดตระเวนจะกลายเป็นความผิดของนายกอง", compatibleRegions: ["Musashi", "Shinano"],
    attributes: { body: 3, hand: 3, wit: 2, mind: 1, heart: 1 }, social: { rank: 1, honor: 1, influence: 0, information: 1, stain: 0 }, resources: { property: 2, supplies: 3, credit: 0 }, masteries: [mastery("horse-and-bow", "ขี่ม้าและธนู", 3, "การฝึกทหารม้า", ["ride", "fight", "weapon"]), mastery("mounted-command", "นำกำลังขนาดเล็ก", 2, "หน้าที่นายกอง", ["leadership", "fight"]), mastery("field-reading", "อ่านพื้นสนาม", 1, "ลาดตระเวน", ["route", "wit"])], inventory: [item("riding-bow", "ธนูคันสั้นกับปลอกลูก", "equipment", "อาวุธที่ใช้ได้บนหลังม้าและในระยะเปิด", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "ride"] }), item("horse-tether", "เชือกบังเหียนสำรอง", "reserve", "ของชิ้นเล็กที่ช่วยแก้ปัญหาม้าหรือค่ายชั่วคราว", 1, ["bonus"], { stat: "body", value: 1, tags: ["ride", "camp"] })], mission: { issuer: "นายกองอาวุโส", issuerType: "samurai", title: "รอยกีบที่หายไป", request: "ตามหาม้ากับทหารลาดตระเวนที่ไม่กลับมาตามกำหนด", pressure: "คำสั่งห้ามเคลื่อนกำลังเกินจำเป็น แต่ข่าวลือเริ่มวิ่งเร็ว", deadline: "ก่อนมืด", reward: "ความเชื่อมือของกองและสิทธิ์เลือกม้า", risk: "ถูกกล่าวหาว่าพาคนออกนอกคำสั่ง", options: ["ตามรอยกีบ", "ถามค่าย", "แยกหน่วยลาดตระเวน"] }
  },
  {
    id: "coastal_sailor", label: "คนเดินเรือชายฝั่ง / นายท้ายเรือหนุ่ม", short: "คนเรือที่อ่านลม คลื่น และนิสัยคนบนท่าได้ แต่ยังไม่ได้เป็นเจ้าของเรือของตน", start: "อิโยะหรือชิมะ", age: 19, pressure: "เรือสองฝ่ายอ้างสิทธิ์ในช่องแคบ ขณะที่ผู้โดยสารไม่ควรถูกเห็น", compatibleRegions: ["Iyo", "Shima"],
    attributes: { body: 2, hand: 2, wit: 3, mind: 2, heart: 1 }, social: { rank: 0, honor: 1, influence: 1, information: 2, stain: 0 }, resources: { property: 1, supplies: 3, credit: 1 }, masteries: [mastery("coastal-pilot", "นำร่องชายฝั่ง", 3, "งานเรือ", ["water", "route", "boat"]), mastery("crew-bonds", "อ่านใจลูกเรือ", 2, "อยู่ในเรือลำเดียวกัน", ["crew", "social"]), mastery("tide-bargain", "ค่าผ่านและคำรับรอง", 1, "ท่าเรือ", ["negotiation", "passage"])], inventory: [item("water-pass", "ใบผ่านทางน้ำเก่า", "document", "คำรับรองพื้นที่ที่ใช้ได้กับบางจุดเท่านั้น", 1, ["unlock", "bonus"], { stat: "wit", value: 1, tags: ["water", "passage"] }), item("pilot-rope", "เชือกนำร่อง", "equipment", "เชือกชุบน้ำเกลือที่ใช้วัดน้ำตื้นและผูกเรือ", 1, ["bonus"], { stat: "wit", value: 1, tags: ["water", "route"] })], mission: { issuer: "นายท้ายผู้เฒ่า", issuerType: "merchant", title: "เรือที่ไม่ควรติดธง", request: "พาสินค้าและคนผ่านทางน้ำโดยไม่จ่ายค่าคุ้มกันซ้ำ", pressure: "เรือสองฝ่ายอ้างสิทธิ์ในช่องแคบ", deadline: "ก่อนกระแสน้ำเปลี่ยน", reward: "เส้นทางน้ำและเครดิตท่าเรือ", risk: "หนี้กับคนเรือหรือศัตรูจำเรือ", options: ["ต่อรอง", "ใช้ทางน้ำแคบ", "แลกข่าว"] }
  },
];

export function templateById(id: string) {
  return STARTER_TEMPLATES.find((template) => template.id === id) ?? STARTER_TEMPLATES[2];
}

export function startingAttributesForTemplate(template: StarterTemplate): Attributes {
  const startingValue = (value: number) => value <= 1 ? 1 : value <= 2 ? 2 : 3;
  return { body: startingValue(template.attributes.body), hand: startingValue(template.attributes.hand), wit: startingValue(template.attributes.wit), mind: startingValue(template.attributes.mind), heart: startingValue(template.attributes.heart) };
}

function selectedMasteriesForDraft(draft: CharacterDraft, template: StarterTemplate): Mastery[] {
  const requested = (draft.skills ?? template.masteries.map((entry) => entry.label)).map((entry) => entry.trim()).filter((entry) => template.masteries.some((mastery) => mastery.label === entry));
  const labels = Array.from(new Set([...requested, ...template.masteries.map((entry) => entry.label)])).slice(0, 5);
  const selected = labels.slice(0, Math.max(3, Math.min(5, labels.length)));
  return selected.map((label, index) => {
    const templateMastery = template.masteries.find((entry) => entry.label === label);
    if (templateMastery) return normalizeMasteryProgress({ ...templateMastery, level: 1, rank: 1, xp: 0, totalXp: 0, masteryMark: undefined });
    return normalizeMasteryProgress({ id: `chosen-skill-${index + 1}`, label, level: 1, rank: 1, xp: 0, totalXp: 0, origin: "เลือกตอนสร้างตัวละคร", tags: ["custom"] });
  });
}

function selectedFlawsForDraft(draft: CharacterDraft) {
  const supplied = (draft.flaws ?? []).map((entry) => entry.trim()).filter(Boolean);
  const candidate = supplied.length ? supplied : [draft.weakness.trim()];
  const flaws = Array.from(new Set(candidate)).slice(0, 2);
  return flaws.length ? flaws : ["มีหนี้ที่ยังไม่กล้าพูดถึง"];
}

export function createCharacter(draft: CharacterDraft): Character {
  const template = templateById(draft.templateId);
  const occupation = draft.templateId === "freeform" ? (draft.freeformOccupation.trim() || "ผู้เดินทางไร้สังกัด") : template.label;
  const flaws = selectedFlawsForDraft(draft);
  return {
    id: `char-${Date.now()}`,
    name: draft.name.trim() || "ผู้ไร้นาม",
    identity: draft.identity.trim() || "ไม่ได้ระบุ",
    occupationId: draft.templateId,
    occupation,
    origin: draft.origin.trim() || template.start,
    strength: draft.strength.trim() || "ทำงานภายใต้แรงกดดันได้",
    weakness: flaws[0],
    flaws,
    attributes: startingAttributesForTemplate(template),
    statXp: defaultStatXp(),
    masteries: selectedMasteriesForDraft(draft, template),
    vitals: { wounds: 0, focus: 5, maxWounds: 6, maxFocus: 6 },
    social: { ...template.social },
    resources: { ...template.resources },
    inventory: template.inventory.map((entry) => ({ ...entry })),
    pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: draft.answers[id] || "ยังไม่บอก", tags: [...tags], weight: draft.answers[id] ? 2 : 1 })),
  };
}

type OpeningProfile = { title: string; background: string; turn: string };

const STARTER_OPENING_PROFILES: Record<string, readonly OpeningProfile[]> = {
  village_scribe: [
    { title: "บัญชีที่มีชื่อเกินมา", background: "กระดาษแรงงานที่เจ้าคัดลอกมาตลอดคืนมีชื่อซ้ำอยู่หนึ่งบรรทัด และคนที่ขอให้เจ้าเงียบก็ยืนรออยู่ใกล้ยุ้งข้าว", turn: "หากเจ้าปล่อยให้หมึกแห้งตามเดิม คนหนึ่งอาจถูกเรียกไปแทนอีกคน; หากขีดแก้ ทุกคนจะรู้ว่าเจ้าจับมือกับความลับ" },
    { title: "ตราไม้ใต้เสื่อเก่า", background: "หญิงชราคนหนึ่งนำตราไม้เก่ามาฝากไว้โดยไม่เรียกชื่อเจ้าต่อหน้าคนอื่น พร้อมขอให้ค้นหาว่าใครกำลังใช้สำเนาเอกสารกดชุมชน", turn: "เจ้าต้องเลือกว่าจะปกป้องหลักฐานไว้เงียบ ๆ หรือเปิดมันต่อหน้าผู้ที่มีอำนาจอ่านบัญชีได้มากกว่าเจ้า" },
    { title: "ข่าวที่เขียนไม่ครบ", background: "จดหมายที่มาถึงชุมชนถูกตัดข้อความช่วงสำคัญออกไป เหลือเพียงคำสั่งที่อ่านได้สองความหมายและความกลัวของคนที่จะต้องทำตาม", turn: "งานของเจ้าไม่ใช่แค่คัดตัวอักษร แต่ต้องหาว่าช่องว่างนั้นถูกทิ้งไว้เพื่อคุ้มครองใครหรือทำร้ายใคร" },
  ],
  jizamurai: [
    { title: "หอกข้างคันนา", background: "คนในบ้านเริ่มลับหอกแทนเตรียมเมล็ดข้าว เมื่อข่าวการเกณฑ์แรงงานเดินมาถึงเร็วกว่าที่ผู้ใหญ่บ้านคาด", turn: "เจ้าต้องรักษาคนทำนาและศักดิ์ศรีของบ้านโดยไม่เปลี่ยนความกังวลของพวกเขาให้กลายเป็นการปะทะที่ไม่มีทางกลับ" },
    { title: "สัญญาข้าวสองฉบับ", background: "สัญญาส่งข้าวสองแผ่นให้จำนวนไม่ตรงกัน และทั้งสองฝ่ายต่างยืนยันว่าถือฉบับจริงอยู่ในมือ", turn: "หากเจ้าตัดสินผิด บ้านของตนอาจเสียเสบียง; หากหนีปัญหา คนที่อ่อนแอกว่าจะเป็นคนจ่ายราคา" },
    { title: "รอยเท้าที่แนวคัน", background: "ก่อนฟ้าสาง มีรอยเท้าหลายคู่ข้ามคันนาของบ้านเจ้าไปโดยไม่มีใครกล้าพูดว่าเห็นใคร", turn: "ผู้คนรอให้เจ้าตัดสินว่าจะเรียกคนถือหอกออกตามรอย หรือเก็บเรื่องไว้จนรู้ว่าการตามหาอาจลากบ้านเข้าสู่ข้อกล่าวหา" },
  ],
  ronin: [
    { title: "ชื่อในสมุดด่าน", background: "ผู้คุมด่านพลิกสมุดรายชื่อช้าเกินจำเป็น แล้วถามว่าเหตุใดผู้ไร้นายจึงเดินทางพร้อมจดหมายที่ไม่ใช่ของตน", turn: "เจ้าต้องพาคนส่งสารไปให้ถึงโดยไม่ยอมให้ชื่อของตนกลายเป็นข้ออ้างให้ใครกักตัวคนทั้งขบวน" },
    { title: "ค่าจ้างที่ไม่มีผู้ค้ำ", background: "นายจ้างพูดถึงค่าจ้างก้อนหนึ่งแต่ไม่ยอมวางผู้ค้ำ ขณะคนส่งสารเริ่มสงสัยว่าเส้นทางนี้ถูกเลือกเพราะไม่มีใครอยากรับผิด", turn: "เจ้าต้องตัดสินใจว่าจะรับงานด้วยศักดิ์ศรีของตนเอง หาหลักฐานเพิ่ม หรือยอมเสียรายได้เพื่อไม่ถูกใช้เป็นแพะ" },
    { title: "ดาบเก่ากับคำถามใหม่", background: "คนแปลกหน้าจำรอยซ่อมบนดาบของเจ้าได้และขอคุยใต้ชายคา โดยย้ำว่าไม่ต้องการเงินแต่ต้องการให้เจ้าทำบางอย่างก่อนด่านปิด", turn: "ทุกคำตอบอาจเปิดทางให้เจ้า หรือผูกชื่อของเจ้าเข้ากับเรื่องที่เจ้ามิได้เริ่ม" },
  ],
  sakai_boat_crew: [
    { title: "ไม้บากค่าจ้าง", background: "ไม้บากค่าจ้างของคนงานหายไปหนึ่งอันในคืนที่นายเรือไม่กลับมา และทุกคนรู้ว่าหากน้ำขึ้นก่อนหาหลักฐานพบ เรือจะออกโดยทิ้งคนที่ไม่มีเสียง", turn: "เจ้าต้องอ่านร่องรอยในท่าให้ทันก่อนความแค้นระหว่างลูกเรือกลายเป็นเหตุให้คนผิดตัวรับโทษ" },
    { title: "ลังสินค้าที่ไม่ควรเปิด", background: "ลังไม้ใต้ท้องเรือถูกผูกเชือกใหม่ทั้งที่ไม่มีใครรับว่าแตะต้องมัน และคนงานผู้เห็นเหตุการณ์ขอให้เจ้าอย่าพูดชื่อเขา", turn: "เจ้าอาจตรวจสินค้า หาทางถามโดยไม่เปิดเผยพยาน หรือปล่อยให้เรือออกพร้อมความเสี่ยงที่ไม่มีใครอยากถือ" },
    { title: "เรือออกก่อนคำตอบ", background: "กัปตันชั่วคราวประกาศให้เรือออกตามน้ำขึ้นโดยไม่รอค่าจ้างที่ค้างอยู่ ขณะเพื่อนคนงานเริ่มรวบคนจะขวางท่า", turn: "เจ้าต้องเลือกระหว่างรักษางาน คุ้มครองคนของตน หรือหาหลักฐานที่เปลี่ยนข้อพิพาทให้กลายเป็นการเจรจา" },
  ],
  arms_craftsworker: [
    { title: "ลำกล้องที่ไม่ตรงบัญชี", background: "จำนวนงานที่ส่งออกจากโรงช่างไม่ตรงกับรอยถ่านบนลัง และหัวหน้าโรงช่างให้เจ้าตรวจมันก่อนชื่อของคนงานคนใดจะถูกเขียนลงรายงาน", turn: "มือของเจ้ารู้ว่าความผิดพลาดอาจเป็นเพียงงานรีบเร่งหรือการปกปิดที่ทำให้ทั้งโรงช่างถูกจับตา" },
    { title: "เหล็กที่มาถึงช้า", background: "วัตถุดิบก้อนหนึ่งมาถึงช้ากว่ากำหนดพร้อมผู้คุมที่ยืนยันว่าเส้นทางไม่มีปัญหา แต่รอยคราบบนหีบเล่าเรื่องอีกแบบ", turn: "เจ้าต้องพิสูจน์สิ่งที่เห็นโดยไม่กล่าวหาใครก่อนมีหลักฐาน มิฉะนั้นชื่อของช่างหนุ่มอาจถูกใช้กลบความผิดของผู้มีอำนาจกว่า" },
    { title: "คำสั่งซ่อมในยามมืด", background: "หลังโรงช่างปิด มีคนทิ้งงานซ่อมไว้โดยไม่มีตรารับรอง พร้อมสัญญาว่าจะตอบแทนหากเจ้าไม่บันทึกงานนั้น", turn: "เจ้าต้องตัดสินใจว่าจะยึดกติกาโรงช่าง ตรวจหาต้นทาง หรือยอมให้ฝีมือตนพาไปใกล้เรื่องที่ไม่ควรอยู่ในมือคนเดียว" },
  ],
  shinobi: [
    { title: "สัญญาณที่จุดนัด", background: "เชือกสัญญาณที่จุดนัดถูกผูกผิดแบบเล็กน้อย—ผิดพอให้รู้ว่าคนส่งข่าวอาจถูกเฝ้าดู แต่ไม่พอให้บอกได้ว่าใครอยู่หลังเงา", turn: "เจ้าอาจเลิกนัด เปลี่ยนทาง หรือเสี่ยงเข้าไปฟังโดยรู้ว่าความเงียบของตนเองอาจถูกใช้เป็นกับดัก" },
    { title: "ข่าวที่มีคนอ่านแล้ว", background: "เอกสารในมือยังปิดผนึกอยู่ แต่รอยพับและกลิ่นควันบอกว่ามีคนเปิดอ่านก่อนถึงเจ้า", turn: "หากส่งต่อ เจ้ากำลังส่งข้อมูลที่อาจถูกบิด; หากหยุดไว้ คนรอข่าวอาจตกอยู่ในอันตรายจากความล่าช้า" },
    { title: "เสื้อคลุมไร้ตรา", background: "ผู้เฝ้าทางจำท่าทางของเจ้าได้แม้ไม่รู้ชื่อ และเริ่มถามคนแถวทางผ่านถึงผู้เดินทางที่ไม่มีตราบ้าน", turn: "เจ้าต้องปกป้องเส้นทางข่าวโดยไม่ทำให้คนธรรมดาที่ตอบคำถามแทนเจ้าเป็นผู้รับผลของความสงสัย" },
  ],
  warrior_monk: [
    { title: "ชายคาที่รับคนเกินมา", background: "คนหลบภัยมาถึงประตูวัดมากกว่าที่เสบียงจะรองรับ และผู้ถืออำนาจต้องการรายชื่อก่อนอนุญาตให้ทุกคนพักต่อ", turn: "เจ้าต้องปกป้องคนที่พึ่งชายคาโดยไม่ให้วัดกลายเป็นที่ซ่อนความจริงหรือเป้าของคำกล่าวหา" },
    { title: "จดหมายขอผ่านทาง", background: "จดหมายรับรองของวัดมีตราถูกต้องแต่ผู้คุมอ่านถ้อยคำแล้วบอกว่ามันไม่พอสำหรับผู้เดินทางจำนวนนี้", turn: "เจ้าต้องใช้ความสัตย์ การเจรจา หรือทางเลือกอื่นที่ไม่ยอมให้ผู้ที่ไร้อำนาจถูกแยกออกเพียงเพราะไม่มีผู้ค้ำ" },
    { title: "ของที่ถูกฝากไว้", background: "มีคนนำห่อผ้าปิดผนึกมาฝากใต้แท่นบูชา พร้อมขอให้เจ้าเก็บมันให้พ้นมือผู้ตรวจ แต่ไม่ยอมบอกว่าข้างในคืออะไร", turn: "การรับฝากอาจรักษาคำขอของคนเดือดร้อน หรือทำให้ความไว้ใจของวัดถูกใช้เป็นที่กำบัง" },
  ],
  daimyo_attendant: [
    { title: "คำสั่งที่มาถึงเร็วเกินไป", background: "คำสั่งปิดผนึกมาถึงมือเจ้าก่อนผู้รับจะได้รับข่าวล่วงหน้า และสายตาในเรือนเอกสารทุกคู่กำลังชั่งว่าเจ้ารู้อะไรมากกว่าที่ควร", turn: "เจ้าต้องส่งให้ถึงมือผู้รับโดยไม่เปิดทางให้ข่าวรั่วหรือให้ความเงียบของตนถูกตีความเป็นการเลือกข้าง" },
    { title: "ตราที่ไม่ควรอยู่ตรงนี้", background: "ตราประทับบนเอกสารสำเนาหนึ่งแผ่นถูกวางผิดที่เพียงเล็กน้อย แต่พอให้เจ้ารู้ว่ามีคนเร่งงานหรือกำลังวางกับดัก", turn: "หากรายงานโดยไร้หลักฐาน เจ้าจะกล่าวหาเกินฐานะ; หากนิ่งเฉย คำสั่งผิดฉบับอาจไปถึงคนที่รับผลแทน" },
    { title: "ประตูที่ปิดก่อนประชุม", background: "ก่อนการประชุม ประตูด้านในถูกสั่งปิดและคนถือเอกสารหลายคนถูกกันไว้ภายนอกโดยไม่มีคำอธิบาย", turn: "เจ้าอยู่ใกล้พอจะเห็นความผิดปกติ แต่ยังต่ำต้อยพอที่คำถามผิดจังหวะจะทำให้เจ้ากลายเป็นผู้ต้องสงสัย" },
  ],
  mounted_samurai: [
    { title: "รอยกีบที่หายไป", background: "ม้าหนึ่งตัวกับคนลาดตระเวนหนึ่งคนไม่กลับมาตามเวลา ขณะคำสั่งเดิมห้ามเคลื่อนกำลังเกินจำเป็น", turn: "เจ้าต้องเลือกว่าจะเชื่อรอยบนดิน ใช้คนจำนวนน้อยตามหา หรือยอมรอจนความรับผิดชอบกลายเป็นของเจ้าเต็มตัว" },
    { title: "ธนูที่วางผิดคอก", background: "ธนูสำรองของหน่วยถูกพบในคอกม้าที่ไม่มีใครใช้ และทหารหนุ่มผู้เห็นมันก่อนทุกคนเริ่มกลัวว่าจะถูกโยนความผิด", turn: "ในฐานะนายกอง เจ้าต้องหาความจริงโดยไม่ทำให้คำสั่งของตนกลายเป็นแรงกดทับคนที่อยู่ใต้คำสั่ง" },
    { title: "ทางลาดตระเวนสองเส้น", background: "รายงานจากชาวบ้านพูดถึงเสียงม้าในสองทิศทาง แต่มีกำลังพอให้ตรวจเพียงทางเดียวก่อนมืด", turn: "การเลือกของเจ้าอาจรักษาความปลอดภัยของหน่วย หรือทิ้งคนบางกลุ่มไว้กับข่าวลือที่ไม่มีใครกล้ารับรอง" },
  ],
  coastal_sailor: [
    { title: "ช่องแคบที่มีสองคำอ้าง", background: "เรือสองลำอ้างสิทธิ์ใช้ช่องแคบเดียวกันในช่วงน้ำเปลี่ยน และผู้โดยสารที่เจ้าพาไปไม่ควรถูกเห็นโดยคนทั้งท่า", turn: "เจ้าต้องอ่านกระแสน้ำและอ่านคนให้ทัน โดยไม่เปลี่ยนการผ่านทางธรรมดาให้กลายเป็นเรื่องที่ทุกฝ่ายต้องรักษาหน้า" },
    { title: "ใบผ่านทางน้ำเก่า", background: "ใบผ่านทางในมือเจ้าเคยใช้ได้ แต่คนเฝ้าท่าเพิ่งประกาศว่าจะตรวจเอกสารทุกฉบับละเอียดกว่าปกติ", turn: "เจ้าอาจเสี่ยงใช้สิทธิ์เดิม ต่อรองกับข่าวที่ตนมี หรือเปลี่ยนเส้นทางโดยไม่ให้ผู้โดยสารกลายเป็นผู้รับผิด" },
    { title: "เชือกนำร่องขาดกลางคืน", background: "เชือกนำร่องถูกพบว่าขาดก่อนออกเรือเพียงไม่นาน และทุกคนต่างชี้ว่าเป็นความสะเพร่าของคนอีกฝ่าย", turn: "การหาคนผิดอาจง่ายกว่าการรักษาลูกเรือให้ทำงานร่วมกัน แต่ความผิดพลาดครั้งต่อไปจะเกิดบนผืนน้ำ ไม่ใช่บนท่า" },
  ],
};

function openingProfileFor(template: StarterTemplate, seed: number) {
  const profiles = STARTER_OPENING_PROFILES[template.id] ?? [{ title: template.mission.title, background: "แรงกดดันของงานเดินทางมาถึงก่อนคำอธิบาย", turn: "เจ้าต้องเลือกโดยยอมรับว่าทุกทางมีราคา" }];
  return profiles[Math.abs(Math.trunc(seed)) % profiles.length];
}

function openingRequestFor(template: StarterTemplate, context: CampaignContext, character: Character) {
  const profile = openingProfileFor(template, context.selectionSeed ?? 0);
  const beginning = `${character.name} เติบโตมากับ ${character.origin} และรู้ดีว่างานของ ${template.label} ไม่เคยแยกออกจากคนที่ต้องพึ่งพากัน. ${profile.background} `;
  return `${beginning}วันนี้ ${template.mission.issuer} ไม่ได้ยื่นงานสั้น ๆ ให้ทำ หากแต่ขอให้เจ้า ${template.mission.request} ${template.mission.pressure} ${profile.turn} เส้นตายคือ ${template.mission.deadline}; หากเลือกผิด ไม่เพียงรางวัล ${template.mission.reward} จะหายไป แต่ ${template.mission.risk} นี่คือ Main Thread แรกของเจ้า—เรื่องสมมติของแคมเปญที่ก่อตัวขึ้นภายใน ${context.region} ค.ศ. ${context.year} โดยไม่อ้างว่าเหตุการณ์หรือบุคคลนี้มีอยู่จริง.`;
}

function openingScene(character: Character, campaign: CampaignContext, mission: Mission): Scene {
  const seasonDetail: Record<Season, string> = {
    Spring: "ไอชื้นจากฝนต้นปีเกาะอยู่ตามขอบผ้าและร่องไม้",
    Summer: "ความร้อนที่สะสมอยู่บนหลังคาไม้ทำให้กลิ่นเหงื่อ ม้า และข้าวเก่าหนักกว่าปกติ",
    Autumn: "กลิ่นฟางแห้งและฝุ่นจากเกวียนเก็บเกี่ยวลอยปะปนอยู่ในอากาศ",
    Winter: "ลมหายใจของผู้คนลอยขาวอยู่เหนือพื้นดินแข็ง และทุกคนพูดสั้นกว่าปกติเพราะความหนาว",
  };
  return {
    id: `scene-${campaign.id}-opening`, chapter: "Page 01", title: mission.title, location: campaign.location,
    publicContext: `เนื้อหานี้เป็นเรื่องสมมติใน ${campaign.region} ค.ศ. ${campaign.year} · ${campaign.season} โดยใช้แรงกดดันของสงครามและเส้นทางเป็นบริบท ไม่ใช่การยืนยันว่า NPC นี้มีอยู่จริง.`,
    body: [
      `ยามบ่ายที่ ${campaign.location} ไม่เคยเงียบจริง ${seasonDetail[campaign.season]} กลิ่นเหงื่อจากหลังม้า กลิ่นฟางเก่าจากเพิงพัก และกลิ่นข้าวหุงค้างหม้อคลุกอยู่ในลมหายใจเดียวกัน เสียงล้อเกวียนบดพื้นดินดังเอี๊ยดเป็นจังหวะอยู่ตรงทางแยก ขณะที่ทหารหน้าด่านใช้ด้ามหอกเคาะพื้นไม้เป็นระยะเหมือนตั้งใจเตือนทุกคนว่าคนผ่านทางมีเวลาของตนเอง เมื่อ ${character.name} ก้าวเข้ามา คนขายน้ำสองคนหยุดเถียงกันทันที แม้กระทั่งเด็กที่กำลังไล่แมลงวันอยู่ข้างคอกม้ายังเงยหน้ามอง ก่อนจะก้มหลบสายตาไปเหมือนไม่อยากถูกนับว่าอยู่ในเหตุการณ์นี้.`,
      `${mission.issuer} รออยู่ใต้ชายคาแคบ ๆ ข้างกองสินค้า เชือกปอที่มัดลังไม้กดรอยแดงไว้บนฝ่ามือของเขา เสื้อชั้นนอกมีฝุ่นเกาะตามชายแขนจนดูเหมือนเพิ่งลงมาจากเกวียนมากกว่าจะเป็นคนที่มาหาคนคุ้มกัน เขาไม่ได้ทักทาย เพียงเลื่อนสายตาจากดาบของ ${character.name} ไปยังทหารที่ประตูด่าน แล้วพูดเบาจนต้องขยับเข้าไปฟัง “${mission.request}” ปลายนิ้วของเขาบีบขอบเอกสารยับ ๆ แน่นขึ้นเมื่อเอ่ยต่อว่า “${mission.pressure}” น้ำเสียงนั้นไม่มีคำขอร้อง มีแต่ความกลัวที่พยายามเก็บไว้ใต้ถ้อยคำของพ่อค้าที่รู้ว่าหากเรื่องผิดพลาด คนมีเงินจะหนีทันก่อนคนถือดาบเสมอ.`,
      `${character.name} เห็นทางออกได้ไวกว่าใครจาก ${character.strength} ทว่า ${character.weakness} ก็ทำให้คำพูดทุกคำต้องชั่งน้ำหนัก งานคุ้มกันคนส่งสารอาจเป็นเพียงค่าจ้างหนึ่งครั้ง หรืออาจกลายเป็นชื่อที่ผู้คุมจดไว้ข้างอาวุธและรูปพรรณของคนแปลกหน้า ${mission.issuer} วางถุงเหรียญเล็ก ๆ ลงบนลังไม้โดยไม่ผลักมาทางนี้ ราวกับยังไม่กล้าตัดสินว่าควรจ่ายให้ผู้คุ้มกันหรือใช้มันซื้อความเงียบจากคนอื่นก่อน เส้นตาย ${mission.deadline} ไม่ได้อยู่บนกระดาษแผ่นใด แต่มันกำลังเคลื่อนเข้ามาพร้อมเงาของประตูด่านที่ยาวขึ้นทุกลมหายใจ.`,
    ],
    speaker: mission.issuer, prompt: "เจ้าจะทำอย่างไรต่อ?", pressure: mission.pressure, suggestedActions: mission.options,
  };
}

export function createGameState(context: CampaignContext, draft: CharacterDraft): GameState {
  const character = createCharacter(draft);
  const template = templateById(draft.templateId);
  const mission: Mission = { ...template.mission, title: openingProfileFor(template, context.selectionSeed ?? 0).title, request: openingRequestFor(template, context, character), id: `mission-${Date.now()}`, state: "offered" as MissionState, role: "main", visibility: "visible", progress: { current: 0, required: 2, triggerPhrases: template.mission.options } };
  const opening = openingScene(character, context, mission);
  // ค่าเริ่มต้นตามเมือง/แคว้น อิงไทมไลน์ประวัติศาสตร์ (อิง sengoku-rpg-historian)
  const regionInit = regionInitialState(context.year, context.region, context.season);
  // สร้าง powerRumor เริ่มต้นจากบริบทภูมิภาค (faction stance + heat) — กลไก event-driven เริ่มทันที
  const initialFactions: FactionReputation[] = (Object.keys(regionInit.factionStance) as Array<keyof typeof regionInit.factionStance>).map((fid) => {
    const stance = regionInit.factionStance[fid]!;
    return {
      factionId: fid,
      name: FACTION_NAMES[fid] ?? fid,
      score: stanceScore(stance),
      stance,
      trend: "steady",
      reasons: [regionInit.factionReason[fid] ?? "สถานการณ์บริบทของแคว้น"],
    };
  });
  const initialHeat: FactionHeat[] = regionInit.heatLevel > 0
    ? [{ provinceId: timelineRegionKey(context.region), locationId: context.location, level: regionInit.heatLevel, status: heatStatus(regionInit.heatLevel), reasons: [regionInit.heatReason] }]
    : [];
  return {
    schemaVersion: 9,
    credits: 50,
    campaign: context,
    character,
    community: {
      food: regionInit.community.food ?? 4,
      labor: regionInit.community.labor ?? 3,
      voice: 2,
      safety: regionInit.community.safety ?? 3,
      cohesion: 4,
      lastChange: regionInit.brief,
    },
    currentScene: opening,
    missions: [mission],
    market: buildMarket(context.season),
    economy: { ...buildCampaignEconomy(context), routeStatus: regionInit.routeStatus },
    memories: [{ id: `memory-${Date.now()}`, kind: "news", title: opening.title, detail: opening.body.join("\n\n"), tick: 1, tone: "teal" }],
    rolls: [],
    storyRecords: [{ id: `story-opening-${context.id}`, tick: 1, inGameDay: context.day, title: opening.title, prose: opening.body.join("\n\n"), location: opening.location }],
    relationships: [],
    progression: defaultProgression(context, template.age, context.season),
    tick: 1,
    worldSystems: { schemaVersion: 1, powerRumor: { schemaVersion: 1, factions: initialFactions, heatTracks: initialHeat, events: [] } },
  };
}

export function createSaikaSafehouseDemo(): GameState {
  const campaign: CampaignContext = { id: "camp-saika-1569", title: "Smoke Beneath Sakai", year: 1569, season: "Spring", region: "Sakai / Izumi", location: "เซฟเฮาส์ลับของไซกะ — นอกชายเขตเมืองซาไก", warShadow: 5, day: 1 };
  const character: Character = {
    id: "char-sanefuyu", name: "ซาเนฟุยุ", identity: "เด็กชายวัยสิบสามปี", occupationId: "freeform", occupation: "ทหารรับจ้างถือปืนของไซกะ", origin: "กิอิ", strength: "อ่านผลประโยชน์และพูดในจังหวะที่คนกำลังลังเล", weakness: "บาดเจ็บสาหัสและถูกความหยามเกียรติผลักให้พลั้งมือ", flaws: ["บาดเจ็บสาหัสและถูกความหยามเกียรติผลักให้พลั้งมือ"], attributes: { body: 1, hand: 3, wit: 3, mind: 2, heart: 3 }, statXp: defaultStatXp(), masteries: [mastery("saika-firearm", "ปืนคาบศิลาและคนไซกะ", 2, "งานคุ้มกันและการรบ", ["fight", "weapon", "gunpowder"]), mastery("hard-bargain", "ต่อรองผลประโยชน์", 1, "เอาตัวรอด", ["negotiation", "social"]), mastery("water-escape", "หนีทางน้ำ", 1, "รอดจากการจมน้ำ", ["water", "escape"])], vitals: { wounds: 5, focus: 3, maxWounds: 6, maxFocus: 6 }, social: { rank: 0, honor: 0, influence: 1, information: 2, stain: 2 }, resources: { property: 1, supplies: 1, credit: 0 }, inventory: [item("bandaged-arm", "ผ้าพันแผลชุ่มยา", "status", "ไหล่ซ้ายและแขนขวาบาดเจ็บ ใช้งานได้จำกัด", 0, []), item("saika-matchlock", "ปืนคาบศิลาเปียกชื้น", "equipment", "ปืนที่ต้องซ่อมและทำให้แห้งก่อนใช้", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "weapon"] }), item("dry-ration", "ข้าวปั้นตากแห้งกับเต้าเจี้ยว", "reserve", "ของกินที่กันทาโร่โยนให้", 1, ["bonus"])], pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: id === "life_before" ? "เติบโตท่ามกลางเส้นทางค้าของคิอิ ก่อนกลายเป็นทหารรับจ้างของไซกะ" : "ยืนข้างไซกะตราบใดที่ผลประโยชน์ยังตรงกัน", tags: [...tags], weight: 2 })),
  };
  const mission: Mission = { id: "mission-echiya", issuer: "กันทาโร่", issuerType: "samurai", title: "คำตอบใต้ห้องขัง", request: "เสนอทางจัดการเอจิยะและตั๋วสัญญาปืนสามสิบกระบอก โดยไม่ให้สิทธิ์การค้าของไซกะในซาไกพังลง", pressure: "เอโกะชูเพิ่มเวรยาม ปิดประตูเมือง และตรวจเรือเข้าออกตามหาพ่อค้าเอจิยะ", deadline: "ก่อนเมืองซาไกยืนยันข่าวการหายตัว", reward: "การคุ้มครองของกันทาโร่และส่วนแบ่งค่าปืน", risk: "หัวของซาเนฟุยุและเอจิยะอาจถูกส่งไปแลกสิทธิ์การค้า", options: ["เสนอแผนปิดปาก", "สอบเอจิยะ", "หาตั๋วสัญญาปืน"], state: "offered", progress: { current: 0, required: 2, triggerPhrases: ["เอจิยะ", "ตั๋ว", "ปืน", "แผน"], rewardItem: { label: "จดหมายรับรองของกันทาโร่", kind: "document", description: "หลักฐานคุ้มครองชั่วคราวที่ช่วยให้คนของไซกะยอมฟังคำอธิบาย", slots: 0, functions: ["unlock"], bonus: { stat: "heart", value: 1, tags: ["saika", "protection"] }, condition: "usable", location: "carried", ownership: "owned" } } };
  const opening: Scene = {
    id: "scene-saika-safehouse-opening", chapter: "Page 01", title: mission.title, location: campaign.location,
    publicContext: "ฉากแคมเปญสมมติในบริบทเมืองท่าซาไก ค.ศ. 1569 ใช้แรงกดดันของการค้า อาวุธ และเครือข่ายไซกะเป็นฉากหลัง ไม่ได้ยืนยันว่า NPC ในฉากมีตัวตนจริง.",
    body: [
      "กลิ่นควันยาต้มหญ้าสมุนไพรปนกลิ่นคาวเลือดแห้งกรังคือสิ่งแรกที่กักประสาทสัมผัสของซาเนฟุยุไว้เมื่อลืมตา ความเจ็บแปลบวิ่งจากหัวไหล่ซ้ายที่ถูกพันไว้แน่นลงมาถึงแขนขวา ทุกครั้งที่ขยับลมหายใจ ผ้าพันแผลที่เคยขาวก็รั้งเนื้อเหมือนจะเตือนว่าเมื่อคืนเขาถูกน้ำเค็มและเลือดเกือบเอาไปพร้อมกัน แต่ลมหายใจยังอยู่ และนั่นหมายความว่าเรื่องข้างนอกยังไม่ยอมจบไปกับความมืด.",
      "แสงเช้าลอดผ่านรอยแหว่งของฝาผนังไม้กันฝน กันทาโร่นั่งขัดสมาธิอยู่บนเสื่อเก่า ยางไม้กับเขม่าดินปืนเกาะตามเกราะโดมารุ ขณะมือหยาบใช้ผ้าแห้งเช็ดชิ้นส่วนปืนคาบศิลาอย่างช้า ๆ เมื่อได้ยินเสียงคนเจ็บขยับ เขาวางโลหะกระทบพื้นไม้ดัง กึ๊ก แล้วเอ่ยโดยไม่หันมา “ตื่นแล้วรึ แผลของเจ้า หมอพอกยาและนาบไฟไว้ให้แล้ว ถ้าไม่อยากแขนเน่า ก็อย่าทะลึ่งขยับมากนัก”",
      "กันทาโร่เงยหน้าขึ้นในที่สุด ดวงตาของคนผ่านศึกกวาดมองซาเนฟุยุราวกับประเมินของที่ยังพอขายได้ “เอจิยะนอนปากแข็งอยู่ห้องใต้ดิน แต่เมืองซาไกตื่นกันหมดแล้ว เอโกะชูเพิ่มเวรยาม ปิดประตู และตรวจเรือทุกลำเพราะพ่อค้าใหญ่หายตัวไป” เขาโยนห่อข้าวปั้นตากแห้งกับเต้าเจี้ยวลงข้างเสื่อ “ข้าช่วยเจ้าขึ้นจากน้ำเพราะเจ้าลากมันมาได้ แต่ถ้าไซกะเสียสิทธิ์การค้าเพราะเรื่องนี้ หัวของเจ้ากับมันอาจต้องถูกส่งไปง้อพวกนั้น บอกมาเถอะ เจ้าจะจัดการเอจิยะอย่างไร”",
    ],
    speaker: "กันทาโร่", prompt: "ซาเนฟุยุจะตอบกันทาโร่ว่าอย่างไร?", pressure: mission.pressure, suggestedActions: mission.options,
  };
  return { schemaVersion: 9, credits: 50, campaign, character, community: { food: 2, labor: 2, voice: 1, safety: 1, cohesion: 2, lastChange: "เมืองซาไกเพิ่มเวรยามและตรวจเรือ" }, currentScene: opening, missions: [{ ...mission, role: "main", visibility: "visible" }], market: buildSaikaMarket(), economy: buildSaikaEconomy(), memories: [{ id: "memory-saika-opening", kind: "stain", title: "คืนที่เมืองซาไกตื่น", detail: opening.body.join("\n\n"), tick: 1, tone: "vermilion" }, ...saikaRelationshipFoundationMemories()], rolls: [], storyRecords: [{ id: "story-saika-opening", tick: 1, inGameDay: 1, title: opening.title, prose: opening.body.join("\n\n"), location: opening.location }], relationships: saikaPublicRelationships(), progression: defaultProgression(campaign, 13, "Spring"), tick: 1 };
}

export function formatMoney(amount: number, _language: "th" | "en" = "th"): string {
  return `${amount} mon`;
}

export function inventoryCategory(item: Pick<InventoryItem, "id" | "label" | "kind" | "category">): InventoryCategory {
  if (item.category) return item.category;
  const text = `${item.id} ${item.label}`.toLowerCase();
  if (item.kind === "document" || item.kind === "bond" || /จดหมาย|สัญญา|ตั๋ว|เอกสาร|letter|contract|document/.test(text)) return "story";
  if (/ยา|สมุนไพร|แผล|medicine|herb|bandage/.test(text)) return "medicine";
  if (/ข้าว|อาหาร|เสบียง|ration|food|น้ำ|water/.test(text) || item.kind === "reserve") return "food";
  if (/ปืน|ดาบ|หอก|อาวุธ|weapon|sword|gun/.test(text) || item.kind === "equipment") return "weapon";
  if (item.kind === "status") return "status";
  return "tool";
}

export const VITAL_CAP = 10;
export function clampVital(value: number, max: number): number { return Math.max(0, Math.min(max, Math.round(value))); }
export function vitalMaxes(character: Character) { return { maxWounds: Math.max(1, Math.min(VITAL_CAP, Math.round(character.vitals.maxWounds ?? 6))), maxFocus: Math.max(1, Math.min(VITAL_CAP, Math.round(character.vitals.maxFocus ?? 6))) }; }
export function applyVitalDelta(state: GameState, type: "wounds" | "focus", delta: number, reason: string, source: VitalEvent["source"]): GameState { const m=vitalMaxes(state.character); const before=state.character.vitals[type]; const after=clampVital(before+delta, type === "wounds" ? m.maxWounds : m.maxFocus); if(after===before) return state; const ev: VitalEvent={id:`vital-${state.tick}-${type}-${state.progression?.vitalEvents?.length ?? 0}`,type,delta:after-before,reason,source,tick:state.tick}; return {...state, character:{...state.character,vitals:{...state.character.vitals,maxWounds:m.maxWounds,maxFocus:m.maxFocus,[type]:after}}, progression:{...(state.progression ?? defaultProgression(state.campaign)), vitalEvents:[...(state.progression?.vitalEvents ?? []),ev].slice(-50)}}; }
export function awardMilestonePoint(state: GameState, reason: string): GameState { const p=state.progression ?? defaultProgression(state.campaign); return {...state,progression:{...p,milestonePoints:(p.milestonePoints ?? 0)+1}}; }
export function levelUpVital(state: GameState, choice: "max_wounds" | "max_focus"): GameState { const p=state.progression ?? defaultProgression(state.campaign); if((p.milestonePoints ?? 0)<1) return state; const m=vitalMaxes(state.character); const wound=choice === "max_wounds"; const next=Math.min(VITAL_CAP,(wound?m.maxWounds:m.maxFocus)+1); if(next > VITAL_CAP) return state; const type=wound?"wounds":"focus"; const maxWounds=wound?next:m.maxWounds; const maxFocus=wound?m.maxFocus:next; return {...state,character:{...state.character,vitals:{...state.character.vitals,maxWounds,maxFocus,[type]:clampVital(state.character.vitals[type]+1,next)}},progression:{...p,milestonePoints:(p.milestonePoints ?? 0)-1,vitalEvents:[...(p.vitalEvents ?? []),{id:`level-up-${state.tick}-${choice}`,type,delta:1,reason:"ใช้ milestone เพิ่มเพดาน vitals",source:"milestone",tick:state.tick}]}}; }

export function normalizeGameState(state: GameState): GameState {
  const campaign = state.campaign;
  const legacyState = state.schemaVersion < 4;
  const progression = state.progression ?? defaultProgression(campaign, state.character.identity.includes("สิบสาม") ? 13 : 20, campaign.season);
  const missions = normalizeMissionThreads(state.missions.map((mission) => mission.progress ? mission : { ...mission, progress: { current: mission.state === "resolved" ? 2 : 0, required: 2, triggerPhrases: mission.options } }));
  const legacyRolls = state.rolls as Array<RollRecord & { axis?: StatId; momentumSpent?: number; momentumSource?: unknown; canUseMomentum?: boolean }>;
  const legacyInventory = state.character.inventory as Array<GameState["character"]["inventory"][number] & { bonus?: { axis?: StatId; stat?: StatId; value: number; tags: string[] } }>;
  const rolls = legacyRolls.map((roll) => {
    const { axis, momentumSpent: _momentumSpent, momentumSource: _momentumSource, canUseMomentum: _canUseMomentum, ...cleanRoll } = roll;
    return { ...cleanRoll, stat: roll.stat ?? axis ?? "wit", difficulty: roll.difficulty === 0 ? 0 : canonicalDifficulty(roll.difficulty) };
  });
  const inventory = legacyInventory.map((item) => {
    const normalized = item.bonus?.stat ? item : item.bonus?.axis ? { ...item, bonus: { ...item.bonus, stat: item.bonus.axis } } : item;
    return { ...normalized, category: inventoryCategory(normalized) };
  });
  const legacyProperty = Math.max(0, Math.round(state.character.resources.property ?? 0));
  const currency = state.character.resources.currency ?? { unit: "mon" as const, amount: legacyProperty };
  const resources = { ...state.character.resources, currency, property: currency.amount, credit: 0 };
  const legacyAttributeValue = (value: number) => [1, 2, 3, 5, 7, 9, 10][Math.max(0, Math.min(6, Math.round(value)))] ?? 1;
  const attributes = Object.fromEntries(STATS.map(({ id }) => [id, legacyState ? legacyAttributeValue(state.character.attributes[id]) : normalizeStatValue(state.character.attributes[id])])) as Attributes;
  const storedStatXp = state.character.statXp as Partial<StatXp> | undefined;
  const statXp = Object.fromEntries(STATS.map(({ id }) => {
    const threshold = traitProgressNeededForLevel(attributes[id]);
    return [id, { xp: threshold === 0 ? 0 : Math.max(0, Math.min(storedStatXp?.[id]?.xp ?? 0, threshold - 1)), totalXp: Math.max(0, storedStatXp?.[id]?.totalXp ?? 0) }];
  })) as StatXp;
  const rawVitals = state.character.vitals as Character["vitals"];
  const maxWounds = Math.max(1, Math.min(VITAL_CAP, Math.round(rawVitals.maxWounds ?? 6)));
  const maxFocus = Math.max(1, Math.min(VITAL_CAP, Math.round(rawVitals.maxFocus ?? 6)));
  const vitals = { ...rawVitals, maxWounds, maxFocus, wounds: clampVital(rawVitals.wounds, maxWounds), focus: clampVital(rawVitals.focus, maxFocus) };
  const flaws = Array.from(new Set((state.character.flaws?.length ? state.character.flaws : [state.character.weakness]).map((entry) => entry.trim()).filter(Boolean))).slice(0, 2);
  const storedRelationships = (state as Partial<GameState>).relationships;
  const relationships = Array.isArray(storedRelationships) ? sanitizePublicRelationships(storedRelationships) : campaign.id === "camp-saika-1569" ? saikaPublicRelationships() : [];
  const foundationMemories = campaign.id === "camp-saika-1569" ? saikaRelationshipFoundationMemories() : [];
  const memories = [...state.memories, ...foundationMemories.filter((memory) => !state.memories.some((existing) => existing.id === memory.id))];
  const rawStoryRecords = (state as Partial<GameState>).storyRecords;
  const storyRecords = Array.isArray(rawStoryRecords)
    ? rawStoryRecords.filter((entry): entry is StoryRecord => Boolean(entry && typeof entry.id === "string" && typeof entry.title === "string" && typeof entry.prose === "string" && typeof entry.location === "string" && typeof entry.tick === "number" && typeof entry.inGameDay === "number")).map((entry) => ({ ...entry, prose: entry.prose.trim() })).filter((entry) => entry.prose.length > 0)
    : rolls.length
      ? rolls.filter((roll) => Boolean(roll.narrative?.trim())).map((roll) => ({ id: `story-${roll.id}`, tick: roll.tick, inGameDay: campaign.day, title: `Page ${String(roll.tick).padStart(2, "0")}`, prose: roll.narrative.trim(), location: state.currentScene.location }))
      : [{ id: `story-opening-${campaign.id}`, tick: 1, inGameDay: campaign.day, title: state.currentScene.title, prose: state.currentScene.body.join("\n\n"), location: state.currentScene.location }];
  return {
    ...state,
    schemaVersion: 9,
    character: { ...state.character, weakness: flaws[0] ?? "มีหนี้ที่ยังไม่กล้าพูดถึง", flaws: flaws.length ? flaws : ["มีหนี้ที่ยังไม่กล้าพูดถึง"], attributes, statXp, inventory, masteries: state.character.masteries.map((entry) => normalizeMasteryProgress(entry, legacyState)), vitals: { wounds: vitals.wounds, focus: vitals.focus, maxWounds: vitals.maxWounds, maxFocus: vitals.maxFocus }, resources },
    missions,
    rolls,
    memories,
    storyRecords,
    relationships,
    progression: { ...progression, currentAge: Math.max(progression.currentAge, progression.ageAtCampaignStart), growthPoints: progression.growthPoints ?? 0, milestonePoints: progression.milestonePoints ?? 0, vitalEvents: progression.vitalEvents ?? [] },
    economy: state.economy ?? (campaign.id === "camp-saika-1569" ? buildSaikaEconomy() : buildCampaignEconomy(campaign)),
    worldSystems: state.worldSystems ?? { schemaVersion: 1 },
  };
}

function buildCampaignEconomy(context: CampaignContext): EconomyState {
  return { marketTitle: `ตลาดใกล้ ${context.location}`, marketContext: `ข้อเสนอใน ${context.season} ผูกกับเส้นทางและแรงกดดันของแคมเปญ ไม่ใช่รายการสินค้าสากล`, routeStatus: "เส้นทางยังเปิด แต่ผู้เดินทางถูกซักถาม", sellerNetwork: "พ่อค้าท้องถิ่น คนงานขนของ และคนกลางของชุมชน", services: [{ id: "local-messenger", provider: "คนส่งสารท้องถิ่น", role: "ข่าวสารและเอกสาร", affiliation: "เครือข่ายตลาด", request: "นำห่อเล็กไปยังจุดนัดหมาย", price: "2 文 หรือคำรับรอง", timeCost: "หนึ่งวัน", requirement: "ไม่เปิดเผยชื่อผู้รับต่อหน้าคนแปลกหน้า", witnessRisk: "คนส่งสารจำชื่อผู้ว่าจ้างได้", availability: "available" }], obligations: [], transactions: [] };
}

function buildSaikaMarket(): MarketOffer[] {
  return [
    { id: "saika-rations", label: "ข้าวตากและเต้าเจี้ยว", price: 1, priceUnit: "mon", debtAllowed: false, kind: "goods", slots: 1, note: "เสบียงแห้งจากแผงใกล้ท่าเรือ", priceReason: "กองกำลังตรวจเส้นทางเสบียง", available: true },
    { id: "saika-medicine", label: "ยาสมุนไพรห่อเล็ก", price: 2, priceUnit: "mon", debtAllowed: true, kind: "goods", slots: 0, note: "ผู้ขายยอมให้รับไปก่อนหากมีคนของไซกะรับรอง", priceReason: "สมุนไพรมีจำกัดและคนเจ็บเพิ่มขึ้น", available: true },
    { id: "saika-rope-cloth", label: "เชือกปอและผ้าหยาบ", price: 2, priceUnit: "mon", debtAllowed: false, kind: "goods", slots: 1, note: "ใช้ซ่อมของหรือห่อของให้ไม่สะดุดตา", priceReason: "เรือสินค้าล่าช้า", available: true },
    { id: "saika-messenger", label: "คนส่งสารท่าเรือ", price: 2, priceUnit: "mon", debtAllowed: false, kind: "service", note: "ออกจากท่าเรือหลังยามค่ำ รับเฉพาะห่อเล็ก", priceReason: "ด่านตรวจเรือเข้าออก", available: true },
    { id: "saika-scribe", label: "เสมียนอ่านเอกสาร", price: 2, priceUnit: "mon", debtAllowed: false, kind: "information", note: "อ่านบัญชีและตั๋วสัญญา แต่ไม่แตะตราไซกะที่เปิดเผย", priceReason: "งานเสี่ยงต่อเครือข่ายร้านค้า", available: true },
  ];
}

function buildSaikaEconomy(): EconomyState {
  return { marketTitle: "ตลาดท่าเรือซาไก — เช้าหลังคืนวุ่นวาย", marketContext: "สินค้าและบริการเป็น fictional play content ในบริบทเมืองท่า ค.ศ. 1569 ราคาเปลี่ยนเพราะการตรวจเรือ เสบียง และเครือข่ายผู้ขาย", routeStatus: "เอโกะชูเพิ่มเวรยาม ปิดประตูบางช่วง และตรวจเรือเข้าออก", sellerNetwork: "แผงยา คนงานท่าเรือ เสมียนบ้านพ่อค้า และคนกลางที่รู้จักชื่อกันทาโร่", services: [{ id: "harbor-messenger", provider: "คนส่งสารท่าเรือ", role: "ข่าวสารและเอกสาร", affiliation: "คนงานท่าเรือ", request: "ส่งห่อเล็กไปยังตลาดฝั่งตะวันออก", price: "2 文 หรือชื่อคนคุมท่าเรือรับรอง", timeCost: "หนึ่งวัน", requirement: "ห่อต้องไม่เผยตราไซกะ", witnessRisk: "ผู้ส่งสารอาจถูกค้นและจำชื่อผู้ว่าจ้างได้", availability: "limited" }, { id: "harbor-scribe", provider: "เสมียนอ่านเอกสาร", role: "ข่าวสารและเอกสาร", affiliation: "บ้านพ่อค้าท่าเรือ", request: "อ่านบัญชีหรือเทียบข้อความในตั๋วสัญญา", price: "2 文 หรือข้อมูลที่พอแลกได้", timeCost: "ก่อนตะวันตก", requirement: "ไม่รับเอกสารที่มีตราไซกะเปิดเผย", witnessRisk: "เสมียนอาจรู้ว่าผู้เล่นกำลังตามหาของใด", availability: "available" }, { id: "herb-seller", provider: "เจ้าของแผงยา", role: "รักษาและดูแลคนเจ็บ", affiliation: "เครือข่ายแผงยา", request: "ให้ยาสมุนไพรและเปลี่ยนผ้าพันแผล", price: "2 文 หรือรับของไปก่อนสามวันพร้อมคนค้ำ", timeCost: "ครึ่งชั่วยาม", requirement: "บอกว่าแผลเกิดจากอะไรเท่าที่ผู้ขายยอมรับ", witnessRisk: "คนในแผงอาจรู้ว่าซาเนฟุยุยังบาดเจ็บ", availability: "limited" }], obligations: [{ id: "favor-gantaro-life", kind: "favor", holder: "กันทาโร่", subject: "หนี้ชีวิตจากการลากซาเนฟุยุขึ้นจากน้ำ", due: "ยังไม่กำหนด", witness: "คนในเซฟเฮาส์", status: "open", note: "ใช้ขอความช่วยเหลือได้เฉพาะเรื่องที่ไม่ทำลายผลประโยชน์ไซกะ" }, { id: "debt-safehouse-rations", kind: "debt", holder: "เซฟเฮาส์ของไซกะ", subject: "ข้าวตากและยาที่ใช้รักษาแผล", due: "ก่อนออกจากที่ซ่อน", witness: "กันทาโร่", status: "open", note: "ชำระได้ด้วยของ ค่าปืน หรือแรงงาน ไม่ใช่เหรียญอย่างเดียว" }], transactions: [{ id: "tx-saika-rescue", kind: "favor", title: "กันทาโร่ลากซาเนฟุยุขึ้นจากน้ำ", counterpart: "กันทาโร่", payment: "บุญคุณที่ยังไม่กำหนดราคา", witness: "คนในเซฟเฮาส์", consequence: "ซาเนฟุยุมีที่ซ่อนชั่วคราว แต่ถูกผูกกับผลประโยชน์ไซกะ", tick: 1 }, { id: "tx-saika-rations", kind: "debt", title: "รับข้าวตากและยาพันแผล", counterpart: "เซฟเฮาส์ของไซกะ", payment: "ค้างแรงงานหรือส่วนแบ่งค่าปืน", witness: "กันทาโร่", consequence: "ของอยู่กับตัว แต่หนี้ถูกบันทึก", tick: 1 }] };
}

export function buildMarket(season: Season): MarketOffer[] {
  const seasonGoods: Record<Season, MarketOffer> = {
    Spring: { id: "rain-cloak", label: "เสื้อคลุมกันฝน", price: 2, priceUnit: "mon", kind: "goods", slots: 1, note: "ช่วยเดินทางในเส้นทางเปียก", available: true },
    Summer: { id: "water-skin", label: "ถุงน้ำและยาสมุนไพร", price: 2, priceUnit: "mon", kind: "goods", slots: 1, note: "ของจำเป็นเมื่อเดินทางกลางร้อน", available: true },
    Autumn: { id: "rice-bundle", label: "ข้าวตากหนึ่งห่อ", price: 2, priceUnit: "mon", kind: "goods", slots: 1, note: "เสบียงพกพาช่วงเก็บเกี่ยว", available: true },
    Winter: { id: "charcoal-brazier", label: "ถ่านและผ้าห่มบาง", price: 3, priceUnit: "mon", kind: "goods", slots: 2, note: "คุ้มกันความหนาว แต่กินสัมภาระ", available: true },
  };
  return [
    seasonGoods[season],
    { id: "rope", label: "เชือกปอ", price: 1, priceUnit: "mon", kind: "goods", slots: 1, note: "เปิดทางเลือกปีน ผูก หรือซ่อม", available: true },
    { id: "porter", label: "จ้างลูกหาบ", price: 2, priceUnit: "mon", kind: "service", note: "ลดภาระสัมภาระหนึ่งฉาก", available: true },
    { id: "scribe", label: "จ้างคนอ่านเอกสาร", price: 3, priceUnit: "mon", kind: "service", note: "เปิดวิธีใช้เอกสารที่ไม่เข้าใจ", available: true },
    { id: "rumor", label: "ข่าวด่านวันนี้", price: 1, priceUnit: "mon", kind: "information", note: "บอกแรงกดดันในฉากถัดไป", available: true },
  ];
}

const actionKeywords: { tags: string[]; stat: StatId; method: string; masteryTags: string[] }[] = [
  { tags: ["พัก", "ฟื้น", "ทำแผล", "คุย", "ทัก", "งานประจำ"], stat: "heart", method: "พักฟื้นหรือประคองความสัมพันธ์ในพื้นที่ปลอดภัย", masteryTags: ["rest", "care", "talk"] },
  { tags: ["ฟัน", "แทง", "ปัด", "ซ่อม", "ทำ", "จับ", "แกะ", "ยิง"], stat: "hand", method: "ใช้ฝีมือและการลงมือที่แม่นยำ", masteryTags: ["fight", "weapon", "repair", "craft", "metal"] },
  { tags: ["แบก", "ผลัก", "ยก", "ปีน", "วิ่ง", "ฝ่า", "ยื้อ"], stat: "body", method: "ใช้พลังกายและความอดทน", masteryTags: ["travel", "labor", "protect"] },
  { tags: ["หลบ", "ลอบ", "หลอก", "สังเกต", "หนี", "ซ่อน", "นำทาง"], stat: "wit", method: "อ่านจังหวะและใช้ไหวพริบ", masteryTags: ["hide", "route", "travel", "news", "wit"] },
  { tags: ["บัญชี", "เอกสาร", "แผน", "พิสูจน์", "อ่าน", "คำนวณ", "อ้าง"], stat: "mind", method: "ใช้เอกสาร เหตุผล หรือแผนที่มีอยู่", masteryTags: ["ledger", "document", "mind", "accounting", "inspection"] },
  { tags: ["ขอ", "สาบาน", "ยืน", "รับผิด", "เกลี้ยกล่อม", "คุ้มครอง", "รักษา"], stat: "heart", method: "ยืนบนคำสัตย์และแรงใจ", masteryTags: ["oath", "temple", "request", "mediation", "talk"] },
];

export function parseAction(action: string, state: GameState): RollPreview {
  const normalized = action.trim().toLowerCase();
  const match = actionKeywords.find((entry) => entry.tags.some((tag) => normalized.includes(tag))) ?? actionKeywords[2];
  const rankedMasteries = [...state.character.masteries].sort((a, b) => {
    const score = (mastery: Mastery) => mastery.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)) ? 1 : 0;
    return score(b) - score(a) || b.level - a.level;
  });
  const selectedMastery = rankedMasteries.find((mastery) => mastery.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)));
  const matchingItem = state.character.inventory.find((entry) => entry.condition === "usable" && entry.bonus && entry.bonus.tags.some((tag) => normalized.includes(tag) || match.masteryTags.includes(tag)));
  const namesSpecialDocumentUse = ["คำสั่ง", "ตรา", "ใบผ่าน", "order", "seal", "pass"].some((tag) => normalized.includes(tag));
  const specializedItem = state.character.inventory.find((entry) => namesSpecialDocumentUse && entry.condition === "usable" && entry.functions.includes("unlock") && entry.special && entry.special.tags.some((tag) => normalized.includes(tag)));
  const illicitRisk = normalized.includes("ฆ่า") || normalized.includes("ปลอม") || normalized.includes("ขโมย") || normalized.includes("บุก");
  const guardedObstacle = normalized.includes("ด่าน") || normalized.includes("ผู้คุม") || normalized.includes("ค่าย");
  const hasRelevantMastery = selectedMastery?.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)) ?? false;
  const contextBonus = Math.max(0, Math.min(2, matchingItem?.bonus?.value ?? 0));
  const isPrepared = Boolean(contextBonus);
  const veryEasy = /(พัก|ฟื้น|ทำแผล|คุย|ทัก|ถามเพื่อน|งานประจำ)/.test(normalized) && !illicitRisk && !guardedObstacle;
  const easy = hasRelevantMastery && !illicitRisk && !guardedObstacle;
  const difficulty: Difficulty = specializedItem?.special ? 0 : illicitRisk && guardedObstacle && !hasRelevantMastery && !isPrepared ? 28 : illicitRisk && guardedObstacle ? 24 : illicitRisk || guardedObstacle ? 20 : veryEasy ? 8 : easy ? 12 : 16;
  const difficultyReason = specializedItem?.special
    ? `${specializedItem.label}: ${specializedItem.special.reason}`
    : difficulty === 28
    ? "วิกฤต: การเสี่ยงผิดกฎหมายปะทะด่านหรือผู้คุม โดยยังไม่มีวิชาหรือเครื่องมือที่ช่วย"
    : difficulty === 24
      ? "อุปสรรค: ฉากมีแรงกดดันซ้อนกัน ต้องมีแผน เครื่องมือ หรือยอมรับราคา"
      : difficulty === 20
        ? illicitRisk ? "ท้าทาย: การกระทำนี้ทิ้งพยานหรือข้อครหา แม้ทำสำเร็จก็มีราคา" : "ท้าทาย: มีด่าน ผู้คุม หรือคนคอยขวาง จึงต้องใช้ฝีมือหรือการเตรียมตัว"
        : difficulty === 12
          ? "ค่อนข้างง่าย: ตัวละครมีวิธีหรือความชำนาญตรงกับงาน และความเสี่ยงยังเล็กน้อย"
          : difficulty === 8
            ? "ง่ายมาก: งานคุ้นมือในสถานการณ์ปลอดภัยหรือการพักฟื้น"
            : "มาตรฐาน: งานคุ้นเคยแต่ยังมีผลต่อฉากและต้องระวัง";
  return {
    action: action.trim(),
    intent: action.trim() || "ยังไม่ได้ระบุการกระทำ",
    method: match.method,
    stat: match.stat,
    mastery: selectedMastery,
    contextBonus,
    contextReason: specializedItem?.special ? `ใช้ ${specializedItem.label}` : matchingItem ? `ใช้ ${matchingItem.label}` : undefined,
    difficulty,
    difficultyReason,
    specialItem: specializedItem?.special ? { itemId: specializedItem.id, label: specializedItem.label, mode: specializedItem.special.mode, reason: specializedItem.special.reason } : undefined,
    flawTriggered: false,
    flawBonus: 0,
    risks: illicitRisk ? ["เกิดพยาน", "ข้อครหาเพิ่ม", "สถานการณ์ปะทุ"] : guardedObstacle ? ["ชื่อถูกจด", "ผู้คุมตั้งคำถาม", "เสียเวลา"] : ["ใช้เสบียง", "มีคนได้ยิน", "เกิดหนี้เล็กน้อย"],
    witnesses: guardedObstacle ? ["ผู้คุมด่าน", "เสมียน", "คนรอคิว"] : ["คนในพื้นที่"],
  };
}

function outcomeFromMargin(margin: number): Outcome {
  if (margin >= 5) return "decisive_success";
  if (margin >= 0) return "success_with_cost";
  if (margin >= -4) return "partial_success";
  return "failure_with_consequence";
}

const outcomeCopy: Record<Outcome, { label: string; narrative: string; consequence: string }> = {
  decisive_success: { label: "สำเร็จเด็ดขาด", narrative: "แผนของเจ้าทำงานเกินกว่าที่ผู้คนในฉากคาดไว้ และฝ่ายตรงข้ามต้องถอยเพื่อคิดใหม่.", consequence: "ได้เปิดทางเลือกใหม่พร้อมความไว้วางใจ" },
  success_with_cost: { label: "สำเร็จ แต่มีผลตามมา", narrative: "สิ่งที่เจ้าต้องการเกิดขึ้น แต่ไม่มีใครลืมว่าเจ้าทำอย่างไรและใครเป็นพยาน.", consequence: "เกิดพยานหรือหนี้ที่ต้องตอบแทน" },
  partial_success: { label: "สำเร็จบางส่วน", narrative: "เจ้าคว้าได้เพียงส่วนหนึ่งของเป้าหมาย และต้องเลือกว่าจะยอมรับผลลัพธ์นี้หรือจ่ายต่อเพื่อไปให้ถึง.", consequence: "ได้ข้อมูลหรือเวลาเพิ่ม แต่แรงกดดันยังอยู่" },
  failure_with_consequence: { label: "ไม่สำเร็จ", narrative: "โลกไม่ยอมให้แผนนี้ผ่านไปอย่างเงียบ ๆ เรื่องจึงเดินต่อด้วยราคาที่จับต้องได้.", consequence: "เกิดข้อครหาหรือแรงกดดันฉากใหม่" },
};

function localSpeakerReply(speaker: string, issuerType: Mission["issuerType"] | undefined, name: string, failed: boolean) {
  const replies: Record<NonNullable<Mission["issuerType"]>, { failure: string; other: string }> = {
    merchant: {
      failure: `${speaker} กดนิ้วลงบนเชือกปอที่ขอบลังจนเส้นใยลั่นเบา ๆ เขาอ้าปากจะต่อว่า แต่หันไปมองของเสียก่อน “เดี๋ยว” เขาพูด “ของเสียไปเท่าใด บอกข้าตรง ๆ ก่อน ถ้าตามกลับทันก่อนค่ำ เจ้าช่วยไปดูให้ข้าได้ไหม ข้าไม่อยากให้คนของข้ารู้จากปากคนอื่น”`,
      other: `${speaker} เลื่อนถุงผ้าออกจากขอบลังแล้วถอนใจ “เอาเถอะ เรื่องนี้ผ่านไปก่อน” เขาว่า “แต่บอกข้าที ของจะออกจากท่านี้เมื่อไร ข้าจะได้ไม่ปล่อยให้คนของข้ายืนรอเก้อ”`,
    },
    samurai: {
      failure: `${speaker} วางมือบนปากฝักดาบโดยไม่จับด้าม เขามองรอยนั้นอยู่พักหนึ่ง “อย่าเพิ่งแตะของเดิม” เขาว่า แล้วจึงเงยหน้าขึ้น “รอยนี้ต้องมีคนตรวจอีกครั้ง ไปเอามาให้ข้าดูก่อนตะวันตก แล้วค่อยพูดกัน”`,
      other: `${speaker} มอง${name}อยู่ครู่หนึ่งก่อนพยักหน้า “พอแล้ว” เขาว่า แล้วหันไปดูคนที่ยืนรอข้างหลัง “เก็บของให้เรียบร้อย อยู่ที่นี่ก่อน ถ้ามีคนถาม ข้าจะตอบเอง”`,
    },
    ruler: {
      failure: `${speaker} ไม่ยกเสียง เขารอจนคนรอบตัวเงียบก่อนพูดว่า “กลับไปเอาหลักฐานมา” เขาหยุดนิดหนึ่งเหมือนจะฟังคำแก้ตัวต่อ แต่ส่ายหน้า “ของต้องอยู่ต่อหน้าข้า แล้วค่อยพูด”`,
      other: `${speaker} พยักหน้าเพียงครั้งเดียว “ไปได้” เขาพูด แล้วมองตาม${name}อยู่ครู่หนึ่ง “ก่อนคืนนี้ เอาเรื่องนี้มาบอกข้าเอง อย่าให้ข้าต้องส่งคนไปตาม”`,
    },
    temple: {
      failure: `${speaker} ลูบขอบผ้าห่มเก่าแล้วลดเสียงลง “ถ้าข่าวนี้ไปถึงคนทั้งลาน เด็กในวัดจะเดือดร้อนก่อนใคร” เขามองไปทางประตูแล้วพูดต่อ “ไปหาทางหยุดมันก่อนเถอะ ก่อนจะมีคนมาถามที่นี่”`,
      other: `${speaker} ประนมมืออยู่ครู่หนึ่ง “ของที่หายยังตามได้” เขาว่า “ถ้าเจ้าจะไป ก็ไปตอนนี้ก่อนคนอื่นรู้ตัว ข้าจะให้คนเฝ้าประตูไว้”`,
    },
    commoner: {
      failure: `${speaker} กำชายเสื้อไว้แน่นแล้วพูดเบา “ถ้าเขามาถามถึงบ้าน ข้าจะตอบคนเดียวไม่ไหว” เขาเหลือบไปดูคนในเรือน แล้วลดเสียงลงอีก “ช่วยหาคนที่เห็นเรื่องนี้ให้ข้าที อย่างน้อยข้าจะไม่ต้องพูดอยู่คนเดียว”`,
      other: `${speaker} ถอนลมหายใจช้า ๆ “วันนี้เราไปต่อได้” เขาว่า แล้วหันไปดูคนในเรือน “แต่พรุ่งนี้ถ้าเขากลับมาถาม เจ้าช่วยอยู่ด้วยสักครู่ได้ไหม ข้าไม่อยากให้เด็ก ๆ ต้องฟังข้าคนเดียว”`,
    },
  };
  const role = issuerType ?? "commoner";
  return failed ? replies[role].failure : replies[role].other;
}

function localOutcomeNarration(preview: RollPreview, state: GameState, outcome: Outcome, consequence: string) {
  const mission = activeMainMission(state) ?? state.missions[0];
  const speaker = state.currentScene.speaker || mission?.issuer || "ผู้มอบงาน";
  // ดึงสถานะฝ่ายจาก worldSystems.powerRumor (event-driven) — read-only ต่อค่าเกม
  const powerRumor = state.worldSystems?.powerRumor;
  const factionId = factionOfSpeaker(speaker);
  const factionStance = factionId ? powerRumor?.factions.find((f) => f.factionId === factionId)?.stance : undefined;
  const heatLevel = powerRumor?.heatTracks.find(
    (h) => h.locationId === state.currentScene.location && h.provinceId === state.campaign.region.toLowerCase(),
  )?.level ?? powerRumor?.heatTracks[0]?.level ?? 0;
  // ท่อนบทพูดเสริมตามชื่อเสียง (คืน "" ถ้า neutral/ไม่รู้จักฝ่าย)
  const voiceTag = voiceReplyFor(speaker, factionStance, heatLevel);
  const first = `หลังจาก ${state.character.name} ลงมือทำตามที่ตั้งใจไว้ เสียงใน${state.currentScene.location}เงียบลงชั่วขณะ มีเพียงไม้เก่าลั่นใต้ฝ่าเท้าและผ้ากระทบกันเบา ๆ คนที่อยู่ใกล้สุดขยับถอยครึ่งก้าว ไม่ได้หนีไปไหน แต่ก็ไม่อยากยืนติดกับเรื่องนี้เกินจำเป็น ${state.currentScene.pressure}ยังอยู่ตรงเดิม เพียงแต่ตอนนี้ทุกคนเห็นมันชัดกว่าเมื่อครู่.`;
  const middle = `${localSpeakerReply(speaker, mission?.issuerType, state.character.name, outcome === "failure_with_consequence")} คนข้างหลัง${speaker}หลบตา คนหนึ่งก้มจัดเชือกฟางที่ข้อเท้า ไม่มีใครรับคำแทน${state.character.name} แต่คนที่ยืนอยู่แถวนั้นได้ยินสิ่งที่พูด และรู้ว่าต้องระวังคำของตนมากขึ้น.${voiceTag ? " " + voiceTag : ""}`;
  const last = outcome === "decisive_success"
    ? `${speaker}ยอมขยับมือไปแตะสิ่งที่ก่อนหน้านี้ยังไม่ยอมรับ ทางข้างหน้าจึงเปิดกว้างขึ้นกว่าที่คิด แต่ชื่อของ${state.character.name}ก็ถูกคนใน${state.currentScene.location}จำไว้มากขึ้นเช่นกัน ไม่มีใครพูดถึงรางวัลในตอนนั้น ต่างคนต่างกลับไปจับของในมือ หรือมองทางที่ต้องไปต่อ เพราะเรื่องนี้ยังไม่จบแค่ตรงหน้า.`
    : outcome === "failure_with_consequence"
      ? `เรื่องนี้ยังไม่จบ แต่ทางเดิมใช้ไม่ได้เหมือนก่อน ${state.character.name}ต้องหาทางอื่น หรือยอมเสียเวลาและของบางอย่างเพื่อแก้สิ่งที่ค้างอยู่ คนใน${state.currentScene.location}ไม่ได้ลงความเห็นแทนกัน เพียงมองเห็นว่าครั้งต่อไปจะมีคำถามมากขึ้น และไม่มีใครอยากเป็นคนตอบแทนเขา.`
      : `สิ่งที่${state.character.name}ต้องการเกิดขึ้นเพียงส่วนหนึ่ง ส่วนที่เหลือยังค้างอยู่ใน${state.currentScene.location} ${speaker}เก็บของช้าลง ก่อนหันไปดูทางที่คนเดินผ่าน คนอื่นเริ่มกระซิบกันเบา ๆ เพราะต่างคนต่างคิดว่าตนจะเกี่ยวข้องกับเรื่องนี้อย่างไร และข่าวจะไปถึงใครก่อน.`;
  return [first, middle, last].join("\n\n");
}

export function resolveRoll(preview: RollPreview, state: GameState): RollRecord {
  const bypassesRoll = Boolean(preview.specialItem && preview.difficulty === 0);
  const dice: [number, number] = bypassesRoll ? [0, 0] : [Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1];
  const statValue = traitValueForRoll(state.character.attributes[preview.stat]);
  const masteryValue = preview.mastery?.level ?? 0;
  const flawBonus = preview.flawTriggered && preview.flawBonus === -2 ? -2 : 0;
  const contextBonus = Math.max(0, Math.min(2, preview.contextBonus));
  const total = dice[0] + dice[1] + statValue + masteryValue + contextBonus + flawBonus;
  const margin = total - preview.difficulty;
  const outcome = bypassesRoll ? "decisive_success" : outcomeFromMargin(margin);
  const copy = outcomeCopy[outcome];
  return {
    ...preview,
    id: `roll-${Date.now()}`,
    dice,
    total,
    margin,
    outcome,
    summary: `${copy.label}: ${preview.intent}`,
    narrative: localOutcomeNarration(preview, state, outcome, copy.consequence),
    reward: outcome === "failure_with_consequence" ? undefined : "ความคืบหน้าของภารกิจและทางเลือกใหม่",
    consequence: copy.consequence,
    tick: state.tick + 1,
  };
}

function awardPractice(masteries: Mastery[], record: RollRecord) {
  const used = record.mastery ? masteries.find((entry) => entry.id === record.mastery?.id) : undefined;
  if (!used) return { masteries, practice: undefined as SkillPractice | undefined };
  const before = normalizeMasteryProgress(used);
  const levelBefore = before.level;
  if (levelBefore >= MAX_MASTERY_LEVEL) return { masteries, practice: { masteryId: before.id, masteryLabel: before.label, gained: 0, rankBefore: levelBefore, rankAfter: levelBefore, xp: 0, xpNeeded: 0, masteryMark: before.masteryMark ?? "Peerless" } };
  const eligible = record.difficulty >= 12 && !record.specialItem;
  const gained = eligible ? (record.outcome === "decisive_success" ? 2 : 1) : 0;
  let level = levelBefore;
  let xp = (before.xp ?? 0) + gained;
  let masteryMark = before.masteryMark;
  while (level < MAX_MASTERY_LEVEL && xp >= xpNeededForMasteryLevel(level)) {
    xp -= xpNeededForMasteryLevel(level);
    level += 1;
    if (level === MAX_MASTERY_LEVEL) { xp = 0; masteryMark = "Peerless"; }
  }
  const after: Mastery = { ...before, rank: level, level, xp, totalXp: (before.totalXp ?? 0) + gained, masteryMark };
  const practice: SkillPractice = { masteryId: after.id, masteryLabel: after.label, gained, rankBefore: levelBefore, rankAfter: level, xp: after.xp ?? 0, xpNeeded: xpNeededForMasteryLevel(level), masteryMark, note: level >= MAX_MASTERY_LEVEL ? "ถึงระดับหาตัวจับไม่ได้แล้ว" : eligible ? "ฝึกจากการใช้ความชำนาญในงานที่มีความเสี่ยง" : record.specialItem ? "ไอเทมเฉพาะทางเปิดทางให้โดยไม่ต้องฝึกทอย" : "งาน DN 8 เป็นงานคุ้นมือ จึงไม่เพิ่ม Mastery Progress" };
  return { masteries: masteries.map((entry) => entry.id === after.id ? after : entry), practice };
}

function awardStatPractice(attributes: Attributes, statXp: StatXp, record: RollRecord) {
  const stat = record.stat;
  const valueBefore = normalizeStatValue(attributes[stat]);
  const before = statXp[stat] ?? { xp: 0, totalXp: 0 };
  if (valueBefore >= MAX_STAT_VALUE) {
    return { attributes, statXp, practice: { stat, gained: 0, valueBefore, valueAfter: valueBefore, xp: 0, xpNeeded: 0, note: "Stat เติบโตถึงขั้นสูงสุดแล้ว" } as StatPractice };
  }
  const gained = record.difficulty >= 12 && !record.specialItem ? record.outcome === "decisive_success" ? 2 : 1 : 0;
  let value = valueBefore;
  let xp = before.xp + gained;
  while (value < MAX_STAT_VALUE && xp >= statXpNeededForValue(value)) {
    xp -= statXpNeededForValue(value);
    value += 1;
  }
  if (value >= MAX_STAT_VALUE) xp = 0;
  const after = { xp, totalXp: before.totalXp + gained };
  const practice: StatPractice = {
    stat,
    gained,
    valueBefore,
    valueAfter: value,
    xp,
    xpNeeded: traitProgressNeededForLevel(value),
    note: value > valueBefore ? `Trait ${STATS.find((entry) => entry.id === stat)?.th ?? stat} ขึ้นเป็น Level ${value}: ${traitLevelDetails(value).th}` : gained ? `ใช้ Trait ${STATS.find((entry) => entry.id === stat)?.th ?? stat} ในงาน DN ${record.difficulty}` : record.specialItem ? "ไอเทมเฉพาะทางเปิดทางให้โดยไม่ต้องฝึก Trait" : "งาน DN 8 เป็นงานคุ้นมือ จึงไม่เพิ่ม Trait Progress",
  };
  return { attributes: { ...attributes, [stat]: value }, statXp: { ...statXp, [stat]: after }, practice };
}

function advanceClock(current: ProgressionState, outcome: Outcome): { progression: ProgressionState; timeMark: TimeMark; dayAdvance: number } {
  const segments: TimeSegment[] = ["dawn", "day", "dusk", "night"];
  const marks = outcome === "decisive_success" ? 2 : 1;
  const startingIndex = segments.indexOf(current.segment);
  const absolute = startingIndex + marks;
  const dayAdvance = Math.floor(absolute / segments.length);
  const to = segments[absolute % segments.length];
  const daysSinceLeaf = current.daysSinceLeaf + dayAdvance;
  const leafAdvanced = daysSinceLeaf >= 4;
  const message = leafAdvanced ? "หลายวันได้ทิ้งร่องรอยพอให้เปิด Page ใหม่" : dayAdvance ? "เรื่องยืดผ่านวันเดิมไปแล้ว" : `แสงรอบตัวเคลื่อนจาก ${current.segment} ไปสู่ ${to}`;
  const timeMark: TimeMark = { from: current.segment, to, advancedDays: dayAdvance, leafAdvanced, message };
  return { progression: { ...current, leaf: leafAdvanced ? current.leaf + 1 : current.leaf, segment: to, timeMarksSinceLeaf: leafAdvanced ? 0 : current.timeMarksSinceLeaf + marks, daysSinceLeaf: leafAdvanced ? 0 : daysSinceLeaf, lastTimeMark: timeMark }, timeMark, dayAdvance };
}

function advanceCampaignCalendar(campaign: CampaignContext, progression: ProgressionState, dayAdvance: number) {
  const seasons: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
  let year = campaign.year;
  let season = campaign.season;
  let day = campaign.day + dayAdvance;
  let currentAge = progression.currentAge;
  while (day > 30) {
    day -= 30;
    const nextIndex = (seasons.indexOf(season) + 1) % seasons.length;
    if (season === "Winter") year += 1;
    season = seasons[nextIndex];
    if (year > progression.campaignStartYear && season === progression.birthSeason) currentAge += 1;
  }
  return { campaign: { ...campaign, year, season, day }, progression: { ...progression, currentAge } };
}

function progressActiveMission(state: GameState, record: RollRecord): { missions: Mission[]; inventory: InventoryItem[]; transaction?: ExchangeRecord; update?: RollRecord["missionUpdate"] } {
  const mission = activeMainMission(state) ?? state.missions.find((entry) => entry.state === "offered" || entry.state === "active");
  if (!mission?.progress || record.outcome === "failure_with_consequence") return { missions: state.missions, inventory: state.character.inventory };
  const gained = record.outcome === "decisive_success" ? 2 : 1;
  const current = Math.min(mission.progress.required, mission.progress.current + gained);
  const resolved = current >= mission.progress.required;
  const rewardItem = resolved && mission.progress.rewardItem ? { ...mission.progress.rewardItem, id: `mission-reward-${mission.id}-${record.id}` } : undefined;
  const reward = resolved ? mission.reward : undefined;
  const updated: Mission = { ...mission, state: resolved ? "resolved" : "active", progress: { ...mission.progress, current, resolvedBy: resolved ? record.id : mission.progress.resolvedBy, rewardGranted: resolved || mission.progress.rewardGranted } };
  const transaction = resolved ? { id: `tx-mission-${mission.id}-${record.id}`, kind: "favor" as const, title: `ผลของงาน: ${mission.title}`, counterpart: mission.issuer, payment: "การกระทำในฉาก", witness: state.currentScene.speaker || mission.issuer, consequence: reward ?? "งานเปลี่ยนสถานะ", tick: record.tick } : undefined;
  return { missions: state.missions.map((entry) => entry.id === mission.id ? updated : entry), inventory: rewardItem ? [...state.character.inventory, rewardItem] : state.character.inventory, transaction, update: { missionId: mission.id, current, required: mission.progress.required, state: updated.state, reward } };
}

function relationshipEvidenceTone(record: RollRecord): PublicRelationshipEvent["tone"] {
  return record.outcome === "failure_with_consequence" ? "vermilion" : record.outcome === "success_with_cost" ? "ochre" : record.outcome === "partial_success" ? "navy" : "teal";
}

/**
 * Relationship evidence is derived only from player-visible roll/context data.
 * It never reads the server dossier and does not change dice, resources, or NPC behavior.
 */
export function captureRelationshipEvidence(state: GameState, record: RollRecord, mission?: Mission): PublicRelationshipContact[] {
  const sourceText = [record.action, record.intent, record.summary, record.consequence ?? "", record.narrative, state.currentScene.speaker, mission?.issuer ?? "", mission?.title ?? ""].join("\n").toLocaleLowerCase();
  return state.relationships.map((contact) => {
    const mentioned = [contact.nameTh, contact.nameEn, contact.contactId]
      .filter(Boolean)
      .some((name) => sourceText.includes(name.toLocaleLowerCase()));
    if (!mentioned) return contact;
    const eventId = `relationship-roll-${contact.contactId}-${record.id}`;
    if (contact.events.some((event) => event.id === eventId)) return contact;
    const event: PublicRelationshipEvent = {
      id: eventId,
      sourceType: "roll",
      sourceId: record.id,
      inGameDay: state.campaign.day,
      tick: record.tick,
      title: relationshipText(`A visible consequence involving ${contact.nameEn}`, `เหตุการณ์ที่เกี่ยวข้องกับ${contact.nameTh}`),
      detail: relationshipText(`The resolved action left a public consequence connected to ${contact.nameEn}.`, `${record.summary}${record.consequence ? ` · ${record.consequence}` : ""}`),
      tone: relationshipEvidenceTone(record),
    };
    const latestDailyLog = contact.latestDailyLog?.inGameDay === state.campaign.day
      ? contact.latestDailyLog
      : { id: `relationship-pending-${contact.contactId}-${state.campaign.day}`, inGameDay: state.campaign.day, status: "pending" as const, summary: relationshipText("Analysis is waiting for the day's evidence.", "กำลังรอวิเคราะห์หลักฐานของวันในเกมนี้"), eventIds: [] };
    return { ...contact, events: [...contact.events, event], latestDailyLog: { ...latestDailyLog, eventIds: Array.from(new Set([...latestDailyLog.eventIds, event.id])) } };
  });
}

/* ==========================================================================
 * Social Record mechanics — ขึ้นเฉพาะ "เหตุการณ์สำคัญ" (ภารกิจหลัก/รองสำเร็จ)
 *
 * Cap: honor 5 · influence 4 (ฝ่ายมีจำกัด) · information 5 · stain 5
 * เพิ่มยาก 2x: เก็บทศนิยมครึ่งหน่วย — ต้อง "ครึ่ง 2 ครั้ง" จึงขึ้น 1 ระดับที่เห็น
 *   - เกียรติ / บารมี / ข่าวในมือ: +0.5 ต่อภารกิจสำเร็จ (หลักหรือรอง)
 *   - ข้อครหา: +1 เมื่อพลาดแบบมีผล (เรื่องสำคัญ) ; ลด -0.5 เมื่อสำเร็จภารกิจ (ลงยาก 2x)
 * อ้างอิงสเปก (เพิ่มยากสองเท่า / เฉพาะภารกิจสำคัญ) — random event กันไว้ทำทีหลัง
 * ========================================================================== */
function applySocialRecord(
  record: RollRecord,
  social: Character["social"],
  missionResult: { update?: RollRecord["missionUpdate"] },
): Character["social"] {
  const missionResolved = missionResult.update?.state === "resolved";
  const clamp = (value: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, value));
  // "ข่าวในมือ" (information) ถูกตัดออกจากกลไกแล้ว — เก็บ field ไว้ในโครงสร้าง เผื่อ random event (สืบ/สอบสวน) ใช้ทีหลัง
  return {
    ...social,
    honor: clamp(social.honor + (missionResolved ? 0.5 : 0), 0, 5),
    influence: clamp(social.influence + (missionResolved ? 0.5 : 0), 0, 4),
    stain: clamp(social.stain + (record.outcome === "failure_with_consequence" ? 1 : 0) - (missionResolved ? 0.5 : 0), 0, 5),
  };
}

export function applyRoll(state: GameState, record: RollRecord): GameState {
  const copy = outcomeCopy[record.outcome];
  const success = record.outcome !== "failure_with_consequence";
  const initialProgression = state.progression ?? defaultProgression(state.campaign, state.character.identity.includes("สิบสาม") ? 13 : 20, state.campaign.season);
  const awarded = awardPractice(state.character.masteries, record);
  const traitAwarded = awardStatPractice(state.character.attributes, state.character.statXp, record);
  const clock = advanceClock(initialProgression, record.outcome);
  const calendar = advanceCampaignCalendar(state.campaign, clock.progression, clock.dayAdvance);
  const missionResult = progressActiveMission(state, record);
  const activeMission = state.missions.find((entry) => entry.state === "offered" || entry.state === "active");
  const relationships = captureRelationshipEvidence(state, record, activeMission);
  const social = applySocialRecord(record, state.character.social, missionResult);
  const action = record.action.toLocaleLowerCase();
  const resting = /พัก|ฟื้น|ทำแผล|rest|recover|heal/.test(action);
  const vitalDelta = resting && record.outcome !== "failure_with_consequence" ? { wounds: 1, focus: 1, reason: "พักฟื้นหรือทำแผลสำเร็จ" } : record.outcome === "failure_with_consequence" ? { wounds: -1, focus: -1, reason: "ผลลัพธ์รุนแรงทำให้บาดเจ็บและเสียสมาธิ" } : record.outcome === "success_with_cost" ? { wounds: 0, focus: -1, reason: "สำเร็จแต่ต้องแลกด้วยความกดดัน" } : { wounds: 0, focus: 0, reason: "ไม่มีการเปลี่ยน vitals" };
  const maxes = vitalMaxes(state.character);
  const nextVitals = { ...state.character.vitals, maxWounds: maxes.maxWounds, maxFocus: maxes.maxFocus, wounds: clampVital(state.character.vitals.wounds + vitalDelta.wounds, maxes.maxWounds), focus: clampVital(state.character.vitals.focus + vitalDelta.focus, maxes.maxFocus) };
  const updatedCharacter: Character = {
    ...state.character,
    attributes: traitAwarded.attributes,
    statXp: traitAwarded.statXp,
    masteries: awarded.masteries,
    inventory: missionResult.inventory,
    vitals: nextVitals,
    social,
  };
  const memory: WorldMemory = {
    id: `memory-${record.id}`,
    kind: record.outcome === "failure_with_consequence" ? "stain" : record.outcome === "success_with_cost" ? "witness" : "favor",
    title: copy.label,
    detail: record.consequence ?? copy.consequence,
    tick: record.tick,
    tone: record.outcome === "failure_with_consequence" ? "vermilion" : record.outcome === "success_with_cost" ? "ochre" : "teal",
  };
  const missions = missionResult.missions;
  const fallbackSceneBody = record.narrative.split(/\n\n+/).filter(Boolean).slice(0, 3);
  const nextScene: Scene = {
    ...state.currentScene,
    id: `scene-${record.id}`,
    chapter: `Page ${String(record.tick).padStart(2, "0")}`,
    title: success ? "ราคาของคำตอบ" : "สิ่งที่โลกไม่ยอมลืม",
    body: fallbackSceneBody,
    speaker: state.currentScene.speaker,
    prompt: "เจ้าจะทำอย่างไรต่อ?",
    pressure: record.consequence ?? state.currentScene.pressure,
    suggestedActions: success ? ["รับรางวัลแล้วถามเงื่อนไข", "ตามหาคนที่เป็นพยาน", "กลับไปดูภารกิจอื่น"] : ["แก้ความเข้าใจกับผู้คุม", "หาหลักฐานเพิ่ม", "ยอมรับผลแล้วเปลี่ยนแผน"],
  };
  const storedRecord: RollRecord = { ...record, practice: awarded.practice, statPractice: traitAwarded.practice, timeMark: clock.timeMark, missionUpdate: missionResult.update };
  const storyRecord: StoryRecord = { id: `story-${record.id}`, tick: record.tick, inGameDay: state.campaign.day, title: nextScene.title, prose: nextScene.body.join("\n\n"), location: nextScene.location };
  const previousStoryRecords = state.storyRecords ?? [];
  const priorWorld = state.worldSystems?.powerRumor ?? emptyPowerRumorState();
  const rollEvent = eventFromRoll(state, record);
  const updatedWorld = applyWorldEvent(priorWorld, rollEvent);
  return { ...state, campaign: calendar.campaign, progression: { ...calendar.progression, lastPractice: awarded.practice, lastStatPractice: traitAwarded.practice, growthPoints: (calendar.progression.growthPoints ?? 0) + (record.outcome === "decisive_success" ? 1 : 0), milestonePoints: (calendar.progression.milestonePoints ?? 0) + (missionResult.update?.state === "resolved" ? 1 : 0), vitalEvents: [...(calendar.progression.vitalEvents ?? []), ...(vitalDelta.wounds || vitalDelta.focus ? [{ id: `vital-${record.id}`, type: vitalDelta.wounds ? "wounds" : "focus", delta: vitalDelta.wounds || vitalDelta.focus, reason: vitalDelta.reason, source: resting ? "rest" : "roll", tick: record.tick } as VitalEvent] : [])].slice(-50) }, character: updatedCharacter, currentScene: nextScene, missions, economy: missionResult.transaction ? { ...state.economy, transactions: [...state.economy.transactions, missionResult.transaction] } : state.economy, memories: [...state.memories, memory], rolls: [...state.rolls, storedRecord], storyRecords: [...previousStoryRecords.filter((entry) => entry.id !== storyRecord.id), storyRecord], relationships, tick: record.tick, worldSystems: { ...state.worldSystems, schemaVersion: 1, powerRumor: updatedWorld } };
}

export function buyMarketOffer(state: GameState, offerId: string): { state: GameState; message: string } {
  const offer = state.market.find((entry) => entry.id === offerId);
  if (!offer || !offer.available) return { state, message: "รายการนี้ไม่พร้อมแล้ว" };
  const currencyAmount = state.character.resources.currency?.amount ?? state.character.resources.property;
  const canUseObligation = Boolean(offer.debtAllowed) && offer.id === "saika-medicine" && state.economy.obligations.some((entry) => entry.id === "debt-safehouse-rations" && entry.status === "open");
  const paidOnObligation = currencyAmount < offer.price && canUseObligation;
  if (currencyAmount < offer.price && !paidOnObligation) return { state, message: "เงินไม่พอ · ลองเจรจา รับงาน หรือสร้างหนี้บุญคุณกับผู้ขาย" };
  const inventory = offer.kind === "goods" ? [...state.character.inventory, { ...item(`market-${offer.id}-${Date.now()}`, offer.label, "reserve", offer.note, offer.slots ?? 1, ["unlock"], { value: 1, tags: [offer.id] }), location: "carried" as const, ownership: "owned" as const }] : state.character.inventory;
  const transaction: ExchangeRecord = { id: `tx-${offer.id}-${Date.now()}`, kind: paidOnObligation ? "debt" : offer.kind === "service" ? "service" : "purchase", title: offer.kind === "service" ? `จ้าง ${offer.label}` : `รับ ${offer.label} จากตลาด`, counterpart: paidOnObligation ? "เซฟเฮาส์ของไซกะ" : offer.kind === "service" ? offer.label : state.economy.marketTitle, payment: paidOnObligation ? `หนี้บุญคุณต่อเซฟเฮาส์ · มูลค่า ${formatMoney(offer.price)}` : `จ่าย ${formatMoney(offer.price)}`, witness: paidOnObligation ? "กันทาโร่รับรู้การค้ำ" : "คนในตลาดที่มองเห็นการแลกเปลี่ยน", consequence: paidOnObligation ? `ต้องชำระด้วยแรงงาน ของ หรือภารกิจเสริมจาก ${offer.label}` : offer.priceReason ?? offer.note, tick: state.tick };
  const memory: WorldMemory = { id: `memory-${transaction.id}`, kind: "market_change", title: transaction.title, detail: `${transaction.payment}; ${transaction.consequence}`, tick: state.tick, tone: "ochre" };
  const priorWorld = state.worldSystems?.powerRumor ?? emptyPowerRumorState();
  const debtEvent = paidOnObligation ? applyWorldEvent(priorWorld, eventFromDebt(state, transaction.id, transaction.counterpart)) : priorWorld;
  return {
    state:       { ...state, character: { ...state.character, resources: { ...state.character.resources, currency: { unit: "mon", amount: paidOnObligation ? currencyAmount : currencyAmount - offer.price }, property: paidOnObligation ? currencyAmount : currencyAmount - offer.price, credit: 0 }, inventory }, market: state.market.map((entry) => entry.id === offer.id ? { ...entry, available: false } : entry), economy: { ...state.economy, obligations: paidOnObligation ? state.economy.obligations.map((entry) => entry.id === "debt-safehouse-rations" ? { ...entry, note: `${entry.note} · รับ ${offer.label} เพิ่มโดยกันทาโร่ค้ำ`, due: "ก่อนออกจากที่ซ่อน หรือเมื่อกันทาโร่ทวง" } : entry) : state.economy.obligations, transactions: [...state.economy.transactions, transaction] }, memories: [...state.memories, memory], worldSystems: { ...state.worldSystems, schemaVersion: 1, powerRumor: debtEvent } },
    message: paidOnObligation ? `รับ ${offer.label} แล้ว · บันทึกเป็นหนี้บุญคุณและภารกิจที่ต้องชำระ` : offer.kind === "goods" ? `รับ ${offer.label} แล้ว · จ่ายเป็น ${formatMoney(offer.price)}` : `ใช้บริการ: ${offer.label} · จ่ายเป็น ${formatMoney(offer.price)}`,
  };
}
