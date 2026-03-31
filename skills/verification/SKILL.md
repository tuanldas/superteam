---
name: verification
description: >
  Use before marking any work as done, completed, or passing.
  Enforces goal-backward verification (outcomes over tasks), evidence-before-claims
  discipline, 4-level artifact analysis, and anti-shortcut rules.
---

# Verification

## Overview

Verification prevents false completion claims by enforcing evidence-based checking. It combines two complementary approaches: **goal-backward verification** (does the codebase actually achieve the outcome?) and **evidence-before-claims** (did you run the command before claiming it passes?).

**Two responsibilities:**
1. **Methodology** — goal-backward analysis, 4-level artifact verification, wiring checks.
2. **Discipline** — forbidden phrases, anti-rationalization, "run then claim" gate.

## Core Principles

Three principles. All three apply to every verification.

**Scope:** This skill verifies *work completion* — is the goal achieved? For evaluating *review feedback validity*, see `superteam:receiving-code-review`. For verifying *review findings before fixing*, see `superteam:requesting-code-review`.

### 1. Evidence Before Claims

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.

Run the command. Read the FULL output. Check the exit code.
THEN — and only then — claim the result.

"Should work" is not evidence.
"I'm confident" is not evidence.
"Tests passed earlier" is not evidence.
FRESH command output is evidence.
```

### 2. Goal-Backward Verification

```
TASK COMPLETION ≠ GOAL ACHIEVEMENT.

A task "create chat component" can be marked complete when the component
is a placeholder. The task was done — a file was created —
but the goal "working chat interface" was NOT achieved.

Start from the GOAL. Work backwards to verify it's achieved.
Not: "Did I complete all tasks?" (task-forward)
But: "Can the user actually do the thing?" (goal-backward)
```

### 3. Do Not Trust Self-Reports

```
SUMMARIES, AGENT REPORTS, AND YOUR OWN INTUITION ARE NOT EVIDENCE.

You generated code → you THINK it works → you SAY it works.
That chain has zero verification in it.

Verify independently. Run commands. Read output. Check artifacts.
```

## The Iron Law

```
BEFORE ANY OF THESE ACTIONS:
  - Claiming work is done
  - Committing code
  - Creating a PR
  - Marking a task complete
  - Saying "tests pass"
  - Saying "build succeeds"
  - Saying "bug is fixed"

YOU MUST:
  1. IDENTIFY what command proves this claim
  2. RUN the command (fresh, complete, in this message)
  3. READ the full output and check exit code
  4. VERIFY the output confirms the claim
  5. ONLY THEN make the claim

Skip any step = lying, not verifying.

"FRESH" means:
  - Run AFTER your latest code change (not before)
  - Run IN THIS MESSAGE (not a previous message)
  - Run the COMPLETE command (not partial or cached output)
```

For artifacts that cannot be verified by command (visual appearance, real-time behavior, external services), evidence means flagging for human verification with specific check criteria — see "What Needs Human Verification" below.

## Verification Scope

Not all actions need full verification. Match depth to action type:

| Action | Levels Required | What to Check |
|--------|----------------|---------------|
| **Commit** | Level 1-2 | Exists + Substantive. File present, real logic (not stub). |
| **PR** | Level 1-3 | + Wired. Artifacts connected, imports exist, routes registered. |
| **Phase / Milestone** | Level 1-4 | Full verification. Data flows end-to-end, no hollow components. |
| **Bug fix** | Level 1-2 + regression | Fix exists + original symptom gone + related tests pass. |
| **Refactor** | Level 1-3 + regression | Behavior unchanged. Full test suite passes. |

**Rules:**
- Iron Law (Evidence Before Claims) applies at ALL scopes — even commit-level.
- Goal-Backward method applies at Phase/Milestone scope only.
- Human verification items apply at PR scope and above.
- When unsure which scope: use the higher scope. Over-verification is safer than under-verification.

## Goal-Backward Method

When verifying a phase, feature, or milestone:

```
Step 1: TRUTHS — What must be TRUE for the goal to be achieved?
  → 3-7 observable truths (user can do X, system handles Y)

Step 2: ARTIFACTS — What must EXIST for those truths to hold?
  → Concrete files, functions, endpoints with paths

Step 3: WIRING — What must be CONNECTED for artifacts to function?
  → Imports, API calls, event handlers, data flow

Step 4: DATA — What must FLOW through that wiring?
  → Real data, not hardcoded/placeholder/empty
```

**Example:**

Goal: "User can log in with email/password"

| Level | Check | Finding |
|-------|-------|---------|
| Truth | User can submit login form and receive access token | — |
| Artifact | `src/auth/login.tsx` exists, `src/api/auth.ts` exists | Both exist ✓ |
| Wiring | Login form calls auth API, API calls database | Form has `onSubmit` but it only `console.log`s ✗ |
| Data | API returns real JWT, form stores it | N/A — wiring broken |

**Result:** Task "create login" was completed (files exist). Goal "user can log in" was NOT achieved (wiring broken at form→API).

## 4-Level Artifact Verification

Every artifact must pass all 4 levels:

| Level | Name | Check | What it catches |
|-------|------|-------|----------------|
| 1 | **Exists** | File present at expected path | Missing files |
| 2 | **Substantive** | Real implementation, not placeholder | Stubs, TODOs, empty returns |
| 3 | **Wired** | Imported AND used by other code | Orphaned files that connect to nothing |
| 4 | **Data-Flow** | Upstream produces real data, downstream consumes it | Hollow components — wired but showing empty/hardcoded data |

### Status Matrix

| Exists | Substantive | Wired | Data Flows | Status | Action |
|--------|------------|-------|------------|--------|--------|
| ✓ | ✓ | ✓ | ✓ | **VERIFIED** | Done |
| ✓ | ✓ | ✓ | ✗ | **HOLLOW** | Connect data source |
| ✓ | ✓ | ✗ | — | **ORPHANED** | Import and use it |
| ✓ | ✗ | — | — | **STUB** | Implement real logic |
| ✗ | — | — | — | **MISSING** | Create the artifact |

**80% of stubs hide in wiring.** Level 1 (exists) and Level 2 (substantive) pass easily. Level 3 (wired) and Level 4 (data-flow) are where most verification failures are found.

### Wiring Patterns to Check

See `references/wiring-patterns.md` for detailed patterns. Summary:

| Pattern | Check | Red Flag |
|---------|-------|----------|
| Component → API | fetch/axios call exists AND response consumed | `onSubmit` that only `console.log`s |
| API → Database | DB query exists AND result returned | Route that returns static/hardcoded response |
| Form → Handler | onSubmit has real logic (fetch/mutate/dispatch) | Handler only logs or is empty |
| State → Render | useState variable appears in JSX | State declared but never rendered |

### Anti-Patterns to Scan

Search the codebase for these indicators of incomplete work:

```
SCAN FOR:
  - TODO, FIXME, HACK, XXX comments
  - "not implemented", "placeholder", "stub"
  - Empty function bodies: {} or { return; } or { return null; }
  - console.log as sole implementation
  - Hardcoded data: mock data, sample data, "lorem ipsum"
  - Disabled tests: .skip, xit, xdescribe, @pytest.mark.skip
```

If any are found in code that should be complete: the artifact is STUB, not VERIFIED.

## Test Runner Detection

Use `superteam:project-awareness` framework detection to determine the correct verification command:

| Framework | Test Command | Build Command |
|-----------|-------------|---------------|
| React/Vue/Svelte (Vite) | `npx vitest run` | `npx vite build` |
| React (CRA/Next) | `npx jest` or `npm test` | `npm run build` |
| Express/NestJS | `npx jest` or `npx vitest run` | `npx tsc --noEmit` |
| Django | `python -m pytest` or `python manage.py test` | N/A |
| Laravel | `php artisan test` or `./vendor/bin/phpunit` | N/A |
| Go | `go test ./...` | `go build ./...` |
| Rust | `cargo test` | `cargo build` |
| Java/Spring | `./mvnw test` or `./gradlew test` | `./mvnw compile` |

If framework unknown: check `package.json` scripts, `Makefile`, `pyproject.toml`, or ask user.

## What Needs Human Verification

Some things cannot be verified by running commands. Flag these for user:

| Category | Examples | Why automated can't check |
|----------|----------|--------------------------|
| **Visual appearance** | Layout matches design, colors correct, responsive | Requires human eyes |
| **User flow completion** | Multi-step workflow works end-to-end | Requires human judgment on UX |
| **Real-time behavior** | WebSocket updates, animations, transitions | Timing-dependent |
| **External services** | Payment processing, email delivery, SMS | Requires real accounts/credentials |
| **Performance feel** | Page feels fast, interactions responsive | Subjective perception |
| **Error message clarity** | Messages are helpful, not technical jargon | Requires human evaluation |

**Format:** Present each item one at a time. User responds: pass / issue / skip / blocked.

## Anti-Shortcut System

### Forbidden Phrases — STOP

If you are about to say any of these, you are skipping verification:

| Phrase | What to do instead |
|--------|-------------------|
| "Should work now" | RUN the verification command. Then state the result. |
| "That should do it" | Did you run the tests? What was the output? |
| "Looks correct" | Looking ≠ verifying. Run the command. |
| "Tests should pass" | "Should" means you didn't run them. Run them. |
| "I'm confident this works" | Confidence ≠ evidence. Run verification. |
| "Great!" / "Perfect!" / "Done!" | Before verification, these are lies. After verification with evidence, they're fine. |
| "Just need to verify..." (then doesn't) | Actually verify. Right now. In this message. |
| "Build succeeds" (without running build) | Run the build. Show the output. |
| "Bug is fixed" (without testing original symptom) | Reproduce the original bug. Confirm it's gone. |
| "Agent completed successfully" | Verify independently. Agent self-reports are not evidence. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Tests passed earlier" | Earlier ≠ now. Code changed. Run fresh. |
| "I just wrote the code, I know it works" | You know what you INTENDED. Not what you BUILT. Verify. |
| "Linter passed, so it's fine" | Linter checks syntax and style. Not correctness. |
| "Partial check is enough" | Partial verification proves nothing about the unchecked parts. |
| "It's a small change, no need to verify" | Small changes cause big bugs. Verify. |
| "Agent said it succeeded" | Agents report their INTENT, not their OUTCOME. Verify independently. |
| "I've seen the output before" | Before your latest changes? Run it again. |
| "User didn't ask me to verify" | Verification is not optional. It's part of completion. |

## Re-Verification Protocol

When re-verifying previously checked work (e.g., after fixes):

1. **Focus on previously failed items.** Don't re-check everything — focus on gaps.
2. **Regression check on passed items.** Spot-check 2-3 previously-VERIFIED artifacts to ensure fixes didn't break them.
3. **New gaps from fixes.** Fixes can introduce new issues. Check artifacts touched by the fix.

## Quick Reference

```
IRON LAW:
  Run command → read output → check exit code → THEN claim.
  No step skipped. No exceptions.

GOAL-BACKWARD:
  1. TRUTHS: What must be true for goal achieved? (3-7)
  2. ARTIFACTS: What must exist? (files, functions, endpoints)
  3. WIRING: What must be connected? (imports, calls, handlers)
  4. DATA: What must flow? (real data, not hardcoded)

4-LEVEL STATUS:
  VERIFIED = exists + substantive + wired + data-flowing
  HOLLOW   = wired but data disconnected
  ORPHANED = exists + substantive but not connected
  STUB     = exists but placeholder/empty
  MISSING  = doesn't exist

WHERE STUBS HIDE:
  80% in wiring. Component→API, API→DB, Form→Handler, State→Render

FORBIDDEN:
  "Should work" / "Looks correct" / "Done!" — before running verification

HUMAN VERIFICATION:
  Visual, user flow, real-time, external services, performance feel

RE-VERIFICATION:
  Focus failed → regression check passed → check fix side-effects
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| "Tests pass" without running them | Run `npm test` / `pytest` / equivalent. Show output. |
| Marking task done when file exists but is a stub | Check Level 2 (substantive). Is there real logic or just a skeleton? |
| Component exists but isn't imported anywhere | Check Level 3 (wired). Grep for imports. Orphaned = not done. |
| API route returns hardcoded data | Check Level 4 (data-flow). Does it query real DB or return mock? |
| Trusting SUMMARY.md or agent report | Verify independently against actual codebase. Claims ≠ reality. |
| Saying "bug is fixed" without reproducing original bug | Test the original symptom. Confirm it's gone. Then claim. |
| Partial test run ("just the relevant tests") | Run full suite. Partial proves nothing about regressions. |
| "Looks good" after reading code | Reading ≠ running. Execute the verification command. |
| Skipping wiring checks because components "look complete" | 80% of stubs hide in wiring. Check Component→API→DB→Render chain. |
| Premature "Done!" before Level 4 check | VERIFIED requires all 4 levels. Data must actually flow. |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation |
| `references/artifact-patterns.md` | On demand | Level 2+ check finds suspicious artifacts (stubs, empty returns) — load for framework-specific grep patterns to diagnose. |
| `references/wiring-patterns.md` | On demand | Level 3+ check needed — verifying imports, API calls, data flow. |

**Rule:** Most commit-level verifications (Level 1-2) resolve with `SKILL.md` alone. Load reference files only when deeper analysis is needed. Typical loading: 60% SKILL.md only, 30% + wiring-patterns, 10% + both reference files.

## Integration

**Used by:**
- `/st:phase-validate` — 4-layer verification (criteria, tests, integration, UAT)
- `/st:milestone-audit` — milestone completion verification
- Auto-triggered: before any completion claim, commit, or PR

**Skills that pair with verification:**
- `superteam:project-awareness` — framework detection for test runner commands and verification patterns
- `superteam:tdd-discipline` — TDD provides the tests that verification runs
- `superteam:scientific-debugging` — when verification reveals bugs, use debugging methodology
- `superteam:requesting-code-review` — review includes verification of findings before fixing
- `superteam:receiving-code-review` — verify fixes from code review feedback before marking resolved
- `superteam:wave-parallelism` — post-wave verification: orchestrator runs verification after all agents complete (not per-agent). Each agent self-checks; orchestrator spot-checks and runs test suite.
- `superteam:handoff-protocol` — verification state captured on pause

**Reference files:**
- `references/artifact-patterns.md` — framework-specific grep patterns for 4-level verification
- `references/wiring-patterns.md` — the 4 wiring patterns with red flags and grep commands
