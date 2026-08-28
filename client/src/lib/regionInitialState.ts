/**
 * regionInitialState — ค่าเริ่มต้นตามเมือง/แคว้น อิงไทมไลน์ประวัติศาสตร์
 *
 * หลักการ (อิง sengoku-rpg-historian):
 *  - ดึงเหตุการณ์/ภัยพิบัติจาก HISTORICAL_TIMELINE ที่ตรงกับ region + year
 *  - แปลเป็น modifier ของ Power & Rumor (faction stance / heat) + economy + community
 *  - ค่าที่มาจากหลักฐาน = ยืนยันได้ / มีหลักฐานสนับสนุน
 *  - ช่องว่างที่ timeline ไม่มี = แต่งเติมเพื่อเกม (สมเหตุสมผลตามตรรกะสังคม)
 *
 * ระบบนี้ครอบเฉพาะ compatibleRegions ของ 10 อาชีพ starter (รอบ 1)
 * ขยาย 66 แคว้นทีหลังโดยใช้ timelineRegionKey เดียวกัน
 */

import { timelineForCampaign, timelineRegionKey } from "./historicalTimeline";
import type { Season } from "./game";

/** faction ที่ระบบติดตาม (ต้องตรงกับ powerRumor.ts + worldEvents.ts) */
type FactionId = "villagers" | "checkpoint-guard" | "sakai-merchants" | "local-warband" | "temple-shrine";
type Stance = "allies" | "friendly" | "helpful" | "cooperative" | "neutral" | "conditional-cooperation" | "wary" | "interfering" | "hostile" | "war";

export type RegionInitialState = {
  /** stance เริ่มต้นต่อฝ่าย (ทับ base ของอาชีพ) — undefined = ใช้ base */
  factionStance: Partial<Record<FactionId, Stance>>;
  /** เหตุผลแสดงใน tooltip/Reason */
  factionReason: Partial<Record<FactionId, string>>;
  /** ความเสี่ยงระดับพื้นที่เริ่มต้น (0..5) */
  heatLevel: number;
  heatReason: string;
  /** สถานะเส้นทางเริ่มต้น (เข้าไปใน economy.routeStatus) */
  routeStatus: string;
  /** ชุมชนเริ่มต้น (food/labor/safety 0..5) — undefined = ใช้ base */
  community: { food?: number; labor?: number; safety?: number };
  /** คำอธิบายสั้นสำหรับ GM/debug */
  brief: string;
};

export const FACTION_NAMES: Record<FactionId, string> = {
  villagers: "ชาวบ้าน",
  "checkpoint-guard": "ผู้คุมด่าน",
  "sakai-merchants": "สภาพ่อค้า",
  "local-warband": "กลุ่มนักรบท้องถิ่น",
  "temple-shrine": "วัดหรือศาลเจ้า",
};

/**
 * หา modifier ตามเมือง/แคว้น
 * region ส่งมาในรูป "Sakai" / "Mikawa" ฯลฯ (ตรงกับ compatibleRegions)
 */
export function regionInitialState(year: number, region: string, season: Season): RegionInitialState {
  const key = timelineRegionKey(region);
  const records = timelineForCampaign(year, region);

  // แยกเหตุการณ์ตามชนิด
  const wars = records.filter((r) => r.kind === "battle" || (r.kind === "event" && /war|battle|campaign|invasion|advance|fall|siege/i.test(r.title.en + r.summary.en)));
  const disasters = records.filter((r) => r.kind === "disaster");
  const regional = records.filter((r) => r.relevance === "regional");
  const national = records.filter((r) => r.relevance === "national");

  const factionStance: Partial<Record<FactionId, Stance>> = {};
  const factionReason: Partial<Record<FactionId, string>> = {};
  let heatLevel = 0;
  let heatReason = "ยังไม่มีเหตุการณ์รบหรือภัยพิบัติในบริเวณนี้ปีนั้น";
  let routeStatus = "เส้นทางยังเปิด แต่ผู้เดินทางถูกซักถาม";
  const community: RegionInitialState["community"] = {};

  // ── มีสงคราม/การทัพในบริเวณนี้ ──
  if (wars.length) {
    const w = wars[0];
    // ผู้คุมด่านระแวง (ด่านถูกเข้มงวดตอนสงคราม)
    factionStance["checkpoint-guard"] = "wary";
    factionReason["checkpoint-guard"] = `ปี ${year} มี${w.title.th}ใกล้เคียง — ด่านเข้มงวดขึ้น`;
    // นักรบท้องถิ่นอาจถูกเกณฑ์หรือระแวงคนนอก
    factionStance["local-warband"] = "interfering";
    factionReason["local-warband"] = `${w.title.th} ทำให้กลุ่มนักรบท้องถิ่นระแวงคนนอก`;
    // ความเสี่ยงสูงขึ้น
    heatLevel = Math.max(heatLevel, 2);
    heatReason = `${w.title.th} (ค.ศ. ${year}) — พื้นที่นี้อยู่ในสนามสงครามหรือเส้นทางลำเลียง`;
    // เส้นทาง: ด่านปิด/ซักถาม
    routeStatus = "ผู้เดินทางถูกซักถาม บางด่านปิดจากการทัพ";
    // ความปลอดภัยชุมชนลด
    community.safety = 2;
  }

  // ── มีภัยพิบัติ (น้ำท่วม/ภัยแล้ง/ทุพภิกขภัย/โรคระบาด) ──
  if (disasters.length) {
    const d = disasters[0];
    // ชาวบ้านไม่ไว้ใจคนนอกตอนวิกฤต (แย่งเสบียง)
    factionStance["villagers"] = "wary";
    factionReason["villagers"] = `${d.title.th} (ค.ศ. ${year}) — ชาวบ้านระแวงคนนอกที่มาขอเสบียง`;
    // ความสับสน/ความเสี่ยงจากภัยพิบัติ
    heatLevel = Math.max(heatLevel, 1);
    if (heatReason === "ยังไม่มีเหตุการณ์รบหรือภัยพิบัติในบริเวณนี้ปีนั้น") {
      heatReason = `${d.title.th} (ค.ศ. ${year}) — ภัยพิบัติทำให้สถานการณ์สับสน`;
    }
    // community ต่ำลงตามชนิดภัย
    const ds = (d.title.en + d.summary.en).toLowerCase();
    if (/famine|frost|drought/.test(ds)) community.food = 1;
    else if (/flood|wind|storm|hail|earthquake/.test(ds)) { community.food = 2; community.labor = 2; }
    else if (/epidemic|smallpox|plague/.test(ds)) community.safety = 1;
    // วัดเป็นที่พักพิงตอนภัยพิบัติ → เป็นมิตรขึ้น
    factionStance["temple-shrine"] = "helpful";
    factionReason["temple-shrine"] = `${d.title.th} — วัดเปิดเป็นที่พักพิงคนเดือดร้อน`;
  }

  // ── มีเหตุการณ์ระดับชาติกระทบแคว้น (แต่ไม่มีบังคับ) ──
  if (national.length && !wars.length && !disasters.length) {
    const n = national[0];
    factionStance["sakai-merchants"] = "conditional-cooperation";
    factionReason["sakai-merchants"] = `ปี ${year} เกิด${n.title.th} — สภาพ่อค้าชะลอการค้าแต่ยังช่วยได้หามีคนรับรอง`;
  }

  // ── ปรับตามฤดูกาล (ถ้าไม่มีภัยพิบัติกำหนด food ไว้) ──
  if (community.food === undefined && (season === "Winter" || season === "Summer")) {
    community.food = 3;
  }

  const scopeLabel = regional.length ? "ระดับแคว้น" : national.length ? "ระดับชาติส่งผลถึงแคว้น" : "ไม่มีเหตุการณ์บันทึก";
  const brief = `ค.ศ. ${year} · ${region} (${key}): ${scopeLabel}` +
    (wars.length ? ` · สงคราม ${wars.length} เรื่อง` : "") +
    (disasters.length ? ` · ภัยพิบัติ ${disasters.length} เรื่อง` : "");

  return { factionStance, factionReason, heatLevel, heatReason, routeStatus, community, brief };
}
