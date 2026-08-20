# Dust & Fire — Implementation Plan

## Product Boundary

**Dust & Fire: Sengoku Stories** remains a **single-player, local-first interactive historical novel**. The current React application already owns the deterministic 2d12 engine, Local Save, AI-assisted narration contract, Local Trial fallback, and campaign data. This plan upgrades the experience around those real systems; it does not replace the game with a 3D action game or introduce multiplayer.

The governing product statement is: **the player declares intent, the rules calculate risk, the dice decide the outcome, and the world records the cost.**

## Source of Truth

The implementation follows the user-provided `01_Integrated_Core_Game_and_UXUI_Spec_TH.md` and `02_Master_UXUI_Spec_TH.md`. The supplied images are visual references for paper, ink, tabletop, map, and chronicle mood only. No reference layout, text, crest, or artwork is copied directly.

## Delivery Sequence

- [x] Audit the existing 2d12, Local Save, AI GM fallback, campaign, market, and Chronicle contracts.
- [x] Create a source-of-truth design extraction and architecture plan.
- [ ] Extract navigation vocabulary into Story, Prepare, Chronicle, and More while preserving all existing destinations.
- [ ] Extract `StoryMap` and supporting derived campaign-map data from `Home.tsx`.
  - **Assets:** Story Map visual target (`/manus-storage/dust_fire_story_map_visual_target_962e1c62.png`) is the QA composition reference; use semantic CSS layers for all live map state.
- [ ] Extract `PlayScene` and its roll flow from `Home.tsx`, without changing deterministic roll authority.
  - **Assets:** CSS dice tray and semantic result text; no generated people or text-bearing asset is required.
- [ ] Implement the P0 player journey: Story Map → Play Scene → preview → roll → consequence → autosave → Story Map/Chronicle.
- [ ] Add original paper-and-ink visual assets and use them through managed web assets.
- [ ] Add P1 action loops only where GameState has real transitions: market purchase/guarantee first; services, gear, and debt remain explicitly planning-only until their rules exist.
- [ ] Add Story Map and Play Scene regression coverage, visual review, checkpoint, and user-directed refinement.

## P0 Acceptance Criteria

1. An active campaign opens to **Story Map / Campaign Command**, where current place, active mission, last roll, pressure, and actionable resource state can be read at a glance.
2. `Continue Story` opens the live scene, not a disconnected mock screen.
3. The player may type one sentence or insert a possible approach, then receive a plain-language risk preview before committing.
4. Detailed Axis, Mastery, Gear, Context, and DN remain inspectable before rolling but are not required before declaring intent.
5. 2d12 results continue to originate in `resolveRoll()` and only become permanent through `applyRoll()`.
6. Local Trial saves a resolved roll, Leaf, scene, and campaign state without deducting AI credit when AI is unavailable.
7. The result presents mechanical outcome, narrative outcome, and traceable world change separately.

## Explicit Non-Goals for This Slice

This slice does not promise cloud synchronization, multiplayer, player parties, travel simulation, a complete mission chain engine, item consumption, equipment slots, service hiring, debt settlement, or a historically exhaustive map. Where these loops do not yet exist in `GameState`, the UI must say **Planning record** rather than mimic a working control.
