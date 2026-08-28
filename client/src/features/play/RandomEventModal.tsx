import React from "react";
import type { GameState } from "@/lib/game";
import { humanizeChoiceLabel, summarizeEffects } from "@/lib/randomEvents";
import "./randomEventModal.css";

const FENCE_LABELS: Record<string, string> = {
  historically_supported: "มีหลักฐานประวัติศาสตร์รองรับ",
  plausible_reconstruction: "สร้างใหม่อย่างสมเหตุสมผล",
  game_drama: "เรื่องเล่าเพื่อเกม",
};

export function RandomEventModal({ game, onAccept, onReject }: { game: GameState; onAccept: (choiceId: string) => void; onReject: () => void }) {
  const event = game.pendingRandomEvent;
  if (!event) return null;
  return (
    <div className="revent-overlay" role="dialog" aria-modal="true" aria-label={`เหตุการณ์ไม่คาดฝัน: ${event.title}`} data-testid="random-event-modal">
      <div className="revent-window">
        <p className="revent-eyebrow">⚑ เหตุการณ์ไม่คาดฝัน · {FENCE_LABELS[event.historical_fence] ?? event.historical_fence}</p>
        <h2 className="revent-title">{event.title}</h2>
        <p className="revent-lead">โชคและฤดูกาลนำอะไรมาให้พบ — เลือกทางที่จะจับ แล้วเจ้าจะได้ลงมันด้วยฝีมือของเจ้าเอง</p>
        <div className="revent-choices">
          {event.choices.map((choice) => {
            const { reward, risk } = summarizeEffects(choice.effects);
            return (
              <button key={choice.id} type="button" className="revent-choice" onClick={() => onAccept(choice.id)}>
                <span className="revent-choice__label">{humanizeChoiceLabel(choice.id)}</span>
                <span className="revent-choice__meta">
                  <i>ใช้ {choice.check.stat}</i>
                  {reward !== "ไม่มีโบนัสพิเศษ" && <b className="is-reward">★ {reward}</b>}
                  {risk !== "ไม่มีความเสี่ยงพิเศษ" && <b className="is-risk">⚠ {risk}</b>}
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" className="revent-reject" onClick={onReject}>เดินผ่านไป — ไม่รับเรื่องนี้</button>
      </div>
    </div>
  );
}
