---
description: "Create a new milestone: version bump, questioning loop, requirements, and roadmap phases"
argument-hint: "[milestone description]"
---

# Create New Milestone

Create a new milestone for the project. Parses the current version from ROADMAP.md, suggests a new version (minor/major), appends the new milestone to ROADMAP.md. Reuses the `/st:init` flow (questioning, research, requirements, roadmap) but lighter: 5-10 question rounds, optional research.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - `.superteam/` exists?
     - No: "Project not initialized. Run `/st:init` first." then stop.
     - Yes: continue
   - ROADMAP.md exists?
     - Yes: parse milestone header `> Milestone: v{X.Y} -- [description]`
       - Incomplete phases remaining?
         ```
         ┌──────────────────────────────────────┐
         │ WARNING: CURRENT MILESTONE INCOMPLETE │
         ├──────────────────────────────────────┤
         │ Milestone: v[X.Y] -- [description]   │
         │ Incomplete phases:                    │
         │   [in-progress] Phase N: [name]       │
         │   [planned] Phase M: [name]           │
         │                                       │
         │ Options:                              │
         │   1. Run /st:milestone-complete first │
         │      (recommended)                    │
         │   2. Create new milestone anyway      │
         │      (old phases kept as-is)          │
         └──────────────────────────────────────┘
         ```
         - User chooses to continue: proceed
         - User chooses to complete first: stop
       - All completed: proceed
     - No ROADMAP.md: first milestone, version = v1.0, proceed
   - If no argument provided, ask: "What is the goal for the new milestone?"

2. **Determine version**
   - Parse current version from ROADMAP.md header (or v0.0 if first)
   - Parse last phase number
   - AI suggests new version:
     ```
     ┌──────────────────────────────────────┐
     │ VERSION                              │
     ├──────────────────────────────────────┤
     │ Previous milestone: v[X.Y]           │
     │ Phases: [N] ([completed] completed,  │
     │         [pending] pending)            │
     │                                      │
     │ New version:                         │
     │   * v[X.Y+1] (recommend -- iterative)│
     │   * v[X+1.0] (major -- breaking)     │
     │   * Custom: ___                      │
     │                                      │
     │ Phase numbering continues from:      │
     │ Phase [last+1]                       │
     └──────────────────────────────────────┘
     ```
   - User selects version

3. **Append milestone to ROADMAP.md**
   - If existing milestone:
     - Add `---` separator
     - Add new milestone header: `> Milestone: v{X.Y} -- [description]`
     - Keep old phases intact, do not collapse
     - If old REQUIREMENTS.md exists: rename to `REQUIREMENTS-v{old}.md` (backup)
   - If first milestone:
     - Create ROADMAP.md with milestone header
   - Follow `superteam:atomic-commits`
   - Commit: `docs: start milestone v{X.Y}`

4. **Questioning loop** (lighter version of /st:init)
   - Focus on 3 areas only: WHAT, SCOPE, DONE (skip WHO, EXIST)
   - Ask 5-10 questions, one at a time
   - Accept image input at any point
   - Summarize:
     ```
     ┌──────────────────────────────────────┐
     │ MILESTONE SUMMARY                    │
     ├──────────────────────────────────────┤
     │ Goals:                               │
     │   - [goal 1]                         │
     │   - [goal 2]                         │
     │                                      │
     │ Scope:                               │
     │   - [in scope]                       │
     │   - [out of scope]                   │
     │                                      │
     │ Done when:                           │
     │   - [completion criterion 1]         │
     │   - [completion criterion 2]         │
     │                                      │
     │ Sufficient? (accept / discuss more)  │
     └──────────────────────────────────────┘
     ```
   - User accepts: proceed
   - User wants more discussion: loop back to questions

5. **Update PROJECT.md**
   - Add section `Milestone v{X.Y}` to PROJECT.md
   - Document: goals, scope, relationship to previous milestone
   - Commit: `docs: update project for milestone v{X.Y}`

6. **Research decision** (optional)
   - AI evaluates: does the new milestone need research?
     - Same domain/stack: "No new research needed."
     - New domain: "Recommend research on [domain]. Proceed?"
   - User agrees: follow `superteam:research-methodology`
   - User skips: proceed

7. **Define requirements and roadmap**
   - Generate new REQUIREMENTS.md for this milestone
     - REQ-IDs continue from previous milestone (e.g., REQ-016, REQ-017...)
     - User reviews and approves
   - Spawn roadmapper:
     - Phase numbering continues (e.g., Phase 6, 7, 8...)
     - Map REQ-IDs to phases
     - Validate 100% coverage
     - User reviews and approves
   - Commit: `docs: define v{X.Y} requirements + roadmap ([N] phases)`

8. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > MILESTONE CREATED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   | Artifact       | Location                      |
   |----------------|-------------------------------|
   | Project        | .superteam/PROJECT.md         |
   | Requirements   | .superteam/REQUIREMENTS.md    |
   | Roadmap        | .superteam/ROADMAP.md         |

   Milestone: v{X.Y} -- [description]
   Phases: [N] (Phase [start]-[end])
   Requirements: [M] REQ-IDs

   > "/st:phase-discuss [start] to get started"
   ```

## Rules

- `.superteam/` must exist. If not, stop and instruct user to run `/st:init`.
- Warn about incomplete milestones but allow user to proceed. Never block.
- REQ-IDs and phase numbers always continue from previous milestone. Never restart from 1.
- Old phases in ROADMAP.md are kept intact. Never collapse or remove them.
- When backing up old REQUIREMENTS.md, rename to `REQUIREMENTS-v{old}.md`.
- Questioning is lighter than `/st:init`: 5-10 questions, 3 areas (WHAT, SCOPE, DONE).
- Research is optional. AI recommends based on domain similarity.
- Follow `superteam:project-awareness` for project context.
- Follow `superteam:atomic-commits` for all commits.
