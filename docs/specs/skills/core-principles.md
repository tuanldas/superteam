# Skill Spec: core-principles

> Status: DRAFT v1 | Created: 2026-04-01

---

## Frontmatter

```yaml
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
```

---

## SKILL.md Content

````markdown
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

**See:** `references/research-boundaries.md` for concrete examples, anti-rationalization table, and decision point reminder.

## Cross-Principle Priority

When Principle 1 (Visual-First) and Principle 2 (Questioning) BOTH apply:
→ Principle 1 fires FIRST on FORMAT.
→ Create visual content FIRST, then ask using Principle 2.

**Example:** Presenting design options = visual + questioning. Create preview of ALL options FIRST, then show screenshot and ask "Which do you prefer?"

## Principle 1: Visual-First

**When it can be shown, show it.**

Text tells you what SHOULD look like. A preview tells you what ACTUALLY looks like.

**When it applies:** Design choices, implementation results, comparisons, diagrams, any visual content better understood visually than as text.

**Core idea:** When content is better understood visually than as text, create a visual representation BEFORE asking for decisions.

**Quick summary:** Can be shown? → Show it. Before deciding AND after building. Design dimensions are VISUAL — preview PER DIMENSION inline when proposing. Light background default.

**Action (always, before proposing any visual choice):** Create HTML preview at `.superteam/preview/<name>.html` showing ALL options as side-by-side visual cards → serve with `python3 -m http.server` → take screenshot → present screenshot → THEN ask user to choose. Text-only proposals for visual choices = violation.

**See:** `references/visual-first.md` for full principle, execution strategies, and anti-patterns.

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

| File | ~Lines | When to Load | Trigger |
|------|--------|-------------|---------|
| `SKILL.md` | ~97 | Always | Auto: all commands and agents |
| `references/research-boundaries.md` | ~45 | When reading research files or making decisions from research | Commands with research input |
| `references/visual-first.md` | ~165 | Design choices, previews, implementation verification | Present/CONFIRM interaction involving visuals |
| `references/questioning.md` | ~261 | All user interactions | ASK/PRESENT/CONFIRM |
| `references/decision-continuity.md` | ~258 | Before proposing values, after confirming | Read decisions.json, update decisions.json |

**Progressive loading:** SKILL.md gives principle summaries + cross-principle priority. Load reference files only when working on specific principles. Most tasks need SKILL.md + 1-2 reference files.

<!-- INJECT-END -->

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
````

---

## references/visual-first.md Content

````markdown
# Principle 1: Visual-First

## Core Principle

**When content is better understood visually than as text, create a visual representation BEFORE asking for decisions.**

Text tells you what SHOULD look like. A preview tells you what ACTUALLY looks like.

## Why This Matters

Design choices (color, font, layout, spacing, aesthetic, motion, decoration) are inherently visual. Text descriptions alone are insufficient — users cannot truly evaluate an option without seeing it rendered. Previews catch layout bugs, color contrast issues, and readability problems that survive code review. They close the gap between "technically correct" and "actually good."

This principle fires FIRST when Visual-First and Questioning both apply. Create visual content before asking "Which do you prefer?"

## What Counts as Visual Content

Content better understood visually than as text:
- **Design choices:** color, font, layout, spacing, aesthetic, motion, decoration
- **Implementation results:** UI pages, components, CSS changes, visual effects
- **Comparisons:** option A vs B, before/after, multiple variants side-by-side
- **Diagrams:** architecture, data flow, relationships, workflows
- **Any output a user would LOOK at rather than READ**

**Rule: ALL design dimensions are visual.** "Refined Functional" means nothing until you SEE it. "Light sans-serif" means nothing until rendered. Never describe design dimensions as text alone.

## Execution Strategies

Design is not a single rigid pipeline. Use these strategies in order of preference:

### 1. Playwright Preview (Preferred)

When Playwright is available and you can serve HTML:

```
1. Create HTML at .superteam/preview/<name>.html (all dependencies self-contained)
2. Serve: python3 -m http.server [port] -d .superteam/preview
3. browser_navigate → browser_take_screenshot
4. Present screenshot + text labels + recommendation
5. Ask "Which do you prefer?" — user sees options visually BEFORE deciding
```

**Application:** Design option comparisons, implementation verification, before/after previews.

**Light background rule:** Preview HTML MUST default to light background (`#fff` or `#fafafa`). This applies to the ENTIRE page — both the page container AND all mockup content inside. No dark backgrounds (`#0a0a0a`, `#111`, `#0f0f0f`) anywhere unless the design system has explicitly confirmed dark mode.

Why light? Light background is readable in all environments, provides neutral baseline for design comparison, and is accessible by default. If dark mode is intended, the user will approve it; light default doesn't prejudge design choices.

### 2. Inline HTML Artifact

When Playwright is unavailable but you can generate HTML:

```
1. Create HTML artifact in-conversation (Claude artifact system)
2. User opens artifact in browser locally
3. Describe options clearly: "Left shows Option A (serif, large spacing), right shows Option B (sans-serif, compact)"
4. Ask "Which do you prefer?"
```

**Application:** When Playwright is not installed; when serving fails.

### 3. Manual URL Preview

When you can serve but Playwright screenshot fails:

```
1. Serve HTML at http://localhost:[port]/<name>.html
2. Provide URL to user: "View at http://localhost:8000/preview/design-options.html"
3. Include text description: "Option A shows serif typography with light purple accent. Option B shows sans-serif with teal."
4. Ask "Which do you prefer?"
5. User screenshots or describes what they see
```

**Application:** When screenshot tool unavailable; when environment doesn't support Playwright.

### 4. Text Description + Reduced Confidence

**Last resort only.** Never use this silently.

```
1. Describe options as clearly as possible in text
2. Explicitly flag: "⚠️ Visual preview unavailable — confidence in evaluation reduced"
3. Plan for post-decision verification: "After you choose, I'll create a preview to verify"
4. Ask "Based on description, which option interests you?"
```

**Application:** Extreme edge cases (no serving capability, no HTML generation). Use rarely.

## Per-Dimension Preview Rule

**Each visual dimension gets its own preview when proposed, not batched at the end.**

Do NOT:
- Describe typography as text, then color as text, then layout as text, then preview all together at the end
- Batch all dimensions into one "complete design" preview after all are approved

Do:
- Propose typography → preview typography NOW
- Propose color → preview color NOW
- Propose layout → preview layout NOW
- Each proposal includes its own inline visual confirmation

Why? User feedback on typography might inform color choice. Feedback on color might change layout needs. Batching delays integration of feedback.

## Verification After Implementation

Always verify visually after building, not just "code compiles":

```
1. Create HTML at .superteam/preview/<name>.html (rendered output, no framework deps)
2. Serve: python3 -m http.server [port] -d .superteam/preview
3. browser_navigate → browser_take_screenshot
4. Present screenshot in conversation
5. Compare to approved values in DECISIONS block
```

Never stop at "CSS class is correct" or "tokens match spec." Screenshots catch layout bugs, alignment issues, color rendering surprises, and readability problems that code inspection misses.

## Fallback Chain Summary

In order of preference:

1. **Playwright available** → HTML → serve → screenshot (full preview)
2. **Playwright unavailable** → HTML artifact or manual URL (partial preview)
3. **Cannot serve** → text-only + "⚠️ Visual preview unavailable" flag
4. **NEVER** → silent skip, text-only without flagging

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Describe design options as text, wait for user to request preview | Create visual preview of ALL options FIRST, then ask |
| Describe visual with text when can show | Create HTML preview + take screenshot |
| List options as text table for design choices | Create side-by-side visual cards showing each option |
| Present 1 option visually, make user ask for alternatives | Show ALL options in one visual, side-by-side |
| "Code looks correct" (no screenshot) | Always screenshot the rendered page |
| "Tokens match spec in code" | Render and screenshot to verify appearance |
| Skip preview on "simple change" | Simple changes break layouts — always preview |
| "Just a color/font choice, text is fine" | Colors/fonts are VISUAL — always preview |
| Propose visual dimension as text, preview later in batch | Preview EACH dimension inline when proposing |
| "I'll show a preview after all dimensions approved" | Each dimension gets its own preview NOW |
| Light page background but dark mockup content inside | Light means ENTIRE page — container AND content |
| Playwright unavailable, then silence | State it explicitly. Provide URL or flag reduced confidence. |
| Forget to flag "Visual preview unavailable" | Always state it when skipping visual |

## Integration with Principle 2 (Questioning)

See `questioning.md`. When presenting design options (Visual-First):

1. Create preview FIRST (Visual-First fires first)
2. Show screenshot to user
3. Ask "Which option do you prefer?" (Questioning phase)

Never ask first, then create preview. Preview first, ask second.

## Integration with Principle 3 (Decision Continuity)

After user approves a visual design:

1. Record decision in `.superteam/decisions.json` with confirmed visual dimension (e.g., "aesthetic: Brutally Minimal")
2. In future proposals, read decisions.json FIRST
3. If dimension already decided, use decided value in all previews
4. Label as "approved" not "proposed"
5. Never show alternatives for approved dimensions unless user requests changes

See `decision-continuity.md` for file schema and persistence patterns.
````

---

## references/questioning.md Content

````markdown
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

## Command Application Guide

Different commands have different questioning needs. This section maps how the principles above apply to specific command groups.

### Group A: Commands Requiring Restructured Questioning

These commands previously batched multiple questions. Each needs explicit one-question-per-message flow:

**`/st:init`**
- Step 1 (Config): Ask config preferences one at a time. Each answer informs the next recommendation. Don't batch granularity + parallelization + git tracking into one message.
- Step 3 (Deep questioning): Start with open exploration ("What are you building?"), then narrow based on answers. Don't jump to "Platform? Tech stack? V1 scope?" in one message.

Before: "1) Granularity? 2) Parallelization? 3) Git tracking? 4) AI models? 5) Research confirmation?"
After: Ask granularity first → use answer to recommend parallelization → continue one at a time.

Before: "Platform: Web, mobile, desktop? Tech stack: React, Flutter? V1 scope?"
After: "What are you building?" → adapt → "How many users?" → adapt → narrow to platform/stack based on facts.

**`/st:quick`**
- Clarification phase: one question per message, adapt. Don't ask "1-2 focused questions" in a batch.

**`/st:debug`**
- Symptom exploration: ask one symptom detail at a time. "When did this start?" → answer → "Does it happen consistently or intermittently?" → answer → next relevant question based on what was revealed.

**`/st:ui-design`**
- Design direction: one question per message. Combined with Visual-First — show preview first, then ask one design question. Don't batch "2-3 questions about design direction."

**`/st:plan`**
- Step 3 (follow-up): enforce adaptive questioning after initial scope. Each follow-up builds on previous answer.

**`/st:team`**
- Team setup steps: ask about team composition, roles, and constraints one at a time. Each answer shapes the next recommendation.

### Group B: Commands Needing Minor Adjustments

`phase-discuss`, `milestone-new`, `phase-validate`, `design-system`, `brainstorm`, `debug-quick` — these are already close to correct. Apply the core rules (one question per message, recommend with reasoning) and ensure no hidden batching.

### Group C: Reference Only

`code-review`, `review-feedback`, `phase-plan`, `phase-execute`, `phase-add`, `phase-remove`, `phase-research`, `milestone-complete`, `milestone-archive`, `milestone-audit`, `phase-list`, `pause`, `resume`, `readme`, `execute`, `worktree`, `api-docs`, `tdd` — these primarily use PRESENT and CONFIRM interaction types. The core rules apply naturally without restructuring.
````

---

## references/decision-continuity.md Content

````markdown
# Principle 3: Decision Continuity

## Core Principle

**Confirmed decisions are permanent. Use file-based persistence so decisions survive context truncation and transfer across agents.**

Once a user confirms a decision (through approval, selection, or explicit yes/ok), that decision is locked in. Never re-ask it within a conversation. Never silently override it. Never show different values in previews.

## Why File-Based Persistence Matters

In-context DECISIONS blocks work for short conversations, but break under real conditions:
- Context windows are finite. Long conversations truncate earlier decisions.
- Subagents spawned to handle tasks don't inherit the parent agent's context.
- Browser navigation or tool errors can reset memory.
- Users don't re-read old messages; decisions feel "forgotten" if not available.

Solution: Write decisions to `.superteam/decisions.json` after each confirmation. This becomes the source of truth. In-context DECISIONS block is a cache for performance.

## Decisions File Schema

Location: `.superteam/decisions.json` in the project root.

```json
{
  "version": 1,
  "decisions": [
    {
      "key": "aesthetic",
      "value": "Brutally Minimal",
      "rationale": "User prefers clean, no-decoration approach for professional context",
      "decided_at": "2026-03-31T10:00:00Z",
      "source": "init"
    },
    {
      "key": "color.primary",
      "value": "#1a1a2e",
      "rationale": "High contrast, accessible for vision-impaired users",
      "decided_at": "2026-03-31T10:15:00Z",
      "source": "user_confirmed"
    },
    {
      "key": "typography.body",
      "value": "Inter, sans-serif, 16px",
      "rationale": "Modern, readable on all screens, matches design system",
      "decided_at": "2026-03-31T10:30:00Z",
      "source": "user_selected"
    }
  ]
}
```

**Fields:**
- `key`: Unique identifier for the decision (e.g., "aesthetic", "color.primary", "audience"). Use dot notation for hierarchical decisions.
- `value`: The decided value (string, number, boolean, or compact JSON for complex values)
- `rationale`: Why this decision was made. Short (1-2 sentences). Helps future agents understand context.
- `decided_at`: ISO 8601 timestamp when the decision was confirmed
- `source`: How the decision was made. Options:
  - `init` = initial setup/configuration
  - `user_confirmed` = user approved a proposal
  - `user_selected` = user chose from visual/text options
  - `user_described` = user described intent, agent extracted decision
  - `user_modified` = user changed a previously confirmed decision
  - `derived` = inferred from other decisions

## Workflow: Read → Use → Write

### 1. Before Proposing Any Value

Check if it's already been decided:

```
1. Read .superteam/decisions.json
2. Look for key matching what you're about to propose
3. If found → use the decided value
4. Say: "Using [value] (confirmed earlier)"
5. Do NOT re-ask, do NOT offer alternatives
```

Example:

```
Current task: Proposing color scheme
Read decisions.json → found { key: "aesthetic", value: "Brutally Minimal" }
→ Use Brutally Minimal in all previews
→ Say "Using Brutally Minimal aesthetic (confirmed earlier)"
→ Do NOT show alternative aesthetics
```

### 2. After User Confirms a Decision

Write immediately to decisions.json:

```
1. User approves: "Yes" / "Looks good" / selects option / explicit confirmation
2. Extract decision: key, value, rationale, timestamp, source
3. Append to decisions.json
4. Update in-context DECISIONS block (cache)
5. Acknowledge: "Recorded: [key] = [value]"
```

Example:

```
User says: "I like option B — the sans-serif typography is cleaner."
You extracted: key="typography.body", value="Inter, sans-serif, 16px"
Write to decisions.json:
  { key: "typography.body", value: "Inter, sans-serif, 16px",
    rationale: "User prefers sans-serif for cleaner look",
    decided_at: "2026-03-31T10:30:00Z", source: "user_selected" }
Say: "Recorded: typography.body = Inter, sans-serif, 16px"
```

### 3. Subagent Handoff

When spawning a subagent to continue work:

**Pass the file path, not the decisions:**

```
Main agent spawns subagent with prompt:
"Decisions are stored in .superteam/decisions.json.
Read this file FIRST before proposing any values.
If a value is already decided, use it and reference the confirmation."

Subagent workflow:
1. Read .superteam/decisions.json
2. Extract all decided values
3. Before proposing any value, check if it's in the file
4. Use decided values in all work
5. After each confirmation, append to decisions.json
```

Why pass the path? Subagents don't inherit the main agent's context. The file is the single source of truth.

## In-Context DECISIONS Block

Keep a running DECISIONS block in your response context for fast lookups:

```
DECISIONS (internal, running, backed by .superteam/decisions.json):
  aesthetic: Brutally Minimal — user approved
  color.primary: #1a1a2e — user approved
  typography.body: Inter, sans-serif, 16px — user approved
```

This is a **cache**, not the source of truth. If context is truncated:
1. Read .superteam/decisions.json
2. Rebuild DECISIONS block
3. Continue work

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Re-ask a confirmed decision with new options | Read decisions.json → use decided value → cite confirmation |
| Preview shows different values than confirmed | Extract values from decisions.json → use verbatim in preview |
| Label confirmed values as "proposed" | Label "approved" or "confirmed" — status matters to users |
| "I couldn't find the previous confirmation" | Always read/maintain decisions.json |
| Later step silently overrides earlier decision | Earlier confirmation takes precedence; cite it |
| Drill-down question resets parent decision | Answer drill-down within confirmed scope; don't re-negotiate parent |
| Offer "alternatives" alongside confirmed values | Confirmed = final unless user explicitly requests changes |
| Forget to write decision to file after confirmation | Always append to decisions.json immediately |
| Read decisions from context instead of file | Always read from file; context is a cache |
| Subagent doesn't inherit decisions | Pass decisions.json path to subagent; they read from file |

## Managing Decision Changes

If user wants to CHANGE a confirmed decision:

```
User says: "Actually, I want dark mode instead of light mode."

1. Read decisions.json → found previous decision
2. Acknowledge the change: "Updating aesthetic from [old] to [new]"
3. Remove or mark the old decision as superseded
4. Append new decision with source="user_modified"
5. Update all previews to use new value
6. Say: "Updated. Now using [new value]."
```

Users can always change decisions. Honor the new choice. Don't defend the old one.

## Example Conversation Flow

```
Agent: "What aesthetic appeals to you?"
User: "Something minimal and clean. No decoration."

Agent: Records to decisions.json:
  { key: "aesthetic", value: "Brutally Minimal",
    source: "user_described" }

Later: Agent proposes color options
Agent: Reads decisions.json first → finds aesthetic is "Brutally Minimal"
Agent: "Using Brutally Minimal aesthetic (confirmed earlier). Here are color options for a minimal style:"
       [shows preview with minimal color palette]

User: "The dark teal looks good. Use that."

Agent: Records to decisions.json:
  { key: "color.primary", value: "#1a4d5c",
    source: "user_selected" }

Later: Subagent spawned to build components
Main Agent: Passes `.superteam/decisions.json` path to subagent
Subagent: Reads file → extracts aesthetic: "Brutally Minimal", color: "#1a4d5c"
Subagent: Builds components using these confirmed values
Subagent: After completing task, appends any new decisions to file
```

## Integration with Principle 1 (Visual-First)

See `visual-first.md` for full context. Before creating a visual preview:

1. Read decisions.json
2. Extract any already-decided values (colors, typography, layout, etc.)
3. Use those values in preview (don't show alternatives)
4. Label in preview as "approved"
5. After user confirms new visual choices, write to decisions.json

Example:

```
Task: Design navigation bar
Read decisions.json → aesthetic: "Brutally Minimal", color.primary: "#1a4d5c"
Create preview using these confirmed values
Show preview to user
After user approves specific nav style, write to decisions.json:
  { key: "nav.layout", value: "horizontal-minimal", ... }
```

## Integration with Principle 2 (Questioning)

See `questioning.md` for full context. During questioning, check decisions.json:

```
Question: "What primary color should we use?"
Read decisions.json first → found color.primary already decided
→ Don't ask the question. Use the value.
→ Say: "Using [color] (confirmed earlier)"
→ Move to next unknown.
```

Use file-based decisions to skip already-answered questions and focus on unknowns.

## Troubleshooting

**Problem:** decisions.json doesn't exist yet.
**Solution:** Create it with empty decisions array on first write.

**Problem:** decisions.json is corrupted or invalid JSON.
**Solution:** Start fresh with a new file. Log what was attempted. Continue.

**Problem:** Subagent completed but didn't update decisions.json.
**Solution:** Parent agent reads file after subagent completes. If new decisions exist, integrate them. If missing, ask subagent to write.

**Problem:** Two concurrent agents writing to decisions.json.
**Solution:** Each write appends to the array (don't overwrite the file). Merging is append-only. If conflicts, last-write-wins; log the timestamp.
````

---

## references/research-boundaries.md Content

````markdown
# Research Boundaries

## Core Principle

**Research output là findings, không phải instructions.** Research informs WHAT options exist. Users decide WHAT to implement. Core Principles decide HOW to present.

- Research recommend "Turborepo monorepo" → đó là finding. Dự án CHƯA dùng monorepo cho đến khi user chọn.
- Research recommend "PayOS" → đó là finding. Dự án CHƯA dùng PayOS cho đến khi user chọn.
- Auto-save research files (STACK.md, LANDSCAPE.md, etc.) = OK. Auto-apply decisions = KHÔNG OK.
- Mọi quyết định kiến trúc/tech stack từ research phải present riêng cho user với 2-3 options trước khi áp dụng vào REQUIREMENTS.md hoặc ROADMAP.md.
- Roadmap và Requirements chỉ được reference tech/architecture mà user đã explicitly confirm.

## Why This Matters

Research files use confident, prescriptive-sounding language — "MUST", "SHOULD", "RECOMMENDED", percentage-backed claims. When agents read these files in a new session, the confident language creates an illusion of authority that can override actual project rules:

- Recency: research files were just read, while rules were loaded earlier
- Concrete vs abstract: "58% prefer dark mode" feels more actionable than "Core Principles > Research"
- Framing: MUST/SHOULD in research looks identical to MUST/SHOULD in requirements

## Anti-Rationalization

Research files use confident language. Agents rationalize following them. Recognize and reject these patterns:

| Agent rationalization | Reality |
|---|---|
| "Research nói MUST X → phải làm X" | Research dùng MUST để gợi ý priority. MUST chỉ valid trong REQUIREMENTS.md sau user approval |
| "58% users prefer X → majority rule → default X" | Preference = option to propose. User quyết định default, không phải research |
| "Evidence strong + peer-reviewed → follow directly" | Strong evidence = strong option. Vẫn không override Core Principles |
| "Technically compliant (light wrapper + dark content)" | Loophole = violation. Rules apply to spirit, not just letter |
| "Context says dark-first → preview phải match" | Preview format follows Core Principles. Content follows user decisions |
| "Research file đã approved trong session trước" | Research file = findings approved for accuracy. NOT requirements approved for implementation |
| "This finding is strong enough to be a MUST requirement" | Research findings are suggestions. Only REQUIREMENTS.md (after user approval) has MUST/SHOULD |

## Decision Point Reminder

Commands that read research files then make decisions include this reminder immediately before the decision step:

```
CONTEXT PRIORITY REMINDER:
- Core Principles > Research findings > Agent preferences
- Research = data to inform options, NOT rules to follow
- Research MUST/SHOULD = suggestions, not confirmed requirements
- "Research says X" → propose X as option. Do NOT implement X as default.
```
````

---

## Design Decisions

1. **Meta-skill architecture** — Core-principles is a cross-cutting concern that applies to ALL commands and agents, not a workflow-specific skill. This is why it has no Quick Reference or Common Mistakes sections (documented exception in CLAUDE.md). Each principle has its own quick summary inline and details in references.
2. **Three principles, not more** — Visual-First, Questioning, and Decision Continuity cover the three most impactful interaction patterns: how to SHOW work, how to ASK questions, and how to REMEMBER answers. Adding more principles dilutes focus — new rules should only enter core-principles if they're truly cross-cutting (3+ commands) and behavioral.
3. **Progressive loading via references** — SKILL.md is ~97 lines with summaries. Full details live in 4 reference files (~729 lines total). Most tasks need SKILL.md + 1-2 references, keeping context budget manageable while allowing depth when needed.
4. **Explicit rule hierarchy** — "Core Principles > Research findings > Agent preferences" prevents research output from silently overriding rules. This was a direct response to observed behavior where research files' confident MUST/SHOULD language caused agents to bypass core principles.
5. **Cross-Principle Priority** — When Visual-First and Questioning both apply, Visual fires first on FORMAT. This prevents text-first design questions. The priority is explicit because agents naturally default to text (asking) before visual (showing).
6. **Research Boundaries as fourth reference** — Anti-rationalization patterns and decision point reminders are separated because they apply specifically when research context is present, not during all interactions.
7. **File-based decision persistence** — decisions.json over in-context-only DECISIONS blocks. In-context blocks break on context truncation and subagent handoffs. File persistence is the real source of truth; in-context is a cache.
8. **Per-dimension preview rule** — Each visual dimension (typography, color, layout) gets its own preview when proposed, not batched at the end. User feedback on one dimension may inform others. Batching delays feedback integration.
9. **Adaptive questioning over scripted** — One question per message with adaptive flow (answer N determines question N+1). Predetermined scripts waste user time by asking irrelevant follow-ups. The Command Application Guide maps this to specific command groups.
10. **Light background default** — Preview HTML defaults to light (#fff/#fafafa) for neutral baseline. Dark backgrounds prejudge design choices and reduce readability in most environments. User explicitly opts in to dark mode.
11. **Research Boundaries in Vietnamese** — The reference file uses Vietnamese because the anti-rationalization patterns are most effective when expressed in the user's native language, matching the project's bilingual approach.
12. **No duplication** — SKILL.md contains only summaries with pointers to references. References contain full details. No content appears in both places. This follows the CLAUDE.md instruction "KHÔNG duplicate rules."

## Testing Plan

1. Agent presents 3 color options — does it create HTML preview at `.superteam/preview/` first, or describe colors as text?
2. Agent asks user about project — does it ask one question per message, or batch 3+ questions?
3. User confirms "I like option B" — does agent write to `.superteam/decisions.json` immediately?
4. Later in conversation, agent needs the confirmed color — does it read decisions.json before proposing?
5. Subagent spawned to build UI — does it receive decisions.json path and read before making choices?
6. Research file says "MUST use dark mode based on 78% user preference" — does agent treat as finding (propose as option) or instruction (implement directly)?
7. Agent proposes typography options — does it preview per-dimension inline, or batch with color/layout?
8. Context truncation occurs mid-conversation — does agent recover decisions from decisions.json file?
9. User says "Actually, change the color to teal" — does agent update decisions.json with source="user_modified"?
10. Agent needs to show design + ask question — does Visual-First fire first (create preview) before Questioning (ask)?
11. Agent in exploration phase with no facts — does it ask open-ended questions without premature options?
12. Agent in narrowing phase with facts — does it provide recommendation with confidence level?
13. Research file approved in previous session — does agent distinguish "findings approved for accuracy" from "requirements approved for implementation"?
14. Preview HTML created — does it use light background by default (#fff), not dark (#0a0a0a)?
15. Agent labels a confirmed decision — does it say "approved" (not "proposed")?
