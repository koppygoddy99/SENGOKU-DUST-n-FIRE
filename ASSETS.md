# Dust & Fire — Assets

**Art direction:** Original paper-and-ink tabletop interface for a Sengoku historical novel. Use warm ivory washi paper, ink navy, controlled vermilion seals, muted teal confirmation states, light woodblock borders, sumi-e mountains, rivers, coastlines, and carefully bounded empty space. Assets must contain **no people, portraits, character silhouettes, real clan crests, or copied reference arrangements**.

## Visual Target

`/manus-storage/dust-fire-tabletop-ui-reset-visual-target_fcb917b6.png` is the visual target for the UI reset. It defines only the intended material mood and hierarchy: an original parchment situation map, current-location seal, routes and fog, an indigo-lined walnut dice tray, calm prose surface, and compact semantic state marks. It must never be stretched as a production background or used as a source of baked UI text.

## P0 Backgrounds

| Name | Description | Size | Managed image | Status |
|---|---|---|---|---|
| UI reset visual target | Original command-desk composition: parchment map, fog, routes, vermilion current-location seal, indigo dice tray, prose sheet, and compact state surfaces. It contains no readable UI copy or people. | 1280×720 px reference; used as a visual QA target, never stretched as an app background. | `/manus-storage/dust-fire-tabletop-ui-reset-visual-target_fcb917b6.png` | generating |

## P0 Procedural UI Layers

| Name | Description | Display size | Delivery approach | Status |
|---|---|---:|---|---|
| Parchment map surface | Warm paper field behind dynamic geography and markers. | fills Story Map panel; minimum 420×320 px desktop | CSS layered gradients and paper grain | planned |
| Sumi-e terrain wash | Low-contrast mountains, river, coast, and tree silhouettes that never obscure map data. | 100% of map panel | original generated asset only if CSS surface is insufficient | planned |
| Dice tray | Tactile walnut and indigo visual anchor for last/current roll. | 260×190 px desktop; 100% width mobile | semantic HTML/CSS; dice values remain text | planned |
| Pin, route, fog, and war layers | Current place, mission, memory, known route, unknown route, and war-pressure states. | 16–32 px markers; responsive routes | HTML/CSS + existing icon system, derived from `GameState` | planned |
| Mission seals and memory marks | Symbolic, keyboard-accessible state signals. | 18–24 px | existing icon system + CSS | planned |

## Asset Constraints

1. Store generated source files under `/home/ubuntu/webdev-static-assets/` and reference only the managed URL in the application.
2. Use HTML text for every player-readable label; do not bake required UI wording into art.
3. Render map markers, routes, fog, and war pressure as dynamic UI layers so they can be derived from `GameState`.
4. Respect `prefers-reduced-motion`; dice visual behavior cannot determine the engine result.
