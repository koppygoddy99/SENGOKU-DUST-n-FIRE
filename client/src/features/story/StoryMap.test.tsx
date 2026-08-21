import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createSaikaSafehouseDemo, parseAction, resolveRoll, applyRoll } from "@/lib/game";
import { reviewMapModeFromUrl, StoryMap } from "./StoryMap";

describe("StoryMap", () => {
  it("opens the national map only from an explicit review route", () => {
    expect(reviewMapModeFromUrl("?review=home&map=national")).toBe("national");
    expect(reviewMapModeFromUrl("?map=national")).toBe("province");
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
    expect(html).toContain(game.missions[0].title);
    expect(html).toContain("War shadow");
    expect(html).toContain(`${game.campaign.warShadow}/6`);
    expect(html).toContain("LAST ROLL");
    expect(html).toContain("PROVINCE MAP");
    expect(html).toContain("Izumi Province");
    expect(html).toContain("Seaward edge of a trading town");
    expect(html).toContain("campaign fiction");
    expect(html).toContain("WORLD STATE PULSE");
  });

  it("uses Thai labels without manufacturing a different campaign state", () => {
    const game = createSaikaSafehouseDemo();
    const html = renderToStaticMarkup(<StoryMap game={game} language="th" onOpen={() => undefined} />);

    expect(html).toContain("บัญชาการแคมเปญ");
    expect(html).toContain("แผนที่แคว้น");
    expect(html).toContain("แคว้นอิซุมิ");
    expect(html).toContain("ชายขอบเมืองท่าริมทะเล");
    expect(html).toContain("ภารกิจปัจจุบัน");
  });

  it("changes the province panel and terrain prose when the campaign state moves to Kii", () => {
    const base = createSaikaSafehouseDemo();
    const game = {
      ...base,
      campaign: { ...base.campaign, region: "Kii", location: "เส้นทางใต้ริมเนิน" },
      currentScene: { ...base.currentScene, location: "เส้นทางใต้ริมเนิน" },
    };

    const html = renderToStaticMarkup(<StoryMap game={game} language="th" onOpen={() => undefined} />);

    expect(html).toContain("แคว้นกิอิ");
    expect(html).toContain("ทางใต้และเชิงป่าริมเนิน");
    expect(html).toContain("ภูมิประเทศ");
  });

  it("maps every supported campaign region to a specific province, marker, and terrain reading", () => {
    const base = createSaikaSafehouseDemo();
    const regions = [
      ["Mikawa", "แคว้นมิกาวะ", "province-map__marker--mikawa", "ที่ราบลุ่มและทางชายฝั่ง"],
      ["Omi", "แคว้นโอมิ", "province-map__marker--omi", "ทางเลียบทะเลสาบและช่องเขา"],
      ["Owari", "แคว้นโอวาริ", "province-map__marker--owari", "ที่ราบริมแม่น้ำและทางเข้าตลาด"],
      ["Sakai", "แคว้นอิซุมิ", "province-map__marker--izumi", "ชายขอบเมืองท่าริมทะเล"],
      ["Iga", "แคว้นอิกะ", "province-map__marker--iga", "แอ่งในแผ่นดินและช่องป่า"],
      ["Koga", "โคงะ", "province-map__marker--koga", "ทางข้ามเชิงเขาและทางคันนา"],
      ["Kii", "แคว้นกิอิ", "province-map__marker--kii", "ทางใต้และเชิงป่าริมเนิน"],
      ["Yamashiro", "แคว้นยามาชิโระ", "province-map__marker--yamashiro", "ทางในแอ่งและเส้นทางสู่ศูนย์กลาง"],
      ["Settsu", "แคว้นเซ็ตสึ", "province-map__marker--settsu", "ที่ราบท่าเรือและทางน้ำ"],
      ["Musashi", "แคว้นมูซาชิ", "province-map__marker--musashi", "ที่ราบกว้างและทางข้ามแม่น้ำ"],
      ["Iyo", "แคว้นอิโยะ", "province-map__marker--iyo", "ชายฝั่งเกาะและสันเขาด้านใน"],
      ["Shima", "แคว้นชิมะ", "province-map__marker--shima", "ชายฝั่งเว้าและช่องน้ำ"],
      ["Shinano", "แคว้นชินาโนะ", "province-map__marker--shinano", "แอ่งสูงและทางภูเขา"],
      ["Kaga", "แคว้นคางะ", "province-map__marker--kaga", "ที่ราบเหนือและทางเข้าจากภูเขา"],
    ] as const;

    for (const [region, province, marker, terrain] of regions) {
      const game = { ...base, campaign: { ...base.campaign, region, location: `${region} route` }, currentScene: { ...base.currentScene, location: `${region} route` } };
      const html = renderToStaticMarkup(<StoryMap game={game} language="th" onOpen={() => undefined} />);
      expect(html).toContain(province);
      expect(html).toContain(marker);
      expect(html).toContain(terrain);
    }
  });
});
