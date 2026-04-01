# Skill Spec: frontend-design

> Status: DRAFT v1 | Created: 2026-04-01

---

## Frontmatter

```yaml
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
```

---

## SKILL.md Content

````markdown
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
````

---

## references/core-constraints.md Content

````markdown
# Core Constraints (P1-P3)

> **When to load:** Accessibility audits, touch target reviews, performance optimization, WCAG compliance checks, keyboard navigation testing, semantic HTML reviews.

---

## P1: Accessibility (CRITICAL)

**Standard:** WCAG 2.1 AA minimum. Violations here block launch.

### Contrast Ratios

| Element | Minimum Ratio | Example Pass | Example Fail |
|---------|--------------|--------------|--------------|
| Normal text (<18px / <14px bold) | 4.5:1 | #374151 on #FFFFFF (10.6:1) | #9CA3AF on #FFFFFF (2.9:1) |
| Large text (>=18px / >=14px bold) | 3:1 | #6B7280 on #FFFFFF (5.0:1) | #D1D5DB on #FFFFFF (1.8:1) |
| UI components & graphics | 3:1 | Border #6B7280 on #FFFFFF | Border #E5E7EB on #FFFFFF |
| Focus indicators | 3:1 | 2px solid #2563EB | 1px dotted #D1D5DB |

**Calculating contrast:** Use relative luminance formula or tool. `#6B7280` on `#FFFFFF` = ~5.0:1 (passes for large text, fails for small text at some sizes).

**Dark mode parity:** Don't assume light-mode-passing colors work in dark mode. `primary-600` on white may pass but `primary-600` on gray-900 may fail. Verify both modes independently.

### Semantic HTML

| Instead of | Use | Why |
|-----------|-----|-----|
| `<div onclick>` | `<button>` | Keyboard + screen reader support built-in |
| `<div class="nav">` | `<nav>` | Landmark navigation |
| `<div class="header">` | `<header>` | Document structure |
| `<span class="link">` | `<a href>` | Focusable, right-click, cmd+click |
| `<div role="list">` | `<ul>` / `<ol>` | Native list semantics |
| `<div class="main">` | `<main>` | Skip-nav target, landmark |

### Keyboard Navigation

| Key | Expected Behavior |
|-----|-------------------|
| Tab | Move to next focusable element (logical order) |
| Shift+Tab | Move to previous focusable element |
| Enter/Space | Activate buttons, links, checkboxes |
| Escape | Close modals, dropdowns, popovers |
| Arrow keys | Navigate within components (tabs, menus, radio groups) |

**Focus indicator:** Visible, 2px+ outline, 3:1 contrast against adjacent colors. Never `outline: none` without replacement.

### ARIA Rules

- **First rule:** Don't use ARIA if native HTML works. `<button>` > `<div role="button">`.
- Label all interactive elements: `aria-label`, `aria-labelledby`, or visible `<label>`.
- Live regions (`aria-live="polite"`) for dynamic content updates (toast, status, errors).
- `aria-expanded` on disclosure triggers (accordion, dropdown).
- `aria-current="page"` on active nav item.

### Color Independence

Never use color as the sole indicator. Combine with: icons, text labels, patterns, underlines.

| Bad | Good |
|-----|------|
| Red text for errors | Red text + error icon + "Error:" prefix |
| Green/red status dots | Colored dots + "Active"/"Inactive" label |
| Color-coded charts only | Color + pattern fill + labels |

---

## P2: Touch & Interaction

### Touch Targets

| Context | Minimum Size | Recommended | Spacing |
|---------|-------------|-------------|---------|
| Mobile primary actions | 44x44px (WCAG 2.5.8) | 48x48px (Material 3) | 8px+ gap |
| Mobile secondary actions | 44x44px | 44x44px | 8px+ gap |
| Desktop buttons | 32x32px | 36x36px | 4px+ gap |

**Common violation:** Icon buttons with 24x24px clickable area. Fix: pad to 44px minimum with `padding` or `min-width`/`min-height`.

**Severity: HIGH** -- Undersized targets cause misclicks, frustration, and accessibility failures. One of the most common mobile usability issues.

### Hover & Focus States

Every interactive element needs ALL states:

| State | Visual Treatment | Response Time |
|-------|-----------------|---------------|
| Default | Base appearance | -- |
| Hover | Subtle change: darken 10%, lighten bg, underline | Immediate |
| Focus | Visible outline (2px+, 3:1 contrast) | Immediate |
| Active/Pressed | Slight scale(0.98) or darken 15% | Within 80ms |
| Disabled | opacity: 0.5 + `cursor: not-allowed` + `pointer-events: none` | -- |
| Loading | Spinner or skeleton replacing content | Feedback within 150ms |

**Interaction feedback rule:** Users must see a response within 80-150ms of their action. Delays beyond 150ms feel sluggish; beyond 300ms feel broken.

---

## P3: Performance

### Animation Performance

| Property | GPU Composited | Use For |
|----------|---------------|---------|
| `transform` | Yes | Movement, scale, rotation |
| `opacity` | Yes | Fade in/out |
| `filter` | Yes (mostly) | Blur, brightness |
| `width`, `height` | NO -- triggers layout | Avoid animating |
| `top`, `left` | NO -- triggers layout | Use `transform: translate()` |
| `margin`, `padding` | NO -- triggers layout | Avoid animating |
| `background-color` | NO -- triggers paint | Use `opacity` on overlay |

**Rule:** Only animate `transform` and `opacity` in production. Everything else causes jank.

### Font Loading

```css
@font-face {
  font-family: 'CustomFont';
  font-display: swap;       /* Show fallback immediately, swap when loaded */
  src: url('font.woff2') format('woff2');  /* woff2 first -- smallest */
}
```

- Preload critical fonts: `<link rel="preload" href="font.woff2" as="font" crossorigin>`
- Limit to 2-3 font files total. Each adds ~50-150KB.
- Use `font-display: swap` (body) or `font-display: optional` (display, if FOUT is unacceptable).

### Image Optimization

| Format | Use For | Fallback |
|--------|---------|----------|
| WebP | Photos, complex images | JPEG |
| AVIF | Photos (better compression) | WebP > JPEG |
| SVG | Icons, logos, illustrations | PNG |
| PNG | Screenshots, text-heavy images | -- |

- Lazy load below-fold: `loading="lazy"`
- Set explicit `width` and `height` to prevent layout shift (CLS).
- Use `srcset` for responsive images.

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | <=2.5s | <=4.0s | >4.0s |
| INP (Interaction to Next Paint) | <=200ms | <=500ms | >500ms |
| CLS (Cumulative Layout Shift) | <=0.1 | <=0.25 | >0.25 |

**Performance budget:** If adding a feature degrades any Core Web Vital from "Good" to "Needs Improvement", the feature needs optimization before shipping.
````

---

## references/visual-design.md Content

````markdown
# Visual Design (P4-P7)

> **When to load:** Typography decisions, color palette creation, layout/responsive work, spacing adjustments, design token setup, font pairing, theme configuration.

---

## P4: Typography

### Type Scale (base 16px)

| Role | Size | Weight | Line-height | Use |
|------|------|--------|-------------|-----|
| Display | 48-72px | 700-900 | 1.1-1.2 | Hero headings |
| H1 | 36-48px | 700 | 1.2 | Page titles |
| H2 | 28-36px | 600-700 | 1.2-1.3 | Section headings |
| H3 | 22-28px | 600 | 1.3 | Sub-sections |
| H4 | 18-22px | 600 | 1.4 | Card titles |
| Body | 16-18px | 400 | 1.5-1.6 | Paragraphs |
| Body small | 14px | 400 | 1.5 | Secondary text |
| Caption | 12px | 400-500 | 1.4 | Labels, metadata |
| Overline | 11-12px | 600 | 1.4 | Category labels (uppercase, letter-spacing: 0.05em) |

### Readability Rules

| Rule | Value | Why |
|------|-------|-----|
| Body line-height | 1.5-1.6 | Below 1.4 is cramped, above 1.8 loses cohesion |
| Paragraph max-width | 65-75ch | Longer lines cause eye strain |
| Letter-spacing body | 0 to 0.01em | Tighter for large text, looser for small/caps |
| Letter-spacing headings | -0.02em to 0 | Tight tracking for large display type |
| Letter-spacing uppercase | 0.05-0.1em | Uppercase NEEDS spacing for readability |
| Minimum body size | 16px | Below 16px causes mobile readability issues |

### Font Pairing Principles

| Pattern | Example | Effect |
|---------|---------|--------|
| Serif display + Sans body | Instrument Serif + DM Sans | Classic editorial feel |
| Geometric display + Humanist body | Cabinet Grotesk + Source Sans 3 | Modern but warm |
| Mono display + Sans body | JetBrains Mono + Geist | Technical, developer-focused |
| Same family, different weights | Satoshi 900 + Satoshi 400 | Cohesive, safe |

**Rule:** Maximum 2 font families + 1 code font. More = visual noise.

### Font Classification

**Blacklist (banned -- never use):**
Papyrus, Comic Sans, Lobster, Impact, Jokerman, Bleeding Cowboys, Permanent Marker, Bradley Hand, Brush Script, Hobo, Trajan, Raleway, Clash Display, Courier New (for body)

**Overused (warn -- flag if used, allow if user insists):**
Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins

**Recommended by purpose:**

| Purpose | Fonts | Notes |
|---------|-------|-------|
| Display | Satoshi, General Sans, Instrument Serif, Fraunces, Clash Grotesk, Cabinet Grotesk | Distinctive, characterful |
| Body | Instrument Sans, DM Sans, Source Sans 3, Geist, Plus Jakarta Sans, Outfit | Readable, professional |
| Data/Tables | Geist (tabular-nums), DM Sans (tabular-nums), JetBrains Mono, IBM Plex Mono | Monospace digits align |
| Code | JetBrains Mono, Fira Code, Berkeley Mono, Geist Mono | Ligatures, clear glyphs |

---

## P5: Color & Theme

### Palette Construction

| Token | Role | Count |
|-------|------|-------|
| Primary | Brand, CTAs, links | 1 color, 9 shades (50-950) |
| Secondary | Supporting actions | 1 color, 9 shades |
| Neutral | Text, borders, backgrounds | Gray scale, 9+ shades |
| Success | Confirmations, positive states | Green family |
| Warning | Caution, non-critical alerts | Amber/yellow family |
| Error | Errors, destructive actions | Red family |
| Info | Informational, neutral alerts | Blue family |

### Shade Generation

Generate 9 shades per color: 50 (lightest bg), 100, 200, 300, 400, 500 (base), 600, 700, 800, 900, 950 (darkest).

| Shade | Light Mode Use | Dark Mode Use |
|-------|---------------|---------------|
| 50 | Tinted backgrounds | -- |
| 100-200 | Hover states, subtle fills | -- |
| 300-400 | Borders, secondary text | Text, borders |
| 500 | Base / icons | Icons |
| 600-700 | Primary text, buttons | Buttons, CTAs |
| 800-900 | Headings, emphasis | Backgrounds, subtle |
| 950 | -- | Deep backgrounds |

### Light/Dark Mode

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | white / gray-50 | gray-900 / gray-950 |
| Surface | white / gray-50 | gray-800 / gray-850 |
| Text primary | gray-900 | gray-50 |
| Text secondary | gray-600 | gray-400 |
| Border | gray-200 | gray-700 |
| Primary accent | primary-600 | primary-400 |

**Rule:** Don't invert colors mechanically. Dark mode needs independent contrast checking. `primary-600` on white may pass but `primary-600` on gray-900 may fail.

### Color Quality Gate

Before shipping any color system, verify:
- All text/background combinations meet contrast ratios (P1)
- Light and dark mode have independent contrast verification (no mechanical inversion)
- Color is never the sole indicator of state (color independence, P1)
- Semantic tokens map correctly in both modes

---

## P6: Layout & Responsive

### Breakpoints

| Name | Width | Target | Common Layout |
|------|-------|--------|--------------|
| mobile | 320px | Small phones | Single column, stacked |
| tablet | 768px | Tablets, large phones | 2 columns, collapsible sidebar |
| desktop | 1024px | Laptops | Full layout, sidebar visible |
| wide | 1440px | Large monitors | Max-width container, increased spacing |

### Mobile-First Approach

```css
/* Base: mobile styles (320px+) */
.container { padding: 16px; }

/* Tablet up */
@media (min-width: 768px) { .container { padding: 24px; } }

/* Desktop up */
@media (min-width: 1024px) { .container { padding: 32px; max-width: 1280px; } }

/* Wide */
@media (min-width: 1440px) { .container { padding: 48px; } }
```

### Grid System

| Pattern | Use | CSS |
|---------|-----|-----|
| 12-column | Complex dashboards | `grid-template-columns: repeat(12, 1fr)` |
| Auto-fill | Card grids | `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` |
| Sidebar + main | App layout | `grid-template-columns: 256px 1fr` |
| Holy grail | Full page | `grid-template-rows: auto 1fr auto` |

### Container Width

| Content Type | Max Width | Why |
|-------------|-----------|-----|
| Prose/article | 768px (65-75ch) | Readability |
| Dashboard | 1440px | Data density |
| Marketing | 1280px | Visual impact |
| Full-bleed | 100% | Edge-to-edge media |

### Responsive Quality Gate

Every layout must be verified at all four breakpoints (320/768/1024/1440px):
- No horizontal scrolling at any breakpoint
- Touch targets remain >=44x44px on mobile (P2)
- Typography remains readable (no text smaller than 14px on mobile)
- Content hierarchy preserved across breakpoints

---

## P7: Spacing

### Scale (4px base unit)

| Token | Value | Use |
|-------|-------|-----|
| space-0 | 0px | -- |
| space-1 | 4px | Tight: icon-to-text, inline elements |
| space-2 | 8px | Compact: between related items, input padding |
| space-3 | 12px | Default gap between small elements |
| space-4 | 16px | Standard: card padding, form field gaps |
| space-5 | 20px | -- |
| space-6 | 24px | Section internal padding |
| space-8 | 32px | Between card groups, section gaps |
| space-10 | 40px | Large section separation |
| space-12 | 48px | Page-level section gaps |
| space-16 | 64px | Major page sections |
| space-20 | 80px | Hero/footer breathing room |
| space-24 | 96px | Maximum section separation |

**Rhythm rule:** All spacing values must fall on the 4px grid (4/8/12/16/20/24/32/40/48/64/80/96). Arbitrary values like `margin-top: 13px` = code smell.

### Density

| Density | Internal Padding | Gap Between Items | Use Case |
|---------|-----------------|-------------------|----------|
| Compact | 8-12px | 4-8px | Data tables, admin panels |
| Default | 16-24px | 12-16px | Most applications |
| Comfortable | 24-32px | 16-24px | Marketing, editorial |
| Spacious | 32-48px | 24-48px | Landing pages, luxury |

### Spacing Principles

- **Related items closer, unrelated further.** Group by proximity.
- **Consistent within context.** All cards in a grid use same internal padding.
- **Scale with breakpoint.** Mobile padding 16px -> tablet 24px -> desktop 32px.
- **Never use arbitrary values.** Stick to the scale. `margin-top: 13px` = smell.
- **4/8dp rhythm.** Primary increments are 4dp and 8dp. Other values (12, 16, 20, 24...) are multiples. This creates visual harmony.
````

---

## references/interaction-patterns.md Content

````markdown
# Interaction Patterns (P8-P10)

> **When to load:** Animation/motion design, form validation logic, feedback patterns (toast, empty state, error handling), navigation structure decisions.

---

## P8: Animation & Motion

### Timing

| Duration | Use | Example |
|----------|-----|---------|
| 80-150ms | Micro-interactions | Button hover, toggle, color change |
| 150-300ms | State transitions | Modal open, dropdown expand, tab switch |
| 300-500ms | Layout changes | Accordion, sidebar collapse |
| 500-1000ms | Page transitions | Route change, hero entrance |
| 1000ms+ | Orchestrated sequences | Staggered card reveals (use sparingly) |

**Hard rules:**
- Micro-interactions: 150-300ms maximum. Users notice >300ms delays.
- Only animate `transform` and `opacity` (GPU-composited). See P3 for full list.
- Interaction feedback must appear within 80-150ms of user action.

### Easing Functions

| Curve | CSS | Use |
|-------|-----|-----|
| Ease-out | `cubic-bezier(0.0, 0, 0.2, 1)` | Elements entering (fast start, slow end) |
| Ease-in | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting (slow start, fast end) |
| Ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` | Elements moving (smooth both ends) |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounce (use sparingly) |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Non-negotiable.** Every project must include this. P1 (Accessibility) takes priority.

### Motion Principles

- **Meaningful:** Animation communicates (direction, relationship, state). Never purely decorative.
- **Fast:** Users notice >300ms delays. Keep micro-interactions under 200ms.
- **GPU-only:** Animate `transform` and `opacity` only (see P3).
- **One hero moment:** One orchestrated entrance per page. Not every element animates.
- **Spatial consistency:** Elements entering from right should exit to right. Maintain directional logic.

### Animation Anti-Patterns

| Anti-Pattern | Severity | Fix |
|-------------|----------|-----|
| Animating `width`/`height`/`margin` | HIGH -- causes layout thrashing | Use `transform: scale()` or `transform: translate()` |
| Duration >500ms for micro-interactions | MEDIUM -- feels sluggish | Keep under 200ms |
| No `prefers-reduced-motion` | HIGH -- accessibility violation | Add reduced motion media query |
| Every element animates on page load | MEDIUM -- overwhelming, slow | One hero moment per page |
| Easing mismatch (ease-in for entering) | LOW -- feels unnatural | Ease-out for enter, ease-in for exit |

---

## P9: Forms & Feedback

### Form Validation

| Pattern | Do | Don't |
|---------|----|----|
| Error timing | Validate on blur + re-validate on change | Validate on every keystroke |
| Error display | Below field, red text + icon, `aria-describedby` | Red border only (color sole indicator) |
| Success state | Green check after correction | Nothing (user wonders if fixed) |
| Required fields | Mark optional (fewer), or asterisk + legend | Assume users know which are required |
| Submit button | Disable until valid OR show errors on submit | Silently prevent submission |

### State Patterns

| State | Visual | Content |
|-------|--------|---------|
| Empty | Illustration + CTA | "No [items] yet. [Create your first]." |
| Loading | Skeleton matching layout shape | Preserve layout structure |
| Error (page) | Error icon + message + retry CTA | "Something went wrong. [Try again]" |
| Error (inline) | Red text below field + icon | Specific: "Email must include @" not "Invalid" |
| Success | Green toast, auto-dismiss 5s | "Changes saved" (brief, specific) |
| Partial | Progress indicator + loaded content | Show what's available, load more async |

### Toast / Notification Rules

| Property | Value |
|----------|-------|
| Position | Top-right (desktop), top-center (mobile) |
| Duration | Success: 5s auto-dismiss. Error: persistent until dismissed |
| Stack | Max 3 visible, queue the rest |
| Action | Optional: "Undo" for destructive actions |
| A11y | `role="status"` (info/success), `role="alert"` (error) |
| Timing | Must appear within 150ms of triggering action |

### Form Quality Gate

- All error messages are specific and actionable (not "Invalid input")
- Color is never the sole error indicator (icon + text required)
- Loading states preserve layout shape (no content jumps)
- Empty states have illustration + clear CTA
- Success feedback confirms the exact action taken

---

## P10: Navigation

### Patterns by App Type

| App Type | Desktop Nav | Mobile Nav |
|----------|------------|------------|
| SaaS/Dashboard | Sidebar (collapsible) | Bottom tab bar or hamburger drawer |
| Marketing/Blog | Top nav bar | Hamburger menu |
| E-commerce | Mega menu + categories | Bottom nav + hamburger |
| Documentation | Sidebar + table of contents | Hamburger + search |
| Single-page app | Tab bar or segmented control | Same (if <=5 items) |

### Breadcrumb Rules

- Use on sites with 3+ levels of hierarchy.
- Separator: `>` or `/` (not `>>` or `→`).
- Current page: not a link, visually distinct.
- Schema markup: `BreadcrumbList` structured data.

### Mobile Navigation

- Bottom tab bar: max 5 items. More = "More" menu.
- Hamburger: always accessible from every page. Menu icon top-left or top-right (consistent).
- No hover-dependent navigation on mobile. Touch only.
- All nav targets meet 44x44px minimum (P2).

### Navigation Quality Gate

- Active page/section is clearly indicated (`aria-current="page"`)
- Navigation is keyboard-accessible with logical tab order (P1)
- Mobile nav targets meet touch target minimums (P2)
- Breadcrumbs present for 3+ level hierarchies
- No hover-dependent navigation on touch devices
````

---

## Design Decisions

1. **Priority System (P1-P10) over flat rules** — When design rules conflict (e.g., animation delight vs. accessibility), priority ranking provides deterministic resolution. P1 (Accessibility) always wins over P8 (Animation). This replaces ambiguous "use best judgment" with a concrete hierarchy.
2. **Reference skill type, not workflow** — Frontend-design provides design knowledge and rules, not step-by-step workflow. This is why it uses Pre-Delivery Checklist (output-oriented) instead of Common Mistakes (process-oriented), and Priority System instead of Core Principle. Documented exception in CLAUDE.md.
3. **Three reference files by priority group** — P1-P3 (core-constraints: accessibility, touch, performance), P4-P7 (visual-design: typography, color, layout, spacing), P8-P10 (interaction-patterns: animation, forms, navigation). Grouping minimizes context loading — most tasks only need one reference file.
4. **AI Slop Anti-Patterns section** — 14 explicit patterns that signal zero creative direction. AI-generated UI tends toward specific visual clichés (purple gradients, 3-column icon grids, centered everything). Explicit detection list prevents these without requiring subjective judgment.
5. **Three-Layer Design Token Architecture** — Primitive/Semantic/Component layers prevent the common mistake of hardcoding values in components. Layer separation enables theme switching by swapping only primitives, keeping semantic mapping stable.
6. **WCAG 2.1 AA as minimum, not aspirational** — Legal requirement in many jurisdictions. Treating accessibility as P1 (not optional enhancement) reflects both ethics and legal reality.
7. **Font classification with Blacklist/Overused/Recommended** — Three tiers provide actionable guidance without being overly restrictive. Blacklisted fonts are never acceptable. Overused fonts trigger a warning but can proceed if the user insists. Recommended fonts provide positive alternatives.
8. **4px base spacing unit** — Industry standard (Material Design, Tailwind). Provides mathematical consistency (all values divisible by 4) and visual rhythm. The 13-value scale covers all common use cases without arbitrary values.
9. **Independent dark mode design** — Mechanical inversion (just flip light/dark) breaks contrast ratios and creates accessibility failures. Requiring independent verification for each mode prevents this common shortcut.
10. **Mobile-first responsive approach** — Progressive enhancement (320px base → wider breakpoints) ensures mobile works first, then enhances. The reverse (desktop-first with mobile overrides) frequently leaves mobile as an afterthought.
11. **Pre-Delivery Checklist as 20 items** — Comprehensive but scannable. Each item is binary (pass/fail), references its priority level, and covers the most common shipping mistakes. Serves as the final gate before delivery.
12. **Detection principle for AI slop** — "Would a designer at a respected studio ship this without changes?" provides a meta-heuristic when the 14-item list doesn't cover a specific pattern. Encourages creative intention over default generation.
13. **Pairs only with core-principles** — Frontend-design is a knowledge reference used by multiple agents/commands but only needs to integrate with core-principles (visual-first for previews, questioning for design decisions, decision continuity for approved choices).

## Testing Plan

1. Agent audits a UI component — does it check P1 (accessibility) before P8 (animation)?
2. Dark mode implementation — does agent verify contrast independently, not just invert light mode colors?
3. Icon button with 24x24px clickable area on mobile — does agent flag it as too small (P2)?
4. Agent proposes Inter as body font — does it warn about overused font classification?
5. Component uses hardcoded `#3B82F6` instead of `var(--color-primary)` — does agent flag missing semantic token?
6. Agent builds a landing page — does it detect 3-column icon circle grid as AI slop pattern #2?
7. Animation uses `width` transition — does agent flag and suggest `transform: scale()` instead?
8. Form validates on every keystroke — does agent recommend validate-on-blur pattern?
9. Page tested only at desktop width — does agent require verification at all 4 breakpoints (320/768/1024/1440)?
10. Agent uses `margin-top: 13px` — does it flag as off the 4px spacing grid?
11. Empty state shows blank page — does agent require illustration + CTA?
12. Error message says "Invalid input" — does agent flag as non-specific and require actionable text?
13. No `prefers-reduced-motion` media query — does agent flag as P1/P8 violation?
14. Every element has bouncy entrance animation — does agent flag "one hero moment per page" rule?
15. Agent delivers UI — does it run the 20-item Pre-Delivery Checklist?
