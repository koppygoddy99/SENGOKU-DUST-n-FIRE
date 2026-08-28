import React from "react";
import { HeartPulse, Brain, ShieldAlert, Radio, Wind } from "lucide-react";
import type { GameState } from "@/lib/game";
import { buildStoryCompact, type StoryCompactProjection, type Language } from "@/lib/powerRumor";
import "./storyCompact.css";

const copy = (language: Language, en: string, th: string) => (language === "en" ? en : th);

export function StoryCompactStatus({ game, language }: { game: GameState; language: Language }) {
  const data: StoryCompactProjection = buildStoryCompact(game, language);
  const seasonMap: Record<string, string> = { Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" };
  const season = copy(language, data.time.season, seasonMap[data.time.season]);

  return (
    <aside className="story-compact" aria-label={copy(language, "Campaign status", "สถานะแคมเปญ")} data-testid="story-compact-status">
      <div className="story-compact__group story-compact__vitals">
        <span className={`sc-vital ${data.vitals.critical ? "is-critical" : ""}`} title={copy(language, "Wounds", "บาดแผล")}>
          <HeartPulse size={13} /> {data.vitals.wounds}/{data.vitals.maxWounds}
        </span>
        <span className="sc-vital" title={copy(language, "Focus", "สมาธิ")}>
          <Brain size={13} /> {data.vitals.focus}/{data.vitals.maxFocus}
        </span>
      </div>

      <div className="story-compact__group story-compact__stats">
        {data.attributes.map((attr) => (
          <span className="sc-stat" key={attr.id} title={`${attr.label} · ${copy(language, "next roll", "ทอยครั้งถัดไป")}`}>
            <b>{attr.value}</b> {attr.label}
          </span>
        ))}
      </div>

      <div className="story-compact__group story-compact__time">
        <span>{data.time.year}</span>
        <span>{data.time.province}</span>
        <span>{season}</span>
        <span>{copy(language, "Day", "วันที่")} {data.time.day}</span>
      </div>

      <div className="story-compact__group story-compact__power">
        <span className={`sc-power sc-power--${data.powerRumor.heat.status}`} title={copy(language, "Local heat", "ความเสี่ยงระดับพื้นที่")}>
          <ShieldAlert size={13} /> {data.powerRumor.heat.label}
        </span>
        {data.powerRumor.topFactions.slice(0, 2).map((f) => (
          <span className="sc-faction" key={f.factionId} title={f.visibleReason}>
            <Radio size={12} /> {f.name}
          </span>
        ))}
        <span className="sc-seasonal" title={data.powerRumor.seasonalSummary}>
          <Wind size={13} /> {season}
        </span>
      </div>

      {data.powerRumor.rumorAlert && (
        <div className="story-compact__alert" title={data.powerRumor.rumorAlert}>
          ⚑ {data.powerRumor.rumorAlert}
        </div>
      )}
    </aside>
  );
}
