import React, { useState } from "react";
import { ChevronDown, ChevronRight, Radio, ShieldAlert, Wind, Route, Users } from "lucide-react";
import type { GameState } from "@/lib/game";
import { buildPowerRumorSummary, type PowerRumorSummary, type Language } from "@/lib/powerRumor";
import "./powerRumor.css";

const copy = (language: Language, en: string, th: string) => (language === "en" ? en : th);

const STANCE_LABEL: Record<string, { en: string; th: string }> = {
  friendly: { en: "Friendly", th: "เป็นมิตร" },
  cooperative: { en: "Cooperative", th: "ร่วมมือ" },
  "conditional-cooperation": { en: "Conditional", th: "ร่วมมือแบบมีเงื่อนไข" },
  neutral: { en: "Neutral", th: "เป็นกลาง" },
  wary: { en: "Wary", th: "ระแวง" },
  hostile: { en: "Hostile", th: "对立/ hostile" },
};

function stanceTone(stance: string): string {
  if (stance === "friendly" || stance === "cooperative") return "teal";
  if (stance === "conditional-cooperation" || stance === "neutral") return "ochre";
  return "vermilion";
}

export function PowerRumorPanel({ game, language }: { game: GameState; language: Language }) {
  const [expanded, setExpanded] = useState(false);
  const data: PowerRumorSummary = buildPowerRumorSummary(game, language);
  const seasonMap: Record<string, string> = { Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" };
  const season = copy(language, data.currentSeason, seasonMap[data.currentSeason]);

  return (
    <section className="power-rumor-panel" aria-label={copy(language, "Power & Rumor Network", "เครือข่ายอำนาจและข่าวลือ")}>
      <button className="power-rumor-panel__head" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <Radio size={17} />
        <div>
          <p className="power-rumor-panel__eyebrow">{copy(language, "NETWORK · POWER & RUMOR", "เครือข่าย · อำนาจและข่าวลือ")}</p>
          <h2>{copy(language, "Power & Rumor Network", "เครือข่ายอำนาจและข่าวลือ")}</h2>
        </div>
        <span className="power-rumor-panel__season">{data.provinceId.toUpperCase()} · {season}</span>
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {expanded ? (
        <div className="power-rumor-panel__body">
          <div className="pr-grid">
            <article className="pr-card">
              <header><Users size={15} /> {copy(language, "Faction Standing", "ท่าทีฝ่ายต่างๆ")}</header>
              {data.knownFactions.map((f) => (
                <div className={`pr-faction pr-faction--${stanceTone(f.stance)}`} key={f.factionId}>
                  <strong>{f.name}</strong>
                  <span className={`pr-stance pr-stance--${stanceTone(f.stance)}`}>{STANCE_LABEL[f.stance]?.[language] ?? f.stance}</span>
                  <small>{f.visibleReason}</small>
                </div>
              ))}
            </article>

            <article className="pr-card">
              <header><ShieldAlert size={15} /> {copy(language, "Local Heat", "ความเสี่ยงระดับพื้นที่")}</header>
              <div className={`pr-heat pr-heat--${data.localRisk.status}`}>
                <strong>{data.localRisk.label}</strong>
                <span>{copy(language, `Level ${data.localRisk.heatLevel}/5`, `ระดับ ${data.localRisk.heatLevel}/5`)}</span>
              </div>
              <small>{data.localRisk.reason}</small>
            </article>

            <article className="pr-card">
              <header><Wind size={15} /> {copy(language, "Seasonal Pressure", "แรงกดดันฤดูกาล")}</header>
              <p className="pr-seasonal">{data.seasonalPressure.summary}</p>
              <div className="pr-meters">
                <span>{copy(language, "Food", "เสบียง")} {data.seasonalPressure.foodStock}</span>
                <span>{copy(language, "Labor", "แรงงาน")} {data.seasonalPressure.laborAvailability}</span>
                <span>{copy(language, "Route", "เส้นทาง")} {data.seasonalPressure.routeCondition}/5</span>
              </div>
            </article>

            <article className="pr-card">
              <header><Route size={15} /> {copy(language, "Route Choices", "เส้นทางเลือก")}</header>
              {data.routeChoices.map((r) => (
                <div className={`pr-route pr-route--${r.status}`} key={r.routeId}>
                  <strong>{r.routeId === "overland" ? copy(language, "Overland", "ทางบก") : copy(language, "Waterway", "ทางน้ำ")}</strong>
                  <span className={`pr-route-status pr-route-status--${r.status}`}>{r.status}</span>
                  <small>{r.reason}</small>
                </div>
              ))}
            </article>

            <article className="pr-card pr-card--wide">
              <header><Radio size={15} /> {copy(language, "Rumor Board", "กระดานข่าวลือ")}</header>
              {data.recentRumors.length ? (
                data.recentRumors.map((rumor) => (
                  <div className="pr-rumor" key={rumor.id}>
                    <span className="pr-rumor__conf">{'●'.repeat(rumor.confidence)}{'○'.repeat(3 - rumor.confidence)}</span>
                    <p>{rumor.summary}</p>
                    <small>{rumor.sourceLabel}</small>
                  </div>
                ))
              ) : (
                <p className="pr-empty">{copy(language, "No rumors recorded yet. The world is quiet for now.", "ยังไม่มีข่าวลือ บ้านเมืองสงบชั่วคราว")}</p>
              )}
            </article>
          </div>
          <p className="pr-footnote">{copy(language, "Read-only projection from your current campaign state. No hidden truth is shown.", "คำนวณจากสถานะแคมเปญปัจจุบันแบบอ่านอย่างเดียว ไม่แสดงความจริงที่ตัวละครยังไม่รู้")}</p>
        </div>
      ) : (
        <div className="power-rumor-panel__summary">
          <span className="pr-chip pr-chip--teal">{data.knownFactions.filter((f) => f.stance === "cooperative" || f.stance === "friendly" || f.stance === "conditional-cooperation").length} {copy(language, "cooperative", "ร่วมมือ")}</span>
          <span className={`pr-chip pr-chip--${data.localRisk.status === "unseen" ? "teal" : "vermilion"}`}>{data.localRisk.label}</span>
          <span className="pr-chip pr-chip--ochre">{copy(language, "Route", "เส้นทาง")}: {data.routeChoices.map((r) => r.status).join(" / ")}</span>
        </div>
      )}
    </section>
  );
}
