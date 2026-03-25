---
description: "Create a detailed implementation plan for a roadmap phase, using discuss/research artifacts as input"
argument-hint: "[phase number or name]"
---

# Phase Plan

Create an implementation plan for a phase in the roadmap. Reuses the planning engine from `/st:plan` (adaptive granularity, wave system, plan-checker, goal-backward verification) but adds phase context: loads CONTEXT.md + RESEARCH, uses success criteria as must_haves, auto-links to roadmap.

**Differs from `/st:plan`:** plan = standalone task, zero-infrastructure. phase-plan = phase in roadmap, loads artifacts from discuss/research, must_haves = success criteria.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - ROADMAP.md must exist. If not, stop: "No ROADMAP.md found."
   - Parse phase from argument: match by number or name
   - If no argument: list planned phases, ask user to pick
   - Parse phase details: number, name, REQ-IDs, success criteria
   - Check phase status:
     - completed: "This phase is already completed. Create a new plan?"
     - in-progress: "This phase is in progress. Replan?"
     - planned: proceed normally
   - Load artifacts (if they exist):
     - `.superteam/phases/[name]/CONTEXT.md` (from discuss)
     - `.superteam/phases/[name]/research/SUMMARY.md` (from research)
     - `.superteam/phases/[name]/research/*.md` (detail files)
   - If no CONTEXT.md: "No /st:phase-discuss run yet. Recommend discussing first. Continue with plan directly?"
   - Load: PROJECT.md, config, codebase
   - Use `superteam:project-awareness` for codebase scanning

2. **Understand and confirm**
   - Read: phase info + CONTEXT.md + RESEARCH + codebase
   - Present understanding:
     ```
     PHASE UNDERSTANDING
     Phase [X]: [name]
     Approach: [from CONTEXT.md]
     Key decisions: [from CONTEXT.md]
     Tech stack: [from RESEARCH]
     Risks: [from RESEARCH]
     Scope: [inclusions / exclusions]
     Affected files: [list]

     Success criteria (= must_haves):
       1. [criterion]
       2. [criterion]
       3. [criterion]
     ```
   - Wait for user: confirm or correct

3. **UI design gate**
   - Detect: does this phase involve UI changes?
   - If yes: suggest running `/st:ui-design` first
   - If no: skip

4. **Codebase-aware analysis**
   - Scan existing patterns in the codebase
   - Identify files to create/modify
   - Detect dependencies between files

5. **Spawn planner agent**
   - Follow `superteam:plan-quality` for task anatomy
   - Adaptive granularity: COARSE / STANDARD / FINE
   - Each task includes: action, files, read-first, acceptance criteria, expected output, dependencies
   - TDD integration based on granularity
   - Additional input for the agent:
     - CONTEXT.md decisions
     - RESEARCH recommendations
     - Success criteria as must_haves

6. **Dependency analysis + wave assignment**
   - Follow `superteam:wave-parallelism`
   - Conflict detection: sequential vs parallel
   - Assign tasks to waves

7. **Spawn plan-checker agent**
   - Verify plan achieves the goal
   - Additional check: plan covers ALL success criteria
     - Each criterion must have at least 1 task addressing it
     - If any missing: flag and suggest additional tasks
   - Max 3 iterations to fix

8. **Goal-backward verification**
   - Follow `superteam:verification`
   - must_haves = success criteria from the phase
   - Truths + Artifacts check
   - Verify plan tasks cover all must_haves

9. **Present plan**
   ```
   PLAN: Phase [X] - [name]
   Granularity: [COARSE/STANDARD/FINE]
   Tasks: [N] | Waves: [M]
   Context: CONTEXT.md [yes/no]
   Research: RESEARCH [yes/no]

   Must-haves (= success criteria):
     [check] criterion 1 -> covered by task X
     [check] criterion 2 -> covered by task Y
     [check] criterion 3 -> covered by task Z

   Wave 1: [tasks] (parallel)
   Wave 2: [tasks] (after wave 1)

   [Task details]
   ```
   - Wait for user: approve / adjust granularity / adjust tasks

10. **Save plan**
    - Save to: `.superteam/phases/[name]/PLAN.md`
    - Include: checkbox steps, wave annotations, acceptance criteria
    - Follow `superteam:atomic-commits`
    - Commit: `plan: phase [X] - [name]`

11. **Done**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > PHASE PLAN CREATED
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Phase [X]: [name]
    Tasks: [N] | Waves: [M] | Granularity: [level]
    Must-haves: [all covered]
    Plan: .superteam/phases/[name]/PLAN.md
    > "/st:phase-execute [X]" to execute
    ```

## Rules

- must_haves are ALWAYS the success criteria from the phase in ROADMAP.md. Do not invent your own.
- Plan-checker MUST verify every success criterion has at least one task addressing it.
- If CONTEXT.md and RESEARCH exist, they are PRIMARY input. Do not ignore them.
- Adaptive granularity: let AI decide COARSE/STANDARD/FINE based on complexity, but user can override.
- Plan goes in `.superteam/phases/[name]/PLAN.md`, NOT in `.superteam/plans/`.
- If the phase requires UI work and no UI design exists, suggest `/st:ui-design` but do not block.
- Max 3 plan-checker iterations. If still failing, present to user with issues noted.
