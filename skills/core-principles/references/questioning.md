# Principle 2: Questioning

## Core Principle

**Ask focused, adaptive questions based on observed facts. Never assume. One primary question per message (closely coupled questions OK: max 2 if one's answer determines the other). Recommend with reasoning.**

## Why This Matters

Question dumps (3+ in one message) and predetermined scripts ("ask step 1, then step 2, then step 3") waste user time and miss context. Answers to early questions often make later questions irrelevant or change their meaning entirely. Adaptive flow — where answer N determines question N+1 — captures context as it emerges and respects the user's evolving understanding.

## Interaction Types

Every interaction fits into one of three categories:

### ASK (Exploration and Narrowing)

**One question per message.** Adapt based on previous answers.

#### Exploration Phase (Low Context)

When you lack concrete facts about the domain, users, or core problem:
- Ask pure open-ended questions
- NO options, NO "for example...", NO "such as..."
- Goal: Let user express intent unconstrained
- Examples:
  - "What problem are you solving?"
  - "Who is your primary user?"
  - "What's your budget for this?"

Why? Options and examples constrain thinking. Users often take the first option without considering what they actually want.

**Stay in exploration until:** User answers ground concrete facts (domain, audience, constraints, goals). You have enough context to propose meaningful options.

#### Narrowing Phase (Facts Established)

When you have concrete facts from previous answers:
- Multiple choice OK when options come from KNOWN FACTS
- Each option must be traceable to user answers or codebase evidence
- Include a recommendation with reasoning and confidence level
- Format:

```
[Recap of known facts] → [2-4 options derived from facts] → [Recommendation + confidence]

Based on [fact], recommend: **Option X** — [why]. Confidence: High/Med/Low.
Not Option Y because [fact-based reason].
```

Examples:
- Known fact: "Your users are non-technical." Option A (CLI) vs Option B (GUI). Recommend B.
- Known fact: "Company prefers Vue over React." Option A (React) vs Option B (Vue). Recommend B.

Every option must be grounded in facts. AI ALWAYS recommends — never offer options without recommendation.

### PRESENT (Batch OK)

Provide complete information: full plan, proposal, architecture decision.

```
[Full proposal/plan details]

---

Approve / Adjust / Request changes?
```

End with ONE decision prompt. Batch content is OK here — users expect detailed proposals. But conclude with a single question prompt.

### CONFIRM (Verification)

One confirmation per message. Provide enough context to decide.

```
Should I [specific action]? This will [what happens].

Confirm / Request changes / Cancel?
```

Context example: "Should I deploy v2.1.0 to production? This will replace the current stable version (v2.0.5) and enable feature X for all users."

## Multiple Choice Format

When offering narrowing-phase options:

```
[Known facts] → [option A, option B, ...] → [recommendation] → [confidence]
```

Example:

```
You confirmed the target audience is developers familiar with Kubernetes. They value automation and scripting.

Options:
- **Option A:** Python CLI with subprocess integration
- **Option B:** Go CLI with native binary compilation
- **Option C:** Bash wrapper around existing kubectl

Recommend: **Option B** — native binary means no runtime dependency (Python), better performance, closer to user's ecosystem. Confidence: High.

Not A because Python requires installation (friction for K8s teams). Not C because shell scripts are fragile in production CI.
```

**Recommendation rules:**
- AI always recommends. Never say "up to you"
- State confidence: High / Med / Low
- Reasoning must reference known facts
- Be natural, not formulaic. Don't force "Recommend: X" template — adapt to context.

## Adaptive Flow

Answer N determines Question N+1. After each answer:

1. **What is the most important unknown NOW?** (fact-based, not predetermined)
2. Skip questions already answered
3. Follow new threads revealed by answers
4. Challenge vagueness: "What does [vague term] mean specifically?"
5. Never follow a predetermined script

Example of adaptive flow:

```
Q1: "What problem are you solving?"
A1: "Users complain that migrations are slow."

Q2 (NOT "What's your budget?"): "When you say slow, do you mean time-to-completion or perceived sluggishness?"
A2: "Both. Takes 5 hours. Feedback shows they get frustrated after 10 minutes with no visible progress."

Q3 (NOT "What's your timeline?"): "Have you measured where time goes — database operations, API calls, data transformation?"
A3: "No, we haven't profiled."

Q4 (NOT continuing predetermined script): "Should we start by profiling, or do you have hypotheses about the bottleneck?"
```

Why? Each answer changed the next question. Q2 split vagueness. Q3 uncovered missing data. Q4 offered a choice based on facts uncovered.

Do NOT:

```
Q1: "What problem are you solving?"
Q2: "What's your budget?"
Q3: "What's your timeline?"
Q4: "Who are your users?"
```

This predetermined script ignores A1-A3. Real flow is adaptive.

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Question dump (3+ in one message) | One question per message (closely coupled questions OK, max 2) |
| Checklist walking (scripted questions regardless of answers) | Adapt based on answers; ask the most important unknown NOW |
| Premature options / examples-as-options in exploration | Stay in exploration (open-ended) until facts exist |
| "You could do X, Y, or Z" (no recommendation) | Always recommend. State confidence. Explain why. |
| Accepting vague answers ("it's important", "it's good") | Challenge: "What does X mean specifically?" or "How do you measure good?" |
| Hidden batch (sub-questions inside one question) | Split: "How do X and Y differ?" → two separate messages |
| Assuming domain knowledge ("You probably use Webpack") | Ask, don't assume. Confirm facts before proposing options. |

## Integration with Principle 1 (Visual-First)

See `visual-first.md`. When asking about design choices:

1. Create visual preview FIRST (Visual-First fires first)
2. Show screenshot to user
3. Ask "Which option do you prefer?" (Questioning phase)

Example:
- Create preview of typography options A, B, C
- Show screenshot
- Ask: "Which typography do you prefer?"

Never text-first design questions. Preview first, ask second.

## Integration with Principle 3 (Decision Continuity)

After user answers a question or approves an option:

1. Record decision in `.superteam/decisions.json`
2. In future questions, check if the answer is already decided
3. If decided, use that value and say "Using [value] (confirmed earlier)"
4. Do NOT re-ask confirmed decisions

Example:

```
Earlier: User approved color #1a1a2e
Later: Proposing navigation bar design
Check decisions.json → found color decision
Use #1a1a2e in preview without asking about color again
Say "Using approved primary color #1a1a2e"
```

See `decision-continuity.md` for file schema and persistence patterns.

## Recommendation Style

Recommendations should feel natural, not robotic. Adapt to context:

**Formal context:**
```
Based on the regulatory requirements you outlined, recommend: **Approach B (encrypted at-rest)** — compliance officers prefer cryptographic guarantees over access controls. Confidence: High.
```

**Casual context:**
```
You're building for power users who already use the CLI. **Lean into the CLI** — they'll appreciate the speed and scriptability. Confidence: High.
```

**Data-driven context:**
```
78% of users in your cohort prefer dark mode in evening sessions. **Offer a dark mode toggle** — it's a quick win and matches actual usage. Confidence: Med.
```

**Exploratory context:**
```
This is your first time designing for accessibility. **Start with WCAG Level AA checklist** — it's a clear standard and covers the majority of user needs. Confidence: High. We can refine after launch.
```

All maintain confidence level and reasoning, but adapt tone to conversation.
