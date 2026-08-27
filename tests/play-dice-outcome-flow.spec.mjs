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

    // Momentum was deliberately removed from the current ruleset. The decision
    // window must therefore expose the settled formula and record action without
    // offering a post-roll modifier that could alter the inspected result.
    await expect(page.getByTestId("roll-formula")).toBeVisible();
    await expect(page.getByRole("button", { name: /spend momentum/i })).toHaveCount(0);

    await page.getByRole("button", { name: /record this result/i }).click();
    await expect(page.getByTestId("narrative-outcome-draft")).toBeVisible();
    await expect(page.getByText("STORY RESULT", { exact: true })).toBeVisible();
    await expect(page.getByTestId("outcome-composer")).toBeVisible();
    await expect(page.getByTestId("outcome-composer")).not.toBeVisible({ timeout: 6_000 });
    await expect(page.getByRole("button", { name: /continue playing/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /continue playing/i }).click();
    await expect(page.locator("#play-intent-field")).toBeVisible();
    await page.locator("#play-intent-field").fill("I will carry the reply into the night.");
    await expect(page.getByRole("button", { name: /set this intention/i })).toBeEnabled();
  } finally {
    await browser.close();
  }
});

test("New Campaign assigns a hidden era profile and begins with one fictional Main Thread", async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto(`${baseUrl}/?review=start`, { waitUntil: "networkidle" });
    await expect(page.getByText(/choose an era/i)).toBeVisible();
    await page.getByRole("button", { name: /late unification/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/pick a starting path/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /village scribe/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /ลูกน้องคนเรือเมืองซาไก/ })).toBeVisible();
    await page.getByRole("button", { name: /ลูกน้องคนเรือเมืองซาไก/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/give the character a stake/i)).toBeVisible();
    await expect(page.getByLabel("Origin")).toHaveCount(0);
    await page.getByLabel("Character name").fill("Hana");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("WHO YOU ARE")).toBeVisible();
    await expect(page.getByText("CAMPAIGN START RECORD")).toBeVisible();
    await expect(page.getByText(/assigning your opening/i)).toHaveCount(0);
    await page.getByRole("button", { name: /begin with 50 credits/i }).click();

    await expect(page.getByText(/campaign command/i)).toBeVisible();
    await expect(page.getByText(/เรื่องสมมติของแคมเปญ/)).toBeVisible();
    await expect(page.getByText(/side leads/i)).toHaveCount(0);
    const activeYear = await page.locator(".topbar__context > span").first().innerText();
    await page.getByRole("button", { name: "Muster" }).click();
    await page.getByRole("button", { name: "This Market" }).click();
    const prepareContext = page.getByTestId("prepare-campaign-context");
    await expect(prepareContext).toBeVisible();
    await expect(prepareContext).toContainText(activeYear);
    await expect(prepareContext).not.toContainText("Smoke Beneath Sakai");
  } finally {
    await browser.close();
  }
});
