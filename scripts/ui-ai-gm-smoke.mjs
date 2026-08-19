import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const user = { id: 1, openId: "ui-gm-test", name: "GM Test", email: "gm@example.com", loginMethod: "manus", role: "user", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date().toISOString() };

await page.route("**/api/trpc/**", async (route) => {
  const url = route.request().url();
  const data = url.includes("auth.me") ? user
    : url.includes("profile.credits") ? { credits: 50 }
    : url.includes("profile.spendCredit") ? { credits: 49 }
    : url.includes("gm.analyze") ? { mode: "ai", intentSummary: "Use the rice ledger to make the clerk listen.", axis: "mind", suggestedMastery: null, difficulty: 14, contextBonus: 1, contextReason: "The ledger is visible.", risk: "A witness may remember your name.", confirmation: "You present the ledger and ask for time.", historicalFence: "This is fictional play context." }
    : url.includes("gm.resolve") ? { mode: "ai", sceneTitle: "The clerk keeps the ledger", narration: ["The clerk turns one page, then another, and lets the silence do its work.", "He grants you a moment, but the guard at the door has already begun to remember your face."], nextChoices: ["Follow the boatman", "Question the witness"], memory: { title: "A name in the margin", detail: "The clerk and the guard now remember Sato.", tone: "ochre" }, missionNote: "The path is open only until dusk.", historicalFence: "This is fictional play context." }
    : null;
  if (!data) return route.continue();
  await route.fulfill({ contentType: "application/json", body: JSON.stringify([{ result: { data: { json: data } } }]) });
});

await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.getByText("GM Test").waitFor();

await page.getByRole("button", { name: /OPEN A NEW RECORD|BEGIN NEW CHRONICLE/ }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "BEGIN WITH 50 CREDITS" }).click();
await page.locator("textarea").fill("I show the ledger and ask the clerk for time.");
await page.getByRole("button", { name: "ASK THE GM" }).click();
await page.getByText("AI GM interpretation ready").waitFor();
await page.getByRole("button", { name: /CONFIRM & ROLL/ }).click();
await page.getByText("The clerk keeps the ledger").waitFor();

await page.getByRole("button", { name: "Save Game" }).click();
await page.getByRole("button", { name: "SAVE HERE" }).first().click();
await page.getByRole("button", { name: "Load Game" }).click();
await page.getByRole("button", { name: "LOAD" }).nth(1).click();
await page.getByText("The clerk keeps the ledger").waitFor();
await page.locator(".nav-list").getByRole("button", { name: "Campaign Log" }).click();
await page.getByText("A name in the margin").waitFor();

const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("dust-fire-local-game-v2") || "{}"));
assert.equal(saved.game.currentScene.title, "The clerk keeps the ledger", "AI GM scene survives Local Save");
assert.ok(saved.game.memories.some((memory) => memory.title === "A name in the margin"), "AI GM memory survives Local Save");
await browser.close();
console.log("Authenticated AI GM UI smoke test passed: Ask → Roll → GM resolve → Save → Load → Log.");
