/**
 * Ledger of Ash: quiet paper, traceable consequence, and a narrative-first reading field.
 * Every view reads from the same local campaign state; no hidden backend state is implied.
 */
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Eye, EyeOff, Languages, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, RotateCcw, Search, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { SengokuIcon, type SengokuIconName } from "@/components/SengokuIcon";
import { StoryMap } from "@/features/story/StoryMap";
import { PowerRumorPanel } from "@/features/powerRumor/PowerRumorPanel";
import { buildPowerRumorSummary, socialTierLabel, type SocialField } from "@/lib/powerRumor";
import { managementMenuFor, type ManagementItemId, type ManagementMenuItem } from "@/features/management/managementData";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { gmUnavailableLocalTrialNotice, historicalStatusLabel, openLocalPreview, saveLocalTrialResult, shouldFetchProfileCredits, shouldUseLocalRules, splitStoryParagraphs, withHistoricalBoundary } from "@/features/shared/gameplayHelpers";
import { reviewPageFromSearch, reviewScreenFor, type PlayerPageId } from "@/lib/playerRoutes";
import { buildReviewSeed } from "@/lib/reviewSeeds";
import { localized } from "@/lib/localization";
export { ChronicleView as LogView } from "@/features/chronicle/ChronicleView";
export { gmUnavailableLocalTrialNotice, historicalStatusLabel, openLocalPreview, saveLocalTrialResult, shouldFetchProfileCredits, shouldUseLocalRules, splitStoryParagraphs, withHistoricalBoundary } from "@/features/shared/gameplayHelpers";
import * as game from "@/lib/game";

type CharacterDraft = game.CharacterDraft;
type GameState = game.GameState;
type RollPreview = game.RollPreview;
type Season = game.Season;

const {
  STATS,
  RELATIONSHIP_QUESTIONS,
  STARTER_ERAS,
  STARTER_TEMPLATES,
  applyRoll,
  activeMainMission,
  buyMarketOffer,
  createSaikaSafehouseDemo,
  createGameState,
  masteryLevelDetails,
  normalizeGameState,
  parseAction,
  resolveRoll,
  selectStarterOrigin,
  starterEraById,
  starterTemplatesForEra,
  startingAttributesForTemplate,
  traitLevelDetails,
  traitProgressNeededForLevel,
  visibleSideLeads,
  xpNeededForMasteryLevel,
} = game;

export type PageId = PlayerPageId;
type Language = "en" | "th";
type FontSize = "small" | "normal" | "large";
type Accent = "vermilion" | "ochre" | "teal";
type SaveLeaves = { manual: GameState | null; leaf2: GameState | null; leaf3: GameState | null };
export { managementMenuFor, type ManagementMenuItem } from "@/features/management/managementData";

const CampaignsView = React.lazy(() => import("@/pages/CampaignsView").then((module) => ({ default: module.CampaignsView })));
const MarketHub = React.lazy(() => import("@/pages/MarketHub").then((module) => ({ default: module.MarketHub })));
const PlayScene = React.lazy(() => import("@/features/play/PlayScene").then((module) => ({ default: module.PlayScene })));
const ChronicleView = React.lazy(() => import("@/features/chronicle/ChronicleView").then((module) => ({ default: module.ChronicleView })));
const RelationshipsView = React.lazy(() => import("@/features/relationships/RelationshipsView").then((module) => ({ default: module.RelationshipsView })));
const ApplicationManagementView = React.lazy(() => import("@/features/management/ApplicationManagementView").then((module) => ({ default: module.ApplicationManagementView })));

const STORAGE_KEY = "dust-fire-local-game-v3-saika";
const LEGACY_STORAGE_KEYS = ["dust-fire-local-game-v1", "dust-fire-local-game-v2"];
const seasons: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
const seasonThai: Record<Season, string> = { Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" };
const regionOptions = ["Mikawa", "Omi", "Owari", "Sakai", "Izumi", "Iga", "Koga", "Kii", "Yamashiro", "Settsu", "Musashi", "Iyo", "Shima"];
const mapReviewRegions = [...regionOptions, "Shinano", "Kaga"] as const;

const seedDraft: CharacterDraft = { name: "ผู้ไร้นาม", identity: "ผู้เล่นกำหนด", templateId: "ronin", freeformOccupation: "", origin: "เส้นทางชายแดน", strength: "อ่านทางหนีและอันตรายได้ไว", weakness: "มีหนี้ที่ยังไม่กล้าพูดถึง", skills: ["ดาบและระยะประชิด", "อ่านถนนและทางหนี", "เอาตัวรอดนอกบ้าน"], flaws: ["มีหนี้ที่ยังไม่กล้าพูดถึง"], answers: {} };

const seedGame = () => createSaikaSafehouseDemo();

function copyState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function label(language: Language, en: string, th: string) {
  return language === "en" ? en : th;
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function historicalTone(status: NonNullable<RollPreview["historical"]>["status"]) {
  if (status === "fact-supported") return "teal" as const;
  if (status === "contextual-play") return "ochre" as const;
  if (status === "campaign-fiction") return "vermilion" as const;
  return "navy" as const;
}

function toGMContext(game: GameState) {
  const mission = activeMainMission(game);
  return {
    campaign: game.campaign,
    character: {
      name: game.character.name,
      occupation: game.character.occupation,
      origin: game.character.origin,
      strengths: game.character.strength,
      weakness: game.character.weakness,
      flaws: game.character.flaws,
      attributes: game.character.attributes,
      masteries: game.character.masteries.map((entry) => ({ name: entry.label, level: entry.level, source: entry.origin })),
      background: game.character.pulls.filter((entry) => entry.answer !== "ยังไม่บอก" && entry.answer !== "ยังไม่ตอบ").slice(0, 2).map((entry) => ({ question: entry.question, answer: entry.answer, tags: entry.tags })),
    },
    currentScene: {
      title: game.currentScene.title,
      location: game.currentScene.location,
      summary: game.currentScene.body.join("\n\n"),
      speaker: game.currentScene.speaker,
      pressure: game.currentScene.pressure,
      declaredChoices: game.currentScene.suggestedActions,
    },
    activeMission: mission ? { title: mission.title, giver: mission.issuer, issuerType: mission.issuerType, objective: mission.request, deadline: mission.deadline, reward: mission.reward } : undefined,
    mainThread: mission ? { id: mission.id, title: mission.title, giver: mission.issuer, objective: mission.request, pressure: mission.pressure, deadline: mission.deadline, reward: mission.reward, risk: mission.risk, canonTerms: mission.canon?.protectedTerms ?? [mission.issuer], challenge: mission.challenge ?? "ordinary" } : undefined,
    sideLeads: visibleSideLeads(game).map((entry) => ({ id: entry.id, title: entry.title, objective: entry.request, pressure: entry.pressure, deadline: entry.deadline })),
    socialState: {
      honor: game.character.social.honor,
      influence: game.character.social.influence,
      stain: game.character.social.stain,
      rumors: game.memories.filter((entry) => entry.kind === "news").slice(-4).map((entry) => entry.detail),
      oaths: game.memories.filter((entry) => entry.kind === "oath").slice(-4).map((entry) => entry.detail),
      debts: game.memories.filter((entry) => entry.kind === "debt").slice(-4).map((entry) => entry.detail),
    },
    recentMemories: game.memories.slice(-8).map((entry) => ({ title: entry.title, detail: entry.detail, tone: entry.tone })),
    powerRumor: buildPowerRumorSummary(game, "th"),
  };
}

type CampaignNavItem = { id: PageId; en: string; th: string; icon: SengokuIconName };
type CampaignNavGroup = { id: "story" | "prepare" | "chronicle" | "more"; en: string; th: string; icon: SengokuIconName; items: CampaignNavItem[] };

const campaignNavGroups: CampaignNavGroup[] = [
  { id: "story", en: "Story", th: "เรื่องราว", icon: "sword", items: [
    { id: "home", en: "Campaign Command", th: "หน้าหลักแคมเปญ", icon: "archive" },
    { id: "play", en: "Play Scene", th: "เรื่องราว", icon: "sword" },
    { id: "missions", en: "Missions", th: "ภารกิจ", icon: "compass" },
    { id: "character", en: "Character Dossier", th: "แฟ้มตัวละคร", icon: "character" },
  ] },
  { id: "prepare", en: "Muster", th: "ทรัพยากร", icon: "credit", items: [
    { id: "gear", en: "Carried Gear", th: "สัมภาระที่พก", icon: "character" },
    { id: "market", en: "This Market", th: "ตลาดพื้นที่นี้", icon: "credit" },
    { id: "services", en: "Services & Hands", th: "บริการและคนรับจ้าง", icon: "relation" },
    { id: "obligations", en: "Leverage", th: "อำนาจต่อรอง", icon: "memory" },
    { id: "exchanges", en: "Bonds", th: "ข้อผูกมัด", icon: "log" },
  ] },
  { id: "chronicle", en: "Chronicle", th: "จดหมายเหตุ", icon: "log", items: [
    { id: "log", en: "Story Records", th: "บันทึกเรื่องราว", icon: "log" },
    { id: "relationships", en: "Relationships", th: "ความสัมพันธ์", icon: "relation" },
    { id: "archive", en: "World Archive", th: "หอจดหมายเหตุโลก", icon: "archive" },
  ] },
  { id: "more", en: "More", th: "อื่น ๆ", icon: "settings", items: [
    { id: "campaigns", en: "Campaign Library", th: "หอแคมเปญ", icon: "archive" },
    { id: "save", en: "Save Game", th: "บันทึกเกม", icon: "log" },
    { id: "load", en: "Load Game", th: "โหลดเกม", icon: "document" },
    { id: "start", en: "New Campaign", th: "เริ่มแคมเปญใหม่", icon: "start" },
    { id: "settings", en: "Settings", th: "ตั้งค่า", icon: "settings" },
  ] },
];

export function CampaignNavigation({ campaignTitle, language, page, expanded, onToggle, onOpen }: { campaignTitle: string; language: Language; page: PageId; expanded: boolean; onToggle: () => void; onOpen: (page: PageId) => void }) {
  const activePage: PageId = page === "localmarket" ? "market" : page;
  const activeGroup = campaignNavGroups.find((group) => group.items.some((item) => item.id === activePage))?.id ?? "story";
  const [openGroup, setOpenGroup] = useState<CampaignNavGroup["id"]>(activeGroup);
  useEffect(() => { setOpenGroup(activeGroup); }, [activeGroup]);
  return <><button className={`campaign-nav ${activeGroup ? "campaign-nav--active" : ""}`} onClick={onToggle} aria-expanded={expanded} title={campaignTitle}><SengokuIcon name="archive" size={16} tone="vermilion" /><span className="nav-item__label"><strong>{campaignTitle}</strong><small>{label(language, "Current campaign", "แคมเปญที่กำลังเล่น")}</small></span><ChevronRight className={`campaign-nav__chevron ${expanded ? "is-open" : ""}`} size={15} /></button>{expanded && <div className="campaign-nav__children">{campaignNavGroups.map((group) => { const groupActive = activeGroup === group.id; const isOpen = openGroup === group.id; return <div className="campaign-nav__group" key={group.id}><button className={`nav-item nav-item--group ${groupActive ? "nav-item--active" : ""}`} onClick={() => setOpenGroup((current) => current === group.id ? "story" : group.id)} aria-expanded={isOpen}><SengokuIcon name={group.icon} size={15} tone={groupActive ? "vermilion" : "navy"} /><span className="nav-item__label">{label(language, group.en, group.th)}</span><ChevronRight className={`campaign-nav__chevron ${isOpen ? "is-open" : ""}`} size={14} /></button>{isOpen && <div className="campaign-nav__items">{group.items.map((item) => <button key={item.id} className={`nav-item nav-item--child ${activePage === item.id ? "nav-item--active" : ""}`} onClick={() => onOpen(item.id)} title={label(language, item.en, item.th)}><SengokuIcon name={item.icon} size={14} tone={activePage === item.id ? "vermilion" : "navy"} /><span className="nav-item__label">{label(language, item.en, item.th)}</span></button>)}</div>}</div>; })}</div>}</>;
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <div className="section-kicker">{children}</div>;
}

function GhostLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button className="ghost-link" onClick={onClick}>{children} <ChevronRight size={15} /></button>;
}

function reviewPageFromUrl(): PageId {
  if (typeof window === "undefined") return "home";
  return reviewPageFromSearch(window.location.search);
}

function isReviewRoute() {
  if (typeof window === "undefined") return false;
  return Boolean(new URLSearchParams(window.location.search).get("review"));
}

export function reviewRailCollapsedFromUrl() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("review")) && params.get("rail") === "collapsed";
}

export function reviewMapRegionFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  if (!params.get("review")) return undefined;
  const region = params.get("mapRegion");
  return mapReviewRegions.includes(region as (typeof mapReviewRegions)[number]) ? region ?? undefined : undefined;
}

function withReviewMapRegion(game: GameState): GameState {
  const region = reviewMapRegionFromUrl();
  if (!region) return game;
  const location = `${region} review route`;
  return { ...game, campaign: { ...game.campaign, region, location }, currentScene: { ...game.currentScene, location } };
}

function reviewReaderModeFromUrl(): boolean | undefined {
  if (typeof window === "undefined") return undefined;
  const screen = reviewScreenFor(reviewPageFromSearch(window.location.search));
  if (screen?.reader === "library") return false;
  if (screen?.reader === "reader") return true;
  const requested = new URLSearchParams(window.location.search).get("reader");
  if (requested === "library") return false;
  if (requested === "reader") return true;
  return undefined;
}

export default function Home({ forceUiPreviewMode }: { forceUiPreviewMode?: boolean } = {}) {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  const isOnline = useNetworkStatus();
  const { user, loading, isAuthenticated } = useAuth({ enabled: isOnline });
  const uiPreviewMode = forceUiPreviewMode ?? true;
  const accountCredits = trpc.profile.credits.useQuery(undefined, { enabled: isOnline && shouldFetchProfileCredits(uiPreviewMode, isAuthenticated), retry: false });

  const [reviewRoute] = useState(isReviewRoute);
  const [reviewScreen] = useState(() => reviewRoute ? reviewScreenFor(reviewPageFromUrl()) : undefined);
  const initialGame = () => reviewScreen ? withReviewMapRegion(buildReviewSeed(reviewScreen.seed)) : seedGame();
  const [page, setPage] = useState<PageId>(() => reviewScreen?.page ?? reviewPageFromUrl());
  const [game, setGame] = useState<GameState>(initialGame);
  const [saves, setSaves] = useState<SaveLeaves>(() => { const demo = initialGame(); return { manual: copyState(demo), leaf2: null, leaf3: null }; });
  const [campaignLibrary, setCampaignLibrary] = useState<Record<string, GameState>>(() => { const demo = initialGame(); return { [demo.campaign.id]: demo }; });
  const [language, setLanguage] = useState<Language>("en");
  const [readerMode, setReaderMode] = useState(() => reviewReaderModeFromUrl() ?? true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [accent, setAccent] = useState<Accent>("vermilion");
  const [menuOpen, setMenuOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [managementItemId, setManagementItemId] = useState<ManagementItemId | null>(null);
  const [managementOrigin, setManagementOrigin] = useState<PageId>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(reviewRailCollapsedFromUrl);
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(true);
  const [notice, setNotice] = useState("บันทึกในเครื่องกำลังทำงาน · แคมเปญนี้อยู่ในเบราว์เซอร์นี้เท่านั้น");
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    if (reviewRoute) {
      setStorageReady(true);
      return;
    }
    try {
      LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{ game: GameState; saves: SaveLeaves; campaignLibrary: Record<string, GameState>; language: Language; readerMode: boolean; darkMode: boolean; fontSize: FontSize; accent: Accent }>;
        const restoredGame = saved.game?.schemaVersion === 2 ? normalizeGameState(saved.game) : null;
        const restoredSaves = saved.saves ? Object.fromEntries(Object.entries(saved.saves).map(([slot, save]) => [slot, save ? normalizeGameState(save) : null])) as SaveLeaves : null;
        const restoredLibrary = saved.campaignLibrary && Object.keys(saved.campaignLibrary).length
          ? Object.fromEntries(Object.entries(saved.campaignLibrary).map(([id, campaign]) => [id, normalizeGameState(campaign)])) as Record<string, GameState>
          : null;
        if (restoredGame) setGame(restoredGame);
        if (restoredSaves) setSaves(restoredSaves);
        if (restoredLibrary) setCampaignLibrary(restoredLibrary);
        else if (restoredGame) setCampaignLibrary({ [restoredGame.campaign.id]: restoredGame });
        if (saved.language) setLanguage(saved.language);
        if (reviewReaderModeFromUrl() === undefined && typeof saved.readerMode === "boolean") setReaderMode(saved.readerMode);
        if (typeof saved.darkMode === "boolean") setDarkMode(saved.darkMode);
        if (saved.fontSize) setFontSize(saved.fontSize);
        if (saved.accent) setAccent(saved.accent);
      }
    } catch {
      setNotice("Local Save could not be read · a fresh campaign has been prepared");
    } finally {
      setStorageReady(true);
    }
  }, [reviewRoute]);

  useEffect(() => {
    if (!storageReady || reviewRoute) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ game, saves, campaignLibrary, language, readerMode, darkMode, fontSize, accent }));
  }, [accent, campaignLibrary, darkMode, fontSize, game, language, readerMode, reviewRoute, saves, storageReady]);

  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    if (!managementOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setManagementOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [managementOpen]);
  useEffect(() => {
    const credits = accountCredits.data?.credits;
    if (!isOnline || !shouldFetchProfileCredits(uiPreviewMode, isAuthenticated) || typeof credits !== "number") return;
    setGame((current) => current.credits === credits ? current : { ...current, credits });
  }, [accountCredits.data?.credits, isAuthenticated, isOnline]);

  const appClass = ["app-shell", darkMode ? "theme-dark" : "", `font-${fontSize}`, `accent-${accent}`, sidebarCollapsed ? "sidebar-collapsed" : "", reviewRoute ? "app-shell--review" : ""].join(" ");
  const updateGame = (next: GameState, message: string) => { setGame(next); setCampaignLibrary((current) => ({ ...current, [next.campaign.id]: copyState(next) })); setNotice(message); };
  const open = (nextPage: PageId) => { setCampaignMenuOpen(true); setPage(nextPage); setMenuOpen(false); };
  const openManagementItem = (item: ManagementMenuItem) => { setManagementOrigin(page); setManagementItemId(item.id); setManagementOpen(false); open("management"); };
  const returnToManagementIndex = () => { setPage(managementOrigin); setManagementOpen(true); };
  const beginNew = (nextGame: GameState) => { setGame(nextGame); setCampaignLibrary((current) => ({ ...current, [nextGame.campaign.id]: copyState(nextGame) })); setSaves({ manual: null, leaf2: null, leaf3: null }); setNotice("A new campaign has begun · 50 trial credits are ready"); open("play"); };
  const selectCampaign = (selected: GameState) => { const copy = copyState(selected); setGame(copy); setSaves((current) => ({ ...current, manual: copyState(copy) })); setNotice(`${copy.campaign.title} selected · Local Save restored at Page ${copy.tick}`); open("play"); };
  const writeSave = (slot: keyof SaveLeaves) => { setSaves((current) => ({ ...current, [slot]: copyState(game) })); setNotice(`${slot === "manual" ? "Manual Save" : slot === "leaf2" ? "Saved Page II" : "Saved Page III"} written at Page ${game.tick}`); };
  const loadSave = (slot: "auto" | keyof SaveLeaves) => {
    const source = slot === "auto" ? game : saves[slot];
    if (!source) { setNotice("This page is still blank"); return; }
    setGame(copyState(source)); setNotice(`${slot === "auto" ? "Auto Save" : "Saved page"} restored at Page ${source.tick}`); open("play");
  };
  const deleteSave = (slot: keyof SaveLeaves) => { setSaves((current) => ({ ...current, [slot]: null })); setNotice(`${slot === "manual" ? "Manual Save" : slot === "leaf2" ? "Saved Page II" : "Saved Page III"} deleted from this browser`); };
  const resetLocal = () => { const demo = seedGame(); window.localStorage.removeItem(STORAGE_KEY); setGame(demo); setSaves({ manual: copyState(demo), leaf2: null, leaf3: null }); setCampaignLibrary({ [demo.campaign.id]: copyState(demo) }); setNotice("Local records cleared · Saika safehouse example is ready"); };

  const isAdmin = !uiPreviewMode && user?.role === "admin";

  if (!isOnline) return <OfflinePlayLock />;

  return <div className={appClass}>
    <header className="topbar">
      <button className="brand" onClick={() => open("home")} aria-label="Dust and Fire home"><span className="brand-mark"><span /><span /></span><span className="brand-copy"><strong>Dust &amp; Fire</strong><small>SENGOKU STORIES</small></span></button>
      <div className="topbar__context"><span>{game.campaign.year}</span><span className="topbar__dot">•</span><span>{language === "en" ? game.campaign.season : seasonThai[game.campaign.season]}</span><span className="topbar__dot">•</span><span>{game.campaign.region}</span></div>
      <button className="topbar-safekeeping" onClick={() => open("save")}><SengokuIcon name="log" size={16} tone="teal" /><span>{label(language, "Save Game", "บันทึกเกม")}</span></button>
      {!loading && !uiPreviewMode && <button className={`gm-account-chip ${isAuthenticated ? "is-signed-in" : ""}`} onClick={() => !isAuthenticated && startLogin()}>{isAuthenticated ? <><span className="gm-account-chip__dot" />{user?.name || label(language, "GM access", "สิทธิ์ใช้ GM")}</> : <><SengokuIcon name="relation" size={15} tone="teal" />{label(language, "AI GM · Sign in", "AI GM · เข้าสู่ระบบ")}</>}</button>}
      <button className="management-trigger" type="button" onClick={() => setManagementOpen((value) => !value)} aria-haspopup="dialog" aria-expanded={managementOpen} aria-controls="management-menu"><SengokuIcon name="settings" size={16} tone="navy" /><span>{label(language, "Manage", "จัดการ")}</span><ChevronDown size={14} aria-hidden="true" /></button>
      <div className="topbar-language" aria-label="Language selection"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div>
      <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Open menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    </header>
    {managementOpen && <><button className="management-menu__backdrop" aria-label={label(language, "Close management menu", "ปิดเมนูจัดการ")} onClick={() => setManagementOpen(false)} /><ManagementMenu language={language} isAdmin={isAdmin} onClose={() => setManagementOpen(false)} onOpenItem={openManagementItem} /></>}
    <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""} ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
      <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar">{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
      <div className="sidebar__identity"><div className="mon-avatar">火</div><div className="sidebar__identity-copy"><strong>{game.character.name}</strong><span>{game.character.occupation}</span></div></div>
      <nav className="nav-list" aria-label="Game navigation"><CampaignNavigation campaignTitle={game.campaign.title} language={language} page={page} expanded={campaignMenuOpen} onToggle={() => setCampaignMenuOpen((value) => !value)} onOpen={open} /></nav>
      <div className="sidebar__vitals">
        <Vital label={label(language, "Wounds", "บาดแผล")} value={`${game.character.vitals.wounds}/6`} percent={(game.character.vitals.wounds / 6) * 100} tone="red" />
        <Vital label={label(language, "Focus", "ค่าสติ")} value={`${game.character.vitals.focus}/6`} percent={(game.character.vitals.focus / 6) * 100} tone="ochre" />
      </div>
      <div className="sidebar__states"><small>{label(language, "What the world remembers", "สิ่งที่โลกจดจำ")}</small>{game.memories.slice(-3).reverse().map((memory) => <span className={`state-pill state-pill--${memory.tone}`} key={memory.id}>{memory.title}</span>)}</div>
      <div className="sidebar__language"><Languages size={15} /><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><span>/</span><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div>
      <div className="sidebar__notice">{notice}</div>
    </aside>
    <main data-testid="player-main-content" className={`main-content ${page === "play" ? "main-content--play" : ""}`} data-review-screen={reviewScreen?.screenshotFile} data-review-seed={reviewScreen?.seed} data-review-title={reviewScreen?.pageTitle}>
      {page === "home" && <StoryMap game={game} language={language} onOpen={open} />}
      {page === "home" && <PowerRumorPanel game={game} language={language} />}
      {page === "campaigns" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><CampaignsView campaigns={Object.values(campaignLibrary)} activeId={game.campaign.id} language={language} onSelect={selectCampaign} onNew={() => open("start")} /></React.Suspense>}
      {page === "start" && <StartView language={language} onStart={beginNew} />}
      {page === "play" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><PlayScene game={game} language={language} onOpen={open} onUpdate={updateGame} isAuthenticated={isAuthenticated} uiPreviewMode={uiPreviewMode} onLogin={startLogin} onAccountCreditChange={() => accountCredits.refetch()} /></React.Suspense>}
      {page === "missions" && <MissionsView game={game} language={language} />}
      {page === "market" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><MarketHub game={game} language={language} onUpdate={updateGame} initialTab="market" /></React.Suspense>}
      {page === "localmarket" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><MarketHub game={game} language={language} onUpdate={updateGame} initialTab="market" /></React.Suspense>}
      {page === "gear" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><MarketHub game={game} language={language} onUpdate={updateGame} initialTab="gear" /></React.Suspense>}
      {page === "services" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><MarketHub game={game} language={language} onUpdate={updateGame} initialTab="services" /></React.Suspense>}
      {page === "obligations" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><MarketHub game={game} language={language} onUpdate={updateGame} initialTab="obligations" /></React.Suspense>}
      {page === "exchanges" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><MarketHub game={game} language={language} onUpdate={updateGame} initialTab="history" /></React.Suspense>}
      {page === "character" && <CharacterView game={game} language={language} open={open} />}
      {page === "log" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><ChronicleView game={game} language={language} readerMode={readerMode} setReaderMode={setReaderMode} /></React.Suspense>}
      {page === "relationships" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><RelationshipsView game={game} language={language} isAuthenticated={isAuthenticated} uiPreviewMode={uiPreviewMode} onUpdate={updateGame} /></React.Suspense>}
      {page === "management" && <React.Suspense fallback={<DeferredViewFallback language={language} />}><ApplicationManagementView itemId={managementItemId} language={language} isAdmin={isAdmin} onBack={returnToManagementIndex} /></React.Suspense>}
      {page === "archive" && <ArchiveView game={game} language={language} />}
      {page === "save" && <SaveView game={game} saves={saves} language={language} onSave={writeSave} onDelete={deleteSave} open={open} />}
      {page === "load" && <LoadView game={game} saves={saves} language={language} onLoad={loadSave} onDelete={deleteSave} />}
      {page === "settings" && <SettingsView language={language} setLanguage={setLanguage} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} accent={accent} setAccent={setAccent} readerMode={readerMode} setReaderMode={setReaderMode} onReset={resetLocal} />}
    </main>
  </div>;
}

function DeferredViewFallback({ language }: { language: Language }) {
  return <section className="page deferred-view" role="status" aria-live="polite"><p className="section-kicker">OPENING FOLIO</p><h1>{label(language, "Preparing this campaign record", "กำลังเปิดบันทึกแคมเปญ")}</h1><p>{label(language, "The selected page is loading without interrupting the campaign state.", "กำลังโหลดหน้าที่เลือกโดยไม่ขัดจังหวะสถานะแคมเปญ")}</p></section>;
}

function OfflinePlayLock() {
  return <main className="app-shell connection-lock" data-testid="offline-play-lock" role="alert" aria-live="assertive">
    <section className="connection-lock__paper">
      <div className="connection-lock__seal" aria-hidden="true">火</div>
      <div>
        <p className="section-kicker">CONNECTION REQUIRED</p>
        <h1>Connection required to play</h1>
        <p>Dust &amp; Fire cannot start or continue a campaign while this browser is offline. Reconnect to the internet; this page will unlock automatically.</p>
        <hr />
        <h2>ต้องเชื่อมต่อเครือข่ายก่อนเล่น</h2>
        <p>ไม่สามารถเริ่มหรือเล่นแคมเปญได้เมื่อเบราว์เซอร์ไม่มีเครือข่าย โปรดเชื่อมต่ออินเทอร์เน็ตอีกครั้ง หน้านี้จะปลดล็อกเองเมื่อกลับมาออนไลน์</p>
      </div>
    </section>
  </main>;
}

function ManagementMenu({ language, isAdmin, onClose, onOpenItem }: { language: Language; isAdmin: boolean; onClose: () => void; onOpenItem: (item: ManagementMenuItem) => void }) {
  return <aside id="management-menu" className="management-menu" role="dialog" aria-modal="true" aria-label={label(language, "Application management", "การจัดการแอปพลิเคชัน")}><div className="management-menu__heading"><div><SectionKicker>APPLICATION MANAGEMENT</SectionKicker><h2>{label(language, "Outside the campaign", "นอกเหนือจากแคมเปญ")}</h2><p>{label(language, "Account and studio controls stay here so the game table remains quiet.", "บัญชีและเครื่องมือดูแลอยู่ที่นี่ เพื่อให้โต๊ะเล่นเกมยังสงบ")}</p></div><button className="management-menu__close" onClick={onClose} aria-label={label(language, "Close management menu", "ปิดเมนูจัดการ")}><X size={18} /></button></div>{managementMenuFor(isAdmin).map((section) => <section className="management-menu__section" key={section.id}><h3>{label(language, section.en, section.th)}</h3>{section.items.map((item) => <button className="management-menu__item management-menu__item--ready" key={item.id} onClick={() => onOpenItem(item)}><span>{label(language, item.en, item.th)}</span><small>{label(language, "Preparing", "กำลังเตรียม")}</small><ChevronRight size={15} /></button>)}</section>)}<div className="management-menu__footer"><SengokuIcon name="memory" size={15} tone="teal" /><span>{label(language, "Player records remain local to this browser.", "บันทึกผู้เล่นยังอยู่ในเบราว์เซอร์นี้เป็นหลัก")}</span></div></aside>;
}

function Vital({ label, value, percent, tone }: { label: string; value: string; percent: number; tone: "red" | "ochre" | "teal" }) {
  return <div className="vital"><span>{label}</span><strong>{value}</strong><i className={`bar bar--${tone}`}><b style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></i></div>;
}

function StartView({ language, onStart }: { language: Language; onStart: (game: GameState) => void }) {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState({ title: "A New Campaign", season: "Summer" as Season });
  const [draft, setDraft] = useState<CharacterDraft>({ ...seedDraft, eraId: "unification-campaigns", answers: { ...seedDraft.answers } });
  const era = starterEraById(draft.eraId);
  const eraTemplates = starterTemplatesForEra(era.id);
  const template = eraTemplates.find((entry) => entry.id === draft.templateId) ?? eraTemplates[0] ?? STARTER_TEMPLATES[0];
  const [selectionSeed] = useState(() => Date.now());
  const fallbackOriginSelection = useMemo(() => selectStarterOrigin(era.id, template.id, selectionSeed), [era.id, selectionSeed, template.id]);
  const serverOriginSelection = trpc.starter.selectProfile.useQuery({ eraId: era.id, templateId: template.id, seed: selectionSeed }, { staleTime: Infinity, retry: false });
  const originSelection = serverOriginSelection.data ?? fallbackOriginSelection;
  const previewAttributes = startingAttributesForTemplate(template);
  const updateDraft = <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateAnswer = (key: string, value: string) => setDraft((current) => ({ ...current, answers: { ...current.answers, [key]: value } }));
  return <div className="page start-view">
    <div className="page-heading"><div><SectionKicker>NEW CAMPAIGN · STEP {step} OF 4</SectionKicker><h1>{["Set the campaign", "Choose a way to live", "Give the character a stake", "Confirm before the first page"][step - 1]}</h1><p>{label(language, "The game will create a local campaign with 50 trial credits. Nothing is sent to a server; this browser holds the record.", "เกมจะสร้างแคมเปญในเครื่องพร้อมเครดิตทดลอง 50 เครดิต ข้อมูลยังไม่ส่งไปยังเซิร์ฟเวอร์และเก็บอยู่ในเบราว์เซอร์นี้")}</p></div><div className="credit-box"><SengokuIcon name="credit" tone="ochre" /><span>{label(language, "Trial credits", "เครดิตทดลอง")}</span><strong>50</strong></div></div>
    <div className="start-layout"><ol className="step-rail">{["Campaign", "Starting path", "Character", "Confirmation"].map((entry, index) => <li key={entry} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-done" : ""}><span>{index + 1}</span><div><strong>{entry}</strong><small>{["time and place", "one of ten paths", "ties and strengths", "local save begins"][index]}</small></div></li>)}</ol>
      <section className="start-form">
        {step === 1 && <><label className="field-label">{label(language, "Campaign name", "ชื่อแคมเปญ")}<input value={context.title} onChange={(event) => setContext((current) => ({ ...current, title: event.target.value }))} /></label><div className="choice-header"><strong>{label(language, "Choose an era", "เลือกช่วงยุค")}</strong><span>{label(language, "The campaign will later draw one reviewed year and a fitting origin from this era.", "แคมเปญจะสุ่มปีที่ผ่านการตรวจและจุดเริ่มที่เหมาะจากช่วงยุคนี้")}</span></div><div className="template-grid">{STARTER_ERAS.map((entry) => <button key={entry.id} className={`template-card ${era.id === entry.id ? "is-selected" : ""}`} onClick={() => { const next = starterTemplatesForEra(entry.id)[0] ?? STARTER_TEMPLATES[0]; setDraft((current) => ({ ...current, eraId: entry.id, templateId: next.id, freeformOccupation: "" })); }}><span>{era.id === entry.id ? "SELECTED" : "ERA"}</span><strong>{entry.label}</strong><small>{entry.summary}</small><i>{entry.years[0]}–{entry.years.at(-1)}</i></button>)}</div><label className="field-label field-label--spaced">{label(language, "Season", "ฤดูกาล")}<select value={context.season} onChange={(event) => setContext((current) => ({ ...current, season: event.target.value as Season }))}>{seasons.map((season) => <option key={season}>{season}</option>)}</select></label><StepControls next={() => setStep(2)} /></>}
        {step === 2 && <><div className="choice-header"><strong>{label(language, "Pick a starting path", "เลือกอาชีพเริ่มต้น")}</strong><span>{label(language, "This era offers only paths with a distinct historical role.", "ยุคนี้เปิดเฉพาะอาชีพที่มีบทบาทต่างกันตามบริบทประวัติศาสตร์")}</span></div><div className="template-grid">{eraTemplates.map((entry) => <button key={entry.id} className={`template-card ${draft.templateId === entry.id ? "is-selected" : ""}`} onClick={() => updateDraft("templateId", entry.id)}><span>{entry.id === draft.templateId ? "SELECTED" : "PATH"}</span><strong>{entry.label}</strong><small>{entry.short}</small><i>{entry.pressure}</i></button>)}</div><StarterTemplateDossier template={template} attributes={previewAttributes} language={language} /><div className="context-check"><BookOpen size={17} />{label(language, "Year, birthplace, and starting place are assigned by the selected era and path; they are not manual inputs.", "ปีเกิด ปีเริ่ม และสถานที่เริ่มจะถูกกำหนดตามยุคและอาชีพ ไม่ใช่ช่องกรอกเอง")}</div><StepControls previous={() => setStep(1)} next={() => setStep(3)} /></>}
        {step === 3 && <><div className="field-grid field-grid--two"><label className="field-label">{label(language, "Character name", "ชื่อตัวละคร")}<input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></label><label className="field-label">{label(language, "Identity", "เพศหรืออัตลักษณ์")}<input value={draft.identity} onChange={(event) => updateDraft("identity", event.target.value)} /></label></div><label className="field-label field-label--spaced">{label(language, "Strength", "จุดเด่น")}<input value={draft.strength} onChange={(event) => updateDraft("strength", event.target.value)} /></label><div className="field-grid field-grid--two">{[0, 1].map((index) => <label className="field-label" key={`flaw-${index}`}><span>{label(language, `Flaw ${index + 1}${index ? " (optional)" : ""}`, `จุดอ่อน ${index + 1}${index ? " (ไม่บังคับ)" : ""}`)}</span><input value={draft.flaws?.[index] ?? ""} placeholder={index ? label(language, "A second pressure, if wanted", "แรงกดดันข้อที่สอง หากต้องการ") : label(language, "A flaw with a real cost", "จุดอ่อนที่มีราคาจริง")} onChange={(event) => { const flaws = [...(draft.flaws ?? [])]; flaws[index] = event.target.value; updateDraft("flaws", flaws); if (index === 0) updateDraft("weakness", event.target.value); }} /></label>)}</div><div className="relation-questions"><div className="field-label"><span>{label(language, "Choose 3–5 starting masteries", "เลือก Mastery เริ่มต้น 3–5 อย่าง")}</span>{template.masteries.map((mastery) => <label key={mastery.id}><input type="checkbox" checked={(draft.skills ?? []).includes(mastery.label)} onChange={(event) => { const current = draft.skills ?? []; const next = event.target.checked ? Array.from(new Set([...current, mastery.label])).slice(0, 5) : current.filter((entry) => entry !== mastery.label); updateDraft("skills", next); }} /> {mastery.label}</label>)}<small>{label(language, "Selected Masteries begin at Level 1 (+1).", "Mastery ที่เลือกเริ่มที่ระดับ 1 (+1)")}</small></div>{RELATIONSHIP_QUESTIONS.map(([id, question]) => <label className="field-label" key={id}><span>{question}</span><input value={draft.answers[id] ?? ""} onChange={(event) => updateAnswer(id, event.target.value)} /></label>)}</div><div className="background-note"><SectionKicker>CHARACTER BACKGROUND</SectionKicker><strong>{label(language, "Flaws affect a roll only when the AI GM finds the current context directly relevant", "จุดอ่อนมีผลต่อการทอยเฉพาะเมื่อ AI GM เห็นว่าบริบทฉากเกี่ยวข้องโดยตรง")}</strong><p>{label(language, "When triggered, one flaw applies −2 before DN comparison. Otherwise it stays a remembered part of the character and no status is shown.", "เมื่อถูก trigger จุดอ่อนหนึ่งข้อจะหัก −2 ก่อนเทียบ DN นอกนั้นมันเป็นเพียงส่วนหนึ่งที่โลกจดจำและจะไม่แสดงสถานะ")}</p></div><StepControls previous={() => setStep(2)} next={() => setStep(4)} /></>}
        {step === 4 && <><div className="campaign-review"><SectionKicker>CAMPAIGN START RECORD</SectionKicker><h2>{context.title || "Untitled Campaign"}</h2><p>{era.label} · {originSelection.year} · {context.season}</p><hr /><strong>{serverOriginSelection.isLoading ? label(language, "Assigning your opening…", "กำลังจัดสรรจุดเริ่มเรื่อง…") : label(language, "Ready to begin", "พร้อมเริ่มเรื่อง")}</strong><small>{label(language, "The opening year, age, birthplace, and city are assigned from this era and starting path.", "ปี อายุ ปีเกิด และเมืองเริ่มจะถูกกำหนดจากช่วงยุคและอาชีพนี้")}</small></div><CharacterConfirmationDossier draft={draft} origin={originSelection.origin} template={template} attributes={previewAttributes} language={language} /><StepControls previous={() => setStep(3)} disabled={serverOriginSelection.isLoading} nextLabel={label(language, "BEGIN WITH 50 CREDITS", "เริ่มเรื่องพร้อม 50 เครดิต")} next={() => onStart(createGameState({ id: `camp-${Date.now()}`, title: context.title || "Untitled Campaign", year: originSelection.year, season: context.season, region: originSelection.region, location: originSelection.location, eraId: era.id, openingProfileId: originSelection.id, selectionSeed, warShadow: 3, day: 1 }, { ...draft, origin: originSelection.origin }))} /></>}
      </section>
      <aside className="historical-preview"><SectionKicker>ERA CONTEXT</SectionKicker><h2>{era.years[0]}–{era.years.at(-1)} · {language === "en" ? context.season : seasonThai[context.season]}</h2><div className="preview-row"><SengokuIcon name="history" tone="vermilion" />{era.summary}</div><div className="preview-row"><SengokuIcon name="roll" tone="ochre" />{label(language, "The final historical brief still uses only reviewed records and the existing date gate.", "บริบทประวัติศาสตร์จริงจะใช้เฉพาะ record ที่ตรวจแล้วและ date gate เดิม")}</div></aside>
    </div>
  </div>;
}

function StarterTemplateDossier({ template, attributes, language, compact = false }: { template: typeof STARTER_TEMPLATES[number]; attributes: typeof template.attributes; language: Language; compact?: boolean }) {
  const social = template.social;
  return <section className={`template-dossier ${compact ? "template-dossier--compact" : ""}`} data-testid="starter-template-dossier"><div className="template-dossier__heading"><div><SectionKicker>{label(language, "STARTING DOSSIER", "ทะเบียนเริ่มต้น")}</SectionKicker><h2>{template.label}</h2><p>{label(language, "Age", "อายุ")} {template.age} · {template.start}</p></div><span>{template.mission.title}</span></div><div className="template-dossier__stats">{STATS.map((stat) => <span key={stat.id}><small>{language === "en" ? stat.en : stat.th}</small><b>{attributes[stat.id]}</b></span>)}</div><div className="template-dossier__columns"><div><small>{label(language, "STARTING MASTERIES", "ความชำนาญเริ่มต้น")}</small>{template.masteries.map((entry) => <p key={entry.id}>{entry.label} <b>{label(language, "Level", "ระดับ")} {entry.level} · +{entry.level}</b></p>)}</div><div><small>{label(language, "CARRIED GEAR", "สัมภาระติดตัว")}</small>{template.inventory.map((entry) => <p key={entry.id}>{entry.label}</p>)}</div><div><small>{label(language, "SOCIAL RECORD", "สถานะสังคม")}</small><p>{label(language, "Rank", "ยศ")} {social.rank} · {label(language, "Honor", "เกียรติ")} {social.honor}</p><p>{label(language, "Influence", "บารมี")} {social.influence} · {label(language, "Information", "ข่าว")} {social.information}</p></div></div><div className="template-dossier__mission"><small>{label(language, "FIRST MISSION", "ภารกิจแรก")}</small><strong>{template.mission.title}</strong><p>{template.mission.request}</p></div></section>;
}

function CharacterConfirmationDossier({ draft, origin, template, attributes, language }: { draft: CharacterDraft; origin: string; template: typeof STARTER_TEMPLATES[number]; attributes: typeof template.attributes; language: Language }) {
  const background = RELATIONSHIP_QUESTIONS.map(([id, question]) => ({ question, answer: draft.answers[id]?.trim() })).filter((entry) => Boolean(entry.answer));
  return <section className="confirmation-dossier" data-testid="character-confirmation-dossier"><div className="confirmation-dossier__heading"><SectionKicker>{label(language, "WHO YOU ARE", "คุณคือใคร")}</SectionKicker><h2>{draft.name || "ผู้ไร้นาม"} · {draft.templateId === "freeform" ? draft.freeformOccupation || "ผู้เดินทางไร้สังกัด" : template.label}</h2><p>{draft.identity || "—"} · {origin} · {label(language, "Age", "อายุ")} {template.age}</p><p>{label(language, "Strength", "จุดเด่น")}: {draft.strength || "—"} · {label(language, "Weakness", "จุดด้อย")}: {draft.weakness || "—"}</p></div><div className="confirmation-dossier__stats">{STATS.map((stat) => <span key={stat.id}><small>{language === "en" ? stat.en : stat.th}</small><b>{attributes[stat.id]}</b></span>)}</div><div className="confirmation-dossier__grid"><section><small>{label(language, "FIRST MISSION", "ภารกิจแรก")}</small><strong>{template.mission.title}</strong><p>{template.mission.request}</p></section><section><small>{label(language, "ALL STARTING MASTERIES", "ความชำนาญที่เลือกทั้งหมด")}</small>{template.masteries.map((entry) => <p key={entry.id}>{entry.label} <b>{label(language, "Level", "ระดับ")} {entry.level} · +{entry.level}</b></p>)}</section><section><small>{label(language, "CARRIED GEAR", "สัมภาระติดตัว")}</small>{template.inventory.map((entry) => <p key={entry.id}>{entry.label}</p>)}</section><section><small>{label(language, "CHARACTER BACKGROUND", "ภูมิหลังตัวละคร")}</small>{background.length ? background.map((entry) => <p key={entry.question}><b>{entry.question}</b>{entry.answer}</p>) : <p>{label(language, "No background has been written yet. You may return to step 3.", "ยังไม่ได้เขียนภูมิหลัง สามารถย้อนกลับไปขั้นที่ 3 ได้")}</p>}</section></div></section>;
}

function StepControls({ previous, next, nextLabel, disabled = false }: { previous?: () => void; next: () => void; nextLabel?: string; disabled?: boolean }) {
  return <div className="credit-confirm">{previous ? <Button className="df-button df-button--ghost" onClick={previous}><ArrowLeft size={17} /> Back</Button> : <span />}{nextLabel ? <Button className="df-button df-button--primary" disabled={disabled} onClick={next}>{nextLabel} <ArrowRight size={17} /></Button> : <Button className="df-button df-button--primary" disabled={disabled} onClick={next}>Continue <ArrowRight size={17} /></Button>}</div>;
}

function MissionFolio({ mission, language, section }: { mission: NonNullable<ReturnType<typeof activeMainMission>>; language: Language; section: string }) {
  const progress = mission.progress;
  return <article className={`mission-folio mission-folio--${mission.state} mission-folio--${mission.challenge ?? "ordinary"}`} key={mission.id}><div className="folio-marker">{mission.state === "resolved" ? "✓" : mission.state === "active" ? "!" : "·"}</div><div><SectionKicker>{section}</SectionKicker><h2>{localized(language, mission.title)}</h2><p>{localized(language, mission.request)}</p><div className="mission-meta"><span><b>{label(language, "Pressure", "แรงกดดัน")}</b>{localized(language, mission.pressure)}</span><span><b>{label(language, "Deadline", "เส้นตาย")}</b>{mission.deadline}</span><span><b>{label(language, "Reward when the story resolves", "รางวัลเมื่อเรื่องคลี่คลาย")}</b>{localized(language, mission.reward)}</span><span><b>{label(language, "Risk", "ความเสี่ยง")}</b>{localized(language, mission.risk)}</span></div>{progress && <div className="context-check"><SengokuIcon name="log" tone={mission.state === "resolved" ? "teal" : "ochre"} />{label(language, "Story movement:", "ความคืบหน้าในเรื่อง:")} {progress.current}/{progress.required} · {mission.challenge === "elevated" ? label(language, "This new direction carries a heavier price.", "เส้นทางใหม่นี้มีราคาที่หนักกว่าเดิม") : mission.state === "resolved" ? label(language, "The reward has entered the campaign record.", "รางวัลเข้าสู่บันทึกแคมเปญแล้ว") : label(language, "Relevant outcomes move this thread; nothing is accepted with a button.", "ผลที่เกี่ยวข้องจะขยับเส้นเรื่องนี้เอง ไม่มีปุ่มรับภารกิจ")}</div>}<div className="mission-options">{mission.options.map((option) => <span key={option}>{option}</span>)}</div></div></article>;
}

function MissionsView({ game, language }: { game: GameState; language: Language }) {
  const main = activeMainMission(game);
  const sideLeads = game.missions.filter((mission) => (mission.role ?? "main") === "side" && (mission.visibility ?? "visible") === "visible" && (mission.state === "offered" || mission.state === "active"));
  const retiredMain = game.missions.filter((mission) => (mission.role ?? "main") === "main" && mission.state === "retired");
  return <div className="page mission-view"><div className="page-heading"><div><SectionKicker>{label(language, "MAIN THREAD · SIDE LEADS", "เส้นเรื่องหลัก · ร่องรอยรอง")}</SectionKicker><h1>{label(language, "What your choices are pressing toward", "สิ่งที่การตัดสินใจของเจ้ากำลังกดดันอยู่")}</h1><p>{label(language, "The campaign holds one Main Thread and up to two Side Leads. They move only after a recorded outcome; there is nothing to accept or complete with a button.", "แคมเปญมีเส้นเรื่องหลักได้หนึ่งเส้น และร่องรอยรองได้ไม่เกินสองเส้น ทุกอย่างขยับหลังบันทึกผลทอยเท่านั้น ไม่มีปุ่มรับหรือกดจบภารกิจ")}</p></div><div className="mission-capacity" aria-label={label(language, "Mission capacity", "จำนวนเส้นเรื่อง")}><span><small>{label(language, "MAIN THREAD", "เส้นเรื่องหลัก")}</small><b>{main ? "1/1" : "0/1"}</b></span><span><small>{label(language, "SIDE LEADS", "ร่องรอยรอง")}</small><b>{sideLeads.length}/2</b></span></div></div><section className="mission-ledger">{main ? <MissionFolio mission={main} language={language} section={label(language, "MAIN THREAD · CURRENT DIRECTION", "เส้นเรื่องหลัก · ทิศทางปัจจุบัน")} /> : <p className="mission-empty">{label(language, "No Main Thread is open. The next recorded consequence may establish one.", "ยังไม่มีเส้นเรื่องหลักเปิดอยู่ ผลที่บันทึกครั้งถัดไปอาจทำให้มันปรากฏ")}</p>}{sideLeads.length > 0 && <section className="mission-side-section"><header><SectionKicker>{label(language, "SIDE LEADS · WHAT HAS SURFACED", "ร่องรอยรอง · สิ่งที่ปรากฏแล้ว")}</SectionKicker><p>{label(language, "These are leads the character has encountered, not contracts they have accepted.", "นี่คือร่องรอยที่ตัวละครพบแล้ว ไม่ใช่สัญญาที่ตัวละครกดยอมรับ")}</p></header>{sideLeads.map((mission) => <MissionFolio key={mission.id} mission={mission} language={language} section={label(language, "SIDE LEAD", "ร่องรอยรอง")} />)}</section>}{retiredMain.length > 0 && <section className="mission-history"><SectionKicker>{label(language, "EARLIER DIRECTION", "ทิศทางก่อนหน้า")}</SectionKicker>{retiredMain.slice(-1).map((mission) => <p key={mission.id}><b>{localized(language, mission.title)}</b> · {mission.retiredReason ?? label(language, "The campaign moved elsewhere.", "เรื่องเดินไปอีกทางหนึ่งแล้ว")}</p>)}</section>}</section></div>;
}

function MarketView({ game, language, onUpdate }: { game: GameState; language: Language; onUpdate: (next: GameState, message: string) => void }) {
  return <div className="page market-view"><div className="page-heading"><div><SectionKicker>MARKET · LOCAL OFFERS</SectionKicker><h1>{label(language, "A market is not a catalogue", "ตลาดไม่ใช่แคตตาล็อก")}</h1><p>{label(language, "The offerings are held in this campaign state. They do not refresh simply because you open this page.", "สินค้าเหล่านี้เก็บอยู่ในสถานะแคมเปญ และจะไม่สุ่มใหม่เพียงเพราะเจ้าเปิดหน้านี้")}</p></div><div className="resource-tally"><span>{label(language, "Property", "ทรัพย์สิน")}<b>{game.character.resources.property}</b></span><span>{label(language, "Supplies", "เสบียง")}<b>{game.character.resources.supplies}</b></span><span>{label(language, "Credit", "เครดิต") }<b>{game.character.resources.credit}</b></span></div></div><div className="market-reason"><SengokuIcon name="history" tone="ochre" />{label(language, `Seasonal offer: ${game.campaign.season}. Prices are illustrative local values shaped by the current route and war pressure.`, `ของตามฤดู: ${seasonThai[game.campaign.season]} ราคาเป็นค่าตัวอย่างในแคมเปญนี้ตามเส้นทางและแรงกดดันจากสงคราม`)}</div><section className="market-list">{game.market.map((offer) => <article className="market-row" key={offer.id}><div><SectionKicker>{offer.kind.toUpperCase()}</SectionKicker><h2>{offer.label}</h2><p>{offer.note}</p></div><span className="market-cost">{offer.price} <small>{label(language, "property", "ทรัพย์สิน")}</small></span><Button className="df-button df-button--ghost" onClick={() => { const result = buyMarketOffer(game, offer.id); onUpdate(result.state, result.message); }}>{label(language, "TAKE OFFER", "รับข้อเสนอ")}</Button></article>)}</section></div>;
}

function CharacterView({ game, language, open }: { game: GameState; language: Language; open: (page: PageId) => void }) {
  const [tab, setTab] = useState<"traits" | "masteries" | "inventory" | "ties">("traits");
  const usedSlots = game.character.inventory.reduce((sum, item) => sum + item.slots, 0);
  const socialRows: Array<[SocialField, string, string, number, string]> = [["honor", "Honor", "เกียรติ", game.character.social.honor, "teal"], ["influence", "Influence", "บารมี", game.character.social.influence, "ochre"], ["stain", "Stain", "ข้อครหา", game.character.social.stain, "vermilion"]];
  const traitRows = STATS.map((stat) => {
    const level = game.character.attributes[stat.id];
    const progress = game.character.statXp[stat.id];
    return { ...stat, level, progress, details: traitLevelDetails(level), needed: traitProgressNeededForLevel(level) };
  });
  return <div className="page character-view">
    <div className="page-heading"><div><SectionKicker>CHARACTER DOSSIER</SectionKicker><h1>{game.character.name}</h1><p>{game.character.occupation} · {game.character.origin}</p></div><div className="character-view__links"><GhostLink onClick={() => open("relationships")}>{label(language, "People you know", "ผู้คนที่เจ้ารู้จัก")}</GhostLink><GhostLink onClick={() => open("log")}>{label(language, "Open this campaign's Chronicle", "เปิดจดหมายเหตุของแคมเปญนี้")}</GhostLink></div></div>
    <section className="dossier-header"><div className="dossier-name"><span className="mon-avatar mon-avatar--large">火</span><div><h2>{game.character.name}</h2><p>{game.character.strength}</p></div></div><div className="dossier-resources"><span>{label(language, "Wounds", "บาดแผล")}<strong>{game.character.vitals.wounds}/6</strong></span><span>{label(language, "Focus", "ค่าสติ")}<strong>{game.character.vitals.focus}/6</strong></span><span>{label(language, "Trait cap", "เพดาน Trait")}<strong>10</strong></span><span>{label(language, "Rank", "ยศ")}<strong>{game.character.social.rank}</strong></span></div></section>
    <CampaignLedgerStrip game={game} language={language} />
    <div className="character-columns"><section><div className="tab-strip">{(["traits", "masteries", "inventory", "ties"] as const).map((entry) => <button key={entry} className={tab === entry ? "active" : ""} onClick={() => setTab(entry)}>{label(language, entry === "traits" ? "Traits" : entry === "masteries" ? "Masteries" : entry === "inventory" ? "Gear" : "Background", entry === "traits" ? "คุณลักษณะ" : entry === "masteries" ? "ความชำนาญ" : entry === "inventory" ? "สัมภาระ" : "ภูมิหลังตัวละคร")}</button>)}</div>
      {tab === "traits" && <><div className="stat-grid">{traitRows.map((trait) => <div className="stat-cell" key={trait.id}><SengokuIcon name="memory" tone="navy" /><strong>{language === "en" ? trait.en : trait.th}</strong><b>{trait.level}</b><small>{localized(language, trait.hint)}</small><button>{label(language, `Level ${trait.level} · +${trait.level} directly on matching rolls`, `Level ${trait.level} · บวก +${trait.level} ตรงเมื่อใช้แนวทางนี้`)}</button></div>)}</div><section className="stat-xp-ledger" aria-label={label(language, "Trait progression", "ความก้าวหน้า Trait")}><header className="stat-xp-ledger__header"><div><SectionKicker>{label(language, "TRAIT PROGRESSION", "ความก้าวหน้า Trait")}</SectionKicker><h2>{label(language, "Who the character becomes", "ตัวละครเติบโตเป็นคนแบบไหน")}</h2><p>{label(language, "Traits grow from Level 1 to 10. A relevant ordinary roll at DN 12 or higher grants 1 Progress; a decisive success grants 2. DN 8 and specialized-item passes grant none.", "Traits เติบโตจาก Level 1 ถึง 10 งานปกติที่ใช้ Trait ตรงและ DN ตั้งแต่ 12 ให้ 1 Progress; สำเร็จเด็ดขาดให้ 2. DN 8 และการผ่านด้วยไอเทมเฉพาะทางไม่ให้ Progress")}</p></div><span className="stat-xp-ledger__key">{label(language, "Trait bonus equals its Level", "โบนัส Trait เท่ากับ Level")}</span></header><div className="mastery-list">{traitRows.map((trait) => <div className="mastery-row" key={`progress-${trait.id}`}><span><SengokuIcon name="memory" size={15} tone="navy" />{language === "en" ? trait.en : trait.th}</span><strong>{label(language, "Level", "ระดับ")} {trait.level} · +{trait.level}</strong><small>{language === "en" ? trait.details.en : trait.details.th} · {trait.needed === 0 ? label(language, "Level 10 reached", "ถึง Level 10 แล้ว") : `${trait.progress?.xp ?? 0}/${trait.needed} Progress`}<br />{language === "en" ? trait.details.note : trait.details.note}</small></div>)}</div></section></>}
      {tab === "masteries" && <div className="mastery-list"><div className="list-title"><span>{label(language, "Mastery", "ความชำนาญ")}</span><span>{label(language, "Level & bonus", "ระดับและโบนัส")}</span><span>{label(language, "Progress record", "บันทึกความก้าวหน้า")}</span></div>{game.character.masteries.map((entry) => { const details = masteryLevelDetails(entry.level); const needed = xpNeededForMasteryLevel(entry.level); return <div className="mastery-row" key={entry.id}><span><SengokuIcon name="memory" size={15} tone="ochre" />{localized(language, entry.label)}</span><strong>{label(language, "Level", "ระดับ")} {entry.level} · +{entry.level}</strong><small>{localized(language, entry.origin)}<br />{language === "en" ? details.en : details.th} · {needed === 0 ? label(language, "Peerless", "หาตัวจับไม่ได้") : `${entry.xp ?? 0}/${needed} Progress`}</small></div>; })}</div>}
      {tab === "inventory" && <div className="inventory-sheet"><div className="inventory-capacity"><span>{label(language, "Carried slots", "ช่องสัมภาระ")}</span><strong>{usedSlots}/8</strong></div>{game.character.inventory.map((entry) => <article key={entry.id}><div><strong>{localized(language, entry.label)}</strong><small>{localized(language, entry.description)}</small></div><span>{titleCase(entry.kind)}</span><b>{entry.slots} {label(language, "slot", "ช่อง")}</b></article>)}</div>}
      {tab === "ties" && <div className="ties-sheet">{game.character.pulls.map((pull) => <article key={pull.id}><small>{pull.question}</small><strong>{pull.answer}</strong><span>{pull.tags.join(" · ")}</span></article>)}</div>}
    </section><aside className="status-rail"><SectionKicker>{label(language, "Social record", "สถานะทางสังคม")}</SectionKicker>{socialRows.map(([field, en, th, value, tone]) => <div className={`status-row status-row--${tone}`} key={field}><span className="status-dot" /><strong>{language === "en" ? en : th}</strong><small title={`${value} / ${label(language, "cap", "เพดาน")} ${field === "influence" ? 4 : 5}`}>{socialTierLabel(language, field, value)}</small></div>)}<div className="status-note"><SengokuIcon name="relation" tone="teal" />{label(language, "Social values do not grant automatic obedience. They describe access, attention, and what failure can cost.", "ค่าสถานะสังคมไม่ได้ทำให้ใครเชื่อฟังอัตโนมัติ แต่บอกสิทธิ์เข้าถึง สายตาที่จับจ้อง และราคาของความพลาด")}</div></aside></div>
  </div>;
}

export function campaignRewardContext(game: GameState, language: Language) {
  const lastReward = game.rolls.slice().reverse().find((roll) => roll.reward)?.reward;
  const resolvedReward = game.missions.slice().reverse().find((mission) => mission.state === "resolved")?.reward;
  const reward = lastReward ?? resolvedReward;
  return reward ? label(language, `Latest reward context: ${reward}`, `รางวัลล่าสุด: ${reward}`) : label(language, "No reward has entered the campaign record yet.", "ยังไม่มีรางวัลเข้าสมุดแคมเปญ");
}

export function campaignStepXpContext(game: GameState, language: Language) {
  const leading = game.character.masteries.reduce((best, mastery) => mastery.level > best.level ? mastery : best, game.character.masteries[0]);
  if (!leading) return "—";
  if (leading.level >= 5) return label(language, `${leading.label}: peerless`, `${leading.label}: หาตัวจับไม่ได้`);
  return `${leading.label}: ${leading.xp ?? 0}/${xpNeededForMasteryLevel(leading.level)} Progress`;
}

function CampaignLedgerStrip({ game, language }: { game: GameState; language: Language }) {
  const highestMastery = game.character.masteries.reduce((highest, mastery) => Math.max(highest, mastery.level), 0);
  const openObligations = game.economy?.obligations.filter((entry) => entry.status === "open" || entry.status === "called_in").length ?? 0;
  return <><section className="campaign-ledger-strip" aria-label={label(language, "Campaign ledger summary", "สรุปสมุดแคมเปญ")}><span><small>{label(language, "PAGE", "หน้าเรื่อง")}</small><b>{game.progression?.leaf ?? game.tick}</b></span><span><small>{label(language, "CAMPAIGN DAY", "วันในแคมเปญ")}</small><b>{game.campaign.day}</b></span><span><small>{label(language, "AGE", "อายุ")}</small><b>{game.progression?.currentAge ?? "—"}</b></span><span><small>{label(language, "HIGHEST MASTERY", "Mastery สูงสุด")}</small><b>{highestMastery}/5</b></span><span><small>{label(language, "NEXT PROGRESS", "ความก้าวหน้าถัดไป")}</small><b>{campaignStepXpContext(game, language)}</b></span><span><small>{label(language, "OPEN AGREEMENTS", "สัญญาค้าง")}</small><b>{openObligations}</b></span></section><p className="campaign-reward-ribbon" data-testid="campaign-reward-context"><span>{label(language, "REWARD CONTEXT", "สรุปรางวัลล่าสุด")}</span>{campaignRewardContext(game, language)}</p></>;
}

function ArchiveView({ game, language }: { game: GameState; language: Language }) {
  return <div className="page archive-view"><div className="page-heading"><div><SectionKicker>WORLD ARCHIVE · VISIBLE KNOWLEDGE</SectionKicker><h1>{label(language, "The world is more than the current scene", "โลกมีมากกว่าฉากตรงหน้า")}</h1><p>{label(language, "This archive only projects people, conditions, and memories that the local campaign has already made visible.", "คลังนี้แสดงเฉพาะผู้คน สภาวะ และความทรงจำที่แคมเปญในเครื่องได้เปิดให้เห็นแล้ว")}</p></div></div><section className="archive-summary"><div><strong>{game.currentScene.location}</strong><p>{game.currentScene.pressure}</p></div><span>{label(language, "War shadow", "เงาสงคราม")} · {game.campaign.warShadow}/6</span></section><section className="archive-grid"><ArchiveCard icon="relation" title={label(language, "People who matter", "ผู้คนที่เกี่ยวข้อง")} note={`${game.currentScene.speaker} · ${game.missions[0]?.issuer ?? "—"}`} /><ArchiveCard icon="compass" title={label(language, "Mission pressure", "แรงกดดันภารกิจ")} note={game.missions[0]?.pressure ?? "—"} /><ArchiveCard icon="memory" title={label(language, "World memories", "ความทรงจำโลก")} note={`${game.memories.length} ${label(language, "visible records", "รายการที่มองเห็น")}`} /><ArchiveCard icon="credit" title={label(language, "Community condition", "สภาพชุมชน")} note={`${label(language, "Food", "เสบียง")} ${game.community.food}/6 · ${label(language, "Safety", "ความปลอดภัย")} ${game.community.safety}/6`} /></section><section className="memory-ledger"><SectionKicker>{label(language, "RECENT MEMORIES", "ความทรงจำล่าสุด")}</SectionKicker>{game.memories.slice(-5).reverse().map((memory) => <article key={memory.id}><span className={`state-pill state-pill--${memory.tone}`}>{memory.kind}</span><div><strong>{memory.title}</strong><p>{memory.detail}</p></div></article>)}</section></div>;
}

function ArchiveCard({ icon, title, note }: { icon: SengokuIconName; title: string; note: string }) { return <article data-testid="archive-record" className="archive-card" style={{ transform: "none", transition: "none", borderColor: "var(--rule)", cursor: "default" }}><SengokuIcon name={icon} tone="navy" /><div><h2>{title}</h2><p>{note}</p></div></article>; }

function SaveView({ game, saves, language, onSave, onDelete, open }: { game: GameState; saves: SaveLeaves; language: Language; onSave: (slot: keyof SaveLeaves) => void; onDelete: (slot: keyof SaveLeaves) => void; open: (page: PageId) => void }) {
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>SAVE GAME · LOCAL ONLY</SectionKicker><h1>{label(language, "Save the leaf before it turns", "บันทึกก่อนเรื่องจะเดินต่อ")}</h1><p>{label(language, "Auto Save follows the current campaign state. Manual leaves are snapshots you choose to keep in this browser.", "Auto Save ตามสถานะแคมเปญปัจจุบัน ส่วนบันทึกด้วยมือคือภาพจำของจุดที่เจ้าเลือกเก็บไว้ในเบราว์เซอร์นี้")}</p></div><GhostLink onClick={() => open("play")}>{label(language, "Return to scene", "กลับไปยังฉาก")}</GhostLink></div><CampaignLedgerStrip game={game} language={language} /><div className="save-management"><SaveRow icon="memory" tone="teal" title="AUTO SAVE" game={game} note={label(language, "Always updated after a campaign change", "อัปเดตทุกครั้งเมื่อสถานะแคมเปญเปลี่ยน")} locked /><SaveRow icon="log" tone="ochre" title="MANUAL SAVE" game={saves.manual} note={label(language, "Overwrite this leaf when you choose", "เขียนทับช่องนี้เมื่อเจ้าต้องการ")} action={() => onSave("manual")} onDelete={() => onDelete("manual")} /><SaveRow icon="document" tone="navy" title="SAVED PAGE II" game={saves.leaf2} note={label(language, "A second local checkpoint", "จุดเซฟท้องถิ่นอีกหนึ่งจุด")} action={() => onSave("leaf2")} onDelete={() => onDelete("leaf2")} /><SaveRow icon="document" tone="navy" title="SAVED PAGE III" game={saves.leaf3} note={label(language, "A third local checkpoint", "จุดเซฟท้องถิ่นอีกหนึ่งจุด")} action={() => onSave("leaf3")} onDelete={() => onDelete("leaf3")} /></div></div>;
}

function DeleteSaveButton({ onDelete }: { onDelete: () => void }) { const [armed, setArmed] = useState(false); return <Button className={`df-button df-button--delete ${armed ? "is-armed" : ""}`} onClick={() => armed ? onDelete() : setArmed(true)}>{armed ? "CONFIRM DELETE" : "DELETE"}</Button>; }

function SaveRow({ icon, tone, title, game, note, action, onDelete, locked }: { icon: SengokuIconName; tone: "teal" | "ochre" | "navy"; title: string; game: GameState | null; note: string; action?: () => void; onDelete?: () => void; locked?: boolean }) { return <article className={`save-slot save-slot--${tone === "teal" ? "auto" : tone === "ochre" ? "manual" : "new"}`}><SengokuIcon name={icon} size={23} tone={tone} /><div><small>{title} · {game ? `PAGE ${game.tick}` : "EMPTY"}</small><h2>{game?.campaign.title ?? "—"}</h2><p>{note}</p></div>{locked ? <span className="save-lock">AUTO</span> : <div className="save-slot__actions"><Button className="df-button df-button--ghost" onClick={action}>{game ? "OVERWRITE" : "SAVE HERE"}</Button>{game && onDelete && <DeleteSaveButton onDelete={onDelete} />}</div>}</article>; }

function LoadView({ game, saves, language, onLoad, onDelete }: { game: GameState; saves: SaveLeaves; language: Language; onLoad: (slot: "auto" | keyof SaveLeaves) => void; onDelete: (slot: keyof SaveLeaves) => void }) {
  const slots: { id: "auto" | keyof SaveLeaves; label: string; data: GameState | null; tone: "teal" | "ochre" | "navy" }[] = [{ id: "auto", label: "AUTO SAVE", data: game, tone: "teal" }, { id: "manual", label: "MANUAL SAVE", data: saves.manual, tone: "ochre" }, { id: "leaf2", label: "SAVED PAGE II", data: saves.leaf2, tone: "navy" }, { id: "leaf3", label: "SAVED PAGE III", data: saves.leaf3, tone: "navy" }];
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>LOAD GAME · THIS BROWSER</SectionKicker><h1>{label(language, "Load a local game", "โหลดเกมที่บันทึกไว้")}</h1><p>{label(language, "Choose a record from this browser. Loading replaces the active local campaign state; the stored record remains available for another return. Manual slots require a second click to delete.", "เลือกบันทึกจากเบราว์เซอร์นี้ การโหลดจะแทนสถานะแคมเปญปัจจุบัน แต่ไฟล์บันทึกเดิมยังอยู่ให้กลับมาใช้ได้อีก ช่องเซฟด้วยมือต้องกดยืนยันลบครั้งที่สอง")}</p></div></div><CampaignLedgerStrip game={game} language={language} /><div className="save-slots">{slots.map((slot) => <article className={`save-slot save-slot--${slot.tone === "teal" ? "auto" : slot.tone === "ochre" ? "manual" : "new"}`} key={slot.id}><SengokuIcon name="document" size={23} tone={slot.tone} /><div><small>{slot.label} · {slot.data ? `PAGE ${slot.data.progression?.leaf ?? slot.data.tick}` : "EMPTY"}</small><h2>{slot.data?.campaign.title ?? "—"}</h2><p>{slot.data ? `${slot.data.character.name} · ${slot.data.currentScene.title}` : label(language, "No local record in this slot", "ยังไม่มีบันทึกในช่องนี้")}</p></div><div className="save-slot__actions"><Button className="df-button df-button--ghost" disabled={!slot.data} onClick={() => onLoad(slot.id)}>LOAD <ArrowRight size={16} /></Button>{slot.id !== "auto" && slot.data && <DeleteSaveButton onDelete={() => onDelete(slot.id as keyof SaveLeaves)} />}</div></article>)}</div></div>;
}

function SettingsView({ language, setLanguage, darkMode, setDarkMode, fontSize, setFontSize, accent, setAccent, readerMode, setReaderMode, onReset }: { language: Language; setLanguage: (value: Language) => void; darkMode: boolean; setDarkMode: (value: boolean) => void; fontSize: FontSize; setFontSize: (value: FontSize) => void; accent: Accent; setAccent: (value: Accent) => void; readerMode: boolean; setReaderMode: (value: boolean) => void; onReset: () => void }) {
  return <div className="page settings-view"><div className="page-heading"><div><SectionKicker>SETTINGS · THIS BROWSER</SectionKicker><h1>{label(language, "Set the reading room", "จัดหน้ากระดาษให้อ่านสบาย")}</h1><p>{label(language, "Appearance changes do not alter campaign rules. Local Save remains the primary storage for this version.", "การปรับหน้าตาไม่เปลี่ยนกติกาแคมเปญ และเวอร์ชันนี้ใช้ Local Save เป็นที่เก็บข้อมูลหลัก")}</p></div></div><section className="settings-sheet"><SettingRow icon="settings" title={label(language, "Appearance", "โหมดสี")} note={label(language, "Paper by day, ink by night", "กระดาษในกลางวัน หมึกในยามค่ำ")}><Switch checked={darkMode} onCheckedChange={setDarkMode} /></SettingRow><SettingRow icon="document" title={label(language, "Text size", "ขนาดตัวอักษร")} note={label(language, "Change the reading scale", "ปรับขนาดเพื่อการอ่าน") }><div className="segmented">{(["small", "normal", "large"] as FontSize[]).map((size) => <button key={size} className={fontSize === size ? "active" : ""} onClick={() => setFontSize(size)}>{size}</button>)}</div></SettingRow><SettingRow icon="icon" title={label(language, "Seal accent", "สีตราเน้น")} note={label(language, "A personal mark on the ledger", "เครื่องหมายส่วนตัวบนสมุดบัญชี")}><div className="color-options">{(["vermilion", "ochre", "teal"] as Accent[]).map((color) => <button aria-label={color} key={color} className={`color-dot color-dot--${color} ${accent === color ? "active" : ""}`} onClick={() => setAccent(color)} />)}</div></SettingRow><SettingRow icon="log" title="Reader Mode" note={label(language, "Open Campaign Log as continuous prose", "เปิดบันทึกเรื่องราวเป็นโหมดอ่านต่อเนื่อง")}><Switch checked={readerMode} onCheckedChange={setReaderMode} /></SettingRow><SettingRow icon="document" title={label(language, "Language", "ภาษา")} note={label(language, "English is the primary UI language; Thai is a complete alternate mode.", "อังกฤษเป็นภาษาหลักของ UI และไทยเป็นโหมดภาษาที่สอง") }><div className="segmented"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div></SettingRow><SettingRow icon="archive" title={label(language, "Clear Local Save", "ล้าง Local Save")} note={label(language, "This removes the campaign and all local leaves from this browser.", "ลบแคมเปญและจุดเซฟท้องถิ่นทั้งหมดในเบราว์เซอร์นี้") }><Button className="df-button df-button--ghost" onClick={onReset}><RotateCcw size={16} /> RESET</Button></SettingRow></section></div>;
}

function SettingRow({ icon, title, note, children }: { icon: SengokuIconName; title: string; note: string; children: React.ReactNode }) { return <div className="setting-row"><div><SengokuIcon name={icon} tone="navy" /><strong>{title}</strong><small>{note}</small></div><div className="setting-value">{children}</div></div>; }
