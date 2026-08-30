/**
 * Mission-domain types.
 * Depends on base primitives, economy (InventoryItem) and the sibling randomEvents module (EventEffect).
 */
import type { MissionRole, MissionState, MissionVisibility } from "./base";
import type { InventoryItem } from "./economy";
import type { EventEffect } from "../../randomEvents";

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
  /** เควสที่มาจากเหตุการณ์สุ่ม — สำเร็จได้รางวัลพิเศษ / แพ้เสียของพิเศษ */
  randomEvent?: { eventId: string; choiceId: string; effects: EventEffect[] };
  progress?: { current: number; required: number; triggerPhrases: string[]; rewardItem?: Omit<InventoryItem, "id">; resolvedBy?: string; rewardGranted?: boolean };
};

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