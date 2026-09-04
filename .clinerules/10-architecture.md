# Current Repository Architecture

An evidence-based quick reference. It describes code that currently exists, not
planned systems. Roadmap status in `PROJECT_ROADMAP.md` remains authoritative for
completeness; isolated types, fixtures, UI, or passing tests do not prove an
end-to-end system.

## Application Areas and Boundaries

| Area | Responsibility / location | Reads / changes | Must not control |
|---|---|---|---|
| Client shell & navigation | React/Vite entry `client/src/App.tsx`; `client/src/pages/Home.tsx` owns top-level campaign state, page selection, Local Save/Load, settings, and feature composition. | Reads the current `GameState`; routes the same campaign object to feature views; writes browser-side local campaign snapshots through existing Home helpers. | Rule calculations, hidden backend state, or AI-selected outcomes. |
| Game contract & pure rules | Public barrel `client/src/lib/game/index.ts`; types in `client/src/lib/game/types/**`; pure scalar rules in `client/src/lib/game/engine.ts`. | Reads primitives and typed records; computes stat/mastery normalization, canonical difficulty, XP thresholds, and related rule values without reading or mutating `GameState`. | UI concerns, network calls, narrative prose, or direct persistence. |
| GameState transitions | Pure state mutations in `client/src/lib/game/state.ts`; wider game contract (creation, action parsing, roll resolution, calendar, missions, world, relationships, economy, inventory) in `client/src/lib/game/core.ts`. | Reads typed campaign/character/world inputs; returns new `GameState` values for rolls, effects, progression, time, missions, inventory/equipment, economy, memories, relationships, and world systems. | Being bypassed by UI-side or AI-side rule mutations; do not mutate `GameState` outside these functions. |
| Play flow | `client/src/features/play/PlayScene.tsx` presents intent, preview, rolling, outcomes, random-event choices, and continuation. | Reads `GameState`; calls `parseAction`, `resolveRoll`, `applyRoll`, mission helpers, and random-event reducers; sends state updates back to Home. | Choosing dice, difficulty, rewards, consequences, or making authoritative state changes outside the deterministic game APIs. |
| Narrative & AI GM | Client sends context via existing tRPC helpers. `server/gm.ts` validates schemas, builds historical/narrative prompt context, calls `invokeLLM`, applies timeout/retry, and validates player-facing output. Shared contracts and evidence boundaries in `shared/ai-gm.ts`, `shared/narrativeRuntime.ts`, `shared/narrativeStyle.ts`, `shared/historicalTimeline.ts`. | Reads supplied campaign/character/scene/context and historical facts; returns analysis or narration. | Dice results, final difficulty, stats, XP, inventory/currency, time, mission lifecycle, faction/relationship state, save integrity, or any deterministic commit. Resolved roll mechanics are explicitly final rules output. |
| Missions & progression | Mission/progression types in `client/src/lib/game/types/mission.ts` and `types/progression.ts`; creation and application integrated through `core.ts`/`state.ts`; projected by Play and Story/mission views. | Reads campaign state and roll/effect results; changes mission progress/state and progression only through existing deterministic functions. | AI- or UI-invented rewards, deadlines, progress requirements, or advancement rules. |
| Factions, relationships & world systems | Faction/world derivation in `client/src/lib/regionInitialState.ts`, `worldEvents.ts`, `powerRumor.ts`, and `shared/sengokuSocialFacts.ts`. Public relationship views under `client/src/features/relationships`; deeper analysis server-side in `server/relationshipAnalyzer.ts` and `relationshipDossiers.ts`. | Reads historical/campaign context, memories, rolls, missions, exchanges, and world events; produces public projections and server-side relationship analysis. | Exposing private NPC intent, bypassing public projections, or letting AI directly mutate faction, heat, reputation, or relationship state. |
| Economy, inventory & items | Types and reducers in `client/src/lib/game/types/**`, `state.ts`, and `core.ts`; market presentation in `client/src/pages/MarketHub.tsx`; item constructors/data in game data modules. | Reads campaign/economy/inventory state; existing buy/equip/exchange functions return updated local state and records. | Inventing prices, item effects, currency rules, services, obligations, or transaction outcomes. Design JSON under `shared/data` is not runtime integration unless code imports and applies it. |
| Calendar & time | `TimeSegment`, `TimeMark`, progression fields, and calendar advancement live in the game types/core/state path; Play displays the resulting campaign time. | Reads resolved actions/effects and campaign context; advances time through existing game transitions. | UI or AI silently advancing time, changing duration, or adding schedule consequences not established by code/spec. |
| Persistence | Browser Local Save/Load and autosave behavior owned by the Home/local-flow path, tested by local-flow and offline regressions. Drizzle/MySQL in `server` supports user/auth and server service records (e.g., relationship summaries); it is not evidence that all `GameState` is server-persisted. | Reads/writes campaign snapshots or server service records through existing paths and normalization. | Dropping old save fields, mixing campaign histories, claiming server persistence for local-only state, or bypassing normalization/migration. |
| Server/client boundary | `server/_core/index.ts`, `server/routers.ts`, `_core/trpc.ts`, and `client/src/lib/trpc.ts` define the HTTP/tRPC boundary. AI GM, auth, timeline, starter-profile, relationship-analysis, credits, and admin routes are server procedures. | Server validates inputs and owns secrets/service calls; client renders results and local campaign state. | Sending secrets to the client or treating server narrative output as an authoritative state commit. |
| UI projections | `client/src/features/story`, `play`, `chronicle`, `relationships`, `powerRumor`, and `client/src/pages/MarketHub.tsx` render views from the current game object. | Read `GameState` and derived projections; invoke callbacks to request approved state changes. | Creating a second source of truth, or hiding mechanical facts the existing design exposes for traceability. |
| Tests & checks | Pure/domain tests near `client/src/lib`; feature/page tests near components; server tests under `server`; browser flows under `tests`; scripts include engine/GM/UI smoke checks and i18n checks. | Assert current contracts, state transitions, projections, routes, and end-to-end flows. | Treating a passing UI fixture as proof that persistence or deterministic integration exists. |

## Principle: AI proposes, engine validates and commits, AI narrates

The deterministic engine/state path is authoritative. `resolveRoll` calculates the
mechanical result; `applyRoll` and related state functions return the authoritative
next `GameState`; AI GM calls, when used, receive validated context and narrate or
analyze without replacing the deterministic result. See `20-gameplay-safety.md` for
the full authority boundary.

## Actual Data Flow

1. `Home.tsx` creates or loads a campaign `GameState` and passes it to feature views.
2. The player declares an action in `PlayScene.tsx`.
3. Existing game functions parse the action and produce a preview or deterministic roll result.
4. `resolveRoll` produces the mechanical result; `applyRoll` and related state functions return the authoritative next state.
5. AI GM calls, when used, receive validated context and narrate/analyze; they never replace the deterministic result.
6. Home records the updated local campaign state; Story, Chronicle, Market, Relationships, and other views project from that same state.

When the repository shows only one side of this flow, document it as partial and
consult the roadmap rather than upgrading the claim.