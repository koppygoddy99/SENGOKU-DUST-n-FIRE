// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  creditsQuery: vi.fn(() => ({ data: undefined, refetch: vi.fn() })),
  gmAnalyzeMutate: vi.fn(),
  gmResolveMutate: vi.fn(),
  spendCreditMutate: vi.fn(),
  gmAnalyze: vi.fn(),
  gmResolve: vi.fn(),
  spendCredit: vi.fn(),
}));

mocks.gmAnalyze.mockReturnValue({ mutate: mocks.gmAnalyzeMutate, isPending: false });
mocks.gmResolve.mockReturnValue({ mutate: mocks.gmResolveMutate, isPending: false });
mocks.spendCredit.mockReturnValue({ mutate: mocks.spendCreditMutate, isPending: false });

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "UI Tester" }, loading: false, isAuthenticated: true }) }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({ trpc: { profile: { credits: { useQuery: mocks.creditsQuery }, spendCredit: { useMutation: mocks.spendCredit } }, gm: { analyze: { useMutation: mocks.gmAnalyze }, resolve: { useMutation: mocks.gmResolve } } } }));

import Home from "./Home";
import { createSaikaSafehouseDemo } from "../lib/game";

function openChronicle(child: "Campaign Library" | "Chronicle") {
  const group = screen.getAllByRole("button", { name: "Chronicle" }).find((button) => button.hasAttribute("aria-expanded"));
  if (group?.getAttribute("aria-expanded") !== "true") fireEvent.click(group!);
  const childButton = screen.getAllByRole("button", { name: child }).find((button) => !button.hasAttribute("aria-expanded"));
  fireEvent.click(childButton!);
}

function openMore(child: "Save Game" | "Load Game") {
  const group = screen.getByRole("button", { name: "More" });
  if (group.getAttribute("aria-expanded") !== "true") fireEvent.click(group);
  const childButton = screen.getAllByRole("button", { name: child }).find((button) => !button.hasAttribute("aria-expanded") && button.closest(".campaign-nav__items"));
  fireEvent.click(childButton!);
}

describe("UI Preview click flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    window.history.replaceState({}, "", "/");
  });

  it("loads the 1569 Saika safehouse from Campaign Command into Play and Chronicle", () => {
    render(<Home />);
    expect(screen.getByText("1569")).toBeTruthy();
    expect(screen.getAllByText("Sakai / Izumi").length).toBeGreaterThan(0);
    expect(screen.getByText("ซาเนฟุยุ")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Return to/i }));
    expect(screen.getAllByText("คำตอบใต้ห้องขัง").length).toBeGreaterThan(0);
    openChronicle("Chronicle");
    expect(screen.getAllByText("คืนที่เมืองซาไกตื่น").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/กันทาโร่/).length).toBeGreaterThan(0);
  });

  it("restores a manual leaf through More without weakening the Play or Chronicle path", () => {
    const restored = createSaikaSafehouseDemo();
    restored.tick = 4;
    window.localStorage.setItem("dust-fire-local-game-v3-saika", JSON.stringify({ game: restored, saves: { manual: restored, leaf2: null, leaf3: null }, language: "en", readerMode: true, darkMode: false, fontSize: "normal", accent: "vermilion" }));
    render(<Home />);
    openMore("Load Game");
    fireEvent.click(screen.getAllByRole("button", { name: "LOAD" })[1]);
    expect(screen.getAllByText(/PLAY SCENE · LEAF 1/i).length).toBeGreaterThan(0);
    openChronicle("Chronicle");
    expect(screen.getAllByText("คืนที่เมืองซาไกตื่น").length).toBeGreaterThan(0);
  });

  it("lists campaign records from Chronicle and restores the selected campaign into the Story group", () => {
    const saika = createSaikaSafehouseDemo();
    const earlier = createSaikaSafehouseDemo();
    earlier.campaign = { ...earlier.campaign, id: "camp-earlier", title: "Ashes at the river gate", year: 1568, location: "ท่าเรือคิอิ" };
    earlier.currentScene = { ...earlier.currentScene, title: "ข่าวจากท่าเรือ" };
    earlier.memories = [{ ...earlier.memories[0], id: "memory-earlier", title: "เงาที่ท่าเรือคิอิ", detail: "คนเรือปิดปากเงียบเมื่อข่าวจากท่าเรือคิอิมาถึง" }];
    window.localStorage.setItem("dust-fire-local-game-v3-saika", JSON.stringify({ game: saika, saves: { manual: saika, leaf2: null, leaf3: null }, campaignLibrary: { [saika.campaign.id]: saika, [earlier.campaign.id]: earlier }, language: "en", readerMode: true, darkMode: false, fontSize: "normal", accent: "vermilion" }));
    render(<Home />);
    openChronicle("Campaign Library");
    expect(screen.getAllByText("Smoke Beneath Sakai").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Ashes at the river gate/i }));
    expect(screen.getAllByText("ข่าวจากท่าเรือ").length).toBeGreaterThan(0);
    openChronicle("Chronicle");
    expect(screen.getAllByText("เงาที่ท่าเรือคิอิ").length).toBeGreaterThan(0);
  });

  it("plays a Local Trial, records an outcome, saves it, and restores it without GM or credit mutations", () => {
    render(<Home />);
    expect(mocks.creditsQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));
    fireEvent.click(screen.getByRole("button", { name: /Return to/i }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will show the rice ledger to the clerk." } });
    fireEvent.click(screen.getByRole("button", { name: /set this intention/i }));
    fireEvent.click(screen.getByRole("button", { name: /roll 2d12/i }));
    fireEvent.click(screen.getByRole("button", { name: /record this result/i }));
    expect(screen.getAllByText(/LEAF 1/i).length).toBeGreaterThan(0);
    expect(mocks.gmAnalyzeMutate).not.toHaveBeenCalled();
    expect(mocks.gmResolveMutate).not.toHaveBeenCalled();
    expect(mocks.spendCreditMutate).not.toHaveBeenCalled();
    openMore("Save Game");
    expect(screen.getByText("Save the leaf before it turns")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "SAVE HERE" })[0]);
    openMore("Load Game");
    fireEvent.click(screen.getAllByRole("button", { name: "LOAD" })[1]);
    expect(screen.getByText(/PLAY SCENE · LEAF/i)).toBeTruthy();
  });

  it("offers Momentum only after the local 2d12 result is visible and persists the spent token", async () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Return to/i }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will use the ledger to ask the clerk for time." } });
    fireEvent.click(screen.getByRole("button", { name: /set this intention/i }));
    fireEvent.click(screen.getByRole("button", { name: /roll 2d12/i }));
    expect(screen.getByRole("button", { name: /spend momentum/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /spend momentum/i }));
    fireEvent.click(screen.getByRole("button", { name: /record this result/i }));
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("dust-fire-local-game-v3-saika") ?? "{}");
      expect(saved.game.rolls[0].momentumSpent).toBe(2);
      expect(saved.game.character.vitals.momentum).toBe(0);
    });
  });

  it("routes the Prepare group through gear, market, services, obligations, and exchange history", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Prepare" }));
    ["Carried Gear", "This Market", "Services & Hands", "Debts & Favors", "Agreements & Consequences"].forEach((item) => expect(screen.getByRole("button", { name: item })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Carried Gear" }));
    expect(screen.getByText("Carried slots")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "This Market" }));
    expect(screen.getAllByText(/Why this price:/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Services & Hands" }));
    expect(screen.getByText("คนส่งสารท่าเรือ")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Debts & Favors" }));
    expect(screen.getByText("หนี้ชีวิตจากการลากซาเนฟุยุขึ้นจากน้ำ")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Agreements & Consequences" }));
    expect(screen.getByText("กันทาโร่ลากซาเนฟุยุขึ้นจากน้ำ")).toBeTruthy();
  });

  it("renders the shared ledger with Step/XP, agreements, and honest reward context across preparation and local save views", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Prepare" }));
    fireEvent.click(screen.getByRole("button", { name: "Character Dossier" }));
    expect(screen.getByText("NEXT PRACTICE")).toBeTruthy();
    expect(screen.getByText(/: \d+\/\d+ XP$/)).toBeTruthy();
    expect(screen.getByText("OPEN AGREEMENTS")).toBeTruthy();
    expect(screen.getByTestId("campaign-reward-context")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "This Market" }));
    expect(screen.getByText("NEXT PRACTICE")).toBeTruthy();
    expect(screen.getByText(/: \d+\/\d+ XP$/)).toBeTruthy();
    expect(screen.getByText("OPEN AGREEMENTS")).toBeTruthy();
    expect(screen.getByTestId("market-reward-context")).toBeTruthy();

    openMore("Save Game");
    expect(screen.getByText("NEXT PRACTICE")).toBeTruthy();
    expect(screen.getByText(/: \d+\/\d+ XP$/)).toBeTruthy();
    expect(screen.getByText("OPEN AGREEMENTS")).toBeTruthy();
    expect(screen.getByTestId("campaign-reward-context")).toBeTruthy();
    openMore("Load Game");
    expect(screen.getByText("NEXT PRACTICE")).toBeTruthy();
    expect(screen.getByText(/: \d+\/\d+ XP$/)).toBeTruthy();
    expect(screen.getByText("OPEN AGREEMENTS")).toBeTruthy();
    expect(screen.getByTestId("campaign-reward-context")).toBeTruthy();
  });

  it("uses a review seed instead of stale local storage when opening a review route", async () => {
    const legacy = JSON.parse(JSON.stringify(createSaikaSafehouseDemo())) as { economy?: unknown };
    delete legacy.economy;
    window.localStorage.setItem("dust-fire-local-game-v3-saika", JSON.stringify({ game: legacy, saves: { manual: legacy, leaf2: null, leaf3: null }, language: "en", readerMode: true, darkMode: false, fontSize: "normal", accent: "vermilion" }));
    window.history.replaceState({}, "", "/?review=market");
    render(<Home />);
    await waitFor(() => expect(screen.getByRole("heading", { name: /Markets are made of people/i })).toBeTruthy());
    expect(screen.getAllByText(/Seller network:/i).length).toBeGreaterThan(0);
  });

  it("returns from the Story group to Campaign Command and exposes the map-first state", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Campaign Command" }));
    expect(screen.getByText(/CAMPAIGN COMMAND/)).toBeTruthy();
    expect(screen.getByText(/NATIONAL MAP/)).toBeTruthy();
  });

  it("falls back to Local Trial without spending a credit when an AI GM resolution fails", async () => {
    mocks.gmAnalyzeMutate.mockImplementation((_input, callbacks) => callbacks.onSuccess({ intentSummary: "Show the rice ledger", suggestedMastery: null, axis: "mind", contextBonus: 0, contextReason: "The clerk can inspect the ledger", difficulty: 14, risk: "The clerk may remember the request", confirmation: "Show the ledger before the clerk", historicalStatus: "campaign-fiction", historicalFence: "This is campaign fiction." }));
    mocks.gmResolveMutate.mockImplementation((_input, callbacks) => callbacks.onError(new Error("provider exhausted")));
    render(<Home forceUiPreviewMode={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Play Scene" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will show the rice ledger to the clerk." } });
    fireEvent.click(screen.getByRole("button", { name: /set this intention/i }));
    fireEvent.click(screen.getByRole("button", { name: /roll 2d12/i }));
    fireEvent.click(screen.getByRole("button", { name: /record this result/i }));
    expect(screen.getAllByText(/AI unavailable/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/LEAF 1/i).length).toBeGreaterThan(0);
    expect(mocks.spendCreditMutate).not.toHaveBeenCalled();
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("dust-fire-local-game-v3-saika") ?? "{}");
      expect(saved.game.tick).toBe(2);
      expect(saved.game.rolls).toHaveLength(1);
    });
  });
});
