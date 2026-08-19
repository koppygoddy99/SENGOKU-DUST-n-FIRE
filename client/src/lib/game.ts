/**
 * Dust & Fire game-state contract.
 * Ledger of Ash reminder: the player sees consequences, sources, and choices—not hidden intent.
 */

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";
export type AxisId = "body" | "hand" | "wit" | "mind" | "heart";
export type Outcome = "decisive_success" | "success_with_cost" | "partial_success" | "failure_with_consequence";
export type MissionState = "offered" | "active" | "resolved" | "failed";
export type ItemKind = "immediate" | "reserve" | "equipment" | "document" | "status" | "bond";
export type MemoryKind = "news" | "witness" | "debt" | "favor" | "oath" | "stain" | "injury" | "market_change" | "community_change" | "actor_relation";

export const AXES: { id: AxisId; en: string; th: string; hint: string }[] = [
  { id: "body", en: "Prowess", th: "พละกำลัง", hint: "แรง อึด แบก ฝ่าอุปสรรค" },
  { id: "hand", en: "Craft", th: "ฝีมือ", hint: "อาวุธ งานช่าง การลงมือแม่น" },
  { id: "wit", en: "Instinct", th: "ไหวพริบ", hint: "หลบ ลวง สังเกต อ่านจังหวะ" },
  { id: "mind", en: "Judgment", th: "ปัญญา", hint: "เอกสาร ข่าว แผน และเหตุผล" },
  { id: "heart", en: "Resolve", th: "พลังใจ", hint: "ยืนหยัด คำสัตย์ และแรงกดดัน" },
];

export type Attributes = Record<AxisId, number>;

export type Mastery = {
  id: string;
  label: string;
  level: number;
  origin: string;
  tags: string[];
};

export type InventoryItem = {
  id: string;
  label: string;
  kind: ItemKind;
  slots: number;
  description: string;
  functions: ("unlock" | "bonus" | "exchange")[];
  bonus?: { axis?: AxisId; value: number; tags: string[] };
  condition: "usable" | "used" | "damaged" | "evidence";
};

export type RelationshipPull = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  weight: number;
};

export type Character = {
  id: string;
  name: string;
  identity: string;
  occupationId: string;
  occupation: string;
  origin: string;
  strength: string;
  weakness: string;
  attributes: Attributes;
  masteries: Mastery[];
  vitals: { wounds: number; focus: number; momentum: number };
  social: { rank: number; honor: number; influence: number; information: number; stain: number };
  resources: { property: number; supplies: number; credit: number };
  inventory: InventoryItem[];
  pulls: RelationshipPull[];
};

export type CampaignContext = {
  id: string;
  title: string;
  year: number;
  season: Season;
  region: string;
  location: string;
  warShadow: number;
  day: number;
};

export type Community = {
  food: number;
  labor: number;
  voice: number;
  safety: number;
  cohesion: number;
  lastChange: string;
};

export type Mission = {
  id: string;
  issuer: string;
  issuerType: "commoner" | "samurai" | "merchant" | "temple" | "ruler";
  title: string;
  request: string;
  pressure: string;
  deadline: string;
  state: MissionState;
  reward: string;
  risk: string;
  options: string[];
};

export type MarketOffer = {
  id: string;
  label: string;
  price: number;
  kind: "goods" | "service" | "information";
  slots?: number;
  note: string;
  available: boolean;
};

export type WorldMemory = {
  id: string;
  kind: MemoryKind;
  title: string;
  detail: string;
  tick: number;
  tone: "teal" | "ochre" | "vermilion" | "navy";
};

export type HistoricalStatus = "fact-supported" | "contextual-play" | "campaign-fiction" | "insufficient-evidence";

export type HistoricalBoundary = {
  status: HistoricalStatus;
  fence: string;
};

export type RollPreview = {
  action: string;
  isRiskOnly?: boolean;
  intent: string;
  method: string;
  axis: AxisId;
  mastery?: Mastery;
  contextBonus: number;
  contextReason?: string;
  difficulty: 10 | 14 | 18 | 22;
  risks: string[];
  witnesses: string[];
  historical?: HistoricalBoundary;
  canUseMomentum: boolean;
};

export type RollRecord = RollPreview & {
  id: string;
  dice: [number, number];
  total: number;
  margin: number;
  outcome: Outcome;
  momentumSpent: number;
  summary: string;
  narrative: string;
  reward?: string;
  consequence?: string;
  tick: number;
};

export type Scene = {
  id: string;
  chapter: string;
  title: string;
  location: string;
  publicContext: string;
  body: string[];
  speaker: string;
  prompt: string;
  pressure: string;
  suggestedActions: string[];
};

export type GameState = {
  schemaVersion: 2;
  credits: number;
  campaign: CampaignContext;
  character: Character;
  community: Community;
  currentScene: Scene;
  missions: Mission[];
  market: MarketOffer[];
  memories: WorldMemory[];
  rolls: RollRecord[];
  historicalBoundary?: HistoricalBoundary & { tick: number };
  tick: number;
};

export type CharacterDraft = {
  name: string;
  identity: string;
  templateId: string;
  freeformOccupation: string;
  origin: string;
  strength: string;
  weakness: string;
  answers: Record<string, string>;
};

export type StarterTemplate = {
  id: string;
  label: string;
  short: string;
  start: string;
  pressure: string;
  compatibleRegions: string[];
  attributes: Attributes;
  masteries: Mastery[];
  inventory: InventoryItem[];
  mission: Omit<Mission, "id" | "state">;
};

const item = (id: string, label: string, kind: ItemKind, description: string, slots: number, functions: InventoryItem["functions"], bonus?: InventoryItem["bonus"]): InventoryItem => ({ id, label, kind, description, slots, functions, bonus, condition: "usable" });
const mastery = (id: string, label: string, level: number, origin: string, tags: string[]): Mastery => ({ id, label, level, origin, tags });

export const RELATIONSHIP_QUESTIONS = [
  ["first_survivor", "เมื่อกลองสงครามดังขึ้น เจ้าอยากให้ใครรอดก่อนเป็นคนแรก", ["family", "protection"]],
  ["stance", "หากต้องยืนข้างใครสักฝ่าย เจ้าจะยืนข้างใคร หรือจะไม่ยืนข้างใครเลย", ["allegiance", "politics"]],
  ["never_surrender", "มีใครหรือสิ่งใดที่เจ้าจะไม่ยอมมอบให้ผู้มีอำนาจ", ["oath", "resistance"]],
  ["debts", "ใครติดหนี้เจ้า และเจ้าติดหนี้ใคร", ["debt", "obligation"]],
  ["hidden_knowledge", "เจ้ารู้สิ่งใดที่คนอื่นต้องการ แต่ยังไม่รู้ว่าเจ้ามี", ["secret", "leverage"]],
  ["sacrifice", "หากต้องเสียบางอย่างเพื่อให้บ้านรอด เจ้าจะยอมเสียอะไร", ["sacrifice", "home"]],
] as const;

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "kokujin", label: "โคคูจิน / เจ้าเมืองชายแดน", short: "ผู้ถือสิทธิ์ในที่ดินที่ถูกอำนาจใหญ่บีบให้เลือกข้าง", start: "ชินาโนะหรือมิกาวะ", pressure: "คำรับรองสองฝ่ายและผลผลิตของบ้าน", compatibleRegions: ["Mikawa", "Shinano"],
    attributes: { body: 1, hand: 1, wit: 2, mind: 3, heart: 3 }, masteries: [mastery("land", "ที่ดินและผลผลิต", 2, "หน้าที่ของบ้าน", ["rice", "village"]), mastery("kin", "เครือญาติ", 2, "บ้านและผู้พึ่งพา", ["family", "negotiation"]), mastery("council", "การประชุม", 1, "เจ้าภาพการเจรจา", ["politics"])], inventory: [item("seal", "ตรารับรองของบ้าน", "document", "เอกสารที่เปิดการพูดคุยต่อหน้าผู้คุม", 1, ["unlock", "bonus"], { axis: "mind", value: 1, tags: ["document", "authority"] })], mission: { issuer: "เสมียนของบ้านใหญ่", issuerType: "samurai", title: "คำรับรองที่ไม่มีฝ่ายสะอาด", request: "ตัดสินใจว่าจะส่งข้าวและแรงงานให้ผู้ใดก่อนเส้นตาย", pressure: "บ้านสองฝ่ายส่งคนมารอคำตอบ", deadline: "ก่อนค่ำ", reward: "ใบผ่านชั่วคราวและคำคุ้มครอง", risk: "ชื่อของบ้านจะถูกบันทึก", options: ["ส่งข้าว", "ต่อรองเวลา", "ใช้เครือญาติ"] }
  },
  {
    id: "jizamurai", label: "จิซามูไร / ซามูไรชาวนา", short: "ผู้ถือที่ดินท้องถิ่นระหว่างชุมชนกับคำสั่งทหาร", start: "โอมิหรือโอวาริ", pressure: "ฤดูเก็บเกี่ยวปะทะการเกณฑ์แรงงาน", compatibleRegions: ["Omi", "Owari"],
    attributes: { body: 3, hand: 1, wit: 1, mind: 3, heart: 2 }, masteries: [mastery("harvest", "ผลผลิตและคลอง", 2, "ดูแลที่ดิน", ["rice", "water"]), mastery("labor", "ระดมแรงงาน", 2, "คนในหมู่บ้าน", ["village", "leadership"]), mastery("oath", "รักษาคำมั่น", 1, "ชื่อของครอบครัว", ["oath"])], inventory: [item("harvest-ledger", "บัญชีผลผลิต", "document", "หลักฐานจำนวนข้าวและแรงงานของหมู่บ้าน", 1, ["unlock", "bonus"], { axis: "mind", value: 1, tags: ["ledger", "rice"] })], mission: { issuer: "ผู้ใหญ่บ้าน", issuerType: "commoner", title: "คนทำนากับคนถือหอก", request: "ช่วยกันแรงงานสำคัญไม่ให้ถูกเรียกออกไปก่อนเก็บเกี่ยว", pressure: "นายกองยืนยันคำสั่งเกณฑ์", deadline: "2 วัน", reward: "เสบียงและคำค้ำจากชุมชน", risk: "ขัดคำสั่งต่อหน้าพยาน", options: ["ยื่นบัญชี", "หาคนแทน", "ต่อรองข้าว"] }
  },
  {
    id: "ronin", label: "โรนิน / ผู้ไร้นาย", short: "ผู้มีฝีมือแต่ไม่มีผู้ค้ำหรือรายได้แน่นอน", start: "ยามะชิโระหรือเซตสึ", pressure: "ด่านถามว่าเจ้าเป็นคนของใคร", compatibleRegions: ["Yamashiro", "Settsu"],
    attributes: { body: 2, hand: 3, wit: 3, mind: 1, heart: 2 }, masteries: [mastery("blade", "อาวุธที่ถนัด", 2, "อดีตการรับใช้", ["fight", "weapon"]), mastery("road", "เดินทางและอ่านภัย", 2, "ชีวิตบนถนน", ["travel", "route"]), mastery("survival", "เอาตัวรอด", 1, "ไม่มีบ้านค้ำ", ["escape", "camp"])], inventory: [item("travel-pass", "หนังสือผ่านทางเก่า", "document", "เอกสารที่ยังพอใช้ต่อรองได้ แต่ถูกตรวจละเอียด", 1, ["unlock"], { axis: "mind", value: 1, tags: ["gate", "travel"] })], mission: { issuer: "เจ้าของขบวนสินค้า", issuerType: "merchant", title: "ค่าจ้างระหว่างทาง", request: "พาคนส่งสารข้ามด่านก่อนผู้คุมเปลี่ยนเวร", pressure: "เอกสารของผู้ว่าจ้างไม่สมบูรณ์", deadline: "ก่อนด่านปิด", reward: "ค่าจ้างและผู้ค้ำชั่วคราว", risk: "ผู้คุมจดชื่อและอาวุธ", options: ["คุ้มกันตรง", "ลอบผ่าน", "ต่อรองค่าผ่านทาง"] }
  },
  {
    id: "sakai_merchant", label: "พ่อค้าเมืองซะไก", short: "นายหน้าการค้าที่มีเครดิต ข่าว และคู่แข่ง", start: "ซะไก แคว้นอิซุมิ", pressure: "หนี้ สินค้าควบคุม และตลาดที่ถูกจับตา", compatibleRegions: ["Sakai", "Izumi", "Settsu"],
    attributes: { body: 1, hand: 1, wit: 2, mind: 3, heart: 2 }, masteries: [mastery("accounting", "บัญชีและเครดิต", 3, "งานค้า", ["ledger", "credit", "market"]), mastery("route-deal", "ต่อรองเส้นทาง", 2, "นายหน้า", ["route", "negotiation"]), mastery("buyer", "อ่านผู้ซื้อ", 1, "ตลาดเมืองท่า", ["market", "wit"])], inventory: [item("merchant-ledger", "บัญชีหนี้ของร้าน", "document", "บันทึกยอดค้างที่มีค่า แต่ทำให้คนอยากแย่งไป", 1, ["unlock", "bonus"], { axis: "mind", value: 1, tags: ["ledger", "credit"] }), item("gift-cloth", "ผ้าเนื้อดี", "status", "ของกำนัลที่ช่วยเปิดบทสนทนา", 1, ["exchange"], { value: 1, tags: ["gift", "negotiation"] })], mission: { issuer: "นายหน้าท่าเรือ", issuerType: "merchant", title: "สินค้าใต้ตรา", request: "ตรวจที่มาของสินค้าและหาทางส่งออกก่อนผู้คุมตลาดมาถึง", pressure: "คู่แข่งกำลังชี้ว่าของเจ้าไม่มีสิทธิ์ผ่าน", deadline: "ก่อนเรือออก", reward: "เครดิตและสิทธิ์ตลาด", risk: "หนี้ใหม่หรือคู่แข่งจำชื่อ", options: ["เปิดบัญชี", "จ่ายสินบน", "เปลี่ยนเส้นทาง"] }
  },
  {
    id: "arms_craftsworker", label: "ช่างยุทโธปกรณ์ / ช่างปืนไฟ", short: "ช่างที่ถูกต้องการตัวเพราะงานฝีมือและความลับ", start: "คุนิโทโมะหรือคิอิ", pressure: "คำสั่งผลิต วัตถุดิบ และร่องรอยงาน", compatibleRegions: ["Omi", "Kii"],
    attributes: { body: 2, hand: 4, wit: 1, mind: 3, heart: 2 }, masteries: [mastery("metal", "โลหะและกลไก", 3, "งานช่าง", ["repair", "metal"]), mastery("inspection", "ตรวจร่องรอย", 2, "โรงช่าง", ["evidence", "inspection"]), mastery("supply", "จัดหาวัตถุดิบ", 1, "เครือข่ายช่าง", ["market", "materials"])], inventory: [item("tool-roll", "เครื่องมือช่าง", "equipment", "เครื่องมือสำหรับตรวจและซ่อมของละเอียด", 2, ["bonus"], { axis: "hand", value: 1, tags: ["repair", "craft"] })], mission: { issuer: "หัวหน้าโรงช่าง", issuerType: "samurai", title: "ลำกล้องที่มีรอยบิ่น", request: "ตรวจอาวุธที่ถูกกล่าวหาว่าถูกส่งให้คนผิดฝ่าย", pressure: "ผู้คุมคลังต้องการชื่อผู้รับผิด", deadline: "ภายในคืนนี้", reward: "วัสดุและสิทธิ์ใช้โรงช่าง", risk: "ชื่อถูกโยงกับการผลิต", options: ["ตรวจของ", "แก้รอย", "เปิดบัญชีคลัง"] }
  },
  {
    id: "shinobi_network_runner", label: "ผู้สืบข่าวจากเครือข่าย", short: "คนเดินข่าวและนำทาง ไม่ใช่นักฆ่าอิสระ", start: "อิกะหรือโคงะ", pressure: "ความไว้ใจ เอกสารผ่านด่าน และคำสั่งขัดชุมชน", compatibleRegions: ["Iga", "Koga"],
    attributes: { body: 1, hand: 1, wit: 4, mind: 3, heart: 2 }, masteries: [mastery("routes", "เส้นทางและสัญญาณ", 3, "เครือข่ายท้องถิ่น", ["route", "travel", "secret"]), mastery("stealth", "ซ่อนตัว", 2, "งานนำทาง", ["hide", "wit"]), mastery("rumor", "ข่าวและการอ่านคน", 2, "ผู้ส่งสาร", ["news", "social"])], inventory: [item("route-cord", "เชือกสัญญาณ", "bond", "เชือกถักที่ใช้ยืนยันคนในเครือข่าย", 1, ["unlock"], { axis: "wit", value: 1, tags: ["network", "route"] })], mission: { issuer: "คนส่งสารของหมู่บ้าน", issuerType: "commoner", title: "ข่าวที่ไม่ควรถูกอ่าน", request: "นำข่าวผ่านด่านโดยไม่ให้ผู้คุมยึดเอกสาร", pressure: "คำสั่งในข่าวอาจทำร้ายชุมชน", deadline: "ก่อนรุ่งเช้า", reward: "ข่าวและทางลัด", risk: "ถูกสงสัยว่าเป็นสาย", options: ["ลอบผ่าน", "ใช้คนกลาง", "ทำสำเนา"] }
  },
  {
    id: "temple_protector", label: "ผู้คุ้มกัน寺社 / คนของวัด", short: "ผู้ประสานงานวัด ผู้ลี้ภัย เอกสาร และคำขอคุ้มครอง", start: "คากะ ยามาโตะ หรือคิอิ", pressure: "ที่พักพิงกับความเป็นกลางทางการเมือง", compatibleRegions: ["Kaga", "Yamato", "Kii"],
    attributes: { body: 1, hand: 1, wit: 2, mind: 3, heart: 4 }, masteries: [mastery("mediation", "ไกล่เกลี่ย", 2, "หน้าที่วัด", ["talk", "temple"]), mastery("script", "เอกสารและการคัดสำเนา", 2, "คลังบันทึก", ["document", "mind"]), mastery("refuge", "ดูแลผู้ลี้ภัย", 1, "เครือข่าย寺社", ["shelter", "community"])], inventory: [item("temple-letter", "จดหมายรับรองของวัด", "document", "เอกสารขอที่พักพิงและเปิดการเจรจา", 1, ["unlock", "bonus"], { axis: "heart", value: 1, tags: ["temple", "request"] })], mission: { issuer: "ผู้ดูแลวัด", issuerType: "temple", title: "คนที่ขอหลบใต้ชายคา", request: "หาทางให้ครอบครัวผู้ลี้ภัยผ่านด่านโดยไม่ทำให้วัดถูกกล่าวหาว่าเลือกข้าง", pressure: "ผู้คุมขอรายชื่อคนพัก", deadline: "ภายในวัน", reward: "ที่พักและข่าวจากวัด", risk: "วัดมีหนี้หรือถูกจับตา", options: ["ไกล่เกลี่ย", "ยื่นจดหมาย", "พาออกทางน้ำ"] }
  },
  {
    id: "daimyo_attendant", label: "คนสนิทไดเมียว / องครักษ์-เลขาธิการ", short: "คนใกล้อำนาจที่มีพยานมากกว่าความเป็นส่วนตัว", start: "อะซุจิ แคว้นโอมิ", pressure: "คำสั่งเร็วและความหวาดระแวงในบ้านใหญ่", compatibleRegions: ["Omi"],
    attributes: { body: 1, hand: 2, wit: 2, mind: 4, heart: 3 }, masteries: [mastery("protocol", "พิธีสารและคำสั่ง", 3, "งานรับใช้บ้านใหญ่", ["document", "authority"]), mastery("mood", "อ่านอารมณ์", 2, "ห้องสั่งการ", ["social", "wit"]), mastery("guard", "คุ้มกัน", 1, "หน้าที่คนสนิท", ["protect", "fight"])], inventory: [item("sealed-order", "คำสั่งปิดผนึก", "document", "คำสั่งที่เปิดประตูได้ แต่ไม่ควรถูกอ่านต่อหน้าคนผิด", 1, ["unlock", "bonus"], { axis: "mind", value: 1, tags: ["order", "authority"] })], mission: { issuer: "เสมียนของบ้าน", issuerType: "ruler", title: "คำสั่งที่มาถึงเร็วเกินไป", request: "นำคำสั่งไปถึงผู้รับโดยไม่ทำให้ข่าวรั่ว", pressure: "คนในบ้านกำลังจับตาว่าคำสั่งเกี่ยวกับใคร", deadline: "ก่อนประชุม", reward: "คำรับรองและสิทธิ์เข้าถึง", risk: "ถูกโยงกับการกวาดล้าง", options: ["ส่งตรง", "ใช้คนกลาง", "อ่านอารมณ์ผู้รับ"] }
  },
  {
    id: "rear_castle_keeper", label: "ผู้พิทักษ์ปราสาทแนวหลัง", short: "ผู้จัดการคลังและคนในบ้าน เมื่อกำลังหลักออกไปแนวหน้า", start: "มุซาชิหรือปราสาทแนวหลัง", pressure: "เสบียง ผู้ลี้ภัย และการยอมจำนนของบ้าน", compatibleRegions: ["Musashi"],
    attributes: { body: 2, hand: 1, wit: 2, mind: 3, heart: 4 }, masteries: [mastery("stores", "คลังและเสบียง", 3, "ดูแลบ้าน", ["supplies", "castle"]), mastery("household", "จัดคนในเรือน", 2, "ผู้จัดการบ้าน", ["community", "labor"]), mastery("defense", "ป้องกันบ้าน", 1, "แนวหลัง", ["protect", "siege"])], inventory: [item("store-key", "กุญแจคลัง", "bond", "กุญแจที่เปิดคลังเสบียง แต่ทำให้เป็นผู้รับผิดทันที", 1, ["unlock"], { axis: "mind", value: 1, tags: ["stores", "castle"] })], mission: { issuer: "ผู้ดูแลเรือน", issuerType: "samurai", title: "คลังที่ต้องอยู่ถึงเช้า", request: "ตัดสินใจว่าจะจ่ายเสบียงให้ผู้ลี้ภัยหรือเก็บไว้รับการล้อม", pressure: "ทางน้ำเริ่มขึ้นและคนในบ้านขัดแย้ง", deadline: "ก่อนน้ำขึ้น", reward: "ความไว้ใจของเรือนและเสบียง", risk: "ชื่อถูกจดในคลัง", options: ["เปิดคลัง", "แบ่งส่วน", "ต่อรองข้าว"] }
  },
  {
    id: "suigun_leader", label: "หัวหน้ากองเรือ / ซุยกุน", short: "คนของเรือที่ต่อรองด้วยเส้นทาง น้ำ และคำรับรอง", start: "อิโยะหรือชิมะ", pressure: "ค่าคุ้มกัน ใบผ่าน และแรงบีบจากฝ่ายบนบก", compatibleRegions: ["Iyo", "Shima"],
    attributes: { body: 2, hand: 2, wit: 4, mind: 2, heart: 2 }, masteries: [mastery("water-route", "ทางน้ำและนำร่อง", 3, "งานเรือ", ["water", "route"]), mastery("crew", "คุมลูกเรือ", 2, "เครือญาติทางน้ำ", ["crew", "leadership"]), mastery("toll", "ค่าผ่านและคำรับรอง", 1, "ท่าเรือ", ["negotiation", "passage"])], inventory: [item("water-pass", "ใบผ่านทางน้ำ", "document", "คำรับรองพื้นที่ที่ใช้ได้กับบางจุดเท่านั้น", 1, ["unlock", "bonus"], { axis: "wit", value: 1, tags: ["water", "passage"] })], mission: { issuer: "นายท้ายผู้เฒ่า", issuerType: "merchant", title: "เรือที่ไม่ควรติดธง", request: "พาสินค้าและคนผ่านทางน้ำโดยไม่จ่ายค่าคุ้มกันซ้ำ", pressure: "เรือสองฝ่ายอ้างสิทธิ์ในช่องแคบ", deadline: "ก่อนกระแสน้ำเปลี่ยน", reward: "เส้นทางน้ำและเครดิตท่าเรือ", risk: "หนี้กับคนเรือหรือศัตรูจำเรือ", options: ["ต่อรอง", "ใช้ทางน้ำแคบ", "แลกข่าว"] }
  },
];

export function templateById(id: string) {
  return STARTER_TEMPLATES.find((template) => template.id === id) ?? STARTER_TEMPLATES[2];
}

export function createCharacter(draft: CharacterDraft): Character {
  const template = templateById(draft.templateId);
  const occupation = draft.templateId === "freeform" ? (draft.freeformOccupation.trim() || "ผู้เดินทางไร้สังกัด") : template.label;
  return {
    id: `char-${Date.now()}`,
    name: draft.name.trim() || "ผู้ไร้นาม",
    identity: draft.identity.trim() || "ไม่ได้ระบุ",
    occupationId: draft.templateId,
    occupation,
    origin: draft.origin.trim() || template.start,
    strength: draft.strength.trim() || "ทำงานภายใต้แรงกดดันได้",
    weakness: draft.weakness.trim() || "มีหนี้ที่ยังไม่กล้าพูดถึง",
    attributes: { ...template.attributes },
    masteries: template.masteries.map((entry) => ({ ...entry })),
    vitals: { wounds: 0, focus: 5, momentum: 2 },
    social: { rank: 0, honor: 1, influence: 0, information: 1, stain: 0 },
    resources: { property: draft.templateId === "sakai_merchant" ? 4 : 2, supplies: 3, credit: draft.templateId === "sakai_merchant" ? 2 : 1 },
    inventory: template.inventory.map((entry) => ({ ...entry })),
    pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: draft.answers[id] || "ยังไม่ตอบ", tags: [...tags], weight: draft.answers[id] ? 2 : 1 })),
  };
}

function openingScene(character: Character, campaign: CampaignContext, mission: Mission): Scene {
  const seasonDetail: Record<Season, string> = {
    Spring: "ไอชื้นจากฝนต้นปีเกาะอยู่ตามขอบผ้าและร่องไม้",
    Summer: "ความร้อนที่สะสมอยู่บนหลังคาไม้ทำให้กลิ่นเหงื่อ ม้า และข้าวเก่าหนักกว่าปกติ",
    Autumn: "กลิ่นฟางแห้งและฝุ่นจากเกวียนเก็บเกี่ยวลอยปะปนอยู่ในอากาศ",
    Winter: "ลมหายใจของผู้คนลอยขาวอยู่เหนือพื้นดินแข็ง และทุกคนพูดสั้นกว่าปกติเพราะความหนาว",
  };
  return {
    id: `scene-${campaign.id}-opening`, chapter: "Leaf 01", title: mission.title, location: campaign.location,
    publicContext: `เนื้อหานี้เป็นเรื่องสมมติใน ${campaign.region} ค.ศ. ${campaign.year} · ${campaign.season} โดยใช้แรงกดดันของสงครามและเส้นทางเป็นบริบท ไม่ใช่การยืนยันว่า NPC นี้มีอยู่จริง.`,
    body: [
      `ยามบ่ายที่ ${campaign.location} ไม่เคยเงียบจริง ${seasonDetail[campaign.season]} กลิ่นเหงื่อจากหลังม้า กลิ่นฟางเก่าจากเพิงพัก และกลิ่นข้าวหุงค้างหม้อคลุกอยู่ในลมหายใจเดียวกัน เสียงล้อเกวียนบดพื้นดินดังเอี๊ยดเป็นจังหวะอยู่ตรงทางแยก ขณะที่ทหารหน้าด่านใช้ด้ามหอกเคาะพื้นไม้เป็นระยะเหมือนตั้งใจเตือนทุกคนว่าคนผ่านทางมีเวลาของตนเอง เมื่อ ${character.name} ก้าวเข้ามา คนขายน้ำสองคนหยุดเถียงกันทันที แม้กระทั่งเด็กที่กำลังไล่แมลงวันอยู่ข้างคอกม้ายังเงยหน้ามอง ก่อนจะก้มหลบสายตาไปเหมือนไม่อยากถูกนับว่าอยู่ในเหตุการณ์นี้.`,
      `${mission.issuer} รออยู่ใต้ชายคาแคบ ๆ ข้างกองสินค้า เชือกปอที่มัดลังไม้กดรอยแดงไว้บนฝ่ามือของเขา เสื้อชั้นนอกมีฝุ่นเกาะตามชายแขนจนดูเหมือนเพิ่งลงมาจากเกวียนมากกว่าจะเป็นคนที่มาหาคนคุ้มกัน เขาไม่ได้ทักทาย เพียงเลื่อนสายตาจากดาบของ ${character.name} ไปยังทหารที่ประตูด่าน แล้วพูดเบาจนต้องขยับเข้าไปฟัง “${mission.request}” ปลายนิ้วของเขาบีบขอบเอกสารยับ ๆ แน่นขึ้นเมื่อเอ่ยต่อว่า “${mission.pressure}” น้ำเสียงนั้นไม่มีคำขอร้อง มีแต่ความกลัวที่พยายามเก็บไว้ใต้ถ้อยคำของพ่อค้าที่รู้ว่าหากเรื่องผิดพลาด คนมีเงินจะหนีทันก่อนคนถือดาบเสมอ.`,
      `${character.name} เห็นทางออกได้ไวกว่าใครจาก ${character.strength} ทว่า ${character.weakness} ก็ทำให้คำพูดทุกคำต้องชั่งน้ำหนัก งานคุ้มกันคนส่งสารอาจเป็นเพียงค่าจ้างหนึ่งครั้ง หรืออาจกลายเป็นชื่อที่ผู้คุมจดไว้ข้างอาวุธและรูปพรรณของคนแปลกหน้า ${mission.issuer} วางถุงเหรียญเล็ก ๆ ลงบนลังไม้โดยไม่ผลักมาทางนี้ ราวกับยังไม่กล้าตัดสินว่าควรจ่ายให้ผู้คุ้มกันหรือใช้มันซื้อความเงียบจากคนอื่นก่อน เส้นตาย ${mission.deadline} ไม่ได้อยู่บนกระดาษแผ่นใด แต่มันกำลังเคลื่อนเข้ามาพร้อมเงาของประตูด่านที่ยาวขึ้นทุกลมหายใจ.`,
    ],
    speaker: mission.issuer, prompt: "เจ้าจะทำอย่างไรต่อ?", pressure: mission.pressure, suggestedActions: mission.options,
  };
}

export function createGameState(context: CampaignContext, draft: CharacterDraft): GameState {
  const character = createCharacter(draft);
  const template = templateById(draft.templateId);
  const mission: Mission = { ...template.mission, id: `mission-${Date.now()}`, state: "offered" as MissionState };
  const opening = openingScene(character, context, mission);
  return {
    schemaVersion: 2,
    credits: 50,
    campaign: context,
    character,
    community: { food: 4, labor: 3, voice: 2, safety: 3, cohesion: 4, lastChange: "กองกำลังเดินผ่านเส้นทางหลัก" },
    currentScene: opening,
    missions: [mission],
    market: buildMarket(context.season),
    memories: [{ id: `memory-${Date.now()}`, kind: "news", title: opening.title, detail: opening.body.join("\n\n"), tick: 1, tone: "teal" }],
    rolls: [],
    tick: 1,
  };
}

export function createSaikaSafehouseDemo(): GameState {
  const campaign: CampaignContext = { id: "camp-saika-1569", title: "Smoke Beneath Sakai", year: 1569, season: "Spring", region: "Sakai / Izumi", location: "เซฟเฮาส์ลับของไซกะ — นอกชายเขตเมืองซาไก", warShadow: 5, day: 1 };
  const character: Character = {
    id: "char-sanefuyu", name: "ซาเนฟุยุ", identity: "เด็กชายวัยสิบสามปี", occupationId: "freeform", occupation: "ทหารรับจ้างถือปืนของไซกะ", origin: "กิอิ", strength: "อ่านผลประโยชน์และพูดในจังหวะที่คนกำลังลังเล", weakness: "บาดเจ็บสาหัสและถูกความหยามเกียรติผลักให้พลั้งมือ", attributes: { body: 1, hand: 3, wit: 3, mind: 2, heart: 3 }, masteries: [mastery("saika-firearm", "ปืนคาบศิลาและคนไซกะ", 2, "งานคุ้มกันและการรบ", ["fight", "weapon", "gunpowder"]), mastery("hard-bargain", "ต่อรองผลประโยชน์", 1, "เอาตัวรอด", ["negotiation", "social"]), mastery("water-escape", "หนีทางน้ำ", 1, "รอดจากการจมน้ำ", ["water", "escape"])], vitals: { wounds: 5, focus: 3, momentum: 1 }, social: { rank: 0, honor: 0, influence: 1, information: 2, stain: 2 }, resources: { property: 1, supplies: 1, credit: 0 }, inventory: [item("bandaged-arm", "ผ้าพันแผลชุ่มยา", "status", "ไหล่ซ้ายและแขนขวาบาดเจ็บ ใช้งานได้จำกัด", 0, []), item("saika-matchlock", "ปืนคาบศิลาเปียกชื้น", "equipment", "ปืนที่ต้องซ่อมและทำให้แห้งก่อนใช้", 2, ["bonus"], { axis: "hand", value: 1, tags: ["fight", "weapon"] }), item("dry-ration", "ข้าวปั้นตากแห้งกับเต้าเจี้ยว", "reserve", "ของกินที่กันทาโร่โยนให้", 1, ["bonus"])], pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: id === "stance" ? "ยืนข้างไซกะตราบใดที่ผลประโยชน์ยังตรงกัน" : id === "debts" ? "ติดหนี้ชีวิตกันทาโร่" : "ยังไม่ตอบ", tags: [...tags], weight: id === "stance" || id === "debts" ? 2 : 1 })),
  };
  const mission: Mission = { id: "mission-echiya", issuer: "กันทาโร่", issuerType: "samurai", title: "คำตอบใต้ห้องขัง", request: "เสนอทางจัดการเอจิยะและตั๋วสัญญาปืนสามสิบกระบอก โดยไม่ให้สิทธิ์การค้าของไซกะในซาไกพังลง", pressure: "เอโกะชูเพิ่มเวรยาม ปิดประตูเมือง และตรวจเรือเข้าออกตามหาพ่อค้าเอจิยะ", deadline: "ก่อนเมืองซาไกยืนยันข่าวการหายตัว", reward: "การคุ้มครองของกันทาโร่และส่วนแบ่งค่าปืน", risk: "หัวของซาเนฟุยุและเอจิยะอาจถูกส่งไปแลกสิทธิ์การค้า", options: ["เสนอแผนปิดปาก", "สอบเอจิยะ", "หาตั๋วสัญญาปืน"], state: "offered" };
  const opening: Scene = {
    id: "scene-saika-safehouse-opening", chapter: "Leaf 01", title: mission.title, location: campaign.location,
    publicContext: "ฉากแคมเปญสมมติในบริบทเมืองท่าซาไก ค.ศ. 1569 ใช้แรงกดดันของการค้า อาวุธ และเครือข่ายไซกะเป็นฉากหลัง ไม่ได้ยืนยันว่า NPC ในฉากมีตัวตนจริง.",
    body: [
      "กลิ่นควันยาต้มหญ้าสมุนไพรปนกลิ่นคาวเลือดแห้งกรังคือสิ่งแรกที่กักประสาทสัมผัสของซาเนฟุยุไว้เมื่อลืมตา ความเจ็บแปลบวิ่งจากหัวไหล่ซ้ายที่ถูกพันไว้แน่นลงมาถึงแขนขวา ทุกครั้งที่ขยับลมหายใจ ผ้าพันแผลที่เคยขาวก็รั้งเนื้อเหมือนจะเตือนว่าเมื่อคืนเขาถูกน้ำเค็มและเลือดเกือบเอาไปพร้อมกัน แต่ลมหายใจยังอยู่ และนั่นหมายความว่าเรื่องข้างนอกยังไม่ยอมจบไปกับความมืด.",
      "แสงเช้าลอดผ่านรอยแหว่งของฝาผนังไม้กันฝน กันทาโร่นั่งขัดสมาธิอยู่บนเสื่อเก่า ยางไม้กับเขม่าดินปืนเกาะตามเกราะโดมารุ ขณะมือหยาบใช้ผ้าแห้งเช็ดชิ้นส่วนปืนคาบศิลาอย่างช้า ๆ เมื่อได้ยินเสียงคนเจ็บขยับ เขาวางโลหะกระทบพื้นไม้ดัง กึ๊ก แล้วเอ่ยโดยไม่หันมา “ตื่นแล้วรึ แผลของเจ้า หมอพอกยาและนาบไฟไว้ให้แล้ว ถ้าไม่อยากแขนเน่า ก็อย่าทะลึ่งขยับมากนัก”",
      "กันทาโร่เงยหน้าขึ้นในที่สุด ดวงตาของคนผ่านศึกกวาดมองซาเนฟุยุราวกับประเมินของที่ยังพอขายได้ “เอจิยะนอนปากแข็งอยู่ห้องใต้ดิน แต่เมืองซาไกตื่นกันหมดแล้ว เอโกะชูเพิ่มเวรยาม ปิดประตู และตรวจเรือทุกลำเพราะพ่อค้าใหญ่หายตัวไป” เขาโยนห่อข้าวปั้นตากแห้งกับเต้าเจี้ยวลงข้างเสื่อ “ข้าช่วยเจ้าขึ้นจากน้ำเพราะเจ้าลากมันมาได้ แต่ถ้าไซกะเสียสิทธิ์การค้าเพราะเรื่องนี้ หัวของเจ้ากับมันอาจต้องถูกส่งไปง้อพวกนั้น บอกมาเถอะ เจ้าจะจัดการเอจิยะอย่างไร”",
    ],
    speaker: "กันทาโร่", prompt: "ซาเนฟุยุจะตอบกันทาโร่ว่าอย่างไร?", pressure: mission.pressure, suggestedActions: mission.options,
  };
  return { schemaVersion: 2, credits: 50, campaign, character, community: { food: 2, labor: 2, voice: 1, safety: 1, cohesion: 2, lastChange: "เมืองซาไกเพิ่มเวรยามและตรวจเรือ" }, currentScene: opening, missions: [mission], market: buildMarket("Spring"), memories: [{ id: "memory-saika-opening", kind: "stain", title: "คืนที่เมืองซาไกตื่น", detail: opening.body.join("\n\n"), tick: 1, tone: "vermilion" }], rolls: [], tick: 1 };
}

export function buildMarket(season: Season): MarketOffer[] {
  const seasonGoods: Record<Season, MarketOffer> = {
    Spring: { id: "rain-cloak", label: "เสื้อคลุมกันฝน", price: 2, kind: "goods", slots: 1, note: "ช่วยเดินทางในเส้นทางเปียก", available: true },
    Summer: { id: "water-skin", label: "ถุงน้ำและยาสมุนไพร", price: 2, kind: "goods", slots: 1, note: "ของจำเป็นเมื่อเดินทางกลางร้อน", available: true },
    Autumn: { id: "rice-bundle", label: "ข้าวตากหนึ่งห่อ", price: 2, kind: "goods", slots: 1, note: "เสบียงพกพาช่วงเก็บเกี่ยว", available: true },
    Winter: { id: "charcoal-brazier", label: "ถ่านและผ้าห่มบาง", price: 3, kind: "goods", slots: 2, note: "คุ้มกันความหนาว แต่กินสัมภาระ", available: true },
  };
  return [
    seasonGoods[season],
    { id: "rope", label: "เชือกปอ", price: 1, kind: "goods", slots: 1, note: "เปิดทางเลือกปีน ผูก หรือซ่อม", available: true },
    { id: "porter", label: "จ้างลูกหาบ", price: 2, kind: "service", note: "ลดภาระสัมภาระหนึ่งฉาก", available: true },
    { id: "scribe", label: "จ้างคนอ่านเอกสาร", price: 3, kind: "service", note: "เปิดวิธีใช้เอกสารที่ไม่เข้าใจ", available: true },
    { id: "rumor", label: "ข่าวด่านวันนี้", price: 1, kind: "information", note: "บอกแรงกดดันในฉากถัดไป", available: true },
  ];
}

const actionKeywords: { tags: string[]; axis: AxisId; method: string; masteryTags: string[] }[] = [
  { tags: ["ฟัน", "แทง", "ปัด", "ซ่อม", "ทำ", "จับ", "แกะ", "ยิง"], axis: "hand", method: "ใช้ฝีมือและการลงมือที่แม่นยำ", masteryTags: ["fight", "weapon", "repair", "craft", "metal"] },
  { tags: ["แบก", "ผลัก", "ยก", "ปีน", "วิ่ง", "ฝ่า", "ยื้อ"], axis: "body", method: "ใช้พละกำลังและความอดทน", masteryTags: ["travel", "labor", "protect"] },
  { tags: ["หลบ", "ลอบ", "หลอก", "สังเกต", "หนี", "ซ่อน", "นำทาง"], axis: "wit", method: "อ่านจังหวะและใช้ไหวพริบ", masteryTags: ["hide", "route", "travel", "news", "wit"] },
  { tags: ["บัญชี", "เอกสาร", "แผน", "พิสูจน์", "อ่าน", "คำนวณ", "อ้าง"], axis: "mind", method: "ใช้เอกสาร เหตุผล หรือแผนที่มีอยู่", masteryTags: ["ledger", "document", "mind", "accounting", "inspection"] },
  { tags: ["ขอ", "สาบาน", "ยืน", "รับผิด", "เกลี้ยกล่อม", "คุ้มครอง", "รักษา"], axis: "heart", method: "ยืนบนคำสัตย์และแรงใจ", masteryTags: ["oath", "temple", "request", "mediation", "talk"] },
];

export function parseAction(action: string, state: GameState): RollPreview {
  const normalized = action.trim().toLowerCase();
  const match = actionKeywords.find((entry) => entry.tags.some((tag) => normalized.includes(tag))) ?? actionKeywords[2];
  const selectedMastery = [...state.character.masteries].sort((a, b) => {
    const score = (mastery: Mastery) => mastery.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)) ? 1 : 0;
    return score(b) - score(a) || b.level - a.level;
  })[0];
  const matchingItem = state.character.inventory.find((entry) => entry.condition === "usable" && entry.bonus && entry.bonus.tags.some((tag) => normalized.includes(tag) || match.masteryTags.includes(tag)));
  const directRisk = normalized.includes("ฆ่า") || normalized.includes("ปลอม") || normalized.includes("ขโมย") || normalized.includes("บุก");
  const difficult = directRisk || normalized.includes("ด่าน") || normalized.includes("ผู้คุม") || normalized.includes("ค่าย");
  const difficulty: 10 | 14 | 18 | 22 = directRisk ? 22 : difficult ? 18 : normalized.length < 12 ? 10 : 14;
  return {
    action: action.trim(),
    intent: action.trim() || "ยังไม่ได้ระบุการกระทำ",
    method: match.method,
    axis: match.axis,
    mastery: selectedMastery,
    contextBonus: matchingItem?.bonus?.value ?? 0,
    contextReason: matchingItem ? `ใช้ ${matchingItem.label}` : undefined,
    difficulty,
    risks: directRisk ? ["เกิดพยาน", "ข้อครหาเพิ่ม", "สถานการณ์ปะทุ"] : difficult ? ["ชื่อถูกจด", "ผู้คุมตั้งคำถาม", "เสียเวลา"] : ["ใช้เสบียง", "มีคนได้ยิน", "เกิดหนี้เล็กน้อย"],
    witnesses: difficult ? ["ผู้คุมด่าน", "เสมียน", "คนรอคิว"] : ["คนในพื้นที่"],
    canUseMomentum: state.character.vitals.momentum > 0,
  };
}

function outcomeFromMargin(margin: number): Outcome {
  if (margin >= 5) return "decisive_success";
  if (margin >= 0) return "success_with_cost";
  if (margin >= -4) return "partial_success";
  return "failure_with_consequence";
}

const outcomeCopy: Record<Outcome, { label: string; narrative: string; consequence: string }> = {
  decisive_success: { label: "สำเร็จเด็ดขาด", narrative: "แผนของเจ้าทำงานเกินกว่าที่ผู้คนในฉากคาดไว้ และฝ่ายตรงข้ามต้องถอยเพื่อคิดใหม่.", consequence: "ได้เปิดทางเลือกใหม่พร้อมความไว้วางใจ" },
  success_with_cost: { label: "สำเร็จ แต่มีผลตามมา", narrative: "สิ่งที่เจ้าต้องการเกิดขึ้น แต่ไม่มีใครลืมว่าเจ้าทำอย่างไรและใครเป็นพยาน.", consequence: "เกิดพยานหรือหนี้ที่ต้องตอบแทน" },
  partial_success: { label: "สำเร็จบางส่วน", narrative: "เจ้าคว้าได้เพียงส่วนหนึ่งของเป้าหมาย และต้องเลือกว่าจะยอมรับผลลัพธ์นี้หรือจ่ายต่อเพื่อไปให้ถึง.", consequence: "ได้ข้อมูลหรือเวลาเพิ่ม แต่แรงกดดันยังอยู่" },
  failure_with_consequence: { label: "ไม่สำเร็จ", narrative: "โลกไม่ยอมให้แผนนี้ผ่านไปอย่างเงียบ ๆ เรื่องจึงเดินต่อด้วยราคาที่จับต้องได้.", consequence: "เกิดข้อครหาหรือแรงกดดันฉากใหม่" },
};

function localOutcomeNarration(preview: RollPreview, state: GameState, outcome: Outcome, consequence: string) {
  const speaker = state.currentScene.speaker || state.missions[0]?.issuer || "ผู้มอบงาน";
  const first = `${preview.intent} ทำให้บรรยากาศใน ${state.currentScene.location} เปลี่ยนไปก่อนที่ใครจะเอ่ยคำตอบ เสียงเชือกเสียดสีกับลังไม้และเสียงฝีเท้าหน้าด่านยังดังอยู่เหมือนเดิม แต่คนที่ยืนใกล้ที่สุดเริ่มขยับออกจากกันราวกับกลัวว่าชื่อของตนจะถูกผูกเข้ากับเรื่องนี้ด้วย ${state.currentScene.pressure} ไม่ได้หายไปไหน มันเพียงย้ายจากอากาศรอบตัวมาวางหนักอยู่บนบ่าของ ${state.character.name} แทน.`;
  const middle = outcome === "failure_with_consequence"
    ? `${speaker} ไม่ได้ตำหนิทันที เขาปล่อยให้ความเงียบกัดอยู่ครู่หนึ่ง ก่อนใช้นิ้วโป้งลูบรอยยับบนเอกสารแล้วกล่าวว่า “ถ้าจะกู้เรื่องนี้กลับมา เจ้าต้องเอาหลักฐานมาวางตรงหน้า ไม่ใช่เอาอารมณ์มาให้ข้าฟัง” คนข้างหลังเขาหลบตา คนหนึ่งแสร้งก้มผูกเชือกรองเท้า ไม่มีใครอยากรับเป็นพยานให้ความผิดพลาดของ ${state.character.name} แต่ทุกคนได้ยินคำพูดนั้นครบถ้วน.`
    : `${speaker} มอง ${state.character.name} อยู่นานกว่าที่ควรจะเป็น ราวกับกำลังชั่งว่าความกล้านี้เป็นของที่ซื้อได้หรือเป็นภัยที่ต้องระวัง แล้วจึงเอ่ยว่า “ข้าจะให้ทางเจ้าเดินต่อ แต่จำไว้ ทางที่เปิดขึ้นเพราะชื่อของเจ้า ย่อมปิดลงเพราะชื่อนั้นได้เหมือนกัน” ไม่มีใครปรบมือให้ผลลัพธ์นี้ ทว่าใบหน้าคนรอบข้างเปลี่ยนจากการรอดูเป็นการคำนวณ ว่าในครั้งหน้าใครจะได้ประโยชน์และใครจะต้องจ่ายแทน.`;
  const last = outcome === "decisive_success"
    ? `ผลของการกระทำเปิดช่องให้กว้างกว่าที่ผู้คนคาดไว้ แต่ ${consequence} ไม่ใช่ของขวัญเปล่า ๆ มันเป็นรอยผูกมัดเส้นใหม่ระหว่าง ${state.character.name} กับคนใน ${state.currentScene.location} เมื่อมือของผู้มอบงานขยับไปจับสิ่งที่เคยปฏิเสธ เขาก็ทำให้ทุกคนเห็นแล้วว่าทางเลือกนี้มีราคา และวันหนึ่งราคานั้นอาจถูกทวงคืน.`
    : outcome === "failure_with_consequence"
      ? `ความผิดพลาดยังไม่ใช่จุดจบ แต่ ${consequence} ทำให้ทางเดิมใช้ไม่ได้อีกต่อไป ก่อนการตัดสินใจครั้งถัดไป ${state.character.name} ต้องยอมเสียบางอย่างเพื่อซื้อเวลา หรือปล่อยให้คนอื่นเขียนคำอธิบายแทน เมื่อประตูด่านขยับปิดลงทีละน้อย ไม่มีใครพูดว่าเรื่องนี้จบแล้ว ทว่าทุกคนรู้ว่าต่อจากนี้การแก้ตัวจะมีราคาสูงกว่าเดิม.`
      : `สิ่งที่ ${state.character.name} ต้องการเกิดขึ้นเพียงส่วนหนึ่ง และ ${consequence} ก็ถูกทิ้งไว้ในฉากเหมือนรอยเท้าบนดินชื้นที่ฝนยังลบไม่ทัน มันจะตามไปในวันที่ผู้คนเริ่มคิดว่าตนเองได้ประโยชน์จากเรื่องนี้เช่นกัน ผู้มอบงานเก็บของของตนช้า ๆ ราวกับให้เวลาสั้น ๆ สำหรับมองผลที่ทำลงไป ก่อนจะหันไปทางเส้นทางหลักซึ่งยังเต็มไปด้วยคนที่พร้อมฟังข่าวผิดเพี้ยนเสมอ.`;
  return [first, middle, last].join("\n\n");
}

export function resolveRoll(preview: RollPreview, state: GameState, spendMomentum: boolean): RollRecord {
  const dice: [number, number] = [Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1];
  const axisValue = state.character.attributes[preview.axis];
  const masteryValue = preview.mastery?.level ?? 0;
  const momentumSpent = spendMomentum && state.character.vitals.momentum > 0 ? 2 : 0;
  const total = dice[0] + dice[1] + axisValue + masteryValue + preview.contextBonus + momentumSpent;
  const margin = total - preview.difficulty;
  const outcome = outcomeFromMargin(margin);
  const copy = outcomeCopy[outcome];
  return {
    ...preview,
    id: `roll-${Date.now()}`,
    dice,
    total,
    margin,
    outcome,
    momentumSpent,
    summary: `${copy.label}: ${preview.intent}`,
    narrative: localOutcomeNarration(preview, state, outcome, copy.consequence),
    reward: outcome === "failure_with_consequence" ? undefined : "ความคืบหน้าของภารกิจและทางเลือกใหม่",
    consequence: copy.consequence,
    tick: state.tick + 1,
  };
}

export function applyRoll(state: GameState, record: RollRecord): GameState {
  const copy = outcomeCopy[record.outcome];
  const success = record.outcome !== "failure_with_consequence";
  const updatedCharacter: Character = {
    ...state.character,
    vitals: { ...state.character.vitals, momentum: Math.max(0, state.character.vitals.momentum - (record.momentumSpent ? 1 : 0)) },
    social: { ...state.character.social, stain: state.character.social.stain + (record.outcome === "failure_with_consequence" ? 1 : 0), information: state.character.social.information + (record.outcome === "partial_success" ? 1 : 0) },
  };
  const memory: WorldMemory = {
    id: `memory-${record.id}`,
    kind: record.outcome === "failure_with_consequence" ? "stain" : record.outcome === "success_with_cost" ? "witness" : "favor",
    title: copy.label,
    detail: record.consequence ?? copy.consequence,
    tick: record.tick,
    tone: record.outcome === "failure_with_consequence" ? "vermilion" : record.outcome === "success_with_cost" ? "ochre" : "teal",
  };
  const mission = state.missions[0];
  const missions = state.missions.map((entry): Mission => entry.id === mission?.id ? { ...entry, state: success ? "resolved" : "active" } : entry);
  const nextScene: Scene = {
    ...state.currentScene,
    id: `scene-${record.id}`,
    chapter: `Leaf ${String(record.tick).padStart(2, "0")}`,
    title: success ? "ราคาของคำตอบ" : "สิ่งที่โลกไม่ยอมลืม",
    body: success
      ? [
          record.narrative,
          `คำตอบของเจ้าทำให้งาน “${mission?.title ?? "ภารกิจ"}” ขยับไปข้างหน้า ผู้คนที่เคยยืนเงียบอยู่ข้างเสาเริ่มหันมามองกันเอง เพราะไม่มีใครคิดว่าคำพูดเพียงไม่กี่ประโยคจะเปลี่ยนน้ำหนักของเรื่องได้เร็วขนาดนี้.`,
          `แต่ผู้มีอำนาจในฉากไม่ได้ยอมเสียหน้าโดยเปล่าประโยชน์ ${record.consequence ?? "จึงมีชื่อของเจ้าและสิ่งที่เจ้าทำถูกเก็บไว้เป็นข้ออ้างสำหรับวันหน้า"}.`,
          `ผู้มอบงานไม่ได้สัญญาว่าทุกอย่างจะปลอดภัย เขาเพียงพยักหน้าแล้วบอกว่า “เจ้าทำให้ข้าเลือกทางที่ยากขึ้นได้แล้ว ทีนี้ก็อย่าปล่อยให้คนอื่นเขียนเรื่องนี้แทนเจ้า.”`,
          `ลมจากเส้นทางหลักยังพาเสียงเกวียนและข่าวลือเข้ามาเหมือนเดิม แต่ตอนนี้เจ้าได้สิ่งหนึ่งที่จับต้องได้: เวลาสั้น ๆ ทางเลือกใหม่หนึ่งทาง และคนที่เริ่มจำชื่อของเจ้าได้.`,
        ]
      : [
          record.narrative,
          `เมื่อแผนไม่เป็นไปตามที่หวัง ผู้คนใน ${state.currentScene.location} ไม่ได้หัวเราะทันที พวกเขาเพียงเงียบลง และความเงียบนั้นทำให้เจ้ารู้ว่ามีใครบางคนเริ่มคำนวณราคาของความพลาดแล้ว.`,
          `${record.consequence ?? "ความกดดันของฉากเพิ่มขึ้น"} ไม่มีใครประกาศว่านี่คือจุดจบ แต่ทางเดิมไม่อาจเดินผ่านได้โดยไม่ต้องอธิบายตัวเองอีกครั้ง.`,
          `ผู้มอบงานหลุบตาลงมองพื้นครู่หนึ่งก่อนเอ่ยว่า “ข้ายังไม่ตัดสินว่าเจ้าทรยศหรือแค่พลาด แต่เจ้าต้องหาหลักฐานที่ทำให้คนอื่นเชื่อคำตอบของเจ้าให้ได้.”`,
          `ดังนั้นเรื่องจึงยังเดินต่อไป ไม่ใช่ด้วยชัยชนะ แต่ด้วยบันทึกหนึ่งบรรทัดที่อาจตามเจ้าไปถึงฉากถัดไป.`,
        ],
    speaker: state.currentScene.speaker,
    prompt: "เจ้าจะทำอย่างไรต่อ?",
    pressure: record.consequence ?? state.currentScene.pressure,
    suggestedActions: success ? ["รับรางวัลแล้วถามเงื่อนไข", "ตามหาคนที่เป็นพยาน", "กลับไปดูภารกิจอื่น"] : ["แก้ความเข้าใจกับผู้คุม", "หาหลักฐานเพิ่ม", "ยอมรับผลแล้วเปลี่ยนแผน"],
  };
  return { ...state, character: updatedCharacter, currentScene: nextScene, missions, memories: [...state.memories, memory], rolls: [...state.rolls, record], tick: record.tick };
}

export function buyMarketOffer(state: GameState, offerId: string): { state: GameState; message: string } {
  const offer = state.market.find((entry) => entry.id === offerId);
  if (!offer || !offer.available) return { state, message: "รายการนี้ไม่พร้อมแล้ว" };
  if (state.character.resources.property < offer.price) return { state, message: "ทรัพย์สินไม่พอ · ลองเจรจา รับงาน หรือใช้เครดิตแทน" };
  const inventory = offer.kind === "goods" ? [...state.character.inventory, item(`market-${offer.id}-${Date.now()}`, offer.label, "reserve", offer.note, offer.slots ?? 1, ["unlock"], { value: 1, tags: [offer.id] })] : state.character.inventory;
  return {
    state: { ...state, character: { ...state.character, resources: { ...state.character.resources, property: state.character.resources.property - offer.price }, inventory } },
    message: offer.kind === "goods" ? `ซื้อ ${offer.label} แล้ว` : `ใช้บริการ: ${offer.label}`,
  };
}
