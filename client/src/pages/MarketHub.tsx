import React, { useState } from "react";
import { ArrowRight, BriefcaseBusiness, Handshake, History, MapPin, ShoppingBasket, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SengokuIcon } from "@/components/SengokuIcon";
import { buyMarketOffer, xpNeededForMasteryLevel, type GameState } from "@/lib/game";
import { localized } from "@/lib/localization";

type Language = "en" | "th";
export type MarketHubTab = "gear" | "market" | "services" | "obligations" | "history";

const copy = (language: Language, en: string, th: string) => language === "en" ? en : th;

const tabs: { id: MarketHubTab; en: string; th: string; Icon: typeof BriefcaseBusiness }[] = [
  { id: "gear", en: "Carried gear", th: "สัมภาระที่พกติดตัว", Icon: BriefcaseBusiness },
  { id: "market", en: "This market", th: "ตลาดพื้นที่นี้", Icon: ShoppingBasket },
  { id: "services", en: "Services & hands", th: "บริการและคนรับจ้าง", Icon: UsersRound },
  { id: "obligations", en: "Leverage", th: "อำนาจต่อรอง", Icon: Handshake },
  { id: "history", en: "Agreements & consequences", th: "สมุดสัญญาและผลประโยชน์", Icon: History },
];

function LedgerGuidance({ tab, language, marketTitle }: { tab: MarketHubTab; language: Language; marketTitle: string }) {
  const active = tabs.find((entry) => entry.id === tab) ?? tabs[1];
  const message = tab === "gear"
    ? copy(language, "Carried gear · read-only campaign record", "ของที่พก · บันทึกแคมเปญแบบอ่านอย่างเดียว")
    : tab === "market"
      ? copy(language, "Choose one offer below to accept", "เลือกข้อเสนอหนึ่งรายการด้านล่างเพื่อรับไว้")
      : tab === "services"
        ? copy(language, "Available contacts · read-only until the scene makes contact", "ผู้ติดต่อที่พบได้ · อ่านอย่างเดียวจนกว่าฉากจะทำให้ติดต่อกัน")
        : tab === "obligations"
          ? copy(language, "Open obligations · read-only campaign record", "ภาระที่ค้าง · บันทึกแคมเปญแบบอ่านอย่างเดียว")
          : copy(language, "Agreements & consequences · read-only campaign record", "สัญญาและผลประโยชน์ · บันทึกแคมเปญแบบอ่านอย่างเดียว");

  return <div className="market-reason" data-testid="market-ledger-guidance"><active.Icon size={18} /><div>{tab === "market" && <strong>{marketTitle}</strong>}<span>{message}</span></div></div>;
}

export function MarketHub({ game, language, onUpdate, initialTab = "market" }: { game: GameState; language: Language; onUpdate: (next: GameState, message: string) => void; initialTab?: MarketHubTab }) {
  const [tab, setTab] = useState<MarketHubTab>(initialTab);
  const usedSlots = game.character.inventory.reduce((total, item) => total + item.slots, 0);
  const economy = game.economy ?? {
    marketTitle: copy(language, `Market near ${game.campaign.location}`, `ตลาดใกล้ ${game.campaign.location}`),
    marketContext: copy(language, "Local trade context is being restored.", "กำลังกู้บริบทการค้าท้องถิ่น"),
    routeStatus: copy(language, "Route status is being restored.", "กำลังกู้ข้อมูลเส้นทาง"),
    sellerNetwork: copy(language, "Local sellers", "ผู้ค้าในพื้นที่"),
    services: [], obligations: [], transactions: [],
  };
  const openObligations = economy.obligations.filter((entry) => entry.status === "open" || entry.status === "called_in").length;
  const highestMastery = game.character.masteries.reduce((highest, mastery) => Math.max(highest, mastery.level), 0);
  const leadingMastery = game.character.masteries.reduce((best, mastery) => mastery.level > best.level ? mastery : best, game.character.masteries[0]);
  const xpContext = leadingMastery ? leadingMastery.level >= 5 ? copy(language, `${leadingMastery.label}: peerless`, `${leadingMastery.label}: หาตัวจับไม่ได้`) : `${leadingMastery.label}: ${leadingMastery.xp ?? 0}/${xpNeededForMasteryLevel(leadingMastery.level)} Progress` : "—";
  const latestReward = game.rolls.slice().reverse().find((roll) => roll.reward)?.reward ?? game.missions.slice().reverse().find((mission) => mission.state === "resolved")?.reward;
  const rewardContext = latestReward ? copy(language, `Latest reward context: ${latestReward}`, `สรุปรางวัลล่าสุด: ${latestReward}`) : copy(language, "No reward has entered the campaign record yet.", "ยังไม่มีรางวัลเข้าสมุดแคมเปญ");

  const tabButtons = <div className="tab-strip" aria-label="Market and gear sections">{tabs.map(({ id, en, th, Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={15} /> {copy(language, en, th)}</button>)}</div>;
  const localContext = <section className="market-reason market-reason--context"><MapPin size={18} /><div><strong>{localized(language, economy.marketTitle)}</strong><br />{localized(language, economy.marketContext)}<br /><small>{copy(language, "Route:", "เส้นทาง:")} {localized(language, economy.routeStatus)}</small></div></section>;

  return <div className="page market-view">
    <div className="page-heading"><div><div className="section-kicker">MARKET & GEAR · LOCAL CONTEXT</div><h1>{copy(language, "Markets are made of people", "ตลาดคือคน ของ และคำติดค้าง")}</h1><p>{copy(language, "These five ledgers describe one changing situation: what you carry, who can help, what you owe, and which promises now shape the road ahead.", "ห้าบัญชีนี้คือเหตุการณ์เดียวกันคนละมุม: ของที่พก คนที่ช่วยได้ สิ่งที่ค้าง และคำมั่นที่กำลังเปลี่ยนทางข้างหน้า")}</p><p data-testid="prepare-campaign-context" className="market-view__campaign-context"><b>{game.campaign.title}</b> · {game.campaign.year} · {game.campaign.season} · {game.campaign.region} · {game.campaign.location}</p></div><div className="resource-tally"><span>{copy(language, "Property", "ทรัพย์สิน")}<b>{game.character.resources.property}</b></span><span>{copy(language, "Supplies", "เสบียง")}<b>{game.character.resources.supplies}</b></span><span>{copy(language, "Credit", "เครดิต")}<b>{game.character.resources.credit}</b></span></div></div>
    <section className="campaign-ledger-strip market-concordance"><span><small>{copy(language, "PAGE", "หน้าเรื่อง")}</small><b>{game.progression?.leaf ?? game.tick}</b></span><span><small>{copy(language, "HIGHEST MASTERY", "Mastery สูงสุด")}</small><b>{highestMastery}/5</b></span><span><small>{copy(language, "NEXT PROGRESS", "ความก้าวหน้าถัดไป")}</small><b>{xpContext}</b></span><span><small>{copy(language, "OPEN AGREEMENTS", "สัญญาค้าง")}</small><b>{openObligations}</b></span><span><small>{copy(language, "RECORDS", "บันทึก")}</small><b>{economy.transactions.length}</b></span></section>
    <p className="campaign-reward-ribbon" data-testid="market-reward-context"><span>{copy(language, "REWARD CONTEXT", "สรุปรางวัลล่าสุด")}</span>{rewardContext}</p>
    {tabButtons}
    <LedgerGuidance tab={tab} language={language} marketTitle={economy.marketTitle} />

    <section data-testid="market-tab-content">
      {tab === "gear" && <><section className="inventory-sheet"><div className="inventory-capacity"><span>{copy(language, "Carried slots", "ช่องสัมภาระ")}</span><strong>{usedSlots}/8</strong></div>{game.character.inventory.map((item) => <article key={item.id}><div><strong>{localized(language, item.label)}</strong><small>{localized(language, item.description)}</small></div><span>{copy(language, item.location ?? "carried", item.location === "safehouse" ? "อยู่เซฟเฮาส์" : "พกติดตัว")}</span><b>{copy(language, item.ownership ?? "owned", item.ownership === "borrowed" ? "ยืมมา" : item.ownership === "disputed" ? "มีข้อพิพาท" : "ของตน")}</b><small className="market-row-status">{copy(language, "RECORD", "บันทึก")}</small></article>)}</section>{localContext}</>}
      {tab === "market" && <><section className="market-list">{game.market.map((offer) => <article className="market-row" key={offer.id}><div><div className="section-kicker">{offer.kind.toUpperCase()}</div><h2>{localized(language, offer.label)}</h2><p>{localized(language, offer.note)}</p><small>{copy(language, "Market Factor:", "ปัจจัยราคา:")} {localized(language, offer.priceReason ?? copy(language, "Local availability", "ของในพื้นที่"))}</small></div><span className="market-cost">{offer.price} <small>{copy(language, "property", "ทรัพย์สิน")}</small></span><Button disabled={!offer.available} className="df-button df-button--ghost" onClick={() => { const result = buyMarketOffer(game, offer.id); onUpdate(result.state, result.message); }}>{offer.available ? copy(language, "TAKE OFFER", "รับข้อเสนอ") : copy(language, "RECORDED", "บันทึกแล้ว")}</Button></article>)}</section><section className="market-reason market-reason--context"><SengokuIcon name="history" tone="ochre" />{copy(language, `Seller network: ${economy.sellerNetwork}. Offers stay fixed until the world gives a reason to change them.`, `เครือข่ายผู้ขาย: ${economy.sellerNetwork} ข้อเสนอจะไม่สุ่มใหม่จนกว่าโลกจะมีเหตุให้เปลี่ยน`)}</section></>}
      {tab === "services" && <><section className="mission-ledger">{economy.services.map((service) => <article className="mission-folio" key={service.id}><span className="folio-marker"><UsersRound size={15} /></span><div><div className="section-kicker">{service.role} · {service.availability.toUpperCase()} · {copy(language, "RECORD", "บันทึก")}</div><h2>{service.provider}</h2><p>{service.request}</p><div className="mission-meta"><span><b>{copy(language, "Network", "เครือข่าย")}</b>{service.affiliation}</span><span><b>{copy(language, "Price", "ราคา")}</b>{service.price}</span><span><b>{copy(language, "Time", "เวลา")}</b>{service.timeCost}</span><span><b>{copy(language, "Condition", "เงื่อนไข")}</b>{service.requirement}</span></div><div className="context-check"><ArrowRight size={16} />{copy(language, "If contacted in a scene, risk:", "หากติดต่อในฉาก ความเสี่ยงคือ:")} {service.witnessRisk}</div></div></article>)}</section>{localContext}</>}
      {tab === "obligations" && <><section className="memory-ledger"><div className="section-kicker">{copy(language, "NO SINGLE NATIONAL CREDIT SCORE · RECORD", "ไม่มีเครดิตสกอร์เดียวทั้งแผ่นดิน · บันทึก")}</div>{economy.obligations.map((entry) => <article key={entry.id}><small>{entry.kind.toUpperCase()} · {entry.status.toUpperCase()} · {entry.holder} · {copy(language, "RECORD", "บันทึก")}</small><div><strong>{entry.subject}</strong><p>{copy(language, "Due:", "กำหนด:")} {entry.due} · {copy(language, "Witness:", "พยาน:")} {entry.witness}<br />{entry.note}</p></div></article>)}</section>{localContext}</>}
      {tab === "history" && <><section className="memory-ledger"><div className="section-kicker">{copy(language, "AGREEMENTS & CONSEQUENCES · RECORD", "สมุดสัญญาและผลประโยชน์ · บันทึก")}</div><p className="market-history-note">{copy(language, "This read-only campaign record is not a receipt list. It records who was involved, what changed hands, what it cost, and which path it opened or closed.", "บันทึกแคมเปญนี้อ่านอย่างเดียว ไม่ใช่รายการใบเสร็จ แต่บอกว่าใครเกี่ยวข้อง สิ่งใดเปลี่ยนมือ ต้องจ่ายอะไร และผลนั้นเปิดหรือปิดทางใด")}</p>{economy.transactions.slice().reverse().map((entry) => <article key={entry.id}><small>{entry.kind.toUpperCase()} · {copy(language, "record", "บันทึก")} {entry.tick}</small><div><strong>{entry.title}</strong><p>{copy(language, "With:", "ผู้เกี่ยวข้อง:")} {entry.counterpart}<br />{copy(language, "What was given:", "สิ่งที่ได้มาจากเรื่องนี้:")} {entry.payment}<br />{copy(language, "Who remembers:", "ผู้ที่จดจำ:")} {entry.witness}<br />{copy(language, "What changed:", "ผลที่ตามมา:")} {entry.consequence}</p></div></article>)}</section>{localContext}</>}
    </section>
  </div>;
}
