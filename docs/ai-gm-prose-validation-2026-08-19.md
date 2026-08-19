# AI GM prose validation — 2026-08-19

## Implemented baseline

The AI GM resolution contract now requires exactly three prose paragraphs. Each paragraph is constrained to 120–1,100 characters. The prompt requires a concrete sensory or physical opening, an NPC reaction or earned line of dialogue, and a tangible consequence leading to a specific next pressure. It prohibits dice, game rules, AI terminology, generic transitions, and invented historical specifics outside the curated brief.

The local opening scene and deterministic fallback now follow the same three-paragraph pattern. The opening is persisted as the first campaign memory. Resolved AI narration is joined into the roll record so Campaign Log and Reader Mode retain the actual full scene rather than a one-line summary.

## Validation passed

| Check | Result |
|---|---|
| AI GM contract and fixture quality | Passed: three substantial paragraphs and three next choices |
| Local opening narrative | Passed: three paragraphs, each at least 250 characters |
| Local post-roll fallback | Passed: three paragraphs, each at least 120 characters |
| Reader paragraph separation | Passed |
| Full test suite | Passed: 30 tests |
| TypeScript and production build | Passed |

## Live-model status

The live smoke script was attempted on 2026-08-19. It produced no model response after 90 seconds and was stopped. A 45-second server-side time limit now sends the existing UI fallback path instead of leaving a player waiting indefinitely. The quality of the revised prompt with a live response is therefore still pending a successful provider response.
