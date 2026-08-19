import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CampaignNavigation } from "./Home";

describe("Campaign 1 navigation", () => {
  it("hides campaign child pages while collapsed", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="home" expanded={false} onToggle={() => undefined} onOpen={() => undefined} />);
    expect(html).toContain("Campaign 1");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(">Play<");
    expect(html).toContain(">New Campaign<");
  });

  it("renders all campaign child pages and marks the active child while expanded", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="play" expanded onToggle={() => undefined} onOpen={() => undefined} />);
    expect(html).toContain('aria-expanded="true"');
    ["Play", "Missions", "Market", "Character", "Campaign Log", "World Archive", "Save Game", "Load Game"].forEach((item) => expect(html).toContain(`>${item}<`));
    ["Play", "Campaign Log", "Save Game", "Load Game"].forEach((item) => expect(html).toContain(`>${item}<`));
    expect(html).toContain("nav-item nav-item--child nav-item--active");
  });
});
