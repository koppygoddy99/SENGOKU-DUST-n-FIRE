/**
 * Dust & Fire game-state contract.
 * Ledger of Ash reminder: the player sees consequences, sources, and choices—not hidden intent.
 */

import { maybeTriggerRandomEvent, type EventEffect } from "../randomEvents";
import { emptyPowerRumorState, applyWorldEvent, eventFromRoll, eventFromDebt } from "../worldEvents";
import { regionInitialState, FACTION_NAMES } from "../regionInitialState";
import { voiceReplyFor, factionOfSpeaker } from "../factionVoice";
import { timelineRegionKey } from "../historicalTimeline";
import type { FactionReputation, FactionHeat } from "../worldEvents";
import {
  type Attributes,
  type BilingualText,
  type CampaignContext,
  type Character,
  type CharacterDraft,
  type Community,
  type Currency,
  type CurrencyUnit,
  type Difficulty,
  type EconomyState,
  type ExchangeRecord,
  type GameState,
  type HistoricalBoundary,
  type HistoricalStatus,
  type InventoryCategory,
  type InventoryItem,
  type ItemKind,
  type MarketOffer,
  type MarketService,
  type Mastery,
  type MemoryKind,
  type Mission,
  type MissionChangeNotice,
  type MissionDirectiveInput,
  type MissionRole,
  type MissionState,
  type MissionVisibility,
  type Obligation,
  type Outcome,
  type ProgressionState,
  type PublicRelationshipContact,
  type PublicRelationshipDailyLog,
  type PublicRelationshipEvent,
  type RelationshipEventSource,
  type RelationshipPull,
  type RelationshipTone,
  type RollPreview,
  type RollRecord,
  type Scene,
  type Season,
  type SkillPractice,
  type StarterEra,
  type StarterOriginSelection,
  type StarterTemplate,
  type StatId,
  type StatPractice,
  type StatXp,
  type StoryRecord,
  type TimeMark,
  type TimeSegment,
  type VitalEvent,
  type WorldMemory,
  type WorldSystems,
  type WorldSystemsFlags,
} from "./types";
import {
  MAX_MASTERY_LEVEL,
  MAX_STAT_VALUE,
  MASTERY_PROGRESS_PER_LEVEL,
  MIN_STAT_VALUE,
  STATS,
  VITAL_CAP,
  canonicalDifficulty,
  defaultStatXp,
  masteryLevelDetails,
  normalizeMasteryProgress,
  normalizeStatValue,
  statXpNeededForValue,
  traitLevelDetails,
  traitProgressNeededForLevel,
  traitValueForRoll,
  xpNeededForMasteryLevel,
} from "./engine";
import {
  activeMainMission,
  applyEventEffects,
  applyVitalDelta,
  awardMilestonePoint,
  buildCampaignEconomy,
  buildMarket,
  buildSaikaEconomy,
  buildSaikaMarket,
  clampVital,
  defaultProgression,
  levelUpVital,
  relationshipText,
  saikaPublicRelationships,
  saikaRelationshipFoundationMemories,
  vitalMaxes,
} from "./state";
import {
  RELATIONSHIP_QUESTIONS,
  STARTER_OPENING_PROFILES,
  STARTER_TEMPLATES,
  item,
  mastery,
  selectStarterOrigin,
  templateById,
} from "./data";

function stanceScore(stance: string): number {
  switch (stance) {
    case "allies": return 3;
    case "friendly": return 2;
    case "helpful": case "cooperative": return 1.5;
    case "neutral": case "conditional-cooperation": return 0;
    case "wary": return -1;
    case "interfering": return -2;
    case "hostile": return -3;
    case "war": return -3;
    default: return 0;
  }
}

/** แปลงระดับ heat (0..5) เป็น status ตรงกับ worldEvents.applyWorldEvent */
function heatStatus(level: number): FactionHeat["status"] {
  if (level <= 0) return "unseen";
  if (level <= 1) return "suspected";
  if (level <= 3) return "identified";
  if (level <= 4) return "wanted";
  return "archived";
}

export function startingAttributesForTemplate(template: StarterTemplate): Attributes {
  const startingValue = (value: number) => value <= 1 ? 1 : value <= 2 ? 2 : 3;
  return { body: startingValue(template.attributes.body), hand: startingValue(template.attributes.hand), wit: startingValue(template.attributes.wit), mind: startingValue(template.attributes.mind), heart: startingValue(template.attributes.heart) };
}

function selectedMasteriesForDraft(draft: CharacterDraft, template: StarterTemplate): Mastery[] {
  const requested = (draft.skills ?? template.masteries.map((entry) => entry.label)).map((entry) => entry.trim()).filter((entry) => template.masteries.some((mastery) => mastery.label === entry));
  const labels = Array.from(new Set([...requested, ...template.masteries.map((entry) => entry.label)])).slice(0, 5);
  const selected = labels.slice(0, Math.max(3, Math.min(5, labels.length)));
  return selected.map((label, index) => {
    const templateMastery = template.masteries.find((entry) => entry.label === label);
    if (templateMastery) return normalizeMasteryProgress({ ...templateMastery, level: 1, rank: 1, xp: 0, totalXp: 0, masteryMark: undefined });
    return normalizeMasteryProgress({ id: `chosen-skill-${index + 1}`, label, level: 1, rank: 1, xp: 0, totalXp: 0, origin: "เลือกตอนสร้างตัวละคร", tags: ["custom"] });
  });
}

function selectedFlawsForDraft(draft: CharacterDraft) {
  const supplied = (draft.flaws ?? []).map((entry) => entry.trim()).filter(Boolean);
  const candidate = supplied.length ? supplied : [draft.weakness.trim()];
  const flaws = Array.from(new Set(candidate)).slice(0, 2);
  return flaws.length ? flaws : ["มีหนี้ที่ยังไม่กล้าพูดถึง"];
}

export function createCharacter(draft: CharacterDraft): Character {
  const template = templateById(draft.templateId);
  const occupation = draft.templateId === "freeform" ? (draft.freeformOccupation.trim() || "ผู้เดินทางไร้สังกัด") : template.label;
  const flaws = selectedFlawsForDraft(draft);
  return {
    id: `char-${Date.now()}`,
    name: draft.name.trim() || "ผู้ไร้นาม",
    identity: draft.identity.trim() || "ไม่ได้ระบุ",
    occupationId: draft.templateId,
    occupation,
    origin: draft.origin.trim() || template.start,
    strength: draft.strength.trim() || "ทำงานภายใต้แรงกดดันได้",
    weakness: flaws[0],
    flaws,
    attributes: startingAttributesForTemplate(template),
    statXp: defaultStatXp(),
    masteries: selectedMasteriesForDraft(draft, template),
    vitals: { blood: 0, focus: 5, maxBlood: 6, maxFocus: 6 },
    social: { ...template.social },
    resources: { ...template.resources },
    inventory: template.inventory.map((entry) => ({ ...entry })),
    pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: draft.answers[id] || "ยังไม่บอก", tags: [...tags], weight: draft.answers[id] ? 2 : 1 })),
  };
}

function openingProfileFor(template: StarterTemplate, seed: number) {
  const profiles = STARTER_OPENING_PROFILES[template.id] ?? [{ title: template.mission.title, background: "แรงกดดันของงานเดินทางมาถึงก่อนคำอธิบาย", turn: "เจ้าต้องเลือกโดยยอมรับว่าทุกทางมีราคา" }];
  return profiles[Math.abs(Math.trunc(seed)) % profiles.length];
}

function openingRequestFor(template: StarterTemplate, context: CampaignContext, character: Character) {
  const profile = openingProfileFor(template, context.selectionSeed ?? 0);
  const beginning = `${character.name} เติบโตมากับ ${character.origin} และรู้ดีว่างานของ ${template.label} ไม่เคยแยกออกจากคนที่ต้องพึ่งพากัน. ${profile.background} `;
  return `${beginning}วันนี้ ${template.mission.issuer} ไม่ได้ยื่นงานสั้น ๆ ให้ทำ หากแต่ขอให้เจ้า ${template.mission.request} ${template.mission.pressure} ${profile.turn} เส้นตายคือ ${template.mission.deadline}; หากเลือกผิด ไม่เพียงรางวัล ${template.mission.reward} จะหายไป แต่ ${template.mission.risk} นี่คือ Main Thread แรกของเจ้า—เรื่องสมมติของแคมเปญที่ก่อตัวขึ้นภายใน ${context.region} ค.ศ. ${context.year} โดยไม่อ้างว่าเหตุการณ์หรือบุคคลนี้มีอยู่จริง.`;
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
  const mission: Mission = { ...template.mission, title: openingProfileFor(template, context.selectionSeed ?? 0).title, request: openingRequestFor(template, context, character), id: `mission-${Date.now()}`, state: "offered" as MissionState, role: "main", visibility: "visible", progress: { current: 0, required: 2, triggerPhrases: template.mission.options } };
  const opening = openingScene(character, context, mission);
  // ค่าเริ่มต้นตามเมือง/แคว้น อิงไทมไลน์ประวัติศาสตร์ (อิง sengoku-rpg-historian)
  const regionInit = regionInitialState(context.year, context.region, context.season);
  // สร้าง powerRumor เริ่มต้นจากบริบทภูมิภาค (faction stance + heat) — กลไก event-driven เริ่มทันที
  const initialFactions: FactionReputation[] = (Object.keys(regionInit.factionStance) as Array<keyof typeof regionInit.factionStance>).map((fid) => {
    const stance = regionInit.factionStance[fid]!;
    return {
      factionId: fid,
      name: FACTION_NAMES[fid] ?? fid,
      score: stanceScore(stance),
      stance,
      trend: "steady",
      reasons: [regionInit.factionReason[fid] ?? "สถานการณ์บริบทของแคว้น"],
    };
  });
  const initialHeat: FactionHeat[] = regionInit.heatLevel > 0
    ? [{ provinceId: timelineRegionKey(context.region), locationId: context.location, level: regionInit.heatLevel, status: heatStatus(regionInit.heatLevel), reasons: [regionInit.heatReason] }]
    : [];
  return {
    schemaVersion: 9,
    credits: 50,
    campaign: context,
    character,
    community: {
      food: regionInit.community.food ?? 4,
      labor: regionInit.community.labor ?? 3,
      voice: 2,
      safety: regionInit.community.safety ?? 3,
      cohesion: 4,
      lastChange: regionInit.brief,
    },
    currentScene: opening,
    missions: [mission],
    market: buildMarket(context.season),
    economy: { ...buildCampaignEconomy(context), routeStatus: regionInit.routeStatus },
    memories: [{ id: `memory-${Date.now()}`, kind: "news", title: opening.title, detail: opening.body.join("\n\n"), tick: 1, tone: "teal" }],
    rolls: [],
    storyRecords: [{ id: `story-opening-${context.id}`, tick: 1, inGameDay: context.day, title: opening.title, prose: opening.body.join("\n\n"), location: opening.location }],
    relationships: [],
    progression: defaultProgression(context, template.age, context.season),
    tick: 1,
    worldSystems: { schemaVersion: 1, powerRumor: { schemaVersion: 1, factions: initialFactions, heatTracks: initialHeat, events: [] } },
  };
}

export function createSaikaSafehouseDemo(): GameState {
  const campaign: CampaignContext = { id: "camp-saika-1569", title: "Smoke Beneath Sakai", year: 1569, season: "Spring", region: "Sakai / Izumi", location: "เซฟเฮาส์ลับของไซกะ — นอกชายเขตเมืองซาไก", warShadow: 5, day: 1 };
  const character: Character = {
    id: "char-sanefuyu", name: "ซาเนฟุยุ", identity: "เด็กชายวัยสิบสามปี", occupationId: "freeform", occupation: "ทหารรับจ้างถือปืนของไซกะ", origin: "กิอิ", strength: "อ่านผลประโยชน์และพูดในจังหวะที่คนกำลังลังเล", weakness: "บาดเจ็บสาหัสและถูกความหยามเกียรติผลักให้พลั้งมือ", flaws: ["บาดเจ็บสาหัสและถูกความหยามเกียรติผลักให้พลั้งมือ"], attributes: { body: 1, hand: 3, wit: 3, mind: 2, heart: 3 }, statXp: defaultStatXp(), masteries: [mastery("saika-firearm", "ปืนคาบศิลาและคนไซกะ", 2, "งานคุ้มกันและการรบ", ["fight", "weapon", "gunpowder"]), mastery("hard-bargain", "ต่อรองผลประโยชน์", 1, "เอาตัวรอด", ["negotiation", "social"]), mastery("water-escape", "หนีทางน้ำ", 1, "รอดจากการจมน้ำ", ["water", "escape"])], vitals: { blood: 5, focus: 3, maxBlood: 6, maxFocus: 6 }, social: { rank: 0, honor: 0, influence: 1, information: 2, stain: 2 }, resources: { property: 1, supplies: 1, credit: 0 }, inventory: [item("bandaged-arm", "ผ้าพันแผลชุ่มยา", "status", "ไหล่ซ้ายและแขนขวาบาดเจ็บ ใช้งานได้จำกัด", 0, []), item("saika-matchlock", "ปืนคาบศิลาเปียกชื้น", "equipment", "ปืนที่ต้องซ่อมและทำให้แห้งก่อนใช้", 2, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "weapon"] }), item("dry-ration", "ข้าวปั้นตากแห้งกับเต้าเจี้ยว", "reserve", "ของกินที่กันทาโร่โยนให้", 1, ["bonus"])], pulls: RELATIONSHIP_QUESTIONS.map(([id, question, tags]) => ({ id, question, answer: id === "life_before" ? "เติบโตท่ามกลางเส้นทางค้าของคิอิ ก่อนกลายเป็นทหารรับจ้างของไซกะ" : "ยืนข้างไซกะตราบใดที่ผลประโยชน์ยังตรงกัน", tags: [...tags], weight: 2 })),
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
  return { schemaVersion: 9, credits: 50, campaign, character, community: { food: 2, labor: 2, voice: 1, safety: 1, cohesion: 2, lastChange: "เมืองซาไกเพิ่มเวรยามและตรวจเรือ" }, currentScene: opening, missions: [{ ...mission, role: "main", visibility: "visible" }], market: buildSaikaMarket(), economy: buildSaikaEconomy(), memories: [{ id: "memory-saika-opening", kind: "stain", title: "คืนที่เมืองซาไกตื่น", detail: opening.body.join("\n\n"), tick: 1, tone: "vermilion" }, ...saikaRelationshipFoundationMemories()], rolls: [], storyRecords: [{ id: "story-saika-opening", tick: 1, inGameDay: 1, title: opening.title, prose: opening.body.join("\n\n"), location: opening.location }], relationships: saikaPublicRelationships(), progression: defaultProgression(campaign, 13, "Spring"), tick: 1 };
}

export function formatMoney(amount: number, _language: "th" | "en" = "th"): string {
  return `${amount} mon`;
}


const actionKeywords: { tags: string[]; stat: StatId; method: string; masteryTags: string[] }[] = [
  { tags: ["พัก", "ฟื้น", "ทำแผล", "คุย", "ทัก", "งานประจำ"], stat: "heart", method: "พักฟื้นหรือประคองความสัมพันธ์ในพื้นที่ปลอดภัย", masteryTags: ["rest", "care", "talk"] },
  { tags: ["ฟัน", "แทง", "ปัด", "ซ่อม", "ทำ", "จับ", "แกะ", "ยิง"], stat: "hand", method: "ใช้ฝีมือและการลงมือที่แม่นยำ", masteryTags: ["fight", "weapon", "repair", "craft", "metal"] },
  { tags: ["แบก", "ผลัก", "ยก", "ปีน", "วิ่ง", "ฝ่า", "ยื้อ"], stat: "body", method: "ใช้พลังกายและความอดทน", masteryTags: ["travel", "labor", "protect"] },
  { tags: ["หลบ", "ลอบ", "หลอก", "สังเกต", "หนี", "ซ่อน", "นำทาง"], stat: "wit", method: "อ่านจังหวะและใช้ไหวพริบ", masteryTags: ["hide", "route", "travel", "news", "wit"] },
  { tags: ["บัญชี", "เอกสาร", "แผน", "พิสูจน์", "อ่าน", "คำนวณ", "อ้าง"], stat: "mind", method: "ใช้เอกสาร เหตุผล หรือแผนที่มีอยู่", masteryTags: ["ledger", "document", "mind", "accounting", "inspection"] },
  { tags: ["ขอ", "สาบาน", "ยืน", "รับผิด", "เกลี้ยกล่อม", "คุ้มครอง", "รักษา"], stat: "heart", method: "ยืนบนคำสัตย์และแรงใจ", masteryTags: ["oath", "temple", "request", "mediation", "talk"] },
];

export function parseAction(action: string, state: GameState): RollPreview {
  const normalized = action.trim().toLowerCase();
  const match = actionKeywords.find((entry) => entry.tags.some((tag) => normalized.includes(tag))) ?? actionKeywords[2];
  const rankedMasteries = [...state.character.masteries].sort((a, b) => {
    const score = (mastery: Mastery) => mastery.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)) ? 1 : 0;
    return score(b) - score(a) || b.level - a.level;
  });
  const selectedMastery = rankedMasteries.find((mastery) => mastery.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)));
  const matchingItem = state.character.inventory.find((entry) => entry.condition === "usable" && entry.bonus && entry.bonus.tags.some((tag) => normalized.includes(tag) || match.masteryTags.includes(tag)));
  const namesSpecialDocumentUse = ["คำสั่ง", "ตรา", "ใบผ่าน", "order", "seal", "pass"].some((tag) => normalized.includes(tag));
  const specializedItem = state.character.inventory.find((entry) => namesSpecialDocumentUse && entry.condition === "usable" && entry.functions.includes("unlock") && entry.special && entry.special.tags.some((tag) => normalized.includes(tag)));
  const illicitRisk = normalized.includes("ฆ่า") || normalized.includes("ปลอม") || normalized.includes("ขโมย") || normalized.includes("บุก");
  const guardedObstacle = normalized.includes("ด่าน") || normalized.includes("ผู้คุม") || normalized.includes("ค่าย");
  const hasRelevantMastery = selectedMastery?.tags.some((tag) => match.masteryTags.includes(tag) || normalized.includes(tag)) ?? false;
  const contextBonus = Math.max(0, Math.min(2, matchingItem?.bonus?.value ?? 0));
  const isPrepared = Boolean(contextBonus);
  const veryEasy = /(พัก|ฟื้น|ทำแผล|คุย|ทัก|ถามเพื่อน|งานประจำ)/.test(normalized) && !illicitRisk && !guardedObstacle;
  const easy = hasRelevantMastery && !illicitRisk && !guardedObstacle;
  const difficulty: Difficulty = specializedItem?.special ? 0 : illicitRisk && guardedObstacle && !hasRelevantMastery && !isPrepared ? 28 : illicitRisk && guardedObstacle ? 24 : illicitRisk || guardedObstacle ? 20 : veryEasy ? 8 : easy ? 12 : 16;
  const difficultyReason = specializedItem?.special
    ? `${specializedItem.label}: ${specializedItem.special.reason}`
    : difficulty === 28
    ? "วิกฤต: การเสี่ยงผิดกฎหมายปะทะด่านหรือผู้คุม โดยยังไม่มีวิชาหรือเครื่องมือที่ช่วย"
    : difficulty === 24
      ? "อุปสรรค: ฉากมีแรงกดดันซ้อนกัน ต้องมีแผน เครื่องมือ หรือยอมรับราคา"
      : difficulty === 20
        ? illicitRisk ? "ท้าทาย: การกระทำนี้ทิ้งพยานหรือข้อครหา แม้ทำสำเร็จก็มีราคา" : "ท้าทาย: มีด่าน ผู้คุม หรือคนคอยขวาง จึงต้องใช้ฝีมือหรือการเตรียมตัว"
        : difficulty === 12
          ? "ค่อนข้างง่าย: ตัวละครมีวิธีหรือความชำนาญตรงกับงาน และความเสี่ยงยังเล็กน้อย"
          : difficulty === 8
            ? "ง่ายมาก: งานคุ้นมือในสถานการณ์ปลอดภัยหรือการพักฟื้น"
            : "มาตรฐาน: งานคุ้นเคยแต่ยังมีผลต่อฉากและต้องระวัง";
  return {
    action: action.trim(),
    intent: action.trim() || "ยังไม่ได้ระบุการกระทำ",
    method: match.method,
    stat: match.stat,
    mastery: selectedMastery,
    contextBonus,
    contextReason: specializedItem?.special ? `ใช้ ${specializedItem.label}` : matchingItem ? `ใช้ ${matchingItem.label}` : undefined,
    difficulty,
    difficultyReason,
    specialItem: specializedItem?.special ? { itemId: specializedItem.id, label: specializedItem.label, mode: specializedItem.special.mode, reason: specializedItem.special.reason } : undefined,
    flawTriggered: false,
    flawBonus: 0,
    risks: illicitRisk ? ["เกิดพยาน", "ข้อครหาเพิ่ม", "สถานการณ์ปะทุ"] : guardedObstacle ? ["ชื่อถูกจด", "ผู้คุมตั้งคำถาม", "เสียเวลา"] : ["ใช้เสบียง", "มีคนได้ยิน", "เกิดหนี้เล็กน้อย"],
    witnesses: guardedObstacle ? ["ผู้คุมด่าน", "เสมียน", "คนรอคิว"] : ["คนในพื้นที่"],
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

function localSpeakerReply(speaker: string, issuerType: Mission["issuerType"] | undefined, name: string, failed: boolean) {
  const replies: Record<NonNullable<Mission["issuerType"]>, { failure: string; other: string }> = {
    merchant: {
      failure: `${speaker} กดนิ้วลงบนเชือกปอที่ขอบลังจนเส้นใยลั่นเบา ๆ เขาอ้าปากจะต่อว่า แต่หันไปมองของเสียก่อน “เดี๋ยว” เขาพูด “ของเสียไปเท่าใด บอกข้าตรง ๆ ก่อน ถ้าตามกลับทันก่อนค่ำ เจ้าช่วยไปดูให้ข้าได้ไหม ข้าไม่อยากให้คนของข้ารู้จากปากคนอื่น”`,
      other: `${speaker} เลื่อนถุงผ้าออกจากขอบลังแล้วถอนใจ “เอาเถอะ เรื่องนี้ผ่านไปก่อน” เขาว่า “แต่บอกข้าที ของจะออกจากท่านี้เมื่อไร ข้าจะได้ไม่ปล่อยให้คนของข้ายืนรอเก้อ”`,
    },
    samurai: {
      failure: `${speaker} วางมือบนปากฝักดาบโดยไม่จับด้าม เขามองรอยนั้นอยู่พักหนึ่ง “อย่าเพิ่งแตะของเดิม” เขาว่า แล้วจึงเงยหน้าขึ้น “รอยนี้ต้องมีคนตรวจอีกครั้ง ไปเอามาให้ข้าดูก่อนตะวันตก แล้วค่อยพูดกัน”`,
      other: `${speaker} มอง${name}อยู่ครู่หนึ่งก่อนพยักหน้า “พอแล้ว” เขาว่า แล้วหันไปดูคนที่ยืนรอข้างหลัง “เก็บของให้เรียบร้อย อยู่ที่นี่ก่อน ถ้ามีคนถาม ข้าจะตอบเอง”`,
    },
    ruler: {
      failure: `${speaker} ไม่ยกเสียง เขารอจนคนรอบตัวเงียบก่อนพูดว่า “กลับไปเอาหลักฐานมา” เขาหยุดนิดหนึ่งเหมือนจะฟังคำแก้ตัวต่อ แต่ส่ายหน้า “ของต้องอยู่ต่อหน้าข้า แล้วค่อยพูด”`,
      other: `${speaker} พยักหน้าเพียงครั้งเดียว “ไปได้” เขาพูด แล้วมองตาม${name}อยู่ครู่หนึ่ง “ก่อนคืนนี้ เอาเรื่องนี้มาบอกข้าเอง อย่าให้ข้าต้องส่งคนไปตาม”`,
    },
    temple: {
      failure: `${speaker} ลูบขอบผ้าห่มเก่าแล้วลดเสียงลง “ถ้าข่าวนี้ไปถึงคนทั้งลาน เด็กในวัดจะเดือดร้อนก่อนใคร” เขามองไปทางประตูแล้วพูดต่อ “ไปหาทางหยุดมันก่อนเถอะ ก่อนจะมีคนมาถามที่นี่”`,
      other: `${speaker} ประนมมืออยู่ครู่หนึ่ง “ของที่หายยังตามได้” เขาว่า “ถ้าเจ้าจะไป ก็ไปตอนนี้ก่อนคนอื่นรู้ตัว ข้าจะให้คนเฝ้าประตูไว้”`,
    },
    commoner: {
      failure: `${speaker} กำชายเสื้อไว้แน่นแล้วพูดเบา “ถ้าเขามาถามถึงบ้าน ข้าจะตอบคนเดียวไม่ไหว” เขาเหลือบไปดูคนในเรือน แล้วลดเสียงลงอีก “ช่วยหาคนที่เห็นเรื่องนี้ให้ข้าที อย่างน้อยข้าจะไม่ต้องพูดอยู่คนเดียว”`,
      other: `${speaker} ถอนลมหายใจช้า ๆ “วันนี้เราไปต่อได้” เขาว่า แล้วหันไปดูคนในเรือน “แต่พรุ่งนี้ถ้าเขากลับมาถาม เจ้าช่วยอยู่ด้วยสักครู่ได้ไหม ข้าไม่อยากให้เด็ก ๆ ต้องฟังข้าคนเดียว”`,
    },
  };
  const role = issuerType ?? "commoner";
  return failed ? replies[role].failure : replies[role].other;
}

function localOutcomeNarration(preview: RollPreview, state: GameState, outcome: Outcome, consequence: string) {
  const mission = activeMainMission(state) ?? state.missions[0];
  const speaker = state.currentScene.speaker || mission?.issuer || "ผู้มอบงาน";
  // ดึงสถานะฝ่ายจาก worldSystems.powerRumor (event-driven) — read-only ต่อค่าเกม
  const powerRumor = state.worldSystems?.powerRumor;
  const factionId = factionOfSpeaker(speaker);
  const factionStance = factionId ? powerRumor?.factions.find((f) => f.factionId === factionId)?.stance : undefined;
  const heatLevel = powerRumor?.heatTracks.find(
    (h) => h.locationId === state.currentScene.location && h.provinceId === state.campaign.region.toLowerCase(),
  )?.level ?? powerRumor?.heatTracks[0]?.level ?? 0;
  // ท่อนบทพูดเสริมตามชื่อเสียง (คืน "" ถ้า neutral/ไม่รู้จักฝ่าย)
  const voiceTag = voiceReplyFor(speaker, factionStance, heatLevel);
  const first = `หลังจาก ${state.character.name} ลงมือทำตามที่ตั้งใจไว้ เสียงใน${state.currentScene.location}เงียบลงชั่วขณะ มีเพียงไม้เก่าลั่นใต้ฝ่าเท้าและผ้ากระทบกันเบา ๆ คนที่อยู่ใกล้สุดขยับถอยครึ่งก้าว ไม่ได้หนีไปไหน แต่ก็ไม่อยากยืนติดกับเรื่องนี้เกินจำเป็น ${state.currentScene.pressure}ยังอยู่ตรงเดิม เพียงแต่ตอนนี้ทุกคนเห็นมันชัดกว่าเมื่อครู่.`;
  const middle = `${localSpeakerReply(speaker, mission?.issuerType, state.character.name, outcome === "failure_with_consequence")} คนข้างหลัง${speaker}หลบตา คนหนึ่งก้มจัดเชือกฟางที่ข้อเท้า ไม่มีใครรับคำแทน${state.character.name} แต่คนที่ยืนอยู่แถวนั้นได้ยินสิ่งที่พูด และรู้ว่าต้องระวังคำของตนมากขึ้น.${voiceTag ? " " + voiceTag : ""}`;
  const last = outcome === "decisive_success"
    ? `${speaker}ยอมขยับมือไปแตะสิ่งที่ก่อนหน้านี้ยังไม่ยอมรับ ทางข้างหน้าจึงเปิดกว้างขึ้นกว่าที่คิด แต่ชื่อของ${state.character.name}ก็ถูกคนใน${state.currentScene.location}จำไว้มากขึ้นเช่นกัน ไม่มีใครพูดถึงรางวัลในตอนนั้น ต่างคนต่างกลับไปจับของในมือ หรือมองทางที่ต้องไปต่อ เพราะเรื่องนี้ยังไม่จบแค่ตรงหน้า.`
    : outcome === "failure_with_consequence"
      ? `เรื่องนี้ยังไม่จบ แต่ทางเดิมใช้ไม่ได้เหมือนก่อน ${state.character.name}ต้องหาทางอื่น หรือยอมเสียเวลาและของบางอย่างเพื่อแก้สิ่งที่ค้างอยู่ คนใน${state.currentScene.location}ไม่ได้ลงความเห็นแทนกัน เพียงมองเห็นว่าครั้งต่อไปจะมีคำถามมากขึ้น และไม่มีใครอยากเป็นคนตอบแทนเขา.`
      : `สิ่งที่${state.character.name}ต้องการเกิดขึ้นเพียงส่วนหนึ่ง ส่วนที่เหลือยังค้างอยู่ใน${state.currentScene.location} ${speaker}เก็บของช้าลง ก่อนหันไปดูทางที่คนเดินผ่าน คนอื่นเริ่มกระซิบกันเบา ๆ เพราะต่างคนต่างคิดว่าตนจะเกี่ยวข้องกับเรื่องนี้อย่างไร และข่าวจะไปถึงใครก่อน.`;
  return [first, middle, last].join("\n\n");
}

export function resolveRoll(preview: RollPreview, state: GameState): RollRecord {
  const bypassesRoll = Boolean(preview.specialItem && preview.difficulty === 0);
  const dice: [number, number] = bypassesRoll ? [0, 0] : [Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1];
  const statValue = traitValueForRoll(state.character.attributes[preview.stat]);
  const masteryValue = preview.mastery?.level ?? 0;
  const flawBonus = preview.flawTriggered && preview.flawBonus === -2 ? -2 : 0;
  const contextBonus = Math.max(0, Math.min(2, preview.contextBonus));
  const total = dice[0] + dice[1] + statValue + masteryValue + contextBonus + flawBonus;
  const margin = total - preview.difficulty;
  const outcome = bypassesRoll ? "decisive_success" : outcomeFromMargin(margin);
  const copy = outcomeCopy[outcome];
  return {
    ...preview,
    id: `roll-${Date.now()}`,
    dice,
    total,
    margin,
    outcome,
    summary: `${copy.label}: ${preview.intent}`,
    narrative: localOutcomeNarration(preview, state, outcome, copy.consequence),
    reward: outcome === "failure_with_consequence" ? undefined : "ความคืบหน้าของภารกิจและทางเลือกใหม่",
    consequence: copy.consequence,
    tick: state.tick + 1,
  };
}

function awardPractice(masteries: Mastery[], record: RollRecord) {
  const used = record.mastery ? masteries.find((entry) => entry.id === record.mastery?.id) : undefined;
  if (!used) return { masteries, practice: undefined as SkillPractice | undefined };
  const before = normalizeMasteryProgress(used);
  const levelBefore = before.level;
  if (levelBefore >= MAX_MASTERY_LEVEL) return { masteries, practice: { masteryId: before.id, masteryLabel: before.label, gained: 0, rankBefore: levelBefore, rankAfter: levelBefore, xp: 0, xpNeeded: 0, masteryMark: before.masteryMark ?? "Peerless" } };
  const eligible = record.difficulty >= 12 && !record.specialItem;
  const gained = eligible ? (record.outcome === "decisive_success" ? 2 : 1) : 0;
  let level = levelBefore;
  let xp = (before.xp ?? 0) + gained;
  let masteryMark = before.masteryMark;
  while (level < MAX_MASTERY_LEVEL && xp >= xpNeededForMasteryLevel(level)) {
    xp -= xpNeededForMasteryLevel(level);
    level += 1;
    if (level === MAX_MASTERY_LEVEL) { xp = 0; masteryMark = "Peerless"; }
  }
  const after: Mastery = { ...before, rank: level, level, xp, totalXp: (before.totalXp ?? 0) + gained, masteryMark };
  const practice: SkillPractice = { masteryId: after.id, masteryLabel: after.label, gained, rankBefore: levelBefore, rankAfter: level, xp: after.xp ?? 0, xpNeeded: xpNeededForMasteryLevel(level), masteryMark, note: level >= MAX_MASTERY_LEVEL ? "ถึงระดับหาตัวจับไม่ได้แล้ว" : eligible ? "ฝึกจากการใช้ความชำนาญในงานที่มีความเสี่ยง" : record.specialItem ? "ไอเทมเฉพาะทางเปิดทางให้โดยไม่ต้องฝึกทอย" : "งาน DN 8 เป็นงานคุ้นมือ จึงไม่เพิ่ม Mastery Progress" };
  return { masteries: masteries.map((entry) => entry.id === after.id ? after : entry), practice };
}

function awardStatPractice(attributes: Attributes, statXp: StatXp, record: RollRecord) {
  const stat = record.stat;
  const valueBefore = normalizeStatValue(attributes[stat]);
  const before = statXp[stat] ?? { xp: 0, totalXp: 0 };
  if (valueBefore >= MAX_STAT_VALUE) {
    return { attributes, statXp, practice: { stat, gained: 0, valueBefore, valueAfter: valueBefore, xp: 0, xpNeeded: 0, note: "Stat เติบโตถึงขั้นสูงสุดแล้ว" } as StatPractice };
  }
  const gained = record.difficulty >= 12 && !record.specialItem ? record.outcome === "decisive_success" ? 2 : 1 : 0;
  let value = valueBefore;
  let xp = before.xp + gained;
  while (value < MAX_STAT_VALUE && xp >= statXpNeededForValue(value)) {
    xp -= statXpNeededForValue(value);
    value += 1;
  }
  if (value >= MAX_STAT_VALUE) xp = 0;
  const after = { xp, totalXp: before.totalXp + gained };
  const practice: StatPractice = {
    stat,
    gained,
    valueBefore,
    valueAfter: value,
    xp,
    xpNeeded: traitProgressNeededForLevel(value),
    note: value > valueBefore ? `Trait ${STATS.find((entry) => entry.id === stat)?.th ?? stat} ขึ้นเป็น Level ${value}: ${traitLevelDetails(value).th}` : gained ? `ใช้ Trait ${STATS.find((entry) => entry.id === stat)?.th ?? stat} ในงาน DN ${record.difficulty}` : record.specialItem ? "ไอเทมเฉพาะทางเปิดทางให้โดยไม่ต้องฝึก Trait" : "งาน DN 8 เป็นงานคุ้นมือ จึงไม่เพิ่ม Trait Progress",
  };
  return { attributes: { ...attributes, [stat]: value }, statXp: { ...statXp, [stat]: after }, practice };
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
  // เควสเหตุการณ์สุ่ม: ได้ priority ก่อน mission อื่น — สำเร็จได้รางวัลพิเศษ / แพ้เสียของพิเศษ
  const eventMission = state.missions.find((entry) => entry.randomEvent && (entry.state === "active" || entry.state === "offered"));
  if (eventMission?.randomEvent && eventMission.progress) {
    if (record.outcome === "failure_with_consequence") {
      const lossEffects = eventMission.randomEvent.effects.filter((effect) => (effect.amount ?? 0) < 0 || effect.type === "heat");
      const withLoss = applyEventEffects(state, eventMission.title, lossEffects, record.tick);
      const missions = state.missions.map((entry): Mission => entry.id === eventMission.id ? { ...entry, state: "failed" as MissionState, retiredReason: "ล้มเหลวในเควสเหตุการณ์" } : entry);
      return { missions, inventory: withLoss.character.inventory, update: { missionId: eventMission.id, current: eventMission.progress.current, required: eventMission.progress.required, state: "failed" } };
    }
    const gained = record.outcome === "decisive_success" ? 2 : 1;
    const current = Math.min(eventMission.progress.required, eventMission.progress.current + gained);
    const resolved = current >= eventMission.progress.required;
    if (resolved) {
      const withReward = applyEventEffects(state, eventMission.title, eventMission.randomEvent.effects, record.tick);
      const rewardItem = eventMission.progress.rewardItem ? { ...eventMission.progress.rewardItem, id: `revent-reward-${eventMission.id}-${record.id}` } : undefined;
      const missions = state.missions.map((entry): Mission => entry.id === eventMission.id ? { ...entry, state: "resolved" as MissionState, progress: { ...eventMission.progress!, current, resolvedBy: record.id, rewardGranted: true } } : entry);
      return { missions, inventory: rewardItem ? [...withReward.character.inventory, rewardItem] : withReward.character.inventory, update: { missionId: eventMission.id, current, required: eventMission.progress.required, state: "resolved", reward: eventMission.reward } };
    }
    const questProgress = eventMission.progress;
    const missions = state.missions.map((entry): Mission => entry.id === eventMission.id ? { ...entry, progress: { ...questProgress, current, required: questProgress.required, triggerPhrases: questProgress.triggerPhrases } } : entry);
    return { missions, inventory: state.character.inventory, update: { missionId: eventMission.id, current, required: eventMission.progress.required, state: "active" } };
  }
  const mission = activeMainMission(state) ?? state.missions.find((entry) => entry.state === "offered" || entry.state === "active");
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

function relationshipEvidenceTone(record: RollRecord): PublicRelationshipEvent["tone"] {
  return record.outcome === "failure_with_consequence" ? "vermilion" : record.outcome === "success_with_cost" ? "ochre" : record.outcome === "partial_success" ? "navy" : "teal";
}

/**
 * Relationship evidence is derived only from player-visible roll/context data.
 * It never reads the server dossier and does not change dice, resources, or NPC behavior.
 */
export function captureRelationshipEvidence(state: GameState, record: RollRecord, mission?: Mission): PublicRelationshipContact[] {
  const sourceText = [record.action, record.intent, record.summary, record.consequence ?? "", record.narrative, state.currentScene.speaker, mission?.issuer ?? "", mission?.title ?? ""].join("\n").toLocaleLowerCase();
  return state.relationships.map((contact) => {
    const mentioned = [contact.nameTh, contact.nameEn, contact.contactId]
      .filter(Boolean)
      .some((name) => sourceText.includes(name.toLocaleLowerCase()));
    if (!mentioned) return contact;
    const eventId = `relationship-roll-${contact.contactId}-${record.id}`;
    if (contact.events.some((event) => event.id === eventId)) return contact;
    const event: PublicRelationshipEvent = {
      id: eventId,
      sourceType: "roll",
      sourceId: record.id,
      inGameDay: state.campaign.day,
      tick: record.tick,
      title: relationshipText(`A visible consequence involving ${contact.nameEn}`, `เหตุการณ์ที่เกี่ยวข้องกับ${contact.nameTh}`),
      detail: relationshipText(`The resolved action left a public consequence connected to ${contact.nameEn}.`, `${record.summary}${record.consequence ? ` · ${record.consequence}` : ""}`),
      tone: relationshipEvidenceTone(record),
    };
    const latestDailyLog = contact.latestDailyLog?.inGameDay === state.campaign.day
      ? contact.latestDailyLog
      : { id: `relationship-pending-${contact.contactId}-${state.campaign.day}`, inGameDay: state.campaign.day, status: "pending" as const, summary: relationshipText("Analysis is waiting for the day's evidence.", "กำลังรอวิเคราะห์หลักฐานของวันในเกมนี้"), eventIds: [] };
    return { ...contact, events: [...contact.events, event], latestDailyLog: { ...latestDailyLog, eventIds: Array.from(new Set([...latestDailyLog.eventIds, event.id])) } };
  });
}

/* ==========================================================================
 * Social Record mechanics — ขึ้นเฉพาะ "เหตุการณ์สำคัญ" (ภารกิจหลัก/รองสำเร็จ)
 *
 * Cap: honor 5 · influence 4 (ฝ่ายมีจำกัด) · information 5 · stain 5
 * เพิ่มยาก 2x: เก็บทศนิยมครึ่งหน่วย — ต้อง "ครึ่ง 2 ครั้ง" จึงขึ้น 1 ระดับที่เห็น
 *   - เกียรติ / บารมี / ข่าวในมือ: +0.5 ต่อภารกิจสำเร็จ (หลักหรือรอง)
 *   - ข้อครหา: +1 เมื่อพลาดแบบมีผล (เรื่องสำคัญ) ; ลด -0.5 เมื่อสำเร็จภารกิจ (ลงยาก 2x)
 * อ้างอิงสเปก (เพิ่มยากสองเท่า / เฉพาะภารกิจสำคัญ) — random event กันไว้ทำทีหลัง
 * ========================================================================== */
function applySocialRecord(
  record: RollRecord,
  social: Character["social"],
  missionResult: { update?: RollRecord["missionUpdate"] },
): Character["social"] {
  const missionResolved = missionResult.update?.state === "resolved";
  const clamp = (value: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, value));
  // "ข่าวในมือ" (information) ถูกตัดออกจากกลไกแล้ว — เก็บ field ไว้ในโครงสร้าง เผื่อ random event (สืบ/สอบสวน) ใช้ทีหลัง
  return {
    ...social,
    honor: clamp(social.honor + (missionResolved ? 0.5 : 0), 0, 5),
    influence: clamp(social.influence + (missionResolved ? 0.5 : 0), 0, 4),
    stain: clamp(social.stain + (record.outcome === "failure_with_consequence" ? 1 : 0) - (missionResolved ? 0.5 : 0), 0, 5),
  };
}

export function applyRoll(state: GameState, record: RollRecord): GameState {
  const copy = outcomeCopy[record.outcome];
  const success = record.outcome !== "failure_with_consequence";
  const initialProgression = state.progression ?? defaultProgression(state.campaign, state.character.identity.includes("สิบสาม") ? 13 : 20, state.campaign.season);
  const awarded = awardPractice(state.character.masteries, record);
  const traitAwarded = awardStatPractice(state.character.attributes, state.character.statXp, record);
  const clock = advanceClock(initialProgression, record.outcome);
  const calendar = advanceCampaignCalendar(state.campaign, clock.progression, clock.dayAdvance);
  const missionResult = progressActiveMission(state, record);
  const activeMission = state.missions.find((entry) => entry.state === "offered" || entry.state === "active");
  const relationships = captureRelationshipEvidence(state, record, activeMission);
  const social = applySocialRecord(record, state.character.social, missionResult);
  const action = record.action.toLocaleLowerCase();
  const resting = /พัก|ฟื้น|ทำแผล|rest|recover|heal/.test(action);
  const vitalDelta = resting && record.outcome !== "failure_with_consequence" ? { blood: 1, focus: 1, reason: "พักฟื้นหรือทำแผลสำเร็จ" } : record.outcome === "failure_with_consequence" ? { blood: -1, focus: -1, reason: "ผลลัพธ์รุนแรงทำให้เสียเลือดและสมาธิ" } : record.outcome === "success_with_cost" ? { blood: 0, focus: -1, reason: "สำเร็จแต่ต้องแลกด้วยความกดดัน" } : { blood: 0, focus: 0, reason: "ไม่มีการเปลี่ยน vitals" };
  const maxes = vitalMaxes(state.character);
  const nextVitals = { ...state.character.vitals, maxBlood: maxes.maxBlood, maxFocus: maxes.maxFocus, blood: clampVital(state.character.vitals.blood + vitalDelta.blood, maxes.maxBlood), focus: clampVital(state.character.vitals.focus + vitalDelta.focus, maxes.maxFocus) };
  const updatedCharacter: Character = {
    ...state.character,
    attributes: traitAwarded.attributes,
    statXp: traitAwarded.statXp,
    masteries: awarded.masteries,
    inventory: missionResult.inventory,
    vitals: nextVitals,
    social,
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
  const fallbackSceneBody = record.narrative.split(/\n\n+/).filter(Boolean).slice(0, 3);
  const nextScene: Scene = {
    ...state.currentScene,
    id: `scene-${record.id}`,
    chapter: `Page ${String(record.tick).padStart(2, "0")}`,
    title: success ? "ราคาของคำตอบ" : "สิ่งที่โลกไม่ยอมลืม",
    body: fallbackSceneBody,
    speaker: state.currentScene.speaker,
    prompt: "เจ้าจะทำอย่างไรต่อ?",
    pressure: record.consequence ?? state.currentScene.pressure,
    suggestedActions: success ? ["รับรางวัลแล้วถามเงื่อนไข", "ตามหาคนที่เป็นพยาน", "กลับไปดูภารกิจอื่น"] : ["แก้ความเข้าใจกับผู้คุม", "หาหลักฐานเพิ่ม", "ยอมรับผลแล้วเปลี่ยนแผน"],
  };
  const storedRecord: RollRecord = { ...record, practice: awarded.practice, statPractice: traitAwarded.practice, timeMark: clock.timeMark, missionUpdate: missionResult.update };
  const storyRecord: StoryRecord = { id: `story-${record.id}`, tick: record.tick, inGameDay: state.campaign.day, title: nextScene.title, prose: nextScene.body.join("\n\n"), location: nextScene.location };
  const previousStoryRecords = state.storyRecords ?? [];
  const priorWorld = state.worldSystems?.powerRumor ?? emptyPowerRumorState();
  const rollEvent = eventFromRoll(state, record);
  const updatedWorld = applyWorldEvent(priorWorld, rollEvent);
  const missionResolved = missionResult.update?.state === "resolved";
  /** milestone_id: ภารกิจหลัก/รองที่ resolved ให้ milestone_point ได้ "ครั้งเดียว" ต่อ mission */
  const missionMilestoneId = missionResolved ? `mission-${activeMission?.id ?? record.id}` : undefined;
  const milestoneAlreadyClaimed = missionMilestoneId ? (calendar.progression.claimedMilestoneIds ?? []).includes(missionMilestoneId) : false;
  return maybeTriggerRandomEvent({ ...state, campaign: calendar.campaign, progression: { ...calendar.progression, lastPractice: awarded.practice, lastStatPractice: traitAwarded.practice, growthPoints: (calendar.progression.growthPoints ?? 0) + (record.outcome === "decisive_success" ? 1 : 0), milestonePoints: (calendar.progression.milestonePoints ?? 0) + (missionResolved && !milestoneAlreadyClaimed ? 1 : 0), claimedMilestoneIds: missionMilestoneId && !milestoneAlreadyClaimed ? Array.from(new Set([...(calendar.progression.claimedMilestoneIds ?? []), missionMilestoneId])) : calendar.progression.claimedMilestoneIds, vitalEvents: [...(calendar.progression.vitalEvents ?? []), ...(vitalDelta.blood || vitalDelta.focus ? [{ id: `vital-${record.id}`, type: vitalDelta.blood ? "blood" : "focus", delta: vitalDelta.blood || vitalDelta.focus, reason: vitalDelta.reason, source: resting ? "rest" : "roll", tick: record.tick } as VitalEvent] : [])].slice(-50) }, character: updatedCharacter, currentScene: nextScene, missions, economy: missionResult.transaction ? { ...state.economy, transactions: [...state.economy.transactions, missionResult.transaction] } : state.economy, memories: [...state.memories, memory], rolls: [...state.rolls, storedRecord], storyRecords: [...previousStoryRecords.filter((entry) => entry.id !== storyRecord.id), storyRecord], relationships, tick: record.tick, worldSystems: { ...state.worldSystems, schemaVersion: 1, powerRumor: updatedWorld } });
}

export function buyMarketOffer(state: GameState, offerId: string): { state: GameState; message: string } {
  const offer = state.market.find((entry) => entry.id === offerId);
  if (!offer || !offer.available) return { state, message: "รายการนี้ไม่พร้อมแล้ว" };
  const currencyAmount = state.character.resources.currency?.amount ?? state.character.resources.property;
  const canUseObligation = Boolean(offer.debtAllowed) && offer.id === "saika-medicine" && state.economy.obligations.some((entry) => entry.id === "debt-safehouse-rations" && entry.status === "open");
  const paidOnObligation = currencyAmount < offer.price && canUseObligation;
  if (currencyAmount < offer.price && !paidOnObligation) return { state, message: "เงินไม่พอ · ลองเจรจา รับงาน หรือสร้างหนี้บุญคุณกับผู้ขาย" };
  const inventory = offer.kind === "goods" ? [...state.character.inventory, { ...item(`market-${offer.id}-${Date.now()}`, offer.label, "reserve", offer.note, offer.slots ?? 1, ["unlock"], { value: 1, tags: [offer.id] }), location: "carried" as const, ownership: "owned" as const }] : state.character.inventory;
  const transaction: ExchangeRecord = { id: `tx-${offer.id}-${Date.now()}`, kind: paidOnObligation ? "debt" : offer.kind === "service" ? "service" : "purchase", title: offer.kind === "service" ? `จ้าง ${offer.label}` : `รับ ${offer.label} จากตลาด`, counterpart: paidOnObligation ? "เซฟเฮาส์ของไซกะ" : offer.kind === "service" ? offer.label : state.economy.marketTitle, payment: paidOnObligation ? `หนี้บุญคุณต่อเซฟเฮาส์ · มูลค่า ${formatMoney(offer.price)}` : `จ่าย ${formatMoney(offer.price)}`, witness: paidOnObligation ? "กันทาโร่รับรู้การค้ำ" : "คนในตลาดที่มองเห็นการแลกเปลี่ยน", consequence: paidOnObligation ? `ต้องชำระด้วยแรงงาน ของ หรือภารกิจเสริมจาก ${offer.label}` : offer.priceReason ?? offer.note, tick: state.tick };
  const memory: WorldMemory = { id: `memory-${transaction.id}`, kind: "market_change", title: transaction.title, detail: `${transaction.payment}; ${transaction.consequence}`, tick: state.tick, tone: "ochre" };
  const priorWorld = state.worldSystems?.powerRumor ?? emptyPowerRumorState();
  const debtEvent = paidOnObligation ? applyWorldEvent(priorWorld, eventFromDebt(state, transaction.id, transaction.counterpart)) : priorWorld;
  return {
    state:       { ...state, character: { ...state.character, resources: { ...state.character.resources, currency: { unit: "mon", amount: paidOnObligation ? currencyAmount : currencyAmount - offer.price }, property: paidOnObligation ? currencyAmount : currencyAmount - offer.price, credit: 0 }, inventory }, market: state.market.map((entry) => entry.id === offer.id ? { ...entry, available: false } : entry), economy: { ...state.economy, obligations: paidOnObligation ? state.economy.obligations.map((entry) => entry.id === "debt-safehouse-rations" ? { ...entry, note: `${entry.note} · รับ ${offer.label} เพิ่มโดยกันทาโร่ค้ำ`, due: "ก่อนออกจากที่ซ่อน หรือเมื่อกันทาโร่ทวง" } : entry) : state.economy.obligations, transactions: [...state.economy.transactions, transaction] }, memories: [...state.memories, memory], worldSystems: { ...state.worldSystems, schemaVersion: 1, powerRumor: debtEvent } },
    message: paidOnObligation ? `รับ ${offer.label} แล้ว · บันทึกเป็นหนี้บุญคุณและภารกิจที่ต้องชำระ` : offer.kind === "goods" ? `รับ ${offer.label} แล้ว · จ่ายเป็น ${formatMoney(offer.price)}` : `ใช้บริการ: ${offer.label} · จ่ายเป็น ${formatMoney(offer.price)}`,
  };
}

/* ==========================================================================
 * AI analysis merge — the single validation point between the AI GM and the
 * deterministic engine.
 *
 * Boundary: AI proposes -> engine validates -> RollPreview -> resolveRoll().
 * This function reproduces the previous PlayScene inline merge behavior
 * exactly (field precedence, null handling, clamps) using only existing
 * engine rules (canonicalDifficulty, gameplay ranges). It must remain the
 * one source of truth for merging AI analysis into a RollPreview.
 * ========================================================================== */

/** Shape of the AI GM analysis proposal (mirrors the server analyze contract). */
export type GMAnalysisProposal = {
  intentSummary: string;
  stat: StatId;
  suggestedMastery: string | null;
  difficulty: number;
  contextBonus: number;
  flawTriggered: boolean;
  flawBonus: -2 | 0;
  triggeredFlaw: string | null;
  flawReason: string | null;
  contextReason: string;
  confirmation: string;
  risk: string;
  historicalFence: string;
  historicalStatus: HistoricalStatus;
};

/**
 * Merge an AI GM analysis proposal into a deterministic parseAction() preview.
 * Special-item previews keep the engine difficulty of 0 and the local
 * context bonus/reason; every other field follows the historical UI contract.
 */
export function mergeAIAnalysis(base: RollPreview, analysis: GMAnalysisProposal, masteries: Mastery[]): RollPreview {
  const mastery = analysis.suggestedMastery ? masteries.find((entry) => entry.label.toLowerCase().includes(analysis.suggestedMastery!.toLowerCase()) || analysis.suggestedMastery!.toLowerCase().includes(entry.label.toLowerCase())) : undefined;
  const special = base.specialItem;
  return {
    ...base,
    isRiskOnly: false,
    intent: analysis.intentSummary,
    method: analysis.confirmation,
    stat: analysis.stat,
    mastery,
    contextBonus: special ? base.contextBonus : Math.max(0, Math.min(2, analysis.contextBonus)),
    contextReason: special ? base.contextReason : analysis.contextReason,
    flawTriggered: analysis.flawTriggered,
    flawBonus: analysis.flawBonus,
    triggeredFlaw: analysis.triggeredFlaw ?? undefined,
    flawReason: analysis.flawReason ?? undefined,
    difficulty: special ? 0 : canonicalDifficulty(analysis.difficulty),
    specialItem: special,
    risks: [analysis.risk],
    witnesses: [],
    historical: { status: analysis.historicalStatus, fence: analysis.historicalFence },
  };
}
