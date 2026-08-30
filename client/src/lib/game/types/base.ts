/**
 * Primitive / shared type definitions for the Dust & Fire game engine.
 * These have no cross-domain dependencies and are imported by every other type file.
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

export type VitalEvent = { id: string; type: "blood" | "focus"; delta: number; reason: string; source: "roll" | "rest" | "milestone"; tick: number };

export type RelationshipPull = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  weight: number;
};

export type BilingualText = { en: string; th: string };
export type RelationshipEventSource = "roll" | "memory" | "mission" | "exchange";
export type RelationshipTone = "navy" | "vermilion" | "ochre" | "teal" | "charcoal";
export type HistoricalStatus = "fact-supported" | "contextual-play" | "campaign-fiction" | "insufficient-evidence";
export type Difficulty = 0 | 8 | 12 | 16 | 20 | 24 | 28 | 32;