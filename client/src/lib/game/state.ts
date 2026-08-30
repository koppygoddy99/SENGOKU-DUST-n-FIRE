/**
 * State mutations — pure reducers that build a new GameState from an input state.
 *
 * These functions are the single place where GameState is mutated. Sibling
 * modules (randomEvents, worldEvents) import the specific reducer they need from
 * here directly (instead of the `./game` barrel) to avoid a runtime import cycle.
 */
import type { GameState, VitalEvent, WorldMemory, ProgressionState, CampaignContext, Season, Character, BilingualText, PublicRelationshipContact, PublicRelationshipEvent, Mission, MissionRole, MissionVisibility, MissionDirectiveInput, StoryRecord, StatXp, Attributes, EconomyState, MarketOffer, InventoryItem, InventoryCategory, StatId, RollRecord, MissionChangeNotice, MissionState, RelationshipTone } from "./types";
import { VITAL_CAP, STATS, canonicalDifficulty, normalizeStatValue, traitProgressNeededForLevel, normalizeMasteryProgress } from "./engine";
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
export const MAX_VISIBLE_ACTIVE_MAIN_THREADS = 1;
export const MAX_VISIBLE_ACTIVE_SIDE_LEADS = 2;

export const relationshipText = (en: string, th: string): BilingualText => ({ en, th });

const relationshipFoundationEvent = (contactId: PublicRelationshipContact["contactId"], title: BilingualText, detail: BilingualText, tone: PublicRelationshipEvent["tone"]): PublicRelationshipEvent => ({
  id: `relationship-foundation-${contactId}`,
  sourceType: "memory",
  sourceId: `relationship-foundation-${contactId}`,
  inGameDay: 1,
  tick: 1,
  title,
  detail,
  tone,
});

export function saikaRelationshipFoundationMemories(): WorldMemory[] {
  return [
    { id: "relationship-foundation-gantaro", kind: "actor_relation", title: "กันทาโร่รับซาเนฟุยุเข้ากลุ่ม", detail: "กันทาโร่ยอมรับฝีมือของซาเนฟุยุจากการประลอง แต่เหตุการณ์ที่ร้านเอจิยะทำให้ความไว้ใจลดลงอย่างเห็นได้ชัด", tick: 1, tone: "vermilion" },
    { id: "relationship-foundation-tokichi", kind: "actor_relation", title: "โทคิจิรู้สัญลักษณ์คูกิ", detail: "โทคิจิเป็นคู่หูเฉพาะกิจที่เคยร่วมรบและช่วยชีวิตซาเนฟุยุ เขารู้เรื่องสัญลักษณ์คูกิและชอบต่อรองค่าปิดปากเป็นเหล้า", tick: 1, tone: "ochre" },
    { id: "relationship-foundation-masakichi", kind: "actor_relation", title: "มาซาคิจิยังระวังซาเนฟุยุ", detail: "มาซาคิจกับซาเนฟุยุเคยพากันรอดมาได้ แต่เขายังไม่ลืมเหตุที่ถูกหลอกและเกือบเสียชีวิต", tick: 1, tone: "navy" },
    { id: "relationship-foundation-genshiro", kind: "actor_relation", title: "เก็นชิโร่ตามหาผู้หักดาบ", detail: "เก็นชิโร่ต้องการตามตัวซาเนฟุยุหลังเหตุหักดาบ แต่ยังไม่มีหลักฐานว่าเขามาถึงซาไกแล้ว", tick: 1, tone: "vermilion" },
  ];
}

/** Public-only contact cards, based solely on the player-visible NPC source material. */
export function saikaPublicRelationships(): PublicRelationshipContact[] {
  const gantaroEvent = relationshipFoundationEvent("gantaro", relationshipText("Gantaro accepted Sanefuyu into the Saika group", "กันทาโร่รับซาเนฟุยุเข้ากลุ่ม"), relationshipText("He recognized your skill after the trial, yet the affair at Echiya has visibly thinned his trust.", "เขายอมรับฝีมือจากการประลอง แต่เหตุที่ร้านเอจิยะทำให้ความไว้ใจลดลงอย่างเห็นได้ชัด"), "vermilion");
  const tokichiEvent = relationshipFoundationEvent("tokichi", relationshipText("Tokichi knows the Kuki mark", "โทคิจิรู้สัญลักษณ์คูกิ"), relationshipText("A companion in danger who knows your secret and turns silence into a bargain for drink.", "คู่หูยามคับขันที่รู้ความลับและมักต่อรองค่าปิดปากเป็นเหล้า"), "ochre");
  const masakichiEvent = relationshipFoundationEvent("masakichi", relationshipText("Masakichi has not forgotten", "มาซาคิจิยังไม่ลืม"), relationshipText("You survived together, but he remembers the deceit that nearly cost him his life.", "พวกเจ้ารอดมาด้วยกัน แต่เขายังจำเหตุที่เคยถูกหลอกและเกือบเสียชีวิต"), "navy");
  const genshiroEvent = relationshipFoundationEvent("genshiro", relationshipText("Genshiro seeks the one who broke his sword", "เก็นชิโร่ตามหาผู้หักดาบ"), relationshipText("He seeks to restore his honor after the broken sword, though you do not know whether he has reached Sakai.", "เขาต้องการกู้เกียรติหลังเหตุหักดาบ แต่ยังไม่รู้ว่าเขามาถึงซาไกหรือยัง"), "vermilion");
  return [
    {
      contactId: "gantaro", nameTh: "กันทาโร่", nameEn: "Gantaro", iconKey: "gantaro", colorTone: "navy",
      publicStatus: relationshipText("Saika checkpoint captain and small-unit leader", "หัวหน้าด่าน/หัวหน้ากลุ่มย่อยของไซกะ"),
      publicPersona: [relationshipText("Large and hard-built, with gunpowder soot on a cotton-covered dō-maru, a chipped tooth, and a well-used jingasa.", "ร่างใหญ่แข็งแรง เกราะโดมารุทับผ้าฝ้ายมีคราบเขม่าปืน ฟันบิ่นหนึ่งซี่ และหมวกจินงาสะที่ผ่านการใช้งานจริง"), relationshipText("Blunt, loud, and quick to judge a person by their stance and the way they hold a weapon.", "โผงผาง พูดดัง และมักประเมินคนจากท่ายืนกับการจับอาวุธ")],
      earnedKnowledge: [relationshipText("He accepted your ability after the trial, but his trust has declined since the Echiya affair.", "เขายอมรับฝีมือจากการประลอง แต่ความไว้ใจลดลงหลังเหตุที่ร้านเอจิยะ")],
      blankSpace: [relationshipText("What does he truly value when he judges a person, and where is the edge of his patience for your mistakes?", "ลึก ๆ แล้วเขาให้คุณค่ากับคนจากอะไร และเส้นแบ่งความอดทนต่อความผิดพลาดของเจ้าอยู่ตรงไหน?")],
      relationshipRole: relationshipText("Employer", "นายจ้าง"), familiarity: 3, affinity: -1,
      visibleSummary: relationshipText("The safehouse still shelters you, but trust is no longer freely given.", "ที่ซ่อนยังคุ้มครองเจ้าอยู่ แต่ความไว้ใจไม่ถูกมอบให้ง่ายเหมือนเดิม"), events: [gantaroEvent],
    },
    {
      contactId: "tokichi", nameTh: "โทคิจิ", nameEn: "Tokichi", iconKey: "tokichi", colorTone: "ochre",
      publicStatus: relationshipText("Saika hired fighter assigned to the Sakai affair", "ทหารรับจ้างไซกะผู้ร่วมภารกิจซาไก"),
      publicPersona: [relationshipText("Lean, yellow-toothed, and rarely far from his spear.", "ผอมแกร็น ฟันเหลือง และหอกมักติดมือเสมอ"), relationshipText("He waits by posts or in dark corners, jokes and bargains, and retreats when danger turns sharp.", "ชอบยืนพิงเสาหรือหลบตามมุมมืด เล่นมุก ต่อรองเก่ง และพร้อมถอยเมื่อสถานการณ์เริ่มเสี่ยง")],
      earnedKnowledge: [relationshipText("A partner in danger who knows your Kuki mark and regularly asks for drink as the price of silence.", "สหายร่วมรบที่รู้ความลับเรื่องสัญลักษณ์คูกิ และมักรีดค่าปิดปากเป็นเหล้า")],
      blankSpace: [relationshipText("Does his loyalty have a breaking point, and what would make him betray you or keep silent for good?", "ใต้ความขี้ขลาดและเห็นแก่เงิน เขามีเส้นตายความภักดีหรือไม่ อะไรจะทำให้เขาหักหลังหรือปิดปากเงียบอย่างแท้จริง?")],
      relationshipRole: relationshipText("Companion of necessity", "คู่หูเฉพาะกิจ"), familiarity: 3, affinity: 0,
      visibleSummary: relationshipText("He knows too much, but has not yet chosen to spend that knowledge against you.", "เขารู้มากเกินไป แต่ยังไม่เลือกใช้ความรู้นั้นเล่นงานเจ้า"), events: [tokichiEvent],
    },
    {
      contactId: "masakichi", nameTh: "มาซาคิจิ", nameEn: "Masakichi", iconKey: "masakichi", colorTone: "teal",
      publicStatus: relationshipText("Saika gun repairer; formerly a bell and metal worker from Mino", "ช่างซ่อมปืนในค่ายไซกะ อดีตช่างหล่อระฆังและช่างโลหะจากมิโนะ"),
      publicPersona: [relationshipText("Slightly stooped, with scarred fingers hardened by burns and metal.", "ไหล่ค่อมเล็กน้อย นิ้วแข็งกระด้าง มีรอยไหม้และคราบโลหะฝังแน่นที่มือ"), relationshipText("He speaks slowly while his attention remains on tools and the fit of a gun's parts.", "มักพูดช้า ๆ ขณะสายตาจดจ่ออยู่กับเครื่องมือและความพอดีของชิ้นส่วนปืน")],
      earnedKnowledge: [relationshipText("You survived together and trust has begun to grow, but he remembers that you once deceived him and nearly killed him.", "พวกเจ้าพากันเอาชีวิตรอดจนความไว้ใจเริ่มเพิ่มขึ้น แต่เขายังจำได้ว่าเจ้าเคยหลอกและเกือบฆ่าเขา")],
      blankSpace: [relationshipText("What binds him to the Oda network, and what would earn the help of a person wary of being used?", "อดีตของเขากับเครือข่ายโอดะคืออะไร และต้องใช้อะไรจึงจะซื้อใจคนที่กลัวการถูกหลอกใช้ให้ยอมช่วยงานอันตราย?")],
      relationshipRole: relationshipText("Wary ally", "พันธมิตรที่ระแวงกัน"), familiarity: 2, affinity: -1,
      visibleSummary: relationshipText("You have shared survival, not yet easy faith.", "เจ้าร่วมรอดมาได้ด้วยกัน แต่ยังไม่ใช่ความไว้ใจที่ง่ายดาย"), events: [masakichiEvent],
    },
    {
      contactId: "genshiro", nameTh: "เก็นชิโร่", nameEn: "Genshiro", iconKey: "genshiro", colorTone: "vermilion",
      publicStatus: relationshipText("Samurai overseeing supplies at the port of Toba", "ซามูไรผู้ดูแลเสบียงท่าเรือโทบะ"),
      publicPersona: [relationshipText("Immaculately kept clothing, weapons, and equipment.", "แต่งกายเป็นระเบียบเรียบร้อย อาวุธและอุปกรณ์ได้รับการดูแลอย่างดีเยี่ยม"), relationshipText("Controlled even in anger, he speaks in the decisive register of orders and duty.", "นิ่งและควบคุมอารมณ์ได้ดีแม้กำลังโกรธ พูดจาเด็ดขาดแบบออกคำสั่งและเน้นย้ำเรื่องยศกับหน้าที่")],
      earnedKnowledge: [relationshipText("You broke his sword. He seeks to hunt you down and return you for punishment, but there is no certain sign that he has reached Sakai.", "เจ้าเคยหักดาบของเขา เขาต้องการล่าตัวเจ้ากลับไปรับโทษ แต่ยังไม่มีเบาะแสแน่ชัดว่าเขาตามมาถึงซาไกหรือยัง")],
      blankSpace: [relationshipText("If his discipline is only the outer surface, what could finally make this controlled samurai lose command of himself?", "หากความเจ้าระเบียบคือเปลือกนอก อะไรจะทำให้ซามูไรผู้คุมสติตัวเองได้ดีคนนี้สติแตกในที่สุด?")],
      relationshipRole: relationshipText("Personal adversary", "ศัตรูคู่อาฆาต"), familiarity: 1, affinity: -3,
      visibleSummary: relationshipText("His pursuit is personal; his present distance from Sakai remains unknown.", "การตามล่าของเขาเป็นเรื่องส่วนตัว แต่ระยะห่างของเขาจากซาไกยังไม่แน่ชัด"), events: [genshiroEvent],
    },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function readText(value: unknown, fallback: BilingualText): BilingualText { return isRecord(value) && typeof value.en === "string" && typeof value.th === "string" ? { en: value.en, th: value.th } : fallback; }
function clampRelationship(value: unknown, minimum: number, maximum: number, fallback: number): number { return typeof value === "number" && Number.isFinite(value) ? Math.max(minimum, Math.min(maximum, Math.round(value))) : fallback; }

function missionIsOpen(mission: Mission) {
  return mission.state === "offered" || mission.state === "active";
}

export function missionRoleOf(mission: Mission): MissionRole {
  return mission.role ?? "main";
}

export function missionVisibilityOf(mission: Mission): MissionVisibility {
  return mission.visibility ?? "visible";
}

/**
 * This enforces campaign structure at the save boundary. It never invents a
 * story: malformed legacy excess threads are kept as hidden side leads rather
 * than silently discarded.
 */
export function normalizeMissionThreads(missions: Mission[]): Mission[] {
  let openMainCount = 0;
  let visibleSideCount = 0;
  return missions.map((mission, index) => {
    let role: MissionRole = mission.role ?? (index === 0 ? "main" : "side");
    let visibility: MissionVisibility = mission.visibility ?? "visible";
    if (missionIsOpen(mission) && role === "main") {
      if (openMainCount >= MAX_VISIBLE_ACTIVE_MAIN_THREADS) {
        role = "side";
        visibility = "hidden";
      } else {
        openMainCount += 1;
      }
    }
    if (missionIsOpen(mission) && role === "side" && visibility === "visible") {
      if (visibleSideCount >= MAX_VISIBLE_ACTIVE_SIDE_LEADS) visibility = "hidden";
      else visibleSideCount += 1;
    }
    return { ...mission, role, visibility };
  });
}

export function activeMainMission(state: Pick<GameState, "missions">): Mission | undefined {
  return state.missions.find((mission) => missionIsOpen(mission) && missionRoleOf(mission) === "main" && missionVisibilityOf(mission) === "visible");
}

export function visibleSideLeads(state: Pick<GameState, "missions">): Mission[] {
  return state.missions.filter((mission) => missionIsOpen(mission) && missionRoleOf(mission) === "side" && missionVisibilityOf(mission) === "visible");
}

function compactTerms(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length >= 2))).slice(0, 8);
}

function directiveText(input: MissionDirectiveInput) {
  return [input.reason, ...input.evidence, input.replacement?.title, input.replacement?.giver, input.replacement?.objective, input.replacement?.pressure, input.replacement?.reward, input.replacement?.risk, ...(input.replacement?.options ?? [])].filter(Boolean).join(" ").toLowerCase();
}

/** Refuses an obvious violent betrayal of a person protected by an open thread. */
export function missionDirectiveIsCanonConsistent(state: Pick<GameState, "missions">, directive: MissionDirectiveInput) {
  if (!directive.replacement) return true;
  const text = directiveText(directive);
  if (!/(ฆ่า|สังหาร|ทำร้าย|เผา|ลอบฆ่า|kill|murder|burn|betray)/.test(text)) return true;
  const protectedTerms = state.missions
    .filter((mission) => missionIsOpen(mission))
    .flatMap((mission) => compactTerms([mission.issuer, ...(mission.canon?.protectedTerms ?? [])]));
  return !protectedTerms.some((term) => text.includes(term.toLowerCase()));
}

function directiveMission(id: string, source: NonNullable<MissionDirectiveInput["replacement"]>, role: MissionRole, visibility: MissionVisibility, challenge: Mission["challenge"], evidence: string[]): Mission {
  const canonTerms = compactTerms([source.giver, ...source.canonTerms]);
  return {
    id,
    issuer: source.giver,
    issuerType: "commoner",
    title: source.title,
    request: source.objective,
    pressure: source.pressure,
    deadline: source.deadline,
    state: "offered",
    role,
    visibility,
    challenge,
    reward: source.reward,
    risk: source.risk,
    options: source.options.slice(0, 3),
    canon: { premise: source.objective, protectedTerms: canonTerms, evidence: evidence.slice(0, 4) },
    progress: { current: 0, required: challenge === "elevated" ? 3 : 2, triggerPhrases: source.options.slice(0, 3) },
  };
}

export function applyMissionDirective(state: GameState, directive: MissionDirectiveInput): { state: GameState; notice: MissionChangeNotice } {
  const none = { state, notice: { kind: "none", title: "", detail: "" } as MissionChangeNotice };
  if (!missionDirectiveIsCanonConsistent(state, directive)) return none;
  const main = activeMainMission(state);
  const target = directive.targetMissionId ? state.missions.find((mission) => mission.id === directive.targetMissionId) : undefined;
  const safeReason = directive.reason.trim().slice(0, 300);
  if (directive.kind === "replace_main") {
    if (!main || directive.targetMissionId !== main.id || !directive.replacement) return none;
    const replacementId = `mission-main-${state.tick + 1}`;
    const replacement = directiveMission(replacementId, directive.replacement, "main", "visible", "elevated", directive.evidence);
    const missions = normalizeMissionThreads(state.missions.map((mission) => mission.id === main.id ? { ...mission, state: "retired" as const, retiredReason: safeReason, supersededBy: replacementId } : mission).concat(replacement));
    return { state: { ...state, missions }, notice: { kind: "main-replaced", title: replacement.title, detail: safeReason } };
  }
  if (directive.kind === "create_hidden_side") {
    if (!directive.replacement) return none;
    const openSides = state.missions.filter((mission) => missionIsOpen(mission) && missionRoleOf(mission) === "side");
    if (openSides.length >= MAX_VISIBLE_ACTIVE_SIDE_LEADS) return none;
    const side = directiveMission(`mission-side-${state.tick + 1}-${openSides.length + 1}`, directive.replacement, "side", "hidden", "ordinary", directive.evidence);
    return { state: { ...state, missions: normalizeMissionThreads([...state.missions, side]) }, notice: { kind: "side-created", title: side.title, detail: safeReason } };
  }
  if (directive.kind === "reveal_side") {
    if (!target || missionRoleOf(target) !== "side" || missionVisibilityOf(target) !== "hidden" || visibleSideLeads(state).length >= MAX_VISIBLE_ACTIVE_SIDE_LEADS) return none;
    const missions = state.missions.map((mission) => mission.id === target.id ? { ...mission, visibility: "visible" as const } : mission);
    return { state: { ...state, missions }, notice: { kind: "side-revealed", title: target.title, detail: safeReason } };
  }
  if (directive.kind === "retire_side") {
    if (!target || missionRoleOf(target) !== "side" || !missionIsOpen(target)) return none;
    const missions = state.missions.map((mission) => mission.id === target.id ? { ...mission, state: "retired" as const, retiredReason: safeReason } : mission);
    return { state: { ...state, missions }, notice: { kind: "main-retired", title: target.title, detail: safeReason } };
  }
  if (directive.kind === "resolve" || directive.kind === "fail") {
    if (!target || !missionIsOpen(target)) return none;
    const stateName: MissionState = directive.kind === "resolve" ? "resolved" : "failed";
    const missions = state.missions.map((mission) => mission.id === target.id ? { ...mission, state: stateName } : mission);
    return { state: { ...state, missions }, notice: { kind: "none", title: target.title, detail: safeReason } };
  }
  return none;
}

/** Whitelists public fields so any legacy/private keys are never carried forward into the browser save. */
export function sanitizePublicRelationships(value: unknown): PublicRelationshipContact[] {
  if (!Array.isArray(value)) return [];
  const seeded = new Map(saikaPublicRelationships().map((contact) => [contact.contactId, contact]));
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.contactId !== "string") return [];
    const seed = seeded.get(entry.contactId as PublicRelationshipContact["contactId"]);
    if (!seed) return [];
    const publicPersona = Array.isArray(entry.publicPersona) ? entry.publicPersona.map((item, index) => readText(item, seed.publicPersona[index] ?? seed.publicPersona.at(-1)!)) : seed.publicPersona;
    const earnedKnowledge = Array.isArray(entry.earnedKnowledge) ? entry.earnedKnowledge.map((item, index) => readText(item, seed.earnedKnowledge[index] ?? seed.earnedKnowledge.at(-1)!)) : seed.earnedKnowledge;
    const blankSpace = Array.isArray(entry.blankSpace) ? entry.blankSpace.map((item, index) => readText(item, seed.blankSpace[index] ?? seed.blankSpace.at(-1)!)) : seed.blankSpace;
    return [{
      contactId: seed.contactId,
      nameTh: typeof entry.nameTh === "string" ? entry.nameTh : seed.nameTh,
      nameEn: typeof entry.nameEn === "string" ? entry.nameEn : seed.nameEn,
      iconKey: typeof entry.iconKey === "string" ? entry.iconKey : seed.iconKey,
      colorTone: ["navy", "vermilion", "ochre", "teal", "charcoal"].includes(String(entry.colorTone)) ? entry.colorTone as RelationshipTone : seed.colorTone,
      publicStatus: readText(entry.publicStatus, seed.publicStatus), publicPersona, earnedKnowledge, blankSpace,
      relationshipRole: readText(entry.relationshipRole, seed.relationshipRole),
      familiarity: clampRelationship(entry.familiarity, 0, 5, seed.familiarity), affinity: clampRelationship(entry.affinity, -3, 3, seed.affinity),
      ...(isRecord(entry.visibleSummary) ? { visibleSummary: readText(entry.visibleSummary, seed.visibleSummary ?? seed.relationshipRole) } : {}),
      events: seed.events,
    }];
  });
}

/**
 * Player-facing eras constrain starting paths before any campaign is made.
 * Exact place/year eligibility remains an origin-profile concern and will not
 * be inferred from this display policy alone.
 */
export function inventoryCategory(item: Pick<InventoryItem, "id" | "label" | "kind" | "category">): InventoryCategory {
  if (item.category) return item.category;
  const text = `${item.id} ${item.label}`.toLowerCase();
  if (item.kind === "document" || item.kind === "bond" || /จดหมาย|สัญญา|ตั๋ว|เอกสาร|letter|contract|document/.test(text)) return "story";
  if (/ยา|สมุนไพร|แผล|medicine|herb|bandage/.test(text)) return "medicine";
  if (/ข้าว|อาหาร|เสบียง|ration|food|น้ำ|water/.test(text) || item.kind === "reserve") return "food";
  if (/ปืน|ดาบ|หอก|อาวุธ|weapon|sword|gun/.test(text) || item.kind === "equipment") return "weapon";
  if (item.kind === "status") return "status";
  return "tool";
}

export function normalizeGameState(state: GameState): GameState {
  const campaign = state.campaign;
  const legacyState = state.schemaVersion < 4;
  const progression = state.progression ?? defaultProgression(campaign, state.character.identity.includes("สิบสาม") ? 13 : 20, campaign.season);
  const missions = normalizeMissionThreads(state.missions.map((mission) => mission.progress ? mission : { ...mission, progress: { current: mission.state === "resolved" ? 2 : 0, required: 2, triggerPhrases: mission.options } }));
  const legacyRolls = state.rolls as Array<RollRecord & { axis?: StatId; momentumSpent?: number; momentumSource?: unknown; canUseMomentum?: boolean }>;
  const legacyInventory = state.character.inventory as Array<GameState["character"]["inventory"][number] & { bonus?: { axis?: StatId; stat?: StatId; value: number; tags: string[] } }>;
  const rolls = legacyRolls.map((roll) => {
    const { axis, momentumSpent: _momentumSpent, momentumSource: _momentumSource, canUseMomentum: _canUseMomentum, ...cleanRoll } = roll;
    return { ...cleanRoll, stat: roll.stat ?? axis ?? "wit", difficulty: roll.difficulty === 0 ? 0 : canonicalDifficulty(roll.difficulty) };
  });
  const inventory = legacyInventory.map((item) => {
    const normalized = item.bonus?.stat ? item : item.bonus?.axis ? { ...item, bonus: { ...item.bonus, stat: item.bonus.axis } } : item;
    return { ...normalized, category: inventoryCategory(normalized) };
  });
  const legacyProperty = Math.max(0, Math.round(state.character.resources.property ?? 0));
  const currency = state.character.resources.currency ?? { unit: "mon" as const, amount: legacyProperty };
  const resources = { ...state.character.resources, currency, property: currency.amount, credit: 0 };
  const legacyAttributeValue = (value: number) => [1, 2, 3, 5, 7, 9, 10][Math.max(0, Math.min(6, Math.round(value)))] ?? 1;
  const attributes = Object.fromEntries(STATS.map(({ id }) => [id, legacyState ? legacyAttributeValue(state.character.attributes[id]) : normalizeStatValue(state.character.attributes[id])])) as Attributes;
  const storedStatXp = state.character.statXp as Partial<StatXp> | undefined;
  const statXp = Object.fromEntries(STATS.map(({ id }) => {
    const threshold = traitProgressNeededForLevel(attributes[id]);
    return [id, { xp: threshold === 0 ? 0 : Math.max(0, Math.min(storedStatXp?.[id]?.xp ?? 0, threshold - 1)), totalXp: Math.max(0, storedStatXp?.[id]?.totalXp ?? 0) }];
  })) as StatXp;
  const rawVitals = state.character.vitals as Character["vitals"] & Record<string, unknown>;
  /** Migration: เซฟเก่าเก็บเลือดไว้ใต้ชื่อ key เดิม (`wounds`/`maxWounds`) — แปลงเป็น `blood`/`maxBlood` พร้อม clamp
   *  (ชื่อ key เดิมเป็น literal ของ save format เก่า ลบไม่ได้ ไม่งั้นเซฟเก่าอ่านค่าเลือดไม่ได้) */
  const maxBlood = Math.max(1, Math.min(VITAL_CAP, Math.round(Number(rawVitals.maxBlood ?? rawVitals["maxWounds"] ?? 6))));
  const maxFocus = Math.max(1, Math.min(VITAL_CAP, Math.round(rawVitals.maxFocus ?? 6)));
  const legacyBloodValue = Number(rawVitals.blood ?? rawVitals["wounds"] ?? 0);
  const { "wounds": _legacyKey1, "maxWounds": _legacyKey2, ...restVitals } = rawVitals as Record<string, unknown>;
  const vitals = { ...restVitals, blood: clampVital(legacyBloodValue, maxBlood), focus: clampVital(rawVitals.focus, maxFocus), maxBlood, maxFocus };
  const flaws = Array.from(new Set((state.character.flaws?.length ? state.character.flaws : [state.character.weakness]).map((entry) => entry.trim()).filter(Boolean))).slice(0, 2);
  const storedRelationships = (state as Partial<GameState>).relationships;
  const relationships = Array.isArray(storedRelationships) ? sanitizePublicRelationships(storedRelationships) : campaign.id === "camp-saika-1569" ? saikaPublicRelationships() : [];
  const foundationMemories = campaign.id === "camp-saika-1569" ? saikaRelationshipFoundationMemories() : [];
  const memories = [...state.memories, ...foundationMemories.filter((memory) => !state.memories.some((existing) => existing.id === memory.id))];
  const rawStoryRecords = (state as Partial<GameState>).storyRecords;
  const storyRecords = Array.isArray(rawStoryRecords)
    ? rawStoryRecords.filter((entry): entry is StoryRecord => Boolean(entry && typeof entry.id === "string" && typeof entry.title === "string" && typeof entry.prose === "string" && typeof entry.location === "string" && typeof entry.tick === "number" && typeof entry.inGameDay === "number")).map((entry) => ({ ...entry, prose: entry.prose.trim() })).filter((entry) => entry.prose.length > 0)
    : rolls.length
      ? rolls.filter((roll) => Boolean(roll.narrative?.trim())).map((roll) => ({ id: `story-${roll.id}`, tick: roll.tick, inGameDay: campaign.day, title: `Page ${String(roll.tick).padStart(2, "0")}`, prose: roll.narrative.trim(), location: state.currentScene.location }))
      : [{ id: `story-opening-${campaign.id}`, tick: 1, inGameDay: campaign.day, title: state.currentScene.title, prose: state.currentScene.body.join("\n\n"), location: state.currentScene.location }];
  return {
    ...state,
    schemaVersion: 9,
    character: { ...state.character, weakness: flaws[0] ?? "มีหนี้ที่ยังไม่กล้าพูดถึง", flaws: flaws.length ? flaws : ["มีหนี้ที่ยังไม่กล้าพูดถึง"], attributes, statXp, inventory, masteries: state.character.masteries.map((entry) => normalizeMasteryProgress(entry, legacyState)), vitals: { blood: vitals.blood, focus: vitals.focus, maxBlood: vitals.maxBlood, maxFocus: vitals.maxFocus }, resources },
    missions,
    rolls,
    memories,
    storyRecords,
    relationships,
    progression: { ...progression, currentAge: Math.max(progression.currentAge, progression.ageAtCampaignStart), growthPoints: progression.growthPoints ?? 0, milestonePoints: progression.milestonePoints ?? 0, vitalEvents: progression.vitalEvents ?? [] },
    economy: state.economy ?? (campaign.id === "camp-saika-1569" ? buildSaikaEconomy() : buildCampaignEconomy(campaign)),
    worldSystems: state.worldSystems ?? { schemaVersion: 1 },
  };
}

export function buildCampaignEconomy(context: CampaignContext): EconomyState {
  return { marketTitle: `ตลาดใกล้ ${context.location}`, marketContext: `ข้อเสนอใน ${context.season} ผูกกับเส้นทางและแรงกดดันของแคมเปญ ไม่ใช่รายการสินค้าสากล`, routeStatus: "เส้นทางยังเปิด แต่ผู้เดินทางถูกซักถาม", sellerNetwork: "พ่อค้าท้องถิ่น คนงานขนของ และคนกลางของชุมชน", services: [{ id: "local-messenger", provider: "คนส่งสารท้องถิ่น", role: "ข่าวสารและเอกสาร", affiliation: "เครือข่ายตลาด", request: "นำห่อเล็กไปยังจุดนัดหมาย", price: "2 文 หรือคำรับรอง", timeCost: "หนึ่งวัน", requirement: "ไม่เปิดเผยชื่อผู้รับต่อหน้าคนแปลกหน้า", witnessRisk: "คนส่งสารจำชื่อผู้ว่าจ้างได้", availability: "available" }], obligations: [], transactions: [] };
}

export function buildSaikaMarket(): MarketOffer[] {
  return [
    { id: "saika-rations", label: "ข้าวตากและเต้าเจี้ยว", price: 1, priceUnit: "mon", debtAllowed: false, kind: "goods", slots: 1, note: "เสบียงแห้งจากแผงใกล้ท่าเรือ", priceReason: "กองกำลังตรวจเส้นทางเสบียง", available: true },
    { id: "saika-medicine", label: "ยาสมุนไพรห่อเล็ก", price: 2, priceUnit: "mon", debtAllowed: true, kind: "goods", slots: 0, note: "ผู้ขายยอมให้รับไปก่อนหากมีคนของไซกะรับรอง", priceReason: "สมุนไพรมีจำกัดและคนเจ็บเพิ่มขึ้น", available: true },
    { id: "saika-rope-cloth", label: "เชือกปอและผ้าหยาบ", price: 2, priceUnit: "mon", debtAllowed: false, kind: "goods", slots: 1, note: "ใช้ซ่อมของหรือห่อของให้ไม่สะดุดตา", priceReason: "เรือสินค้าล่าช้า", available: true },
    { id: "saika-messenger", label: "คนส่งสารท่าเรือ", price: 2, priceUnit: "mon", debtAllowed: false, kind: "service", note: "ออกจากท่าเรือหลังยามค่ำ รับเฉพาะห่อเล็ก", priceReason: "ด่านตรวจเรือเข้าออก", available: true },
    { id: "saika-scribe", label: "เสมียนอ่านเอกสาร", price: 2, priceUnit: "mon", debtAllowed: false, kind: "information", note: "อ่านบัญชีและตั๋วสัญญา แต่ไม่แตะตราไซกะที่เปิดเผย", priceReason: "งานเสี่ยงต่อเครือข่ายร้านค้า", available: true },
  ];
}

export function buildSaikaEconomy(): EconomyState {
  return { marketTitle: "ตลาดท่าเรือซาไก — เช้าหลังคืนวุ่นวาย", marketContext: "สินค้าและบริการเป็น fictional play content ในบริบทเมืองท่า ค.ศ. 1569 ราคาเปลี่ยนเพราะการตรวจเรือ เสบียง และเครือข่ายผู้ขาย", routeStatus: "เอโกะชูเพิ่มเวรยาม ปิดประตูบางช่วง และตรวจเรือเข้าออก", sellerNetwork: "แผงยา คนงานท่าเรือ เสมียนบ้านพ่อค้า และคนกลางที่รู้จักชื่อกันทาโร่", services: [{ id: "harbor-messenger", provider: "คนส่งสารท่าเรือ", role: "ข่าวสารและเอกสาร", affiliation: "คนงานท่าเรือ", request: "ส่งห่อเล็กไปยังตลาดฝั่งตะวันออก", price: "2 文 หรือชื่อคนคุมท่าเรือรับรอง", timeCost: "หนึ่งวัน", requirement: "ห่อต้องไม่เผยตราไซกะ", witnessRisk: "ผู้ส่งสารอาจถูกค้นและจำชื่อผู้ว่าจ้างได้", availability: "limited" }, { id: "harbor-scribe", provider: "เสมียนอ่านเอกสาร", role: "ข่าวสารและเอกสาร", affiliation: "บ้านพ่อค้าท่าเรือ", request: "อ่านบัญชีหรือเทียบข้อความในตั๋วสัญญา", price: "2 文 หรือข้อมูลที่พอแลกได้", timeCost: "ก่อนตะวันตก", requirement: "ไม่รับเอกสารที่มีตราไซกะเปิดเผย", witnessRisk: "เสมียนอาจรู้ว่าผู้เล่นกำลังตามหาของใด", availability: "available" }, { id: "herb-seller", provider: "เจ้าของแผงยา", role: "รักษาและดูแลคนเจ็บ", affiliation: "เครือข่ายแผงยา", request: "ให้ยาสมุนไพรและเปลี่ยนผ้าพันแผล", price: "2 文 หรือรับของไปก่อนสามวันพร้อมคนค้ำ", timeCost: "ครึ่งชั่วยาม", requirement: "บอกว่าแผลเกิดจากอะไรเท่าที่ผู้ขายยอมรับ", witnessRisk: "คนในแผงอาจรู้ว่าซาเนฟุยุยังบาดเจ็บ", availability: "limited" }], obligations: [{ id: "favor-gantaro-life", kind: "favor", holder: "กันทาโร่", subject: "หนี้ชีวิตจากการลากซาเนฟุยุขึ้นจากน้ำ", due: "ยังไม่กำหนด", witness: "คนในเซฟเฮาส์", status: "open", note: "ใช้ขอความช่วยเหลือได้เฉพาะเรื่องที่ไม่ทำลายผลประโยชน์ไซกะ" }, { id: "debt-safehouse-rations", kind: "debt", holder: "เซฟเฮาส์ของไซกะ", subject: "ข้าวตากและยาที่ใช้รักษาแผล", due: "ก่อนออกจากที่ซ่อน", witness: "กันทาโร่", status: "open", note: "ชำระได้ด้วยของ ค่าปืน หรือแรงงาน ไม่ใช่เหรียญอย่างเดียว" }], transactions: [{ id: "tx-saika-rescue", kind: "favor", title: "กันทาโร่ลากซาเนฟุยุขึ้นจากน้ำ", counterpart: "กันทาโร่", payment: "บุญคุณที่ยังไม่กำหนดราคา", witness: "คนในเซฟเฮาส์", consequence: "ซาเนฟุยุมีที่ซ่อนชั่วคราว แต่ถูกผูกกับผลประโยชน์ไซกะ", tick: 1 }, { id: "tx-saika-rations", kind: "debt", title: "รับข้าวตากและยาพันแผล", counterpart: "เซฟเฮาส์ของไซกะ", payment: "ค้างแรงงานหรือส่วนแบ่งค่าปืน", witness: "กันทาโร่", consequence: "ของอยู่กับตัว แต่หนี้ถูกบันทึก", tick: 1 }] };
}

export function buildMarket(season: Season): MarketOffer[] {
  const seasonGoods: Record<Season, MarketOffer> = {
    Spring: { id: "rain-cloak", label: "เสื้อคลุมกันฝน", price: 2, priceUnit: "mon", kind: "goods", slots: 1, note: "ช่วยเดินทางในเส้นทางเปียก", available: true },
    Summer: { id: "water-skin", label: "ถุงน้ำและยาสมุนไพร", price: 2, priceUnit: "mon", kind: "goods", slots: 1, note: "ของจำเป็นเมื่อเดินทางกลางร้อน", available: true },
    Autumn: { id: "rice-bundle", label: "ข้าวตากหนึ่งห่อ", price: 2, priceUnit: "mon", kind: "goods", slots: 1, note: "เสบียงพกพาช่วงเก็บเกี่ยว", available: true },
    Winter: { id: "charcoal-brazier", label: "ถ่านและผ้าห่มบาง", price: 3, priceUnit: "mon", kind: "goods", slots: 2, note: "คุ้มกันความหนาว แต่กินสัมภาระ", available: true },
  };
  return [
    seasonGoods[season],
    { id: "rope", label: "เชือกปอ", price: 1, priceUnit: "mon", kind: "goods", slots: 1, note: "เปิดทางเลือกปีน ผูก หรือซ่อม", available: true },
    { id: "porter", label: "จ้างลูกหาบ", price: 2, priceUnit: "mon", kind: "service", note: "ลดภาระสัมภาระหนึ่งฉาก", available: true },
    { id: "scribe", label: "จ้างคนอ่านเอกสาร", price: 3, priceUnit: "mon", kind: "service", note: "เปิดวิธีใช้เอกสารที่ไม่เข้าใจ", available: true },
    { id: "rumor", label: "ข่าวด่านวันนี้", price: 1, priceUnit: "mon", kind: "information", note: "บอกแรงกดดันในฉากถัดไป", available: true },
  ];
}