import { describe, expect, it, vi } from "vitest";
import { createGameState, parseAction, resolveRoll } from "./game";
import { splitStoryParagraphs } from "../pages/Home";

const campaign = { id: "test-campaign", title: "เถ้าเหนือคิโนกาวะ", year: 1578, season: "Summer" as const, region: "Kii", location: "ตลาดหน้าด่านริมแม่น้ำ", warShadow: 3, day: 1 };
const draft = { name: "ซาโตะ", identity: "", templateId: "freeform", freeformOccupation: "ทหารรับจ้าง", origin: "หมู่บ้านริมน้ำ", strength: "อ่านสีหน้าคนได้ก่อนที่เขาจะพูด", weakness: "ติดหนี้คนเรืออยู่หนึ่งครั้ง", answers: {} };

describe("narrative baseline", () => {
  it("writes a substantial three-paragraph opening and preserves it as the first campaign record", () => {
    const game = createGameState(campaign, draft);
    expect(game.currentScene.body).toHaveLength(3);
    expect(game.currentScene.body.every((paragraph) => paragraph.length >= 250)).toBe(true);
    expect(game.currentScene.body.join("\n\n")).toContain("ซาโตะ");
    expect(game.memories[0].detail).toBe(game.currentScene.body.join("\n\n"));
  });

  it("writes a three-paragraph local fallback instead of a one-line resolution", () => {
    const game = createGameState(campaign, draft);
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const result = resolveRoll(parseAction("ข้าจะยื่นบัญชีข้าวต่อเสมียนหน้าด่าน", game), game, false);
    vi.restoreAllMocks();
    const paragraphs = splitStoryParagraphs(result.narrative);
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs.every((paragraph) => paragraph.length >= 120)).toBe(true);
  });

  it("keeps Reader Mode paragraphs separate", () => {
    expect(splitStoryParagraphs("ย่อหน้าแรก\n\nย่อหน้าที่สอง\n\nย่อหน้าที่สาม")).toEqual(["ย่อหน้าแรก", "ย่อหน้าที่สอง", "ย่อหน้าที่สาม"]);
  });
});
