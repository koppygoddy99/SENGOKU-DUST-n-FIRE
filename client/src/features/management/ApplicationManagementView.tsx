import { ArrowLeft, ClipboardList, LockKeyhole, ShieldCheck } from "lucide-react";
import React from "react";
import type { ManagementItemId } from "./managementData";
import { managementItemFor } from "./managementData";
import { label } from "@/lib/localization";
import { t } from "@/lib/i18n";
import "./applicationManagement.css";

type Language = "en" | "th";

export function ApplicationManagementView({ itemId, language, isAdmin, onBack }: { itemId: ManagementItemId | null; language: Language; isAdmin: boolean; onBack: () => void }) {
  const item = managementItemFor(itemId, isAdmin);
  if (!item) return <main className="page management-page"><section className="management-page__empty"><LockKeyhole size={26} /><h1>{t(language, "management.unavailable.title")}</h1><p>{t(language, "management.unavailable.hint")}</p><button onClick={onBack}><ArrowLeft size={16} />{t(language, "management.back")}</button></section></main>;
  const title = label(language, item.en, item.th);
  const group = label(language, item.groupEn, item.groupTh);
  const description = label(language, item.descriptionEn, item.descriptionTh);
  const supports = language === "en" ? item.supportsEn : item.supportsTh;
  const note = item.noteEn ? label(language, item.noteEn, item.noteTh ?? "") : undefined;
  return <main className="page management-page" data-testid="management-detail-page">
    <button className="management-page__back" onClick={onBack}><ArrowLeft size={16} />{t(language, "management.title")}</button>
    <header className="management-page__heading"><div><p className="section-kicker">{group} · {t(language, "management.preparing")}</p><h1>{title}</h1><p>{description}</p></div><span className="management-page__seal"><ClipboardList size={27} /></span></header>
    <section className="management-page__status"><ShieldCheck size={19} /><div><strong>{t(language, "management.status.title")}</strong><p>{t(language, "management.status.hint")}</p></div></section>
    <section className="management-page__future"><p className="section-kicker">{t(language, "management.ready.kicker")}</p><h2>{t(language, "management.ready.title")}</h2><div>{supports.map((entry) => <article key={entry}><span>—</span><p>{entry}</p></article>)}</div></section>
    {note && <aside className="management-page__note"><LockKeyhole size={17} /><p>{note}</p></aside>}
  </main>;
}
