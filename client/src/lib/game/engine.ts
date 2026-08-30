/**
 * Game engine — pure functions and scalar constants.
 *
 * These functions never read or mutate GameState; they only compute values from
 * primitives (numbers, Mastery entries). Keeping them isolated makes the rules
 * a testable seam that every higher layer (state, missions, UI) can rely on.
 */
import type { Difficulty, Mastery, StatId, StatXp } from "./types";

export const MAX_MASTERY_LEVEL = 5;
export const MASTERY_PROGRESS_PER_LEVEL = 5;
export const MIN_STAT_VALUE = 1;
export const MAX_STAT_VALUE = 10;
export const VITAL_CAP = 10;

export function normalizeStatValue(value: number) {
  return Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, Math.round(value)));
}

export function traitValueForRoll(value: number) {
  return normalizeStatValue(value);
}

export function traitProgressNeededForLevel(value: number) {
  const normalized = normalizeStatValue(value);
  if (normalized >= MAX_STAT_VALUE) return 0;
  if (normalized <= 3) return 3;
  if (normalized <= 6) return 4;
  if (normalized <= 8) return 5;
  return 6;
}

export function statXpNeededForValue(value: number) {
  return traitProgressNeededForLevel(value);
}

export function defaultStatXp(): StatXp {
  return { body: { xp: 0, totalXp: 0 }, hand: { xp: 0, totalXp: 0 }, wit: { xp: 0, totalXp: 0 }, mind: { xp: 0, totalXp: 0 }, heart: { xp: 0, totalXp: 0 } };
}

export function traitLevelDetails(level: number) {
  const normalized = normalizeStatValue(level);
  const levels = [
    { en: "Unseasoned", th: "ยังไม่ผ่านมือ", note: "เพิ่งเริ่มเห็นว่าตนรับมือเรื่องนี้ได้อย่างไร" },
    { en: "Grounded", th: "ตั้งหลักได้", note: "มีพื้นฐานพอจะลงมือในสถานการณ์ที่คุ้นเคย" },
    { en: "Capable", th: "ทำได้จริง", note: "เริ่มเป็นกำลังที่พึ่งพาได้ในเรื่องทั่วไป" },
    { en: "Honed", th: "ผ่านมือ", note: "Milestone แรก: วิธีของตัวละครเริ่มชัด" },
    { en: "Seasoned", th: "ช่ำชอง", note: "รับมือแรงกดดันโดยไม่เสียจังหวะง่าย" },
    { en: "Proven", th: "ผ่านบทพิสูจน์", note: "มีร่องรอยจากงานจริงรองรับฝีมือ" },
    { en: "Remarkable", th: "โดดเด่น", note: "Milestone สอง: คนรอบตัวเริ่มมองเห็นความต่าง" },
    { en: "Renowned", th: "มีชื่อ", note: "ชื่อเสียงในสายงานเริ่มนำหน้าตัวละคร" },
    { en: "Exceptional", th: "หาได้ยาก", note: "ทำสิ่งที่คนทั่วไปต้องพึ่งการเตรียมตัวมากกว่านี้" },
    { en: "Signature", th: "ลายมือของตน", note: "Milestone สุดท้าย: เป็นจุดสูงสุดของ Trait นี้" },
  ] as const;
  return levels[normalized - 1];
}

export function canonicalDifficulty(value: number): Difficulty {
  if (value <= 10) return 8;
  if (value <= 14) return 12;
  if (value <= 18) return 16;
  if (value <= 22) return 20;
  if (value <= 26) return 24;
  if (value <= 30) return 28;
  return 32;
}

export function xpNeededForMasteryLevel(level: number) {
  return level >= MAX_MASTERY_LEVEL ? 0 : MASTERY_PROGRESS_PER_LEVEL;
}

export function masteryBonusForLevel(level: number) {
  return Math.max(0, Math.min(MAX_MASTERY_LEVEL, Math.round(level)));
}

export function masteryLevelDetails(level: number) {
  const normalized = masteryBonusForLevel(level);
  const levels = [
    { id: "untrained", en: "Untrained", th: "ยังไม่ชำนาญ", bonus: 0, note: "ทำได้ด้วยเหตุผลในเรื่อง แต่ไม่มีการฝึกเฉพาะทาง" },
    { id: "familiar", en: "Familiar", th: "คุ้นมือ", bonus: 1, note: "เริ่มทำสิ่งนี้ได้เป็นระบบ" },
    { id: "skilled", en: "Skilled", th: "ชำนาญ", bonus: 2, note: "เป็นคนที่ทีมพึ่งพาได้ในงานนี้" },
    { id: "expert", en: "Expert", th: "เชี่ยวชาญ", bonus: 3, note: "รับมือกับความกดดันและงานยากได้" },
    { id: "master", en: "Master", th: "อาจารย์", bonus: 4, note: "ความเชี่ยวชาญหายาก มีชื่อในสายงานนั้น" },
    { id: "peerless", en: "Peerless", th: "หาตัวจับไม่ได้", bonus: 5, note: "ในแผ่นดินหาคนฝีมือใกล้กันแทบไม่ได้" },
  ] as const;
  return levels[normalized];
}

function levelForLegacyMastery(entry: Mastery) {
  if (typeof entry.level === "number") return masteryBonusForLevel(entry.level);
  const legacyRank = entry.rank ?? 0;
  if (legacyRank >= 17) return 5;
  if (legacyRank >= 13) return 4;
  if (legacyRank >= 9) return 3;
  if (legacyRank >= 5) return 2;
  return legacyRank > 0 ? 1 : 0;
}

export function normalizeMasteryProgress(entry: Mastery, legacy = false): Mastery {
  const level = legacy ? levelForLegacyMastery(entry) : masteryBonusForLevel(entry.level);
  return { ...entry, rank: level, level, xp: level >= MAX_MASTERY_LEVEL ? 0 : Math.max(0, Math.min(entry.xp ?? 0, xpNeededForMasteryLevel(level) - 1)), totalXp: Math.max(0, entry.totalXp ?? 0) };
}

export const STATS: { id: StatId; en: string; th: string; hint: string }[] = [
  { id: "body", en: "strength", th: "พลังกาย", hint: "แรง อึด แบก ฝ่าอุปสรรค" },
  { id: "hand", en: "Finesse", th: "ฝีมือ", hint: "อาวุธ งานช่าง การลงมือแม่น" },
  { id: "wit", en: "Instinct", th: "ไหวพริบ", hint: "หลบ ลวง สังเกต อ่านจังหวะ" },
  { id: "mind", en: "Insight", th: "ปัญญา", hint: "เอกสาร ข่าว แผน และเหตุผล" },
  { id: "heart", en: "Grit", th: "ใจสู้", hint: "ยืนหยัด คำสัตย์ และแรงกดดัน" },
];

