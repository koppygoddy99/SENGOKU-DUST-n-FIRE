import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATS, type RollPreview } from "@/lib/game";

type Language = "en" | "th";
const copy = (language: Language, en: string, th: string) => language === "en" ? en : th;

export function historicalStatusLabel(status: NonNullable<RollPreview["historical"]>["status"], language: Language) {
  const labels = {
    "fact-supported": ["Fact-supported", "มีหลักฐานรองรับ"],
    "contextual-play": ["Contextual play", "ใช้บริบทประวัติศาสตร์"],
    "campaign-fiction": ["Campaign fiction", "เรื่องแต่งในแคมเปญ"],
    "insufficient-evidence": ["Evidence limited", "หลักฐานยังไม่พอ"],
  } as const;
  return labels[status][language === "en" ? 0 : 1];
}

export function HistoricalBoundaryPanel({ historical, language, resolved = false }: { historical: NonNullable<RollPreview["historical"]>; language: Language; resolved?: boolean }) {
  return <section className={`historical-boundary historical-boundary--${historical.status} ${resolved ? "historical-boundary--resolved" : ""}`}><div className="historical-boundary__heading"><small>{copy(language, resolved ? "HISTORICAL RECORD" : "HISTORICAL BOUNDARY", resolved ? "บันทึกขอบเขตประวัติศาสตร์" : "ขอบเขตประวัติศาสตร์")}</small><span>{historicalStatusLabel(historical.status, language)}</span></div><p>{historical.fence}</p></section>;
}

function CircleList({ title, values }: { title: string; values: string[] }) { return <div><small>{title}</small>{values.map((value) => <span key={value}>• {value}</span>)}</div>; }

export function RollPreviewPanel({ preview, language, momentum, spendMomentum, setSpendMomentum, onCancel, onGrit, isResolving, trialMode = false }: { preview: RollPreview; language: Language; momentum: number; spendMomentum: boolean; setSpendMomentum: (value: boolean) => void; onCancel: () => void; onGrit: () => void; isResolving: boolean; trialMode?: boolean }) {
  const stat = STATS.find((entry) => entry.id === preview.stat);
  const isRiskOnly = Boolean(preview.isRiskOnly);
  return <div className="roll-preview-panel"><div className="preview-grid"><div><small>{copy(language, "Intent", "เจตนา")}</small><strong>{preview.intent}</strong></div><div><small>{copy(language, "Method", "วิธี")}</small><strong>{preview.method}</strong></div><div><small>{copy(language, "Difficulty", "ระดับความยาก")}</small><strong>DN {preview.difficulty}</strong></div>{!isRiskOnly && <><div><small>{copy(language, "Stat", "คุณลักษณะ")}</small><strong>{language === "en" ? stat?.en : stat?.th}</strong></div><div><small>{copy(language, "Mastery", "ความชำนาญ")}</small><strong>{preview.mastery?.label ?? copy(language, "None", "ไม่มี")} +{preview.mastery?.level ?? 0}</strong></div><div><small>{copy(language, "Context", "โบนัสบริบท")}</small><strong>{preview.contextReason ? `${preview.contextReason} +${preview.contextBonus}` : copy(language, "No bonus", "ไม่มีโบนัส")}</strong></div></>}</div><div className="risk-strip"><CircleList title={copy(language, "Visible risks", "ความเสี่ยงที่เห็น")} values={preview.risks} /></div>{preview.historical && <HistoricalBoundaryPanel historical={preview.historical} language={language} />}{isRiskOnly ? <div className="credit-confirm"><p>{copy(language, "Risk assessment does not reveal which trait or mastery the engine would use. Choose Analyze Action when ready to verify that interpretation.", "การประเมินความยากจะไม่เฉลยแกนหรือความชำนาญ กดวิเคราะห์การกระทำเมื่อพร้อมตรวจความเข้าใจของระบบ")}</p><Button className="df-button df-button--ghost" onClick={onCancel}>{copy(language, "REVISE ACTION", "แก้การกระทำ")}</Button></div> : <div className="roll-confirmation"><label className="momentum-check"><input type="checkbox" checked={spendMomentum} disabled={momentum <= 0 || isResolving} onChange={(event) => setSpendMomentum(event.target.checked)} /><span>{copy(language, "Spend 1 Momentum for +2 after the roll", "ใช้แรงฮึด 1 เพื่อ +2 หลังทอย")} · {momentum}/2</span></label>{trialMode && <p className="gm-note">{copy(language, "LOCAL TRIAL · deterministic 2d12, Local Save, no AI credit used", "กรอกทดลองในเครื่อง · ทอย 2d12 แบบตายตัว เซฟในเครื่อง และไม่หักเครดิต AI")}</p>}<div className="action-actions"><Button className="df-button df-button--ghost" onClick={onCancel} disabled={isResolving}>{copy(language, "REVISE", "แก้ความเข้าใจ")}</Button><Button className="df-button df-button--primary" onClick={onGrit} disabled={isResolving}>{isResolving ? copy(language, "GM RECORDING…", "GM กำลังบันทึก…") : trialMode ? copy(language, "CONFIRM & ROLL · LOCAL TRIAL", "ยืนยันและทอย · กรอกทดลอง") : copy(language, "CONFIRM & ROLL · 1 CREDIT", "ยืนยันและทอย · 1 เครดิต")} <ArrowRight size={16} /></Button></div></div>}</div>;
}
