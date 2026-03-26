---
description: "Create implementation plan: adaptive granularity, wave-based parallel, goal-backward verification"
argument-hint: "[--replan] <task description>"
---

# Create Plan

Create an implementation plan for a task or feature. Zero-infrastructure (works without `/st:init`). Adaptive granularity, optional research, wave-based parallel execution, goal-backward verification, mid-execution replanning.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Task description from arguments. If empty, ask: "What do you want to plan?"
   - Parse flags: `--replan` (replan from mid-execution blocker)
   - Accept image input (wireframe, flow diagram, screenshot)

2. **Check context**
   - If `.superteam/` exists: load config, PROJECT.md, REQUIREMENTS.md, DESIGN-SYSTEM.md
   - If not: inform user "Project not initialized. Plan still works but is more accurate with `/st:init`. Continue?"
     - User: continue / init first
   - Scan codebase: related files, patterns, conventions
   - Use `superteam:project-awareness` for context loading

3. **Understand + Confirm**
   - Follow `superteam:questioning` — follow-up questions one at a time, adaptive.
   - Read the request + context (codebase, PROJECT.md if available)
   - Synthesize understanding and present:
     ```
     UNDERSTANDING
     ─────────────────────────────────
     Task:           [what AI understands]
     Scope:          [what is included]
     Out of scope:   [what is excluded]
     Files affected:  [list]
     Approach:       [planned approach]
     Questions:      [unclear points, if any]
     ```
   - Ask user: "Is this correct? Anything to add or change?"
   - User: confirm -> continue
   - User: correct -> AI updates, re-confirm
   - Loop until user agrees

4. **UI Design gate** (frontend tasks only)
   - Detect: does this task change UI? (new page, new component, layout change, UI redesign)
   - If UI change detected:
     "This task affects the UI. Recommend running `/st:ui-design` before planning code. Agree?"
     - User agrees: run `/st:ui-design`, return to plan with mockup context
     - User declines: continue planning directly
   - If no UI change: skip

5. **Research decision** (optional, AI recommends)
   - Assess complexity:
     - Simple (rename, config, styling): skip research
     - Medium (new component, API endpoint): suggest light research
     - Complex (auth, payment, migration): recommend research
   - If recommending: "This task involves [domain]. Recommend research before planning. Agree?"
   - User agrees: spawn researcher agent (focused, 1-2 pages output)
   - User declines: continue planning directly
   - Follow `superteam:research-methodology` at appropriate depth

6. **Codebase-aware analysis**
   - Scan existing patterns (API endpoint pattern, component structure, naming conventions)
   - Identify files to create/modify
   - Detect dependencies between files
   - If `--replan`: load old plan + blocker context

7. **Generate plan** (spawn planner agent)
   - Adaptive granularity based on complexity:
     - Simple (few files, low risk) -> COARSE (1-3 steps)
     - Medium (several files, moderate changes) -> STANDARD (5-8 steps)
     - Complex (many files, high risk, architectural) -> FINE (10-20 steps, TDD cycle)
   - Follow `superteam:plan-quality` for task anatomy
   - Each task MUST have:
     - **Action**: concrete description with specific values
     - **Files**: exact paths (create / modify / test)
     - **Read-first**: files that must be read before editing
     - **Acceptance criteria**: grep-verifiable conditions
     - **Expected output**: runtime verification (command + expected result)
     - **Dependencies**: which tasks must complete first
   - TDD integration by granularity:
     - FINE: TDD cycle per task (test -> fail -> implement -> pass)
     - STANDARD: TDD for logic tasks only, skip for config/styling
     - COARSE: verify at end, no TDD cycle

8. **Dependency analysis + wave assignment**
   - Follow `superteam:wave-parallelism`
   - Conflict analysis:
     - Same file modified -> sequential
     - Different files, no dependency -> parallel
   - Assign waves for parallel execution

9. **Plan review** (spawn plan-checker agent)
   - Follow `superteam:plan-quality` for review criteria
   - Verify plan achieves the goal
   - Check: missing steps, dependency gaps, acceptance criteria completeness
   - Max 3 iterations to fix issues

10. **Goal-backward verification (must_haves)**
    - From the goal, derive: "If this plan completes, what MUST be true?"
    - Truths: e.g., "User can login", "API returns 200"
    - Artifacts: e.g., "auth.ts exists", "test files pass"
    - Verify: plan tasks cover ALL must_haves

11. **Present plan to user**
    ```
    PLAN: [task name]
    ─────────────────────────────────
    Granularity: [COARSE/STANDARD/FINE]
    Tasks: [N] | Waves: [M]
    Research: [done/skipped]
    Must-haves: [list]
    ─────────────────────────────────
    Wave 1: [tasks] (parallel)
    Wave 2: [tasks] (after wave 1)
    ─────────────────────────────────
    [Detailed task breakdown]
    ```
    - User actions:
      - Approve
      - "More detail" -> increase granularity
      - "Simpler" -> decrease granularity
      - Adjust specific tasks

12. **Phase linking** (only if ROADMAP.md exists)
    - "Link this plan to which phase?" -> Phase [X] / No link
    - If linked: update ROADMAP.md

13. **Save plan**
    - Write to `.superteam/plans/[task-name].md`
    - Include: checkbox steps, wave annotations, acceptance criteria
    - Commit: `plan: [task name]`
    - Follow `superteam:atomic-commits`

14. **Done**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > PLAN CREATED
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Tasks: [N] | Waves: [M] | Granularity: [level]
    Next: /st:execute
    ```

## Blocker Handling (`--replan`)

When executor hits a blocker and calls `/st:plan --replan`:

```
BLOCKER DETECTED
─────────────────────────────────
Issue:        [detailed description]
Discovered at: Task [N]

Impact assessment:
- Task [N+1]: [affected/not affected]
- Task [N+2]: [affected/not affected]

Recommendation: [Replan / Skip]
Reason:       [explanation]
```

- User: "Replan" -> replan remaining tasks, present new plan
- User: "Skip" -> skip the issue, continue execution
- User: "Handle separately" -> add new task to plan

## Rules

- Follow `superteam:questioning` for all user interactions.
- Zero-infrastructure: works without `/st:init`, but more accurate with project context.
- Granularity is adaptive. AI assesses, user can override.
- Every task must have grep-verifiable acceptance criteria AND runtime expected output.
- Wave assignment follows `superteam:wave-parallelism`: same-file edits are always sequential.
- Plan-checker runs max 3 iterations. Surface remaining issues to user if not resolved.
- Goal-backward must_haves are derived BEFORE presenting the plan to ensure coverage.
- Image input accepted at any point.
- For `--replan`: load existing plan + blocker context, assess impact on remaining tasks, let user decide.
