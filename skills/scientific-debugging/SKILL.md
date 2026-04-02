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
5. **Trace data flow.** Follow data from origin to symptom point. For detailed methodology, see `references/techniques.md → Root-Cause Tracing`.
6. **Instrument & Observe.** Place targeted logs at suspected points, reproduce the bug, read output from YOUR logs. Do not rely on existing log files — they may contain noise from previous sessions. For protocol details (marker convention, placement priorities, cleanup), see `references/techniques.md → Observability First`.
   Use framework from `superteam:project-awareness` to pick the appropriate logging pattern.
   When project-awareness type = `unknown`: ask user for preferred logging approach.

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

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation |
| `references/techniques.md` | On demand | Entering Phase 1 when investigation approach is unclear. Not needed if the data-flow path is already visible from error messages and stack traces. |

**Rule:** Most debugging sessions resolve with 1-2 techniques. Load `references/techniques.md` only when the debugger needs to select an investigation approach — not preemptively.

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

**Investigation techniques:** See `references/techniques.md` for 12 techniques with selection guidance.
