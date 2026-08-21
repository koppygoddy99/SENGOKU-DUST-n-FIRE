import { chromium, expect, test } from "@playwright/test";

const baseUrl = process.env.CAMPAIGN_COMMAND_TEST_URL ?? "http://127.0.0.1:3000";
const reviewStates = [
  { name: "open rail", query: "?review=home" },
  { name: "collapsed rail", query: "?review=home&rail=collapsed" },
];

for (const reviewState of reviewStates) {
  test(`Campaign Command has no horizontal overflow at 1280px with ${reviewState.name}`, async () => {
    const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    try {
      await page.goto(`${baseUrl}/${reviewState.query}`, { waitUntil: "networkidle" });
      await page.waitForSelector('[data-testid="campaign-command-grid"]');

      const measures = await page.evaluate(() => {
        const selectors = [".app-shell", '[data-testid="player-main-content"]', '[data-testid="campaign-command-grid"]', '[data-testid="province-map-surface"]'];
        return selectors.map((selector) => {
          const element = document.querySelector(selector);
          if (!(element instanceof HTMLElement)) throw new Error(`Missing ${selector}`);
          return { selector, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
        });
      });

      for (const measure of measures) {
        expect(measure.clientWidth, `${reviewState.name}: ${measure.selector} must have measurable width`).toBeGreaterThan(0);
        expect(measure.scrollWidth, `${reviewState.name}: ${measure.selector} must not overflow horizontally`).toBeLessThanOrEqual(measure.clientWidth);
      }
    } finally {
      await browser.close();
    }
  });
}
