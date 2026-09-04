---
name: repo-investigation
description: Efficiently investigate the SENGOKU-DUST-n-FIRE repository before implementing a task. Use before any implementation to find existing systems, trace real execution paths, and recognize when you have enough evidence. Complements the `.clinerules/` contract; does not replace it.
---

# Repository Investigation (SEARCH FIRST, READ SECOND)

A practical method for investigating this repository before implementing a task.
It complements the project rules; follow them as the authority:

- `%workspace%/.clinerules/00-project-rules.md` — permanent project contract (priority, safety, roadmap & push gate, scope).
- `%workspace%/.clinerules/10-architecture.md` — evidence-based map of areas, boundaries, and data flow.
- `%workspace%/.clinerules/20-gameplay-safety.md` — gameplay-integrity stop rules.
- `%workspace%/.clinerules/30-workflow.md` — standard implementation workflow.
- `%workspace%/.clinerules/40-performance.md` — search-first performance rules.

## Core Principle

**SEARCH FIRST, READ SECOND.** Reduce unnecessary reads without reducing correctness.
Investigation is proportional to the task: start from the likely relevant area and
follow the real execution path only as far as needed.

## Investigation Method

1. **Understand the exact task scope.** Read the request and identify what must change
   and what must not change. Note any gameplay-rule implication (see safety rules).
2. **Identify the most likely relevant area.** Start from `10-architecture.md` and pick
   the area the task touches (client shell, game contract, `GameState`, play flow,
   AI GM, missions, economy/inventory, relationships, persistence, server boundary).
   Do not scan the whole repository.
3. **Search for exact symbols first.** Use targeted searches for the exact function
   names, types, components, reducers, state fields, routes, imports, and callers
   involved before opening any large file.
4. **Locate the existing implementation.** Find existing code for the behavior before
   considering a new one. Extend the existing API rather than duplicating it
   (see `00-project-rules.md` — Coding Rules).
5. **Trace only the relevant execution path.** Follow the actual callers, imports,
   state flow, and dependencies for the affected feature. Stop when the path is
   clear; do not read unrelated systems.
6. **Inspect relevant tests.** Find the tests that cover the affected path (near
   `client/src/lib`, near components/pages, under `server`, and browser flows under
   `tests`). Understand what behavior they already pin down.
7. **Read only necessary sections of large files first.** Prefer targeted section
   reads over whole-file reads; expand only when needed.
8. **Reuse what you already discovered this task.** Do not re-read unchanged files or
   re-discover structures you have already established.
9. **Avoid scanning unrelated directories.**
10. **Avoid repeatedly rereading unchanged files.**
11. **Avoid generated files, dependencies, build output, and unrelated assets**
    unless the task requires them.
12. **Expand gradually if evidence is insufficient.** Start narrow; enlarge only to
    resolve the actual execution path.
13. **Never guess when repository evidence is missing.** If a symbol, state field, or
    behavior cannot be found, treat it as unknown and inspect more evidence rather
    than assuming.
14. **Stop investigating once you have enough evidence to implement safely.**

## When You Have Enough Evidence — Stop

Stop investigating when, for the affected path, all of these are true:

- the relevant existing implementation is identified;
- the relevant data / state flow is understood (`GameState` fields, reducers,
  persistence, projection);
- the relevant callers / dependencies are understood;
- the relevant tests are identified;
- there is no unresolved gameplay decision;
- you have enough evidence to make the smallest safe change.

Once the stopping condition is met, move to `30-workflow.md` (implement → verify) and
proceed to the smallest safe change.

## Gameplay Rule Unclear? Stop, Do Not Invent

If the intended gameplay behavior is not established by the user, authoritative
code, tests, schemas, or documented rules:

**STOP** and follow `20-gameplay-safety.md`. Report:

`BLOCKED — GAMEPLAY DECISION REQUIRED`

State the exact missing gameplay decision and the repository evidence inspected, and
ask the user to choose the rule before implementing. Never silently pick a
probability, number, timing, reward, penalty, or state transition.

## Confirm System Completeness Before Claiming It

Do not treat an isolated type, fixture, UI, or passing test as proof that a system
is end-to-end. For anything you touch, check whether it is actually integrated
(engine/reducer + persistence + projection/UI) against `PROJECT_ROADMAP.md`. Mark
statuses to match repository reality (`[IN PROGRESS]`, `[UI / DEMO]`, `[NOT FOUND]`
as appropriate) and never report a roadmap system `[DONE]` without that full loop
plus code + test evidence.