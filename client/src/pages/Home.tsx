/**
 * Ledger of Ash design reminder:
 * Narrative area comes before mechanics. Show traceable costs, persistent memory, and Sengoku-ledger motifs.
 */
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  Languages,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SengokuIcon, type SengokuIconName } from "@/components/SengokuIcon";

type PageId = "home" | "play" | "start" | "load" | "save" | "character" | "log" | "archive" | "settings" | "icons";
type Language = "en" | "th";

const navItems: { id: PageId; en: string; th: string; icon: SengokuIconName }[] = [
  { id: "home", en: "Home", th: "หน้าหลัก", icon: "home" },
  { id: "play", en: "Play", th: "เล่นเกม", icon: "sword" },
  { id: "start", en: "New Game 1", th: "เกมใหม่ 1", icon: "start" },
  { id: "load", en: "Load Game", th: "โหลดเกม", icon: "document" },
  { id: "save", en: "Save Game", th: "เซฟเกม", icon: "log" },
  { id: "character", en: "Character", th: "ตัวละคร", icon: "character" },
  { id: "log", en: "Campaign Log", th: "บันทึกแคมเปญ", icon: "log" },
  { id: "archive", en: "World Archive", th: "คลังโลก", icon: "archive" },
  { id: "settings", en: "Settings", th: "ตั้งค่า", icon: "settings" },
  { id: "icons", en: "Seals & Icons", th: "ตราและไอคอน", icon: "icon" },
];

const statePills = [
  { en: "Village Oath", th: "คำสัตย์ต่อหมู่บ้าน", tone: "teal" },
  { en: "Debt of Favor", th: "หนี้บุญคุณ", tone: "ochre" },
  { en: "Under Watch", th: "ถูกจับตา", tone: "vermilion" },
];

const uiTranslations: Record<string, string> = {
  "ตัวละครของฉัน": "My Character",
  "ข้อมูลสำคัญเห็นทันที รายละเอียดกดดูได้ เหตุผลของโบนัสไม่เคยถูกซ่อน": "Key facts appear at once. Details stay available, and every bonus has a visible reason.",
  "ดูบันทึกที่เกี่ยวข้อง": "View related entries",
  "อาชิงารุ · พลทหารชั้นต้น · ค่ายชายแดนมิกาวะ": "Ashigaru · Infantry · Mikawa Border Camp",
  "เลือด": "Health",
  "ขวัญ": "Resolve",
  "แรงส่ง": "Momentum",
  "ภาพรวม": "Overview",
  "แกนทอย": "Traits",
  "ความชำนาญ": "Masteries",
  "ของพก": "Carried Items",
  "สถานะ": "States",
  "ดูตัวอย่างการใช้": "View use cases",
  "ที่มา": "Origin",
  "สถานะที่กำลังมีผล": "Active states",
  "ข้อมูลลับยังไม่แสดง จนกว่าตัวละครจะมีทางรู้": "Secret information remains hidden until the character has a way to know it.",
  "สร้างแคมเปญที่หนึ่ง": "Create Campaign One",
  "เริ่มเรื่องให้ชัด": "Begin with a clear premise",
  "หนึ่งบัญชีมีหลายแคมเปญได้ เลือกบริบทของเรื่องนี้ก่อน แล้วระบบจึงช่วยสร้างตัวละครที่อยู่ในโลกนี้ได้จริง": "One account can hold many campaigns. Set this story's context first, then build a character who belongs in this world.",
  "เครดิตคงเหลือ": "Credits remaining",
  "ตั้งชื่อแคมเปญ": "Name the campaign",
  "เรื่องราวบทใหม่ของเจ้า": "Your next story",
  "กำหนดบริบท": "Set the context",
  "ปี ฤดู ภูมิภาค": "Year, season, region",
  "สร้างตัวละคร": "Create the character",
  "พิมพ์เองหรือเลือกสาย": "Write freely or choose a path",
  "ชื่อแคมเปญ": "Campaign name",
  "ฤดูกาล": "Season",
  "ภูมิภาค": "Region",
  "รูปแบบการสร้างตัวละคร": "Character creation",
  "ผู้เล่นไม่แจกแต้มเอง": "Players do not assign numbers themselves",
  "พิมพ์ตัวละครเอง": "Write a character freely",
  "เลือกอาชีพเริ่มต้น 10 สาย": "Choose from 10 starting paths",
  "ตั้งค่า": "Settings",
  "ปรับหน้ากระดาษให้เข้ากับการอ่านของเจ้า โดยไม่เปลี่ยนข้อมูลหรือกติกาของแคมเปญ": "Adjust your reading experience without changing campaign data or rules.",
  "โหมดสี": "Appearance",
  "ขนาดตัวอักษร": "Text size",
  "สีตราเน้น": "Seal accent",
  "ค่าเริ่มต้นของ LOG": "Campaign Log default",
  "เครดิตและประวัติการใช้": "Credits & usage history",
  "บันทึกตรงนี้ ก่อนเรื่องจะเดินต่อ": "Save before the story moves on",
  "กลับไปเล่นเกม": "Return to Play",
  "เลือกบันทึกที่ต้องการกลับไป": "Choose a record to return to",
  "อ่านใน LOG": "Read in Campaign Log",
  "คลังโลก": "World Archive",
  "ค้นคลังโลก": "Search Archive",
  "สิ่งที่ต้องจำตอนนี้": "What matters now",
  "บันทึก LOG · เหตุการณ์ตามเวลา": "Campaign Log · events in order",
  "Reader Mode · อ่านเรื่องโดยไม่ต้องอ่านตัวเลข": "Reader Mode · story without numbers",
  "เหตุการณ์ก่อนหน้า": "Previous entry",
  "เหตุการณ์ถัดไป": "Next entry",
  "ทั้งหมด": "All",
  "บทสนทนา": "Dialogue",
  "การทอย": "Rolls",
  "ความทรงจำโลก": "World memory",
  "ค้นเหตุการณ์": "Search entries",
  "บันทึกเหตุการณ์": "Campaign Log",
  "เซฟเกม": "Save Game",
  "โหลดเกม": "Load Game",
  "เจ้าจะทำอย่างไรต่อ?": "What will you do next?",
  "ทอยตามการกระทำ": "Roll the action",
  "ประเมินความยาก": "Estimate difficulty",
  "ระดับความยาก": "Difficulty",
  "ผลรวมโดยประมาณที่ต้องผ่าน": "Estimated target",
  "กลไกที่โลกจะตรวจ": "What the world will test",
};

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <div className="section-kicker">{children}</div>;
}

function GhostLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button className="ghost-link" onClick={onClick}>
      {children} <ChevronRight size={15} />
    </button>
  );
}

export default function Home() {
  const [page, setPage] = useState<PageId>("home");
  const [credits, setCredits] = useState(12);
  const [readerMode, setReaderMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large">("normal");
  const [accent, setAccent] = useState<"vermilion" | "ochre" | "teal">("vermilion");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [notice, setNotice] = useState("UI/UX prototype · all data is illustrative");
  const [currentLog, setCurrentLog] = useState(3);
  const [manualSaveLog, setManualSaveLog] = useState(1);
  const [autoSaveLog, setAutoSaveLog] = useState(3);
  const [namedSaveLog, setNamedSaveLog] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);
    nodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      const current = textNode.textContent?.trim();
      if (!parent || !current || parent.closest("textarea, input, option")) return;
      const source = parent.dataset.localeSource ?? current;
      if (!parent.dataset.localeSource && uiTranslations[source]) parent.dataset.localeSource = source;
      const translation = uiTranslations[parent.dataset.localeSource ?? ""];
      if (translation) textNode.textContent = language === "en" ? translation : parent.dataset.localeSource ?? current;
    });
  }, [language, page]);

  const useCredit = (message: string) => {
    if (credits <= 0) {
      setNotice("เครดิตไม่พอสำหรับการกระทำนี้");
      return false;
    }
    setCredits((value) => value - 1);
    setNotice(message);
    return true;
  };

  const saveManual = () => {
    setManualSaveLog(currentLog);
    setNotice(`บันทึกปกติถูกเขียนทับที่ LOG ${currentLog}`);
  };

  const saveAsNew = () => {
    setNamedSaveLog(currentLog);
    setNotice(`สร้างช่องบันทึกใหม่จาก LOG ${currentLog}`);
  };

  const loadGame = (log: number, type: string) => {
    setCurrentLog(log);
    setNotice(`โหลด ${type} ที่ LOG ${log} แล้ว`);
    setPage("play");
  };

  const appClass = [
    "app-shell",
    darkMode ? "theme-dark" : "",
    `font-${fontSize}`,
    `accent-${accent}`,
    sidebarCollapsed ? "sidebar-collapsed" : "",
  ].join(" ");

  return (
    <div className={appClass}>
      <header className="topbar">
        <button className="brand" onClick={() => setPage("home")} aria-label="กลับหน้าหลัก">
          <span className="brand-mark"><span /><span /></span>
          <span className="brand-copy"><strong>Dust &amp; Fire</strong><small>SENGOKU STORIES</small></span>
        </button>
        <div className="topbar__context">
          <span>{language === "en" ? "1578" : "ค.ศ. 1578"}</span><span className="topbar__dot">•</span><span>{language === "en" ? "Summer" : "ฤดูร้อน"}</span><span className="topbar__dot">•</span><span>{language === "en" ? "Mikawa" : "มิกาวะ"}</span>
        </div>
        <button className="credit-chip" onClick={() => setPage("settings")}>
          <SengokuIcon name="credit" size={16} tone="ochre" />
          <span>{language === "en" ? "Credits" : "เครดิต"}</span><strong>{credits}</strong>
        </button>
        <div className="topbar-language" aria-label="Language selection"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div>
        <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="เปิดเมนู">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""} ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
        <div className="sidebar__identity">
          <div className="mon-avatar">佐</div>
          <div className="sidebar__identity-copy"><strong>{language === "en" ? "Sanefuyu" : "ซาเนฟุยุ"}</strong><span>{language === "en" ? "Ashigaru · Infantry" : "อาชิงารุ · พลทหารชั้นต้น"}</span></div>
        </div>
        <nav className="nav-list" aria-label="เมนูหลัก">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "nav-item--active" : ""}`}
              onClick={() => { setPage(item.id); setMenuOpen(false); }}
              title={language === "en" ? item.en : item.th}
            >
              <SengokuIcon name={item.icon} size={16} tone={page === item.id ? "vermilion" : "navy"} />
              <span className="nav-item__label">{language === "en" ? item.en : item.th}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__vitals">
          <div className="vital"><span>{language === "en" ? "Health" : "เลือด"}</span><strong>6/6</strong><i className="bar bar--red"><b style={{ width: "100%" }} /></i></div>
          <div className="vital"><span>{language === "en" ? "Resolve" : "ขวัญ"}</span><strong>5/6</strong><i className="bar bar--ochre"><b style={{ width: "83%" }} /></i></div>
          <div className="vital"><span>{language === "en" ? "Momentum" : "แรงส่ง"}</span><strong>0/2</strong><i className="bar bar--teal"><b style={{ width: "0%" }} /></i></div>
        </div>
        <div className="sidebar__states">
          <small>{language === "en" ? "Active states" : "สถานะที่มีผล"}</small>
          {statePills.map((state) => <span key={state.en} className={`state-pill state-pill--${state.tone}`}>{language === "en" ? state.en : state.th}</span>)}
        </div>
        <div className="sidebar__language"><Languages size={15} /><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button><span>/</span><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>TH</button></div>
        <div className="sidebar__notice">{notice}</div>
      </aside>

      <main className="main-content">
        {page === "home" && <HomeView setPage={setPage} credits={credits} language={language} />}
        {page === "play" && <GameView credits={credits} useCredit={useCredit} currentLog={currentLog} setCurrentLog={setCurrentLog} setAutoSaveLog={setAutoSaveLog} onSave={saveManual} setPage={setPage} />}
        {page === "start" && <StartView credits={credits} useCredit={useCredit} setPage={setPage} />}
        {page === "load" && <LoadGameView autoSaveLog={autoSaveLog} manualSaveLog={manualSaveLog} namedSaveLog={namedSaveLog} onLoad={loadGame} />}
        {page === "save" && <SaveGameView currentLog={currentLog} manualSaveLog={manualSaveLog} autoSaveLog={autoSaveLog} namedSaveLog={namedSaveLog} onOverwrite={saveManual} onSaveAsNew={saveAsNew} setPage={setPage} />}
        {page === "character" && <CharacterView setPage={setPage} />}
        {page === "log" && <LogView readerMode={readerMode} setReaderMode={setReaderMode} />}
        {page === "archive" && <ArchiveView setPage={setPage} />}
        {page === "settings" && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} accent={accent} setAccent={setAccent} language={language} setLanguage={setLanguage} />}
        {page === "icons" && <IconLibraryView />}
      </main>
    </div>
  );
}

function HomeView({ setPage, credits, language }: { setPage: (page: PageId) => void; credits: number; language: Language }) {
  const en = language === "en";
  return (
    <div className="page home-view">
      <section className="hero-ledger">
        <div className="hero-ledger__spine"><span>FOLIO 01</span><i /></div>
        <div className="hero-ledger__seal">火</div>
        <div>
          <SectionKicker>CAMPAIGN JOURNAL</SectionKicker>
          <h1>{en ? <>Honor on the banner.<br/>Truth under ash.</> : <>เกียรติอยู่บนธง<br/>ความจริงอยู่ใต้เถ้า</>}</h1>
          <p>{en ? "Choose where to enter, then return to the story the world still remembers." : "เลือกทางเข้าของเจ้า แล้วกลับมาสู่เรื่องราวที่โลกยังจดจำไว้"}</p>
        </div>
        <div className="hero-ledger__actions">
          <Button className="df-button df-button--primary" onClick={() => setPage("start")}><SengokuIcon name="start" size={17} tone="ink" /> NEW GAME 1 <ArrowRight size={18} /></Button>
          <Button className="df-button df-button--ghost" onClick={() => setPage("load")}>LOAD GAME</Button>
        </div>
      </section>
      <section className="home-grid">
        <button className="continue-panel" onClick={() => setPage("play")}>
          <div className="continue-panel__top"><SectionKicker>THE CURRENT LEAF</SectionKicker><span className="save-dot">{en ? "SAVED" : "บันทึกแล้ว"}</span></div>
          <h2>{en ? "Saika Camp · Gun Workshop" : "ค่ายไซกะ · โรงซ่อมปืน"}</h2>
          <p>{en ? "Masakichi is under guard. Thirty guns remain unaccounted for, and Gantaro is waiting for your answer." : "มาซาคิจิถูกคุมตัวไว้ งานปืน 30 กระบอกยังค้างอยู่ และกันทาโร่กำลังรอคำตอบของเจ้า"}</p>
          <span className="continue-panel__link">{en ? "Return to this scene" : "กลับไปเล่นฉากนี้"} <ArrowRight size={17} /></span>
        </button>
        <div className="campaign-card">
          <SectionKicker>CONTEXT MARGIN</SectionKicker>
          <dl>
            <div><dt>{en ? "Time" : "เวลา"}</dt><dd>{en ? "1578 · Summer" : "ค.ศ. 1578 · ฤดูร้อน"}</dd></div>
            <div><dt>{en ? "Last location" : "สถานที่ล่าสุด"}</dt><dd>{en ? "Mikawa border camp" : "ค่ายชายแดนมิกาวะ"}</dd></div>
            <div><dt>{en ? "Remember" : "สิ่งที่ต้องจำ"}</dt><dd>{en ? "3 days to repair the guns" : "เส้นตายซ่อมปืน 3 วัน"}</dd></div>
            <div><dt>{en ? "Credits" : "เครดิตคงเหลือ"}</dt><dd className="credit-inline"><SengokuIcon name="credit" size={15} tone="ochre" /> {credits}</dd></div>
          </dl>
        </div>
      </section>
      <section className="shortcut-row">
        <button onClick={() => setPage("save")}><SengokuIcon name="log" tone="ochre" /><span><strong>{en ? "Save Game" : "เซฟเกม"}</strong><small>{en ? "New save, overwrite, and Auto Save" : "บันทึกใหม่ บันทึกทับ และ Auto Save"}</small></span><ChevronRight size={18} /></button>
        <button onClick={() => setPage("character")}><SengokuIcon name="character" tone="navy" /><span><strong>{en ? "Character" : "ตัวละครของฉัน"}</strong><small>{en ? "Traits, masteries, and states" : "แกนทอย ความชำนาญ สถานะ"}</small></span><ChevronRight size={18} /></button>
        <button onClick={() => setPage("log")}><SengokuIcon name="log" tone="teal" /><span><strong>{en ? "Campaign Log" : "บันทึก LOG"}</strong><small>{en ? "Timeline and Reader Mode" : "อ่านตามเวลา หรือ Reader Mode"}</small></span><ChevronRight size={18} /></button>
        <button onClick={() => setPage("archive")}><SengokuIcon name="archive" tone="vermilion" /><span><strong>{en ? "World Archive" : "คลังโลก"}</strong><small>{en ? "People, missions, news, and witnesses" : "ผู้คน ภารกิจ ข่าว และพยาน"}</small></span><ChevronRight size={18} /></button>
      </section>
    </div>
  );
}

function StartView({ credits, useCredit, setPage }: { credits: number; useCredit: (message: string) => boolean; setPage: (page: PageId) => void }) {
  const [mode, setMode] = useState<"freeform" | "template">("freeform");
  return (
    <div className="page start-view">
      <div className="page-heading"><div><SectionKicker>NEW GAME 1 · STEP 1 OF 3</SectionKicker><h1>สร้างแคมเปญที่หนึ่ง<br/>เริ่มเรื่องให้ชัด</h1><p>หนึ่งบัญชีมีหลายแคมเปญได้ เลือกบริบทของเรื่องนี้ก่อน แล้วระบบจึงช่วยสร้างตัวละครที่อยู่ในโลกนี้ได้จริง</p></div><div className="credit-box"><SengokuIcon name="credit" tone="ochre" /><span>เครดิตคงเหลือ</span><strong>{credits}</strong></div></div>
      <div className="start-layout">
        <ol className="step-rail"><li className="is-current"><span>1</span><div><strong>ตั้งชื่อแคมเปญ</strong><small>เรื่องราวบทใหม่ของเจ้า</small></div></li><li><span>2</span><div><strong>กำหนดบริบท</strong><small>ปี ฤดู ภูมิภาค</small></div></li><li><span>3</span><div><strong>สร้างตัวละคร</strong><small>พิมพ์เองหรือเลือกสาย</small></div></li></ol>
        <section className="start-form">
          <label className="field-label">ชื่อแคมเปญ<input placeholder="เช่น มรสุมเหนือมิกาวะ" defaultValue="เถ้าควันเหนือคิโนะกาวะ" /></label>
          <div className="field-grid"><label className="field-label">ปี (ค.ศ.)<select defaultValue="1578"><option>1578</option><option>1575</option><option>1580</option></select></label><label className="field-label">ฤดูกาล<select defaultValue="summer"><option value="summer">ฤดูร้อน</option><option>ฤดูใบไม้ผลิ</option><option>ฤดูใบไม้ร่วง</option></select></label><label className="field-label">ภูมิภาค<select defaultValue="mikawa"><option value="mikawa">มิกาวะ</option><option>คิอิ</option><option>ซะไก</option></select></label></div>
          <div className="context-check"><Check size={17} /> ระบบจะตรวจความสอดคล้องของปี ฤดู ภูมิภาค และสถานการณ์อำนาจก่อนเริ่มฉาก</div>
          <div className="choice-header"><strong>รูปแบบการสร้างตัวละคร</strong><span>ผู้เล่นไม่แจกแต้มเอง</span></div>
          <div className="choice-grid"><button className={`choice-card ${mode === "freeform" ? "is-selected" : ""}`} onClick={() => setMode("freeform")}><SengokuIcon name="document" tone="navy" /><strong>พิมพ์ตัวละครเอง</strong><p>บอกชื่อ อาชีพ ที่มา จุดเด่น และจุดด้อยได้อย่างอิสระ</p></button><button className={`choice-card ${mode === "template" ? "is-selected" : ""}`} onClick={() => setMode("template")}><SengokuIcon name="compass" tone="ochre" /><strong>เลือกอาชีพเริ่มต้น 10 สาย</strong><p>ใช้แม่แบบเพื่อได้ปัญหาเปิดเกมและเงื่อนไขที่เหมาะกับปี/พื้นที่</p></button></div>
          <div className="credit-confirm"><div><strong>เมื่อกดยืนยันจะใช้ 1 เครดิต</strong><span>การแก้คำตอบและดูตัวอย่างไม่ใช้เครดิต · สุ่มข้อเสนอใหม่ใช้ 1 เครดิต</span></div><Button className="df-button df-button--primary" onClick={() => { if (useCredit("สร้างข้อเสนอตัวละครแล้ว · ใช้ 1 เครดิต")) setPage("character"); }}>เริ่มสร้างตัวละคร · ใช้ 1 เครดิต <ArrowRight size={18} /></Button></div>
        </section>
        <aside className="historical-preview"><SectionKicker>CONTEXT PREVIEW</SectionKicker><h2>ค.ศ. 1578 · ฤดูร้อน</h2><div className="preview-row"><SengokuIcon name="history" tone="vermilion" />เหตุการณ์ระดับภูมิภาคจะถูกใช้เป็นบริบท ไม่บังคับเส้นเรื่อง</div><div className="preview-row"><SengokuIcon name="location" tone="teal" />มิกาวะมีด่าน เส้นทางค้า และกองกำลังที่เปลี่ยนสมดุลภารกิจ</div><div className="preview-row"><SengokuIcon name="roll" tone="ochre" />ค่าตัวละครจะมาจากอาชีพ ภูมิหลัง และข้อเสนอที่เจ้าตรวจได้</div></aside>
      </div>
    </div>
  );
}

function CharacterView({ setPage }: { setPage: (page: PageId) => void }) {
  const stats = [["กาย", "แรง อึด แบก ยื้อ", 3, "sword"], ["มือ", "อาวุธ งานช่าง งานละเอียด", 3, "document"], ["ไหว", "หลบ ลวง สังเกต", 2, "compass"], ["ปัญญา", "บัญชี เอกสาร แผน", 1, "history"], ["ใจ", "ต้านกลัว รักษาคำสัตย์", 3, "memory"]] as const;
  return <div className="page character-view"><div className="page-heading"><div><SectionKicker>CHARACTER DOSSIER</SectionKicker><h1>ตัวละครของฉัน</h1><p>ข้อมูลสำคัญเห็นทันที รายละเอียดกดดูได้ เหตุผลของโบนัสไม่เคยถูกซ่อน</p></div><GhostLink onClick={() => setPage("log")}>ดูบันทึกที่เกี่ยวข้อง</GhostLink></div><section className="dossier-header"><div className="dossier-name"><span className="mon-avatar mon-avatar--large">佐</span><div><h2>ซาเนฟุยุ</h2><p>อาชิงารุ · พลทหารชั้นต้น · ค่ายชายแดนมิกาวะ</p></div></div><div className="dossier-resources"><span>เลือด <strong>6/6</strong></span><span>ขวัญ <strong>5/6</strong></span><span>แรงส่ง <strong>0/2</strong></span><span>เครดิต <strong>2</strong></span></div></section><div className="character-columns"><section><div className="tab-strip"><button className="active">ภาพรวม</button><button>แกนทอย</button><button>ความชำนาญ</button><button>ของพก</button><button>สถานะ</button></div><div className="stat-grid">{stats.map(([label, text, value, icon]) => <div className="stat-cell" key={label}><SengokuIcon name={icon as SengokuIconName} tone="navy" /><strong>{label}</strong><b>{value}</b><small>{text}</small><button>ดูตัวอย่างการใช้</button></div>)}</div><div className="mastery-list"><div className="list-title"><span>ความชำนาญ</span><span>โบนัส</span><span>ที่มา</span></div>{[["เจรจาต่อรอง", "+2", "อาชีพและประสบการณ์"], ["อ่านตราประทับ", "+2", "จุดเด่น"], ["เอาตัวรอดในค่าย", "+1", "ภูมิหลัง"], ["ปฐมพยาบาล", "+1", "เรียนรู้จากผู้รู้"]].map((row) => <div className="mastery-row" key={row[0]}><span><SengokuIcon name="memory" size={15} tone="ochre" />{row[0]}</span><strong>{row[1]}</strong><small>{row[2]}</small><button>ที่มา</button></div>)}</div></section><aside className="status-rail"><SectionKicker>สถานะที่กำลังมีผล</SectionKicker>{statePills.map((state) => <div className={`status-row status-row--${state.tone}`} key={state.en}><span className="status-dot" /> <strong>{state.th}</strong><small>{state.tone === "vermilion" ? "เสี่ยง" : state.tone === "ochre" ? "ภาระหน้าที่" : "ผูกพัน"}</small></div>)}<div className="status-note"><SengokuIcon name="relation" tone="teal" />ข้อมูลลับยังไม่แสดง จนกว่าตัวละครจะมีทางรู้</div></aside></div></div>;
}

function GameView({ credits, useCredit, currentLog, setCurrentLog, setAutoSaveLog, onSave, setPage }: { credits: number; useCredit: (message: string) => boolean; currentLog: number; setCurrentLog: (value: number) => void; setAutoSaveLog: (value: number) => void; onSave: () => void; setPage: (page: PageId) => void }) {
  const [mode, setMode] = useState<"roll" | "estimate">("roll");
  const [action, setAction] = useState("ข้าจะรายงานสถานการณ์ที่โกดังเอจิยะ และขอเงื่อนไขคุ้มครองมาซาคิจิ");
  const [rolled, setRolled] = useState(false);
  const rollAction = () => {
    if (!useCredit("ทอยแล้ว · ใช้ 1 เครดิต · Auto Save ถูกอัปเดต")) return;
    const nextLog = currentLog + 1;
    setCurrentLog(nextLog);
    setAutoSaveLog(nextLog);
    setRolled(true);
  };
  return <div className="page game-view"><div className="game-toolbar"><div><SectionKicker>PLAYING · LOG {currentLog}</SectionKicker><strong>ค่ายไซกะ · โรงซ่อมปืน</strong></div><div className="game-toolbar__actions"><button onClick={onSave}><SengokuIcon name="log" size={15} tone="ochre" /> เซฟเกม</button><button onClick={() => setPage("load")}><SengokuIcon name="document" size={15} tone="navy" /> โหลดเกม</button><span className="credit-inline"><SengokuIcon name="credit" size={15} tone="ochre" /> {credits}</span></div></div>{rolled && <div className="quick-log"><span>LOG {currentLog}</span><strong>เจรจาเรื่องโกดังเอจิยะ</strong><i>ใช้: ปัญญา · เจรจาต่อรอง · ข้ออ้างเชิงช่าง</i><i>ผล 17 / ความยากสูง</i><b>สำเร็จมีราคาตามมา</b></div>}<section className="game-paper"><div className="game-paper__header"><span><SengokuIcon name="memory" tone="vermilion" /> ฉาก: ค่ายไซกะ · โรงซ่อมปืน</span><button onClick={() => setPage("log")}><SengokuIcon name="log" size={16} tone="navy" /> บันทึกเหตุการณ์</button></div><div className="game-story"><p>เสียงเขม่าควันและกลิ่นดินปืนอบอ้าวในค่ายไซกะลอยคลุ้ง กันทาโร่ก้มมองตราสัญลักษณ์ในมือด้วยสายตานิ่งขรึม ก่อนจะหรี่ตาจ้องหน้าซาเนฟุยุอย่างไม่วางใจ</p><p>“ช่างหล่อระฆังเร่ร่อนเรอะ... ฟังดูมีเหตุผล แต่ที่นี่คือไซกะ ไม่ใช่ถิ่นของพวกโอดะ”</p><p>มาซาคิจิถูกพาตัวไปคุมที่โรงซ่อมปืน เขาต้องซ่อมลำกล้องปืนคาบศิลา 20 กระบอกให้เสร็จภายในสามวัน ขณะเดียวกัน โทคิจิย้ำว่างานปืน 30 กระบอกจากซะไกยังค้างอยู่</p>{rolled && <><div className="inline-result"><SectionKicker>ผลหลังทอย</SectionKicker><p>กันทาโร่ยอมฟังรายงานของเจ้า แต่ขอให้เจ้ารับผิดชอบงานขนย้ายปืนด้วยตนเอง เพื่อพิสูจน์ว่าเรื่องโกดังเอจิยะไม่ใช่คำลวง</p></div><p>กันทาโร่หันกลับมามองเจ้า “พูดต่อสิ ซาเนฟุยุ... ถ้าเจ้ารู้ว่าปืนของเราอยู่ที่ใด ก็จงพาเราไปเอามันกลับมา”</p></>}</div><div className="action-dock"><div className="action-tabs"><button className={mode === "roll" ? "active" : ""} onClick={() => setMode("roll")}>ทอยตามการกระทำ</button><button className={mode === "estimate" ? "active" : ""} onClick={() => setMode("estimate")}>ประเมินความยาก</button></div><label className="action-field"><span>เจ้าจะทำอย่างไรต่อ?</span><textarea value={action} onChange={(event) => setAction(event.target.value)} /></label>{mode === "roll" ? <div className="action-dock__bottom"><p>ระบบจะคำนวณแกนทอยและโบนัสเบื้องหลัง แล้วสรุปผลใน LOG หลังทอย</p><Button className="df-button df-button--primary" onClick={rollAction}>ทอยตามการกระทำ · ใช้ 1 เครดิต <ArrowRight size={17} /></Button></div> : <div className="estimate-panel"><div><small>ระดับความยาก</small><strong>ยาก</strong></div><div><small>ผลรวมโดยประมาณที่ต้องผ่าน</small><strong>17+</strong></div><div><small>กลไกที่โลกจะตรวจ</small><span>ความน่าเชื่อถือของคำรายงาน · พยาน · สถานะผู้คุม</span></div><p><EyeOff size={15} /> โหมดนี้ไม่เฉลยแกนทอย ความชำนาญ หรือโบนัสที่ระบบจะเลือกใช้</p><Button className="df-button df-button--primary" onClick={() => setMode("roll")}>กลับไปทอยตามการกระทำ <ArrowRight size={17} /></Button></div>}</div></section></div>;
}

function LoadGameView({ autoSaveLog, manualSaveLog, namedSaveLog, onLoad }: { autoSaveLog: number; manualSaveLog: number; namedSaveLog: number | null; onLoad: (log: number, type: string) => void }) {
  const slots = [{ type: "AUTO SAVE", icon: "memory", tone: "teal", log: autoSaveLog, title: "ออกจากฉากล่าสุด", note: "บันทึกอัตโนมัติเมื่อออกจากแอปหรือเหตุการณ์เปลี่ยน · ล่าสุด", action: "โหลด Auto Save" }, { type: "MANUAL SAVE", icon: "log", tone: "ochre", log: manualSaveLog, title: "เถ้าควันเหนือคิโนะกาวะ", note: "บันทึกด้วยมือ · เก็บไว้ที่จุดก่อนเหตุการณ์ตรวจตรา", action: "โหลด Manual Save" }, ...(namedSaveLog ? [{ type: "SAVE SLOT 2", icon: "document", tone: "navy", log: namedSaveLog, title: "บันทึกสำรอง", note: "ช่องบันทึกที่สร้างเพิ่มจากหน้าเซฟเกม", action: "โหลด Save Slot 2" }] : [])] as const;
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>LOAD GAME</SectionKicker><h1>เลือกบันทึกที่ต้องการกลับไป</h1><p>Auto Save เก็บจุดที่เจ้าอยู่ล่าสุด ส่วน Manual Save เก็บจุดที่เจ้าตั้งใจเก็บไว้ต่างหาก</p></div><div className="save-legend"><span className="legend-auto">● Auto Save</span><span className="legend-manual">◆ Manual Save</span></div></div><div className="save-slots">{slots.map((slot) => <article className={`save-slot save-slot--${slot.type === "AUTO SAVE" ? "auto" : "manual"}`} key={slot.type}><SengokuIcon name={slot.icon as SengokuIconName} size={23} tone={slot.tone as "teal" | "ochre" | "navy"} /><div><small>{slot.type} · LOG {slot.log}</small><h2>{slot.title}</h2><p>{slot.note}</p></div><Button className="df-button df-button--ghost" onClick={() => onLoad(slot.log, slot.type)}>โหลด <ArrowRight size={16} /></Button></article>)}</div><div className="save-explainer"><CircleAlert size={17} /><p><strong>ตัวอย่างการทำงาน:</strong> ถ้า Manual Save ล่าสุดอยู่ที่ LOG 1 แต่เจ้าเล่นต่อถึง LOG 3 แล้วออกจากแอป ระบบจะมี Auto Save ที่ LOG 3 ให้เลือกเสมอ โดยไม่เขียนทับ Manual Save</p></div></div>;
}

function SaveGameView({ currentLog, manualSaveLog, autoSaveLog, namedSaveLog, onOverwrite, onSaveAsNew, setPage }: { currentLog: number; manualSaveLog: number; autoSaveLog: number; namedSaveLog: number | null; onOverwrite: () => void; onSaveAsNew: () => void; setPage: (page: PageId) => void }) {
  return <div className="page save-page"><div className="page-heading"><div><SectionKicker>SAVE GAME</SectionKicker><h1>บันทึกตรงนี้ ก่อนเรื่องจะเดินต่อ</h1><p>ตอนนี้เจ้าอยู่ที่ LOG {currentLog} การบันทึกด้วยมือจะไม่ทำลาย Auto Save ล่าสุด</p></div><GhostLink onClick={() => setPage("play")}>กลับไปเล่นเกม</GhostLink></div><div className="save-management"><article className="save-slot save-slot--manual"><SengokuIcon name="log" size={23} tone="ochre" /><div><small>MANUAL SAVE · LOG {manualSaveLog}</small><h2>เถ้าควันเหนือคิโนะกาวะ</h2><p>บันทึกปกติปัจจุบัน · เลือกบันทึกทับได้เมื่อเจ้าพร้อม</p></div><Button className="df-button df-button--primary" onClick={onOverwrite}>บันทึกทับที่ LOG {currentLog}</Button></article><article className="save-slot save-slot--new"><SengokuIcon name="document" size={23} tone="navy" /><div><small>{namedSaveLog ? `SAVE SLOT 2 · LOG ${namedSaveLog}` : "SAVE SLOT 2 · ว่าง"}</small><h2>{namedSaveLog ? "บันทึกสำรอง" : "สร้างบันทึกใหม่"}</h2><p>{namedSaveLog ? "ช่องนี้จะถูกเขียนทับเมื่อกดบันทึกใหม่อีกครั้ง" : "เก็บจุดปัจจุบันแยกจาก Manual Save เพื่อย้อนกลับภายหลัง"}</p></div><Button className="df-button df-button--ghost" onClick={onSaveAsNew}>{namedSaveLog ? `เขียนทับ LOG ${currentLog}` : `บันทึกใหม่ที่ LOG ${currentLog}`}</Button></article><article className="save-slot save-slot--auto"><SengokuIcon name="memory" size={23} tone="teal" /><div><small>AUTO SAVE · LOG {autoSaveLog}</small><h2>จุดล่าสุดของการเล่น</h2><p>ระบบอัปเดตเมื่อเหตุการณ์จบ เมื่อออกจากหน้าเล่น หรือเมื่อปิดแอป</p></div><span className="save-lock">ระบบจัดการ</span></article></div></div>;
}

function LogView({ readerMode, setReaderMode }: { readerMode: boolean; setReaderMode: (value: boolean) => void }) {
  return <div className={`page log-view ${readerMode ? "is-reader" : ""}`}><div className="page-heading"><div><SectionKicker>CAMPAIGN LOG</SectionKicker><h1>{readerMode ? "Reader Mode · อ่านเรื่องโดยไม่ต้องอ่านตัวเลข" : "บันทึก LOG · เหตุการณ์ตามเวลา"}</h1><p>{readerMode ? "ระบบซ่อนค่าทอย โบนัส และผลหลังบ้านชั่วคราว เพื่อให้บันทึกไหลเหมือนนิยาย" : "ย้อนดูบทสนทนา การทอย ผลลัพธ์ และสิ่งที่โลกจดจำได้ทีละเหตุการณ์"}</p></div><div className="reader-switch"><span><EyeOff size={17} /> Reader Mode</span><Switch checked={readerMode} onCheckedChange={setReaderMode} /></div></div>{readerMode ? <section className="reader-paper"><div className="reader-paper__chapter">บทที่ 6 · ควันในค่ายไซกะ</div><h2>ตราประทับที่ไม่ควรมีอยู่</h2><div className="reader-paper__scroll"><p>เสียงเขม่าควันและกลิ่นดินปืนอบอ้าวในค่ายไซกะลอยคลุ้ง กันทาโร่ก้มมองตราสัญลักษณ์ในมือด้วยสายตานิ่งขรึม ก่อนจะหรี่ตาจ้องหน้าซาเนฟุยุที่ก้มหน้าตอบด้วยน้ำเสียงกวนแต่หนักแน่น</p><p>“ครับ เป็นมาซาคิจิอย่างที่บอก เขาเคยมีเจ้านายเป็นช่างระฆังให้โอดะขอรับ เจ้านายเขาเลยให้เขาทำตราสัญลักษณ์บ่อยๆ”</p><p>กันทาโร่พ่นลมหายใจออกทางจมูกดัง เหอะ เขาเคาะด้ามหอกลงกับพื้นไม้ตึง “ช่างหล่อระฆังเร่ร่อนเรอะ... ฟังดูมีเหตุผล แต่ที่นี่คือไซกะ ไม่ใช่ถิ่นของพวกโอดะ”</p><p>คำสั่งลงมาอย่างช้า ๆ แต่มิได้เบาลง มาซาคิจิจะไม่ถูกประหารในทันที ทว่าเครื่องมือของเขาถูกริบ และตัวเขาถูกส่งไปยังโรงซ่อมปืนเพื่อไถ่โทษด้วยการซ่อมลำกล้องปืนคาบศิลาให้เสร็จภายในสามวัน</p><p>โทคิจิแค่นยิ้มฟันเหลือง เข้ามากระซิบข้างหูซาเนฟุยุว่า งานปืนสามสิบกระบอกจากซะไกยังไม่หายไปไหน และกันทาโร่จะไม่ลืมความล้มเหลวอีกครั้งแน่</p><p className="reader-question">คุณจะรายงานเรื่องโกดังเอจิยะอย่างไร หรือจะเสนอเงื่อนไขใดกับกันทาโร่?</p></div><div className="reader-paper__footer"><button><ArrowLeft size={16} /> เหตุการณ์ก่อนหน้า</button><span>Reader Mode ซ่อนข้อมูลระบบไว้ชั่วคราว</span><button>เหตุการณ์ถัดไป <ArrowRight size={16} /></button></div></section> : <section className="log-timeline"><div className="log-filter"><button className="active">ทั้งหมด</button><button>บทสนทนา</button><button>การทอย</button><button>ความทรงจำโลก</button><div><Search size={16} /><input placeholder="ค้นเหตุการณ์" /></div></div>{[["บทสนทนา", "ซาเนฟุยุอ้างว่ามาซาคิจิเคยเป็นช่างระฆังให้โอดะ", "12:04"], ["การทอย", "2d12 = 14 · โบนัส +6 · สำเร็จมีราคาตามมา", "12:05"], ["โลกจดจำ", "ผู้คุมด่านจับตาซาเนฟุยุ และมาซาคิจิติดหนี้บุญคุณ", "12:05"], ["ภารกิจ", "งานซ่อมปืน 20 กระบอก · เหลือเวลา 3 วัน", "12:06"]].map((item, index) => <article className="log-entry" key={item[0]}><span className="log-index">0{index + 1}</span><div><small>{item[0]}</small><p>{item[1]}</p></div><time>{item[2]}</time><ChevronRight size={18} /></article>)}</section>}</div>;
}

function ArchiveView({ setPage }: { setPage: (page: PageId) => void }) {
  const categories = [["ผู้คน", "กันทาโร่ · มาซาคิจิ · โทคิจิ", "relation", "teal"], ["สถานที่และฝ่าย", "ค่ายไซกะ · ซะไก · เอจิยะ", "location", "vermilion"], ["ภารกิจ", "ปืน 30 กระบอก · ซ่อม 20 กระบอก", "mission", "ochre"], ["ความทรงจำ", "ข่าว · หนี้ · พยาน · รอยมลทิน", "memory", "navy"]] as const;
  return <div className="page archive-view"><div className="page-heading"><div><SectionKicker>WORLD ARCHIVE</SectionKicker><h1>คลังโลก</h1><p>ค้นสิ่งที่ตัวละครมีสิทธิ์รู้ และเห็นเฉพาะร่องรอยที่ยังมีผลต่อการเลือกครั้งต่อไป</p></div><button className="search-button"><Search size={17} /> ค้นคลังโลก</button></div><div className="archive-summary"><div><strong>สิ่งที่ต้องจำตอนนี้</strong><p>เส้นตายซ่อมปืนเหลือ 3 วัน · กันทาโร่ยังระแวง · ข่าวบัญชีข้าวยังไม่ถูกเปิดเผย</p></div><button onClick={() => setPage("log")}>อ่านใน LOG <ArrowRight size={17} /></button></div><div className="archive-grid">{categories.map(([title, text, icon, tone]) => <button className="archive-card" key={title}><SengokuIcon name={icon as SengokuIconName} tone={tone as "teal" | "vermilion" | "ochre" | "navy"} /><div><h2>{title}</h2><p>{text}</p></div><ChevronRight size={18} /></button>)}</div></div>;
}

function SettingsView({ darkMode, setDarkMode, fontSize, setFontSize, accent, setAccent, language, setLanguage }: { darkMode: boolean; setDarkMode: (value: boolean) => void; fontSize: "small" | "normal" | "large"; setFontSize: (value: "small" | "normal" | "large") => void; accent: "vermilion" | "ochre" | "teal"; setAccent: (value: "vermilion" | "ochre" | "teal") => void; language: Language; setLanguage: (value: Language) => void }) {
  const en = language === "en";
  return <div className="page settings-view"><div className="page-heading"><div><SectionKicker>PREFERENCES</SectionKicker><h1>{en ? "Settings" : "ตั้งค่า"}</h1><p>{en ? "Adjust how the campaign ledger reads without changing its rules or records." : "ปรับหน้ากระดาษให้เข้ากับการอ่านของเจ้า โดยไม่เปลี่ยนข้อมูลหรือกติกาของแคมเปญ"}</p></div><SengokuIcon name="settings" size={28} tone="vermilion" /></div><section className="settings-sheet"><div className="setting-row"><div><SengokuIcon name="settings" tone="navy" /><strong>{en ? "Appearance" : "โหมดสี"}</strong><small>{en ? "Switch between paper daylight and night ink." : "สลับหน้ากระดาษสว่างกับหมึกยามค่ำ"}</small></div><span className="setting-value"><Sun size={16} /> <Switch checked={darkMode} onCheckedChange={setDarkMode} /> <Moon size={16} /></span></div><div className="setting-row"><div><SengokuIcon name="document" tone="ochre" /><strong>{en ? "Text size" : "ขนาดตัวอักษร"}</strong><small>{en ? "Used across scenes, the Campaign Log, and Reader Mode." : "ใช้กับหน้าฉาก LOG และ Reader Mode"}</small></div><div className="segmented"><button className={fontSize === "small" ? "active" : ""} onClick={() => setFontSize("small")}>{en ? "Small" : "เล็ก"}</button><button className={fontSize === "normal" ? "active" : ""} onClick={() => setFontSize("normal")}>{en ? "Normal" : "ปกติ"}</button><button className={fontSize === "large" ? "active" : ""} onClick={() => setFontSize("large")}>{en ? "Large" : "ใหญ่"}</button></div></div><div className="setting-row"><div><Languages size={18} /><strong>{en ? "Language" : "ภาษา"}</strong><small>{en ? "English is the default. Thai is available now; more languages can be added later." : "English เป็นภาษาเริ่มต้น · สลับเป็นภาษาไทยได้แล้ว และเพิ่มภาษาอื่นภายหลังได้"}</small></div><div className="segmented"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button><button className={language === "th" ? "active" : ""} onClick={() => setLanguage("th")}>ไทย</button></div></div><div className="setting-row"><div><SengokuIcon name="icon" tone="vermilion" /><strong>{en ? "Seal accent" : "สีตราเน้น"}</strong><small>{en ? "Used for primary actions, significant states, and campaign scars." : "ใช้กับปุ่มหลัก สถานะสำคัญ และรอยชาดของแคมเปญ"}</small></div><div className="color-options"><button className={`color-dot color-dot--vermilion ${accent === "vermilion" ? "active" : ""}`} onClick={() => setAccent("vermilion")} /><button className={`color-dot color-dot--ochre ${accent === "ochre" ? "active" : ""}`} onClick={() => setAccent("ochre")} /><button className={`color-dot color-dot--teal ${accent === "teal" ? "active" : ""}`} onClick={() => setAccent("teal")} /></div></div><div className="setting-row"><div><SengokuIcon name="log" tone="teal" /><strong>{en ? "Campaign Log default" : "ค่าเริ่มต้นของ LOG"}</strong><small>{en ? "Start in Reader Mode to read the campaign like a novel." : "เริ่มต้นที่ Reader Mode เพื่ออ่านเหมือนนิยาย"}</small></div><Switch defaultChecked /></div><div className="setting-row setting-row--disabled"><div><SengokuIcon name="credit" tone="ochre" /><strong>{en ? "Credits & usage history" : "เครดิตและประวัติการใช้"}</strong><small>{en ? "The prototype shows credit UX only; it does not connect to payments." : "ต้นแบบแสดงค่าเครดิตเพื่อกำหนด UX ยังไม่เชื่อมระบบชำระเงินจริง"}</small></div><button disabled>{en ? "Preview" : "ดูตัวอย่าง"}</button></div></section></div>;
}

function IconLibraryView() {
  const icons: { name: SengokuIconName; label: string; use: string; tone: "navy" | "vermilion" | "ochre" | "teal" }[] = [
    { name: "home", label: "ปราสาท/หน้าหลัก", use: "กลับสู่แคมเปญ", tone: "navy" },
    { name: "start", label: "พู่กัน/เริ่มเรื่อง", use: "เริ่มเกมใหม่", tone: "vermilion" },
    { name: "character", label: "ตรานักรบ", use: "ตัวละคร", tone: "navy" },
    { name: "roll", label: "ตราวงกลม/ทอย", use: "วิเคราะห์และทอย", tone: "ochre" },
    { name: "log", label: "ม้วนบันทึก", use: "เหตุการณ์ตามเวลา", tone: "teal" },
    { name: "archive", label: "หีบเอกสาร", use: "คลังโลก", tone: "vermilion" },
    { name: "market", label: "ร้านค้า", use: "ตลาดและการค้า", tone: "ochre" },
    { name: "mission", label: "ธงพิทักษ์", use: "ภารกิจ", tone: "navy" },
    { name: "memory", label: "สมุดความจำ", use: "หนี้ ข่าว พยาน", tone: "teal" },
    { name: "credit", label: "เหรียญ/เครดิต", use: "ค่าใช้การกระทำ", tone: "ochre" },
    { name: "relation", label: "คำพูด/ความสัมพันธ์", use: "คำสัตย์และหนี้", tone: "vermilion" },
    { name: "settings", label: "ตราตั้งค่า", use: "ปรับประสบการณ์", tone: "navy" },
  ];
  return <div className="page icon-view"><div className="page-heading"><div><SectionKicker>SENGOKU ICON SYSTEM</SectionKicker><h1>ตราและไอคอน</h1><p>ไอคอนทุกตัวถูกห่อด้วยวงแหวนมงและรอยหมึก เพื่อให้ดูเหมือนตราหนังสือบัญชีและเอกสารในโลกเซนโกกุ ไม่ใช่ชุดไอคอนแอปทั่วไป</p></div><div className="icon-rules"><strong>กฎการใช้</strong><span>ไอคอนนำหน้า label เสมอ · สีบอกสถานะ ไม่บอกหมวดอย่างเดียว · ใช้ในขนาดเล็กได้ชัด</span></div></div><div className="icon-grid">{icons.map((icon) => <div className="icon-spec" key={icon.label}><SengokuIcon name={icon.name} size={26} tone={icon.tone} /><h2>{icon.label}</h2><p>{icon.use}</p><code>icon:{icon.name}</code></div>)}</div></div>;
}
