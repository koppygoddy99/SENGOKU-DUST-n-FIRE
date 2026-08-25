import React from "react";
import { useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Compass, ExternalLink, Globe2, Minus, Plus, ScrollText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SengokuIcon } from "@/components/SengokuIcon";
import type { GameState } from "@/lib/game";
import { timelineForCampaign, timelineRegionKey, type HistoricalTimelineRecord } from "@/lib/historicalTimeline";
import { INTERACTIVE_PROVINCES, PROVINCE_BY_ID, provinceName } from "./provinceMapData";
import { localized } from "@/lib/localization";
import "./storyMap.css";

type Language = "en" | "th";
type StoryDestination = "play" | "missions" | "archive" | "character" | "market";

type ProvinceKey = "mikawa" | "omi" | "owari" | "izumi" | "iga" | "koga" | "kii" | "yamashiro" | "settsu" | "musashi" | "iyo" | "shima" | "shinano" | "kaga" | "yamato" | "kawachi";

type ProvinceMapContext = {
  provinceEn: string;
  provinceTh: string;
  terrainEn: string;
  terrainTh: string;
  proseEn: string;
  proseTh: string;
  marker: ProvinceKey;
};

function copy(language: Language, en: string, th: string) {
  return language === "en" ? en : th;
}

function seasonName(language: Language, season: GameState["campaign"]["season"]) {
  const thai = { Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" } as const;
  return language === "en" ? season : thai[season];
}

function outcomeLabel(outcome: string) {
  return outcome.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const PROVINCE_MAP_CONTEXT: Record<ProvinceKey, ProvinceMapContext> = {
  mikawa: { provinceEn: "Mikawa Province", provinceTh: "แคว้นมิกาวะ", terrainEn: "River plain and coastal road", terrainTh: "ที่ราบลุ่มและทางชายฝั่ง", proseEn: "This campaign sits among river flats and roads that carry grain, labor, and orders between villages. The province is historical context; the named hamlet, household, and immediate dispute remain campaign fiction.", proseTh: "แคมเปญนี้อยู่ท่ามกลางที่ราบลุ่มและทางที่ขนข้าว แรงงาน และคำสั่งระหว่างหมู่บ้าน แคว้นเป็นบริบทประวัติศาสตร์ ส่วนหมู่บ้าน เรือน และข้อพิพาทเฉพาะหน้าเป็นเรื่องสมมติของแคมเปญ", marker: "mikawa" },
  omi: { provinceEn: "Omi Province", provinceTh: "แคว้นโอมิ", terrainEn: "Lake road and foothill passage", terrainTh: "ทางเลียบทะเลสาบและช่องเขา", proseEn: "The campaign reads this province through water-side roads, foothill passages, and the movement of people between guarded places. Its exact estate, bridge, and patrol are campaign fiction.", proseTh: "แคมเปญนี้อ่านพื้นที่ผ่านทางเลียบน้ำ ช่องเขา และการเคลื่อนคนระหว่างจุดที่ถูกคุม แปลงที่ดิน สะพาน และเวรยามเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "omi" },
  owari: { provinceEn: "Owari Province", provinceTh: "แคว้นโอวาริ", terrainEn: "River plain and market approach", terrainTh: "ที่ราบริมแม่น้ำและทางเข้าตลาด", proseEn: "The campaign is framed by flat routes, river crossings, and market approaches where news can travel as quickly as goods. The precise town and network are campaign fiction.", proseTh: "แคมเปญนี้มีที่ราบ ทางข้ามน้ำ และทางเข้าตลาดที่ข่าวเดินไวพอ ๆ กับสินค้า เมืองและเครือข่ายเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "owari" },
  izumi: { provinceEn: "Izumi Province", provinceTh: "แคว้นอิซุมิ", terrainEn: "Seaward edge of a trading town", terrainTh: "ชายขอบเมืองท่าริมทะเล", proseEn: "This campaign places the safehouse beyond Sakai’s watched lanes, where tide water, storehouse roads, and the edge of a port town keep every arrival visible. The coastline and borderland context are historical; this precise refuge is campaign fiction.", proseTh: "แคมเปญนี้วางเซฟเฮาส์ไว้นอกตรอกที่ถูกจับตาของซาไก ตรงรอยต่อระหว่างทางเกวียน คลังสินค้า และลมทะเลที่พาเสียงเรือเข้ามาถึงทุกคืน บริบทเมืองท่าและแคว้นเป็นข้อมูลประวัติศาสตร์ ส่วนที่ซ่อนแห่งนี้เป็นเรื่องสมมติของแคมเปญ", marker: "izumi" },
  iga: { provinceEn: "Iga Province", provinceTh: "แคว้นอิกะ", terrainEn: "Inland basin and wooded pass", terrainTh: "แอ่งในแผ่นดินและช่องป่า", proseEn: "The campaign treats this setting as an inland basin linked by wooded passes, where a route can be watched without being a straight line. Its exact hamlet and hidden path are campaign fiction.", proseTh: "แคมเปญนี้วางพื้นที่เป็นแอ่งในแผ่นดินที่เชื่อมด้วยช่องป่า เส้นทางจึงถูกจับตาได้โดยไม่ต้องเป็นทางตรง หมู่บ้านและทางลับเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "iga" },
  koga: { provinceEn: "Koga Region", provinceTh: "โคงะ", terrainEn: "Foothill crossings and field roads", terrainTh: "ทางข้ามเชิงเขาและทางคันนา", proseEn: "The campaign is grounded in foothill crossings and local field roads, where a message or a traveler depends on people who know the next turn. The specific network is campaign fiction.", proseTh: "แคมเปญนี้อยู่กับทางข้ามเชิงเขาและทางคันนาท้องถิ่น ข่าวหรือคนเดินทางจึงต้องพึ่งคนที่รู้ทางเลี้ยวถัดไป เครือข่ายเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "koga" },
  kii: { provinceEn: "Kii Province", provinceTh: "แคว้นกิอิ", terrainEn: "Southern road and wooded foothills", terrainTh: "ทางใต้และเชิงป่าริมเนิน", proseEn: "The campaign is set along a southern route where wooded rises, narrow roads, and the pressure of travel shape what can be carried, hidden, or heard. Its exact village and route remain campaign fiction.", proseTh: "แคมเปญนี้อยู่ตามเส้นทางใต้ที่เนินป่าและทางแคบกำหนดว่าของใดพกไปได้ เรื่องใดซ่อนได้ และข่าวใดเดินถึงก่อน หมู่บ้านและเส้นทางเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "kii" },
  yamashiro: { provinceEn: "Yamashiro Province", provinceTh: "แคว้นยามาชิโระ", terrainEn: "Basin road and capital approach", terrainTh: "ทางในแอ่งและเส้นทางสู่ศูนย์กลาง", proseEn: "The campaign sees this province through roads that approach a political center, where documents, escorts, and rumors can carry more weight than a drawn blade. The exact checkpoint is campaign fiction.", proseTh: "แคมเปญนี้อ่านพื้นที่ผ่านทางที่เข้าสู่ศูนย์กลางอำนาจ เอกสาร คนคุ้มกัน และข่าวลือจึงหนักกว่าคมดาบได้ ด่านเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "yamashiro" },
  settsu: { provinceEn: "Settsu Province", provinceTh: "แคว้นเซ็ตสึ", terrainEn: "Port plain and river route", terrainTh: "ที่ราบท่าเรือและทางน้ำ", proseEn: "The campaign follows lowland roads and water routes that join market districts, ports, and places of inspection. Its particular wharf, warehouse, and patrol are campaign fiction.", proseTh: "แคมเปญนี้ตามทางราบและทางน้ำที่เชื่อมตลาด ท่าเรือ และจุดตรวจ ท่าเทียบ คลัง และเวรยามเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "settsu" },
  musashi: { provinceEn: "Musashi Province", provinceTh: "แคว้นมูซาชิ", terrainEn: "Wide plain and river crossing", terrainTh: "ที่ราบกว้างและทางข้ามแม่น้ำ", proseEn: "The campaign uses broad ground and river crossings to make distance, supply, and who controls a passage matter. The exact settlement and fortification are campaign fiction.", proseTh: "แคมเปญนี้ใช้ที่ราบกว้างและทางข้ามแม่น้ำให้ระยะทาง เสบียง และผู้คุมทางผ่านมีความหมาย ชุมชนและป้อมเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "musashi" },
  iyo: { provinceEn: "Iyo Province", provinceTh: "แคว้นอิโยะ", terrainEn: "Island coast and inland ridge", terrainTh: "ชายฝั่งเกาะและสันเขาด้านใน", proseEn: "The campaign balances sea-facing routes with inland ridges, so weather, boats, and the people who know a landing all shape the next choice. The exact cove is campaign fiction.", proseTh: "แคมเปญนี้วางเส้นทางชายฝั่งคู่กับสันเขาด้านใน ลม เรือ และคนที่รู้จุดขึ้นฝั่งจึงกำหนดทางเลือกต่อไป อ่าวเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "iyo" },
  shima: { provinceEn: "Shima Province", provinceTh: "แคว้นชิมะ", terrainEn: "Indented coast and sea channel", terrainTh: "ชายฝั่งเว้าและช่องน้ำ", proseEn: "The campaign treats the coast as a set of channels and small landings where timing matters as much as distance. The named boat, inlet, and crew are campaign fiction.", proseTh: "แคมเปญนี้อ่านชายฝั่งเป็นช่องน้ำและจุดขึ้นฝั่งเล็ก ๆ ที่จังหวะสำคัญพอ ๆ กับระยะทาง เรือ อ่าว และลูกเรือเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "shima" },
  shinano: { provinceEn: "Shinano Province", provinceTh: "แคว้นชินาโนะ", terrainEn: "Highland basin and mountain road", terrainTh: "แอ่งสูงและทางภูเขา", proseEn: "The campaign is framed by highland ground and mountain roads, where weather, pack animals, and a pass held by someone else change every plan. The exact village is campaign fiction.", proseTh: "แคมเปญนี้อยู่กับพื้นที่สูงและทางภูเขา อากาศ สัตว์บรรทุก และช่องเขาที่มีคนถืออยู่จึงเปลี่ยนทุกแผน หมู่บ้านเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "shinano" },
  kaga: { provinceEn: "Kaga Province", provinceTh: "แคว้นคางะ", terrainEn: "Northern plain and mountain approach", terrainTh: "ที่ราบเหนือและทางเข้าจากภูเขา", proseEn: "The campaign treats the setting through a northern plain and mountain approaches, where stores, shelter, and local mediation can matter more than a single road. The specific temple or village is campaign fiction.", proseTh: "แคมเปญนี้อ่านพื้นที่ผ่านที่ราบเหนือและทางเข้าจากภูเขา เสบียง ที่พัก และคนกลางท้องถิ่นจึงสำคัญกว่าถนนเส้นเดียว วัดหรือหมู่บ้านเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "kaga" },
  yamato: { provinceEn: "Yamato Province", provinceTh: "แคว้นยามาโตะ", terrainEn: "Inland basin and temple road", terrainTh: "แอ่งในแผ่นดินและทางสู่วัด", proseEn: "The campaign reads this place through inland roads, temple holdings, and cultivated ground where protection is always negotiated. The exact shrine, household, and dispute are campaign fiction.", proseTh: "แคมเปญนี้อ่านพื้นที่ผ่านทางในแผ่นดิน ที่ดินของวัด และพื้นที่เพาะปลูกที่ความคุ้มครองต้องต่อรองอยู่เสมอ ศาลเจ้า เรือน และข้อพิพาทเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "yamato" },
  kawachi: { provinceEn: "Kawachi Province", provinceTh: "แคว้นคาวาจิ", terrainEn: "Plain road and river lowland", terrainTh: "ทางราบและที่ลุ่มริมน้ำ", proseEn: "The campaign uses lowland roads, river edges, and dense movement between households to make witnesses and supply routes matter. The exact manor is campaign fiction.", proseTh: "แคมเปญนี้ใช้ทางราบ ริมน้ำ และการเคลื่อนคนระหว่างเรือนให้พยานกับเส้นทางเสบียงมีน้ำหนัก คฤหาสน์หรือที่ดินเฉพาะเป็นเรื่องสมมติของแคมเปญ", marker: "kawachi" },
};

const PROVINCE_ALIASES: [string, ProvinceKey][] = [["sakai", "izumi"], ["izumi", "izumi"], ["ซาไก", "izumi"], ["อิซุมิ", "izumi"], ["mikawa", "mikawa"], ["mikawa", "mikawa"], ["มิกาวะ", "mikawa"], ["omi", "omi"], ["โอมิ", "omi"], ["owari", "owari"], ["โอวาริ", "owari"], ["iga", "iga"], ["อิกะ", "iga"], ["koga", "koga"], ["โคงะ", "koga"], ["kii", "kii"], ["กิอิ", "kii"], ["yamashiro", "yamashiro"], ["ยามาชิโระ", "yamashiro"], ["settsu", "settsu"], ["เซ็ตสึ", "settsu"], ["musashi", "musashi"], ["มูซาชิ", "musashi"], ["iyo", "iyo"], ["อิโยะ", "iyo"], ["shima", "shima"], ["ชิมะ", "shima"], ["shinano", "shinano"], ["ชินาโนะ", "shinano"], ["kaga", "kaga"], ["คางะ", "kaga"], ["yamato", "yamato"], ["ยามาโตะ", "yamato"], ["kawachi", "kawachi"], ["คาวาจิ", "kawachi"]];

const PROVINCE_NEIGHBORHOODS: Record<ProvinceKey, string[]> = {
  mikawa: ["mikawa", "owari", "mino", "shinano", "totomi"],
  omi: ["omi", "wakasa", "echizen", "iga", "yamashiro"],
  owari: ["owari", "mikawa", "mino", "ise", "shinano"],
  izumi: ["izumi", "settsu", "kawachi", "yamato", "kii"],
  iga: ["iga", "ise", "omi", "yamato", "yamashiro"],
  koga: ["omi", "iga", "yamashiro", "yamato", "ise"],
  kii: ["kii", "izumi", "yamato", "ise", "awa-shikoku"],
  yamashiro: ["yamashiro", "settsu", "omi", "iga", "yamato"],
  settsu: ["settsu", "harima", "tanba", "yamashiro", "kawachi"],
  musashi: ["musashi", "kai", "sagami", "kozuke", "shimosa"],
  iyo: ["iyo", "sanuki", "awa-shikoku", "tosa", "awaji"],
  shima: ["shima", "ise", "iga", "kii", "izumi"],
  shinano: ["shinano", "echigo", "etchu", "hida", "kai"],
  kaga: ["kaga", "echizen", "noto", "etchu", "hida"],
  yamato: ["yamato", "izumi", "kawachi", "iga", "yamashiro"],
  kawachi: ["kawachi", "settsu", "izumi", "yamato", "harima"],
};

const PROVINCE_LABELS: Record<ProvinceKey, { en: string; th: string }> = {
  mikawa: { en: "MIKAWA", th: "มิกาวะ" }, omi: { en: "OMI", th: "โอมิ" }, owari: { en: "OWARI", th: "โอวาริ" }, izumi: { en: "IZUMI", th: "อิซุมิ" }, iga: { en: "IGA", th: "อิกะ" }, koga: { en: "KOGA", th: "โคงะ" }, kii: { en: "KII", th: "กิอิ" }, yamashiro: { en: "YAMASHIRO", th: "ยามาชิโระ" }, settsu: { en: "SETTSU", th: "เซ็ตสึ" }, musashi: { en: "MUSASHI", th: "มูซาชิ" }, iyo: { en: "IYO", th: "อิโยะ" }, shima: { en: "SHIMA", th: "ชิมะ" }, shinano: { en: "SHINANO", th: "ชินาโนะ" }, kaga: { en: "KAGA", th: "คางะ" }, yamato: { en: "YAMATO", th: "ยามาโตะ" }, kawachi: { en: "KAWACHI", th: "คาวาจิ" },
};

function provinceMapContext(game: GameState): ProvinceMapContext {
  const place = `${game.campaign.region} ${game.currentScene.location}`.toLowerCase();
  const matched = PROVINCE_ALIASES.find(([alias]) => place.includes(alias));
  return PROVINCE_MAP_CONTEXT[matched?.[1] ?? "yamato"];
}

export function reviewMapModeFromUrl(): "national" {
  return "national";
}

function reviewProvinceZoomFromUrl() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("review")) && params.get("mapZoom") === "province";
}

function reviewProvinceIdFromUrl() {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("mapProvince");
  return id && PROVINCE_BY_ID.has(id) ? id : undefined;
}

export function StoryMap({ game, language, onOpen }: { game: GameState; language: Language; onOpen: (page: StoryDestination) => void }) {
  const activeMission = game.missions.find((mission) => mission.state === "active" || mission.state === "offered");
  const lastRoll = game.rolls.at(-1);
  const recentMemories = game.memories.slice(-3).reverse();
  const provinceContext = provinceMapContext(game);
  const timeline = timelineForCampaign(game.campaign.year, game.campaign.region);

  return <div className="page story-map-page">
    <header className="story-map__header">
      <div>
        <p className="story-map__eyebrow">{copy(language, "CAMPAIGN COMMAND", "บัญชาการแคมเปญ")}</p>
        <h1>{copy(language, "Campaign Command", "บัญชาการแคมเปญ")}</h1>
        <p className="story-map__meta"><strong>{game.campaign.title}</strong><span>·</span>{game.campaign.year} <span>·</span> {seasonName(language, game.campaign.season)} <span>·</span> {game.currentScene.location}</p>
      </div>
    </header>

    <section data-testid="campaign-command-grid" className="story-command-grid" aria-label={copy(language, "Campaign command desk", "โต๊ะบัญชาการแคมเปญ")}>
      <article className="story-map-card story-map-card--map">
        <div className="story-map-card__heading"><span><Globe2 size={17} /> {copy(language, "NATIONAL MAP", "แผนที่ระดับประเทศ")}</span><small>{copy(language, "Current position · campaign context", "ตำแหน่งปัจจุบัน · บริบทแคมเปญ")}</small></div>
        <NationalContextMap language={language} game={game} currentProvince={timelineRegionKey(game.campaign.region)} />
      </article>

      <article className="story-map-card story-map-card--desk">
        <div className="story-map-card__heading"><span><SengokuIcon name="sword" tone="vermilion" size={17} /> {copy(language, "STORY DESK", "โต๊ะเรื่องราว")}</span><small>{lastRoll ? `${copy(language, "Page", "หน้า")} ${lastRoll.tick}` : copy(language, "First decision", "การตัดสินใจแรก")}</small></div>
        <div className="story-map__dice-tray" aria-label={copy(language, "Last 2d12 roll", "ผลทอย 2d12 ล่าสุด")}>
          <span className="story-map__die">{lastRoll?.dice[0] ?? "?"}</span><b>+</b><span className="story-map__die story-map__die--light">{lastRoll?.dice[1] ?? "?"}</span>
          <div><small>{copy(language, "LAST ROLL", "ผลทอยล่าสุด")}</small><strong>{lastRoll ? `${lastRoll.total} / DN ${lastRoll.difficulty}` : copy(language, "Awaiting intent", "รอเจตนา")}</strong></div>
        </div>
        <div className="story-map__consequence"><p className="story-map__eyebrow">{lastRoll ? outcomeLabel(lastRoll.outcome) : copy(language, "THE CURRENT PAGE", "หน้าปัจจุบัน")}</p><h2>{localized(language, lastRoll?.summary ?? game.currentScene.title)}</h2><p>{localized(language, lastRoll?.consequence ?? game.currentScene.pressure)}</p></div>
        <dl className="story-map__condition-strip" aria-label={copy(language, "Current condition", "สภาพปัจจุบัน")}>
          <div><dt>{copy(language, "Wounds", "บาดแผล")}</dt><dd>{game.character.vitals.wounds}/6</dd></div>
          <div><dt>{copy(language, "Focus", "ค่าสติ")}</dt><dd>{game.character.vitals.focus}/6</dd></div>
          <div><dt>{copy(language, "Momentum", "แรงฮึด")}</dt><dd>{game.character.vitals.momentum}/2</dd></div>
        </dl>
        <Button className="df-button df-button--primary story-map__continue" aria-label={copy(language, `Return to ${game.currentScene.location}`, `กลับสู่ฉากที่${game.currentScene.location}`)} onClick={() => onOpen("play")}><SengokuIcon name="sword" tone="ink" size={17} /> {copy(language, "Continue scene", "กลับสู่ฉาก")} <ArrowRight size={18} /></Button>
      </article>
    </section>

    <section className="story-map__below">
      <article className="story-map__mission-card"><p className="story-map__eyebrow">{copy(language, "ACTIVE MISSION", "ภารกิจปัจจุบัน")}</p><h2>{localized(language, activeMission?.title ?? copy(language, "No mission is active", "ยังไม่มีภารกิจที่กำลังดำเนิน"))}</h2><p>{activeMission ? `${localized(language, activeMission.issuer)} · ${localized(language, activeMission.deadline)}` : copy(language, "The next scene will establish what needs your answer.", "ฉากถัดไปจะบอกว่าโลกกำลังต้องการคำตอบใดจากเจ้า")}</p><button onClick={() => onOpen("missions")}>{copy(language, "VIEW MISSION", "ดูภารกิจ")} <ArrowRight size={15} /></button></article>
      <article className="story-map__pulse-card"><p className="story-map__eyebrow">{copy(language, "WORLD CURRENTS", "ความเคลื่อนไหวในแผ่นดิน")}</p><div>{recentMemories.length ? recentMemories.map((memory) => <button key={memory.id} onClick={() => onOpen("archive")}><span className={`state-pill state-pill--${memory.tone}`}>{memory.kind}</span><p>{memory.detail}</p><ArrowRight size={15} /></button>) : <p>{copy(language, "No consequence has been recorded yet. The first decision will give the world something to remember.", "โลกยังไม่มีร่องรอยที่บันทึกไว้ การตัดสินใจแรกจะทิ้งบางสิ่งให้โลกจดจำ")}</p>}</div></article>
    </section>
    <HistoricalTimeline language={language} year={game.campaign.year} season={game.campaign.season} region={game.campaign.region} records={timeline} />
  </div>;
}

function NationalContextMap({ language, game, currentProvince }: { language: Language; game: GameState; currentProvince: string }) {
  const [zoomed, setZoomed] = useState(reviewProvinceZoomFromUrl);
  const currentDetail = PROVINCE_BY_ID.get(currentProvince) ?? PROVINCE_BY_ID.get("omi")!;
  const [selectedId, setSelectedId] = useState(() => reviewProvinceIdFromUrl() ?? currentDetail.id);
  const selected = PROVINCE_BY_ID.get(selectedId) ?? currentDetail;
  const nearbyIds = PROVINCE_NEIGHBORHOODS[currentProvince as ProvinceKey] ?? [currentDetail.id];
  const nearby = nearbyIds.map((id) => PROVINCE_BY_ID.get(id)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const visibleProvinces = zoomed ? Array.from(new Map([currentDetail, ...nearby.filter((entry) => entry.id !== currentDetail.id).slice(0, 2), selected].map((entry) => [entry.id, entry])).values()) : [];
  const regionLabel = copy(language, provinceMapContext(game).provinceEn, provinceMapContext(game).provinceTh);
  return <div data-testid="national-context-map" className={`national-context-map ${zoomed ? "is-zoomed" : ""}`} aria-label={copy(language, "National map with current campaign region", "แผนที่ระดับประเทศที่บอกภูมิภาคแคมเปญปัจจุบัน")}>
    <div className="national-context-map__canvas">
      <div className="national-context-map__map-layer" style={{ transformOrigin: `${currentDetail.x}% ${currentDetail.y}%`, transform: zoomed ? "scale(2.65)" : "scale(1)" }}>
        <img className="national-context-map__image" src="/manus-storage/dust-fire-national-map-clean_73af6005.png" alt={copy(language, "A cleaned national map of the Japanese archipelago used for campaign orientation", "แผนที่หมู่เกาะญี่ปุ่นฉบับตัดองค์ประกอบเพื่อใช้บอกบริบทแคมเปญ")} />
        {visibleProvinces.map((province) => <button key={province.id} type="button" data-testid={`province-hotspot--${province.id}`} className={`national-context-map__province national-context-map__province--${province.id} ${selected.id === province.id ? "is-selected" : ""} ${currentDetail.id === province.id ? "is-current" : ""}`} style={{ left: `${province.x}%`, top: `${province.y}%` }} onClick={() => setSelectedId(province.id)} aria-pressed={selected.id === province.id} aria-label={copy(language, `Inspect ${province.en} Province`, `อ่านข้อมูลแคว้น${province.th}`)}><span>{provinceName(province, language)}</span><small>{province.jp}</small></button>)}
        <span className={`national-context-map__marker national-context-map__marker--${currentProvince}`}><i>火</i><b>{regionLabel}</b></span>
      </div>
      <div className="national-context-map__zoom-controls" role="group" aria-label={copy(language, "Map zoom", "การซูมแผนที่")}><button type="button" className={!zoomed ? "is-active" : ""} onClick={() => setZoomed(false)} aria-pressed={!zoomed}><Minus size={14} /> {copy(language, "Overview", "ภาพรวม")}</button><button type="button" data-testid="national-map-zoom-in" className={zoomed ? "is-active" : ""} onClick={() => setZoomed(true)} aria-pressed={zoomed}><Plus size={14} /> {copy(language, "Province detail", "ดูแคว้น")}</button></div>
    </div>
    <div className="national-context-map__legend"><div><p>{copy(language, "CURRENT PLACE", "ตำแหน่งปัจจุบัน")}</p><strong>{game.currentScene.location}</strong><span>{copy(language, `You are in ${regionLabel}.`, `เจ้ากำลังอยู่ใน${regionLabel}`)}</span></div>{zoomed && <span className="national-context-map__zoom-hint">{copy(language, "Select a province label to read its local context.", "เลือกชื่อแคว้นเพื่ออ่านบริบทพื้นที่")}</span>}</div>
    {zoomed && <div className="national-context-map__province-brief" data-testid="national-map-province-brief"><div><p>{copy(language, "PROVINCE DETAIL", "ข้อมูลแคว้น")}</p><h3>{provinceName(selected, language)} <span>· {selected.jp}</span></h3><p>{copy(language, selected.focus.en, selected.focus.th)}</p></div></div>}
  </div>;
}

function HistoricalTimeline({ language, year, season, region, records }: { language: Language; year: number; season: GameState["campaign"]["season"]; region: string; records: (HistoricalTimelineRecord & { relevance: "regional" | "national" })[] }) {
  return <section className="historical-timeline" aria-label={copy(language, "Historical timeline", "ไทม์ไลน์ประวัติศาสตร์")}><header><div><p className="story-map__eyebrow">{copy(language, "HISTORICAL TIMELINE", "ไทม์ไลน์ประวัติศาสตร์")}</p><h2><CalendarDays size={20} /> {year} · {seasonName(language, season)}</h2><p>{copy(language, `Cited context for ${region}; it does not resolve your campaign or create mandatory quests.`, `บริบทที่มีแหล่งอ้างอิงสำหรับ ${region}; ข้อมูลนี้ไม่ตัดสินแคมเปญและไม่สร้างภารกิจบังคับ`)}</p></div><span className="historical-timeline__fence"><ShieldAlert size={15} /> {copy(language, "Historical Fence", "แนวกั้นประวัติศาสตร์")}</span></header>{records.length ? <div className="historical-timeline__records">{records.map((record) => <article key={record.id}><div className="historical-timeline__record-meta"><span className={`historical-timeline__kind historical-timeline__kind--${record.kind}`}>{copy(language, record.kind === "battle" ? "BATTLE" : "EVENT", record.kind === "battle" ? "ศึก" : "เหตุการณ์")}</span><time>{copy(language, record.date.en, record.date.th)}</time><span>{copy(language, record.relevance === "regional" ? "Regional context" : "National context", record.relevance === "regional" ? "บริบทภูมิภาค" : "บริบทระดับประเทศ")}</span></div><h3>{copy(language, record.title.en, record.title.th)}</h3><p>{copy(language, record.summary.en, record.summary.th)}</p><a href={record.source.url} target="_blank" rel="noreferrer">{record.source.label}<ExternalLink size={13} /></a></article>)}</div> : <div className="historical-timeline__empty"><BookOpen size={20} /><p>{copy(language, "This local prototype has no reviewed record for this campaign year yet. The game keeps the date visible instead of filling the gap with invented history.", "ต้นแบบนี้ยังไม่มีรายการที่ผ่านการตรวจทานสำหรับปีแคมเปญนี้ เกมจะแสดงวันที่ไว้แทนการเติมประวัติศาสตร์ที่แต่งขึ้น")}</p></div>}</section>;
}
