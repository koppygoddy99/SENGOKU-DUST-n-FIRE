import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const storyMapCss = readFileSync(resolve(process.cwd(), "client/src/features/story/storyMap.css"), "utf8");
const shellCss = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("Campaign Command responsive layout contract", () => {
  it("keeps the Story Desk flexible at desktop widths and stacks it before the main leaf becomes too narrow", () => {
    expect(storyMapCss).toContain("grid-template-columns: minmax(0, 1.62fr) minmax(286px, .72fr)");
    expect(storyMapCss).toContain("@media (max-width: 1180px) { .story-command-grid { grid-template-columns: 1fr;");
    expect(storyMapCss).toContain("@media (max-width: 1320px) and (min-width: 1181px)");
    expect(storyMapCss).toContain("grid-template-columns: 45px 10px 45px minmax(0, 1fr)");
  });

  it("lets the desktop ledger spine compact before the player leaf reaches the mobile breakpoint", () => {
    expect(shellCss).toContain("@media (max-width: 1320px) and (min-width: 761px)");
    expect(shellCss).toContain("@media (max-width: 1180px) and (min-width: 761px)");
    expect(shellCss).toContain(".home-view { grid-template-columns: 1fr; }");
  });

  it("keeps the province map contained and compacts its location dossier for a narrow player leaf", () => {
    expect(storyMapCss).toContain(".province-map { position: relative; min-height: 486px; overflow: hidden;");
    expect(storyMapCss).toContain(".province-map__location-card { top: 21px; left: 21px;");
    expect(storyMapCss).toContain(".province-map__region b { font-size: 8px;");
  });
});
