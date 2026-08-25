import { createSaikaSafehouseDemo, type GameState } from "./game";
import type { ReviewSeedId } from "./playerRoutes";

/**
 * A review capture must never depend on a previous browser session. These
 * seeds deliberately reuse only deterministic fixture data already supported
 * by the game engine; individual pages select their tab/view through routes.
 */
export function buildReviewSeed(seed: ReviewSeedId): GameState {
  const game = createSaikaSafehouseDemo();

  switch (seed) {
    case "new-campaign-step-one":
      return game;
    case "saika-library":
    case "saika-command":
    case "saika-pre-roll":
    case "saika-missions":
    case "saika-gear":
    case "saika-market":
    case "saika-services":
    case "saika-obligations":
    case "saika-exchanges":
    case "saika-character":
    case "saika-chronicle":
    case "saika-relationships":
    case "saika-archive":
    case "saika-safekeeping":
    case "saika-load":
    case "saika-settings":
      return game;
  }
}
