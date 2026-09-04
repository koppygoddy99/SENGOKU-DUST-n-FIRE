---
name: testing-verification
description: Verify a change in the SENGOKU-DUST-n-FIRE repository safely and efficiently after implementation. Use after any code change to run targeted checks, inspect the diff, and confirm behavior and gameplay authority are preserved. Complements the `.clinerules/` contract and the repo-investigation and gameplay-implementation skills; does not replace them.
---

# Testing & Verification

A practical flow for verifying a change after implementation. It complements the
project rules and the skills; follow them as authority:

- `.clinerules/skills/gameplay-implementation/SKILL.md` — how the change should be implemented.
- `.clinerules/skills/repo-investigation/SKILL.md` — locate relevant tests during investigation.
- `.clinerules/00-project-rules.md` — project contract (verification, roadmap & push gate).
- `.clinerules/30-workflow.md` — standard workflow including completion checks.
- `.clinerules/20-gameplay-safety.md` — gameplay-integrity rules.
- `.clinerules/10-architecture.md` — map of areas, including where tests live.

## Core Principle

**VERIFY THE CHANGE, NOT JUST THE SYNTAX.** Passing type checks are not enough; the
change must preserve the intended behavior and keep gameplay authority in the correct
path.

## Repository Test Layout

Tests follow the code they cover:

- pure game/domain logic tests sit near `client/src/lib` (e.g. `client/src/lib/game/**` and `*.test.ts`);
- component/page tests sit near the feature or page (`client/src/features/**`, `client/src/pages/**`);
- server-domain and router tests sit under `server`;
- browser/end-to-end flows sit under `tests` (Playwright `.spec.mjs`).

Checks available via `package.json` scripts include type checking (`check`), the
combined `test` script (i18n check + vitest run), and targeted Playwright flows. Use
the existing scripts rather than inventing new commands. This description reflects the
current repository; confirm the exact script names in `package.json` before running.

## Verification Flow

1. **Identify what behavior was changed.** Restate the intended change and its scope
   before verifying.
2. **Identify the smallest relevant tests/checks.** Choose the tests that cover the
   affected path (see layout above); do not run the whole suite for a tiny change unless
   risk or project rules require it.
3. **Run targeted tests first.** Execute only the relevant tests. Iterate on failures
   locally before considering broader checks.
4. **Run typecheck/build/lint only when relevant** to the changed area or when project
   rules require them.
5. **Inspect failures instead of blindly retrying.** Read the error, map it to the
   changed code, and fix the root cause.
6. **Distinguish implementation failures from environment/tooling failures.** A test
   that fails only because of missing credentials, network, or stale build output is
   not an implementation failure; confirm the difference before acting.
7. **Inspect the final git diff.** Review every changed file and ensure each change is
   intentional and scoped.
8. **Check for unintended files or unrelated changes.** `git status` and `git diff
   --check` (whitespace) help confirm nothing else was touched.
9. **Check that existing behavior was not accidentally changed.** Confirm no unrelated
   behavior, contract, or deterministic rule shifted.
10. **For gameplay systems, verify authoritative state still flows through the**
    **deterministic engine.** Confirm the change routes state updates through existing
    engine/state functions, not UI, prompts, or AI.
11. **Verify no fake state, duplicated system, or AI-controlled gameplay authority was**
    **introduced.** The change must not add placeholder logic or parallel systems.
12. **If verification is insufficient, do not claim the task is complete.** Extend the
    checks or investigate until the affected path is adequately covered.

## Result: PASS / BLOCKED / FAIL

Classify the verification result honestly:

**PASS**
- relevant checks pass;
- implementation matches the task scope;
- no unintended changes found.

**BLOCKED**
- required verification cannot be completed (e.g. missing environment or tooling);
- repository evidence is insufficient;
- a gameplay decision remains unresolved (see `20-gameplay-safety.md` and the
  gameplay-implementation skill): report `BLOCKED — GAMEPLAY DECISION REQUIRED`.

**FAIL**
- implementation or verification exposes an actual defect that must be fixed.

Do not hide failures or weaken tests simply to make verification pass. A forced pass is
not verification.

## After Verification

- Follow the existing roadmap audit workflow (see `00-project-rules.md`).
- Do not declare `[DONE]` unless the project's existing completion criteria are
  satisfied (engine/reducer integration + persistence + projection/UI + code/test
  evidence).
- Report changed files, what changed, the checks run and their results, roadmap impact,
  and remaining risks.