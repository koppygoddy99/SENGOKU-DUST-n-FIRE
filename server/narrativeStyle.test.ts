import { describe, expect, it } from "vitest";
import { NARRATIVE_STYLE_CONTRACT_V3, narrativeQualityFlags, narrativeStylePrompt } from "../shared/narrativeStyle";

const fixtures = [
  { contact: "Gantaro", th: "กันทาโร่มองรอยโคลนที่ชายเสื้อก่อนเอ่ยสั้น ๆ ว่า “แก้เรื่องที่ก่อไว้ แล้วค่อยมาพูดถึงคำขอโทษ”", en: "Gantaro studied the mud at the hem before he said, \"Mend what you have made, then speak of apology.\"" },
  { contact: "Tokichi", th: "โทคิจิขยับหอกพ้นเงาเสาแล้วหัวเราะเบา ๆ “เรื่องเงียบได้ ถ้าถ้วยเหล้าไม่เงียบก่อน”", en: "Tokichi eased his spear clear of the post and smiled. \"A secret can stay quiet, if the cup does not run dry first.\"" },
  { contact: "Masakichi", th: "มาซาคิจิใช้นิ้วลูบรอยร้าวที่ไม้พานท้าย “อย่าฝืนจุดชนวนตอนความชื้นยังติดอยู่ มันไม่ฟังความกล้าของใคร”", en: "Masakichi ran a thumb along the stock's crack. \"Do not force a spark while damp remains. Powder has no ear for courage.\"" },
  { contact: "Genshiro", th: "เก็นชิโร่จัดปลายแขนเสื้อให้ตรงก่อนออกคำสั่ง “จงส่งตัวมาเสีย แล้วท่าเรือจะไม่ต้องเรียนรู้ชื่อของเจ้าอีก”", en: "Genshiro set his sleeve straight before he gave the order. \"Yield yourself, and the harbor need not learn your name again.\"" },
];

describe("Narrative Style Contract v3", () => {
  it("defines role-specific bilingual registers without requiring private NPC motivation", () => {
    expect(NARRATIVE_STYLE_CONTRACT_V3.version).toBe("v3");
    expect(Object.keys(NARRATIVE_STYLE_CONTRACT_V3.registers)).toEqual(expect.arrayContaining(["authority", "merchant", "companion", "samurai", "artisan", "adversary"]));
    fixtures.forEach((fixture) => {
      expect(narrativeQualityFlags(fixture.th, "th")).toEqual([]);
      expect(narrativeQualityFlags(fixture.en, "en")).toEqual([]);
    });
  });

  it("flags prose that leaks game language, modern phrasing, faux archaism, or supplied private detail", () => {
    expect(narrativeQualityFlags("ทอยลูกเต๋าแล้วได้โบนัส +2", "th")).toContain("game-artifact");
    expect(narrativeQualityFlags("โอเค เดี๋ยวอัปเดตแผน", "th")).toContain("modernism");
    expect(narrativeQualityFlags("เสียงปากกาคลิกบนกระดาษทำให้คนทั้งด่านเงียบลง", "th")).toContain("period-anachronism");
    expect(narrativeQualityFlags("เจ้าหน้าที่ตรวจระบบแล้วเรียกตำรวจ", "th")).toContain("period-anachronism");
    expect(narrativeQualityFlags("ผู้คุมจุ่มพู่กันลงในหมึกก่อนลากเส้นบนกระดาษ", "th")).toEqual([]);
    expect(narrativeQualityFlags("flaw ถูกกระตุ้นจนค่า context ลดลง", "th")).toContain("game-artifact");
    expect(narrativeQualityFlags("อ้างอิงการ์ดบรีฟก่อนตัดสินใจ", "th")).toContain("modernism");
    expect(narrativeQualityFlags("เจ้าของขบวนยื่นคำชี้แจงเรื่องความชอบธรรม", "th")).toContain("period-anachronism");
    expect(narrativeQualityFlags("ด้วยประการฉะนี้ เขาจึงสั่งให้ทุกคนรอ", "th")).toContain("unnecessarily-formal-thai");
    expect(narrativeQualityFlags("Thou shalt carry the dice.", "en")).toEqual(expect.arrayContaining(["faux-archaic", "game-artifact"]));
    expect(narrativeQualityFlags("A line from the sealed dossier.", "en", ["sealed dossier"])).toContain("private-disclosure");
  });

  it("builds a language-specific prompt with shared spoiler and mechanics boundaries", () => {
    const thaiPrompt = narrativeStylePrompt("th");
    const englishPrompt = narrativeStylePrompt("en");
    expect(thaiPrompt).toContain("Narrative Style Contract v3");
    expect(thaiPrompt).toContain("ลูกเต๋า");
    expect(thaiPrompt).toContain("พู่กัน");
    expect(thaiPrompt).toContain("ภาษาไทยแบบนิยาย");
    expect(thaiPrompt).toContain("อย่าแปลโครงประโยคอังกฤษตรงตัว");
    expect(englishPrompt).toContain("faux-archaic");
    expect(englishPrompt).toContain("private motivation");
  });
});
