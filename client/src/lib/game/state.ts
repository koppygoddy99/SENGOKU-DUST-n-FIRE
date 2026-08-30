/**
 * State mutations — pure reducers that build a new GameState from an input state.
 *
 * These functions are the single place where GameState is mutated. Sibling
 * modules (randomEvents, worldEvents) import the specific reducer they need from
 * here directly (instead of the `./game` barrel) to avoid a runtime import cycle.
 */
import type { GameState, VitalEvent, WorldMemory, ProgressionState, CampaignContext, Season, Character } from "./types";
import { VITAL_CAP } from "./engine";
import type { EventEffect } from "../randomEvents";

export function defaultProgression(context: CampaignContext, ageAtCampaignStart = 20, birthSeason: Season = context.season): ProgressionState {
  return { leaf: 1, segment: "day", timeMarksSinceLeaf: 0, daysSinceLeaf: 0, ageAtCampaignStart, currentAge: ageAtCampaignStart, birthSeason, campaignStartYear: context.year, growthPoints: 0, milestonePoints: 0, vitalEvents: [] };
}

export function clampVital(value: number, max: number): number { return Math.max(0, Math.min(max, Math.round(value))); }

export function vitalMaxes(character: Character) { return { maxBlood: Math.max(1, Math.min(VITAL_CAP, Math.round(character.vitals.maxBlood ?? 6))), maxFocus: Math.max(1, Math.min(VITAL_CAP, Math.round(character.vitals.maxFocus ?? 6))) }; }

export function applyVitalDelta(state: GameState, type: "blood" | "focus", delta: number, reason: string, source: VitalEvent["source"]): GameState { const m=vitalMaxes(state.character); const before=state.character.vitals[type]; const after=clampVital(before+delta, type === "blood" ? m.maxBlood : m.maxFocus); if(after===before) return state; const ev: VitalEvent={id:`vital-${state.tick}-${type}-${state.progression?.vitalEvents?.length ?? 0}`,type,delta:after-before,reason,source,tick:state.tick}; return {...state, character:{...state.character,vitals:{...state.character.vitals,maxBlood:m.maxBlood,maxFocus:m.maxFocus,[type]:after}}, progression:{...(state.progression ?? defaultProgression(state.campaign)), vitalEvents:[...(state.progression?.vitalEvents ?? []),ev].slice(-50)}}; }

/** milestone รับรางวัลได้ "ครั้งเดียว" ต่อ milestone_id — เคยให้แล้วระบบข้าม */
export function awardMilestonePoint(state: GameState, reason: string, milestoneId?: string): GameState { const p=state.progression ?? defaultProgression(state.campaign); if(milestoneId && (p.claimedMilestoneIds ?? []).includes(milestoneId)) return state; return {...state,progression:{...p,milestonePoints:(p.milestonePoints ?? 0)+1,claimedMilestoneIds: milestoneId ? Array.from(new Set([...(p.claimedMilestoneIds ?? []), milestoneId])) : p.claimedMilestoneIds}}; }

export function levelUpVital(state: GameState, choice: "max_blood" | "max_focus"): GameState { const p=state.progression ?? defaultProgression(state.campaign); if((p.milestonePoints ?? 0)<1) return state; const m=vitalMaxes(state.character); const blood=choice === "max_blood"; const next=Math.min(VITAL_CAP,(blood?m.maxBlood:m.maxFocus)+1); if(next > VITAL_CAP) return state; const type=blood?"blood":"focus"; const maxBlood=blood?next:m.maxBlood; const maxFocus=blood?m.maxFocus:next; return {...state,character:{...state.character,vitals:{...state.character.vitals,maxBlood,maxFocus,[type]:clampVital(state.character.vitals[type]+1,next)}},progression:{...p,milestonePoints:(p.milestonePoints ?? 0)-1,vitalEvents:[...(p.vitalEvents ?? []),{id:`level-up-${state.tick}-${choice}`,type,delta:1,reason:"ใช้ milestone เพิ่มเพดาน vitals",source:"milestone",tick:state.tick}]}}; }

/** ใช้ effects ของเหตุการณ์สุ่มผ่าน reducer ของ engine เท่านั้น (AI/UI ห้ามแก้ state ตรง) */
export function applyEventEffects(state: GameState, title: string, effects: EventEffect[], tick: number): GameState {  let working = state;
  const memories: WorldMemory[] = [];
  const remember = (kind: WorldMemory["kind"], detail: string, tone: WorldMemory["tone"]) => memories.push({ id: `revent-${tick}-${memories.length}`, kind, title, detail, tick, tone });
  for (const effect of effects) {
    const amount = effect.amount ?? 0;
    switch (effect.type) {
      case "blood":
      case "focus":
        working = applyVitalDelta(working, effect.type, amount, `เหตุการณ์สุ่ม: ${title}`, "rest");
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
        if (amount > 0) remember("news", `เวลาผ่านไป ${amount} วันกับเหตุการณ์นี้`, "ochre");
        break;
      case "heat":
        remember("stain", `${effect.target ?? "local"} ร้อนขึ้น +${amount}`, "vermilion");
        break;
      case "reputation":
        remember(amount >= 0 ? "favor" : "stain", `${effect.target ?? "local"} ${amount >= 0 ? "รู้สึกดีกับเจ้า" : "ไม่พอใจเจ้า"} (${amount > 0 ? "+" : ""}${amount})`, amount >= 0 ? "teal" : "vermilion");
        break;
      case "rumor":
        remember("news", effect.value ?? "ข่าวลือใหม่เริ่มวิ่ง", "ochre");
        break;
      case "information":
        remember("news", "ได้ข่าวจากเหตุการณ์นี้", "teal");
        break;
      case "obligation":
        remember("debt", `ผูกพันใหม่: ${effect.template ?? effect.target ?? "ผู้เกี่ยวข้อง"}`, "ochre");
        break;
      default:
        remember("news", `${effect.type} ${amount > 0 ? "+" : ""}${amount}`, "ochre");
        break;
    }
  }
  const clamp = (value: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, value));
  const social = {
    ...working.character.social,
    information: clamp(working.character.social.information + effects.filter((entry) => entry.type === "information").reduce((sum, entry) => sum + (entry.amount ?? 0), 0), 0, 5),
    stain: clamp(working.character.social.stain + effects.filter((entry) => entry.type === "heat").reduce((sum, entry) => sum + Math.max(0, entry.amount ?? 0), 0), 0, 5),
  };
  return { ...working, character: { ...working.character, social }, memories: [...working.memories, ...memories] };
}
