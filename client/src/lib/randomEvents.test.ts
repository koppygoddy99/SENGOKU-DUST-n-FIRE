import { describe, expect, it } from "vitest";
import { applyRandomEventChoice, mapLocationToTypes, maybeTriggerRandomEvent, selectRandomEvent, ALL_RANDOM_EVENTS, RANDOM_EVENT_CHANCE, type SelectRandomEventInput } from "./randomEvents";
import { createSaikaSafehouseDemo, normalizeGameState } from "./game";

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
