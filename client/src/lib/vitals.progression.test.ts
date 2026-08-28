import { describe, expect, it } from "vitest";
import { applyVitalDelta, awardMilestonePoint, createSaikaSafehouseDemo, levelUpVital, normalizeGameState, type GameState } from "./game";

describe("Blood and Focus progression", () => {
  it("normalizes legacy vitals with separate caps", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    expect(game.character.vitals.maxBlood).toBe(6);
    expect(game.character.vitals.maxFocus).toBe(6);
    expect(game.progression?.growthPoints).toBe(0);
    expect(game.progression?.milestonePoints).toBe(0);
  });

  it("migrates legacy save keys wounds/maxWounds to blood/maxBlood", () => {
    const legacy = createSaikaSafehouseDemo() as unknown as { character: { vitals: Record<string, unknown> } };
    legacy.character.vitals = { wounds: 4, focus: 2, maxWounds: 7, maxFocus: 5 };
    const migrated = normalizeGameState(legacy as unknown as GameState);
    expect(migrated.character.vitals.blood).toBe(4);
    expect(migrated.character.vitals.maxBlood).toBe(7);
    expect(migrated.character.vitals.focus).toBe(2);
    expect((migrated.character.vitals as Record<string, unknown>).wounds).toBeUndefined();
  });

  it("clamps vital changes to zero and the separate maximum", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const hurt = applyVitalDelta(game, "blood", -99, "ทดสอบเสียเลือด", "event");
    expect(hurt.character.vitals.blood).toBe(0);
    const restored = applyVitalDelta(hurt, "blood", 99, "ทดสอบรักษา", "medicine");
    expect(restored.character.vitals.blood).toBe(6);
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

  it("never raises a cap beyond VITAL_CAP 10", () => {
    let game = normalizeGameState(createSaikaSafehouseDemo());
    for (let i = 0; i < 12; i += 1) {
      game = levelUpVital(awardMilestonePoint(game, `ครั้งที่ ${i}`), "max_blood");
    }
    expect(game.character.vitals.maxBlood).toBe(10);
    expect(game.progression?.milestonePoints).toBe(0);
  });

  it("awards a milestone reward only once per milestone_id", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const first = awardMilestonePoint(game, "จบภารกิจหลัก", "mission-main-ganjiro");
    expect(first.progression?.milestonePoints).toBe(1);
    const second = awardMilestonePoint(first, "จบภารกิจหลัก (ซ้ำ)", "mission-main-ganjiro");
    expect(second.progression?.milestonePoints).toBe(1);
    expect(second.progression?.claimedMilestoneIds).toContain("mission-main-ganjiro");
    const other = awardMilestonePoint(second, "จบภารกิจรอง", "mission-side-boatman");
    expect(other.progression?.milestonePoints).toBe(2);
  });
});
