import { describe, expect, it, vi } from "vitest";
import {
  canonicalDifficulty,
  createSaikaSafehouseDemo,
  mergeAIAnalysis,
  parseAction,
  resolveRoll,
  traitValueForRoll,
  type GMAnalysisProposal,
  type RollPreview,
} from "./game";

type Masteries = ReturnType<typeof createSaikaSafehouseDemo>["character"]["masteries"];

function validProposal(overrides: Partial<GMAnalysisProposal> = {}): GMAnalysisProposal {
  return {
    intentSummary: "Ask the clerk for time.",
    stat: "mind",
    suggestedMastery: null,
    difficulty: 14,
    contextBonus: 1,
    flawTriggered: false,
    flawBonus: 0,
    triggeredFlaw: null,
    flawReason: null,
    contextReason: "The ledger is visible.",
    confirmation: "You cite the ledger and ask.",
    risk: "The witness may remember you.",
    historicalFence: "Fictional context.",
    historicalStatus: "campaign-fiction",
    ...overrides,
  };
}

/**
 * Reference implementation of the PREVIOUS PlayScene inline merge.
 * The behavioral specification: expected values come from this, not from
 * assumptions about what the behavior should be.
 */
function legacyMerge(base: RollPreview, answer: GMAnalysisProposal, masteries: Masteries): RollPreview {
  const mastery = answer.suggestedMastery
    ? masteries.find((entry) => entry.label.toLowerCase().includes(answer.suggestedMastery!.toLowerCase()) || answer.suggestedMastery!.toLowerCase().includes(entry.label.toLowerCase()))
    : undefined;
  const special = base.specialItem;
  return {
    ...base,
    isRiskOnly: false,
    intent: answer.intentSummary,
    method: answer.confirmation,
    stat: answer.stat,
    mastery,
    contextBonus: special ? base.contextBonus : Math.max(0, Math.min(2, answer.contextBonus)),
    contextReason: special ? base.contextReason : answer.contextReason,
    flawTriggered: answer.flawTriggered,
    flawBonus: answer.flawBonus,
    triggeredFlaw: answer.triggeredFlaw ?? undefined,
    flawReason: answer.flawReason ?? undefined,
    difficulty: special ? 0 : canonicalDifficulty(answer.difficulty),
    specialItem: special,
    risks: [answer.risk],
    witnesses: [],
    historical: { status: answer.historicalStatus, fence: answer.historicalFence },
  };
}

function basePreview(demo = createSaikaSafehouseDemo(), action = "I will read the ledger and ask for time."): RollPreview {
  return parseAction(action, demo);
}

describe("mergeAIAnalysis reproduces the previous PlayScene merge behavior", () => {
  it("produces the identical RollPreview as the previous inline UI merge for a valid analysis", () => {
    const demo = createSaikaSafehouseDemo();
    const base = basePreview(demo);
    const proposal = validProposal();
    expect(mergeAIAnalysis(base, proposal, demo.character.masteries)).toEqual(legacyMerge(base, proposal, demo.character.masteries));
  });

  it("matches the legacy merge when a mastery is suggested and when a flaw is triggered", () => {
    const demo = createSaikaSafehouseDemo();
    const base = basePreview(demo);
    const label = demo.character.masteries[0].label;
    const withMastery = validProposal({ suggestedMastery: label, flawTriggered: true, flawBonus: -2, triggeredFlaw: "Owes a boatman", flawReason: "The debt colors the scene." });
    expect(mergeAIAnalysis(base, withMastery, demo.character.masteries)).toEqual(legacyMerge(base, withMastery, demo.character.masteries));
    expect(mergeAIAnalysis(base, withMastery, demo.character.masteries).mastery?.id).toBe(demo.character.masteries[0].id);
    expect(mergeAIAnalysis(base, withMastery, demo.character.masteries).flawBonus).toBe(-2);
  });

  it("matches the legacy merge for both directions of partial mastery-name matching", () => {
    const demo = createSaikaSafehouseDemo();
    const base = basePreview(demo);
    const label = demo.character.masteries[0].label;
    const shortQuery = validProposal({ suggestedMastery: label.slice(0, 4) });
    const longQuery = validProposal({ suggestedMastery: label + " extra words" });
    expect(mergeAIAnalysis(base, shortQuery, demo.character.masteries)).toEqual(legacyMerge(base, shortQuery, demo.character.masteries));
    expect(mergeAIAnalysis(base, shortQuery, demo.character.masteries).mastery?.id).toBe(demo.character.masteries[0].id);
    expect(mergeAIAnalysis(base, longQuery, demo.character.masteries)).toEqual(legacyMerge(base, longQuery, demo.character.masteries));
    expect(mergeAIAnalysis(base, longQuery, demo.character.masteries).mastery?.id).toBe(demo.character.masteries[0].id);
  });

  it("records the current behavior: suggestedMastery null drops the local mastery", () => {
    const demo = createSaikaSafehouseDemo();
    const localMastery = demo.character.masteries[0];
    const base = { ...basePreview(demo), mastery: localMastery };
    const proposal = validProposal({ suggestedMastery: null });
    const merged = mergeAIAnalysis(base, proposal, demo.character.masteries);
    expect(merged.mastery).toBeUndefined();
    expect(merged).toEqual(legacyMerge(base, proposal, demo.character.masteries));
  });

  it("normalizes out-of-range difficulty through the existing canonicalDifficulty ladder", () => {
    const demo = createSaikaSafehouseDemo();
    const base = basePreview(demo);
    for (const difficulty of [3, 9, 17, 99]) {
      const proposal = validProposal({ difficulty });
      const merged = mergeAIAnalysis(base, proposal, demo.character.masteries);
      expect(merged.difficulty).toBe(canonicalDifficulty(difficulty));
      expect(merged).toEqual(legacyMerge(base, proposal, demo.character.masteries));
    }
    expect(mergeAIAnalysis(base, validProposal({ difficulty: 99 }), demo.character.masteries).difficulty).toBe(32);
    expect(mergeAIAnalysis(base, validProposal({ difficulty: 3 }), demo.character.masteries).difficulty).toBe(8);
    expect(mergeAIAnalysis(base, validProposal({ difficulty: 17 }), demo.character.masteries).difficulty).toBe(16);
  });

  it("normalizes contextBonus with the same clamp and no rounding, exactly as before", () => {
    const demo = createSaikaSafehouseDemo();
    const base = basePreview(demo);
    expect(mergeAIAnalysis(base, validProposal({ contextBonus: -5 }), demo.character.masteries).contextBonus).toBe(0);
    expect(mergeAIAnalysis(base, validProposal({ contextBonus: 7 }), demo.character.masteries).contextBonus).toBe(2);
    expect(mergeAIAnalysis(base, validProposal({ contextBonus: 1.7 }), demo.character.masteries).contextBonus).toBe(1.7);
    expect(mergeAIAnalysis(base, validProposal({ contextBonus: 1.7 }), demo.character.masteries)).toEqual(legacyMerge(base, validProposal({ contextBonus: 1.7 }), demo.character.masteries));
  });

  it("passes flaw fields through raw, exactly as the previous UI merge did", () => {
    const demo = createSaikaSafehouseDemo();
    const base = basePreview(demo);
    const triggered = validProposal({ flawTriggered: true, flawBonus: -2 });
    expect(mergeAIAnalysis(base, triggered, demo.character.masteries).flawTriggered).toBe(true);
    expect(mergeAIAnalysis(base, triggered, demo.character.masteries).flawBonus).toBe(-2);
    const untriggeredWithBonus = validProposal({ flawTriggered: false, flawBonus: -2 });
    const merged = mergeAIAnalysis(base, untriggeredWithBonus, demo.character.masteries);
    expect(merged.flawTriggered).toBe(false);
    expect(merged.flawBonus).toBe(-2);
    expect(merged).toEqual(legacyMerge(base, untriggeredWithBonus, demo.character.masteries));
  });

  it("always replaces risks, clears witnesses, and forces isRiskOnly false", () => {
    const demo = createSaikaSafehouseDemo();
    const base = { ...basePreview(demo), isRiskOnly: true as const, risks: ["local risk"], witnesses: ["local witness"] };
    const merged = mergeAIAnalysis(base, validProposal(), demo.character.masteries);
    expect(merged.isRiskOnly).toBe(false);
    expect(merged.risks).toEqual(["The witness may remember you."]);
    expect(merged.witnesses).toEqual([]);
    expect(merged).toEqual(legacyMerge(base, validProposal(), demo.character.masteries));
  });

  it("keeps special-item behavior exactly: difficulty 0, local context bonus and reason preserved", () => {
    const demo = createSaikaSafehouseDemo();
    const base: RollPreview = {
      ...basePreview(demo),
      specialItem: { itemId: "letter", label: "Gantaro's letter", mode: "dn_zero", reason: "The seal satisfies the checkpoint." },
      contextBonus: 2,
      contextReason: "Local reason kept.",
    };
    const proposal = validProposal({ difficulty: 24, contextBonus: 0, contextReason: "AI reason ignored for special items." });
    const merged = mergeAIAnalysis(base, proposal, demo.character.masteries);
    expect(merged.difficulty).toBe(0);
    expect(merged.contextBonus).toBe(2);
    expect(merged.contextReason).toBe("Local reason kept.");
    expect(merged.specialItem).toEqual(base.specialItem);
    expect(merged.stat).toBe(proposal.stat);
    expect(merged.intent).toBe(proposal.intentSummary);
    expect(merged.historical).toEqual({ status: proposal.historicalStatus, fence: proposal.historicalFence });
    expect(merged).toEqual(legacyMerge(base, proposal, demo.character.masteries));
  });

  it("always writes the historical boundary from the analysis", () => {
    const demo = createSaikaSafehouseDemo();
    const base = { ...basePreview(demo), historical: { status: "fact-supported" as const, fence: "old fence" } };
    const merged = mergeAIAnalysis(base, validProposal({ historicalStatus: "contextual-play", historicalFence: "new fence" }), demo.character.masteries);
    expect(merged.historical).toEqual({ status: "contextual-play", fence: "new fence" });
    expect(merged).toEqual(legacyMerge(base, validProposal({ historicalStatus: "contextual-play", historicalFence: "new fence" }), demo.character.masteries));
  });
});

describe("resolveRoll is unchanged after the AI merge moves into the engine", () => {
  it("computes the canonical total from a merged preview", () => {
    const demo = createSaikaSafehouseDemo();
    const base = basePreview(demo);
    const label = demo.character.masteries[0].label;
    const merged = mergeAIAnalysis(base, validProposal({ suggestedMastery: label, contextBonus: 1, flawTriggered: true, flawBonus: -2 }), demo.character.masteries);
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const record = resolveRoll(merged, demo);
    vi.restoreAllMocks();
    const expectedTotal = 9 + 9 + traitValueForRoll(demo.character.attributes[merged.stat]) + (merged.mastery?.level ?? 0) + merged.contextBonus - 2;
    expect(record.dice).toEqual([9, 9]);
    expect(record.total).toBe(expectedTotal);
    expect(record.margin).toBe(record.total - merged.difficulty);
  });

  it("keeps the special-item dice bypass intact", () => {
    const demo = createSaikaSafehouseDemo();
    const base: RollPreview = {
      ...basePreview(demo),
      specialItem: { itemId: "letter", label: "Gantaro's letter", mode: "dn_zero", reason: "The seal satisfies the checkpoint." },
    };
    const merged = mergeAIAnalysis(base, validProposal(), demo.character.masteries);
    const record = resolveRoll(merged, demo);
    expect(record.dice).toEqual([0, 0]);
    expect(record.outcome).toBe("decisive_success");
    expect(record.difficulty).toBe(0);
  });
});