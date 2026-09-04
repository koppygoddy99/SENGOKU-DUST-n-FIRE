---
name: ui-implementation
description: Implement UI changes in the SENGOKU-DUST-n-FIRE client while preserving gameplay authority. Use when adding or changing pages, feature views, panels, styling, or UI interactions that display or request game state. Complements the `.clinerules/` contract and the other skills; does not replace them.
---

# UI Implementation

A practical flow for UI work after investigation. Follow these as authority:

- `.clinerules/00-project-rules.md` — project contract and roadmap gate.
- `.clinerules/10-architecture.md` — UI projection rows (client shell, play flow, UI projections).
- `.clinerules/20-gameplay-safety.md` — gameplay decisions stay out of UI.
- `.clinerules/skills/repo-investigation/SKILL.md` — investigate before implementing.
- `.clinerules/skills/gameplay-implementation/SKILL.md` — when the UI work requires gameplay changes.
- `.clinerules/skills/testing-verification/SKILL.md` — verify after implementing.

## Core Principle

**UI PRESENTS GAME STATE. UI DOES NOT INVENT OR AUTHORITATIVELY CONTROL GAMEPLAY.**

## Actual Client Architecture (evidence-based)

- React + Vite SPA. `client/src/pages/Home.tsx` owns the top-level campaign
  `GameState` object, page selection, Local Save/Load, language, and composes
  feature views.
- Feature views live in `client/src/features/<area>/` (`play`, `story`,
  `chronicle`, `relationships`, `powerRumor`, `management`, `navigation`,
  `shared`). They receive the current game object plus callbacks (e.g.
  `onUpdate`, `onOpen`) and never own campaign state. Some pages
  (`MarketHub.tsx`) also take `game` + `onUpdate` props.
- Styling: Tailwind CSS v4 plus Radix-based primitives in
  `client/src/components/ui/` (shadcn-style) and `lucide-react` icons. Feature
  styling is largely co-located plain CSS files using CSS variables from
  `client/src/index.css` (`--paper`, `--ink`, `--rule`, theme-dark /
  font-small variants).
- Bilingual EN/TH: `label(language, en, th)` helpers and
  `client/src/lib/localization.ts` (auto-generated catalog; an i18n check
  script exists — new user-facing strings must go through the existing
  localization path).
- Tests: component/page tests co-located (`*.test.tsx`), browser flows under
  `tests/` and `scripts/*.mjs`; views use `data-testid` attributes and
  `role`/`aria-live` for status regions.

## UI Implementation Flow

1. **Identify the exact UI task and scope.** Distinguish presentation-only work
   from work that implies a gameplay change.
2. **Investigate the existing UI first** (repo-investigation skill). Find the
   component/page/panel that should own the change; extend it rather than
   creating a parallel view.
3. **Identify where the displayed data actually comes from.** Trace the prop or
   projection back to its source in `GameState` or an existing derived
   projection. If the value does not exist in state, that is a gameplay gap —
   not something the UI can fabricate.
4. **Reuse existing components, patterns, hooks, and styling conventions.** Use
   the existing `components/ui` primitives, CSS variables, `label()` bilingual
   pattern, and existing test id conventions. Do not introduce new styling or
   state-management systems for one change.
5. **Keep presentation separate from gameplay authority.** UI may format,
   filter, and sort displayed values, but must not compute rules, roll results,
   costs, requirements, or outcomes. Interactions call the existing validated
   game functions / callbacks (`parseAction`, `resolveRoll`, `applyRoll`,
   `onUpdate`, existing core/state APIs) — never mutate gameplay state directly
   in the component.
6. **Avoid unnecessary new state.** Do not duplicate game state, caches, or
   derived values inside UI state when the existing source exists. UI-local
   state is acceptable only for true presentation concerns (open/closed, focus,
   input drafts).
7. **Do not create fake gameplay state, placeholder data, or stub values** that
   could be mistaken for real gameplay data. Empty data must render as empty.

## States and Interaction

- **Displaying state:** render from the passed game object/projections; keep
  the traceability of mechanical facts (do not hide what the game exposes).
- **User interaction:** wire to existing game APIs/callbacks; await the
  parent's state update; never apply outcomes locally.
- **Loading/empty/error:** follow the existing patterns (`DeferredViewFallback`
  suspense fallback, `role="status"` / `aria-live` regions, connection-lock for
  offline). Empty lists render honest empty states, not invented content.
- **Visual changes:** inspect the existing styles first, make the smallest
  appropriate change, do not redesign unrelated UI, and preserve existing
  behavior unless explicitly requested.

## When the UI Needs an Undefined Gameplay Rule — Stop

If the requested UI requires a value, rule, cost, requirement, or outcome that
neither the repository nor the user defines, the UI cannot supply it:

- **STOP. Do not guess. Do not hardcode a placeholder rule.**

  `BLOCKED — GAMEPLAY DECISION REQUIRED`

- State what UI value is missing, where it would be needed, the repository
  evidence inspected, and exactly what decision is needed from the user. If the
  UI work is presentation-only and the gameplay change is separately defined,
  implement via the gameplay-implementation skill and then wire the UI.

## Verification

- Render through the existing application path (the component's real props
  from real state / existing demo starters used by tests), not an ad-hoc
  invented fixture of gameplay state.
- Run the co-located component/page tests and any affected browser flow;
  follow the testing-verification skill for the full checklist.
- Inspect the final diff; confirm no unrelated files changed and no gameplay
  authority moved into UI (no rule math, no direct state mutation, no fake
  gameplay data).
- Follow the existing roadmap audit workflow before considering the task done.