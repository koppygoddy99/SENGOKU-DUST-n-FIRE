import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CampaignNavigation } from "./Home";

describe("Campaign 1 navigation", () => {
  it("hides campaign child pages while collapsed", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="home" expanded={false} onToggle={() => undefined} onOpen={() => undefined} />);
    expect(html).toContain("Ash over Kinokawa");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(">Play<");
    expect(html).toContain(">New Campaign<");
  });

  it("renders the market parent with its five nested ledgers and marks an active market child", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="localmarket" expanded onToggle={() => undefined} onOpen={() => undefined} />);
    expect(html).toContain('aria-expanded="true"');
    ["Play", "Missions", "Market &amp; gear", "Carried gear", "This market", "Services &amp; hands", "Credit, debts &amp; favors", "Exchange history", "Character", "Campaign Log", "World Archive", "Save Game", "Load Game"].forEach((item) => expect(html).toContain(`>${item}<`));
    expect(html).toContain("market-nav__children");
    expect(html).toContain("nav-item--market-parent");
    expect(html).toContain("nav-item--market-child nav-item--active");
  });
});
