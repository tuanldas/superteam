---
description: "Validate phase completion through 4 verification layers: criteria, tests, integration, user acceptance"
argument-hint: "[phase number or name]"
---

# Phase Validate

Confirm a phase is truly complete through 4 layers of verification: auto-check success criteria, test suite, cross-phase integration, and user acceptance testing (UAT). If all 4 layers pass, auto-update ROADMAP status to completed. Output: VERIFICATION.md.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - ROADMAP.md must exist. If not, stop: "No ROADMAP.md found."
   - Parse phase from argument: match by number or name
   - If no argument: list in-progress phases, ask user to pick
   - Parse phase details: number, name, status, success criteria
   - Check phase status:
     - planned: "This phase has not been executed yet. Run /st:phase-execute first."
     - in-progress: proceed normally
     - completed: "This phase is already validated. Validate again?"
   - Load: PLAN.md, CONTEXT.md (if exists)
   - Use `superteam:project-awareness` for codebase context

2. **Layer 1: Auto-check success criteria**
   - For each criterion from ROADMAP.md:
     - Grep codebase for related artifacts/code
     - Run specific tests (if tests exist for this criterion)
     - AI evaluates: criterion MET or NOT MET
   - Follow `superteam:verification` methodology
   - Present results:
     ```
     LAYER 1: SUCCESS CRITERIA
     [pass/fail] [criterion]
       Evidence: [test file pass count or code evidence]

     [pass/fail] [criterion]
       Missing: [what is absent]

     Result: [X]/[Y] passed
     ```

3. **Layer 2: Test suite**
   - Run the full test suite (npm test, pytest, cargo test, etc.)
   - Present results:
     ```
     LAYER 2: TEST SUITE
     Total: [N] tests
     Passed: [X]
     Failed: [Y]

     Failures:
       [file:line] - [reason]

     Result: [PASS/FAIL]
     ```

4. **Layer 3: Cross-phase integration + UI audit**
   - Spawn integration-checker agent:
     - Run full test suite (not just this phase's tests)
     - Check regression: are previously completed phases broken?
     - Check interfaces: API contracts, shared types, DB schema consistency
   - If phase involves UI (has UI-SPEC or frontend success criteria): spawn ui-auditor agent in parallel with integration-checker
     - 6-pillar visual audit against UI-SPEC
     - Produces UI-REVIEW.md in phase directory
   - Present results:
     ```
     LAYER 3: CROSS-PHASE INTEGRATION
     Phase 1 ([name]): [pass/regression]
     Phase 2 ([name]): [pass/regression]
     Interfaces: [consistent/issues]

     Result: [PASS/FAIL]
     ```

5. **Layer 4: User Acceptance Testing (UAT)**
   - Ask user about each criterion one by one:
     "1. [criterion] -- does this meet your expectations?"
     User responds: accepted / not accepted + reason
   - Present results:
     ```
     LAYER 4: USER ACCEPTANCE
     [pass/fail] [criterion]
     [pass/fail] [criterion]
       User: "[reason if not accepted]"

     Result: [X]/[Y] accepted
     ```

6. **Summary and decision**
   ```
   VALIDATION SUMMARY
   Phase [X]: [name]

   Layer 1 (Criteria):    [X]/[Y]
   Layer 2 (Tests):       [PASS/FAIL]
   Layer 3 (Integration): [PASS/FAIL]
   Layer 4 (UAT):         [X]/[Y]

   Overall: [PASSED / NOT PASSED]

   Issues:
     1. [issue description]
        -> Suggest: [fix action]
   ```

   - **ALL 4 PASS:**
     - Auto-update ROADMAP: in-progress -> completed
     - Check all criteria checkboxes in ROADMAP.md
     - Follow `superteam:atomic-commits`
     - Commit: `docs: complete phase [X] - [name]`
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST > PHASE VALIDATED — COMPLETED
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     > "/st:phase-execute [X+1]" to start next phase
     > "/st:milestone-audit" if this is the final phase
     ```

   - **HAS FAILURES:**
     - Status stays in-progress
     - List issues + suggest fixes
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST > PHASE VALIDATION: [N] ISSUES
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     > Fix issues then run /st:phase-validate [X] again
     > "/st:phase-execute [X]" to fix and re-execute
     ```

7. **Write VERIFICATION.md**
   - Save to: `.superteam/phases/[phase-name]/VERIFICATION.md`
   - Content: results from all 4 layers, issues, decisions
   - Follow `superteam:atomic-commits`
   - Commit: `docs: validate phase [X] - [name] ([pass/fail])`

## Rules

- Phase MUST be in-progress (or completed for re-validation). Do not validate a planned phase.
- All 4 layers run in sequence: criteria -> tests -> integration -> UAT.
- Layer 4 (UAT) ALWAYS requires user input. Do not auto-approve on behalf of the user.
- Auto-complete (update ROADMAP to completed) ONLY when ALL 4 layers pass.
- If any layer fails, report issues with specific fix suggestions. Do not just say "failed".
- VERIFICATION.md is written regardless of pass/fail — it records the validation attempt.
- Integration check must cover ALL previously completed phases, not just adjacent ones.
- Do not skip layers. Even if Layer 1 fails, still run Layers 2-4 to get a complete picture.
- Follow `superteam:core-principles`. Load references: visual-first, questioning.
