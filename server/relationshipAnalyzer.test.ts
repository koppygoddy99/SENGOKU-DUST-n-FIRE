import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
  findRelationshipDailySummary: vi.fn(),
  createRelationshipDailySummary: vi.fn(),
}));

vi.mock("./_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("./db", () => ({
  findRelationshipDailySummary: mocks.findRelationshipDailySummary,
  createRelationshipDailySummary: mocks.createRelationshipDailySummary,
}));
vi.mock("./gm", () => ({ withGMResponseTimeout: (operation: (signal: AbortSignal) => Promise<unknown>) => operation(new AbortController().signal) }));

import { analyzeRelationshipDay } from "./relationshipAnalyzer";
import { serverOnlyRelationshipDossier } from "./relationshipDossiers";

const input = {
  campaign: { id: "camp-saika-1569", year: 1569, season: "Spring", region: "Sakai / Izumi", inGameDay: 1 },
  language: "th" as const,
  contact: { contactId: "gantaro" as const, name: "กันทาโร่", publicStatus: "หัวหน้าด่าน/หัวหน้ากลุ่มย่อยของไซกะ", relationshipRole: "นายจ้าง", familiarity: 3, affinity: -1 },
  evidence: [{ id: "relationship-foundation-gantaro", sourceType: "memory" as const, inGameDay: 1, tick: 1, title: "กันทาโร่รับซาเนฟุยุเข้ากลุ่ม", detail: "เขายอมรับฝีมือจากการประลอง แต่ความไว้ใจลดลงหลังเหตุเอจิยะ" }],
};

const validCandidate = {
  summary: "กันทาโร่ยังให้ที่ซ่อนแก่ซาเนฟุยุ แต่เฝ้าดูการแก้ปัญหาที่ค้างอยู่ด้วยท่าทีระวังมากขึ้น.",
  eventTags: ["trust", "obligation"],
  contactEffects: { familiarityDelta: 0, affinityDelta: -1 },
  playerVisibleKnowledge: ["ที่ซ่อนยังเปิดให้ใช้ได้ แต่ความไว้วางใจไม่ได้มอบให้ง่ายเหมือนเดิม."],
  blankSpaceUpdate: null,
  confidence: "high",
  evidenceIds: ["relationship-foundation-gantaro"],
};

describe("relationship analyzer", () => {
  it("returns an existing server record without invoking the model again", async () => {
    const stored = { analysisVersion: "relationship-v1", sourceHash: "a".repeat(64), ...validCandidate };
    mocks.findRelationshipDailySummary.mockResolvedValueOnce({ publicSummaryJson: JSON.stringify(stored) });

    const result = await analyzeRelationshipDay(7, input);

    expect(result).toEqual(stored);
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
    expect(mocks.createRelationshipDailySummary).not.toHaveBeenCalled();
  });

  it("rejects an analysis that cites evidence not supplied by the deterministic record", async () => {
    mocks.findRelationshipDailySummary.mockResolvedValueOnce(undefined);
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ ...validCandidate, evidenceIds: ["invented-evidence"] }) } }] });

    await expect(analyzeRelationshipDay(7, input)).rejects.toThrow("unknown evidence id");
    expect(mocks.createRelationshipDailySummary).not.toHaveBeenCalled();
  });

  it("rejects a model output that repeats server-only dossier material", async () => {
    mocks.findRelationshipDailySummary.mockResolvedValueOnce(undefined);
    const dossier = serverOnlyRelationshipDossier("gantaro");
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ ...validCandidate, summary: dossier.internalCore }) } }] });

    await expect(analyzeRelationshipDay(7, input)).rejects.toThrow("private-disclosure");
  });

  it("persists a validated public summary with a deterministic source hash", async () => {
    mocks.findRelationshipDailySummary.mockResolvedValueOnce(undefined);
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify(validCandidate) } }] });
    mocks.createRelationshipDailySummary.mockImplementationOnce(async (record: { publicSummaryJson: string }) => ({ publicSummaryJson: record.publicSummaryJson }));

    const result = await analyzeRelationshipDay(7, input);

    expect(result.analysisVersion).toBe("relationship-v1");
    expect(result.sourceHash).toHaveLength(64);
    expect(mocks.createRelationshipDailySummary).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 7, campaignId: "camp-saika-1569", contactId: "gantaro", inGameDay: 1, sourceHash: result.sourceHash }));
    expect(JSON.stringify(result)).not.toContain("internalCore");
    expect(JSON.stringify(result)).not.toContain("gmGuidance");
  });
});
