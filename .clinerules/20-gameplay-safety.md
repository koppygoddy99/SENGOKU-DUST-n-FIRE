# Gameplay Safety Rules

These rules protect the authoritative game. Cline must not invent, rebalance,
silently interpret, or "improve" any player-facing rule.

## Protected Decisions

The prohibition covers rule-changing decisions including, but not limited to:

- stats, traits, mastery, XP, progression, and vital values;
- combat, dice, formulas, difficulty, damage, success/failure, and consequences;
- rewards, penalties, prices, currency, economy, barter, services, obligations, and debt;
- inventory, equipment, item kinds, item effects, availability, and use conditions;
- calendar, time advancement, duration, seasons, segments, and schedules;
- missions, objectives, deadlines, progress, rewards, failure, and lifecycle;
- factions, reputation, heat, rumors, relationships, affinity, trust, and social consequences;
- negotiation outcomes, player-intent interpretation, historical boundaries, and any other rule that changes what the player experiences or what state is considered valid.

## Authority and Kind of Work AI May Do

The deterministic engine/state path is authoritative. Route authoritative state
changes through existing game functions and schemas rather than inventing parallel
decisions.

AI may propose, analyze, or narrate NPC content, mission descriptions, rumors,
dialogue, events, item descriptions, and contextual world content only within
existing validation boundaries. The GM server contract explicitly treats resolved
roll mechanics as final; preserve that boundary.

AI must not directly control dice results, difficulty, stats, mastery, XP,
progression, inventory mutation, currency, time, faction values, heat, reputation,
mission lifecycle, relationships, save/load integrity, or any deterministic state
change.

## Decision Classification

**IMPLEMENTATION DECISION**
A technical choice that preserves established gameplay semantics, such as
extracting a helper, selecting an existing import path, or improving test setup.
Cline may choose this.

**GAMEPLAY DECISION**
Any change to numbers, probabilities, formulas, effects, rewards, penalties,
timing, validity, interpretation, state transitions, or player-visible outcomes.
Cline may choose this only when explicitly specified by the user or established by
authoritative code, tests, schemas, or project documentation.

## Mandatory Stop Rule

When the intended rule exists, Cline may implement it. When neither the user nor
authoritative repository evidence defines the behavior:

1. Do not implement a guess.
2. Do not hide the ambiguity behind a default, fallback, or UI copy.
3. Stop and report exactly:

   `BLOCKED — GAMEPLAY DECISION REQUIRED`

4. State the exact missing gameplay decision.
5. Cite the repository evidence inspected.
6. Ask the user to choose the rule before implementation.

If code, tests, schema, roadmap, or task requirements conflict, stop and report the
conflict instead of selecting a winner silently. Fix an implementation bug only
when the intended behavior is already established by explicit requirements or
authoritative evidence.

## Safe Change Requirements

- Route all authoritative changes through the existing game engine/state functions.
- Preserve deterministic behavior and existing save normalization/versioning.
- Keep AI output validated and narrative-only unless an existing contract explicitly says otherwise.
- Add or update tests only to encode an established rule; never use tests to manufacture one.
- Do not call a system complete based on a type, fixture, UI, or isolated function. Check engine/reducer integration, persistence, and projection/UI against `PROJECT_ROADMAP.md`.