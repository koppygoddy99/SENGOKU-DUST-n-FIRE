import { describe, expect, it } from "vitest";
import {
  applyRoll,
  createGameState,
  createSaikaSafehouseDemo,
  masteryLevelDetails,
  parseAction,
  resolveRoll,
  traitValueForRoll,
  xpNeededForMasteryLevel,
} from "./game";

describe("rule changes: traits, mastery, context, and specialized gear", () => {
  it("keeps starting Traits in the 1–3 range without creating a separate trait bonus tier", () => {
    const state = createGameState(
      { id: "rule-start", title: "การเดินทาง", year: 1578, season: "Summer", region: "Mikawa", location: "หมู่บ้าน", warShadow: 2, day: 1 },
      { name: "ฮานะ", identity: "ผู้เล่นกำหนด", templateId: "village_scribe", freeformOccupation: "", origin: "หมู่บ้าน", strength: "ใจเย็น", weakness: "หนี้เก่า", flaws: ["หนี้เก่า"], answers: {} },
    );
    expect(Object.values(state.character.attributes).every((value) => value >= 1 && value <= 3)).toBe(true);
    expect(state.character.flaws).toEqual(["หนี้เก่า"]);
    expect(traitValueForRoll(1)).toBe(1);
    expect(traitValueForRoll(7)).toBe(7);
    expect(traitValueForRoll(10)).toBe(10);
  });

  it("uses the six published Mastery levels 0–5 and a single five-Progress threshold", () => {
    expect(masteryLevelDetails(0)).toMatchObject({ th: "ยังไม่ชำนาญ", bonus: 0 });
    expect(masteryLevelDetails(1)).toMatchObject({ th: "คุ้นมือ", bonus: 1 });
    expect(masteryLevelDetails(5)).toMatchObject({ th: "หาตัวจับไม่ได้", bonus: 5 });
    expect(xpNeededForMasteryLevel(0)).toBe(5);
    expect(xpNeededForMasteryLevel(4)).toBe(5);
    expect(xpNeededForMasteryLevel(5)).toBe(0);
  });

  it("retains all ordinary DN tiers and caps prepared Context/Gear at +2", () => {
    const game = createSaikaSafehouseDemo();
    expect(parseAction("ข้าจะพักฟื้นแผล", game).difficulty).toBe(8);
    expect(parseAction("ข้าจะยิงเป้าหมายในลานซ้อม", game).difficulty).toBe(10);
    expect(parseAction("ข้าจะเสนอแผนให้กันทาโร่", game).difficulty).toBe(14);
    expect(parseAction("ข้าจะยิงผู้คุม", game).difficulty).toBe(18);
    expect(parseAction("ข้าจะบุกด่านยิงผู้คุมด้วยปืนคาบศิลา", game).difficulty).toBe(22);
    expect(parseAction("ข้าจะปลอมตราเพื่อผ่านด่าน", game).difficulty).toBe(26);
    const prepared = {
      ...game,
      character: { ...game.character, inventory: [...game.character.inventory, { id: "overprepared", label: "ชุดเครื่องมือ", kind: "equipment" as const, slots: 1, description: "อุปกรณ์พร้อม", functions: ["bonus"] as const, bonus: { value: 9, tags: ["แผน"] }, condition: "usable" as const }] },
    };
    expect(parseAction("ข้าจะเสนอแผน", prepared).contextBonus).toBe(2);
  });

  it("applies a verified flaw after raw Trait and Mastery values, then gives only Mastery Progress on commit", () => {
    const game = createSaikaSafehouseDemo();
    const preview = { ...parseAction("ข้าจะยิงปืนคาบศิลาเพื่อคุ้มกันเอจิยะ", game), flawTriggered: true as const, flawBonus: -2 as const, triggeredFlaw: game.character.flaws[0], flawReason: "บาดแผลและการถูกหยามเกี่ยวข้องกับการเผชิญหน้าครั้งนี้" };
    const record = resolveRoll(preview, game, false);
    const traitValue = traitValueForRoll(game.character.attributes[record.stat]);
    expect(record.total).toBe(record.dice[0] + record.dice[1] + traitValue + (record.mastery?.level ?? 0) + record.contextBonus - 2);
    const beforeTotal = game.character.statXp[record.stat].totalXp;
    const next = applyRoll(game, record);
    expect(next.progression?.lastStatPractice).toBeUndefined();
    expect(next.character.statXp[record.stat].totalXp).toBe(beforeTotal);
    expect(next.progression?.lastPractice?.gained).toBeGreaterThanOrEqual(0);
  });

  it("uses an authentic specialized order to set DN 0 and pass without rolling", () => {
    const state = createGameState(
      { id: "order-test", title: "คำสั่ง", year: 1578, season: "Summer", region: "Omi", location: "ด่าน", warShadow: 2, day: 1 },
      { name: "อากิ", identity: "ผู้เล่นกำหนด", templateId: "daimyo_attendant", freeformOccupation: "", origin: "อะซุจิ", strength: "รอบคอบ", weakness: "หนี้เก่า", flaws: ["หนี้เก่า"], answers: {} },
    );
    const preview = parseAction("ข้าจะนำคำสั่งปิดผนึกผ่านด่านผู้คุม", state);
    expect(preview.difficulty).toBe(0);
    expect(preview.specialItem?.label).toBe("คำสั่งปิดผนึก");
    const record = resolveRoll(preview, state, false);
    expect(record.dice).toEqual([0, 0]);
    expect(record.outcome).toBe("decisive_success");
    const committed = applyRoll(state, record);
    expect(committed.progression?.lastPractice).toMatchObject({ gained: 0, note: "ไอเทมเฉพาะทางเปิดทางให้โดยไม่ต้องฝึกทอย" });
    expect(committed.character.masteries).toEqual(state.character.masteries);
    expect(parseAction("ข้าจะใช้อำนาจสั่งผู้คุมให้เปิดประตู", state).difficulty).not.toBe(0);
  });
});
