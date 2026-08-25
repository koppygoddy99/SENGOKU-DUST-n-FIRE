/**
 * Dust & Fire game-state contract.
 * Ledger of Ash reminder: the player sees consequences, sources, and choices—not hidden intent.
 */

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";
export type StatId = "body" | "hand" | "wit" | "mind" | "heart";
export type Outcome = "decisive_success" | "success_with_cost" | "partial_success" | "failure_with_consequence";
export type MissionState = "offered" | "active" | "resolved" | "failed";
export type ItemKind = "immediate" | "reserve" | "equipment" | "document" | "status" | "bond";
export type MemoryKind = "news" | "witness" | "debt" | "favor" | "oath" | "stain" | "injury" | "market_change" | "community_change" | "actor_relation";

export const STATS: { id: StatId; en: string; th: string; hint: string }[] = [
  { id: "body", en: "strength", th: "พลังกาย", hint: "แรง อึด แบก ฝ่าอุปสรรค" },
  { id: "hand", en: "Finesse", th: "ฝีมือ", hint: "อาวุธ งานช่าง การลงมือแม่น" },
  { id: "wit", en: "Instinct", th: "ไหวพริบ", hint: "หลบ ลวง สังเกต อ่านจังหวะ" },
  { id: "mind", en: "Insight", th: "ปัญญา", hint: "เอกสาร ข่าว แผน และเหตุผล" },
  { id: "heart", en: "Grit", th: "ใจสู้", hint: "ยืนหยัด คำสัตย์ และแรงกดดัน" },
];

export type Attributes = Record<StatId, number>;

export type Mastery = {
  id: string;
  label: string;
  level: number;
  rank?: number;
  xp?: number;
  totalXp?: number;
  masteryMark?: string;
  origin: string;
  tags: string[];
};

export type TimeSegment = "dawn" | "day" | "dusk" | "night";

export type SkillPractice = {
  masteryId: string;
  masteryLabel: string;
  gained: number;
  rankBefore: number;
  rankAfter: number;
  xp: number;
  xpNeeded: number;
  masteryMark?: string;
  note?: string;
};

export type TimeMark = {
  from: TimeSegment;
  to: TimeSegment;
  advancedDays: number;
  leafAdvanced: boolean;
  message: string;
};

export type ProgressionState = {
  leaf: number;
  segment: TimeSegment;
  timeMarksSinceLeaf: number;
  daysSinceLeaf: number;
  ageAtCampaignStart: number;
  currentAge: number;
  birthSeason: Season;
  campaignStartYear: number;
  lastPractice?: SkillPractice;
  lastTimeMark?: TimeMark;
};

export type InventoryItem = {
  id: string;
  label: string;
  kind: ItemKind;
  slots: number;
  description: string;
  functions: ("unlock" | "bonus" | "exchange")[];
  bonus?: { stat?: StatId; value: number; tags: string[] };
  condition: "usable" | "used" | "damaged" | "evidence";
  location?: "carried" | "safehouse" | "stored" | "hidden";
  ownership?: "owned" | "borrowed" | "held_for_other" | "disputed";
};

export type MomentumSourceKind = "vital" | "item" | "scene";
export type MomentumSource = {
  id: string;
  kind: MomentumSourceKind;
  label: string;
  note: string;
  cost: string;
  itemId?: string;
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
  progress?: { current: number; required: number; triggerPhrases: string[]; rewardItem?: Omit<InventoryItem, "id">; resolvedBy?: string; rewardGranted?: boolean };
};

export type MarketOffer = {
  id: string;
  label: string;
  price: number;
  kind: "goods" | "service" | "information";
  slots?: number;
  note: string;
  available: boolean;
  priceReason?: string;
};

export type MarketService = {
  id: string;
  provider: string;
  role: string;
  affiliation: string;
  request: string;
  price: string;
  timeCost: string;
  requirement: string;
  witnessRisk: string;
  availability: "available" | "limited" | "unavailable";
};

export type Obligation = {
  id: string;
  kind: "credit" | "debt" | "favor";
  holder: string;
  subject: string;
  due: string;
  witness: string;
  status: "open" | "settled" | "called_in";
  note: string;
};

export type ExchangeRecord = {
  id: string;
  kind: "purchase" | "credit_purchase" | "service" | "gift" | "debt" | "favor";
  title: string;
  counterpart: string;
  payment: string;
  witness: string;
  consequence: string;
  tick: number;
};

export type EconomyState = {
  marketTitle: string;
  marketContext: string;
  routeStatus: string;
  sellerNetwork: string;
  services: MarketService[];
  obligations: Obligation[];
  transactions: ExchangeRecord[];
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
  stat: StatId;
  mastery?: Mastery;
  contextBonus: number;
  contextReason?: string;
  difficulty: 10 | 14 | 18 | 22;
  difficultyReason?: string;
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
  momentumSource?: MomentumSource;
  summary: string;
  narrative: string;
  reward?: string;
  consequence?: string;
  tick: number;
  practice?: SkillPractice;
  timeMark?: TimeMark;
  missionUpdate?: { missionId: string; current: number; required: number; state: MissionState; reward?: string };
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
  economy: EconomyState;
  memories: WorldMemory[];
  rolls: RollRecord[];
  historicalBoundary?: HistoricalBoundary & { tick: number };
  progression?: ProgressionState;
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
  age: number;
  pressure: string;
  compatibleRegions: string[];
  attributes: Attributes;
  social: Character["social"];
  resources: Character["resources"];
  masteries: Mastery[];
  inventory: InventoryItem[];
  mission: Omit<Mission, "id" | "state">;
};

const item = (id: string, label: string, kind: ItemKind, description: string, slots: number, functions: InventoryItem["functions"], bonus?: InventoryItem["bonus"]): InventoryItem => ({ id, label, kind, description, slots, functions, bonus, condition: "usable" });
export const MAX_MASTERY_RANK = 20;

export function xpNeededForRank(rank: number) {
  if (rank >= MAX_MASTERY_RANK) return 0;
  if (rank <= 4) return 5;
  if (rank <= 8) return 7;
  if (rank <= 12) return 10;
  if (rank <= 16) return 14;
  return 18;
}

export function bonusForMasteryRank(rank: number) {
  if (rank >= 17) return 5;
  if (rank >= 13) return 4;
  if (rank >= 9) return 3;
  if (rank >= 5) return 2;
  return 1;
}

export function masteryTierForRank(rank: number) {
  if (rank >= 20) return { id: "mastered", en: "Mastered", th: "อาจารย์ที่เชี่ยวชาญ", minimumDifficulty: 0, bonus: 5, note: "ชื่อและลายมือของเจ้าเปลี่ยนวิธีที่โลกตอบกลับ" };
  if (rank >= 17) return { id: "renowned", en: "Renowned", th: "มีชื่อเสียง", minimumDifficulty: 22, bonus: 5, note: "ต้องเจองานที่เดิมพันสูงจึงจะขัดเกลาต่อได้" };
  if (rank >= 13) return { id: "proven", en: "Proven", th: "มีฝีมือไร้คนสงสัย", minimumDifficulty: 18, bonus: 4, note: "งานธรรมดาไม่ทำให้ฝีมือขยับอีกแล้ว" };
  if (rank >= 9) return { id: "trusted", en: "Trusted", th: "เชื่อมือได้", minimumDifficulty: 14, bonus: 3, note: "เริ่มเติบโตจากงานที่มีคนและผลประโยชน์เกี่ยวข้อง" };
  if (rank >= 5) return { id: "steady", en: "Steady Hand", th: "กำลังก้าวหน้า", minimumDifficulty: 10, bonus: 2, note: "ฝึกจากงานที่มีผลจริง ไม่ใช่การลองซ้ำ" };
  return { id: "learning", en: "Learning", th: "มือใหม่", minimumDifficulty: 10, bonus: 1, note: "ทุกงานที่มีความเสี่ยงคือการตั้งมือ" };
}

export function rankForLegacyMasteryBonus(level: number) {
  if (level >= 5) return 20;
  if (level === 4) return 16;
  if (level === 3) return 12;
  if (level === 2) return 8;
  return 4;
}

export function normalizeMasteryProgress(entry: Mastery): Mastery {
  const rank = Math.max(1, Math.min(MAX_MASTERY_RANK, entry.rank ?? rankForLegacyMasteryBonus(entry.level)));
  return { ...entry, rank, level: bonusForMasteryRank(rank), xp: rank >= MAX_MASTERY_RANK ? 0 : Math.max(0, Math.min(entry.xp ?? 0, xpNeededForRank(rank) - 1)), totalXp: Math.max(0, entry.totalXp ?? 0) };
}

function defaultProgression(context: CampaignContext, ageAtCampaignStart = 20, birthSeason: Season = context.season): ProgressionState {
  return { leaf: 1, segment: "day", timeMarksSinceLeaf: 0, daysSinceLeaf: 0, ageAtCampaignStart, currentAge: ageAtCampaignStart, birthSeason, campaignStartYear: context.year };
}

const mastery = (id: string, label: string, level: number, origin: string, tags: string[]): Mastery => normalizeMasteryProgress({ id, label, level, origin, tags });

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
    attributes: { body: 1, hand: 2, wit: 2, mind: 3, heart: 2 }, social: { rank: 1, honor: 1, influence: 1, information: 1, stain: 0 }, resources: { property: 2, supplies: 2, credit: 1 }, masteries: [mastery("orders-and-seals", "คำสั่งและตราปิดผนึก", 3, "งานรับใช้บ้านใหญ่", ["document", "authority"]), mastery("room-reading", "อ่านอารมณ์ในห้องสั่งการ", 2, "งานเฝ้าประตู", ["social", "wit"]), mastery("escort", "คุ้มกันระยะใกล้", 1, "หน้าที่คนถือของ", ["protect", "fight"])], inventory: [item("sealed-order", "คำสั่งปิดผนึก", "document", "คำสั่งที่เปิดประตูได้ แต่ไม่ควรถูกอ่านต่อหน้าคนผิด", 1, ["unlock", "bonus"], { stat: "mind", value: 1, tags: ["order", "authority"] }), item("house-badge", "ป้ายผ้าของบ้าน", "status", "สวมแล้วผ่านบางประตูได้ แต่ทำให้คนรู้ว่าเจ้าอยู่ฝ่ายใด", 0, ["unlock"], { stat: "heart", value: 1, tags: ["house", "authority"] })], mission: { issuer: "เสมียนของบ้าน", issuerType: "ruler", title: "คำสั่งที่มาถึงเร็วเกินไป", request: "นำคำสั่งไปถึงผู้รับโดยไม่ทำให้ข่าวรั่ว", pressure: "คนในบ้านกำลังจับตาว่าคำสั่งเกี่ยวกับใคร", deadline: "ก่อนประชุม", reward: "คำรับรองและสิทธิ์เข้าถึง", risk: "ถูกโยงกับการกวาดล้าง", options: ["ส่งตรง", "ใช้คนกลาง", "อ่านอารมณ์ผู้รับ"] }
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
    social: { ...template.social },
    resources: { ...template.resources },
    inventory: template.inventory.map((entry) => ({ ...entry })),
    pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: draft.answers[id] || "ยังไม่บอก", tags: [...tags], weight: draft.answers[id] ? 2 : 1 })),
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
    id: `scene-${campaign.id}-opening`, chapter: "Page 01", title: mission.title, location: campaign.location,
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
  const mission: Mission = { ...template.mission, id: `mission-${Date.now()}`, state: "offered" as MissionState, progress: { current: 0, required: 2, triggerPhrases: template.mission.options } };
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
    economy: buildCampaignEconomy(context),
    memories: [{ id: `memory-${Date.now()}`, kind: "news", title: opening.title, detail: opening.body.join("\n\n"), tick: 1, tone: "teal" }],
    rolls: [],
    progression: defaultProgression(context, template.age, context.season),
    tick: 1,
  };
}

export function createSaikaSafehouseDemo(): GameState {
  const campaign: CampaignContext = { id: "camp-saika-1569", title: "Smoke Beneath Sakai", year: 1569, season: "Spring", region: "Sakai / Izumi", location: "เซฟเฮาส์ลับของไซกะ — นอกชายเขตเมืองซาไก", warShadow: 5, day: 1 };
  const character: Character = {
    id: "char-sanefuyu", name: "ซาเนฟุยุ", identity: "เด็กชายวัยสิบสามปี", occupationId: "freeform", occupation: "ทหารรับจ้างถือปืนของไซกะ", origin: "กิอิ", strength: "อ่านผลประโยชน์และพูดในจังหวะที่คนกำลังลังเล", weakness: "บาดเจ็บสาหัสและถูกความหยามเกียรติผลักให้พลั้งมือ", attributes: { body: 1, hand: 3, wit: 3, mind: 2, heart: 3 }, masteries: [mastery("saika-firearm", "ปืนคาบศิลาและคนไซกะ", 2, "งานคุ้มกันและการรบ", ["fight", "weapon", "gunpowder"]), mastery("hard-bargain", "ต่อรองผลประโยชน์", 1, "เอาตัวรอด", ["negotiation", "social"]), mastery("water-escape", "หนีทางน้ำ", 1, "รอดจากการจมน้ำ", ["water", "escape"])], vitals: { wounds: 5, focus: 3, momentum: 1 }, social: { rank: 0, honor: 0, influence: 1, information: 2, stain: 2 }, resources: { property: 1, supplies: 1, credit: 0 }, inventory: [item("bandaged-arm", "ผ้าพันแผลชุ่มยา", "status", "ไหล่ซ้ายและแขนขวาบาดเจ็บ ใช้งานได้จำกัด", 0, []), item("saika-matchlock", "ปืนคาบศิลาเปียกชื้น", "equipment", "ปืนที่ต้องซ่อมและทำให้แห้งก่อนใช้", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "weapon"] }), item("dry-ration", "ข้าวปั้นตากแห้งกับเต้าเจี้ยว", "reserve", "ของกินที่กันทาโร่โยนให้", 1, ["bonus"])], pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: id === "life_before" ? "เติบโตท่ามกลางเส้นทางค้าของคิอิ ก่อนกลายเป็นทหารรับจ้างของไซกะ" : "ยืนข้างไซกะตราบใดที่ผลประโยชน์ยังตรงกัน", tags: [...tags], weight: 2 })),
  };
  const mission: Mission = { id: "mission-echiya", issuer: "กันทาโร่", issuerType: "samurai", title: "คำตอบใต้ห้องขัง", request: "เสนอทางจัดการเอจิยะและตั๋วสัญญาปืนสามสิบกระบอก โดยไม่ให้สิทธิ์การค้าของไซกะในซาไกพังลง", pressure: "เอโกะชูเพิ่มเวรยาม ปิดประตูเมือง และตรวจเรือเข้าออกตามหาพ่อค้าเอจิยะ", deadline: "ก่อนเมืองซาไกยืนยันข่าวการหายตัว", reward: "การคุ้มครองของกันทาโร่และส่วนแบ่งค่าปืน", risk: "หัวของซาเนฟุยุและเอจิยะอาจถูกส่งไปแลกสิทธิ์การค้า", options: ["เสนอแผนปิดปาก", "สอบเอจิยะ", "หาตั๋วสัญญาปืน"], state: "offered", progress: { current: 0, required: 2, triggerPhrases: ["เอจิยะ", "ตั๋ว", "ปืน", "แผน"], rewardItem: { label: "จดหมายรับรองของกันทาโร่", kind: "document", description: "หลักฐานคุ้มครองชั่วคราวที่ช่วยให้คนของไซกะยอมฟังคำอธิบาย", slots: 0, functions: ["unlock"], bonus: { stat: "heart", value: 1, tags: ["saika", "protection"] }, condition: "usable", location: "carried", ownership: "owned" } } };
  const opening: Scene = {
    id: "scene-saika-safehouse-opening", chapter: "Page 01", title: mission.title, location: campaign.location,
    publicContext: "ฉากแคมเปญสมมติในบริบทเมืองท่าซาไก ค.ศ. 1569 ใช้แรงกดดันของการค้า อาวุธ และเครือข่ายไซกะเป็นฉากหลัง ไม่ได้ยืนยันว่า NPC ในฉากมีตัวตนจริง.",
    body: [
      "กลิ่นควันยาต้มหญ้าสมุนไพรปนกลิ่นคาวเลือดแห้งกรังคือสิ่งแรกที่กักประสาทสัมผัสของซาเนฟุยุไว้เมื่อลืมตา ความเจ็บแปลบวิ่งจากหัวไหล่ซ้ายที่ถูกพันไว้แน่นลงมาถึงแขนขวา ทุกครั้งที่ขยับลมหายใจ ผ้าพันแผลที่เคยขาวก็รั้งเนื้อเหมือนจะเตือนว่าเมื่อคืนเขาถูกน้ำเค็มและเลือดเกือบเอาไปพร้อมกัน แต่ลมหายใจยังอยู่ และนั่นหมายความว่าเรื่องข้างนอกยังไม่ยอมจบไปกับความมืด.",
      "แสงเช้าลอดผ่านรอยแหว่งของฝาผนังไม้กันฝน กันทาโร่นั่งขัดสมาธิอยู่บนเสื่อเก่า ยางไม้กับเขม่าดินปืนเกาะตามเกราะโดมารุ ขณะมือหยาบใช้ผ้าแห้งเช็ดชิ้นส่วนปืนคาบศิลาอย่างช้า ๆ เมื่อได้ยินเสียงคนเจ็บขยับ เขาวางโลหะกระทบพื้นไม้ดัง กึ๊ก แล้วเอ่ยโดยไม่หันมา “ตื่นแล้วรึ แผลของเจ้า หมอพอกยาและนาบไฟไว้ให้แล้ว ถ้าไม่อยากแขนเน่า ก็อย่าทะลึ่งขยับมากนัก”",
      "กันทาโร่เงยหน้าขึ้นในที่สุด ดวงตาของคนผ่านศึกกวาดมองซาเนฟุยุราวกับประเมินของที่ยังพอขายได้ “เอจิยะนอนปากแข็งอยู่ห้องใต้ดิน แต่เมืองซาไกตื่นกันหมดแล้ว เอโกะชูเพิ่มเวรยาม ปิดประตู และตรวจเรือทุกลำเพราะพ่อค้าใหญ่หายตัวไป” เขาโยนห่อข้าวปั้นตากแห้งกับเต้าเจี้ยวลงข้างเสื่อ “ข้าช่วยเจ้าขึ้นจากน้ำเพราะเจ้าลากมันมาได้ แต่ถ้าไซกะเสียสิทธิ์การค้าเพราะเรื่องนี้ หัวของเจ้ากับมันอาจต้องถูกส่งไปง้อพวกนั้น บอกมาเถอะ เจ้าจะจัดการเอจิยะอย่างไร”",
    ],
    speaker: "กันทาโร่", prompt: "ซาเนฟุยุจะตอบกันทาโร่ว่าอย่างไร?", pressure: mission.pressure, suggestedActions: mission.options,
  };
  return { schemaVersion: 2, credits: 50, campaign, character, community: { food: 2, labor: 2, voice: 1, safety: 1, cohesion: 2, lastChange: "เมืองซาไกเพิ่มเวรยามและตรวจเรือ" }, currentScene: opening, missions: [mission], market: buildSaikaMarket(), economy: buildSaikaEconomy(), memories: [{ id: "memory-saika-opening", kind: "stain", title: "คืนที่เมืองซาไกตื่น", detail: opening.body.join("\n\n"), tick: 1, tone: "vermilion" }], rolls: [], progression: defaultProgression(campaign, 13, "Spring"), tick: 1 };
}

export function normalizeGameState(state: GameState): GameState {
  const campaign = state.campaign;
  const progression = state.progression ?? defaultProgression(campaign, state.character.identity.includes("สิบสาม") ? 13 : 20, campaign.season);
  const missions = state.missions.map((mission) => mission.progress ? mission : { ...mission, progress: { current: mission.state === "resolved" ? 2 : 0, required: 2, triggerPhrases: mission.options } });
  const legacyRolls = state.rolls as Array<RollRecord & { axis?: StatId }>;
  const legacyInventory = state.character.inventory as Array<GameState["character"]["inventory"][number] & { bonus?: { axis?: StatId; stat?: StatId; value: number; tags: string[] } }>;
  const rolls = legacyRolls.map((roll) => roll.stat ? roll : { ...roll, stat: roll.axis ?? "wit" });
  const inventory = legacyInventory.map((item) => item.bonus?.stat ? item : item.bonus?.axis ? { ...item, bonus: { ...item.bonus, stat: item.bonus.axis } } : item);
  return {
    ...state,
    character: { ...state.character, inventory, masteries: state.character.masteries.map(normalizeMasteryProgress) },
    missions,
    rolls,
    progression: { ...progression, currentAge: Math.max(progression.currentAge, progression.ageAtCampaignStart) },
    economy: state.economy ?? (campaign.id === "camp-saika-1569" ? buildSaikaEconomy() : buildCampaignEconomy(campaign)),
  };
}

function buildCampaignEconomy(context: CampaignContext): EconomyState {
  return { marketTitle: `ตลาดใกล้ ${context.location}`, marketContext: `ข้อเสนอใน ${context.season} ผูกกับเส้นทางและแรงกดดันของแคมเปญ ไม่ใช่รายการสินค้าสากล`, routeStatus: "เส้นทางยังเปิด แต่ผู้เดินทางถูกซักถาม", sellerNetwork: "พ่อค้าท้องถิ่น คนงานขนของ และคนกลางของชุมชน", services: [{ id: "local-messenger", provider: "คนส่งสารท้องถิ่น", role: "ข่าวสารและเอกสาร", affiliation: "เครือข่ายตลาด", request: "นำห่อเล็กไปยังจุดนัดหมาย", price: "ทรัพย์สิน 2 หรือคำรับรอง", timeCost: "หนึ่งวัน", requirement: "ไม่เปิดเผยชื่อผู้รับต่อหน้าคนแปลกหน้า", witnessRisk: "คนส่งสารจำชื่อผู้ว่าจ้างได้", availability: "available" }], obligations: [], transactions: [] };
}

function buildSaikaMarket(): MarketOffer[] {
  return [
    { id: "saika-rations", label: "ข้าวตากและเต้าเจี้ยว", price: 1, kind: "goods", slots: 1, note: "เสบียงแห้งจากแผงใกล้ท่าเรือ", priceReason: "กองกำลังตรวจเส้นทางเสบียง", available: true },
    { id: "saika-medicine", label: "ยาสมุนไพรห่อเล็ก", price: 2, kind: "goods", slots: 0, note: "ผู้ขายยอมให้รับไปก่อนหากมีคนของไซกะรับรอง", priceReason: "สมุนไพรมีจำกัดและคนเจ็บเพิ่มขึ้น", available: true },
    { id: "saika-rope-cloth", label: "เชือกปอและผ้าหยาบ", price: 2, kind: "goods", slots: 1, note: "ใช้ซ่อมของหรือห่อของให้ไม่สะดุดตา", priceReason: "เรือสินค้าล่าช้า", available: true },
    { id: "saika-messenger", label: "คนส่งสารท่าเรือ", price: 2, kind: "service", note: "ออกจากท่าเรือหลังยามค่ำ รับเฉพาะห่อเล็ก", priceReason: "ด่านตรวจเรือเข้าออก", available: true },
    { id: "saika-scribe", label: "เสมียนอ่านเอกสาร", price: 2, kind: "information", note: "อ่านบัญชีและตั๋วสัญญา แต่ไม่แตะตราไซกะที่เปิดเผย", priceReason: "งานเสี่ยงต่อเครือข่ายร้านค้า", available: true },
  ];
}

function buildSaikaEconomy(): EconomyState {
  return { marketTitle: "ตลาดท่าเรือซาไก — เช้าหลังคืนวุ่นวาย", marketContext: "สินค้าและบริการเป็น fictional play content ในบริบทเมืองท่า ค.ศ. 1569 ราคาเปลี่ยนเพราะการตรวจเรือ เสบียง และเครือข่ายผู้ขาย", routeStatus: "เอโกะชูเพิ่มเวรยาม ปิดประตูบางช่วง และตรวจเรือเข้าออก", sellerNetwork: "แผงยา คนงานท่าเรือ เสมียนบ้านพ่อค้า และคนกลางที่รู้จักชื่อกันทาโร่", services: [{ id: "harbor-messenger", provider: "คนส่งสารท่าเรือ", role: "ข่าวสารและเอกสาร", affiliation: "คนงานท่าเรือ", request: "ส่งห่อเล็กไปยังตลาดฝั่งตะวันออก", price: "ทรัพย์สิน 2 หรือชื่อคนคุมท่าเรือรับรอง", timeCost: "หนึ่งวัน", requirement: "ห่อต้องไม่เผยตราไซกะ", witnessRisk: "ผู้ส่งสารอาจถูกค้นและจำชื่อผู้ว่าจ้างได้", availability: "limited" }, { id: "harbor-scribe", provider: "เสมียนอ่านเอกสาร", role: "ข่าวสารและเอกสาร", affiliation: "บ้านพ่อค้าท่าเรือ", request: "อ่านบัญชีหรือเทียบข้อความในตั๋วสัญญา", price: "ทรัพย์สิน 2 หรือข้อมูลที่พอแลกได้", timeCost: "ก่อนตะวันตก", requirement: "ไม่รับเอกสารที่มีตราไซกะเปิดเผย", witnessRisk: "เสมียนอาจรู้ว่าผู้เล่นกำลังตามหาของใด", availability: "available" }, { id: "herb-seller", provider: "เจ้าของแผงยา", role: "รักษาและดูแลคนเจ็บ", affiliation: "เครือข่ายแผงยา", request: "ให้ยาสมุนไพรและเปลี่ยนผ้าพันแผล", price: "ทรัพย์สิน 2 หรือรับของไปก่อนสามวันพร้อมคนค้ำ", timeCost: "ครึ่งชั่วยาม", requirement: "บอกว่าแผลเกิดจากอะไรเท่าที่ผู้ขายยอมรับ", witnessRisk: "คนในแผงอาจรู้ว่าซาเนฟุยุยังบาดเจ็บ", availability: "limited" }], obligations: [{ id: "favor-gantaro-life", kind: "favor", holder: "กันทาโร่", subject: "หนี้ชีวิตจากการลากซาเนฟุยุขึ้นจากน้ำ", due: "ยังไม่กำหนด", witness: "คนในเซฟเฮาส์", status: "open", note: "ใช้ขอความช่วยเหลือได้เฉพาะเรื่องที่ไม่ทำลายผลประโยชน์ไซกะ" }, { id: "debt-safehouse-rations", kind: "debt", holder: "เซฟเฮาส์ของไซกะ", subject: "ข้าวตากและยาที่ใช้รักษาแผล", due: "ก่อนออกจากที่ซ่อน", witness: "กันทาโร่", status: "open", note: "ชำระได้ด้วยของ ค่าปืน หรือแรงงาน ไม่ใช่เหรียญอย่างเดียว" }], transactions: [{ id: "tx-saika-rescue", kind: "favor", title: "กันทาโร่ลากซาเนฟุยุขึ้นจากน้ำ", counterpart: "กันทาโร่", payment: "บุญคุณที่ยังไม่กำหนดราคา", witness: "คนในเซฟเฮาส์", consequence: "ซาเนฟุยุมีที่ซ่อนชั่วคราว แต่ถูกผูกกับผลประโยชน์ไซกะ", tick: 1 }, { id: "tx-saika-rations", kind: "debt", title: "รับข้าวตากและยาพันแผล", counterpart: "เซฟเฮาส์ของไซกะ", payment: "ค้างแรงงานหรือส่วนแบ่งค่าปืน", witness: "กันทาโร่", consequence: "ของอยู่กับตัว แต่หนี้ถูกบันทึก", tick: 1 }] };
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

const actionKeywords: { tags: string[]; stat: StatId; method: string; masteryTags: string[] }[] = [
  { tags: ["ฟัน", "แทง", "ปัด", "ซ่อม", "ทำ", "จับ", "แกะ", "ยิง"], stat: "hand", method: "ใช้ฝีมือและการลงมือที่แม่นยำ", masteryTags: ["fight", "weapon", "repair", "craft", "metal"] },
  { tags: ["แบก", "ผลัก", "ยก", "ปีน", "วิ่ง", "ฝ่า", "ยื้อ"], stat: "body", method: "ใช้พลังกายและความอดทน", masteryTags: ["travel", "labor", "protect"] },
  { tags: ["หลบ", "ลอบ", "หลอก", "สังเกต", "หนี", "ซ่อน", "นำทาง"], stat: "wit", method: "อ่านจังหวะและใช้ไหวพริบ", masteryTags: ["hide", "route", "travel", "news", "wit"] },
  { tags: ["บัญชี", "เอกสาร", "แผน", "พิสูจน์", "อ่าน", "คำนวณ", "อ้าง"], stat: "mind", method: "ใช้เอกสาร เหตุผล หรือแผนที่มีอยู่", masteryTags: ["ledger", "document", "mind", "accounting", "inspection"] },
  { tags: ["ขอ", "สาบาน", "ยืน", "รับผิด", "เกลี้ยกล่อม", "คุ้มครอง", "รักษา"], stat: "heart", method: "ยืนบนคำสัตย์และแรงใจ", masteryTags: ["oath", "temple", "request", "mediation", "talk"] },
];

export function parseAction(action: string, state: GameState): RollPreview {
  const normalized = action.trim().toLowerCase();
  const match = actionKeywords.find((entry) => entry.tags.some((tag) => normalized.includes(tag))) ?? actionKeywords[2];
  const selectedMastery = [...state.character.masteries].sort((a, b) => {
    const score = (mastery: Mastery) => mastery.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)) ? 1 : 0;
    return score(b) - score(a) || b.level - a.level;
  })[0];
  const matchingItem = state.character.inventory.find((entry) => entry.condition === "usable" && entry.bonus && entry.bonus.tags.some((tag) => normalized.includes(tag) || match.masteryTags.includes(tag)));
  const illicitRisk = normalized.includes("ฆ่า") || normalized.includes("ปลอม") || normalized.includes("ขโมย") || normalized.includes("บุก");
  const guardedObstacle = normalized.includes("ด่าน") || normalized.includes("ผู้คุม") || normalized.includes("ค่าย");
  const hasRelevantMastery = selectedMastery?.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)) ?? false;
  const isPrepared = Boolean(matchingItem?.bonus?.value);
  const difficulty: 10 | 14 | 18 | 22 = illicitRisk && guardedObstacle && !hasRelevantMastery && !isPrepared ? 22 : illicitRisk || guardedObstacle ? 18 : 14;
  const difficultyReason = difficulty === 22
    ? "วิกฤต: การเสี่ยงผิดกฎหมายปะทะด่านหรือผู้คุม โดยยังไม่มีวิชาหรือเครื่องมือที่ช่วย"
    : difficulty === 18
      ? illicitRisk ? "เสี่ยงสูง: การกระทำนี้ทิ้งพยานหรือข้อครหา แม้ทำสำเร็จก็มีราคา" : "อุปสรรคจริง: มีด่าน ผู้คุม หรือคนคอยขวาง จึงต้องใช้ฝีมือหรือการเตรียมตัว"
      : "เดิมพันมีความหมาย: หากสำเร็จฉากขยับ หากพลาดเรื่องยังเดินต่อพร้อมผลตามมา";
  return {
    action: action.trim(),
    intent: action.trim() || "ยังไม่ได้ระบุการกระทำ",
    method: match.method,
    stat: match.stat,
    mastery: selectedMastery,
    contextBonus: matchingItem?.bonus?.value ?? 0,
    contextReason: matchingItem ? `ใช้ ${matchingItem.label}` : undefined,
    difficulty,
    difficultyReason,
    risks: illicitRisk ? ["เกิดพยาน", "ข้อครหาเพิ่ม", "สถานการณ์ปะทุ"] : guardedObstacle ? ["ชื่อถูกจด", "ผู้คุมตั้งคำถาม", "เสียเวลา"] : ["ใช้เสบียง", "มีคนได้ยิน", "เกิดหนี้เล็กน้อย"],
    witnesses: guardedObstacle ? ["ผู้คุมด่าน", "เสมียน", "คนรอคิว"] : ["คนในพื้นที่"],
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
  const statValue = state.character.attributes[preview.stat];
  const masteryValue = preview.mastery?.level ?? 0;
  const momentumSpent = spendMomentum && state.character.vitals.momentum > 0 ? 2 : 0;
  const total = dice[0] + dice[1] + statValue + masteryValue + preview.contextBonus + momentumSpent;
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

/**
 * Momentum is a post-roll decision: it never rerolls dice or discards the
 * calculation the player just inspected. It adds +2 to that exact record.
 */
export function applyMomentumToRoll(record: RollRecord, state: GameState): RollRecord {
  const source = getMomentumSources(state)[0];
  if (record.momentumSpent || !source) return record;
  return applyMomentumFromSource(record, state, source.id);
}

export function getMomentumSources(state: GameState): MomentumSource[] {
  if (state.character.vitals.momentum <= 0) return [];
  const sources: MomentumSource[] = [];
  const vitals = state.character.vitals;
  if (vitals.focus > 0 && vitals.wounds < 6) {
    sources.push({ id: "vital-focus", kind: "vital", label: "ใจมั่นที่ยังเหลือ", note: "ตั้งสติฝืนแรงกดดันของฉาก", cost: "Focus −1" });
  }
  state.character.inventory.filter((entry) => entry.condition === "usable" && entry.kind === "reserve").forEach((entry) => {
    sources.push({ id: `item-${entry.id}`, kind: "item", itemId: entry.id, label: entry.label, note: entry.description, cost: "ใช้ของ 1 ชิ้น" });
  });
  const openFavor = state.economy.obligations.find((entry) => entry.kind === "favor" && entry.status === "open");
  if (openFavor) {
    sources.push({ id: `scene-favor-${openFavor.id}`, kind: "scene", label: `คำค้ำของ ${openFavor.holder}`, note: openFavor.note, cost: "ผูกบุญคุณเพิ่ม" });
  }
  return sources;
}

export function applyMomentumFromSource(record: RollRecord, state: GameState, sourceId: string): RollRecord {
  const source = getMomentumSources(state).find((entry) => entry.id === sourceId);
  if (record.momentumSpent || !source) return record;
  const momentumSpent = 2;
  const total = record.total + momentumSpent;
  const margin = total - record.difficulty;
  const outcome = outcomeFromMargin(margin);
  const copy = outcomeCopy[outcome];
  return {
    ...record,
    total,
    margin,
    outcome,
    momentumSpent,
    momentumSource: source,
    summary: `${copy.label}: ${record.intent}`,
    narrative: localOutcomeNarration(record, state, outcome, copy.consequence),
    reward: outcome === "failure_with_consequence" ? undefined : "ความคืบหน้าของภารกิจและทางเลือกใหม่",
    consequence: copy.consequence,
  };
}

function awardPractice(masteries: Mastery[], record: RollRecord) {
  const used = record.mastery ? masteries.find((entry) => entry.id === record.mastery?.id) : undefined;
  if (!used) return { masteries, practice: undefined as SkillPractice | undefined };
  const before = normalizeMasteryProgress(used);
  const normalizedRank = before.rank ?? 1;
  if (normalizedRank >= MAX_MASTERY_RANK) return { masteries, practice: { masteryId: before.id, masteryLabel: before.label, gained: 0, rankBefore: normalizedRank, rankAfter: normalizedRank, xp: 0, xpNeeded: 0, masteryMark: before.masteryMark ?? "Mastered" } };
  const tier = masteryTierForRank(normalizedRank);
  const eligible = record.difficulty >= tier.minimumDifficulty;
  const gained = eligible ? (record.outcome === "decisive_success" ? 2 : 1) : 0;
  let rank = normalizedRank;
  let xp = (before.xp ?? 0) + gained;
  let masteryMark = before.masteryMark;
  while (rank < MAX_MASTERY_RANK && xp >= xpNeededForRank(rank)) {
    xp -= xpNeededForRank(rank);
    rank += 1;
    if (rank === MAX_MASTERY_RANK) { xp = 0; masteryMark = "Mastered"; }
  }
  const after: Mastery = { ...before, rank, level: bonusForMasteryRank(rank), xp, totalXp: (before.totalXp ?? 0) + gained, masteryMark };
  const practice: SkillPractice = { masteryId: after.id, masteryLabel: after.label, gained, rankBefore: normalizedRank, rankAfter: rank, xp: after.xp ?? 0, xpNeeded: xpNeededForRank(rank), masteryMark, note: eligible ? tier.note : `ต้องเผชิญงาน DN ${tier.minimumDifficulty}+ เพื่อฝึกขั้นนี้` };
  return { masteries: masteries.map((entry) => entry.id === after.id ? after : entry), practice };
}

function advanceClock(current: ProgressionState, outcome: Outcome): { progression: ProgressionState; timeMark: TimeMark; dayAdvance: number } {
  const segments: TimeSegment[] = ["dawn", "day", "dusk", "night"];
  const marks = outcome === "decisive_success" ? 2 : 1;
  const startingIndex = segments.indexOf(current.segment);
  const absolute = startingIndex + marks;
  const dayAdvance = Math.floor(absolute / segments.length);
  const to = segments[absolute % segments.length];
  const daysSinceLeaf = current.daysSinceLeaf + dayAdvance;
  const leafAdvanced = daysSinceLeaf >= 4;
  const message = leafAdvanced ? "หลายวันได้ทิ้งร่องรอยพอให้เปิด Page ใหม่" : dayAdvance ? "เรื่องยืดผ่านวันเดิมไปแล้ว" : `แสงรอบตัวเคลื่อนจาก ${current.segment} ไปสู่ ${to}`;
  const timeMark: TimeMark = { from: current.segment, to, advancedDays: dayAdvance, leafAdvanced, message };
  return { progression: { ...current, leaf: leafAdvanced ? current.leaf + 1 : current.leaf, segment: to, timeMarksSinceLeaf: leafAdvanced ? 0 : current.timeMarksSinceLeaf + marks, daysSinceLeaf: leafAdvanced ? 0 : daysSinceLeaf, lastTimeMark: timeMark }, timeMark, dayAdvance };
}

function advanceCampaignCalendar(campaign: CampaignContext, progression: ProgressionState, dayAdvance: number) {
  const seasons: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
  let year = campaign.year;
  let season = campaign.season;
  let day = campaign.day + dayAdvance;
  let currentAge = progression.currentAge;
  while (day > 30) {
    day -= 30;
    const nextIndex = (seasons.indexOf(season) + 1) % seasons.length;
    if (season === "Winter") year += 1;
    season = seasons[nextIndex];
    if (year > progression.campaignStartYear && season === progression.birthSeason) currentAge += 1;
  }
  return { campaign: { ...campaign, year, season, day }, progression: { ...progression, currentAge } };
}

function progressActiveMission(state: GameState, record: RollRecord): { missions: Mission[]; inventory: InventoryItem[]; transaction?: ExchangeRecord; update?: RollRecord["missionUpdate"] } {
  const mission = state.missions.find((entry) => entry.state === "offered" || entry.state === "active");
  if (!mission?.progress || record.outcome === "failure_with_consequence") return { missions: state.missions, inventory: state.character.inventory };
  const gained = record.outcome === "decisive_success" ? 2 : 1;
  const current = Math.min(mission.progress.required, mission.progress.current + gained);
  const resolved = current >= mission.progress.required;
  const rewardItem = resolved && mission.progress.rewardItem ? { ...mission.progress.rewardItem, id: `mission-reward-${mission.id}-${record.id}` } : undefined;
  const reward = resolved ? mission.reward : undefined;
  const updated: Mission = { ...mission, state: resolved ? "resolved" : "active", progress: { ...mission.progress, current, resolvedBy: resolved ? record.id : mission.progress.resolvedBy, rewardGranted: resolved || mission.progress.rewardGranted } };
  const transaction = resolved ? { id: `tx-mission-${mission.id}-${record.id}`, kind: "favor" as const, title: `ผลของงาน: ${mission.title}`, counterpart: mission.issuer, payment: "การกระทำในฉาก", witness: state.currentScene.speaker || mission.issuer, consequence: reward ?? "งานเปลี่ยนสถานะ", tick: record.tick } : undefined;
  return { missions: state.missions.map((entry) => entry.id === mission.id ? updated : entry), inventory: rewardItem ? [...state.character.inventory, rewardItem] : state.character.inventory, transaction, update: { missionId: mission.id, current, required: mission.progress.required, state: updated.state, reward } };
}

export function applyRoll(state: GameState, record: RollRecord): GameState {
  const copy = outcomeCopy[record.outcome];
  const success = record.outcome !== "failure_with_consequence";
  const initialProgression = state.progression ?? defaultProgression(state.campaign, state.character.identity.includes("สิบสาม") ? 13 : 20, state.campaign.season);
  const awarded = awardPractice(state.character.masteries, record);
  const clock = advanceClock(initialProgression, record.outcome);
  const calendar = advanceCampaignCalendar(state.campaign, clock.progression, clock.dayAdvance);
  const missionResult = progressActiveMission(state, record);
  const activeMission = state.missions.find((entry) => entry.state === "offered" || entry.state === "active");
  const momentumSource = record.momentumSource;
  const inventoryAfterMomentum = momentumSource?.kind === "item" && momentumSource.itemId
    ? missionResult.inventory.map((entry) => entry.id === momentumSource.itemId ? { ...entry, condition: "used" as const } : entry)
    : missionResult.inventory;
  const updatedCharacter: Character = {
    ...state.character,
    masteries: awarded.masteries,
    inventory: inventoryAfterMomentum,
    vitals: {
      ...state.character.vitals,
      momentum: Math.max(0, state.character.vitals.momentum - (record.momentumSpent ? 1 : 0)),
      focus: momentumSource?.kind === "vital" ? Math.max(0, state.character.vitals.focus - 1) : state.character.vitals.focus,
    },
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
  const missions = missionResult.missions;
  const nextScene: Scene = {
    ...state.currentScene,
    id: `scene-${record.id}`,
    chapter: `Page ${String(record.tick).padStart(2, "0")}`,
    title: success ? "ราคาของคำตอบ" : "สิ่งที่โลกไม่ยอมลืม",
    body: success
      ? [
          record.narrative,
          `คำตอบของเจ้าทำให้งาน “${activeMission?.title ?? "ภารกิจ"}” ขยับไปข้างหน้า ผู้คนที่เคยยืนเงียบอยู่ข้างเสาเริ่มหันมามองกันเอง เพราะไม่มีใครคิดว่าคำพูดเพียงไม่กี่ประโยคจะเปลี่ยนน้ำหนักของเรื่องได้เร็วขนาดนี้.`,
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
  const storedRecord: RollRecord = { ...record, practice: awarded.practice, timeMark: clock.timeMark, missionUpdate: missionResult.update };
  const momentumMemory = record.momentumSpent && momentumSource ? [{ id: `momentum-${record.id}`, kind: "actor_relation" as const, title: `แรงฮึด: ${momentumSource.label}`, detail: `${momentumSource.note} · ${momentumSource.cost}`, tick: record.tick, tone: "ochre" as const }] : [];
  return { ...state, campaign: calendar.campaign, progression: { ...calendar.progression, lastPractice: awarded.practice }, character: updatedCharacter, currentScene: nextScene, missions, economy: missionResult.transaction ? { ...state.economy, transactions: [...state.economy.transactions, missionResult.transaction] } : state.economy, memories: [...state.memories, memory, ...momentumMemory], rolls: [...state.rolls, storedRecord], tick: record.tick };
}

export function buyMarketOffer(state: GameState, offerId: string): { state: GameState; message: string } {
  const offer = state.market.find((entry) => entry.id === offerId);
  if (!offer || !offer.available) return { state, message: "รายการนี้ไม่พร้อมแล้ว" };
  const canUseSafehouseCredit = offer.id === "saika-medicine" && state.economy.obligations.some((entry) => entry.id === "debt-safehouse-rations" && entry.status === "open");
  const paidOnCredit = state.character.resources.property < offer.price && canUseSafehouseCredit;
  if (state.character.resources.property < offer.price && !paidOnCredit) return { state, message: "ทรัพย์สินไม่พอ · ลองเจรจา รับงาน หรือใช้เครดิตแทน" };
  const inventory = offer.kind === "goods" ? [...state.character.inventory, { ...item(`market-${offer.id}-${Date.now()}`, offer.label, "reserve", offer.note, offer.slots ?? 1, ["unlock"], { value: 1, tags: [offer.id] }), location: "carried" as const, ownership: "owned" as const }] : state.character.inventory;
  const transaction: ExchangeRecord = { id: `tx-${offer.id}-${Date.now()}`, kind: paidOnCredit ? "debt" : offer.kind === "service" ? "service" : "purchase", title: offer.kind === "service" ? `จ้าง ${offer.label}` : `รับ ${offer.label} จากตลาด`, counterpart: paidOnCredit ? "เซฟเฮาส์ของไซกะ" : offer.kind === "service" ? offer.label : state.economy.marketTitle, payment: paidOnCredit ? `ค้างหนี้เซฟเฮาส์ · ทรัพย์สิน ${offer.price}` : `ทรัพย์สิน ${offer.price}`, witness: paidOnCredit ? "กันทาโร่รับรู้การค้ำ" : "คนในตลาดที่มองเห็นการแลกเปลี่ยน", consequence: paidOnCredit ? `ยอดค้างของเซฟเฮาส์เพิ่มขึ้นจาก ${offer.label}` : offer.priceReason ?? offer.note, tick: state.tick };
  const memory: WorldMemory = { id: `memory-${transaction.id}`, kind: "market_change", title: transaction.title, detail: `${transaction.payment}; ${transaction.consequence}`, tick: state.tick, tone: "ochre" };
  return {
    state: { ...state, character: { ...state.character, resources: { ...state.character.resources, property: paidOnCredit ? state.character.resources.property : state.character.resources.property - offer.price }, inventory }, market: state.market.map((entry) => entry.id === offer.id ? { ...entry, available: false } : entry), economy: { ...state.economy, obligations: paidOnCredit ? state.economy.obligations.map((entry) => entry.id === "debt-safehouse-rations" ? { ...entry, note: `${entry.note} · รับ ${offer.label} เพิ่มโดยกันทาโร่ค้ำ`, due: "ก่อนออกจากที่ซ่อน หรือเมื่อกันทาโร่ทวง" } : entry) : state.economy.obligations, transactions: [...state.economy.transactions, transaction] }, memories: [...state.memories, memory] },
    message: paidOnCredit ? `รับ ${offer.label} แบบค้ำประกันแล้ว · หนี้เซฟเฮาส์เพิ่มขึ้น` : offer.kind === "goods" ? `ซื้อ ${offer.label} แล้ว` : `ใช้บริการ: ${offer.label}`,
  };
}
