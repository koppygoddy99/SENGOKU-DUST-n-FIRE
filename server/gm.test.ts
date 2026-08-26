import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));

import { analyzeWithGM, resolveWithGM, withGMResponseTimeout } from "./gm";

const context = {
  campaign: { title: "Test record", year: 1578, season: "Summer", region: "Mikawa", location: "River gate", warShadow: 3, day: 1 },
  character: { name: "Sato", occupation: "Ashigaru", origin: "River village", strengths: "Reads danger", weakness: "Owes a boatman", attributes: { body: 2, hand: 2, wit: 3, mind: 2, heart: 2 }, masteries: [{ name: "Watchful eye", level: 2, source: "Border service" }] },
  currentScene: { title: "Price of an answer", location: "River gate", summary: "A clerk holds the ledger.", pressure: "A witness is listening.", declaredChoices: ["Ask for time", "Offer a document"] },
  activeMission: { title: "River passage", giver: "Boatman", objective: "Secure a safe passage", deadline: "Before dusk", reward: "A hidden route" },
  socialState: { honor: 2, influence: 1, stain: 0, rumors: [], oaths: [], debts: ["Boatman"] },
  recentMemories: [],
};

describe("AI GM structured contracts", () => {
  it("fails fast when a model response exceeds the configured waiting window", async () => {
    let signal: AbortSignal | undefined;
    await expect(withGMResponseTimeout((receivedSignal) => { signal = receivedSignal; return new Promise<never>(() => undefined); }, 1)).rejects.toThrow("AI GM did not respond before the time limit.");
    expect(signal?.aborted).toBe(true);
  });

  it("normalizes model difficulty to a canonical roll tier", async () => {
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ intentSummary: "Buy time with the ledger.", stat: "mind", suggestedMastery: "Watchful eye", difficulty: 16, contextBonus: 1, contextReason: "The clerk recognizes the ledger.", risk: "The witness may repeat your name.", confirmation: "You cite the ledger and ask for time.", historicalFence: "This is fictional play context, not a historical claim." }) } }] });
    const result = await analyzeWithGM({ action: "I show the ledger and ask the clerk for time.", language: "en", context });
    expect(result.difficulty).toBe(16);
    expect(result.stat).toBe("mind");
    expect(result.contextBonus).toBe(1);
    expect(result.historicalFactIds).toContain("oaths-documents-and-witnesses");
    expect(mocks.invokeLLM).toHaveBeenLastCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ content: expect.stringContaining("Historical Brief:") })]),
    }));
    const request = mocks.invokeLLM.mock.calls.at(-1)?.[0];
    const historicalBrief = String(request?.messages?.[1]?.content ?? "");
    expect(historicalBrief).toContain('"id":"oaths-documents-and-witnesses"');
    expect(historicalBrief).not.toContain("[object Object]");
    expect(request?.outputSchema?.schema.properties.flawBonus).toEqual({ type: "integer", minimum: -2, maximum: 0 });
  });

  it("clamps numeric analysis output to the game-rule boundaries", async () => {
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ intentSummary: "Buy time with the ledger.", stat: "mind", suggestedMastery: null, difficulty: 99, contextBonus: -2, contextReason: "The clerk recognizes the ledger.", risk: "The witness may repeat your name.", confirmation: "You cite the ledger and ask for time.", historicalFence: "This is fictional play context, not a historical claim." }) } }] });
    const result = await analyzeWithGM({ action: "I show the ledger and ask the clerk for time.", language: "en", context });
    expect(result.difficulty).toBe(32);
    expect(result.contextBonus).toBe(0);
  });

  it("accepts a constrained post-roll scene and memory", async () => {
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ sceneTitle: "The clerk remembers", narration: ["The clerk weighs the ledger against his palm while rainwater gathers beneath the gate. Sato hears the boatman shift his weight behind him and realizes that every face in the line is waiting to see whether the paper will become shelter or evidence.", "The clerk lifts his eyes at last and says, \"You may pass for now, but I will remember the hand that brought this account.\" His voice is quiet, yet the witness beside the post straightens as if the name has already been copied into a margin.", "The rope across the landing is lowered just far enough for one boat to leave before dusk. Sato gains the crossing, but the clerk keeps the ledger's seal in view, turning a moment of mercy into a debt that can be called upon when the river road grows dangerous."], nextChoices: ["Leave with the boatman before dusk", "Ask the witness what was written down", "Find who supplied the sealed ledger"], memory: { title: "A name in the margin", detail: "The clerk allowed Sato to cross, but the witness and the river gate now remember whose hands carried the ledger.", tone: "ochre" }, missionNote: "The passage is open until dusk, but the ledger has made your name part of the gate's record.", historicalFence: "This scene is fictional play context." }) } }] });
    const result = await resolveWithGM({ language: "en", context, action: "I show the ledger and ask the clerk for time.", roll: { outcome: "success_with_cost", total: 17, difficulty: 14, summary: "The clerk accepts the ledger.", consequence: "A witness remembers your name." } });
    expect(result.narration).toHaveLength(3);
    expect(result.narration.every((paragraph) => paragraph.length >= 120)).toBe(true);
    expect(result.nextChoices).toHaveLength(3);
    expect(result.memory.tone).toBe("ochre");
    const request = mocks.invokeLLM.mock.calls.at(-1)?.[0];
    expect(String(request?.messages?.[1]?.content ?? "")).toContain("Return exactly 3 substantial prose paragraphs");
  });

  it("prioritizes Thai market, document, checkpoint, and war context cards", async () => {
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ intentSummary: "Present the rice ledger at the checkpoint market.", stat: "mind", suggestedMastery: null, difficulty: 14, contextBonus: 0, contextReason: "The account can be checked.", risk: "The soldiers may hold the document.", confirmation: "You present the ledger.", historicalFence: "The historical context is limited to the supplied fact cards." }) } }] });
    const result = await analyzeWithGM({ action: "ข้าจะยื่นบัญชีข้าวที่ตลาดหน้าด่านให้เสมียนดู ก่อนทหารจะตรวจตรา", language: "th", context });
    expect(result.historicalFactIds).toContain("oaths-documents-and-witnesses");
    expect(result.historicalFactIds).toContain("plural-payment-media");
    expect(result.historicalFactIds).toContain("war-is-negotiated-labour");
    expect(result.historicalFactIds).toContain("market-rights-and-brokers");
    expect(result.historicalFactIds).not.toContain("documentary-credit");
  });

  it("preserves the four historical boundary labels in structured AI GM output", async () => {
    const boundaries = {
      "fact-supported": "The supplied source supports this specific historical condition.",
      "contextual-play": "The social structure is historical; this named scene is campaign fiction.",
      "campaign-fiction": "This event and its people are invented for the campaign.",
      "insufficient-evidence": "The supplied sources do not establish this specific local claim.",
    } as const;
    for (const [historicalStatus, historicalFence] of Object.entries(boundaries) as Array<[keyof typeof boundaries, string]>) {
      mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ intentSummary: "Assess the claim carefully.", stat: "mind", suggestedMastery: null, difficulty: 14, contextBonus: 0, contextReason: "The account is limited to supplied evidence.", risk: "The scene may need a fictional boundary.", confirmation: "Proceed with the evidence boundary.", historicalFence, historicalStatus }) } }] });
      const result = await analyzeWithGM({ action: "ข้าจะถามเสมียนถึงที่มาของบัญชีนี้", language: "th", context });
      expect(result.historicalStatus).toBe(historicalStatus);
      expect(result.historicalFence).toBe(historicalFence);
    }
  });
});
