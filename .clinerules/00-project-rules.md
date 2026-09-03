# SENGOKU-DUST-n-FIRE — Cline Rules

## Project Priority

Before modifying code:

1. Inspect the relevant existing repository structure.
2. Read `PROJECT_ROADMAP.md`.
3. Read `Rule-based Procedural Generation.txt` when the task involves procedural generation or AI-generated content.
4. Find existing implementations before creating new systems.
5. Find relevant tests before changing behavior.
6. Reuse information already inspected during the current task whenever possible.

## Repository Reading Efficiency

Read the repository efficiently.

- Do not repeatedly read the same file when its relevant contents are already known.
- Do not scan the entire repository when the task can be solved by inspecting a smaller relevant scope.
- Start with the files directly related to the task.
- Follow imports, callers, reducers, schemas, tests, and persistence only as needed to establish the actual execution path.
- Prefer targeted searches over broad repository scans.
- Reuse previously established repository evidence during the same task.
- Do not read unrelated files merely for completeness.
- Before reading a large file, search for the relevant symbol, function, type, or section first when practical.
- When the task is already clearly scoped, do not repeatedly rediscover the project structure.

Efficiency must never reduce correctness.

If repository evidence is insufficient, inspect more files rather than guessing.

---

## Core Principle

Preserve the existing game.

Do not change gameplay rules unless the task explicitly requires it.

Do not rewrite working systems just because they are large or old.

Prefer the smallest safe change.

---

## CORE GAMEPLAY SAFETY RULE

Any change involving core gameplay, game rules, deterministic engine behavior, `GameState` transitions, stats, dice resolution, progression, economy, inventory effects, time advancement, missions, factions, relationships, combat, or other authoritative gameplay systems must follow the user's explicit specification.

AI MUST NOT invent, infer, redesign, rebalance, or "improve" gameplay rules.

If the requested behavior is ambiguous or the repository does not provide sufficient evidence to determine the intended rule:

1. Do not choose a behavior arbitrarily.
2. Do not implement a guessed game rule.
3. Mark the task `BLOCKED`.
4. Report the ambiguity and the exact evidence available.
5. Ask the user for the missing gameplay decision.

AI may fix an implementation bug only when the intended behavior is already established by explicit user requirements, existing authoritative code, tests, schemas, or documented project rules.

Implementation details may be chosen by AI when they do not change gameplay semantics.

When modifying core gameplay code, the implementation must be the smallest change necessary to satisfy the explicitly established behavior.

Before making any core gameplay change, distinguish between:

### IMPLEMENTATION DECISION

A technical choice that does not alter gameplay semantics.

AI may make this choice.

### GAMEPLAY DECISION

A rule that changes what happens in the game, including:

- numbers
- probabilities
- effects
- rewards
- penalties
- timing
- progression
- state transitions

AI must NOT make this decision without explicit authorization or authoritative repository evidence.

---

## ROADMAP UPDATE AND PUSH GATE

After every completed Cline implementation task:

1. Inspect the actual repository state.
2. Review the complete git diff.
3. Run relevant targeted verification/tests.
4. Audit `PROJECT_ROADMAP.md` against the current repository.
5. Update `PROJECT_ROADMAP.md` if the implementation changed the status, evidence, or missing work of any roadmap system.
6. Append a new row to VERSION HISTORY when the roadmap changes.
7. Re-read the updated roadmap and verify that its claims match the repository.
8. Only then may the task be considered complete.
9. Only then may a commit or push be considered valid.

Never mark a roadmap system `[DONE]` merely because a type, function, UI, fixture, test, or Cline success report exists.

`[DONE]` requires the complete implementation loop appropriate to that system, including reducer or engine integration, persistence where required, and projection or UI where required.

If only part exists, keep `[IN PROGRESS]`.

If only a visual or demo surface exists, use `[UI / DEMO]`.

If repository audit finds no implementation evidence, use `[NOT FOUND]`.

The roadmap must describe repository reality, not planned work.

Do not preserve an old status when the current audit contradicts it.

Do not invent gameplay rules to make a roadmap item complete.

If implementation behavior is ambiguous, report:

`BLOCKED — GAMEPLAY DECISION REQUIRED`

and do not invent the missing rule.

### Before Any Git Push

Verify all of the following:

- implementation diff reviewed
- targeted tests or checks passed
- gameplay rules preserved
- `PROJECT_ROADMAP.md` audited
- roadmap statuses match the actual repository
- existing functionality remains accurately documented
- missing functionality remains accurately documented
- Next Steps reflects current repository reality
- a VERSION HISTORY row was appended when the roadmap changed

If the roadmap audit has not happened, report:

`PUSH BLOCKED — ROADMAP AUDIT REQUIRED`

Cline is responsible for implementation and repository-state auditing.

Cline must not independently invent gameplay rules or declare gameplay complete without repository evidence.

---

## Architecture

The project follows this principle:

AI proposes  
→ Engine validates  
→ Engine commits  
→ AI narrates

The deterministic game engine remains authoritative.

AI must NOT directly control:

- dice results
- difficulty numbers
- player stats
- mastery
- XP
- progression
- inventory mutation
- currency
- time advancement
- faction values
- heat
- reputation
- mission lifecycle
- save/load integrity
- deterministic game rules

AI may generate or propose:

- NPC content
- mission descriptions
- rumors
- events
- dialogue
- narrative
- item descriptions
- contextual world content

All AI-generated changes must pass through validation and the existing game state system.

---

## Coding Rules

Before creating a new file or system:

1. Search the repository for an existing implementation.
2. Determine whether an existing API can be safely extended.
3. Prefer extending existing systems instead of creating duplicates.

Do not:

- create fake data just to make tests pass
- change unrelated files
- add dependencies unless necessary
- perform large refactors unless explicitly requested
- rename public APIs without explicit permission
- duplicate existing gameplay systems

---

## Task Discipline

Work on ONE task at a time.

Do not silently expand the scope.

If the task requires changes outside the expected area:

STOP and explain why.

If repository code contradicts the task description:

STOP and report the conflict.

Do not guess.

Preserve unrelated working-tree changes.

Never use destructive git commands to discard unrelated work.

Do not commit unless explicitly requested.

---

## Verification

After making changes:

1. Run relevant targeted tests.
2. Run type checking if available.
3. Inspect `git diff`.
4. Run `git diff --check`.
5. Check that unrelated behavior was not changed.
6. Audit roadmap status when applicable.

Report:

- Changed files
- What changed
- Tests executed
- Test results
- Roadmap status if affected
- Remaining risks