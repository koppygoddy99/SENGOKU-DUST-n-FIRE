import React from "react";
import { ArrowRight, BookOpen, Compass, MapPinned, ScrollText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SengokuIcon } from "@/components/SengokuIcon";
import type { GameState } from "@/lib/game";
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

const PROVINCE_NEIGHBORHOODS: Record<ProvinceKey, ProvinceKey[]> = {
  mikawa: ["owari", "mikawa", "shinano", "omi", "koga", "iga"],
  omi: ["omi", "koga", "iga", "yamashiro", "settsu", "izumi"],
  owari: ["owari", "mikawa", "shinano", "omi", "koga", "iga"],
  izumi: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
  iga: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
  koga: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
  kii: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
  yamashiro: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
  settsu: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
  musashi: ["musashi", "shinano", "mikawa", "owari"],
  iyo: ["iyo", "shima", "kii", "izumi", "settsu"],
  shima: ["iyo", "shima", "kii", "izumi", "settsu"],
  shinano: ["shinano", "mikawa", "owari", "omi", "koga", "iga"],
  kaga: ["kaga", "omi", "yamashiro", "koga", "shinano"],
  yamato: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
  kawachi: ["settsu", "kawachi", "izumi", "yamato", "kii", "koga", "iga"],
};

const PROVINCE_LABELS: Record<ProvinceKey, { en: string; th: string }> = {
  mikawa: { en: "MIKAWA", th: "มิกาวะ" }, omi: { en: "OMI", th: "โอมิ" }, owari: { en: "OWARI", th: "โอวาริ" }, izumi: { en: "IZUMI", th: "อิซุมิ" }, iga: { en: "IGA", th: "อิกะ" }, koga: { en: "KOGA", th: "โคงะ" }, kii: { en: "KII", th: "กิอิ" }, yamashiro: { en: "YAMASHIRO", th: "ยามาชิโระ" }, settsu: { en: "SETTSU", th: "เซ็ตสึ" }, musashi: { en: "MUSASHI", th: "มูซาชิ" }, iyo: { en: "IYO", th: "อิโยะ" }, shima: { en: "SHIMA", th: "ชิมะ" }, shinano: { en: "SHINANO", th: "ชินาโนะ" }, kaga: { en: "KAGA", th: "คางะ" }, yamato: { en: "YAMATO", th: "ยามาโตะ" }, kawachi: { en: "KAWACHI", th: "คาวาจิ" },
};

function provinceMapContext(game: GameState): ProvinceMapContext {
  const place = `${game.campaign.region} ${game.currentScene.location}`.toLowerCase();
  const matched = PROVINCE_ALIASES.find(([alias]) => place.includes(alias));
  return PROVINCE_MAP_CONTEXT[matched?.[1] ?? "yamato"];
}

export function StoryMap({ game, language, onOpen }: { game: GameState; language: Language; onOpen: (page: StoryDestination) => void }) {
  const activeMission = game.missions.find((mission) => mission.state === "active" || mission.state === "offered");
  const lastRoll = game.rolls.at(-1);
  const recentMemories = game.memories.slice(-3).reverse();
  const provinceContext = provinceMapContext(game);
  const neighborhood = PROVINCE_NEIGHBORHOODS[provinceContext.marker];

  return <div className="page story-map-page">
    <header className="story-map__header">
      <div>
        <p className="story-map__eyebrow">{copy(language, "CAMPAIGN COMMAND", "บัญชาการแคมเปญ")}</p>
        <h1>{copy(language, "Campaign Command", "บัญชาการแคมเปญ")}</h1>
        <p className="story-map__meta"><strong>{game.campaign.title}</strong><span>·</span>{game.campaign.year} <span>·</span> {seasonName(language, game.campaign.season)} <span>·</span> {game.currentScene.location}</p>
      </div>
    </header>

    <section className="story-command-grid" aria-label={copy(language, "Campaign command desk", "โต๊ะบัญชาการแคมเปญ")}>
      <article className="story-map-card story-map-card--map">
        <div className="story-map-card__heading"><span><MapPinned size={17} /> {copy(language, "PROVINCE MAP", "แผนที่แคว้น")}</span><small>{copy(language, "Campaign reading · not a survey", "ภาพอ่านแคมเปญ · ไม่ใช่แผนที่สำรวจ")}</small></div>
        <div className="province-map" aria-label={copy(language, "Schematic province map with the campaign location", "แผนที่แคว้นเชิงสัญลักษณ์ที่บอกตำแหน่งแคมเปญ")}>
          <span className="province-map__grain province-map__grain--north" />
          <span className="province-map__grain province-map__grain--coast" />
          {neighborhood.map((province) => <span key={province} className={`province-map__region province-map__region--${province}`}><b>{copy(language, PROVINCE_LABELS[province].en, PROVINCE_LABELS[province].th)}</b></span>)}
          <span className="province-map__ridge province-map__ridge--one" /><span className="province-map__ridge province-map__ridge--two" />
          <span className="province-map__coast-label">{copy(language, "SEA ROUTES", "เส้นทางทะเล")}</span>
          <button className={`province-map__marker province-map__marker--${provinceContext.marker}`} onClick={() => onOpen("play")} aria-label={copy(language, `Continue story at ${game.currentScene.location}`, `เล่นต่อที่ ${game.currentScene.location}`)}><span>火</span><i>{copy(language, "Current place", "ตำแหน่งปัจจุบัน")}</i></button>
          <aside className="province-map__location-card" aria-label={copy(language, "Current campaign location", "ตำแหน่งแคมเปญปัจจุบัน")}>
            <p>{copy(language, "CURRENT PLACE", "ตำแหน่งปัจจุบัน")}</p>
            <h2>{game.currentScene.location}</h2>
            <dl><div><dt>{copy(language, "Province", "แคว้น")}</dt><dd>{copy(language, provinceContext.provinceEn, provinceContext.provinceTh)}</dd></div><div><dt>{copy(language, "Ground", "ภูมิประเทศ")}</dt><dd>{copy(language, provinceContext.terrainEn, provinceContext.terrainTh)}</dd></div><div><dt>{copy(language, "War shadow", "เงาสงคราม")}</dt><dd>{game.campaign.warShadow}/6</dd></div></dl>
          </aside>
        </div>
        <div className="story-map__map-footer story-map__map-footer--province"><p><ShieldAlert size={15} /> {copy(language, provinceContext.proseEn, provinceContext.proseTh)}</p><button onClick={() => onOpen("archive")}>{copy(language, "Open World Archive", "เปิดคลังโลก")} <ArrowRight size={15} /></button></div>
      </article>

      <article className="story-map-card story-map-card--desk">
        <div className="story-map-card__heading"><span><SengokuIcon name="sword" tone="vermilion" size={17} /> {copy(language, "STORY DESK", "โต๊ะเรื่องราว")}</span><small>{lastRoll ? `${copy(language, "Leaf", "หน้า")} ${lastRoll.tick}` : copy(language, "First decision", "การตัดสินใจแรก")}</small></div>
        <div className="story-map__dice-tray" aria-label={copy(language, "Last 2d12 roll", "ผลทอย 2d12 ล่าสุด")}>
          <span className="story-map__die">{lastRoll?.dice[0] ?? "?"}</span><b>+</b><span className="story-map__die story-map__die--light">{lastRoll?.dice[1] ?? "?"}</span>
          <div><small>{copy(language, "LAST ROLL", "ผลทอยล่าสุด")}</small><strong>{lastRoll ? `${lastRoll.total} / DN ${lastRoll.difficulty}` : copy(language, "Awaiting intent", "รอเจตนา")}</strong></div>
        </div>
        <div className="story-map__consequence"><p className="story-map__eyebrow">{lastRoll ? outcomeLabel(lastRoll.outcome) : copy(language, "THE CURRENT LEAF", "หน้าปัจจุบัน")}</p><h2>{lastRoll?.summary ?? game.currentScene.title}</h2><p>{lastRoll?.consequence ?? game.currentScene.pressure}</p></div>
        <dl className="story-map__condition-strip" aria-label={copy(language, "Current condition", "สภาพปัจจุบัน")}>
          <div><dt>{copy(language, "Wounds", "บาดแผล")}</dt><dd>{game.character.vitals.wounds}/6</dd></div>
          <div><dt>{copy(language, "Focus", "ค่าสติ")}</dt><dd>{game.character.vitals.focus}/6</dd></div>
          <div><dt>{copy(language, "Momentum", "แรงฮึด")}</dt><dd>{game.character.vitals.momentum}/2</dd></div>
        </dl>
        <Button className="df-button df-button--primary story-map__continue" onClick={() => onOpen("play")}><SengokuIcon name="sword" tone="ink" size={17} /> {copy(language, `Return to ${game.currentScene.location}`, `กลับสู่${game.currentScene.location}`)} <ArrowRight size={18} /></Button>
      </article>
    </section>

    <section className="story-map__below">
      <article className="story-map__mission-card"><p className="story-map__eyebrow">{copy(language, "ACTIVE MISSION", "ภารกิจปัจจุบัน")}</p><h2>{activeMission?.title ?? copy(language, "No mission is active", "ยังไม่มีภารกิจที่กำลังดำเนิน")}</h2><p>{activeMission ? `${activeMission.issuer} · ${activeMission.deadline}` : copy(language, "The next scene will establish what needs your answer.", "ฉากถัดไปจะบอกว่าโลกกำลังต้องการคำตอบใดจากเจ้า")}</p><button onClick={() => onOpen("missions")}>{copy(language, "VIEW MISSION", "ดูภารกิจ")} <ArrowRight size={15} /></button></article>
      <article className="story-map__pulse-card"><p className="story-map__eyebrow">{copy(language, "WORLD STATE PULSE", "ชีพจรของโลก")}</p><div>{recentMemories.length ? recentMemories.map((memory) => <button key={memory.id} onClick={() => onOpen("archive")}><span className={`state-pill state-pill--${memory.tone}`}>{memory.kind}</span><p>{memory.detail}</p><ArrowRight size={15} /></button>) : <p>{copy(language, "No consequence has been recorded yet. The first decision will give the world something to remember.", "โลกยังไม่มีร่องรอยที่บันทึกไว้ การตัดสินใจแรกจะทิ้งบางสิ่งให้โลกจดจำ")}</p>}</div></article>
    </section>
  </div>;
}
