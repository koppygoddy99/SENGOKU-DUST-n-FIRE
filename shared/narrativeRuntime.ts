import { narrativeQualityFlags, type NarrativeLanguage } from "./narrativeStyle";
import { USER_APPROVED_NARRATIVE_GOLDEN_EXAMPLES } from "./narrativeGoldenExamples";

/**
 * Layer 1 — The stable, model-independent writing rules.  Golden examples may
 * refine the voice, but never replace these disclosure and period boundaries.
 */
export const NARRATIVE_STYLE_BIBLE_V1 = {
  version: "v1",
  thai: [
    "เขียนไทยกลางแบบนิยายในบุรุษที่สามใกล้ชิด; ให้ร่างกาย วัตถุ และการกระทำมาก่อนคำอธิบายนามธรรม",
    "บทสนทนามีผู้พูดชัดเจนและตอบกันจริง: ให้ผู้พูดรับคำหรือรับการกระทำที่เพิ่งเกิดก่อนจึงขอ เตือน ปฏิเสธ หรือเสนอเงื่อนไข ไม่ให้แต่ละประโยคเป็นคำคมโดด ๆ",
    "ใช้ไทยกลางที่อ่านเข้าใจได้ทันที เลือกคำธรรมดาที่เรียกของ งาน และความสัมพันธ์ตรงหน้าได้ชัดเจน; ห้ามประดิษฐ์คำเก่าหรือประโยคคลุมเครือเพื่อสร้างบรรยากาศ",
    "เมื่อแรงกดดันในฉากรองรับ ให้คนพูดมีแรงฝืดเล็กน้อยได้ เช่น หยุดคำ แก้คำ มองหาคนฟัง หรือถูกตัดบท แต่เลือกเพียงอย่างที่เกิดขึ้นจริงและอย่าทำทุกบรรทัดให้ติดท่าทาง",
    "วัตถุและกริยาต้องร่วมสมัยกับฉาก; สิ่งไร้ชีวิตไม่คิด ตัดสิน หรือสั่งการแทนคน",
    "ฉากหนึ่งต้องเห็นผลลัพธ์ที่จับต้องได้และแรงกดดันถัดไป โดยไม่สรุปสอนหรือบอกผู้เล่นว่าควรคิดอย่างไร",
    "ให้ความเจ็บ ความเหนื่อย กลิ่น และรอยสกปรกมีผลต่อท่าทาง การตัดสินใจ และสายตาคนอื่นเมื่อ state ฉากรองรับ; อย่าใช้เป็นเครื่องประดับซ้ำ ๆ",
    "ความขัดแย้งเกิดจากฐานะ หน้าที่ สิทธิ์ในการพูด และพยานที่ได้ยิน ไม่ใช่การตะโกนหรือคำขู่พร่ำเพรื่อ",
    "เมื่อตัวละครระวังความลับ ให้แสดงผ่านการมองประตู ลดเสียง วางมือ หรือหลบสายตา มากกว่าบอกความคิดลับของคนอื่นตรง ๆ",
  ],
  english: [
    "Use literary historical English with material detail and controlled cadence.",
    "Let dialogue reveal rank, obligation, trade, or suspicion without faux archaism.",
    "Keep the viewpoint limited to visible, heard, learned, or reasonably inferred facts.",
    "Use modern literary English, never synthetic Elizabethan speech or Japanese honorifics not supplied by the scene.",
    "Let injury, labor, public witness, and material objects change conduct when the supplied state supports them.",
  ],
  invariants: [
    "Preserve the resolved event exactly; do not add a state change.",
    "Never disclose rules, dice, stats, AI, prompts, private dossiers, or unsupported history.",
    "Examples teach cadence and handling only. Never copy their names, facts, or plot into the scene.",
  ],
} as const;

export type NarrativeExampleTag = "authority" | "merchant" | "commoner" | "ronin" | "artisan" | "document" | "travel" | "market" | "war" | "pressure" | "consequence" | "craft" | "water" | "injury" | "secrecy" | "dialogue";
export type NarrativeSpeakerRole = "commoner" | "samurai" | "merchant" | "temple" | "ruler" | "unknown";

export type NarrativeGoldenExample = {
  id: string;
  language: NarrativeLanguage;
  tags: NarrativeExampleTag[];
  text: string;
  source: "foundation" | "user-approved";
};

/**
 * Layer 2 — Foundation examples only. They are deliberately tagged as
 * foundation so user-approved work can outrank them without a migration.
 */
export const NARRATIVE_GOLDEN_EXAMPLES: NarrativeGoldenExample[] = [
  { id: "foundation-authority-mud", language: "th", tags: ["authority", "pressure", "consequence"], source: "foundation", text: "กันทาโร่มองรอยโคลนที่ชายเสื้ออยู่ครู่หนึ่งก่อนเอ่ยสั้น ๆ ว่า “แก้เรื่องที่ก่อไว้ แล้วค่อยมาพูดถึงคำขอโทษ” เขาไม่ได้ขยับเข้าใกล้ แต่คนฟังรู้จากน้ำหนักเสียงว่าทางเดิมจะไม่เปิดให้เดินซ้ำง่าย ๆ" },
  { id: "foundation-merchant-cup", language: "th", tags: ["merchant", "market", "pressure"], source: "foundation", text: "โทคิจิขยับหอกพ้นเงาเสาแล้วหัวเราะเบา ๆ “เรื่องเงียบได้ ถ้าถ้วยเหล้าไม่เงียบก่อน” เขาไม่ได้ยื่นมือมารับคำ แต่ปล่อยให้ถ้วยสาเกค้างอยู่กลางเสื่อราวกับเงื่อนไขที่ยังไม่มีใครกล้าแตะ" },
  { id: "foundation-craft-damp", language: "th", tags: ["craft", "war", "consequence"], source: "foundation", text: "มาซาคิจิใช้นิ้วลูบรอยร้าวที่ไม้พานท้าย “อย่าฝืนจุดชนวนตอนความชื้นยังติดอยู่ มันไม่ฟังความกล้าของใคร” เขาวางอาวุธลงบนผ้าแห้งและหันหลังให้คนที่ยังอยากเร่งมือ" },
  { id: "foundation-guard-document", language: "th", tags: ["authority", "document", "ronin", "pressure"], source: "foundation", text: "ผู้คุมด่านจุ่มพู่กันลงในหมึกก่อนลากเส้นบนกระดาษ เขาไม่เงยหน้าขณะกล่าวว่า “ชื่อที่ลงไว้ ย่อมมีคนมาทวงคำรับรอง” โรนินตรงหน้าได้ยินเสียงปลายพู่กันครูดผ่านเส้นใยกระดาษชัดกว่าลมหายใจของตน" },
  { id: "foundation-water-witness", language: "th", tags: ["water", "travel", "commoner", "pressure"], source: "foundation", text: "เรือท้องแบนเบียดตลิ่งจนไม้ด้านข้างครูดกับก้อนกรวด หญิงชราเก็บชายแขนเสื้อพ้นน้ำแล้วพึมพำว่า “คนเห็นเรือยามเช้า จำหน้าเจ้าของได้ง่ายกว่ารอยพาย” คำเตือนของนางเบา แต่คนพายกลับชะงักมือ" },
];

function tagScore(example: NarrativeGoldenExample, tags: NarrativeExampleTag[]): number {
  const overlap = example.tags.reduce((score, tag) => score + (tags.includes(tag) ? (tag === "authority" || tag === "merchant" || tag === "commoner" || tag === "ronin" || tag === "artisan" ? 24 : 10) : 0), 0);
  const approved = example.source === "user-approved" ? 100 : 0;
  return approved + overlap * 10;
}

/** Layer 3 — local, deterministic retrieval. It is intentionally fast and makes no model call. */
export function selectNarrativeGoldenExamples(language: NarrativeLanguage, tags: NarrativeExampleTag[], limit = 2): NarrativeGoldenExample[] {
  return [...USER_APPROVED_NARRATIVE_GOLDEN_EXAMPLES, ...NARRATIVE_GOLDEN_EXAMPLES]
    .filter((example) => example.language === language)
    .sort((left, right) => tagScore(right, tags) - tagScore(left, tags) || left.id.localeCompare(right.id))
    .slice(0, Math.max(0, Math.min(limit, 2)));
}

export function narrativeTagsForScene(text: string): NarrativeExampleTag[] {
  const value = text.toLowerCase();
  const tags = new Set<NarrativeExampleTag>(["pressure", "consequence"]);
  if (/(ผู้คุม|ด่าน|guard|checkpoint|เฝ้า|คำสั่ง)/.test(value)) tags.add("authority");
  if (/(พ่อค้า|สินค้า|ตลาด|merchant|trade|coin|เหรียญ)/.test(value)) tags.add("merchant");
  if (/(ชาวบ้าน|เด็ก|หญิงชรา|commoner|villager|farmer)/.test(value)) tags.add("commoner");
  if (/(โรนิน|ronin|ไร้นาย)/.test(value)) tags.add("ronin");
  if (/(เอกสาร|ตรา|จดหมาย|พู่กัน|หมึก|document|seal|letter|witness)/.test(value)) tags.add("document");
  if (/(เรือ|น้ำ|สะพาน|ท่าเรือ|river|boat|port|sea)/.test(value)) tags.add("water");
  if (/(เดินทาง|ถนน|ทางผ่าน|travel|road|route)/.test(value)) tags.add("travel");
  if (/(อาวุธ|หอก|ปืน|กองทัพ|war|soldier|battle)/.test(value)) tags.add("war");
  if (/(ช่าง|ไม้|เหล็ก|craft|workshop)/.test(value)) { tags.add("craft"); tags.add("artisan"); }
  if (/(แผล|เจ็บ|เลือด|ผ้าพันแผล|injury|blood|hurt)/.test(value)) tags.add("injury");
  if (/(ลับ|ซ่อน|รอยสัก|ตราเก่า|ความลับ|secret|hide|rumor)/.test(value)) tags.add("secrecy");
  return Array.from(tags);
}

export type NarrativeVoiceContext = { speaker?: string; speakerRole?: NarrativeSpeakerRole; playerOccupation?: string };
export type NarrativePromptPacket = { tags: NarrativeExampleTag[]; exampleIds: string[]; prompt: string };

function voiceRuleForSpeaker(context: NarrativeVoiceContext): string[] {
  const name = context.speaker?.trim() || "ผู้พูดในฉาก";
  const role = context.speakerRole ?? "unknown";
  const shared = [
    `${name} ต้องมีน้ำเสียงของตนเอง ไม่ใช่เพียงผู้บรรยายที่สลับชื่อ: ให้บทพูดบอกสิ่งที่ผู้นั้นต้องการ ขอ ปฏิเสธ เตือน หรือยอมรับในฉากนี้อย่างตรงไปตรงมา และให้รับคำหรือรับการกระทำที่เพิ่งเกิดก่อนพูดต่อ`,
    "หนึ่งช่วงบทพูดควรเป็นการโต้ตอบสั้น ๆ ที่คนฟังเข้าใจได้ทันที: ใช้สองถึงสี่ประโยคได้เมื่อแรงกดดันต้องการ แต่ทุกประโยคต้องทำงาน ไม่เล่าซ้ำภาพเดิม ไม่พูดอ้อม และไม่ยืดเป็นคำปราศรัย",
    "แทรกปฏิกิริยาคนจริงได้ตามหลักฐานในฉาก เช่น ชะงัก แก้คำ มองคนอื่น หรือหยุดเพราะมีคนตัดบท; อย่าบังคับให้ทุกคนมีอาการครบชุด และอย่าบรรยายเจตนาที่คนอ่านเห็นจากบทพูดอยู่แล้ว",
    "ให้บุคลิกออกจากสิ่งที่ผู้พูดเลือกถาม ยอม หรือเก็บไว้ ไม่ใช่จากถ้อยคำเกินจริง; อย่าให้ทุกคนพูดเป็นคำขู่ คติชีวิต หรือประโยคสรุปที่ฟังเหมือนผู้บรรยาย",
  ];
  const roleRule: Record<NarrativeSpeakerRole, string> = {
    ruler: "ผู้มีอำนาจชั้นสูงเลือกคำสั่งสั้นและเฉพาะงาน เช่น ให้นำคนมา ให้รอ หรือให้เอาหลักฐานมา; เขาไม่ต้องประกาศอำนาจหรือพูดเป็นคำสอน และอาจตัดคำของผู้อื่นเมื่อสถานการณ์บังคับ",
    samurai: "ซามูไรพูดเรื่องหน้าที่ งาน และสิ่งที่ต้องทำต่อจากนี้ ใช้คำตรง ไม่ตวาด ไม่ทำภาษาให้เก่าเกินจริง และพูดเรื่องเกียรติหรือความภักดีต่อเมื่อฉากบังคับเท่านั้น",
    merchant: "พ่อค้าพูดถึงของ เวลา เงิน หรือคนรับผิดที่กำลังอยู่ตรงหน้า เช่น ต้องย้ายของกี่หีบ ส่งเมื่อไร หรือใครลงเรือ; เขาพูดชัดเพราะต้องการคำตอบ ไม่พูดเป็นปริศนาหรือคำขู่กว้าง ๆ",
    commoner: "ชาวบ้านพูดจากปากท้อง ครอบครัว งาน และความปลอดภัย ใช้คำธรรมดา; ความระวังให้เห็นจากการลดเสียง เลือกคำ หรือมองหาคนฟัง ไม่ใช่คำพูดสวยเกินฐานะ",
    temple: "ผู้เกี่ยวข้องวัดหรือศาสนสถานพูดด้วยความยับยั้ง แต่ยังต้องบอกงานหรือความเสี่ยงให้ชัด; อย่าเขียนเป็นคำเทศนาหรือทำให้รู้ความลับเกินสิ่งที่เห็น",
    unknown: "กำหนดเสียงจากสิ่งที่ผู้พูดถืออยู่ สถานที่ และแรงกดดันที่เห็นได้; ให้บทพูดบอกเรื่องที่จับต้องได้หนึ่งเรื่องด้วยคำง่าย ห้ามยัดบุคลิกเฉพาะที่ไม่มีใน scene brief",
  };
  const playerRule = context.playerOccupation?.includes("โรนิน") || context.playerOccupation?.toLowerCase().includes("ronin")
    ? "เมื่อโรนินเป็นผู้ตอบ ให้เขาพูดตรงและประหยัดคำ บอกว่าจะทำอะไรหรือไม่ทำอะไรโดยไม่อวดเกียรติที่ไม่มีตราบ้านค้ำ; ความลังเลให้เห็นจากการเว้นคำหรือการเลือกไม่ตอบ"
    : "ผู้เล่นตอบด้วยภาษาที่เหมาะกับอาชีพและฐานะตาม scene brief โดยไม่อวดรู้เกินข้อมูลที่เข้าถึง";
  return [...shared, roleRule[role], playerRule];
}

/** Layer 4 — a provider-neutral prompt packet. The same string can be sent to GPT, Claude, or Gemini. */
export function buildNarrativePromptPacket(language: NarrativeLanguage, sceneText: string, voiceContext: NarrativeVoiceContext = {}): NarrativePromptPacket {
  const roleTags: Partial<Record<NarrativeSpeakerRole, NarrativeExampleTag[]>> = {
    ruler: ["authority", "dialogue"],
    samurai: ["authority", "dialogue"],
    merchant: ["merchant", "dialogue"],
    commoner: ["commoner", "dialogue"],
    temple: ["authority", "dialogue"],
    unknown: ["dialogue"],
  };
  const tags = Array.from(new Set([...narrativeTagsForScene(sceneText), ...(roleTags[voiceContext.speakerRole ?? "unknown"] ?? [])]));
  const examples = selectNarrativeGoldenExamples(language, tags);
  const rules = language === "th" ? NARRATIVE_STYLE_BIBLE_V1.thai : NARRATIVE_STYLE_BIBLE_V1.english;
  const exampleBlock = examples.map((example, index) => `ตัวอย่างจังหวะ ${index + 1} (${example.id}): ${example.text}`).join("\n");
  return {
    tags,
    exampleIds: examples.map((example) => example.id),
    prompt: [
      "MODEL-NEUTRAL NARRATIVE PACKET. These instructions outrank stylistic preference.",
      "STYLE BIBLE:",
      ...rules.map((rule) => `- ${rule}`),
      "INVARIANTS:",
      ...NARRATIVE_STYLE_BIBLE_V1.invariants.map((rule) => `- ${rule}`),
      "CHARACTER VOICE CONTRACT:",
      ...voiceRuleForSpeaker(voiceContext).map((rule) => `- ${rule}`),
      "GOLDEN EXAMPLES: demonstrate rhythm and handling only. Do not reuse their names, facts, dialogue, or plot.",
      exampleBlock || "No example is available; follow the Style Bible without inventing a reference.",
    ].join("\n"),
  };
}

export type PlayerFacingNarrative = {
  sceneTitle: string;
  narration: string[];
  nextChoices: string[];
  memory: { title: string; detail: string };
  missionNote: string;
};

export type NarrativeEvaluation = {
  score: number;
  hardFail: boolean;
  flags: string[];
  issues: string[];
  dimensions: { prose: number; period: number; structure: number; choiceContinuity: number };
};

export type NarrativePromotionDecision = { promote: boolean; reason: string };

/** Layer 7 — deterministic promotion rule for offline QA or a future AI judge. */
export function decideNarrativePromotion(baseline: NarrativeEvaluation, candidate: NarrativeEvaluation): NarrativePromotionDecision {
  if (candidate.hardFail) return { promote: false, reason: "candidate has a hard-fail quality violation" };
  if (candidate.score <= baseline.score) return { promote: false, reason: "candidate does not exceed the approved baseline score" };
  return { promote: true, reason: "candidate exceeds the approved baseline without a hard-fail" };
}

/**
 * Layers 5 and 7 — synchronous acceptance gate and a repeatable lightweight
 * rubric. It catches objective faults at runtime; subjective scoring remains a
 * QA concern and is deliberately not a second model call during player turns.
 */
export function evaluatePlayerFacingNarrative(response: PlayerFacingNarrative, language: NarrativeLanguage): NarrativeEvaluation {
  const playerText = [response.sceneTitle, ...response.narration, ...response.nextChoices, response.memory.title, response.memory.detail, response.missionNote].join("\n");
  const flags = narrativeQualityFlags(playerText, language);
  const issues: string[] = [];
  if (response.narration.length !== 3) issues.push("narration must contain exactly three paragraphs");
  if (response.narration.some((paragraph) => paragraph.trim().length < 120)) issues.push("each narration paragraph must have at least 120 characters");
  if (response.nextChoices.length !== 3) issues.push("next choices must contain exactly three actions");
  if (response.nextChoices.some((choice) => choice.trim().length < 2)) issues.push("every next choice must be actionable");
  if (language === "th") {
    const letters = playerText.replace(/[^A-Za-zก-๙]/g, "");
    const thaiLetters = (letters.match(/[ก-๙]/g) ?? []).length;
    if (letters.length > 0 && thaiLetters / letters.length < 0.55) issues.push("Thai player-facing prose contains too little Thai text");
  }
  const hardFail = flags.length > 0 || issues.length > 0;
  const structure = Math.max(0, 25 - (issues.filter((issue) => issue.includes("narration") || issue.includes("choice")).length * 12));
  const period = flags.includes("period-anachronism") || flags.includes("modernism") ? 0 : 25;
  const prose = flags.includes("game-artifact") || flags.includes("faux-archaic") ? 0 : 25;
  const choiceContinuity = response.nextChoices.length === 3 && response.nextChoices.every((choice) => choice.trim().length >= 2) ? 25 : 0;
  return { score: Math.max(0, prose + period + structure + choiceContinuity), hardFail, flags, issues, dimensions: { prose, period, structure, choiceContinuity } };
}

/** Layer 6 — safe fallback policy. The client retains its deterministic local prose writer as the actual fallback. */
export const NARRATIVE_SAFE_FALLBACK_POLICY = {
  retries: 1,
  runtime: "local deterministic prose only",
  neverDo: ["invent state changes", "reveal private dossier", "render rejected AI prose"],
} as const;
