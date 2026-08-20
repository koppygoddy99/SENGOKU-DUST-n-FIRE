// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useQuery: vi.fn(),
  setLocation: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: mocks.useAuth }));
vi.mock("@/lib/trpc", () => ({ trpc: { admin: { overview: { useQuery: mocks.useQuery } } } }));
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
    mocks.useQuery.mockReturnValue({ data: undefined, isLoading: false });
    render(<AdminConsole />);
    expect(screen.getByRole("heading", { name: /administrator access required/i })).toBeTruthy();
    expect(mocks.useQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));
  });

  it("renders factual system rows inside the war-office ledger for the administrator role", () => {
    mocks.useAuth.mockReturnValue({ user: { name: "Office Keeper", role: "admin" }, loading: false });
    mocks.useQuery.mockReturnValue({ isLoading: false, data: { product: { name: "Dust & Fire", mode: "local-first" }, review: { manifestRequired: true, rule: "manifest" }, systems: [{ id: "local-save", label: "Local Save", status: "ready", detail: "Campaign records remain in the player browser." }] } });
    render(<AdminConsole />);
    expect(screen.getByRole("heading", { name: "Office Overview" })).toBeTruthy();
    expect(screen.getByText("WAR OFFICE")).toBeTruthy();
    expect(screen.getByText("Local Save")).toBeTruthy();
    expect(screen.getByText("Campaign records remain in the player browser.")).toBeTruthy();
    expect(mocks.useQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: true }));
  });
});
