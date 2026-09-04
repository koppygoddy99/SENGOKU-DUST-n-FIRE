---
name: roadmap-audit
description: Audit PROJECT_ROADMAP.md against the actual SENGOKU-DUST-n-FIRE repository after implementation or when system status is in question. Use to verify whether a roadmap system's status matches real implementation evidence (reducer/engine integration, persistence, projection, tests). Complements the `.clinerules/` contract and the other skills; does not replace them.
---

# Roadmap Audit

A practical flow for auditing `PROJECT_ROADMAP.md` against repository reality.
Follow these as authority:

- `.clinerules/00-project-rules.md` — roadmap update & push gate (the binding contract).
- `PROJECT_ROADMAP.md` — Status Legend, Completeness Rule, Core Systems table.
- `.clinerules/30-workflow.md` — when the audit happens in the workflow.
- `.clinerules/10-architecture.md` — where each area's implementation, persistence, and projection live.
- `.clinerules/skills/repo-investigation/SKILL.md` — how to gather the evidence.
- `.clinerules/20-gameplay-safety.md` — never invent a rule to complete a status.

## Core Principle

**ROADMAP STATUS MUST FOLLOW REPOSITORY REALITY.** The roadmap describes what the
code actually does, not what is planned, typed, or demoed.

## Audit Flow

1. **Identify the roadmap system being audited.** Find its row (and any suffixed
   subsystem rows, e.g. 4a, 6a) in the Core Systems table.
2. **Read its current status, "What exists", and "What is missing" claims** so the
   audit verifies those specific claims rather than a vague impression.
3. **Locate the actual implementation.** Search for the named functions, types, and
   modules cited in the row (repo-investigation skill; see `10-architecture.md` for
   the expected area, e.g. `core.ts`/`state.ts` for reducers, `server/*` for
   server-side systems).
4. **Trace the relevant execution path.** Confirm the system is actually invoked
   (caller → reducer/engine → state), not merely defined.
5. **Check authoritative state/data flow.** The system must mutate `GameState` (or
   its authoritative records) through existing engine/state functions — not via UI,
   fixtures, or AI output alone.
6. **Check persistence where the system requires persisted state.** Look for the
   save/normalize/migration path (or the server persistence used by that system,
   e.g. MySQL records for relationship analysis). Server persistence of one record
   type is not evidence that all system state is persisted.
7. **Check tests and verification evidence.** Identify tests covering the affected
   path. A passing fixture or isolated unit test alone does not prove the system.
8. **Check end-to-end use.** Confirm the loop: input/consumer → engine/reducer →
   persisted state → projection/UI (or AI GM context) → player-visible result.
9. **Compare reality against the roadmap's Completeness Rule** (all three conditions:
   full loop; not coupled to an unfinished system; code + test evidence).
10. **Recommend only the status supported by evidence** — update "What exists" and
    "What is missing" to match what was verified, and append a VERSION HISTORY row
    when the roadmap changes.

## Status Meanings (as defined by PROJECT_ROADMAP.md)

- `[DONE]` — complete per the roadmap's Completeness Rule: full loop (reducer/engine
  integration + persistence + projection), not coupled to an unfinished system, with
  repository code + test evidence.
- `[IN PROGRESS]` — meaningful implementation exists but the full loop is incomplete.
  A system keeps `[IN PROGRESS]` until its consumer (reducer, route, or persistence
  migration) is wired.
- `[UI / DEMO]` — only a visual surface or fixture exists; the underlying gameplay
  state is not actually mutated or persisted.
- `[NOT FOUND]` — audit confirmed no code path, type, fixture, or schema references
  the system. Only downgrade to this with explicit audit evidence.

## What Does NOT Prove [DONE]

- Types or schemas alone.
- UI or a demo surface alone (`[UI / DEMO]`).
- A single reducer/helper without its consumer and projection.
- Tests alone (a fixture passing is not a system).
- "It looks mostly finished."
- A spec, proposal doc, or staged data pool that is not imported into runtime.

Conversely, do not downgrade a status without repository evidence for the downgrade.

## Multi-Layer Systems

Many roadmap rows span client state, engine, persistence, server, and UI:

1. **Identify the authoritative implementation** — the reducer/engine function (or
   server persistence path) that owns the system's state.
2. **Trace integration points** across layers; a system is only as complete as its
   weakest missing link (e.g. typed but never mutated = `[IN PROGRESS]`).
3. **Verify persistence and projection where applicable** before crediting them.
4. **Never treat an isolated component (type, fixture, view, test) as a complete
   system.** Report which links exist and which are missing.

## When Evidence Is Incomplete

State exactly:

- what was verified (files, functions, tests, paths checked);
- what remains unverified;
- the resulting status recommendation (usually keep the existing or a lower status).

Do not guess, and do not fill gaps with plausible-sounding claims.

## Gameplay Rule Ambiguity

If completing the audit would require deciding an undefined gameplay rule (e.g. "is
this behavior the intended rule?"), do not invent it. Report
`BLOCKED — GAMEPLAY DECISION REQUIRED` per `20-gameplay-safety.md` and keep the
roadmap status conservative (`[IN PROGRESS]` or unchanged).

## When to Audit

- After every implementation task, before the task is considered complete and before
  any commit/push (see the push gate in `00-project-rules.md`).
- Whenever a task changes, contradicts, or clarifies a roadmap system's evidence.
- When asked to audit or re-verify a specific system's status.

Only update the roadmap when the audit's findings change its reality; if the current
row already matches the repository, change nothing.