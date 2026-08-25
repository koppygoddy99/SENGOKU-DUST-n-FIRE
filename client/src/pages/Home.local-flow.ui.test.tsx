// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
import { OUTCOME_WORD_CADENCE_MS, ROLL_ANIMATION_MS } from "../features/play/PlayScene";

function openChronicle(child: "Chronicle") {
  const group = screen.getAllByRole("button", { name: "Chronicle" }).find((button) => button.hasAttribute("aria-expanded"));
  if (group?.getAttribute("aria-expanded") !== "true") fireEvent.click(group!);
  const childButton = screen.getAllByRole("button", { name: child }).find((button) => !button.hasAttribute("aria-expanded"));
  fireEvent.click(childButton!);
}

function openMore(child: "Campaign Library" | "Save Game" | "Load Game") {
  const group = screen.getByRole("button", { name: "More" });
  if (group.getAttribute("aria-expanded") !== "true") fireEvent.click(group);
  const childButton = screen.getAllByRole("button", { name: child }).find((button) => !button.hasAttribute("aria-expanded") && button.closest(".campaign-nav__items"));
  fireEvent.click(childButton!);
}

function settleDiceStage() {
  act(() => vi.advanceTimersByTime(ROLL_ANIMATION_MS));
}

function finishNarrativeDraft() {
  act(() => vi.advanceTimersByTime(OUTCOME_WORD_CADENCE_MS * 600));
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
    expect(screen.getAllByText(/PLAY SCENE · PAGE 1/i).length).toBeGreaterThan(0);
    openChronicle("Chronicle");
    expect(screen.getAllByText("คืนที่เมืองซาไกตื่น").length).toBeGreaterThan(0);
  });

  it("requires a second explicit confirmation before deleting a manual local save", () => {
    const game = createSaikaSafehouseDemo();
    const manual = createSaikaSafehouseDemo();
    manual.campaign = { ...manual.campaign, id: "camp-delete", title: "Delete this local leaf" };
    window.localStorage.setItem("dust-fire-local-game-v3-saika", JSON.stringify({ game, saves: { manual, leaf2: null, leaf3: null }, language: "en", readerMode: true, darkMode: false, fontSize: "normal", accent: "vermilion" }));
    render(<Home />);
    openMore("Load Game");
    fireEvent.click(screen.getAllByRole("button", { name: "DELETE" })[0]);
    expect(screen.getByRole("button", { name: "CONFIRM DELETE" })).toBeTruthy();
    expect(screen.getByText("Delete this local leaf")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "CONFIRM DELETE" }));
    expect(screen.queryByText("Delete this local leaf")).toBeNull();
  });

  it("shows the full character confirmation dossier before a Local Save begins", () => {
    window.history.replaceState({}, "", "/?review=start");
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("WHO YOU ARE")).toBeTruthy();
    expect(screen.getByText("FIRST MISSION")).toBeTruthy();
    expect(screen.getByText("ALL STARTING MASTERIES")).toBeTruthy();
    expect(screen.getByText("CARRIED GEAR")).toBeTruthy();
    expect(screen.getByText("CHARACTER BACKGROUND")).toBeTruthy();
  });

  it("lists campaign records from Chronicle and restores the selected campaign into the Story group", () => {
    const saika = createSaikaSafehouseDemo();
    const earlier = createSaikaSafehouseDemo();
    earlier.campaign = { ...earlier.campaign, id: "camp-earlier", title: "Ashes at the river gate", year: 1568, location: "ท่าเรือคิอิ" };
    earlier.currentScene = { ...earlier.currentScene, title: "ข่าวจากท่าเรือ" };
    earlier.memories = [{ ...earlier.memories[0], id: "memory-earlier", title: "เงาที่ท่าเรือคิอิ", detail: "คนเรือปิดปากเงียบเมื่อข่าวจากท่าเรือคิอิมาถึง" }];
    window.localStorage.setItem("dust-fire-local-game-v3-saika", JSON.stringify({ game: saika, saves: { manual: saika, leaf2: null, leaf3: null }, campaignLibrary: { [saika.campaign.id]: saika, [earlier.campaign.id]: earlier }, language: "en", readerMode: false, darkMode: false, fontSize: "normal", accent: "vermilion" }));
    render(<Home />);
    openMore("Campaign Library");
    expect(screen.getAllByText("Smoke Beneath Sakai").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Ashes at the river gate/i }));
    expect(screen.getAllByText("ข่าวจากท่าเรือ").length).toBeGreaterThan(0);
    openChronicle("Chronicle");
    expect(screen.getAllByText("เงาที่ท่าเรือคิอิ").length).toBeGreaterThan(0);
    expect(screen.getByTestId("chronicle-campaign-scope").textContent).toContain("Ashes at the river gate");
  });

  it("plays a Local Trial, records an outcome, saves it, and restores it without GM or credit mutations", () => {
    vi.useFakeTimers();
    render(<Home />);
    expect(mocks.creditsQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));
    fireEvent.click(screen.getByRole("button", { name: /Return to/i }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will show the rice ledger to the clerk." } });
    fireEvent.click(screen.getByRole("button", { name: /set this intention/i }));
    fireEvent.click(screen.getByRole("button", { name: /roll 2d12/i }));
    settleDiceStage();
    fireEvent.click(screen.getByRole("button", { name: /record this result/i }));
    expect(screen.getAllByText(/PAGE 1/i).length).toBeGreaterThan(0);
    expect(mocks.gmAnalyzeMutate).not.toHaveBeenCalled();
    expect(mocks.gmResolveMutate).not.toHaveBeenCalled();
    expect(mocks.spendCreditMutate).not.toHaveBeenCalled();
    openMore("Save Game");
    expect(screen.getByText("Save the leaf before it turns")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "SAVE HERE" })[0]);
    openMore("Load Game");
    fireEvent.click(screen.getAllByRole("button", { name: "LOAD" })[1]);
    expect(screen.getByText(/PLAY SCENE · PAGE/i)).toBeTruthy();
    vi.useRealTimers();
  });

  it("offers Momentum only after the local 2d12 result is visible and persists the spent token", () => {
    vi.useFakeTimers();
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Return to/i }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will use the ledger to ask the clerk for time." } });
    fireEvent.click(screen.getByRole("button", { name: /set this intention/i }));
    fireEvent.click(screen.getByRole("button", { name: /roll 2d12/i }));
    settleDiceStage();
    expect(screen.getByRole("button", { name: /spend momentum/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /spend momentum/i }));
    fireEvent.click(screen.getByRole("button", { name: /record this result/i }));
    const saved = JSON.parse(window.localStorage.getItem("dust-fire-local-game-v3-saika") ?? "{}");
    expect(saved.game.rolls[0].momentumSpent).toBe(2);
    expect(saved.game.character.vitals.momentum).toBe(0);
    vi.useRealTimers();
  });

  it("uses one direct intent CTA without a risk-preview button and preserves the four-second roll cadence", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Return to/i }));
    expect(screen.getByText("What will you do?")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /see the risk/i })).toBeNull();
    expect(ROLL_ANIMATION_MS).toBe(4000);
  });

  it("keeps two dice in the decision window and lets a saved narrative outcome accept the next intent immediately", () => {
    vi.useFakeTimers();
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Return to/i }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will offer the clerk a favor." } });
    fireEvent.click(screen.getByRole("button", { name: /set this intention/i }));
    fireEvent.click(screen.getByRole("button", { name: /roll 2d12/i }));
    expect(screen.getByTestId("dice-decision-window")).toBeTruthy();
    expect(screen.getByTestId("dice-one").textContent).toMatch(/^\d+$/);
    expect(screen.getByTestId("dice-two").textContent).toMatch(/^\d+$/);
    settleDiceStage();
    expect(screen.getByTestId("roll-formula")).toBeTruthy();
    expect(screen.getByText("HOW THIS RESULT WAS BUILT")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /record this result/i }));
    expect(screen.getByTestId("narrative-outcome-draft")).toBeTruthy();
    expect(screen.queryByTestId("narrative-outcome")).toBeNull();
    finishNarrativeDraft();
    fireEvent.click(screen.getByRole("button", { name: /view full outcome/i }));
    expect(screen.getByTestId("narrative-outcome")).toBeTruthy();
    expect(screen.getByTestId("outcome-roll-breakdown")).toBeTruthy();
    expect(screen.getByText("POSSIBLE NEXT APPROACHES")).toBeTruthy();
    expect(screen.queryByText("SKILL LEDGER")).toBeNull();
    expect(screen.queryByText("POSSIBLE APPROACHES")).toBeNull();
    expect(screen.queryByText("ฉากแคมเปญสมมติในบริบทเมืองท่าซาไก ค.ศ. 1569 ใช้แรงกดดันของการค้า อาวุธ และเครือข่ายไซกะเป็นฉากหลัง ไม่ได้ยืนยันว่า NPC ในฉากมีตัวตนจริง.")).toBeNull();
    expect(screen.queryByText("คำตอบใต้ห้องขัง")).toBeNull();
    expect(screen.getByRole("button", { name: /write next intent/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /return to map/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /open chronicle/i })).toBeTruthy();
    const nextIntent = screen.getByRole("textbox");
    fireEvent.change(nextIntent, { target: { value: "I will carry the answer to the gate." } });
    expect(screen.getByRole("button", { name: /set this intention/i })).toBeTruthy();
    vi.useRealTimers();
  });

  it("presents World Archive cards as readonly records rather than navigation controls", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Chronicle" }));
    fireEvent.click(screen.getByRole("button", { name: "World Archive" }));
    const records = screen.getAllByTestId("archive-record");
    expect(records).toHaveLength(4);
    expect(records.every((record) => record.tagName === "ARTICLE")).toBe(true);
  });

  it("routes the Prepare group through gear, market, services, obligations, and exchange history", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Prepare" }));
    ["Carried Gear", "This Market", "Services & Hands", "Leverage", "Bonds"].forEach((item) => expect(screen.getByRole("button", { name: item })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Carried Gear" }));
    expect(screen.getByText("Carried slots")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "This Market" }));
    expect(screen.getAllByText(/Market Factor:/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Services & Hands" }));
    expect(screen.getByText("คนส่งสารท่าเรือ")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Leverage" })[0]);
    expect(screen.getByText("หนี้ชีวิตจากการลากซาเนฟุยุขึ้นจากน้ำ")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Bonds" }));
    expect(screen.getByText("กันทาโร่ลากซาเนฟุยุขึ้นจากน้ำ")).toBeTruthy();
  });

  it("renders the shared ledger with Step/XP, agreements, and honest reward context across preparation and local save views", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Prepare" }));
    fireEvent.click(screen.getByRole("button", { name: "Character Dossier" }));
    expect(screen.getByText("Open this campaign's Chronicle")).toBeTruthy();
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

  it("falls back to Local Trial without spending a credit when an AI GM resolution fails", () => {
    vi.useFakeTimers();
    mocks.gmAnalyzeMutate.mockImplementation((_input, callbacks) => callbacks.onSuccess({ intentSummary: "Show the rice ledger", suggestedMastery: null, stat: "mind", contextBonus: 0, contextReason: "The clerk can inspect the ledger", difficulty: 14, risk: "The clerk may remember the request", confirmation: "Show the ledger before the clerk", historicalStatus: "campaign-fiction", historicalFence: "This is campaign fiction." }));
    mocks.gmResolveMutate.mockImplementation((_input, callbacks) => callbacks.onError(new Error("provider exhausted")));
    render(<Home forceUiPreviewMode={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Play Scene" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will show the rice ledger to the clerk." } });
    fireEvent.click(screen.getByRole("button", { name: /set this intention/i }));
    fireEvent.click(screen.getByRole("button", { name: /roll 2d12/i }));
    settleDiceStage();
    fireEvent.click(screen.getByRole("button", { name: /record this result/i }));
    expect(screen.getAllByText(/AI unavailable/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/PAGE 1/i).length).toBeGreaterThan(0);
    expect(mocks.spendCreditMutate).not.toHaveBeenCalled();
    const saved = JSON.parse(window.localStorage.getItem("dust-fire-local-game-v3-saika") ?? "{}");
    expect(saved.game.tick).toBe(2);
    expect(saved.game.rolls).toHaveLength(1);
    vi.useRealTimers();
  });
});
