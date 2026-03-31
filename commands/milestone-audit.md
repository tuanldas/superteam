---
description: "Audit the current milestone: check phase completion, requirements coverage, and integration across all phases"
---

# Milestone Audit

Audit the entire current milestone through 3 layers: phase completion, requirements coverage (3-source cross-reference), and integration check. Output: AUDIT.md. When all pass, suggest `/st:milestone-complete`. When gaps exist, suggest specific commands to fix each gap.

**Requirement:** ROADMAP.md must exist with at least 1 completed phase.

## Workflow

1. **Check context**
   - ROADMAP.md must exist. If not, stop: "No ROADMAP.md found."
   - Parse current milestone: version, description, all phases
   - Are there completed phases?
     - If none: "No phases completed yet. Run /st:phase-validate first." Stop.
   - Present overview:
     ```
     MILESTONE AUDIT
     Milestone: v[X.Y] - [description]
     Phases: [N] total
       completed: [count]
       in-progress: [count]
       planned: [count]
     ```

2. **Layer 1: Phase completion**
   - For each phase in the milestone:
     - completed: check VERIFICATION.md exists, all criteria passed
     - in-progress: flag as gap
     - planned: flag as gap
   - Present results:
     ```
     LAYER 1: PHASE COMPLETION
     [pass] Phase 1: [name]
       VERIFICATION.md: exists
       All criteria: passed

     [warn] Phase 4: [name]
       NOT COMPLETED
       VERIFICATION.md: not found

     [warn] Phase 5: [name]
       NOT STARTED

     Result: [X]/[Y] phases completed
     ```

3. **Layer 2: Requirements coverage** (3-source cross-reference)
   - Source 1: REQUIREMENTS.md -> list all REQ-IDs
   - Source 2: ROADMAP.md -> which phase each REQ-ID is assigned to
   - Source 3: VERIFICATION.md of each phase -> which REQ-IDs are verified
   - Cross-reference to classify each REQ:
     - **COVERED**: has all 3 sources (assigned + phase completed + verified)
     - **INCOMPLETE**: assigned to a phase but phase not yet completed
     - **UNVERIFIED**: assigned, phase completed, but not in VERIFICATION.md
     - **ORPHAN**: in REQUIREMENTS.md but not assigned to any phase
   - Present results:
     ```
     LAYER 2: REQUIREMENTS COVERAGE
     Total REQs: [N]

     COVERED ([count]):
       REQ-001..REQ-010

     INCOMPLETE ([count]):
       REQ-011: Phase 4 (in-progress)
       REQ-012: Phase 5 (planned)

     UNVERIFIED ([count]):
       REQ-014: Phase 2 completed but not in VERIFICATION.md

     ORPHAN ([count]):
       REQ-015: Not assigned to any phase

     Coverage: [X]/[Y] ([percent]%)
     ```

4. **Layer 3: Integration check**
   - Spawn integration-checker agent:
     - Run full test suite
     - Check regression across all completed phases
     - Check interfaces: API contracts, shared types, DB schema
   - Present results:
     ```
     LAYER 3: INTEGRATION
     Test suite: [X] pass, [Y] fail
     Regression: [status]
     Interfaces: [status]

     Result: [PASS/FAIL]
     ```

5. **Audit summary and routing**
   ```
   AUDIT SUMMARY
   Milestone: v[X.Y] - [description]

   Layer 1 (Phases):      [X]/[Y]
   Layer 2 (Coverage):    [percent]%
   Layer 3 (Integration): [PASS/FAIL]

   Overall: [READY / NOT READY]
   ```

   - **ALL 3 PASS** (100% phases + 100% coverage + integration pass):
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST > MILESTONE AUDIT: PASSED
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     > "/st:milestone-complete" to finalize the milestone
     ```

   - **HAS GAPS:**
     - List each gap with a specific command to fix it:
       ```
       Gaps:
         1. Phase 4 not completed
            -> /st:phase-execute 4 then /st:phase-validate 4
         2. Phase 5 not started
            -> /st:phase-discuss 5
         3. REQ-014 unverified
            -> /st:phase-validate 2
         4. REQ-015 orphan
            -> Assign to a phase or remove from requirements
       ```
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST > MILESTONE AUDIT: [N] GAPS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     > Fix gaps then run /st:milestone-audit again
     ```

6. **Write AUDIT.md**
   - Create directory: `.superteam/milestones/` if it does not exist
   - Save to: `.superteam/milestones/v[X.Y]-AUDIT.md`
   - Content: all 3 layers results, gaps, recommendations
   - Follow `superteam:atomic-commits`
   - Commit: `docs: audit milestone v[X.Y] ([passed/N gaps])`

## Rules

- No arguments needed. Always audits the current milestone from ROADMAP.md.
- Milestone must have at least 1 completed phase to audit. Otherwise, nothing to check.
- 3-source cross-reference is MANDATORY for requirements coverage. Do not skip any source.
- Every gap MUST have an actionable command suggestion. Do not just list problems.
- AUDIT.md is a prerequisite for `/st:milestone-complete`. That command will check for it.
- Integration check covers ALL phases, not just completed ones — detect issues early.
- Run all 3 layers even if Layer 1 fails. Provide a complete picture.
- AUDIT.md is versioned (v[X.Y]-AUDIT.md) and stored in milestones/ directory.
- Follow `superteam:core-principles`. Load references: visual-first, questioning.
