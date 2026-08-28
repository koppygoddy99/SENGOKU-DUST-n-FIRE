import { describe, expect, it } from "vitest";
import { applyRoll, createGameState, createSaikaSafehouseDemo, normalizeGameState, parseAction, resolveRoll } from "./game";

describe("public relationship projection", () => {
  it("seeds the four player-visible Saika contacts with clamped story-facing scales and source evidence", () => {
    const game = createSaikaSafehouseDemo();

    expect(game.schemaVersion).toBe(9);
    expect(game.relationships.map((contact) => contact.contactId)).toEqual(["gantaro", "tokichi", "masakichi", "genshiro"]);
    expect(game.relationships.every((contact) => contact.familiarity >= 0 && contact.familiarity <= 5)).toBe(true);
    expect(game.relationships.every((contact) => contact.affinity >= -3 && contact.affinity <= 3)).toBe(true);
    expect(game.relationships.every((contact) => contact.events.every((event) => game.memories.some((memory) => memory.id === event.sourceId)))).toBe(true);
  });

  it("migrates a legacy contact by whitelisting public fields and removes private dossier text", () => {
    const original = createSaikaSafehouseDemo();
    const legacy = {
      ...original,
      schemaVersion: 5,
      memories: original.memories.filter((memory) => memory.id !== "relationship-foundation-gantaro"),
      relationships: [{
        ...original.relationships[0],
        familiarity: 99,
        affinity: -99,
        internalCore: "This must never enter the browser save.",
        gmGuidance: "This must never enter the browser save.",
      }],
    } as typeof original;

    const migrated = normalizeGameState(legacy);
    const saved = JSON.stringify(migrated);

    expect(migrated.schemaVersion).toBe(9);
    expect(migrated.relationships).toHaveLength(1);
    expect(migrated.relationships[0]).toMatchObject({ contactId: "gantaro", familiarity: 5, affinity: -3 });
    expect(saved).not.toContain("internalCore");
    expect(saved).not.toContain("gmGuidance");
    expect(saved).not.toContain("This must never enter the browser save.");
    expect(migrated.memories.some((memory) => memory.id === "relationship-foundation-gantaro")).toBe(true);
  });

  it("keeps new campaigns free of fixed Saika contacts", () => {
    const game = createGameState(
      { id: "new-campaign", title: "A New Road", year: 1578, season: "Summer", region: "Mikawa", location: "Riverside village", warShadow: 2, day: 1 },
      { name: "Hana", identity: "player-defined", templateId: "freeform", freeformOccupation: "traveler", origin: "Mikawa", strength: "careful", weakness: "old debt", flaws: ["old debt"], answers: {} },
    );

    expect(game.schemaVersion).toBe(8);
    expect(game.relationships).toEqual([]);
  });

  it("captures player-visible Gantaro evidence and marks only that in-game day as pending analysis", () => {
    const game = createSaikaSafehouseDemo();
    const preview = parseAction("ข้าจะรายงานกันทาโร่เรื่องเอจิยะและเสนอทางแก้", game);
    const record = resolveRoll(preview, game);
    const next = applyRoll(game, record);
    const gantaro = next.relationships.find((contact) => contact.contactId === "gantaro")!;
    const tokichi = next.relationships.find((contact) => contact.contactId === "tokichi")!;

    expect(next.rolls.at(-1)?.id).toBe(record.id);
    expect(gantaro.events.at(-1)).toMatchObject({ sourceType: "roll", sourceId: record.id, inGameDay: game.campaign.day, tick: record.tick });
    expect(gantaro.latestDailyLog).toMatchObject({ status: "pending", inGameDay: game.campaign.day, eventIds: [expect.stringContaining(record.id)] });
    expect(tokichi.latestDailyLog).toBeUndefined();
  });
});
