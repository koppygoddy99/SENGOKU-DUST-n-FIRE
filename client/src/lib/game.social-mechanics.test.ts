import { describe, expect, it } from "vitest";
import { applyRoll, createSaikaSafehouseDemo, normalizeGameState, parseAction, type RollRecord } from "./game";

/**
 * Social Record mechanics — ขึ้นเฉพาะ "ภารกิจสำคัญ" + เพิ่มยาก 2x
 * (ดู applySocialRecord ใน game.ts — random event กันไว้ทำทีหลัง)
 */
function recordFor(state: ReturnType<typeof createSaikaSafehouseDemo>, outcome: RollRecord["outcome"]): RollRecord {
  const preview = parseAction("ข้าจะยื่นบัญชีข้าวต่อเสมียนหน้าด่าน", state);
  return {
    ...preview,
    id: `social-${outcome}`,
    dice: [6, 6],
    total: 18,
    margin: 4,
    outcome,
    summary: "ผลทดสอบสถานะสังคม",
    narrative: "ร้อยแก้วทดสอบ",
    consequence: "ร่องรอยทดสอบ",
    tick: state.tick + 1,
  };
}

// demo เริ่ม: honor 0 · influence 1 · information 2 · stain 2 · mission OFFERED (progress 0/2)
function demo() {
  return normalizeGameState(createSaikaSafehouseDemo());
}

describe("Social Record — ขึ้นเฉพาะภารกิจหลัก/รองสำเร็จ (ไม่นับทอยธรรมดา)", () => {
  it("a routine partial_success raises NO social value (ขึ้นเฉพาะเหตุการณ์สำคัญเท่านั้น)", () => {
    const base = demo();
    // partial → progress 1/2 ยังไม่ resolve → missionResolved = false
    const next = applyRoll(base, recordFor(base, "partial_success"));
    expect(next.character.social.honor).toBe(0);
    expect(next.character.social.influence).toBe(1);
    expect(next.character.social.information).toBe(2); // "ข่าวในมือ" ตัดจากกลไก — คงค่าไว้
    expect(next.character.social.stain).toBe(2);
  });

  it("resolving a main mission grants +0.5 (เพิ่มยาก 2x) ต่อเกียรติ/บารมี และล้างข้อครหา -0.5 (ข่าวในมือไม่ขยับ)", () => {
    const base = demo();
    // decisive_success → progress +2 → 2/2 resolves
    const next = applyRoll(base, recordFor(base, "decisive_success"));
    expect(next.character.social.honor).toBe(0.5);
    expect(next.character.social.influence).toBe(1.5);
    expect(next.character.social.information).toBe(2); // not touched หลังตัดกลไก
    expect(next.character.social.stain).toBe(1.5); // 2 - 0.5
    // เตรียมภารกิจรองตัวที่สอง เพื่อให้ resolve ได้จริง 2 ครั้ง (2x0.5 = ขึ้น 1 ระดับบน UI)
    const main = next.missions[0];
    const side = { ...main, id: "mission-side-social", role: "side" as const, visibility: "visible" as const, state: "offered" as const, title: "งานรองทดสอบ" };
    const two = { ...next, missions: [main, side] };
    const secondTime = applyRoll(two, recordFor(two, "decisive_success"));
    expect(secondTime.character.social.honor).toBe(1); // 0.5 + 0.5 = 1 → Math.floor(1) = "เรื่อยเปื่อย"
  });

  it("a failure with consequence raises stain +1 without touching the positive values", () => {
    const base = demo();
    const next = applyRoll(base, recordFor(base, "failure_with_consequence"));
    expect(next.character.social.stain).toBe(3);
    expect(next.character.social.honor).toBe(0);
    expect(next.character.social.influence).toBe(1);
    expect(next.character.social.information).toBe(2);
  });
});

describe("Social Record — cap และ clamp", () => {
  it("clamps influence at 4 and honor at 5", () => {
    const base = demo();
    const highInfluence = { ...base, character: { ...base.character, social: { ...base.character.social, honor: 5, influence: 4, stain: 5 } } };
    const next = applyRoll(highInfluence, recordFor(highInfluence, "decisive_success"));
    expect(next.character.social.influence).toBe(4); // ไม่เกิน cap
    expect(next.character.social.honor).toBe(5);
  });

  it("never drops honor/influence/information below 0 and never raises stain above 5", () => {
    const base = demo();
    const zeroed = { ...base, character: { ...base.character, social: { honor: 0, influence: 0, information: 0, stain: 5 } } };
    const next = applyRoll(zeroed, recordFor(zeroed, "decisive_success"));
    expect(next.character.social.honor).toBe(0.5);
    expect(next.character.social.influence).toBe(0.5);
    expect(next.character.social.information).toBe(0); // "ข่าวในมือ" ตัดจากกลไก — คงค่า
    expect(next.character.social.stain).toBe(4.5); // ลบ 0.5 ไม่ต่ำกว่า 0
    const failed = applyRoll(zeroed, recordFor(zeroed, "failure_with_consequence"));
    expect(failed.character.social.stain).toBe(5); // clamp บน
  });
});