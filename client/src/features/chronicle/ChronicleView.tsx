import { ArrowLeft, ArrowRight, BookOpen, EyeOff, LockKeyhole, Search, Sparkles } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { type GameState, type StoryRecord } from "@/lib/game";
import "./chronicleView.css";

type Language = "en" | "th";
const copy = (language: Language, en: string, th: string) => language === "en" ? en : th;
export const splitStoryParagraphs = (story: string) => story.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

function recordForReading(game: GameState): StoryRecord[] {
  if (game.storyRecords?.length) return game.storyRecords;
  if (game.rolls.length) return game.rolls.filter((roll) => Boolean(roll.narrative?.trim())).map((roll) => ({ id: `story-${roll.id}`, tick: roll.tick, inGameDay: game.campaign.day, title: `Page ${String(roll.tick).padStart(2, "0")}`, prose: roll.narrative, location: game.currentScene.location }));
  return [{ id: `story-opening-${game.campaign.id}`, tick: 1, inGameDay: game.campaign.day, title: game.currentScene.title, prose: game.currentScene.body.join("\n\n"), location: game.currentScene.location }];
}

export function ChronicleView({ game, language, readerMode, setReaderMode }: { game: GameState; language: Language; readerMode: boolean; setReaderMode: (value: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [readerIndex, setReaderIndex] = useState(0);
  const entries = useMemo(() => recordForReading(game).slice().sort((a, b) => a.tick - b.tick), [game]);
  const visible = entries.filter((entry) => `${entry.title} ${entry.prose} ${entry.location}`.toLowerCase().includes(query.toLowerCase()));
  const shelf = entries.slice(-4).reverse();
  const latest = entries.at(-1);
  const activeMission = game.missions.find((mission) => mission.state === "active" || mission.state === "offered");
  const progression = game.progression;
  const season = language === "en" ? game.campaign.season : ({ Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" } as const)[game.campaign.season];
  const segment = progression?.segment === "night" ? copy(language, "night", "ยามค่ำ") : copy(language, "day", "ยามกลางวัน");
  const readerEntry = entries[Math.max(0, Math.min(readerIndex, entries.length - 1))];
  const readerStory = readerEntry?.prose ?? copy(language, "No story has been recorded yet. Return to Play and make the first choice.", "ยังไม่มีเรื่องราวที่บันทึกไว้ กลับไปเล่นฉากแล้วตัดสินใจครั้งแรก");
  const latestPreview = (latest?.prose ?? game.currentScene.body[0]).slice(0, 320);

  return <div className={`page log-view chronicle-view ${readerMode ? "is-reader" : ""}`} data-testid="story-records-view">
    <div className="chronicle-view__topline"><div className="chronicle-view__identity"><span className="chronicle-view__seal">火</span><div><strong>{game.campaign.title}</strong><small>{game.campaign.year} · {game.campaign.season} · {game.campaign.location}</small></div></div><div className="reader-switch"><span><EyeOff size={17} /> {copy(language, "Reader Mode", "โหมดอ่าน")}</span><Switch checked={readerMode} onCheckedChange={setReaderMode} /></div></div>
    {readerMode ? <section className="reader-paper"><div className="reader-paper__chapter">{game.campaign.title} · {copy(language, "PAGE", "หน้า")} {readerEntry?.tick ?? 1} · {season} · {copy(language, "Day", "วันที่")} {readerEntry?.inGameDay ?? game.campaign.day}</div><h2>{readerEntry?.title ?? copy(language, "The first page", "หน้าเรื่องแรก")}</h2><p className="reader-paper__location">{readerEntry?.location}</p><div className="reader-paper__scroll">{splitStoryParagraphs(readerStory).map((paragraph, index) => <p key={`${readerEntry?.id ?? "empty"}-${index}`}>{paragraph}</p>)}</div><div className="reader-paper__footer"><button disabled={readerIndex <= 0} onClick={() => setReaderIndex((index) => Math.max(0, index - 1))}><ArrowLeft size={16} /> {copy(language, "Previous", "ก่อนหน้า")}</button><span>{readerIndex + 1} / {Math.max(entries.length, 1)}</span><button disabled={readerIndex >= entries.length - 1} onClick={() => setReaderIndex((index) => Math.min(entries.length - 1, index + 1))}>{copy(language, "Next", "ถัดไป")} <ArrowRight size={16} /></button></div></section> : <>
      <header className="chronicle-view__heading"><div><p className="chronicle-view__eyebrow">{copy(language, "CAMPAIGN STORY LIBRARY", "คลังเรื่องราวของแคมเปญ")}</p><h1>{copy(language, "Story Records", "บันทึกเรื่องราว")}</h1><p>{copy(language, "Every resolved Play Scene leaves one complete prose record here. Dice, DN, skills, and progress remain outside the reading record.", "ทุกฉาก Play Scene ที่จบลงจะทิ้งบันทึกร้อยแก้วเต็มหนึ่งหน้าไว้ที่นี่ โดยแยกผลทอย DN วิชา และความก้าวหน้าออกจากหน้าอ่าน")}</p><small className="chronicle-view__campaign-scope" data-testid="chronicle-campaign-scope">{copy(language, `These records belong only to ${game.campaign.title}.`, `บันทึกเหล่านี้เป็นของแคมเปญ ${game.campaign.title} เท่านั้น`)}</small></div><div className="chronicle-view__count"><BookOpen size={18} /><strong>{entries.length}</strong><span>{copy(language, "story records", "บันทึกเรื่องราว")}</span></div></header>
      <section className="chronicle-view__status-ledger" aria-label={copy(language, "Campaign time and current story thread", "เวลาแคมเปญและเส้นเรื่องปัจจุบัน")}>
        <div><small>{copy(language, "CAMPAIGN FOLIO", "ใบเรื่องแคมเปญ")}</small><strong>{copy(language, "PAGE", "หน้า")} {progression?.leaf ?? game.tick}</strong><span>{game.campaign.year} · {season} · {copy(language, "Day", "วันที่")} {game.campaign.day} · {segment}</span></div>
        <div><small>{copy(language, "CURRENT PLACE", "สถานที่ปัจจุบัน")}</small><strong>{game.currentScene.location}</strong><span>{copy(language, "The next page begins from here", "หน้าถัดไปจะเริ่มจากที่นี่")}</span></div>
        <div><small>{copy(language, "ACTIVE THREAD", "เส้นเรื่องที่ค้างอยู่")}</small><strong>{activeMission?.title ?? copy(language, "No active thread", "ไม่มีเส้นเรื่องค้างอยู่")}</strong><span>{activeMission?.deadline ?? copy(language, "The next choice will make the next record", "การตัดสินใจถัดไปจะสร้างบันทึกหน้าใหม่")}</span></div>
      </section>
      <section className="chronicle-view__library-grid" aria-label={copy(language, "Recent story records and selected record", "บันทึกเรื่องราวล่าสุดและหน้าที่เลือก")}>
        <section className="chronicle-view__shelf" aria-label={copy(language, "Recent story records", "บันทึกเรื่องราวล่าสุด")}><div className="chronicle-view__shelf-heading"><span>{copy(language, "RECENT RECORDS", "บันทึกล่าสุด")}</span><small>{copy(language, "Most recent first", "ล่าสุดอยู่ก่อน")}</small></div><div className="chronicle-view__cards">{shelf.length ? shelf.map((entry, index) => <button className={`chronicle-entry ${index === 0 ? "is-current" : ""}`} onClick={() => { setReaderIndex(Math.max(0, entries.findIndex((candidate) => candidate.id === entry.id))); setReaderMode(true); }} key={entry.id}><small>{copy(language, "PAGE", "หน้า")} {entry.tick} · {copy(language, "DAY", "วันที่")} {entry.inGameDay}</small><strong>{entry.title}</strong><p>{entry.prose.slice(0, 108)}{entry.prose.length > 108 ? "…" : ""}</p>{index === 0 && <i>{copy(language, "Selected", "ที่เลือก")}</i>}</button>) : <div className="chronicle-view__empty"><LockKeyhole size={21} /><p>{copy(language, "The shelf is empty. Your first decision will create the first story record.", "ชั้นหนังสือยังว่าง การตัดสินใจแรกจะสร้างบันทึกเรื่องราวหน้าแรก")}</p></div>}</div></section>
        <article className="chronicle-view__latest"><p className="chronicle-view__eyebrow">{copy(language, "SELECTED RECORD", "บันทึกที่เลือก")}</p><span className="chronicle-view__latest-leaf">{copy(language, "PAGE", "หน้า")} {latest?.tick ?? game.tick}</span><h2>{latest?.title ?? game.currentScene.title}</h2><p>{latestPreview}{(latest?.prose ?? game.currentScene.body[0]).length > latestPreview.length ? "…" : ""}</p><button onClick={() => { setReaderIndex(Math.max(0, entries.length - 1)); setReaderMode(true); }}>{copy(language, "READ THIS RECORD", "อ่านบันทึกนี้")} <ArrowRight size={16} /></button></article>
      </section>
      <aside className="chronicle-view__thread-strip"><div><p className="chronicle-view__eyebrow">{copy(language, "STORY THREAD", "เส้นเรื่อง")}</p><strong>{game.currentScene.title}</strong><p>{game.currentScene.pressure}</p></div><div><Sparkles size={15} /><span>{copy(language, "The next decision may write the next record.", "การตัดสินใจถัดไปอาจเขียนบันทึกหน้าใหม่")}</span></div></aside>
      <div className="log-filter chronicle-view__filter"><button className="active">{copy(language, "All story records", "บันทึกเรื่องราวทั้งหมด")}</button><div><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy(language, "Search this campaign", "ค้นหาในแคมเปญนี้")} /></div></div>
      <section className="chronicle-view__timeline">{visible.map((entry, index) => <article className="log-entry" key={entry.id}><span className="log-index">{String(index + 1).padStart(2, "0")}</span><div><small>{copy(language, "PAGE", "หน้า")} {entry.tick} · {copy(language, "DAY", "วันที่")} {entry.inGameDay} · {entry.location}</small><strong>{entry.title}</strong><div className="log-entry__story">{splitStoryParagraphs(entry.prose).map((paragraph, paragraphIndex) => <p key={`${entry.id}-${paragraphIndex}`}>{paragraph}</p>)}</div></div></article>)}</section>
    </>}
  </div>;
}
