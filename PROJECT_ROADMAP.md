# SENGOKU-DUST-n-FIRE — Project Roadmap

Living roadmap of game systems, audited against the live repository. Re-audit at the end of every task; update statuses to match reality, never declare a system DONE before its implementation is complete.

## Push Protocol (MANDATORY)

Every `git push` to this repository MUST include, in the same push:

1. **Version bump** — append a new row to [VERSION HISTORY](#version-history) at the bottom of this document. Increment the minor version (`0.N → 0.N+1`; use a major bump `1.0` only when the first playable end-to-end release ships). A push without a new VERSION HISTORY row is invalid.
2. **Roadmap audit** — update the Core Systems table, Current State, and Next Steps sections so they match the changes actually shipped in the pushed commits. Statuses must reflect verified repository evidence (reducer + persistence + projection), never intention.
3. **Accurate change note** — the new version-history row must summarize what actually changed in the pushed commits (features added/removed, refactors, fixes, test coverage), not what was planned.
4. **No silent pushes** — if a push contains no gameplay/system change (docs-only, chores), still append a version row with a brief note.

This protocol applies to every contributor and every agent working in this repository.

## Status Legend

- [DONE] — implementation exists, used end-to-end in the deterministic engine or persisted pipeline
- [IN PROGRESS] — partial implementation exists (data, types, projection, or one-way flow), but the full loop is incomplete
- [UI / DEMO] — only a visual surface or fixture is present; the underlying gameplay state is not actually mutated or persisted
- [NOT FOUND] — no implementation found in the repository at audit time

**Completeness Rule (กฎหลัก):** ฟังก์ชันใดถือว่าเสร็จสมบูรณ์ ([DONE]) **ต่อเมื่อครบทั้ง 3 เงื่อนไข** —
1. ฟังก์ชันนั้น **ทำงานครบวงจร** (reducer/engine integration + persistence + projection/UI ครบ ไม่ใช่มีแต่แผน/ต้นแบบ)
2. ฟังก์ชันนั้น **ไม่ได้รันร่วมกับฟังก์ชันอื่นที่ยังไม่เสร็จ** — ถ้ามันต้องพึ่งพา/ผูกกับระบบอื่น ระบบนั้นต้องเสร็จสมบูรณ์ก่อน มิฉะนั้นสถานะจะยังเป็น [IN PROGRESS]
3. มี**หลักฐานใน repository** (code + test) ยืนยันว่าใช้งานได้จริง ไม่ใช่แค่ spec/ข้อเสนอ

ฟังก์ชันที่เสร็จของมันแต่ต้อง "รันร่วม" กับระบบที่ยังค้าง → ยังไม่ถือว่า [DONE]

Notes on partial systems: a system marked [IN PROGRESS] must keep that status until its consumer (reducer, route, or persistent migration) is wired. A system moves to [NOT FOUND] only when an audit confirms no code path, type, fixture, or schema references it.

---

## Core Systems (38 → 41)

The list is not capped. Subsystems that earn their own row are split out so that a missing reducer or a missing UI does not hide behind a larger system. Numbered rows are top-level systems; suffixed rows (4a, 6a, 6b, 10a, 11a, 18a, 18b, 18c, 20a) are subsystem splits of the row above them.

| # | System | Status | What exists | What is missing |
|---|---|---|---|---|
| 1 | World Memory | [DONE] | applyRoll pushes WorldMemory objects (7+ kinds) into state.memories; autosave persists; sent to AI GM context | Memory array grows unbounded (cap of 50 applies only to vital events) |
| 2 | Narrative Memory | [DONE] | applyRoll + applyEventEffects push memories; RollRecord.narrative stored per turn; ChronicleView reads both | — |
| 3 | Historical Timeline | [DONE] | shared/historicalTimeline.ts (135 records, 66 provinces, 4 precision levels); regionInitialState.ts derives faction stance; server/gm.ts historicalBrief in AI prompt; server/timeline.ts public route | Player-facing browseable timeline tab |
| 4 | Random Events | [DONE] | randomEvents.ts + shared/data/random-events.json (45 events); deterministic FNV-1a + cooldown + 25% chance; maybeTriggerRandomEvent from applyRoll; accept/reject create side-missions; eventHistory cap 80. **Staged (not merged):** shared/data/sengoku_45_universal_events.json (45 events — duplicate content of random-events.json with corrected Thai encoding, 44/45 share event ids) and shared/data/sengoku_random_events_pool.json (8 events, mostly new ids) added as pending pools, not yet imported into runtime | staged pools not filtered/merged; encoding of live random-events.json is corrupted for Thai text; needs a merge/encoding fix and a duplicate-elimination pass before reuse |
| 4a | Random Event Effects | [IN PROGRESS] | applyEventEffects + lossEffects + retiredReason in core.ts:517-521; accepted quests now call applyEventEffects on resolution; current working tree adds grant/remove inventory effects and summaries | Failure filtering and negative remove semantics are inconsistent; live random-events.json has no grant/remove entries; needs targeted verification before completion |
| 5 | Missions | [DONE] | applyMissionDirective handles replace_main/create_hidden_side/reveal_side/retire_side; progressActiveMission advances objective; missionDirectiveIsCanonConsistent prevents canon break; AI drives lifecycle via missionDirective | No mission expiry or branch graph |
| 6 | Factions | [DONE] | applyWorldEvent mutates worldSystems.powerRumor (5 factions); deriveRumors projects to UI; FACTION_VOICE provides localized responses; regionInitialState seeds initial stance | No at-war state machine; stance and heat enum values exist but no transition trigger |
| 6a | Faction Hostility / At-War | [IN PROGRESS] | stance enum covers allies/friendly/cautious_cooperation/conditional_cooperation/wary/opposed; heat flag scopedHeat in WorldSystemsFlags | No reducer triggers stance escalation, no at-war value resolved, no war-front consequence pipeline |
| 6b | Faction Reputation | [IN PROGRESS] | worldEvents.ts pushes worldSystems.reputation[] entries with factionId/delta/reason; schema in sengoku_world_state.schema.json lists trust/respect/fear/debt/resentment/reliability axes | No UI projection; no aggregate derivation; no heat/standing consequence fed back into the player |
| 7 | Occupations | [DONE] | STARTER_TEMPLATES (10) x STARTER_ERAS (7); deterministic selectStarterOrigin; server/starterProfiles.ts validates | Single occupation locked at start |
| 8 | Ranks / Classes | [IN PROGRESS] | Character.social has rank/honor/influence/information/stain; applySocialRecord mutates honor/influence/stain | rank and information have no mutation rule; no class-switch or rank-up event |
| 9 | Items | [IN PROGRESS] | item() factory and buyMarketOffer; optional equipment state with normalize/equip/unequip; only equipped bonus items affect parseAction/resolveRoll (capped at +2); special document unlocks remain inventory-based; gear UI and regression tests exist | `exchange` item function has no consumer; remaining item semantics are not fully integrated across every function/category |
| 10 | World Calendar | [DONE] | advanceCampaignCalendar in applyRoll advances year/era/season/day/region/location; canonical timeline | — |
| 10a | Time of Day (segment) | [IN PROGRESS] | progression.segment typed (dawn/day/dusk/night); advanceClock called in applyRoll | No UI control; no downstream reducer consumes segment (no encounter difficulty modifier, no NPC schedule) |
| 11 | Relationships / NPC | [DONE] | 4 Saika contacts (gantaro, tokichi, masakichi, genshiro); captureRelationshipEvidence appends per-NPC events; RelationshipsView triggers trpc.relationships.analyzeDay; server persists to MySQL | No cross-contact gossip propagation; no player-authored blankSpace editor |
| 11a | NPC blankSpace | [IN PROGRESS] | Relationship.blankSpace is a BilingualText[] on each contact; foundation events carry blankSpace seed | No UI for the player to author blankSpace entries; AI does not yet read them back into the prompt |
| 12 | Rumors / News | [DONE] | Derived: deriveRumors in powerRumor.ts projects from worldSystems.powerRumor.events; news and witness memory kinds | No player-spread rumor mechanic; rumors are observer-side only |
| 13 | AI GM | [DONE] | trpc.gm.analyze (intent to stat/mastery/difficulty) + trpc.gm.resolve (roll result to narration/memory/missionDirective); engine-owned mergeAIAnalysis is the validation boundary; regression tests preserve the former UI merge behavior; 45s timeout, retries, schema validation, trial-credit accounting; Local Trial fallback | No streaming; no multi-turn memory beyond current input; no retry budget per campaign |
| 14 | Campaign Start | [DONE] | createGameState 7 eras x 10 paths; createSaikaSafehouseDemo demo start; server/starterProfiles.ts validates | No mid-campaign era transition; no in-campaign character respec |
| 15 | Save / Load | [DONE] | Home.tsx autosave on every state change; manual / Leaf II / Leaf III / campaign library; normalizeGameState handles schemaVersion migration; loadSave/writeSave/deleteSave/resetLocal wired | No Drive / cloud backup; no cross-device sync |
| 16 | Vitals / Blood / Focus | [DONE] | applyVitalDelta with clampVital(0..VITAL_CAP=10); vitalMaxes; levelUpVital; called from applyRoll | — |
| 17 | Progression / XP | [DONE] | awardPractice (mastery XP), awardStatPractice (trait XP), awardMilestonePoint, levelUpVital; mastery capped at level 5; trait XP curve 3/4/5/6 | growthPoints typed but no consuming reducer |
| 18 | Economy / Debt | [DONE] | buyMarketOffer mutates currency/inventory/obligations/transactions/routeStatus + faction event; season-driven market; eventFromDebt adds faction event; canUseObligation path; services are tracked separately in row 18c | No broader economy simulation beyond the listed ledgers and transitions |
| 18a | Obligations (Favor / Debt) | [DONE] | economy.obligations: Array<{id, kind: credit|debt|favor}>; buyMarketOffer + applyWorldEvent write to it; canUseObligation lets debt cover shortfall; memory kind favor/stain | No UI filter; no per-obligation expiry; no per-obligation AI narration hook |
| 18b | Heat (exposure) | [IN PROGRESS] | WorldSystemsFlags.scopedHeat declared; random-events.json domain heat; faction heat level surfaced via powerRumor summary | No per-faction heat reducer; no wanted-threshold consequence; no entanglement chain like Blades in the Dark (research only) |
| 18c | Services (Market Hands) | [DONE] | economy.services populated by buildSaikaEconomy; useMarketService validates service and availability, records a service ExchangeRecord and memory, closes availability; MarketHub exposes the action and Home routes updates through the campaign save flow; regression tests cover success and rejection | No service-specific gameplay effect beyond the established record, memory, and availability transition |
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
| 37 | Economic & Currency System (3-tier Mon) | [NOT FOUND] | no currency tiers (Copper Mon / Silver Monme / Gold Ryō), context-driven price model, barter, warifu, or regional economy in code; wallet/price is still single Mon (row 18); full design spec staged at shared/data/sengoku_economy_system.json | needs 3-tier wallet + auto-conversion, context price pipeline (domain/season/political/rumor), shop tier acceptance, barter + warifu, regional indices, and a legacy save migration adapter before implementation |
| 38 | Negotiation / Barter Conversation (Play UI) | [NOT FOUND] | no negotiate button or panel, no free-text offer, no direct barter, no NPC response states (accepted/counter/refused/suspicious/offended/interested), no offer preview, no negotiation dice check in Play; full design spec at docs/proposals/negotiation-barter-play-ui-th.md | needs negotiation panel in Play, direct barter, quick actions, NPC response states, optional dice/skill check with justification, and wiring to Economy System / NPC Memory / Reputation / Rumor before implementation |
| 39 | Player Attachment / Item Offering System | [NOT FOUND] | spec at docs/proposals/player-attachment-offering-th.md: player attaches Item/Resource/Information/Social/Intent via "+" on Play page; AI interprets intent → proposes → deterministic Engine validates → emits approved game facts (Story/Money/Relation/Event) → AI narrates; attachment status Pending→Consumed/rejected; one item can hit several systems without AI becoming the engine | no attachment layer, no "+/offer" UI on Play, no engine validator for offering; coupling: touches Inventory (row 9), Economy (row 18), Relationship (row 11), AI GM (row 13), Save (row 15); builds on row 9 Items (new — no existing code) |
| 40 | Sengoku Social Dynamics (Class-based NPC responses) | [IN PROGRESS] | org.facts exist: shared/sengokuSocialFacts.ts + shared/narrativeGoldenExamples.ts (class/authority/commoner scenes) already feed the AI GM prompt; Character.social carries rank/status; spec docs/proposals/sengoku-social-dynamics-th.md extends this into full class tables (Shogun→Hinin × male/female, cross-class bowing, context scenes, 15 golden rules) | full class table is not wired as a structured dataset; no per-class dialogue generator; class-aware responses rely on the prose fact cards rather than an explicit table; coupling: feeds row 13 AI GM, row 11 NPC/Relationship, row 38 negotiation, row 6 Faction |
| 41 | Rule-based Procedural Generation Framework | [IN PROGRESS] | the pattern already exists as the AI GM loop: World/State → server/gm.ts analyze/resolve → deterministic engine mergeAIAnalysis/validator clamps → GAME STATE; docs/proposals/rule-based-procedural-generation-th.md formalizes this into a reusable Content Contract + Validator for all content types | no shared framework module; each content path (gm, relationshipAnalyzer, timeline) hand-wires its own schema/validation; no generic "facts+rules+bounds → generator → validator" pipeline; coupling: umbrella over rows 4,5,6,9,11,12,13,14,20a,36,39,40 and the existing AI authority split |

> **คัดกรองระบบที่ส่งเข้ามา (duplicate audit):** สเปกหลายชุดใน docs/proposals/* ซ้ำกับฟังก์ชันที่ repository มีอยู่แล้ว จึงไม่ถูกเพิ่มเป็นระบบใหม่แยก — ถูกผนวกกลับเป็นสถานะ [IN PROGRESS]/หมายเหตุของระบบเดิมแทน:
> - Item System (Canonical) → **merge เข้า row 9 Items**: `ItemKind` (immediate/reserve/equipment/document/status/bond) + `InventoryCategory` (weapon/food/medicine/story/tool/status) + `InventoryItem{id,label,kind,category,functions,bonus,special,condition,...}` มีอยู่แล้วใน types; spec เหลือต้องทำให้ **immediate/reserve lifecycle** และ classifier/validator ใช้งานได้จริง (row 9 ยัง [IN PROGRESS])
> - Time System (3-layer + Activity Duration) → **merge เข้า row 10 World Calendar / row 10a Time of Day**: `TimeSegment`, `advanceClock`, `segments[]` มีอยู่แล้วใน engine; เหลือ dynamic activity duration, seasonal pressure, travel-as-activity, NPC schedule เสริมเข้าระบบเดิม
> - Starter Quest Pack (70 quests) → **merge เข้า row 7 Occupations / row 14 Campaign Start**: `STARTER_TEMPLATES`(10) × `STARTER_ERAS`(7) + `server/starterProfiles.ts` มีอยู่แล้ว; ไฟล์ spec เป็นการขยายเนื้อหา quest ให้ครบไม่ใช่ระบบใหม่
> - Random Event Post-Roll Presentation → **merge เข้า row 4 Random Events**: `pendingRandomEvent` + `maybeTriggerRandomEvent`(25%) + `RandomEventModal` + `applyRandomEventChoice` มีอยู่แล้ว; spec เดิม (โหมดอีเว้นสุ่ม...) ว่างเปล่า จึงไม่ใช่ feature ใหม่

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
- Item functions / bonus: equipped bonus and special unlock paths are consumed, but `exchange` has no consumer and item semantics are not complete
- Random event effects: accepted quest resolution is now wired, but working-tree grant/remove behavior still has unresolved failure semantics and no live data entries
- NPC blankSpace: type exists, no player editor, AI does not read it back
- Faction hostility / at-war: stance enum exists, no transition trigger
- Faction reputation: worldSystems.reputation[] written, no UI projection
- Heat: WorldSystemsFlags.scopedHeat declared, no per-faction reducer, no consequence chain
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
- Economic & Currency System: 3-tier Mon (copper/silver/gold), context-driven price model, barter, warifu (design JSON staged at shared/data/sengoku_economy_system.json)
- Negotiation / Barter Conversation (Play UI): no negotiate panel, free-text offer, direct barter, NPC response states, or negotiation dice check (spec at docs/proposals/negotiation-barter-play-ui-th.md)
- Item System (Canonical): merged into row 9 Items (types done, immediate/reserve lifecycle + classifier/validator pending) — spec at docs/proposals/item-system-canonical-th.md
- Player Attachment / Item Offering: "+" offering layer, engine validator, attachment statuses, AI interprets intent but engine commits (spec at docs/proposals/player-attachment-offering-th.md)
- Time System: merged into row 10/10a (segment/advanceClock exist; dynamic activity duration, seasonal pressure, travel/NPC-schedule pending) — spec at docs/proposals/time-system-core-th.md
- Sengoku Social Dynamics: class-based NPC response tables (partial via sengokuSocialFacts/golden examples; full table not wired) — spec at docs/proposals/sengoku-social-dynamics-th.md
- Rule-based Procedural Generation Framework: AI GM loop exists; shared Content Contract + Validator pending (spec at docs/proposals/rule-based-procedural-generation-th.md)
- Starter Quest Pack (70 quests): merged into row 7/14 (templates/eras exist; quest content expansion) — data at docs/proposals/starter-quests-70-th.md
- Random Event Post-Roll Presentation: merged into row 4 (pendingRandomEvent + RandomEventModal already implemented; no new feature)

---

## Next Steps (priority-ranked)

1. Complete the remaining InventoryItem function semantics, especially the `exchange` path, without changing the established equipped-item rule.
2. Finish and verify the random-event effects pipeline, including consistent failure handling for inventory removal and live data coverage for grant/remove effects.
3. Wire progression.segment (dawn/day/dusk/night) into a downstream reducer (encounter difficulty, NPC schedule) and add a UI control.
4. Add Character.social.rank and information mutation rules, tied to mission resolution or faction standing.
5. Open a blankSpace editor for the player and let the AI GM read it back into the next turn prompt.
6. Add a per-region event ledger so the AI knows what has happened in a region since the player last visited.
7. Refactor parseAction / AI analyze into a PlayerIntent layer so procedural content can be added without touching the deterministic engine.
8. Add a faction hostility / at-war state machine driven by event accumulation and scandal heat.
9. Project worldSystems.reputation[] into a UI view (per-faction stance, debt, fear) and feed it back into the AI prompt.
10. Add clearer obligation handling, starting with a UI filter and per-obligation expiry or AI narration hook.
11. Implement the Economic & Currency System overhaul per shared/data/sengoku_economy_system.json: 3-tier Mon wallet with auto-conversion, context prices (domain/season/political/rumor), shop tier acceptance, barter + warifu, and a legacy save migration adapter so existing single-Mon saves survive.
12. Implement the Negotiation / Barter Conversation UI in Play per docs/proposals/negotiation-barter-play-ui-th.md: a negotiation panel (NPC offer + player free-text/offer), direct barter, quick actions, offer preview, NPC response states, and an optional dice/skill check that shows its justification; wire to the Economy System, NPC Memory/Relationship, and Rumor when those exist.
13. **Foundation first — Rule-based Procedural Generation Framework** per docs/proposals/rule-based-procedural-generation-th.md: generalize the existing AI GM loop (server/gm.ts analyze/resolve → engine merge/validate) into a reusable Content Contract + Generation Rules + Validator 5-layer pipeline so rows 39/40 and the existing AI GM share one validated path (AI narrates, Engine commits). Rows that were merged (Item/Time/Quest/etc.) then slot into this framework.
14. Complete Item System (Canonical) as **part of row 9 Items** per docs/proposals/item-system-canonical-th.md: implement the immediate/reserve **lifecycle** (immediate = used now, never enters inventory; reserve = stored then consumed) and the Classifier→Validator→Approved layers on top of the existing ItemKind/InventoryCategory/InventoryItem types. Must finish before row 39 (Attachment) and rows 18/37 (economy barter) are [DONE].
15. Complete Time System as **part of row 10/10a** per docs/proposals/time-system-core-th.md: add the activity classifier + dynamic/contextual duration + seasonal pressure on top of the existing TimeSegment/advanceClock/calendar, so NPC schedule, market, and mission deadline react to time. Replaces the applyRoll-only segment advance (row 10a). Depends on row 3 Historical Timeline for "informs not forces".
16. Implement Player Attachment / Item Offering (**row 39**) per docs/proposals/player-attachment-offering-th.md: "+" offering UI on Play, engine validator, attachment statuses (Pending→Consumed/rejected), AI interprets but Engine commits. Depends on row 9 (item, via row 14 step) and rows 18/37 (economy).
17. Implement Sengoku Social Dynamics (**row 40**) per docs/proposals/sengoku-social-dynamics-th.md: extend sengokuSocialFacts + narrativeGoldenExamples into a structured class-table and wire it into the AI GM prompt + negotiation flow (row 38) so NPC responses feel class-aware. Feeds row 13 and row 38.
18. Expand the Starter Quest content as **part of row 7/14** using docs/proposals/starter-quests-70-th.md (70 quests over the existing STARTER_TEMPLATES × STARTER_ERAS), fed through row 41 so each quest stays canonical.
19. Random Event Post-Roll Presentation is already covered by row 4 (pendingRandomEvent + RandomEventModal); only add a richer presentation/flow as a minor enhancement to that existing system if needed.

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
| 0.3 | 2026-09-04 | Audited commits after 0.2: AI analysis merge moved into the deterministic engine with regression coverage; equipment state, normalization, equip/unequip, equipped-only bonus resolution, special-document handling, and gear UI were added; Market Services gained a reducer/action, campaign update path, UI, and tests. Kept Items and Random Event Effects [IN PROGRESS] where repository evidence shows remaining semantics or unresolved working-tree behavior. |
| 0.4 | 2026-09-04 | Added mandatory Push Protocol: every push must bump the version (new VERSION HISTORY row) and audit/update Core Systems, Current State, and Next Steps against the changes actually shipped in the pushed commits. Reinforced the Maintenance Rule with the Push Rule. No gameplay change in this version. |
| 0.5 | 2026-09-04 | Docs + staged design data: added Economic & Currency System Overhaul as planned row 37 [NOT FOUND]; placed the full economy design spec at shared/data/sengoku_economy_system.json (single-Mon display, hidden 3-tier backend, auto-conversion, barter/warifu, domain/season/political/rumor price factors); added to not-implemented list and Next Steps. No engine or gameplay change. |
| 0.6 | 2026-09-04 | Docs + staged design: added Negotiation / Barter Conversation (Play UI) as planned row 38 [NOT FOUND]; full spec stored at docs/proposals/negotiation-barter-play-ui-th.md (negotiation panel, direct barter, quick actions, offer preview, NPC response states, optional justified dice check, Economy integration). No engine or gameplay change. |
| 0.7 | 2026-09-04 | Docs + staged design (no engine/gameplay change): added a **Completeness Rule** to the Status Legend — a function is [DONE] only when (1) it is complete end-to-end, (2) it does not run together with another unfinished system (dependent systems must finish first), and (3) there is repository code+test evidence; staged full design specs for 7 new planned systems as rows 39-45 [NOT FOUND]: Item System (Canonical, category/kind/functions), Player Attachment / Item Offering, Time System (3-layer + dynamic duration + seasonal pressure), Sengoku Social Dynamics (class-based), Rule-based Procedural Generation Framework, Starter Quest Pack (70 quests), Random Event Post-Roll Presentation — each row and Next-Step records its cross-system dependencies. Spec files added under docs/proposals/. |
| 0.8 | 2026-09-04 | **Duplication audit** (docs-only, no gameplay change): re-checked every system staged in 0.7 against the live code. Removed rows that duplicated existing implementation and merged them back into owner systems — Item System (Canonical) → row 9 Items (ItemKind/InventoryCategory/InventoryItem types already exist); Time System → row 10/10a (TimeSegment/advanceClock exist); Starter Quest Pack → row 7/14 (STARTER_TEMPLATES × STARTER_ERAS + starterProfiles.ts exist); Random Event Post-Roll → row 4 (pendingRandomEvent + RandomEventModal already implemented). Re-marked as [IN PROGRESS] (not [NOT FOUND]) the systems that reuse existing code — Sengoku Social Dynamics (sengokuSocialFacts/golden examples feed AI GM) and Rule-based Procedural Generation Framework (AI GM loop exists). Kept Player Attachment / Item Offering as the only genuinely new row 39 [NOT FOUND]. Table now 38 → 41 rows; Next Steps rewritten; duplicate-audit note added. |
| 0.9 | 2026-09-04 | **Staged event data** (no engine/gameplay change): added two preliminary event pools as pending data under shared/data/ — sengoku_45_universal_events.json (45 events; duplicate content of random-events.json with corrected Thai, 44/45 ids share) and sengoku_random_events_pool.json (8 events, mostly new ids). Not imported into runtime; row 4 (Random Events) now records these as staged-not-merged and flags that live random-events.json has corrupted Thai encoding needing a merge/encoding + de-dup pass. |
| 0.10 | 2026-09-04 | Docs + first full push of the 0.5-0.9 day. Added a day summary at docs/SUMMARY-2026-09-04.md (type check pass + 44 files / 252 tests pass). Pushed the accumulated docs/proposals specs, shared/data design/staged JSON, roadmap rows 37-41 [completeness rule + duplicate audit], and the pre-existing working-tree random-event-effects changes (row 4a still [IN PROGRESS] pending verification). No gameplay rules changed. |

> Maintenance Rule: At the end of every task or version, audit PROJECT_ROADMAP.md against the actual repository state. Update statuses and notes when needed. Never erase previous version history. Always append a new version-history row. Never declare a system DONE before its full implementation loop (reducer + persistence + projection) is in place.
>
> Push Rule (see Push Protocol above): no commit series may be pushed without (a) a new VERSION HISTORY row and (b) a status audit of every system touched by the pushed commits. Enforced as of version 0.4.
