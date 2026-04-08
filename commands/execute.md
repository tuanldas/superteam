---
description: "Execute plan: wave-based parallel, node repair, deviation rules, checkpoint review"
argument-hint: "[plan file path]"
---

# Execute Plan

Execute an existing plan using wave-based parallelism. Includes node repair (4 strategies), deviation rules (4 levels), checkpoint reviews between waves, and blocker escalation.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Find plan**
   - If argument provided (file path): load that plan
   - If no argument:
     - Scan `.superteam/plans/` for incomplete plans
     - 1 plan found: load it
     - Multiple plans: ask user to choose
     - 0 plans: "No plans found. Run `/st:plan` first."

2. **Read plan + detect progress**
   - Parse checkboxes: `- [x]` done, `- [ ]` pending
   - Find first incomplete step
   - Display: "Plan [name]: [done]/[total] steps. Continue from step [N]?"

3. **Critical review gate**
   - Read the plan. Check for any concerns, ambiguities, or questions.
   - If concerns found: raise with user BEFORE executing
   - If clean: proceed

4. **Dependency analysis + wave assignment**
   - Follow `superteam:wave-parallelism`
   - Parse all pending steps
   - Conflict analysis:
     - Same file modified -> sequential
     - Different files, no dependency -> parallel
   - Assign waves:
     ```
     Wave 1: [independent tasks]
     Wave 2: [tasks depending on wave 1]
     ...
     ```
   - Display execution plan: "Total [N] steps, [M] waves"

5. **Execute by waves**
   - **You are the ORCHESTRATOR. Dispatch agents — do NOT write implementation code yourself.**
   - **Zero-exception rule:** Even for single-line changes, config edits, or "trivial" tasks — dispatch an agent. The ONLY action you perform directly is updating plan checkboxes after agents complete.
   - For each wave: make one `Agent()` call per task — ALL calls in the SAME message (foreground parallel)
   - Agent type: `executor` (model: opus)
   - Each Agent() prompt includes:
     - Task description + acceptance criteria from plan
     - File paths to read (NOT content — agent reads with fresh context)
     - Plan file path, CLAUDE.md path, config path
     - `files_modified` list (agent's ownership boundary)
     - Commit format instructions
   - Agent handles: read → implement → verify → commit (one atomic commit per task)
   - After all agents return: mark completed tasks with `[x]` in plan file
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

   **Deviation rules** (when encountering unplanned work):
   - Level 1 (Bug found): auto-fix, no need to ask
     - Examples: typo in variable name, off-by-one error, null check missing
   - Level 2 (Missing critical): auto-fix (error handling, validation, auth guards)
     - Examples: try/catch around API call, input sanitization, auth middleware on route
   - Level 3 (Blocking issue): auto-fix (missing deps, wrong types, broken imports)
     - Examples: `npm install` missing package, fix TypeScript type error, fix circular import
   - Level 4 (Architectural change): STOP and ask user
     - Examples: new DB table/column, new API endpoint, new package/dependency, change file structure, change auth strategy, add new service
     - **When in doubt between L3 and L4, choose L4.** False stops are cheap; wrong auto-fixes are expensive.

   **Node repair** when a task fails:
   - **RETRY**: try again with adjustment (budget: 2 attempts)
   - **DECOMPOSE**: split task into smaller sub-tasks
   - **PRUNE**: skip task, record justification
   - **ESCALATE**: ask user (budget exhausted or needs architectural decision)

6. **Checkpoint review** (between waves)
   - Run related test suite (always, by default)
   - Spawn reviewer agent for quick review
   - Verify key artifacts from previous wave exist
   - If tests fail or review issues found: fix before proceeding to next wave
   - If clean: proceed to next wave
   - Follow `superteam:verification` for checkpoint checks

7. **Blocker handling** (if serious issue encountered)
   - Escalate to `/st:plan --replan`
   ```
   BLOCKER DETECTED
   ─────────────────────────────────
   Issue:          [description]
   Impact:         [affected tasks]
   Recommendation: [with reasoning]
   ```
   - User: Replan / Skip / Handle separately

8. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > EXECUTION COMPLETE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tasks: [done]/[total] | Waves: [M]
   Commits: [N] | Tests: pass
   Deviations: [N] auto-fixed
   Node repairs: [N] (retry/decompose/prune)

   Next: /st:code-review
   ```

## Rules

- Always read the plan file and detect progress before executing. Never restart completed tasks.
- Critical review gate is mandatory. Raise ANY concern before executing.
- Deviation levels 1-3 are auto-fixed. Level 4 (architectural) ALWAYS stops and asks user.
- Node repair budget is 2 RETRY attempts per task. After that: DECOMPOSE, PRUNE, or ESCALATE.
- Checkpoint review (tests + quick review) runs between EVERY wave. Never skip.
- Each task gets exactly 1 atomic commit. Follow `superteam:atomic-commits`.
- You are the ORCHESTRATOR. NEVER write implementation code directly. Always dispatch `executor` agents via Agent() tool.
- Wave-based parallelism follows `superteam:wave-parallelism`: tasks in same wave run parallel, waves run sequentially.
- Update plan file checkboxes as tasks complete (resumability).
- If ALL retry budgets exhausted and task is critical: ESCALATE to user, do not silently skip.
- Follow `superteam:core-principles`. Load references: questioning.
