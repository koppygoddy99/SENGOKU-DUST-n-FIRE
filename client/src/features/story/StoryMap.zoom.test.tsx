// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createSaikaSafehouseDemo } from "@/lib/game";
import { StoryMap } from "./StoryMap";

describe("StoryMap province zoom", () => {
  it("keeps province labels hidden in overview, then reveals selectable nearby provinces and a year-scoped brief", () => {
    const game = createSaikaSafehouseDemo();
    render(<StoryMap game={game} language="en" onOpen={() => undefined} />);

    expect(screen.queryByTestId("province-hotspot--izumi")).toBeNull();
    fireEvent.click(screen.getByTestId("national-map-zoom-in"));

    expect(screen.getByTestId("province-hotspot--izumi")).toBeTruthy();
    expect(screen.getByTestId("province-hotspot--settsu")).toBeTruthy();
    expect(screen.getByTestId("national-map-province-brief").textContent).toContain("Izumi");
    fireEvent.click(screen.getByTestId("province-hotspot--yamato"));
    expect(screen.getByTestId("national-map-province-brief").textContent).toContain("Yamato");
    expect(screen.getByText("Overview").getAttribute("aria-pressed")).toBe("false");
  });
});
