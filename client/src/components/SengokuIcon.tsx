/**
 * Ledger of Ash design reminder:
 * Use archival Sengoku-inspired mon/ledger icon frames, never generic app badges.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BookOpen,
  CalendarDays,
  CircleDot,
  Coins,
  Compass,
  Feather,
  FileText,
  Landmark,
  MapPin,
  MessageSquareText,
  Package,
  ScrollText,
  Settings2,
  Shield,
  Sparkles,
  Store,
  Sword,
  UserRound,
} from "lucide-react";

const iconMap = {
  home: Landmark,
  start: Feather,
  character: UserRound,
  roll: CircleDot,
  log: ScrollText,
  archive: Archive,
  market: Store,
  mission: Shield,
  history: CalendarDays,
  memory: BookOpen,
  location: MapPin,
  credit: Coins,
  inventory: Package,
  relation: MessageSquareText,
  settings: Settings2,
  icon: Sparkles,
  document: FileText,
  compass: Compass,
  sword: Sword,
} as const satisfies Record<string, LucideIcon>;

export type SengokuIconName = keyof typeof iconMap;

export function SengokuIcon({
  name,
  size = 18,
  tone = "navy",
  className = "",
}: {
  name: SengokuIconName;
  size?: number;
  tone?: "navy" | "vermilion" | "ochre" | "teal" | "ink";
  className?: string;
}) {
  const Icon = iconMap[name];
  return (
    <span className={`sengoku-icon sengoku-icon--${tone} ${className}`} aria-hidden="true">
      <span className="sengoku-icon__ring" />
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}
