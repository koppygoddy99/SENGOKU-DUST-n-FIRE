import { chromium, expect, test } from "@playwright/test";

const baseUrl = process.env.CAMPAIGN_COMMAND_TEST_URL ?? "http://127.0.0.1:3000";

test("disconnecting the browser locks the player shell instead of permitting Local Save play", async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    await page.goto(`${baseUrl}/?review=play`, { waitUntil: "networkidle" });
    await expect(page.locator("#play-intent-field")).toBeVisible();

    await context.setOffline(true);
    await expect(page.getByTestId("offline-play-lock")).toBeVisible();
    await expect(page.getByRole("heading", { name: /connection required to play/i })).toBeVisible();
    await expect(page.locator("#play-intent-field")).toHaveCount(0);

    await context.setOffline(false);
    await expect(page.locator("#play-intent-field")).toBeVisible();
  } finally {
    await browser.close();
  }
});
