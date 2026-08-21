// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ creditsQuery: vi.fn(() => ({ data: undefined, refetch: vi.fn() })) }));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Layout Tester" }, loading: false, isAuthenticated: true }) }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({ trpc: { profile: { credits: { useQuery: mocks.creditsQuery }, spendCredit: { useMutation: vi.fn() } }, gm: { analyze: { useMutation: vi.fn() }, resolve: { useMutation: vi.fn() } } } }));

import Home from "./Home";

function renderCampaignCommand(path: string) {
  window.history.replaceState({}, "", path);
  render(<Home />);
  return {
    main: screen.getByTestId("player-main-content"),
    grid: screen.getByTestId("campaign-command-grid"),
    map: screen.getByTestId("national-context-map"),
  };
}

describe("Campaign Command desktop DOM contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState({}, "", "/");
  });

  it.each([
    ["open rail", "/?review=home", false],
    ["collapsed rail", "/?review=home&rail=collapsed", true],
  ])("renders the $s Campaign Command tree without fixed-width DOM escape hatches", (_name, path, collapsed) => {
    const { main, grid, map } = renderCampaignCommand(path);
    const app = main.closest(".app-shell");

    expect(app?.classList.contains("sidebar-collapsed")).toBe(collapsed);
    expect(main.classList.contains("main-content")).toBe(true);
    expect(grid.classList.contains("story-command-grid")).toBe(true);
    expect(map.classList.contains("national-context-map")).toBe(true);
    expect(grid.querySelector(".story-map-card--map")).toBeTruthy();
    expect(grid.querySelector(".story-map-card--desk")).toBeTruthy();
    expect(main.getAttribute("style") ?? "").not.toMatch(/width\s*:/i);
    expect(grid.getAttribute("style") ?? "").not.toMatch(/width\s*:/i);
    expect(map.getAttribute("style") ?? "").not.toMatch(/width\s*:/i);
  });
});
