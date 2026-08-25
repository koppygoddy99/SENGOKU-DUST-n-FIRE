import { describe, expect, it } from "vitest";
import { applyRoll, bonusForMasteryRank, createSaikaSafehouseDemo, masteryTierForRank, normalizeGameState, parseAction, type RollRecord } from "./game";

function recordFor(state: ReturnType<typeof createSaikaSafehouseDemo>, outcome: RollRecord["outcome"]): RollRecord {
  const preview = parseAction("ข้าจะยิงปืนคาบศิลาเพื่อคุ้มกันเอจิยะ", state);
  return { ...preview, id: `progression-${outcome}`, dice: [6, 6], total: 18, margin: 4, outcome, momentumSpent: 0, summary: "ผลทดสอบความก้าวหน้า", narrative: "ร้อยแก้วทดสอบ", consequence: "ร่องรอยทดสอบ", tick: state.tick + 1 };
}

describe("skill progression and campaign time", () => {
  it("migrates an older local save by retaining mastery bonus and adding progression defaults", () => {
    const base = createSaikaSafehouseDemo();
    const migrated = normalizeGameState({ ...base, progression: undefined, character: { ...base.character, masteries: base.character.masteries.map((mastery) => ({ ...mastery, rank: undefined, xp: undefined, totalXp: undefined })) } });
    expect(migrated.progression?.currentAge).toBe(13);
    expect(migrated.character.masteries[0].rank).toBe(8);
    expect(migrated.character.masteries[0].level).toBe(2);
  });

  it("awards meaningful practice, climbs the first threshold, advances time, resolves the mission, and grants its contextual reward", () => {
    const base = createSaikaSafehouseDemo();
    const ready = { ...base, character: { ...base.character, masteries: base.character.masteries.map((mastery, index) => index === 0 ? { ...mastery, rank: 4, level: 1, xp: 4, totalXp: 4 } : mastery) } };
    const next = applyRoll(ready, recordFor(ready, "decisive_success"));
    const firearm = next.character.masteries[0];
    expect(firearm.rank).toBe(5);
    expect(firearm.level).toBe(2);
    expect(firearm.xp).toBe(1);
    expect(next.progression?.lastPractice).toMatchObject({ masteryId: "saika-firearm", gained: 2, rankBefore: 4, rankAfter: 5 });
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

  it("uses a genuine XP staircase: higher steps require harder work while their roll bonus increases", () => {
    const base = createSaikaSafehouseDemo();
    const veteran = { ...base, character: { ...base.character, masteries: base.character.masteries.map((mastery, index) => index === 0 ? { ...mastery, rank: 13, level: 4, xp: 0, totalXp: 88 } : mastery) } };
    const lowPressureRecord = recordFor(veteran, "success_with_cost");
    expect(lowPressureRecord.difficulty).toBe(10);
    const next = applyRoll(veteran, lowPressureRecord);
    expect(next.progression?.lastPractice).toMatchObject({ gained: 0, rankAfter: 13, note: "ต้องเผชิญงาน DN 18+ เพื่อฝึกขั้นนี้" });
    expect(bonusForMasteryRank(4)).toBe(1);
    expect(bonusForMasteryRank(5)).toBe(2);
    expect(bonusForMasteryRank(13)).toBe(4);
    expect(masteryTierForRank(17)).toMatchObject({ minimumDifficulty: 22, bonus: 5 });
    expect(masteryTierForRank(20)).toMatchObject({ bonus: 6 });
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
});
