---
description: "List all phases in ROADMAP.md with status, requirements, and progress"
argument-hint: "[--planned | --in-progress | --completed]"
---

# Phase List

Display all phases from ROADMAP.md with status, requirements, and progress. Read-only command -- changes nothing.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - ROADMAP.md exists in `.superteam/`?
     - No: "No ROADMAP.md found. Run /st:init first." -- stop
     - Yes: proceed
   - Use `superteam:project-awareness` to load project context

2. **Parse phases**
   - Read each phase: number, name, status, REQ-IDs, success criteria
   - Calculate progress: checked criteria / total criteria
   - Parse filter flag from arguments if present:
     - `--planned` -- only planned phases
     - `--in-progress` -- only in-progress phases
     - `--completed` -- only completed phases
     - No flag -- show all phases

3. **Present**
   ```
   ┌──────────────────────────────────────────────────┐
   │ ROADMAP -- Milestone: [name]                     │
   │ Total: [N] phases | Done: [X] | Active: [Y] | Planned: [Z] │
   ├──────────────────────────────────────────────────┤
   │                                                  │
   │ [done] Phase 1: [name]                           │
   │    REQs: REQ-001, REQ-002, REQ-003              │
   │    Progress: 3/3 criteria ========== 100%        │
   │                                                  │
   │ [active] Phase 2: [name]                         │
   │    REQs: REQ-004, REQ-005                       │
   │    Progress: 1/2 criteria =====..... 50%         │
   │                                                  │
   │ [planned] Phase 3: [name]                        │
   │    REQs: REQ-012, REQ-013, REQ-015              │
   │    Progress: 0/4 criteria .......... 0%          │
   │                                                  │
   ├──────────────────────────────────────────────────┤
   │ > /st:phase-discuss [N] to start a phase         │
   │ > /st:phase-add to add a new phase               │
   └──────────────────────────────────────────────────┘
   ```

## Rules

- Read-only. Do NOT modify any files.
- Display phases in ROADMAP order (phase number).
- Show visual progress bar for each phase using criteria completion.
- Always include summary header with totals by status.
- Always suggest next action commands at the bottom.
- If filter applied, still show the summary header with full totals, but only list matching phases.
- Follow `superteam:core-principles` for all work.
