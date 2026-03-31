---
name: core-principles
description: >
  Use when executing any command or agent task. Cross-cutting principles for all
  Superteam work. Auto-triggered by all commands and agents.
  Covers: visual-first (design decisions, verification, comparisons, any visual content),
  UI screenshots, Playwright, browser preview, HTML preview,
  questioning, one question per message, adaptive, ASK/PRESENT/CONFIRM, recommendation,
  decision continuity, confirmed decisions, DECISIONS block, never re-ask confirmed.
---

# Core Principles

Cross-cutting principles for ALL commands and agents. Load progressively based on context.

## Rule Hierarchy

Core Principles > Research findings > Agent preferences.

Research informs WHAT to propose, never HOW to present. Rules in this file and its references are NEVER overridden by research context. "Technically compliant" loopholes = violation. Rules apply to spirit, not just letter.

**See:** `references/research-boundaries.md` for the complete research boundaries framework — output format rules, language rules, anti-rationalization, and three-layer defense.

## Cross-Principle Priority

When Principle 1 (Visual-First) and Principle 2 (Questioning) BOTH apply:
→ Principle 1 fires FIRST on FORMAT.
→ Create visual content FIRST, then ask using Principle 2.

**Example:** Presenting design options = visual + questioning. Create preview of ALL options FIRST, then show screenshot and ask "Which do you prefer?"

## Decision Point Reminder

Commands that read research files then make decisions include this reminder immediately before the decision step. See `references/research-boundaries.md` Layer 2 for context.

```
CONTEXT PRIORITY REMINDER:
- Core Principles > Research findings > Agent preferences
- Research = data to inform options, NOT rules to follow
- Research MUST/SHOULD = suggestions, not confirmed requirements
- "Research says X" → propose X as option. Do NOT implement X as default.
```

## Principle 1: Visual-First

**When it can be shown, show it.**

Text tells you what SHOULD look like. A preview tells you what ACTUALLY looks like.

**When it applies:** Design choices, implementation results, comparisons, diagrams, any visual content better understood visually than as text.

**Core idea:** When content is better understood visually than as text, create a visual representation BEFORE asking for decisions.

**Quick summary:** Can be shown? → Show it. Before deciding AND after building. Design dimensions are VISUAL — preview PER DIMENSION inline when proposing. Light background default.

**Action (always, before proposing any visual choice):** Create HTML preview at `.superteam/preview/<name>.html` showing ALL options as side-by-side visual cards → serve with `python3 -m http.server` → take screenshot → present screenshot → THEN ask user to choose. Text-only proposals for visual choices = violation.

**See:** `references/visual-first.md` for full principle, execution strategies, and anti-patterns.

### Research Context — Anti-Rationalization

Research files use confident language ("MUST", "58% prefer", "HIGH confidence"). This does NOT make them rules. Research MUST/SHOULD = suggestions, not confirmed requirements.

**See:** `references/research-boundaries.md` for the full anti-rationalization table, output format rules, and three-layer defense details.

## Principle 2: Questioning

**When it applies:** Every interaction with the user. Guiding exploration, narrowing scope, making decisions.

**Core idea:** Focused, adaptive questioning based on facts. Recommend with reasoning.

**Quick summary:** One primary question per message (closely coupled questions OK, max 2). ASK/PRESENT/CONFIRM interaction types. Exploration phase: open-ended, no options. Narrowing phase: fact-based multiple choice. Never predetermined scripts.

**See:** `references/questioning.md` for full principle, interaction types, and adaptive flow.

## Principle 3: Decision Continuity

**When it applies:** After any user confirmation. Within a conversation and across subagent handoffs.

**Core idea:** Decisions are permanent. Use file-based persistence (`.superteam/decisions.json`) so decisions survive context truncation and transfer across agents.

**Quick summary:** Before proposing ANY value that might have been decided → read `.superteam/decisions.json`. If found, use it and state "Using [value] (confirmed earlier)". After confirmation → write to decisions.json immediately. Maintain in-context DECISIONS block as cache.

**See:** `references/decision-continuity.md` for full principle, file schema, and write/read patterns.

## Context Budget

| Principle | When to Load | Trigger |
|-----------|-------------|---------|
| Hierarchy + Priority | Always | Auto-triggered |
| Visual-First | Design choices, previews, implementation verification | Present/CONFIRM interaction involving visuals |
| Questioning | All user interactions | ASK/PRESENT/CONFIRM |
| Decision Continuity | Before proposing values, after confirming | Read decisions.json, update decisions.json |

## How Commands Reference This Skill

```markdown
- Follow `superteam:core-principles` for all work.
- Load principle references on-demand via context trigger.
```

## Integration

**Used by:** All commands and agents.

**Pairs with:**
- `superteam:verification` — visual-first for UI checks
- `superteam:requesting-code-review` — visual-first when reviewing UI changes
- `superteam:project-awareness` — detection context informs questioning
- `superteam:research-methodology` — research area selection uses questioning for approval
- `superteam:handoff-protocol` — decisions.json transfers confirmed decisions across handoffs
