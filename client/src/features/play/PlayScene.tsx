import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, Map, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SengokuIcon } from "@/components/SengokuIcon";
import { localized } from "@/lib/localization";
import { trpc } from "@/lib/trpc";
import { STATS, applyMomentumFromSource, applyRoll, getMomentumSources, masteryTierForRank, parseAction, resolveRoll, xpNeededForRank, type GameState, type MomentumSource, type RollPreview } from "@/lib/game";
import "./playScene.css";
import "./playSceneIntent.css";
import "./playSceneProgression.css";

type Language = "en" | "th";
type PlayDestination = "home" | "log" | "save" | "load";
type OutcomeRecord = ReturnType<typeof resolveRoll>;
type OutcomePresentation = "composing" | "ready" | "revealed";
export const ROLL_ANIMATION_MS = 4000;
export const OUTCOME_WORD_CADENCE_MS = 44;

function copy(language: Language, en: string, th: string) { return language === "en" ? en : th; }
function localRules(uiPreviewMode: boolean, isAuthenticated: boolean) { return uiPreviewMode || !isAuthenticated; }
function historicalLabel(status: NonNullable<RollPreview["historical"]>["status"], language: Language) {
  const table = { "fact-supported": ["Fact-supported", "มีหลักฐานรองรับ"], "contextual-play": ["Contextual play", "ใช้บริบทประวัติศาสตร์"], "campaign-fiction": ["Campaign fiction", "เรื่องแต่งในแคมเปญ"], "insufficient-evidence": ["Evidence limited", "หลักฐานยังไม่พอ"] } as const;
  return table[status][language === "en" ? 0 : 1];
}
function historicalTone(status: NonNullable<RollPreview["historical"]>["status"]) { return status === "fact-supported" ? "teal" : status === "contextual-play" ? "ochre" : status === "campaign-fiction" ? "vermilion" : "navy"; }
function outcomeLabel(outcome: string) { return outcome.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

function RollFormula({ record, game, language }: { record: OutcomeRecord; game: GameState; language: Language }) {
  const stat = STATS.find((entry) => entry.id === record.stat);
  const statValue = game.character.attributes[record.stat];
  const masteryValue = record.mastery?.level ?? 0;
  const diceTotal = record.dice[0] + record.dice[1];
  const parts = [
    { label: copy(language, "DICE", "ลูกเต๋า"), value: `${record.dice[0]} + ${record.dice[1]} = ${diceTotal}`, note: copy(language, "Two 12-sided dice", "เต๋า 12 หน้า 2 ลูก") },
    { label: copy(language, "Stat", "คุณลักษณะ"), value: `${statValue >= 0 ? "+" : ""}${statValue}`, note: copy(language, "Attribute used for this approach", "คุณลักษณะที่ใช้กับวิธีนี้") },
    { label: copy(language, "MASTERY", "ความชำนาญ"), value: `${masteryValue >= 0 ? "+" : ""}${masteryValue}`, note: record.mastery ? `${record.mastery.label} · ${copy(language, "Step", "ขั้น")} ${record.mastery.rank ?? 1}` : copy(language, "No matching mastery", "ไม่มีวิชาที่ตรง") },
    { label: copy(language, "CONTEXT", "บริบท"), value: `${record.contextBonus >= 0 ? "+" : ""}${record.contextBonus}`, note: record.contextReason || copy(language, "No circumstance bonus", "ไม่มีโบนัสจากสถานการณ์") },
    { label: copy(language, "MOMENTUM", "แรงฮึด"), value: `${record.momentumSpent >= 0 ? "+" : ""}${record.momentumSpent}`, note: record.momentumSpent ? `${record.momentumSource?.label ?? copy(language, "post-roll resolve", "แรงใจหลังเห็นผล")} · ${record.momentumSource?.cost ?? copy(language, "spent after seeing the dice", "ใช้หลังเห็นผลลูกเต๋า")}` : copy(language, "Not spent", "ยังไม่ได้ใช้") },
  ];
  return <section data-testid="roll-formula" className="play-dice-result__formula" aria-label={copy(language, "Roll calculation", "การคำนวณผลทอย")}>
    <div className="play-dice-result__formula-heading"><p className="play-scene__eyebrow">{copy(language, "HOW THIS RESULT WAS BUILT", "ผลนี้คำนวณจากอะไร")}</p><strong>{diceTotal} {statValue >= 0 ? "+" : ""}{statValue} {masteryValue >= 0 ? "+" : ""}{masteryValue} {record.contextBonus >= 0 ? "+" : ""}{record.contextBonus} {record.momentumSpent >= 0 ? "+" : ""}{record.momentumSpent} = {record.total}</strong></div>
    <div className="play-dice-result__formula-parts">{parts.map((part) => <article key={part.label}><small>{part.label}</small><strong>{part.value}</strong><span>{part.note}</span></article>)}</div>
    <p className="play-dice-result__formula-verdict"><span>{copy(language, "TOTAL", "ผลรวม")}</span><strong>{record.total}</strong><i>/ DN {record.difficulty}</i><em>{record.margin >= 0 ? copy(language, `PASS BY ${record.margin}`, `ผ่านเกณฑ์ +${record.margin}`) : copy(language, `SHORT BY ${Math.abs(record.margin)}`, `ขาดอีก ${Math.abs(record.margin)}`)}</em></p>
  </section>;
}

function gmContext(game: GameState) {
  const mission = game.missions.find((entry) => entry.state === "active" || entry.state === "offered");
  return {
    campaign: game.campaign,
    character: { name: game.character.name, occupation: game.character.occupation, origin: game.character.origin, strengths: game.character.strength, weakness: game.character.weakness, attributes: game.character.attributes, masteries: game.character.masteries.map((entry) => ({ name: entry.label, level: entry.level, source: entry.origin })) },
    currentScene: { title: game.currentScene.title, location: game.currentScene.location, summary: game.currentScene.body.join("\n\n"), pressure: game.currentScene.pressure, declaredChoices: game.currentScene.suggestedActions },
    activeMission: mission ? { title: mission.title, giver: mission.issuer, objective: mission.request, deadline: mission.deadline, reward: mission.reward } : undefined,
    socialState: { honor: game.character.social.honor, influence: game.character.social.influence, stain: game.character.social.stain, rumors: game.memories.filter((entry) => entry.kind === "news").slice(-4).map((entry) => entry.detail), oaths: game.memories.filter((entry) => entry.kind === "oath").slice(-4).map((entry) => entry.detail), debts: game.memories.filter((entry) => entry.kind === "debt").slice(-4).map((entry) => entry.detail) },
    recentMemories: game.memories.slice(-8).map((entry) => ({ title: entry.title, detail: entry.detail, tone: entry.tone })),
  };
}

function HistoricalFence({ historical, language }: { historical: NonNullable<RollPreview["historical"]>; language: Language }) {
  return <aside className={`play-fence play-fence--${historical.status}`}><div><small>{copy(language, "HISTORICAL BOUNDARY", "ขอบเขตประวัติศาสตร์")}</small><span>{historicalLabel(historical.status, language)}</span></div><p>{historical.fence}</p></aside>;
}

function RollDetails({ preview, language, momentum, onRoll, onEdit, rolling }: { preview: RollPreview; language: Language; momentum: number; onRoll: () => void; onEdit: () => void; rolling: boolean }) {
  const stat = STATS.find((entry) => entry.id === preview.stat);
  const tier = preview.mastery ? masteryTierForRank(preview.mastery.rank ?? 1) : undefined;
  return <section className="play-roll-details"><div className="play-roll-details__heading"><span><SengokuIcon name="sword" tone="vermilion" size={17} /> {copy(language, "ROLL DETAILS", "รายละเอียดการทอย")}</span><small>{copy(language, "Rules are visible after intent", "เห็นกติกาหลังยืนยันเจตนา")}</small></div><div className="play-roll-details__grid"><div><small>{copy(language, "Intent", "เจตนา")}</small><strong>{preview.intent}</strong></div><div><small>{copy(language, "Stat", "คุณลักษณะ")}</small><strong>{language === "en" ? stat?.en : stat?.th}</strong></div><div><small>{copy(language, "Mastery", "ความชำนาญ")}</small><strong>{preview.mastery ? `${preview.mastery.label} · ${copy(language, "Step", "ขั้น")} ${preview.mastery.rank ?? 1} · +${tier?.bonus}` : copy(language, "No mastery", "ไม่มีความชำนาญ")}</strong></div><div><small>{copy(language, "Context", "บริบท")}</small><strong>{preview.contextReason ? `${preview.contextReason} +${preview.contextBonus}` : copy(language, "No bonus", "ไม่มีโบนัส")}</strong></div><div><small>{copy(language, "Difficulty", "ความยาก")}</small><strong>DN {preview.difficulty}{tier && preview.difficulty < tier.minimumDifficulty ? ` · ${copy(language, "practice will not grow", "ยังไม่พอให้วิชาเติบโต")}` : ""}</strong><span>{preview.difficultyReason}</span></div><div><small>{copy(language, "Momentum", "แรงฮึด")}</small><strong>{momentum}/2 · {copy(language, "available after roll", "เลือกใช้หลังเห็นผล")}</strong></div></div>{preview.historical && <HistoricalFence historical={preview.historical} language={language} />}<div className="play-roll-details__actions"><Button className="df-button df-button--ghost" onClick={onEdit} disabled={rolling}>{copy(language, "CHANGE INTENT", "แก้เจตนา")}</Button><Button className="df-button df-button--primary" onClick={onRoll} disabled={rolling}>{rolling ? copy(language, "ROLLING…", "กำลังทอย…") : copy(language, "ROLL 2D12", "ทอย 2D12")} <ArrowRight size={17} /></Button></div></section>;
}

function DiceResult({ record, game, language, momentum, momentumSources, selectedMomentumSourceId, onSelectMomentumSource, onSpend, onAccept, onEdit, rolling, rollPhase, displayDice }: { record: OutcomeRecord; game: GameState; language: Language; momentum: number; momentumSources: MomentumSource[]; selectedMomentumSourceId: string; onSelectMomentumSource: (sourceId: string) => void; onSpend: () => void; onAccept: () => void; onEdit: () => void; rolling: boolean; rollPhase: "rolling" | "settling" | null; displayDice: [number, number] }) {
  const canSpendMomentum = momentumSources.length > 0 && !record.momentumSpent;
  const selectedMomentumSource = momentumSources.find((entry) => entry.id === selectedMomentumSourceId) ?? momentumSources[0];
  const diceStatus = rolling ? (rollPhase === "settling" ? copy(language, "settling into place", "กำลังหยุดลง") : copy(language, "rolling now", "กำลังทอย")) : outcomeLabel(record.outcome);
  return <section data-testid="dice-decision-window" className={`play-dice-result ${rolling ? "is-rolling play-dice-result--rolling-stage" : ""} ${rollPhase === "settling" ? "is-settling" : ""}`} aria-live="polite">
    <div className="play-dice-result__stage-heading"><p className="play-scene__eyebrow">{rolling ? copy(language, "ROLLING 2D12", "กำลังทอย 2D12") : copy(language, "DICE RESULT · DECISION WINDOW", "ผลลูกเต๋า · ตัดสินใจ")}</p><h2>{rolling ? copy(language, "The dice are still moving", "ลูกเต๋ายังหมุนอยู่") : outcomeLabel(record.outcome)}</h2></div>
    <div className="play-dice-result__tray"><span data-testid="dice-one" aria-label={copy(language, `First die: ${displayDice[0]}`, `ลูกเต๋าลูกแรก: ${displayDice[0]}`)}><b>{displayDice[0]}</b></span><b className="play-dice-result__plus">+</b><span data-testid="dice-two" className="is-light" aria-label={copy(language, `Second die: ${displayDice[1]}`, `ลูกเต๋าลูกที่สอง: ${displayDice[1]}`)}><b>{displayDice[1]}</b></span><div><small>{rolling ? copy(language, "WAIT FOR THE LANDING", "รอให้ลูกเต๋าหยุด") : copy(language, "FINAL TOTAL", "ผลรวมสุดท้าย")}</small><strong>{rolling ? "…" : record.total} <i>/ DN {record.difficulty}</i></strong></div><em>{diceStatus}</em></div>
    {rolling ? <p className="play-dice-result__rolling-note">{copy(language, "The result will open a decision window once both dice settle.", "เมื่อลูกเต๋าหยุด จะเปิดตัดสินใจพร้อมผลทอยทันที")}</p> : <><RollFormula record={record} game={game} language={language} /><div className="play-dice-result__copy"><p>{record.summary}</p><p>{localized(language, record.consequence ?? "")}</p></div>{canSpendMomentum && <div className="play-dice-result__momentum"><Sparkles size={17} /><div><strong>{copy(language, "Spend 1 Momentum for +2?", "ใช้แรงฮึด 1 เพื่อ +2 หรือไม่?")}</strong><span>{copy(language, "Choose what carries this effort. The same dice and breakdown remain visible; only +2 is added.", "เลือกว่าพละแรงนี้มาจากอะไร ผลเต๋าและรายละเอียดเดิมยังอยู่ แล้วเพิ่มเพียง +2")}</span><label className="play-dice-result__momentum-source"><small>{copy(language, "SOURCE", "แหล่งแรงฮึด")}</small><select aria-label={copy(language, "Momentum source", "แหล่งแรงฮึด")} value={selectedMomentumSource?.id ?? ""} onChange={(event) => onSelectMomentumSource(event.target.value)}>{momentumSources.map((source) => <option value={source.id} key={source.id}>{source.label} · {source.cost}</option>)}</select></label><em>{selectedMomentumSource?.note}</em></div><Button className="df-button df-button--ghost" onClick={onSpend}>{copy(language, "SPEND MOMENTUM", "ใช้แรงฮึด")}</Button></div>}<div className="play-dice-result__actions"><Button className="df-button df-button--ghost" onClick={onEdit}><ArrowLeft size={16} /> {copy(language, "CHANGE INTENT", "แก้เจตนา")}</Button><Button className="df-button df-button--primary" onClick={onAccept}>{copy(language, "RECORD THIS RESULT", "บันทึกผลนี้")} <Check size={16} /></Button></div></>}</section>;
}

function TypewriterProse({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const reduced = typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const words = text.match(/\S+\s*/g) ?? [text];
  const [visibleWordCount, setVisibleWordCount] = useState(reduced ? words.length : 0);
  useEffect(() => {
    if (reduced) {
      setVisibleWordCount(words.length);
      const readyTimer = window.setTimeout(() => onComplete?.(), 0);
      return () => window.clearTimeout(readyTimer);
    }
    setVisibleWordCount(0);
    let cursor = 0;
    const timer = window.setInterval(() => {
      cursor = Math.min(words.length, cursor + 3);
      setVisibleWordCount(cursor);
      if (cursor >= words.length) { window.clearInterval(timer); onComplete?.(); }
    }, OUTCOME_WORD_CADENCE_MS);
    return () => window.clearInterval(timer);
  }, [reduced, text]);
  const visible = words.slice(0, visibleWordCount).join("");
  return <p className="play-outcome-card__typed" aria-live="polite" aria-busy={visibleWordCount < words.length}>{visible}{visibleWordCount < words.length && <span aria-hidden="true">▌</span>}</p>;
}

function OutcomeDraft({ record, language, pending, notice, onReady }: { record: OutcomeRecord; language: Language; pending: boolean; notice: string; onReady: () => void }) {
  const [complete, setComplete] = useState(false);
  useEffect(() => setComplete(false), [record.narrative, pending]);
  const canOpen = !pending && complete;
  return <section data-testid="narrative-outcome-draft" className="play-outcome-draft" aria-live="polite"><header><div><p className="play-scene__eyebrow">{copy(language, "THE PRICE OF THE ANSWER", "ราคาของคำตอบ")}</p><h2>{outcomeLabel(record.outcome)}</h2></div><span>{pending ? copy(language, "READING THE AFTERMATH", "กำลังชั่งผลที่ตามมา") : copy(language, "THE ACCOUNT IS READY", "บันทึกพร้อมแล้ว")}</span></header>{notice && <p className="play-scene__notice play-outcome-draft__notice">{notice}</p>}<div className="play-outcome-draft__status"><span>{pending ? copy(language, "ROLL · SKILL · PRESSURE · CONSEQUENCE", "ผลทอย · วิชา · แรงกดดัน · ผลกระทบ") : copy(language, "THE INK HAS SETTLED", "หมึกในบันทึกหยุดนิ่งแล้ว")}</span><small>{pending ? copy(language, "The game is weighing what this success changes before the full record opens.", "เกมกำลังชั่งว่าผลนี้เปลี่ยนวิชา แรงกดดัน และเส้นเรื่องอย่างไร ก่อนเปิดบันทึกเต็ม") : copy(language, "Read the full consequence when you are ready.", "เปิดอ่านผลกระทบเต็มเมื่อเจ้าพร้อม")}</small></div><article className="play-outcome-draft__prose"><small>{copy(language, "STORY RESULT · BEING WRITTEN", "ผลเชิงเรื่องเล่า · กำลังร้อยเรียง")}</small><TypewriterProse text={record.narrative} onComplete={() => setComplete(true)} /></article>{canOpen ? <div className="play-outcome-draft__action"><Button className="df-button df-button--primary" onClick={onReady}>{copy(language, "VIEW FULL OUTCOME", "ดูผลลัพธ์ฉบับเต็ม")} <ArrowRight size={17} /></Button></div> : <p className="play-outcome-draft__wait">{copy(language, "The full record will open after the last line is written.", "เมื่อบรรทัดสุดท้ายถูกเขียนแล้ว จึงจะเปิดบันทึกผลเต็มได้")}</p>}</section>;
}

function OutcomeCard({ record, game, language, notice, onContinue, onMap, onChronicle, onUseSuggestion }: { record: OutcomeRecord; game: GameState; language: Language; notice: string; onContinue: () => void; onMap: () => void; onChronicle: () => void; onUseSuggestion: (suggestion: string) => void }) {
  const practice = game.progression?.lastPractice;
  const timeMark = game.progression?.lastTimeMark;
  const missionUpdate = game.rolls.at(-1)?.missionUpdate;
  const narrative = record.narrative || game.currentScene.body[0];
  const stat = STATS.find((entry) => entry.id === record.stat);
  const statValue = game.character.attributes[record.stat];
  const masteryBonus = record.mastery?.level ?? 0;
  const approachTitle = copy(language, "POSSIBLE NEXT APPROACHES", "แนวทางที่เป็นไปได้");
  return <section data-testid="narrative-outcome" className="play-outcome-card"><header><div><p className="play-scene__eyebrow">{copy(language, "THE PRICE OF THE ANSWER", "ราคาของคำตอบ")}</p><h2>{outcomeLabel(record.outcome)}</h2></div><span>{copy(language, "Page", "หน้า")} {game.progression?.leaf ?? record.tick}</span></header>{notice && <p className="play-scene__notice play-outcome-card__notice">{notice}</p>}<div data-testid="outcome-roll-breakdown" className="play-outcome-card__calculation"><span><small>{copy(language, "DICE", "ลูกเต๋า")}</small><strong>{record.dice[0]} + {record.dice[1]}</strong></span><span><small>{copy(language, "SKILL", "วิชา")}</small><strong>{record.mastery?.label ?? copy(language, "Untrained", "ไร้ความชำนาญ")} +{masteryBonus}</strong></span><span><small>{copy(language, "STAT & CONTEXT", "คุณลักษณะและบริบท")}</small><strong>{language === "en" ? stat?.en : stat?.th} {statValue >= 0 ? `+${statValue}` : statValue} · {record.contextBonus >= 0 ? `+${record.contextBonus}` : record.contextBonus}</strong></span><span><small>{copy(language, "TO PASS", "เงื่อนไขผ่าน")}</small><strong>{record.total} / DN {record.difficulty} · {record.margin >= 0 ? `+${record.margin}` : record.margin}</strong></span></div><article className="play-outcome-card__prose"><small>{copy(language, "STORY RESULT · WHAT FOLLOWS", "ผลเชิงเรื่องเล่า · สิ่งที่เกิดต่อ")}</small><strong>{game.currentScene.title}</strong><p className="play-outcome-card__typed">{narrative}</p><p>{localized(language, record.consequence ?? "")}</p></article><div className="play-outcome-card__layers"><article><small>{copy(language, "1 · ROLL RESULT", "1 · ผลทอย")}</small><strong>{record.total} / DN {record.difficulty}</strong><p>{record.summary}</p></article><article><small>{copy(language, "2 · SKILL PRACTICE", "2 · วิชาที่ฝึก")}</small><strong>{practice ? `${practice.masteryLabel} ${practice.gained ? `+${practice.gained} XP` : copy(language, "held", "ยังไม่ขยับ")}` : copy(language, "No new practice", "ไม่มีวิชาใหม่")}</strong><p>{practice ? `${copy(language, "Step", "ขั้น")} ${practice.rankAfter} · ${practice.masteryMark ?? `${practice.xp}/${practice.xpNeeded} XP`} · ${practice.note ?? ""}` : ""}</p></article><article><small>{copy(language, "3 · TIME & THREAD", "3 · เวลาและเส้นเรื่อง")}</small><strong>{timeMark?.message ?? copy(language, "The scene holds", "ฉากยังคงอยู่")}</strong><p>{missionUpdate ? `${missionUpdate.current}/${missionUpdate.required} · ${missionUpdate.state}${missionUpdate.reward ? ` · ${missionUpdate.reward}` : ""}` : copy(language, "No mission change", "ภารกิจยังไม่เปลี่ยน")}</p></article></div><div className="play-outcome-card__approaches"><p className="play-scene__eyebrow">{approachTitle}</p>{game.currentScene.suggestedActions.map((suggestion) => <button key={suggestion} onClick={() => onUseSuggestion(suggestion)}><span>{suggestion}</span><ArrowRight size={15} /></button>)}</div><div className="play-outcome-card__actions"><Button className="df-button df-button--primary" onClick={onContinue}>{copy(language, "WRITE NEXT INTENT", "เขียนเจตนาถัดไป")} <ArrowRight size={17} /></Button><Button className="df-button df-button--ghost" onClick={onMap}><Map size={16} /> {copy(language, "RETURN TO MAP", "กลับแผนที่")}</Button><button onClick={onChronicle}><FileText size={15} /> {copy(language, "OPEN CHRONICLE", "เปิดบันทึกเรื่อง")}</button></div></section>;
}

export function PlayScene({ game, language, onOpen, onUpdate, isAuthenticated, uiPreviewMode, onLogin, onAccountCreditChange }: { game: GameState; language: Language; onOpen: (page: PlayDestination) => void; onUpdate: (next: GameState, message: string) => void; isAuthenticated: boolean; uiPreviewMode: boolean; onLogin: () => void; onAccountCreditChange: () => unknown }) {
  const reviewOutcome = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("outcome") === "saved";
  const [action, setAction] = useState("");
  const [details, setDetails] = useState<RollPreview | null>(null);
  const [diceResult, setDiceResult] = useState<OutcomeRecord | null>(null);
  const [outcome, setOutcome] = useState<OutcomeRecord | null>(() => reviewOutcome ? { ...resolveRoll(parseAction("I will carry the answer to the gate.", game), game, false), narrative: game.currentScene.body.join("\n\n") } : null);
  const [outcomePresentation, setOutcomePresentation] = useState<OutcomePresentation>(() => reviewOutcome ? "revealed" : "composing");
  const [narrationPending, setNarrationPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [rolling, setRolling] = useState(false);
  const [rollPhase, setRollPhase] = useState<"rolling" | "settling" | null>(null);
  const [displayDice, setDisplayDice] = useState<[number, number]>([1, 1]);
  const [momentumSourceId, setMomentumSourceId] = useState("");
  const diceTimers = useRef<{ interval?: number; settle?: number; finish?: number }>({});
  const analyzeGM = trpc.gm.analyze.useMutation();
  const resolveGM = trpc.gm.resolve.useMutation();
  const spendCredit = trpc.profile.spendCredit.useMutation();
  const useLocal = localRules(uiPreviewMode, isAuthenticated);
  const momentumSources = getMomentumSources(game);
  const activeMission = game.missions.find((mission) => mission.state === "active" || mission.state === "offered");
  const focusComposer = () => {
    document.getElementById("play-intent-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("play-intent-field")?.focus(), 180);
  };

  const clearDiceMotion = () => { if (diceTimers.current.interval) window.clearInterval(diceTimers.current.interval); if (diceTimers.current.settle) window.clearTimeout(diceTimers.current.settle); if (diceTimers.current.finish) window.clearTimeout(diceTimers.current.finish); diceTimers.current = {}; };
  useEffect(() => () => clearDiceMotion(), []);
  const resetIntent = () => { clearDiceMotion(); setDetails(null); setDiceResult(null); setRolling(false); setRollPhase(null); setNotice(""); };
  const commitIntent = () => {
    if (!action.trim()) return;
    const local = () => { setDetails({ ...parseAction(action, game), isRiskOnly: false }); setNotice(copy(language, "The local rules engine prepared the roll details. No AI credit is used.", "กติกาในเครื่องเตรียมรายละเอียดการทอยแล้ว และไม่หักเครดิต AI")); };
    if (useLocal) { local(); return; }
    setNotice(copy(language, "The story engine is reading the campaign record…", "เครื่องยนต์เรื่องราวกำลังอ่านระเบียนแคมเปญ…"));
    analyzeGM.mutate({ action, language, context: gmContext(game) }, { onSuccess: (answer) => { const fallback = parseAction(action, game); const mastery = answer.suggestedMastery ? game.character.masteries.find((entry) => entry.label.toLowerCase().includes(answer.suggestedMastery!.toLowerCase()) || answer.suggestedMastery!.toLowerCase().includes(entry.label.toLowerCase())) : undefined; setDetails({ ...fallback, isRiskOnly: false, intent: answer.intentSummary, method: answer.confirmation, stat: answer.stat, mastery, contextBonus: answer.contextBonus, contextReason: answer.contextReason, difficulty: answer.difficulty as RollPreview["difficulty"], risks: [answer.risk], witnesses: [], historical: { status: answer.historicalStatus, fence: answer.historicalFence } }); setNotice(copy(language, "AI-assisted interpretation is ready. You may inspect or revise it before rolling.", "คำวินิจฉัยแบบ AI-assisted พร้อมแล้ว ตรวจหรือแก้ได้ก่อนทอย")); }, onError: () => { local(); setNotice(copy(language, "AI assistance is unavailable. The story continues with local rules and Local Save.", "AI ยังไม่พร้อม เรื่องยังดำเนินด้วยกติกาในเครื่องและ Local Save")); } });
  };
  const roll = () => { if (!details) return; clearDiceMotion(); const record = resolveRoll(details, game, false); setDiceResult(record); setMomentumSourceId(getMomentumSources(game)[0]?.id ?? ""); setDisplayDice([1, 1]); setRolling(true); setRollPhase("rolling"); diceTimers.current.interval = window.setInterval(() => setDisplayDice([Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1]), 72); diceTimers.current.settle = window.setTimeout(() => { if (diceTimers.current.interval) window.clearInterval(diceTimers.current.interval); setDisplayDice(record.dice); setRollPhase("settling"); }, ROLL_ANIMATION_MS - 650); diceTimers.current.finish = window.setTimeout(() => { clearDiceMotion(); setDisplayDice(record.dice); setRolling(false); setRollPhase(null); setNotice(copy(language, "The dice are visible. Momentum may be spent now, before this result is recorded.", "เห็นผลลูกเต๋าแล้ว จะใช้แรงฮึดได้ตอนนี้ก่อนบันทึกผล")); }, ROLL_ANIMATION_MS); };
  const spendMomentum = () => { if (!diceResult) return; const source = momentumSources.find((entry) => entry.id === momentumSourceId) ?? momentumSources[0]; if (!source) return; const record = applyMomentumFromSource(diceResult, game, source.id); setDisplayDice(record.dice); setDiceResult(record); setNotice(copy(language, `${source.label} adds +2 to this exact result; ${source.cost} will be recorded.`, `${source.label} เพิ่ม +2 จากผลเดิม และจะบันทึกค่าใช้จ่าย: ${source.cost}`)); };
  const beginOutcome = (record: OutcomeRecord, pending: boolean) => { setOutcome(record); setOutcomePresentation("composing"); setNarrationPending(pending); setDiceResult(null); setDetails(null); setAction(""); };
  const saveLocal = (record: OutcomeRecord, message: string) => { const next = applyRoll(game, record); onUpdate({ ...next, credits: game.credits }, message); beginOutcome(record, false); setNotice(message); };
  const acceptResult = () => {
    if (!diceResult) return;
    const record = diceResult;
    if (useLocal) { saveLocal(record, `${record.summary} · Local Trial saved at Page ${record.tick} · no AI credit used`); return; }
    const intent = action;
    beginOutcome({ ...record, narrative: copy(language, "The account is weighing the roll, the scene pressure, and the consequences already moving through the room.", "บันทึกกำลังชั่งน้ำหนักผลทอย แรงกดดันของฉาก และผลกระทบที่เริ่มขยับอยู่ในห้องนี้") }, true);
    setNotice(copy(language, "AI assistance is recording the consequence…", "AI-assisted กำลังจดผลกระทบ…"));
    resolveGM.mutate({ language, context: gmContext(game), action: intent, roll: { outcome: record.outcome, total: record.total, difficulty: record.difficulty, summary: record.summary, consequence: record.consequence ?? null } }, { onSuccess: (answer) => { const narrated = { ...record, narrative: answer.narration.join("\n\n") }; const base = applyRoll(game, narrated); const next: GameState = { ...base, historicalBoundary: { status: answer.historicalStatus, fence: answer.historicalFence, tick: base.tick }, currentScene: { ...base.currentScene, title: answer.sceneTitle, body: answer.narration, prompt: answer.missionNote, suggestedActions: answer.nextChoices }, memories: [...base.memories, { id: `gm-memory-${Date.now()}`, kind: "news", title: answer.memory.title, detail: answer.memory.detail, tone: answer.memory.tone, tick: base.tick }, { id: `gm-history-${Date.now()}`, kind: "witness", title: `${copy(language, "Historical boundary", "ขอบเขตประวัติศาสตร์")} · ${historicalLabel(answer.historicalStatus, language)}`, detail: answer.historicalFence, tone: historicalTone(answer.historicalStatus), tick: base.tick }] };
      spendCredit.mutate({ amount: 1 }, { onSuccess: ({ credits }) => { onUpdate({ ...next, credits }, `${record.summary} · AI-assisted consequence recorded`); onAccountCreditChange(); setOutcome(narrated); setNarrationPending(false); setNotice(""); }, onError: () => { saveLocal(record, copy(language, "AI credit is unavailable; the deterministic result was saved locally.", "เครดิต AI ใช้ไม่ได้ จึงบันทึกผลตามกติกาไว้ในเครื่อง")); } });
    }, onError: () => { saveLocal(record, `${record.summary} · AI unavailable · Local Trial saved with no AI credit used`); } });
  };
  return <div className="page play-scene-page">
    <header className="play-scene__header"><div><p className="play-scene__eyebrow">{copy(language, `PLAY SCENE · PAGE ${game.progression?.leaf ?? game.tick}`, `เล่นฉาก · หน้าที่ ${game.progression?.leaf ?? game.tick}`)}</p><h1>{game.currentScene.location}</h1><p>{game.campaign.year} · {game.campaign.season} · {copy(language, "Day", "วันที่")} {game.campaign.day} · {copy(language, "Age", "อายุ")} {game.progression?.currentAge ?? "—"} · {activeMission?.title ?? copy(language, "No active mission", "ยังไม่มีภารกิจที่กำลังดำเนิน")}</p></div><div className="play-scene__utilities"><button className="play-scene__intent-link" onClick={focusComposer}>{copy(language, "DECLARE INTENT", "ประกาศเจตนา")} <ArrowRight size={15} /></button><button onClick={() => onOpen("save")}><Save size={15} /> {copy(language, "Save Game", "บันทึกเกม")}</button><button onClick={() => onOpen("load")}>{copy(language, "Load Game", "โหลดเกม")}</button></div></header>
    <section className="play-scene__paper">
      {outcome ? outcomePresentation === "revealed" ? <OutcomeCard record={outcome} game={game} language={language} notice={notice} onContinue={focusComposer} onMap={() => onOpen("home")} onChronicle={() => onOpen("log")} onUseSuggestion={(suggestion) => { setAction(suggestion); focusComposer(); }} /> : <OutcomeDraft record={outcome} language={language} pending={narrationPending} notice={notice} onReady={() => setOutcomePresentation("revealed")} /> : <>
        <div className="play-scene__paper-heading"><span><SengokuIcon name="memory" tone="vermilion" size={18} /> {game.currentScene.title}</span><button onClick={() => onOpen("log")}><FileText size={15} /> {copy(language, "Chronicle", "บันทึกเรื่อง")}</button></div>
        <p className="play-scene__context">{game.currentScene.publicContext}</p>
        <section className="play-scene__skill-ledger" aria-label={copy(language, "Skill practice", "วิชาที่ฝึก")}><p className="play-scene__eyebrow">{copy(language, "SKILL LEDGER", "สมุดวิชาที่ฝึก")}</p><div>{game.character.masteries.map((mastery) => { const rank = mastery.rank ?? 1; const tier = masteryTierForRank(rank); return <article key={mastery.id} className={details?.mastery?.id === mastery.id ? "is-selected" : ""}><small>{mastery.label}</small><strong>{copy(language, "Step", "ขั้น")} {rank} · +{tier.bonus} · {language === "en" ? tier.en : tier.th}</strong><span>{rank === 20 ? copy(language, "Mastered", "อาจารย์ที่เชี่ยวชาญ") : `${mastery.xp ?? 0}/${xpNeededForRank(rank)} XP · DN ${tier.minimumDifficulty}+`}</span></article>; })}</div></section>
        <div className="play-scene__narrative">{game.currentScene.body.map((paragraph, index) => <p key={`${game.currentScene.id}-${index}`}>{paragraph}</p>)}<h2>{game.currentScene.prompt}</h2></div>
        <div className="play-scene__approaches"><p className="play-scene__eyebrow">{copy(language, "POSSIBLE APPROACHES", "แนวทางที่เป็นไปได้")}</p>{game.currentScene.suggestedActions.map((suggestion) => <button key={suggestion} onClick={() => { setAction(suggestion); resetIntent(); }}><span>{suggestion}</span><ArrowRight size={15} /></button>)}</div>
      </>}
      {(!outcome || outcomePresentation === "revealed") && <section className="play-scene__composer" id="play-intent-composer"><div className="play-scene__composer-heading"><div><p className="play-scene__eyebrow">{copy(language, "DECLARE YOUR INTENT", "ประกาศเจตนาของเจ้า")}</p><h2>{copy(language, "What will you do?", "เจ้าจะทำอย่างไร")}</h2></div>{!useLocal && !isAuthenticated && <button className="play-scene__login" onClick={onLogin}>{copy(language, "AI ASSISTANCE", "ใช้ AI-assisted")}</button>}</div>
        <textarea id="play-intent-field" value={action} onChange={(event) => { setAction(event.target.value); resetIntent(); }} placeholder={copy(language, "For example: I will ask the gate keeper for one night and name the favor I can repay.", "ตัวอย่าง: ข้าจะขอเวลาจากผู้คุมด่านหนึ่งคืน และบอกบุญคุณที่ข้าจะตอบแทนได้")} />
        {notice && <p className="play-scene__notice">{notice}</p>}
        {!details && !diceResult && <div className="play-scene__composer-actions"><div><span>{copy(language, "Write freely. The ruling will appear after you set this intention.", "เขียนได้อย่างอิสระ แล้วคำวินิจฉัยจะปรากฏเมื่อยืนยันเจตนานี้")}</span></div><Button className="df-button df-button--primary" onClick={commitIntent} disabled={!action.trim() || analyzeGM.isPending}>{analyzeGM.isPending ? copy(language, "READING STORY…", "กำลังอ่านเรื่อง…") : copy(language, "SET THIS INTENTION", "ยืนยันเจตนานี้")} <ArrowRight size={16} /></Button></div>}
        {details && !diceResult && <RollDetails preview={details} language={language} momentum={game.character.vitals.momentum} onRoll={roll} onEdit={resetIntent} rolling={resolveGM.isPending || rolling} />}
        {diceResult && <DiceResult record={diceResult} game={game} language={language} momentum={game.character.vitals.momentum} momentumSources={momentumSources} selectedMomentumSourceId={momentumSourceId} onSelectMomentumSource={setMomentumSourceId} onSpend={spendMomentum} onAccept={acceptResult} onEdit={resetIntent} rolling={rolling} rollPhase={rollPhase} displayDice={displayDice} />}
      </section>}
    </section>
  </div>;
}
