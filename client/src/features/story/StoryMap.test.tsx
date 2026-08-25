import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createSaikaSafehouseDemo, parseAction, resolveRoll, applyRoll } from "@/lib/game";
import { reviewMapModeFromUrl, StoryMap } from "./StoryMap";

describe("StoryMap", () => {
  it("keeps the national map as the only map mode", () => {
    expect(reviewMapModeFromUrl()).toBe("national");
  });

  it("projects campaign location, active mission, memories, and roll state from the real game state", () => {
    const base = createSaikaSafehouseDemo();
    const preview = parseAction("I will ask the guard for one night to speak with the prisoner.", base);
    const resolved = applyRoll(base, resolveRoll(preview, base, false));
    const game = { ...resolved, missions: base.missions };
    const onOpen = vi.fn();

    const html = renderToStaticMarkup(<StoryMap game={game} language="en" onOpen={onOpen} />);

    expect(html).toContain("CAMPAIGN COMMAND");
    expect(html).toContain(game.currentScene.location);
    expect(html).toContain("An Answer Beneath the Cell");
    expect(html).toContain("LAST ROLL");
    expect(html).toContain("story-map-card--map");
    expect(html).toContain("Izumi Province");
    expect(html).toContain("Current position");
    expect(html).toContain("Continue scene");
    expect(html).toContain(`aria-label="Return to ${game.currentScene.location}"`);
    expect(html).toContain('/assets/dust-fire-national-map-clean.webp');
    expect(html).toContain("national-context-map__marker--izumi");
    expect(html).not.toContain("PROVINCE MAP");
    expect(html).not.toContain("territorial control");
    expect(html).not.toContain("national-context-map__land");
    expect(html).toContain("WORLD CURRENTS");
  });

  it("uses Thai labels without manufacturing a different campaign state", () => {
    const game = createSaikaSafehouseDemo();
    const html = renderToStaticMarkup(<StoryMap game={game} language="th" onOpen={() => undefined} />);

    expect(html).toContain("บัญชาการแคมเปญ");
    expect(html).toContain("แผนที่ระดับประเทศ");
    expect(html).toContain("แคว้นอิซุมิ");
    expect(html).toContain("ตำแหน่งปัจจุบัน");
    expect(html).toContain("ภารกิจปัจจุบัน");
  });

  it("moves the national-map marker and province label when the campaign state changes", () => {
    const base = createSaikaSafehouseDemo();
    const game = {
      ...base,
      campaign: { ...base.campaign, region: "Kii", location: "เส้นทางใต้ริมเนิน" },
      currentScene: { ...base.currentScene, location: "เส้นทางใต้ริมเนิน" },
    };

    const html = renderToStaticMarkup(<StoryMap game={game} language="th" onOpen={() => undefined} />);

    expect(html).toContain("แคว้นกิอิ");
    expect(html).toContain("national-context-map__marker--kii");
  });

  it("maps every supported campaign region to a national-map province marker", () => {
    const base = createSaikaSafehouseDemo();
    const regions = [
      ["Mikawa", "แคว้นมิกาวะ", "national-context-map__marker--mikawa"],
      ["Omi", "แคว้นโอมิ", "national-context-map__marker--omi"],
      ["Owari", "แคว้นโอวาริ", "national-context-map__marker--owari"],
      ["Sakai", "แคว้นอิซุมิ", "national-context-map__marker--izumi"],
      ["Iga", "แคว้นอิกะ", "national-context-map__marker--iga"],
      ["Koga", "โคงะ", "national-context-map__marker--koga"],
      ["Kii", "แคว้นกิอิ", "national-context-map__marker--kii"],
      ["Yamashiro", "แคว้นยามาชิโระ", "national-context-map__marker--yamashiro"],
      ["Settsu", "แคว้นเซ็ตสึ", "national-context-map__marker--settsu"],
      ["Musashi", "แคว้นมูซาชิ", "national-context-map__marker--musashi"],
      ["Iyo", "แคว้นอิโยะ", "national-context-map__marker--iyo"],
      ["Shima", "แคว้นชิมะ", "national-context-map__marker--shima"],
      ["Shinano", "แคว้นชินาโนะ", "national-context-map__marker--shinano"],
      ["Kaga", "แคว้นคางะ", "national-context-map__marker--kaga"],
    ] as const;

    for (const [region, province, marker] of regions) {
      const game = { ...base, campaign: { ...base.campaign, region, location: `${region} route` }, currentScene: { ...base.currentScene, location: `${region} route` } };
      const html = renderToStaticMarkup(<StoryMap game={game} language="th" onOpen={() => undefined} />);
      expect(html).toContain(province);
      expect(html).toContain(marker);
    }
  });
});
