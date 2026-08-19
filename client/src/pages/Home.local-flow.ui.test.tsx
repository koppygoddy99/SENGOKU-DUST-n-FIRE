// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("UI Preview click flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it("loads the 1569 Saika safehouse save into Play and Campaign Log", () => {
    render(<Home />);
    expect(screen.getByText("1569")).toBeTruthy();
    expect(screen.getAllByText("Sakai / Izumi").length).toBeGreaterThan(0);
    expect(screen.getByText("ซาเนฟุยุ")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try ui preview/i }));
    expect(screen.getAllByText("คำตอบใต้ห้องขัง").length).toBeGreaterThan(0);
    expect(screen.getByText(/เซฟเฮาส์ลับของไซกะ/i)).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Campaign Log" })[0]);
    expect(screen.getAllByText("คืนที่เมืองซาไกตื่น").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/กันทาโร่/).length).toBeGreaterThan(0);
  });

  it("restores the Saika example from Local Save through Load Game before opening Play and Campaign Log", () => {
    const restored = createSaikaSafehouseDemo();
    restored.tick = 4;
    window.localStorage.setItem("dust-fire-local-game-v3-saika", JSON.stringify({ game: restored, saves: { manual: restored, leaf2: null, leaf3: null }, language: "en", readerMode: true, darkMode: false, fontSize: "normal", accent: "vermilion" }));
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Load Game" }));
    fireEvent.click(screen.getAllByRole("button", { name: "LOAD" })[1]);
    expect(screen.getAllByText(/UI PREVIEW · LEAF 4/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("คำตอบใต้ห้องขัง").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Campaign Log" })[0]);
    expect(screen.getAllByText("คืนที่เมืองซาไกตื่น").length).toBeGreaterThan(0);
  });

  it("lists prior campaigns and switches the active Campaign menu after a selection", () => {
    const saika = createSaikaSafehouseDemo();
    const earlier = createSaikaSafehouseDemo();
    earlier.campaign = { ...earlier.campaign, id: "camp-earlier", title: "Ashes at the river gate", year: 1568, location: "ท่าเรือคิอิ" };
    earlier.currentScene = { ...earlier.currentScene, title: "ข่าวจากท่าเรือ" };
    earlier.memories = [{ ...earlier.memories[0], id: "memory-earlier", title: "เงาที่ท่าเรือคิอิ", detail: "คนเรือปิดปากเงียบเมื่อข่าวจากท่าเรือคิอิมาถึง" }];
    window.localStorage.setItem("dust-fire-local-game-v3-saika", JSON.stringify({ game: saika, saves: { manual: saika, leaf2: null, leaf3: null }, campaignLibrary: { [saika.campaign.id]: saika, [earlier.campaign.id]: earlier }, language: "en", readerMode: true, darkMode: false, fontSize: "normal", accent: "vermilion" }));
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Campaigns" }));
    expect(screen.getAllByText("Smoke Beneath Sakai").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ashes at the river gate").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Ashes at the river gate/i }));
    expect(screen.getAllByText("Ashes at the river gate").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ข่าวจากท่าเรือ").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Campaign Log" })[0]);
    expect(screen.getAllByText("เงาที่ท่าเรือคิอิ").length).toBeGreaterThan(0);
  });

  it("moves from Campaign 1 through Play, local roll, Log, Save, and Load without GM or credit backend calls", () => {
    render(<Home />);
    expect(mocks.creditsQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));

    fireEvent.click(screen.getByRole("button", { name: /try ui preview/i }));
    expect(screen.getByText(/UI PREVIEW · LEAF/i)).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will show the rice ledger to the clerk." } });
    fireEvent.click(screen.getByRole("button", { name: /analyze locally/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm & roll/i }));
    expect(screen.getAllByText(/LEAF 2/i).length).toBeGreaterThan(0);
    expect(mocks.gmAnalyzeMutate).not.toHaveBeenCalled();
    expect(mocks.gmResolveMutate).not.toHaveBeenCalled();
    expect(mocks.spendCreditMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "Campaign Log" })[0]);
    expect(screen.getAllByText("Reader Mode").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Save Game" }));
    expect(screen.getByText("Save the leaf before it turns")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "SAVE HERE" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Load Game" }));
    expect(screen.getByText("Return to a recorded leaf")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "LOAD" })[1]);
    expect(screen.getByText(/UI PREVIEW · LEAF/i)).toBeTruthy();
  });
});
