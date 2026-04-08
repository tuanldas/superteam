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
   - **You are the ORCHESTRATOR. Dispatch agents — do NOT write implementation code yourself.**
   - **Zero-exception rule:** Even for single-line changes, config edits, or "trivial" tasks — dispatch an agent. The ONLY action you perform directly is updating plan checkboxes after agents complete.
   - For each wave: make one `Agent()` call per task — ALL calls in the SAME message (foreground parallel)
   - Agent type: `executor` (model: opus)
   - Each Agent() prompt includes:
     - Task description + acceptance criteria from plan
     - File paths to read (NOT content — agent reads with fresh context)
     - Plan, CLAUDE.md, config, CONTEXT.md, RESEARCH paths
     - Phase decisions (e.g., "use JWT, not sessions")
     - RESEARCH recommendations (e.g., "avoid lib X")
     - Success criteria reference
     - `files_modified` list (agent's ownership boundary)
   - Agent handles: read → implement → verify → commit (one atomic commit per task)
   - After all agents return: track checkboxes in PLAN.md
   - Follow `superteam:wave-parallelism` for full dispatch protocol

   **Anti-rationalization — if you think any of these, STOP:**

   | Thought | Reality |
   |---|---|
   | "I can do it faster directly" | Agents run in parallel = faster. You writing sequentially = slower. |
   | "These are just file writes" | Agents handle full read→verify→commit cycle with fresh context |
   | "Agent overhead isn't worth it" | Your context gets cluttered. Agents get clean 200k each. |
   | "Let me just do this one task" | One becomes all. Dispatch EVERY task. |
   | "It's just a config/env change" | Config mistakes cascade. Agent verifies in isolation. |
   | "The agent will just copy what I'd write" | Then it costs nothing to dispatch. But if you're wrong, it costs everything. |
   | "I already know the solution" | Knowing ≠ implementing correctly. Agent reads fresh, catches what you miss. |

8. **Checkpoint review**
   - Between waves: run tests + quick review
   - Node repair if needed: RETRY / DECOMPOSE / PRUNE / ESCALATE
   - Follow `superteam:verification` for checkpoint validation

9. **Deviation handling**
   - Level 1 (Bug found): auto-fix, no need to ask
     - Examples: typo in variable name, off-by-one error, null check missing
   - Level 2 (Missing critical): auto-fix (error handling, validation, auth guards)
     - Examples: try/catch around API call, input sanitization, auth middleware on route
   - Level 3 (Blocking issue): auto-fix (missing deps, wrong types, broken imports)
     - Examples: `npm install` missing package, fix TypeScript type error, fix circular import
   - Level 4 (Architectural change): STOP and ask user
     - Examples: new DB table/column, new API endpoint, new package/dependency, change file structure, change auth strategy, add new service
     - **When in doubt between L3 and L4, choose L4.** False stops are cheap; wrong auto-fixes are expensive.
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
    > "/st:code-review" to review implementation quality
    > "/st:phase-validate [X]" to confirm completion
    > "/st:phase-execute [X+1]" to start next phase
    ```

## Rules

- PLAN.md is REQUIRED. Do not execute without a plan.
- Always check prerequisites (preceding phases) before executing.
- Update ROADMAP status to in-progress at the START of execution, not at the end.
- You are the ORCHESTRATOR. NEVER write implementation code directly. Always dispatch `executor` agents via Agent() tool.
- Executor agents receive CONTEXT.md + RESEARCH context. Do not execute blindly.
- Deviation level 4 (architectural changes) MUST stop and ask the user.
- Post-execution: always run success criteria check AND integration check.
- Do NOT mark phase as completed here. That is the job of `/st:phase-validate`.
- One commit per task. Follow `superteam:atomic-commits` strictly.
- If a task fails node repair after RETRY + DECOMPOSE, ESCALATE to user.
- Follow `superteam:core-principles`. Load references: questioning.
