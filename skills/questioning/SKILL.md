---
name: questioning
description: >
  Use when any command asks users questions. Enforces one question per message,
  adaptive follow-up, AI recommendation with reasoning for multiple choice,
  and distinction between ASK/PRESENT/CONFIRM interaction types.
  Auto-triggered by all interactive commands.
---

# Questioning

## Overview

Questioning ensures every user interaction follows a natural, one-at-a-time conversation flow. It prevents question dumping, enforces adaptive follow-up based on user answers, and requires AI recommendations for every multiple choice question.

**Two responsibilities:**
1. **Flow** — one question per message, adaptive to user answers.
2. **Quality** — every question has purpose, context, and (for multiple choice) a recommendation.

## Core Principle

```
ONE MESSAGE = ONE QUESTION.

A question must:
  - Stand alone in its message (no bundling with other questions)
  - Build on the user's previous answer (adaptive)
  - Have clear purpose (why are we asking this?)
  - Include AI recommendation when options are known
  - Base ONLY on observed facts (user answers, detection results, codebase)
  - NEVER assume what the user means — if uncertain, CONFIRM or say "I don't know enough yet"

If you want to ask two things, send two messages.
```

## Three Interaction Types

Not every user interaction is a "question." Distinguish:

| Type | Purpose | Rule | Example |
|------|---------|------|---------|
| **ASK** | Collect new information or choice from user | ONE per message, adaptive | "Which platform?" / "What are you building?" |
| **PRESENT** | Show completed work for user review/approval | Batch content OK, end with ONE decision prompt | Show research plan, design proposal, roadmap → "Approve or adjust?" |
| **CONFIRM** | Yes/no gate to proceed | ONE per message | "Continue?" / "Is this correct?" |

### ASK Rules

```
ASK = collecting information the AI does not yet have.

TWO PHASES:
  Exploration (early, low context):
    - Pure open-ended questions. NO options, NO examples, NO suggestions.
    - Goal: let user express intent without AI constraining it.
    - Stays in exploration until AI has concrete facts about: domain, users, core problem.
    - "For example..." or "such as..." = premature options in disguise. Do NOT use.

  Narrowing (after concrete context established):
    - Multiple choice OK when options come from KNOWN FACTS, not AI guesses.
    - Each option must be traceable to something user said or codebase showed.

RULES:
  - ONE question per message. Never bundle 2+ questions.
  - Adaptive: next question DEPENDS on previous answer.
  - No fixed question list. AI decides next question dynamically.
  - If previous answer already covers a planned question → skip it.
  - If previous answer opens a new direction → follow that first.
  - Skip questions whose answers are inferrable from context.
```

### PRESENT Rules

```
PRESENT = showing work for review. This is NOT asking multiple questions.

RULES:
  - Batch content is OK (show full plan, full proposal, full report).
  - End with ONE decision prompt: "Approve / Adjust / Start over?"
  - Do not mix PRESENT with ASK in the same message.
  - After user responds, follow-up is ASK (one at a time) if adjustments needed.
```

### CONFIRM Rules

```
CONFIRM = yes/no gate before proceeding.

RULES:
  - ONE per message.
  - Provide enough context for user to decide.
  - Do not bundle confirm with an ASK question.
```

## Multiple Choice Format

When asking a multiple choice question, always recommend:

```
[Context — why this question matters. Known facts: [cite from user answers/detection]]

- **Option A** — [description]
- **Option B** — [description]
- **Option C** — [description]

Recommend: **Option B** — [reason]. Confidence: High/Med/Low.
Not Option A because [fact-based reason]. Not Option C because [fact-based reason].
```

### Format Rules

- Lead with context (why asking) AND known facts that led to these options
- 2-4 options. More than 4 → group or split into two questions.
- Each option has a short label + description
- Every option must be grounded in known facts — no AI-invented options
- AI ALWAYS recommends one option with confidence level (High/Med/Low)
- Recommendation includes: why this option + why NOT each other option (fact-based, no assumptions)
- User can always choose differently — recommendation is guidance, not enforcement

## Adaptive Questioning

```
ADAPTIVE FLOW:
  Answer N → determines Question N+1.

  HOW:
  - After each answer, evaluate: what is the most important unknown NOW?
  - Base ONLY on facts: user answers, detection results, codebase evidence.
  - If the answer gave info about future planned questions → skip those
  - If the answer revealed a new concern → address that first
  - If the answer was vague → follow up for specifics before moving on

  NEVER:
  - Ask a question whose answer is obvious from previous context
  - Follow a predetermined script regardless of answers
  - Ask "anything else?" immediately after first answer — follow thread first
  - Assume domain, users, or constraints not stated by user
  - Offer options based on AI's guess of what user might mean
```

### Example: Config Preferences (Adaptive)

Bad (batch):
> 1. Granularity? (coarse/standard/fine)
> 2. Parallelization? (parallel/sequential)
> 3. Git tracking? (yes/no)

Good (adaptive):
> **Message 1:** "Project size affects how detailed your planning should be.
> - **Coarse** — fewer tasks per phase, fast execution, good for small projects
> - **Standard** — balanced detail and speed
> - **Fine** — many small tasks, tight control, good for large projects
>
> Recommend: **Standard** — fits most projects. Coarse risks missing details, Fine adds overhead for small projects."

User: "Standard"

> **Message 2:** "With Standard granularity, research agents produce moderate output.
> - **Parallel** — faster, multiple agents run simultaneously
> - **Sequential** — slower but easier to follow, saves tokens
>
> Recommend: **Parallel** — Standard produces manageable output, so parallel is efficient without being overwhelming."

### Example: Deep Questioning (Adaptive)

Bad (batch):
> 1. Platform: Web, mobile, or desktop?
> 2. Tech stack: React, Flutter, Laravel?
> 3. V1 scope: core features?

Bad (examples-as-options — premature narrowing):
> User: "They waste too much time on repetitive tasks"
>
> AI: "Which repetitive tasks? For example, status reporting, code reviews, deployment steps, data entry?"
>
> **Why bad:** AI assumes technical team (no facts support this). Listing examples constrains user to AI's guesses.

Good (adaptive, fact-based):
> **Message 1:** "What are you building?"

User: "A tool to help my team work better"

> **Message 2:** "What does 'work better' mean specifically for your team?"

User: "They waste too much time on repetitive tasks"

> **Message 3:** "Can you walk me through a typical day? What tasks keep coming up that feel repetitive?"

**Why good:** Message 3 stays pure open-ended. AI knows: team exists, repetitive tasks are the pain point. AI does NOT know: domain, team size, what tasks. So it asks the user to describe, not pick from a list.

## Anti-Patterns

| Anti-Pattern | Why Bad | Fix |
|-------------|---------|-----|
| **Question dump** — 3+ questions in one message | Overwhelms user, loses adaptive opportunity | One question per message |
| **Checklist walking** — asking scripted questions regardless of answers | Feels robotic, misses context from answers | Adapt based on what user said |
| **Interrogation** — rapid-fire questions without processing answers | User feels rushed, AI doesn't build understanding | Follow the thread, explore depth |
| **Redundant question** — asking what's already known from context | Wastes user time, shows AI not listening | Skip questions answered by prior context |
| **Premature options** — offering choices before understanding intent | Constrains user thinking too early | Stay in exploration phase until concrete facts exist |
| **Examples as options** — "e.g., X, Y, Z?" disguised as open-ended | Same as premature options, just hidden | Pure open-ended: no "for example", "such as", "like" lists |
| **Hidden batch** — one "question" with sub-questions inside | Still a question dump, just formatted as one | Split into separate messages |
| **Assumptions as facts** — treating AI guesses as known context | Hallucinated foundation, wrong direction | List known facts before each question; CONFIRM if uncertain |
| **Shallow acceptance** — accepting vague answers without follow-up | Builds on weak foundation | Challenge: "What does [vague term] mean specifically?" |

## How Commands Reference This Skill

Add to the Rules section of each command:

```markdown
- Follow `superteam:questioning` for all user interactions.
```

For commands with specific questioning steps, also add inline:

```markdown
3. **Questioning phase**
   - Follow `superteam:questioning`
   - [command-specific questioning details]
```

## Quick Reference

```
GOLDEN RULE:
  One question per message. Next question adapts to previous answer.
  Base ONLY on observed facts. Never assume.

PHASES:
  Exploration (low context) → pure open-ended, NO options/examples
  Narrowing (facts established) → multiple choice from known facts

INTERACTION TYPES:
  ASK     → 1 per message, adaptive, recommend for multiple choice
  PRESENT → batch content OK, end with 1 decision prompt
  CONFIRM → 1 per message, provide context

MULTIPLE CHOICE FORMAT:
  [Context + known facts] → [Options from facts] → [Recommendation + confidence]

ADAPTIVE:
  Answer determines next question. Fact-based only.
  Skip covered questions. Follow new threads. Challenge vagueness.

ANTI-PATTERNS:
  No question dumps. No checklist walking. No interrogation.
  No redundant questions. No premature options. No examples-as-options.
  No assumptions as facts. No shallow acceptance.
```

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation (auto-triggered by interactive commands) |

**Self-contained.** No reference files. All questioning rules fit in SKILL.md.

## Integration

**Used by:** All interactive commands (27 of 30 commands).

**Skills that pair with questioning:**
- `superteam:project-awareness` — detection context informs what questions to ask
- `superteam:research-methodology` — research area selection uses questioning for user approval
