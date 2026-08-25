import { describe, expect, it } from "vitest";
import { applyRoll, createSaikaSafehouseDemo, masteryLevelDetails, normalizeGameState, parseAction, traitProgressNeededForLevel, type RollRecord, xpNeededForMasteryLevel } from "./game";

function recordFor(state: ReturnType<typeof createSaikaSafehouseDemo>, outcome: RollRecord["outcome"]): RollRecord {
  const preview = parseAction("ข้าจะยิงปืนคาบศิลาเพื่อคุ้มกันเอจิยะ", state);
  return { ...preview, id: `progression-${outcome}`, dice: [6, 6], total: 18, margin: 4, outcome, summary: "ผลทดสอบความก้าวหน้า", narrative: "ร้อยแก้วทดสอบ", consequence: "ร่องรอยทดสอบ", tick: state.tick + 1 };
}

describe("skill progression and campaign time", () => {
  it("migrates an older local save to the corresponding Mastery Level and adds progression defaults", () => {
    const base = createSaikaSafehouseDemo();
    const migrated = normalizeGameState({ ...base, progression: undefined, character: { ...base.character, masteries: base.character.masteries.map((mastery) => ({ ...mastery, rank: undefined, xp: undefined, totalXp: undefined })) } });
    expect(migrated.progression?.currentAge).toBe(13);
    expect(migrated.character.masteries[0]).toMatchObject({ rank: 2, level: 2, xp: 0, totalXp: 0 });
  });

  it("awards meaningful Progress, climbs a five-Progress threshold, advances time, resolves the mission, and grants its contextual reward", () => {
    const base = createSaikaSafehouseDemo();
    const ready = { ...base, character: { ...base.character, masteries: base.character.masteries.map((mastery, index) => index === 0 ? { ...mastery, rank: 1, level: 1, xp: 4, totalXp: 4 } : mastery) } };
    const next = applyRoll(ready, recordFor(ready, "decisive_success"));
    const firearm = next.character.masteries[0];
    expect(firearm).toMatchObject({ rank: 2, level: 2, xp: 1, totalXp: 6 });
    expect(next.progression?.lastPractice).toMatchObject({ masteryId: "saika-firearm", gained: 2, rankBefore: 1, rankAfter: 2, xp: 1, xpNeeded: 5 });
    expect(next.progression?.lastTimeMark?.to).toBe("night");
    expect(next.missions[0].state).toBe("resolved");
    expect(next.missions[0].progress).toMatchObject({ current: 2, required: 2, rewardGranted: true });
    expect(next.character.inventory.some((entry) => entry.label === "จดหมายรับรองของกันทาโร่")).toBe(true);
    expect(next.economy.transactions.some((entry) => entry.title.includes("คำตอบใต้ห้องขัง"))).toBe(true);
  });

  it("still records learning after a setback but does not complete the active mission or grant its reward", () => {
    const base = createSaikaSafehouseDemo();
    const next = applyRoll(base, recordFor(base, "failure_with_consequence"));
    expect(next.progression?.lastPractice?.gained).toBe(1);
    expect(next.missions[0].state).toBe("offered");
    expect(next.character.inventory.some((entry) => entry.label === "จดหมายรับรองของกันทาโร่")).toBe(false);
  });

  it("increments age only when the calendar crosses the character's birth season in a later campaign year", () => {
    const base = createSaikaSafehouseDemo();
    const timed = { ...base, campaign: { ...base.campaign, year: 1570, season: "Spring" as const, day: 30 }, progression: { ...base.progression!, campaignStartYear: 1569, birthSeason: "Summer" as const, currentAge: 13, ageAtCampaignStart: 13, segment: "night" as const } };
    const next = applyRoll(timed, recordFor(timed, "decisive_success"));
    expect(next.campaign).toMatchObject({ year: 1570, season: "Summer", day: 1 });
    expect(next.progression?.currentAge).toBe(14);
  });

  it("uses one five-Progress threshold at every non-cap level and stops at Level 5", () => {
    const base = createSaikaSafehouseDemo();
    const expert = { ...base, character: { ...base.character, masteries: base.character.masteries.map((mastery, index) => index === 0 ? { ...mastery, rank: 4, level: 4, xp: 0, totalXp: 15 } : mastery) } };
    const normalRecord = recordFor(expert, "success_with_cost");
    expect(normalRecord.difficulty).toBe(12);
    const next = applyRoll(expert, normalRecord);
    expect(next.progression?.lastPractice).toMatchObject({ gained: 1, rankBefore: 4, rankAfter: 4, xp: 1, xpNeeded: 5 });
    expect(masteryLevelDetails(4)).toMatchObject({ bonus: 4, th: "อาจารย์" });
    expect(masteryLevelDetails(5)).toMatchObject({ bonus: 5, th: "หาตัวจับไม่ได้" });
    expect(xpNeededForMasteryLevel(4)).toBe(5);
    const capped = { ...expert, character: { ...expert.character, masteries: expert.character.masteries.map((mastery, index) => index === 0 ? { ...mastery, rank: 5, level: 5, xp: 0, totalXp: 20 } : mastery) } };
    expect(applyRoll(capped, recordFor(capped, "decisive_success")).progression?.lastPractice).toMatchObject({ gained: 0, rankBefore: 5, rankAfter: 5, xpNeeded: 0 });
  });

  it("opens a new Page only after the campaign has accumulated several days of movement", () => {
    let state = createSaikaSafehouseDemo();
    for (let index = 0; index < 8; index += 1) {
      const record = { ...recordFor(state, "decisive_success"), id: `long-road-${index}`, tick: state.tick + 1 };
      state = applyRoll(state, record);
    }
    expect(state.progression).toMatchObject({ leaf: 2, daysSinceLeaf: 0 });
    expect(state.progression?.lastTimeMark).toMatchObject({ leafAdvanced: true, advancedDays: 1 });
  });

  it("uses the published Trait thresholds and stops Trait Progress at Level 10", () => {
    expect(traitProgressNeededForLevel(1)).toBe(3);
    expect(traitProgressNeededForLevel(4)).toBe(4);
    expect(traitProgressNeededForLevel(7)).toBe(5);
    expect(traitProgressNeededForLevel(9)).toBe(6);
    expect(traitProgressNeededForLevel(10)).toBe(0);

    const base = createSaikaSafehouseDemo();
    const capped = { ...base, character: { ...base.character, attributes: { ...base.character.attributes, hand: 10 }, statXp: { ...base.character.statXp, hand: { xp: 0, totalXp: 41 } } } };
    const next = applyRoll(capped, recordFor(capped, "decisive_success"));
    expect(next.character.attributes.hand).toBe(10);
    expect(next.progression?.lastStatPractice).toMatchObject({ stat: "hand", gained: 0, valueBefore: 10, valueAfter: 10, xpNeeded: 0 });
  });
});
