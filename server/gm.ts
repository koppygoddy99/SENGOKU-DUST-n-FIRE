import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { sengokuSocialFacts, type SengokuSocialFact } from "../shared/sengokuSocialFacts";
import { narrativeStylePrompt } from "../shared/narrativeStyle";
import { buildNarrativePromptPacket, evaluatePlayerFacingNarrative } from "../shared/narrativeRuntime";
import { historicalBriefForCampaign } from "../shared/historicalTimeline";

const languageSchema = z.enum(["en", "th"]);
const statSchema = z.enum(["body", "hand", "wit", "mind", "heart"]);
const toneSchema = z.enum(["navy", "teal", "vermilion", "ochre"]);
const historicalStatusSchema = z.enum(["fact-supported", "contextual-play", "campaign-fiction", "insufficient-evidence"]);
const GM_RESPONSE_TIMEOUT_MS = 45_000;

export function withGMResponseTimeout<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs = GM_RESPONSE_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<T>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("AI GM did not respond before the time limit."));
    }, timeoutMs);
  });
  return Promise.race([operation(controller.signal), deadline]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

const contextSchema = z.object({
  campaign: z.object({ title: z.string().max(120), year: z.number().int().min(1454).max(1616), season: z.string().max(20), region: z.string().max(80), location: z.string().max(160), warShadow: z.number().int().min(0).max(6), day: z.number().int().min(1).max(366), historicalDate: z.object({ month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31), source: z.literal("player-confirmed") }).optional() }),
  character: z.object({ name: z.string().max(100), occupation: z.string().max(120), origin: z.string().max(240), strengths: z.string().max(240), weakness: z.string().max(240), flaws: z.array(z.string().trim().min(2).max(240)).max(2).default([]), attributes: z.record(statSchema, z.number().int().min(1).max(10)), masteries: z.array(z.object({ name: z.string().max(100), level: z.number().int().min(0).max(5), source: z.string().max(180) })).max(10), background: z.array(z.object({ question: z.string().max(240), answer: z.string().max(500), tags: z.array(z.string().max(60)).max(6) })).max(2).optional() }),
  currentScene: z.object({ title: z.string().max(160), location: z.string().max(160), summary: z.string().max(4000), speaker: z.string().max(120).optional(), pressure: z.string().max(300), declaredChoices: z.array(z.string().max(180)).max(6) }),
  /** Retained only so Local Save/client versions from before thread migration still validate. */
  activeMission: z.object({ title: z.string().max(160), giver: z.string().max(120), issuerType: z.enum(["commoner", "samurai", "merchant", "temple", "ruler"]).optional(), objective: z.string().max(500), deadline: z.string().max(160), reward: z.string().max(300) }).optional(),
  mainThread: z.object({ id: z.string().max(160), title: z.string().max(160), giver: z.string().max(120), objective: z.string().max(500), pressure: z.string().max(300), deadline: z.string().max(160), reward: z.string().max(300), risk: z.string().max(300), canonTerms: z.array(z.string().max(100)).max(8), challenge: z.enum(["ordinary", "elevated"]) }).optional(),
  sideLeads: z.array(z.object({ id: z.string().max(160), title: z.string().max(160), objective: z.string().max(500), pressure: z.string().max(300), deadline: z.string().max(160) })).max(2).default([]),
  socialState: z.object({ honor: z.number().int().min(0).max(6), influence: z.number().int().min(0).max(6), stain: z.number().int().min(0).max(6), rumors: z.array(z.string().max(200)).max(5), oaths: z.array(z.string().max(200)).max(5), debts: z.array(z.string().max(200)).max(5) }),
  /** แต้มเติบโตแบบ read-only — AI ห้ามเพิ่มแต้มเอง (ไม่มี write path) ใช้เพื่อบรรยายการเติบโต/เสนอรางวัลเท่านั้น */
  progression: z.object({ growthPoints: z.number().int().min(0).max(99), milestonePoints: z.number().int().min(0).max(99), claimedMilestoneIds: z.array(z.string().max(160)).max(50), recentVitalEvents: z.array(z.object({ type: z.string().max(20), delta: z.number().int().min(-5).max(5), reason: z.string().max(120) })).max(5) }).optional(),
  /** เหตุการณ์สุ่ม read-only — engine เป็นคนเลือก AI เล่าได้อย่างเดียว */
  randomEvent: z.object({ title: z.string().max(160), historicalFence: z.string().max(40), choices: z.array(z.object({ id: z.string().max(60) })).max(4) }).optional(),
  recentMemories: z.array(z.object({ title: z.string().max(160), detail: z.string().max(360), tone: z.string().max(30) })).max(8),
});

export const analyzeInputSchema = z.object({ action: z.string().trim().min(2).max(1000), language: languageSchema, context: contextSchema });
export const resolveInputSchema = z.object({
  language: languageSchema,
  context: contextSchema,
  action: z.string().trim().min(2).max(1000),
  roll: z.object({ outcome: z.enum(["decisive_success", "success_with_cost", "partial_success", "failure_with_consequence"]), total: z.number().int().min(1).max(41), difficulty: z.number().int().min(0).max(32), summary: z.string().max(300), consequence: z.string().max(400).nullable() }),
});

const analyzeResultSchema = z.object({
  intentSummary: z.string().min(2).max(260),
  stat: statSchema,
  suggestedMastery: z.string().max(100).nullable(),
  difficulty: z.number().int().min(8).max(32),
  contextBonus: z.number().int().min(0).max(2),
  flawTriggered: z.boolean().default(false),
  flawBonus: z.union([z.literal(-2), z.literal(0)]).default(0),
  triggeredFlaw: z.string().min(2).max(240).nullable().default(null),
  flawReason: z.string().min(2).max(300).nullable().default(null),
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
  missionDirective: z.object({
    kind: z.enum(["keep", "advance", "resolve", "fail", "replace_main", "create_hidden_side", "reveal_side", "retire_side"]),
    targetMissionId: z.string().min(1).max(160).nullable(),
    reason: z.string().min(2).max(300),
    evidence: z.array(z.string().min(2).max(180)).max(4),
    replacement: z.object({ title: z.string().min(2).max(160), giver: z.string().min(2).max(120), objective: z.string().min(2).max(500), pressure: z.string().min(2).max(300), deadline: z.string().min(2).max(160), reward: z.string().min(2).max(300), risk: z.string().min(2).max(300), options: z.array(z.string().min(2).max(180)).min(1).max(3), canonTerms: z.array(z.string().min(2).max(100)).max(8) }).nullable(),
  }),
  historicalFence: z.string().min(2).max(320),
  historicalStatus: historicalStatusSchema.default("campaign-fiction"),
});

const analyzeOutputSchema = {
  name: "dust_fire_gm_analysis",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    properties: {
      intentSummary: { type: "string" }, stat: { type: "string", enum: ["body", "hand", "wit", "mind", "heart"] }, suggestedMastery: { type: ["string", "null"] }, difficulty: { type: "integer" }, contextBonus: { type: "integer" }, flawTriggered: { type: "boolean" }, flawBonus: { type: "integer", minimum: -2, maximum: 0 }, triggeredFlaw: { type: ["string", "null"] }, flawReason: { type: ["string", "null"] }, contextReason: { type: "string" }, risk: { type: "string" }, confirmation: { type: "string" }, historicalFence: { type: "string" }, historicalStatus: { type: "string", enum: ["fact-supported", "contextual-play", "campaign-fiction", "insufficient-evidence"] },
    },
    required: ["intentSummary", "stat", "suggestedMastery", "difficulty", "contextBonus", "flawTriggered", "flawBonus", "triggeredFlaw", "flawReason", "contextReason", "risk", "confirmation", "historicalFence", "historicalStatus"],
  },
} as const;

const resolveOutputSchema = {
  name: "dust_fire_gm_resolution",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    properties: {
      sceneTitle: { type: "string" }, narration: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } }, nextChoices: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } }, memory: { type: "object", additionalProperties: false, properties: { title: { type: "string" }, detail: { type: "string" }, tone: { type: "string", enum: ["navy", "teal", "vermilion", "ochre"] } }, required: ["title", "detail", "tone"] }, missionNote: { type: "string" }, missionDirective: { type: "object", additionalProperties: false, properties: { kind: { type: "string", enum: ["keep", "advance", "resolve", "fail", "replace_main", "create_hidden_side", "reveal_side", "retire_side"] }, targetMissionId: { type: ["string", "null"] }, reason: { type: "string" }, evidence: { type: "array", maxItems: 4, items: { type: "string" } }, replacement: { type: ["object", "null"], additionalProperties: false, properties: { title: { type: "string" }, giver: { type: "string" }, objective: { type: "string" }, pressure: { type: "string" }, deadline: { type: "string" }, reward: { type: "string" }, risk: { type: "string" }, options: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } }, canonTerms: { type: "array", maxItems: 8, items: { type: "string" } } }, required: ["title", "giver", "objective", "pressure", "deadline", "reward", "risk", "options", "canonTerms"] } }, required: ["kind", "targetMissionId", "reason", "evidence", "replacement"] }, historicalFence: { type: "string" }, historicalStatus: { type: "string", enum: ["fact-supported", "contextual-play", "campaign-fiction", "insufficient-evidence"] },
    },
    required: ["sceneTitle", "narration", "nextChoices", "memory", "missionNote", "missionDirective", "historicalFence", "historicalStatus"],
  },
} as const;

const systemRules = `You are the AI Game Master for Dust & Fire: Sengoku Stories, an original historical-fiction tabletop role-playing game.
You interpret player intent and narrate consequences; you never roll dice, change player resources, invent Context/Gear above +2, or override the deterministic 2d12 engine.
The five Traits are exactly: body (Prowess), hand (Craft), wit (Instinct), mind (Judgment), heart (Resolve). Their raw Level 1–10 values are added by the client and can grow only through deterministic Trait Progress; never invent a Trait bonus tier. Masteries have only levels 0–5, where level is the matching roll bonus. The ordinary formula is 2d12 + Trait Level + Mastery Level + Context/Gear + Flaw; there is no Momentum. Recommend only these DN bands: DN8 for safe rest or routine work; DN12 for a fairly easy action with a clear method; DN16 for ordinary stakes; DN20 for a guarded obstacle, direct danger, or an illicit act that will leave a trace; DN24 for a compounded obstacle where preparation or relevant skill still gives a viable route; DN28 for a pivotal crisis with no relevant mastery or prepared tool; DN32 only for a legendary, decisive obstacle that should offer alternate routes. A deterministic specialized item may set DN0 and pass without a roll; never overrule or imitate that item effect. The client rounds any number to a canonical tier.
Character flaws are not a permanent penalty. Inspect context.flaws before analysis. Set flawTriggered=true, flawBonus=-2, and identify exactly one triggeredFlaw only when the declared action and current scene make that flaw directly relevant. Otherwise return flawTriggered=false, flawBonus=0, triggeredFlaw=null, flawReason=null. The player never chooses a trigger. You only declare the trigger; the deterministic engine applies the -2 before comparing DN.
For action analysis, be concise. For resolved narration, write a complete, vivid scene rather than a summary, a moral, or a generic transition. Keep fictional NPCs and events clearly fictional. Never assert invented history as fact. You will receive a Historical Brief selected from curated fact cards. Use it only within its stated era, region, and confidence boundary. Do not turn a structural fact into a universal law, do not invent a historical event, and label campaign invention or insufficient evidence in historicalFence. Set historicalStatus exactly as follows: fact-supported only for a specific statement directly supported by the supplied Brief; contextual-play when a structural fact informs a fictional scene; campaign-fiction when the scene detail is invented for the campaign; insufficient-evidence when a requested historical detail exceeds the supplied Brief.
For every resolved roll, return missionDirective. The deterministic engine—not you—decides whether it applies. Most turns use keep with targetMissionId=null and replacement=null. You may advance, resolve, or fail only a supplied mainThread/sideLead ID. Use replace_main only after the player has materially chosen a direction opposite the supplied Main Thread; target its exact ID and provide one elevated, campaign-fiction replacement that follows the player's choice but adds a credible cost. Use create_hidden_side only for a natural unresolved lead, never more than one at a time, with targetMissionId=null. Hidden leads are not shown to the player yet. Never create a mission that demands violence against, betrayal of, or irreconcilable harm to a person protected by an existing open thread. Do not use directives to grant numeric rewards, change inventory, revise historical outcomes, or force the player into any course.
Rewards, consequences, cities, places, people, weather, and disaster pressure must stay inside supplied records and social fact cards. If the brief does not support a named historical place/person/event, write it as bounded campaign fiction rather than fact. Weather may be sensory seasonal texture only unless a supplied disaster/timeline record supports an actual event. Never fabricate a named disaster, local regulation, casualty count, historical reward, or province-wide condition. The only important historical event that may occur in narration is one in exactRecords on the player-confirmed date; otherwise keep it background context and never make it directly happen to the player.
Respect the user's language selection. In Thai, use natural Thai with a Sengoku-war chronicle tone, not royal language. In English, use precise literary English. Character background is remembered fiction, not a mechanical bonus: it may return only indirectly as a rumor, person, pressure, place, or difficult choice when the current scene makes it natural. Never force it into every scene, guarantee a reunion, or change dice, Stat, Mastery, DN, or outcome because of it. For suggestedMastery, provide only the exact mastery name from the supplied character data, or null; never put an explanation in that field. Output only JSON matching the schema.`;

function getTextContent(value: string | unknown[]): string {
  if (typeof value === "string") return value;
  return value.map((item) => typeof item === "object" && item && "text" in item ? String((item as { text: unknown }).text) : "").join("\n");
}

function canonicalDifficulty(value: number): 8 | 12 | 16 | 20 | 24 | 28 | 32 {
  if (value <= 10) return 8;
  if (value <= 14) return 12;
  if (value <= 18) return 16;
  if (value <= 22) return 20;
  if (value <= 26) return 24;
  if (value <= 30) return 28;
  return 32;
}

function normalizeAnalysisCandidate(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const candidate = value as Record<string, unknown>;
  const truncate = (field: string, max: number) => typeof candidate[field] === "string" ? candidate[field].slice(0, max) : candidate[field];
  const clampNumber = (field: string, minimum: number, maximum: number, fallback: number) => {
    const number = typeof candidate[field] === "number" && Number.isFinite(candidate[field]) ? candidate[field] : fallback;
    return Math.max(minimum, Math.min(maximum, Math.round(number)));
  };
  const legacyStat = typeof candidate.axis === "string" ? candidate.axis : undefined;
  const statCandidate = typeof candidate.stat === "string" ? candidate.stat : legacyStat;
  const stat = typeof statCandidate === "string" && ["body", "hand", "wit", "mind", "heart"].includes(statCandidate) ? statCandidate : "wit";
  const flawTriggered = candidate.flawTriggered === true && candidate.flawBonus === -2 && typeof candidate.triggeredFlaw === "string" && candidate.triggeredFlaw.trim().length >= 2;
  return {
    ...candidate,
    stat,
    difficulty: clampNumber("difficulty", 8, 32, 16),
    contextBonus: clampNumber("contextBonus", 0, 2, 0),
    flawTriggered,
    flawBonus: flawTriggered ? -2 : 0,
    triggeredFlaw: flawTriggered ? truncate("triggeredFlaw", 240) : null,
    flawReason: flawTriggered ? truncate("flawReason", 300) : null,
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
  const directive = candidate.missionDirective && typeof candidate.missionDirective === "object" && !Array.isArray(candidate.missionDirective)
    ? candidate.missionDirective as Record<string, unknown>
    : { kind: "keep", targetMissionId: null, reason: "The campaign thread remains unchanged.", evidence: [], replacement: null };
  const replacement = directive.replacement && typeof directive.replacement === "object" && !Array.isArray(directive.replacement)
    ? directive.replacement as Record<string, unknown>
    : null;
  return {
    ...candidate,
    sceneTitle: truncate(candidate.sceneTitle, 160),
    narration: Array.isArray(candidate.narration) ? candidate.narration.slice(0, 3).map((paragraph) => truncate(paragraph, 1100)) : candidate.narration,
    nextChoices: Array.isArray(candidate.nextChoices) ? candidate.nextChoices.slice(0, 3).map((choice) => truncate(choice, 180)) : candidate.nextChoices,
    memory: memoryRecord ? { ...memoryRecord, title: truncate(memoryRecord.title, 160), detail: truncate(memoryRecord.detail, 520) } : candidate.memory,
    missionNote: truncate(candidate.missionNote, 300),
    missionDirective: {
      ...directive,
      targetMissionId: truncate(directive.targetMissionId, 160),
      reason: truncate(directive.reason, 300),
      evidence: Array.isArray(directive.evidence) ? directive.evidence.slice(0, 4).map((entry) => truncate(entry, 180)) : directive.evidence,
      replacement: replacement ? { ...replacement, title: truncate(replacement.title, 160), giver: truncate(replacement.giver, 120), objective: truncate(replacement.objective, 500), pressure: truncate(replacement.pressure, 300), deadline: truncate(replacement.deadline, 160), reward: truncate(replacement.reward, 300), risk: truncate(replacement.risk, 300), options: Array.isArray(replacement.options) ? replacement.options.slice(0, 3).map((entry) => truncate(entry, 180)) : replacement.options, canonTerms: Array.isArray(replacement.canonTerms) ? replacement.canonTerms.slice(0, 8).map((entry) => truncate(entry, 100)) : replacement.canonTerms } : null,
    },
    historicalFence: truncate(candidate.historicalFence, 320),
  };
}

function assertPlayerFacingNarrativeQuality(response: z.infer<typeof resolveResultSchema>, language: "en" | "th") {
  const evaluation = evaluatePlayerFacingNarrative(response, language);
  if (evaluation.hardFail) throw new Error(`AI GM narration rejected by Narrative Style Contract: ${[...evaluation.flags, ...evaluation.issues].join(", ")}`);
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
  if (/(sick|injury|blood|heal|medicine|ป่วย|เลือด|รักษา|เจ็บ|สมุนไพร|ยารักษา|ยาหมอ)/.test(value)) domains.add("health");
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

  const timeline = historicalBriefForCampaign(context.campaign);
  const socialBrief = selected.length
    ? selected.map((fact) => JSON.stringify({ id: fact.id, confidence: fact.confidence, era: fact.era, regions: fact.regions, claim: fact.claim, gmUse: fact.gmUse, prohibition: fact.prohibition, sourceIds: fact.sourceIds })).join("\n")
    : "No curated social-history fact card applies directly.";
  const timelineBrief = JSON.stringify({
    dateGate: timeline.dateGate,
    ledgerStatus: timeline.ledger.status,
    exactRecords: timeline.exactRecords.map((entry) => ({ id: entry.id, date: entry.date, title: entry.title, summary: entry.summary, regions: entry.regionKeys, source: entry.source })),
    contextualRecords: timeline.contextualRecords.map((entry) => ({ id: entry.id, precision: entry.precision, date: entry.date, title: entry.title, summary: entry.summary, regions: entry.regionKeys, source: entry.source })),
    rule: "Only exactRecords may be stated as happening on the current date. contextualRecords may inform broad background but may not be narrated as occurring today. If dateGate.kind is synthetic-scene-day, do not claim any named event occurs today.",
  });
  return { factIds: [...selected.map((fact) => fact.id), ...timeline.exactRecords.map((entry) => entry.id), ...timeline.contextualRecords.map((entry) => entry.id)], briefing: `${socialBrief}\nOFFLINE TIMELINE BRIEF:\n${timelineBrief}` };
}

export async function analyzeWithGM(input: z.infer<typeof analyzeInputSchema>) {
  const history = historicalBrief(input.context, input.action);
  const response = await withGMResponseTimeout((signal) => invokeLLM({
    model: "gpt-5-mini",
    messages: [{ role: "system", content: systemRules }, { role: "user", content: `Analyze this declared action before any dice are rolled.\n\nHistorical Brief:\n${history.briefing}\n\nGame Context:\n${JSON.stringify(input)}` }],
    outputSchema: analyzeOutputSchema,
    signal,
  }));
  const parsed = analyzeResultSchema.parse(normalizeAnalysisCandidate(JSON.parse(getTextContent(response.choices[0]?.message.content ?? ""))));
  return { ...parsed, difficulty: canonicalDifficulty(parsed.difficulty), historicalFactIds: history.factIds };
}

export async function resolveWithGM(input: z.infer<typeof resolveInputSchema>) {
  const history = historicalBrief(input.context, input.action);
  const stylePacket = buildNarrativePromptPacket(
    input.language,
    `${input.action}\n${input.context.currentScene.title}\n${input.context.currentScene.summary}\n${input.context.currentScene.pressure}`,
    { speaker: input.context.currentScene.speaker ?? input.context.activeMission?.giver, speakerRole: input.context.activeMission?.issuerType, playerOccupation: input.context.character.occupation },
  );
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const retryInstruction = attempt === 0 ? "" : "\n\nRETRY REQUIRED: The prior draft violated the output contract. Return exactly three Thai prose paragraphs, preserve the final game result, and remove every modern/anachronistic word or object before responding.";
      const response = await withGMResponseTimeout((signal) => invokeLLM({
        model: "gpt-5-mini",
        messages: [{ role: "system", content: systemRules }, { role: "user", content: `Narrate the resolved roll. The total, outcome, and consequence are final rules output; do not alter them.

${narrativeStylePrompt(input.language)}

${stylePacket.prompt}

Narrative standard for this response:
- Return exactly 3 substantial prose paragraphs in narration. Each paragraph must be 120–1100 characters. Write roughly 500–1,800 Thai characters in total: vivid enough to read as a scene, but not a chapter.
- Paragraph 1 grounds the immediate aftermath through 1–2 concrete sensory or physical details that arise naturally from the supplied location, season, pressure, and the player's action. Do not use stock filler such as "the story moves on" or generic wagon-and-rumor imagery unless the context specifically supports it.
- Paragraph 2 makes the outcome visible in another person's body language, speech, or decision. Use one short, characterful line of dialogue only when it earns its place. Let rank, obligation, suspicion, debt, and public attention shape the exchange.
- Paragraph 3 lands one tangible consequence and leaves a specific pressure or opening for the next choice. It must not ask the player a direct question; nextChoices handles choices separately.
- Use the character's name where natural; do not repeat "เจ้า" mechanically. Keep invented people and events inside campaign fiction. Never invent precise local custom, historical offices, or legal effects beyond the Historical Brief.
- Every player-facing field—sceneTitle, narration, nextChoices, memory title/detail, and missionNote—must be Thai literary prose or a short Thai literary action. Never mention dice, DN, rules, stats, AI, prompts, credits, Flaw, Context, Stain, system labels, cards, briefs, or historical labels in any of those fields.
- nextChoices must be exactly 3 short, concrete actions that follow from this scene. memory must record the consequential change, not summarize the whole scene. Do not use modern administrative phrasing such as official, representative, profile, or system.
${retryInstruction}

Historical Brief:
${history.briefing}

Game Context:
${JSON.stringify(input)}` }],
        outputSchema: resolveOutputSchema,
        signal,
      }));
      const parsed = resolveResultSchema.parse(normalizeResolveCandidate(JSON.parse(getTextContent(response.choices[0]?.message.content ?? ""))));
      assertPlayerFacingNarrativeQuality(parsed, input.language);
      return { ...parsed, historicalFactIds: history.factIds };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
