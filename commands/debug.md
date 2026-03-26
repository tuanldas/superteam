---
description: "Systematic debugging: persistent state, knowledge base, 12 techniques, anti-shortcut discipline"
argument-hint: "<bug description or empty to resume>"
---

# Systematic Debugging

Debug complex bugs systematically. Persistent debug session files survive context resets. Knowledge base accumulates past solutions. 12 investigation techniques. Full anti-shortcut discipline.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Bug description from arguments. If empty, ask: "Describe the bug?"
   - Accept image input: screenshot of error, console output, UI bug
   - Analyze images: extract error messages, UI state, console errors

2. **Check context**
   - If `.superteam/` exists: load config, PROJECT.md
   - Check active debug sessions in `.superteam/debug/*.md`
     - Sessions exist + no argument: show sessions, ask resume or new
     - Sessions exist + argument provided: create new session
     - No sessions: continue

3. **Complexity assessment**
   - Evaluate bug complexity:
     - Simple (typo, null check, config error): suggest `/st:debug-quick` instead
       - User agrees: switch to `/st:debug-quick`
       - User declines: continue with full `/st:debug`
     - Complex: continue with full `/st:debug`

4. **Create debug session file**
   - Generate slug from bug description
   - Create `.superteam/debug/{slug}.md` with format:
     ```
     status: gathering
     trigger: [verbatim user input]
     created: [ISO timestamp]
     updated: [ISO timestamp]
     ```
   - Sections: Current Focus, Symptoms, Eliminated, Evidence, Resolution
   - GOLDEN RULE: Update file BEFORE every action. If context resets mid-session, the file tells you where you were.

5. **Gather symptoms**

   5a. Auto-detect and read logs:
   - Detect framework from codebase to find log locations:
     - Laravel: `storage/logs/laravel.log`
     - Node/Express: console output, `debug.log`
     - Django: `django.log`, stderr
     - Spring: `logs/spring.log`
     - Docker: `docker logs <container>`
     - PM2: `~/.pm2/logs/`
     - nginx: `/var/log/nginx/error.log`
     - systemd: `journalctl -u <service>`
   - Read recent logs (filter by timestamp near bug occurrence)
   - Evaluate and filter:
     - Discard: unrelated logs (routine info, health checks, scheduled jobs)
     - Keep: errors, warnings, stack traces, entries related to the component/endpoint being debugged
     - Priority: error > warning > info with unusual patterns
   - Only add filtered logs to Evidence (APPEND)

   5b. Ask user (or extract from input/image):
   - Symptoms to gather: expected behavior, actual behavior, error messages, reproduction steps, when it started
   - Ask each symptom ONE AT A TIME, adaptive. Follow `superteam:questioning`.
   - If previous answer already covers a symptom, skip it.
   - Update file after EACH answer
   - May suggest: "Can you send a screenshot of the console?"
   - Set status -> `investigating`

6. **Spawn debugger agent**
   - Load debug session file + knowledge base
   - Follow `superteam:scientific-debugging`

   **Phase 0: Knowledge base lookup**
   - Extract keywords from Symptoms
   - Match against `.superteam/debug/knowledge-base.md` (2+ keyword overlap)
   - If match found: use as first hypothesis candidate (suggest, do NOT auto-fix)

   **Phase 1: Root Cause Investigation**
   - Read error messages and stack traces COMPLETELY (never skim)
   - Reproduce consistently
   - Check recent changes: `git diff`, `git log`
   - Gather evidence at each component boundary
   - Trace data flow (backward tracing)
   - APPEND Evidence after each finding

   ```
   ┌─────────────────────────────────────────────────┐
   │ IRON LAW: NO FIXES WITHOUT ROOT CAUSE           │
   │ INVESTIGATION FIRST                              │
   │                                                  │
   │ If Phase 1 is not complete -> DO NOT attempt fix │
   └─────────────────────────────────────────────────┘
   ```

   **Phase 2: Pattern Analysis**
   - Find working examples in codebase
   - Compare working vs broken
   - List ALL differences
   - Understand dependencies

   **Phase 3: Hypothesis and Testing**
   - Formulate 1 SPECIFIC, FALSIFIABLE hypothesis
     - BAD: "Maybe caused by X"
     - GOOD: "If X is the cause, then doing Y should produce Z"
   - Test MINIMAL: 1 variable at a time
   - Confirmed -> Phase 4
   - Eliminated -> APPEND to Eliminated section, return to Phase 2
   - After 3 eliminations -> meta-debugging: reassess entire approach

   **Phase 4: Implementation**
   - Write failing test that reproduces the bug
   - Implement SMALLEST possible fix
   - Verify: test passes + full suite has no regression
   - If 3+ fixes fail -> STOP, question architecture

   **Phase 5: Document**
   - Update Resolution: root_cause, fix, verification, files_changed

   **Investigation techniques** (AI selects as appropriate):
   | Technique | When to use |
   |---|---|
   | Binary search | Known to work before, find when it broke |
   | Working backwards | Wrong output, trace back to source |
   | Git bisect | Regression, know a good commit |
   | Differential | Works in env A, fails in env B |
   | Minimal repro | Complex bug, many variables |
   | Observability | Not enough data, need more logging |
   | Comment-out-all | No idea where to start |
   | Rubber duck | Complex logic needs walkthrough |
   | Root-cause trace | Bug deep in call stack |
   | Defense-in-depth | After fix, validate all layers |
   | Condition-waiting | Flaky test, timing issue |

   **Anti-shortcut discipline** (active throughout):
   - Red flags: 9 thought patterns that must trigger STOP
   - Rationalizations: 8 "good reasons" that are actually shortcuts
   - Cognitive biases: confirmation, anchoring, recency, sunk cost
   - Meta-debugging: reassess approach after each elimination
   - Falsifiability: every hypothesis must have a way to disprove it

7. **Checkpoint handling**
   - **human-verify**: need user to confirm a result
   - **human-action**: need user to do something Claude cannot (e.g., check AWS console)
   - **decision**: need user to choose a direction
   - **auto-checkpoint**: AI detects context is getting full
     - Save state to file
     - Suggest: "Context nearly full. Run `/clear` then `/st:debug` to resume."
   - Orchestrator spawns new agent with debug file + response

8. **Human verification**
   - After fix: return CHECKPOINT (human-verify)
   - User confirms "fixed" or "still broken"
   - Still broken -> status -> `investigating`, return to investigation

9. **Archive + Knowledge base**
   - Move session file to `.superteam/debug/resolved/`
   - Append to `.superteam/debug/knowledge-base.md`:
     - slug, date, error patterns, root cause, fix, files changed
   - Commit code fix
   - Commit planning docs

10. **Done** (4 possible outcomes)

    **Root cause found (no fix yet):**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > ROOT CAUSE FOUND
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Root cause: [description + evidence]
    Files: [list]
    Suggested fix: [approach, not implemented]
    ```

    **Fully resolved:**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > DEBUG COMPLETE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Root cause: [description]
    Fix: [description]
    Tests: [N] added, all passing
    Session: .superteam/debug/resolved/{slug}.md
    Commit: [hash]
    ```

    **Checkpoint (needs user):**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > CHECKPOINT
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Type: [human-verify | human-action | decision | auto]
    Progress: [N] evidence, [M] eliminated
    Need: [what is needed from user]
    ```

    **Inconclusive:**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > INVESTIGATION INCONCLUSIVE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Checked: [list]
    Eliminated: [list]
    Remaining: [list]
    Recommendation: [next steps]
    ```

## Session File Update Rules

| Section | Rule | When |
|---------|------|------|
| Frontmatter status | OVERWRITE | Each phase transition |
| Frontmatter updated | OVERWRITE | Every file update |
| Current Focus | OVERWRITE | Before every action |
| Symptoms | IMMUTABLE | After initial gathering |
| Eliminated | APPEND only | When hypothesis eliminated |
| Evidence | APPEND only | After each finding |
| Resolution | OVERWRITE | When understanding deepens |

## Resume After Context Reset

1. Parse frontmatter -> know status
2. Read Current Focus -> know what was in progress
3. Read Eliminated -> know what NOT to retry
4. Read Evidence -> know what was discovered
5. Continue from next_action

## Rules

- Follow `superteam:questioning` for all user interactions.
- IRON LAW: Never attempt a fix before root cause is identified. Investigation first.
- Update the session file BEFORE every action. This is non-negotiable.
- Eliminated hypotheses are APPEND-only. Never retry an eliminated hypothesis.
- Symptoms are IMMUTABLE after initial gathering. Never modify them.
- Every hypothesis must be SPECIFIC and FALSIFIABLE: "If X then doing Y produces Z."
- Test ONE variable at a time. Never change multiple things simultaneously.
- After 3 eliminated hypotheses, trigger meta-debugging to reassess approach.
- After 3+ failed fixes, STOP and question the architecture.
- Knowledge base matches are candidates only, never confirmed diagnoses.
- Auto-checkpoint when context is nearly full. Never lose progress.
- Follow `superteam:scientific-debugging` for investigation discipline.
