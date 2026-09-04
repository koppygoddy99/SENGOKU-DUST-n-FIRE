# Standard Cline Workflow

Follow this sequence for implementation tasks:

```
TASK
↓
Understand exact scope
↓
Find relevant repository area
↓
Search relevant symbols
↓
Find existing implementation
↓
Inspect callers / dependencies
↓
Inspect relevant tests
↓
Determine smallest safe change
↓
Implement
↓
Run targeted verification
↓
Inspect git diff
↓
Check unintended changes
↓
Audit roadmap when applicable
↓
Report result
```

## Operating Rules

- Work on one task at a time.
- Do not silently expand scope. Stop and explain if work outside the expected area is required.
- Search before creating a file, system, route, reducer, component, or test.
- Prefer extending an existing API and preserve the current execution path.
- Do not rewrite working systems unnecessarily.
- Do not repeatedly reread unchanged files or repeatedly rediscover repository structure.
- Start with directly relevant files and follow imports/callers only as far as needed to establish the actual path.
- If repository evidence conflicts with the task, stop and report the conflict.
- If a gameplay decision is missing, stop with `BLOCKED — GAMEPLAY DECISION REQUIRED` and ask the user.
- Never declare a roadmap system `[DONE]` without repository evidence for the applicable complete loop.
- Do not modify unrelated working-tree files.
- Do not commit or push unless explicitly requested.

## Completion Checks

Before reporting completion: run relevant targeted tests/checks and type checking
when available; inspect the complete diff; run `git diff --check`; verify no
unintended files changed; and audit `PROJECT_ROADMAP.md` when implementation status
or evidence may be affected. Update the roadmap and append a VERSION HISTORY row
only when the implementation changes roadmap reality.