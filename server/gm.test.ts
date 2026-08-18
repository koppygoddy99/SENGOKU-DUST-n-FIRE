import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));

import { analyzeWithGM, resolveWithGM } from "./gm";

const context = {
  campaign: { title: "Test record", year: 1578, season: "Summer", region: "Mikawa", location: "River gate", warShadow: 3, day: 1 },
  character: { name: "Sato", occupation: "Ashigaru", origin: "River village", strengths: "Reads danger", weakness: "Owes a boatman", attributes: { body: 2, hand: 2, wit: 3, mind: 2, heart: 2 }, masteries: [{ name: "Watchful eye", level: 2, source: "Border service" }] },
  currentScene: { title: "Price of an answer", location: "River gate", summary: "A clerk holds the ledger.", pressure: "A witness is listening.", declaredChoices: ["Ask for time", "Offer a document"] },
  activeMission: { title: "River passage", giver: "Boatman", objective: "Secure a safe passage", deadline: "Before dusk", reward: "A hidden route" },
  socialState: { honor: 2, influence: 1, stain: 0, rumors: [], oaths: [], debts: ["Boatman"] },
  recentMemories: [],
};

describe("AI GM structured contracts", () => {
  it("normalizes model difficulty to a canonical roll tier", async () => {
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ intentSummary: "Buy time with the ledger.", axis: "mind", suggestedMastery: "Watchful eye", difficulty: 16, contextBonus: 1, contextReason: "The clerk recognizes the ledger.", risk: "The witness may repeat your name.", confirmation: "You cite the ledger and ask for time.", historicalFence: "This is fictional play context, not a historical claim." }) } }] });
    const result = await analyzeWithGM({ action: "I show the ledger and ask the clerk for time.", language: "en", context });
    expect(result.difficulty).toBe(14);
    expect(result.axis).toBe("mind");
    expect(result.contextBonus).toBe(1);
  });

  it("accepts a constrained post-roll scene and memory", async () => {
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ sceneTitle: "The clerk remembers", narration: ["The clerk weighs the paper in silence.", "A witness takes note of your name."], nextChoices: ["Follow the boatman", "Question the witness"], memory: { title: "A name in the margin", detail: "The clerk and witness now recognize Sato.", tone: "ochre" }, missionNote: "The passage is open, but only until dusk.", historicalFence: "This scene is fictional play context." }) } }] });
    const result = await resolveWithGM({ language: "en", context, action: "I show the ledger and ask the clerk for time.", roll: { outcome: "success_with_cost", total: 17, difficulty: 14, summary: "The clerk accepts the ledger.", consequence: "A witness remembers your name." } });
    expect(result.nextChoices).toHaveLength(2);
    expect(result.memory.tone).toBe("ochre");
  });
});
