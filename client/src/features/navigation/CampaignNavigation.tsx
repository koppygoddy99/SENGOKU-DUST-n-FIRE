/**
 * Campaign navigation - sidebar for the current campaign.
 * Self-contained: owns its item definitions, grouping labels, and active-page
 * highlight. Rendered by Home as part of the page shell.
 */
import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { SengokuIcon, type SengokuIconName } from "@/components/SengokuIcon";
import type { PlayerPageId } from "@/lib/playerRoutes";

type PageId = PlayerPageId;
type Language = "en" | "th";

function label(language: Language, en: string, th: string) {
  return language === "en" ? en : th;
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
