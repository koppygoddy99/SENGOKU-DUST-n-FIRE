---
name: gameplay-implementation
description: Implement gameplay-related tasks in the SENGOKU-DUST-n-FIRE repository safely after repository investigation. Use when implementing features that touch game state, deterministic rules, or the AI-GM boundary. Complements the `.clinerules/` contract and the repo-investigation skill; does not replace them.
---

# Gameplay Implementation

A practical flow for implementing gameplay-related changes after investigation.
It complements the project rules and the skills; follow them as authority:

- `.clinerules/skills/repo-investigation/SKILL.md` — run first (SEARCH FIRST, READ SECOND).
- `.clinerules/20-gameplay-safety.md` — gameplay-integrity stop rules.
- `.clinerules/30-workflow.md` — standard implementation workflow and completion checks.
- `.clinerules/00-project-rules.md` — project contract (scope, roadmap & push gate, coding rules).
- `.clinerules/10-architecture.md` — evidence-based map of areas and data flow.

## Core Principle

**IMPLEMENT WHAT THE REPOSITORY AND USER REQUIRE. DO NOT INVENT GAMEPLAY.**
The repository and the user specify the gameplay; the implementation only carries it
out through the existing authoritative path. Implementation details may be chosen by
Cline only when they do not change gameplay semantics.

## Implementation Flow

1. **Confirm the exact task and scope.** Restate what must change and what must not.
   Identify whether the task touches core gameplay or only presentation/narrative.
2. **Use repo-investigation before implementation decisions.** Establish the existing
   system, its state flow, callers, and tests before choosing how to change it.
3. **Identify the existing gameplay system and extension point.** Find the existing
   implementation for the affected behavior (see `10-architecture.md`) and prefer to
   extend it rather than create a new parallel system.
4. **Identify the authoritative state / data source.** Know which `GameState` fields
   or typed records carry the source of truth for the affected behavior.
5. **Identify the existing engine validation and state-mutation path.** Route changes
   through the existing engine/state functions (`client/src/lib/game/**`); do not
   invent a new mutation route.
6. **Reuse existing systems and APIs whenever possible.** Extend an existing API
   instead of duplicating it (see `00-project-rules.md` — Coding Rules).
7. **Separate gameplay decisions from implementation decisions.** A gameplay decision
   changes numbers, probabilities, effects, timing, validity, or state transitions and
   requires explicit authorization. An implementation decision is a technical choice
   that preserves established behavior and may be chosen by Cline.
8. **Implement only behavior explicitly supported by the task and repository**
   **evidence.** Do not add features, defaults, or fallbacks that the task and code do
   not specify.
9. **Keep the change as small and localized as possible.** Make the smallest safe
   change that satisfies the established behavior.
10. **Preserve deterministic gameplay behavior.** Rolls, effects, and consequences must
    remain deterministic and unchanged unless explicitly required.
11. **Do not move gameplay authority into UI, prompts, narrative text, or AI.** Keep
    rule calculations and authoritative state changes in the deterministic engine/state
    path.
12. **Do not let AI directly control authoritative gameplay state.** AI may propose,
    analyze, or narrate; it must not decide dice results, difficulty, stats, XP,
    inventory, currency, time, faction/relationship values, mission lifecycle, or save
    integrity.
13. **Do not rebalance numbers, probabilities, progression, rewards, difficulty,**
    **relationships, economy, time, factions, or other gameplay rules** unless the user
    explicitly authorized the change.
14. **Do not create fake state, placeholder gameplay logic, or parallel systems** just
    to make a feature work.

## Architecture Principle

> AI proposes or narrates.
> The deterministic game engine validates and commits authoritative gameplay state.

Any AI-generated content must pass through validation and the existing game state
system; it never replaces an authoritative result.

## When a Gameplay Decision Is Missing — Stop

If the implementation requires a gameplay decision that is not defined by the user,
authoritative code, tests, schemas, or documented rules:

- **STOP. Do not guess. Do not choose the "most reasonable" behavior.**
- Report:

  `BLOCKED — GAMEPLAY DECISION REQUIRED`

Then state:

- the specific gameplay decision that is missing;
- where in the implementation it is required;
- what existing repository evidence was found;
- possible interpretations, if relevant;
- exactly what decision is needed from the user. If the repository or the user does not
  decide, Cline must not fill the gap with an invented rule.

## Handling Common Situations

- **Existing system partially implements the request.** Do not discard it. Determine
  what is already integrated (engine/reducer, persistence, projection) against
  `PROJECT_ROADMAP.md`, extend the existing portion, and keep the roadmap status
  accurate rather than forcing `[DONE]`.
- **Conflict between task instructions and existing gameplay behavior.** Stop and
  report the repo evidence. Do not pick a winner silently.
- **UI request that requires gameplay changes.** The UI may request state changes, but
  the change must be applied through existing game functions; do not let UI decide
  rules. If the required rules are undefined, mark blocked.
- **AI / narrative feature that needs gameplay datum.** The AI receives validated
  context produced from existing state; it narrates or analyzes and must not alter the
  governing state.
- **Tests expose unclear gameplay behavior.** Do not weaken or rewrite tests to pass.
  Identify whether the discrepancy is an implementation bug vs. a missing gameplay rule.
  If the intended rule is not established, stop and report it.

## Verification Expectations

After implementation:

- run relevant targeted tests/checks (see `testing-verification/SKILL.md`);
- inspect the final diff;
- confirm no unrelated files changed;
- confirm gameplay authority still flows through the correct engine/state path;
- confirm no gameplay rules were invented;
- follow the existing roadmap audit workflow;
- do not claim `[DONE]` unless the existing project rules and roadmap criteria
  (engine/reducer + persistence + projection/UI + code/test evidence) are satisfied.