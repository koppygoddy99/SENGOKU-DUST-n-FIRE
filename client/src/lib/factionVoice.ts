/**
 * factionVoice — แปล stance/heat จาก worldSystems.powerRumor เป็น "น้ำเสียงบทพูด"
 *
 * หลักการ: projection เป็น read-only ต่อค่าเกม (ไม่เปลี่ยน stance/heat)
 * แค่ "อ่านค่าจริง → เลือกท่อนบทพูดเสริม" เพื่อให้ NPC พูดต่างกันตามชื่อเสียง
 * ที่ผู้เล่นสร้างมาจริง (event-driven) ไม่ใช่บทพูดตายตัว
 */

import type { FactionStanceValue } from "./worldEvents";

export type VoiceTone = "warm" | "neutral" | "cold";

/**
 * แปลง stance → โทนเสียง
 * warm  = ไว้ใจ/ช่วยเหลือ, cold = ระแวง/ศัตรู, neutral = ธรรมดา
 */
export function toneFromStance(stance: FactionStanceValue): VoiceTone {
  if (stance === "allies" || stance === "friendly" || stance === "helpful" || stance === "cooperative") return "warm";
  if (stance === "hostile" || stance === "war" || stance === "interfering" || stance === "wary") return "cold";
  return "neutral";
}

/**
 * ท่อนบทพูดเสริมตามฝ่าย + โทน
 * ใช้แทรกใน localOutcomeNarration (ไม่แทนที่บทพูดเดิม ต่อท้ายเฉยๆ)
 */
export const FACTION_VOICE: Record<string, { warm: string; cold: string }> = {
  "checkpoint-guard": {
    warm: "ผู้คุมด่านพยักหน้ารับเมื่อเห็นหน้า “ผ่านไปได้ คราวนี้ข้าไม่ค้นตัว” เขาก้มลงจัดเชือกต่อโดยไม่มองตามหลัง",
    cold: "ผู้คุมด่านจ้องตาไม่กะพริบ “หยุด ยกมือขึ้นให้ข้าเห็นก่อน” ปลายหอกของเขาลากพื้นเข้าหาปลายเท้าเจ้า",
  },
  "sakai-merchants": {
    warm: "สภาพ่อค้ายิ้มกว้าง “เจ้าคือคนที่กันทาโร่ไว้ใจ นี่ข้าให้ครึ่งราคา” เขาเองหยิบของออกจากลังหลังมาให้",
    cold: "สภาพ่อค้าขยับถอยครึ่งก้าว “ของหมดแล้ว อย่าถามอีกรอบ” เขาก้มลงปิดฝาลังไม้เสียงดังปื้ก",
  },
  villagers: {
    warm: "ชาวบ้านที่ยืนดูพลันหันมาช่วยเก็บของให้ “พักก่อนได้ เราจัดการตรงนี้ให้” เสียงเขายังเหนื่อยแต่ยินดี",
    cold: "ชาวบ้านที่ยืนใกล้หันหลังให้ “ขอโทษ ไม่มีอะไรให้” เขาก้มหนีไม่ทันรอคำตอบ",
  },
  "local-warband": {
    warm: "นักรบท้องถิ่นที่ยันหอกอยู่ข้างเสาโบกมือเรียก “มานี่ เราปล่อยให้เจ้าผ่าน” เขาเผยอปากยิ้ม",
    cold: "นักรบท้องถิ่นที่ยืนเฝ้ายกหอกขวางหน้า “เดินกลับ หรือจะให้พวกข้าไล่?” แววตาเขาไม่มีเยื่อใย",
  },
  "temple-shrine": {
    warm: "ไวยาวาสที่ประตูวัดประนมมือ “เข้ามาพักเถอะ วิหารนี้เปิดให้คนอย่างเจ้าเสมอ”",
    cold: "ไวยาวาสที่ประตูวัดก้มหน้าปิดประตูเสียงดุ่ย “วันนี้ไม่รับแขก ขออภัย” ไม่ทันรอคำว่าไง",
  },
};

/**
 * หาฝ่ายที่ speaker (string ชื่อ NPC) สังกัด
 * คืน null ถ้าไม่รู้จัก → ให้กลับไปใช้บทพูด neutral เดิม
 */
export function factionOfSpeaker(speaker: string): string | null {
  if (/กันทาโร่|สภาพ่อค้า|พ่อค้า|ขบวนสินค้า|ผู้ว่าจ้าง/.test(speaker)) return "sakai-merchants";
  if (/ผู้คุมด่าน|ทหาร|ด่าน|ประตูด่าน/.test(speaker)) return "checkpoint-guard";
  if (/โทคิจิ|นักรบ|วาร์แบนด์|warband/.test(speaker)) return "local-warband";
  if (/มาซาคิจิ|ชาวบ้าน/.test(speaker)) return "villagers";
  if (/วัด|ศาลเจ้า|ไวยาวาส|พระ/.test(speaker)) return "temple-shrine";
  return null;
}

/**
 * สร้างท่อนบทพูดเสริมจากสถานะฝ่าย
 * @returns "" ถ้า neutral/ไม่รู้จักฝ่าย (ไม่แทรกอะไร)
 */
export function voiceReplyFor(speaker: string, stance: FactionStanceValue | undefined, heatLevel: number): string {
  const factionId = factionOfSpeaker(speaker);
  if (!factionId) return "";
  const tone = stance ? toneFromStance(stance) : "neutral";
  if (tone === "neutral") return "";
  const entry = FACTION_VOICE[factionId];
  if (!entry) return "";
  let tag = tone === "cold" ? entry.cold : entry.warm;
  // heat สูง → ซ้อนประโยคระแวงท้าย (คนข้างทางจับตา)
  if (heatLevel >= 3) {
    tag += " คนข้างทางหันมองแล้วกระซิบกันเบา ๆ ไม่มีใครอยากเป็นคนตอบแทนเจ้า";
  }
  return tag;
}
