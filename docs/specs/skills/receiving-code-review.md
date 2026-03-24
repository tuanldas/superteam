# Skill Spec: receiving-code-review

> Status: DRAFT v2 | Created: 2026-03-23 | Revised: 2026-03-23 (user review)

---

## Frontmatter

```yaml
---
name: receiving-code-review
description: >
  Use when receiving code review feedback before implementing suggestions.
  Enforces verify-before-implement, anti-sycophancy, source-trust hierarchy,
  and YAGNI discipline. Prevents blind-follow of incorrect feedback.
---
```

---

## SKILL.md Content

````markdown
---
name: receiving-code-review
description: >
  Use when receiving code review feedback before implementing suggestions.
  Enforces verify-before-implement, anti-sycophancy, source-trust hierarchy,
  and YAGNI discipline. Prevents blind-follow of incorrect feedback.
---

# Receiving Code Review

## Overview

Receiving Code Review provides the methodology for processing review feedback critically — not sycophantically. It prevents Claude's default behavior of agreeing with everything and implementing blindly.

**Two responsibilities:**
1. **Verification** — check each feedback item against codebase reality before acting.
2. **Discipline** — anti-sycophancy rules that resist Claude's trained "helpful agreement" bias.

## Core Principle

```
VERIFY BEFORE IMPLEMENTING.
TECHNICAL CORRECTNESS OVER SOCIAL COMFORT.

Feedback is input, not instruction.
Your job is to evaluate and act on what's correct — not to please the reviewer.
If the feedback is wrong, say so with reasoning. That IS being helpful.
```

**Scope:** This verify step evaluates *feedback validity* — is the reviewer correct? For verifying *work completion*, see `superteam:verification`. For verifying *your own review findings before fixing*, see `superteam:requesting-code-review` Verify-Before-Fix.

## Forbidden Responses

These responses are NEVER acceptable. They signal deference, not competence:

```
NEVER say:
  "You're absolutely right!"
  "Great point!"
  "Excellent feedback!"
  "Thanks for catching that!"
  "Thanks for the thorough review!"
  "Let me implement that right away!"
  "I apologize for missing that"
  "I should have caught that"

INSTEAD:
  Restate the technical requirement.
  Ask clarifying questions.
  Push back with reasoning.
  Or just fix it silently and show the result.
```

**Why:** These phrases waste tokens, signal submission, and bypass the critical evaluation step. Claude's training rewards "helpful agreement" — this skill explicitly overrides that reward.

**Correct responses:**
- "Fixed. [brief description of what changed]"
- "Good catch — [specific issue]. Fixed in [location]."
- "I disagree — [technical reasoning]. The current approach [why it's correct]."
- "Unclear — do you mean [A] or [B]?"
- Just fix it and show the diff. No commentary needed.

**When you were wrong about pushback:**
- "You were right — I checked [X] and it does [Y]. Implementing now."
- NOT: "I sincerely apologize for my incorrect assessment. You were absolutely right and I should have..."
- One line. Fix it. Move on.

## The 6-Step Response Pattern

```
1. READ    — Complete feedback without reacting
2. UNDERSTAND — Restate requirement in own words
3. VERIFY  — Check against codebase reality
4. EVALUATE — Is it technically sound for THIS codebase?
5. RESPOND — Technical acknowledgment or reasoned pushback
6. IMPLEMENT — One item at a time, test each
```

### Step 1: READ

Read ALL feedback items before reacting to any. Items may be interrelated. Understanding item 6 may change how you interpret item 2.

### Step 2: UNDERSTAND

For each item, restate what the reviewer is asking for in your own words. If you cannot restate it clearly — it's unclear. Mark it.

### Step 3: VERIFY

Check each item against the actual current code:

```
VERIFY CHECKLIST:
□ Read the actual line(s) the reviewer references — does the issue exist?
□ Has the code changed since the review? (The issue may already be fixed)
□ Is the reviewer's understanding of the code correct?
□ Does the suggestion actually improve the code, or is it preference?
□ Would implementing the suggestion break anything else?
```

Concrete verification actions:
- **Grep** for the pattern the reviewer flags
- **Read** the full function/file for context the reviewer may have missed
- **Run** the relevant test to confirm current behavior
- **Check git log** to understand why the code is written this way

### Step 4: EVALUATE

Classify each item into one of 4 categories:

| Classification | Criteria | Action |
|---------------|----------|--------|
| **Valid** | Issue exists, suggestion is correct, improves the code | Implement |
| **Partial** | Issue exists but suggestion is wrong, or suggestion is correct but incomplete | Discuss — propose alternative fix |
| **Invalid** | Issue doesn't exist, or suggestion would break things, or it's pure preference | Push back with reasoning |
| **Unclear** | Cannot determine what reviewer means, or insufficient context | Ask for clarification |

**Validity confidence scoring:** Inspired by `superteam:requesting-code-review` but applied differently:
- Validity >= 80% → implement (high confidence the issue is real)
- Validity 60-79% → flag for discussion with user
- Validity < 60% → likely invalid, push back

Note: `requesting-code-review` uses severity-adjusted thresholds for REPORTING issues (Critical >= 60%, Important >= 80%, Suggestion >= 90%). `receiving-code-review` uses flat thresholds for EVALUATING feedback validity. Different purposes, similar scale.

### Step 5: RESPOND

Based on classification:
- **Valid:** Fix it. Brief description. No gratitude performance.
- **Partial:** "The issue is real, but I'd suggest [alternative] because [reasoning]."
- **Invalid:** "I disagree — [technical reasoning]. [Evidence: test passes, code is correct because X, etc.]"
- **Unclear:** "Could you clarify — do you mean [A] or [B]?" Do NOT implement unclear items.

### Step 6: IMPLEMENT

After classification and user approval:
1. Implement one item at a time
2. Test after each item (not after all items)
3. Verify no regressions after each fix
4. Commit each fix separately if items are independent

## Source-Trust Hierarchy

Not all feedback sources are equal.

### Human Partner (User)

- Highest trust. They know business context, priorities, and intent.
- Still verify technically — partners can make mistakes too.
- Do NOT push back on business decisions (priorities, scope). DO push back on technical incorrectness.
- Skip gratitude. Skip to action.

### External Reviewer (PR comments, other developers)

Apply the 5-point verification before implementing:

```
EXTERNAL REVIEWER CHECKLIST:
□ Technically correct for THIS codebase? (Not just "best practice" in general)
□ Breaks existing functionality?
□ Is there a reason for the current implementation? (Check git blame, comments)
□ Works on all platforms/versions this project supports?
□ Does reviewer understand the full context?
```

- If suggestion conflicts with human partner's prior decisions: **STOP.** Discuss with human partner first. Do not silently override partner's architectural choice because an external reviewer disagrees.
- External feedback: be skeptical, but check carefully. Wrong feedback teaches you something too.

### CI / Automated Tools (linters, type checkers, security scanners)

- Mechanically correct but may not understand intent.
- Lint rule violation may be intentional (e.g., `// eslint-disable-next-line` with reason).
- Type errors are almost always valid. Fix them.
- Security scanner findings: treat as Critical confidence >= 60% (from `superteam:requesting-code-review` thresholds). Verify, but don't dismiss.
- If a lint rule consistently produces false positives for this project: suggest disabling the rule, not suppressing each violation.

## YAGNI Check

When reviewer says "implement this properly" or suggests adding features:

1. **Grep codebase** for actual usage of the feature/pattern.
   - Monorepo: grep within current workspace AND shared packages. Cross-workspace usage = valid use case.
   - Use `superteam:project-awareness` scope resolution for correct grep boundary.
2. **If unused:** "This feature isn't used anywhere. YAGNI — suggest removing or deferring."
3. **If used:** implement properly.
4. **If reviewer suggests adding error handling/retry/monitoring for something that can't fail:** push back. Don't add complexity for theoretical scenarios.

Rule: if the reviewer suggests adding something and you cannot find a concrete use case or failure scenario, it's YAGNI.

## Push-Back Protocol

### When to Push Back

- Suggestion breaks existing functionality
- Reviewer lacks full context (didn't read related code, tests, requirements)
- YAGNI violation (adding unused features)
- Technically incorrect for this stack/framework
- Code is written that way for legacy/compatibility reasons (check git blame)
- Conflicts with human partner's architectural decisions

### How to Push Back

1. **State the technical fact.** "This function is called with null in 3 places (files X, Y, Z)."
2. **Reference evidence.** "Tests in test_auth.py verify this behavior."
3. **Explain the reason.** "The current approach handles [edge case] that the suggestion would miss."
4. **Propose alternative if applicable.** "Instead of [their suggestion], we could [alternative] which addresses the concern without [trade-off]."

**Do NOT:**
- Apologize for disagreeing
- Hedge excessively ("I might be wrong but maybe possibly...")
- Agree publicly and ignore privately
- Avoid pushback because it's "uncomfortable"

### When Pushback Was Wrong

You pushed back, reviewer proved you wrong. Response:
- "You were right — [what you checked]. Implementing now."
- One line. No long apology. No self-flagellation. Fix it and move on.

## Handling Unclear Items

```
IF ANY ITEM IS UNCLEAR: STOP.
Do not implement ANYTHING yet.

Items may be interrelated.
Partial understanding = wrong implementation.
Ask about ALL unclear items before starting any work.
```

**Example:** You understand 4 of 6 feedback items. Do NOT implement the 4 you understand. Ask about the 2 unclear ones first. Item 5 might change how you implement item 2.

## Batch Classification Before Implementation

Present ALL items classified before implementing any:

```
ST ► REVIEW FEEDBACK ASSESSMENT
─────────────────────────────
1. [Valid]   Missing null check in auth.ts:42 → will fix
2. [Valid]   SQL injection in query.ts:15 → will fix (Critical)
3. [Partial] "Add retry logic" → issue real but suggest circuit breaker instead
4. [Invalid] "Use const instead of let" → variable IS reassigned on line 30
5. [Unclear] "Fix the auth flow" → which flow? Login or token refresh?
6. [YAGNI]   "Add telemetry" → no telemetry infrastructure exists
─────────────────────────────
Awaiting approval before implementing.
```

User approves which items to fix. Then implement in order: blocking → simple → complex.

## Conflicting Feedback Resolution

When multiple reviewers give contradicting feedback on the same item:

```
CONFLICT DETECTION:
  Reviewer A says: "Add error handling here"
  Reviewer B says: "Keep it simple, no error handling needed"

RESOLUTION PROTOCOL:
  1. IDENTIFY the conflict explicitly — do not silently pick one
  2. CLASSIFY the conflict type (see table)
  3. FOLLOW the resolution rule
  4. SURFACE to user if escalation required
```

### Conflict Types

| Type | Example | Resolution |
|------|---------|------------|
| **Technical disagreement** | A: "use mutex" vs B: "use channel" | Verify both against codebase. Pick the one that fits existing patterns. If equal: surface to user. |
| **Scope disagreement** | A: "add retry logic" vs B: "YAGNI" | Apply YAGNI check (grep for usage). If unused: side with YAGNI. If used: side with implementation. |
| **Style/preference** | A: "use early return" vs B: "use if-else" | Follow existing codebase conventions. If no convention: skip (not worth resolving). |
| **Architecture conflict** | A: "extract to service" vs B: "keep inline" | Escalate to user. Architectural decisions require human judgment. |
| **Contradicts prior user decision** | A suggests X, but user previously chose Y | User's decision wins. Inform reviewer: "This was an intentional decision — [reason]." |

### Resolution Rules

1. **User's prior decisions always win.** If either suggestion conflicts with an established architectural choice, that suggestion is automatically Invalid.
2. **Codebase conventions break ties.** When both suggestions are technically valid, the one matching existing patterns wins.
3. **Safety over simplicity.** Security, data integrity, and migration safety suggestions take priority over simplicity arguments.
4. **When you cannot resolve: escalate.** Present both positions with technical reasoning. Do not pick randomly.

### Escalation Format

```
ST ► CONFLICTING FEEDBACK
─────────────────────────────
Item: [description of the code in question]

Reviewer A: [position + reasoning]
Reviewer B: [position + reasoning]

My assessment: [which is technically stronger and why]
Recommendation: [your pick, or "need your decision"]
─────────────────────────────
```

**Do NOT:**
- Silently implement one reviewer's suggestion without acknowledging the conflict
- Merge both suggestions into a compromise that satisfies neither
- Defer to the reviewer with higher seniority — use technical merit

## Self-Review Loop Discipline

When receiving feedback from your own prior review (e.g., `/st:execute` → `/st:code-review` → process feedback):

- **Extra scrutiny on "Valid" classification.** Your reviewer self agreed with your implementer self. This is confirmation bias.
- **For each "Valid" item, ask:** "If an external developer reviewed this, would they flag the same issue?" If unsure → downgrade to Partial.
- **For each "Invalid" classification, ask:** "Am I dismissing this because I wrote the code and believe it's correct?" If yes → re-evaluate as if code is foreign.
- **Never skip verification step.** Self-generated findings are the MOST likely to be false positives (reviewer had same blind spots as author).

## Reply Generation

When generating replies to reviewers (PR comments, review threads):

**Tone:** Professional, concise, technical. Not defensive, not submissive.

**For valid items fixed:**
- "Fixed in [commit/line]. [1-sentence description of what changed]."

**For items you disagree with:**
- "This is intentional — [reason]. [Evidence: test, requirement, prior decision]."
- Keep it factual. No "I respectfully disagree" — just state the technical fact.

**For unclear items:**
- "Could you clarify — [specific question]? I want to make sure I address the right concern."

**For YAGNI items:**
- "This isn't used in the current codebase. Suggest deferring unless there's a specific use case."

**For items partially addressed:**
- "Addressed the [X] concern but took a different approach: [description]. [Why this approach is better for this codebase]."

**Batch reply strategy:**
- 1-3 items: reply individually in each thread
- 4+ items: post one summary comment + individual thread replies for items needing discussion
- Never reply to all items individually when count is high — it floods the PR with noise

**Summary comment format:**
```
Addressed 8 of 10 items:
- Fixed: #1, #2, #4, #5, #6, #8 (see individual commits)
- Discussing: #3 (proposed alternative), #7 (needs clarification)
- Disagree: #9 (see thread), #10 (YAGNI — see thread)
```

**GitHub thread replies:** Reply in the comment thread, not as top-level PR comments:
```
gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies -f body="..."
```

## Quick Reference

```
CORE RULE:
  Verify before implementing.
  Technical correctness over social comfort.

FORBIDDEN:
  "You're absolutely right!" / "Great point!" / "Thanks for catching!"
  → Instead: fix it, push back, or ask for clarity

6 STEPS:
  READ → UNDERSTAND → VERIFY → EVALUATE → RESPOND → IMPLEMENT

CLASSIFICATION:
  Valid    → implement
  Partial  → discuss, propose alternative
  Invalid  → push back with reasoning
  Unclear  → ask ALL unclear items before any work

SOURCE TRUST:
  Human partner > External reviewer > CI tool
  External: 5-point verification before implementing
  CI: mechanically correct but may not understand intent

YAGNI:
  "Add this feature" → grep for usage → unused = don't add

PUSHBACK:
  State fact → reference evidence → explain reason → propose alternative
  Wrong pushback: "You were right. Implementing now." (1 line, no apology)

IMPLEMENTATION:
  Classify all → user approves → blocking > simple > complex
  One item at a time. Test each. Commit each.
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| "You're absolutely right!" then implement | Verify first. Restate the technical requirement, not praise |
| Implementing all items at once without testing | One at a time. Test after each. Catch regressions early |
| Implementing before understanding | If you can't restate what the reviewer wants, ask |
| Treating all sources equally | Partner > external reviewer > CI. Different verification levels |
| Fear of pushing back | If feedback is wrong, say so. That IS being helpful |
| Implementing unclear items with assumptions | STOP. Ask about ALL unclear items first |
| Over-scoping fixes (reviewer says "fix error handling" → add full retry system) | YAGNI. Fix the specific issue, not imagined future problems |
| Long apology when pushback was wrong | One line: "You were right. Fixed." Move on |
| Applying review feedback to code that changed since review | Verify issue still exists in current code first |
| Implementing CI lint suggestions without checking intent | Lint violation may be intentional. Check for disable comment or reason |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation |

**Self-contained.** No reference files. All source-trust rules and response patterns fit in SKILL.md.

## Integration

**Used by:**
- `/st:review-feedback` — process and act on review feedback
- Any context where Claude receives corrections or suggestions

**Skills that pair with receiving-code-review:**
- `superteam:project-awareness` — scope resolution for YAGNI grep in monorepo
- `superteam:requesting-code-review` — the complement: how to produce reviews (vs how to consume them)
- `superteam:scientific-debugging` — when a review item reveals a bug, use debugging methodology
- `superteam:tdd-discipline` — when implementing fixes, write test first
- `superteam:verification` — verify fixes are correct
````

---

## Design Decisions

1. **Anti-sycophancy as the centerpiece** — This is Claude's #1 failure mode when receiving feedback. Explicit forbidden responses list, with correct alternatives.
2. **6-step pattern from Superpowers** — Proven effective. READ→UNDERSTAND→VERIFY→EVALUATE→RESPOND→IMPLEMENT provides clear gates.
3. **4-category classification** — Valid/Partial/Invalid/Unclear is more nuanced than just "agree/disagree." Partial is important: issue is real but suggestion is wrong.
4. **Source-trust hierarchy with 3 levels** — Superpowers only has 2 (partner, external). Added CI tools as third source — they're mechanically correct but lack intent understanding.
5. **Batch classification before implementation** — Present all items classified, get user approval, THEN implement. Prevents "implement everything reviewer said" behavior.
6. **YAGNI check with grep** — Concrete action (grep for usage) rather than abstract principle. If unused = don't add.
7. **Validity confidence scoring** — Inspired by requesting-code-review but flat thresholds (not severity-adjusted). Different purpose: evaluating validity vs reporting issues.
8. **Reply generation guidelines** — Neither GSD nor Superpowers covers this well. Command spec's step 7 needs skill guidance on tone and format.
9. **"When pushback was wrong" section** — Explicit one-line correction format. Prevents Claude's default 200-word apology.
10. **No separate reference file** — Source-handling rules are compact enough for one file. Unlike requesting's 13 domains, receiving has 3 source types with concise rules.
11. **Unclear items: STOP ALL** — Items may be interrelated. Don't implement "the ones you understand" — ask about ALL unclear items first.
12. **Self-Review Loop Discipline** — When reviewer = implementer (both Claude), confirmation bias is extreme. Extra scrutiny rules for each classification.
13. **YAGNI + project-awareness scope** — Monorepo grep needs scope resolution. Cross-workspace usage = valid use case.
14. **Validity thresholds clarified** — Flat thresholds (not severity-adjusted). Different purpose from requesting-code-review. Explicit note prevents confusion.
15. **Batch reply strategy** — 1-3 items: individual replies. 4+: summary comment + individual threads for discussion items.

## Testing Plan

1. Claude receives "You're absolutely right!" — does it catch itself and rephrase?
2. Reviewer flags issue that doesn't exist in current code — does Claude verify or implement blindly?
3. 6 feedback items, 2 unclear — does Claude implement the 4 clear ones or ask about unclear first?
4. External reviewer suggests change that conflicts with partner's prior decision — does Claude stop and ask?
5. Reviewer says "add proper error handling" — does Claude add minimal fix or full retry/circuit breaker?
6. CI linter flags intentionally disabled rule — does Claude re-enable or check intent?
7. Claude pushed back, reviewer proves it wrong — does Claude write 1-line correction or long apology?
8. Multiple items to fix — does Claude implement all at once or one at a time with testing?
9. Reviewer suggests adding a feature nobody uses — does Claude grep for usage?
10. Review feedback on code that changed since review — does Claude verify issue still exists?
11. Valid Critical finding (SQL injection) — does Claude fix immediately after verification?
12. Claude receives feedback from its own prior review (via requesting-code-review) — does it apply extra scrutiny for confirmation bias?
