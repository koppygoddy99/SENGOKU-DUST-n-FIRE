# Dust & Fire — Module Structure

## Ownership Rule

`client/src/lib/game.ts` owns deterministic rules and normalized `GameState`. Feature components may request a state transition but never calculate a roll result, alter a transaction record by hand, or overwrite Local Save independently. `Home.tsx` remains the application shell only: restoration, persistence, top-level routing, and cross-feature navigation.

## Target File Boundaries

```text
client/src/
├── features/
│   ├── story/
│   │   ├── StoryMap.tsx              # Campaign Command / current world pressure
│   │   ├── StoryMap.test.tsx         # derived map and navigation regression
│   │   ├── storyMapData.ts            # pure GameState → map markers/state cards
│   │   └── storyMap.css               # Story Map-only visual rules
│   ├── play/
│   │   ├── PlayScene.tsx              # scene → action → risk → roll → outcome flow
│   │   ├── PlayScene.test.tsx         # interaction and Local Trial fallback
│   │   ├── RollPreview.tsx            # inspectable rule interpretation
│   │   ├── OutcomeCard.tsx            # mechanic, story, and world-result layers
│   │   └── playScene.css              # Play-only visual rules
│   ├── chronicle/
│   │   ├── ChronicleView.tsx          # later extraction of Reader/Normal Log
│   │   └── chronicleData.ts            # event/memory projections
│   └── navigation/
│       ├── CampaignNavigation.tsx     # Story / Prepare / Chronicle / More groups
│       └── navigation.ts               # Page ids, group definitions, labels
├── lib/
│   ├── game.ts                        # existing rules authority
│   └── gameEvents.ts                  # future typed event derivation, not required for P0
└── pages/
    ├── Home.tsx                       # shell, Local Save, active page selection
    └── MarketHub.tsx                  # existing Prepare ledger module
```

## Data Flow

```text
Local Save → normalizeGameState → Home state
                                  ↓
                StoryMap / PlayScene / Prepare / Chronicle
                                  ↓
                      user intent or explicit action
                                  ↓
          parseAction → resolveRoll → applyRoll / buyMarketOffer
                                  ↓
                Home.updateGame → Local Save + Campaign Library
```

## Module Contracts

| Module | Reads | May request | Must not do |
|---|---|---|---|
| `StoryMap` | `GameState`, language | `open("play")`, `open("missions")`, `open("archive")` | invent a route, mission, memory, or map discovery |
| `PlayScene` | `GameState`, engine/auth status | `onUpdate(nextGame, notice)` | compute random results outside `resolveRoll()` |
| `RollPreview` | `RollPreview`, character vitals | preview/cancel/resolve callbacks | alter `GameState` directly |
| `OutcomeCard` | resolved roll + current state | continue/map/chronicle navigation | narrate or mutate unrecorded consequences |
| `MarketHub` | economy/inventory state | `buyMarketOffer()` transition | show service/debt buttons as real actions until loops exist |
| `ChronicleView` | rolls/memories/history | reader/filter navigation | write to campaign state |

## Story Map Data Model (P0)

`StoryMap` derives all visuals from existing campaign state; it introduces no speculative travel schema.

```ts
type StoryMapModel = {
  currentPlace: { name: string; region: string; label: string };
  pins: Array<{ id: string; kind: "current" | "mission" | "memory" | "pressure"; label: string; state: "active" | "recorded" | "fogged" }>;
  routes: Array<{ id: string; label: string; status: "known" | "fogged" | "pressured" }>;
  activeMission?: { title: string; issuer: string; deadline: string; pressure: string };
  lastRoll?: { tick: number; summary: string; outcome: string; total: number; difficulty: number };
  pulses: Array<{ id: string; kind: string; text: string; tone: string }>;
};
```

`storyMapData.ts` maps `currentScene.location`, active mission, recent memories, `campaign.warShadow`, and current season into this model. A location is not represented as historical fact unless the existing Historical Boundary marks it as supported.

