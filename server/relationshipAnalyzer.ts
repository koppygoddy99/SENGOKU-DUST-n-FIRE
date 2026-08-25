import { createHash } from "node:crypto";
import { z } from "zod";
import { RelationshipAnalyzeResponse } from "../shared/ai-gm";
import { narrativeQualityFlags, narrativeStylePrompt } from "../shared/narrativeStyle";
import { createRelationshipDailySummary, findRelationshipDailySummary } from "./db";
import { withGMResponseTimeout } from "./gm";
import { invokeLLM } from "./_core/llm";
import { serverOnlyRelationshipDossier } from "./relationshipDossiers";

const contactIdSchema = z.enum(["gantaro", "tokichi", "masakichi", "genshiro"]);
const languageSchema = z.enum(["en", "th"]);
const evidenceSchema = z.object({
  id: z.string().trim().min(1).max(120),
  sourceType: z.enum(["roll", "memory", "mission", "exchange"]),
  inGameDay: z.number().int().min(1).max(3660),
  tick: z.number().int().min(0).max(1_000_000),
  title: z.string().trim().min(1).max(180),
  detail: z.string().trim().min(1).max(900),
});

export const relationshipAnalyzeInputSchema = z.object({
  campaign: z.object({ id: z.string().trim().min(1).max(120), year: z.number().int().min(1454).max(1616), season: z.string().trim().min(2).max(20), region: z.string().trim().min(2).max(80), inGameDay: z.number().int().min(1).max(3660) }),
  language: languageSchema,
  contact: z.object({ contactId: contactIdSchema, name: z.string().trim().min(1).max(100), publicStatus: z.string().trim().min(1).max(240), relationshipRole: z.string().trim().min(1).max(100), familiarity: z.number().int().min(0).max(5), affinity: z.number().int().min(-3).max(3) }),
  evidence: z.array(evidenceSchema).min(1).max(24),
});

const relationshipResultSchema = z.object({
  summary: z.string().trim().min(20).max(700),
  eventTags: z.array(z.string().trim().min(2).max(40)).max(5),
  contactEffects: z.object({ familiarityDelta: z.union([z.literal(-1), z.literal(0), z.literal(1)]), affinityDelta: z.union([z.literal(-1), z.literal(0), z.literal(1)]) }),
  playerVisibleKnowledge: z.array(z.string().trim().min(8).max(280)).max(3),
  blankSpaceUpdate: z.string().trim().min(8).max(280).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  evidenceIds: z.array(z.string().trim().min(1).max(120)).min(1).max(24),
});

const relationshipOutputSchema = {
  name: "dust_fire_relationship_daily_analysis",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    properties: {
      summary: { type: "string" }, eventTags: { type: "array", items: { type: "string" } },
      contactEffects: { type: "object", additionalProperties: false, properties: { familiarityDelta: { type: "integer", enum: [-1, 0, 1] }, affinityDelta: { type: "integer", enum: [-1, 0, 1] } }, required: ["familiarityDelta", "affinityDelta"] },
      playerVisibleKnowledge: { type: "array", items: { type: "string" } }, blankSpaceUpdate: { type: ["string", "null"] }, confidence: { type: "string", enum: ["low", "medium", "high"] }, evidenceIds: { type: "array", items: { type: "string" } },
    },
    required: ["summary", "eventTags", "contactEffects", "playerVisibleKnowledge", "blankSpaceUpdate", "confidence", "evidenceIds"],
  },
} as const;

function textContent(value: string | unknown[]): string {
  if (typeof value === "string") return value;
  return value.map((item) => typeof item === "object" && item && "text" in item ? String((item as { text: unknown }).text) : "").join("\n");
}

function stableSourceHash(input: z.infer<typeof relationshipAnalyzeInputSchema>): string {
  const publicPayload = {
    analysisVersion: "relationship-v1",
    language: input.language,
    campaignId: input.campaign.id,
    inGameDay: input.campaign.inGameDay,
    contact: input.contact,
    evidence: [...input.evidence].sort((left, right) => left.id.localeCompare(right.id)),
  };
  return createHash("sha256").update(JSON.stringify(publicPayload)).digest("hex");
}

function assertPublicAnalysis(candidate: z.infer<typeof relationshipResultSchema>, input: z.infer<typeof relationshipAnalyzeInputSchema>, privateTerms: string[]) {
  const allowedEvidence = new Set(input.evidence.map((evidence) => evidence.id));
  const providedEvidence = new Set(candidate.evidenceIds);
  if (candidate.evidenceIds.some((id) => !allowedEvidence.has(id))) throw new Error("Relationship analysis cited an unknown evidence id.");
  if (providedEvidence.size !== candidate.evidenceIds.length) throw new Error("Relationship analysis cited duplicate evidence ids.");
  const playerText = [candidate.summary, ...candidate.playerVisibleKnowledge, candidate.blankSpaceUpdate ?? ""].join("\n");
  const flags = narrativeQualityFlags(playerText, input.language, privateTerms);
  if (flags.length) throw new Error(`Relationship analysis rejected by Narrative Style Contract: ${flags.join(", ")}`);
}

function storedResponse(value: string): RelationshipAnalyzeResponse {
  return z.object({
    analysisVersion: z.literal("relationship-v1"), sourceHash: z.string().length(64), summary: z.string(), eventTags: z.array(z.string()),
    contactEffects: z.object({ familiarityDelta: z.union([z.literal(-1), z.literal(0), z.literal(1)]), affinityDelta: z.union([z.literal(-1), z.literal(0), z.literal(1)]) }),
    playerVisibleKnowledge: z.array(z.string()), blankSpaceUpdate: z.string().nullable(), confidence: z.enum(["low", "medium", "high"]), evidenceIds: z.array(z.string()),
  }).parse(JSON.parse(value));
}

export async function analyzeRelationshipDay(ownerId: number, rawInput: z.infer<typeof relationshipAnalyzeInputSchema>): Promise<RelationshipAnalyzeResponse> {
  const input = relationshipAnalyzeInputSchema.parse(rawInput);
  const sourceHash = stableSourceHash(input);
  const existing = await findRelationshipDailySummary(ownerId, input.campaign.id, input.contact.contactId, input.campaign.inGameDay, sourceHash);
  if (existing) return storedResponse(existing.publicSummaryJson);

  const dossier = serverOnlyRelationshipDossier(input.contact.contactId);
  const response = await withGMResponseTimeout((signal) => invokeLLM({
    model: "gpt-5-mini",
    messages: [{
      role: "system",
      content: `You write a short, player-safe relationship record for Dust & Fire: Sengoku Stories. The deterministic engine alone owns all rolls, resources, missions, and state. You can only propose deltas in the supplied -1, 0, +1 range; you cannot directly change any state.\n\n${narrativeStylePrompt(input.language)}\n\nYou receive public evidence and a server-only character direction. Treat the direction as a private writing aid, never as player knowledge. Write only what follows from supplied evidence. Cite only supplied evidence IDs. Do not invent events, history, motives, whereabouts, or a clue already answered by private direction. The output must be concise, specific, and usable as a daily in-game record.`,
    }, {
      role: "user",
      content: `Public analysis request:\n${JSON.stringify(input)}\n\nServer-only writing direction (never repeat, paraphrase as fact, or disclose):\n${JSON.stringify(dossier)}`,
    }],
    outputSchema: relationshipOutputSchema,
    signal,
  }));

  const candidate = relationshipResultSchema.parse(JSON.parse(textContent(response.choices[0]?.message.content ?? "")));
  assertPublicAnalysis(candidate, input, [dossier.internalCore, dossier.gmGuidance]);
  const result: RelationshipAnalyzeResponse = { analysisVersion: "relationship-v1", sourceHash, ...candidate };
  const stored = await createRelationshipDailySummary({
    ownerId, campaignId: input.campaign.id, contactId: input.contact.contactId, inGameDay: input.campaign.inGameDay, sourceHash,
    analysisVersion: result.analysisVersion, evidenceJson: JSON.stringify(input.evidence), publicSummaryJson: JSON.stringify(result),
  });
  if (!stored) throw new Error("Relationship analysis was not persisted.");
  return result;
}
