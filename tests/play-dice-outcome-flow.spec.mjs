import { chromium, expect, test } from "@playwright/test";

const baseUrl = process.env.CAMPAIGN_COMMAND_TEST_URL ?? "http://127.0.0.1:3000";

test("Play Scene retains the visible two-dice rolling stage even when reduced motion is requested", async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${baseUrl}/?review=play`, { waitUntil: "networkidle" });
    await page.locator("#play-intent-field").fill("I will offer the clerk a favor before the gate closes.");
    await page.getByRole("button", { name: /set this intention/i }).click();
    await page.getByRole("button", { name: /roll 2d12/i }).click();

    const decision = page.getByTestId("dice-decision-window");
    await expect(decision).toBeVisible();
    await expect(decision).toHaveClass(/is-rolling/);
    await expect(page.getByText(/rolling 2d12/i)).toBeVisible();
    await expect(page.getByText(/the dice are still moving/i)).toBeVisible();
    await expect(page.getByTestId("dice-one")).toBeVisible();
    await expect(page.getByTestId("dice-two")).toBeVisible();
    await expect(decision).not.toHaveClass(/is-rolling/, { timeout: 5_000 });
    await expect(page.getByText(/dice result.*decision window/i)).toBeVisible();
    await expect(page.getByTestId("roll-formula")).toBeVisible();
    await expect(page.getByText(/how this result was built/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /record this result/i })).toBeVisible();

    const firstDieBeforeMomentum = await page.getByTestId("dice-one").innerText();
    const secondDieBeforeMomentum = await page.getByTestId("dice-two").innerText();
    const totalBeforeMomentum = Number(await page.locator(".play-dice-result__formula-verdict strong").innerText());
    await page.getByRole("button", { name: /spend momentum/i }).click();
    await expect(page.getByTestId("roll-formula")).toBeVisible();
    await expect(page.getByTestId("dice-one")).toHaveText(firstDieBeforeMomentum);
    await expect(page.getByTestId("dice-two")).toHaveText(secondDieBeforeMomentum);
    await expect(page.getByText(/momentum/i).last()).toBeVisible();
    await expect(page.locator(".play-dice-result__formula-verdict strong")).toHaveText(String(totalBeforeMomentum + 2));

    await page.getByRole("button", { name: /record this result/i }).click();
    await expect(page.getByTestId("narrative-outcome-draft")).toBeVisible();
    await expect(page.getByRole("button", { name: /view full outcome/i })).toBeVisible({ timeout: 5_000 });
    await page.getByRole("button", { name: /view full outcome/i }).click();
    await expect(page.getByTestId("narrative-outcome")).toBeVisible();
    await expect(page.getByTestId("outcome-roll-breakdown")).toBeVisible();
    await expect(page.getByText(/possible next approaches/i)).toBeVisible();
    await expect(page.locator("#play-intent-field")).toBeVisible();
    await page.locator("#play-intent-field").fill("I will carry the reply into the night.");
    await expect(page.getByRole("button", { name: /set this intention/i })).toBeEnabled();
  } finally {
    await browser.close();
  }
});
