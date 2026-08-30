/**
 * Static game data — starter eras/templates, relationship questions, opening profiles.
 * Pure data + tiny deterministic lookups. Depends only on types and engine.
 */
import type { StarterEra, StarterTemplate, ItemKind, InventoryItem, Mastery, StarterOriginSelection } from "./types";
import { normalizeMasteryProgress } from "./engine";

export const STARTER_ERAS: StarterEra[] = [
  { id: "fractured-realm", label: "Fractured Realm · แผ่นดินแตกร้าว", summary: "ชุมชน วัด และบ้านเล็ก ๆ กำลังประคองตัวหลังความแตกแยก", years: [1467, 1477, 1488], templateIds: ["village_scribe", "jizamurai", "warrior_monk", "ronin"] },
  { id: "rival-houses", label: "Rival Houses · บ้านใหญ่ชิงอำนาจ", summary: "ข่าว ด่าน เอกสาร และผู้ค้ำเริ่มมีน้ำหนักพอ ๆ กับคมดาบ", years: [1493, 1507, 1511], templateIds: ["jizamurai", "ronin", "village_scribe", "shinobi"] },
  { id: "rising-warlords", label: "Rising Warlords · ขุนศึกผงาด", summary: "การรวมกำลังระดับแคว้นกดทับชุมชน วัด และผู้รับใช้บ้านใหญ่", years: [1531, 1543, 1548], templateIds: ["jizamurai", "warrior_monk", "shinobi", "daimyo_attendant"] },
  { id: "shifting-frontiers", label: "Shifting Frontiers · พรมแดนที่เปลี่ยน", summary: "งานช่าง ท่าเรือ ข่าว และกำลังเคลื่อนที่เริ่มเปลี่ยนรูปของสงคราม", years: [1549, 1555, 1561], templateIds: ["arms_craftsworker", "sakai_boat_crew", "shinobi", "mounted_samurai", "ronin"] },
  { id: "unification-campaigns", label: "Unification Campaigns · ศึกสู่การรวมแผ่นดิน", summary: "คำสั่ง เสบียง โรงช่าง และการเคลื่อนทัพกดดันทุกคน", years: [1565, 1569, 1575, 1580], templateIds: ["daimyo_attendant", "mounted_samurai", "arms_craftsworker", "sakai_boat_crew", "warrior_monk"] },
  { id: "late-unification", label: "Late Unification · ปลายยุครวมแผ่นดิน", summary: "เครือข่ายเมืองท่า การเดินเรือ และคำสั่งจากบ้านใหญ่ขยายตัว", years: [1583, 1588, 1590, 1595], templateIds: ["daimyo_attendant", "sakai_boat_crew", "coastal_sailor", "arms_craftsworker", "ronin"] },
  { id: "new-order", label: "A New Order · ระเบียบใหม่", summary: "เอกสาร ที่ดิน การเดินทาง และคนหลุดจากสังกัดกำหนดชีวิตในระเบียบใหม่", years: [1600, 1604, 1610, 1615], templateIds: ["daimyo_attendant", "ronin", "village_scribe", "coastal_sailor"] },
];

export function starterEraById(id: string | undefined) {
  return STARTER_ERAS.find((era) => era.id === id) ?? STARTER_ERAS[4];
}

export function starterTemplatesForEra(eraId: string | undefined) {
  const eligible = new Set(starterEraById(eraId).templateIds);
  return STARTER_TEMPLATES.filter((template) => eligible.has(template.id));
}

/** Deterministic campaign-start selection; callers persist the returned id/seed in Local Save. */
export function selectStarterOrigin(eraId: string | undefined, templateId: string, seed: number): StarterOriginSelection {
  const era = starterEraById(eraId);
  const template = templateById(templateId);
  const normalizedSeed = Math.abs(Math.trunc(seed)) || 1;
  const year = era.years[normalizedSeed % era.years.length] ?? era.years[0];
  const region = template.compatibleRegions[normalizedSeed % template.compatibleRegions.length] ?? template.compatibleRegions[0] ?? "Japan";
  const variant = normalizedSeed % 3;
  return {
    id: `${era.id}-${template.id}-${variant + 1}`,
    year,
    region,
    location: template.start,
    origin: variant === 0 ? template.start : variant === 1 ? `${template.start} · เส้นทางงานของครอบครัว` : `${template.start} · คนในชุมชนยังจำชื่อเจ้าได้`,
    age: template.age,
  };
}

export const item = (id: string, label: string, kind: ItemKind, description: string, slots: number, functions: InventoryItem["functions"], bonus?: InventoryItem["bonus"], special?: InventoryItem["special"]): InventoryItem => ({ id, label, kind, description, slots, functions, bonus, special, condition: "usable" });

/** แปลง stance เป็นคะแนนเริ่มต้นสำหรับ FactionReputation (สอดคล้อง worldEvents.stanceFromScore) */
export const mastery = (id: string, label: string, level: number, origin: string, tags: string[]): Mastery => normalizeMasteryProgress({ id, label, level, origin, tags });

export const RELATIONSHIP_QUESTIONS = [
  ["life_before", "ก่อนหน้านี้เจ้ามีชีวิตอย่างไร", ["past", "home", "work"]],
  ["stance", "เจ้ายืนหยัดเพื่ออะไร หรือไม่ยืนหยัดเพื่ออะไรเลย", ["conviction", "refusal", "allegiance"]],
] as const;

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "village_scribe", label: "เสมียนหมู่บ้าน / คนคัดบัญชีชุมชน", short: "คนหนุ่มผู้รู้บัญชีข้าว จดหมาย และความลับที่ทุกบ้านไม่อยากให้หลุด", start: "มิกาวะหรือชินาโนะ", age: 19, pressure: "บัญชีข้าวไม่ตรงกับคำสั่งเกณฑ์ และชื่อในกระดาษอาจทำร้ายทั้งหมู่บ้าน", compatibleRegions: ["Mikawa", "Shinano"],
    attributes: { body: 1, hand: 1, wit: 2, mind: 4, heart: 2 }, social: { rank: 0, honor: 1, influence: 1, information: 2, stain: 0 }, resources: { property: 1, supplies: 2, credit: 1 }, masteries: [mastery("village-ledger", "บัญชีข้าวและแรงงาน", 3, "คัดตัวเลขให้ชุมชน", ["ledger", "rice", "labor"]), mastery("plain-script", "จดหมายและตรารับรอง", 2, "เรียนจากเสมียนเฒ่า", ["document", "letter"]), mastery("village-listening", "ฟังข่าวในชุมชน", 1, "คนส่งข่าวมักพูดต่อหน้าคนเขียน", ["news", "social"])], inventory: [item("village-ledger", "สมุดบัญชีข้าว", "document", "ตัวเลขที่คุ้มครองคนบางคนได้ และมัดมือคนเขียนด้วย", 1, ["unlock", "bonus"], { stat: "mind", value: 1, tags: ["ledger", "rice"] }), item("ink-case", "กล่องหมึกกับตราไม้", "equipment", "เครื่องเขียนเล็ก ๆ สำหรับคัดสำเนาและตรวจรอยแก้", 1, ["bonus"], { stat: "hand", value: 1, tags: ["document", "inspection"] })], mission: { issuer: "ผู้ใหญ่บ้าน", issuerType: "commoner", title: "รายชื่อที่ไม่ควรถูกส่ง", request: "หาทางแก้บัญชีแรงงานก่อนนายกองมารับรายชื่อชายหนุ่ม", pressure: "มีชื่อคนป่วยและลูกหนี้ปะปนอยู่ในกระดาษ", deadline: "ก่อนยามพลบ", reward: "คำค้ำจากชุมชนและเสบียง", risk: "ถูกกล่าวหาว่าปลอมบัญชี", options: ["ตรวจบัญชี", "หาคนแทน", "ต่อรองรายชื่อ"] }
  },
  {
    id: "jizamurai", label: "จิซามูไร / ซามูไรชาวนา", short: "ผู้ถือดาบและผืนนาเล็ก ๆ ที่ต้องรักษาคนของตนโดยไม่ขัดคำสั่งจนพัง", start: "โอมิหรือโอวาริ", age: 20, pressure: "ฤดูเก็บเกี่ยวปะทะการเกณฑ์แรงงาน", compatibleRegions: ["Omi", "Owari"],
    attributes: { body: 3, hand: 2, wit: 1, mind: 2, heart: 2 }, social: { rank: 1, honor: 1, influence: 1, information: 1, stain: 0 }, resources: { property: 2, supplies: 3, credit: 0 }, masteries: [mastery("field-command", "คุมคนในท้องนา", 3, "งานของบ้าน", ["village", "leadership", "labor"]), mastery("spear-drill", "หอกและแนวรบ", 2, "การฝึกตามคำสั่ง", ["fight", "weapon"]), mastery("water-rights", "คลองและผลผลิต", 1, "ดูแลผืนนา", ["rice", "water"])], inventory: [item("field-spear", "หอกไม้ประจำบ้าน", "equipment", "อาวุธที่ใช้ได้ทั้งคุ้มกันบ้านและยืนแนว", 2, ["bonus"], { stat: "body", value: 1, tags: ["fight", "weapon"] }), item("harvest-ledger", "บัญชีผลผลิต", "document", "หลักฐานจำนวนข้าวและแรงงานของหมู่บ้าน", 1, ["unlock"], { stat: "mind", value: 1, tags: ["ledger", "rice"] })], mission: { issuer: "ผู้ใหญ่บ้าน", issuerType: "commoner", title: "คนทำนากับคนถือหอก", request: "กันแรงงานสำคัญไม่ให้ถูกเรียกออกไปก่อนเก็บเกี่ยว", pressure: "นายกองยืนยันคำสั่งเกณฑ์", deadline: "2 วัน", reward: "เสบียงและคำค้ำจากชุมชน", risk: "ขัดคำสั่งต่อหน้าพยาน", options: ["ยื่นบัญชี", "หาคนแทน", "ต่อรองข้าว"] }
  },
  {
    id: "ronin", label: "โรนิน / ผู้ไร้นาย", short: "นักรบหนุ่มที่ยังมีฝีมือ แต่ไม่มีตราบ้าน ผู้ค้ำ หรือรายได้แน่นอน", start: "ยามะชิโระหรือเซตสึ", age: 20, pressure: "ด่านถามว่าเจ้าเป็นคนของใคร", compatibleRegions: ["Yamashiro", "Settsu"],
    attributes: { body: 2, hand: 3, wit: 2, mind: 1, heart: 2 }, social: { rank: 0, honor: 1, influence: 0, information: 1, stain: 1 }, resources: { property: 1, supplies: 2, credit: 0 }, masteries: [mastery("sword-work", "ดาบและระยะประชิด", 3, "อดีตการรับใช้", ["fight", "weapon"]), mastery("road-sense", "อ่านถนนและทางหนี", 2, "ชีวิตบนเส้นทาง", ["travel", "route", "escape"]), mastery("camp-survival", "เอาตัวรอดนอกบ้าน", 1, "ไม่มีหลังคาค้ำ", ["camp", "supply"])], inventory: [item("travel-pass", "หนังสือผ่านทางเก่า", "document", "เอกสารที่ยังพอใช้ต่อรองได้ แต่ถูกตรวจละเอียด", 1, ["unlock"], { stat: "mind", value: 1, tags: ["gate", "travel"] }), item("worn-blade", "ดาบเก่าที่ลับคมเอง", "equipment", "อาวุธมีรอยใช้ แต่ไม่ใช่ตราของบ้านใด", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "weapon"] })], mission: { issuer: "เจ้าของขบวนสินค้า", issuerType: "merchant", title: "ค่าจ้างระหว่างทาง", request: "พาคนส่งสารข้ามด่านก่อนผู้คุมเปลี่ยนเวร", pressure: "เอกสารของผู้ว่าจ้างไม่สมบูรณ์", deadline: "ก่อนด่านปิด", reward: "ค่าจ้างและผู้ค้ำชั่วคราว", risk: "ผู้คุมจดชื่อและอาวุธ", options: ["คุ้มกันตรง", "ลอบผ่าน", "ต่อรองค่าผ่านทาง"] }
  },
  {
    id: "sakai_boat_crew", label: "ลูกน้องคนเรือเมืองซาไก", short: "แรงงานเรือหนุ่มที่รู้กระแสน้ำ ข่าวท่า และหนี้ค่าจ้างมากกว่าราคาสินค้า", start: "ซาไก แคว้นอิซุมิ", age: 19, pressure: "นายเรือหายตัวไปพร้อมค่าแรง ส่วนเรือจะออกเมื่อกระแสน้ำเปลี่ยน", compatibleRegions: ["Sakai", "Izumi", "Settsu"],
    attributes: { body: 2, hand: 2, wit: 3, mind: 1, heart: 2 }, social: { rank: 0, honor: 1, influence: 1, information: 2, stain: 0 }, resources: { property: 1, supplies: 3, credit: 1 }, masteries: [mastery("sakai-waterway", "กระแสน้ำและท่าเรือ", 3, "งานลากเรือและเทียบท่า", ["water", "route", "boat"]), mastery("cargo-handling", "ยกของและผูกสัมภาระ", 2, "งานใต้ท้องเรือ", ["cargo", "body"]), mastery("dock-rumors", "ฟังข่าวท่า", 1, "คนงานได้ยินก่อนคนมีเงิน", ["news", "market"])], inventory: [item("boat-hook", "ขอเกี่ยวเรือและเชือกปอ", "equipment", "ใช้ผูก ลาก และปีนในพื้นที่ท่า", 2, ["bonus"], { stat: "body", value: 1, tags: ["water", "boat"] }), item("dock-token", "ไม้บากค่าจ้าง", "bond", "หลักฐานว่ามีคนติดค่าแรงเจ้าอยู่", 0, ["unlock", "exchange"], { stat: "wit", value: 1, tags: ["dock", "debt"] })], mission: { issuer: "แม่ครัวเรือ", issuerType: "commoner", title: "ค่าแรงใต้ท้องเรือ", request: "ตามหานายเรือหรือหลักฐานค่าแรงก่อนเรือออกจากซาไก", pressure: "คนงานสองกลุ่มเริ่มโทษกันว่าใครเอาเงินไป", deadline: "ก่อนน้ำขึ้น", reward: "ค่าจ้างค้างและทางขึ้นเรือ", risk: "ถูกขับจากท่าหรือมีหนี้กับลูกเรือ", options: ["ถามคนท่า", "ตรวจไม้บาก", "ขึ้นเรือกลางคืน"] }
  },
  {
    id: "arms_craftsworker", label: "ช่างยุทโธปกรณ์ / ช่างปืนไฟ", short: "ช่างหนุ่มที่ถูกต้องการเพราะมือแม่น และถูกจับตาเพราะรู้ว่างานใดไปถึงใคร", start: "คุนิโทโมะหรือคิอิ", age: 20, pressure: "คำสั่งผลิต วัตถุดิบ และร่องรอยงาน", compatibleRegions: ["Omi", "Kii"],
    attributes: { body: 2, hand: 4, wit: 1, mind: 2, heart: 1 }, social: { rank: 0, honor: 1, influence: 1, information: 1, stain: 0 }, resources: { property: 2, supplies: 2, credit: 1 }, masteries: [mastery("metal-and-lock", "โลหะและกลไก", 3, "งานช่าง", ["repair", "metal", "craft"]), mastery("inspection", "ตรวจร่องรอยงาน", 2, "โรงช่าง", ["evidence", "inspection"]), mastery("materials", "จัดหาวัตถุดิบ", 1, "เครือข่ายช่าง", ["market", "materials"])], inventory: [item("tool-roll", "เครื่องมือช่าง", "equipment", "เครื่องมือสำหรับตรวจและซ่อมงานละเอียด", 2, ["bonus"], { stat: "hand", value: 1, tags: ["repair", "craft"] }), item("charcoal-mark", "ตราถ่านโรงช่าง", "bond", "รอยหมายที่พาคนกลับไปถึงโรงช่างเดิมได้", 0, ["unlock"], { stat: "mind", value: 1, tags: ["metal", "workshop"] })], mission: { issuer: "หัวหน้าโรงช่าง", issuerType: "samurai", title: "ลำกล้องที่มีรอยบิ่น", request: "ตรวจอาวุธที่ถูกกล่าวหาว่าถูกส่งให้คนผิดฝ่าย", pressure: "ผู้คุมคลังต้องการชื่อผู้รับผิด", deadline: "ภายในคืนนี้", reward: "วัสดุและสิทธิ์ใช้โรงช่าง", risk: "ชื่อถูกโยงกับการผลิต", options: ["ตรวจของ", "แก้รอย", "เปิดบัญชีคลัง"] }
  },
  {
    id: "shinobi", label: "สายลับชิโนบิ / ผู้สืบข่าว", short: "คนทำงานเงียบที่ใช้การสังเกต การปลอมตัว และทางหนี มากกว่าตำนานนักฆ่า", start: "อิกะหรือโคงะ", age: 19, pressure: "ข่าวที่ถืออยู่ช่วยคนหนึ่งกลุ่ม และทำร้ายอีกกลุ่ม", compatibleRegions: ["Iga", "Koga"],
    attributes: { body: 1, hand: 2, wit: 4, mind: 2, heart: 1 }, social: { rank: 0, honor: 1, influence: 0, information: 2, stain: 1 }, resources: { property: 1, supplies: 2, credit: 1 }, masteries: [mastery("surveillance", "เฝ้าดูและอ่านช่องว่าง", 3, "งานสืบข่าว", ["hide", "watch", "secret"]), mastery("disguise", "ปลอมตัวและผ่านคน", 2, "ทางเล็กของอิกะ", ["social", "wit", "travel"]), mastery("signals", "สัญญาณและจุดนัด", 1, "เครือข่ายคนส่งข่าว", ["network", "route"])], inventory: [item("signal-cord", "เชือกสัญญาณถัก", "bond", "ใช้ยืนยันจุดนัดและคนในเครือข่ายบางส่วน", 0, ["unlock"], { stat: "wit", value: 1, tags: ["network", "route"] }), item("plain-cloak", "เสื้อคลุมไร้ตรา", "equipment", "เสื้อเดินทางที่ไม่บอกว่าเป็นคนของใคร", 1, ["bonus"], { stat: "wit", value: 1, tags: ["hide", "travel"] })], mission: { issuer: "คนส่งสารของหมู่บ้าน", issuerType: "commoner", title: "ข่าวที่ไม่ควรถูกอ่าน", request: "นำข่าวผ่านด่านโดยไม่ให้ผู้คุมยึดเอกสาร", pressure: "คำสั่งในข่าวอาจทำร้ายชุมชน", deadline: "ก่อนรุ่งเช้า", reward: "ข่าวและทางลัด", risk: "ถูกสงสัยว่าเป็นสาย", options: ["ลอบผ่าน", "ใช้คนกลาง", "ทำสำเนา"] }
  },
  {
    id: "warrior_monk", label: "พระนักรบ", short: "นักบวชติดอาวุธที่รักษาทางวัด คนพักพิง และของที่ไม่ควรถูกยึดง่าย ๆ", start: "คากะ ยามาโตะ หรือคิอิ", age: 20, pressure: "ผู้ลี้ภัยขอที่พัก ขณะที่คนถืออำนาจขอรายชื่อ", compatibleRegions: ["Kaga", "Yamato", "Kii"],
    attributes: { body: 3, hand: 2, wit: 1, mind: 2, heart: 3 }, social: { rank: 0, honor: 2, influence: 1, information: 1, stain: 0 }, resources: { property: 1, supplies: 3, credit: 0 }, masteries: [mastery("naginata-guard", "ง้าวและการคุ้มกัน", 3, "ยามทางวัด", ["fight", "weapon", "protect"]), mastery("temple-routes", "ทางวัดและที่พักพิง", 2, "การเดินทางของศาสนสถาน", ["temple", "shelter", "travel"]), mastery("vows", "คำสัตย์และการไกล่เกลี่ย", 1, "หน้าที่ต่อผู้ขอพึ่ง", ["oath", "talk"])], inventory: [item("temple-letter", "จดหมายรับรองของวัด", "document", "เอกสารขอที่พักพิงและเปิดการเจรจา", 1, ["unlock", "bonus"], { stat: "heart", value: 1, tags: ["temple", "request"] }), item("travel-naginata", "ง้าวเดินทาง", "equipment", "อาวุธที่เห็นได้ชัดว่าใช้คุ้มกัน ไม่ใช่ซ่อนตัว", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "protect"] })], mission: { issuer: "ผู้ดูแลวัด", issuerType: "temple", title: "คนที่ขอหลบใต้ชายคา", request: "หาทางให้ครอบครัวผู้ลี้ภัยผ่านด่านโดยไม่ทำให้วัดถูกกล่าวหาว่าเลือกข้าง", pressure: "ผู้คุมขอรายชื่อคนพัก", deadline: "ภายในวัน", reward: "ที่พักและข่าวจากวัด", risk: "วัดมีหนี้หรือถูกจับตา", options: ["ไกล่เกลี่ย", "ยื่นจดหมาย", "พาออกทางน้ำ"] }
  },
  {
    id: "daimyo_attendant", label: "คนรับใช้บ้านไดเมียว / ผู้ถือคำสั่ง", short: "ผู้ช่วยหนุ่มในบ้านใหญ่ที่เข้าถึงเอกสารได้บ้าง แต่ยังไม่มีอำนาจพอจะปฏิเสธคำสั่ง", start: "อะซุจิ แคว้นโอมิ", age: 19, pressure: "คำสั่งเร็วและความหวาดระแวงในบ้านใหญ่", compatibleRegions: ["Omi"],
    attributes: { body: 1, hand: 2, wit: 2, mind: 3, heart: 2 }, social: { rank: 1, honor: 1, influence: 1, information: 1, stain: 0 }, resources: { property: 2, supplies: 2, credit: 1 }, masteries: [mastery("orders-and-seals", "คำสั่งและตราปิดผนึก", 3, "งานรับใช้บ้านใหญ่", ["document", "authority"]), mastery("room-reading", "อ่านอารมณ์ในห้องสั่งการ", 2, "งานเฝ้าประตู", ["social", "wit"]), mastery("escort", "คุ้มกันระยะใกล้", 1, "หน้าที่คนถือของ", ["protect", "fight"])], inventory: [item("sealed-order", "คำสั่งปิดผนึก", "document", "คำสั่งที่เปิดประตูได้ แต่ไม่ควรถูกอ่านต่อหน้าคนผิด", 1, ["unlock", "bonus"], { stat: "mind", value: 1, tags: ["order", "authority"] }, { mode: "auto_pass", tags: ["order", "authority", "คำสั่ง", "ตรา", "ด่าน", "ผู้คุม", "ผ่าน"], reason: "คำสั่งปิดผนึกแท้เปิดทางตามขอบเขตของเอกสาร" }), item("house-badge", "ป้ายผ้าของบ้าน", "status", "สวมแล้วผ่านบางประตูได้ แต่ทำให้คนรู้ว่าเจ้าอยู่ฝ่ายใด", 0, ["unlock"], { stat: "heart", value: 1, tags: ["house", "authority"] })], mission: { issuer: "เสมียนของบ้าน", issuerType: "ruler", title: "คำสั่งที่มาถึงเร็วเกินไป", request: "นำคำสั่งไปถึงผู้รับโดยไม่ทำให้ข่าวรั่ว", pressure: "คนในบ้านกำลังจับตาว่าคำสั่งเกี่ยวกับใคร", deadline: "ก่อนประชุม", reward: "คำรับรองและสิทธิ์เข้าถึง", risk: "ถูกโยงกับการกวาดล้าง", options: ["ส่งตรง", "ใช้คนกลาง", "อ่านอารมณ์ผู้รับ"] }
  },
  {
    id: "mounted_samurai", label: "นักรบม้าซามูไร / นายกองทหารม้า", short: "นักรบหนุ่มที่นำคนไม่กี่คนได้ในสนาม แต่ยังต้องพิสูจน์ว่าคำสั่งของตนคุ้มกับชีวิตผู้ใต้บังคับ", start: "มุซาชิหรือชินาโนะ", age: 20, pressure: "ม้าหายหนึ่งตัว และคำสั่งลาดตระเวนจะกลายเป็นความผิดของนายกอง", compatibleRegions: ["Musashi", "Shinano"],
    attributes: { body: 3, hand: 3, wit: 2, mind: 1, heart: 1 }, social: { rank: 1, honor: 1, influence: 0, information: 1, stain: 0 }, resources: { property: 2, supplies: 3, credit: 0 }, masteries: [mastery("horse-and-bow", "ขี่ม้าและธนู", 3, "การฝึกทหารม้า", ["ride", "fight", "weapon"]), mastery("mounted-command", "นำกำลังขนาดเล็ก", 2, "หน้าที่นายกอง", ["leadership", "fight"]), mastery("field-reading", "อ่านพื้นสนาม", 1, "ลาดตระเวน", ["route", "wit"])], inventory: [item("riding-bow", "ธนูคันสั้นกับปลอกลูก", "equipment", "อาวุธที่ใช้ได้บนหลังม้าและในระยะเปิด", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "ride"] }), item("horse-tether", "เชือกบังเหียนสำรอง", "reserve", "ของชิ้นเล็กที่ช่วยแก้ปัญหาม้าหรือค่ายชั่วคราว", 1, ["bonus"], { stat: "body", value: 1, tags: ["ride", "camp"] })], mission: { issuer: "นายกองอาวุโส", issuerType: "samurai", title: "รอยกีบที่หายไป", request: "ตามหาม้ากับทหารลาดตระเวนที่ไม่กลับมาตามกำหนด", pressure: "คำสั่งห้ามเคลื่อนกำลังเกินจำเป็น แต่ข่าวลือเริ่มวิ่งเร็ว", deadline: "ก่อนมืด", reward: "ความเชื่อมือของกองและสิทธิ์เลือกม้า", risk: "ถูกกล่าวหาว่าพาคนออกนอกคำสั่ง", options: ["ตามรอยกีบ", "ถามค่าย", "แยกหน่วยลาดตระเวน"] }
  },
  {
    id: "coastal_sailor", label: "คนเดินเรือชายฝั่ง / นายท้ายเรือหนุ่ม", short: "คนเรือที่อ่านลม คลื่น และนิสัยคนบนท่าได้ แต่ยังไม่ได้เป็นเจ้าของเรือของตน", start: "อิโยะหรือชิมะ", age: 19, pressure: "เรือสองฝ่ายอ้างสิทธิ์ในช่องแคบ ขณะที่ผู้โดยสารไม่ควรถูกเห็น", compatibleRegions: ["Iyo", "Shima"],
    attributes: { body: 2, hand: 2, wit: 3, mind: 2, heart: 1 }, social: { rank: 0, honor: 1, influence: 1, information: 2, stain: 0 }, resources: { property: 1, supplies: 3, credit: 1 }, masteries: [mastery("coastal-pilot", "นำร่องชายฝั่ง", 3, "งานเรือ", ["water", "route", "boat"]), mastery("crew-bonds", "อ่านใจลูกเรือ", 2, "อยู่ในเรือลำเดียวกัน", ["crew", "social"]), mastery("tide-bargain", "ค่าผ่านและคำรับรอง", 1, "ท่าเรือ", ["negotiation", "passage"])], inventory: [item("water-pass", "ใบผ่านทางน้ำเก่า", "document", "คำรับรองพื้นที่ที่ใช้ได้กับบางจุดเท่านั้น", 1, ["unlock", "bonus"], { stat: "wit", value: 1, tags: ["water", "passage"] }), item("pilot-rope", "เชือกนำร่อง", "equipment", "เชือกชุบน้ำเกลือที่ใช้วัดน้ำตื้นและผูกเรือ", 1, ["bonus"], { stat: "wit", value: 1, tags: ["water", "route"] })], mission: { issuer: "นายท้ายผู้เฒ่า", issuerType: "merchant", title: "เรือที่ไม่ควรติดธง", request: "พาสินค้าและคนผ่านทางน้ำโดยไม่จ่ายค่าคุ้มกันซ้ำ", pressure: "เรือสองฝ่ายอ้างสิทธิ์ในช่องแคบ", deadline: "ก่อนกระแสน้ำเปลี่ยน", reward: "เส้นทางน้ำและเครดิตท่าเรือ", risk: "หนี้กับคนเรือหรือศัตรูจำเรือ", options: ["ต่อรอง", "ใช้ทางน้ำแคบ", "แลกข่าว"] }
  },
];

export function templateById(id: string) {
  return STARTER_TEMPLATES.find((template) => template.id === id) ?? STARTER_TEMPLATES[2];
}

type OpeningProfile = { title: string; background: string; turn: string };

export const STARTER_OPENING_PROFILES: Record<string, readonly OpeningProfile[]> = {
  village_scribe: [
    { title: "บัญชีที่มีชื่อเกินมา", background: "กระดาษแรงงานที่เจ้าคัดลอกมาตลอดคืนมีชื่อซ้ำอยู่หนึ่งบรรทัด และคนที่ขอให้เจ้าเงียบก็ยืนรออยู่ใกล้ยุ้งข้าว", turn: "หากเจ้าปล่อยให้หมึกแห้งตามเดิม คนหนึ่งอาจถูกเรียกไปแทนอีกคน; หากขีดแก้ ทุกคนจะรู้ว่าเจ้าจับมือกับความลับ" },
    { title: "ตราไม้ใต้เสื่อเก่า", background: "หญิงชราคนหนึ่งนำตราไม้เก่ามาฝากไว้โดยไม่เรียกชื่อเจ้าต่อหน้าคนอื่น พร้อมขอให้ค้นหาว่าใครกำลังใช้สำเนาเอกสารกดชุมชน", turn: "เจ้าต้องเลือกว่าจะปกป้องหลักฐานไว้เงียบ ๆ หรือเปิดมันต่อหน้าผู้ที่มีอำนาจอ่านบัญชีได้มากกว่าเจ้า" },
    { title: "ข่าวที่เขียนไม่ครบ", background: "จดหมายที่มาถึงชุมชนถูกตัดข้อความช่วงสำคัญออกไป เหลือเพียงคำสั่งที่อ่านได้สองความหมายและความกลัวของคนที่จะต้องทำตาม", turn: "งานของเจ้าไม่ใช่แค่คัดตัวอักษร แต่ต้องหาว่าช่องว่างนั้นถูกทิ้งไว้เพื่อคุ้มครองใครหรือทำร้ายใคร" },
  ],
  jizamurai: [
    { title: "หอกข้างคันนา", background: "คนในบ้านเริ่มลับหอกแทนเตรียมเมล็ดข้าว เมื่อข่าวการเกณฑ์แรงงานเดินมาถึงเร็วกว่าที่ผู้ใหญ่บ้านคาด", turn: "เจ้าต้องรักษาคนทำนาและศักดิ์ศรีของบ้านโดยไม่เปลี่ยนความกังวลของพวกเขาให้กลายเป็นการปะทะที่ไม่มีทางกลับ" },
    { title: "สัญญาข้าวสองฉบับ", background: "สัญญาส่งข้าวสองแผ่นให้จำนวนไม่ตรงกัน และทั้งสองฝ่ายต่างยืนยันว่าถือฉบับจริงอยู่ในมือ", turn: "หากเจ้าตัดสินผิด บ้านของตนอาจเสียเสบียง; หากหนีปัญหา คนที่อ่อนแอกว่าจะเป็นคนจ่ายราคา" },
    { title: "รอยเท้าที่แนวคัน", background: "ก่อนฟ้าสาง มีรอยเท้าหลายคู่ข้ามคันนาของบ้านเจ้าไปโดยไม่มีใครกล้าพูดว่าเห็นใคร", turn: "ผู้คนรอให้เจ้าตัดสินว่าจะเรียกคนถือหอกออกตามรอย หรือเก็บเรื่องไว้จนรู้ว่าการตามหาอาจลากบ้านเข้าสู่ข้อกล่าวหา" },
  ],
  ronin: [
    { title: "ชื่อในสมุดด่าน", background: "ผู้คุมด่านพลิกสมุดรายชื่อช้าเกินจำเป็น แล้วถามว่าเหตุใดผู้ไร้นายจึงเดินทางพร้อมจดหมายที่ไม่ใช่ของตน", turn: "เจ้าต้องพาคนส่งสารไปให้ถึงโดยไม่ยอมให้ชื่อของตนกลายเป็นข้ออ้างให้ใครกักตัวคนทั้งขบวน" },
    { title: "ค่าจ้างที่ไม่มีผู้ค้ำ", background: "นายจ้างพูดถึงค่าจ้างก้อนหนึ่งแต่ไม่ยอมวางผู้ค้ำ ขณะคนส่งสารเริ่มสงสัยว่าเส้นทางนี้ถูกเลือกเพราะไม่มีใครอยากรับผิด", turn: "เจ้าต้องตัดสินใจว่าจะรับงานด้วยศักดิ์ศรีของตนเอง หาหลักฐานเพิ่ม หรือยอมเสียรายได้เพื่อไม่ถูกใช้เป็นแพะ" },
    { title: "ดาบเก่ากับคำถามใหม่", background: "คนแปลกหน้าจำรอยซ่อมบนดาบของเจ้าได้และขอคุยใต้ชายคา โดยย้ำว่าไม่ต้องการเงินแต่ต้องการให้เจ้าทำบางอย่างก่อนด่านปิด", turn: "ทุกคำตอบอาจเปิดทางให้เจ้า หรือผูกชื่อของเจ้าเข้ากับเรื่องที่เจ้ามิได้เริ่ม" },
  ],
  sakai_boat_crew: [
    { title: "ไม้บากค่าจ้าง", background: "ไม้บากค่าจ้างของคนงานหายไปหนึ่งอันในคืนที่นายเรือไม่กลับมา และทุกคนรู้ว่าหากน้ำขึ้นก่อนหาหลักฐานพบ เรือจะออกโดยทิ้งคนที่ไม่มีเสียง", turn: "เจ้าต้องอ่านร่องรอยในท่าให้ทันก่อนความแค้นระหว่างลูกเรือกลายเป็นเหตุให้คนผิดตัวรับโทษ" },
    { title: "ลังสินค้าที่ไม่ควรเปิด", background: "ลังไม้ใต้ท้องเรือถูกผูกเชือกใหม่ทั้งที่ไม่มีใครรับว่าแตะต้องมัน และคนงานผู้เห็นเหตุการณ์ขอให้เจ้าอย่าพูดชื่อเขา", turn: "เจ้าอาจตรวจสินค้า หาทางถามโดยไม่เปิดเผยพยาน หรือปล่อยให้เรือออกพร้อมความเสี่ยงที่ไม่มีใครอยากถือ" },
    { title: "เรือออกก่อนคำตอบ", background: "กัปตันชั่วคราวประกาศให้เรือออกตามน้ำขึ้นโดยไม่รอค่าจ้างที่ค้างอยู่ ขณะเพื่อนคนงานเริ่มรวบคนจะขวางท่า", turn: "เจ้าต้องเลือกระหว่างรักษางาน คุ้มครองคนของตน หรือหาหลักฐานที่เปลี่ยนข้อพิพาทให้กลายเป็นการเจรจา" },
  ],
  arms_craftsworker: [
    { title: "ลำกล้องที่ไม่ตรงบัญชี", background: "จำนวนงานที่ส่งออกจากโรงช่างไม่ตรงกับรอยถ่านบนลัง และหัวหน้าโรงช่างให้เจ้าตรวจมันก่อนชื่อของคนงานคนใดจะถูกเขียนลงรายงาน", turn: "มือของเจ้ารู้ว่าความผิดพลาดอาจเป็นเพียงงานรีบเร่งหรือการปกปิดที่ทำให้ทั้งโรงช่างถูกจับตา" },
    { title: "เหล็กที่มาถึงช้า", background: "วัตถุดิบก้อนหนึ่งมาถึงช้ากว่ากำหนดพร้อมผู้คุมที่ยืนยันว่าเส้นทางไม่มีปัญหา แต่รอยคราบบนหีบเล่าเรื่องอีกแบบ", turn: "เจ้าต้องพิสูจน์สิ่งที่เห็นโดยไม่กล่าวหาใครก่อนมีหลักฐาน มิฉะนั้นชื่อของช่างหนุ่มอาจถูกใช้กลบความผิดของผู้มีอำนาจกว่า" },
    { title: "คำสั่งซ่อมในยามมืด", background: "หลังโรงช่างปิด มีคนทิ้งงานซ่อมไว้โดยไม่มีตรารับรอง พร้อมสัญญาว่าจะตอบแทนหากเจ้าไม่บันทึกงานนั้น", turn: "เจ้าต้องตัดสินใจว่าจะยึดกติกาโรงช่าง ตรวจหาต้นทาง หรือยอมให้ฝีมือตนพาไปใกล้เรื่องที่ไม่ควรอยู่ในมือคนเดียว" },
  ],
  shinobi: [
    { title: "สัญญาณที่จุดนัด", background: "เชือกสัญญาณที่จุดนัดถูกผูกผิดแบบเล็กน้อย—ผิดพอให้รู้ว่าคนส่งข่าวอาจถูกเฝ้าดู แต่ไม่พอให้บอกได้ว่าใครอยู่หลังเงา", turn: "เจ้าอาจเลิกนัด เปลี่ยนทาง หรือเสี่ยงเข้าไปฟังโดยรู้ว่าความเงียบของตนเองอาจถูกใช้เป็นกับดัก" },
    { title: "ข่าวที่มีคนอ่านแล้ว", background: "เอกสารในมือยังปิดผนึกอยู่ แต่รอยพับและกลิ่นควันบอกว่ามีคนเปิดอ่านก่อนถึงเจ้า", turn: "หากส่งต่อ เจ้ากำลังส่งข้อมูลที่อาจถูกบิด; หากหยุดไว้ คนรอข่าวอาจตกอยู่ในอันตรายจากความล่าช้า" },
    { title: "เสื้อคลุมไร้ตรา", background: "ผู้เฝ้าทางจำท่าทางของเจ้าได้แม้ไม่รู้ชื่อ และเริ่มถามคนแถวทางผ่านถึงผู้เดินทางที่ไม่มีตราบ้าน", turn: "เจ้าต้องปกป้องเส้นทางข่าวโดยไม่ทำให้คนธรรมดาที่ตอบคำถามแทนเจ้าเป็นผู้รับผลของความสงสัย" },
  ],
  warrior_monk: [
    { title: "ชายคาที่รับคนเกินมา", background: "คนหลบภัยมาถึงประตูวัดมากกว่าที่เสบียงจะรองรับ และผู้ถืออำนาจต้องการรายชื่อก่อนอนุญาตให้ทุกคนพักต่อ", turn: "เจ้าต้องปกป้องคนที่พึ่งชายคาโดยไม่ให้วัดกลายเป็นที่ซ่อนความจริงหรือเป้าของคำกล่าวหา" },
    { title: "จดหมายขอผ่านทาง", background: "จดหมายรับรองของวัดมีตราถูกต้องแต่ผู้คุมอ่านถ้อยคำแล้วบอกว่ามันไม่พอสำหรับผู้เดินทางจำนวนนี้", turn: "เจ้าต้องใช้ความสัตย์ การเจรจา หรือทางเลือกอื่นที่ไม่ยอมให้ผู้ที่ไร้อำนาจถูกแยกออกเพียงเพราะไม่มีผู้ค้ำ" },
    { title: "ของที่ถูกฝากไว้", background: "มีคนนำห่อผ้าปิดผนึกมาฝากใต้แท่นบูชา พร้อมขอให้เจ้าเก็บมันให้พ้นมือผู้ตรวจ แต่ไม่ยอมบอกว่าข้างในคืออะไร", turn: "การรับฝากอาจรักษาคำขอของคนเดือดร้อน หรือทำให้ความไว้ใจของวัดถูกใช้เป็นที่กำบัง" },
  ],
  daimyo_attendant: [
    { title: "คำสั่งที่มาถึงเร็วเกินไป", background: "คำสั่งปิดผนึกมาถึงมือเจ้าก่อนผู้รับจะได้รับข่าวล่วงหน้า และสายตาในเรือนเอกสารทุกคู่กำลังชั่งว่าเจ้ารู้อะไรมากกว่าที่ควร", turn: "เจ้าต้องส่งให้ถึงมือผู้รับโดยไม่เปิดทางให้ข่าวรั่วหรือให้ความเงียบของตนถูกตีความเป็นการเลือกข้าง" },
    { title: "ตราที่ไม่ควรอยู่ตรงนี้", background: "ตราประทับบนเอกสารสำเนาหนึ่งแผ่นถูกวางผิดที่เพียงเล็กน้อย แต่พอให้เจ้ารู้ว่ามีคนเร่งงานหรือกำลังวางกับดัก", turn: "หากรายงานโดยไร้หลักฐาน เจ้าจะกล่าวหาเกินฐานะ; หากนิ่งเฉย คำสั่งผิดฉบับอาจไปถึงคนที่รับผลแทน" },
    { title: "ประตูที่ปิดก่อนประชุม", background: "ก่อนการประชุม ประตูด้านในถูกสั่งปิดและคนถือเอกสารหลายคนถูกกันไว้ภายนอกโดยไม่มีคำอธิบาย", turn: "เจ้าอยู่ใกล้พอจะเห็นความผิดปกติ แต่ยังต่ำต้อยพอที่คำถามผิดจังหวะจะทำให้เจ้ากลายเป็นผู้ต้องสงสัย" },
  ],
  mounted_samurai: [
    { title: "รอยกีบที่หายไป", background: "ม้าหนึ่งตัวกับคนลาดตระเวนหนึ่งคนไม่กลับมาตามเวลา ขณะคำสั่งเดิมห้ามเคลื่อนกำลังเกินจำเป็น", turn: "เจ้าต้องเลือกว่าจะเชื่อรอยบนดิน ใช้คนจำนวนน้อยตามหา หรือยอมรอจนความรับผิดชอบกลายเป็นของเจ้าเต็มตัว" },
    { title: "ธนูที่วางผิดคอก", background: "ธนูสำรองของหน่วยถูกพบในคอกม้าที่ไม่มีใครใช้ และทหารหนุ่มผู้เห็นมันก่อนทุกคนเริ่มกลัวว่าจะถูกโยนความผิด", turn: "ในฐานะนายกอง เจ้าต้องหาความจริงโดยไม่ทำให้คำสั่งของตนกลายเป็นแรงกดทับคนที่อยู่ใต้คำสั่ง" },
    { title: "ทางลาดตระเวนสองเส้น", background: "รายงานจากชาวบ้านพูดถึงเสียงม้าในสองทิศทาง แต่มีกำลังพอให้ตรวจเพียงทางเดียวก่อนมืด", turn: "การเลือกของเจ้าอาจรักษาความปลอดภัยของหน่วย หรือทิ้งคนบางกลุ่มไว้กับข่าวลือที่ไม่มีใครกล้ารับรอง" },
  ],
  coastal_sailor: [
    { title: "ช่องแคบที่มีสองคำอ้าง", background: "เรือสองลำอ้างสิทธิ์ใช้ช่องแคบเดียวกันในช่วงน้ำเปลี่ยน และผู้โดยสารที่เจ้าพาไปไม่ควรถูกเห็นโดยคนทั้งท่า", turn: "เจ้าต้องอ่านกระแสน้ำและอ่านคนให้ทัน โดยไม่เปลี่ยนการผ่านทางธรรมดาให้กลายเป็นเรื่องที่ทุกฝ่ายต้องรักษาหน้า" },
    { title: "ใบผ่านทางน้ำเก่า", background: "ใบผ่านทางในมือเจ้าเคยใช้ได้ แต่คนเฝ้าท่าเพิ่งประกาศว่าจะตรวจเอกสารทุกฉบับละเอียดกว่าปกติ", turn: "เจ้าอาจเสี่ยงใช้สิทธิ์เดิม ต่อรองกับข่าวที่ตนมี หรือเปลี่ยนเส้นทางโดยไม่ให้ผู้โดยสารกลายเป็นผู้รับผิด" },
    { title: "เชือกนำร่องขาดกลางคืน", background: "เชือกนำร่องถูกพบว่าขาดก่อนออกเรือเพียงไม่นาน และทุกคนต่างชี้ว่าเป็นความสะเพร่าของคนอีกฝ่าย", turn: "การหาคนผิดอาจง่ายกว่าการรักษาลูกเรือให้ทำงานร่วมกัน แต่ความผิดพลาดครั้งต่อไปจะเกิดบนผืนน้ำ ไม่ใช่บนท่า" },
  ],
};
