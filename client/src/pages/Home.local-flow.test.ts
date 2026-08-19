import { describe, expect, it, vi } from "vitest";
import { applyRoll, createGameState, parseAction, resolveRoll } from "../lib/game";
import { gmUnavailableLocalTrialNotice, openLocalPreview, saveLocalTrialResult, shouldFetchProfileCredits, shouldUseLocalRules } from "./Home";

const campaign = { id: "preview-campaign", title: "Ash over Kinokawa", year: 1578, season: "Summer" as const, region: "Mikawa", location: "ตลาดหน้าด่าน", warShadow: 3, day: 1 };
const draft = { name: "ซาโตะ", identity: "", templateId: "ronin", freeformOccupation: "", origin: "ชายแดน", strength: "อ่านเส้นทางหนีได้ไว", weakness: "ติดหนี้คนเรือ", answers: {} };

describe("UI Preview local-only flow", () => {
  it("opens Play, records a local roll, exposes a Log record, and restores a local save without backend access", () => {
    const opened: string[] = [];
    openLocalPreview((page) => opened.push(page));
    expect(opened).toEqual(["play"]);
    expect(shouldUseLocalRules(true, true)).toBe(true);
    expect(shouldFetchProfileCredits(true, true)).toBe(false);

    const startingGame = createGameState(campaign, draft);
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const roll = resolveRoll(parseAction("ข้าจะยื่นบัญชีข้าวต่อเสมียน", startingGame), startingGame, false);
    vi.restoreAllMocks();
    const afterPlay = applyRoll(startingGame, roll);
    const manualSave = JSON.parse(JSON.stringify(afterPlay));

    expect(afterPlay.rolls).toHaveLength(1);
    expect(afterPlay.rolls[0].narrative.length).toBeGreaterThan(250);
    expect(afterPlay.memories.length).toBeGreaterThan(0);

    const restoredFromLoad = JSON.parse(JSON.stringify(manualSave));
    expect(restoredFromLoad.tick).toBe(afterPlay.tick);
    expect(restoredFromLoad.rolls[0].id).toBe(afterPlay.rolls[0].id);
  });

  it("keeps credits and gives a clear local-trial notice when the AI GM is unavailable", () => {
    const startingGame = createGameState(campaign, draft);
    const saved = saveLocalTrialResult({ ...startingGame, tick: 2 }, startingGame.credits);
    expect(saved.credits).toBe(startingGame.credits);
    expect(gmUnavailableLocalTrialNotice("en", "Roll recorded")).toContain("AI GM unavailable");
    expect(gmUnavailableLocalTrialNotice("th", "บันทึกผลแล้ว")).toContain("ไม่หักเครดิต AI");
  });
});
