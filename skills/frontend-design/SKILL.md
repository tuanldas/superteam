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

## P1: Accessibility (CRITICAL)

**Standard:** WCAG 2.1 AA minimum.

### Contrast Ratios

| Element | Minimum Ratio | Example Pass | Example Fail |
|---------|--------------|--------------|--------------|
| Normal text (<18px / <14px bold) | 4.5:1 | #374151 on #FFFFFF (10.6:1) | #9CA3AF on #FFFFFF (2.9:1) |
| Large text (>=18px / >=14px bold) | 3:1 | #6B7280 on #FFFFFF (5.0:1) | #D1D5DB on #FFFFFF (1.8:1) |
| UI components & graphics | 3:1 | Border #6B7280 on #FFFFFF | Border #E5E7EB on #FFFFFF |
| Focus indicators | 3:1 | 2px solid #2563EB | 1px dotted #D1D5DB |

**Calculating contrast:** Use relative luminance formula or tool. `#6B7280` on `#FFFFFF` = ~5.0:1 (passes for large text, fails for small text at some sizes).

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

| Context | Minimum Size | Recommended |
|---------|-------------|-------------|
| Mobile primary actions | 44x44px (WCAG 2.5.8) | 48x48px (Material 3) |
| Mobile secondary actions | 44x44px | 44x44px |
| Desktop buttons | 32x32px | 36x36px |
| Spacing between targets | 8px minimum gap | 12px |

**Common violation:** Icon buttons with 24x24px clickable area. Fix: pad to 44px minimum with `padding` or `min-width`/`min-height`.

### Hover & Focus States

Every interactive element needs ALL states:

| State | Visual Treatment |
|-------|-----------------|
| Default | Base appearance |
| Hover | Subtle change: darken 10%, lighten bg, underline |
| Focus | Visible outline (2px+, 3:1 contrast) |
| Active/Pressed | Slight scale(0.98) or darken 15% |
| Disabled | opacity: 0.5 + `cursor: not-allowed` + `pointer-events: none` |
| Loading | Spinner or skeleton replacing content |

---

## P3: Performance

### Animation Performance

| Property | GPU Composited | Use For |
|----------|---------------|---------|
| `transform` | Yes | Movement, scale, rotation |
| `opacity` | Yes | Fade in/out |
| `filter` | Yes (mostly) | Blur, brightness |
| `width`, `height` | NO — triggers layout | Avoid animating |
| `top`, `left` | NO — triggers layout | Use `transform: translate()` |
| `margin`, `padding` | NO — triggers layout | Avoid animating |
| `background-color` | NO — triggers paint | Use `opacity` on overlay |

### Font Loading

```css
@font-face {
  font-family: 'CustomFont';
  font-display: swap;       /* Show fallback immediately, swap when loaded */
  src: url('font.woff2') format('woff2');  /* woff2 first — smallest */
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
| PNG | Screenshots, text-heavy images | — |

- Lazy load below-fold: `loading="lazy"`
- Set explicit `width` and `height` to prevent layout shift (CLS).
- Use `srcset` for responsive images.

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | <=2.5s | <=4.0s | >4.0s |
| INP (Interaction to Next Paint) | <=200ms | <=500ms | >500ms |
| CLS (Cumulative Layout Shift) | <=0.1 | <=0.25 | >0.25 |

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

### Font Pairing Principles

| Pattern | Example | Effect |
|---------|---------|--------|
| Serif display + Sans body | Instrument Serif + DM Sans | Classic editorial feel |
| Geometric display + Humanist body | Cabinet Grotesk + Source Sans 3 | Modern but warm |
| Mono display + Sans body | JetBrains Mono + Geist | Technical, developer-focused |
| Same family, different weights | Satoshi 900 + Satoshi 400 | Cohesive, safe |

**Rule:** Maximum 2 font families + 1 code font. More = visual noise.

### Font Classification

**Blacklist (banned — never use):**
Papyrus, Comic Sans, Lobster, Impact, Jokerman, Bleeding Cowboys, Permanent Marker, Bradley Hand, Brush Script, Hobo, Trajan, Raleway, Clash Display, Courier New (for body)

**Overused (warn — flag if used, allow if user insists):**
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
| 50 | Tinted backgrounds | — |
| 100-200 | Hover states, subtle fills | — |
| 300-400 | Borders, secondary text | Text, borders |
| 500 | Base / icons | Icons |
| 600-700 | Primary text, buttons | Buttons, CTAs |
| 800-900 | Headings, emphasis | Backgrounds, subtle |
| 950 | — | Deep backgrounds |

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

---

## P7: Spacing

### Scale (4px base unit)

| Token | Value | Use |
|-------|-------|-----|
| space-0 | 0px | — |
| space-1 | 4px | Tight: icon-to-text, inline elements |
| space-2 | 8px | Compact: between related items, input padding |
| space-3 | 12px | Default gap between small elements |
| space-4 | 16px | Standard: card padding, form field gaps |
| space-5 | 20px | — |
| space-6 | 24px | Section internal padding |
| space-8 | 32px | Between card groups, section gaps |
| space-10 | 40px | Large section separation |
| space-12 | 48px | Page-level section gaps |
| space-16 | 64px | Major page sections |
| space-20 | 80px | Hero/footer breathing room |
| space-24 | 96px | Maximum section separation |

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

---

## P8: Animation & Motion

### Timing

| Duration | Use | Example |
|----------|-----|---------|
| 100-150ms | Micro-interactions | Button hover, toggle |
| 200-300ms | State transitions | Modal open, dropdown expand |
| 300-500ms | Layout changes | Accordion, sidebar collapse |
| 500-1000ms | Page transitions | Route change, hero entrance |
| 1000ms+ | Orchestrated sequences | Staggered card reveals (use sparingly) |

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

---

## Design Token Architecture

### Three-Layer System

```
Layer 1: Primitive     → Raw values
Layer 2: Semantic      → Meaning-based aliases
Layer 3: Component     → Component-specific tokens
```

### CSS Variable Naming

```css
/* Layer 1: Primitives (never use directly in components) */
--color-blue-500: #3B82F6;
--color-gray-900: #111827;
--space-4: 16px;
--font-size-base: 16px;
--radius-md: 8px;

/* Layer 2: Semantic (use these in components) */
--color-primary: var(--color-blue-500);
--color-text-primary: var(--color-gray-900);
--color-bg-surface: var(--color-white);
--color-border-default: var(--color-gray-200);
--spacing-section: var(--space-8);
--radius-card: var(--radius-md);

/* Layer 3: Component (optional, for complex systems) */
--button-bg: var(--color-primary);
--button-text: var(--color-white);
--button-radius: var(--radius-card);
--button-padding-x: var(--space-4);
--button-padding-y: var(--space-2);
--card-padding: var(--spacing-section);
--card-radius: var(--radius-card);
```

### Token Categories

| Category | Naming Pattern | Examples |
|----------|---------------|----------|
| Color | `--color-{semantic}-{variant}` | `--color-primary`, `--color-text-secondary` |
| Spacing | `--space-{scale}` | `--space-4` (16px), `--space-8` (32px) |
| Typography | `--font-{property}-{variant}` | `--font-size-lg`, `--font-weight-bold` |
| Radius | `--radius-{size}` | `--radius-sm` (4px), `--radius-full` (9999px) |
| Shadow | `--shadow-{size}` | `--shadow-sm`, `--shadow-lg` |
| Z-index | `--z-{context}` | `--z-dropdown: 50`, `--z-modal: 100`, `--z-toast: 150` |
| Duration | `--duration-{speed}` | `--duration-fast: 150ms`, `--duration-normal: 300ms` |

---

## AI Slop Anti-Patterns

Patterns that signal zero creative direction. Flag all, fix each.

| # | Pattern | Why It's Slop | Fix |
|---|---------|--------------|-----|
| 1 | Purple/violet gradient as default accent | Most overused AI color scheme | Choose context-appropriate palette |
| 2 | 3-column feature grid with icon circles | Template #1 in every AI generator | Vary columns (2, 4, asymmetric), use illustrations or screenshots |
| 3 | Centered everything, uniform spacing | No visual hierarchy or rhythm | Vary alignment, create visual flow with asymmetry |
| 4 | Uniform bubbly `border-radius` on all elements | Feels like a toy, no intentional system | Vary radius by element type (buttons: 6px, cards: 12px, pills: 9999px) |
| 5 | Generic hero copy ("Welcome to X", "Unlock the power of") | Says nothing about the product | Specific value prop in 10 words or fewer |
| 6 | Decorative blobs, floating circles, wavy SVG dividers | Meaningless decoration | Remove or replace with purposeful graphics |
| 7 | Cookie-cutter section rhythm (same padding, same width) | Monotonous scroll experience | Vary section height, padding, width, background |
| 8 | Overused fonts (Inter, Roboto, Poppins everywhere) | Zero typographic personality | Choose distinctive fonts from recommended list |
| 9 | Card-grid-with-hover-shadow as only interaction | Repeated across every section | Vary interactions: reveal content, animate, link styles |
| 10 | Gradient text on everything | Overused after CSS gradient text became easy | Reserve for 1 hero element max, or skip entirely |
| 11 | Stock-photo hero with text overlay | Generic, forgettable | Custom illustration, product screenshot, or bold typography |
| 12 | Identical spacing between ALL sections | No content hierarchy | Tighter within related groups, spacious between major sections |
| 13 | Every button is rounded-full with gradient | Looks AI-generated | Match button style to aesthetic direction |
| 14 | Dark mode = just invert colors | Broken contrast, wrong hierarchy | Design dark mode independently, re-check all contrast ratios |

**Detection principle:** "Would a designer at a respected studio ship this without changes? If no creative direction was applied, flag it."

---

## Quick Reference: Audit Checklist

| # | Check | Pass Criteria | Ref |
|---|-------|--------------|-----|
| 1 | Text contrast | >=4.5:1 normal, >=3:1 large | P1 |
| 2 | Touch targets | >=44x44px mobile | P2 |
| 3 | Focus indicators | Visible, >=3:1 contrast, 2px+ | P1 |
| 4 | Semantic HTML | No `<div>` for interactive elements | P1 |
| 5 | Keyboard navigation | All interactive elements reachable | P1 |
| 6 | Animation properties | Only `transform`/`opacity` animated | P3 |
| 7 | Font loading | `font-display: swap`, woff2, preload | P3 |
| 8 | Type scale | Consistent scale, body 16px+, line-height >=1.5 | P4 |
| 9 | Font count | <=2 families + 1 code font | P4 |
| 10 | Color system | Semantic tokens, not hardcoded hex | P5 |
| 11 | Dark mode contrast | Independently verified, not inverted | P5 |
| 12 | Responsive | Tested at 320/768/1024/1440px | P6 |
| 13 | Prose max-width | 65-75ch for readability | P6 |
| 14 | Spacing scale | 4px base, no arbitrary values | P7 |
| 15 | Reduced motion | `prefers-reduced-motion` respected | P8 |
| 16 | Empty states | Not blank — illustration + CTA | P9 |
| 17 | Error messages | Specific, actionable, accessible | P9 |
| 18 | AI slop check | No patterns from anti-pattern list | — |

---

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | When making design judgments | Referenced by UI agents/commands |

**Self-contained.** All rules inline. No supporting files.

## Integration

**Referenced by:**
- `agents/ui-auditor.md` — scoring criteria for 6-pillar audits
- `agents/ux-designer.md` — rules when creating design specs
- `agents/ui-researcher.md` — rules when producing UI-SPEC
- `commands/ui-design.md` — design judgment during pipeline
- `commands/design-system.md` — font/color/spacing rules

**Pairs with:**
- `superteam:core-principles` — visual-first verification, questioning, decision continuity
