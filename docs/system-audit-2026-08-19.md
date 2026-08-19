# Dust & Fire: Sengoku Stories — System Audit

**Audit date:** 19 August 2026  
**Scope:** The current browser UI, deterministic local game loop, Local Save, tRPC API contracts, database schema, and a time-boxed AI GM smoke test. This is a source-and-runtime audit of the active prototype, not a claim that every planned game system is production-complete.

## Executive status

> **Verdict:** The project is a playable, local-first **vertical slice** of Dust & Fire rather than a complete long-form tabletop RPG platform. A player can create or load a campaign, write one action, receive a deterministic 2d12 interpretation and consequence, retain the narrative in a log, use local saves, inspect the character and campaign records, and make selected market exchanges. The UI is substantially ahead of the systemic simulation and server persistence.

| Area | Status | What a player can do now | Important boundary |
|---|---|---|---|
| Campaign UI | Working | Select campaigns, open Campaign Overview, navigate campaign submenus, create a new campaign | Campaign Overview is now directly accessible beneath the campaign name and before Campaign Log |
| Character creation | Working | Choose from ten starting paths or a freeform occupation; answer six relationship questions | No post-creation character editing or advancement loop yet |
| Scene play and 2d12 | Working locally | Enter one sentence, assess risk, analyze locally, roll 2d12, spend Momentum, receive a consequence, continue the scene | The local parser is keyword-driven rather than a full contextual rules adjudicator |
| Narrative and Log | Working locally | Read opening prose, post-roll scenes, Campaign Log search, and Reader Mode | Local narration follows a limited reusable structure when AI GM is unavailable |
| Mission ledger | Partially working | Accept an offered mission and return to Play through its options | Resolution currently updates the first mission in the list; mission chains, rewards, expiry, and branching are not fully simulated |
| Market & gear | Partially working | Inspect five ledgers, buy offers, record transactions, and take one safehouse-guaranteed medicine debt | Services, favor repayment, debt settlement, item consumption, and stock refresh are display/data-led rather than complete action loops |
| Local Save | Working | Auto-save current state, use three manual slots, restore campaigns, and retain settings in this browser | No cross-device sync, export/import, conflict handling, or server backup |
| Settings and language | Working | Toggle English/Thai, text size, dark mode, accent, Reader Mode, and reset Local Save | Some campaign content remains authored primarily in Thai; translation is not yet exhaustive at every generated/stateful field |
| Authentication and credits | Backend implemented, UI disabled in Preview | Authenticated endpoints can read and atomically spend per-account trial credits | The shipped interface currently forces UI Preview, so account-credit queries and login affordances are intentionally not active |
| AI GM | Contract implemented; provider unavailable in this audit | Protected analyze/resolve endpoints, structured schemas, historical fences, and 45-second abort guards exist | Live smoke returned **412 usage exhausted** after retries, so live narration is unavailable at present |

## Player-facing UI inventory

The following screens are present and reachable from the current Sidebar.

| Menu or page | Current function | Implementation status |
|---|---|---|
| Campaigns | Lists locally stored campaigns and loads one | Working |
| Current campaign name | Expands or collapses campaign navigation | Working |
| Play | One-sentence action, risk analysis, local roll, scene continuation | Working in Local Trial |
| Missions | Shows issuer, deadline, reward, risk, options, and acceptance | Partially working |
| Market & gear | Parent menu containing five ledgers | Working as an information and selected-purchase hub |
| Carried gear | Shows items, slots, ownership, and location | Display-only except automatic bonuses recognized by the parser |
| This market | Displays local offers, price reasons, and selected purchases | Working for offers that have purchase rules |
| Services & hands | Displays local service people, conditions, time cost, and witness risk | Display-only; no contracting action yet |
| Credit, debts & favors | Displays open obligations and witnesses | Display-only except the safehouse medicine credit flow |
| Exchange history | Shows purchases, debts, favors, and consequences | Working when a supported exchange occurs |
| Character | Shows axes, masteries, gear, ties, vitals, and social record | Working as a dossier |
| Campaign Overview | Returns to the Campaign Record screen shown on the homepage | Working; placed before Campaign Log |
| Campaign Log | Shows local narrative and Reader Mode | Working |
| World Archive | Projects known people, mission pressure, community state, and memories | Working as a current-state summary, not a research database browser |
| Save / Load | Auto-save and three local leaves | Working in browser storage |
| Settings | Local presentation and language controls | Working |

## Core rules: what is truly simulated

The deterministic local game loop is the reliable core while AI service is unavailable. It chooses a five-axis action approach using Thai keyword matches, selects the most relevant mastery, applies a usable item bonus when tags match, assigns one of four difficulty tiers, rolls **2d12**, applies an optional Momentum bonus, and produces one of four outcomes. It writes the roll, consequence, memory, scene, and current Leaf into `GameState` before Local Save persists the state.

The current model stores the following major concepts: character axes and masteries; wounds, Focus, Momentum; social values; property, supplies, credit; inventory condition/location/ownership; relationship pulls; campaign year and season; community values; mission records; market offers; services; obligations; exchange records; memories; historical boundaries; scene state; and roll history.

### Core systems that are stored but not fully governed yet

| Stored system | Current automatic behavior | Missing rule loop needed for a full campaign game |
|---|---|---|
| Wounds and Focus | Displayed in character and Sidebar | Healing, impairment, thresholds, treatment duration, and consequences in rolls |
| Supplies and community | Stored and shown in selected summaries | Consumption, replenishment, seasonal pressures, and changes from player choices |
| Honor, influence, information, stain | Stain changes on failure; information changes on partial success | Social access checks, faction reactions, reputation decay, and concrete consequences |
| Inventory | Item bonuses can be chosen automatically by the local parser; purchases add goods | Player-directed use, consumption, damage/repair, equipment state, transfer, storage, capacity enforcement |
| Missions | Offer can become active; first mission changes state after a roll | Multiple active missions, specific objective progress, expiry, rewards, and issuer reactions |
| Economy and obligations | Purchases and the medicine credit flow create records | Service hiring, credit spending, favor calls, debt settlement, counteroffers, availability refresh, witnesses affecting future scenes |
| World archive | Mirrors current scene and memories | Historical timelines, place-specific knowledge, NPC roster, discovered facts, and searchable sources |

## Backend audit and two-minute rule

The server currently exposes three functional concerns: authentication, AI GM, and account trial-credit records. The database schema currently contains a `users` table with OAuth identity fields and `trialCredits`; it does **not** contain campaign, save, scene, mission, market, inventory, or log tables. All game-state persistence remains intentionally local to the browser.

| Backend path | Inspection result | Audit result |
|---|---|---|
| `profile.credits` | Authenticated tRPC query calls the database helper | Implemented contract |
| `profile.spendCredit` | Atomic transaction decreases only the authenticated user’s balance if sufficient | Implemented contract |
| `gm.analyze` | Protected tRPC mutation checks credits then calls structured AI analysis | Implemented contract, unavailable from provider during this audit |
| `gm.resolve` | Protected tRPC mutation checks credits then calls structured AI narration | Implemented contract, unavailable from provider during this audit |
| AI timeout guard | Server aborts a provider operation after 45 seconds | Implemented and below the user’s two-minute ceiling |
| AI live smoke | Existing neutral smoke script executed with a 110-second hard ceiling | Failed fast with provider response `412 Precondition Failed: your account has hit a usage exhausted` |
| Local Save | Browser `localStorage` reads/writes game, campaign library, saves, and settings | Working, intentionally frontend-only |

The live provider failure did not consume more than two minutes. In response, the UI is explicitly operated as **Local Trial / กรอกทดลองในเครื่อง**: it analyzes and resolves actions using the deterministic local rules, writes the result to Local Save, and does **not** reduce AI credits. This is the correct active mode until AI service capacity is available again.

## Fallback behavior now in place

1. **UI Preview is Local Trial.** The player can enter the same one-sentence action, inspect the deterministic analysis, roll, read a narrative consequence, save, load, and review the log without a provider call.
2. **No AI-credit charge in Local Trial.** Local resolution preserves the displayed AI-credit count.
3. **Provider error fallback.** When the AI path is enabled in a future configuration but the provider fails, the deterministic result is saved locally and the player is told that no AI credit was used.
4. **No hidden wait.** AI server calls are guarded at 45 seconds; the time-boxed audit observed a provider-capacity failure before the 110-second smoke ceiling.

## Completion assessment against the original core

The original design emphasis—one-sentence player input, 2d12 resolution, honor/status/social pressure, historical boundaries, local-first saves, rich narrative logs, and a multi-ledger market—is present as a playable vertical slice. It is **not yet complete** as a sustained campaign engine because the stored systems do not all drive each other automatically, and there is no server-backed campaign persistence or live AI GM capacity in the active environment.

The recommended next implementation order is to complete **mission progress and consequences**, then **inventory/service/debt actions**, then **world timeline and NPC state**, and only after that consider server persistence for cross-device saves. AI GM should remain optional enhancement rather than a dependency for the core loop.

## Verification evidence

The project includes unit, router, UI-preview, local-flow, navigation, historical-boundary, narrative, Saika-demo, and Market Hub regressions. The Local Trial flow specifically verifies a local roll without AI mutation or account-credit mutation. An AI-enabled UI regression now also mocks `resolveGM.onError`, verifies the fallback message, confirms no AI-credit mutation, and confirms the resulting Leaf and roll were written to Local Save. After this update, the full suite passed: **13 test files and 47 tests**, followed by a successful TypeScript check.
