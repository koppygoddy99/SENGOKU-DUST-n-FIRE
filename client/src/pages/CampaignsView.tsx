import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SengokuIcon } from "@/components/SengokuIcon";
import type { GameState } from "@/lib/game";

type Language = "en" | "th";

function label(language: Language, en: string, th: string) {
  return language === "en" ? en : th;
}

export function CampaignsView({ campaigns, activeId, language, onSelect, onNew }: { campaigns: GameState[]; activeId: string; language: Language; onSelect: (game: GameState) => void; onNew: () => void }) {
  return <div className="page campaigns-view"><div className="page-heading"><div><div className="section-kicker">{label(language, "LOCAL CAMPAIGNS", "แคมเปญในเครื่อง")}</div><h1>{label(language, "Your campaign ledger", "สารบัญแคมเปญของเจ้า")}</h1><p>{label(language, "Choose a campaign you have played. Its name becomes the active campaign menu on the left.", "เลือกแคมเปญที่เคยเล่น ชื่อของมันจะกลายเป็นเมนูแคมเปญที่กำลังเล่นทางซ้ายทันที")}</p></div><Button className="df-button df-button--primary" onClick={onNew}><Plus size={17} /> {label(language, "NEW CAMPAIGN", "เริ่มแคมเปญใหม่")}</Button></div><div className="save-slots">{campaigns.sort((a, b) => b.tick - a.tick).map((entry) => { const mission = entry.missions.find((item) => item.state !== "resolved") ?? entry.missions[0]; const active = entry.campaign.id === activeId; return <button className={`save-slot ${active ? "save-slot--auto" : "save-slot--manual"}`} key={entry.campaign.id} onClick={() => onSelect(entry)}><SengokuIcon name="archive" tone={active ? "teal" : "ochre"} /><div><small>{active ? label(language, "CURRENT CAMPAIGN", "แคมเปญที่กำลังเล่น") : label(language, "LOCAL CAMPAIGN", "แคมเปญในเครื่อง")}</small><h2>{entry.campaign.title}</h2><p>{entry.campaign.year} · {entry.campaign.season} · {entry.campaign.location}<br />{entry.character.name} · {entry.character.occupation} · {label(language, "Leaf", "หน้า")} {entry.tick}</p></div><span className="save-lock">{mission?.title ?? label(language, "Open campaign", "เปิดแคมเปญ")} <ChevronRight size={16} /></span></button>; })}</div></div>;
}
