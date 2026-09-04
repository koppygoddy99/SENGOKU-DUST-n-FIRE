# Shared Project Context

This file is shared project knowledge, **not a rule file**. It records repository facts verified from the current source tree and project documentation. Normative requirements remain in the sibling `.clinerules` files, especially `00-project-rules.md`, `10-architecture.md`, `20-gameplay-safety.md`, `30-workflow.md`, and `40-performance.md`.

## Project identity

- Product name: **Dust & Fire: Sengoku Stories**.
- The repository describes the product as a single-player, narrative tabletop role-playing game set in a Sengoku-period Japan context.
- The player-facing product boundary distinguishes historical facts, contextual play, campaign fiction, and insufficient evidence.
- The repository does not establish a separate production deployment topology. **UNKNOWN**

## Repository structure

Top-level areas observed:

- `client/src/` — React client application.
  - `client/src/App.tsx` — React/Vite application entry composition.
  - `client/src/pages/Home.tsx` — application shell; owns top-level campaign state, navigation, local save/load, settings, and feature composition.
  - `client/src/features/` — feature modules including `play`, `story`, `chronicle`, `relationships`, `powerRumor`, `navigation`, and management-related views.
  - `client/src/lib/game/` — public game barrel, domain types, pure scalar engine helpers, state reducers, game data, and the wider game-state contract.
  - `client/src/lib/randomEvents.ts`, `worldEvents.ts`, `regionInitialState.ts`, `powerRumor.ts`, and historical-timeline compatibility modules provide adjacent game systems.
  - `client/src/pages/MarketHub.tsx` — market, gear, services, obligations, and exchange-history surfaces.
- `server/` — Express/tRPC server; AI GM integration; auth; AI GM; timeline; starter-profile; relationship-analysis; database helpers; and admin procedures.
- `shared/` — client/server contracts and shared data: AI GM types, historical timeline records, narrative contracts, social facts, and staged data files.
- `drizzle/` — MySQL/Drizzle schema and generated migration SQL.
- `tests/` — Playwright browser-flow tests (e.g. `tests/play-dice-outcome-flow.spec.mjs`), documented as targeted Playwright commands.
- `scripts/` — smoke checks and repository utility scripts.
- `docs/` — source-of-truth guides, technical contracts, audits, proposals, team handbooks, and dated implementation summaries.
- `notes/` — dated working notes/audits (e.g. `notes/sengoku-systems-audit-2026-08-25.md`); reference material, not runtime code.
- `data/` — static data sets and assets (e.g. `data/sengoku-66-provinces/` province data with its README); not runtime-integrated unless imported by code.
- `schemas/` — JSON schemas (e.g. `schemas/sengoku_world_state.schema.json` describing the world-state document shape); not runtime code.
- `dist/` and `node_modules/` are build/dependency output, not source architecture.

## Runtime and tooling

- TypeScript, strict checking, `noEmit` (see `tsconfig.json`).
- The package is an ES module package (`package.json`).
- Client: React 19, Vite, Tailwind/shadcn-related UI, TanStack React Query, tRPC React bindings.
- Server: Express 4 and tRPC 11.
- Vitest for unit/component tests under `server/**/*.test.ts`, `server/**/*.spec.ts`, and `client/src/**/*.test.ts(x)` (see `vitest.config.ts`).
- Playwright for browser flows under `tests/`.
- Documented primary commands: `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`, and targeted Playwright commands for the play dice flow, mobile keyboard flow, campaign layout, market mobile layout, and offline lock.
- Development server starts at `server/_core/index.ts`; development uses Vite through Express and production serves built static files.

## Current architecture

The repository uses a shared campaign object as the client-side source for player-facing views:

```text
Local Save / load input
  -> normalizeGameState()
  -> Home.tsx campaign state
  -> Story / Play / Market / Chronicle / Relationships projections
  -> player intent or explicit feature action
  -> game engine or state transition
  -> Home update
  -> local persistence and campaign library
```

The deterministic game surface is publicly exposed through `client/src/lib/game/index.ts`, which re-exports:

- domain types from `client/src/lib/game/types/`;
- pure rules from `client/src/lib/game/engine.ts`;
- state reducers from `client/src/lib/game/state.ts`;
- game data from `client/src/lib/game/data.ts`; and
- the wider game contract from `client/src/lib/game/core.ts`.

`client/src/lib/game/state.ts` documents its functions as pure reducers that return a new `GameState`. `client/src/lib/game/core.ts` combines campaign creation, action parsing, roll resolution, calendar, mission, world, relationship, economy, inventory, and related game operations.

## Authoritative gameplay engine

- `parseAction(action, state)` — creates a `RollPreview` from player intent and current game state.
- `resolveRoll(preview, state, ...)` — creates the resolved roll record, including dice, total, margin, outcome, and related mechanical fields.
- `applyRoll(state, record)` — applies the resolved result to a new game state and records roll-related effects.
- `buyMarketOffer` — existing state-changing economy entry point for market purchases.
- Other reducers implemented in the game state/core path include mission directives, event effects, relationship evidence, and equipment functions.

## Data model types

- `client/src/lib/game/types/base.ts` defines shared primitives: seasons, stats, outcomes, mission states, item kinds, currency, memory kinds, time segments, and historical status values.
- `client/src/lib/game/types/character.ts` defines character identity, occupation, attributes, stat XP, masteries, vitals, social values, resources, inventory, and relationship pulls.
- `client/src/lib/game/types/mission.ts` defines main/side mission state, visibility, deadlines, rewards, risks, canon data, random-event linkage, and progress fields.
- `client/src/lib/game/types/economy.ts` defines inventory items, market offers, services, obligations, exchange records, equipment slots, and economy state.
- `client/src/lib/game/types/progression.ts` defines campaign context, progression/time fields, memories, relationships, roll records, scenes, world-system flags, and `GameState`.

## GameState

The current `GameState` aggregate includes: campaign context, character, community, current scene, missions, market, economy, memories, rolls, optional story records, public relationships, optional historical boundary, progression, optional world systems, optional pending random event, optional equipment, credits, schema version, and tick.

## Important data flow

1. `Home.tsx` creates a campaign through `createGameState` or loads and normalizes an existing campaign.
2. `PlayScene.tsx` receives the same `GameState` and accepts a player action.
3. The play flow uses the local rules path or calls the AI GM analyze procedure when current auth/network conditions permit.
4. The local path calls `parseAction`; the AI path returns analysis merged into an engine-owned preview through `mergeAIAnalysis`.
5. The roll path calls `resolveRoll` and displays the result before recording it.
6. Recording a local result calls `applyRoll`, then `Home` receives the next state through its update callback.
7. The play flow may call the AI GM resolve procedure for narrative output after the mechanical roll is available. The returned narrative data is used for presentation and validated mission/memory handling; AI response never replaces the resolved mechanical roll.
8. Story, Chronicle, Market, Relationships, Power/Rumor, and navigation views read the current state or derived projections passed from the shell.
9. Random events are selected by the client random-event module and can become pending player choices or side missions through existing reducers.
10. Relationship analysis receives selected campaign/contact/evidence context through tRPC and produces a public relationship analysis result; daily summaries are stored server-side, separate from `GameState`.

## Persistence and state structure

- Browser Local Save is the primary campaign persistence path.
- `Home.tsx` owns autosave, manual save, Leaf II, Leaf III, campaign-library records, load, delete, reset, and local campaign selection.
- Local save key used by current UI tests: `dust-fire-local-game-v3-saika`.
- `normalizeGameState` is the save-boundary migration/normalization function (legacy mission progress, legacy roll fields, legacy inventory bonus fields, equipment normalization, and legacy `property` to `currency` compatibility).
- New campaigns created by `createSaikaSafehouseDemo` currently use `schemaVersion: 9` and begin with 50 trial credits. General schema history and versions beyond the inspected implementation are **UNKNOWN**.
- `GameState` is serialized for local save/load through JSON-compatible campaign snapshots.
- The server database is **not** the repository-wide persistence store for all campaign state. `drizzle/schema.ts` defines the authenticated `users` table and a server-only `relationshipDailySummaries` table.
- `relationshipDailySummaries` stores owner, campaign, contact, in-game day, source hash, analysis version, evidence JSON, public summary JSON, and timestamps.
- Cloud backup, cross-device synchronization, and Drive persistence are listed by the roadmap as not implemented.

## UI and client structure

- `Home.tsx` — shell for campaign creation/loading, active page selection, settings, and feature composition.
- `CampaignNavigation` — groups navigation around Story, Prepare, Chronicle, and More.
- `StoryMap` — projects current location, missions, memories, pressure, and related campaign data; currently classified as a visual projection that does not mutate state.
- `PlayScene` — intent entry, analysis/preview, dice animation, result details, narrative outcome, continuation, and random-event choices.
- `ChronicleView` — reads roll/memory/story records for reading and log presentation.
- `RelationshipsView` — presents public relationship contacts and can request daily relationship analysis.
- `MarketHub` — market/equipment/economy surfaces and transaction records.
- `PowerRumorPanel` — projects world-system power/rumor data; currently a visual surface without direct mutation.
- UI components request state changes through callbacks and existing game functions rather than maintaining a second campaign authority.

## Server and client boundary

- `server/_core/index.ts` creates the Express server, registers OAuth and storage routes, mounts the tRPC middleware at `/api/trpc`, and serves Vite or static output according to `NODE_ENV`.
- `server/routers.ts` defines the application router with system, auth, GM, relationship, profile/credit, timeline, starter-profile, and admin procedures.
- `server/gm.ts` validates AI GM inputs and outputs with Zod, builds historical/narrative prompt context, calls `invokeLLM`, applies a 45-second timeout, and evaluates player-facing narrative quality.
- `shared/ai-gm.ts` defines request/response contracts for GM analysis, GM resolution, and relationship analysis.
- The GM analysis contract may propose intent interpretation fields such as stat, suggested mastery, difficulty, context bonus, flaw information, risk, and historical fence.
- The GM resolution contract returns scene title, narration, next choices, memory, mission note/directive, and historical fence after receiving the already-resolved roll information.
- The relationship-analysis contract returns a summary, event tags, bounded contact effects, player-visible knowledge, optional blank-space update, confidence, and evidence IDs.
- Authentication, trial-credit accounting, server secrets, and database access remain server-side. Exact provider configuration is **UNKNOWN** from the inspected files.

## Current implementation status

The authoritative status source is `PROJECT_ROADMAP.md`. Current broad status:

### `[DONE]`
World and narrative memory; historical timeline data and server timeline route; random event selection and choice flow; mission/directive lifecycle validation; factions and rumor projection; occupation/starter selection; world calendar advancement; relationships/NPC evidence capture and server daily analysis persistence; AI GM analyze/resolve routes with validation/timeout/credit accounting and Local Trial fallback; campaign start; save/load and schema normalization; vitals and progression/XP; economy/debt, obligations, and market transactions.

A `[DONE]` status may still list narrower missing enhancements in its "What is missing" column; this document preserves the roadmap's reported status rather than re-evaluating it.

### `[IN PROGRESS]`
Random-event effect semantics/failure-removal consistency; faction hostility/at-war transitions; faction reputation projection and downstream consequences; rank/class mutations; item function completeness (including an unconsumed `exchange` path); time-of-day segment effects and UI control; NPC blank-space authoring/readback; consequence chains beyond the current roll; heat/scoped heat; additional economy/obligation handling.

### `[UI / DEMO]`
StoryMap projection; ChronicleView projection; PowerRumorPanel projection; player-side timeline cards (no browseable timeline tab).

### `[NOT FOUND]` / explicitly not implemented
Territorial control/province ownership; weather state; multi-class/respec; streaming AI responses; cross-contact NPC gossip; player-authored rumors/blank-space editor; time-skip autocheckpointing; cloud backup/Drive; AI-driven NPC generation beyond the four Saika fixtures.

Planned/proposed work whose implementation is incomplete or not yet integrated includes the player attachment/item offering system and the reusable rule-based procedural-generation framework; proposal text is not evidence of integration.

## Important existing documentation

- `README.md` — product overview, player loop, 2d12 description, development commands, testing commands, documentation index.
- `PROJECT_ROADMAP.md` — audited system status, current grouped status, next steps, AI authority split, and version history.
- `MEMORY.md` — project working memory and current implementation notes.
- `STRUCTURE.md` — module ownership, target boundaries, data-flow diagram, and feature contracts.
- `.clinerules/10-architecture.md` — evidence-based architecture map and data-flow summary.
- `docs/dust-fire-core-game-source-of-truth-th.md` — implementation-oriented game and state contract.
- `docs/dust-fire-deep-game-guide-th.md` — deeper game and migration guidance.
- `docs/technical/one-turn-backend-flow-th.md` — one-turn server/AI flow.
- `docs/technical/gm-canon-mission-timeline-contract-th.md` — GM canon, mission, timeline, and historical-boundary contract.
- `docs/team-handbooks/04-game-development-handbook-th.md` — game-development ownership and source-of-truth notes.
- `docs/team-handbooks/07-qa-testing-handbook-th.md` — testing and regression strategy.
- `docs/team-handbooks/09-backend-systems-handbook-th.md` — server contracts, persistence, AI GM integration, backend operations.
- `docs/proposals/` — proposed or partially implemented systems; proposal text is not evidence of integration.
- `docs/SUMMARY-2026-09-04.md` — dated implementation summary reporting a type-check pass and test results for the referenced work.

## Evidence limits

- This context records repository structure and current implementation evidence only.
- Planned designs, proposal documents, fixtures, isolated types, and UI surfaces do not by themselves establish an end-to-end implementation.
- Where the inspected repository did not establish a fact, the value is recorded as `UNKNOWN` rather than inferred.

