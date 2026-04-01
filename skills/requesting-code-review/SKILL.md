---
name: requesting-code-review
description: >
  Use when reviewing code changes (local diff, PR, specific files).
  Enforces confidence-based severity, domain-specialized review,
  anti-false-positive discipline, and verify-before-fix logic.
---

# Requesting Code Review

## Overview

Requesting Code Review provides the review methodology and discipline injected into every review agent. It ensures reviews are evidence-based, properly calibrated, and actionable — not opinion-driven noise.

**Two responsibilities:**
1. **Methodology** — how to review: scope, context, confidence scoring, severity, per-issue format.
2. **Discipline** — anti-false-positive rules that resist Claude's default "everything is a problem" behavior.

## Core Principle

```
NO ISSUE REPORTED WITHOUT EVIDENCE AND CONFIDENCE >= 80%.

Opinions are not issues.
"I would have done it differently" is NOT a finding.
If you cannot point to a specific line and explain WHY it's wrong, it's not an issue.
```

This applies to every review domain. Below 80% confidence = do not report.

## When to Request Review

**Mandatory:**
- After completing a task batch in `/st:execute`
- After completing a phase in `/st:phase-execute`
- Before merging to main branch
- After fixing a complex bug (verify fix doesn't introduce new issues)

**Optional:**
- When stuck — fresh eyes on implementation approach
- Before major refactoring — validate plan before execution
- After learning new pattern — verify correct usage
- When inheriting unfamiliar code — review before modifying

**Never skip review because:**
- "It's a small change" — small changes cause big bugs
- "I wrote this myself" — self-review misses blind spots
- "We're in a hurry" — review catches issues that cost more to fix later
- "Tests pass" — passing tests ≠ good code

## Review Methodology

### Step 1: Scope Discipline

```
REVIEW ONLY CHANGED CODE.

Do not review adjacent unchanged code unless it directly interacts with the change.
Do not review the entire file when only 3 lines changed.
Do not review other files "while you're at it."
```

Scope sources:
- Local diff: `git diff` (unstaged) or `git diff --staged`
- PR: `gh pr diff {number}`
- Specific files: only the files specified
- SHA range: `git diff {BASE_SHA}..{HEAD_SHA}`

### Step 2: Context Gathering

Before reviewing a single line, read:
1. **Requirements** — `.superteam/REQUIREMENTS.md` or plan file for the task
2. **Design system** — `DESIGN-SYSTEM.md` if reviewing UI code
3. **Existing patterns** — scan codebase for how similar things are done
4. **Config** — `.superteam/config.json` for project preferences
5. **Project type** — from `superteam:project-awareness` context block

Review against **intent and requirements**, not personal preference.

### Step 3: Confidence Scoring

Every issue MUST have a confidence score (0-100).

| Confidence | Meaning | Action |
|-----------|---------|--------|
| 90-100 | Certain this is wrong. Evidence is clear. | Report as finding |
| 80-89 | Highly likely wrong. Strong evidence. | Report as finding |
| 60-79 | Possibly wrong. Some evidence. | Do NOT report. Investigate more or skip. |
| < 60 | Gut feeling. No concrete evidence. | Do NOT report. |

**Examples of confidence calibration:**

- `null` passed to function that doesn't handle null → **95%** (observable, testable)
- SQL query built with string concatenation → **95%** (known vulnerability pattern)
- Function does 3 things, could be split → **70%** (style preference, not bug) → DO NOT REPORT
- "This might be slow with large datasets" → **50%** (speculative) → DO NOT REPORT
- "I'd use a different library for this" → **30%** (opinion) → DO NOT REPORT

**Severity-adjusted confidence thresholds:**
- **Critical** (security, data loss): confidence >= 60% → report as "⚠ Needs verification"
- **Important** (architecture, test gap): confidence >= 80% → report
- **Suggestion** (style, optimization): confidence >= 90% → report

This prevents dismissing potential security issues at 75% confidence while filtering out weak style suggestions at 82%. The general 80% rule still applies as default — severity-adjusted thresholds override it.

### Step 4: Severity Calibration

Severity is about **IMPACT**, not opinion.

| Severity | Definition | Examples |
|----------|-----------|----------|
| **Critical** | Bug, security vulnerability, data loss risk, broken functionality. Must fix before merge. | SQL injection, null pointer in production path, infinite loop, auth bypass, data corruption |
| **Important** | Architecture problem, missing requirement, poor error handling, test gap. Should fix before merge. | Missing error handling on API call, requirement not implemented, no test for edge case, wrong HTTP status code |
| **Suggestion** | Code style, optimization opportunity, documentation improvement. Nice to have. | Variable naming, extract helper function, add JSDoc, simplify conditional |

**Severity inflation rules:**
- Style issue marked as Critical → **Wrong.** Reclassify as Suggestion.
- "Could be better" marked as Important → **Wrong.** Only Important if there's a concrete risk.
- Performance concern without evidence → **Suggestion**, not Important (unless proven with profiling).
- Missing test for unlikely edge case → **Suggestion**, not Important (unless the edge case has business impact).

### Step 5: Per-Issue Format

Every issue MUST follow this format:

```
**[SEVERITY]** description (confidence: N%)
File: path/to/file.ts:42
Domain: [which review domain]
Why: explanation of impact
Fix: specific suggested change
```

**Rules:**
- File and line number are REQUIRED. "Somewhere in the auth module" is not acceptable.
- "Why" explains IMPACT, not opinion. "This will crash when user is null" not "This isn't clean."
- "Fix" is a specific suggestion, not "improve this." If you can't suggest a fix, reconsider if it's a real issue.
- Group related issues (same root cause across multiple files) into one issue with multiple locations.

## Verify-Before-Fix Gate

**Scope:** This gate applies when fixing issues from *your own review* (self-review loop). For evaluating *external feedback validity*, see `superteam:receiving-code-review`. For verifying *work completion*, see `superteam:verification`.

When acting on review findings (fixing issues):

```
VERIFY → CHECK → FIX → VERIFY

1. VERIFY issue exists: Read the actual current code. Is the issue still there?
   (Reviews can be stale if code changed since diff was taken)
2. CHECK fix safety: Will the fix break other functionality? Run relevant tests mentally.
3. FIX: Implement the minimal fix for this specific issue.
4. VERIFY fix: Run tests. Confirm the issue is resolved AND nothing else broke.
```

**Why this gate exists:** Claude's default is "reviewer said fix it → fix it immediately." But:
- Review may flag a false positive (especially at 80% confidence)
- Code may have changed since the review
- Fix may introduce new issues
- Multiple issues may have the same root cause (fix once, not N times)

**Skip a finding when:**
- You verify the issue doesn't actually exist in current code
- The confidence was at threshold (80%) and investigation shows it's fine
- Fixing it would require architectural changes beyond the current task scope (document as tech debt instead)

## Anti-Shortcut System

### Red Flags — STOP

| Thought | What to do instead |
|---------|-------------------|
| "This doesn't look right" (no specific issue) | Find specific evidence or don't report it |
| "This is Critical" (but it's style) | Severity = impact. Style is Suggestion, not Critical |
| "LGTM, looks good" (after quick scan) | Check each review domain systematically |
| "I would have done this differently" | Personal preference ≠ issue. Only report concrete problems |
| "This might cause a problem someday" | Speculative issues get low confidence. Below 80 = don't report |
| "Let me also review this nearby file" | Stay within scope. Only changed code |
| "Fix this issue" (without verifying it exists) | Verify FIRST. False positives waste time |
| "Everything looks fine" (for complex diff) | Review fatigue. Slow down. Check each domain |
| "30 issues found" (for a small diff) | You're over-reporting. Re-evaluate confidence on each. Likely 10+ are below 80% |
| "No issues found" (for a complex diff) | Suspicious. Did you check all domains? Are you rubber-stamping? |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Better safe than over-report everything" | Over-reporting destroys trust. 10 real issues > 30 issues with 20 noise |
| "This is technically incorrect" | Technically incorrect but working correctly = Suggestion at best |
| "Standards say this is wrong" | Standards are guidelines. Context matters. Is there a real problem? |
| "I'm being thorough" | Thorough = high quality findings. Not thorough = high quantity findings |
| "The reviewer is always right" | Reviewers can be wrong. Verify before fixing. Push back with reasoning |
| "Skip review, tests pass" | Tests verify behavior. Review catches design, security, maintainability |

## Strengths Section

**Mandatory in every review.** Acknowledging good patterns:
- Validates the developer's approach
- Provides positive reinforcement for patterns you want to see more of
- Balances the review — "all problems, no praise" is demoralizing
- Helps Claude calibrate: if you can't find strengths, you're not reading carefully enough

**What to look for:**
- Good error handling patterns
- Clean abstractions and interfaces
- Thorough test coverage
- Clear naming and documentation
- Correct use of framework patterns
- Security-conscious decisions
- Performance-aware choices

**Format:** 3-5 specific strengths. If you genuinely cannot find 3 after careful reading:
- 1-2 is acceptable for hotfix/patch diffs under 20 lines
- 0 is NEVER acceptable — even broken code has structure, naming, or intent worth acknowledging
- If finding strengths is hard, the code may need more than a review — flag this as a meta-observation

Specific, not generic. "Good use of discriminated unions for API response types" not "Code looks clean."

## Self-Review Discipline

When reviewing code you (Claude) wrote:

- **Your code is NOT "obviously correct."** You have the same blind spots as any author.
- **Check against requirements, not your memory.** Re-read REQUIREMENTS.md. Don't rely on "I know what I implemented."
- **Actively look for what you MISSED**, not what you did well. Your model will skip your own errors.
- **Force domain rotation.** Don't start with the domain you're most confident in. Start with Security or Silent Failure — domains where your code is LEAST likely to be reviewed carefully by yourself.

If reviewing code for `/st:execute` task you just completed: read the diff as if someone else wrote it. The moment you think "I know this is correct because I wrote it" — that's the blind spot.

## Visual Review

When reviewing with image input (screenshots):
1. Compare against `DESIGN-SYSTEM.md` if it exists
2. Check for visual regressions (layout breaks, missing elements, wrong colors)
3. Check accessibility: contrast ratios, text size, interactive element size
4. Note UI issues with description + screenshot reference, not just "looks wrong"
5. Visual issues follow the same severity model: broken layout = Critical, spacing off = Suggestion

## Quick Reference

```
IRON LAW:
  No issue without evidence and confidence >= 80%.
  Opinions are not issues.

REVIEW STEPS:
  1. Scope: only changed code
  2. Context: read requirements, design system, existing patterns
  3. Review: per domain, confidence score each issue
  4. Report: file:line, severity, confidence, why, fix
  5. Strengths: mandatory, 3-5 specific points

CONFIDENCE (severity-adjusted):
  Critical:   >= 60% → report as "⚠ Needs verification"
  Important:  >= 80% → report
  Suggestion: >= 90% → report
  Below threshold → DO NOT report

SEVERITY:
  Critical = bugs, security, data loss (must fix)
  Important = architecture, missing requirements, test gaps (should fix)
  Suggestion = style, optimization, docs (nice to have)

SELF-REVIEW:
  Read diff as if someone else wrote it
  Check requirements, not memory
  Start with Security/Silent Failure domains

VERIFY-BEFORE-FIX:
  Verify issue exists → check fix safety → fix → verify fix

STRENGTHS:
  Mandatory. 3-5 specific points. Not generic praise.
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Reporting style preferences as Important/Critical | Severity = impact. Style = Suggestion at most |
| Reviewing unchanged code outside the diff | Stay in scope. Only review what changed |
| No confidence scores on issues | Every issue needs a score. Below 80 = don't report |
| "LGTM" without checking each domain | Systematic review, not vibes. Check the domain list |
| Fixing review findings without verifying | Verify issue exists in current code first |
| All problems, no strengths | Strengths section is mandatory. Find what's done well |
| Vague feedback: "improve error handling" | Specific: file:line, what's wrong, why it matters, how to fix |
| 30+ issues on a 50-line diff | Over-reporting. Re-evaluate confidence. Most are noise |
| Skipping context gathering | Read requirements first. Review against intent, not preference |
| Treating reviewer findings as infallible | Reviewers can be wrong. Verify. Push back with reasoning when needed |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation |
| `references/review-domains.md` | On demand | Reviewer agent loads this to get domain checklists. Agent selects relevant domains based on project type. |

**Rule:** `references/review-domains.md` is loaded once by the single reviewer agent. The agent selects relevant domains from the 13 available based on project type — not all 13 are always checked.

**Domain Selection Mechanism:** The `superteam:project-awareness` context block determines project type (framework, language, architecture), which the reviewer agent uses to select relevant domains. See `reviewer.md` Step 2 for the domain-by-project-type matrix.

## Integration

**Used by:**
- `/st:code-review` — 1 reviewer agent (13 domains) with linting layer
- `/st:execute` — review after completing task batches

**Skills that pair with requesting-code-review:**
- `superteam:project-awareness` — framework detection for linter selection and pattern detection
- `superteam:tdd-discipline` — test analysis domain references TDD standards
- `superteam:wave-parallelism` — post-wave review of all wave outputs
- `superteam:verification` — post-fix verification
- `superteam:receiving-code-review` — how to process and act on review feedback

**Review domains:** See `references/review-domains.md` for 13 domain-specific checklists.
