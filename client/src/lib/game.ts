/**
 * Dust & Fire game-state contract.
 *
 * Ledger of Ash reminder: the player sees consequences, sources, and choices—not hidden intent.
 *
 * This file is now a thin re-export barrel. The implementation lives under `./game/`
 * (types, constants, engine, state). Keeping this exact path lets all existing
 * consumers keep their imports unchanged.
 */
export * from "./game/index";
