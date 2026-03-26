---
description: "Add a new phase to the roadmap with smart positioning, requirement linking, and auto-renumbering"
argument-hint: "[phase description]"
---

# Add Phase to Roadmap

Add a new phase to ROADMAP.md with smart positioning. AI analyzes dependencies between phases to suggest the best position (end or middle), explains reasoning, and user confirms. Requires linking REQ-IDs, AI suggests success criteria. Auto-renumbers subsequent phases if inserting in the middle.

This command handles both "add to end" and "insert in middle" scenarios.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - ROADMAP.md exists?
     - No: "No ROADMAP.md found. Run `/st:init` first." then stop.
     - Yes: load ROADMAP.md + REQUIREMENTS.md + PROJECT.md
   - Parse existing phases: count, names, assigned REQ-IDs, statuses
   - Analyze dependencies between phases (from content + REQ relationships)
   - If no argument provided, ask: "What phase to add?"

2. **Analyze position** (smart positioning)
   - AI analyzes:
     - What outputs from earlier phases does this new phase depend on?
     - Which later phases will need outputs from this new phase?
     - Which REQ-IDs are related and near which phases?
     - Complexity progression: simple to complex
   - Present suggestion:
     ```
     ┌──────────────────────────────────────┐
     │ SUGGESTED POSITION                   │
     ├──────────────────────────────────────┤
     │ Phase [X]: [name]                    │
     │                                      │
     │ Why position [X]:                    │
     │ - Phase [X-1] "[name]" creates       │
     │   [dependency] that this phase needs │
     │ - Current Phase [X] "[name]"         │
     │   will need [output] from this phase │
     │                                      │
     │ Renumber impact:                     │
     │ - Phase [X] -> Phase [X+1]           │
     │ - Phase [X+1] -> Phase [X+2]         │
     │                                      │
     │ Or: append as Phase [N+1]            │
     │ if renumbering is not desired        │
     └──────────────────────────────────────┘
     ```
   - User: approve position / choose different position / append to end

3. **Link requirements**
   - Scan REQUIREMENTS.md:
     - Find unassigned REQ-IDs
     - Find REQ-IDs related to the phase description
   - Present:
     ```
     ┌──────────────────────────────────────┐
     │ REQUIREMENTS MAPPING                 │
     ├──────────────────────────────────────┤
     │ Recommended:                         │
     │   REQ-XXX: [description]             │
     │   REQ-YYY: [description]             │
     │                                      │
     │ Unassigned (possibly related):       │
     │   REQ-ZZZ: [description]             │
     │                                      │
     │ No matching REQ?                     │
     │ -> Create new REQ in REQUIREMENTS.md │
     └──────────────────────────────────────┘
     ```
   - User: approve / add / remove REQ-IDs
   - If no matching REQ: ask user to describe the new requirement, AI creates REQ with next available ID

4. **Success criteria**
   - AI suggests 2-5 criteria based on description + linked REQ-IDs
   - Make criteria grep-verifiable when possible
   - Present:
     ```
     ┌──────────────────────────────────────┐
     │ SUCCESS CRITERIA                     │
     ├──────────────────────────────────────┤
     │ 1. [criterion]                       │
     │ 2. [criterion]                       │
     │ 3. [criterion]                       │
     └──────────────────────────────────────┘
     ```
   - User: approve / edit / add / remove (must stay in 2-5 range)

5. **Validate**
   - Check:
     - REQ-IDs are not already assigned to another phase (no duplicates)
     - Phase name is unique in the roadmap
     - Criteria count is within 2-5 range
     - Position is valid (do not insert before a completed phase)
   - If issues found: report and suggest fixes

6. **Write changes**
   - Insert or append phase to ROADMAP.md at chosen position
   - If inserting in middle: renumber all subsequent phases
   - Status: planned
   - If new REQ was created: update REQUIREMENTS.md
   - Follow `superteam:atomic-commits`
   - Commit: `docs: add phase [X] - [name]`
     (if renumbered: `docs: add phase [X] - [name], renumber [old]->[new]`)

7. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > PHASE ADDED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Phase [X]: [name]
   Position: [X] of [total] (renumbered [N] phases)
   Requirements: [REQ-IDs]
   Success criteria: [count]
   > "/st:phase-discuss [X] to discuss before planning"
   ```

## ROADMAP.md Format

Phases follow this format in ROADMAP.md:

```markdown
## Phase N: [Name]
- **Status:** planned
- **Requirements:** REQ-XXX, REQ-YYY
- **Success Criteria:**
  - [ ] [criterion 1]
  - [ ] [criterion 2]
```

Status values: `completed` | `in-progress` | `planned`

## Rules

- Follow `superteam:questioning` for all user interactions.
- ROADMAP.md must exist. If it does not, stop and instruct user to run `/st:init`.
- AI must analyze dependencies and suggest position with clear reasoning. Never blindly append.
- At least 1 REQ-ID must be linked. If none match, create a new one.
- Success criteria must be in the 2-5 range.
- Never insert before a completed phase.
- REQ-IDs must not be duplicated across phases.
- Phase names must be unique in the roadmap.
- When inserting in middle, renumber only changes numbers -- never alter phase content.
- Follow `superteam:project-awareness` for codebase and project context.
