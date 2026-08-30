import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SengokuIcon } from "@/components/SengokuIcon";
import type { GameState } from "@/lib/game";
import { t } from "@/lib/i18n";

type Language = "en" | "th";

export function CampaignsView({ campaigns, activeId, language, onSelect, onNew }: { campaigns: GameState[]; activeId: string; language: Language; onSelect: (game: GameState) => void; onNew: () => void }) {
  return <div className="page campaigns-view"><div className="page-heading"><div><div className="section-kicker">{t(language, "campaigns.kicker")}</div><h1>{t(language, "campaigns.ledger.title")}</h1><p>{t(language, "campaigns.ledger.hint")}</p></div><Button className="df-button df-button--primary" onClick={onNew}><Plus size={17} /> {t(language, "campaigns.new")}</Button></div><div className="save-slots">{campaigns.sort((a, b) => b.tick - a.tick).map((entry) => { const mission = entry.missions.find((item) => item.state !== "resolved") ?? entry.missions[0]; const active = entry.campaign.id === activeId; return <button className={`save-slot ${active ? "save-slot--auto" : "save-slot--manual"}`} key={entry.campaign.id} onClick={() => onSelect(entry)}><SengokuIcon name="archive" tone={active ? "teal" : "ochre"} /><div><small>{active ? t(language, "current.campaign") : t(language, "local.campaign")}</small><h2>{entry.campaign.title}</h2><p>{entry.campaign.year} · {entry.campaign.season} · {entry.campaign.location}<br />{entry.character.name} · {entry.character.occupation} · {t(language, "page.label")} {entry.tick}</p></div><span className="save-lock">{mission?.title ?? t(language, "campaigns.open")} <ChevronRight size={16} /></span></button>; })}</div></div>;
}
