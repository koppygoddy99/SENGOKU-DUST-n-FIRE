import { describe, expect, it, vi } from "vitest";
import { applyRoll, createGameState, parseAction, resolveRoll } from "./game";
import { splitStoryParagraphs } from "../pages/Home";
import { narrativeQualityFlags } from "../../../shared/narrativeStyle";

const campaign = { id: "test-campaign", title: "เถ้าเหนือคิโนกาวะ", year: 1578, season: "Summer" as const, region: "Kii", location: "ตลาดหน้าด่านริมแม่น้ำ", warShadow: 3, day: 1 };
const draft = { name: "ซาโตะ", identity: "", templateId: "freeform", freeformOccupation: "ทหารรับจ้าง", origin: "หมู่บ้านริมน้ำ", strength: "อ่านสีหน้าคนได้ก่อนที่เขาจะพูด", weakness: "ติดหนี้คนเรืออยู่หนึ่งครั้ง", answers: {} };

describe("narrative baseline", () => {
  it("writes a substantial three-paragraph opening and preserves it as the first campaign record", () => {
    const game = createGameState(campaign, draft);
    expect(game.currentScene.body).toHaveLength(3);
    expect(game.currentScene.body.every((paragraph) => paragraph.length >= 250)).toBe(true);
    expect(game.currentScene.body.join("\n\n")).toContain("ซาโตะ");
    expect(game.currentScene.body[1]).toContain("“");
    expect(game.currentScene.body[2]).toContain("เส้นตาย");
    expect(game.memories[0].detail).toBe(game.currentScene.body.join("\n\n"));
    expect(game.storyRecords).toMatchObject([{ tick: 1, title: game.currentScene.title, prose: game.currentScene.body.join("\n\n"), location: game.currentScene.location }]);
  });

  it("writes a three-paragraph local fallback instead of a one-line resolution", () => {
    const game = createGameState(campaign, draft);
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const result = resolveRoll(parseAction("ข้าจะยื่นบัญชีข้าวต่อเสมียนหน้าด่าน", game), game, false);
    vi.restoreAllMocks();
    const paragraphs = splitStoryParagraphs(result.narrative);
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs.every((paragraph) => paragraph.length >= 120)).toBe(true);
    expect(paragraphs[0]).toContain("เงียบลงชั่วขณะ");
    expect(paragraphs[1]).toContain("“");
    expect(paragraphs[2]).toContain("รอยเท้าบนดินชื้น");
    expect(narrativeQualityFlags(result.narrative, "th")).toEqual([]);
  });

  it("keeps Reader Mode paragraphs separate", () => {
    expect(splitStoryParagraphs("ย่อหน้าเรื่องแรก\n\nย่อหน้าที่สอง\n\nย่อหน้าที่สาม")).toEqual(["ย่อหน้าเรื่องแรก", "ย่อหน้าที่สอง", "ย่อหน้าที่สาม"]);
  });

  it("adds one narrative-only Story Record for each resolved Play Scene", () => {
    const game = createGameState(campaign, draft);
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const roll = resolveRoll(parseAction("ข้าจะยื่นบัญชีข้าวต่อเสมียนหน้าด่าน", game), game, false);
    vi.restoreAllMocks();
    const next = applyRoll(game, roll);
    expect(next.storyRecords).toHaveLength(2);
    const record = next.storyRecords?.at(-1);
    expect(record).toMatchObject({ tick: roll.tick, title: next.currentScene.title, prose: next.currentScene.body.join("\n\n"), location: next.currentScene.location });
    expect(Object.keys(record ?? {}).sort()).toEqual(["id", "inGameDay", "location", "prose", "tick", "title"]);
  });
});
