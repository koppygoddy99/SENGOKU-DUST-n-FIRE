import React from "react";
import { ArrowRight, BookOpen, Compass, MapPinned, ScrollText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SengokuIcon } from "@/components/SengokuIcon";
import type { GameState } from "@/lib/game";
import "./storyMap.css";

type Language = "en" | "th";
type StoryDestination = "play" | "missions" | "archive" | "character" | "market";

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

export function StoryMap({ game, language, onOpen }: { game: GameState; language: Language; onOpen: (page: StoryDestination) => void }) {
  const activeMission = game.missions.find((mission) => mission.state === "active" || mission.state === "offered");
  const lastRoll = game.rolls.at(-1);
  const recentMemories = game.memories.slice(-3).reverse();
  const engineLabel = copy(language, "Story Engine: Local", "เครื่องยนต์เรื่องราว: ในเครื่อง");
  const engineNote = copy(language, "Rules, dice, and saves stay with this campaign.", "กติกา ลูกเต๋า และบันทึกยังอยู่กับแคมเปญนี้");

  return <div className="page story-map-page">
    <header className="story-map__header">
      <div>
        <p className="story-map__eyebrow">{copy(language, "STORY MAP · CAMPAIGN COMMAND", "แผนที่เรื่องราว · โต๊ะบัญชาการ")}</p>
        <h1>{game.campaign.title}</h1>
        <p className="story-map__meta">{game.campaign.year} · {seasonName(language, game.campaign.season)} · {game.currentScene.location}</p>
      </div>
      <div className="story-map__engine" aria-label={engineLabel}>
        <span className="story-map__engine-dot" />
        <div><strong>{engineLabel}</strong><small>{engineNote}</small></div>
      </div>
    </header>

    <section className="story-command-grid" aria-label={copy(language, "Campaign command desk", "โต๊ะบัญชาการแคมเปญ")}>
      <article className="story-map-card story-map-card--map">
        <div className="story-map-card__heading"><span><MapPinned size={17} /> {copy(language, "WORLD MAP", "แผนที่โลก")}</span><small>{copy(language, "Campaign layer", "ชั้นข้อมูลแคมเปญ")}</small></div>
        <div className="story-map__surface" aria-label={copy(language, "Campaign map with current place, mission, and memory markers", "แผนที่แคมเปญที่มีตำแหน่งปัจจุบัน ภารกิจ และร่องรอยความทรงจำ")}>
          <span className="story-map__terrain story-map__terrain--north" />
          <span className="story-map__terrain story-map__terrain--south" />
          <span className="story-map__river" />
          <span className="story-map__route story-map__route--one" />
          <span className="story-map__route story-map__route--two" />
          <span className="story-map__fog" />
          <button className="story-map__marker story-map__marker--current" onClick={() => onOpen("play")} aria-label={copy(language, `Continue story at ${game.currentScene.location}`, `เล่นต่อที่ ${game.currentScene.location}`)}><span>火</span><i>{game.currentScene.location}</i></button>
          {activeMission && <button className="story-map__marker story-map__marker--mission" onClick={() => onOpen("missions")} aria-label={copy(language, `View active mission ${activeMission.title}`, `ดูภารกิจ ${activeMission.title}`)}><Compass size={17} /><i>{copy(language, "Mission", "ภารกิจ")}</i></button>}
          {recentMemories.slice(0, 2).map((memory, index) => <button key={memory.id} className={`story-map__marker story-map__marker--memory story-map__marker--memory-${index + 1}`} onClick={() => onOpen("archive")} aria-label={copy(language, `Read memory ${memory.title}`, `อ่านความทรงจำ ${memory.title}`)}><BookOpen size={15} /><i>{copy(language, "Memory", "ร่องรอย")}</i></button>)}
          <div className="story-map__legend"><span><b className="is-current" />{copy(language, "Current place", "ตำแหน่งปัจจุบัน")}</span><span><b className="is-mission" />{copy(language, "Mission pressure", "แรงกดดันภารกิจ")}</span><span><b className="is-memory" />{copy(language, "Recorded memory", "เรื่องที่ถูกจดจำ")}</span></div>
        </div>
        <div className="story-map__map-footer"><p><ShieldAlert size={15} /> {copy(language, `War shadow ${game.campaign.warShadow}/6 · routes are campaign knowledge, not a claim of historical fact.`, `เงาสงคราม ${game.campaign.warShadow}/6 · เส้นทางเป็นความรู้ของแคมเปญ ไม่ใช่ข้อเท็จจริงทางประวัติศาสตร์`)}</p><button onClick={() => onOpen("archive")}>{copy(language, "Open World Index", "เปิดดัชนีโลก")} <ArrowRight size={15} /></button></div>
      </article>

      <article className="story-map-card story-map-card--desk">
        <div className="story-map-card__heading"><span><SengokuIcon name="sword" tone="vermilion" size={17} /> {copy(language, "STORY DESK", "โต๊ะเรื่องราว")}</span><small>{lastRoll ? `${copy(language, "Leaf", "หน้า")} ${lastRoll.tick}` : copy(language, "First decision", "การตัดสินใจแรก")}</small></div>
        <div className="story-map__dice-tray" aria-label={copy(language, "Last 2d12 roll", "ผลทอย 2d12 ล่าสุด")}>
          <span className="story-map__die">{lastRoll?.dice[0] ?? "?"}</span><b>+</b><span className="story-map__die story-map__die--light">{lastRoll?.dice[1] ?? "?"}</span>
          <div><small>{copy(language, "LAST ROLL", "ผลทอยล่าสุด")}</small><strong>{lastRoll ? `${lastRoll.total} / DN ${lastRoll.difficulty}` : copy(language, "Awaiting intent", "รอเจตนา")}</strong></div>
        </div>
        <div className="story-map__consequence"><p className="story-map__eyebrow">{lastRoll ? outcomeLabel(lastRoll.outcome) : copy(language, "THE CURRENT LEAF", "หน้าปัจจุบัน")}</p><h2>{lastRoll?.summary ?? game.currentScene.title}</h2><p>{lastRoll?.consequence ?? game.currentScene.pressure}</p></div>
        <Button className="df-button df-button--primary story-map__continue" onClick={() => onOpen("play")}><SengokuIcon name="sword" tone="ink" size={17} /> {copy(language, "CONTINUE STORY", "เล่นเรื่องต่อ")} <ArrowRight size={18} /></Button>
      </article>

      <aside className="story-map-card story-map-card--state">
        <div className="story-map-card__heading"><span><ScrollText size={17} /> {copy(language, "CURRENT STATE", "สถานะปัจจุบัน")}</span><small>{copy(language, "Only what matters now", "เฉพาะสิ่งที่ใช้ตัดสินใจตอนนี้")}</small></div>
        <dl className="story-map__state-list">
          <div><dt>{copy(language, "Wounds", "บาดแผล")}</dt><dd>{game.character.vitals.wounds}/6</dd></div>
          <div><dt>{copy(language, "Focus", "ค่าสติ")}</dt><dd>{game.character.vitals.focus}/6</dd></div>
          <div><dt>{copy(language, "Momentum", "แรงฮึด")}</dt><dd>{game.character.vitals.momentum}/2</dd></div>
          <div><dt>{copy(language, "Property", "ทรัพย์สิน")}</dt><dd>{game.character.resources.property}</dd></div>
          <div><dt>{copy(language, "Supplies", "เสบียง")}</dt><dd>{game.character.resources.supplies}</dd></div>
          <div><dt>{copy(language, "Open obligations", "หนี้และบุญคุณค้าง")}</dt><dd>{game.economy?.obligations.filter((entry) => entry.status === "open").length ?? 0}</dd></div>
        </dl>
        <button className="story-map__text-link" onClick={() => onOpen("character")}>{copy(language, "Review character dossier", "ดูแฟ้มตัวละคร")} <ArrowRight size={15} /></button>
      </aside>
    </section>

    <section className="story-map__below">
      <article className="story-map__mission-card"><p className="story-map__eyebrow">{copy(language, "ACTIVE MISSION", "ภารกิจปัจจุบัน")}</p><h2>{activeMission?.title ?? copy(language, "No mission is active", "ยังไม่มีภารกิจที่กำลังดำเนิน")}</h2><p>{activeMission ? `${activeMission.issuer} · ${activeMission.deadline}` : copy(language, "The next scene will establish what needs your answer.", "ฉากถัดไปจะบอกว่าโลกกำลังต้องการคำตอบใดจากเจ้า")}</p><button onClick={() => onOpen("missions")}>{copy(language, "VIEW MISSION", "ดูภารกิจ")} <ArrowRight size={15} /></button></article>
      <article className="story-map__pulse-card"><p className="story-map__eyebrow">{copy(language, "WORLD STATE PULSE", "ชีพจรของโลก")}</p><div>{recentMemories.length ? recentMemories.map((memory) => <button key={memory.id} onClick={() => onOpen("archive")}><span className={`state-pill state-pill--${memory.tone}`}>{memory.kind}</span><p>{memory.detail}</p><ArrowRight size={15} /></button>) : <p>{copy(language, "No consequence has been recorded yet. The first decision will give the world something to remember.", "โลกยังไม่มีร่องรอยที่บันทึกไว้ การตัดสินใจแรกจะทิ้งบางสิ่งให้โลกจดจำ")}</p>}</div></article>
    </section>
  </div>;
}
