---
description: "Quick execute: auto-plan 1-3 tasks and execute immediately without plan approval"
argument-hint: "[--discuss] [--research] [--full] <task description>"
---

# Quick Execute

Execute a small task fast: auto-plan 1-3 tasks, execute immediately, atomic commits. No plan approval needed.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Task description from arguments. If empty, ask: "What task?"
   - Parse flags: `--discuss`, `--research`, `--full`
   - Accept image input (screenshot, wireframe)

2. **Load context**
   - If `.superteam/` exists: load config, PROJECT.md
   - Scan codebase: related files, patterns, conventions
   - Use `superteam:project-awareness` context if available

3. **Discussion phase** (only with `--discuss`)
   - Identify 2-4 gray areas or assumptions about the task
   - Ask user 1-2 focused questions
   - Record decisions

4. **Research phase** (only with `--research`)
   - Spawn focused researcher agent (1-2 pages output)
   - Follow `superteam:research-methodology` at Light depth

5. **Create tracking directory**
   - `mkdir .superteam/quick/{id}-{slug}/`
   - Auto-increment ID, generate slug from task description
   - Write PLAN.md after planning

6. **Auto-plan** (1-3 tasks, NO user approval)
   - Create mini plan with 1-3 tasks maximum
   - Each task must have: action, files (exact paths), acceptance criteria
   - Follow `superteam:plan-quality` for task anatomy (adapted to COARSE granularity)
   - With `--full`: run plan-checker (max 2 iterations)
   - Write PLAN.md

7. **Execute**
   - Execute each task in the plan
   - Follow `superteam:atomic-commits`:
     - 1 task → single commit
     - 2-3 tasks → one commit per task
   - Deviation rules:
     - Auto-fix bugs encountered (no need to ask)
     - Auto-add missing critical functionality
     - ASK user about architectural changes
   - Write SUMMARY.md when complete

8. **Verification** (only with `--full`)
   - Run verifier agent against task goal
   - Follow `superteam:verification`

9. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > QUICK COMPLETE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tasks: [N] | Commits: [M]
   Files changed: [list]
   ```

## Flags

| Flag | Enables | Default |
|------|---------|---------|
| `--discuss` | Discussion phase (gray areas, assumptions) | Skip |
| `--research` | Research agent before planning | Skip |
| `--full` | Plan-checker (max 2 iterations) + verifier | Skip |

Flags are composable: `/st:quick --discuss --full add dark mode toggle`

## Rules

- Target 1-3 tasks MAXIMUM. If task needs more, suggest `/st:plan` instead.
- NO user approval for the plan. User already knows what they want.
- Always create tracking directory and PLAN.md even for single-task execution.
- Commit messages follow conventional commits format from config.

## When to suggest `/st:plan` instead

- Task clearly needs 4+ tasks
- Task involves UI changes that need design review
- Task is complex enough to need STANDARD or FINE granularity
- User seems uncertain about scope
