---
name: core-principles
description: >
  Use when executing any command or agent task. Cross-cutting principles for all
  Superteam work. Auto-triggered by all commands and agents.
  Covers: visual-first verification, UI screenshots, Playwright, browser preview,
  questioning, one question per message, adaptive, ASK/PRESENT/CONFIRM, recommendation.
---

# Core Principles

Cross-cutting principles for ALL commands and agents. Reference once per command instead of duplicating rules.

## Principle 1: Visual-First Verification

```
WHEN THE OUTCOME IS VISUAL, VERIFY VISUALLY.

Code tells you what SHOULD render.
A screenshot tells you what ACTUALLY renders.

Default: screenshot > code-reading for any visual outcome.
```

### When to Apply

Any result **visible to a human user**: UI changes, CSS/layout modifications, design token application, page rendering, responsive behavior, dark/light mode, error pages, loading states.

### How to Verify

**Playwright MCP tools** (preferred):

```
Code complete → Build → browser_navigate → browser_take_screenshot → Evaluate
```

- `browser_navigate` to target URL
- `browser_snapshot` for structure check
- `browser_take_screenshot` for visual confirmation

Do NOT stop at "code compiles." Visual bugs survive compilation.

### Fallback (Playwright Unavailable)

- State explicitly: "Visual verification skipped — Playwright unavailable"
- Fall back to code-reading (grep tokens, check classes)
- Flag as **reduced confidence** in output
- NEVER silently skip visual verification

### Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Grep CSS class = "verified" | Screenshot the rendered page |
| "Tokens look correct in code" | Render and screenshot |
| Skip check on "simple CSS change" | Simple changes break layouts — always screenshot |
| "Playwright unavailable" then silence | State it, fall back, flag confidence |

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

1. VISUAL-FIRST VERIFICATION
   Visual outcome? → Screenshot before claiming "done"
   Tools: browser_navigate → browser_take_screenshot
   Fallback: state skipped + reduced confidence
   Never: grep-only for visual outcomes

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
