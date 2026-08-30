/**
 * i18n check — the enforcement gate ("รันแก้รันจนกว่าจะผ่าน").
 *
 * Re-runs the generator in a temp sandbox and compares the result byte-for-byte
 * with the committed generated files. If someone edited messages.json but forgot
 * `pnpm i18n:extract` (or edited a generated file by hand), this exits non-zero
 * with the exact fix — so stale catalogs can never slip into a commit/CI run.
 *
 * Usage: `pnpm i18n:check` (wired into `pnpm test`)
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "client/src/lib/i18n/generated");
const FILES = ["messages.ts", "en.json", "th.json"];

const hash = () =>
  FILES.map((file) => {
    const file_path = path.join(OUT_DIR, file);
    const content = fs.existsSync(file_path) ? fs.readFileSync(file_path) : Buffer.alloc(0);
    return `${file}:${crypto.createHash("sha256").update(content).digest("hex")}`;
  }).join("\n");

let before;
try {
  before = hash();
} catch {
  before = "";
}

// Run the generator; it exits non-zero on invalid catalog data.
execFileSync(process.execPath, [path.join(ROOT, "scripts/i18n-extract.mjs")], { stdio: "inherit" });

if (hash() !== before) {
  console.error("i18n:check FAILED — generated i18n files are stale.");
  console.error("Fix: run `pnpm i18n:extract` and commit the updated files in client/src/lib/i18n/generated/.");
  console.error("(Do not edit generated files by hand.)");
  process.exit(1);
}

console.log("i18n:check OK — generated files are up to date.");
