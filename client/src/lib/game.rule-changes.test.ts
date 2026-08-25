import { describe, expect, it } from "vitest";
import {
  applyRoll,
  bonusForMasteryRank,
  bonusForStatValue,
  createGameState,
  createSaikaSafehouseDemo,
  parseAction,
  resolveRoll,
  statXpNeededForValue,
} from "./game";

describe("rule changes: stats, DN tiers, and flaws", () => {
  it("starts every attribute in the 1–3 range and initializes Stat XP", () => {
    const state = createGameState(
      { id: "rule-start", title: "การเดินทาง", year: 1578, season: "Summer", region: "Mikawa", location: "หมู่บ้าน", warShadow: 2, day: 1 },
      { name: "ฮานะ", identity: "ผู้เล่นกำหนด", templateId: "village_scribe", freeformOccupation: "", origin: "หมู่บ้าน", strength: "ใจเย็น", weakness: "หนี้เก่า", flaws: ["หนี้เก่า"], answers: {} },
    );
    expect(Object.values(state.character.attributes).every((value) => value >= 1 && value <= 3)).toBe(true);
    expect(state.character.statXp).toEqual(expect.objectContaining({ mind: { xp: 0, totalXp: 0 } }));
    expect(state.character.flaws).toEqual(["หนี้เก่า"]);
  });

  it("maps Stat values to the published +1 through +5 bonus bands", () => {
    expect(bonusForStatValue(1)).toBe(1);
    expect(bonusForStatValue(3)).toBe(2);
    expect(bonusForStatValue(5)).toBe(3);
    expect(bonusForStatValue(7)).toBe(4);
    expect(bonusForStatValue(10)).toBe(5);
    expect(statXpNeededForValue(1)).toBe(5);
    expect(statXpNeededForValue(9)).toBe(14);
    expect(bonusForMasteryRank(20)).toBe(6);
  });

  it("selects all six canonical DN tiers from context instead of collapsing every action into the old three tiers", () => {
    const game = createSaikaSafehouseDemo();
    expect(parseAction("ข้าจะพักฟื้นแผล", game).difficulty).toBe(8);
    expect(parseAction("ข้าจะยิงเป้าหมายในลานซ้อม", game).difficulty).toBe(10);
    expect(parseAction("ข้าจะเสนอแผนให้กันทาโร่", game).difficulty).toBe(14);
    expect(parseAction("ข้าจะยิงผู้คุม", game).difficulty).toBe(18);
    expect(parseAction("ข้าจะบุกด่านยิงผู้คุมด้วยปืนคาบศิลา", game).difficulty).toBe(22);
    expect(parseAction("ข้าจะปลอมตราเพื่อผ่านด่าน", game).difficulty).toBe(26);
  });

  it("applies exactly −2 only for a verified flaw trigger and awards Stat XP after the committed roll", () => {
    const game = createSaikaSafehouseDemo();
    const preview = { ...parseAction("ข้าจะเสนอแผนให้กันทาโร่", game), flawTriggered: true as const, flawBonus: -2 as const, triggeredFlaw: game.character.flaws[0], flawReason: "บาดแผลและการถูกหยามเกี่ยวข้องกับการเผชิญหน้าครั้งนี้" };
    const record = resolveRoll(preview, game, false);
    const statBonus = bonusForStatValue(game.character.attributes[record.stat]);
    expect(record.total).toBe(record.dice[0] + record.dice[1] + statBonus + (record.mastery?.level ?? 0) + record.contextBonus - 2);
    const next = applyRoll(game, record);
    expect(next.progression?.lastStatPractice).toMatchObject({ stat: record.stat, gained: 1 });
    expect(next.character.statXp[record.stat].totalXp).toBe(1);
  });

  it("does not apply a hidden flaw penalty when the trigger is absent", () => {
    const game = createSaikaSafehouseDemo();
    const record = resolveRoll(parseAction("ข้าจะเสนอแผนให้กันทาโร่", game), game, false);
    expect(record.flawTriggered).toBe(false);
    expect(record.flawBonus).toBe(0);
  });
});
