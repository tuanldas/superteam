---
description: "Remove a phase from ROADMAP.md with safety checks and requirement reassignment"
argument-hint: "[phase number or name]"
---

# Phase Remove

Remove a phase from ROADMAP.md. Requires reassigning all REQ-IDs to other phases before deletion (ensures 100% requirement coverage). Detects dependencies and warns. Auto-renumbers remaining phases.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - ROADMAP.md exists? If not: "No ROADMAP.md found. Run /st:init first." -- stop
   - Parse all existing phases
   - Identify target phase by number or name from arguments
   - If no argument: show phase list and ask user to choose
   - Use `superteam:project-awareness` to load project context

2. **Show phase details**
   ```
   ┌──────────────────────────────────────┐
   │ PHASE TO REMOVE                     │
   ├──────────────────────────────────────┤
   │ Phase [X]: [name]                   │
   │ Status: [status]                    │
   │ Requirements: REQ-XXX, REQ-YYY     │
   │ Success criteria: [N] items         │
   │ Plan files: [list if any]           │
   └──────────────────────────────────────┘
   ```

3. **Status warning** (if not planned)
   - **completed**: "WARNING: This phase is COMPLETED. Removing it will not undo code already written. Are you sure? (y/n)"
   - **in-progress**: "WARNING: This phase is IN PROGRESS. There may be WIP code and plan files. Are you sure? (y/n)"
   - **planned**: no special warning

4. **Dependency check**
   - Analyze: which phases depend on output from the phase being removed?
   - If dependencies found:
     ```
     ┌──────────────────────────────────────┐
     │ DEPENDENCY WARNING                  │
     ├──────────────────────────────────────┤
     │ These phases depend on Phase [X]:   │
     │                                      │
     │ Phase [Y]: [name]                   │
     │   -> Needs [output] from Phase [X]  │
     │                                      │
     │ Recommend: review those phases      │
     │ after removal.                      │
     │ Continue? (y/n)                     │
     └──────────────────────────────────────┘
     ```
   - No dependencies: continue

5. **Reassign requirements** (mandatory)
   - Suggest a target phase for each REQ-ID:
     ```
     ┌──────────────────────────────────────┐
     │ REASSIGN REQUIREMENTS               │
     ├──────────────────────────────────────┤
     │ REQ-012: User authentication        │
     │   -> Suggest: Phase [Y] (API Layer) │
     │                                      │
     │ REQ-013: Session management         │
     │   -> Suggest: Phase [Y] (API Layer) │
     └──────────────────────────────────────┘
     ```
   - User: approve or change assignments
   - ALL REQ-IDs must be reassigned before proceeding

6. **Execute removal**
   - Remove phase section from ROADMAP.md
   - Renumber all subsequent phases: [X+1] -> [X], [X+2] -> [X+1], etc.
   - Update REQ-ID assignments in ROADMAP.md
   - Delete related plan files if any: `.superteam/plans/[phase-name].md`
   - Commit: `docs: remove phase [X] - [name], renumber [X+1]->[N]`

7. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > PHASE REMOVED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Removed: Phase [X] - [name]
   REQs reassigned: [N] requirements
   Renumbered: Phase [X+1]->[N] -> [X]->[N-1]
   Total phases: [N-1]
   ```

## Rules

- ALWAYS require REQ-ID reassignment before deletion. No requirement may be orphaned.
- Warn strongly for completed and in-progress phases but allow removal if user confirms.
- Detect and display inter-phase dependencies before proceeding.
- Auto-renumber phases after removal to maintain sequential ordering.
- Clean up related plan files in `.superteam/plans/`.
- Commit all changes with a descriptive message.
- Follow `superteam:core-principles`. Load references: questioning.
