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
import { applyVitalDelta, clampVital, type GameState, type WorldMemory } from "./game";

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

const randomMemory = (id: string, kind: WorldMemory["kind"], title: string, detail: string, tick: number, tone: WorldMemory["tone"]): WorldMemory => ({ id, kind, title, detail, tick, tone });

/** Reducer เดียวที่ใช้ผลเหตุการณ์สุ่มได้ — ผ่าน engine เท่านั้น (AI ห้ามเรียก/ห้ามแก้ state ตรง) */
export function applyRandomEventChoice(state: GameState, choiceId: string): GameState {
  const pending = state.pendingRandomEvent;
  if (!pending) return state;
  const choice = pending.choices.find((entry) => entry.id === choiceId);
  if (!choice) return state;

  let working: GameState = { ...state, pendingRandomEvent: undefined };
  const memories: WorldMemory[] = [];
  const tick = state.tick;

  for (const effect of choice.effects) {
    const amount = effect.amount ?? 0;
    switch (effect.type) {
      case "blood":
      case "focus":
        working = applyVitalDelta(working, effect.type, amount, `เหตุการณ์สุ่ม: ${pending.title}`, "rest");
        break;
      case "currency": {
        const currency = working.character.resources.currency ?? { unit: "mon" as const, amount: 0 };
        working = { ...working, character: { ...working.character, resources: { ...working.character.resources, currency: { unit: "mon", amount: Math.max(0, currency.amount + amount) } } } };
        break;
      }
      case "food": {
        const supplies = working.character.resources.supplies;
        working = { ...working, character: { ...working.character, resources: { ...working.character.resources, supplies: Math.max(0, supplies + amount) } } };
        break;
      }
      case "time":
        // วันถูกขยับโดย clock ของ engine ตามผลทอยอยู่แล้ว — เหตุการณ์สุ่มบันทึกเป็นความทรงจำแทน
        if (amount > 0) memories.push(randomMemory(`revent-time-${tick}-${memories.length}`, "news", pending.title, `เวลาผ่านไป ${amount} วันกับเหตุการณ์นี้`, tick, "ochre"));
        break;
      case "heat":
        memories.push(randomMemory(`revent-heat-${tick}-${memories.length}`, "stain", pending.title, `${effect.target ?? "local"} ร้อนขึ้น +${amount}`, tick, "vermilion"));
        break;
      case "reputation":
        memories.push(randomMemory(`revent-rep-${tick}-${memories.length}`, amount >= 0 ? "favor" : "stain", pending.title, `${effect.target ?? "local"} ${amount >= 0 ? "รู้สึกดีกับเจ้า" : "ไม่พอใจเจ้า"} (${amount > 0 ? "+" : ""}${amount})`, tick, amount >= 0 ? "teal" : "vermilion"));
        break;
      case "rumor":
        memories.push(randomMemory(`revent-rumor-${tick}-${memories.length}`, "news", pending.title, effect.value ?? "ข่าวลือใหม่เริ่มวิ่ง", tick, "ochre"));
        break;
      case "information":
        memories.push(randomMemory(`revent-info-${tick}-${memories.length}`, "news", pending.title, "ได้ข่าวจากเหตุการณ์นี้", tick, "teal"));
        break;
      case "obligation":
        memories.push(randomMemory(`revent-debt-${tick}-${memories.length}`, "debt", pending.title, `ผูกพันใหม่: ${effect.template ?? effect.target ?? "ผู้เกี่ยวข้อง"}`, tick, "ochre"));
        break;
      default:
        // medicine / เอฟเฟกต์อื่น — บันทึกเป็นความทรงจำ ยังไม่แตะทรัพยากรจริง
        memories.push(randomMemory(`revent-${effect.type}-${tick}-${memories.length}`, "news", pending.title, `${effect.type} ${amount > 0 ? "+" : ""}${amount}`, tick, "ochre"));
        break;
    }
  }

  const history: EventHistoryEntry[] = [...(state.progression?.eventHistory ?? []), { eventId: pending.event_id, day: state.campaign.day }].slice(-80);
  const clamp = (value: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, value));
  const social = {
    ...working.character.social,
    information: clamp(working.character.social.information + choice.effects.filter((entry) => entry.type === "information").reduce((sum, entry) => sum + (entry.amount ?? 0), 0), 0, 5),
    stain: clamp(working.character.social.stain + choice.effects.filter((entry) => entry.type === "heat").reduce((sum, entry) => sum + Math.max(0, entry.amount ?? 0), 0), 0, 5),
  };
  return {
    ...working,
    character: { ...working.character, social },
    memories: [...working.memories, ...memories],
    progression: { ...(working.progression ?? state.progression!), eventHistory: history },
  };
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
