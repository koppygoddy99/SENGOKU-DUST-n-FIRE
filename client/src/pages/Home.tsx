/**
 * Ledger of Ash: quiet paper, traceable consequence, and a narrative-first reading field.
 * Every view reads from the same local campaign state; no hidden backend state is implied.
 */
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Eye, EyeOff, Languages, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, RotateCcw, Search, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { SengokuIcon, type SengokuIconName } from "@/components/SengokuIcon";
import {
  AXES,
  RELATIONSHIP_QUESTIONS,
  STARTER_TEMPLATES,
  applyRoll,
  buyMarketOffer,
  createGameState,
  parseAction,
  resolveRoll,
  type CharacterDraft,
  type GameState,
  type RollPreview,
  type Season,
} from "@/lib/game";

type PageId = "home" | "start" | "play" | "missions" | "market" | "character" | "log" | "archive" | "save" | "load" | "settings";
type Language = "en" | "th";
type FontSize = "small" | "normal" | "large";
type Accent = "vermilion" | "ochre" | "teal";
type SaveLeaves = { manual: GameState | null; leaf2: GameState | null; leaf3: GameState | null };

const STORAGE_KEY = "dust-fire-local-game-v2";
const seasons: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
const seasonThai: Record<Season, string> = { Spring: "วสันต์", Summer: "คิมหันต์", Autumn: "สารท", Winter: "เหมันต์" };
const regionOptions = ["Mikawa", "Omi", "Owari", "Sakai", "Izumi", "Iga", "Koga", "Kii", "Yamashiro", "Settsu", "Musashi", "Iyo", "Shima"];

const seedDraft: CharacterDraft = {
  name: "ซาโตะ",
  identity: "ผู้เล่นกำหนด",
  templateId: "ronin",
  freeformOccupation: "",
  origin: "เคยรับใช้กองทัพชายแดนมาก่อน",
  strength: "จำทางหนีและอ่านอันตรายได้ไว",
  weakness: "ไม่กล้าปฏิเสธคนที่เคยช่วยชีวิต",
  answers: {
    first_survivor: "น้องชายที่ยังอยู่ในหมู่บ้าน",
    stance: "ยังไม่ยืนข้างใครถาวร",
    never_surrender: "บัญชีข้าวของหมู่บ้าน",
    debts: "ติดหนี้คนเรือที่พาข้ามฟาก",
    hidden_knowledge: "รู้ว่ามีเส้นทางน้ำเลี่ยงด่าน",
    sacrifice: "ชื่อเสียงของตนเอง",
  },
};

const seedGame = () => createGameState({
  id: "camp-local-demo",
  title: "Ash over Kinokawa",
  year: 1578,
  season: "Summer",
  region: "Mikawa",
  location: "ค่ายชายแดนและตลาดหน้าด่าน",
  warShadow: 3,
  day: 1,
}, seedDraft);

function copyState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function label(language: Language, en: string, th: string) {
  return language === "en" ? en : th;
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function historicalStatusLabel(status: NonNullable<RollPreview["historical"]>["status"], language: Language) {
  const labels = {
    "fact-supported": ["Fact-supported", "มีหลักฐานรองรับ"],
    "contextual-play": ["Contextual play", "ใช้บริบทประวัติศาสตร์"],
    "campaign-fiction": ["Campaign fiction", "เรื่องแต่งในแคมเปญ"],
    "insufficient-evidence": ["Evidence limited", "หลักฐานยังไม่พอ"],
  } as const;
  return labels[status][language === "en" ? 0 : 1];
}

function historicalTone(status: NonNullable<RollPreview["historical"]>["status"]) {
  if (status === "fact-supported") return "teal" as const;
  if (status === "contextual-play") return "ochre" as const;
  if (status === "campaign-fiction") return "vermilion" as const;
  return "navy" as const;
}

export function withHistoricalBoundary(game: GameState, historical: NonNullable<RollPreview["historical"]>): GameState {
  return { ...game, historicalBoundary: { ...historical, tick: game.tick } };
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

const navItems: { id: PageId; en: string; th: string; icon: SengokuIconName }[] = [
  { id: "home", en: "Chronicle", th: "พงศาวดาร", icon: "home" },
  { id: "play", en: "Play", th: "เล่นฉาก", icon: "sword" },
  { id: "missions", en: "Missions", th: "ภารกิจ", icon: "compass" },
  { id: "market", en: "Market", th: "ตลาด", icon: "credit" },
  { id: "character", en: "Character", th: "ตัวละคร", icon: "character" },
  { id: "log", en: "Campaign Log", th: "บันทึกเรื่องราว", icon: "log" },
  { id: "archive", en: "World Archive", th: "คลังโลก", icon: "archive" },
  { id: "save", en: "Save Game", th: "เซฟเกม", icon: "log" },
  { id: "load", en: "Load Game", th: "โหลดเกม", icon: "document" },
  { id: "start", en: "New Chronicle", th: "เริ่มเรื่องใหม่", icon: "start" },
  { id: "settings", en: "Settings", th: "ตั้งค่า", icon: "settings" },
];

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <div className="section-kicker">{children}</div>;
}

function GhostLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button className="ghost-link" onClick={onClick}>{children} <ChevronRight size={15} /></button>;
}

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  const { user, loading, isAuthenticated } = useAuth();
  const accountCredits = trpc.profile.credits.useQuery(undefined, { enabled: isAuthenticated, retry: false });

  const [page, setPage] = useState<PageId>("home");
  const [game, setGame] = useState<GameState>(seedGame);
  const [saves, setSaves] = useState<SaveLeaves>({ manual: null, leaf2: null, leaf3: null });
  const [language, setLanguage] = useState<Language>("en");
  const [readerMode, setReaderMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [accent, setAccent] = useState<Accent>("vermilion");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notice, setNotice] = useState("Local Save active · this campaign stays in this browser");
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{ game: GameState; saves: SaveLeaves; language: Language; readerMode: boolean; darkMode: boolean; fontSize: FontSize; accent: Accent }>;
        if (saved.game?.schemaVersion === 2) setGame(saved.game);
        if (saved.saves) setSaves(saved.saves);
        if (saved.language) setLanguage(saved.language);
        if (typeof saved.readerMode === "boolean") setReaderMode(saved.readerMode);
        if (typeof saved.darkMode === "boolean") setDarkMode(saved.darkMode);
        if (saved.fontSize) setFontSize(saved.fontSize);
        if (saved.accent) setAccent(saved.accent);
      }
    } catch {
      setNotice("Local Save could not be read · a fresh campaign has been prepared");
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ game, saves, language, readerMode, darkMode, fontSize, accent }));
  }, [accent, darkMode, fontSize, game, language, readerMode, saves, storageReady]);

  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    const credits = accountCredits.data?.credits;
    if (!isAuthenticated || typeof credits !== "number") return;
    setGame((current) => current.credits === credits ? current : { ...current, credits });
  }, [accountCredits.data?.credits, isAuthenticated]);

  const appClass = ["app-shell", darkMode ? "theme-dark" : "", `font-${fontSize}`, `accent-${accent}`, sidebarCollapsed ? "sidebar-collapsed" : ""].join(" ");
  const updateGame = (next: GameState, message: string) => { setGame(next); setNotice(message); };
  const open = (nextPage: PageId) => { setPage(nextPage); setMenuOpen(false); };
  const beginNew = (nextGame: GameState) => { setGame(nextGame); setSaves({ manual: null, leaf2: null, leaf3: null }); setNotice("A new chronicle has begun · 50 trial credits are ready"); open("play"); };
  const writeSave = (slot: keyof SaveLeaves) => { setSaves((current) => ({ ...current, [slot]: copyState(game) })); setNotice(`${slot === "manual" ? "Manual Save" : slot === "leaf2" ? "Saved Leaf II" : "Saved Leaf III"} written at Leaf ${game.tick}`); };
  const loadSave = (slot: "auto" | keyof SaveLeaves) => {
    const source = slot === "auto" ? game : saves[slot];
    if (!source) { setNotice("This leaf is still blank"); return; }
    setGame(copyState(source)); setNotice(`${slot === "auto" ? "Auto Save" : "Saved leaf"} restored at Leaf ${source.tick}`); open("play");
  };
  const resetLocal = () => { window.localStorage.removeItem(STORAGE_KEY); setGame(seedGame()); setSaves({ manual: null, leaf2: null, leaf3: null }); setNotice("Local records cleared · a fresh example campaign is ready"); };

  return <div className={appClass}>
    <header className="topbar">
      <button className="brand" onClick={() => open("home")} aria-label="Dust and Fire home"><span className="brand-mark"><span /><span /></span><span className="brand-copy"><strong>Dust &amp; Fire</strong><small>SENGOKU STORIES</small></span></button>
      <div className="topbar__context"><span>{game.campaign.year}</span><span className="topbar__dot">•</span><span>{language === "en" ? game.campaign.season : seasonThai[game.campaign.season]}</span><span className="topbar__dot">•</span><span>{game.campaign.region}</span></div>
      <button className="credit-chip" onClick={() => open("settings")}><SengokuIcon name="credit" size={16} tone="ochre" /><span>{label(language, "Credits", "เครดิต")}</span><strong>{game.credits}</strong></button>
      {!loading && <button className={`gm-account-chip ${isAuthenticated ? "is-signed-in" : ""}`} onClick={() => !isAuthenticated && startLogin()}>{isAuthenticated ? <><span className="gm-account-chip__dot" />{user?.name || label(language, "GM access", "สิทธิ์ใช้ GM")}</> : <><SengokuIcon name="relation" size={15} tone="teal" />{label(language, "AI GM · Sign in", "AI GM · เข้าสู่ระบบ")}</>}</button>}
      <div className="topbar-language" aria-label="Language selection"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div>
      <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Open menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    </header>
    <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""} ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
      <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar">{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
      <div className="sidebar__identity"><div className="mon-avatar">火</div><div className="sidebar__identity-copy"><strong>{game.character.name}</strong><span>{game.character.occupation}</span></div></div>
      <nav className="nav-list" aria-label="Game navigation">{navItems.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "nav-item--active" : ""}`} onClick={() => open(item.id)} title={label(language, item.en, item.th)}><SengokuIcon name={item.icon} size={16} tone={page === item.id ? "vermilion" : "navy"} /><span className="nav-item__label">{label(language, item.en, item.th)}</span></button>)}</nav>
      <div className="sidebar__vitals">
        <Vital label={label(language, "Wounds", "บาดแผล")} value={`${game.character.vitals.wounds}/6`} percent={(game.character.vitals.wounds / 6) * 100} tone="red" />
        <Vital label={label(language, "Focus", "ค่าสติ")} value={`${game.character.vitals.focus}/6`} percent={(game.character.vitals.focus / 6) * 100} tone="ochre" />
        <Vital label={label(language, "Momentum", "แรงฮึด")} value={`${game.character.vitals.momentum}/2`} percent={(game.character.vitals.momentum / 2) * 100} tone="teal" />
      </div>
      <div className="sidebar__states"><small>{label(language, "What the world remembers", "สิ่งที่โลกจดจำ")}</small>{game.memories.slice(-3).reverse().map((memory) => <span className={`state-pill state-pill--${memory.tone}`} key={memory.id}>{memory.title}</span>)}</div>
      <div className="sidebar__language"><Languages size={15} /><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><span>/</span><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div>
      <div className="sidebar__notice">{notice}</div>
    </aside>
    <main className="main-content">
      {page === "home" && <HomeView game={game} language={language} open={open} />}
      {page === "start" && <StartView language={language} onStart={beginNew} />}
      {page === "play" && <PlayView game={game} language={language} open={open} onUpdate={updateGame} isAuthenticated={isAuthenticated} onLogin={startLogin} onAccountCreditChange={() => accountCredits.refetch()} />}
      {page === "missions" && <MissionsView game={game} language={language} onUpdate={updateGame} open={open} />}
      {page === "market" && <MarketView game={game} language={language} onUpdate={updateGame} />}
      {page === "character" && <CharacterView game={game} language={language} open={open} />}
      {page === "log" && <LogView game={game} language={language} readerMode={readerMode} setReaderMode={setReaderMode} />}
      {page === "archive" && <ArchiveView game={game} language={language} />}
      {page === "save" && <SaveView game={game} saves={saves} language={language} onSave={writeSave} open={open} />}
      {page === "load" && <LoadView game={game} saves={saves} language={language} onLoad={loadSave} />}
      {page === "settings" && <SettingsView language={language} setLanguage={setLanguage} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} accent={accent} setAccent={setAccent} readerMode={readerMode} setReaderMode={setReaderMode} onReset={resetLocal} />}
    </main>
  </div>;
}

function Vital({ label, value, percent, tone }: { label: string; value: string; percent: number; tone: "red" | "ochre" | "teal" }) {
  return <div className="vital"><span>{label}</span><strong>{value}</strong><i className={`bar bar--${tone}`}><b style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></i></div>;
}

function HomeView({ game, language, open }: { game: GameState; language: Language; open: (page: PageId) => void }) {
  const activeMission = game.missions.find((mission) => mission.state !== "resolved") ?? game.missions[0];
  return <div className="page home-view">
    <aside className="home-ledger-spine" aria-label="Campaign ledger spine"><div className="home-ledger-spine__folio">FOLIO {String(game.tick).padStart(2, "0")}</div><div className="home-ledger-spine__seal">火</div><div className="home-ledger-spine__record"><small>{label(language, "ACTIVE LEAF", "หน้าที่เปิดอยู่")}</small><strong>{game.currentScene.title}</strong></div><div className="home-ledger-spine__record"><small>{label(language, "PLACE", "สถานที่")}</small><strong>{game.campaign.region}</strong></div><button onClick={() => open("log")}><BookOpen size={15} /> {label(language, "RECORD", "บันทึก")}</button></aside>
    <div className="home-leaf">
      <section className="hero-ledger"><div className="hero-ledger__spine"><span>LEAF {String(game.tick).padStart(2, "0")}</span><i /></div><div className="hero-ledger__seal">火</div><div><SectionKicker>{label(language, "CAMPAIGN RECORD", "ระเบียนแคมเปญ")}</SectionKicker><h1>{language === "en" ? <>Honor on the banner.<br />Truth under ash.</> : <>เกียรติอยู่บนธง<br />ความจริงอยู่ใต้เถ้า</>}</h1><p>{label(language, "A local-first chronicle: each roll leaves a record, a cost, or a door open for the next scene.", "เรื่องราวเก็บอยู่ในเครื่องนี้ ทุกการทอยจะทิ้งบันทึก ราคา หรือประตูบานใหม่ไว้ให้ฉากถัดไป")}</p></div><div className="hero-ledger__actions"><Button className="df-button df-button--primary" onClick={() => open("play")}><SengokuIcon name="sword" size={17} tone="ink" /> {label(language, "ANSWER THE CURRENT LEAF", "ตอบในหน้าปัจจุบัน")} <ArrowRight size={18} /></Button><Button className="df-button df-button--ghost" onClick={() => open("start")}><Plus size={16} /> {label(language, "OPEN A NEW RECORD", "เปิดระเบียนเรื่องใหม่")}</Button></div></section>
      <section className="home-grid"><button className="continue-panel" onClick={() => open("play")}><div className="continue-panel__top"><SectionKicker>{label(language, "THE CURRENT LEAF", "หน้าปัจจุบัน")}</SectionKicker><span className="save-dot">AUTO SAVED</span></div><h2>{game.currentScene.title}</h2><p>{game.currentScene.body[0]}</p><span className="continue-panel__link">{label(language, "Read and answer the leaf", "อ่านและตอบในหน้าปัจจุบัน")} <ArrowRight size={17} /></span></button><div className="campaign-card"><SectionKicker>{label(language, "MARGIN NOTE", "บันทึกขอบหน้า")}</SectionKicker><dl><div><dt>{label(language, "Time", "เวลา")}</dt><dd>{game.campaign.year} · {language === "en" ? game.campaign.season : seasonThai[game.campaign.season]}</dd></div><div><dt>{label(language, "Place", "สถานที่")}</dt><dd>{game.campaign.location}</dd></div><div><dt>{label(language, "Burden", "ภาระ")}</dt><dd>{activeMission?.deadline}</dd></div><div><dt>{label(language, "Credits", "เครดิต")}</dt><dd className="credit-inline"><SengokuIcon name="credit" size={15} tone="ochre" /> {game.credits}</dd></div></dl></div></section>
      <section className="shortcut-row"><Shortcut icon="compass" tone="ochre" title={label(language, "Mission Ledger", "บัญชีภารกิจ")} note={activeMission?.title ?? label(language, "No active mission", "ยังไม่มีภารกิจ")} onClick={() => open("missions")} /><Shortcut icon="character" tone="navy" title={label(language, "Character Dossier", "แฟ้มตัวละคร")} note={game.character.occupation} onClick={() => open("character")} /><Shortcut icon="log" tone="teal" title={label(language, "Campaign Record", "ระเบียนเรื่องราว")} note={`${game.memories.length + game.rolls.length} ${label(language, "recorded changes", "รายการที่บันทึก")}`} onClick={() => open("log")} /><Shortcut icon="archive" tone="navy" title={label(language, "World Index", "ดัชนีโลก")} note={label(language, "People, resources, and memories", "ผู้คน ทรัพยากร และความทรงจำ")} onClick={() => open("archive")} /></section>
    </div>
  </div>;
}

function Shortcut({ icon, tone, title, note, onClick }: { icon: SengokuIconName; tone: "navy" | "ochre" | "teal" | "vermilion"; title: string; note: string; onClick: () => void }) {
  return <button onClick={onClick}><SengokuIcon name={icon} tone={tone} /><span><strong>{title}</strong><small>{note}</small></span><ChevronRight size={18} /></button>;
}

function StartView({ language, onStart }: { language: Language; onStart: (game: GameState) => void }) {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState({ title: "A New Chronicle", year: 1578, season: "Summer" as Season, region: "Mikawa", location: "ตลาดหน้าด่านใกล้เส้นทางน้ำ" });
  const [draft, setDraft] = useState<CharacterDraft>({ ...seedDraft, answers: { ...seedDraft.answers } });
  const template = STARTER_TEMPLATES.find((entry) => entry.id === draft.templateId) ?? STARTER_TEMPLATES[0];
  const updateDraft = <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateAnswer = (key: string, value: string) => setDraft((current) => ({ ...current, answers: { ...current.answers, [key]: value } }));
  const contextLooksUnusual = draft.templateId !== "freeform" && !template.compatibleRegions.includes(context.region);
  return <div className="page start-view">
    <div className="page-heading"><div><SectionKicker>NEW CHRONICLE · STEP {step} OF 4</SectionKicker><h1>{["Set the chronicle", "Choose a way to live", "Give the character a stake", "Confirm before the first leaf"][step - 1]}</h1><p>{label(language, "The game will create a local campaign with 50 trial credits. Nothing is sent to a server; this browser holds the record.", "เกมจะสร้างแคมเปญในเครื่องพร้อมเครดิตทดลอง 50 เครดิต ข้อมูลยังไม่ส่งไปยังเซิร์ฟเวอร์และเก็บอยู่ในเบราว์เซอร์นี้")}</p></div><div className="credit-box"><SengokuIcon name="credit" tone="ochre" /><span>{label(language, "Trial credits", "เครดิตทดลอง")}</span><strong>50</strong></div></div>
    <div className="start-layout"><ol className="step-rail">{["Campaign", "Starting path", "Character", "Confirmation"].map((entry, index) => <li key={entry} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-done" : ""}><span>{index + 1}</span><div><strong>{entry}</strong><small>{["time and place", "one of ten paths", "ties and strengths", "local save begins"][index]}</small></div></li>)}</ol>
      <section className="start-form">
        {step === 1 && <><label className="field-label">{label(language, "Campaign name", "ชื่อแคมเปญ")}<input value={context.title} onChange={(event) => setContext((current) => ({ ...current, title: event.target.value }))} /></label><div className="field-grid"><label className="field-label">{label(language, "Year", "ปี ค.ศ.")}<select value={context.year} onChange={(event) => setContext((current) => ({ ...current, year: Number(event.target.value) }))}>{[1566, 1575, 1578, 1580, 1590].map((year) => <option key={year} value={year}>{year}</option>)}</select></label><label className="field-label">{label(language, "Season", "ฤดูกาล")}<select value={context.season} onChange={(event) => setContext((current) => ({ ...current, season: event.target.value as Season }))}>{seasons.map((season) => <option key={season}>{season}</option>)}</select></label><label className="field-label">{label(language, "Region", "ภูมิภาค")}<select value={context.region} onChange={(event) => setContext((current) => ({ ...current, region: event.target.value }))}>{regionOptions.map((region) => <option key={region}>{region}</option>)}</select></label></div><label className="field-label field-label--spaced">{label(language, "Opening location", "สถานที่เริ่ม")}<input value={context.location} onChange={(event) => setContext((current) => ({ ...current, location: event.target.value }))} /></label><div className="context-check"><Check size={17} />{label(language, "Winter is available and will change market essentials in this local prototype. Historical facts and fictional play content stay separate in the record.", "เลือกฤดูหนาวได้ และฤดูจะเปลี่ยนของจำเป็นในตลาดของต้นแบบนี้ ข้อเท็จจริงทางประวัติศาสตร์กับเรื่องสมมติในเกมจะแยกกันในบันทึก")}</div><StepControls next={() => setStep(2)} /></>}
        {step === 2 && <><div className="choice-header"><strong>{label(language, "Pick a starting path", "เลือกอาชีพเริ่มต้น")}</strong><span>{label(language, "You may still write a freeform character", "ยังพิมพ์อาชีพอิสระได้")}</span></div><div className="template-grid">{STARTER_TEMPLATES.map((entry) => <button key={entry.id} className={`template-card ${draft.templateId === entry.id ? "is-selected" : ""}`} onClick={() => updateDraft("templateId", entry.id)}><span>{entry.id === draft.templateId ? "SELECTED" : "PATH"}</span><strong>{entry.label}</strong><small>{entry.short}</small><i>{entry.pressure}</i></button>)}</div><label className="field-label field-label--spaced"><span>{label(language, "Or write an occupation", "หรือพิมพ์อาชีพเอง")}</span><input value={draft.freeformOccupation} placeholder={label(language, "Leave empty to use the selected path", "เว้นว่างเพื่อใช้อาชีพที่เลือก")} onChange={(event) => { updateDraft("freeformOccupation", event.target.value); if (event.target.value) updateDraft("templateId", "freeform"); }} /></label>{contextLooksUnusual && <div className="context-check"><BookOpen size={17} />{label(language, "This path is normally associated with another region. The prototype records it as a background choice rather than rewriting history.", "อาชีพนี้มักสัมพันธ์กับภูมิภาคอื่น ต้นแบบจะบันทึกเป็นภูมิหลังของตัวละครแทนการปรับประวัติศาสตร์ให้เข้ากับตัวเลือก")}</div>}<StepControls previous={() => setStep(1)} next={() => setStep(3)} /></>}
        {step === 3 && <><div className="field-grid field-grid--two"><label className="field-label">{label(language, "Character name", "ชื่อตัวละคร")}<input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></label><label className="field-label">{label(language, "Identity", "เพศหรืออัตลักษณ์")}<input value={draft.identity} onChange={(event) => updateDraft("identity", event.target.value)} /></label></div><label className="field-label field-label--spaced">{label(language, "Origin", "ที่มา")}<input value={draft.origin} onChange={(event) => updateDraft("origin", event.target.value)} /></label><div className="field-grid field-grid--two"><label className="field-label">{label(language, "Strength", "จุดเด่น")}<input value={draft.strength} onChange={(event) => updateDraft("strength", event.target.value)} /></label><label className="field-label">{label(language, "Weakness", "จุดด้อย")}<input value={draft.weakness} onChange={(event) => updateDraft("weakness", event.target.value)} /></label></div><div className="relation-questions">{RELATIONSHIP_QUESTIONS.map(([id, question]) => <label className="field-label" key={id}><span>{question}</span><input value={draft.answers[id] ?? ""} onChange={(event) => updateAnswer(id, event.target.value)} /></label>)}</div><StepControls previous={() => setStep(2)} next={() => setStep(4)} /></>}
        {step === 4 && <><div className="campaign-review"><SectionKicker>LOCAL CAMPAIGN PREVIEW</SectionKicker><h2>{context.title || "Untitled Chronicle"}</h2><p>{context.year} · {context.season} · {context.region}</p><hr /><strong>{draft.name || "ผู้ไร้นาม"}</strong><span>{draft.templateId === "freeform" ? draft.freeformOccupation || "ผู้เดินทางไร้สังกัด" : template.label}</span><small>{draft.origin || context.location}</small><div className="review-lines"><span>{label(language, "Strength", "จุดเด่น")}: {draft.strength || "—"}</span><span>{label(language, "Weakness", "จุดด้อย")}: {draft.weakness || "—"}</span></div></div><div className="mechanic-note"><SengokuIcon name="roll" tone="ochre" /><div><strong>{label(language, "The game will assign the five axes from the selected path", "เกมจะกำหนดแกนทอยห้าค่าจากอาชีพที่เลือก")}</strong><p>{label(language, "Players do not distribute numbers. Your occupation, history, items, relationships, and the scene decide what can help a roll.", "ผู้เล่นไม่แจกตัวเลขเอง อาชีพ ที่มา ไอเทม ความสัมพันธ์ และฉาก จะเป็นตัวกำหนดสิ่งที่ช่วยการทอยได้")}</p></div></div><StepControls previous={() => setStep(3)} nextLabel={label(language, "BEGIN WITH 50 CREDITS", "เริ่มเรื่องพร้อม 50 เครดิต")} next={() => onStart(createGameState({ id: `camp-${Date.now()}`, title: context.title || "Untitled Chronicle", year: context.year, season: context.season, region: context.region, location: context.location || context.region, warShadow: 3, day: 1 }, draft))} /></>}
      </section>
      <aside className="historical-preview"><SectionKicker>WHAT THIS PROTOTYPE DOES</SectionKicker><h2>{context.year} · {language === "en" ? context.season : seasonThai[context.season]}</h2><div className="preview-row"><SengokuIcon name="history" tone="vermilion" />{label(language, "Shows a visible context label instead of presenting fictional NPCs as historical fact.", "แสดงป้ายบริบทที่เห็นได้ แทนการนำ NPC สมมติไปอ้างเป็นข้อเท็จจริง")}</div><div className="preview-row"><SengokuIcon name="roll" tone="ochre" />{label(language, "Uses the canonical 2d12 engine, five axes, mastery, context, and momentum.", "ใช้เครื่องยนต์ 2d12 แกนห้าค่า ความชำนาญ บริบท และแรงฮึด")}</div><div className="preview-row"><SengokuIcon name="log" tone="teal" />{label(language, "Stores the whole record locally in this browser first.", "เก็บบันทึกทั้งหมดไว้ในเบราว์เซอร์นี้ก่อน")}</div></aside>
    </div>
  </div>;
}

function StepControls({ previous, next, nextLabel }: { previous?: () => void; next: () => void; nextLabel?: string }) {
  return <div className="credit-confirm">{previous ? <Button className="df-button df-button--ghost" onClick={previous}><ArrowLeft size={17} /> Back</Button> : <span />}{nextLabel ? <Button className="df-button df-button--primary" onClick={next}>{nextLabel} <ArrowRight size={17} /></Button> : <Button className="df-button df-button--primary" onClick={next}>Continue <ArrowRight size={17} /></Button>}</div>;
}

function PlayView({ game, language, open, onUpdate, isAuthenticated, onLogin, onAccountCreditChange }: { game: GameState; language: Language; open: (page: PageId) => void; onUpdate: (game: GameState, message: string) => void; isAuthenticated: boolean; onLogin: () => void; onAccountCreditChange: () => void }) {
  const [action, setAction] = useState("");
  const [preview, setPreview] = useState<RollPreview | null>(null);
  const [spendMomentum, setSpendMomentum] = useState(false);
  const [gmNote, setGmNote] = useState("");
  const analyzeGM = trpc.gm.analyze.useMutation();
  const resolveGM = trpc.gm.resolve.useMutation();
  const spendCredit = trpc.profile.spendCredit.useMutation();
  const lastRoll = game.rolls.at(-1);
  const localPreview = (full: boolean) => {
    const parsed = parseAction(action, game);
    setPreview(full ? { ...parsed, isRiskOnly: false } : { ...parsed, isRiskOnly: true, mastery: undefined, contextBonus: 0, contextReason: undefined });
  };
  const analyze = (full: boolean) => {
    if (!action.trim()) return;
    if (!full || !isAuthenticated) {
      localPreview(full);
      if (full && !isAuthenticated) setGmNote(label(language, "Local rules preview. Sign in to consult the AI GM for a contextual reading.", "นี่คือการวิเคราะห์จากกติกาในเครื่อง เข้าสู่ระบบเพื่อให้ AI GM อ่านบริบทของเรื่อง"));
      return;
    }
    setGmNote(label(language, "The GM is reading the campaign record…", "AI GM กำลังอ่านระเบียนแคมเปญ…"));
    analyzeGM.mutate({ action, language, context: toGMContext(game) }, {
      onSuccess: (answer) => {
        const fallback = parseAction(action, game);
        const mastery = answer.suggestedMastery ? game.character.masteries.find((entry) => entry.label.toLowerCase().includes(answer.suggestedMastery!.toLowerCase()) || answer.suggestedMastery!.toLowerCase().includes(entry.label.toLowerCase())) : undefined;
        setPreview({ ...fallback, isRiskOnly: false, intent: answer.intentSummary, method: answer.confirmation, axis: answer.axis, mastery, contextBonus: answer.contextBonus, contextReason: answer.contextReason, difficulty: answer.difficulty as RollPreview["difficulty"], risks: [answer.risk], witnesses: [], historical: { status: answer.historicalStatus, fence: answer.historicalFence } });
        setGmNote(label(language, "AI GM interpretation ready. You may revise the action before the roll.", "AI GM อ่านการกระทำเสร็จแล้ว แก้ประโยคได้ก่อนยืนยันการทอย"));
      },
      onError: () => { localPreview(true); setGmNote(label(language, "The GM could not be reached, so the local rules engine prepared a safe preview instead.", "ติดต่อ AI GM ไม่ได้ ระบบกติกาในเครื่องจึงเตรียมการวิเคราะห์สำรองให้")); },
    });
  };
  const resolve = () => {
    if (!preview || game.credits <= 0) return;
    const record = resolveRoll(preview, game, spendMomentum);
    const resolved = applyRoll(game, record);
    const localCommit = () => { onUpdate({ ...resolved, credits: game.credits - 1 }, `${record.summary} · Auto Save updated at Leaf ${record.tick}`); setPreview(null); setAction(""); setSpendMomentum(false); };
    if (!isAuthenticated) { localCommit(); return; }
    setGmNote(label(language, "The GM is recording the consequence…", "AI GM กำลังจดผลที่ตามมา…"));
    resolveGM.mutate({ language, context: toGMContext(game), action, roll: { outcome: record.outcome, total: record.total, difficulty: record.difficulty, summary: record.summary, consequence: record.consequence ?? null } }, {
      onSuccess: (answer) => {
        const withNarration: GameState = {
          ...withHistoricalBoundary(resolved, { status: answer.historicalStatus, fence: answer.historicalFence }),
          currentScene: { ...resolved.currentScene, title: answer.sceneTitle, body: answer.narration, prompt: answer.missionNote, suggestedActions: answer.nextChoices },
          memories: [...resolved.memories, { id: `gm-memory-${Date.now()}`, kind: "news", title: answer.memory.title, detail: answer.memory.detail, tone: answer.memory.tone, tick: resolved.tick }, { id: `gm-history-${Date.now()}`, kind: "witness", title: label(language, `Historical boundary · ${historicalStatusLabel(answer.historicalStatus, "en")}`, `ขอบเขตประวัติศาสตร์ · ${historicalStatusLabel(answer.historicalStatus, "th")}`), detail: answer.historicalFence, tone: historicalTone(answer.historicalStatus), tick: resolved.tick }],
        };
        spendCredit.mutate({ amount: 1 }, {
          onSuccess: ({ credits }) => {
            onUpdate({ ...withNarration, credits }, `${record.summary} · AI GM recorded the next leaf`);
            onAccountCreditChange();
            setPreview(null); setAction(""); setSpendMomentum(false); setGmNote("");
          },
          onError: () => {
            onUpdate({ ...resolved, credits: 0 }, label(language, "No account AI GM credits remain; the deterministic result was saved locally.", "เครดิต AI GM ของบัญชีหมดแล้ว จึงบันทึกผลจากกติกาไว้ในเครื่อง"));
            setPreview(null); setAction(""); setSpendMomentum(false); setGmNote("");
          },
        });
      },
      onError: () => { setGmNote(label(language, "The GM response was unavailable; the deterministic result was saved locally.", "AI GM ยังตอบไม่ได้ จึงบันทึกผลจากกติกาที่ตายตัวไว้ในเครื่อง")); localCommit(); },
    });
  };
  return <div className="page game-view"><div className="game-toolbar"><div><SectionKicker>{label(language, `PLAYING · LEAF ${game.tick}`, `กำลังเล่น · หน้าที่ ${game.tick}`)}</SectionKicker><strong>{game.campaign.title} · {game.currentScene.location}</strong></div><div className="game-toolbar__actions"><button onClick={() => open("save")}><SengokuIcon name="log" size={15} tone="ochre" /> {label(language, "Save", "เซฟ")}</button><button onClick={() => open("load")}><SengokuIcon name="document" size={15} tone="navy" /> {label(language, "Load", "โหลด")}</button><span className="credit-inline"><SengokuIcon name="credit" size={15} tone="ochre" /> {game.credits}</span></div></div>
    {lastRoll && <div className="quick-log"><span>LEAF {lastRoll.tick}</span><strong>{lastRoll.summary}</strong><i>2d12: {lastRoll.dice.join(" + ")} · {lastRoll.total} / DN {lastRoll.difficulty}</i><i>{lastRoll.momentumSpent ? "+2 momentum spent" : "no momentum"}</i><b>{titleCase(lastRoll.outcome)}</b></div>}
    {game.historicalBoundary?.tick === game.tick && <HistoricalBoundaryPanel historical={game.historicalBoundary} language={language} resolved />}
    <section className="game-paper"><div className="game-paper__header"><span><SengokuIcon name="memory" tone="vermilion" /> {game.currentScene.title}</span><button onClick={() => open("log")}><SengokuIcon name="log" size={16} tone="navy" /> {label(language, "Campaign Log", "บันทึกเรื่องราว")}</button></div><div className="scene-context"><SengokuIcon name="history" tone="ochre" /><span>{game.currentScene.publicContext}</span></div><div className="game-story">{game.currentScene.body.map((paragraph, index) => <p key={`${game.currentScene.id}-${index}`}>{paragraph}</p>)}<p className="reader-question">{game.currentScene.prompt}</p></div><div className="scene-suggestions">{game.currentScene.suggestedActions.map((suggestion) => <button key={suggestion} onClick={() => setAction(suggestion)}>{suggestion}<ArrowRight size={14} /></button>)}</div>
      <div className="action-dock"><div className="action-tabs"><button className={!preview ? "active" : ""} onClick={() => setPreview(null)}>{label(language, "Your action", "การกระทำของเจ้า")}</button><button className={preview ? "active" : ""} onClick={() => action.trim() && analyze(true)}>{label(language, "Confirm the roll", "ยืนยันก่อนทอย")}</button></div><div className={`gm-consult ${isAuthenticated ? "is-ready" : ""}`}><span><SengokuIcon name="relation" tone={isAuthenticated ? "teal" : "ochre"} /> {isAuthenticated ? label(language, "AI GM will read this campaign record before you roll.", "AI GM จะอ่านระเบียนแคมเปญนี้ก่อนเจ้ายืนยันการทอย") : label(language, "Local rules are playable now. Sign in to ask the AI GM for a contextual ruling.", "กติกาในเครื่องเล่นได้ทันที เข้าสู่ระบบเพื่อขอคำวินิจฉัยจาก AI GM")}</span>{!isAuthenticated && <button onClick={onLogin}>{label(language, "SIGN IN FOR AI GM", "เข้าสู่ระบบเพื่อใช้ AI GM")}</button>}</div>{gmNote && <p className="gm-note">{gmNote}</p>}<label className="action-field"><span>{label(language, "Say what you will do in one sentence", "บอกสิ่งที่เจ้าจะทำเพียงหนึ่งประโยค")}</span><textarea value={action} placeholder={label(language, "For example: I will use the ledger to ask the scribe for time.", "ตัวอย่าง: ข้าจะใช้บัญชีข้าวขอเวลาเจรจากับเสมียน") } onChange={(event) => { setAction(event.target.value); setPreview(null); setGmNote(""); }} /></label>
      {!preview ? <div className="action-dock__bottom"><p>{label(language, "Assess risk shows only the pressure. Analyze action asks the GM for a contextual interpretation that you may correct once before rolling.", "ประเมินความยากจะแสดงเพียงแรงกดดัน ส่วนวิเคราะห์การกระทำจะให้ GM อ่านบริบทเพื่อให้แก้ได้หนึ่งครั้งก่อนทอย")}</p><div className="action-actions"><Button className="df-button df-button--ghost" onClick={() => analyze(false)} disabled={!action.trim() || analyzeGM.isPending}><EyeOff size={16} /> {label(language, "ASSESS RISK", "ประเมินความยาก")}</Button><Button className="df-button df-button--primary" onClick={() => analyze(true)} disabled={!action.trim() || analyzeGM.isPending}><Eye size={16} /> {analyzeGM.isPending ? label(language, "GM IS READING…", "GM กำลังอ่าน…") : label(language, "ASK THE GM", "ถาม AI GM")}</Button></div></div> : <RollPreviewPanel preview={preview} language={language} momentum={game.character.vitals.momentum} spendMomentum={spendMomentum} setSpendMomentum={setSpendMomentum} onCancel={() => setPreview(null)} onResolve={resolve} isResolving={resolveGM.isPending} />}</div></section>
  </div>;
}

export function RollPreviewPanel({ preview, language, momentum, spendMomentum, setSpendMomentum, onCancel, onResolve, isResolving }: { preview: RollPreview; language: Language; momentum: number; spendMomentum: boolean; setSpendMomentum: (value: boolean) => void; onCancel: () => void; onResolve: () => void; isResolving: boolean }) {
  const axis = AXES.find((entry) => entry.id === preview.axis);
  const isRiskOnly = Boolean(preview.isRiskOnly);
  return <div className="roll-preview-panel"><div className="preview-grid"><div><small>{label(language, "Intent", "เจตนา")}</small><strong>{preview.intent}</strong></div><div><small>{label(language, "Method", "วิธี")}</small><strong>{preview.method}</strong></div><div><small>{label(language, "Difficulty", "ระดับความยาก")}</small><strong>DN {preview.difficulty}</strong></div>{!isRiskOnly && <><div><small>{label(language, "Axis", "แกนทอย")}</small><strong>{language === "en" ? axis?.en : axis?.th}</strong></div><div><small>{label(language, "Mastery", "ความชำนาญ")}</small><strong>{preview.mastery?.label ?? label(language, "None", "ไม่มี") } +{preview.mastery?.level ?? 0}</strong></div><div><small>{label(language, "Context", "โบนัสบริบท")}</small><strong>{preview.contextReason ? `${preview.contextReason} +${preview.contextBonus}` : label(language, "No bonus", "ไม่มีโบนัส")}</strong></div></>}</div><div className="risk-strip"><CircleList title={label(language, "Visible risks", "ความเสี่ยงที่เห็น")} values={preview.risks} /></div>{preview.historical && <HistoricalBoundaryPanel historical={preview.historical} language={language} />}{isRiskOnly ? <div className="credit-confirm"><p>{label(language, "Risk assessment does not reveal which trait or mastery the engine would use. Choose Analyze Action when ready to verify that interpretation.", "การประเมินความยากจะไม่เฉลยแกนหรือความชำนาญ กดวิเคราะห์การกระทำเมื่อพร้อมตรวจความเข้าใจของระบบ")}</p><Button className="df-button df-button--ghost" onClick={onCancel}>{label(language, "REVISE ACTION", "แก้การกระทำ")}</Button></div> : <div className="roll-confirmation"><label className="momentum-check"><input type="checkbox" checked={spendMomentum} disabled={momentum <= 0 || isResolving} onChange={(event) => setSpendMomentum(event.target.checked)} /><span>{label(language, "Spend 1 Momentum for +2 after the roll", "ใช้แรงฮึด 1 เพื่อ +2 หลังทอย") } · {momentum}/2</span></label><div className="action-actions"><Button className="df-button df-button--ghost" onClick={onCancel} disabled={isResolving}>{label(language, "REVISE", "แก้ความเข้าใจ")}</Button><Button className="df-button df-button--primary" onClick={onResolve} disabled={isResolving}>{isResolving ? label(language, "GM RECORDING…", "GM กำลังบันทึก…") : label(language, "CONFIRM & ROLL · 1 CREDIT", "ยืนยันและทอย · 1 เครดิต")} <ArrowRight size={16} /></Button></div></div>}</div>;
}

export function HistoricalBoundaryPanel({ historical, language, resolved = false }: { historical: NonNullable<RollPreview["historical"]>; language: Language; resolved?: boolean }) {
  return <section className={`historical-boundary historical-boundary--${historical.status} ${resolved ? "historical-boundary--resolved" : ""}`}><div className="historical-boundary__heading"><small>{label(language, resolved ? "HISTORICAL RECORD" : "HISTORICAL BOUNDARY", resolved ? "บันทึกขอบเขตประวัติศาสตร์" : "ขอบเขตประวัติศาสตร์")}</small><span>{historicalStatusLabel(historical.status, language)}</span></div><p>{historical.fence}</p></section>;
}

function CircleList({ title, values }: { title: string; values: string[] }) { return <div><small>{title}</small>{values.map((value) => <span key={value}>• {value}</span>)}</div>; }

function MissionsView({ game, language, onUpdate, open }: { game: GameState; language: Language; onUpdate: (next: GameState, message: string) => void; open: (page: PageId) => void }) {
  const accept = (id: string) => onUpdate({ ...game, missions: game.missions.map((mission) => mission.id === id ? { ...mission, state: "active" } : mission) }, "Mission accepted · its deadline is now part of the campaign record");
  return <div className="page mission-view"><div className="page-heading"><div><SectionKicker>MISSIONS · BASE CALLS</SectionKicker><h1>{label(language, "Work that belongs to this world", "งานที่เกิดจากโลกนี้")}</h1><p>{label(language, "Each offer records who asks, what they can reward, and the price that may follow. There is no universal cash reward.", "ภารกิจแต่ละงานบันทึกผู้ขอ รางวัลที่เขาจ่ายได้ และราคาที่อาจตามมา ไม่มีรางวัลเงินสดตายตัว")}</p></div><GhostLink onClick={() => open("play")}>{label(language, "Return to scene", "กลับไปยังฉาก")}</GhostLink></div><section className="mission-ledger">{game.missions.map((mission) => <article className={`mission-folio mission-folio--${mission.state}`} key={mission.id}><div className="folio-marker">{mission.state === "resolved" ? "✓" : mission.state === "active" ? "!" : "?"}</div><div><SectionKicker>{mission.issuerType.toUpperCase()} · {mission.state.toUpperCase()}</SectionKicker><h2>{mission.title}</h2><p>{mission.request}</p><div className="mission-meta"><span><b>{label(language, "Pressure", "แรงกดดัน")}</b>{mission.pressure}</span><span><b>{label(language, "Deadline", "เส้นตาย")}</b>{mission.deadline}</span><span><b>{label(language, "Reward", "รางวัล")}</b>{mission.reward}</span><span><b>{label(language, "Risk", "ความเสี่ยง")}</b>{mission.risk}</span></div><div className="mission-options">{mission.options.map((option) => <button key={option} onClick={() => open("play")}>{option}<ArrowRight size={14} /></button>)}</div></div>{mission.state === "offered" && <Button className="df-button df-button--primary" onClick={() => accept(mission.id)}>{label(language, "ACCEPT", "รับงาน")}</Button>}{mission.state === "active" && <Button className="df-button df-button--ghost" onClick={() => open("play")}>{label(language, "CONTINUE", "ไปต่อ")}</Button>}</article>)}</section></div>;
}

function MarketView({ game, language, onUpdate }: { game: GameState; language: Language; onUpdate: (next: GameState, message: string) => void }) {
  return <div className="page market-view"><div className="page-heading"><div><SectionKicker>MARKET · LOCAL OFFERS</SectionKicker><h1>{label(language, "A market is not a catalogue", "ตลาดไม่ใช่แคตตาล็อก")}</h1><p>{label(language, "The offerings are held in this campaign state. They do not refresh simply because you open this page.", "สินค้าเหล่านี้เก็บอยู่ในสถานะแคมเปญ และจะไม่สุ่มใหม่เพียงเพราะเจ้าเปิดหน้านี้")}</p></div><div className="resource-tally"><span>{label(language, "Property", "ทรัพย์สิน")}<b>{game.character.resources.property}</b></span><span>{label(language, "Supplies", "เสบียง")}<b>{game.character.resources.supplies}</b></span><span>{label(language, "Credit", "เครดิต") }<b>{game.character.resources.credit}</b></span></div></div><div className="market-reason"><SengokuIcon name="history" tone="ochre" />{label(language, `Seasonal offer: ${game.campaign.season}. Prices are illustrative local values shaped by the current route and war pressure.`, `ของตามฤดู: ${seasonThai[game.campaign.season]} ราคาเป็นค่าตัวอย่างในแคมเปญนี้ตามเส้นทางและแรงกดดันจากสงคราม`)}</div><section className="market-list">{game.market.map((offer) => <article className="market-row" key={offer.id}><div><SectionKicker>{offer.kind.toUpperCase()}</SectionKicker><h2>{offer.label}</h2><p>{offer.note}</p></div><span className="market-cost">{offer.price} <small>{label(language, "property", "ทรัพย์สิน")}</small></span><Button className="df-button df-button--ghost" onClick={() => { const result = buyMarketOffer(game, offer.id); onUpdate(result.state, result.message); }}>{label(language, "TAKE OFFER", "รับข้อเสนอ")}</Button></article>)}</section></div>;
}

function CharacterView({ game, language, open }: { game: GameState; language: Language; open: (page: PageId) => void }) {
  const [tab, setTab] = useState<"traits" | "masteries" | "inventory" | "ties">("traits");
  const usedSlots = game.character.inventory.reduce((sum, item) => sum + item.slots, 0);
  return <div className="page character-view"><div className="page-heading"><div><SectionKicker>CHARACTER DOSSIER</SectionKicker><h1>{game.character.name}</h1><p>{game.character.occupation} · {game.character.origin}</p></div><GhostLink onClick={() => open("log")}>{label(language, "View related records", "ดูบันทึกที่เกี่ยวข้อง")}</GhostLink></div><section className="dossier-header"><div className="dossier-name"><span className="mon-avatar mon-avatar--large">火</span><div><h2>{game.character.name}</h2><p>{game.character.strength}</p></div></div><div className="dossier-resources"><span>{label(language, "Wounds", "บาดแผล")}<strong>{game.character.vitals.wounds}/6</strong></span><span>{label(language, "Focus", "ค่าสติ")}<strong>{game.character.vitals.focus}/6</strong></span><span>{label(language, "Momentum", "แรงฮึด")}<strong>{game.character.vitals.momentum}/2</strong></span><span>{label(language, "Rank", "ยศ")}<strong>{game.character.social.rank}</strong></span></div></section><div className="character-columns"><section><div className="tab-strip"><button className={tab === "traits" ? "active" : ""} onClick={() => setTab("traits")}>{label(language, "Traits", "แกนทอย")}</button><button className={tab === "masteries" ? "active" : ""} onClick={() => setTab("masteries")}>{label(language, "Masteries", "ความชำนาญ")}</button><button className={tab === "inventory" ? "active" : ""} onClick={() => setTab("inventory")}>{label(language, "Gear", "สัมภาระ")}</button><button className={tab === "ties" ? "active" : ""} onClick={() => setTab("ties")}>{label(language, "Ties", "แรงดึง")}</button></div>{tab === "traits" && <div className="stat-grid">{AXES.map((axis) => <div className="stat-cell" key={axis.id}><SengokuIcon name="memory" tone="navy" /><strong>{language === "en" ? axis.en : axis.th}</strong><b>{game.character.attributes[axis.id]}</b><small>{axis.hint}</small><button>{label(language, "Used by the action parser", "ระบบเลือกใช้จากการกระทำ")}</button></div>)}</div>}{tab === "masteries" && <div className="mastery-list"><div className="list-title"><span>{label(language, "Mastery", "ความชำนาญ")}</span><span>{label(language, "Bonus", "โบนัส")}</span><span>{label(language, "Origin", "ที่มา")}</span></div>{game.character.masteries.map((entry) => <div className="mastery-row" key={entry.id}><span><SengokuIcon name="memory" size={15} tone="ochre" />{entry.label}</span><strong>+{entry.level}</strong><small>{entry.origin}</small></div>)}</div>}{tab === "inventory" && <div className="inventory-sheet"><div className="inventory-capacity"><span>{label(language, "Carried slots", "ช่องสัมภาระ")}</span><strong>{usedSlots}/8</strong></div>{game.character.inventory.map((entry) => <article key={entry.id}><div><strong>{entry.label}</strong><small>{entry.description}</small></div><span>{titleCase(entry.kind)}</span><b>{entry.slots} {label(language, "slot", "ช่อง")}</b></article>)}</div>}{tab === "ties" && <div className="ties-sheet">{game.character.pulls.map((pull) => <article key={pull.id}><small>{pull.question}</small><strong>{pull.answer}</strong><span>{pull.tags.join(" · ")}</span></article>)}</div>}</section><aside className="status-rail"><SectionKicker>{label(language, "Social record", "สถานะทางสังคม")}</SectionKicker>{[["Honor", "เกียรติ", game.character.social.honor, "teal"], ["Influence", "บารมี", game.character.social.influence, "ochre"], ["Information", "ข่าวในมือ", game.character.social.information, "navy"], ["Stain", "ข้อครหา", game.character.social.stain, "vermilion"]].map(([en, th, value, tone]) => <div className={`status-row status-row--${tone}`} key={en as string}><span className="status-dot" /><strong>{language === "en" ? en : th}</strong><small>{value}</small></div>)}<div className="status-note"><SengokuIcon name="relation" tone="teal" />{label(language, "Social values do not grant automatic obedience. They describe access, attention, and what failure can cost.", "ค่าสถานะสังคมไม่ได้ทำให้ใครเชื่อฟังอัตโนมัติ แต่บอกสิทธิ์เข้าถึง สายตาที่จับจ้อง และราคาของความพลาด")}</div></aside></div></div>;
}

function LogView({ game, language, readerMode, setReaderMode }: { game: GameState; language: Language; readerMode: boolean; setReaderMode: (value: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [readerIndex, setReaderIndex] = useState(0);
  const entries = useMemo(() => [
    ...game.memories.map((memory) => ({ id: memory.id, tick: memory.tick, kind: "Memory", title: memory.title, story: memory.detail, roll: undefined as undefined | typeof game.rolls[number] })),
    ...game.rolls.map((roll) => ({ id: roll.id, tick: roll.tick, kind: "Roll", title: roll.summary, story: roll.narrative, roll })),
  ].sort((a, b) => a.tick - b.tick), [game.memories, game.rolls]);
  const visible = entries.filter((entry) => `${entry.title} ${entry.story}`.toLowerCase().includes(query.toLowerCase()));
  const readerEntry = entries[Math.max(0, Math.min(readerIndex, entries.length - 1))];
  return <div className={`page log-view ${readerMode ? "is-reader" : ""}`}><div className="page-heading"><div><SectionKicker>CAMPAIGN LOG · LOCAL RECORD</SectionKicker><h1>{readerMode ? label(language, "Reader Mode", "โหมดอ่านเรื่อง") : label(language, "What the world remembers", "สิ่งที่โลกจดจำ")}</h1><p>{readerMode ? label(language, "Numbers are set aside so the recorded campaign reads as a continuous war chronicle.", "ซ่อนตัวเลขไว้ชั่วคราว เพื่อให้บันทึกแคมเปญอ่านต่อเนื่องเหมือนนิยายสงคราม") : label(language, "Every roll and world memory is stored locally with the campaign state.", "ทุกการทอยและความทรงจำโลกถูกเก็บในสถานะแคมเปญภายในเครื่อง")}</p></div><div className="reader-switch"><span><EyeOff size={17} /> Reader Mode</span><Switch checked={readerMode} onCheckedChange={setReaderMode} /></div></div>{readerMode ? <section className="reader-paper"><div className="reader-paper__chapter">{game.campaign.title} · LEAF {readerEntry?.tick ?? 1}</div><h2>{readerEntry?.title ?? label(language, "The first page", "หน้าแรก")}</h2><div className="reader-paper__scroll"><p>{readerEntry?.story ?? label(language, "No recorded events yet. Return to Play and make the first choice.", "ยังไม่มีเหตุการณ์ที่บันทึกไว้ กลับไปเล่นฉากแล้วตัดสินใจครั้งแรก")}</p><p className="reader-question">{game.currentScene.prompt}</p></div><div className="reader-paper__footer"><button disabled={readerIndex <= 0} onClick={() => setReaderIndex((index) => Math.max(0, index - 1))}><ArrowLeft size={16} /> {label(language, "Previous", "ก่อนหน้า")}</button><span>{readerIndex + 1} / {Math.max(entries.length, 1)}</span><button disabled={readerIndex >= entries.length - 1} onClick={() => setReaderIndex((index) => Math.min(entries.length - 1, index + 1))}>{label(language, "Next", "ถัดไป")} <ArrowRight size={16} /></button></div></section> : <><div className="log-filter"><button className="active">{label(language, "All records", "ทั้งหมด")}</button><div><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={label(language, "Search records", "ค้นหาบันทึก")} /></div></div><section>{visible.map((entry, index) => <article className="log-entry" key={entry.id}><span className="log-index">{String(index + 1).padStart(2, "0")}</span><div><small>{entry.kind.toUpperCase()} · LEAF {entry.tick}</small><strong>{entry.title}</strong><p>{entry.story}</p>{entry.roll && <i>2d12: {entry.roll.dice.join(" + ")} · total {entry.roll.total} / DN {entry.roll.difficulty}</i>}</div><time>LOCAL</time><ChevronRight size={17} /></article>)}</section></>}</div>;
}

function ArchiveView({ game, language }: { game: GameState; language: Language }) {
  return <div className="page archive-view"><div className="page-heading"><div><SectionKicker>WORLD ARCHIVE · VISIBLE KNOWLEDGE</SectionKicker><h1>{label(language, "The world is more than the current scene", "โลกมีมากกว่าฉากตรงหน้า")}</h1><p>{label(language, "This archive only projects people, conditions, and memories that the local campaign has already made visible.", "คลังนี้แสดงเฉพาะผู้คน สภาวะ และความทรงจำที่แคมเปญในเครื่องได้เปิดให้เห็นแล้ว")}</p></div></div><section className="archive-summary"><div><strong>{game.currentScene.location}</strong><p>{game.currentScene.pressure}</p></div><span>{label(language, "War shadow", "เงาสงคราม")} · {game.campaign.warShadow}/6</span></section><section className="archive-grid"><ArchiveCard icon="relation" title={label(language, "People who matter", "ผู้คนที่เกี่ยวข้อง")} note={`${game.currentScene.speaker} · ${game.missions[0]?.issuer ?? "—"}`} /><ArchiveCard icon="compass" title={label(language, "Mission pressure", "แรงกดดันภารกิจ")} note={game.missions[0]?.pressure ?? "—"} /><ArchiveCard icon="memory" title={label(language, "World memories", "ความทรงจำโลก")} note={`${game.memories.length} ${label(language, "visible records", "รายการที่มองเห็น")}`} /><ArchiveCard icon="credit" title={label(language, "Community condition", "สภาพชุมชน")} note={`${label(language, "Food", "เสบียง")} ${game.community.food}/6 · ${label(language, "Safety", "ความปลอดภัย")} ${game.community.safety}/6`} /></section><section className="memory-ledger"><SectionKicker>{label(language, "RECENT MEMORIES", "ความทรงจำล่าสุด")}</SectionKicker>{game.memories.slice(-5).reverse().map((memory) => <article key={memory.id}><span className={`state-pill state-pill--${memory.tone}`}>{memory.kind}</span><div><strong>{memory.title}</strong><p>{memory.detail}</p></div></article>)}</section></div>;
}

function ArchiveCard({ icon, title, note }: { icon: SengokuIconName; title: string; note: string }) { return <article className="archive-card"><SengokuIcon name={icon} tone="navy" /><div><h2>{title}</h2><p>{note}</p></div><ChevronRight size={17} /></article>; }

function SaveView({ game, saves, language, onSave, open }: { game: GameState; saves: SaveLeaves; language: Language; onSave: (slot: keyof SaveLeaves) => void; open: (page: PageId) => void }) {
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>SAVE GAME · LOCAL ONLY</SectionKicker><h1>{label(language, "Save the leaf before it turns", "บันทึกก่อนเรื่องจะเดินต่อ")}</h1><p>{label(language, "Auto Save follows the current campaign state. Manual leaves are snapshots you choose to keep in this browser.", "Auto Save ตามสถานะแคมเปญปัจจุบัน ส่วนบันทึกด้วยมือคือภาพจำของจุดที่เจ้าเลือกเก็บไว้ในเบราว์เซอร์นี้")}</p></div><GhostLink onClick={() => open("play")}>{label(language, "Return to scene", "กลับไปยังฉาก")}</GhostLink></div><div className="save-management"><SaveRow icon="memory" tone="teal" title="AUTO SAVE" game={game} note={label(language, "Always updated after a campaign change", "อัปเดตทุกครั้งเมื่อสถานะแคมเปญเปลี่ยน")} locked /><SaveRow icon="log" tone="ochre" title="MANUAL SAVE" game={saves.manual} note={label(language, "Overwrite this leaf when you choose", "เขียนทับช่องนี้เมื่อเจ้าต้องการ")} action={() => onSave("manual")} /><SaveRow icon="document" tone="navy" title="SAVED LEAF II" game={saves.leaf2} note={label(language, "A second local checkpoint", "จุดเซฟท้องถิ่นอีกหนึ่งจุด")} action={() => onSave("leaf2")} /><SaveRow icon="document" tone="navy" title="SAVED LEAF III" game={saves.leaf3} note={label(language, "A third local checkpoint", "จุดเซฟท้องถิ่นอีกหนึ่งจุด")} action={() => onSave("leaf3")} /></div></div>;
}

function SaveRow({ icon, tone, title, game, note, action, locked }: { icon: SengokuIconName; tone: "teal" | "ochre" | "navy"; title: string; game: GameState | null; note: string; action?: () => void; locked?: boolean }) { return <article className={`save-slot save-slot--${tone === "teal" ? "auto" : tone === "ochre" ? "manual" : "new"}`}><SengokuIcon name={icon} size={23} tone={tone} /><div><small>{title} · {game ? `LEAF ${game.tick}` : "EMPTY"}</small><h2>{game?.campaign.title ?? "—"}</h2><p>{note}</p></div>{locked ? <span className="save-lock">AUTO</span> : <Button className="df-button df-button--ghost" onClick={action}>{game ? "OVERWRITE" : "SAVE HERE"}</Button>}</article>; }

function LoadView({ game, saves, language, onLoad }: { game: GameState; saves: SaveLeaves; language: Language; onLoad: (slot: "auto" | keyof SaveLeaves) => void }) {
  const slots: { id: "auto" | keyof SaveLeaves; label: string; data: GameState | null; tone: "teal" | "ochre" | "navy" }[] = [{ id: "auto", label: "AUTO SAVE", data: game, tone: "teal" }, { id: "manual", label: "MANUAL SAVE", data: saves.manual, tone: "ochre" }, { id: "leaf2", label: "SAVED LEAF II", data: saves.leaf2, tone: "navy" }, { id: "leaf3", label: "SAVED LEAF III", data: saves.leaf3, tone: "navy" }];
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>LOAD GAME · LOCAL LEAVES</SectionKicker><h1>{label(language, "Return to a recorded leaf", "กลับไปยังหน้าที่บันทึกไว้")}</h1><p>{label(language, "Loading a leaf replaces the active local campaign state. The save itself remains available for another return.", "การโหลดจะแทนสถานะแคมเปญปัจจุบันด้วยหน้าที่บันทึกไว้ โดยตัวเซฟยังอยู่เพื่อให้กลับมาได้อีก")}</p></div></div><div className="save-slots">{slots.map((slot) => <article className={`save-slot save-slot--${slot.tone === "teal" ? "auto" : slot.tone === "ochre" ? "manual" : "new"}`} key={slot.id}><SengokuIcon name="document" size={23} tone={slot.tone} /><div><small>{slot.label} · {slot.data ? `LEAF ${slot.data.tick}` : "EMPTY"}</small><h2>{slot.data?.campaign.title ?? "—"}</h2><p>{slot.data ? `${slot.data.character.name} · ${slot.data.currentScene.title}` : label(language, "No local record in this leaf", "ยังไม่มีบันทึกในช่องนี้")}</p></div><Button className="df-button df-button--ghost" disabled={!slot.data} onClick={() => onLoad(slot.id)}>LOAD <ArrowRight size={16} /></Button></article>)}</div></div>;
}

function SettingsView({ language, setLanguage, darkMode, setDarkMode, fontSize, setFontSize, accent, setAccent, readerMode, setReaderMode, onReset }: { language: Language; setLanguage: (value: Language) => void; darkMode: boolean; setDarkMode: (value: boolean) => void; fontSize: FontSize; setFontSize: (value: FontSize) => void; accent: Accent; setAccent: (value: Accent) => void; readerMode: boolean; setReaderMode: (value: boolean) => void; onReset: () => void }) {
  return <div className="page settings-view"><div className="page-heading"><div><SectionKicker>SETTINGS · THIS BROWSER</SectionKicker><h1>{label(language, "Set the reading room", "จัดหน้ากระดาษให้อ่านสบาย")}</h1><p>{label(language, "Appearance changes do not alter campaign rules. Local Save remains the primary storage for this version.", "การปรับหน้าตาไม่เปลี่ยนกติกาแคมเปญ และเวอร์ชันนี้ใช้ Local Save เป็นที่เก็บข้อมูลหลัก")}</p></div></div><section className="settings-sheet"><SettingRow icon="settings" title={label(language, "Appearance", "โหมดสี")} note={label(language, "Paper by day, ink by night", "กระดาษในกลางวัน หมึกในยามค่ำ")}><Switch checked={darkMode} onCheckedChange={setDarkMode} /></SettingRow><SettingRow icon="document" title={label(language, "Text size", "ขนาดตัวอักษร")} note={label(language, "Change the reading scale", "ปรับขนาดเพื่อการอ่าน") }><div className="segmented">{(["small", "normal", "large"] as FontSize[]).map((size) => <button key={size} className={fontSize === size ? "active" : ""} onClick={() => setFontSize(size)}>{size}</button>)}</div></SettingRow><SettingRow icon="icon" title={label(language, "Seal accent", "สีตราเน้น")} note={label(language, "A personal mark on the ledger", "เครื่องหมายส่วนตัวบนสมุดบัญชี")}><div className="color-options">{(["vermilion", "ochre", "teal"] as Accent[]).map((color) => <button aria-label={color} key={color} className={`color-dot color-dot--${color} ${accent === color ? "active" : ""}`} onClick={() => setAccent(color)} />)}</div></SettingRow><SettingRow icon="log" title="Reader Mode" note={label(language, "Open Campaign Log as continuous prose", "เปิดบันทึกเรื่องราวเป็นโหมดอ่านต่อเนื่อง")}><Switch checked={readerMode} onCheckedChange={setReaderMode} /></SettingRow><SettingRow icon="document" title={label(language, "Language", "ภาษา")} note={label(language, "English is the primary UI language; Thai is a complete alternate mode.", "อังกฤษเป็นภาษาหลักของ UI และไทยเป็นโหมดภาษาที่สอง") }><div className="segmented"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div></SettingRow><SettingRow icon="archive" title={label(language, "Clear Local Save", "ล้าง Local Save")} note={label(language, "This removes the campaign and all local leaves from this browser.", "ลบแคมเปญและจุดเซฟท้องถิ่นทั้งหมดในเบราว์เซอร์นี้") }><Button className="df-button df-button--ghost" onClick={onReset}><RotateCcw size={16} /> RESET</Button></SettingRow></section></div>;
}

function SettingRow({ icon, title, note, children }: { icon: SengokuIconName; title: string; note: string; children: React.ReactNode }) { return <div className="setting-row"><div><SengokuIcon name={icon} tone="navy" /><strong>{title}</strong><small>{note}</small></div><div className="setting-value">{children}</div></div>; }
