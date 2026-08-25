import { ArrowLeft, ArrowRight, BookOpen, EyeOff, LockKeyhole, Search, Sparkles } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { type GameState } from "@/lib/game";
import "./chronicleView.css";
import { localized } from "@/lib/localization";

type Language = "en" | "th";
type ChronicleEntry = { id: string; tick: number; kind: "Memory" | "Roll"; title: string; story: string; roll?: GameState["rolls"][number] };
const copy = (language: Language, en: string, th: string) => language === "en" ? en : th;
const splitStoryParagraphs = (story: string) => story.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

function EntryBadge({ entry, language }: { entry: ChronicleEntry; language: Language }) {
  return <span className={`chronicle-entry__badge chronicle-entry__badge--${entry.kind.toLowerCase()}`}>{entry.kind === "Roll" ? copy(language, "DECISION", "การตัดสินใจ") : copy(language, "WORLD TRACE", "ร่องรอยโลก")}</span>;
}

export function ChronicleView({ game, language, readerMode, setReaderMode }: { game: GameState; language: Language; readerMode: boolean; setReaderMode: (value: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [readerIndex, setReaderIndex] = useState(0);
  const entries = useMemo<ChronicleEntry[]>(() => [
    ...game.memories.map((memory): ChronicleEntry => ({ id: memory.id, tick: memory.tick, kind: "Memory", title: localized(language, memory.title), story: localized(language, memory.detail) })),
    ...game.rolls.map((roll): ChronicleEntry => ({ id: roll.id, tick: roll.tick, kind: "Roll", title: localized(language, roll.summary), story: localized(language, roll.narrative), roll })),
  ].sort((a, b) => a.tick - b.tick), [game.memories, game.rolls, language]);
  const visible = entries.filter((entry) => `${entry.title} ${entry.story}`.toLowerCase().includes(query.toLowerCase()));
  const shelf = entries.slice(-4).reverse();
  const latest = entries.at(-1);
  const latestRoll = game.rolls.at(-1);
  const activeMission = game.missions.find((mission) => mission.state === "active" || mission.state === "offered");
  const progression = game.progression;
  const season = language === "en" ? game.campaign.season : ({ Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" } as const)[game.campaign.season];
  const segment = progression?.segment === "night" ? copy(language, "night", "ยามค่ำ") : copy(language, "day", "ยามกลางวัน");
  const latestMissionUpdate = latestRoll?.missionUpdate;
  const readerEntry = entries[Math.max(0, Math.min(readerIndex, entries.length - 1))];
  const readerStory = readerEntry?.story ?? copy(language, "No recorded events yet. Return to Play and make the first choice.", "ยังไม่มีเหตุการณ์ที่บันทึกไว้ กลับไปเล่นฉากแล้วตัดสินใจครั้งแรก");
  const latestPreview = (latest?.story ?? game.currentScene.pressure).slice(0, 320);

  return <div className={`page log-view chronicle-view ${readerMode ? "is-reader" : ""}`}>
    <div className="chronicle-view__topline"><div className="chronicle-view__identity"><span className="chronicle-view__seal">火</span><div><strong>{game.campaign.title}</strong><small>{game.campaign.year} · {game.campaign.season} · {game.campaign.location}</small></div></div><div className="reader-switch"><span><EyeOff size={17} /> {copy(language, "Reader Mode", "โหมดอ่าน")}</span><Switch checked={readerMode} onCheckedChange={setReaderMode} /></div></div>
    {readerMode ? <section className="reader-paper"><div className="reader-paper__chapter">{game.campaign.title} · {copy(language, "PAGE", "หน้า")} {readerEntry?.tick ?? 1} · {season} · {copy(language, "Day", "วันที่")} {game.campaign.day}</div><h2>{readerEntry?.title ?? copy(language, "The first page", "หน้าเรื่องแรก")}</h2><div className="reader-paper__scroll">{splitStoryParagraphs(readerStory).map((paragraph: string, index: number) => <p key={`${readerEntry?.id ?? "empty"}-${index}`}>{paragraph}</p>)}<p className="reader-question">{game.currentScene.prompt}</p></div><div className="reader-paper__footer"><button disabled={readerIndex <= 0} onClick={() => setReaderIndex((index) => Math.max(0, index - 1))}><ArrowLeft size={16} /> {copy(language, "Previous", "ก่อนหน้า")}</button><span>{readerIndex + 1} / {Math.max(entries.length, 1)}</span><button disabled={readerIndex >= entries.length - 1} onClick={() => setReaderIndex((index) => Math.min(entries.length - 1, index + 1))}>{copy(language, "Next", "ถัดไป")} <ArrowRight size={16} /></button></div></section> : <>
      <header className="chronicle-view__heading"><div><p className="chronicle-view__eyebrow">{copy(language, "INTERACTIVE NOVEL LIBRARY", "ห้องสมุดนิยายโต้ตอบ")}</p><h1>{copy(language, "Chronicle", "จดหมายเหตุ")}</h1><p>{copy(language, "Read the leaves this campaign earned. Mechanics remain available when you need to inspect a consequence.", "อ่านหน้าที่แคมเปญนี้สร้างไว้ รายละเอียดการทอยยังเปิดดูได้เมื่อต้องตรวจผลกระทบ")}</p><small className="chronicle-view__campaign-scope" data-testid="chronicle-campaign-scope">{copy(language, `This chronicle belongs only to ${game.campaign.title}.`, `จดหมายเหตุนี้เป็นของแคมเปญ ${game.campaign.title} เท่านั้น`)}</small></div><div className="chronicle-view__count"><BookOpen size={18} /><strong>{entries.length}</strong><span>{copy(language, "recorded pages", "หน้าที่ถูกบันทึก")}</span></div></header>
      <section className="chronicle-view__status-ledger" aria-label={copy(language, "Campaign time, thread, and latest consequence", "เวลา เส้นเรื่อง และผลล่าสุดของแคมเปญ")}>
        <div><small>{copy(language, "CAMPAIGN FOLIO", "ใบเรื่องแคมเปญ")}</small><strong>{copy(language, "PAGE", "หน้า")} {progression?.leaf ?? game.tick}</strong><span>{game.campaign.year} · {season} · {copy(language, "Day", "วันที่")} {game.campaign.day} · {segment}</span></div>
        <div><small>{copy(language, "ACTIVE THREAD", "เส้นเรื่องที่ค้างอยู่")}</small><strong>{activeMission?.title ?? copy(language, "No active thread", "ไม่มีเส้นเรื่องค้างอยู่")}</strong><span>{activeMission?.deadline ?? copy(language, "Let the next choice create its pressure", "ให้การตัดสินใจถัดไปสร้างแรงกดดัน")}</span></div>
        <div><small>{copy(language, "LATEST CONSEQUENCE", "ผลที่เพิ่งเกิดขึ้น")}</small><strong>{latestMissionUpdate ? (latestMissionUpdate.state === "resolved" ? copy(language, "Thread resolved", "เส้นเรื่องคลี่คลาย") : copy(language, "Thread advanced", "เส้นเรื่องคืบหน้า")) : (latestRoll?.summary ?? copy(language, "No roll recorded", "ยังไม่มีการทอยที่บันทึก"))}</strong><span>{latestMissionUpdate ? `${latestMissionUpdate.current}/${latestMissionUpdate.required} · ${latestMissionUpdate.reward ?? copy(language, "consequence recorded", "บันทึกผลแล้ว")}` : copy(language, "The ledger will retain the next decision", "สมุดจะเก็บการตัดสินใจครั้งถัดไป")}</span></div>
      </section>
      <section className="chronicle-view__library-grid" aria-label={copy(language, "Recent campaign chapters and selected page", "บทล่าสุดและหน้าที่เลือก")}> 
        <section className="chronicle-view__shelf" aria-label={copy(language, "Recent campaign chapters", "บทล่าสุดของแคมเปญ")}><div className="chronicle-view__shelf-heading"><span>{copy(language, "RECENT LEAVES", "หน้าที่ผ่านมา")}</span><small>{copy(language, "Most recent first", "ล่าสุดอยู่ก่อน")}</small></div><div className="chronicle-view__cards">{shelf.length ? shelf.map((entry: ChronicleEntry, index: number) => <button className={`chronicle-entry ${index === 0 ? "is-current" : ""}`} onClick={() => { setReaderIndex(Math.max(0, entries.findIndex((candidate: ChronicleEntry) => candidate.id === entry.id))); setReaderMode(true); }} key={entry.id}><EntryBadge entry={entry} language={language} /><small>{copy(language, "PAGE", "หน้า")} {entry.tick}</small><strong>{entry.title}</strong><p>{entry.story.slice(0, 108)}{entry.story.length > 108 ? "…" : ""}</p>{entry.roll && <span className="chronicle-entry__roll">{entry.roll.dice.join(" + ")} → {entry.roll.total}</span>}{index === 0 && <i>{copy(language, "Selected", "ที่เลือก")}</i>}</button>) : <div className="chronicle-view__empty"><LockKeyhole size={21} /><p>{copy(language, "The shelf is empty. Your first decision will create the first page.", "ชั้นหนังสือยังว่าง การตัดสินใจแรกจะสร้างหน้าเรื่องแรก")}</p></div>}</div></section>
        <article className="chronicle-view__latest"><p className="chronicle-view__eyebrow">{copy(language, "SELECTED PAGE", "หน้าที่เลือก")}</p><span className="chronicle-view__latest-leaf">{copy(language, "PAGE", "หน้า")} {latest?.tick ?? game.tick}</span><h2>{latest?.title ?? game.currentScene.title}</h2><p>{latestPreview}{(latest?.story ?? game.currentScene.pressure).length > latestPreview.length ? "…" : ""}</p><button onClick={() => { setReaderIndex(Math.max(0, entries.length - 1)); setReaderMode(true); }}>{copy(language, "READ THIS PAGE", "อ่านหน้านี้")} <ArrowRight size={16} /></button></article>
      </section>
      <aside className="chronicle-view__thread-strip"><div><p className="chronicle-view__eyebrow">{copy(language, "STORY THREAD", "เส้นเรื่อง")}</p><strong>{game.currentScene.title}</strong><p>{game.currentScene.pressure}</p></div><div><Sparkles size={15} /><span>{copy(language, "The next decision may change this record.", "การตัดสินใจถัดไปอาจเปลี่ยนบันทึกนี้")}</span></div></aside>
      <div className="log-filter chronicle-view__filter"><button className="active">{copy(language, "All records", "ทั้งหมด")}</button><div><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy(language, "Search this campaign", "ค้นหาในแคมเปญนี้")} /></div></div>
      <section className="chronicle-view__timeline">{visible.map((entry: ChronicleEntry, index: number) => <article className="log-entry" key={entry.id}><span className="log-index">{String(index + 1).padStart(2, "0")}</span><div><EntryBadge entry={entry} language={language} /><small>PAGE {entry.tick}</small><strong>{entry.title}</strong><div className="log-entry__story">{splitStoryParagraphs(entry.story).map((paragraph: string, paragraphIndex: number) => <p key={`${entry.id}-${paragraphIndex}`}>{paragraph}</p>)}</div>{entry.roll && <i>2d12: {entry.roll.dice.join(" + ")} · total {entry.roll.total} / DN {entry.roll.difficulty}</i>}</div><time>LOCAL</time></article>)}</section>
    </>}
  </div>;
}
