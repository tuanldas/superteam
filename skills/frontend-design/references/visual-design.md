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
