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
