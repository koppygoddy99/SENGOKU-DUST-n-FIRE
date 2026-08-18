import { z } from "zod";
import { invokeLLM } from "./_core/llm";

const languageSchema = z.enum(["en", "th"]);
const axisSchema = z.enum(["body", "hand", "wit", "mind", "heart"]);
const toneSchema = z.enum(["navy", "teal", "vermilion", "ochre"]);

const contextSchema = z.object({
  campaign: z.object({ title: z.string().max(120), year: z.number().int().min(1454).max(1616), season: z.string().max(20), region: z.string().max(80), location: z.string().max(160), warShadow: z.number().int().min(0).max(6), day: z.number().int().min(1).max(366) }),
  character: z.object({ name: z.string().max(100), occupation: z.string().max(120), origin: z.string().max(240), strengths: z.string().max(240), weakness: z.string().max(240), attributes: z.record(axisSchema, z.number().int().min(0).max(6)), masteries: z.array(z.object({ name: z.string().max(100), level: z.number().int().min(0).max(3), source: z.string().max(180) })).max(10) }),
  currentScene: z.object({ title: z.string().max(160), location: z.string().max(160), summary: z.string().max(4000), pressure: z.string().max(300), declaredChoices: z.array(z.string().max(180)).max(6) }),
  activeMission: z.object({ title: z.string().max(160), giver: z.string().max(120), objective: z.string().max(500), deadline: z.string().max(160), reward: z.string().max(300) }).optional(),
  socialState: z.object({ honor: z.number().int().min(0).max(6), influence: z.number().int().min(0).max(6), stain: z.number().int().min(0).max(6), rumors: z.array(z.string().max(200)).max(5), oaths: z.array(z.string().max(200)).max(5), debts: z.array(z.string().max(200)).max(5) }),
  recentMemories: z.array(z.object({ title: z.string().max(160), detail: z.string().max(360), tone: z.string().max(30) })).max(8),
});

export const analyzeInputSchema = z.object({ action: z.string().trim().min(2).max(1000), language: languageSchema, context: contextSchema });
export const resolveInputSchema = z.object({
  language: languageSchema,
  context: contextSchema,
  action: z.string().trim().min(2).max(1000),
  roll: z.object({ outcome: z.enum(["decisive_success", "success_with_cost", "partial_success", "failure_with_consequence"]), total: z.number().int().min(2).max(40), difficulty: z.number().int().min(5).max(30), summary: z.string().max(300), consequence: z.string().max(400).nullable() }),
});

const analyzeResultSchema = z.object({
  intentSummary: z.string().min(2).max(260),
  axis: axisSchema,
  suggestedMastery: z.string().max(100).nullable(),
  difficulty: z.number().int().min(5).max(30),
  contextBonus: z.number().int().min(0).max(2),
  contextReason: z.string().min(2).max(300),
  risk: z.string().min(2).max(320),
  confirmation: z.string().min(2).max(280),
  historicalFence: z.string().min(2).max(320),
});

const resolveResultSchema = z.object({
  sceneTitle: z.string().min(2).max(160),
  narration: z.array(z.string().min(8).max(1200)).min(2).max(5),
  nextChoices: z.array(z.string().min(2).max(180)).min(2).max(4),
  memory: z.object({ title: z.string().min(2).max(160), detail: z.string().min(2).max(420), tone: toneSchema }),
  missionNote: z.string().min(2).max(300),
  historicalFence: z.string().min(2).max(320),
});

const analyzeOutputSchema = {
  name: "dust_fire_gm_analysis",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    properties: {
      intentSummary: { type: "string" }, axis: { type: "string", enum: ["body", "hand", "wit", "mind", "heart"] }, suggestedMastery: { type: ["string", "null"] }, difficulty: { type: "integer" }, contextBonus: { type: "integer" }, contextReason: { type: "string" }, risk: { type: "string" }, confirmation: { type: "string" }, historicalFence: { type: "string" },
    },
    required: ["intentSummary", "axis", "suggestedMastery", "difficulty", "contextBonus", "contextReason", "risk", "confirmation", "historicalFence"],
  },
} as const;

const resolveOutputSchema = {
  name: "dust_fire_gm_resolution",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    properties: {
      sceneTitle: { type: "string" }, narration: { type: "array", items: { type: "string" } }, nextChoices: { type: "array", items: { type: "string" } }, memory: { type: "object", additionalProperties: false, properties: { title: { type: "string" }, detail: { type: "string" }, tone: { type: "string", enum: ["navy", "teal", "vermilion", "ochre"] } }, required: ["title", "detail", "tone"] }, missionNote: { type: "string" }, historicalFence: { type: "string" },
    },
    required: ["sceneTitle", "narration", "nextChoices", "memory", "missionNote", "historicalFence"],
  },
} as const;

const systemRules = `You are the AI Game Master for Dust & Fire: Sengoku Stories, an original historical-fiction tabletop role-playing game.
You interpret player intent and narrate consequences; you never roll dice, change player resources, invent bonuses above +2, or override the deterministic 2d12 engine.
The five axes are exactly: body (Prowess), hand (Craft), wit (Instinct), mind (Judgment), heart (Resolve). Difficulty is a threshold from 5 to 30; recommend a number but the client rounds it to a canonical tier.
The player says what they do in one sentence. Be concise, severe, and story-first. Keep fictional NPCs and events clearly fictional. Never assert invented history as fact. When the supplied year or region matters, state uncertainty or label the content as fictional play context.
Respect the user's language selection. In Thai, use natural Thai with a Sengoku-war chronicle tone, not royal language. In English, use precise literary English. For suggestedMastery, provide only the exact mastery name from the supplied character data, or null; never put an explanation in that field. Output only JSON matching the schema.`;

function getTextContent(value: string | unknown[]): string {
  if (typeof value === "string") return value;
  return value.map((item) => typeof item === "object" && item && "text" in item ? String((item as { text: unknown }).text) : "").join("\n");
}

function canonicalDifficulty(value: number): 10 | 14 | 18 | 22 {
  if (value <= 12) return 10;
  if (value <= 16) return 14;
  if (value <= 20) return 18;
  return 22;
}

function normalizeAnalysisCandidate(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const candidate = value as Record<string, unknown>;
  return { ...candidate, suggestedMastery: typeof candidate.suggestedMastery === "string" ? candidate.suggestedMastery.slice(0, 100) : candidate.suggestedMastery };
}

export async function analyzeWithGM(input: z.infer<typeof analyzeInputSchema>) {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    messages: [{ role: "system", content: systemRules }, { role: "user", content: `Analyze this declared action before any dice are rolled.\n\n${JSON.stringify(input)}` }],
    outputSchema: analyzeOutputSchema,
  });
  const parsed = analyzeResultSchema.parse(normalizeAnalysisCandidate(JSON.parse(getTextContent(response.choices[0]?.message.content ?? ""))));
  return { ...parsed, difficulty: canonicalDifficulty(parsed.difficulty) };
}

export async function resolveWithGM(input: z.infer<typeof resolveInputSchema>) {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    messages: [{ role: "system", content: systemRules }, { role: "user", content: `Narrate the resolved roll. The total, outcome, and consequence are final rules output; do not alter them.\n\n${JSON.stringify(input)}` }],
    outputSchema: resolveOutputSchema,
  });
  return resolveResultSchema.parse(JSON.parse(getTextContent(response.choices[0]?.message.content ?? "")));
}
