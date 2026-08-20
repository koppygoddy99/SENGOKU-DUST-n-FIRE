import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createSaikaSafehouseDemo, parseAction, resolveRoll, applyRoll } from "@/lib/game";
import { StoryMap } from "./StoryMap";

describe("StoryMap", () => {
  it("projects campaign location, active mission, memories, and roll state from the real game state", () => {
    const base = createSaikaSafehouseDemo();
    const preview = parseAction("I will ask the guard for one night to speak with the prisoner.", base);
    const resolved = applyRoll(base, resolveRoll(preview, base, false));
    const game = { ...resolved, missions: base.missions };
    const onOpen = vi.fn();

    const html = renderToStaticMarkup(<StoryMap game={game} language="en" onOpen={onOpen} />);

    expect(html).toContain("CAMPAIGN COMMAND");
    expect(html).toContain(game.currentScene.location);
    expect(html).toContain(game.missions[0].title);
    expect(html).toContain(`War shadow ${game.campaign.warShadow}/6`);
    expect(html).toContain("LAST ROLL");
    expect(html).toContain("SITUATION MAP");
    expect(html).toContain("WORLD STATE PULSE");
  });

  it("uses Thai labels without manufacturing a different campaign state", () => {
    const game = createSaikaSafehouseDemo();
    const html = renderToStaticMarkup(<StoryMap game={game} language="th" onOpen={() => undefined} />);

    expect(html).toContain("บัญชาการแคมเปญ");
    expect(html).toContain("แผนที่สถานการณ์");
    expect(html).toContain("ภารกิจปัจจุบัน");
  });
});
