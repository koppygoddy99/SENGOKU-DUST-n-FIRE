import { describe, expect, it } from "vitest";
import { createSaikaSafehouseDemo } from "./game";

describe("Saika safehouse local demo", () => {
  it("starts at the 1569 Sakai safehouse with the supplied cast, injuries, mission, and opening Log", () => {
    const game = createSaikaSafehouseDemo();
    expect(game.campaign.year).toBe(1569);
    expect(game.campaign.location).toContain("เซฟเฮาส์ลับของไซกะ");
    expect(game.character.name).toBe("ซาเนฟุยุ");
    expect(game.character.vitals.wounds).toBe(5);
    expect(game.currentScene.speaker).toBe("กันทาโร่");
    expect(game.currentScene.body.join("\n\n")).toContain("เอจิยะ");
    expect(game.missions[0].title).toBe("คำตอบใต้ห้องขัง");
    expect(game.memories[0].detail).toContain("เมืองซาไก");
  });
});
