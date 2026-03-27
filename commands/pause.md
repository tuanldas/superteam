---
description: "Pause current workflow and create handoff files for later resume"
argument-hint: "[optional reason/notes]"
---

# Pause & Handoff

Pause any running workflow (execute, debug, quick, ui-design, plan...). Create handoff files capturing full state including mental context. Commit WIP changes.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Optional message from arguments (reason for pausing, notes for resume)
   - If no message provided, proceed without one

2. **Detect current state**
   - Identify active workflow: execute / debug / quick / ui-design / plan / other
   - Current phase and task (if applicable)
   - Modified files via `git status`
   - Active plans being executed
   - Active debug sessions
   - Uncommitted changes

3. **Gather context**
   - Synthesize the following:
     - **Completed:** tasks done, commits made
     - **Remaining:** tasks still pending
     - **Decisions:** decisions made with rationale
     - **Blockers:** issues blocking progress (if any)
     - **Context/mental state:** observations, concerns, hunches, direction changes
     - **Next action:** exact next step when resumed

4. **Write handoff files**
   - Write `.superteam/HANDOFF.json` (machine-readable):
     ```json
     {
       "version": 1,
       "timestamp": "ISO-8601",
       "workflow": "execute|debug|quick|ui-design|plan|...",
       "phase": "phase-name (if applicable)",
       "task": { "current": N, "total": M },
       "completed_tasks": [{ "name": "...", "commit": "sha" }],
       "remaining_tasks": ["..."],
       "blockers": [{ "type": "technical|human_action|external", "description": "..." }],
       "decisions": [{ "decision": "...", "rationale": "..." }],
       "uncommitted_files": ["..."],
       "next_action": "...",
       "context": "...",
       "user_message": "..."
     }
     ```
   - Write `.superteam/HANDOFF.md` (human-readable) with YAML frontmatter and sections:
     Current State, Completed Work, Remaining Work, Decisions Made, Blockers, Context, Next Action

5. **Commit WIP**
   - Stage all uncommitted changes
   - Commit with message: `wip: [workflow] paused at [state description]`
   - Follow `superteam:handoff-protocol` for handoff quality

6. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > PAUSED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Workflow: [execute/debug/quick/...]
   Progress: [N]/[M] tasks
   Handoff: .superteam/HANDOFF.json + HANDOFF.md
   > Run /st:resume to continue
   ```

## Rules

- Universal scope: works for ANY workflow, not just execute.
- Always write BOTH HANDOFF.json (machine) and HANDOFF.md (human).
- Always include mental state/context -- observations, concerns, hunches. This is critical for resume quality.
- Handoff files are one-shot: they get deleted on resume.
- Always commit WIP before finishing pause, even if changes are partial.
- If user provides a message, store it in `user_message` field and reference it in HANDOFF.md.
- Use `superteam:project-awareness` for loading project context.
- Use `superteam:handoff-protocol` for handoff file quality.
- Follow `superteam:core-principles` for all work.
