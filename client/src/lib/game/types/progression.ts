/**
 * Progression / aggregate types (GameState and friends).
 * Depends on base, character, mission, economy and the sibling randomEvents/worldEvents modules.
 */
import type {
  BilingualText,
  Difficulty,
  Mastery,
  MemoryKind,
  MissionState,
  Outcome,
  RelationshipEventSource,
  RelationshipTone,
  Season,
  SkillPractice,
  StatId,
  StatPractice,
  TimeMark,
  TimeSegment,
  VitalEvent,
} from "./base";
import type { Character } from "./character";
import type { Mission } from "./mission";
import type { EconomyState, EquipmentState, MarketOffer } from "./economy";
import type { EventHistoryEntry, RandomEvent } from "../../randomEvents";
import type { PowerRumorState } from "../../worldEvents";

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
  /** milestone_id ที่เคยให้รางวัลแล้ว — แต่ละ milestone ให้ได้ครั้งเดียว */
  claimedMilestoneIds?: string[];
  /** ประวัติเหตุการณ์สุ่มที่เจอแล้ว (eventId + วัน) — ใช้ตรวจ cooldown_days */
  eventHistory?: EventHistoryEntry[];
  vitalEvents?: VitalEvent[];
};
export type WorldMemory = {
  id: string;
  kind: MemoryKind;
  title: string;
  detail: string;
  tick: number;
  tone: "teal" | "ochre" | "vermilion" | "navy";
};

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
export type HistoricalBoundary = {
  status: import("./base").HistoricalStatus;
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
  powerRumor?: PowerRumorState;
  vitalProgression?: { maxBlood: number; maxFocus: number; growthPoints: number; milestonePoints: number };
};

export type GameState = {
  schemaVersion: number;
  /** Equipped item ids (Outfit 1 / Weapon 1) — อ้างอิง item id ใน inventory เดิม; เซฟเก่าไม่มีฟิลด์นี้ */
  equipment?: EquipmentState;
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
  /** เหตุการณ์สุ่มที่ engine เลือกไว้รอให้ผู้เล่นเลือกทาง (AI เล่าได้ แก้ผลไม่ได้) */
  pendingRandomEvent?: RandomEvent & { offeredDay: number };
  tick: number;
};
