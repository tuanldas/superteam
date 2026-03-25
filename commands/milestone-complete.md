---
description: "Complete the current milestone: archive docs, write retrospective, update PROJECT.md, create git tag"
---

# Milestone Complete

Finalize the current milestone: pre-flight check (AUDIT must be passed), gather stats, archive docs, write MILESTONES.md entry with retrospective, update PROJECT.md, and create git tag. Source files are preserved — `/st:milestone-archive` handles cleanup separately.

**Requirement:** AUDIT.md must exist and be PASSED.

## Workflow

1. **Pre-flight check**
   - ROADMAP.md must exist. If not, stop.
   - Parse current milestone: version, description
   - Check `.superteam/milestones/v[X.Y]-AUDIT.md`:
     - Does not exist:
       ```
       AUDIT REQUIRED
       No AUDIT.md found for milestone v[X.Y].
       > Run /st:milestone-audit first
       ```
       Stop.
     - Exists but has gaps:
       ```
       AUDIT HAS GAPS
       Audit for v[X.Y] has [N] unresolved gaps.
       > Fix gaps then run /st:milestone-audit again
       ```
       Stop.
     - Exists and PASSED: proceed
   - Present confirmation:
     ```
     MILESTONE COMPLETION
     Milestone: v[X.Y] - [description]
     Phases: [N] (all completed)
     Requirements: [M] (100% covered)
     Audit: PASSED

     Proceed with completion? (y/n)
     ```
   - Wait for user confirmation

2. **Gather stats**
   - Parse from ROADMAP.md + AUDIT.md + REQUIREMENTS.md + git log:
     - Total phases, total REQs
     - Total commits (git log for this milestone period)
     - Start date (first phase commit)
     - End date (today)
     - Key accomplishments (from phase names + success criteria)

3. **Archive docs**
   - Copy into `.superteam/milestones/v[X.Y]/`:
     - ROADMAP.md -> `milestones/v[X.Y]/ROADMAP.md`
     - REQUIREMENTS.md -> `milestones/v[X.Y]/REQUIREMENTS.md`
     (AUDIT.md is already there from milestone-audit)
   - Source files are preserved — do NOT delete originals
   - Follow `superteam:atomic-commits`
   - Commit: `docs: archive milestone v[X.Y] docs`

4. **Write MILESTONES.md entry with retrospective**
   - File: `.superteam/MILESTONES.md`
   - If file does not exist: create with header
   - If file exists: prepend new entry (newest first)
   - AI drafts the entry + retrospective:
     ```
     MILESTONES.md ENTRY (draft)

     ## v[X.Y] - [description]
     - Duration: [start date] -> [end date]
     - Phases: [N] (Phase 1-N)
     - Requirements: [M] fulfilled
     - Commits: [C]

     ### Accomplishments
     - [Phase 1 name]: [key outcome]
     - [Phase 2 name]: [key outcome]
     ...

     ### Retrospective
     - Went well:
       1. [positive observation]
       2. [positive observation]
     - Could improve:
       1. [improvement area]
       2. [improvement area]
     - Lessons:
       1. [takeaway]

     Approve this entry? Edit / confirm
     ```
   - Wait for user: confirm or edit
   - Follow `superteam:atomic-commits`
   - Commit: `docs: complete milestone v[X.Y]`

5. **Update PROJECT.md**
   - AI reviews PROJECT.md and suggests updates:
     - Requirements fulfilled -> move to Validated
     - Assumptions confirmed or invalidated
     - Scope changes from the milestone
   - Present suggestions:
     ```
     PROJECT.md UPDATES
     Suggestions:
       1. Requirements REQ-001..015 -> move to Validated
       2. Assumption #3: "[text]" -> Confirmed
       3. Scope: [observation]

     Approve / edit / skip?
     ```
   - Wait for user: approve / edit / skip
   - If changes made: commit `docs: update project after v[X.Y]`

6. **Git tag**
   - Create annotated tag:
     `git tag -a v[X.Y] -m "Milestone v[X.Y]: [description]"`
   - Report: "Tag v[X.Y] created. Push with: git push origin v[X.Y]"

7. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > MILESTONE COMPLETED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   | Artifact   | Location                          |
   |------------|-----------------------------------|
   | Archive    | .superteam/milestones/v[X.Y]/     |
   | History    | .superteam/MILESTONES.md          |
   | Git tag    | v[X.Y]                            |

   Milestone: v[X.Y] - [description]
   Duration: [start] -> [end]
   Phases: [N] | REQs: [M] | Commits: [C]

   > "/st:milestone-archive" to clean up phase files
   > "/st:milestone-new" to start the next milestone
   ```

## Rules

- AUDIT.md MUST exist and be PASSED. This is a hard gate — do not bypass.
- Archive copies files, does NOT delete originals. Cleanup is a separate concern (`/st:milestone-archive`).
- MILESTONES.md uses newest-first ordering. Prepend, do not append.
- Retrospective is drafted by AI but MUST be confirmed by the user before saving.
- PROJECT.md updates are suggestions — user can skip entirely.
- Git tag is annotated (not lightweight). Use `git tag -a`.
- Do NOT push the tag automatically. Only tell the user how to push.
- One milestone at a time. This always operates on the current milestone from ROADMAP.md.
- Each step that writes files gets its own atomic commit.
