import { chromium, expect, test } from "@playwright/test";

const baseUrl = process.env.CAMPAIGN_COMMAND_TEST_URL ?? "http://127.0.0.1:3000";

test("mobile keyboard keeps navigation, home return, and direct intent CTA reachable", async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  try {
    await page.goto(`${baseUrl}/?review=play`, { waitUntil: "networkidle" });
    await page.waitForSelector("#play-intent-field");

    const mobileMenu = page.getByRole("button", { name: "Open menu" });
    await expect(mobileMenu).toBeVisible();
    await mobileMenu.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "More" })).toBeVisible();

    const brand = page.getByRole("button", { name: "Dust and Fire home" });
    await brand.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Campaign Command" })).toBeVisible();

    await page.goto(`${baseUrl}/?review=play`, { waitUntil: "networkidle" });
    const intent = page.locator("#play-intent-field");
    await intent.focus();
    await intent.fill("I will ask the keeper to delay the gate closure.");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /set this intention/i })).toBeFocused();
  } finally {
    await browser.close();
  }
});
