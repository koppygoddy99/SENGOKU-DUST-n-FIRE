# SENGOKU-DUST-n-FIRE — Project Roadmap

Living roadmap of game systems, audited against the live repository. Re-audit at the end of every task; update statuses to match reality, never declare a system DONE before its implementation is complete.

## Status Legend

- [DONE] — implementation exists, used end-to-end in the deterministic engine or persisted pipeline
- [IN PROGRESS] — partial implementation exists (data, types, projection, or one-way flow), but the full loop is incomplete
- [UI / DEMO] — only a visual surface or fixture is present; the underlying gameplay state is not actually mutated or persisted
- [NOT FOUND] — no implementation found in the repository at audit time

Notes on partial systems: a system marked [IN PROGRESS] must keep that status until its consumer (reducer, route, or persistent migration) is wired. A system moves to [NOT FOUND] only when an audit confirms no code path, type, fixture, or schema references it.

---

## Core Systems (36)

The list is not capped. Subsystems that earn their own row are split out so that a missing reducer or a missing UI does not hide behind a larger system. Numbered rows are top-level systems; suffixed rows (4a, 6a, 6b, 10a, 11a, 18a, 18b, 18c, 20a) are subsystem splits of the row above them.

| # | System | Status | What exists | What is missing |
|---|---|---|---|---|
| 1 | World Memory | [DONE] | applyRoll pushes WorldMemory objects (7+ kinds) into state.memories; autosave persists; sent to AI GM context | Memory array grows unbounded (cap of 50 applies only to vital events) |
| 2 | Narrative Memory | [DONE] | applyRoll + applyEventEffects push memories; RollRecord.narrative stored per turn; ChronicleView reads both | — |
| 3 | Historical Timeline | [DONE] | shared/historicalTimeline.ts (135 records, 66 provinces, 4 precision levels); regionInitialState.ts derives faction stance; server/gm.ts historicalBrief in AI prompt; server/timeline.ts public route | Player-facing browseable timeline tab |
| 4 | Random Events | [DONE] | randomEvents.ts + shared/data/random-events.json (45 events); deterministic FNV-1a + cooldown + 25% chance; maybeTriggerRandomEvent from applyRoll; accept/reject create side-missions; eventHistory cap 80 | — |
| 4a | Random Event Effects | [IN PROGRESS] | applyEventEffects + lossEffects + retiredReason in core.ts:517-521 fire on failure_with_consequence; effect types include heat, reputation, inventory, memory, obligation | No post-quest-resolution application for accept-side outcomes (only failure branch applies them) |
| 5 | Missions | [DONE] | applyMissionDirective handles replace_main/create_hidden_side/reveal_side/retire_side; progressActiveMission advances objective; missionDirectiveIsCanonConsistent prevents canon break; AI drives lifecycle via missionDirective | No mission expiry or branch graph |
| 6 | Factions | [DONE] | applyWorldEvent mutates worldSystems.powerRumor (5 factions); deriveRumors projects to UI; FACTION_VOICE provides localized responses; regionInitialState seeds initial stance | No at-war state machine; stance and heat enum values exist but no transition trigger |
| 6a | Faction Hostility / At-War | [IN PROGRESS] | stance enum covers allies/friendly/cautious_cooperation/conditional_cooperation/wary/opposed; heat flag scopedHeat in WorldSystemsFlags | No reducer triggers stance escalation, no at-war value resolved, no war-front consequence pipeline |
| 6b | Faction Reputation | [IN PROGRESS] | worldEvents.ts pushes worldSystems.reputation[] entries with factionId/delta/reason; schema in sengoku_world_state.schema.json lists trust/respect/fear/debt/resentment/reliability axes | No UI projection; no aggregate derivation; no heat/standing consequence fed back into the player |
| 7 | Occupations | [DONE] | STARTER_TEMPLATES (10) x STARTER_ERAS (7); deterministic selectStarterOrigin; server/starterProfiles.ts validates | Single occupation locked at start |
| 8 | Ranks / Classes | [IN PROGRESS] | Character.social has rank/honor/influence/information/stain; applySocialRecord mutates honor/influence/stain | rank and information have no mutation rule; no class-switch or rank-up event |
| 9 | Items | [IN PROGRESS] | item() factory; buyMarketOffer adds to inventory; InventoryItem has functions[] and bonus fields and special; MarketService economy.services populated | functions and bonus stored but NOT consumed in applyRoll; no item-effect on difficulty |
| 10 | World Calendar | [DONE] | advanceCampaignCalendar in applyRoll advances year/era/season/day/region/location; canonical timeline | — |
| 10a | Time of Day (segment) | [IN PROGRESS] | progression.segment typed (dawn/day/dusk/night); advanceClock called in applyRoll | No UI control; no downstream reducer consumes segment (no encounter difficulty modifier, no NPC schedule) |
| 11 | Relationships / NPC | [DONE] | 4 Saika contacts (gantaro, tokichi, masakichi, genshiro); captureRelationshipEvidence appends per-NPC events; RelationshipsView triggers trpc.relationships.analyzeDay; server persists to MySQL | No cross-contact gossip propagation; no player-authored blankSpace editor |
| 11a | NPC blankSpace | [IN PROGRESS] | Relationship.blankSpace is a BilingualText[] on each contact; foundation events carry blankSpace seed | No UI for the player to author blankSpace entries; AI does not yet read them back into the prompt |
| 12 | Rumors / News | [DONE] | Derived: deriveRumors in powerRumor.ts projects from worldSystems.powerRumor.events; news and witness memory kinds | No player-spread rumor mechanic; rumors are observer-side only |
| 13 | AI GM | [DONE] | trpc.gm.analyze (intent to stat/mastery/difficulty) + trpc.gm.resolve (roll result to narration/memory/missionDirective); 45s timeout, retries, schema validation, trial-credit accounting; Local Trial fallback | No streaming; no multi-turn memory beyond current input; no retry budget per campaign |
| 14 | Campaign Start | [DONE] | createGameState 7 eras x 10 paths; createSaikaSafehouseDemo demo start; server/starterProfiles.ts validates | No mid-campaign era transition; no in-campaign character respec |
| 15 | Save / Load | [DONE] | Home.tsx autosave on every state change; manual / Leaf II / Leaf III / campaign library; normalizeGameState handles schemaVersion migration; loadSave/writeSave/deleteSave/resetLocal wired | No Drive / cloud backup; no cross-device sync |
| 16 | Vitals / Blood / Focus | [DONE] | applyVitalDelta with clampVital(0..VITAL_CAP=10); vitalMaxes; levelUpVital; called from applyRoll | — |
| 17 | Progression / XP | [DONE] | awardPractice (mastery XP), awardStatPractice (trait XP), awardMilestonePoint, levelUpVital; mastery capped at level 5; trait XP curve 3/4/5/6 | growthPoints typed but no consuming reducer |
| 18 | Economy / Debt | [DONE] | buyMarketOffer mutates currency/inventory/obligations/transactions/routeStatus + faction event; season-driven market; eventFromDebt adds faction event; canUseObligation path | economy.services populated but no reducer consumes services (see row 9) |
| 18a | Obligations (Favor / Debt) | [DONE] | economy.obligations: Array<{id, kind: credit|debt|favor}>; buyMarketOffer + applyWorldEvent write to it; canUseObligation lets debt cover shortfall; memory kind favor/stain | No UI filter; no per-obligation expiry; no per-obligation AI narration hook |
| 18b | Heat (exposure) | [IN PROGRESS] | WorldSystemsFlags.scopedHeat declared; random-events.json domain heat; faction heat level surfaced via powerRumor summary | No per-faction heat reducer; no wanted-threshold consequence; no entanglement chain like Blades in the Dark (research only) |
| 18c | Services (Market Hands) | [IN PROGRESS] | economy.services populated by buildSaikaEconomy; MarketService type defined | No consumer in applyRoll; no per-service action (hire, witness, refuse) |
| 19 | Combat / Dice | [DONE] | resolveRoll: 2d12 + trait + mastery + contextBonus - 2 (flaw); 4 outcomes; canonical difficulty table; applyRoll chains all mutations | — |
| 20 | Consequences | [DONE] | RollRecord.consequence stored per roll; applySocialRecord updates honor/influence/stain; captureRelationshipEvidence adds per-contact events; applyWorldEvent adds faction events; worldSystems.reputation entries | No long-running consequence DAG; no multi-turn obligation chains; consequences stay within the triggering roll |
| 20a | Consequence Chains | [NOT FOUND] | no consequenceDAG, no consequenceChain, no graph references in code or schema | needs design doc and reducer before implementation |
| 21 | Territorial Control | [NOT FOUND] | no territorialControl, no province ownership field, no faction-occupancy map; StoryMap only highlights current location | needs schema + reducer + UI before integration |
| 22 | Weather | [NOT FOUND] | no weather field on GameState; only narrative mentions (factionVoice.ts, random-events.json domain) and historical disaster fact cards exist | needs climate model + season coupling + regional derivation |
| 23 | Multi-class / Respec | [NOT FOUND] | no multiClass, no respec, no second occupation in state; Occupation locked by STARTER_TEMPLATE at createGameState | needs design + migration before any class change can ship |
| 24 | Streaming AI | [NOT FOUND] | no streaming, no SSE, no chunked response; trpc.gm.analyze/resolve both wait for full response | needs backend stream + UI token render + abort handling |
| 25 | AI-driven NPC Generation | [NOT FOUND] | only 4 Saika fixtures exist (gantaro/tokichi/masakichi/genshiro); relationshipAnalyzer accepts a contactId but no generator | needs procedural contact scaffolding + canon-consistency guard |
| 26 | Contracts / Jobs | [NOT FOUND] | no Contract type, no Job entity, no separate contract ledger; only Mission covers work; obligations cover the debt side | needs separate entity or schema decision before implementation |
| 27 | Hiring / Companions Roster | [NOT FOUND] | no companion type, no hiring flow, no roster UI; pull list on Character is static | needs companion type + travel rules + cost engine |
| 28 | Bounty / Head-price | [NOT FOUND] | no bounty field, no headPrice, no wanted-level mechanic | needs schema + faction trigger + consequence hook |
| 29 | Long-running Consequence DAG | [NOT FOUND] | see 20a; no DAG library, no multi-turn tracking | needs design before reducer |
| 30 | Maritime Simulation | [NOT FOUND] | no maritime, no ships, no ports, no crews, no route simulation; only fact-card references in docs | needs separate simulation layer + UI |
| 31 | Cloud Backup / Drive | [NOT FOUND] | no driveBackup, no cloud sync, no cross-device export/import | needs consent + retention + access policy first |
| 32 | Autocheckpoint on Time Skip | [NOT FOUND] | no autocheckpoint when day advances; only autosave per state change | needs policy + save slot strategy |
| 33 | Player-authored Rumors | [NOT FOUND] | no UI for player to author or spread rumors; Rumors are derived from worldSystems.powerRumor only | needs editor + reputation consequence |
| 34 | Cross-contact NPC Gossip | [NOT FOUND] | no gossip propagation between contacts; each contact evolves from its own evidence | needs gossip engine + trust-aware filtering |
| 35 | Region Event Ledger | [NOT FOUND] | no region-scoped event log; worldEvents writes global but no per-region rolling window for AI prompt | needs per-region accumulator + AI context slice |
| 36 | PlayerIntent Abstraction | [NOT FOUND] | parseAction and AI analyze are coupled to deterministic resolution; no separate PlayerIntent layer | needs refactor to decouple AI analysis from engine |

---

## Current State (Grouped)

### Working end-to-end ([DONE])
- 2d12 Combat: full formula, 4 outcomes, canonical difficulty, deterministic
- World Calendar: year / era / season / day / region / location advance on roll
- Memory: 7+ memory kinds appended per roll and event, persisted, AI-visible
- Random Events: 45-event pool, deterministic selection, accept/reject as side-mission
- Factions: 5 factions, stance / heat / reputation mutated by events, rumor projections
- AI GM: analyze + resolve routes, 45s timeout, schema validation, Local Trial fallback
- 4 Saika NPC Contacts: evidence capture per roll, daily AI analysis, MySQL persistence
- Save / Load: autosave + manual + Leaf II + Leaf III + campaign library + migration
- Missions: main + side + random-quest, AI-driven lifecycle with canon consistency guard
- Economy: currency, debt, market, season-driven offers, transactions ledger, obligations
- Progression: vitals, mastery, trait XP, milestone points

### Partial ([IN PROGRESS])
- Time of Day (segment): progression.segment advances but no UI or downstream effect
- Character.social.rank / information: typed and initialized but never mutated
- Item functions / bonus: stored on inventory items but not consumed at roll time
- Random event effects: applied on failure_with_consequence only; accepted quest effects never resolved
- NPC blankSpace: type exists, no player editor, AI does not read it back
- Faction hostility / at-war: stance enum exists, no transition trigger
- Faction reputation: worldSystems.reputation[] written, no UI projection
- Heat: WorldSystemsFlags.scopedHeat declared, no per-faction reducer, no consequence chain
- Services: economy.services populated by buildSaikaEconomy but no reducer consumes them
- Consequence chains: within-roll only; multi-turn tracking not implemented (see also row 20a)

### Visual surface only ([UI / DEMO])
- StoryMap (client/src/features/story/StoryMap.tsx): reads current location marker, shows 66 provinces, does not mutate state
- ChronicleView: reads state.memories, no editor
- PowerRumorPanel: reads worldSystems.powerRumor, no mutation
- Timeline cards (player-side): server route returns records, no browseable player tab

### Not implemented ([NOT FOUND])
- Territorial control / province ownership
- Weather (no weather field in GameState)
- Multi-class / respec
- Streaming AI responses
- Cross-contact NPC gossip
- Player-authored rumors (blankSpace editor)
- Autocheckpointing on time skip
- Cloud backup / Drive
- AI-driven NPC generation (only 4 Saika fixtures exist)
- Contracts / Jobs entity separate from Mission
- Hiring / Companions roster
- Bounty / head-price mechanic
- Long-running consequence DAG
- Maritime simulation (ships, ports, crews, route simulation)
- Region event ledger
- PlayerIntent abstraction (AI-analyze coupled to engine)

---

## Next Steps (priority-ranked)

1. Wire InventoryItem.functions and bonus into applyRoll so special items modify difficulty or add bonuses. This is the single largest gap between inventory data and gameplay loop.
2. Complete the random-event effects pipeline so Mission.randomEvent.effects fire on accepted quest resolution (not only on failure_with_consequence).
3. Wire progression.segment (dawn/day/dusk/night) into a downstream reducer (encounter difficulty, NPC schedule) and add a UI control.
4. Add Character.social.rank and information mutation rules, tied to mission resolution or faction standing.
5. Open a blankSpace editor for the player and let the AI GM read it back into the next turn prompt.
6. Add a per-region event ledger so the AI knows what has happened in a region since the player last visited.
7. Refactor parseAction / AI analyze into a PlayerIntent layer so procedural content can be added without touching the deterministic engine.
8. Add a faction hostility / at-war state machine driven by event accumulation and scandal heat.
9. Project worldSystems.reputation[] into a UI view (per-faction stance, debt, fear) and feed it back into the AI prompt.
10. Consume economy.services (Services & Hands) in a reducer so hiring and refusal change state.

---

## AI / Procedural Generation

AI is the creative and narrative layer. The deterministic game engine is the authority on all rules.

### Principle: AI proposes > Engine validates > Engine commits > AI narrates

### AI CAN generate (contextual, constrained)
- Mission descriptions, objectives, risks, rewards
- Side quest content and triggers
- Random event text and choices
- NPC dialogue and situations
- Item descriptions and names
- Rumor content and spread
- World memory title and detail
- Narrative prose for resolved scenes
- Consequence descriptions (text only)
- Historical fiction framing (within fact-card fence)

### AI MUST NOT control (engine-owned)
- Stat selection or modification
- Dice outcome (ever)
- Difficulty number
- Inventory mutation
- Currency change
- Time advancement
- Faction stance / heat / reputation values
- XP or mastery gain
- Blood / Focus / Vitals
- Mission lifecycle state transitions (AI proposes via missionDirective; engine validates via missionDirectiveIsCanonConsistent)
- Save / load

### Current AI authority split (verified from code)
- trpc.gm.analyze: AI proposes stat, mastery, difficulty, contextBonus, flawTriggered
- trpc.gm.resolve: AI writes narration (3 paragraphs), memory, missionDirective, historicalFence
- relationshipAnalyzer: AI writes daily contact summary, familiarityDelta, affinityDelta, evidenceIds
- AI MUST NOT alter: total, outcome, consequence, or any GameState field directly

---

## VERSION HISTORY

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-08-31 | Initial roadmap based on repository reality audit (20 core systems, status legend, status table, current state, next steps, AI procedural generation principle). |
| 0.2 | 2026-08-31 | Reworked: status legend uses [DONE] / [IN PROGRESS] / [UI / DEMO] / [NOT FOUND] tokens; removed duplicate Missing section; expanded to 36 rows including subsystem splits (4a, 6a, 6b, 10a, 11a, 18a, 18b, 18c, 20a); promoted Favor/Debt/Obligations, Heat, Services, Faction Hostility, Faction Reputation, NPC blankSpace to their own rows; moved Consequence Chains to its own [NOT FOUND] row. |

> Maintenance Rule: At the end of every task or version, audit PROJECT_ROADMAP.md against the actual repository state. Update statuses and notes when needed. Never erase previous version history. Always append a new version-history row. Never declare a system DONE before its full implementation loop (reducer + persistence + projection) is in place.
