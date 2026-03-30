---
name: core-principles
description: >
  Use when executing any command or agent task. Cross-cutting principles for all
  Superteam work. Auto-triggered by all commands and agents.
  Covers: visual-first (design decisions, verification, comparisons, any visual content),
  UI screenshots, Playwright, browser preview, HTML preview,
  questioning, one question per message, adaptive, ASK/PRESENT/CONFIRM, recommendation.
---

# Core Principles

Cross-cutting principles for ALL commands and agents. Reference once per command instead of duplicating rules.

## Principle 1: Visual-First

```
WHEN IT CAN BE SHOWN, SHOW IT.

Text tells you what SHOULD look like.
A preview tells you what ACTUALLY looks like.

Default: visual preview > text description for any visual content.
```

### Signal

Content better understood visually than as text:
- **Design choices**: color, font, layout, spacing, aesthetic, motion, decoration
- **Implementation results**: UI, pages, components, CSS changes
- **Comparisons**: A vs B options, before/after, multiple variants
- **Diagrams**: architecture, data flow, relationships
- Any output a user would **LOOK at** rather than **READ**

### Action

```
1. Create self-contained HTML (no framework deps)
2. Serve: python3 -m http.server [port]
3. browser_navigate → browser_take_screenshot
4. Present screenshot in conversation
```

For post-implementation verification:
- `browser_navigate` to target URL
- `browser_take_screenshot` for visual confirmation
- Do NOT stop at "code compiles." Visual bugs survive compilation.

### Fallback Chain

1. **Playwright available** → full preview (preferred)
2. **Playwright unavailable** → provide URL for user to open manually + text description
3. **Cannot serve** → text-only + flag "Visual preview skipped — reduced confidence"

NEVER silently skip visual preview.

### Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Describe visual with text when can show | Create HTML preview + screenshot |
| List options as text table for design choices | Create side-by-side visual cards |
| Grep CSS class = "verified" | Screenshot the rendered page |
| "Tokens look correct in code" | Render and screenshot |
| Skip preview on "simple change" | Simple changes break layouts — always preview |
| "Playwright unavailable" then silence | State it, provide URL, flag confidence |

## Principle 2: Questioning

```
ONE MESSAGE = ONE QUESTION.
Base ONLY on observed facts. Never assume.
```

### Interaction Types

| Type | Rule |
|------|------|
| **ASK** | 1 per message, adaptive. Exploration phase: pure open-ended, NO options/examples. Narrowing phase: multiple choice from known facts only. |
| **PRESENT** | Batch content OK (full plan, proposal). End with 1 decision prompt: "Approve / Adjust?" |
| **CONFIRM** | 1 per message. Provide enough context to decide. |

### ASK Phases

- **Exploration** (low context): Pure open-ended. No options, no "for example...", no "such as...". Goal: let user express intent unconstrained. Stay here until AI has concrete facts about domain, users, core problem.
- **Narrowing** (facts established): Multiple choice OK when options come from KNOWN FACTS. Each option traceable to user answers or codebase evidence.

### Multiple Choice Format

```
[Context + known facts] → [2-4 options from facts] → [Recommendation + confidence]

Recommend: **Option X** — [why]. Confidence: High/Med/Low.
Not Option Y because [fact-based reason].
```

Every option must be grounded in known facts. AI ALWAYS recommends with confidence level.

### Adaptive Flow

Answer N determines Question N+1. After each answer:
- What is the most important unknown NOW? (fact-based only)
- Skip questions already covered by previous answers
- Follow new threads revealed by answers
- Challenge vagueness: "What does [vague term] mean specifically?"
- Never follow a predetermined script regardless of answers

### Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Question dump (3+ in one message) | One question per message |
| Checklist walking (scripted questions) | Adapt based on answers |
| Premature options / examples-as-options | Stay in exploration until facts exist |
| Assumptions as facts | List known facts; CONFIRM if uncertain |
| Shallow acceptance (accept vague answers) | Challenge: "What does X mean specifically?" |
| Hidden batch (sub-questions inside one question) | Split into separate messages |

## Quick Reference

```
CORE PRINCIPLES:

1. VISUAL-FIRST
   Can be shown? → Show it. Before deciding AND after building.
   Action: HTML → local server → Playwright screenshot
   Fallback: URL manual → text + reduced confidence
   Never: text-only when can preview, silent skip

2. QUESTIONING
   One question per message. Adaptive. Recommend with reasoning.
   ASK (1/msg) | PRESENT (batch OK) | CONFIRM (1/msg)
   Exploration: open-ended, no options. Narrowing: facts-based options.
   Never: question dumps, checklist walking, assumptions as facts.
```

## How Commands Reference This Skill

```markdown
- Follow `superteam:core-principles` for all work.
```

## Extensibility

Append new principles as numbered sections. Update Quick Reference when adding.

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Auto-triggered by all commands |

**Self-contained.** No reference files.

## Integration

**Used by:** All commands (30) and all agents (20).

**Pairs with:**
- `superteam:verification` — visual-first for UI checks
- `superteam:requesting-code-review` — visual-first when reviewing UI changes
- `superteam:project-awareness` — detection context informs what questions to ask
- `superteam:research-methodology` — research area selection uses questioning for user approval
