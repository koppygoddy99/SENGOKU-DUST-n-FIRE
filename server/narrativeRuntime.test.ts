import { describe, expect, it } from "vitest";
import { buildNarrativePromptPacket, decideNarrativePromotion, evaluatePlayerFacingNarrative, selectNarrativeGoldenExamples } from "../shared/narrativeRuntime";
import { narrativeQualityFlags, narrativeStylePrompt } from "../shared/narrativeStyle";

const paragraph = (ending: string) => `อากิฮิสะยืนนิ่งอยู่ใต้ชายคาไม้ ฝนจากปลายฟางยังหยดลงบนดินชื้นข้างเท้าของเขา ผู้คุมเก็บกระดาษที่มีรอยหมึกเข้มไว้ในมือ ก่อนมองผ่านไหล่ของโรนินไปยังทางที่คนส่งสารเพิ่งเดินลับหาย ${ending}`;

describe("Narrative runtime layers", () => {
  it("retrieves at most two relevant user-approved examples and requires clear responsive dialogue without copying them", () => {
    const examples = selectNarrativeGoldenExamples("th", ["authority", "document", "pressure"]);
    expect(examples).toHaveLength(2);
    expect(examples.map((example) => example.id)).toContain("user-daimyo-audience");
    const packet = buildNarrativePromptPacket("th", "พ่อค้ายืนบนเรือขณะเชือกขาดและหีบสินค้าเกือบตกน้ำ", { speaker: "เจ้าของขบวนสินค้า", speakerRole: "merchant", playerOccupation: "โรนิน" });
    expect(packet.exampleIds).toContain("user-lived-in-action-ship");
    expect(packet.exampleIds).toHaveLength(2);
    expect(packet.prompt).toContain("Do not reuse their names, facts, dialogue, or plot");
    expect(packet.prompt).toContain("CHARACTER VOICE CONTRACT");
    expect(packet.prompt).toContain("พ่อค้าพูดถึงของ เวลา เงิน หรือคนรับผิดที่กำลังอยู่ตรงหน้า");
    expect(packet.prompt).toContain("โรนินเป็นผู้ตอบ");
    expect(packet.prompt).toContain("ไม่เล่าซ้ำภาพเดิม");
    expect(packet.prompt).toContain("รับคำหรือรับการกระทำที่เพิ่งเกิด");
    expect(packet.prompt).toContain("สองถึงสี่ประโยคได้เมื่อแรงกดดันต้องการ");
    const contract = narrativeStylePrompt("th");
    expect(contract).toContain("Narrative Style Contract v3");
    expect(contract).toContain("ใช้คำไทยกลางที่คนอ่านเข้าใจได้ในครั้งเดียว");
    expect(contract).toContain("ไม่ปล่อยให้ทุกคนพูดลอย ๆ");
  });

  it("accepts structured Thai prose and rejects anachronistic player-facing text", () => {
    const valid = { sceneTitle: "รอยหมึกที่ด่าน", narration: [paragraph("ลมหายใจของคนข้างหลังจึงเบาลงโดยไม่ต้องมีผู้ใดเอ่ยคำ."), paragraph("ผู้คุมเอ่ยเพียงว่า “เดินต่อไปได้” แล้วปล่อยมือจากขอบโต๊ะช้า ๆ."), paragraph("หนังสือผ่านทางยังอยู่กับเขา และชื่อของอากิฮิสะย่อมไม่เงียบเหมือนก่อน.")], nextChoices: ["ตามพ่อค้าไปยังโรงเก็บสินค้า", "ขอพบผู้คุมอีกครั้ง", "หาคนที่เห็นการจดชื่อ"], memory: { title: "ชื่อถูกจดไว้ที่ด่าน", detail: "ผู้คุมเก็บหนังสือผ่านทางไว้และอนุญาตให้คนส่งสารเดินต่อ" }, missionNote: "ต้องหาหลักฐานหรือคนรับรองก่อนกลับมาทวงเอกสาร" };
    expect(evaluatePlayerFacingNarrative(valid, "th").hardFail).toBe(false);
    expect(evaluatePlayerFacingNarrative({ ...valid, narration: [paragraph("เสียงปากกาคลิกบนโต๊ะไม้"), ...valid.narration.slice(1)] }, "th").flags).toContain("period-anachronism");
  });

  it("flags only objectively identifiable needlessly formal Thai and does not pretend to automate taste", () => {
    expect(narrativeQualityFlags("ด้วยประการฉะนี้ เขาจึงเดินกลับไปที่ประตู", "th")).toContain("unnecessarily-formal-thai");
    expect(narrativeQualityFlags("เขาหยุดมองประตูก่อนพูดว่า “รอก่อน ข้าต้องดูของให้ชัด”", "th")).toEqual([]);
  });

  it("promotes only a clean candidate that improves on the approved baseline", () => {
    const baseline = { score: 78, hardFail: false, flags: [], issues: [], dimensions: { prose: 20, period: 20, structure: 20, choiceContinuity: 18 } };
    expect(decideNarrativePromotion(baseline, { ...baseline, score: 84 }).promote).toBe(true);
    expect(decideNarrativePromotion(baseline, { ...baseline, score: 84, hardFail: true }).promote).toBe(false);
    expect(decideNarrativePromotion(baseline, { ...baseline, score: 78 }).promote).toBe(false);
  });
});
