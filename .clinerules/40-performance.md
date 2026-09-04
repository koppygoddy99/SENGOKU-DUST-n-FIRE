# Investigation Performance Rules

## Core Principle

**SEARCH FIRST, READ SECOND.** Reduce unnecessary context consumption and file
I/O without reducing correctness.

## Rules

1. Start from files directly relevant to the task.
2. Search exact function names, types, components, reducers, state fields, tests, routes, imports, and callers before opening large files.
3. Read the relevant section first; expand to surrounding definitions only when needed.
4. Follow the actual execution path — caller, dependency, state transition, persistence, projection, test — only as far as necessary.
5. Do not read unrelated systems for completeness.
6. Do not repeatedly open the same unchanged file.
7. Reuse evidence already collected during the current task.
8. Do not repeatedly rediscover repository structure.
9. Avoid generated files, dependencies, build output, and unrelated assets unless the task requires them.
10. Prefer targeted tests/checks when they sufficiently cover the affected path; use broader checks when risk or repository conventions require them.
11. Expand investigation gradually when evidence is insufficient.
12. Never trade correctness, gameplay safety, or complete execution-path understanding for speed.
13. If uncertain, inspect more evidence rather than guessing.

## High-Value Search Targets

Search for:

- the requested symbol and its definitions;
- all imports and callers;
- `GameState` fields and state-transition functions;
- reducers/engine functions and persistence/normalization paths;
- routes and the client/server boundary;
- nearby unit, integration, UI, and browser tests;
- `PROJECT_ROADMAP.md` references and documented source-of-truth rules.

## Performance Goal

Minimize unnecessary context consumption and file reading while preserving a
complete, evidence-backed understanding of the affected execution path and its tests.