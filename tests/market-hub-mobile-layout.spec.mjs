import { chromium, expect, test } from "@playwright/test";

const baseUrl = process.env.MARKET_HUB_TEST_URL ?? "http://127.0.0.1:3000";
const reviewTabs = ["gear", "market", "services", "obligations", "exchanges"];

for (const reviewTab of reviewTabs) {
  test(`Market Hub ${reviewTab} keeps guidance and content within the mobile viewport`, async () => {
    const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

    try {
      await page.goto(`${baseUrl}/?review=${reviewTab}`, { waitUntil: "networkidle" });
      await page.waitForSelector('[data-testid="market-ledger-guidance"]');

      const measures = await page.evaluate(() => {
        const selectors = [".app-shell", '[data-testid="player-main-content"]', '[data-testid="market-ledger-guidance"]', '[data-testid="market-tab-content"]'];
        return selectors.map((selector) => {
          const element = document.querySelector(selector);
          if (!(element instanceof HTMLElement)) throw new Error(`Missing ${selector}`);
          return { selector, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
        });
      });

      for (const measure of measures) {
        expect(measure.clientWidth, `${reviewTab}: ${measure.selector} must have measurable width`).toBeGreaterThan(0);
        expect(measure.scrollWidth, `${reviewTab}: ${measure.selector} must not overflow horizontally`).toBeLessThanOrEqual(measure.clientWidth);
      }
    } finally {
      await browser.close();
    }
  });
}
