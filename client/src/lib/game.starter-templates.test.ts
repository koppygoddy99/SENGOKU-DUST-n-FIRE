import { describe, expect, it } from "vitest";
import { RELATIONSHIP_QUESTIONS, STARTER_TEMPLATES, createGameState, masteryTierForRank, type CharacterDraft } from "./game";

function draftFor(templateId: string, overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    name: "ฮานะ",
    identity: "ผู้เล่นกำหนด",
    templateId,
    freeformOccupation: "",
    origin: "บ้านเกิด",
    strength: "ไม่ยอมทิ้งคนของตน",
    weakness: "ติดหนี้คนรู้จัก",
    answers: {},
    ...overrides,
  };
}

describe("starter occupation templates", () => {
  it("provides exactly ten grounded starter paths with bounded early advantages", () => {
    expect(STARTER_TEMPLATES).toHaveLength(10);
    expect(new Set(STARTER_TEMPLATES.map((template) => template.id)).size).toBe(10);

    STARTER_TEMPLATES.forEach((template) => {
      expect(template.age).toBeGreaterThanOrEqual(18);
      expect(template.age).toBeLessThanOrEqual(20);
      expect(template.masteries).toHaveLength(3);
      expect(template.inventory.length).toBeGreaterThanOrEqual(1);
      expect(template.mission.title).not.toHaveLength(0);
      expect(template.social.rank).toBeLessThanOrEqual(1);
      template.masteries.forEach((mastery) => {
        expect(masteryTierForRank(mastery.rank ?? 1).bonus).toBeGreaterThanOrEqual(1);
        expect(masteryTierForRank(mastery.rank ?? 1).bonus).toBeLessThanOrEqual(3);
      });
    });
  });

  it("uses the four replacement roles requested for Sakai, shinobi, temple combat, and mounted battle", () => {
    const ids = STARTER_TEMPLATES.map((template) => template.id);
    expect(ids).toEqual(expect.arrayContaining(["sakai_boat_crew", "shinobi", "warrior_monk", "mounted_samurai"]));
    expect(ids).not.toEqual(expect.arrayContaining(["sakai_merchant", "shinobi_network_runner", "temple_protector", "rear_castle_keeper"]));
  });

  it("keeps two answered character-background records without changing occupation base stats", () => {
    const template = STARTER_TEMPLATES.find((entry) => entry.id === "village_scribe")!;
    const draft = draftFor("village_scribe", {
      answers: { life_before: "เคยคัดบัญชีข้าวให้บ้านเกิด", stance: "ไม่ยืนข้างคนที่ใช้บัญชีทำร้ายผู้หิวโหย" },
    });
    const state = createGameState({ id: "background-test", title: "บัญชีเก่า", year: 1578, season: "Summer", region: "Mikawa", location: "หมู่บ้าน", warShadow: 3, day: 1 }, draft);
    expect(RELATIONSHIP_QUESTIONS).toHaveLength(2);
    expect(state.character.attributes).toEqual(template.attributes);
    expect(state.character.pulls.map((entry) => entry.answer)).toEqual(["เคยคัดบัญชีข้าวให้บ้านเกิด", "ไม่ยืนข้างคนที่ใช้บัญชีทำร้ายผู้หิวโหย"]);
  });

  it("persists the selected template age, social record, resources, gear, and opening mission in a local campaign", () => {
    const template = STARTER_TEMPLATES.find((entry) => entry.id === "sakai_boat_crew")!;
    const state = createGameState({ id: "sakai-test", title: "น้ำขึ้นที่ซาไก", year: 1578, season: "Summer", region: "Sakai", location: "ท่าเรือ", warShadow: 3, day: 1 }, draftFor(template.id));
    expect(state.progression?.currentAge).toBe(template.age);
    expect(state.character.social).toEqual(template.social);
    expect(state.character.resources).toEqual(template.resources);
    expect(state.character.inventory.map((item) => item.id)).toEqual(template.inventory.map((item) => item.id));
    expect(state.missions[0]?.title).toBe(template.mission.title);
  });
});
