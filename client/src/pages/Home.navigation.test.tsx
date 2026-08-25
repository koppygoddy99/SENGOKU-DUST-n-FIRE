import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CampaignNavigation } from "./Home";

describe("Campaign 1 navigation", () => {
  it("hides campaign child pages while collapsed", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="home" expanded={false} onToggle={() => undefined} onOpen={() => undefined} />);
    expect(html).toContain("Ash over Kinokawa");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(">Story<");
    expect(html).not.toContain(">Campaign Command<");
  });

  it("opens the Prepare group with its remaining campaign ledgers and marks the active child", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="localmarket" expanded onToggle={() => undefined} onOpen={() => undefined} />);
    expect(html).toContain('aria-expanded="true"');
    ["Prepare", "Carried Gear", "This Market", "Services &amp; Hands", "Leverage", "Bonds"].forEach((item) => expect(html).toContain(`>${item}<`));
    expect(html).toContain("campaign-nav__items");
    expect(html).toContain("nav-item--child nav-item--active");
    expect(html).not.toContain(">Campaign Command<");
    expect(html).not.toContain(">Character Dossier<");
  });

  it("opens the Story group for the Character Dossier", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="character" expanded onToggle={() => undefined} onOpen={() => undefined} />);
    ["Story", "Campaign Command", "Play Scene", "Missions", "Character Dossier"].forEach((item) => expect(html).toContain(`>${item}<`));
    expect(html).toContain("nav-item--child nav-item--active");
    expect(html).toContain(">Prepare<");
    expect(html).not.toContain(">Carried Gear<");
  });

  it("opens Relationships under Chronicle while keeping Character Dossier in Story", () => {
    const html = renderToStaticMarkup(<CampaignNavigation campaignTitle="Ash over Kinokawa" language="en" page="relationships" expanded onToggle={() => undefined} onOpen={() => undefined} />);
    ["Chronicle", "Relationships", "World Archive"].forEach((item) => expect(html).toContain(`>${item}<`));
    expect(html).toContain("nav-item--child nav-item--active");
    expect(html).toContain(">Story<");
    expect(html).not.toContain(">Character Dossier<");
  });
});
