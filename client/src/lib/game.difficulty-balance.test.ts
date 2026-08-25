import { describe, expect, it } from "vitest";
import { applyRoll, canonicalDifficulty, createSaikaSafehouseDemo, parseAction, resolveRoll } from "./game";

function outcomeForMargin(margin: number) {
  if (margin >= 5) return "decisive";
  if (margin >= 0) return "success";
  if (margin >= -4) return "partial";
  return "failure";
}

function distribution(bonus: number, difficulty: number) {
  const counts = { decisive: 0, success: 0, partial: 0, failure: 0 };
  for (let first = 1; first <= 12; first += 1) {
    for (let second = 1; second <= 12; second += 1) {
      counts[outcomeForMargin(first + second + bonus - difficulty)] += 1;
    }
  }
  return counts;
}

describe("DN balance guardrails", () => {
  it("keeps a declared ordinary action at DN16 rather than making it automatic", () => {
    const game = createSaikaSafehouseDemo();
    const preview = parseAction("ข้าจะเสนอแผนให้กันทาโร่", game);
    expect(preview.difficulty).toBe(16);
    expect(preview.difficultyReason).toContain("มาตรฐาน");

    const outcomes = distribution(2, preview.difficulty);
    expect(outcomes.decisive + outcomes.success).toBeGreaterThan(0);
    expect(outcomes.partial + outcomes.failure).toBeGreaterThan(0);
  });

  it("uses DN20 for an obstacle or risky act, leaving a relevant specialist a real but fair chance", () => {
    const game = createSaikaSafehouseDemo();
    const preview = parseAction("ข้าจะยิงผู้คุมที่ด่านด้วยปืนคาบศิลา", game);
    expect(preview.difficulty).toBe(20);
    expect(preview.difficultyReason).toContain("ท้าทาย");

    const outcomes = distribution(5, preview.difficulty);
    expect(outcomes.decisive + outcomes.success).toBeGreaterThan(outcomes.failure);
  });

  it("reserves DN28 for an unprepared compounded crisis instead of every illicit word", () => {
    const game = createSaikaSafehouseDemo();
    const unprepared = parseAction("ข้าจะปลอมตราเพื่อผ่านด่าน", game);
    const prepared = parseAction("ข้าจะยิงผู้คุมที่ด่านด้วยปืนคาบศิลา", game);
    expect(unprepared.difficulty).toBe(28);
    expect(unprepared.difficultyReason).toContain("วิกฤต");
    expect(prepared.difficulty).toBe(20);

    const outcomes = distribution(3, unprepared.difficulty);
    expect(outcomes.failure).toBeGreaterThan(outcomes.decisive + outcomes.success);
  });

  it("canonicalizes all AI-proposed ordinary difficulties to the published DN table", () => {
    expect([8, 12, 16, 20, 24, 28, 32]).toContain(canonicalDifficulty(8));
    expect(canonicalDifficulty(11)).toBe(12);
    expect(canonicalDifficulty(15)).toBe(16);
    expect(canonicalDifficulty(23)).toBe(24);
    expect(canonicalDifficulty(31)).toBe(32);
  });

  it("resolves a final total from dice, Trait, Mastery, Context, and Flaw only", () => {
    const game = createSaikaSafehouseDemo();
    const record = resolveRoll(parseAction("ข้าจะเสนอแผนให้กันทาโร่", game), game);

    const trait = game.character.attributes[record.stat];
    const mastery = record.mastery?.level ?? 0;
    const flaw = record.flawTriggered ? -2 : 0;
    expect(record.total).toBe(record.dice[0] + record.dice[1] + trait + mastery + record.contextBonus + flaw);
    expect(record).not.toHaveProperty("momentumSpent");
    expect(record).not.toHaveProperty("momentumSource");
  });

  it("levels a Trait when its Progress threshold is reached through an eligible roll", () => {
    const game = createSaikaSafehouseDemo();
    const prepared = {
      ...game,
      character: {
        ...game.character,
        attributes: { ...game.character.attributes, mind: 2 },
        statXp: { ...game.character.statXp, mind: { xp: 2, totalXp: 2 } },
      },
    };
    const preview = parseAction("ข้าจะเสนอแผนให้กันทาโร่", prepared);
    const record = { ...resolveRoll(preview, prepared), outcome: "success_with_cost" as const, difficulty: 16, specialItem: undefined };
    const saved = applyRoll(prepared, record);
    expect(saved.character.attributes.mind).toBe(3);
    expect(saved.character.statXp.mind).toMatchObject({ xp: 0, totalXp: 3 });
    expect(saved.progression?.lastStatPractice).toMatchObject({ stat: "mind", gained: 1, valueBefore: 2, valueAfter: 3 });
  });
});
