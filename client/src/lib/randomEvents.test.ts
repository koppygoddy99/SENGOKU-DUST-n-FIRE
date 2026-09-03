import { describe, expect, it } from "vitest";
import { applyRandomEventChoice, mapLocationToTypes, maybeTriggerRandomEvent, selectRandomEvent, summarizeEffects, acceptRandomEventQuest, ALL_RANDOM_EVENTS, RANDOM_EVENT_CHANCE, type SelectRandomEventInput, type EventEffect } from "./randomEvents";
import { applyEventEffects } from "./game/state";
import { createSaikaSafehouseDemo, normalizeGameState, applyRoll } from "./game";
import type { GameState } from "./game";

const baseInput: SelectRandomEventInput = { season: "Spring", year: 1569, location: "ตลาดหน้าด่าน", day: 10, tick: 3 };

describe("random event pool", () => {
  it("has 45 universal events covering every season", () => {
    expect(ALL_RANDOM_EVENTS).toHaveLength(45);
    expect(ALL_RANDOM_EVENTS.every((event) => event.occupation_tags.includes("all"))).toBe(true);
    for (const season of ["Spring", "Summer", "Autumn", "Winter"]) {
      expect(ALL_RANDOM_EVENTS.some((event) => event.seasons.includes(season))).toBe(true);
    }
    expect(ALL_RANDOM_EVENTS.every((event) => event.choices.length >= 3 && event.choices.length <= 4)).toBe(true);
    expect(ALL_RANDOM_EVENTS.every((event) => ["historically_supported", "plausible_reconstruction", "game_drama"].includes(event.historical_fence))).toBe(true);
    expect(ALL_RANDOM_EVENTS.every((event) => new Set(event.choices.map((choice) => choice.id)).size === event.choices.length)).toBe(true);
  });
});

describe("selectRandomEvent", () => {
  it("is deterministic for the same seed inputs", () => {
    const first = selectRandomEvent(baseInput);
    const second = selectRandomEvent(baseInput);
    expect(first?.event_id).toBe(second?.event_id);
  });

  it("returns the same event_id when called with the same baseInput twice", () => {
    const first = selectRandomEvent(baseInput);
    const second = selectRandomEvent(baseInput);
    expect(first?.event_id).toBe(second?.event_id);
  });

  it("produces the same event_id when called twice with identical input", () => {
    const input: SelectRandomEventInput = { ...baseInput, season: "Summer", tick: 7 };
    const first = selectRandomEvent(input);
    const second = selectRandomEvent(input);
    expect(first?.event_id).toBe(second?.event_id);
  });

  it("only offers events for the requested season and era", () => {
    for (const season of ["Spring", "Summer", "Autumn", "Winter"]) {
      for (let i = 0; i < 20; i += 1) {
        const event = selectRandomEvent({ ...baseInput, season, tick: i });
        expect(event).not.toBeNull();
        expect(event!.seasons).toContain(season);
        expect(event!.era_range[0]).toBeLessThanOrEqual(1569);
        expect(event!.era_range[1]).toBeGreaterThanOrEqual(1569);
      }
    }
  });

  it("respects cooldown from event history", () => {
    const chosen = selectRandomEvent(baseInput)!;
    const blocked = selectRandomEvent({ ...baseInput, eventHistory: [{ eventId: chosen.event_id, day: baseInput.day }] });
    if (blocked) expect(blocked.event_id).not.toBe(chosen.event_id);
  });

  it("maps locations to pool location types", () => {
    expect(mapLocationToTypes("ท่าเรือซาไกะ")).toContain("port");
    expect(mapLocationToTypes("ตลาดหน้าด่าน")).toContain("market");
    expect(mapLocationToTypes("temple")).toContain("temple");
  });
});

describe("applyRandomEventChoice", () => {
  const withPending = () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const event = selectRandomEvent(baseInput)!;
    return { game: { ...game, pendingRandomEvent: { ...event, offeredDay: game.campaign.day } }, event };
  };

  it("applies effects through the engine and clears the pending event", () => {
    const { game, event } = withPending();
    const before = game.character.resources.currency.amount;
    const choice = event.choices.find((entry) => entry.effects.some((effect) => effect.type === "currency"))!;
    const next = applyRandomEventChoice(game, choice.id);
    expect(next.pendingRandomEvent).toBeUndefined();
    const currencyDelta = choice.effects.filter((effect) => effect.type === "currency").reduce((sum, effect) => sum + (effect.amount ?? 0), 0);
    expect(next.character.resources.currency.amount).toBe(Math.max(0, before + currencyDelta));
    expect(next.progression?.eventHistory?.at(-1)?.eventId).toBe(event.event_id);
  });

  it("clamps blood effects between 0 and the cap", () => {
    const { game, event } = withPending();
    const hurtChoice = event.choices.find((entry) => entry.effects.some((effect) => effect.type === "blood" && (effect.amount ?? 0) < 0));
    if (hurtChoice) {
      const next = applyRandomEventChoice({ ...game, character: { ...game.character, vitals: { ...game.character.vitals, blood: 1 } } }, hurtChoice.id);
      expect(next.character.vitals.blood).toBeGreaterThanOrEqual(0);
      expect(next.character.vitals.blood).toBeLessThanOrEqual(next.character.vitals.maxBlood ?? 6);
    }
  });

  it("ignores unknown choice ids", () => {
    const { game } = withPending();
    expect(applyRandomEventChoice(game, "no-such-choice")).toBe(game);
  });

  it("records heat and rumor effects as world memories", () => {
    const { game, event } = withPending();
    const choice = event.choices.find((entry) => entry.effects.some((effect) => effect.type === "heat" || effect.type === "rumor"));
    if (choice) {
      const next = applyRandomEventChoice(game, choice.id);
      expect(next.memories.length).toBeGreaterThan(game.memories.length);
    }
  });
});

describe("maybeTriggerRandomEvent", () => {
  it("is deterministic and keeps the same event while pending", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const first = maybeTriggerRandomEvent(game);
    const second = maybeTriggerRandomEvent(game);
    expect(Boolean(first.pendingRandomEvent)).toBe(Boolean(second.pendingRandomEvent));
    if (first.pendingRandomEvent) {
      const again = maybeTriggerRandomEvent(first);
      expect(again.pendingRandomEvent?.event_id).toBe(first.pendingRandomEvent.event_id);
    }
  });

  it("uses a fixed chance below 100 percent", () => {
    expect(RANDOM_EVENT_CHANCE).toBeLessThan(1);
    let fired = 0;
    for (let i = 0; i < 200; i += 1) {
      const game = { ...normalizeGameState(createSaikaSafehouseDemo()), tick: i };
      if (maybeTriggerRandomEvent(game).pendingRandomEvent) fired += 1;
    }
    expect(fired).toBeGreaterThan(0);
    expect(fired).toBeLessThan(200);
  });
});

describe("event quest flow", () => {
  const acceptQuest = () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const triggered = maybeTriggerRandomEvent({ ...game, tick: 42, campaign: { ...game.campaign } });
    if (!triggered.pendingRandomEvent) return null;
    const choiceId = triggered.pendingRandomEvent.choices[0].id;
    const accepted = acceptRandomEventQuest(triggered, choiceId);
    return { game, triggered, accepted, quest: accepted.missions.find((mission) => mission.id.startsWith("revent-"))! };
  };

  it("accepting a choice creates an event quest without applying effects", () => {
    const result = acceptQuest();
    if (!result) return;
    expect(result.triggered.pendingRandomEvent).toBeDefined();
    expect(result.accepted.pendingRandomEvent).toBeUndefined();
    expect(result.quest.state).toBe("active");
    expect(result.quest.role).toBe("side");
    expect(result.quest.randomEvent?.eventId).toBe(result.triggered.pendingRandomEvent!.event_id);
    expect(result.accepted.character.vitals.blood).toBe(result.game.character.vitals.blood);
    expect(result.accepted.progression?.eventHistory?.length).toBe(1);
  });

  it("rejecting clears the event and records cooldown history", () => {
    const result = acceptQuest();
    if (!result) return;
    const rejected = rejectRandomEventQuest(result.triggered);
    expect(rejected.pendingRandomEvent).toBeUndefined();
    expect(rejected.missions.find((mission) => mission.id.startsWith("revent-"))).toBeUndefined();
    expect(rejected.progression?.eventHistory?.length).toBe(1);
  });

  it("resolving the quest grants effects and the small reward item", () => {
    const result = acceptQuest();
    if (!result) return;
    const nonFail = { id: "r-test", outcome: "success_with_cost" as const, ...{} } as Parameters<typeof import("./game").applyRoll>[1];
    const afterRoll = applyRoll(result.accepted, nonFail);
    expect(afterRoll.missions.find((mission) => mission.id.startsWith("revent-"))?.progress?.current).toBeGreaterThan(0);
  });

  it("failing the quest applies only the loss effects and closes it", () => {
    const result = acceptQuest();
    if (!result) return;
    const failRecord = { id: "r-fail", outcome: "failure_with_consequence" as const } as Parameters<typeof import("./game").applyRoll>[1];
    const afterFail = applyRoll(result.accepted, failRecord);
    const quest = afterFail.missions.find((mission) => mission.id.startsWith("revent-"));
    expect(quest?.state).toBe("failed");
    expect(afterFail.memories.some((memory) => memory.title.includes("เหตุการณ์สุ่ม"))).toBe(true);
  });
});

describe("applyEventEffects — inventory grant and remove", () => {
  const withInventory = (extraCount = 0): GameState => {
    const base = normalizeGameState(createSaikaSafehouseDemo());
    const extras = Array.from({ length: extraCount }, (_, i) => ({
      id: `pre-existing-${i}`,
      label: `Pre-existing Item ${i}`,
      kind: "reserve" as const,
      description: "Test item",
      slots: 1,
      functions: ["bonus"] as const,
      condition: "usable" as const,
    }));
    return { ...base, character: { ...base.character, inventory: extras } };
  };

  it("grant adds an item to inventory with correct shape", () => {
    const game = withInventory();
    const effects: EventEffect[] = [{ type: "grant", amount: 1, template: "ถุงเมล็ดพันธุ์", target: "reserve", value: "เมล็ดพันธุ์ข้าวจากชาวบ้าน" }];
    const next = applyEventEffects(game, "ทดสอบเหตุการณ์", effects, 1);
    expect(next.character.inventory.length).toBeGreaterThan(game.character.inventory.length);
    const granted = next.character.inventory.find((item) => item.id.startsWith("revent-grant-"));
    expect(granted).toBeDefined();
    expect(granted?.label).toBe("ถุงเมล็ดพันธุ์");
    expect(granted?.kind).toBe("reserve");
    expect(granted?.description).toBe("เมล็ดพันธุ์ข้าวจากชาวบ้าน");
    expect(granted?.condition).toBe("usable");
    expect(granted?.slots).toBe(1);
    expect(granted?.functions).toContain("bonus");
  });

  it("remove deletes one item by kind from inventory", () => {
    const game = withInventory(3);
    const beforeCount = game.character.inventory.length;
    const effects: EventEffect[] = [{ type: "remove", amount: 1, target: "reserve" }];
    const next = applyEventEffects(game, "ทดสอบเหตุการณ์", effects, 1);
    expect(next.character.inventory.length).toBe(beforeCount - 1);
    expect(next.character.inventory.find((item) => item.id === "pre-existing-0")).toBeUndefined();
  });

  it("remove with no matching inventory item does not crash", () => {
    const game = withInventory(1);
    const beforeCount = game.character.inventory.length;
    const effects: EventEffect[] = [{ type: "remove", amount: 1, target: "nonexistent-kind" }];
    const next = applyEventEffects(game, "ทดสอบเหตุการณ์", effects, 1);
    expect(next.character.inventory.length).toBe(beforeCount);
    expect(next.character.inventory.find((item) => item.id === "pre-existing-0")).toBeDefined();
  });

  it("granting multiple items in one event produces unique IDs", () => {
    const game = withInventory();
    const effects: EventEffect[] = [
      { type: "grant", amount: 3, template: "ถุงข้าว", target: "reserve" },
      { type: "grant", amount: 2, template: "ถุงเกลือ", target: "reserve" },
    ];
    const next = applyEventEffects(game, "ทดสอบเหตุการณ์", effects, 42);
    const granted = next.character.inventory.filter((item) => item.id.startsWith("revent-grant-"));
    expect(granted).toHaveLength(5);
    const ids = granted.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id, i) => expect(id).toBe(`revent-grant-42-${i}`));
  });

  it("grant and remove are deterministic for the same tick and state", () => {
    const effects: EventEffect[] = [
      { type: "grant", amount: 1, template: "ดาบเก่า", target: "equipment" },
      { type: "remove", amount: 1, target: "reserve" },
    ];
    const game1 = withInventory(2);
    const game2 = withInventory(2);
    const next1 = applyEventEffects(game1, "เหตุการณ์ทดสอบ", effects, 99);
    const next2 = applyEventEffects(game2, "เหตุการณ์ทดสอบ", effects, 99);
    expect(next1.character.inventory.length).toBe(next2.character.inventory.length);
    expect(next1.character.inventory.map((item) => item.id).sort()).toEqual(
      next2.character.inventory.map((item) => item.id).sort()
    );
  });

  it("applyRandomEventChoice can grant items through effects", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const event = selectRandomEvent({ season: "Spring", year: 1569, location: "ตลาดหน้าด่น", day: 10, tick: 77 })!;
    const withGrant = {
      ...game,
      pendingRandomEvent: {
        ...event,
        title: "ทดสอบ grant",
        choices: [
          { id: "test-grant", check: { stat: "wit", tags: ["bargain"] }, effects: [{ type: "grant", amount: 1, template: "ของที่ระลึก", target: "reserve", value: "ของฝากจากการเจรจา" }] },
          ...event.choices,
        ],
      },
    };
    const next = applyRandomEventChoice(withGrant, "test-grant");
    const granted = next.character.inventory.find((item) => item.id.startsWith("revent-grant-"));
    expect(granted).toBeDefined();
    expect(granted?.label).toBe("ของที่ระลึก");
    expect(granted?.condition).toBe("usable");
  });

  it("quest resolution grants items when resolved with success", () => {
    const game = normalizeGameState(createSaikaSafehouseDemo());
    const triggered = maybeTriggerRandomEvent({ ...game, tick: 88, campaign: { ...game.campaign } });
    if (!triggered.pendingRandomEvent) return;
    // Patch first choice with grant effect
    const patchedPending = {
      ...triggered.pendingRandomEvent,
      title: "เหตุการณ์ทดสอบ",
      choices: triggered.pendingRandomEvent.choices.map((c, i) => i === 0
        ? { ...c, effects: [{ type: "grant", amount: 1, template: "ผ้าพันคอ", target: "equipment" }] }
        : c
      ),
    };
    // Accept as quest — effects NOT applied immediately
    const accepted = acceptRandomEventQuest({ ...triggered, pendingRandomEvent: patchedPending }, patchedPending.choices[0].id);
    const quest = accepted.missions.find((m) => m.id.startsWith("revent-"));
    expect(quest).toBeDefined();
    expect(quest?.state).toBe("active");
    // Effect not applied yet
    expect(accepted.character.inventory.find((item) => item.id.startsWith("revent-grant-"))).toBeUndefined();
    // Roll twice to resolve the quest (required=2)
    const fullRecord = (id: string, action: string, tick: number) =>
      ({ id, outcome: "success_with_cost" as const, action, tick, narrative: "ผลทดสอบ", intent: "act", method: "method", stat: "heart" as const, contextBonus: 0, difficulty: 12 as const, risks: [], witnesses: [], summary: "ok", dice: [6, 6] as [number, number], total: 12, margin: 0 }) as Parameters<typeof applyRoll>[1];
    const afterFirst = applyRoll(accepted, fullRecord("r-1", "ช่วยชาวบ้าน", 89));
    const afterSecond = applyRoll(afterFirst, fullRecord("r-ok", "ช่วยต่อ", 90));
    const granted = afterSecond.character.inventory.find((item) => item.id.startsWith("revent-grant-"));
    expect(granted).toBeDefined();
    expect(granted?.label).toBe("ผ้าพันคอ");
  });

  it("failure_with_consequence removes item from inventory via lossEffects", () => {
    const base = normalizeGameState(createSaikaSafehouseDemo());
    const withItems: GameState = {
      ...base,
      character: {
        ...base.character,
        inventory: [
          ...base.character.inventory,
          { id: "doomed-item", label: "ของที่จะสูญเสีย", kind: "reserve" as const, description: "test", slots: 1, functions: ["bonus"] as const, condition: "usable" as const },
        ],
      },
    };
    const triggered = maybeTriggerRandomEvent({ ...withItems, tick: 33, campaign: { ...withItems.campaign } });
    if (!triggered.pendingRandomEvent) return;
    // Use amount: -1 so the effect is captured as a lossEffect (amount < 0) on failure_with_consequence (core.ts:522)
    const patchedPending = {
      ...triggered.pendingRandomEvent,
      title: "เหตุการณ์เสี่ยง",
      choices: triggered.pendingRandomEvent.choices.map((c, i) => i === 0
        ? { ...c, effects: [{ type: "remove", amount: -1, target: "reserve" }] }
        : c
      ),
    };
    // Accept as quest — remove effect NOT applied until failure
    const accepted = acceptRandomEventQuest({ ...triggered, pendingRandomEvent: patchedPending }, patchedPending.choices[0].id);
    expect(accepted.character.inventory.find((item) => item.id === "doomed-item")).toBeDefined();
    // Full RollRecord with narrative (required by applyRoll at core.ts:646)
    const failRecord = { id: "r-fail", outcome: "failure_with_consequence" as const, action: "ปีนเขา", tick: 34, narrative: "ล้มเหลว", intent: "climb", method: "body", stat: "body" as const, contextBonus: 0, difficulty: 16 as const, risks: [], witnesses: [], summary: "fail", dice: [3, 4] as [number, number], total: 7, margin: -9 } as Parameters<typeof applyRoll>[1];
    const afterFail = applyRoll(accepted, failRecord);
    expect(afterFail.character.inventory.find((item) => item.id === "doomed-item")).toBeUndefined();
  });

  it("existing effect types (blood, currency, food) still apply correctly", () => {
    const game = withInventory(1);
    const effects: EventEffect[] = [
      { type: "blood", amount: 1 },
      { type: "currency", amount: 5 },
      { type: "food", amount: 2 },
    ];
    const next = applyEventEffects(game, "ทดสอบเดิม", effects, 1);
    expect(next.character.vitals.blood).toBe(game.character.vitals.blood + 1);
    expect(next.character.resources.currency.amount).toBe((game.character.resources.currency?.amount ?? 0) + 5);
    expect(next.character.resources.supplies).toBe(game.character.resources.supplies + 2);
  });

  it("grant and remove result in a serializable inventory", () => {
    const game = withInventory();
    const effects: EventEffect[] = [
      { type: "grant", amount: 2, template: "แผนที่", target: "document", value: "แผนที่เส้นทางลับ" },
      { type: "remove", amount: 1, target: "reserve" },
    ];
    const next = applyEventEffects(game, "ทดสอบ serialize", effects, 55);
    const serialized = JSON.stringify(next.character.inventory);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toHaveLength(next.character.inventory.length);
    deserialized.forEach((item: Record<string, unknown>) => {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("kind");
      expect(item).toHaveProperty("condition");
    });
  });

  it("summarizeEffects renders grant as reward and remove as risk", () => {
    const grantEffect: EventEffect = { type: "grant", amount: 1, template: "ถุงเมล็ด", target: "reserve" };
    const removeEffect: EventEffect = { type: "remove", amount: 1, target: "reserve" };
    const { reward: grantReward } = summarizeEffects([grantEffect]);
    expect(grantReward).toContain("ถุงเมล็ด");
    const { risk: removeRisk } = summarizeEffects([removeEffect]);
    expect(removeRisk).toContain("เสีย");
  });
});
