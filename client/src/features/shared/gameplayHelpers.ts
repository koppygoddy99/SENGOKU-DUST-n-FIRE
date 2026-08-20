import type { GameState, RollPreview } from "@/lib/game";

type Language = "en" | "th";
const copy = (language: Language, en: string, th: string) => language === "en" ? en : th;

export const splitStoryParagraphs = (story: string) => story.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
export const shouldUseLocalRules = (uiPreviewMode: boolean, isAuthenticated: boolean) => uiPreviewMode || !isAuthenticated;
export const shouldFetchProfileCredits = (uiPreviewMode: boolean, isAuthenticated: boolean) => isAuthenticated && !uiPreviewMode;
export const openLocalPreview = (open: (page: "play") => void) => open("play");
export const saveLocalTrialResult = (resolved: GameState, credits: number): GameState => ({ ...resolved, credits });
export const gmUnavailableLocalTrialNotice = (language: Language, summary: string) => copy(language, `${summary} · AI GM unavailable · Local Trial saved with no AI credit used`, `${summary} · AI GM ใช้ไม่ได้ · บันทึกแบบกรอกทดลองโดยไม่หักเครดิต AI`);
export const historicalStatusLabel = (status: NonNullable<RollPreview["historical"]>["status"], language: Language) => {
  const labels = { "fact-supported": ["Fact-supported", "มีหลักฐานรองรับ"], "contextual-play": ["Contextual play", "ใช้บริบทประวัติศาสตร์"], "campaign-fiction": ["Campaign fiction", "เรื่องแต่งในแคมเปญ"], "insufficient-evidence": ["Evidence limited", "หลักฐานยังไม่พอ"] } as const;
  return labels[status][language === "en" ? 0 : 1];
};
export const withHistoricalBoundary = (game: GameState, historical: NonNullable<RollPreview["historical"]>): GameState => ({ ...game, historicalBoundary: { ...historical, tick: game.tick } });
