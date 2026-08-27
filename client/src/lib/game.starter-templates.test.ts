import { describe, expect, it } from "vitest";
import { RELATIONSHIP_QUESTIONS, STARTER_ERAS, STARTER_TEMPLATES, createGameState, selectStarterOrigin, starterTemplatesForEra, startingAttributesForTemplate, type CharacterDraft } from "./game";

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
        expect(mastery.level).toBeGreaterThanOrEqual(1);
        expect(mastery.level).toBeLessThanOrEqual(3);
      });
    });
  });

  it("uses the four replacement roles requested for Sakai, shinobi, temple combat, and mounted battle", () => {
    const ids = STARTER_TEMPLATES.map((template) => template.id);
    expect(ids).toEqual(expect.arrayContaining(["sakai_boat_crew", "shinobi", "warrior_monk", "mounted_samurai"]));
    expect(ids).not.toEqual(expect.arrayContaining(["sakai_merchant", "shinobi_network_runner", "temple_protector", "rear_castle_keeper"]));
  });

  it("limits each historical era to a distinct, non-exhaustive set of compatible starter paths", () => {
    expect(STARTER_ERAS).toHaveLength(7);
    STARTER_ERAS.forEach((era) => {
      const eligible = starterTemplatesForEra(era.id);
      expect(eligible.length).toBeGreaterThanOrEqual(3);
      expect(eligible.length).toBeLessThan(STARTER_TEMPLATES.length);
      expect(new Set(eligible.map((template) => template.id))).toEqual(new Set(era.templateIds));
      expect(era.years.every((year) => year >= 1467 && year <= 1615)).toBe(true);
    });
  });

  it("selects an era-compatible opening year and place deterministically from a stored seed", () => {
    const first = selectStarterOrigin("late-unification", "sakai_boat_crew", 1588);
    const second = selectStarterOrigin("late-unification", "sakai_boat_crew", 1588);
    const era = STARTER_ERAS.find((entry) => entry.id === "late-unification")!;
    const template = STARTER_TEMPLATES.find((entry) => entry.id === "sakai_boat_crew")!;
    expect(first).toEqual(second);
    expect(era.years).toContain(first.year);
    expect(template.compatibleRegions).toContain(first.region);
    expect(first.age).toBe(template.age);
  });

  it("writes a seeded paragraph-length fictional Main Thread without claiming historical NPCs or events", () => {
    const context = { id: "opening-profile", title: "จุดเริ่ม", year: 1588, season: "Summer" as const, region: "Sakai", location: "ซาไก แคว้นอิซุมิ", eraId: "late-unification", selectionSeed: 2, warShadow: 3, day: 1 };
    const first = createGameState(context, draftFor("sakai_boat_crew"));
    const second = createGameState({ ...context, selectionSeed: 3 }, draftFor("sakai_boat_crew"));
    expect(first.missions[0]?.request.length).toBeGreaterThan(300);
    expect(first.missions[0]?.request).toContain("เรื่องสมมติของแคมเปญ");
    expect(first.missions[0]?.request).not.toEqual(second.missions[0]?.request);
  });

  it("keeps two answered character-background records without changing occupation base stats", () => {
    const template = STARTER_TEMPLATES.find((entry) => entry.id === "village_scribe")!;
    const draft = draftFor("village_scribe", {
      answers: { life_before: "เคยคัดบัญชีข้าวให้บ้านเกิด", stance: "ไม่ยืนข้างคนที่ใช้บัญชีทำร้ายผู้หิวโหย" },
    });
    const state = createGameState({ id: "background-test", title: "บัญชีเก่า", year: 1578, season: "Summer", region: "Mikawa", location: "หมู่บ้าน", warShadow: 3, day: 1 }, draft);
    expect(RELATIONSHIP_QUESTIONS).toHaveLength(2);
    expect(state.character.attributes).toEqual(startingAttributesForTemplate(template));
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
