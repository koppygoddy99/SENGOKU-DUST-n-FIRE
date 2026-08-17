/**
 * Ledger of Ash design reminder:
 * Narrative area comes before mechanics. Show traceable costs, persistent memory, and Sengoku-ledger motifs.
 */
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  Menu,
  Moon,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SengokuIcon, type SengokuIconName } from "@/components/SengokuIcon";

type PageId = "home" | "start" | "character" | "roll" | "log" | "archive" | "settings" | "icons";

const navItems: { id: PageId; label: string; icon: SengokuIconName }[] = [
  { id: "home", label: "หน้าหลัก", icon: "home" },
  { id: "start", label: "เริ่มเกม", icon: "start" },
  { id: "character", label: "ตัวละคร", icon: "character" },
  { id: "roll", label: "การทอย", icon: "roll" },
  { id: "log", label: "บันทึก LOG", icon: "log" },
  { id: "archive", label: "คลังโลก", icon: "archive" },
  { id: "settings", label: "ตั้งค่า", icon: "settings" },
  { id: "icons", label: "ตราและไอคอน", icon: "icon" },
];

const statePills = [
  { label: "คำสัตย์ต่อหมู่บ้าน", tone: "teal" },
  { label: "หนี้บุญคุณ", tone: "ochre" },
  { label: "ถูกจับตา", tone: "vermilion" },
];

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
  const [rollResolved, setRollResolved] = useState(false);
  const [readerMode, setReaderMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large">("normal");
  const [accent, setAccent] = useState<"vermilion" | "ochre" | "teal">("vermilion");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("ต้นแบบ UI/UX · ข้อมูลทุกอย่างเป็นตัวอย่าง");

  const useCredit = (message: string) => {
    if (credits <= 0) {
      setNotice("เครดิตไม่พอสำหรับการกระทำนี้");
      return false;
    }
    setCredits((value) => value - 1);
    setNotice(message);
    return true;
  };

  const appClass = [
    "app-shell",
    darkMode ? "theme-dark" : "",
    `font-${fontSize}`,
    `accent-${accent}`,
  ].join(" ");

  return (
    <div className={appClass}>
      <header className="topbar">
        <button className="brand" onClick={() => setPage("home")} aria-label="กลับหน้าหลัก">
          <span className="brand-mark"><span /><span /></span>
          <span className="brand-copy"><strong>Dust &amp; Fire</strong><small>SENGOKU STORIES</small></span>
        </button>
        <div className="topbar__context">
          <span>ค.ศ. 1578</span><span className="topbar__dot">•</span><span>ฤดูร้อน</span><span className="topbar__dot">•</span><span>มิกาวะ</span>
        </div>
        <button className="credit-chip" onClick={() => setPage("settings")}>
          <SengokuIcon name="credit" size={16} tone="ochre" />
          <span>เครดิต</span><strong>{credits}</strong>
        </button>
        <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="เปิดเมนู">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__identity">
          <div className="mon-avatar">佐</div>
          <div><strong>ซาเนฟุยุ</strong><span>อาชิงารุ · พลทหารชั้นต้น</span></div>
        </div>
        <nav className="nav-list" aria-label="เมนูหลัก">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "nav-item--active" : ""}`}
              onClick={() => { setPage(item.id); setMenuOpen(false); }}
            >
              <SengokuIcon name={item.icon} size={16} tone={page === item.id ? "vermilion" : "navy"} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__vitals">
          <div className="vital"><span>เลือด</span><strong>6/6</strong><i className="bar bar--red"><b style={{ width: "100%" }} /></i></div>
          <div className="vital"><span>ขวัญ</span><strong>5/6</strong><i className="bar bar--ochre"><b style={{ width: "83%" }} /></i></div>
          <div className="vital"><span>แรงส่ง</span><strong>0/2</strong><i className="bar bar--teal"><b style={{ width: "0%" }} /></i></div>
        </div>
        <div className="sidebar__states">
          <small>สถานะที่มีผล</small>
          {statePills.map((state) => <span key={state.label} className={`state-pill state-pill--${state.tone}`}>{state.label}</span>)}
        </div>
        <div className="sidebar__notice">{notice}</div>
      </aside>

      <main className="main-content">
        {page === "home" && <HomeView setPage={setPage} credits={credits} />}
        {page === "start" && <StartView credits={credits} useCredit={useCredit} setPage={setPage} />}
        {page === "character" && <CharacterView setPage={setPage} />}
        {page === "roll" && <RollView credits={credits} rollResolved={rollResolved} setRollResolved={setRollResolved} useCredit={useCredit} />}
        {page === "log" && <LogView readerMode={readerMode} setReaderMode={setReaderMode} />}
        {page === "archive" && <ArchiveView setPage={setPage} />}
        {page === "settings" && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} accent={accent} setAccent={setAccent} />}
        {page === "icons" && <IconLibraryView />}
      </main>
    </div>
  );
}

function HomeView({ setPage, credits }: { setPage: (page: PageId) => void; credits: number }) {
  return (
    <div className="page home-view">
      <section className="hero-ledger">
        <div className="hero-ledger__spine"><span>FOLIO 01</span><i /></div>
        <div className="hero-ledger__seal">火</div>
        <div>
          <SectionKicker>CAMPAIGN JOURNAL</SectionKicker>
          <h1>เกียรติอยู่บนธง<br/>ความจริงอยู่ใต้เถ้า</h1>
          <p>เลือกทางเข้าของเจ้า แล้วกลับมาสู่เรื่องราวที่โลกยังจดจำไว้</p>
        </div>
        <div className="hero-ledger__actions">
          <Button className="df-button df-button--primary" onClick={() => setPage("start")}><SengokuIcon name="start" size={17} tone="ink" /> ตั้งแคมเปญบทใหม่ <ArrowRight size={18} /></Button>
          <Button className="df-button df-button--ghost" onClick={() => setPage("log")}>เปิดบันทึกเหตุการณ์ล่าสุด</Button>
        </div>
      </section>
      <section className="home-grid">
        <button className="continue-panel" onClick={() => setPage("roll")}>
          <div className="continue-panel__top"><SectionKicker>THE CURRENT LEAF</SectionKicker><span className="save-dot">บันทึกแล้ว</span></div>
          <h2>ค่ายไซกะ · โรงซ่อมปืน</h2>
          <p>มาซาคิจิถูกคุมตัวไว้ งานปืน 30 กระบอกยังค้างอยู่ และกันทาโร่กำลังรอคำตอบของเจ้า</p>
          <span className="continue-panel__link">กลับไปตอบกันทาโร่ <ArrowRight size={17} /></span>
        </button>
        <div className="campaign-card">
          <SectionKicker>CONTEXT MARGIN</SectionKicker>
          <dl>
            <div><dt>เวลา</dt><dd>ค.ศ. 1578 · ฤดูร้อน</dd></div>
            <div><dt>สถานที่ล่าสุด</dt><dd>ค่ายชายแดนมิกาวะ</dd></div>
            <div><dt>สิ่งที่ต้องจำ</dt><dd>เส้นตายซ่อมปืน 3 วัน</dd></div>
            <div><dt>เครดิตคงเหลือ</dt><dd className="credit-inline"><SengokuIcon name="credit" size={15} tone="ochre" /> {credits}</dd></div>
          </dl>
        </div>
      </section>
      <section className="shortcut-row">
        <button onClick={() => setPage("character")}><SengokuIcon name="character" tone="navy" /><span><strong>ตัวละครของฉัน</strong><small>แกนทอย ความชำนาญ สถานะ</small></span><ChevronRight size={18} /></button>
        <button onClick={() => setPage("log")}><SengokuIcon name="log" tone="teal" /><span><strong>บันทึก LOG</strong><small>อ่านตามเวลา หรือ Reader Mode</small></span><ChevronRight size={18} /></button>
        <button onClick={() => setPage("archive")}><SengokuIcon name="archive" tone="vermilion" /><span><strong>คลังโลก</strong><small>ผู้คน ภารกิจ ข่าว และพยาน</small></span><ChevronRight size={18} /></button>
      </section>
    </div>
  );
}

function StartView({ credits, useCredit, setPage }: { credits: number; useCredit: (message: string) => boolean; setPage: (page: PageId) => void }) {
  const [mode, setMode] = useState<"freeform" | "template">("freeform");
  return (
    <div className="page start-view">
      <div className="page-heading"><div><SectionKicker>NEW CAMPAIGN · STEP 1 OF 3</SectionKicker><h1>เริ่มเกมให้ชัด<br/>ก่อนเริ่มเรื่องให้ลึก</h1><p>เลือกบริบทก่อน แล้วระบบจึงช่วยสร้างตัวละครที่อยู่ในโลกนี้ได้จริง</p></div><div className="credit-box"><SengokuIcon name="credit" tone="ochre" /><span>เครดิตคงเหลือ</span><strong>{credits}</strong></div></div>
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
  return <div className="page character-view"><div className="page-heading"><div><SectionKicker>CHARACTER DOSSIER</SectionKicker><h1>ตัวละครของฉัน</h1><p>ข้อมูลสำคัญเห็นทันที รายละเอียดกดดูได้ เหตุผลของโบนัสไม่เคยถูกซ่อน</p></div><GhostLink onClick={() => setPage("log")}>ดูบันทึกที่เกี่ยวข้อง</GhostLink></div><section className="dossier-header"><div className="dossier-name"><span className="mon-avatar mon-avatar--large">佐</span><div><h2>ซาเนฟุยุ</h2><p>อาชิงารุ · พลทหารชั้นต้น · ค่ายชายแดนมิกาวะ</p></div></div><div className="dossier-resources"><span>เลือด <strong>6/6</strong></span><span>ขวัญ <strong>5/6</strong></span><span>แรงส่ง <strong>0/2</strong></span><span>เครดิต <strong>2</strong></span></div></section><div className="character-columns"><section><div className="tab-strip"><button className="active">ภาพรวม</button><button>แกนทอย</button><button>ความชำนาญ</button><button>ของพก</button><button>สถานะ</button></div><div className="stat-grid">{stats.map(([label, text, value, icon]) => <div className="stat-cell" key={label}><SengokuIcon name={icon as SengokuIconName} tone="navy" /><strong>{label}</strong><b>{value}</b><small>{text}</small><button>ดูตัวอย่างการใช้</button></div>)}</div><div className="mastery-list"><div className="list-title"><span>ความชำนาญ</span><span>โบนัส</span><span>ที่มา</span></div>{[["เจรจาต่อรอง", "+2", "อาชีพและประสบการณ์"], ["อ่านตราประทับ", "+2", "จุดเด่น"], ["เอาตัวรอดในค่าย", "+1", "ภูมิหลัง"], ["ปฐมพยาบาล", "+1", "เรียนรู้จากผู้รู้"]].map((row) => <div className="mastery-row" key={row[0]}><span><SengokuIcon name="memory" size={15} tone="ochre" />{row[0]}</span><strong>{row[1]}</strong><small>{row[2]}</small><button>ที่มา</button></div>)}</div></section><aside className="status-rail"><SectionKicker>สถานะที่กำลังมีผล</SectionKicker>{statePills.map((state) => <div className={`status-row status-row--${state.tone}`} key={state.label}><span className="status-dot" /> <strong>{state.label}</strong><small>{state.tone === "vermilion" ? "เสี่ยง" : state.tone === "ochre" ? "ภาระหน้าที่" : "ผูกพัน"}</small></div>)}<div className="status-note"><SengokuIcon name="relation" tone="teal" />ข้อมูลลับยังไม่แสดง จนกว่าตัวละครจะมีทางรู้</div></aside></div></div>;
}

function RollView({ credits, rollResolved, setRollResolved, useCredit }: { credits: number; rollResolved: boolean; setRollResolved: (value: boolean) => void; useCredit: (message: string) => boolean }) {
  const resolve = () => { if (useCredit("ทอยแล้ว · ใช้ 1 เครดิต · ผลลัพธ์ถูกบันทึกใน LOG")) setRollResolved(true); };
  return <div className="page roll-view"><div className="page-heading"><div><SectionKicker>{rollResolved ? "ROLL RESULT" : "SKILL ROLL PREVIEW"}</SectionKicker><h1>{rollResolved ? "สำเร็จมีราคาตามมา" : "วิเคราะห์สกิลทอยก่อนยืนยัน"}</h1><p>{rollResolved ? "ผลสำเร็จถูกเก็บไว้ แต่รอยร้าวของฉากยังเดินทางต่อไปในโลก" : "ผู้เล่นเห็นสิ่งที่ระบบจะใช้ ความเสี่ยง และราคาเครดิตก่อนกดทอย"}</p></div><div className="credit-box"><SengokuIcon name="credit" tone="ochre" /><span>เครดิตคงเหลือ</span><strong>{credits}</strong></div></div><div className="roll-layout"><section className="narrative-panel"><div className="scene-tag">ค่ายไซกะ · โรงซ่อมปืน</div><p className="action-quote">“มาซาคิจิเคยมีเจ้านายเป็นช่างระฆังให้โอดะ เจ้านายเขาเลยให้เขาทำตราสัญลักษณ์บ่อยๆ”</p><div className="analysis-box"><div><strong>ระบบจะใช้</strong><span>ปัญญา +1 · เจรจาต่อรอง +2 · ข้ออ้างเชิงช่าง +2</span></div><div><strong>ความเสี่ยง</strong><span>มาซาคิจิอาจถูกคุมตัว และผู้คุมอาจจดชื่อเจ้าไว้</span></div><div><strong>ระดับความยาก</strong><span>DN 20 · ค่ายไซกะระแวงการเชื่อมโยงกับโอดะ</span></div></div>{rollResolved && <div className="story-result"><SectionKicker>ผลในเรื่อง</SectionKicker><p>กันทาโร่ยอมฟังคำอธิบาย แต่สั่งริบเครื่องมือของมาซาคิจิและบังคับให้ซ่อมปืน 20 กระบอกภายในสามวัน</p></div>}</section><aside className="roll-side"><div className="cost-banner"><SengokuIcon name="credit" tone="ochre" /><div><strong>{rollResolved ? "ทอยครั้งนี้ใช้ 1 เครดิต" : "ยืนยันเพื่อทอย · ใช้ 1 เครดิต"}</strong><span>{rollResolved ? "รับผลและอ่านต่อไม่ใช้เครดิตเพิ่ม" : "ดูตัวอย่าง แก้ความเข้าใจ หรือเปลี่ยนวิธีได้ฟรี"}</span></div></div><div className="dice-breakdown"><span className="dice-symbol">⚄ ⚂</span><div><small>2d12</small><strong>{rollResolved ? "14" : "ยังไม่ทอย"}</strong></div><div><small>โบนัสรวม</small><strong>+6</strong></div><div><small>DN</small><strong className="risk-number">20</strong></div></div>{rollResolved ? <><div className="memory-impact"><h3>สิ่งที่โลกจดจำ</h3><p><span>+</span> ข่าว: บัญชีข้าวมีการปลอมแปลง</p><p><span>!</span> หนี้บุญคุณ: มาซาคิจิติดหนี้เจ้า 1 ครั้ง</p><p><span>!</span> ความร้อน: ผู้คุมด่านจับตาตัวละคร</p></div><Button className="df-button df-button--primary" onClick={() => setRollResolved(false)}>เริ่มตัวอย่างใหม่ <RotateCcw size={17} /></Button></> : <><Button className="df-button df-button--primary" onClick={resolve}>ยืนยันเพื่อทอย · ใช้ 1 เครดิต <ArrowRight size={17} /></Button><Button className="df-button df-button--ghost">แก้ความเข้าใจ</Button><button className="why-button"><CircleAlert size={15} /> ทำไมถึงใช้ค่านี้</button></>}</aside></div></div>;
}

function LogView({ readerMode, setReaderMode }: { readerMode: boolean; setReaderMode: (value: boolean) => void }) {
  return <div className={`page log-view ${readerMode ? "is-reader" : ""}`}><div className="page-heading"><div><SectionKicker>CAMPAIGN LOG</SectionKicker><h1>{readerMode ? "Reader Mode · อ่านเรื่องโดยไม่ต้องอ่านตัวเลข" : "บันทึก LOG · เหตุการณ์ตามเวลา"}</h1><p>{readerMode ? "ระบบซ่อนค่าทอย โบนัส และผลหลังบ้านชั่วคราว เพื่อให้บันทึกไหลเหมือนนิยาย" : "ย้อนดูบทสนทนา การทอย ผลลัพธ์ และสิ่งที่โลกจดจำได้ทีละเหตุการณ์"}</p></div><div className="reader-switch"><span><EyeOff size={17} /> Reader Mode</span><Switch checked={readerMode} onCheckedChange={setReaderMode} /></div></div>{readerMode ? <section className="reader-paper"><div className="reader-paper__chapter">บทที่ 6 · ควันในค่ายไซกะ</div><h2>ตราประทับที่ไม่ควรมีอยู่</h2><div className="reader-paper__scroll"><p>เสียงเขม่าควันและกลิ่นดินปืนอบอ้าวในค่ายไซกะลอยคลุ้ง กันทาโร่ก้มมองตราสัญลักษณ์ในมือด้วยสายตานิ่งขรึม ก่อนจะหรี่ตาจ้องหน้าซาเนฟุยุที่ก้มหน้าตอบด้วยน้ำเสียงกวนแต่หนักแน่น</p><p>“ครับ เป็นมาซาคิจิอย่างที่บอก เขาเคยมีเจ้านายเป็นช่างระฆังให้โอดะขอรับ เจ้านายเขาเลยให้เขาทำตราสัญลักษณ์บ่อยๆ”</p><p>กันทาโร่พ่นลมหายใจออกทางจมูกดัง เหอะ เขาเคาะด้ามหอกลงกับพื้นไม้ตึง “ช่างหล่อระฆังเร่ร่อนเรอะ... ฟังดูมีเหตุผล แต่ที่นี่คือไซกะ ไม่ใช่ถิ่นของพวกโอดะ”</p><p>คำสั่งลงมาอย่างช้า ๆ แต่มิได้เบาลง มาซาคิจิจะไม่ถูกประหารในทันที ทว่าเครื่องมือของเขาถูกริบ และตัวเขาถูกส่งไปยังโรงซ่อมปืนเพื่อไถ่โทษด้วยการซ่อมลำกล้องปืนคาบศิลาให้เสร็จภายในสามวัน</p><p>โทคิจิแค่นยิ้มฟันเหลือง เข้ามากระซิบข้างหูซาเนฟุยุว่า งานปืนสามสิบกระบอกจากซะไกยังไม่หายไปไหน และกันทาโร่จะไม่ลืมความล้มเหลวอีกครั้งแน่</p><p className="reader-question">คุณจะรายงานเรื่องโกดังเอจิยะอย่างไร หรือจะเสนอเงื่อนไขใดกับกันทาโร่?</p></div><div className="reader-paper__footer"><button><ArrowLeft size={16} /> เหตุการณ์ก่อนหน้า</button><span>Reader Mode ซ่อนข้อมูลระบบไว้ชั่วคราว</span><button>เหตุการณ์ถัดไป <ArrowRight size={16} /></button></div></section> : <section className="log-timeline"><div className="log-filter"><button className="active">ทั้งหมด</button><button>บทสนทนา</button><button>การทอย</button><button>ความทรงจำโลก</button><div><Search size={16} /><input placeholder="ค้นเหตุการณ์" /></div></div>{[["บทสนทนา", "ซาเนฟุยุอ้างว่ามาซาคิจิเคยเป็นช่างระฆังให้โอดะ", "12:04"], ["การทอย", "2d12 = 14 · โบนัส +6 · สำเร็จมีราคาตามมา", "12:05"], ["โลกจดจำ", "ผู้คุมด่านจับตาซาเนฟุยุ และมาซาคิจิติดหนี้บุญคุณ", "12:05"], ["ภารกิจ", "งานซ่อมปืน 20 กระบอก · เหลือเวลา 3 วัน", "12:06"]].map((item, index) => <article className="log-entry" key={item[0]}><span className="log-index">0{index + 1}</span><div><small>{item[0]}</small><p>{item[1]}</p></div><time>{item[2]}</time><ChevronRight size={18} /></article>)}</section>}</div>;
}

function ArchiveView({ setPage }: { setPage: (page: PageId) => void }) {
  const categories = [["ผู้คน", "กันทาโร่ · มาซาคิจิ · โทคิจิ", "relation", "teal"], ["สถานที่และฝ่าย", "ค่ายไซกะ · ซะไก · เอจิยะ", "location", "vermilion"], ["ภารกิจ", "ปืน 30 กระบอก · ซ่อม 20 กระบอก", "mission", "ochre"], ["ความทรงจำ", "ข่าว · หนี้ · พยาน · รอยมลทิน", "memory", "navy"]] as const;
  return <div className="page archive-view"><div className="page-heading"><div><SectionKicker>WORLD ARCHIVE</SectionKicker><h1>คลังโลก</h1><p>ค้นสิ่งที่ตัวละครมีสิทธิ์รู้ และเห็นเฉพาะร่องรอยที่ยังมีผลต่อการเลือกครั้งต่อไป</p></div><button className="search-button"><Search size={17} /> ค้นคลังโลก</button></div><div className="archive-summary"><div><strong>สิ่งที่ต้องจำตอนนี้</strong><p>เส้นตายซ่อมปืนเหลือ 3 วัน · กันทาโร่ยังระแวง · ข่าวบัญชีข้าวยังไม่ถูกเปิดเผย</p></div><button onClick={() => setPage("log")}>อ่านใน LOG <ArrowRight size={17} /></button></div><div className="archive-grid">{categories.map(([title, text, icon, tone]) => <button className="archive-card" key={title}><SengokuIcon name={icon as SengokuIconName} tone={tone as "teal" | "vermilion" | "ochre" | "navy"} /><div><h2>{title}</h2><p>{text}</p></div><ChevronRight size={18} /></button>)}</div></div>;
}

function SettingsView({ darkMode, setDarkMode, fontSize, setFontSize, accent, setAccent }: { darkMode: boolean; setDarkMode: (value: boolean) => void; fontSize: "small" | "normal" | "large"; setFontSize: (value: "small" | "normal" | "large") => void; accent: "vermilion" | "ochre" | "teal"; setAccent: (value: "vermilion" | "ochre" | "teal") => void }) {
  return <div className="page settings-view"><div className="page-heading"><div><SectionKicker>PREFERENCES</SectionKicker><h1>ตั้งค่า</h1><p>ปรับหน้ากระดาษให้เข้ากับการอ่านของเจ้า โดยไม่เปลี่ยนข้อมูลหรือกติกาของแคมเปญ</p></div><SengokuIcon name="settings" size={28} tone="vermilion" /></div><section className="settings-sheet"><div className="setting-row"><div><SengokuIcon name="settings" tone="navy" /><strong>โหมดสี</strong><small>สลับหน้ากระดาษสว่างกับหมึกยามค่ำ</small></div><span className="setting-value"><Sun size={16} /> <Switch checked={darkMode} onCheckedChange={setDarkMode} /> <Moon size={16} /></span></div><div className="setting-row"><div><SengokuIcon name="document" tone="ochre" /><strong>ขนาดตัวอักษร</strong><small>ใช้กับหน้าฉาก LOG และ Reader Mode</small></div><div className="segmented"><button className={fontSize === "small" ? "active" : ""} onClick={() => setFontSize("small")}>เล็ก</button><button className={fontSize === "normal" ? "active" : ""} onClick={() => setFontSize("normal")}>ปกติ</button><button className={fontSize === "large" ? "active" : ""} onClick={() => setFontSize("large")}>ใหญ่</button></div></div><div className="setting-row"><div><SengokuIcon name="icon" tone="vermilion" /><strong>สีตราเน้น</strong><small>ใช้กับปุ่มหลัก สถานะสำคัญ และรอยชาดของแคมเปญ</small></div><div className="color-options"><button className={`color-dot color-dot--vermilion ${accent === "vermilion" ? "active" : ""}`} onClick={() => setAccent("vermilion")} /><button className={`color-dot color-dot--ochre ${accent === "ochre" ? "active" : ""}`} onClick={() => setAccent("ochre")} /><button className={`color-dot color-dot--teal ${accent === "teal" ? "active" : ""}`} onClick={() => setAccent("teal")} /></div></div><div className="setting-row"><div><SengokuIcon name="log" tone="teal" /><strong>ค่าเริ่มต้นของ LOG</strong><small>เริ่มต้นที่ Reader Mode เพื่ออ่านเหมือนนิยาย</small></div><Switch defaultChecked /></div><div className="setting-row setting-row--disabled"><div><SengokuIcon name="history" tone="navy" /><strong>ภาษา</strong><small>ภาษาไทยกำลังใช้งานอยู่ · ตัวเลือกภาษาอื่นจะเพิ่มภายหลัง</small></div><button disabled>เร็ว ๆ นี้</button></div><div className="setting-row setting-row--disabled"><div><SengokuIcon name="credit" tone="ochre" /><strong>เครดิตและประวัติการใช้</strong><small>ต้นแบบแสดงค่าเครดิตเพื่อกำหนด UX ยังไม่เชื่อมระบบชำระเงินจริง</small></div><button disabled>ดูตัวอย่าง</button></div></section></div>;
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
