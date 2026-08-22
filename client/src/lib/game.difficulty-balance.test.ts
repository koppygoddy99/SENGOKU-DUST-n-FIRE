import { describe, expect, it } from "vitest";
import { applyMomentumFromSource, applyMomentumToRoll, applyRoll, createSaikaSafehouseDemo, getMomentumSources, parseAction, resolveRoll } from "./game";

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
  it("keeps a declared ordinary action at DN14 rather than making it automatic", () => {
    const game = createSaikaSafehouseDemo();
    const preview = parseAction("ข้าจะเสนอแผนให้กันทาโร่", game);
    expect(preview.difficulty).toBe(14);
    expect(preview.difficultyReason).toContain("เดิมพันมีความหมาย");

    const outcomes = distribution(3, preview.difficulty);
    expect(outcomes.decisive + outcomes.success).toBe(99);
    expect(outcomes.partial + outcomes.failure).toBe(45);
  });

  it("uses DN18 for an obstacle or risky act, leaving a relevant specialist a real but fair chance", () => {
    const game = createSaikaSafehouseDemo();
    const preview = parseAction("ข้าจะยิงผู้คุมที่ด่านด้วยปืนคาบศิลา", game);
    expect(preview.difficulty).toBe(18);
    expect(preview.difficultyReason).toContain("อุปสรรคจริง");

    const outcomes = distribution(5, preview.difficulty);
    expect(outcomes.decisive + outcomes.success).toBe(78);
    expect(outcomes.failure).toBe(28);
  });

  it("reserves DN22 for an unprepared compounded crisis instead of every illicit word", () => {
    const game = createSaikaSafehouseDemo();
    const unprepared = parseAction("ข้าจะปลอมตราเพื่อผ่านด่าน", game);
    const prepared = parseAction("ข้าจะยิงผู้คุมที่ด่านด้วยปืนคาบศิลา", game);
    expect(unprepared.difficulty).toBe(22);
    expect(unprepared.difficultyReason).toContain("วิกฤต");
    expect(prepared.difficulty).toBe(18);

    const outcomes = distribution(3, unprepared.difficulty);
    expect(outcomes.failure).toBe(89);
    expect(outcomes.partial).toBe(34);
  });

  it("spends Momentum on the inspected result instead of rerolling or dropping its breakdown", () => {
    const game = createSaikaSafehouseDemo();
    const record = resolveRoll(parseAction("ข้าจะเสนอแผนให้กันทาโร่", game), game, false);
    const boosted = applyMomentumToRoll(record, game);

    expect(boosted.dice).toEqual(record.dice);
    expect(boosted.id).toBe(record.id);
    expect(boosted.tick).toBe(record.tick);
    expect(boosted.axis).toBe(record.axis);
    expect(boosted.mastery).toEqual(record.mastery);
    expect(boosted.contextBonus).toBe(record.contextBonus);
    expect(boosted.total).toBe(record.total + 2);
    expect(boosted.margin).toBe(record.margin + 2);
    expect(boosted.momentumSpent).toBe(2);
  });

  it("lists concrete Momentum sources from Focus, carried reserves, and an open favor", () => {
    const game = createSaikaSafehouseDemo();
    const sources = getMomentumSources(game);
    expect(sources).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "vital-focus", kind: "vital", cost: "Focus −1" }),
      expect.objectContaining({ id: "item-dry-ration", kind: "item", itemId: "dry-ration" }),
      expect.objectContaining({ id: "scene-favor-favor-gantaro-life", kind: "scene" }),
    ]));
  });

  it("uses a chosen carried reserve only when the Momentum result is recorded", () => {
    const game = createSaikaSafehouseDemo();
    const record = resolveRoll(parseAction("ข้าจะเสนอแผนให้กันทาโร่", game), game, false);
    const boosted = applyMomentumFromSource(record, game, "item-dry-ration");
    const saved = applyRoll(game, boosted);
    expect(boosted.dice).toEqual(record.dice);
    expect(boosted.momentumSource).toMatchObject({ kind: "item", itemId: "dry-ration", cost: "ใช้ของ 1 ชิ้น" });
    expect(saved.character.inventory.find((entry) => entry.id === "dry-ration")?.condition).toBe("used");
    expect(saved.character.vitals.focus).toBe(game.character.vitals.focus);
    expect(saved.memories.at(-1)?.detail).toContain("ใช้ของ 1 ชิ้น");
  });

  it("spends Focus only when the selected vital source is committed", () => {
    const game = createSaikaSafehouseDemo();
    const record = resolveRoll(parseAction("ข้าจะเสนอแผนให้กันทาโร่", game), game, false);
    const saved = applyRoll(game, applyMomentumFromSource(record, game, "vital-focus"));
    expect(saved.character.vitals.focus).toBe(game.character.vitals.focus - 1);
    expect(saved.character.vitals.momentum).toBe(game.character.vitals.momentum - 1);
  });
});
