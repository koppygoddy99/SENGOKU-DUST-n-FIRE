import { describe, expect, it } from "vitest";
import { STARTER_TEMPLATES, attributesForDraft, createGameState, masteryTierForRank, selectedAttributePullIds, type CharacterDraft } from "./game";

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
    attributePullIds: [],
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

  it("adds no more than two answered relationship pulls to the selected occupation base stats", () => {
    const template = STARTER_TEMPLATES.find((entry) => entry.id === "village_scribe")!;
    const draft = draftFor("village_scribe", {
      answers: { hidden_knowledge: "รู้ว่าบัญชีใครถูกแก้", never_surrender: "จะไม่มอบสมุดบัญชี", sacrifice: "ยอมเสียแรงกาย" },
      attributePullIds: ["hidden_knowledge", "never_surrender", "sacrifice"],
    });
    expect(selectedAttributePullIds(draft)).toEqual(["hidden_knowledge", "never_surrender"]);
    expect(attributesForDraft(template, draft)).toEqual({ body: 1, hand: 1, wit: 2, mind: 5, heart: 3 });
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
