import React, { useState } from "react";
import { ChevronDown, ChevronRight, Radio, ShieldAlert, Wind, Route, Users, AlertTriangle, Eye, Info } from "lucide-react";
import type { GameState } from "@/lib/game";
import { buildPowerRumorSummary, type PowerRumorSummary, type Language, type ActionNow } from "@/lib/powerRumor";
import "./powerRumor.css";

const copy = (language: Language, en: string, th: string) => (language === "en" ? en : th);

const STANCE_LABEL: Record<string, { en: string; th: string }> = {
  allies: { en: "Allies", th: "เป็นพันธมิตร" },
  friendly: { en: "Friendly", th: "เป็นมิตร" },
  helpful: { en: "Helpful", th: "ยินดีช่วย" },
  cooperative: { en: "Cooperative", th: "ร่วมมือ" },
  neutral: { en: "Neutral", th: "เป็นกลาง" },
  "conditional-cooperation": { en: "Conditional", th: "ร่วมมือแบบมีเงื่อนไข" },
  wary: { en: "Wary", th: "ระแวง" },
  interfering: { en: "Interfering", th: "ก่อกวน" },
  hostile: { en: "Hostile", th: "เป็นศัตรู" },
  war: { en: "War", th: "ทำสงคราม" },
};

function stanceTone(stance: string): string {
  if (stance === "allies" || stance === "friendly" || stance === "helpful" || stance === "cooperative") return "teal";
  if (stance === "conditional-cooperation" || stance === "neutral" || stance === "wary") return "ochre";
  return "vermilion";
}

const ROUTE_ICON: Record<string, string> = { overland: "🛤️", waterway: "⛵" };
const SEVERITY_TONE: Record<ActionNow["severity"], string> = {
  calm: "teal",
  watch: "ochre",
  warn: "vermilion",
  danger: "vermilion",
};

export function PowerRumorPanel({ game, language }: { game: GameState; language: Language }) {
  const [expanded, setExpanded] = useState(false);
  const [heatOpen, setHeatOpen] = useState(false);
  const data: PowerRumorSummary = buildPowerRumorSummary(game, language);
  const seasonMap: Record<string, string> = { Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" };
  const season = copy(language, data.currentSeason, seasonMap[data.currentSeason]);

  const routeLabel = (id: string) => (id === "overland" ? copy(language, "Overland", "ทางบก") : copy(language, "Waterway", "ทางน้ำ"));

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
          {/* 0. ACTION NOW — สิ่งที่ควรทำ/ระวังตอนนี้ (ขึ้นบนสุด) */}
          {data.actionNow.length > 0 && (
            <div className="pr-actionnow">
              {data.actionNow.map((a) => (
                <div className={`pr-actionnow__item pr-actionnow__item--${SEVERITY_TONE[a.severity]}`} key={a.id}>
                  {a.icon === "route" && <Route size={15} />}
                  {a.icon === "heat" && <ShieldAlert size={15} />}
                  {a.icon === "faction" && <Users size={15} />}
                  {a.icon === "season" && <Wind size={15} />}
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* 1. ROUTE CHOICES — ขึ้นบนสุดของการ์ด (ต้องตัดสินใจตอนนี้) */}
          <article className="pr-card pr-card--route">
            <header><Route size={15} /> {copy(language, "Route Choices — what to decide now", "เส้นทางเลือก · ต้องเลือกตอนนี้")}</header>
            {data.routeChoices.map((r) => (
              <div className={`pr-route pr-route--${r.status}`} key={r.routeId}>
                <span className="pr-route__icon">{ROUTE_ICON[r.routeId]}</span>
                <div className="pr-route__main">
                  <strong>{routeLabel(r.routeId)} <span className={`pr-route-status pr-route-status--${r.status}`}>{copy(language, r.status, r.status === "open" ? "เปิด" : r.status === "risky" ? "เสี่ยง" : r.status === "closed" ? "ปิด" : "ไม่รู้")}</span></strong>
                  <small>{r.reason}</small>
                  <p className="pr-impact">{r.impactHint}</p>
                </div>
              </div>
            ))}
          </article>

          {/* 2. LOCAL HEAT — ย่อ 2-3 บรรทัด + ปุ่มอ่านเพิ่ม */}
          <article className="pr-card">
            <header><ShieldAlert size={15} /> {copy(language, "Local Heat", "ความเสี่ยงระดับพื้นที่")}</header>
            <div className={`pr-heat pr-heat--${data.localRisk.status}`}>
              <strong>{data.localRisk.label}</strong>
              <span>{copy(language, `Level ${data.localRisk.heatLevel}/5`, `ระดับ ${data.localRisk.heatLevel}/5`)}</span>
            </div>
            <p className="pr-impact pr-impact--heat">{data.localRisk.impactHint}</p>
            {heatOpen && <small className="pr-heat__detail">{data.localRisk.reason}</small>}
            <button className="pr-readmore" onClick={() => setHeatOpen((v) => !v)}>
              {heatOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              {heatOpen ? copy(language, "Show less", "ซ่อนรายละเอียด") : copy(language, "Read more", "อ่านเพิ่ม")}
            </button>
          </article>

          {/* 3. SEASONAL PRESSURE — icon + label สั้น + บอกกระทบอะไร */}
          <article className="pr-card">
            <header><Wind size={15} /> {copy(language, "Seasonal Pressure", "แรงกดดันฤดูกาล")}</header>
            <p className="pr-seasonal-short">{data.seasonalPressure.shortLabel}</p>
            <p className="pr-seasonal-impact">{data.seasonalPressure.summary}</p>
            <div className="pr-meters pr-meters--mini">
              <span title={copy(language, "Food stock", "เสบียง")}>🍚 {data.seasonalPressure.foodStock}</span>
              <span title={copy(language, "Labor availability", "แรงงาน")}>🔨 {data.seasonalPressure.laborAvailability}</span>
              <span title={copy(language, "Route condition", "เส้นทาง")}>🛤️ {data.seasonalPressure.routeCondition}/5</span>
            </div>
          </article>

          {/* 4. RUMOR BOARD — ซ่อนถ้าว่าง */}
          {data.recentRumors.length > 0 && (
            <article className="pr-card pr-card--wide">
              <header><Radio size={15} /> {copy(language, "Rumor Board", "กระดานข่าวลือ")}</header>
              {data.recentRumors.map((rumor) => (
                <div className="pr-rumor" key={rumor.id}>
                  <span className="pr-rumor__conf">{'●'.repeat(rumor.confidence)}{'○'.repeat(3 - rumor.confidence)}</span>
                  <p>{rumor.summary}</p>
                  <small>{rumor.sourceLabel}</small>
                </div>
              ))}
            </article>
          )}

          {/* 5. FACTION STANDING — ชื่อ + สถานะ + tooltip ผลกระทบ */}
          <article className="pr-card pr-card--wide">
            <header><Users size={15} /> {copy(language, "Faction Standing", "ท่าทีฝ่ายต่างๆ")}</header>
            <div className="pr-faction-grid">
              {data.knownFactions.map((f) => (
                <div className={`pr-faction pr-faction--${stanceTone(f.stance)}`} key={f.factionId} title={`${f.name}: ${f.impactHint}`}>
                  <strong>{f.name}</strong>
                  <span className={`pr-stance pr-stance--${stanceTone(f.stance)}`}>{STANCE_LABEL[f.stance]?.[language] ?? f.stance}</span>
                  <Info size={12} className="pr-faction__hint" />
                  <span className="pr-faction__tooltip">{f.impactHint}</span>
                </div>
              ))}
            </div>
          </article>

          <p className="pr-footnote">
            {copy(language, "Read-only projection from your current campaign state. No hidden truth is shown.", "คำนวณจากสถานะแคมเปญปัจจุบันแบบอ่านอย่างเดียว ไม่แสดงความจริงที่ตัวละครยังไม่รู้")}
            {data.eventDriven && <em> · {copy(language, "live from your actions", "อัปเดตตามการกระทำของคุณ")}</em>}
          </p>
        </div>
      ) : (
        <div className="power-rumor-panel__summary">
          {data.actionNow.slice(0, 2).map((a) => (
            <span className={`pr-chip pr-chip--${SEVERITY_TONE[a.severity]}`} key={a.id}>{a.message}</span>
          ))}
          {data.actionNow.length === 0 && (
            <span className="pr-chip pr-chip--teal">{copy(language, "All clear — world is calm", "สถานการณ์สงบ")}</span>
          )}
          <span className={`pr-chip pr-chip--${data.localRisk.status === "unseen" ? "teal" : "vermilion"}`}>{data.localRisk.label}</span>
          <span className="pr-chip pr-chip--ochre">{copy(language, "Route", "เส้นทาง")}: {data.routeChoices.map((r) => copy(language, r.status, r.status === "open" ? "เปิด" : r.status === "risky" ? "เสี่ยง" : r.status === "closed" ? "ปิด" : "ไม่รู้")).join(" / ")}</span>
        </div>
      )}
    </section>
  );
}
