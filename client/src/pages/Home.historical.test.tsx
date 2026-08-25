import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HistoricalBoundaryPanel, RollPreviewPanel, historicalStatusLabel } from "@/features/play/LegacyHistoricalPanels";
import type { RollPreview } from "@/lib/game";

const statuses = ["fact-supported", "contextual-play", "campaign-fiction", "insufficient-evidence"] as const;

function previewFor(status: (typeof statuses)[number]): RollPreview {
  return {
    action: "I show the rice ledger.",
    intent: "Buy time with the ledger.",
    method: "Present the document and wait for the clerk's reply.",
    stat: "mind",
    contextBonus: 0,
    difficulty: 16,
    risks: ["A witness may remember your name."],
    witnesses: [],
    historical: { status, fence: `Fence for ${status}.` },
  };
}

describe("historical boundary shown to the player", () => {
  it.each(statuses)("renders the %s status and fence in English", (status) => {
    const html = renderToStaticMarkup(<RollPreviewPanel preview={previewFor(status)} language="en" onCancel={() => undefined} onGrit={() => undefined} isResolving={false} />);
    expect(html).toContain("HISTORICAL BOUNDARY");
    expect(html).toContain(historicalStatusLabel(status, "en"));
    expect(html).toContain(`Fence for ${status}.`);
  });

  it.each(statuses)("provides a Thai label for the %s status", (status) => {
    expect(historicalStatusLabel(status, "th")).not.toEqual(historicalStatusLabel(status, "en"));
  });

  it.each(statuses)("renders the %s historical record after a roll", (status) => {
    const html = renderToStaticMarkup(<HistoricalBoundaryPanel historical={previewFor(status).historical!} language="en" resolved />);
    expect(html).toContain("HISTORICAL RECORD");
    expect(html).toContain(historicalStatusLabel(status, "en"));
    expect(html).toContain(`Fence for ${status}.`);
  });
});
