import { ArrowLeft, ClipboardList, LockKeyhole, ShieldCheck } from "lucide-react";
import React from "react";
import type { ManagementItemId } from "./managementData";
import { managementItemFor } from "./managementData";
import "./applicationManagement.css";

type Language = "en" | "th";

function label(language: Language, en: string, th: string) { return language === "en" ? en : th; }

export function ApplicationManagementView({ itemId, language, isAdmin, onBack }: { itemId: ManagementItemId | null; language: Language; isAdmin: boolean; onBack: () => void }) {
  const item = managementItemFor(itemId, isAdmin);
  if (!item) return <main className="page management-page"><section className="management-page__empty"><LockKeyhole size={26} /><h1>{label(language, "This management page is unavailable", "หน้านี้ของการจัดการยังไม่พร้อม")}</h1><p>{label(language, "The available page could not be found for this account view.", "ไม่พบหน้าที่เปิดใช้ได้สำหรับมุมมองบัญชีนี้")}</p><button onClick={onBack}><ArrowLeft size={16} />{label(language, "Back to management", "กลับไปการจัดการ")}</button></section></main>;
  const title = label(language, item.en, item.th);
  const group = label(language, item.groupEn, item.groupTh);
  const description = label(language, item.descriptionEn, item.descriptionTh);
  const supports = language === "en" ? item.supportsEn : item.supportsTh;
  const note = item.noteEn ? label(language, item.noteEn, item.noteTh ?? "") : undefined;
  return <main className="page management-page" data-testid="management-detail-page">
    <button className="management-page__back" onClick={onBack}><ArrowLeft size={16} />{label(language, "Application Management", "การจัดการแอปพลิเคชัน")}</button>
    <header className="management-page__heading"><div><p className="section-kicker">{group} · {label(language, "PREPARING", "กำลังเตรียม")}</p><h1>{title}</h1><p>{description}</p></div><span className="management-page__seal"><ClipboardList size={27} /></span></header>
    <section className="management-page__status"><ShieldCheck size={19} /><div><strong>{label(language, "Preparing — no service is connected", "กำลังเตรียม — ยังไม่เชื่อมบริการ")}</strong><p>{label(language, "This screen contains general structure only. It does not call an API, change campaign data, request login, or submit payment.", "หน้านี้มีเพียงโครงสร้างทั่วไป ไม่เรียก API ไม่แก้ข้อมูลแคมเปญ ไม่ขอเข้าสู่ระบบ และไม่ส่งการชำระเงิน")}</p></div></section>
    <section className="management-page__future"><p className="section-kicker">{label(language, "WHEN THIS AREA IS READY", "เมื่อส่วนนี้พร้อมใช้งาน")}</p><h2>{label(language, "The page will make room for", "หน้านี้จะรองรับ")}</h2><div>{supports.map((entry) => <article key={entry}><span>—</span><p>{entry}</p></article>)}</div></section>
    {note && <aside className="management-page__note"><LockKeyhole size={17} /><p>{note}</p></aside>}
  </main>;
}
