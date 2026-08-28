import { describe, expect, it } from "vitest";
import { applyVitalDelta, awardMilestonePoint, createSaikaSafehouseDemo, levelUpVital, normalizeGameState } from "./game";

describe("Wounds and Focus progression", () => {
  it("normalizes legacy vitals with separate caps", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    expect(game.character.vitals.maxWounds).toBe(6);
    expect(game.character.vitals.maxFocus).toBe(6);
    expect(game.progression?.growthPoints).toBe(0);
    expect(game.progression?.milestonePoints).toBe(0);
  });

  it("clamps vital changes to zero and the separate maximum", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const wounded = applyVitalDelta(game, "wounds", -99, "ทดสอบบาดเจ็บ", "event");
    expect(wounded.character.vitals.wounds).toBe(0);
    const restored = applyVitalDelta(wounded, "wounds", 99, "ทดสอบรักษา", "medicine");
    expect(restored.character.vitals.wounds).toBe(6);
    expect(restored.progression?.vitalEvents?.length).toBeGreaterThan(0);
  });

  it("spends one milestone to raise one cap and restores one current point", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const earned = awardMilestonePoint(game, "จบภารกิจหลัก");
    const leveled = levelUpVital(earned, "max_focus");
    expect(leveled.character.vitals.maxFocus).toBe(7);
    expect(leveled.character.vitals.focus).toBe(4);
    expect(leveled.progression?.milestonePoints).toBe(0);
  });
});
