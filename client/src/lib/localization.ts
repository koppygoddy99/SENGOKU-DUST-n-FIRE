// AUTO-GENERATED catalog is the single source of truth for these keys —
// edit client/src/lib/i18n/messages.json and run `pnpm i18n:extract`.
import { uiMessages } from "./i18n/generated/messages";

export type Language = "en" | "th";

export type UiTranslationKey = keyof typeof uiMessages;

export const uiTranslationMap: Record<UiTranslationKey, { en: string; th: string }> = uiMessages;

const gameTextEnglish: Record<string, string> = {
  "แรง อึด แบก ฝ่าอุปสรรค": "Strength, endurance, carrying, and pushing through obstacles",
  "อาวุธ งานช่าง การลงมือแม่น": "Weapons, craft, and precise hands",
  "หลบ ลวง สังเกต อ่านจังหวะ": "Evasion, deception, awareness, and timing",
  "เอกสาร ข่าว แผน และเหตุผล": "Documents, information, planning, and judgment",
  "ยืนหยัด คำสัตย์ และแรงกดดัน": "Resolve, oaths, and standing firm under pressure",
  "พลังกาย": "Strength",
  "ฝีมือ": "Finesse",
  "ไหวพริบ": "Instinct",
  "ปัญญา": "Insight",
  "ใจสู้": "Grit",
  "มือใหม่": "Newcomer",
  "กำลังก้าวหน้า": "Making Progress",
  "เชื่อมือได้": "Dependable",
  "มีฝีมือไร้คนสงสัย": "Proven",
  "มีชื่อเสียง": "Renowned",
  "อาจารย์ที่เชี่ยวชาญ": "Master",
  "ปืนคาบศิลาและคนไซกะ": "Saika Matchlock and Contacts",
  "ปืนคาบศิลาเปียกชื้น": "Damp Matchlock",
  "ผ้าพันแผลชุ่มยา": "Herb-soaked Bandages",
  "ข้าวปั้นตากแห้งกับเต้าเจี้ยว": "Dried Rice Cakes and Miso",
  "จดหมายรับรองของกันทาโร่": "Gantaro's Letter of Protection",
  "งานคุ้มกันและการรบ": "Escort Work and Combat",
  "เอาตัวรอด": "Survival",
  "ต่อรองผลประโยชน์": "Bargaining for Leverage",
  "หนีทางน้ำ": "Escape by Water",
  "ที่ดินและผลผลิต": "Land and Harvest",
  "เครือญาติ": "Kinship",
  "การประชุม": "Council",
  "ผลผลิตและคลอง": "Harvests and Canals",
  "ระดมแรงงาน": "Rallying Labor",
  "รักษาคำมั่น": "Keeping Oaths",
  "อาวุธที่ถนัด": "Favored Weapon",
  "เดินทางและอ่านภัย": "Travel and Threat Sense",
  "บัญชีและเครดิต": "Accounts and Credit",
  "ต่อรองเส้นทาง": "Route Bargaining",
  "อ่านผู้ซื้อ": "Reading Buyers",
  "โลหะและกลไก": "Metal and Mechanisms",
  "ตรวจร่องรอย": "Trace Inspection",
  "จัดหาวัตถุดิบ": "Sourcing Materials",
  "เส้นทางและสัญญาณ": "Routes and Signals",
  "ซ่อนตัว": "Staying Hidden",
  "ข่าวและการอ่านคน": "News and People",
  "ไกล่เกลี่ย": "Mediation",
  "เอกสารและการคัดสำเนา": "Documents and Copies",
  "ดูแลผู้ลี้ภัย": "Refugee Care",
  "พิธีสารและคำสั่ง": "Protocol and Orders",
  "อ่านอารมณ์": "Reading the Room",
  "คุ้มกัน": "Protection",
  "คลังและเสบียง": "Stores and Supplies",
  "จัดคนในเรือน": "Household Management",
  "ป้องกันบ้าน": "Defending the House",
  "ทางน้ำและนำร่อง": "Water Routes and Piloting",
  "คุมลูกเรือ": "Crew Command",
  "ค่าผ่านและคำรับรอง": "Tolls and Guarantees",
  "ตลาดท่าเรือซาไก — เช้าหลังคืนวุ่นวาย": "Sakai Harbor Market — Morning After the Turmoil",
  "กำลังกู้บริบทการค้าท้องถิ่น": "Restoring the Local Trade Context",
  "กำลังกู้ข้อมูลเส้นทาง": "Restoring Route Information",
  "ผู้ค้าในพื้นที่": "Local Sellers",
  "คนส่งสารท่าเรือ": "Harbor Courier",
  "เสมียนอ่านเอกสาร": "Document Clerk",
  "ยาสมุนไพรห่อเล็ก": "Small Bundle of Herbal Medicine",
  "เชือกปอและผ้าหยาบ": "Hemp Rope and Rough Cloth",
  "ข้าวตากและเต้าเจี้ยว": "Dried Rice and Miso",
  "ตรารับรองของบ้าน": "House Seal",
  "บัญชีผลผลิต": "Harvest Ledger",
  "หนังสือผ่านทางเก่า": "Old Travel Pass",
  "บัญชีหนี้ของร้าน": "Merchant Debt Ledger",
  "ผ้าเนื้อดี": "Fine Cloth",
  "เครื่องมือช่าง": "Craftsman's Tools",
  "เชือกสัญญาณ": "Signal Cord",
  "จดหมายรับรองของวัด": "Temple Letter of Protection",
  "คำสั่งปิดผนึก": "Sealed Order",
  "กุญแจคลัง": "Storehouse Key",
  "ใบผ่านทางน้ำ": "Waterway Pass",
  "คำตอบใต้ห้องขัง": "An Answer Beneath the Cell",
  "ค่าจ้างระหว่างทาง": "Pay Along the Road",
  "สินค้าใต้ตรา": "Goods Under Seal",
  "ลำกล้องที่มีรอยบิ่น": "The Chipped Barrel",
  "ข่าวที่ไม่ควรถูกอ่าน": "News That Should Stay Unread",
  "คนที่ขอหลบใต้ชายคา": "Those Seeking Shelter",
  "คลังที่ต้องอยู่ถึงเช้า": "The Storehouse Before Dawn",
  "เรือที่ไม่ควรติดธง": "The Ship Without a Flag",
};

export function resolveUiText(language: Language, key: UiTranslationKey): string {
  return uiTranslationMap[key]?.[language] ?? key;
}

export function label(language: Language, en: string, th: string) {
  return language === "en" ? en : th;
}

export function localized(language: Language, thaiText: string): string {
  return language === "en" ? gameTextEnglish[thaiText] ?? thaiText : thaiText;
}
