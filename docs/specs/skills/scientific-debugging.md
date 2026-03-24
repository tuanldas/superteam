# Skill Spec: scientific-debugging

> Status: DRAFT v2 | Created: 2026-03-23 | Revised: 2026-03-23 (user review)

---

## Frontmatter

```yaml
---
name: scientific-debugging
description: >
  Use when encountering any bug, test failure, or unexpected behavior.
  Enforces root cause investigation before fixes, 4-phase methodology,
  anti-shortcut discipline, and evidence-based hypothesis testing.
---
```

---

## SKILL.md Content

````markdown
---
name: scientific-debugging
description: >
  Use when encountering any bug, test failure, or unexpected behavior.
  Enforces root cause investigation before fixes, 4-phase methodology,
  anti-shortcut discipline, and evidence-based hypothesis testing.
---

# Scientific Debugging

## Overview

Scientific Debugging forces a disciplined investigation methodology that prevents fix-guessing. It applies to any debugging context — from quick test failures to complex production bugs.

**Two responsibilities:**
1. **Methodology** — 4-phase investigation with gates between phases.
2. **Discipline** — anti-shortcut rules that resist Claude's default "try a fix and see" behavior.

## Core Principle

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.

Symptom fixes are failure.
Understanding the mechanism is REQUIRED before writing any fix code.
If you cannot explain WHY the bug happens, you have not found the root cause.
```

This is non-negotiable. No time pressure, no "obvious" fix, no user request overrides this.

## Roles

```
USER = Reporter.  Knows symptoms, context, business impact.
CLAUDE = Investigator.  Finds cause, proposes fix, verifies.

NEVER ask the user diagnostic questions you can investigate yourself.
"Which file has the problem?" — investigate, don't ask.
"Can you check the logs?" — read the logs yourself.
"Does this work on your machine?" — reproduce it yourself first.
```

## The Four Phases

```
Phase 1: ROOT CAUSE INVESTIGATION
    ↓ (gate: have specific observations and a suspected area)
Phase 2: PATTERN ANALYSIS
    ↓ (gate: have a falsifiable hypothesis from pattern comparison)
Phase 3: HYPOTHESIS & TESTING
    ↓ (gate: hypothesis confirmed with evidence)
Phase 4: IMPLEMENTATION
```

**Gates are mandatory.** Do not skip to Phase 4 because the fix "seems obvious."
Phase 1 produces observations. Phase 2 refines them into a hypothesis. Phase 3 tests it. Phase 4 fixes it.

### Phase 1: Root Cause Investigation

1. **Read error messages completely.** Full stack traces, every line. Don't skim.
2. **Reproduce consistently.** If you can't reproduce, you can't verify a fix.
3. **Check recent changes.** `git diff`, dependency updates, config changes, environment changes.
4. **Gather evidence at boundaries.** In multi-component systems, instrument each boundary (API calls, DB queries, IPC) to find where data diverges from expectations.
5. **Trace data flow.** Follow data from origin to symptom point. Read `techniques.md → Root-Cause Tracing` for methodology.
6. **Check logs.** Use framework from `superteam:project-awareness` context block to auto-detect log locations.
   When project-awareness type = `unknown`: ask user for log location instead of guessing.
   Fallback locations when project-awareness unavailable:
   - Laravel: `storage/logs/laravel.log`
   - Rails: `log/development.log`
   - Express/Node: stdout/stderr
   - Django: configured in `settings.py → LOGGING`
   - Go: stdout/stderr or configured logger
   - General: `*.log` files in project root, `/tmp/`, `logs/`

**Phase 1 output:** Specific observations and a suspected area (component, module, data path) to investigate further in Phase 2.

### Phase 2: Pattern Analysis

1. **Find working examples.** Same feature elsewhere, similar code that works, previous working version.
2. **Compare completely.** Read entire functions, not just the "relevant" line. Check imports, config, surrounding context.
3. **Identify differences.** What's different between working and broken?
4. **Understand dependencies.** Trace upstream: what provides data to the broken code?

### Phase 3: Hypothesis & Testing

1. **Form ONE hypothesis.** Write it down. It must be falsifiable (see Evidence Standards).
2. **Design minimal test.** Smallest change that confirms or disproves the hypothesis. ONE variable.
3. **Predict the outcome.** Before running: "If hypothesis is correct, I should observe X."
4. **Run and evaluate.** Does observation match prediction?
   - Match → proceed to Phase 4.
   - No match → update the Eliminated list, return to Phase 1 with new information.
5. **Meta-debugging trigger.** After 3 eliminated hypotheses, STOP and reassess:
   - Am I investigating the right component?
   - Are my assumptions about the system correct?
   - Should I trace from a different entry point?

### Phase 4: Implementation

1. **Write failing test first.** The test must reproduce the bug. Reference `superteam:tdd-discipline` if available.
2. **Implement single fix.** ONE change only. No "while I'm here" improvements.
3. **Verify the fix.** Run the failing test — it must pass. Run full test suite — no regressions.
4. **3+ failed fixes = question architecture.** If three attempts haven't worked:
   - Is this pattern fundamentally sound?
   - Am I fighting the framework instead of working with it?
   - STOP and discuss with the user before attempt #4.

**Distinguishing hypothesis failure from fix failure:**
- **Hypothesis eliminated** (prediction wrong) → back to Phase 1 with new data. The cause is elsewhere.
- **Hypothesis confirmed but fix doesn't work** → fix implementation is wrong, not the hypothesis. Review fix logic.
- **3 fixes fail for same confirmed hypothesis** → the hypothesis might be PARTIALLY correct. Re-examine scope: is there a secondary cause?

## Anti-Shortcut System

### Red Flags — STOP

These thoughts mean you are about to violate the methodology:

| Thought | What to do instead |
|---------|-------------------|
| "Quick fix for now, proper fix later" | There is no later. Find root cause now. |
| "Just try changing X and see" | Form hypothesis first. Predict outcome. |
| "I think I know what's wrong" | Prove it. What evidence do you have? |
| "Skip the test, the fix is obvious" | Obvious fixes are the most dangerous. Test it. |
| "I don't fully understand but this might work" | Then you haven't found root cause. Back to Phase 1. |
| "One more fix attempt" (after 2+ failures) | 3 strikes rule. Question architecture. |
| "Let me try a different approach" (without understanding why previous failed) | Document WHY it failed first. Extract learning. |
| "Each fix reveals a new problem in a different place" | You're treating symptoms. The real cause is upstream. |
| "This worked in another project" | Different project, different context. Verify assumptions. |
| "The error message is misleading" | Maybe. But read it completely first. |
| "It's probably a race condition" | Reproduce it. "Probably" is not evidence. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, doesn't need investigation" | Simple issues don't exist until you prove them simple through investigation. |
| "Emergency, no time for methodology" | Methodology is FASTER. 15-30 min systematic vs 2-3 hours guessing. |
| "Just try this first, then investigate if it doesn't work" | You just committed to a fix before understanding the problem. |
| "I've seen this exact bug before" | Have you? Same codebase, same version, same context? Verify. |
| "The user asked me to just fix it" | Users want it FIXED, not attempted. Root cause = fixed. Guessing = attempted. |
| "Tests pass, so the fix works" | Tests passing ≠ understanding WHY. Can you explain the mechanism? |
| "It's a known framework bug" | Verify. Check issue tracker. Read the actual bug report. |
| "I already spent time on this, let me just finish" | Sunk cost. Would you take this path if starting fresh? |

### Cognitive Biases

| Bias | Trap | Antidote |
|------|------|----------|
| **Confirmation** | Only seeking evidence that supports your hypothesis | "What would DISPROVE this?" |
| **Anchoring** | First explanation becomes the anchor, all evidence interpreted through it | Generate 3+ hypotheses before investigating any |
| **Recency** | Recent bug pattern assumed to repeat | Treat each bug as novel until evidence says otherwise |
| **Sunk Cost** | Continuing a dead-end path because you've invested time | Every 30 min: "If I started fresh, would I still take this path?" |

### Meta-Debugging (Debugging Your Own Code)

When debugging code YOU wrote (in this session or a previous one):

- **Treat your code as foreign.** Your mental model of what it does is a GUESS.
- **Read what you wrote, not what you intended.** The code does what it says, not what you meant.
- **Prioritize code you touched.** Your changes are the most likely cause.
- **Admit "I implemented this wrong."** Ego is not a debugging tool.

## Evidence Standards

### Falsifiability

Every hypothesis MUST be falsifiable.

**Bad:** "Something is wrong with the state."
**Bad:** "There might be a timing issue."
**Good:** "User state resets because the component remounts when the route changes. If I navigate without route change, state should persist."
**Good:** "The API returns 401 because the token refresh happens after the request fires. If I add a 1s delay before the request, it should succeed."

### Evidence Quality

| Strong evidence | Weak evidence |
|----------------|---------------|
| Observable (you SAW it) | Hearsay ("someone said...") |
| Repeatable (happens every time) | Intermittent without pattern |
| Unambiguous (one interpretation) | Could mean multiple things |
| Independent (no confounding factors) | Confounded with other changes |

**Decision to fix:** Act when you (1) understand the mechanism, (2) can reproduce, (3) have strong evidence, AND (4) ruled out alternatives.

## Human Signals

When the user says these things, your approach is wrong:

| User says | What it means |
|-----------|--------------|
| "Is that not happening?" | You assumed something without verifying |
| "Will it show us...?" | You should have added evidence gathering |
| "Stop guessing" | You're proposing fixes without root cause |
| "Ultrathink this" / "Think harder" | You're surface-level. Question fundamentals |
| "We're stuck?" | Your approach isn't working. Restart |

## When to Restart

Restart investigation from Phase 1 when ANY of these are true:

1. **No progress in extended time.** You're going in circles.
2. **3+ fixes that didn't work.** The pattern is wrong.
3. **Can't explain current behavior.** If you don't understand what IS happening, you can't fix it.
4. **Debugging the debugger.** Your instrumentation is now the problem.
5. **Fix works but you don't know why.** Revert it. A fix you don't understand will break something else.

When restarting: keep the Eliminated list. Don't re-investigate dead ends.

## When Process Reveals No Root Cause

If thorough investigation doesn't find the root cause:

1. **Document what you know.** Symptoms, eliminated causes, evidence gathered.
2. **Implement defensive handling.** Don't fix the unknown — handle the symptom gracefully.
3. **Add monitoring.** Instrument the area to capture more data next time.
4. **Communicate honestly.** "Root cause not found. Here's what I eliminated and what I recommend monitoring."

## Quick Reference

```
IRON LAW:
  NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.

PHASES:
  1. Investigate (read errors, reproduce, check changes, gather evidence, trace, check logs)
     → output: observations + suspected area
  2. Analyze (find working examples, compare completely, identify differences)
     → output: falsifiable hypothesis from pattern comparison
  3. Hypothesize (ONE hypothesis, falsifiable, predict, test ONE variable)
     → output: hypothesis confirmed with evidence
  4. Implement (failing test, single fix, verify, 3 strikes = question architecture)

GATES:
  Phase 1 → 2: have specific observations and suspected area
  Phase 2 → 3: have falsifiable hypothesis from pattern comparison
  Phase 3 → 4: hypothesis confirmed with evidence

3 STRIKES:
  3 hypotheses eliminated → reassess approach (meta-debugging)
  3 fixes fail, same hypothesis → re-examine scope (secondary cause?)
  3 fixes fail, different hypotheses → question architecture

META-DEBUGGING:
  After 3 eliminated hypotheses → reassess approach
  After 3 failed fixes → question architecture
  Every 30 min → "Would I still take this path if starting fresh?"

EVIDENCE:
  Strong = observable + repeatable + unambiguous + independent
  Must understand mechanism before fixing

RESTART TRIGGERS:
  No progress | 3+ failed fixes | Can't explain behavior |
  Debugging the debugger | Fix works but don't know why
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Proposing fix in first response | Phase 1 first. Always. No exceptions. |
| Reading only the "relevant" line of stack trace | Read the ENTIRE stack trace. Context is in the lines you skip. |
| Changing multiple things at once | ONE variable per test. Revert everything else. |
| Not documenting eliminated hypotheses | Write them down. Prevents re-investigation after context reset. |
| Asking user diagnostic questions | Investigate yourself first. User = Reporter, Claude = Investigator. |
| Skipping log files | Logs are the richest information source. Auto-detect and read them. |
| "It seems to work" as verification | Run the actual test. Check exit code. Read output. Evidence, not vibes. |
| Treating own code as correct | Your code is the most likely cause. Read what you WROTE, not what you INTENDED. |

## Integration

**Used by:**
- `/st:debug` — full debugging with persistent session files, checkpoints, knowledge base
- `/st:debug-quick` — lightweight debugging, escalates to `/st:debug` after 3 failed hypotheses

**Skills that pair with scientific-debugging:**
- `superteam:project-awareness` — provides framework detection for auto-detecting log locations and framework-specific debugging behavior
- `superteam:tdd-discipline` — Phase 4 references "write failing test first"
- `superteam:receiving-code-review` — review findings may trigger Phase 1 investigation
- `superteam:wave-parallelism` — parallel executor agents use debugging methodology when encountering errors
- `superteam:handoff-protocol` — debug session state (hypotheses, eliminated, evidence) serialized in handoff
- `superteam:verification` — post-fix verification standards

**Investigation techniques:** See `techniques.md` for 12 techniques with selection guidance.
````

---

## `techniques.md` Content

````markdown
# Investigation Techniques

Reference file for `superteam:scientific-debugging`. Loaded when entering Phase 1.

## Technique Selection

| Situation | Start with |
|-----------|-----------|
| Error with stack trace | Root-Cause Tracing |
| "It worked before" | Git Bisect or Differential |
| Intermittent failure | Observability First + Condition-Based Waiting |
| Multi-component system | Boundary instrumentation + Binary Search |
| No error, wrong output | Working Backwards |
| Complex state bug | Minimal Reproduction |
| Constructed paths/URLs don't match | Follow the Indirection |
| Completely stuck | Rubber Duck or Comment-Out-Everything |

## Project-Type Hints

Use with `superteam:project-awareness` context to pick starting techniques:

| Project Type | Common Bug Patterns | Preferred Starting Techniques |
|---|---|---|
| Frontend | State bugs, rendering, event handling | Minimal Reproduction, Observability First |
| Backend | Data flow, concurrency, API contracts | Root-Cause Tracing, Defense-in-Depth |
| Fullstack | Client/server boundary, hydration, SSR | Boundary Instrumentation, Differential |
| Monorepo | Dependency resolution, version mismatch | Follow the Indirection, Differential |

## The 12 Techniques

### 1. Binary Search / Divide and Conquer
Cut the problem space in half repeatedly. Comment out half the code, check if bug persists. Narrow to the half that contains the bug. Repeat.

### 2. Working Backwards
Start from the wrong output. What function produced it? What input did that function receive? Trace backwards through the call chain until you find where actual data diverges from expected.

### 3. Git Bisect
Binary search through git history to find the commit that introduced the bug. Use `git bisect start`, mark known good and bad commits, let git narrow it down.

### 4. Differential Debugging
Compare broken state against working state. Two forms:
- **Time-based:** What changed between when it worked and when it broke? (`git diff`, dependency updates, env changes)
- **Environment-based:** Works in dev but not prod? Compare configs, versions, data.

### 5. Minimal Reproduction
Strip away everything until you have the smallest code that reproduces the bug. Remove features, simplify data, eliminate dependencies. The minimal repro often reveals the cause directly.

### 6. Observability First
Add logging/instrumentation BEFORE making any code changes. Understand what the code IS doing at runtime, not what you THINK it's doing. Log at entry/exit of suspect functions with input/output values.

### 7. Comment-Out-Everything
Comment out all suspect code. Uncomment one piece at a time. When the bug returns, you found the piece that causes it. Brute-force but effective when other techniques fail.

### 8. Rubber Duck Debugging
Explain the entire problem in complete detail — what the code should do, what it actually does, what you've tried. The act of articulating often reveals the gap in understanding.

### 9. Follow the Indirection
When code constructs paths, URLs, keys, or identifiers dynamically, verify the constructed value matches at BOTH producer and consumer. Log the actual value. Common source of "it should work" bugs.

### 10. Root-Cause Tracing
Trace backward through the call stack from symptom to origin:
1. Observe the symptom (wrong value, error, crash)
2. Find the immediate cause (what line produced this?)
3. Ask "what called this with these inputs?"
4. Keep tracing up the chain
5. Find the original trigger (the FIRST place data went wrong)

Stop when you find the FIRST divergence from expected behavior, not the last.

### 11. Defense-in-Depth
Add validation at every layer to pinpoint where data corrupts:
- Entry point (API/CLI input)
- Business logic (function pre/post-conditions)
- Environment (config, env vars, external services)
- Debug instrumentation (temporary assertions)

When all layers validate, the bug is between two adjacent layers.

### 12. Condition-Based Waiting
Replace arbitrary timeouts (`sleep 5`) with condition-based polling. If a test is intermittent:
- Identify what condition must be true
- Poll for that condition with a reasonable timeout
- Fail explicitly when the condition is not met within timeout

This eliminates timing-dependent bugs and makes failures deterministic.

## Combining Techniques

Techniques compose. Common combinations:
- **Observability First → Binary Search** — instrument, then narrow
- **Differential → Root-Cause Tracing** — find what changed, then trace why it matters
- **Minimal Reproduction → Rubber Duck** — simplify, then explain
- **Git Bisect → Differential** — find the commit, then analyze what changed

Start with the technique that matches your situation. Switch if it's not producing evidence within 10-15 minutes.
````

---

## Design Decisions

1. **Iron Law repeated 4 times** — overview, Phase 1 gate, Quick Reference, Common Mistakes. Claude needs friction at every decision point.
2. **Techniques in separate file** — keeps SKILL.md under 400 lines. Techniques loaded only during investigation.
3. **Cognitive biases section** (from GSD) — Superpowers misses this. Claude's confirmation bias is a real debugging killer.
4. **Human Signals section** (from Superpowers) — GSD misses this. Practical detection of "user frustrated = wrong approach."
5. **Meta-debugging section** (from GSD) — addresses Claude debugging its own code, which is a unique failure mode.
6. **Falsifiability with examples** — "bad vs good hypothesis" format makes the abstract rule concrete.
7. **"When process reveals no root cause"** — explicit exit path. Without this, Claude loops forever or gives up silently.
8. **High freedom for technique selection** — matrix suggests, doesn't mandate. Situation varies too much.
9. **Roles section** — prevents Claude from asking user lazy diagnostic questions. User=Reporter pattern from GSD.
10. **Session file format NOT in skill** — belongs in `/st:debug` command. Skill provides methodology, commands provide orchestration.
11. **Gates sửa lại** — Phase 1 output observations + suspected area (không phải hypothesis). Phase 2 refine thành hypothesis qua pattern comparison. Tránh Claude skip Phase 2.
12. **Project-awareness integration** — log locations reference project-awareness thay vì hardcode. Technique selection thêm project-type hints.
13. **3 strikes phân biệt rõ** — hypothesis failure ≠ fix failure ≠ architectural problem. Ba scenarios khác nhau, ba responses khác nhau.
14. **Negative tests cho anti-shortcut** — test không chỉ compliance mà cả resistance (user gợi ý fix, emergency pressure, context-switch trap).

## Testing Plan

1. Give Claude a bug with obvious-looking fix — does it investigate first or jump to fix?
2. Give Claude a multi-component bug — does it instrument boundaries?
3. After 3 failed hypotheses — does it trigger meta-debugging?
4. After 3 failed fixes — does it question architecture or try #4?
5. Debugging Claude's own code from earlier in session — does it treat it as foreign?
6. User says "just fix it" — does it comply or maintain methodology?
7. Intermittent test failure — does it use condition-based waiting, not `sleep`?
8. Bug with framework logs available — does it auto-detect and read logs?
9. User provides "obvious" one-line fix and asks Claude to apply it — does Claude investigate or blindly apply?
10. Bug in code Claude wrote 5 minutes ago — does it treat as foreign or assume it knows?
11. Second bug appears while fixing first — does Claude finish current investigation or context-switch?
12. User says "Emergency, just try something" — does Claude maintain methodology?
