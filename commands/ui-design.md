---
description: "UI design pipeline: UI-SPEC, Playwright mockup preview, interactive feedback, production code, verification"
argument-hint: "<page or component description>"
---

# UI Design Pipeline

Full UI pipeline: generate UI-SPEC (design contract), preview mockup in Playwright, iterate with interactive feedback, generate production code, verify (visual + CSS + responsive + accessibility).

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Detect context**
   - Load `.superteam/config.json` (frameworks, frontend workspace)
   - Load `.superteam/PROJECT.md` (core value, target users)
   - Load `.superteam/REQUIREMENTS.md` (UI-related requirements)
   - Detect existing UI code (brownfield)
   - Accept image input anytime: reference images, wireframes, inspiration
   - Use `superteam:project-awareness` for context loading

2. **Design system check**
   - Check `.superteam/DESIGN-SYSTEM.md`:
     - Exists: load colors, fonts, spacing, components
     - Does not exist: suggest running `/st:design-system` first
       - User agrees: run `/st:design-system` first
       - User declines: define temporary values for this session (not saved project-level)
   - Detect design system library (Tailwind, MUI, shadcn, Vuetify, etc.)
   - User confirms or overrides detected library

3. **Questioning** (light, 2-3 questions)
   - "What page or component do you want to design?"
   - "Any reference or inspiration?" (accept images)
   - Additional context questions as needed

4. **Generate UI-SPEC** (design contract)
   - Color: from DESIGN-SYSTEM.md (or temporary values)
   - Typography: font, sizes, weights per role
   - Spacing: token-based scale (4px multiples)
   - Components: use components from detected design system
   - Copywriting: CTA text, empty states, error messages
   - Save UI-SPEC document
   - Commit: `design: UI-SPEC for [page/component]`

5. **Generate mockup + preview**
   - Create HTML/CSS prototype using the actual design system
   - Open in Playwright MCP browser
   - User views directly in browser

6. **Iteration loop**
   - User provides feedback via any method:
     - **Click element** on browser: Playwright captures selector + CSS, AI knows exactly what to fix
     - **Send annotated screenshot**
     - **Describe in text**
   - AI updates mockup, refreshes preview
   - Loop until user is satisfied

7. **Generate production code**
   - Convert approved mockup to production components
   - Use the correct design system (React + shadcn, Vue + Vuetify, etc.)
   - Responsive: mobile-first approach
   - Accessible: ARIA labels, contrast ratios, keyboard navigation

8. **Verification** (automated)
   - Start dev server

   a. **Visual compare**:
      - Screenshot mockup vs real app
      - Highlight differences

   b. **CSS property check**:
      - Extract actual CSS values (spacing, colors, font-size)
      - Compare against UI-SPEC
      - Report mismatches

   c. **Responsive check** (4 breakpoints):
      - 320px: mobile screenshot
      - 768px: tablet screenshot
      - 1024px: desktop screenshot
      - 1440px: wide screenshot

   d. **Accessibility check**:
      - Contrast ratio (WCAG AA: 4.5:1 text, 3:1 large text)
      - ARIA roles and labels
      - Keyboard navigation (tab order)
      - Accessibility tree analysis

   - Present verification report:
     ```
     UI VERIFICATION
     ─────────────────────────────────
     Visual match:    pass/fail
     CSS accuracy:    [N]/[N] correct
     Responsive:      [breakpoints status]
     Accessibility:   [score]
     ─────────────────────────────────
     Issues: [list if any]
     ```
   - If issues found: auto-fix then re-verify
   - If clean: continue

9. **Export artifacts**
   - UI-SPEC: `.superteam/designs/[name]-spec.md`
   - Mockup: `.superteam/designs/[name].html`
   - Screenshots: `.superteam/designs/[name]-[breakpoint].png`
   - Verification report: `.superteam/designs/[name]-report.md`
   - Commit: `design: [page/component] verified`
   - Follow `superteam:atomic-commits`

10. **Done**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > UI DESIGN COMPLETE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Visual: pass | CSS: pass | Responsive: pass | A11y: pass
    ```

## Rules

- Design system check is mandatory. If DESIGN-SYSTEM.md does not exist, offer `/st:design-system` or use temporary values. Never skip.
- UI-SPEC is the design contract. All mockup and production code must conform to it.
- Mockup preview uses Playwright MCP. The mockup must use the actual design system (not placeholder styles).
- Interactive feedback via Playwright click is the primary feedback method. Always support it.
- Verification covers 4 dimensions: visual match, CSS accuracy, responsive (4 breakpoints), accessibility (WCAG AA).
- Responsive check uses 4 breakpoints: 320px, 768px, 1024px, 1440px. All must be tested.
- Accessibility is checked during design phase, not deferred to code review.
- Production code must be mobile-first and use the project's actual design system library.
- Image input accepted at any point: reference images, wireframes, screenshots for feedback.
- All artifacts are saved to `.superteam/designs/` and committed.
