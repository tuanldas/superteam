---
name: atomic-commits
description: >
  Use when writing code that will be committed. Enforces task-atomic commit
  granularity, conventional message format, independent revertability,
  and parallel-safe git operations. Auto-triggered by execute, quick, tdd, phase-execute.
---

# Atomic Commits

## Overview

Atomic Commits ensures every commit is a single, complete, independently revertable unit of work. It prevents mega-commits, partial commits, and broken commit history.

**Two responsibilities:**
1. **Granularity** — one logical change per commit, sized by context (task, TDD cycle, or adaptive).
2. **Safety** — commits that can be reverted, bisected, and tracked without breaking the codebase.

## Core Principle

```
ONE COMMIT = ONE COMPLETE CHANGE.

A commit must:
  - Compile/build on its own
  - Pass its relevant tests
  - Be revertable without breaking other commits
  - Be describable in one sentence

If you need "and" in the commit message, it's two commits.
```

## Granularity Modes

Granularity depends on the calling context:

| Context | Granularity | Rule |
|---------|-------------|------|
| `/st:execute` | Task-atomic | 1 commit per task. Each task in the plan = 1 commit. |
| `/st:phase-execute` | Task-atomic | Same as execute. Plus lifecycle commits for phase status. |
| `/st:quick` | Adaptive | 1 task → single commit. 2-3 tasks → 1 commit per task. |
| `/st:tdd` | Cycle-atomic | 1-2 commits per RED-GREEN-REFACTOR cycle. Finer than task-atomic. |

### Task-Atomic (default)

```
TASK → EXECUTE → VERIFY → COMMIT

Each task in the plan produces exactly 1 commit.
The commit includes all files changed to complete that task.
```

**What goes IN the commit:**
- All source files created or modified for the task
- Test files for the task
- Config changes required by the task

**What stays OUT:**
- Files not related to the task (even if you noticed a typo)
- Auto-generated files that will be regenerated (unless they're tracked)
- Unrelated formatting changes

### Cycle-Atomic (TDD)

```
RED → GREEN → REFACTOR → COMMIT(s)

Typical cycle produces 1-2 commits:
  Option A: 1 commit (test + implementation together)
  Option B: 2 commits (test: ... then feat/fix: ...)
  Option C: 3 commits (test: ... then feat/fix: ... then refactor: ...)
```

Choose based on change size:
- Small change (< 20 lines): Option A (single commit)
- Medium change (20-100 lines): Option B (separate test commit)
- Large change with significant refactor: Option C (three commits)

### Adaptive (Quick)

```
1 TASK  → single commit (naturally atomic)
2-3 TASKS → 1 commit per task (standard atomic)
```

No overhead for single-task execution. Multi-task maintains traceability.

## Commit Message Format

Conventional Commits. Prefix + concise description.

```
REQUIRED FORMAT:
  <type>: <description>

TYPES:
  feat:     New feature or capability
  fix:      Bug fix
  test:     Adding or updating tests (TDD red phase)
  refactor: Code restructuring, no behavior change
  docs:     Documentation changes
  chore:    Config, tooling, dependencies
  wip:      Work-in-progress (handoff pause only)

RULES:
  - Lowercase everything
  - No period at end
  - Under 72 characters
  - Imperative mood: "add user auth" not "added user auth"
  - Description answers: what does this commit DO?
```

### Scope (optional)

```
feat(auth): add login endpoint
fix(ui): correct button alignment on mobile
test(api): add integration tests for /users
```

Use scope when the project has clear modules. Skip if scope adds noise without clarity.

### Body (when needed)

```
feat: add rate limiting to API endpoints

Apply 100 req/min limit per IP using express-rate-limit.
Existing /health endpoint excluded from limiting.
```

Add body when:
- The "why" isn't obvious from the description
- There are trade-offs or decisions worth recording
- Breaking changes need explanation

### Phase Lifecycle Commits

Phase-execute produces additional lifecycle commits:

```
docs: start phase 3 - user authentication
docs: complete phase 3 - user authentication
```

These are separate from task commits. They update roadmap status only.

## Pre-Commit Verification

```
BEFORE EVERY COMMIT:
  1. Check: does the code compile/build?
  2. Check: do relevant tests pass?
  3. Check: are ONLY task-related files staged?
  4. Check: can you describe the change in one sentence?

ANY CHECK FAILS → do not commit. Fix first.
```

This is lighter than `superteam:verification` full methodology. Commit-level verification = Level 1-2 only (Exists + Substantive). Full Level 1-4 verification applies at PR and Phase scope.

## Parallel Execution Safety

When multiple agents commit in the same wave (`superteam:wave-parallelism`):

```
DURING PARALLEL EXECUTION:
  - git commit --no-verify (pre-commit hooks use locks → deadlock risk)
  - Each agent commits ONLY files in its files_modified list
  - Agents NEVER force-push
  - Agents NEVER rebase

AFTER WAVE COMPLETES:
  - Orchestrator runs: git hook run pre-commit
  - If hooks fail: report to user before next wave
  - Orchestrator verifies: git log --grep for each task commit
```

### File-Ownership Rule

```
AGENT MAY COMMIT:
  - Files listed in its files_modified assignment
  - New files it created that are within its task scope

AGENT MUST NOT COMMIT:
  - Files owned by another agent's task
  - Files outside its task scope (even if it noticed a bug)
  - Lock files (package-lock.json, yarn.lock) — orchestrator handles these
```

If an agent needs a file outside its ownership: STOP. Report to orchestrator. Do not modify.

## Rollback Protocol

### Single Task Rollback

```
TASK FAILED VERIFICATION:
  git revert <task-commit-hash>

  Do NOT use git reset — preserve history.
  Revert creates a new commit: "revert: <original message>"
```

### Wave Rollback

```
WAVE PARTIALLY FAILED:
  - Successful task commits STAND. Do not roll back.
  - Failed task: revert its commit only.
  - If git state corrupted: git reset --soft to pre-wave commit, re-apply successful commits.
```

### Emergency Reset

```
GIT STATE UNRECOVERABLE:
  git reset --hard to pre-wave commit
  Re-execute entire wave from scratch

  Only when: merge conflicts between agents, corrupted index, or orphaned HEAD.
  Always confirm with user first.
```

## Commit Tracking

Every commit produced by Superteam must be trackable:

```
TRACKING REQUIREMENTS:
  - Commit hash recorded per completed task (used by superteam:handoff-protocol)
  - Commit message grep-able by task description (used by wave verification)
  - Commit isolatable via git bisect (used by failure analysis)
```

When `superteam:handoff-protocol` pauses a session, it records:
```json
{"id": 1, "name": "Setup auth module", "status": "done", "commit": "abc1234"}
```

The atomic-commits skill ensures each task maps to exactly one commit hash.

## Anti-Patterns

| Anti-Pattern | Why Bad | Fix |
|-------------|---------|-----|
| **Mega-commit** — all tasks in one commit | Cannot revert individual tasks. Cannot bisect. | One commit per task. |
| **Empty commit** — commit with no meaningful change | Noise in history. Breaks bisect. | Only commit when there's a real change. |
| **Mixed commit** — task code + unrelated fix | Reverting the task also reverts the fix. | Separate commits. Fix goes in its own commit. |
| **Commit before verify** — committing untested code | Broken commits in history. Others can't trust the branch. | Verify THEN commit. |
| **Generated files commit** — committing build output | Bloats repo. Causes merge conflicts. | Check .gitignore. Only commit source files. |
| **WIP commit in main flow** — using wip: outside handoff | Pollutes history with incomplete work. | wip: prefix is ONLY for handoff pauses. |
| **Force-push during parallel** — agent force-pushes | Destroys other agents' commits. | Agents NEVER force-push. |

## Deviation Handling

When executing a task, you may discover a bug or issue unrelated to the current task:

```
DEVIATION FOUND:
  1. Do NOT fix it in the current task's commit
  2. Note it in the task completion summary
  3. Options:
     a. Create a follow-up task (preferred)
     b. Fix it in a separate commit AFTER the current task
     c. If it blocks the current task: fix first, separate commit, then continue

DEVIATION COMMIT FORMAT:
  fix: [description of deviation fix]

  Discovered during [task name]. Not part of original task scope.
```

## Quick Reference

```
GRANULARITY:
  execute/phase-execute → 1 commit per task
  quick → adaptive (1 task = single, 2-3 = atomic)
  tdd → 1-2 commits per RED-GREEN-REFACTOR cycle

MESSAGE FORMAT:
  <type>: <description>
  Types: feat, fix, test, refactor, docs, chore, wip
  Under 72 chars. Imperative. Lowercase. No period.

PRE-COMMIT:
  Builds? Tests pass? Only task files staged? One-sentence describable?

PARALLEL SAFETY:
  --no-verify during wave. Hooks post-wave.
  Own files only. Never force-push. Never rebase.

ROLLBACK:
  Single task: git revert (not reset)
  Partial wave: revert failed only, keep successful
  Emergency: git reset --hard to pre-wave (confirm with user)

ANTI-PATTERNS:
  No mega-commits. No empty commits. No mixed commits.
  No commit before verify. No generated files. No WIP in main flow.
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Committing all changes at end of session | Commit after each task, not at the end |
| Using `git add .` | Stage specific files. Check `git diff --staged` before committing |
| "and" in commit message | Two commits, not one |
| Committing lock files during parallel execution | Orchestrator handles lock files post-wave |
| Using git reset instead of git revert | Revert preserves history. Reset rewrites it. |
| WIP commit for non-handoff purpose | wip: is reserved for handoff pauses only |
| Fixing noticed bug in current task's commit | Separate commit. Note the deviation. |
| Skipping pre-commit verification | "Small change" is not an excuse. Verify always. |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation (auto-triggered when writing code) |

**Self-contained.** No reference files. Commit rules, message format, and safety protocols fit in SKILL.md.

## Integration

**Used by:**
- `/st:execute` — task-atomic commits during plan execution
- `/st:quick` — adaptive commits for fast execution
- `/st:tdd` — cycle-atomic commits during TDD workflow
- `/st:phase-execute` — task-atomic + phase lifecycle commits

**Skills that pair with atomic-commits:**
- `superteam:wave-parallelism` — parallel execution safety, file-ownership, post-wave hooks
- `superteam:tdd-discipline` — cycle-based commit granularity (test: → feat: → refactor:)
- `superteam:verification` — commit-level verification (Level 1-2) before committing
- `superteam:handoff-protocol` — commit hash tracking per completed task, wip: commits on pause
- `superteam:project-awareness` — framework detection for build/test commands in pre-commit verification
