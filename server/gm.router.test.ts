import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analyzeWithGM: vi.fn(),
  resolveWithGM: vi.fn(),
  getUserTrialCredits: vi.fn(),
}));

vi.mock("./gm", async (importOriginal) => {
  const original = await importOriginal<typeof import("./gm")>();
  return { ...original, analyzeWithGM: mocks.analyzeWithGM, resolveWithGM: mocks.resolveWithGM };
});
vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return { ...original, getUserTrialCredits: mocks.getUserTrialCredits };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = {
  campaign: { title: "Test record", year: 1578, season: "Summer", region: "Mikawa", location: "River gate", warShadow: 3, day: 1 },
  character: { name: "Sato", occupation: "Ashigaru", origin: "River village", strengths: "Reads danger", weakness: "Owes a boatman", attributes: { body: 2, hand: 2, wit: 3, mind: 2, heart: 2 }, masteries: [] },
  currentScene: { title: "Price of an answer", location: "River gate", summary: "A clerk holds the ledger.", pressure: "A witness is listening.", declaredChoices: ["Ask for time"] },
  activeMission: { title: "River passage", giver: "Boatman", objective: "Secure a safe passage", deadline: "Before dusk", reward: "A hidden route" },
  socialState: { honor: 2, influence: 1, stain: 0, rumors: [], oaths: [], debts: [] },
  recentMemories: [],
};

function authContext(): TrpcContext {
  return {
    user: { id: 1, openId: "gm-test-user", email: "gm@example.com", name: "GM Test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("gm router", () => {
  it("serves structured analysis to an authenticated caller", async () => {
    mocks.getUserTrialCredits.mockResolvedValueOnce(50);
    mocks.analyzeWithGM.mockResolvedValueOnce({ intentSummary: "Ask the clerk for time.", axis: "mind", suggestedMastery: null, difficulty: 14, contextBonus: 1, contextReason: "The ledger is visible.", risk: "The witness may remember you.", confirmation: "Show the ledger and ask.", historicalFence: "Fictional context." });
    const result = await appRouter.createCaller(authContext()).gm.analyze({ action: "I show the ledger and ask for time.", language: "en", context });
    expect(result.mode).toBe("ai");
    expect(result.difficulty).toBe(14);
    expect(mocks.analyzeWithGM).toHaveBeenCalledOnce();
  });

  it("serves a resolved scene to an authenticated caller", async () => {
    mocks.getUserTrialCredits.mockResolvedValueOnce(49);
    mocks.resolveWithGM.mockResolvedValueOnce({ sceneTitle: "The clerk waits", narration: ["The clerk reads in silence.", "The gate stays open a moment longer."], nextChoices: ["Follow the boatman", "Question the witness"], memory: { title: "A name in the margin", detail: "The witness remembers Sato.", tone: "ochre" }, missionNote: "The passage is open until dusk.", historicalFence: "Fictional context." });
    const result = await appRouter.createCaller(authContext()).gm.resolve({ language: "en", context, action: "I show the ledger and ask for time.", roll: { outcome: "success_with_cost", total: 16, difficulty: 14, summary: "The clerk listens.", consequence: "A witness remembers you." } });
    expect(result.sceneTitle).toBe("The clerk waits");
    expect(result.memory.tone).toBe("ochre");
    expect(mocks.resolveWithGM).toHaveBeenCalledOnce();
  });

  it("refuses an AI GM request when the authenticated account has no credits", async () => {
    mocks.getUserTrialCredits.mockResolvedValueOnce(0);
    await expect(appRouter.createCaller(authContext()).gm.analyze({ action: "I show the ledger and ask for time.", language: "en", context })).rejects.toMatchObject({ message: "No AI GM credits remain" });
    expect(mocks.analyzeWithGM).toHaveBeenCalledOnce();
  });
});
