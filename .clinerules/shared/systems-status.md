# Systems Status — Evidence-Based Implementation Tracker

Shared project knowledge, **not a rule file**. Tracks the actual implementation
status of major game systems using repository evidence only. Allowed statuses:
`[DONE]`, `[IN PROGRESS]`, `[UI / DEMO]`, `[NOT FOUND]`, `[BLOCKED]`.

Reading rules:

- `[DONE]` requires end-to-end evidence: engine/reducer integration, persistence/projection where applicable, and tests.
- A type, fixture, isolated function, or UI surface alone never proves `[DONE]`.
- `PROJECT_ROADMAP.md` remains the authoritative roadmap; this file summarizes per-system evidence and must be re-verified after any implementation change.
- No gameplay rule is defined here; behaviors are cited only as observed code/test facts.

Audit basis: working-tree code under `client/src/lib/game/**`, `client/src/lib/**`, `client/src/pages/**`, `client/src/features/**`, `server/**`, `shared/**`, `drizzle/**`, `scripts/**`, plus targeted tests listed per system. Roadmap rows referenced as `R#`.

## Core engine and progression

### Combat / Dice (2d12) — R19
- Current status: [DONE]
- Implementation: `client/src/lib/game/core.ts` (`resolveRoll`, `outcomeFromMargin`); `client/src/lib/game/engine.ts` (`canonicalDifficulty`, normalization); state commit via `applyRoll`.
- Evidence: `client/src/lib/game.difficulty-balance.test.ts` (DN 16/20/28 selection, canonical difficulty ladder, total = dice + trait + mastery + context + flaw, trait level-up through `applyRoll`); `scripts/game-engine-smoke.ts` (2d12 record, canonical formula, roll persisted in `state.rolls`).
- Missing: none recorded by the roadmap for row 19.
- Dependencies: attributes/traits, masteries, equipped-item context bonus, optional AI GM analysis merge (`mergeAIAnalysis`).
- Known risks: dice use `Math.random()` inside the engine; determinism depends on that single ownership point.

### World Memory — R1
- Current status: [DONE]
- Implementation: `client/src/lib/game/state.ts` + `core.ts` (`applyRoll` pushes `WorldMemory` into `state.memories`); event memories via `client/src/lib/randomEvents.ts` / `applyEventEffects`.
- Evidence: `scripts/game-engine-smoke.ts` (two memories after one resolved roll); `client/src/lib/randomEvents.test.ts` (heat/rumor effects recorded as memories); memory context sent to AI GM from `Home.tsx` (`recentMemories`).
- Missing: memory array grows unbounded (cap of 50 applies only to `vitalEvents`).
- Dependencies: roll resolution, random-event effects, autosave, AI GM context.
- Known risks: unbounded growth over long campaigns.

### Narrative Memory / Story Records — R2
- Current status: [DONE]
- Implementation: `core.ts` `applyRoll` stores `RollRecord.narrative` and appends `StoryRecord`; `client/src/features/chronicle/ChronicleView.tsx` reads them.
- Evidence: `client/src/lib/game.narrative.test.ts` (three-paragraph opening, per-roll story record, Reader Mode split); `client/src/features/chronicle/ChronicleView.test.tsx` (folio/time/thread rendering).
- Missing: none recorded by the roadmap for row 2.
- Dependencies: roll resolution, local fallback narration, AI GM resolve narrative.
- Known risks: none recorded.

### World Calendar — R10
- Current status: [DONE]
- Implementation: calendar advancement inside `applyRoll` (`core.ts`), year/era/season/day/region/location.
- Evidence: `client/src/lib/game.progression.test.ts` (year/season/day advance; age increments only when crossing the character's birth season).
- Missing: none recorded by the roadmap for row 10.
- Dependencies: roll resolution, progression state.
- Known risks: none recorded.

### Time of Day (segment) — R10a
- Current status: [IN PROGRESS]
- Implementation: `client/src/lib/game/types/base.ts` (`TimeSegment`); `progression.segment`; `advanceClock` called from `applyRoll`.
- Evidence: `client/src/lib/game.progression.test.ts` (`lastTimeMark.to === "night"`); roadmap row 10a confirms no consumer beyond the mark.
- Missing: UI control; no downstream reducer consumes segment (no encounter-difficulty modifier, no NPC schedule).
- Dependencies: calendar advancement; future encounter/NPC-schedule systems.
- Known risks: segment advances silently for players; no visible control.

### Vitals / Blood / Focus — R16
- Current status: [DONE]
- Implementation: `client/src/lib/game/state.ts` (`applyVitalDelta`, `clampVital`, `vitalMaxes`, `levelUpVital`), called from `applyRoll`.
- Evidence: `client/src/lib/vitals.progression.test.ts` (clamp to 0..max, separate caps, milestone level-up, hard `VITAL_CAP` 10, one reward per milestone id).
- Missing: none recorded by the roadmap for row 16.
- Dependencies: progression milestone points; legacy save migration (`normalizeGameState`).
- Known risks: none recorded.

### Progression / XP — R17
- Current status: [DONE]
- Implementation: `client/src/lib/game/state.ts` (`awardPractice`, `awardStatPractice`, `awardMilestonePoint`), curves in `client/src/lib/game/engine.ts` (mastery cap 5, trait thresholds).
- Evidence: `client/src/lib/game.progression.test.ts` (mastery climb with five-Progress thresholds, mission reward grant on resolution, learning after failure, Page/Leaf advance after several days, trait thresholds and Level-10 cap).
- Missing: `growthPoints` is typed but has no consuming reducer.
- Dependencies: roll outcomes; vitals level-up; calendar.
- Known risks: none recorded beyond the unused growthPoints field.

## Missions and random events

### Missions — R5
- Current status: [DONE]
- Implementation: `client/src/lib/game/state.ts` (`applyMissionDirective`, `missionDirectiveIsCanonConsistent`, `normalizeMissionThreads`, `activeMainMission`, `visibleSideLeads`); objective progress in `core.ts`/`state.ts`.
- Evidence: `client/src/lib/game.mission-threads.test.ts` (legacy thread normalization, `replace_main` directive, hidden side reveal, canon-guard rejection); `client/src/lib/game.progression.test.ts` (mission resolution grants contextual reward).
- Missing: no mission expiry; no branch graph.
- Dependencies: AI GM `missionDirective` (proposes; engine validates); roll outcomes.
- Known risks: none recorded beyond the missing expiry/branch features.

### Random Events — R4
- Current status: [DONE]
- Implementation: `client/src/lib/randomEvents.ts` (deterministic FNV-1a selection, cooldown, fixed chance) + `shared/data/random-events.json` (45 events); trigger from `applyRoll`; `client/src/features/play/PlayScene.tsx` + `RandomEventModal`; `acceptRandomEventQuest` / `rejectRandomEventQuest`.
- Evidence: `client/src/lib/randomEvents.test.ts` (45-event pool, deterministic seed, season/era filtering, cooldown, chance below 100%, choice application, quest acceptance creating a side mission).
- Missing: staged pools `shared/data/sengoku_45_universal_events.json` and `shared/data/sengoku_random_events_pool.json` are not merged into runtime.
- Dependencies: `applyRoll` tick/day seed; mission system for event quests.
- Known risks: live `random-events.json` Thai text has corrupted encoding; staged pools duplicate ids and need a merge/encoding/de-duplication pass.

### Random Event Effects — R4a
- Current status: [IN PROGRESS]
- Implementation: `applyEventEffects` reducer in `client/src/lib/game/state.ts`; invoked from `core.ts` on accepted-quest resolution and event choices.
- Evidence: `client/src/lib/randomEvents.test.ts` covers currency/blood/heat/rumor effects through the reducer; roadmap row 4a records the remaining gaps.
- Missing: consistent failure filtering and negative `remove` semantics for inventory effects; no grant/remove entries exist in the live event data.
- Dependencies: inventory/economy reducers; random-events data.
- Known risks: effect behavior is only partially exercised by live data; targeted verification required before completion.

### Consequences — R20
- Current status: [DONE]
- Implementation: `RollRecord.consequence`; `applySocialRecord` (honor/influence/stain); `captureRelationshipEvidence` (per-contact events); `applyWorldEvent` (faction events, reputation entries).
- Evidence: `client/src/lib/game.social-mechanics.test.ts` (social changes only on mission resolution, stain on failure, caps/clamps); `client/src/lib/game.relationships.test.ts` (evidence capture per contact).
- Missing: no multi-turn consequence chains (see next entry).
- Dependencies: roll resolution, missions, relationships, world events.
- Known risks: consequences stay within the triggering roll.

### Consequence Chains — R20a / R29
- Current status: [NOT FOUND]
- Implementation: none found.
- Evidence: roadmap audit found no `consequenceDAG`/`consequenceChain`/graph references in code or schema.
- Missing: design doc and reducer.
- Dependencies: consequences (R20), obligations (R18a).
- Known risks: multi-turn tracking is absent; cross-system chains cannot be represented yet.

## World, factions, and campaign start

### Factions — R6
- Current status: [DONE]
- Implementation: `client/src/lib/worldEvents.ts` (`applyWorldEvent` mutates `worldSystems.powerRumor`, 5 factions); `client/src/lib/powerRumor.ts` (`deriveRumors`, `deriveFactionStances`); `client/src/lib/factionVoice.ts` (localized responses); `client/src/lib/regionInitialState.ts` (initial stance seeding).
- Evidence: `client/src/lib/powerRumor.test.ts` (player-visible factions with reasons, no raw numeric score, heat derived from stain/evidence 1..5, projection does not mutate GameState); roadmap row 6.
- Missing: at-war state machine (row 6a); reputation UI projection (row 6b).
- Dependencies: world events, random-event heat/rumor effects, StoryMap/PowerRumorPanel projections.
- Known risks: stance and heat enum values exist without transition triggers.

### Faction Hostility / At-War — R6a
- Current status: [IN PROGRESS]
- Implementation: stance enum values in `worldEvents.ts`; `WorldSystemsFlags.scopedHeat` flag in `client/src/lib/game/types/progression.ts`.
- Evidence: roadmap row 6a — no reducer triggers stance escalation; no at-war resolution; no war-front consequence pipeline.
- Missing: escalation reducer, at-war value resolution, war-front consequences.
- Dependencies: faction events, heat system (R18b).
- Known risks: flags are declared but inert.

### Faction Reputation — R6b
- Current status: [IN PROGRESS]
- Implementation: `worldEvents.ts` pushes `worldSystems.reputation[]` entries (factionId/delta/reason); axis schema listed in `schemas/sengoku_world_state.schema.json`.
- Evidence: roadmap row 6b; no UI projection or aggregate derivation found in the inspected UI modules.
- Missing: UI projection; aggregate derivation; heat/standing feedback into the player.
- Dependencies: world events; PowerRumorPanel or a future view.
- Known risks: written state is currently invisible to players.

### Heat (exposure) — R18b
- Current status: [IN PROGRESS]
- Implementation: `WorldSystemsFlags.scopedHeat` flag; heat domain entries in `shared/data/random-events.json`; derived heat in `client/src/lib/powerRumor.ts` (`deriveLocalHeat`).
- Evidence: `client/src/lib/powerRumor.test.ts` (heatLevel between 1 and 5 derived from stain/evidence, not a global reputation).
- Missing: no per-faction heat reducer; no wanted-threshold consequence; no entanglement chain.
- Dependencies: faction system; random-event effects.
- Known risks: heat is projection-derived only, not a mutated authoritative value.

### Rumors / News — R12
- Current status: [DONE]
- Implementation: `client/src/lib/powerRumor.ts` (`deriveRumors` from `worldSystems.powerRumor.events`); memory kinds `news` / `witness`.
- Evidence: `client/src/lib/powerRumor.test.ts` (stable read-only projection with human-readable stances); roadmap row 12.
- Missing: no player-spread rumor mechanic; rumors are observer-side.
- Dependencies: faction events, memories.
- Known risks: none recorded beyond observer-side scope.

### Occupations / Campaign Start — R7 / R14
- Current status: [DONE]
- Implementation: `client/src/lib/game/data.ts` (`STARTER_TEMPLATES` 10 x `STARTER_ERAS` 7, `selectStarterOrigin`, `item`, `mastery`); `core.ts` `createGameState` and `createSaikaSafehouseDemo`; `server/starterProfiles.ts` validated via `server/routers.ts` `starter.selectProfile`.
- Evidence: `scripts/game-engine-smoke.ts` (all 10 templates create a character and opening mission; demo start with schemaVersion 9); `client/src/pages/Home.local-flow.ui.test.tsx` (starter-profile dossier confirmation flow).
- Missing: single occupation locked at start; no mid-campaign era transition; no in-campaign respec.
- Dependencies: starter-profile server validation; Local Save.
- Known risks: none recorded beyond the locked single occupation.

### Ranks / Classes — R8
- Current status: [IN PROGRESS]
- Implementation: `client/src/lib/game/types/character.ts` `Character.social` (rank/honor/influence/information/stain); `applySocialRecord` mutates honor/influence/stain.
- Evidence: `client/src/lib/game.social-mechanics.test.ts` (mission-resolution social changes, caps and clamps); roadmap row 8 confirms rank and information are never mutated.
- Missing: rank and information mutation rules; no class-switch or rank-up event.
- Dependencies: mission resolution; social tier projection in `powerRumor.ts` (`socialTierLabel`, covered by `powerRumor.test.ts`).
## Items, relationships, AI, and persistence

### Items / Equipment — R9
- Current status: [IN PROGRESS]
- Implementation: `client/src/lib/game/types/economy.ts` (`InventoryItem`, `ItemKind`, functions); `item()` factory in `data.ts`; equipment in `state.ts` (`equipItem`, `unequipItem`, `equippedItemsOf`, `normalizeEquipmentState`); `parseAction` consumes equipped bonuses (capped +2) and inventory `special` documents; MarketHub gear UI.
- Evidence: `client/src/lib/game.equipment.test.ts` (equip/unequip/replace, stale ids ignored, "inventory is not equipped" bonus rule, special document unlock, swap semantics); `client/src/pages/MarketHub.test.tsx` (gear tab equip/unequip/badges/filters).
- Missing: `exchange` item function has no consumer; remaining item semantics are not integrated across every function/category (roadmap row 9).
- Dependencies: economy purchase flow; `normalizeGameState` equipment migration.
- Known risks: partial semantics can make some item functions inert in play.

### Relationships / NPC — R11
- Current status: [DONE]
- Implementation: `state.ts` (`saikaPublicRelationships`, `captureRelationshipEvidence`, foundation memories) for the four Saika contacts; `client/src/features/relationships/RelationshipsView.tsx` triggers `trpc.relationships.analyzeDay`; `server/relationshipAnalyzer.ts` with Zod + timeout + dossier disclosure guards; persistence via `drizzle/schema.ts` `relationshipDailySummaries` and migration `drizzle/0001_relationship_daily_summaries.sql`.
- Evidence: `client/src/lib/game.relationships.test.ts` (four clamped contacts, per-day pending analysis, legacy whitelist removes private dossier fields); `server/relationshipAnalyzer.test.ts` (cached record reuse, unknown-evidence rejection, private-disclosure rejection, deterministic source hash persistence).
- Missing: no cross-contact gossip; no player-authored blankSpace (row 11a).
- Dependencies: roll evidence capture; trial credits; MySQL.
- Known risks: analysis depends on AI availability; Local Trial UI fallback covers unavailability (per MEMORY.md audit note).

### NPC blankSpace — R11a
- Current status: [IN PROGRESS]
- Implementation: `PublicRelationshipContact.blankSpace` (`BilingualText[]`) seeded by foundation events in `state.ts`.
- Evidence: roadmap row 11a; no player editor or AI readback found in inspected UI/server code.
- Missing: player authoring UI; AI prompt readback.
- Dependencies: relationships system; AI GM context builder.
- Known risks: field exists in saves but has no consumer.

### AI GM — R13
- Current status: [DONE]
- Implementation: `server/gm.ts` (`analyzeWithGM`, `resolveWithGM`, Zod schemas, 45s timeout, retry, structured output, narrative-quality evaluation, historical brief); `server/routers.ts` (`gm.analyze`, `gm.resolve`, credit guard); engine validation via `mergeAIAnalysis` in `core.ts`; client calls in `client/src/features/play/PlayScene.tsx`; contracts in `shared/ai-gm.ts`.
- Evidence: `server/gm.test.ts` (timeout abort, canonical difficulty normalization, numeric clamps, historical fact selection, retry, game-artifact leak rejection, four historical boundary labels); `server/gm.router.test.ts` (authenticated routes, credit refusal); `client/src/lib/game.ai-merge.test.ts` (engine-owned merge reproduces the previous UI merge exactly); `client/src/pages/Home.local-flow.test.ts` (Local Trial fallback keeps credits).
- Missing: no streaming; no multi-turn memory beyond current input; no per-campaign retry budget.
- Dependencies: auth + trial credits; Local Save fallback; historical timeline data.
- Known risks: live provider availability was exhausted during a past audit (MEMORY.md); Local Trial fallback mitigates.

### Save / Load — R15
- Current status: [DONE]
- Implementation: `client/src/pages/Home.tsx` (autosave on state change, manual / Leaf II / Leaf III saves, campaign library, load/delete/reset); `normalizeGameState` in `state.ts` (schemaVersion migration); localStorage key `dust-fire-local-game-v3-saika` exercised by tests.
- Evidence: `client/src/lib/game.legacy-save.test.ts` (schemaVersion 3 → 9 migration: wounds → blood, axis → stat, property → currency, default progression/economy/worldSystems, story-record rebuild); `client/src/pages/Home.local-flow.test.ts` (offline roundtrip) and `Home.local-flow.ui.test.tsx` (save/load/delete/library flows, delete confirmation).
- Missing: no Drive/cloud backup; no cross-device sync.
- Dependencies: browser localStorage; every other system's state shape.
- Known risks: schema migrations must keep up with every GameState change; regression fixtures guard the known legacy keys.

### Economy / Debt — R18, Obligations — R18a, Services — R18c
- Current status: [DONE] (all three rows)
- Implementation: `buyMarketOffer` (currency/inventory/obligations/transactions/routeStatus + faction event) and `useMarketService` in `core.ts`/`state.ts`; season-driven `buildMarket`; `buildSaikaMarket` / `buildSaikaEconomy` (services, obligations, transactions); `canUseObligation` debt coverage; `eventFromDebt` faction event.
- Evidence: `client/src/pages/MarketHub.test.tsx` (purchase flows across inventory/availability/transaction history; services and debts ledgers; gear actions); `scripts/game-engine-smoke.ts` (market purchase subtracts resources and adds inventory); `client/src/lib/game.equipment.test.ts` (`useMarketService` success/rejection paths); `client/src/lib/game.progression.test.ts` (mission reward enters economy transactions).
- Missing: no broader economy simulation; no UI filter/expiry for obligations; no service-specific gameplay effect beyond record/memory/availability.
- Dependencies: inventory items; faction events; campaign save flow.
- Known risks: services are records rather than mechanics; obligations have no expiry.

## Historical data and UI projections

### Historical Timeline — R3
- Current status: [DONE]
- Implementation: `shared/historicalTimeline.ts` (135 records, 66 provinces, 4 precision levels; `client/src/lib/historicalTimeline.ts` is a compatibility re-export); `server/timeline.ts` public route; `historicalBrief` in `server/gm.ts`; stance derivation in `regionInitialState.ts`.
- Evidence: `server/gm.test.ts` (analyze prompt embeds historical brief with fact ids); `server/timeline.router.test.ts` exists for the route; roadmap row 3.
- Missing: player-facing browseable timeline tab.
- Dependencies: GM prompt; admin console timeline facts.
- Known risks: none recorded beyond the missing player tab.

### StoryMap — (roadmap Current State: UI / DEMO)
- Current status: [UI / DEMO]
- Implementation: `client/src/features/story/StoryMap.tsx` + `provinceMapData.ts` (66 provinces, national map marker per supported region).
- Evidence: `client/src/features/story/StoryMap.test.tsx` (projects campaign location, mission, memories, roll state from real GameState; moves marker with state; asserts no territorial-control representation).
- Missing: no state mutation features (territorial control is R21 [NOT FOUND]).
- Dependencies: GameState campaign/scene/mission/memory fields.
- Known risks: read-only projection; safe by design.

### ChronicleView — (roadmap Current State: UI / DEMO)
- Current status: [UI / DEMO]
- Implementation: `client/src/features/chronicle/ChronicleView.tsx` + `chronicleData.ts`.
- Evidence: `client/src/features/chronicle/ChronicleView.test.tsx` (folio/time/place/active-thread rendering from state; no consequence ledger).
- Missing: no editor; read-only.
- Dependencies: `StoryRecord` / memories / rolls.
- Known risks: none recorded.

### PowerRumorPanel — (roadmap Current State: UI / DEMO)
- Current status: [UI / DEMO]
- Implementation: `client/src/features/powerRumor/PowerRumorPanel.tsx` + `StoryCompactStatus.tsx`; projection in `client/src/lib/powerRumor.ts`.
- Evidence: `client/src/lib/powerRumor.test.ts` (projection never mutates GameState; no raw numeric scores).
- Missing: no mutation path; faction reputation entries are not projected (R6b).
- Dependencies: `worldSystems.powerRumor`, character social/community/economy fields.
- Known risks: flags in `WorldSystemsFlags` (e.g. `scopedHeat`, `seasonalPressure`) are declared but not driven by reducers.

### Player-side Timeline cards — (roadmap Current State: UI / DEMO)
- Current status: [UI / DEMO]
- Implementation: `server/timeline.ts` returns records; no browseable player tab found in inspected pages/features.
- Evidence: roadmap Current State listing; absence of a timeline tab in inspected UI modules.
- Missing: player-facing browseable view.
- Dependencies: server route; navigation.
- Known risks: none recorded.

## Not implemented ([NOT FOUND]) — per roadmap audit, no code path found

| System (roadmap row) | Evidence basis | Needs before implementation |
|---|---|---|
| Territorial Control (R21) | no ownership field; StoryMap highlights location only | schema + reducer + UI |
| Weather (R22) | no weather field on GameState; narrative mentions only | climate model + season coupling |
| Multi-class / Respec (R23) | occupation locked by starter template | design + migration |
| Streaming AI (R24) | gm.analyze/resolve wait for full response | backend stream + UI + abort |
| AI-driven NPC Generation (R25) | only 4 Saika fixtures; no generator | contact scaffolding + canon guard |
| Contracts / Jobs (R26) | no Contract/Job entity separate from Mission | entity/schema decision |
| Hiring / Companions (R27) | no companion type or roster UI | companion type + travel/cost rules |
| Bounty / Head-price (R28) | no bounty field or wanted-level | schema + faction trigger |
| Maritime Simulation (R30) | no ships/ports/crews simulation | scope decision |
| Time-skip Autocheckpointing (R32) | only autosave per state change | policy + slot strategy |
| Player-authored Rumors (R33) | rumors derived only; no editor | editor + reputation consequence |
| Cross-contact NPC Gossip (R34) | each contact evolves from own evidence | gossip engine + trust filtering |
| Region Event Ledger (R35) | worldEvents writes globally; no per-region window | per-region accumulator + AI slice |
| PlayerIntent Abstraction (R36) | parseAction/AI analyze coupled to resolution | refactor to decouple |
| Economic & Currency 3-tier Mon (R37) | wallet is single `mon` (R18); design JSON staged only | 3-tier wallet + prices + migration adapter |
| Negotiation / Barter UI (R38) | no negotiate panel/response states in Play | panel + barter + NPC states + dice check |
| Player Attachment / Item Offering (R39) | spec only; no offering layer/validator | depends on R9, R18, R11, R13, R15 |

Statuses are copied from the roadmap's [NOT FOUND] audit; no implementation was discovered that contradicts them during this inspection.

## Partial cross-cutting systems

### Sengoku Social Dynamics — R40
- Current status: [IN PROGRESS]
- Implementation: `shared/sengokuSocialFacts.ts` + `shared/narrativeGoldenExamples.ts` feed the AI GM prompt; `Character.social` carries rank/status; social tier labels in `powerRumor.ts`.
- Evidence: `server/gm.ts` imports the fact cards; `powerRumor.test.ts` tier labels; roadmap row 40.
- Missing: full class table as a structured dataset; per-class dialogue generator; class-aware responses rely on prose fact cards.
- Dependencies: AI GM prompt; future negotiation flow (R38); factions.
- Known risks: class behavior is prompt-dependent rather than table-driven.

### Rule-based Procedural Generation Framework — R41
- Current status: [IN PROGRESS]
- Implementation: the pattern exists as the AI GM loop (state → `server/gm.ts` analyze/resolve → engine `mergeAIAnalysis`/validators → GameState); each content path (gm, relationshipAnalyzer, timeline) hand-wires its own schema/validation.
- Evidence: `server/gm.ts`, `server/relationshipAnalyzer.ts`, `server/timeline.ts`; roadmap row 41.
- Missing: no shared Content Contract + Generator + Validator module; no generic pipeline for other content types.
- Dependencies: umbrella over rows 4, 5, 6, 9, 11, 12, 13, 14, 20a, 36, 39, 40 and the AI authority split.
- Known risks: duplicated validation logic across server modules increases drift risk.

## Method and limits

- Statuses were verified against implementation modules and the targeted tests named above; where a claim rests on the roadmap audit alone (notably the [NOT FOUND] table), it is marked as such.
- No gameplay rule, number, or effect is defined by this document.
- `PROJECT_ROADMAP.md` was not modified in this task and remains the authoritative source.
- This file must be re-audited whenever an implementation change affects a listed system.
