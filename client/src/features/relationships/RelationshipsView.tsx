import { ArrowLeft, ArrowRight, BookOpen, LoaderCircle, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { BilingualText, GameState, PublicRelationshipContact } from "@/lib/game";
import { label } from "@/lib/localization";
import "./relationshipsView.css";

type Language = "en" | "th";

function text(language: Language, value: BilingualText) {
  return language === "en" ? value.en : value.th;
}

function affinityLabel(language: Language, affinity: number) {
  if (affinity >= 2) return label(language, "Warmly inclined", "เอียงเข้าหาอย่างชัดเจน");
  if (affinity === 1) return label(language, "Favorable", "เป็นมิตรขึ้น");
  if (affinity === 0) return label(language, "Unsettled", "ยังไม่แน่ชัด");
  if (affinity <= -2) return label(language, "Openly hostile", "เป็นปฏิปักษ์ชัดเจน");
  return label(language, "Guarded", "ระแวดระวัง");
}

function ToneScale({ contact, language }: { contact: PublicRelationshipContact; language: Language }) {
  const affinityDots = [-3, -2, -1, 0, 1, 2, 3];
  return <div className="relationship-scales" aria-label={label(language, "Relationship indicators", "ตัวบ่งชี้ความสัมพันธ์")}>
    <div><span>{label(language, "Familiarity", "ความคุ้นเคย")}</span><strong>{contact.familiarity}/5</strong><i className="relationship-scale" aria-hidden="true">{[1, 2, 3, 4, 5].map((step) => <b key={step} className={step <= contact.familiarity ? "is-filled" : ""} />)}</i></div>
    <div><span>{label(language, "Affinity", "ความรู้สึก")}</span><strong>{contact.affinity > 0 ? "+" : ""}{contact.affinity}</strong><i className="relationship-scale relationship-scale--affinity" aria-hidden="true">{affinityDots.map((step) => <b key={step} className={step === contact.affinity ? "is-filled" : step < contact.affinity ? "is-past" : ""} />)}</i><small>{affinityLabel(language, contact.affinity)}</small></div>
  </div>;
}

export function RelationshipsView({ game, language, isAuthenticated, uiPreviewMode, onUpdate }: { game: GameState; language: Language; isAuthenticated: boolean; uiPreviewMode: boolean; onUpdate: (state: GameState, notice: string) => void }) {
  const [selectedId, setSelectedId] = useState<PublicRelationshipContact["contactId"] | null>(null);
  const analyzer = trpc.relationships.analyzeDay.useMutation();
  const selected = game.relationships.find((contact) => contact.contactId === selectedId);
  const canAnalyze = Boolean(selected?.latestDailyLog?.status === "pending" && isAuthenticated && !uiPreviewMode && !analyzer.isPending);

  const analyzePendingDay = async () => {
    if (!selected?.latestDailyLog || !canAnalyze) return;
    const evidence = selected.events.filter((event) => event.inGameDay === selected.latestDailyLog?.inGameDay).map((event) => ({
      id: event.id,
      sourceType: event.sourceType,
      inGameDay: event.inGameDay,
      tick: event.tick,
      title: text(language, event.title),
      detail: text(language, event.detail),
    }));
    try {
      const analysis = await analyzer.mutateAsync({
        campaign: { id: game.campaign.id, year: game.campaign.year, season: game.campaign.season, region: game.campaign.region, inGameDay: selected.latestDailyLog.inGameDay },
        language,
        contact: { contactId: selected.contactId, name: language === "en" ? selected.nameEn : selected.nameTh, publicStatus: text(language, selected.publicStatus), relationshipRole: text(language, selected.relationshipRole), familiarity: selected.familiarity, affinity: selected.affinity },
        evidence,
      });
      const next: GameState = {
        ...game,
        relationships: game.relationships.map((contact) => contact.contactId !== selected.contactId ? contact : {
          ...contact,
          familiarity: Math.max(0, Math.min(5, contact.familiarity + analysis.contactEffects.familiarityDelta)),
          affinity: Math.max(-3, Math.min(3, contact.affinity + analysis.contactEffects.affinityDelta)),
          latestDailyLog: { id: `relationship-ready-${contact.contactId}-${selected.latestDailyLog!.inGameDay}`, inGameDay: selected.latestDailyLog!.inGameDay, status: "ready", summary: language === "en" ? { en: analysis.summary, th: contact.latestDailyLog?.summary.th ?? "" } : { en: contact.latestDailyLog?.summary.en ?? "", th: analysis.summary }, eventIds: analysis.evidenceIds, confidence: analysis.confidence },
          earnedKnowledge: [...contact.earnedKnowledge, ...analysis.playerVisibleKnowledge.map((entry) => language === "en" ? { en: entry, th: "" } : { en: "", th: entry })],
          blankSpace: analysis.blankSpaceUpdate ? [...contact.blankSpace, language === "en" ? { en: analysis.blankSpaceUpdate, th: "" } : { en: "", th: analysis.blankSpaceUpdate }] : contact.blankSpace,
        }),
      };
      onUpdate(next, label(language, "Relationship record analyzed and saved to this campaign.", "วิเคราะห์บันทึกความสัมพันธ์และบันทึกไว้ในแคมเปญแล้ว"));
    } catch {
      onUpdate(game, label(language, "The evidence remains saved; analysis is still waiting.", "หลักฐานยังบันทึกอยู่ การวิเคราะห์ยังรอดำเนินการ"));
    }
  };

  if (selected) {
    const pending = selected.latestDailyLog?.status === "pending";
    return <div className={`page relationship-view relationship-view--${selected.colorTone}`} data-testid="relationship-detail">
      <button className="relationship-back" onClick={() => setSelectedId(null)}><ArrowLeft size={16} />{label(language, "All relationships", "ความสัมพันธ์ทั้งหมด")}</button>
      <header className="relationship-detail-header">
        <RelationshipEmblem contact={selected} />
        <div><p className="section-kicker">{label(language, "RELATIONSHIP RECORD", "บันทึกความสัมพันธ์")}</p><h1>{language === "en" ? selected.nameEn : selected.nameTh}</h1><p>{text(language, selected.relationshipRole)} · {text(language, selected.publicStatus)}</p></div>
      </header>
      <ToneScale contact={selected} language={language} />
      <section className="relationship-summary"><span>{label(language, "Current visible record", "บันทึกที่มองเห็นในปัจจุบัน")}</span><p>{selected.visibleSummary ? text(language, selected.visibleSummary) : label(language, "No summary is available yet.", "ยังไม่มีบทสรุป")}</p></section>
      <div className="relationship-detail-grid">
        <section><h2>{label(language, "Public persona", "ภาพที่เจ้ามองเห็น")}</h2><ul>{selected.publicPersona.map((entry, index) => <li key={index}>{text(language, entry)}</li>)}</ul></section>
        <section><h2>{label(language, "What you know", "สิ่งที่เจ้ารู้แล้ว")}</h2><ul>{selected.earnedKnowledge.map((entry, index) => <li key={index}>{text(language, entry) || label(language, "Recorded in the other language view.", "บันทึกไว้ในมุมมองอีกภาษา")}</li>)}</ul></section>
        <section><h2>{label(language, "The blank space", "ช่องว่างที่ยังต้องค้นหา")}</h2><ul>{selected.blankSpace.map((entry, index) => <li key={index}>{text(language, entry) || label(language, "Recorded in the other language view.", "บันทึกไว้ในมุมมองอีกภาษา")}</li>)}</ul></section>
      </div>
      <section className="relationship-daily-log"><div><p className="section-kicker">{label(language, "RELATIONSHIP LOG", "บันทึกความสัมพันธ์")}</p><h2>{selected.latestDailyLog ? `${label(language, "Campaign day", "วันในแคมเปญ")} ${selected.latestDailyLog.inGameDay}` : label(language, "No new daily record", "ยังไม่มีบันทึกรายวันใหม่")}</h2></div>{pending && <span className="relationship-pending"><LoaderCircle size={15} />{label(language, "Analysis pending", "รอการวิเคราะห์")}</span>}{selected.latestDailyLog?.status === "ready" && <span className="relationship-ready">{label(language, "Analyzed", "วิเคราะห์แล้ว")}</span>}<p>{selected.latestDailyLog ? text(language, selected.latestDailyLog.summary) : label(language, "When player-visible evidence concerns this person, it will be collected here by the campaign day.", "เมื่อเกิดหลักฐานที่ผู้เล่นมองเห็นและเกี่ยวข้องกับคนนี้ ระบบจะรวบรวมไว้ที่นี่ตามวันในแคมเปญ")}</p>{pending && <button className="relationship-analyze" onClick={analyzePendingDay} disabled={!canAnalyze}>{analyzer.isPending ? <><LoaderCircle size={16} />{label(language, "Analyzing", "กำลังวิเคราะห์")}</> : <><Sparkles size={16} />{isAuthenticated && !uiPreviewMode ? label(language, "Analyze this day's evidence", "วิเคราะห์หลักฐานของวันนี้") : label(language, "Waiting for server analysis", "รอการวิเคราะห์จากเซิร์ฟเวอร์")}</>}</button>}</section>
      <section className="relationship-events"><p className="section-kicker">{label(language, "EVENTS YOU KNOW", "เหตุการณ์ที่เจ้ารู้")}</p>{selected.events.slice().reverse().map((event) => <article key={event.id}><span className={`relationship-event-dot relationship-event-dot--${event.tone}`} /><div><strong>{text(language, event.title)}</strong><p>{text(language, event.detail)}</p><small>{label(language, "Campaign day", "วันในแคมเปญ")} {event.inGameDay} · {label(language, event.sourceType, event.sourceType)}</small></div></article>)}</section>
    </div>;
  }

  return <div className="page relationship-view" data-testid="relationships-index">
    <header className="page-heading"><div><p className="section-kicker">{label(language, "CHRONICLE · RELATIONSHIPS", "จดหมายเหตุ · ความสัมพันธ์")}</p><h1>{label(language, "People you know", "ผู้คนที่เจ้ารู้จัก")}</h1><p>{label(language, "These records contain only what the campaign has made visible. Familiarity and affinity describe the story; they grant no automatic control over anyone.", "บันทึกนี้มีเฉพาะสิ่งที่แคมเปญเปิดให้เจ้ารู้ ความคุ้นเคยและความรู้สึกเป็นแรงของเรื่อง ไม่ได้ทำให้บังคับผู้ใดได้")}</p></div><div className="relationship-boundary"><BookOpen size={18} /><span>{label(language, "Player-visible record only", "เฉพาะบันทึกที่ผู้เล่นมองเห็น")}</span></div></header>
    <section className="relationship-index" aria-label={label(language, "People you know", "ผู้คนที่เจ้ารู้จัก")}>{game.relationships.map((contact) => <button className={`relationship-card relationship-card--${contact.colorTone}`} key={contact.contactId} onClick={() => setSelectedId(contact.contactId)}><RelationshipEmblem contact={contact} /><span className="relationship-card__copy"><small>{text(language, contact.relationshipRole)}</small><strong>{language === "en" ? contact.nameEn : contact.nameTh}</strong><em>{contact.latestDailyLog?.status === "pending" ? label(language, "New evidence waiting", "มีหลักฐานใหม่รออยู่") : text(language, contact.visibleSummary ?? contact.publicStatus)}</em></span><ArrowRight size={18} /></button>)}</section>
  </div>;
}

function RelationshipEmblem({ contact }: { contact: PublicRelationshipContact }) {
  return <span className={`relationship-emblem relationship-emblem--${contact.colorTone}`} aria-hidden="true"><b>{contact.nameTh.slice(0, 1)}</b></span>;
}
