/**
 * Economy-domain types.
 * Depends on base primitives (ItemKind, InventoryCategory, StatId, CurrencyUnit).
 */
import type { InventoryCategory, ItemKind, StatId, CurrencyUnit } from "./base";

export type InventoryItem = {
  id: string;
  label: string;
  kind: ItemKind;
  /** Player-facing category; legacy saves may omit it and are classified during normalization. */
  category?: InventoryCategory;
  slots: number;
  description: string;
  functions: ("unlock" | "bonus" | "exchange")[];
  bonus?: { stat?: StatId; value: number; tags: string[] };
  special?: { mode: "auto_pass" | "dn_zero"; tags: string[]; reason: string };
  condition: "usable" | "used" | "damaged" | "evidence";
  location?: "carried" | "safehouse" | "stored" | "hidden";
  ownership?: "owned" | "borrowed" | "held_for_other" | "disputed";
};

export type MarketOffer = {
  id: string;
  label: string;
  price: number;
  priceUnit?: CurrencyUnit;
  debtAllowed?: boolean;
  kind: "goods" | "service" | "information";
  slots?: number;
  note: string;
  available: boolean;
  priceReason?: string;
};

export type MarketService = {
  id: string;
  provider: string;
  role: string;
  affiliation: string;
  request: string;
  price: string;
  timeCost: string;
  requirement: string;
  witnessRisk: string;
  availability: "available" | "limited" | "unavailable";
};

export type Obligation = {
  id: string;
  kind: "credit" | "debt" | "favor";
  /** Human-readable obligation; never a numeric player credit balance. */
  holder: string;
  subject: string;
  due: string;
  witness: string;
  status: "open" | "settled" | "called_in";
  note: string;
};

export type ExchangeRecord = {
  id: string;
  kind: "purchase" | "credit_purchase" | "service" | "gift" | "debt" | "favor";
  title: string;
  counterpart: string;
  payment: string;
  witness: string;
  consequence: string;
  tick: number;
};

export type EconomyState = {
  marketTitle: string;
  marketContext: string;
  routeStatus: string;
  sellerNetwork: string;
  services: MarketService[];
  obligations: Obligation[];
  transactions: ExchangeRecord[];
};