---
description: "Archive completed milestone files: move phases and research, clean up for next milestone"
argument-hint: "[version, e.g. v1.0]"
---

# Milestone Archive

Clean up files after a milestone is completed. Move phase directories and research into `milestones/v{X.Y}-phases/`, remove the root REQUIREMENTS.md (backup already exists in milestones/). Preserve: config.json, PROJECT.md, MILESTONES.md, ROADMAP.md, plans/.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - MILESTONES.md exists in `.superteam/`?
     - No: "No completed milestone found. Run /st:milestone-complete first." -- stop
   - Determine milestone to archive:
     - Argument provided: use that version
     - No argument: find the most recently completed milestone not yet archived (no `*-phases/` directory)
   - Already archived? (`.superteam/milestones/v{X.Y}-phases/` exists)
     - Yes: "Milestone v{X.Y} already archived. Re-archive? (y/n)"
   - Use `superteam:project-awareness` to load project context

2. **Scan artifacts and show plan**
   - Find all files/directories to process:
     - `phases/` directories belonging to the milestone
     - `research/` directory
     - Root `REQUIREMENTS.md`
   - Present the plan:
     ```
     ┌──────────────────────────────────────┐
     │ MILESTONE ARCHIVE                   │
     ├──────────────────────────────────────┤
     │ Milestone: v{X.Y} -- [name]        │
     │                                      │
     │ Will MOVE into                      │
     │ milestones/v{X.Y}-phases/:          │
     │   phases/core-framework/            │
     │   phases/documentation/             │
     │   phases/authentication/            │
     │   research/                         │
     │                                      │
     │ Will REMOVE (backup in milestones/):│
     │   REQUIREMENTS.md                   │
     │                                      │
     │ Will KEEP:                          │
     │   config.json                       │
     │   PROJECT.md                        │
     │   MILESTONES.md                     │
     │   ROADMAP.md (history)              │
     │   milestones/                       │
     │   plans/                            │
     │                                      │
     │ Continue? (y/n)                     │
     └──────────────────────────────────────┘
     ```
   - User confirms: proceed
   - User cancels: stop

3. **Execute archive**
   - Create: `.superteam/milestones/v{X.Y}-phases/`
   - Move: `phases/*` into `milestones/v{X.Y}-phases/`
   - Move: `research/` into `milestones/v{X.Y}-phases/research/`
   - Delete: root `REQUIREMENTS.md`
   - Commit: `chore: archive milestone v{X.Y} phase files`

4. **Verify clean state**
   - Scan `.superteam/` and display:
     ```
     ┌──────────────────────────────────────┐
     │ CLEAN STATE                         │
     ├──────────────────────────────────────┤
     │ .superteam/                         │
     │   config.json             ok        │
     │   PROJECT.md              ok        │
     │   MILESTONES.md           ok        │
     │   ROADMAP.md              ok        │
     │   milestones/             ok        │
     │   plans/                  ok        │
     │                                      │
     │ Ready for next milestone            │
     └──────────────────────────────────────┘
     ```

5. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > MILESTONE ARCHIVED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Archived: v{X.Y} ([N] phase directories + research)
   Location: .superteam/milestones/v{X.Y}-phases/
   Cleaned: REQUIREMENTS.md

   > /st:milestone-new to create next milestone
   ```

## Rules

- Milestone MUST be completed (entry in MILESTONES.md) before archiving.
- Always show the full list of what will be moved/removed/kept and get user confirmation before executing.
- Verify clean state after archive to confirm nothing was missed.
- Preserve these living documents: config.json, PROJECT.md, MILESTONES.md, ROADMAP.md, plans/.
- ROADMAP.md is kept because it contains continuous history across milestones.
- plans/ are kept because they may be referenced across milestones.
- Commit all changes with a descriptive message.
- Follow `superteam:core-principles`. Load references: questioning.
