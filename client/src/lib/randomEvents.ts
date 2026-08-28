/* ==========================================================================
 * Random Events engine — 45 เหตุการณ์สุ่มสากล (ทุกฤดู/ทุกสถานที่/ทุกอาชีพ)
 *
 * กติกาเหนียวแน่น (ตาม selection_policy ใน shared/data/random-events.json):
 *  - ENGINE สุ่มเองแบบ deterministic จาก seed (tick/day/year) — ไม่ใช้ Math.random()
 *  - AI GM เล่าเหตุการณ์ได้เท่านั้น ห้ามเลือกผลหรือแก้ state
 *  - ผลทุก effect ถูกใช้ผ่าน reducer ของ engine เท่านั้น (applyRandomEventChoice)
 *  - cooldown_days + eventHistory กันเหตุการณ์ซ้ำถี่เกิน
 * ========================================================================== */
import eventsData from "../../../shared/data/random-events.json";
import { applyEventEffects, defaultProgression, type GameState, type Mission } from "./game";

export type EventEffect = { type: string; amount?: number; target?: string; template?: string; value?: string };
export type EventChoice = { id: string; check: { stat: string; tags: string[] }; effects: EventEffect[] };
export type RandomEvent = {
  event_id: string;
  title: string;
  location_scope: string;
  location_types: string[];
  seasons: string[];
  weather_tags: string[];
  era_range: [number, number];
  occupation_tags: string[];
  weight: number;
  cooldown_days: number;
  repeat_policy: string;
  historical_fence: string;
  historical_basis?: string;
  choices: EventChoice[];
  memory_key: string;
  tags: string[];
};

export type EventHistoryEntry = { eventId: string; day: number };

export const ALL_RANDOM_EVENTS: RandomEvent[] = (eventsData as unknown as { events: RandomEvent[] }).events;

/** FNV-1a hash — seed แบบ deterministic จากตัวเลขหลายค่า */
export function hashSeed(...values: number[]): number {
  let hash = 2166136261;
  for (const value of values) {
    hash ^= Math.imul(value | 0, 2654435761);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** LCG — ตัวสุ่มแบบ deterministic (ค่าเดิม = ผลเดิมเสมอ) */
export function makeRng(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** แปลงชื่อสถานที่ (ไทย/อังกฤษ) เป็น location_types ของ event pool */
export function mapLocationToTypes(location: string): string[] {
  const text = location.toLocaleLowerCase();
  const types: string[] = [];
  const add = (t: string) => { if (!types.includes(t)) types.push(t); };
  if (/ท่าเรือ|ท่า|ทะเล|ชายฝั่ง|port|coast|harbor/.test(text)) { add("port"); add("coast"); add("sea_route"); }
  if (/ตลาด|market|shop/.test(text)) add("market");
  if (/ด่าน|ป้อม|checkpoint|gate/.test(text)) { add("checkpoint"); add("castle"); add("road"); }
  if (/หมู่บ้าน|บ้าน|village|hamlet/.test(text)) add("village");
  if (/ปราสาท|ปราการ|castle|keep/.test(text)) add("castle");
  if (/วัด|ศาล|temple|shrine/.test(text)) add("temple");
  if (/ช่องเขา|ภูเขา|เขา|mountain|pass/.test(text)) add("mountain_pass");
  if (/ป่า|forest|wood/.test(text)) add("forest");
  if (/เหมือน|mine/.test(text)) add("mine");
  if (/เรือ|sea|ship/.test(text)) add("sea_route");
  if (/ค่าย|camp|barracks/.test(text)) add("camp");
  if (/นา|ทุ่ง|rice|field/.test(text)) add("rice_field");
  if (/เตา|โรง|อู่|workshop|forge/.test(text)) add("workshop");
  if (/ทาง|ถนน|เส้นทาง|road|route|trail/.test(text)) add("road");
  return types;
}

export type SelectRandomEventInput = {
  season: string;
  year: number;
  location: string;
  day: number;
  tick: number;
  eventHistory?: EventHistoryEntry[];
};

/** เลือกเหตุการณ์แบบ deterministic — กรองฤดู/ยุค/สถานที่/cooldown แล้วสุ่มตาม weight */
export function selectRandomEvent(input: SelectRandomEventInput): RandomEvent | null {
  const locationTypes = mapLocationToTypes(input.location);
  const fallbackTypes = ["road", "village"];
  const lastSeenByEvent = new Map<string, number>();
  for (const entry of input.eventHistory ?? []) {
    const seen = lastSeenByEvent.get(entry.eventId);
    if (seen === undefined || entry.day > seen) lastSeenByEvent.set(entry.eventId, entry.day);
  }

  const eligible = ALL_RANDOM_EVENTS.filter((event) => {
    if (!event.seasons.includes(input.season)) return false;
    const [eraStart, eraEnd] = event.era_range;
    if (input.year < eraStart || input.year > eraEnd) return false;
    if (!event.occupation_tags.includes("all")) return false;
    const matchesLocation = event.location_types.some((type) => locationTypes.includes(type));
    const matchesFallback = event.location_types.some((type) => fallbackTypes.includes(type));
    if (!matchesLocation && !matchesFallback) return false;
    const lastSeen = lastSeenByEvent.get(event.event_id);
    if (lastSeen !== undefined && input.day - lastSeen < event.cooldown_days) return false;
    return true;
  });

  if (eligible.length === 0) return null;
  const rng = makeRng(hashSeed(input.tick, input.day, input.year));
  const totalWeight = eligible.reduce((sum, event) => sum + Math.max(1, event.weight), 0);
  let roll = rng() * totalWeight;
  for (const event of eligible) {
    roll -= Math.max(1, event.weight);
    if (roll <= 0) return event;
  }
  return eligible[eligible.length - 1];
}

/** ทางเลือกแบบใช้ผลทันที — ยังคงไว้ผ่าน reducer เดียวกัน */
export function applyRandomEventChoice(state: GameState, choiceId: string): GameState {
  const pending = state.pendingRandomEvent;
  if (!pending) return state;
  const choice = pending.choices.find((entry) => entry.id === choiceId);
  if (!choice) return state;
  const after = applyEventEffects({ ...state, pendingRandomEvent: undefined }, pending.title, choice.effects, state.tick);
  const history: EventHistoryEntry[] = [...(state.progression?.eventHistory ?? []), { eventId: pending.event_id, day: state.campaign.day }].slice(-80);
  return { ...after, progression: { ...(after.progression ?? state.progression!), eventHistory: history } };
}

/** ชื่อไทยของทางเลือก — ตัวที่ไม่อยู่ในคลังจะสร้างจาก id */
const CHOICE_LABELS: Record<string, string> = {
  help_repair: "ช่วยซ่อม", pay_passage: "จ่ายค่าผ่านทาง", bypass_mud: "ลัดเลาะโคลน", wait_dry: "รอให้แห้ง",
  join_festival: "ร่วมงานเทศกาล", network_nobles: "เก็บข่าวในงาน", sell_snacks: "ขายขนม", avoid_crowd: "หลบฝูงชน",
  buy_seed: "ซื้อเมล็ดพันธุ์", warn_villagers: "เตือนชาวบ้าน", ignore: "เมินผ่าน", broker_deal: "เป็นนายหน้า",
  search_crew: "ตามหาลูกเรือ", replace_self: "ลงแรงแทน", report_captain: "รายงานกัปตัน", ignore_departure: "ปล่อยผ่าน",
  deliver_letter: "ส่งจดหมาย", read_contents: "อ่านเนื้อความ", sell_letter: "ขายจดหมาย", burn_letter: "เผาทิ้ง",
  comply_work: "ยอมลงแรง", bribe_exemption: "ติดสินบนให้พ้นเกณฑ์", forge_exemption: "ปลอมเอกสาร", flee_village: "หนีออกจากหมู่บ้าน",
  help_drain: "ช่วยระบายน้ำ", offer_expertise: "เสนอความรู้", pass_through: "ลอดผ่านไป", demand_payment: "ทวงค่าตอบแทน",
  guide_caravan: "นำทางขบวน", share_food: "แบ่งอาหาร", rob_caravan: "ปล้นขบวน", avoid_pilgrims: "เลี่ยงขบวน",
  help_extinguish: "ช่วยดับไฟ", evacuate: "อพยพคน", loot_abandoned: "ล้วงของที่ถูกทิ้ง", watch_distance: "ดูไกลๆ",
  deliver_materials: "ส่งวัสดุลับ", refuse_job: "ปฏิเสธงาน", probe_client: "สืบลูกค้า", tip_off: "แจ้งเบาะแส",
  wait_flood: "รอน้ำลด", pay_boatman: "จ่ายคนพาย", cross_risk: "ข้ามแบบเสี่ยง", find_alternate: "หาทางเลือกใหม่",
  tend_injured: "ดูแลคนเจ็บ", question_info: "ถามหาข่าว", rob_bloodied: "ปล้นคนบาดเจ็บ", walk_past: "เดินผ่าน",
  defend_village: "สู้ปกป้องหมู่บ้าน", help_evacuate: "ช่วยอพยพ", hide_and_watch: "ซ่อนดูสถานการณ์", join_bandits: "ร่วมกับโจร",
  break_ice: "ตีน้ำแข็ง", wait_thaw: "รอน้ำแข็งละลาย", travel_overland: "เดินลัดบก", bribe_icebreaker: "จ้างคนตีน้ำแข็ง",
  share_supplies: "แบ่งเสบียง", hoard_food: "กกอาหารไว้", steal_supplies: "ขโมยเสบียง", help_refugees: "ช่วยผู้ลี้ภัย",
  guide_shelter: "พาไปที่พัก", rob_refugees: "ปล้นผู้ลี้ภัย", avoid_involvement: "ไม่ยุ่ง", buy_weapon: "ซื้ออาวุธ",
  report_black_market: "แจ้งตลาดมืด", ignore_market: "เดินผ่านตลาดมืด", fetch_firewood: "ไปหาฟืน", share_fuel: "แบ่งเชื้อเพลิง",
  leave_cold: "ทิ้งไว้ในความหนาว", hire_desperate: "รับคนที่ถูกปลด", seek_enlistment: "สมัครเข้ากอง", loot_deserters: "ล้วงของทหารหนี",
  side_captain: "อยู่ข้างกัปตัน", side_mutineers: "อยู่ข้างคนกบฏ", mediate_peace: "เข้าไกล่เกลี่ย", abandon_ship: "ทิ้งเรือ",
  defend_fire: "สู้ปกป้องเตาไฟ", feed_wolves: "โยนอาหารให้หมาป่า", climb_tree: "ปีนต้นไม้", light_torches: "จุดคบเพลิง",
};

export function humanizeChoiceLabel(choiceId: string): string {
  return CHOICE_LABELS[choiceId] ?? choiceId.replace(/_/g, " ").replace(/^\w/, (ch) => ch.toUpperCase());
}

/** สรุปผลดี/ร้ายของทางเลือก เป็นข้อความไทย */
export function summarizeEffects(effects: EventEffect[]): { reward: string; risk: string } {
  const rewardParts: string[] = [];
  const riskParts: string[] = [];
  for (const effect of effects) {
    const amount = effect.amount ?? 0;
    const target = effect.target ?? "";
    if (amount > 0 || effect.type === "rumor" || effect.type === "information" || effect.type === "obligation") {
      const names: Record<string, string> = { currency: `เงิน +${amount}`, food: `อาหาร +${amount}`, blood: `เลือด +${amount}`, focus: `สมาธิ +${amount}`, reputation: `ความน่าเชื่อถือ (${target}) +${amount}`, time: `อยู่นานขึ้น ${amount} วัน`, information: "ได้ข่าวสาร", rumor: "ได้ข่าวลือ", obligation: "ได้ผู้สนับสนุนใหม่" };
      rewardParts.push(names[effect.type] ?? `${effect.type} +${amount}`);
    }
    if (amount < 0 || effect.type === "heat") {
      const names: Record<string, string> = { currency: `เงิน ${amount}`, food: `อาหาร ${amount}`, blood: `เลือด ${amount}`, focus: `สมาธิ ${amount}`, reputation: `ความน่าเชื่อถือ (${target}) ${amount}`, time: `เสียเวลา ${Math.abs(amount)} วัน`, heat: `Heat พุ่ง +${amount}` };
      riskParts.push(names[effect.type] ?? `${effect.type} ${amount}`);
    }
  }
  return { reward: rewardParts.join(" · ") || "ไม่มีโบนัสพิเศษ", risk: riskParts.join(" · ") || "ไม่มีความเสี่ยงพิเศษ" };
}

function defaultProgressionFrom(state: GameState) {
  return state.progression ?? defaultProgression(state.campaign);
}

/** ผู้เล่นกดเลือกทางในหน้าต่างเหตุการณ์ → รับเป็น "เควสเหตุการณ์" (ไม่ทอย ไม่ใช้ผลทันที) */
export function acceptRandomEventQuest(state: GameState, choiceId: string): GameState {
  const pending = state.pendingRandomEvent;
  if (!pending) return state;
  const choice = pending.choices.find((entry) => entry.id === choiceId);
  if (!choice) return state;
  const label = humanizeChoiceLabel(choice.id);
  const { reward, risk } = summarizeEffects(choice.effects);
  const quest: Mission = {
    id: `revent-${pending.event_id}-${state.tick}`,
    issuer: "เหตุการณ์บนเส้นทาง",
    issuerType: "commoner",
    title: pending.title,
    request: label,
    pressure: risk,
    deadline: "ภายในไม่กี่วัน",
    state: "active",
    role: "side",
    visibility: "visible",
    challenge: "ordinary",
    reward,
    risk,
    options: [label],
    progress: { current: 0, required: 2, triggerPhrases: [label, ...choice.check.tags], rewardItem: { label: `${pending.title} · ของฝาก`, kind: "reserve", slots: 1, description: reward, functions: ["bonus"], condition: "usable" } },
    randomEvent: { eventId: pending.event_id, choiceId: choice.id, effects: choice.effects },
  };
  const history: EventHistoryEntry[] = [...(state.progression?.eventHistory ?? []), { eventId: pending.event_id, day: state.campaign.day }].slice(-80);
  return {
    ...state,
    pendingRandomEvent: undefined,
    missions: [...state.missions, quest],
    progression: { ...defaultProgressionFrom(state), eventHistory: history },
  };
}

/** ปัดปฏิเสธเหตุการณ์ — หายไปเฉยๆ แต่จด cooldown ไว้ */
export function rejectRandomEventQuest(state: GameState): GameState {
  const pending = state.pendingRandomEvent;
  if (!pending) return state;
  const history: EventHistoryEntry[] = [...(state.progression?.eventHistory ?? []), { eventId: pending.event_id, day: state.campaign.day }].slice(-80);
  return { ...state, pendingRandomEvent: undefined, progression: { ...defaultProgressionFrom(state), eventHistory: history } };
}

/** Hook สำหรับ applyRoll — สุ่มแบบ deterministic, โอกาสตายตัว 25% ต่อผลทอย */
export const RANDOM_EVENT_CHANCE = 0.25;
export function maybeTriggerRandomEvent(state: GameState): GameState {
  if (state.pendingRandomEvent) return state;
  const rng = makeRng(hashSeed(state.tick + 7, state.campaign.day, state.campaign.year));
  if (rng() >= RANDOM_EVENT_CHANCE) return state;
  const event = selectRandomEvent({
    season: state.campaign.season,
    year: state.campaign.year,
    location: state.currentScene.location,
    day: state.campaign.day,
    tick: state.tick,
    eventHistory: state.progression?.eventHistory,
  });
  if (!event) return state;
  return { ...state, pendingRandomEvent: { ...event, offeredDay: state.campaign.day } };
}
