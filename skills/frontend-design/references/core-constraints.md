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
