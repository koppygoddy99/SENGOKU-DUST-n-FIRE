import { describe, expect, it } from "vitest";
import {
  buildPowerRumorSummary,
  buildStoryCompact,
  type PowerRumorSummary,
} from "./powerRumor";
import { createSaikaSafehouseDemo, normalizeGameState } from "./game";

function demo() {
  return normalizeGameState(createSaikaSafehouseDemo());
}

describe("Power & Rumor Network — Phase 1 read-only projection", () => {
  it("creates a stable projection without mutating GameState", () => {
    const game = demo();
    const before = JSON.stringify(game);
    const summary: PowerRumorSummary = buildPowerRumorSummary(game, "th");
    expect(JSON.stringify(game)).toBe(before); // ห้ามเปลี่ยน state
    expect(summary.knownFactions.length).toBeGreaterThan(0);
    expect(summary.localRisk).toHaveProperty("status");
    expect(summary.seasonalPressure).toHaveProperty("summary");
  });

  it("shows player-visible factions with human-readable stance, never raw numeric score", () => {
    const game = demo();
    const summary = buildPowerRumorSummary(game, "th");
    for (const faction of summary.knownFactions) {
      // ต้องมีคำอธิบาย ไม่ใช่แค่ตัวเลข
      expect(faction.visibleReason.length).toBeGreaterThan(0);
      expect(faction).not.toHaveProperty("score");
    }
  });

  it("derives local heat from stain/evidence, not a global reputation", () => {
    const game = demo();
    const summary = buildPowerRumorSummary(game, "th");
    // Saika demo มีความขัดแย้งตั้งต้น (gantaro) → heat ≥ 1 แต่ต้องไม่เกิน 5
    expect(summary.localRisk.heatLevel).toBeGreaterThanOrEqual(1);
    expect(summary.localRisk.heatLevel).toBeLessThanOrEqual(5);
    expect(summary.localRisk.status).not.toBe("archived");
  });

  it("builds a compact projection for Story/Play with vitals and attributes", () => {
    const game = demo();
    const compact = buildStoryCompact(game, "th");
    expect(compact.vitals.wounds).toBe(game.character.vitals.wounds);
    expect(compact.vitals.max).toBe(6);
    expect(compact.attributes.length).toBe(5); // body hand wit mind heart
    expect(compact.time.province).toBe(game.campaign.region);
    expect(compact.powerRumor.topFactions.length).toBeGreaterThan(0);
  });

  it("flags critical vitals when wounds reach 5+", () => {
    const game = demo();
    game.character.vitals.wounds = 5;
    const compact = buildStoryCompact(game, "th");
    expect(compact.vitals.critical).toBe(true);
  });
});

describe("Power & Rumor Network — legacy save migration", () => {
  it("adds empty worldSystems to a legacy GameState without breaking it", () => {
    const legacy = createSaikaSafehouseDemo() as unknown as Parameters<typeof normalizeGameState>[0];
    delete (legacy as { worldSystems?: unknown }).worldSystems;
    const normalized = normalizeGameState(legacy);
    expect(normalized.worldSystems).toEqual({ schemaVersion: 1 });
    // state เดิมยังสมบูรณ์
    expect(normalized.character.vitals).toBeDefined();
    expect(normalized.campaign.title).toBeDefined();
    expect(Array.isArray(normalized.memories)).toBe(true);
  });

  it("preserves an existing worldSystems block through normalization", () => {
    const game = demo();
    game.worldSystems = { schemaVersion: 1, flags: { powerRumorNetwork: true, factionReputation: false, scopedHeat: false, seasonalPressure: false, npcMemoryRetrieval: false } };
    const normalized = normalizeGameState(game);
    expect(normalized.worldSystems?.flags?.powerRumorNetwork).toBe(true);
  });
});
