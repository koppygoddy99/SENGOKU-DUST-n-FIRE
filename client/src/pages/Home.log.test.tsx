import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createGameState } from "../lib/game";
import { LogView } from "./Home";

const campaign = { id: "log-campaign", title: "เถ้าเหนือคิโนกาวะ", year: 1578, season: "Summer" as const, region: "Kii", location: "ตลาดหน้าด่านริมแม่น้ำ", warShadow: 3, day: 1 };
const draft = { name: "ซาโตะ", identity: "", templateId: "freeform", freeformOccupation: "ทหารรับจ้าง", origin: "หมู่บ้านริมน้ำ", strength: "อ่านสีหน้าคนได้", weakness: "ติดหนี้คนเรือ", answers: {} };

describe("Campaign Log prose", () => {
  it("renders every paragraph in normal Log mode", () => {
    const game = createGameState(campaign, draft);
    game.storyRecords = [{ id: "multi-paragraph", tick: 1, inGameDay: 1, title: "ค่ำที่ตลาด", prose: "ย่อหน้าเรื่องแรกมีควันและกลิ่นข้าว\n\nย่อหน้าที่สองมีคนหยุดฟัง\n\nย่อหน้าที่สามทิ้งหนี้ไว้", location: campaign.location }];
    const html = renderToStaticMarkup(<LogView game={game} language="th" readerMode={false} setReaderMode={() => undefined} />);
    expect(html).toContain("ย่อหน้าเรื่องแรกมีควันและกลิ่นข้าว");
    expect(html).toContain("ย่อหน้าที่สองมีคนหยุดฟัง");
    expect(html).toContain("ย่อหน้าที่สามทิ้งหนี้ไว้");
  });
});
