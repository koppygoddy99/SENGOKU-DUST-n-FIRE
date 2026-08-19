import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { sengokuSocialFacts, type SengokuSocialFact } from "../shared/sengokuSocialFacts";

const languageSchema = z.enum(["en", "th"]);
const axisSchema = z.enum(["body", "hand", "wit", "mind", "heart"]);
const toneSchema = z.enum(["navy", "teal", "vermilion", "ochre"]);
const historicalStatusSchema = z.enum(["fact-supported", "contextual-play", "campaign-fiction", "insufficient-evidence"]);
const GM_RESPONSE_TIMEOUT_MS = 45_000;

export function withGMResponseTimeout<T>(operation: Promise<T>, timeoutMs = GM_RESPONSE_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI GM did not respond before the time limit.")), timeoutMs);
    operation.then((value) => { clearTimeout(timer); resolve(value); }, (error: unknown) => { clearTimeout(timer); reject(error); });
  });
}

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
  historicalStatus: historicalStatusSchema.default("campaign-fiction"),
});

const resolveResultSchema = z.object({
  sceneTitle: z.string().min(2).max(160),
  narration: z.array(z.string().min(120).max(1100)).length(3),
  nextChoices: z.array(z.string().min(2).max(180)).length(3),
  memory: z.object({ title: z.string().min(2).max(160), detail: z.string().min(2).max(520), tone: toneSchema }),
  missionNote: z.string().min(2).max(300),
  historicalFence: z.string().min(2).max(320),
  historicalStatus: historicalStatusSchema.default("campaign-fiction"),
});

const analyzeOutputSchema = {
  name: "dust_fire_gm_analysis",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    properties: {
      intentSummary: { type: "string" }, axis: { type: "string", enum: ["body", "hand", "wit", "mind", "heart"] }, suggestedMastery: { type: ["string", "null"] }, difficulty: { type: "integer" }, contextBonus: { type: "integer" }, contextReason: { type: "string" }, risk: { type: "string" }, confirmation: { type: "string" }, historicalFence: { type: "string" }, historicalStatus: { type: "string", enum: ["fact-supported", "contextual-play", "campaign-fiction", "insufficient-evidence"] },
    },
    required: ["intentSummary", "axis", "suggestedMastery", "difficulty", "contextBonus", "contextReason", "risk", "confirmation", "historicalFence", "historicalStatus"],
  },
} as const;

const resolveOutputSchema = {
  name: "dust_fire_gm_resolution",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    properties: {
      sceneTitle: { type: "string" }, narration: { type: "array", items: { type: "string" } }, nextChoices: { type: "array", items: { type: "string" } }, memory: { type: "object", additionalProperties: false, properties: { title: { type: "string" }, detail: { type: "string" }, tone: { type: "string", enum: ["navy", "teal", "vermilion", "ochre"] } }, required: ["title", "detail", "tone"] }, missionNote: { type: "string" }, historicalFence: { type: "string" }, historicalStatus: { type: "string", enum: ["fact-supported", "contextual-play", "campaign-fiction", "insufficient-evidence"] },
    },
    required: ["sceneTitle", "narration", "nextChoices", "memory", "missionNote", "historicalFence", "historicalStatus"],
  },
} as const;

const systemRules = `You are the AI Game Master for Dust & Fire: Sengoku Stories, an original historical-fiction tabletop role-playing game.
You interpret player intent and narrate consequences; you never roll dice, change player resources, invent bonuses above +2, or override the deterministic 2d12 engine.
The five axes are exactly: body (Prowess), hand (Craft), wit (Instinct), mind (Judgment), heart (Resolve). Difficulty is a threshold from 5 to 30; recommend a number but the client rounds it to a canonical tier.
For action analysis, be concise. For resolved narration, write a complete, vivid scene rather than a summary, a moral, or a generic transition. Keep fictional NPCs and events clearly fictional. Never assert invented history as fact. You will receive a Historical Brief selected from curated fact cards. Use it only within its stated era, region, and confidence boundary. Do not turn a structural fact into a universal law, do not invent a historical event, and label campaign invention or insufficient evidence in historicalFence. Set historicalStatus exactly as follows: fact-supported only for a specific statement directly supported by the supplied Brief; contextual-play when a structural fact informs a fictional scene; campaign-fiction when the scene detail is invented for the campaign; insufficient-evidence when a requested historical detail exceeds the supplied Brief.
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
  const truncate = (field: string, max: number) => typeof candidate[field] === "string" ? candidate[field].slice(0, max) : candidate[field];
  const clampNumber = (field: string, minimum: number, maximum: number, fallback: number) => {
    const number = typeof candidate[field] === "number" && Number.isFinite(candidate[field]) ? candidate[field] : fallback;
    return Math.max(minimum, Math.min(maximum, Math.round(number)));
  };
  const axis = typeof candidate.axis === "string" && ["body", "hand", "wit", "mind", "heart"].includes(candidate.axis) ? candidate.axis : "wit";
  return {
    ...candidate,
    axis,
    difficulty: clampNumber("difficulty", 5, 30, 14),
    contextBonus: clampNumber("contextBonus", 0, 2, 0),
    intentSummary: truncate("intentSummary", 260),
    suggestedMastery: truncate("suggestedMastery", 100),
    contextReason: truncate("contextReason", 300),
    risk: truncate("risk", 320),
    confirmation: truncate("confirmation", 280),
    historicalFence: truncate("historicalFence", 320),
  };
}

function normalizeResolveCandidate(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const candidate = value as Record<string, unknown>;
  const truncate = (text: unknown, max: number) => typeof text === "string" ? text.slice(0, max) : text;
  const memoryRecord = candidate.memory && typeof candidate.memory === "object" && !Array.isArray(candidate.memory)
    ? candidate.memory as Record<string, unknown>
    : null;
  return {
    ...candidate,
    sceneTitle: truncate(candidate.sceneTitle, 160),
    narration: Array.isArray(candidate.narration) ? candidate.narration.slice(0, 3).map((paragraph) => truncate(paragraph, 1100)) : candidate.narration,
    nextChoices: Array.isArray(candidate.nextChoices) ? candidate.nextChoices.slice(0, 3).map((choice) => truncate(choice, 180)) : candidate.nextChoices,
    memory: memoryRecord ? { ...memoryRecord, title: truncate(memoryRecord.title, 160), detail: truncate(memoryRecord.detail, 520) } : candidate.memory,
    missionNote: truncate(candidate.missionNote, 300),
    historicalFence: truncate(candidate.historicalFence, 320),
  };
}

type ContextForHistory = z.infer<typeof contextSchema>;

function domainsForText(text: string): SengokuSocialFact["domains"] {
  const value = text.toLowerCase();
  const domains = new Set<SengokuSocialFact["domains"][number]>();
  if (/(market|coin|money|buy|sell|trade|merchant|ตลาด|เหรียญ|เงิน|ซื้อ|ขาย|พ่อค้า|สินค้า)/.test(value)) domains.add("market");
  if (/(road|route|travel|pass|checkpoint|river|boat|เดินทาง|เส้นทาง|ด่าน|เรือ|ข้าม)/.test(value)) domains.add("travel");
  if (/(temple|shrine|monk|oath|faith|วัด|ศาลเจ้า|พระ|คำสัตย์|ศรัทธา)/.test(value)) domains.add("faith");
  if (/(war|army|soldier|siege|weapon|battle|สงคราม|ทหาร|กองทัพ|ปิดล้อม|อาวุธ|รบ)/.test(value)) domains.add("war");
  if (/(winter|spring|summer|autumn|rain|flood|famine|ฤดู|ฝน|หนาว|น้ำท่วม|อดอยาก)/.test(value)) domains.add("season");
  if (/(sick|wound|heal|medicine|injury|ป่วย|บาดแผล|รักษา|เจ็บ|สมุนไพร|ยารักษา|ยาหมอ)/.test(value)) domains.add("health");
  if (/(letter|seal|document|witness|ledger|language|ตรา|เอกสาร|พยาน|จดหมาย|ภาษา|บัญชี)/.test(value)) domains.add("language");
  if (/(port|sea|foreign|ship|translator|ท่าเรือ|ทะเล|ต่างชาติ|ล่าม)/.test(value)) domains.add("maritime");
  if (domains.size === 0) {
    domains.add("status");
    domains.add("household");
  }
  return Array.from(domains);
}

function historicalBrief(context: ContextForHistory, action: string) {
  const sceneText = `${action}\n${context.currentScene.title}\n${context.currentScene.summary}\n${context.currentScene.pressure}`;
  const domains = domainsForText(sceneText);
  const documentFocused = /(letter|seal|document|witness|ledger|ตรา|เอกสาร|พยาน|จดหมาย|บัญชี)/.test(sceneText.toLowerCase());
  const selected = sengokuSocialFacts
    .filter((fact) => context.campaign.year >= fact.era.start && context.campaign.year <= fact.era.end)
    .filter((fact) => {
      if (fact.id === "seasonal-risk-needs-place-and-year") return domains.includes("season") || domains.includes("health");
      if (fact.id === "status-is-not-edo-four-classes") return domains.includes("status") || domains.includes("household");
      if (fact.id === "temples-and-ikki-are-not-monoliths") return domains.includes("faith");
      if (fact.id === "religious-trade-mediators") return domains.includes("maritime") || domains.includes("faith");
      return true;
    })
    .filter((fact) => fact.domains.some((domain) => domains.includes(domain)))
    .sort((left, right) => {
      const score = (fact: SengokuSocialFact) => {
        const overlap = fact.domains.filter((domain) => domains.includes(domain)).length * 10;
        const documentaryBoost = documentFocused && fact.id === "oaths-documents-and-witnesses" ? 100 : 0;
        const structuralBoost = fact.confidence === "structural" ? 1 : 0;
        return overlap + documentaryBoost + structuralBoost;
      };
      const rightScore = score(right);
      const leftScore = score(left);
      return rightScore - leftScore || Number(right.confidence === "structural") - Number(left.confidence === "structural");
    })
    .slice(0, 5);

  return {
    factIds: selected.map((fact) => fact.id),
    briefing: selected.length
      ? selected.map((fact) => JSON.stringify({ id: fact.id, confidence: fact.confidence, era: fact.era, regions: fact.regions, claim: fact.claim, gmUse: fact.gmUse, prohibition: fact.prohibition, sourceIds: fact.sourceIds })).join("\n")
      : "No curated social-history fact card applies directly. Treat scene detail as campaign fiction and say so in historicalFence.",
  };
}

export async function analyzeWithGM(input: z.infer<typeof analyzeInputSchema>) {
  const history = historicalBrief(input.context, input.action);
  const response = await withGMResponseTimeout(invokeLLM({
    model: "gpt-5-mini",
    messages: [{ role: "system", content: systemRules }, { role: "user", content: `Analyze this declared action before any dice are rolled.\n\nHistorical Brief:\n${history.briefing}\n\nGame Context:\n${JSON.stringify(input)}` }],
    outputSchema: analyzeOutputSchema,
  }));
  const parsed = analyzeResultSchema.parse(normalizeAnalysisCandidate(JSON.parse(getTextContent(response.choices[0]?.message.content ?? ""))));
  return { ...parsed, difficulty: canonicalDifficulty(parsed.difficulty), historicalFactIds: history.factIds };
}

export async function resolveWithGM(input: z.infer<typeof resolveInputSchema>) {
  const history = historicalBrief(input.context, input.action);
  const response = await withGMResponseTimeout(invokeLLM({
    model: "gpt-5-mini",
    messages: [{ role: "system", content: systemRules }, { role: "user", content: `Narrate the resolved roll. The total, outcome, and consequence are final rules output; do not alter them.

Narrative standard for this response:
- Return exactly 3 substantial prose paragraphs in narration. Each paragraph must be 120–1100 characters. Write roughly 500–1,800 Thai characters in total: vivid enough to read as a scene, but not a chapter.
- Paragraph 1 grounds the immediate aftermath through 1–2 concrete sensory or physical details that arise naturally from the supplied location, season, pressure, and the player's action. Do not use stock filler such as "the story moves on" or generic wagon-and-rumor imagery unless the context specifically supports it.
- Paragraph 2 makes the outcome visible in another person's body language, speech, or decision. Use one short, characterful line of dialogue only when it earns its place. Let rank, obligation, suspicion, debt, and public attention shape the exchange.
- Paragraph 3 lands one tangible consequence and leaves a specific pressure or opening for the next choice. It must not ask the player a direct question; nextChoices handles choices separately.
- Use the character's name where natural; do not repeat "เจ้า" mechanically. Keep invented people and events inside campaign fiction. Never invent precise local custom, historical offices, or legal effects beyond the Historical Brief.
- Do not mention dice, DN, rules, stats, AI, prompts, credits, or historical labels inside narration.
- nextChoices must be exactly 3 short, concrete actions that follow from this scene. memory must record the consequential change, not summarize the whole scene.

Historical Brief:
${history.briefing}

Game Context:
${JSON.stringify(input)}` }],
    outputSchema: resolveOutputSchema,
  }));
  return { ...resolveResultSchema.parse(normalizeResolveCandidate(JSON.parse(getTextContent(response.choices[0]?.message.content ?? "")))), historicalFactIds: history.factIds };
}
