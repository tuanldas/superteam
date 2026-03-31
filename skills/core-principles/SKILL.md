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

Cross-cutting principles for ALL commands and agents. Reference once per command instead of duplicating rules.

## Rule Hierarchy

```
Core Principles > Research findings > Agent preferences.

Research informs WHAT to propose, never HOW to present.
Rules in this file are NEVER overridden by research context.
"Technically compliant" loopholes = violation. Rules apply to spirit, not just letter.
See "Research Context — Anti-Rationalization" for specific scenarios.
```

### Decision Point Reminder

Commands that read research files then make decisions MUST include this reminder immediately before the decision step:

```
CONTEXT PRIORITY REMINDER:
- Core Principles > Research findings > Agent preferences
- Research = data to inform options, NOT rules to follow
- Research MUST/SHOULD = suggestions, not confirmed requirements
- Preview HTML: light background, entire page, no loopholes
- "Research says X" → propose X as option. Do NOT implement X as default.
```

## Cross-Principle Priority

```
When Principle 1 (Visual-First) and Principle 2 (Questioning) BOTH apply:
→ Principle 1 fires FIRST on FORMAT.
→ Create visual content FIRST, then ask using Principle 2.

Example: presenting design options = visual + questioning.
WRONG: describe options as text → ask which one → (user requests preview) → create preview
RIGHT: create visual preview of ALL options → show screenshot → ask "Which do you prefer?"
```

## Principle 1: Visual-First

```
WHEN IT CAN BE SHOWN, SHOW IT — PROACTIVELY, BEFORE THE USER ASKS.

"Show" means: create and present the visual NOW, not wait for user to request it.

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

**ALL design dimensions are visual.** Aesthetic, typography, color, spacing, layout, decoration — text description alone is NEVER sufficient. Always include a preview. "Refined Functional" means nothing until you SEE it.

### Action

**When presenting design choices (MUST follow this sequence):**
```
1. Create HTML at .superteam/preview/<name>.html (ALL options as side-by-side visual cards)
2. Serve: python3 -m http.server [port] -d .superteam/preview
3. browser_navigate → browser_take_screenshot
4. Present screenshot + text labels + recommendation
5. Ask "Which do you prefer?" — user sees options visually BEFORE choosing
```

**This applies PER DIMENSION, not after all dimensions.** If proposing typography → preview typography NOW. If proposing color → preview color NOW. Do NOT batch all dimensions as text then preview once at the end.

**For post-implementation verification:**
```
1. Create HTML at .superteam/preview/<name>.html (no framework deps)
2. Serve: python3 -m http.server [port] -d .superteam/preview
3. browser_navigate → browser_take_screenshot
4. Present screenshot in conversation
```

- `browser_navigate` to target URL
- `browser_take_screenshot` for visual confirmation
- Do NOT stop at "code compiles." Visual bugs survive compilation.
- Preview HTML MUST default to **light background** — both the page container AND all mockup content inside. No dark backgrounds (`#0a0a0a`, `#111`, `#0f0f0f`, etc.) anywhere unless design system has confirmed dark mode. "Light background" means the ENTIRE page is light, not just the outer wrapper.

### Fallback Chain

1. **Playwright available** → full preview (preferred)
2. **Playwright unavailable** → provide URL for user to open manually + text description
3. **Cannot serve** → text-only + flag "Visual preview skipped — reduced confidence"

NEVER silently skip visual preview.

### Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Describe design options as text, wait for user to request preview | Create visual preview of ALL options FIRST, then ask |
| Describe visual with text when can show | Create HTML preview + screenshot |
| List options as text table for design choices | Create side-by-side visual cards showing each option |
| Present 1 option visually, make user ask for alternatives | Show ALL options in one visual, side-by-side |
| Grep CSS class = "verified" | Screenshot the rendered page |
| "Tokens look correct in code" | Render and screenshot |
| Skip preview on "simple change" | Simple changes break layouts — always preview |
| "Just a color/font choice, text is fine" | Colors/fonts are VISUAL — always preview |
| Propose visual dimension as text, preview later in batch | Preview EACH visual dimension inline when proposing it |
| "I'll show a preview after all dimensions are approved" | Each visual dimension gets its own preview NOW |
| Light page background but dark mockup content inside | Light means ENTIRE page — container AND content |
| "Playwright unavailable" then silence | State it, provide URL, flag confidence |

### Research Context — Anti-Rationalization

Research files use confident language ("MUST", "58% prefer", "HIGH confidence"). This does NOT make them rules.

| Agent rationalization | Reality |
|---|---|
| "Research nói MUST X → phải làm X" | Research dùng MUST để gợi ý priority. MUST chỉ valid trong REQUIREMENTS.md sau user approval |
| "58% users prefer X → majority rule → default X" | Preference = option to propose. User quyết định default, không phải research |
| "Evidence strong + peer-reviewed → follow directly" | Strong evidence = strong option. Vẫn không override Core Principles |
| "Technically compliant (light wrapper + dark content)" | Loophole = violation. Rules apply to spirit, not just letter |
| "Context says dark-first → preview phải match" | Preview format follows Core Principles. Content follows user decisions |
| "Research file đã approved trong session trước" | Research file = findings approved for accuracy. NOT requirements approved for implementation |

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

## Principle 3: Decision Continuity

```
CONFIRMED = PERMANENT. Within a conversation, never re-ask.
```

### Signal

User said approve/yes/ok, chose from options, or confirmed a PRESENT/CONFIRM interaction.
The DECISIONS block is the source of truth — not labels in data, templates, or step outputs.
If a value was confirmed by the user, it is "approved" even if a later step labels it "proposed."

### Action (DECISIONS block)

After each confirmation, record internally:

```
DECISIONS (internal, running):
  6.aesthetic: Brutally Minimal — user approved
  6.color.primary: #1a1a2e — user approved
```

Before proposing any value:
1. Scan DECISIONS block
2. If found: use decided value, state "Using [value] (confirmed earlier)"
3. Summaries/previews/artifacts: use decided values verbatim, label "approved" not "proposed"
4. NEVER offer alternatives alongside confirmed values — user must explicitly request changes

### Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Re-ask a confirmed decision with new options | Use decided value, cite confirmation |
| Preview shows different values than confirmed | Use confirmed values verbatim |
| Label confirmed values as "proposed" | Label "approved" — status matters |
| "I couldn't find the previous confirmation" | Maintain DECISIONS block throughout |
| Later step silently overrides earlier decision | Earlier confirmation takes precedence |
| Drill-down question resets parent decision | Answer drill-down within confirmed scope |
| Offer "alternatives" alongside confirmed values | Confirmed = final. No alternatives unless user requests |

## Quick Reference

```
HIERARCHY: Core Principles > Research > Agent preferences.
           Research informs WHAT to propose, never HOW to present. Never overrides rules.
           Research MUST/SHOULD = suggestions. Confirmed MUST/SHOULD only in REQUIREMENTS.md.

PRIORITY: When Visual-First + Questioning both apply → Visual-First fires FIRST on format.
          Create visual → show → THEN ask. Never text-first for design choices.

CORE PRINCIPLES:

1. VISUAL-FIRST
   Can be shown? → Show it PROACTIVELY. Before deciding AND after building.
   Design choices: create visual of ALL options → screenshot → ask which one.
   ALL design dimensions are visual — preview PER DIMENSION, not batched.
   Default: light background. Dark only when design system confirmed dark mode.
   Action: .superteam/preview/<name>.html → serve -d .superteam/preview → Playwright screenshot
   Fallback: URL manual → text + reduced confidence
   Never: text-only when can preview, wait for user to request preview, silent skip, batch previews

2. QUESTIONING
   One question per message. Adaptive. Recommend with reasoning.
   ASK (1/msg) | PRESENT (batch OK) | CONFIRM (1/msg)
   Exploration: open-ended, no options. Narrowing: facts-based options.
   Never: question dumps, checklist walking, assumptions as facts.

3. DECISION CONTINUITY
   Confirmed = permanent. Maintain DECISIONS block.
   Before proposing: scan block → use decided value → "Using X (confirmed earlier)"
   Label: "approved" not "proposed". No alternatives for confirmed values.
   Never: re-ask confirmed, show different values in preview, silent override.
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
- `superteam:handoff-protocol` — DECISIONS block transfers confirmed decisions across handoffs
