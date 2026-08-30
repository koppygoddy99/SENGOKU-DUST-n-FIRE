/**
 * Game engine barrel.
 *
 * Explicitly re-exports each public sub-module so the engine's public surface
 * is defined here in one place, rather than relying on core.ts to re-export the
 * sibling modules. Existing consumers (`@/lib/game`, `./game`, relative imports)
 * keep resolving through the same path. This file is the single public entry
 * point of the engine.
 */
export * from "./types";
export * from "./engine";
export * from "./state";
export * from "./data";
export * from "./core";
