import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await mkdir("/home/ubuntu/ui-review", { recursive: true });
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

await page.getByRole("button", { name: /OPEN A NEW RECORD|BEGIN NEW CHRONICLE/ }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "BEGIN WITH 50 CREDITS" }).click();
await page.getByRole("button", { name: "ASK THE GM" }).waitFor();

await page.locator("textarea").fill("ข้าจะใช้บัญชีผลผลิตขอเวลาเจรจากับเสมียน");
await page.getByRole("button", { name: "ASK THE GM" }).click();
await page.getByText("CONFIRM & ROLL · 1 CREDIT").click();
await page.waitForTimeout(150);
await page.getByText("49", { exact: true }).first().waitFor();
await page.screenshot({ path: "/home/ubuntu/ui-review/dust-fire-play-after-roll.png", fullPage: true });

await page.getByRole("button", { name: "Save Game" }).click();
await page.getByRole("button", { name: "SAVE HERE" }).first().click();
await page.getByText("MANUAL SAVE · LEAF 2").waitFor();

await page.getByRole("button", { name: "Load Game" }).click();
await page.getByRole("button", { name: "LOAD" }).nth(1).click();
await page.getByRole("button", { name: "ASK THE GM" }).waitFor();

await page.locator(".nav-list").getByRole("button", { name: "Campaign Log" }).click();
await page.getByText("Reader Mode").first().waitFor();
await page.screenshot({ path: "/home/ubuntu/ui-review/dust-fire-reader-log.png", fullPage: true });
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("dust-fire-local-game-v2") || "{}"));
assert.equal(stored.game.credits, 49, "the UI persists credit use after a roll");
assert.equal(stored.saves.manual.tick, 2, "the UI saves the resolved campaign as a manual leaf");
assert.equal(stored.game.rolls.length, 1, "the UI persists the roll record in the campaign log");

await browser.close();
console.log("UI smoke test passed: New Chronicle → Play → Analyze → Roll → Save → Load → Log.");
