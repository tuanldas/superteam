---
name: wave-parallelism
description: >
  Use when executing multiple tasks/plans that can run in parallel.
  Enforces dependency analysis, wave grouping, file-ownership safety,
  git contention handling, and completion verification.
---

# Wave Parallelism

## Overview

Wave Parallelism provides the methodology for safely executing independent tasks in parallel using subagent waves. Tasks are grouped into waves based on dependency analysis — all tasks in a wave can run simultaneously, waves execute sequentially.

**Two responsibilities:**
1. **Safety** — dependency analysis, file-ownership, git contention handling ensure parallel agents don't conflict.
2. **Orchestration** — wave assignment, completion verification, inter-wave validation ensure correct execution order and results.

## Core Principle

```
NO PARALLEL EXECUTION WITHOUT DEPENDENCY ANALYSIS FIRST.

Parallelism is an optimization, not a default.
Every parallel dispatch must prove tasks are independent.
File ownership is the primary safety mechanism.
When in doubt, execute sequentially.
```

## When to Parallelize

**Decision checklist:**
```
□ 2+ tasks/plans exist to execute
□ config.parallelization is true (from project-awareness context)
□ Tasks touch different files (file-ownership check passes)
□ No sequential data dependency between tasks
□ Task() subagent API is available
```

All boxes must be checked. One failure = sequential execution.

**Parallelize:**
- Independent feature implementations touching different files
- Research agents investigating different topics
- Review agents checking different domains
- Test suites for different modules

**Do NOT parallelize:**
- Tasks sharing files (guaranteed merge conflicts)
- Tasks with undeclared data dependencies
- Exploratory/debugging work (needs full system context)
- Tasks requiring sequential state changes (migrations, schema updates)
- Too many agents simultaneously (see limits below)

**Agent limits by type:**
- Code execution agents (write + test): max 3-4 simultaneous
- Research/review agents (read-only): max 5 simultaneous
- Mixed wave: total context cost should not exceed practical limits

The 5-agent cap is a default. Adjust based on task weight.

## Dependency Analysis

For each task, record three properties:

```
TASK ANALYSIS:
  needs:          [files/types/APIs that must exist before this task starts]
  creates:        [files/types/APIs this task produces]
  files_modified: [every file this task will read-write]
```

### Building the Dependency Graph

1. **Data dependency:** If task B `needs` what task A `creates` → B depends on A.
2. **File conflict:** If task A and task B both have the same file in `files_modified` → sequential (B depends on A, or same wave with explicit ordering).
3. **No overlap:** If tasks share no `needs`/`creates` links and no `files_modified` overlap → parallel.

### File-Ownership Rule

```
FILE OWNERSHIP IS THE PRIMARY SAFETY MECHANISM.

One file = one owner per wave.
If two tasks in the same wave modify the same file → move one to the next wave.
No exceptions. No "they only touch different parts of the file."
```

This is the rule that prevents merge conflicts. Claude will rationalize "they edit different functions in the same file" — that is still a conflict risk. Different wave.

### Implicit Dependencies (Beyond Files)

File-ownership catches most conflicts, but watch for shared runtime state:

| Shared Resource | Example | Resolution |
|---|---|---|
| Database state | Task A writes test data, Task B queries same table | Different waves, or isolated test DB per agent |
| Environment variables | Task A modifies .env, Task B reads it | Different waves |
| External API rate limits | Both tasks call same API | Add delay, or different waves |
| Port bindings | Both tasks start dev server on :3000 | Different ports per agent |
| Global singleton state | Both tasks modify shared cache/config at runtime | Different waves |

If any shared resource exists between tasks: treat as file conflict → different waves.

### Vertical Slices Over Horizontal Layers

**Good (maximizes Wave 1 parallelism):**
```
Plan 1: User feature (model + API + UI)      → Wave 1
Plan 2: Product feature (model + API + UI)    → Wave 1
Plan 3: Order feature (model + API + UI)      → Wave 1
```

**Bad (artificial sequential dependencies):**
```
Plan 1: All models (user + product + order)   → Wave 1
Plan 2: All APIs (depends on all models)      → Wave 2
Plan 3: All UI (depends on all APIs)          → Wave 3
```

Vertical slices = more tasks in Wave 1 = more parallelism.

## Wave Assignment Algorithm

```
for each task in task_list:
  if task.depends_on is empty:
    task.wave = 1
  else:
    task.wave = max(wave[dep] for dep in task.depends_on) + 1
```

**Display wave structure before execution:**

```
ST ► WAVE EXECUTION PLAN
─────────────────────────────
Wave 1 (parallel, 3 agents):
  ├─ Task 1: User authentication [auth.ts, user.model.ts]
  ├─ Task 2: Product catalog [product.ts, catalog.service.ts]
  └─ Task 3: Search indexing [search.ts, index.service.ts]

Wave 2 (parallel, 2 agents):
  ├─ Task 4: User-product integration [cart.ts] ← depends on Task 1, 2
  └─ Task 5: Search-product integration [search-product.ts] ← depends on Task 2, 3

Wave 3 (sequential, 1 agent):
  └─ Task 6: E2E integration tests [tests/e2e/] ← depends on Task 4, 5
─────────────────────────────
Total: 6 tasks, 3 waves. Awaiting approval.
```

User approves before execution begins.

## Parallel Execution Protocol

### Agent Spawning

For each task in a wave, spawn an executor agent with:

```
AGENT CONTEXT (lean orchestrator pattern):
  - Task description + success criteria
  - File paths to read (NOT file content — agent reads with fresh context)
  - Relevant plan/requirement file paths
  - Commit format instructions
  - files_modified list (agent's file ownership boundary)
  - Applicable skills: tdd-discipline (implementation tasks),
    scientific-debugging (bug-related tasks)
```

**Lean orchestrator:** Pass file paths, not content. Each agent has fresh context (up to 200k). Loading content in orchestrator wastes the orchestrator's context window.

### Agent Isolation

Priority order:
1. **Worktree isolation** (best): `isolation: "worktree"` — each agent gets its own git worktree. No staging conflicts possible.
2. **File-ownership guarantee** (good): No worktree, but file-ownership rule ensures no overlap. Agents commit to same branch but different files.
3. **Sequential fallback** (safe): If neither is available, execute sequentially.

### Agent Completion

Each agent must produce:
1. Git commit(s) for the task
2. Completion summary (what was done, files changed, any issues)
3. Self-check status (PASS / FAIL with details)

## Git Contention Handling

```
DURING PARALLEL EXECUTION:
  All agents use: git commit --no-verify
  Reason: pre-commit hooks use locks (node_modules, Cargo.lock, etc.)
          Multiple agents running hooks simultaneously → deadlock

AFTER WAVE COMPLETES:
  Orchestrator runs: git hook run pre-commit
  If hooks fail: report and ask user before next wave
  Reason: hooks still run, just once per wave instead of per agent
```

**Additional git safety:**
- Agents NEVER force-push
- Agents NEVER rebase during parallel execution
- Agents commit only files in their `files_modified` list
- If agent needs to modify a file not in its ownership: STOP, report, don't modify

## While-Waiting Protocol

After dispatching a wave of background agents, the orchestrator MUST NOT go silent. Silence causes the user to think the process has stopped (especially after context compression shows "Crunched for Xm").

**Required behavior while agents run in background:**

1. **Immediately** show estimated time: "Wave [N] running (typically 3-7 min). ctrl+o to see agent details."
2. **Do visible prep work** — scan codebase, count files, pre-read files for next wave, report findings
3. **Show progress** as individual agents complete: "✓ [agent] complete! Waiting for [remaining]..."
4. **If prep work finishes before agents**: show elapsed time every 60s: "Still running... [N]m elapsed. [M] agents remaining."
5. **NEVER** leave user with zero output for more than 60 seconds during background execution.

The goal: the last thing the user sees should ALWAYS be your activity, not a system message like "Crunched for 5m 20s".

## Wave Completion Verification

After all agents in a wave finish, verify BEFORE proceeding to next wave:

```
VERIFICATION CHECKLIST (per agent):
□ Completion signal received (Task() returned)
□ Git commits exist for the task (git log --grep)
□ Key created files exist on disk
□ Self-check status is PASS
□ No uncommitted changes left by agent
```

### Timeout and Fallback

If an agent's completion signal is not received within reasonable time:
1. **Spot-check filesystem:** Do the expected files/commits exist?
2. **If yes:** Treat as completed (signal was lost, not the work).
3. **If no:** Report as failed. Route to Node Repair.

NEVER block indefinitely waiting for a signal. Always verify via filesystem and git state.

### Post-Wave Test Suite

After wave completion verification:
1. **Run tests owned by wave tasks:** tests in directories matching `files_modified`
2. **Run integration tests touching wave boundaries:** if wave created API endpoints, run API integration tests
3. **Last wave only:** run full test suite as final gate
4. **Use `superteam:project-awareness` framework detection** for correct test runner command

If tests fail: identify which task's commit introduced the failure (`git bisect` across wave commits).
Do not proceed to next wave with failing tests.

## Inter-Wave Dependency Validation

Before spawning Wave N+1, verify that Wave N's outputs actually exist:

```
FOR EACH TASK in Wave N+1:
  FOR EACH dependency in task.depends_on:
    □ Dependency's created files exist on disk
    □ Dependency's exports/APIs are accessible
    □ No "Cross-Plan Wiring Gap" (file exists but doesn't export expected interface)
```

**If validation fails:**
- Surface the gap: "Task 4 depends on `user.model.ts` from Task 1, but the file doesn't export `UserModel`."
- Options: fix now (spawn repair agent) / continue anyway / ask user

## Node Repair (Error Recovery)

When a task fails within a wave:

```
REPAIR ESCALATION:
  1. RETRY    — Re-execute with adjustment (budget: 2 attempts)
                Common adjustments: more context, simpler approach, different file structure
  2. DECOMPOSE — Break failed task into 2-3 smaller sub-tasks
                Re-analyze dependencies, may create a new mini-wave
  3. PRUNE    — Skip the task entirely
                Document justification. Dependent tasks may also need pruning.
  4. ESCALATE — Ask user
                When: budget exhausted, architectural decision needed, unclear requirements
```

**Rules:**
- RETRY before DECOMPOSE. Most failures are context-related, not complexity-related.
- PRUNE is not failure — it's an informed decision to descope.
- ESCALATE immediately for architectural decisions. Don't burn retry budget on wrong architecture.
- Other tasks in the wave continue unaffected. Only the failed task enters repair.

## Cascade Handling on Partial Wave Failure

When a task in a wave is PRUNED:

1. **Identify dependent tasks.** All tasks in later waves with `depends_on` including the pruned task.
2. **For each dependent task:**
   - Can it still execute without the pruned dependency? → Continue (remove dependency, adjust scope)
   - Cannot execute → CASCADE PRUNE (mark as pruned too)
3. **Cascade display:**
```
ST ► CASCADE IMPACT
─────────────────────────────
Task 2 (PRUNED) → affects:
  ├─ Task 4 (depends on Task 2) → CASCADE PRUNED
  └─ Task 5 (depends on Task 2 + Task 3) → CAN CONTINUE (only needs Task 3)
─────────────────────────────
```
4. **User approval** before cascade prune takes effect.

**Rules:**
- Always display cascade impact before pruning. Never silently skip dependent tasks.
- If cascade prunes more than 50% of remaining tasks: ESCALATE to user. The plan may need restructuring.
- Successfully completed tasks in the same wave are NOT rolled back. Their commits stand.

## Fallback Path

When parallel execution is not available or not reliable:

```
FALLBACK TRIGGERS:
  - Task() API unavailable or unreliable
  - config.parallelization is false
  - Only 1 task in wave (parallel of 1 = sequential)
  - Runtime environment unknown (Copilot, etc.)

FALLBACK BEHAVIOR:
  Execute tasks sequentially in wave order.
  Still apply: dependency validation, completion verification, node repair.
  Skip: git contention handling, agent isolation (not needed sequentially).
```

Detect fallback early. Don't attempt parallel execution and fail — check availability first.

## Quick Reference

```
CORE RULE:
  No parallel execution without dependency analysis.
  File ownership = primary safety mechanism.

DEPENDENCY ANALYSIS:
  Record: needs, creates, files_modified per task
  Data dependency: B needs what A creates → sequential
  File conflict: same file in two tasks → different waves
  No overlap: parallel

WAVE ASSIGNMENT:
  wave = max(wave[deps]) + 1
  No deps → Wave 1
  Prefer vertical slices over horizontal layers

EXECUTION:
  Lean orchestrator: pass paths, not content
  Agent isolation: worktree > file-ownership > sequential fallback
  Git: --no-verify during wave, hooks once after wave

VERIFICATION:
  Per agent: commits exist, files exist, self-check PASS
  Per wave: test suite, inter-wave dependency validation
  Timeout: spot-check filesystem, don't block indefinitely

REPAIR:
  RETRY (budget 2) → DECOMPOSE → PRUNE → ESCALATE
  PRUNE → cascade to dependents → user approval

AGENT LIMITS:
  Code execution: max 3-4 | Research/review: max 5

ANTI-PATTERNS:
  Shared files in same wave
  Shared runtime state (DB, env, ports) without isolation
  Trusting Task() without verification
  Horizontal layer decomposition
  Blocking indefinitely on completion
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Parallelizing tasks that share files | File-ownership rule. One file = one owner per wave. Move to next wave |
| Trusting Task() return without verification | Spot-check: commits exist, files exist, self-check PASS |
| Spawning too many agents | Code: max 3-4, research: max 5. Adjust by task weight |
| Passing file content to agents from orchestrator | Pass paths. Agents read with fresh context. Lean orchestrator |
| Blocking indefinitely on agent completion | Timeout + filesystem spot-check. Always have fallback |
| Running pre-commit hooks per parallel agent | `--no-verify` during wave, hooks once after wave |
| Horizontal layer decomposition (all models → all APIs → all UI) | Vertical slices. Each plan = one complete feature |
| Proceeding to Wave 2 without verifying Wave 1 outputs | Inter-wave dependency validation. Verify key files/exports exist |
| Attempting parallel execution without checking config | Check `config.parallelization` from project-awareness context first |
| Resuming a failed agent instead of spawning fresh | Always spawn fresh continuation agent. Resume breaks with parallel state |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation |

**Self-contained.** No reference files. Wave protocol is one coherent concept — splitting would fragment understanding.

## Integration

**Used by:**
- `/st:execute` — wave-based task execution within a plan
- `/st:phase-execute` — wave-based plan execution within a phase
- `/st:init` — parallel research agents (stack + landscape → architecture + pitfalls)

**Skills that pair with wave-parallelism:**
- `superteam:project-awareness` — provides `config.parallelization` setting, monorepo workspace scope for dependency analysis, framework detection for test runner
- `superteam:tdd-discipline` — each executor agent follows TDD cycle for implementation tasks
- `superteam:scientific-debugging` — executor agents use debugging methodology when encountering errors
- `superteam:requesting-code-review` — post-wave review of all wave outputs
- `superteam:verification` — post-wave verification standards
- `superteam:handoff-protocol` — when wave execution is paused mid-session
