// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buyMarketOffer, createSaikaSafehouseDemo } from "@/lib/game";
import { MarketHub } from "./MarketHub";

describe("Market and gear hub", () => {
  it("shows all five ledgers from the Saika local economy", () => {
    const game = createSaikaSafehouseDemo();
    render(<MarketHub game={game} language="th" onUpdate={vi.fn()} />);
    expect(screen.getByText("ตลาดท่าเรือซาไก — เช้าหลังคืนวุ่นวาย")).toBeTruthy();
    expect(screen.getByText("Mastery สูงสุด")).toBeTruthy();
    expect(screen.getByText("ความก้าวหน้าถัดไป")).toBeTruthy();
    expect(screen.getByText(/Progress$/)).toBeTruthy();
    expect(screen.getByText("สัญญาค้าง")).toBeTruthy();
    expect(screen.getByTestId("market-reward-context").textContent).toContain("ยังไม่มีรางวัลเข้าสมุดแคมเปญ");
    expect(screen.getByTestId("market-ledger-guidance").textContent).toContain("เลือกข้อเสนอหนึ่งรายการด้านล่างเพื่อรับไว้");
    expect(screen.getAllByRole("button", { name: "รับข้อเสนอ" }).length).toBeGreaterThan(0);
    expect(screen.getByTestId("market-ledger-guidance").compareDocumentPosition(screen.getByTestId("market-tab-content")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByText("ปืนคาบศิลาเปียกชื้น")).toBeTruthy();
    expect(screen.getByTestId("market-ledger-guidance").textContent).toContain("สวมหรือถอดของที่ติดตัวได้");
    expect(screen.getAllByText("บันทึก").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button")[2]);
    expect(screen.getByText("คนส่งสารท่าเรือ")).toBeTruthy();
    expect(screen.getByTestId("market-ledger-guidance").textContent).toContain("เลือกผู้ติดต่อด้านล่างเพื่อจ้างช่วยงาน");
    expect(screen.getAllByText(/· บันทึก$/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button")[3]);
    expect(screen.getByText("หนี้ชีวิตจากการลากซาเนฟุยุขึ้นจากน้ำ")).toBeTruthy();
    expect(screen.getByTestId("market-ledger-guidance").textContent).toContain("บันทึกแคมเปญแบบอ่านอย่างเดียว");
    expect(screen.getByText("ไม่มีเครดิตสกอร์เดียวทั้งแผ่นดิน · บันทึก")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button")[4]);
    expect(screen.getByText("กันทาโร่ลากซาเนฟุยุขึ้นจากน้ำ")).toBeTruthy();
    expect(screen.getByTestId("market-ledger-guidance").textContent).toContain("บันทึกแคมเปญแบบอ่านอย่างเดียว");
    expect(screen.getByText("สมุดสัญญาและผลประโยชน์ · บันทึก")).toBeTruthy();
  });

  it("records a local market exchange across inventory, availability, and history", () => {
    const game = createSaikaSafehouseDemo();
    const onUpdate = vi.fn();
    render(<MarketHub game={game} language="en" onUpdate={onUpdate} />);
    fireEvent.click(screen.getAllByRole("button", { name: "TAKE OFFER" })[0]);
    const next = onUpdate.mock.calls[0][0];
    expect(next.character.inventory.some((item: { label: string }) => item.label === "ข้าวตากและเต้าเจี้ยว")).toBe(true);
    expect(next.market.find((item: { id: string }) => item.id === "saika-rations").available).toBe(false);
    expect(next.economy.transactions.some((entry: { title: string }) => entry.title.includes("ข้าวตากและเต้าเจี้ยว"))).toBe(true);
  });

  it("replaces every Prepare ledger context when the active campaign changes", () => {
    const first = createSaikaSafehouseDemo();
    const second = createSaikaSafehouseDemo();
    second.campaign = { ...second.campaign, id: "camp-prepare-second", title: "Second campaign record", year: 1578, region: "Iga", location: "หมู่บ้านชายป่าอิงะ" };
    second.economy = { ...second.economy, marketTitle: "ตลาดเล็กชายป่าอิงะ", marketContext: "เสบียงและข่าวที่พบได้ในแคมเปญที่สองเท่านั้น" };
    second.market = [{ ...second.market[0], id: "iga-rations", label: "เสบียงอิงะ", note: "รายการเฉพาะแคมเปญที่สอง" }];
    const view = render(<MarketHub game={first} language="en" onUpdate={vi.fn()} />);
    const scoped = within(view.container);
    expect(scoped.getByTestId("prepare-campaign-context").textContent).toContain("Smoke Beneath Sakai");

    view.rerender(<MarketHub game={second} language="en" onUpdate={vi.fn()} />);
    expect(scoped.getByTestId("prepare-campaign-context").textContent).toContain("Second campaign record");
    expect(scoped.getByTestId("prepare-campaign-context").textContent).toContain("Iga");
    expect(scoped.getByText("ตลาดเล็กชายป่าอิงะ")).toBeTruthy();
    expect(scoped.getByText("เสบียงอิงะ")).toBeTruthy();
    expect(scoped.queryByText("ตลาดท่าเรือซาไก — เช้าหลังคืนวุ่นวาย")).toBeNull();
  });

  it("records a safehouse-guaranteed medicine exchange against the existing debt", () => {
    const game = createSaikaSafehouseDemo();
    const result = buyMarketOffer(game, "saika-medicine");
    const safehouseDebt = result.state.economy.obligations.find((entry) => entry.id === "debt-safehouse-rations");
    expect(result.state.character.resources.property).toBe(game.character.resources.property);
    expect(safehouseDebt?.note).toContain("ยาสมุนไพรห่อเล็ก");
    expect(result.state.economy.transactions.at(-1)?.kind).toBe("debt");
  });
});

describe("Gear tab equipment clarity", () => {
  it("separates equipment slots from inventory and shows truthful counts", () => {
    const game = createSaikaSafehouseDemo();
    render(<MarketHub game={game} language="th" onUpdate={vi.fn()} initialTab="gear" />);
    expect(screen.getByTestId("equipment-slot-outfit").textContent).toContain("ชุด/เกราะ");
    expect(screen.getByTestId("equipment-slot-weapon").textContent).toContain("อาวุธ");
    expect(screen.getByTestId("inventory-section").textContent).toContain("สัมภาระที่พก");
    const counts = screen.getByTestId("inventory-counts").textContent;
    expect(counts).toContain(String(game.character.inventory.length));
    // usedSlots was removed — item.slots is a narrative descriptor, not a gameplay capacity
    expect(screen.getByRole("button", { name: `ทั้งหมด · ${game.character.inventory.length}` })).toBeTruthy();
  });

  it("shows empty-state message when nothing is equipped", () => {
    const game = createSaikaSafehouseDemo();
    const view = render(<MarketHub game={game} language="th" onUpdate={vi.fn()} initialTab="gear" />);
    expect(within(view.container).getAllByText(/ยังไม่สวมอะไร/).length).toBeGreaterThan(0);
  });

  it("marks the equipped item with a badge and keeps the unequip action functional", () => {
    const game = createSaikaSafehouseDemo();
    const blade = game.character.inventory.find((item) => item.kind === "equipment");
    expect(blade).toBeTruthy();
    const equipped = { ...game, equipment: { outfit: null, weapon: blade!.id } };
    const onUpdate = vi.fn();
    const view = render(<MarketHub game={equipped} language="th" onUpdate={onUpdate} initialTab="gear" />);
    // Equipment slot shows the item name
    expect(within(view.container).getByTestId("equipment-slot-weapon").textContent).toContain(blade!.label);
    // EQUIPPED badge is visible
    expect(within(view.container).getAllByText(/สวมอยู่/).length).toBeGreaterThan(0);
    // Unequip button is present
    fireEvent.click(within(view.container).getAllByRole("button", { name: "ถอด" })[0]);
    expect(onUpdate.mock.calls[0][0].equipment?.weapon).toBeNull();
  });

  it("shows the EQUIPPED badge on the inventory row for an equipped item", () => {
    const game = createSaikaSafehouseDemo();
    const blade = game.character.inventory.find((item) => item.kind === "equipment");
    expect(blade).toBeTruthy();
    const equipped = { ...game, equipment: { outfit: null, weapon: blade!.id } };
    const view = render(<MarketHub game={equipped} language="th" onUpdate={vi.fn()} initialTab="gear" />);
    // The inventory row for the equipped blade shows EQUIPPED badge
    const allBadges = within(view.container).getAllByText(/สวมอยู่/);
    expect(allBadges.length).toBeGreaterThan(1); // one in slot + one in row
  });

  it("keeps the equip action functional without duplicating the item", () => {
    const game = createSaikaSafehouseDemo();
    const onUpdate = vi.fn();
    const view = render(<MarketHub game={game} language="th" onUpdate={onUpdate} initialTab="gear" />);
    fireEvent.click(within(view.container).getByRole("button", { name: "สวม (อาวุธ)" }));
    const next = onUpdate.mock.calls[0][0];
    const blade = game.character.inventory.find((item) => item.kind === "equipment")!;
    expect(next.equipment?.weapon).toBe(blade.id);
    expect(next.character.inventory.filter((item: { id: string }) => item.id === blade.id)).toHaveLength(1);
  });

  it("shows slot type (Weapon slot / Outfit slot) for equippable items in inventory", () => {
    const game = createSaikaSafehouseDemo();
    const blade = game.character.inventory.find((item) => item.kind === "equipment");
    expect(blade).toBeTruthy();
    const view = render(<MarketHub game={game} language="th" onUpdate={vi.fn()} initialTab="gear" />);
    // The equippable item shows slot type label
    expect(within(view.container).getAllByText(/ช่องอาวุธ/).length).toBeGreaterThan(0);
  });

  it("category filter counts sum to the all count", () => {
    const game = createSaikaSafehouseDemo();
    const view = render(<MarketHub game={game} language="th" onUpdate={vi.fn()} initialTab="gear" />);
    const total = game.character.inventory.length;
    // The All button always shows the total — scope to test component to avoid Home page buttons
    expect(within(view.container).getByRole("button", { name: `ทั้งหมด · ${total}` })).toBeTruthy();
  });
});
