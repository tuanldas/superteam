---
description: "Resume a paused workflow from handoff files"
---

# Resume from Handoff

Resume a previously paused workflow. Load handoff files, display status, let user choose action. Works even without handoff files via hybrid reconstruct. Cleans up handoff files after successful resume.

## Workflow

1. **Check handoff files**
   - `.superteam/HANDOFF.json` exists?
     - Yes: load structured data
     - No: `.superteam/HANDOFF.md` exists?
       - Yes: parse YAML frontmatter + content
       - No: offer reconstruct --
         "No handoff found. Want me to scan the project to determine state?"
         - User agrees: scan `.superteam/`, git log, plan files, debug sessions to reconstruct state
         - User declines: "OK, use /st:pause next time to save state."

2. **Validate state**
   - Do uncommitted files in HANDOFF.json still match `git status`?
   - Do referenced plan files still exist?
   - Are debug sessions still active?
   - If inconsistencies found: warn user with specifics

3. **Present status**
   ```
   ┌──────────────────────────────────────────────┐
   │ ST > RESUME                                  │
   ├──────────────────────────────────────────────┤
   │ Workflow: [workflow]                          │
   │ Phase: [phase]                               │
   │ Progress: [N]/[M] tasks                      │
   │ Paused: [timestamp] ([relative time] ago)    │
   │ Next: [next action]                          │
   ├──────────────────────────────────────────────┤
   │ Context: [mental state / notes]              │
   ├──────────────────────────────────────────────┤
   │ Blockers: [blockers or "None"]               │
   └──────────────────────────────────────────────┘
   ```

4. **Show options**
   ```
   1) Continue [workflow] from task [N]
   2) View handoff details (HANDOFF.md)
   3) Start a different task (keep handoff for later)
   4) Discard handoff (delete files, start fresh)
   ```
   Wait for user choice.

5. **Execute choice**
   - Option 1: Route to the correct workflow command
     - execute: continue `/st:execute` from task N
     - debug: continue `/st:debug` (load debug session)
     - quick: continue `/st:quick` (load plan)
     - ui-design: continue `/st:ui-design`
   - Delete HANDOFF.json + HANDOFF.md after successful resume
   - Option 2: Display full HANDOFF.md content, then re-show options
   - Option 3: Keep handoff files, exit
   - Option 4: Delete HANDOFF.json + HANDOFF.md, confirm deletion

6. **Done** (if option 1 chosen)
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > RESUMED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Continuing: [workflow] from task [N]/[M]
   ```

## Reconstruct (when no handoff files exist)

Scan in this order:
1. `.superteam/plans/` -- plan files with unchecked tasks
2. `.superteam/debug/` -- active debug sessions (status != resolved)
3. `.superteam/quick/` -- quick tasks without SUMMARY.md
4. `git log` -- recent WIP commits
5. `git status` -- uncommitted changes

Present findings and let user choose which to resume.

## Rules

- Always show status and options before resuming. Let the USER decide.
- Always validate state consistency before presenting options.
- Delete handoff files only after successful resume (option 1) or explicit discard (option 4).
- Hybrid reconstruct: offer scanning when no handoff files found. Never refuse to help.
- Universal scope: can resume ANY workflow type.
- Use `superteam:project-awareness` for loading project context.
- Use `superteam:handoff-protocol` for interpreting handoff data.
- Follow `superteam:core-principles` for all work.
