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
