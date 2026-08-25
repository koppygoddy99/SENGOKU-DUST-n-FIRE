/**
 * Dust & Fire AI GM contract.
 * The model may interpret and narrate; the deterministic browser/game engine owns dice, costs, and state changes.
 */
export type GMStat = "body" | "hand" | "wit" | "mind" | "heart";

export type GMContext = {
  campaign: { title: string; year: number; season: string; region: string; location: string; warShadow: number; day: number };
  character: { name: string; occupation: string; origin: string; strengths: string; weakness: string; flaws: string[]; attributes: Record<GMStat, number>; masteries: Array<{ name: string; level: 0 | 1 | 2 | 3 | 4 | 5; source: string }> };
  currentScene: { title: string; location: string; summary: string; pressure: string; declaredChoices: string[] };
  activeMission?: { title: string; giver: string; objective: string; deadline: string; reward: string };
  socialState: { honor: number; influence: number; stain: number; rumors: string[]; oaths: string[]; debts: string[] };
  recentMemories: Array<{ title: string; detail: string; tone: string }>;
};

export type GMAnalyzeRequest = { action: string; language: "en" | "th"; context: GMContext };

export type GMAnalyzeResponse = {
  mode: "ai";
  intentSummary: string;
  stat: GMStat;
  suggestedMastery: string | null;
  difficulty: number;
  contextBonus: 0 | 1 | 2;
  flawTriggered: boolean;
  flawBonus: -2 | 0;
  triggeredFlaw: string | null;
  flawReason: string | null;
  contextReason: string;
  risk: string;
  confirmation: string;
  historicalFence: string;
};

export type GMResolveRequest = {
  language: "en" | "th";
  context: GMContext;
  action: string;
  roll: { outcome: "decisive" | "cost" | "partial" | "failure"; total: number; difficulty: number; summary: string; consequence: string | null };
};

export type GMResolveResponse = {
  mode: "ai";
  sceneTitle: string;
  narration: string[];
  nextChoices: string[];
  memory: { title: string; detail: string; tone: "navy" | "teal" | "vermilion" | "ochre" };
  missionNote: string;
  historicalFence: string;
};

export type RelationshipEvidence = {
  id: string;
  sourceType: "roll" | "memory" | "mission" | "exchange";
  inGameDay: number;
  tick: number;
  title: string;
  detail: string;
};

export type RelationshipAnalyzeRequest = {
  campaign: { id: string; year: number; season: string; region: string; inGameDay: number };
  language: "en" | "th";
  contact: { contactId: "gantaro" | "tokichi" | "masakichi" | "genshiro"; name: string; publicStatus: string; relationshipRole: string; familiarity: number; affinity: number };
  evidence: RelationshipEvidence[];
};

export type RelationshipAnalyzeResponse = {
  analysisVersion: "relationship-v1";
  sourceHash: string;
  summary: string;
  eventTags: string[];
  contactEffects: { familiarityDelta: -1 | 0 | 1; affinityDelta: -1 | 0 | 1 };
  playerVisibleKnowledge: string[];
  blankSpaceUpdate: string | null;
  confidence: "low" | "medium" | "high";
  evidenceIds: string[];
};
