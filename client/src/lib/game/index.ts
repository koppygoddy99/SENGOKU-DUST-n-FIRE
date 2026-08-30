/**
 * Game engine barrel.
 *
 * Re-exports everything from the refactored game modules so that existing
 * consumers (`@/lib/game`, `./game`, relative imports) keep resolving through
 * the same path. This file is the single public entry point of the engine.
 */
export * from "./core";