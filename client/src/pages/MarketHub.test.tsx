// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.getByTestId("market-ledger-guidance").textContent).toContain("บันทึกแคมเปญแบบอ่านอย่างเดียว");
    expect(screen.getAllByText("บันทึก").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button")[2]);
    expect(screen.getByText("คนส่งสารท่าเรือ")).toBeTruthy();
    expect(screen.getByTestId("market-ledger-guidance").textContent).toContain("อ่านอย่างเดียวจนกว่าฉากจะทำให้ติดต่อกัน");
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

  it("records a safehouse-guaranteed medicine exchange against the existing debt", () => {
    const game = createSaikaSafehouseDemo();
    const result = buyMarketOffer(game, "saika-medicine");
    const safehouseDebt = result.state.economy.obligations.find((entry) => entry.id === "debt-safehouse-rations");
    expect(result.state.character.resources.property).toBe(game.character.resources.property);
    expect(safehouseDebt?.note).toContain("ยาสมุนไพรห่อเล็ก");
    expect(result.state.economy.transactions.at(-1)?.kind).toBe("debt");
  });
});
