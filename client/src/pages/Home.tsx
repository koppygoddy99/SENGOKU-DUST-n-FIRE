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
import { CampaignsView } from "@/pages/CampaignsView";
import { MarketHub } from "@/pages/MarketHub";
import { StoryMap } from "@/features/story/StoryMap";
import { PlayScene } from "@/features/play/PlayScene";
import { ChronicleView } from "@/features/chronicle/ChronicleView";
import { gmUnavailableLocalTrialNotice, historicalStatusLabel, openLocalPreview, saveLocalTrialResult, shouldFetchProfileCredits, shouldUseLocalRules, splitStoryParagraphs, withHistoricalBoundary } from "@/features/shared/gameplayHelpers";
import { reviewPageFromSearch, reviewScreenFor, type PlayerPageId } from "@/lib/playerRoutes";
import { buildReviewSeed } from "@/lib/reviewSeeds";
export { ChronicleView as LogView } from "@/features/chronicle/ChronicleView";
export { gmUnavailableLocalTrialNotice, historicalStatusLabel, openLocalPreview, saveLocalTrialResult, shouldFetchProfileCredits, shouldUseLocalRules, splitStoryParagraphs, withHistoricalBoundary } from "@/features/shared/gameplayHelpers";
import {
  AXES,
  RELATIONSHIP_QUESTIONS,
  STARTER_TEMPLATES,
  applyRoll,
  buyMarketOffer,
  createSaikaSafehouseDemo,
  createGameState,
  masteryTierForRank,
  normalizeGameState,
  parseAction,
  resolveRoll,
  xpNeededForRank,
  type CharacterDraft,
  type GameState,
  type RollPreview,
  type Season,
} from "@/lib/game";

export type PageId = PlayerPageId;
type Language = "en" | "th";
type FontSize = "small" | "normal" | "large";
type Accent = "vermilion" | "ochre" | "teal";
type SaveLeaves = { manual: GameState | null; leaf2: GameState | null; leaf3: GameState | null };
export type ManagementMenuItem = { id: string; en: string; th: string; state: "ready" | "planned"; href?: string };

export function managementMenuFor(isAdmin: boolean): { id: string; en: string; th: string; items: ManagementMenuItem[] }[] {
  return [
    { id: "account", en: "Account", th: "บัญชี", items: [
      { id: "profile", en: "Profile", th: "โปรไฟล์", state: "planned" },
      { id: "usage", en: "Plan & usage", th: "แพ็กเกจและการใช้งาน", state: "planned" },
      { id: "billing", en: "Billing & invoices", th: "การเรียกเก็บเงินและใบเสร็จ", state: "planned" },
    ] },
    { id: "workspace", en: "Workspace", th: "พื้นที่จัดการ", items: [
      { id: "app-settings", en: "Application settings", th: "การตั้งค่าแอป", state: "planned" },
      { id: "access", en: "Access & roles", th: "สิทธิ์และบทบาท", state: "planned" },
      { id: "analytics", en: "Analytics & visits", th: "สถิติและผู้เข้าชม", state: isAdmin ? "ready" : "planned", href: isAdmin ? "/admin/operations" : undefined },
      { id: "admin", en: "Admin Console", th: "คอนโซลผู้ดูแล", state: isAdmin ? "ready" : "planned", href: isAdmin ? "/admin" : undefined },
    ] },
    { id: "resources", en: "Resources", th: "ทรัพยากร", items: [
      { id: "guides", en: "Guides & support", th: "คู่มือและความช่วยเหลือ", state: "planned" },
      { id: "privacy", en: "Privacy & terms", th: "ความเป็นส่วนตัวและข้อกำหนด", state: "planned" },
    ] },
  ];
}

const STORAGE_KEY = "dust-fire-local-game-v3-saika";
const LEGACY_STORAGE_KEYS = ["dust-fire-local-game-v1", "dust-fire-local-game-v2"];
const seasons: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
const seasonThai: Record<Season, string> = { Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" };
const regionOptions = ["Mikawa", "Omi", "Owari", "Sakai", "Izumi", "Iga", "Koga", "Kii", "Yamashiro", "Settsu", "Musashi", "Iyo", "Shima"];
const mapReviewRegions = [...regionOptions, "Shinano", "Kaga"] as const;

const seedDraft: CharacterDraft = { name: "ผู้ไร้นาม", identity: "ผู้เล่นกำหนด", templateId: "ronin", freeformOccupation: "", origin: "เส้นทางชายแดน", strength: "อ่านทางหนีและอันตรายได้ไว", weakness: "มีหนี้ที่ยังไม่กล้าพูดถึง", answers: {} };

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
  const mission = game.missions.find((entry) => entry.state === "active" || entry.state === "offered");
  return {
    campaign: game.campaign,
    character: {
      name: game.character.name,
      occupation: game.character.occupation,
      origin: game.character.origin,
      strengths: game.character.strength,
      weakness: game.character.weakness,
      attributes: game.character.attributes,
      masteries: game.character.masteries.map((entry) => ({ name: entry.label, level: entry.level, source: entry.origin })),
    },
    currentScene: {
      title: game.currentScene.title,
      location: game.currentScene.location,
      summary: game.currentScene.body.join("\n\n"),
      pressure: game.currentScene.pressure,
      declaredChoices: game.currentScene.suggestedActions,
    },
    activeMission: mission ? { title: mission.title, giver: mission.issuer, objective: mission.request, deadline: mission.deadline, reward: mission.reward } : undefined,
    socialState: {
      honor: game.character.social.honor,
      influence: game.character.social.influence,
      stain: game.character.social.stain,
      rumors: game.memories.filter((entry) => entry.kind === "news").slice(-4).map((entry) => entry.detail),
      oaths: game.memories.filter((entry) => entry.kind === "oath").slice(-4).map((entry) => entry.detail),
      debts: game.memories.filter((entry) => entry.kind === "debt").slice(-4).map((entry) => entry.detail),
    },
    recentMemories: game.memories.slice(-8).map((entry) => ({ title: entry.title, detail: entry.detail, tone: entry.tone })),
  };
}

type CampaignNavItem = { id: PageId; en: string; th: string; icon: SengokuIconName };
type CampaignNavGroup = { id: "story" | "prepare" | "chronicle" | "more"; en: string; th: string; icon: SengokuIconName; items: CampaignNavItem[] };

const campaignNavGroups: CampaignNavGroup[] = [
  { id: "story", en: "Story", th: "เรื่องราว", icon: "sword", items: [
    { id: "home", en: "Campaign Command", th: "บัญชาการแคมเปญ", icon: "archive" },
    { id: "play", en: "Play Scene", th: "เล่นฉาก", icon: "sword" },
    { id: "missions", en: "Missions", th: "ภารกิจ", icon: "compass" },
  ] },
  { id: "prepare", en: "Prepare", th: "เตรียมตัว", icon: "credit", items: [
    { id: "character", en: "Character Dossier", th: "แฟ้มตัวละคร", icon: "character" },
    { id: "gear", en: "Carried Gear", th: "สัมภาระที่พก", icon: "character" },
    { id: "market", en: "This Market", th: "ตลาดพื้นที่นี้", icon: "credit" },
    { id: "services", en: "Services & Hands", th: "บริการและคนรับจ้าง", icon: "relation" },
    { id: "obligations", en: "Debts & Favors", th: "หนี้และบุญคุณ", icon: "memory" },
    { id: "exchanges", en: "Agreements & Consequences", th: "สมุดสัญญาและผลประโยชน์", icon: "log" },
  ] },
  { id: "chronicle", en: "Chronicle", th: "พงศาวดาร", icon: "log", items: [
    { id: "campaigns", en: "Campaign Library", th: "หอแคมเปญ", icon: "archive" },
    { id: "log", en: "Chronicle", th: "บันทึกเรื่องราว", icon: "log" },
    { id: "archive", en: "World Archive", th: "คลังโลก", icon: "archive" },
  ] },
  { id: "more", en: "More", th: "อื่น ๆ", icon: "settings", items: [
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
  const { user, loading, isAuthenticated } = useAuth();
  const uiPreviewMode = forceUiPreviewMode ?? true;
  const accountCredits = trpc.profile.credits.useQuery(undefined, { enabled: shouldFetchProfileCredits(uiPreviewMode, isAuthenticated), retry: false });

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(reviewRailCollapsedFromUrl);
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(true);
  const [notice, setNotice] = useState("Local Save active · this campaign stays in this browser");
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
    if (!shouldFetchProfileCredits(uiPreviewMode, isAuthenticated) || typeof credits !== "number") return;
    setGame((current) => current.credits === credits ? current : { ...current, credits });
  }, [accountCredits.data?.credits, isAuthenticated]);

  const appClass = ["app-shell", darkMode ? "theme-dark" : "", `font-${fontSize}`, `accent-${accent}`, sidebarCollapsed ? "sidebar-collapsed" : "", reviewRoute ? "app-shell--review" : ""].join(" ");
  const updateGame = (next: GameState, message: string) => { setGame(next); setCampaignLibrary((current) => ({ ...current, [next.campaign.id]: copyState(next) })); setNotice(message); };
  const open = (nextPage: PageId) => { setCampaignMenuOpen(true); setPage(nextPage); setMenuOpen(false); };
  const beginNew = (nextGame: GameState) => { setGame(nextGame); setCampaignLibrary((current) => ({ ...current, [nextGame.campaign.id]: copyState(nextGame) })); setSaves({ manual: null, leaf2: null, leaf3: null }); setNotice("A new campaign has begun · 50 trial credits are ready"); open("play"); };
  const selectCampaign = (selected: GameState) => { const copy = copyState(selected); setGame(copy); setSaves((current) => ({ ...current, manual: copyState(copy) })); setNotice(`${copy.campaign.title} selected · Local Save restored at Leaf ${copy.tick}`); open("play"); };
  const writeSave = (slot: keyof SaveLeaves) => { setSaves((current) => ({ ...current, [slot]: copyState(game) })); setNotice(`${slot === "manual" ? "Manual Save" : slot === "leaf2" ? "Saved Leaf II" : "Saved Leaf III"} written at Leaf ${game.tick}`); };
  const loadSave = (slot: "auto" | keyof SaveLeaves) => {
    const source = slot === "auto" ? game : saves[slot];
    if (!source) { setNotice("This leaf is still blank"); return; }
    setGame(copyState(source)); setNotice(`${slot === "auto" ? "Auto Save" : "Saved leaf"} restored at Leaf ${source.tick}`); open("play");
  };
  const resetLocal = () => { const demo = seedGame(); window.localStorage.removeItem(STORAGE_KEY); setGame(demo); setSaves({ manual: copyState(demo), leaf2: null, leaf3: null }); setCampaignLibrary({ [demo.campaign.id]: copyState(demo) }); setNotice("Local records cleared · Saika safehouse example is ready"); };

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
    {managementOpen && <><button className="management-menu__backdrop" aria-label={label(language, "Close management menu", "ปิดเมนูจัดการ")} onClick={() => setManagementOpen(false)} /><ManagementMenu language={language} isAdmin={!uiPreviewMode && user?.role === "admin"} onClose={() => setManagementOpen(false)} /></>}
    <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""} ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
      <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar">{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
      <div className="sidebar__identity"><div className="mon-avatar">火</div><div className="sidebar__identity-copy"><strong>{game.character.name}</strong><span>{game.character.occupation}</span></div></div>
      <nav className="nav-list" aria-label="Game navigation"><CampaignNavigation campaignTitle={game.campaign.title} language={language} page={page} expanded={campaignMenuOpen} onToggle={() => setCampaignMenuOpen((value) => !value)} onOpen={open} /></nav>
      <div className="sidebar__vitals">
        <Vital label={label(language, "Wounds", "บาดแผล")} value={`${game.character.vitals.wounds}/6`} percent={(game.character.vitals.wounds / 6) * 100} tone="red" />
        <Vital label={label(language, "Focus", "ค่าสติ")} value={`${game.character.vitals.focus}/6`} percent={(game.character.vitals.focus / 6) * 100} tone="ochre" />
        <Vital label={label(language, "Momentum", "แรงฮึด")} value={`${game.character.vitals.momentum}/2`} percent={(game.character.vitals.momentum / 2) * 100} tone="teal" />
      </div>
      <div className="sidebar__states"><small>{label(language, "What the world remembers", "สิ่งที่โลกจดจำ")}</small>{game.memories.slice(-3).reverse().map((memory) => <span className={`state-pill state-pill--${memory.tone}`} key={memory.id}>{memory.title}</span>)}</div>
      <div className="sidebar__language"><Languages size={15} /><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><span>/</span><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div>
      <div className="sidebar__notice">{notice}</div>
    </aside>
    <main data-testid="player-main-content" className={`main-content ${page === "play" ? "main-content--play" : ""}`} data-review-screen={reviewScreen?.screenshotFile} data-review-seed={reviewScreen?.seed} data-review-title={reviewScreen?.pageTitle}>
      {page === "home" && <StoryMap game={game} language={language} onOpen={open} />}
      {page === "campaigns" && <CampaignsView campaigns={Object.values(campaignLibrary)} activeId={game.campaign.id} language={language} onSelect={selectCampaign} onNew={() => open("start")} />}
      {page === "start" && <StartView language={language} onStart={beginNew} />}
      {page === "play" && <PlayScene game={game} language={language} onOpen={open} onUpdate={updateGame} isAuthenticated={isAuthenticated} uiPreviewMode={uiPreviewMode} onLogin={startLogin} onAccountCreditChange={() => accountCredits.refetch()} />}
      {page === "missions" && <MissionsView game={game} language={language} />}
      {page === "market" && <MarketHub game={game} language={language} onUpdate={updateGame} initialTab="market" />}
      {page === "localmarket" && <MarketHub game={game} language={language} onUpdate={updateGame} initialTab="market" />}
      {page === "gear" && <MarketHub game={game} language={language} onUpdate={updateGame} initialTab="gear" />}
      {page === "services" && <MarketHub game={game} language={language} onUpdate={updateGame} initialTab="services" />}
      {page === "obligations" && <MarketHub game={game} language={language} onUpdate={updateGame} initialTab="obligations" />}
      {page === "exchanges" && <MarketHub game={game} language={language} onUpdate={updateGame} initialTab="history" />}
      {page === "character" && <CharacterView game={game} language={language} open={open} />}
      {page === "log" && <ChronicleView game={game} language={language} readerMode={readerMode} setReaderMode={setReaderMode} />}
      {page === "archive" && <ArchiveView game={game} language={language} />}
      {page === "save" && <SaveView game={game} saves={saves} language={language} onSave={writeSave} open={open} />}
      {page === "load" && <LoadView game={game} saves={saves} language={language} onLoad={loadSave} />}
      {page === "settings" && <SettingsView language={language} setLanguage={setLanguage} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} accent={accent} setAccent={setAccent} readerMode={readerMode} setReaderMode={setReaderMode} onReset={resetLocal} />}
    </main>
  </div>;
}

function ManagementMenu({ language, isAdmin, onClose }: { language: Language; isAdmin: boolean; onClose: () => void }) {
  return <aside id="management-menu" className="management-menu" role="dialog" aria-modal="true" aria-label={label(language, "Application management", "การจัดการแอปพลิเคชัน")}><div className="management-menu__heading"><div><SectionKicker>APPLICATION MANAGEMENT</SectionKicker><h2>{label(language, "Outside the campaign", "นอกเหนือจากแคมเปญ")}</h2><p>{label(language, "Account and studio controls stay here so the game table remains quiet.", "บัญชีและเครื่องมือดูแลอยู่ที่นี่ เพื่อให้โต๊ะเล่นเกมยังสงบ")}</p></div><button className="management-menu__close" onClick={onClose} aria-label={label(language, "Close management menu", "ปิดเมนูจัดการ")}><X size={18} /></button></div>{managementMenuFor(isAdmin).map((section) => <section className="management-menu__section" key={section.id}><h3>{label(language, section.en, section.th)}</h3>{section.items.map((item) => item.href ? <a className="management-menu__item management-menu__item--ready" href={item.href} key={item.id} onClick={onClose}><span>{label(language, item.en, item.th)}</span><ChevronRight size={15} /></a> : <div className="management-menu__item management-menu__item--planned" key={item.id}><span>{label(language, item.en, item.th)}</span><small>{label(language, "Planned", "กำลังเตรียม")}</small></div>)}</section>)}<div className="management-menu__footer"><SengokuIcon name="memory" size={15} tone="teal" /><span>{label(language, "Player records remain local to this browser.", "บันทึกผู้เล่นยังอยู่ในเบราว์เซอร์นี้เป็นหลัก")}</span></div></aside>;
}

function Vital({ label, value, percent, tone }: { label: string; value: string; percent: number; tone: "red" | "ochre" | "teal" }) {
  return <div className="vital"><span>{label}</span><strong>{value}</strong><i className={`bar bar--${tone}`}><b style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></i></div>;
}

function StartView({ language, onStart }: { language: Language; onStart: (game: GameState) => void }) {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState({ title: "A New Campaign", year: 1578, season: "Summer" as Season, region: "Mikawa", location: "ตลาดหน้าด่านใกล้เส้นทางน้ำ" });
  const [draft, setDraft] = useState<CharacterDraft>({ ...seedDraft, answers: { ...seedDraft.answers } });
  const template = STARTER_TEMPLATES.find((entry) => entry.id === draft.templateId) ?? STARTER_TEMPLATES[0];
  const updateDraft = <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateAnswer = (key: string, value: string) => setDraft((current) => ({ ...current, answers: { ...current.answers, [key]: value } }));
  const contextLooksUnusual = draft.templateId !== "freeform" && !template.compatibleRegions.includes(context.region);
  return <div className="page start-view">
    <div className="page-heading"><div><SectionKicker>NEW CAMPAIGN · STEP {step} OF 4</SectionKicker><h1>{["Set the campaign", "Choose a way to live", "Give the character a stake", "Confirm before the first leaf"][step - 1]}</h1><p>{label(language, "The game will create a local campaign with 50 trial credits. Nothing is sent to a server; this browser holds the record.", "เกมจะสร้างแคมเปญในเครื่องพร้อมเครดิตทดลอง 50 เครดิต ข้อมูลยังไม่ส่งไปยังเซิร์ฟเวอร์และเก็บอยู่ในเบราว์เซอร์นี้")}</p></div><div className="credit-box"><SengokuIcon name="credit" tone="ochre" /><span>{label(language, "Trial credits", "เครดิตทดลอง")}</span><strong>50</strong></div></div>
    <div className="start-layout"><ol className="step-rail">{["Campaign", "Starting path", "Character", "Confirmation"].map((entry, index) => <li key={entry} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-done" : ""}><span>{index + 1}</span><div><strong>{entry}</strong><small>{["time and place", "one of ten paths", "ties and strengths", "local save begins"][index]}</small></div></li>)}</ol>
      <section className="start-form">
        {step === 1 && <><label className="field-label">{label(language, "Campaign name", "ชื่อแคมเปญ")}<input value={context.title} onChange={(event) => setContext((current) => ({ ...current, title: event.target.value }))} /></label><div className="field-grid"><label className="field-label">{label(language, "Year", "ปี ค.ศ.")}<select value={context.year} onChange={(event) => setContext((current) => ({ ...current, year: Number(event.target.value) }))}>{[1566, 1575, 1578, 1580, 1590].map((year) => <option key={year} value={year}>{year}</option>)}</select></label><label className="field-label">{label(language, "Season", "ฤดูกาล")}<select value={context.season} onChange={(event) => setContext((current) => ({ ...current, season: event.target.value as Season }))}>{seasons.map((season) => <option key={season}>{season}</option>)}</select></label><label className="field-label">{label(language, "Region", "ภูมิภาค")}<select value={context.region} onChange={(event) => setContext((current) => ({ ...current, region: event.target.value }))}>{regionOptions.map((region) => <option key={region}>{region}</option>)}</select></label></div><label className="field-label field-label--spaced">{label(language, "Opening location", "สถานที่เริ่ม")}<input value={context.location} onChange={(event) => setContext((current) => ({ ...current, location: event.target.value }))} /></label><div className="context-check"><Check size={17} />{label(language, "Winter is available and will change market essentials in this local prototype. Historical facts and fictional play content stay separate in the record.", "เลือกฤดูหนาวได้ และฤดูจะเปลี่ยนของจำเป็นในตลาดของต้นแบบนี้ ข้อเท็จจริงทางประวัติศาสตร์กับเรื่องสมมติในเกมจะแยกกันในบันทึก")}</div><StepControls next={() => setStep(2)} /></>}
        {step === 2 && <><div className="choice-header"><strong>{label(language, "Pick a starting path", "เลือกอาชีพเริ่มต้น")}</strong><span>{label(language, "You may still write a freeform character", "ยังพิมพ์อาชีพอิสระได้")}</span></div><div className="template-grid">{STARTER_TEMPLATES.map((entry) => <button key={entry.id} className={`template-card ${draft.templateId === entry.id ? "is-selected" : ""}`} onClick={() => updateDraft("templateId", entry.id)}><span>{entry.id === draft.templateId ? "SELECTED" : "PATH"}</span><strong>{entry.label}</strong><small>{entry.short}</small><i>{entry.pressure}</i></button>)}</div><label className="field-label field-label--spaced"><span>{label(language, "Or write an occupation", "หรือพิมพ์อาชีพเอง")}</span><input value={draft.freeformOccupation} placeholder={label(language, "Leave empty to use the selected path", "เว้นว่างเพื่อใช้อาชีพที่เลือก")} onChange={(event) => { updateDraft("freeformOccupation", event.target.value); if (event.target.value) updateDraft("templateId", "freeform"); }} /></label>{contextLooksUnusual && <div className="context-check"><BookOpen size={17} />{label(language, "This path is normally associated with another region. The prototype records it as a background choice rather than rewriting history.", "อาชีพนี้มักสัมพันธ์กับภูมิภาคอื่น ต้นแบบจะบันทึกเป็นภูมิหลังของตัวละครแทนการปรับประวัติศาสตร์ให้เข้ากับตัวเลือก")}</div>}<StepControls previous={() => setStep(1)} next={() => setStep(3)} /></>}
        {step === 3 && <><div className="field-grid field-grid--two"><label className="field-label">{label(language, "Character name", "ชื่อตัวละคร")}<input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></label><label className="field-label">{label(language, "Identity", "เพศหรืออัตลักษณ์")}<input value={draft.identity} onChange={(event) => updateDraft("identity", event.target.value)} /></label></div><label className="field-label field-label--spaced">{label(language, "Origin", "ที่มา")}<input value={draft.origin} onChange={(event) => updateDraft("origin", event.target.value)} /></label><div className="field-grid field-grid--two"><label className="field-label">{label(language, "Strength", "จุดเด่น")}<input value={draft.strength} onChange={(event) => updateDraft("strength", event.target.value)} /></label><label className="field-label">{label(language, "Weakness", "จุดด้อย")}<input value={draft.weakness} onChange={(event) => updateDraft("weakness", event.target.value)} /></label></div><div className="relation-questions">{RELATIONSHIP_QUESTIONS.map(([id, question]) => <label className="field-label" key={id}><span>{question}</span><input value={draft.answers[id] ?? ""} onChange={(event) => updateAnswer(id, event.target.value)} /></label>)}</div><StepControls previous={() => setStep(2)} next={() => setStep(4)} /></>}
        {step === 4 && <><div className="campaign-review"><SectionKicker>LOCAL CAMPAIGN PREVIEW</SectionKicker><h2>{context.title || "Untitled Campaign"}</h2><p>{context.year} · {context.season} · {context.region}</p><hr /><strong>{draft.name || "ผู้ไร้นาม"}</strong><span>{draft.templateId === "freeform" ? draft.freeformOccupation || "ผู้เดินทางไร้สังกัด" : template.label}</span><small>{draft.origin || context.location}</small><div className="review-lines"><span>{label(language, "Strength", "จุดเด่น")}: {draft.strength || "—"}</span><span>{label(language, "Weakness", "จุดด้อย")}: {draft.weakness || "—"}</span></div></div><div className="mechanic-note"><SengokuIcon name="roll" tone="ochre" /><div><strong>{label(language, "The game will assign the five axes from the selected path", "เกมจะกำหนดแกนทอยห้าค่าจากอาชีพที่เลือก")}</strong><p>{label(language, "Players do not distribute numbers. Your occupation, history, items, relationships, and the scene decide what can help a roll.", "ผู้เล่นไม่แจกตัวเลขเอง อาชีพ ที่มา ไอเทม ความสัมพันธ์ และฉาก จะเป็นตัวกำหนดสิ่งที่ช่วยการทอยได้")}</p></div></div><StepControls previous={() => setStep(3)} nextLabel={label(language, "BEGIN WITH 50 CREDITS", "เริ่มเรื่องพร้อม 50 เครดิต")} next={() => onStart(createGameState({ id: `camp-${Date.now()}`, title: context.title || "Untitled Campaign", year: context.year, season: context.season, region: context.region, location: context.location || context.region, warShadow: 3, day: 1 }, draft))} /></>}
      </section>
      <aside className="historical-preview"><SectionKicker>WHAT THIS PROTOTYPE DOES</SectionKicker><h2>{context.year} · {language === "en" ? context.season : seasonThai[context.season]}</h2><div className="preview-row"><SengokuIcon name="history" tone="vermilion" />{label(language, "Shows a visible context label instead of presenting fictional NPCs as historical fact.", "แสดงป้ายบริบทที่เห็นได้ แทนการนำ NPC สมมติไปอ้างเป็นข้อเท็จจริง")}</div><div className="preview-row"><SengokuIcon name="roll" tone="ochre" />{label(language, "Uses the canonical 2d12 engine, five axes, mastery, context, and momentum.", "ใช้เครื่องยนต์ 2d12 แกนห้าค่า ความชำนาญ บริบท และแรงฮึด")}</div><div className="preview-row"><SengokuIcon name="log" tone="teal" />{label(language, "Stores the whole record locally in this browser first.", "เก็บบันทึกทั้งหมดไว้ในเบราว์เซอร์นี้ก่อน")}</div></aside>
    </div>
  </div>;
}

function StepControls({ previous, next, nextLabel }: { previous?: () => void; next: () => void; nextLabel?: string }) {
  return <div className="credit-confirm">{previous ? <Button className="df-button df-button--ghost" onClick={previous}><ArrowLeft size={17} /> Back</Button> : <span />}{nextLabel ? <Button className="df-button df-button--primary" onClick={next}>{nextLabel} <ArrowRight size={17} /></Button> : <Button className="df-button df-button--primary" onClick={next}>Continue <ArrowRight size={17} /></Button>}</div>;
}

function MissionsView({ game, language }: { game: GameState; language: Language }) {
  return <div className="page mission-view"><div className="page-heading"><div><SectionKicker>MISSION DOSSIER · LIVE THREADS</SectionKicker><h1>{label(language, "What the current story is pressing toward", "เรื่องที่กำลังกดดันอยู่")}</h1><p>{label(language, "This page records the work already moving through the scene. It changes when your decisions and rolls change the world; there is nothing to accept or complete here.", "หน้านี้บอกเพียงว่างานใดกำลังเคลื่อนอยู่ในฉาก มันจะเปลี่ยนเมื่อการตัดสินใจและผลทอยของเจ้าทำให้โลกเปลี่ยน ไม่มีปุ่มรับหรือกดจบภารกิจ")}</p></div></div><section className="mission-ledger">{game.missions.map((mission) => { const progress = mission.progress; return <article className={`mission-folio mission-folio--${mission.state}`} key={mission.id}><div className="folio-marker">{mission.state === "resolved" ? "✓" : mission.state === "active" ? "!" : "·"}</div><div><SectionKicker>{mission.issuerType.toUpperCase()} · {mission.state.toUpperCase()}</SectionKicker><h2>{mission.title}</h2><p>{mission.request}</p><div className="mission-meta"><span><b>{label(language, "Pressure", "แรงกดดัน")}</b>{mission.pressure}</span><span><b>{label(language, "Deadline", "เส้นตาย")}</b>{mission.deadline}</span><span><b>{label(language, "Reward when the story resolves", "รางวัลเมื่อเรื่องคลี่คลาย")}</b>{mission.reward}</span><span><b>{label(language, "Risk", "ความเสี่ยง")}</b>{mission.risk}</span></div>{progress && <div className="context-check"><SengokuIcon name="log" tone={mission.state === "resolved" ? "teal" : "ochre"} />{label(language, "Story movement:", "ความคืบหน้าในเรื่อง:")} {progress.current}/{progress.required} · {mission.state === "resolved" ? label(language, "The reward has entered the campaign record.", "รางวัลเข้าสู่บันทึกแคมเปญแล้ว") : label(language, "Keep playing the scene; relevant outcomes move this thread.", "เล่นฉากต่อไป ผลที่เกี่ยวข้องจะขยับเส้นเรื่องนี้เอง")}</div>}<div className="mission-options">{mission.options.map((option) => <span key={option}>{option}</span>)}</div></div></article>; })}</section></div>;
}

function MarketView({ game, language, onUpdate }: { game: GameState; language: Language; onUpdate: (next: GameState, message: string) => void }) {
  return <div className="page market-view"><div className="page-heading"><div><SectionKicker>MARKET · LOCAL OFFERS</SectionKicker><h1>{label(language, "A market is not a catalogue", "ตลาดไม่ใช่แคตตาล็อก")}</h1><p>{label(language, "The offerings are held in this campaign state. They do not refresh simply because you open this page.", "สินค้าเหล่านี้เก็บอยู่ในสถานะแคมเปญ และจะไม่สุ่มใหม่เพียงเพราะเจ้าเปิดหน้านี้")}</p></div><div className="resource-tally"><span>{label(language, "Property", "ทรัพย์สิน")}<b>{game.character.resources.property}</b></span><span>{label(language, "Supplies", "เสบียง")}<b>{game.character.resources.supplies}</b></span><span>{label(language, "Credit", "เครดิต") }<b>{game.character.resources.credit}</b></span></div></div><div className="market-reason"><SengokuIcon name="history" tone="ochre" />{label(language, `Seasonal offer: ${game.campaign.season}. Prices are illustrative local values shaped by the current route and war pressure.`, `ของตามฤดู: ${seasonThai[game.campaign.season]} ราคาเป็นค่าตัวอย่างในแคมเปญนี้ตามเส้นทางและแรงกดดันจากสงคราม`)}</div><section className="market-list">{game.market.map((offer) => <article className="market-row" key={offer.id}><div><SectionKicker>{offer.kind.toUpperCase()}</SectionKicker><h2>{offer.label}</h2><p>{offer.note}</p></div><span className="market-cost">{offer.price} <small>{label(language, "property", "ทรัพย์สิน")}</small></span><Button className="df-button df-button--ghost" onClick={() => { const result = buyMarketOffer(game, offer.id); onUpdate(result.state, result.message); }}>{label(language, "TAKE OFFER", "รับข้อเสนอ")}</Button></article>)}</section></div>;
}

function CharacterView({ game, language, open }: { game: GameState; language: Language; open: (page: PageId) => void }) {
  const [tab, setTab] = useState<"traits" | "masteries" | "inventory" | "ties">("traits");
  const usedSlots = game.character.inventory.reduce((sum, item) => sum + item.slots, 0);
  const socialRows: Array<[string, string, number, string]> = [["Honor", "เกียรติ", game.character.social.honor, "teal"], ["Influence", "บารมี", game.character.social.influence, "ochre"], ["Information", "ข่าวในมือ", game.character.social.information, "navy"], ["Stain", "ข้อครหา", game.character.social.stain, "vermilion"]];
  return <div className="page character-view">
    <div className="page-heading"><div><SectionKicker>CHARACTER DOSSIER</SectionKicker><h1>{game.character.name}</h1><p>{game.character.occupation} · {game.character.origin}</p></div><GhostLink onClick={() => open("log")}>{label(language, "View related records", "ดูบันทึกที่เกี่ยวข้อง")}</GhostLink></div>
    <section className="dossier-header"><div className="dossier-name"><span className="mon-avatar mon-avatar--large">火</span><div><h2>{game.character.name}</h2><p>{game.character.strength}</p></div></div><div className="dossier-resources"><span>{label(language, "Wounds", "บาดแผล")}<strong>{game.character.vitals.wounds}/6</strong></span><span>{label(language, "Focus", "ค่าสติ")}<strong>{game.character.vitals.focus}/6</strong></span><span>{label(language, "Momentum", "แรงฮึด")}<strong>{game.character.vitals.momentum}/2</strong></span><span>{label(language, "Rank", "ยศ")}<strong>{game.character.social.rank}</strong></span></div></section>
    <CampaignLedgerStrip game={game} language={language} />
    <div className="character-columns"><section><div className="tab-strip">{(["traits", "masteries", "inventory", "ties"] as const).map((entry) => <button key={entry} className={tab === entry ? "active" : ""} onClick={() => setTab(entry)}>{label(language, entry === "traits" ? "Traits" : entry === "masteries" ? "Masteries" : entry === "inventory" ? "Gear" : "Ties", entry === "traits" ? "แกนทอย" : entry === "masteries" ? "ความชำนาญ" : entry === "inventory" ? "สัมภาระ" : "แรงดึง")}</button>)}</div>
      {tab === "traits" && <div className="stat-grid">{AXES.map((axis) => <div className="stat-cell" key={axis.id}><SengokuIcon name="memory" tone="navy" /><strong>{language === "en" ? axis.en : axis.th}</strong><b>{game.character.attributes[axis.id]}</b><small>{axis.hint}</small><button>{label(language, "Used by the action parser", "ระบบเลือกใช้จากการกระทำ")}</button></div>)}</div>}
      {tab === "masteries" && <div className="mastery-list"><div className="list-title"><span>{label(language, "Mastery", "ความชำนาญ")}</span><span>{label(language, "Step & bonus", "ขั้นและโบนัส")}</span><span>{label(language, "Practice record", "บันทึกการฝึก")}</span></div>{game.character.masteries.map((entry) => { const rank = entry.rank ?? 1; const tier = masteryTierForRank(rank); return <div className="mastery-row" key={entry.id}><span><SengokuIcon name="memory" size={15} tone="ochre" />{entry.label}</span><strong>{label(language, "Step", "ขั้น")} {rank} · +{tier.bonus}</strong><small>{entry.origin}<br />{language === "en" ? tier.en : tier.th} · {rank === 20 ? label(language, "Mastered", "ถึงขีดสุด") : `${entry.xp ?? 0}/${xpNeededForRank(rank)} XP · DN ${tier.minimumDifficulty}+`}</small></div>; })}</div>}
      {tab === "inventory" && <div className="inventory-sheet"><div className="inventory-capacity"><span>{label(language, "Carried slots", "ช่องสัมภาระ")}</span><strong>{usedSlots}/8</strong></div>{game.character.inventory.map((entry) => <article key={entry.id}><div><strong>{entry.label}</strong><small>{entry.description}</small></div><span>{titleCase(entry.kind)}</span><b>{entry.slots} {label(language, "slot", "ช่อง")}</b></article>)}</div>}
      {tab === "ties" && <div className="ties-sheet">{game.character.pulls.map((pull) => <article key={pull.id}><small>{pull.question}</small><strong>{pull.answer}</strong><span>{pull.tags.join(" · ")}</span></article>)}</div>}
    </section><aside className="status-rail"><SectionKicker>{label(language, "Social record", "สถานะทางสังคม")}</SectionKicker>{socialRows.map(([en, th, value, tone]) => <div className={`status-row status-row--${tone}`} key={en}><span className="status-dot" /><strong>{language === "en" ? en : th}</strong><small>{value}</small></div>)}<div className="status-note"><SengokuIcon name="relation" tone="teal" />{label(language, "Social values do not grant automatic obedience. They describe access, attention, and what failure can cost.", "ค่าสถานะสังคมไม่ได้ทำให้ใครเชื่อฟังอัตโนมัติ แต่บอกสิทธิ์เข้าถึง สายตาที่จับจ้อง และราคาของความพลาด")}</div></aside></div>
  </div>;
}

export function campaignRewardContext(game: GameState, language: Language) {
  const lastReward = game.rolls.slice().reverse().find((roll) => roll.reward)?.reward;
  const resolvedReward = game.missions.slice().reverse().find((mission) => mission.state === "resolved")?.reward;
  const reward = lastReward ?? resolvedReward;
  return reward ? label(language, `Latest reward context: ${reward}`, `รางวัลล่าสุด: ${reward}`) : label(language, "No reward has entered the campaign record yet.", "ยังไม่มีรางวัลเข้าสมุดแคมเปญ");
}

export function campaignStepXpContext(game: GameState, language: Language) {
  const leading = game.character.masteries.reduce((best, mastery) => (mastery.rank ?? mastery.level ?? 1) > (best.rank ?? best.level ?? 1) ? mastery : best, game.character.masteries[0]);
  if (!leading) return "—";
  const rank = leading.rank ?? leading.level ?? 1;
  if (rank >= 20) return label(language, `${leading.label}: mastered`, `${leading.label}: ถึงขีดสุด`);
  return `${leading.label}: ${leading.xp ?? 0}/${xpNeededForRank(rank)} XP`;
}

function CampaignLedgerStrip({ game, language }: { game: GameState; language: Language }) {
  const highestMastery = game.character.masteries.reduce((highest, mastery) => Math.max(highest, mastery.rank ?? mastery.level ?? 1), 1);
  const openObligations = game.economy?.obligations.filter((entry) => entry.status === "open" || entry.status === "called_in").length ?? 0;
  return <><section className="campaign-ledger-strip" aria-label={label(language, "Campaign ledger summary", "สรุปสมุดแคมเปญ")}><span><small>{label(language, "LEAF", "หน้าเรื่อง")}</small><b>{game.progression?.leaf ?? game.tick}</b></span><span><small>{label(language, "CAMPAIGN DAY", "วันในแคมเปญ")}</small><b>{game.campaign.day}</b></span><span><small>{label(language, "AGE", "อายุ")}</small><b>{game.progression?.currentAge ?? "—"}</b></span><span><small>{label(language, "HIGHEST STEP", "ขั้นสูงสุด")}</small><b>{highestMastery}/20</b></span><span><small>{label(language, "NEXT PRACTICE", "ฝึกสู่ขั้นถัดไป")}</small><b>{campaignStepXpContext(game, language)}</b></span><span><small>{label(language, "OPEN AGREEMENTS", "สัญญาค้าง")}</small><b>{openObligations}</b></span></section><p className="campaign-reward-ribbon" data-testid="campaign-reward-context"><span>{label(language, "REWARD CONTEXT", "บริบทรางวัล")}</span>{campaignRewardContext(game, language)}</p></>;
}

function ArchiveView({ game, language }: { game: GameState; language: Language }) {
  return <div className="page archive-view"><div className="page-heading"><div><SectionKicker>WORLD ARCHIVE · VISIBLE KNOWLEDGE</SectionKicker><h1>{label(language, "The world is more than the current scene", "โลกมีมากกว่าฉากตรงหน้า")}</h1><p>{label(language, "This archive only projects people, conditions, and memories that the local campaign has already made visible.", "คลังนี้แสดงเฉพาะผู้คน สภาวะ และความทรงจำที่แคมเปญในเครื่องได้เปิดให้เห็นแล้ว")}</p></div></div><section className="archive-summary"><div><strong>{game.currentScene.location}</strong><p>{game.currentScene.pressure}</p></div><span>{label(language, "War shadow", "เงาสงคราม")} · {game.campaign.warShadow}/6</span></section><section className="archive-grid"><ArchiveCard icon="relation" title={label(language, "People who matter", "ผู้คนที่เกี่ยวข้อง")} note={`${game.currentScene.speaker} · ${game.missions[0]?.issuer ?? "—"}`} /><ArchiveCard icon="compass" title={label(language, "Mission pressure", "แรงกดดันภารกิจ")} note={game.missions[0]?.pressure ?? "—"} /><ArchiveCard icon="memory" title={label(language, "World memories", "ความทรงจำโลก")} note={`${game.memories.length} ${label(language, "visible records", "รายการที่มองเห็น")}`} /><ArchiveCard icon="credit" title={label(language, "Community condition", "สภาพชุมชน")} note={`${label(language, "Food", "เสบียง")} ${game.community.food}/6 · ${label(language, "Safety", "ความปลอดภัย")} ${game.community.safety}/6`} /></section><section className="memory-ledger"><SectionKicker>{label(language, "RECENT MEMORIES", "ความทรงจำล่าสุด")}</SectionKicker>{game.memories.slice(-5).reverse().map((memory) => <article key={memory.id}><span className={`state-pill state-pill--${memory.tone}`}>{memory.kind}</span><div><strong>{memory.title}</strong><p>{memory.detail}</p></div></article>)}</section></div>;
}

function ArchiveCard({ icon, title, note }: { icon: SengokuIconName; title: string; note: string }) { return <article className="archive-card"><SengokuIcon name={icon} tone="navy" /><div><h2>{title}</h2><p>{note}</p></div><ChevronRight size={17} /></article>; }

function SaveView({ game, saves, language, onSave, open }: { game: GameState; saves: SaveLeaves; language: Language; onSave: (slot: keyof SaveLeaves) => void; open: (page: PageId) => void }) {
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>SAVE GAME · LOCAL ONLY</SectionKicker><h1>{label(language, "Save the leaf before it turns", "บันทึกก่อนเรื่องจะเดินต่อ")}</h1><p>{label(language, "Auto Save follows the current campaign state. Manual leaves are snapshots you choose to keep in this browser.", "Auto Save ตามสถานะแคมเปญปัจจุบัน ส่วนบันทึกด้วยมือคือภาพจำของจุดที่เจ้าเลือกเก็บไว้ในเบราว์เซอร์นี้")}</p></div><GhostLink onClick={() => open("play")}>{label(language, "Return to scene", "กลับไปยังฉาก")}</GhostLink></div><CampaignLedgerStrip game={game} language={language} /><div className="save-management"><SaveRow icon="memory" tone="teal" title="AUTO SAVE" game={game} note={label(language, "Always updated after a campaign change", "อัปเดตทุกครั้งเมื่อสถานะแคมเปญเปลี่ยน")} locked /><SaveRow icon="log" tone="ochre" title="MANUAL SAVE" game={saves.manual} note={label(language, "Overwrite this leaf when you choose", "เขียนทับช่องนี้เมื่อเจ้าต้องการ")} action={() => onSave("manual")} /><SaveRow icon="document" tone="navy" title="SAVED LEAF II" game={saves.leaf2} note={label(language, "A second local checkpoint", "จุดเซฟท้องถิ่นอีกหนึ่งจุด")} action={() => onSave("leaf2")} /><SaveRow icon="document" tone="navy" title="SAVED LEAF III" game={saves.leaf3} note={label(language, "A third local checkpoint", "จุดเซฟท้องถิ่นอีกหนึ่งจุด")} action={() => onSave("leaf3")} /></div></div>;
}

function SaveRow({ icon, tone, title, game, note, action, locked }: { icon: SengokuIconName; tone: "teal" | "ochre" | "navy"; title: string; game: GameState | null; note: string; action?: () => void; locked?: boolean }) { return <article className={`save-slot save-slot--${tone === "teal" ? "auto" : tone === "ochre" ? "manual" : "new"}`}><SengokuIcon name={icon} size={23} tone={tone} /><div><small>{title} · {game ? `LEAF ${game.tick}` : "EMPTY"}</small><h2>{game?.campaign.title ?? "—"}</h2><p>{note}</p></div>{locked ? <span className="save-lock">AUTO</span> : <Button className="df-button df-button--ghost" onClick={action}>{game ? "OVERWRITE" : "SAVE HERE"}</Button>}</article>; }

function LoadView({ game, saves, language, onLoad }: { game: GameState; saves: SaveLeaves; language: Language; onLoad: (slot: "auto" | keyof SaveLeaves) => void }) {
  const slots: { id: "auto" | keyof SaveLeaves; label: string; data: GameState | null; tone: "teal" | "ochre" | "navy" }[] = [{ id: "auto", label: "AUTO SAVE", data: game, tone: "teal" }, { id: "manual", label: "MANUAL SAVE", data: saves.manual, tone: "ochre" }, { id: "leaf2", label: "SAVED LEAF II", data: saves.leaf2, tone: "navy" }, { id: "leaf3", label: "SAVED LEAF III", data: saves.leaf3, tone: "navy" }];
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>LOAD GAME · THIS BROWSER</SectionKicker><h1>{label(language, "Load a local game", "โหลดเกมที่บันทึกไว้")}</h1><p>{label(language, "Choose a record from this browser. Loading replaces the active local campaign state; the stored record remains available for another return.", "เลือกบันทึกจากเบราว์เซอร์นี้ การโหลดจะแทนสถานะแคมเปญปัจจุบัน แต่ไฟล์บันทึกเดิมยังอยู่ให้กลับมาใช้ได้อีก")}</p></div></div><CampaignLedgerStrip game={game} language={language} /><div className="save-slots">{slots.map((slot) => <article className={`save-slot save-slot--${slot.tone === "teal" ? "auto" : slot.tone === "ochre" ? "manual" : "new"}`} key={slot.id}><SengokuIcon name="document" size={23} tone={slot.tone} /><div><small>{slot.label} · {slot.data ? `LEAF ${slot.data.progression?.leaf ?? slot.data.tick}` : "EMPTY"}</small><h2>{slot.data?.campaign.title ?? "—"}</h2><p>{slot.data ? `${slot.data.character.name} · ${slot.data.currentScene.title}` : label(language, "No local record in this slot", "ยังไม่มีบันทึกในช่องนี้")}</p></div><Button className="df-button df-button--ghost" disabled={!slot.data} onClick={() => onLoad(slot.id)}>LOAD <ArrowRight size={16} /></Button></article>)}</div></div>;
}

function SettingsView({ language, setLanguage, darkMode, setDarkMode, fontSize, setFontSize, accent, setAccent, readerMode, setReaderMode, onReset }: { language: Language; setLanguage: (value: Language) => void; darkMode: boolean; setDarkMode: (value: boolean) => void; fontSize: FontSize; setFontSize: (value: FontSize) => void; accent: Accent; setAccent: (value: Accent) => void; readerMode: boolean; setReaderMode: (value: boolean) => void; onReset: () => void }) {
  return <div className="page settings-view"><div className="page-heading"><div><SectionKicker>SETTINGS · THIS BROWSER</SectionKicker><h1>{label(language, "Set the reading room", "จัดหน้ากระดาษให้อ่านสบาย")}</h1><p>{label(language, "Appearance changes do not alter campaign rules. Local Save remains the primary storage for this version.", "การปรับหน้าตาไม่เปลี่ยนกติกาแคมเปญ และเวอร์ชันนี้ใช้ Local Save เป็นที่เก็บข้อมูลหลัก")}</p></div></div><section className="settings-sheet"><SettingRow icon="settings" title={label(language, "Appearance", "โหมดสี")} note={label(language, "Paper by day, ink by night", "กระดาษในกลางวัน หมึกในยามค่ำ")}><Switch checked={darkMode} onCheckedChange={setDarkMode} /></SettingRow><SettingRow icon="document" title={label(language, "Text size", "ขนาดตัวอักษร")} note={label(language, "Change the reading scale", "ปรับขนาดเพื่อการอ่าน") }><div className="segmented">{(["small", "normal", "large"] as FontSize[]).map((size) => <button key={size} className={fontSize === size ? "active" : ""} onClick={() => setFontSize(size)}>{size}</button>)}</div></SettingRow><SettingRow icon="icon" title={label(language, "Seal accent", "สีตราเน้น")} note={label(language, "A personal mark on the ledger", "เครื่องหมายส่วนตัวบนสมุดบัญชี")}><div className="color-options">{(["vermilion", "ochre", "teal"] as Accent[]).map((color) => <button aria-label={color} key={color} className={`color-dot color-dot--${color} ${accent === color ? "active" : ""}`} onClick={() => setAccent(color)} />)}</div></SettingRow><SettingRow icon="log" title="Reader Mode" note={label(language, "Open Campaign Log as continuous prose", "เปิดบันทึกเรื่องราวเป็นโหมดอ่านต่อเนื่อง")}><Switch checked={readerMode} onCheckedChange={setReaderMode} /></SettingRow><SettingRow icon="document" title={label(language, "Language", "ภาษา")} note={label(language, "English is the primary UI language; Thai is a complete alternate mode.", "อังกฤษเป็นภาษาหลักของ UI และไทยเป็นโหมดภาษาที่สอง") }><div className="segmented"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div></SettingRow><SettingRow icon="archive" title={label(language, "Clear Local Save", "ล้าง Local Save")} note={label(language, "This removes the campaign and all local leaves from this browser.", "ลบแคมเปญและจุดเซฟท้องถิ่นทั้งหมดในเบราว์เซอร์นี้") }><Button className="df-button df-button--ghost" onClick={onReset}><RotateCcw size={16} /> RESET</Button></SettingRow></section></div>;
}

function SettingRow({ icon, title, note, children }: { icon: SengokuIconName; title: string; note: string; children: React.ReactNode }) { return <div className="setting-row"><div><SengokuIcon name={icon} tone="navy" /><strong>{title}</strong><small>{note}</small></div><div className="setting-value">{children}</div></div>; }
