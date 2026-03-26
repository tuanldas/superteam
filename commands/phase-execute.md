---
description: "Execute a roadmap phase: run the plan with wave execution, atomic commits, and phase lifecycle management"
argument-hint: "[phase number or name]"
---

# Phase Execute

Execute the plan for a phase in the roadmap. Reuses the execution engine from `/st:execute` (wave execution, node repair, deviation rules, atomic commits) but adds phase lifecycle: load phase artifacts, update ROADMAP status, verify success criteria, cross-phase integration check.

**Differs from `/st:execute`:** execute = standalone task plan. phase-execute = phase in roadmap with lifecycle hooks before and after execution.

**Arguments:** "$ARGUMENTS"

## Workflow

### Pre-Execution (phase-specific)

1. **Check context**
   - ROADMAP.md must exist. If not, stop: "No ROADMAP.md found."
   - Parse phase from argument: match by number or name
   - If no argument: list phases that have PLAN.md, ask user to pick
   - Parse phase details: number, name, status, success criteria
   - PLAN.md must exist in `.superteam/phases/[name]/`
     - If not: "No plan found. Run /st:phase-plan [X] first."
   - Check phase status:
     - completed: "This phase is already completed. Execute again?"
     - in-progress: "This phase is in progress. Resume from checkpoint?"
     - planned: proceed normally

2. **Prerequisite check**
   - Check all preceding phases (1 through X-1):
     - If any preceding phase is still "planned" (not started):
       "Warning: Phase [Y] has not started yet but precedes phase [X]. Dependencies may not be ready. Continue anyway? Or run phase [Y] first?"
     - If all preceding phases are completed or in-progress: OK

3. **Load phase artifacts**
   - PLAN.md (required)
   - CONTEXT.md (if exists — decisions, approach, constraints)
   - RESEARCH/SUMMARY.md (if exists — tech recommendations, pitfalls)
   - Success criteria from ROADMAP.md (used for post-execution check)
   - Use `superteam:project-awareness` for codebase context

4. **Update ROADMAP status**
   - Change phase status: planned -> in-progress
   - Follow `superteam:atomic-commits`
   - Commit: `docs: start phase [X] - [name]`

### Execution (reuse engine)

5. **Critical review gate**
   - AI reads the plan, reviews feasibility
   - Flag potential issues before starting

6. **Wave assignment**
   - Follow `superteam:wave-parallelism`
   - Dependency analysis: parallel vs sequential
   - Assign tasks to waves

7. **Wave execution**
   - Spawn executor agents per task
   - Additional context for agents:
     - CONTEXT.md decisions (e.g., "use JWT, not sessions")
     - RESEARCH recommendations (e.g., "avoid lib X")
     - Success criteria reference
   - Follow `superteam:atomic-commits`: one commit per task
   - Track checkboxes in PLAN.md as tasks complete

8. **Checkpoint review**
   - Between waves: run tests + quick review
   - Node repair if needed: RETRY / DECOMPOSE / PRUNE / ESCALATE
   - Follow `superteam:verification` for checkpoint validation

9. **Deviation handling**
   - Level 1-3 (auto-fix): bugs, missing imports, minor gaps
   - Level 4 (stop and ask): architectural changes, scope changes
   - Blocker: suggest `/st:phase-plan --replan`

### Post-Execution (phase-specific)

10. **Success criteria check**
    - Verify each criterion from ROADMAP.md:
      ```
      SUCCESS CRITERIA CHECK
      [pass/fail] [criterion 1]
        -> Evidence: [test results or code evidence]

      [pass/fail] [criterion 2]
        -> Evidence: [test results or code evidence]

      Result: [X]/[Y] criteria met
      ```
    - If criteria are not met:
      "[N] criteria not yet met. Continue fixing or move to validate for detailed review?"

11. **Cross-phase integration check**
    - Spawn integration-checker agent:
      - Run full test suite (not just phase tests)
      - Check: do previously completed phases have regressions?
      - Check: are interfaces between phases consistent?
    - Report results:
      - All pass: "No regressions"
      - Issues found: list + suggest fixes

12. **Update ROADMAP**
    - If all criteria met + integration passes: status stays in-progress (awaiting phase-validate to confirm)
    - Check criteria checkboxes in ROADMAP.md
    - If criteria not fully met: status stays in-progress

13. **Done**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > PHASE EXECUTED
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Phase [X]: [name]
    Tasks: [N] completed | Waves: [M]
    Criteria: [X]/[Y] met
    Integration: [pass/issues]
    > "/st:phase-validate [X]" to confirm completion
    > "/st:phase-execute [X+1]" to start next phase
    ```

## Rules

- Follow `superteam:questioning` for all user interactions.
- PLAN.md is REQUIRED. Do not execute without a plan.
- Always check prerequisites (preceding phases) before executing.
- Update ROADMAP status to in-progress at the START of execution, not at the end.
- Executor agents receive CONTEXT.md + RESEARCH context. Do not execute blindly.
- Deviation level 4 (architectural changes) MUST stop and ask the user.
- Post-execution: always run success criteria check AND integration check.
- Do NOT mark phase as completed here. That is the job of `/st:phase-validate`.
- One commit per task. Follow `superteam:atomic-commits` strictly.
- If a task fails node repair after RETRY + DECOMPOSE, ESCALATE to user.
