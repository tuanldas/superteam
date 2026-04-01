---
name: frontend-design
description: >
  Use when making design judgments for UI/UX work — auditing, specifying, reviewing,
  or building frontend interfaces. Covers accessibility, touch targets, typography,
  color, layout, spacing, animation, forms, navigation, design tokens, and AI slop
  detection. Reference for agents needing concrete design rules with specific values.
  Keywords: WCAG, contrast ratio, touch target, font pairing, color palette,
  responsive breakpoints, design tokens, CSS variables, animation timing,
  spacing scale, AI slop, anti-patterns.
---

# Frontend Design Knowledge

Design rules reference for Superteam agents. Priority-ordered, concrete values, scannable tables.

**Skill type:** Reference (design knowledge + rules)
**Audience:** Agents/commands needing design judgment (`ui-auditor`, `ux-designer`, `ui-researcher`, `/st:ui-design`, `/st:design-system`)
**Pairs with:** `superteam:core-principles` (visual-first, questioning, decision continuity)

## Priority System

Lower number = higher priority. When rules conflict, higher priority wins.

| Priority | Category | Why This Rank |
|----------|----------|---------------|
| P1 | Accessibility | Legal, ethical, blocks users entirely |
| P2 | Touch & Interaction | Broken interactions = unusable |
| P3 | Performance | Slow = abandoned |
| P4 | Typography | Readability = core function |
| P5 | Color & Theme | Brand, mood, accessibility overlap |
| P6 | Layout & Responsive | Content must reach all devices |
| P7 | Spacing | Visual rhythm, scanability |
| P8 | Animation & Motion | Delight, but never at cost of P1-P7 |
| P9 | Forms & Feedback | User communication |
| P10 | Navigation | Wayfinding |

---

## Principle Summaries

Each principle has 2-3 key rules here. Full details with tables, examples, and code in reference files.

### P1: Accessibility (CRITICAL) — `references/core-constraints.md`

WCAG 2.1 AA minimum. Text contrast >=4.5:1 (normal) / >=3:1 (large). Focus indicators visible, 2px+, 3:1 contrast. Semantic HTML over ARIA divs. Color never sole indicator.

**Dark mode parity:** Both modes need independent contrast verification — never mechanical inversion.

### P2: Touch & Interaction — `references/core-constraints.md`

Touch targets: 44x44px minimum (mobile), 8px+ spacing between targets. Every interactive element needs all states (default/hover/focus/active/disabled/loading). Interaction feedback within 80-150ms.

### P3: Performance — `references/core-constraints.md`

Only animate `transform` and `opacity` (GPU-composited). Core Web Vitals: LCP <=2.5s, INP <=200ms, CLS <=0.1. Fonts: `font-display: swap`, woff2, limit 2-3 files. Images: lazy load, explicit dimensions, WebP/AVIF.

### P4: Typography — `references/visual-design.md`

Base 16px. Body line-height 1.5-1.6. Prose max-width 65-75ch. Max 2 font families + 1 code font. Avoid blacklisted fonts (Comic Sans, Papyrus, etc.) and flag overused ones (Inter, Roboto, Poppins).

### P5: Color & Theme — `references/visual-design.md`

Semantic palette: primary/secondary/neutral + success/warning/error/info. 9 shades per color (50-950). Dark mode designed independently, not inverted. All combinations must pass contrast ratios (P1).

### P6: Layout & Responsive — `references/visual-design.md`

Mobile-first. Breakpoints: 320/768/1024/1440px. Verify at all four. No horizontal scrolling. Container widths: prose 768px, dashboard 1440px, marketing 1280px.

### P7: Spacing — `references/visual-design.md`

4px base unit, 4/8dp rhythm. Scale: 4/8/12/16/20/24/32/40/48/64/80/96px. No arbitrary values. Related items closer, unrelated further. Scale spacing with breakpoint.

### P8: Animation & Motion — `references/interaction-patterns.md`

Duration 150-300ms for transitions, 80-150ms for micro-interactions. Only `transform`/`opacity`. `prefers-reduced-motion` is non-negotiable. One hero animation per page max.

### P9: Forms & Feedback — `references/interaction-patterns.md`

Validate on blur, re-validate on change. Errors: specific text + icon below field (never color-only). Empty states need illustration + CTA. Success toast auto-dismiss 5s, error toast persistent.

### P10: Navigation — `references/interaction-patterns.md`

Pattern matches app type (sidebar for SaaS, top nav for marketing). Mobile bottom tab bar max 5 items. No hover-dependent nav on mobile. Breadcrumbs for 3+ level hierarchies.

---

## Design Token Architecture

### Three-Layer System

```
Layer 1: Primitive     → Raw values (never use directly in components)
Layer 2: Semantic      → Meaning-based aliases (use these in components)
Layer 3: Component     → Component-specific tokens (optional, for complex systems)
```

### CSS Variable Naming

```css
/* Layer 1: Primitives — never use directly in components */
--color-blue-500: #3B82F6;  --space-4: 16px;  --radius-md: 8px;

/* Layer 2: Semantic — use these in components */
--color-primary: var(--color-blue-500);
--color-text-primary: var(--color-gray-900);
--color-bg-surface: var(--color-white);
--spacing-section: var(--space-8);

/* Layer 3: Component — optional, for complex systems */
--button-bg: var(--color-primary);
--button-radius: var(--radius-card);
--card-padding: var(--spacing-section);
```

### Token Naming: `--{category}-{semantic}-{variant}`

Color: `--color-primary`, `--color-text-secondary` | Spacing: `--space-4` (16px) | Radius: `--radius-sm` (4px) | Shadow: `--shadow-lg` | Z-index: `--z-modal: 100` | Duration: `--duration-fast: 150ms`

### Master + Override Pattern

For multi-theme/white-label: master tokens in `:root`, brand overrides in `.theme-*` class. Overrides swap primitives (Layer 1), not semantics (Layer 2). This keeps the system predictable.

```css
:root { --color-primary: var(--color-blue-500); --radius-card: 8px; }
.theme-brand-a { --color-primary: var(--color-indigo-600); --radius-card: 12px; }
```

---

## AI Slop Anti-Patterns

Patterns that signal zero creative direction. Flag all, fix each.

| # | Pattern | Severity | Fix |
|---|---------|----------|-----|
| 1 | Purple/violet gradient as default accent | HIGH | Choose context-appropriate palette |
| 2 | 3-column feature grid with icon circles | HIGH | Vary columns (2, 4, asymmetric), use illustrations or screenshots |
| 3 | Centered everything, uniform spacing | HIGH | Vary alignment, create visual flow with asymmetry |
| 4 | Uniform bubbly `border-radius` on all elements | MEDIUM | Vary radius by element type (buttons: 6px, cards: 12px, pills: 9999px) |
| 5 | Generic hero copy ("Welcome to X", "Unlock the power of") | HIGH | Specific value prop in 10 words or fewer |
| 6 | Decorative blobs, floating circles, wavy SVG dividers | MEDIUM | Remove or replace with purposeful graphics |
| 7 | Cookie-cutter section rhythm (same padding, same width) | MEDIUM | Vary section height, padding, width, background |
| 8 | Overused fonts (Inter, Roboto, Poppins everywhere) | LOW | Choose distinctive fonts from recommended list (P4) |
| 9 | Card-grid-with-hover-shadow as only interaction | MEDIUM | Vary interactions: reveal content, animate, link styles |
| 10 | Gradient text on everything | MEDIUM | Reserve for 1 hero element max, or skip entirely |
| 11 | Stock-photo hero with text overlay | HIGH | Custom illustration, product screenshot, or bold typography |
| 12 | Identical spacing between ALL sections | MEDIUM | Tighter within related groups, spacious between major sections |
| 13 | Every button is rounded-full with gradient | MEDIUM | Match button style to aesthetic direction |
| 14 | Dark mode = just invert colors | HIGH | Design dark mode independently, re-check all contrast ratios |

**Detection principle:** "Would a designer at a respected studio ship this without changes? If no creative direction was applied, flag it."

---

## Quick Reference: Pre-Delivery Checklist

| # | Check | Pass Criteria | Ref |
|---|-------|--------------|-----|
| 1 | Text contrast | >=4.5:1 normal, >=3:1 large | P1 |
| 2 | Touch targets | >=44x44px mobile, 8px+ spacing | P2 |
| 3 | Focus indicators | Visible, >=3:1 contrast, 2px+ | P1 |
| 4 | Semantic HTML | No `<div>` for interactive elements | P1 |
| 5 | Keyboard navigation | All interactive elements reachable | P1 |
| 6 | Interaction feedback | Response within 80-150ms | P2 |
| 7 | Animation properties | Only `transform`/`opacity` animated | P3 |
| 8 | Font loading | `font-display: swap`, woff2, preload | P3 |
| 9 | Type scale | Consistent scale, body 16px+, line-height >=1.5 | P4 |
| 10 | Font count | <=2 families + 1 code font | P4 |
| 11 | Color system | Semantic tokens, not hardcoded hex | P5 |
| 12 | Dark mode contrast | Independently verified, not inverted | P5 |
| 13 | Responsive | Tested at 320/768/1024/1440px, no horizontal scroll | P6 |
| 14 | Prose max-width | 65-75ch for readability | P6 |
| 15 | Spacing scale | 4px base, no arbitrary values | P7 |
| 16 | Reduced motion | `prefers-reduced-motion` respected | P8 |
| 17 | Empty states | Not blank — illustration + CTA | P9 |
| 18 | Error messages | Specific, actionable, accessible (not color-only) | P9 |
| 19 | AI slop check | No patterns from anti-pattern list | -- |
| 20 | Light/dark parity | Both modes visually tested, contrast verified | P1+P5 |

---

## Context Budget

| File | Lines | When to Load | Trigger |
|------|-------|-------------|---------|
| `SKILL.md` | ~200 | Always when making design judgments | Auto: UI agents/commands |
| `references/core-constraints.md` | ~160 | Accessibility audit, touch targets, performance review | P1/P2/P3 questions |
| `references/visual-design.md` | ~200 | Typography, color, layout, spacing decisions | P4/P5/P6/P7 questions |
| `references/interaction-patterns.md` | ~170 | Animation, forms, navigation design | P8/P9/P10 questions |

**Progressive loading:** SKILL.md gives summaries + decision criteria. Load reference files only when working on specific principles. Most tasks need SKILL.md + 1 reference file.

## Integration

**Pairs with:**
- `superteam:core-principles` — visual-first verification, questioning, decision continuity
