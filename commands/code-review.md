---
description: "Code review: linting + 12 specialized agents in parallel, confidence-scored report, auto-fix"
argument-hint: "[#PR] [path] [--only agent1,agent2]"
---

# Code Review

Layered code review: linting first, then 12 specialized agents in parallel, confidence-scored report, auto-fix with verification. Supports local diff, PR, and specific files.

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

4. **Layer 2: 12 Specialized agents** (all parallel by default)
   - Override with `--only agent1,agent2` to select specific agents
   - Follow `superteam:requesting-code-review` for agent dispatch

   | # | Agent | Focus |
   |---|-------|-------|
   | 1 | Code Quality | Error handling, naming, DRY, YAGNI, plan alignment |
   | 2 | Clean Code | SRP, magic numbers, dead code, over-engineering, code smells |
   | 3 | Security | OWASP top 10, secrets, SQL injection, XSS, CSRF, input validation |
   | 4 | Silent Failure | Empty catch, catch-and-continue, missing logs, swallowed errors |
   | 5 | Test Analyzer | Behavioral coverage, critical gaps, edge cases, test quality |
   | 6 | Performance | N+1, memory leaks, re-renders, bundle size, blocking main thread |
   | 7 | Comment/Docs | Outdated comments, misleading, "what" vs "why", missing docs |
   | 8 | Architecture | Circular deps, god class, SOLID, module structure, patterns |
   | 9 | Dependency | Package justified? maintained? secure? lightweight alternatives? |
   | 10 | Compatibility | Breaking changes, API contract, backward compat, deprecation |
   | 11 | Accessibility | ARIA, contrast ratio, keyboard nav, screen reader, semantic HTML |
   | 12 | Business Logic | Requirements compliance, form validation, business edge cases |

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
     Code Quality:      [N]
     Clean Code:        [N]
     Security:          [N]
     Silent Failures:   [N]
     Testing:           [N]
     Performance:       [N]
     Comments/Docs:     [N]
     Architecture:      [N]
     Dependencies:      [N]
     Compatibility:     [N]
     Accessibility:     [N]
     Business Logic:    [N]
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
   - Spawn fix agents in parallel
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
   Agents: 12 | Fixed: [N] | Skipped: [M] | Tests: pass
   ```

## Rules

- All 12 agents run by default. Use `--only` to override, never let AI select agents automatically.
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
