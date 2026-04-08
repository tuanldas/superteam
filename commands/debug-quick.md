---
description: "Quick debug: fast fix for simple bugs in main context, auto-escalates to /st:debug if complex"
argument-hint: "[bug description]"
---

# Quick Debug

Debug a simple bug fast. Runs in main context (no separate agent), no session file, but still writes to knowledge base when done. Auto-escalates to `/st:debug` if the bug is more complex than expected.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Bug description from arguments. If empty, ask: "What bug?"
   - Accept image input (screenshot, console output)
   - Analyze images: extract error messages, UI state, console errors

2. **Auto-detect and read logs**
   - Detect framework from codebase, find log locations:
     - Laravel: `storage/logs/laravel.log`
     - Node/Express: console output, `debug.log`
     - Django: `django.log`, stderr
     - Spring: `logs/spring.log`
     - Docker: `docker logs <container>`
     - PM2: `~/.pm2/logs/`
     - nginx: `/var/log/nginx/error.log`
   - Read recent logs (filter by timestamp near bug occurrence)
   - Evaluate and filter:
     - Discard: unrelated logs (routine info, health checks, scheduled jobs)
     - Keep: errors, warnings, stack traces, entries related to the component/endpoint under debug
     - Priority: error > warning > unusual info patterns
   - Retain filtered logs as evidence

3. **Complexity check**
   - Assess the bug:
     - Complex: "This bug appears complex. Recommend `/st:debug` for systematic debugging. Agree?"
       - User agrees: hand off to `/st:debug`
       - User declines: continue with debug-quick
     - Simple: proceed

4. **Debug** (4 mandatory phases, main context)

   Follow `superteam:scientific-debugging` principles.

   **Phase 1: Root Cause Investigation**
   - Read error + filtered logs
   - Reproduce the bug
   - Check recent git changes
   - Trace data flow
   - May suggest: "Send me a screenshot of the console"

   ```
   ┌─────────────────────────────────────────────┐
   │ IRON LAW: NO FIXES WITHOUT ROOT CAUSE       │
   │ INVESTIGATION FIRST                          │
   └─────────────────────────────────────────────┘
   ```

   **Phase 2: Pattern Analysis**
   - Find working examples in codebase, compare with broken code

   **Phase 3: Hypothesis and Testing**
   - Form 1 hypothesis, test minimally
   - Eliminated? Form next hypothesis
   - 3 hypotheses fail? Suggest escalation to `/st:debug`:
     - Auto-create `.superteam/debug/{slug}.md` from collected evidence
     - Transfer: symptoms, eliminated hypotheses, evidence entries
     - Continue investigation in `/st:debug` without losing data

   **Phase 4: Implementation**
   - Write failing test reproducing the bug (follow `superteam:tdd-discipline`)
   - Fix the code
   - Verify fix: failing test now passes
   - Run full test suite

5. **Knowledge base**
   - Append to `.superteam/debug/knowledge-base.md` (create file + directory if missing):
     - slug, date, error patterns, root cause, fix, files changed

6. **Done** (2 outcomes)

   Success:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > DEBUG COMPLETE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Root cause: [description]
   Fix: [description]
   Tests: [N] added, all passing
   Commit: "fix: [description]"
   ```

   Escalated:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > ESCALATED -> /st:debug
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Session: .superteam/debug/{slug}.md
   Evidence transferred: [N] entries
   Hypotheses eliminated: [M]
   > Continue investigation in /st:debug
   ```

## Rules

- All 4 debug phases are mandatory. Do not skip any phase.
- Never fix without investigating root cause first (Iron Law).
- After 3 failed hypotheses, suggest escalation. Do not keep guessing.
- When escalating, auto-create the debug session file and transfer all evidence.
- Always write to knowledge base on completion, even for simple bugs.
- Always add a failing test before implementing the fix.
- Follow `superteam:atomic-commits` for the fix commit.
- Follow `superteam:core-principles`. Load references: questioning, decision-continuity.
