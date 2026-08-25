import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createSaikaSafehouseDemo } from "@/lib/game";
import { ChronicleView } from "./ChronicleView";

describe("ChronicleView ledger context", () => {
  it("renders the campaign folio, time context, active thread, and latest-consequence ledger from game state", () => {
    const game = createSaikaSafehouseDemo();
    const html = renderToStaticMarkup(<ChronicleView game={game} language="en" readerMode={false} setReaderMode={vi.fn()} />);

    expect(html).toContain("CAMPAIGN FOLIO");
    expect(html).toContain("PAGE 1");
    expect(html).toContain("Day 1");
    expect(html).toContain("ACTIVE THREAD");
    expect(html).toContain(game.missions[0].title);
    expect(html).toContain("LATEST CONSEQUENCE");
  });

  it("keeps the folio and active-thread labels available in Thai without changing the campaign state", () => {
    const game = createSaikaSafehouseDemo();
    const html = renderToStaticMarkup(<ChronicleView game={game} language="th" readerMode={false} setReaderMode={() => undefined} />);

    expect(html).toContain("ใบเรื่องแคมเปญ");
    expect(html).toContain("เส้นเรื่องที่ค้างอยู่");
    expect(html).toContain("วันที่ 1");
  });
});
