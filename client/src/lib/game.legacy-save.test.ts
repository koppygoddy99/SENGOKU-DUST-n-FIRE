import { describe, expect, it } from "vitest";
import { createSaikaSafehouseDemo, normalizeGameState, type GameState } from "./game";

/**
 * Regression guard for old Local Saves (schemaVersion < 4).
 *
 * The legacy save format used keys that no longer exist in the current schema:
 *  - `vitals.wounds` / `vitals.maxWounds`   -> `blood` / `maxBlood`
 *  - `rolls[].axis`                          -> `stat`
 *  - `inventory[].bonus.axis`                -> `bonus.stat`
 *  - `resources.property` (no currency)      -> `currency { unit: "mon" }`
 *  - missions without `progress`             -> default progress stub
 *  - no `progression` / `economy` / `worldSystems` / `relationships` -> defaults
 *
 * If any of these migrations breaks, players with existing saves lose data.
 */

function legacySaveFixture(): GameState {
  const base = createSaikaSafehouseDemo();
  return {
    ...base,
    schemaVersion: 3,
    character: {
      ...base.character,
      attributes: { body: 2, hand: 4, wit: 3, mind: 2, heart: 3 },
      vitals: { wounds: 99, maxWounds: 8, focus: 3 } as GameState["character"]["vitals"],
      resources: { property: 4, supplies: 1, credit: 0 } as GameState["character"]["resources"],
      inventory: [
        {
          ...base.character.inventory[1],
          bonus: { axis: "hand", value: 1, tags: ["fight", "weapon"] },
        } as GameState["character"]["inventory"][number],
      ],
    },
    missions: [{ ...base.missions[0], progress: undefined }] as GameState["missions"],
    rolls: [
      {
        ...base.rolls[0],
        axis: "wit",
        stat: undefined,
        narrative: "บันทึกการทอยจากเซฟเก่า",
      },
    ] as unknown as GameState["rolls"],
    progression: undefined,
    economy: undefined,
    worldSystems: undefined,
    relationships: undefined,
    storyRecords: undefined,
    memories: [],
  } as unknown as GameState;
}

describe("legacy local save migration (schemaVersion < 4)", () => {
  const migrated = normalizeGameState(legacySaveFixture());

  it("bumps the schema version to the current one", () => {
    expect(migrated.schemaVersion).toBe(9);
  });

  it("renames legacy vital keys and clamps blood into the new max", () => {
    expect(migrated.character.vitals.maxBlood).toBe(8);
    expect(migrated.character.vitals.blood).toBe(8); // wounds 99 clamped to maxBlood
    expect(migrated.character.vitals.focus).toBe(3);
  });

  it("derives the currency from the legacy property value", () => {
    expect(migrated.character.resources.currency).toMatchObject({ unit: "mon", amount: 4 });
    expect(migrated.character.resources.property).toBe(4);
  });

  it("migrates legacy roll axis and inventory bonus axis keys", () => {
    expect(migrated.rolls[0]).toMatchObject({ stat: "wit" });
    const bonusItem = migrated.character.inventory.find((entry) => entry.bonus);
    expect(bonusItem?.bonus).toMatchObject({ stat: "hand" });
    expect(bonusItem?.category).toBeTruthy();
  });

  it("fills in default progression, economy, world systems, and mission progress", () => {
    expect(migrated.progression?.currentAge).toBe(13);
    expect(migrated.economy?.marketTitle).toContain("ซาไก");
    expect(migrated.worldSystems).toMatchObject({ schemaVersion: 1 });
    expect(migrated.missions[0].progress).toMatchObject({ current: 0, required: 2 });
  });

  it("rebuilds story records from legacy roll narratives", () => {
    expect(migrated.storyRecords?.length).toBeGreaterThan(0);
    expect(migrated.storyRecords?.[0]?.prose.length ?? 0).toBeGreaterThan(0);
  });
});
