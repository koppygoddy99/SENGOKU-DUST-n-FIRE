# Dust & Fire — Working Memory

## Immutable Gameplay Decisions

- Game title: **Dust & Fire: Sengoku Stories**.
- Product is single-player, one character and one campaign at a time.
- The player writes a single-sentence action. The system selects rules; the player does not choose a skill before declaring intent.
- `resolveRoll()` is deterministic 2d12 authority. `applyRoll()` is the state mutation authority for roll outcomes.
- Momentum is offered after a roll result is visible in the target design; it grants +2 at a cost of one Momentum.
- Failure advances the situation and must never stop the campaign.
- AI narration is assistive, never authoritative for totals, margin, outcome, credits, or resources.
- Local Trial is a continuity fallback. It saves game state and does not consume AI credit.
- Historical boundary has only: `fact-supported`, `contextual-play`, `campaign-fiction`, and `insufficient-evidence`.
- Local browser save is primary storage. Any screen must survive normalized legacy saves that lack newly added economy fields.

## Current Working State

- The project is React + TypeScript + Tailwind + Express/tRPC.
- `Home.tsx` currently owns top-level state, campaign navigation, Story Overview, Play Scene, Chronicle, Save/Load, and settings; it is intentionally the first extraction target.
- `MarketHub.tsx` already owns Gear, Market, Services, Obligations, and Exchange History tabs. Services and obligations are planning ledgers until real rules exist.
- `normalizeGameState()` migrates legacy saves so Market Hub does not crash when `economy` is missing.
- The live AI provider was unavailable during audit because of usage exhaustion. Local Trial fallback has UI and localStorage regressions.

## User-Supplied Reference Rules

- Reference visuals establish: warm paper, dark ink, restrained vermilion, sumi-e washes, tabletop dice, editorial whitespace, and map/chronicle navigation.
- Do not clone reference layouts, logos, crests, screens, or art.
- Do not generate or use people/portraits in new assets. Narrative and map imagery must remain people-free.
- UI design must serve readable narrative text first; art remains subordinate to playing and reading.

