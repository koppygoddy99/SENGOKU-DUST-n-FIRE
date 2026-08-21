// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  overviewQuery: vi.fn(),
  timelineQuery: vi.fn(),
  operationsQuery: vi.fn(),
  setLocation: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: mocks.useAuth }));
vi.mock("@/lib/trpc", () => ({ trpc: { admin: { overview: { useQuery: mocks.overviewQuery }, timeline: { useQuery: mocks.timelineQuery }, operations: { useQuery: mocks.operationsQuery } } } }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("wouter", () => ({ useLocation: () => ["/admin", mocks.setLocation] }));

import { AdminConsole } from "./AdminConsole";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminConsole", () => {
  it("denies the player role before any administrator query is enabled", () => {
    mocks.useAuth.mockReturnValue({ user: { name: "Player", role: "user" }, loading: false });
    mocks.overviewQuery.mockReturnValue({ data: undefined, isLoading: false });
    mocks.timelineQuery.mockReturnValue({ data: undefined, isLoading: false });
    mocks.operationsQuery.mockReturnValue({ data: undefined, isLoading: false });
    render(<AdminConsole />);
    expect(screen.getByRole("heading", { name: /administrator access required/i })).toBeTruthy();
    expect(mocks.overviewQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));
    expect(mocks.timelineQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));
    expect(mocks.operationsQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));
  });

  it("renders factual system rows inside the war-office ledger for the administrator role", () => {
    mocks.useAuth.mockReturnValue({ user: { name: "Office Keeper", role: "admin" }, loading: false });
    mocks.overviewQuery.mockReturnValue({ isLoading: false, data: { product: { name: "Dust & Fire", mode: "local-first" }, review: { manifestRequired: true, rule: "manifest" }, systems: [{ id: "local-save", label: "Local Save", status: "ready", detail: "Campaign records remain in the player browser." }] } });
    mocks.timelineQuery.mockReturnValue({ isLoading: false, data: { storage: "catalog", reviewedYears: [1569, 1570], recordCount: 7, sourceCount: 2, policy: "Records retain sources." } });
    mocks.operationsQuery.mockReturnValue({ isLoading: false, data: { visitorAnalytics: { status: "not-configured", detail: "No verified metric." }, playerData: { status: "local-first", detail: "Browser storage." }, controls: { status: "read-only", detail: "No mutations." } } });
    render(<AdminConsole />);
    expect(screen.getByRole("heading", { name: "Office Overview" })).toBeTruthy();
    expect(screen.getByText("WAR OFFICE")).toBeTruthy();
    expect(screen.getByText("Local Save")).toBeTruthy();
    expect(screen.getByText("Campaign records remain in the player browser.")).toBeTruthy();
    expect(mocks.overviewQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: true }));
  });
});
