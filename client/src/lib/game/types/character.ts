/**
 * Character-domain types.
 * Depends on base primitives + economy (InventoryItem) + mission (Mission for StarterTemplate).
 */
import type { Currency, Mastery, RelationshipPull, StatId, StatXp } from "./base";
import type { InventoryItem } from "./economy";
import type { Mission } from "./mission";

export type Attributes = Record<StatId, number>;

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
  vitals: { blood: number; focus: number; maxBlood?: number; maxFocus?: number };
  social: { rank: number; honor: number; influence: number; information: number; stain: number };
  resources: { property: number; supplies: number; credit: number; currency?: Currency };
  /** `property` and `credit` remain as legacy compatibility aliases; UI must use currency/obligations. */
  inventory: InventoryItem[];
  pulls: RelationshipPull[];
};

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

export type StarterOriginSelection = {
  id: string;
  year: number;
  region: string;
  location: string;
  origin: string;
  age: number;
};