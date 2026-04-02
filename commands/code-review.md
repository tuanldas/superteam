---
description: "Code review: linting + 1 reviewer agent (13 domains), confidence-scored report, auto-fix"
argument-hint: "[#PR] [path] [--only agent1,agent2]"
---

# Code Review

Layered code review: linting first, then 1 reviewer agent covering 13 domains, confidence-scored report, auto-fix with verification. Supports local diff, PR, and specific files.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Detect scope**
   - No argument: local changes (`git diff` staged + unstaged)
   - `#123`: PR review (use `gh` CLI to fetch diff)
   - `src/auth/`: specific files or folder
   - `--only security,test`: run only selected agents
   - If no changes found: "Nothing to review."
   - Accept image input: screenshot of UI bug, visual regression

2. **Gather context**
   - Code changes (diff)
   - `.superteam/config.json` (conventions, preferences)
   - `.superteam/REQUIREMENTS.md` (for Business Logic agent)
   - `.superteam/DESIGN-SYSTEM.md` (for Accessibility agent)
   - Related plan file (for Code Quality agent - plan alignment)
   - Existing patterns in codebase
   - Use `superteam:project-awareness` for context loading

3. **Layer 1: Linting**
   - Detect existing linter (ESLint, Prettier, Pint, Black, Ruff, etc.)
   - If linter exists: run it, auto-fix what it can
   - If no linter found:
     "Project has no linter. Recommend setting up [X]. Want to set it up?"
     - User agrees: setup and run
     - User declines: skip, proceed to layer 2

4. **Layer 2: Reviewer Agent — 13 Domains**
   - Spawn 1 reviewer agent (Opus). Agent tự select relevant domains từ 13 available.
   - Override with `--only domain1,domain2` to force specific domains
   - Follow `superteam:requesting-code-review` for review methodology

   | # | Domain | Focus |
   |---|--------|-------|
   | 1 | Silent Failure | Empty catch, swallowed errors, missing propagation |
   | 2 | Business Logic | Requirements compliance, validation rules, edge cases |
   | 3 | Security | OWASP top 10, secrets, injection, auth bypass |
   | 4 | Error Handling | Missing handlers, wrong status codes, leaked internals |
   | 5 | Performance | N+1 queries, unbounded queries, blocking, missing cache |
   | 6 | API Contract | Breaking changes, inconsistent formats, wrong methods |
   | 7 | Test Coverage | Missing tests, weak assertions, happy-path-only |
   | 8 | Type Safety | any usage, missing null checks, type assertion abuse |
   | 9 | Accessibility | ARIA, keyboard nav, semantic HTML, contrast |
   | 10 | Design System | Token compliance, component reuse, responsive behavior |
   | 11 | Database & Data | Migrations, constraints, indexes, orphaned records |
   | 12 | Dependencies | Justified? Secure? Minimal import? Circular? |
   | 13 | Concurrency & Async | Race conditions, missing await, TOCTOU, deadlocks |

   - Confidence scoring: only report issues with confidence >= 80%
   - Severity classification:
     - **Critical**: confidence 90-100
     - **Important**: confidence 80-89

5. **Layer 3: Aggregate report**
   ```
   CODE REVIEW REPORT
   ─────────────────────────────────────────
   Linting:     [N] fixed, [M] remaining
   Critical:    [N] issues (confidence 90+)
   Important:   [N] issues (confidence 80+)
   Suggestions: [N]
   ─────────────────────────────────────────
   By domain:
     Silent Failure:      [N]
     Business Logic:      [N]
     Security:            [N]
     Error Handling:      [N]
     Performance:         [N]
     API Contract:        [N]
     Test Coverage:       [N]
     Type Safety:         [N]
     Accessibility:       [N]
     Design System:       [N]
     Database & Data:     [N]
     Dependencies:        [N]
     Concurrency & Async: [N]
   ─────────────────────────────────────────
   [Detailed issues:
    file:line, agent, severity, confidence,
    description, suggested fix]
   ─────────────────────────────────────────
   Strengths: [things done well]
   ```

6. **User action**
   - "Fix all critical" -> fix critical issues only
   - "Fix all" -> fix all reported issues
   - "Skip" -> no fixes
   - Select individual issues to fix

7. **Fix with receiving logic**
   - Follow `superteam:receiving-code-review`
   - Spawn executor agents in parallel to fix
   - Each fix goes through receiving logic:
     1. Verify the issue actually exists in current code
     2. Check fix does not break anything else
     3. Skip if issue is a false positive
   - Run tests after each batch of fixes
   - Report: "Fixed [N] | Skipped [M] (reasons) | Tests: pass/fail"
   - Commit: `fix: code review - [summary]`
   - Follow `superteam:atomic-commits`

8. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > CODE REVIEW COMPLETE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Domains: 13 | Fixed: [N] | Skipped: [M] | Tests: pass
   ```

## Rules

- All 13 domains checked by default. Use `--only` to limit to specific domains.
- Confidence threshold is 80%. Do NOT report issues below 80% confidence.
- Critical = 90+ confidence. Important = 80-89 confidence. This is strict.
- Linting runs FIRST (layer 1) before agents (layer 2). Always respect this order.
- Every fix goes through receiving logic: verify issue exists, check for regressions, skip false positives.
- Follow `superteam:requesting-code-review` for dispatching review agents.
- Follow `superteam:receiving-code-review` for processing and applying fixes.
- Image input accepted for visual regression or UI bug screenshots.
- Report includes Strengths section. Acknowledge what was done well.
- Tests must run after fixes. If tests fail, fix the regression before committing.
- Follow `superteam:core-principles`. Load references: visual-first.
