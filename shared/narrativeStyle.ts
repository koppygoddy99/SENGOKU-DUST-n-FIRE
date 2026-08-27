export type NarrativeLanguage = "en" | "th";
export type NarrativeRole = "authority" | "merchant" | "commoner" | "companion" | "samurai" | "artisan" | "adversary";

export type LanguageRegister = {
  role: NarrativeRole;
  thai: string;
  english: string;
};

export type NarrativeStyleContract = {
  version: "v2";
  thaiRules: string[];
  englishRules: string[];
  sharedRules: string[];
  registers: Record<NarrativeRole, LanguageRegister>;
  forbiddenThai: string[];
  forbiddenEnglish: string[];
};

export const NARRATIVE_STYLE_CONTRACT_V2: NarrativeStyleContract = {
  version: "v2",
  thaiRules: [
    "ภาษาไทยคือมาตรฐานการเล่าเรื่องหลัก: เขียนไทยกลางแบบนิยาย ใช้บุรุษที่สามใกล้ชิด และวางสัมผัสทางกายภาพก่อนคำอธิบายนามธรรม",
    "ให้บทสนทนาติดกับท่าทางหรือการกระทำ และรักษาระยะอำนาจตามฐานะของผู้พูด",
    "หลีกเลี่ยงภาษาบทละคร ภาษาแชต คำสแลงร่วมสมัย และคำยกยศที่เกินฐานะ",
    "บรรยายเฉพาะสิ่งที่ผู้เล่นเห็น ได้ยิน สืบพบ หรืออนุมานได้อย่างมีขอบเขต",
    "ตรวจทุกวัตถุ กริยา และอุปมาก่อนส่ง: ฉากญี่ปุ่นยุคเซนโกคุต้องใช้พู่กัน หมึก กระดาษ ตรา ไม้ เชือก เสียงเท้า หอก หรือของร่วมสมัยกับฉาก ห้ามปากกา ปากกาลูกลื่น เสียงคลิก ระบบหรือภาษาราชการสมัยใหม่",
    "อย่าแปลโครงประโยคอังกฤษตรงตัว: ใช้ประโยคไทยที่กริยามีคนทำ ไม่ให้สิ่งไร้ชีวิตคิด ตัดสิน คำนวณ หรือยืดออก; หลีกเลี่ยงวลีราชการ เช่น ชี้แจง ความชอบธรรม ผู้เกี่ยวข้อง ตัวแทน และคำบรรยายลอยตัวที่ไม่เห็นภาพ",
    "เมื่อฉากมีบาดแผล งานช่าง ความลับ หรือพยาน ให้แสดงผ่านข้อจำกัดของร่างกาย เครื่องมือ การวางมือ และสายตารอบข้าง; ห้ามอธิบายความรู้สึกลอย ๆ แทนเหตุการณ์",
  ],
  englishRules: [
    "Use clear, literary historical English with material detail and controlled cadence.",
    "Use register to show authority, trade, class, and intimacy rather than faux-archaic syntax.",
    "Do not use thee, thou, fantasy diction, modern corporate language, or literal Thai calques.",
    "Keep the player perspective limited to visible, heard, learned, or reasonably inferred facts.",
  ],
  sharedRules: [
    "Preserve the deterministic event, outcome, and player-visible facts. Never add a state change.",
    "Keep dice, DN, Traits, Mastery, bonuses, GM/AI language, and system tags out of prose and relationship summaries.",
    "Do not reveal private motivation, secret direction, or facts that are not in the supplied public evidence.",
    "Dialogue must shift pressure, conditions, information, or character texture; it must not end in a meta question waiting for player input.",
    "Thai and English may differ in phrasing but must preserve the same visible event, power relation, and disclosure boundary.",
  ],
  registers: {
    authority: { role: "authority", thai: "กระชับ คุมจังหวะ ใช้คำสั่งหรือเงื่อนไขที่ชัดเจน ไม่ฟุ่มเฟือย", english: "Short clauses that control the room; commands and conditions carry the authority." },
    merchant: { role: "merchant", thai: "ระวังถ้อยคำ ชั่งผลได้ผลเสีย เว้นจังหวะก่อนผูกเงื่อนไข", english: "Measured, conditional speech; terms and consequences matter more than ornament." },
    commoner: { role: "commoner", thai: "ตรงและเป็นรูปธรรม สัมพันธ์กับงาน ปากท้อง ครอบครัว หรือความปลอดภัย", english: "Concrete speech tied to work, household, hunger, safety, and witness." },
    companion: { role: "companion", thai: "เป็นกันเองได้เท่าที่เหตุการณ์และสถานะอนุญาต ไม่ลดความระวังในช่วงเสี่ยง", english: "Earned familiarity, never weightless; humor or bluntness changes with the danger." },
    samurai: { role: "samurai", thai: "สุภาพแต่เด็ดขาด รักษายศ หน้าที่ และน้ำหนักของคำรับรอง", english: "Controlled and formal without fake archaism; rank, duty, and consequence shape each line." },
    artisan: { role: "artisan", thai: "สนใจวัสดุ เครื่องมือ รอยสึก และวิธีทำ มากกว่าคำโอ้อวด", english: "Attention settles on material, fit, wear, and craft before abstract praise." },
    adversary: { role: "adversary", thai: "กดดันด้วยการกระทำและข้อเท็จจริง ไม่ใช้ความคลุ้มคลั่งหรือคำขู่พร่ำเพรื่อ", english: "Pressure comes through restraint, action, and stated consequence rather than theatrical rage." },
  },
  forbiddenThai: ["โอเค", "อัปเดต", "เทรนด์", "ชิล", "สตรีมมิ่ง", "ปากกา", "ปากกาลูกลื่น", "คลิก", "โทรศัพท์", "รถยนต์", "ไฟฟ้า", "แบตเตอรี่", "นาฬิกาข้อมือ", "เจ้าหน้าที่", "ตำรวจ", "ออฟฟิศ", "โปรไฟล์", "ระบบ", "ชี้แจง", "ความชอบธรรม", "ผู้เกี่ยวข้อง", "ตัวแทน", "เส้นขอบการ", "คำนวณ", "บรีฟ", "การ์ด", "คอนเท็กซ์", "context", "flaw", "stain", "ลูกเต๋า", "DN", "2d12", "Trait", "Mastery", "โบนัส", "GM", "AI", "prompt", "success", "failure"],
  forbiddenEnglish: ["thee", "thou", "thy", "thine", "okay", "update", "trending", "streaming", "dice", "DN", "Trait", "Mastery", "bonus", "GM", "AI", "prompt", "success", "failure"],
};

export type NarrativeQualityFlag = "game-artifact" | "modernism" | "period-anachronism" | "faux-archaic" | "private-disclosure";

function containsForbiddenTerm(text: string, term: string, language: NarrativeLanguage): boolean {
  if (language === "th") return text.includes(term.toLowerCase());
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function narrativeQualityFlags(text: string, language: NarrativeLanguage, privateTerms: string[] = []): NarrativeQualityFlag[] {
  const normalized = text.toLowerCase();
  const forbidden = language === "th" ? NARRATIVE_STYLE_CONTRACT_V2.forbiddenThai : NARRATIVE_STYLE_CONTRACT_V2.forbiddenEnglish;
  const flags = new Set<NarrativeQualityFlag>();
  const gameArtifacts = ["dice", "dn", "2d12", "trait", "mastery", "bonus", "gm", "ai", "prompt", "success", "failure", "flaw", "stain", "context", "คอนเท็กซ์", "ลูกเต๋า", "โบนัส"];
  const thaiPeriodAnachronisms = ["ปากกา", "ปากกาลูกลื่น", "คลิก", "โทรศัพท์", "รถยนต์", "ไฟฟ้า", "แบตเตอรี่", "นาฬิกาข้อมือ", "เจ้าหน้าที่", "ตำรวจ", "ออฟฟิศ", "โปรไฟล์", "ระบบ", "ชี้แจง", "ความชอบธรรม", "ผู้เกี่ยวข้อง", "ตัวแทน", "เส้นขอบการ", "คำนวณ"];
  const fauxArchaic = ["thee", "thou", "thy", "thine"];
  if (forbidden.some((term) => containsForbiddenTerm(normalized, term, language))) {
    if (gameArtifacts.some((term) => containsForbiddenTerm(normalized, term, language))) flags.add("game-artifact");
    if (language === "en" && fauxArchaic.some((term) => containsForbiddenTerm(normalized, term, language))) flags.add("faux-archaic");
    if (language === "th" && thaiPeriodAnachronisms.some((term) => containsForbiddenTerm(normalized, term, language))) flags.add("period-anachronism");
    if (forbidden.some((term) => !gameArtifacts.includes(term.toLowerCase()) && !fauxArchaic.includes(term.toLowerCase()) && !(language === "th" && thaiPeriodAnachronisms.includes(term)) && containsForbiddenTerm(normalized, term, language))) flags.add("modernism");
  }
  if (privateTerms.some((term) => term.trim().length > 2 && normalized.includes(term.toLowerCase()))) flags.add("private-disclosure");
  return Array.from(flags);
}

export function narrativeStylePrompt(language: NarrativeLanguage): string {
  const rules = language === "th" ? NARRATIVE_STYLE_CONTRACT_V2.thaiRules : NARRATIVE_STYLE_CONTRACT_V2.englishRules;
  const sharedRules = language === "th" ? [
    "รักษาเหตุการณ์ ผลลัพธ์ และข้อเท็จจริงที่ผู้เล่นมองเห็นได้ ห้ามสร้าง state change เพิ่มเอง",
    "ห้ามใส่ลูกเต๋า DN Trait Mastery โบนัส GM/AI หรือ system tag ในร้อยแก้วและบันทึกความสัมพันธ์",
    "ห้ามเปิดเผยแรงจูงใจลับ คำสั่งกำกับ หรือข้อเท็จจริงที่อยู่นอกหลักฐานสาธารณะที่ได้รับ",
    "บทสนทนาต้องเปลี่ยนแรงกดดัน เงื่อนไข ข้อมูล หรือบุคลิก และห้ามลงท้ายด้วยคำถาม meta ที่รอผู้เล่นตอบ",
    "ไทยและอังกฤษอาจใช้ถ้อยคำต่างกันได้ แต่ต้องรักษาเหตุการณ์ ระยะอำนาจ และขอบเขตการเปิดเผยเท่ากัน",
    "ร่างเป็นภาษาไทยแบบนิยายก่อนตรวจคำ: ใช้จังหวะของร่างกาย วัตถุ และการกระทำ ไม่เขียนเหมือนรายงานระบบหรือคำแปลตรงจากอังกฤษ; อย่าให้โคม แสง เวลา หรือวัตถุไร้ชีวิตคิด คำนวณ หรือสั่งการแทนคน. ใช้แบบนิยายไทย: บรรยายท่าทางและบริบทสั้นก่อนหรือหลังบทพูด, ให้ผู้พูดเป็นผู้กระทำ, และให้ทุกประโยคมีภาพที่มองเห็นหรือสัมผัสได้",
    "ถ้า state รองรับบาดแผล งานช่าง ความลับ หรือพยาน ให้ผลของสิ่งนั้นปรากฏผ่านการเคลื่อนไหว วัสดุ การลดเสียง หรือปฏิกิริยาของคนอื่น ไม่เขียนสรุปความคิดลับหรืออารมณ์ลอย ๆ",
    "ห้ามคำหรือวัตถุหลุดยุค เช่น ปากกา ปากกาลูกลื่น คลิก โทรศัพท์ รถยนต์ ไฟฟ้า แบตเตอรี่ นาฬิกาข้อมือ เจ้าหน้าที่ ตำรวจ ออฟฟิศ โปรไฟล์ หรือระบบ; เมื่อมีการเขียนให้ใช้พู่กัน หมึก กระดาษ ตรา หรือรอยหมึกตามบริบทแทน",
  ] : NARRATIVE_STYLE_CONTRACT_V2.sharedRules;
  return [
    `Narrative Style Contract ${NARRATIVE_STYLE_CONTRACT_V2.version}.`,
    ...rules.map((rule) => `- ${rule}`),
    ...sharedRules.map((rule) => `- ${rule}`),
  ].join("\n");
}
