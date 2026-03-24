---
description: "Define project design system: aesthetic, typography, color, spacing, layout, motion, decoration"
argument-hint: ""
---

# Define Project Design System

Define the design system for the entire project across 7 dimensions: Aesthetic, Typography, Color, Spacing, Layout, Motion, Decoration. Saves to `.superteam/DESIGN-SYSTEM.md`. Used by `/st:ui-design` for all page/component design.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Accept image input: reference sites, mood boards, wireframes

2. **Pre-checks**
   - `.superteam/DESIGN-SYSTEM.md` exists?
     - Yes: read it, ask "Update, start over, or cancel?"
     - No: continue
   - Detect existing UI code (brownfield)?
     - Yes: scan codebase, extract actual fonts/colors/spacing in use.
       Present: "Project has existing UI code. I detected: [fonts], [colors], [spacing]. Use as baseline or start from zero?"
     - No: continue
   - Load context: `.superteam/config.json`, PROJECT.md, README.md

3. **Product context** (1 broad question)
   - Synthesize from codebase + PROJECT.md:
     "Based on the codebase, this appears to be [X] for [Y] in the [Z] space. Correct? Want me to research the landscape?"
   - Confirm: product type, target users, industry
   - User chooses: research or use built-in knowledge

4. **Research** (optional, if user agrees)
   - Follow `superteam:research-methodology` at Light depth
   - WebSearch: "best [industry] web apps 2025", "[category] website design"
   - Playwright (if available): visit top 3-5 sites, screenshot + analyze:
     - Actual fonts, color palettes, layout approach, spacing density, aesthetic direction
   - Summarize: "Landscape: converges on [patterns]. Most feel [observation]. Opportunity to stand out: [gap]."
   - Graceful degradation:
     - Playwright available: richest research
     - Playwright unavailable: WebSearch only
     - WebSearch unavailable: built-in design knowledge

5. **Complete proposal** (all 7 dimensions at once)

   Present a single cohesive proposal:
   ```
   ┌──────────────────────────────────────────────┐
   │ DESIGN SYSTEM PROPOSAL                       │
   ├──────────────────────────────────────────────┤
   │ AESTHETIC: [direction] -- [rationale]         │
   │ DECORATION: [level] -- [rationale]            │
   │ TYPOGRAPHY: [fonts + scale] -- [rationale]    │
   │ COLOR: [palette + hex] -- [rationale]         │
   │ SPACING: [base + density] -- [rationale]      │
   │ LAYOUT: [approach + grid] -- [rationale]      │
   │ MOTION: [approach + easing] -- [rationale]    │
   ├──────────────────────────────────────────────┤
   │ SAFE CHOICES (category baseline):             │
   │ - [2-3 decisions matching conventions]        │
   │                                               │
   │ RISKS (product gets its own face):            │
   │ - [2-3 departures, each with rationale]       │
   ├──────────────────────────────────────────────┤
   │ AI SLOP CHECK: [flagged patterns, if any]     │
   └──────────────────────────────────────────────┘
   ```

   User options: Approve, Adjust [section], Different risks, Start over

6. **Drill-downs** (if user wants to adjust)
   - Fonts: 3-5 candidates with rationale, explain what each evokes
   - Colors: 2-3 palette options with hex, explain color theory
   - Each drill-down is 1 focused question
   - After each change, run coherence check:
     - Mismatch? Nudge once, explain why it is unusual, offer alternative
     - Always accept user decision. Do not block. Do not ask again.

7. **Preview on Playwright** (if available)
   - Generate self-contained HTML preview page:
     - Load proposed fonts from Google Fonts / Bunny Fonts
     - Apply proposed color palette throughout
     - Font specimen: each font in proposed role
     - Color swatches with hex + sample UI components
     - Realistic mockups by project type:
       - Dashboard: data table, sidebar, stat cards
       - Marketing: hero, features, testimonial, CTA
       - Admin: form, toggles, dropdowns
     - Light/dark mode toggle
     - Responsive
   - Open via Playwright MCP for user to view in browser
   - User feedback leads to adjust and regenerate loop

8. **Write DESIGN-SYSTEM.md**
   - Save to `.superteam/DESIGN-SYSTEM.md`
   - Follow `superteam:atomic-commits`
   - Commit: `design: create design system for [project]`

9. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > DESIGN SYSTEM CREATED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Aesthetic: [direction]
   Fonts: [display] / [body] / [data]
   Colors: [primary] / [secondary]
   > Use /st:ui-design to design pages
   ```

## Aesthetic Directions (10)

Brutally Minimal | Maximalist Chaos | Retro-Futuristic | Luxury/Refined | Playful | Editorial/Magazine | Brutalist/Raw | Art Deco | Organic/Natural | Industrial

## Font Rules

**Blacklist (banned):** Papyrus, Comic Sans, Lobster, Impact, Jokerman, Bleeding Cowboys, Permanent Marker, Bradley Hand, Brush Script, Hobo, Trajan, Raleway, Clash Display, Courier New (for body)

**Overused (warn):** Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins

**Recommended by purpose:**
- Display: Satoshi, General Sans, Instrument Serif, Fraunces, Clash Grotesk, Cabinet Grotesk
- Body: Instrument Sans, DM Sans, Source Sans 3, Geist, Plus Jakarta Sans, Outfit
- Data: Geist (tabular-nums), DM Sans (tabular-nums), JetBrains Mono, IBM Plex Mono
- Code: JetBrains Mono, Fira Code, Berkeley Mono, Geist Mono

## AI Slop Anti-Patterns

Flag and avoid these patterns:
1. Purple/violet gradients as default accent
2. 3-column feature grid with icons in colored circles
3. Centered everything with uniform spacing
4. Uniform bubbly border-radius on every element
5. Generic hero copy ("Welcome to [X]", "Unlock the power of...")
6. Decorative blobs, floating circles, wavy SVG dividers
7. Cookie-cutter section rhythm

Principle: "Would a human designer at a respected studio ship this? If zero creative direction was applied, flag it."

## Coherence Validation

When user overrides a section, check coherence with other sections:

| Aesthetic | + Override | Why it clashes |
|---|---|---|
| Brutalist/Minimal | + Expressive motion | Raw = no decoration, expressive = very decorative |
| Luxury/Refined | + Compact spacing | Luxury needs breathing room, compact = cramped |
| Playful | + Restrained color | Playful needs color energy, restrained lacks personality |
| Editorial/Magazine | + Data-heavy layout | Editorial = asymmetric + whitespace, data = dense |
| Industrial | + Expressive decoration | Industrial = function-first, decoration = ornamental |

Handling: Nudge once, offer alternative, always accept user decision, never block, never ask again.

## Rules

- Present the full 7-dimension proposal at once. Do not ask dimension by dimension.
- Always separate SAFE choices from RISKS with rationale for each.
- Run AI slop check on every proposal. Flag generic patterns.
- Coherence nudges are gentle and one-time only. User decision is final.
- Blacklisted fonts must never appear in proposals.
- Overused fonts trigger a warning but are allowed if user insists.
- Brownfield projects: always offer to infer from existing code first.
- Two-way interaction with `/st:ui-design`: this command defines the system, `/st:ui-design` may suggest updates back.
