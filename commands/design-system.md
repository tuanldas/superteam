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

5. **Propose each dimension one at a time (VISUAL-FIRST)**
   - **ONE dimension per message. Wait for user response before proposing the next.**
   - **NEVER batch multiple dimensions into one message. NEVER present a "full proposal" upfront.**
     This is the user's chance to choose fonts, colors, spacing etc. according to their taste.
     Skipping this interaction removes their agency over the design.
   - Order: AESTHETIC → DECORATION → TYPOGRAPHY → COLOR → SPACING → LAYOUT → MOTION
   - **VISUAL-FIRST (mandatory, no exceptions):**
     - BEFORE proposing any dimension → create preview HTML at `.superteam/preview/<dimension>.html`
     - Preview shows ALL options side-by-side with realistic mockups (not just swatches)
     - Preview MUST default light background (`#fff`/`#fafafa`). Dark only if design system confirmed dark mode.
     - Show preview to user (Playwright screenshot or fallback URL) THEN present options
     - Text-only proposals are NEVER acceptable. "Refined Functional" means nothing until user SEES it.
     - This applies to EVERY dimension — including typography, spacing, layout, motion. No exceptions.
     - If user asks "thêm lựa chọn" → update preview HTML with new options, show again, then ask
   - Each dimension = 1 message:
     ```
     Preview: .superteam/preview/<dimension>.html (+ screenshot or URL)

     Options shown in preview:
     - A. [option] — [rationale]
     - B. [option] — [rationale]
     ...

     Recommend: [option] — [why]. Confidence: High/Med/Low.

     → Approve / Adjust / More options
     ```
   - If user approves → next dimension
   - If user adjusts → drill-down inline:
     - Fonts: 3-5 candidates with rationale, explain what each evokes
     - Colors: 2-3 palette options with hex, explain color theory
     - Each drill-down updates the preview HTML and shows it again
   - Coherence check after each dimension vs previously approved dimensions:
     - Mismatch → nudge once, explain why unusual, offer alternative
     - Always accept user decision, never block, never ask again
   - Adaptive: if user's answer on one dimension already implies another → skip or pre-fill with confirmation

6. **Full summary + Preview**
   - After all 7 dimensions approved → present compact summary:
     ```
     ┌──────────────────────────────────────────────┐
     │ DESIGN SYSTEM SUMMARY                        │
     ├──────────────────────────────────────────────┤
     │ AESTHETIC: [approved value]                   │
     │ DECORATION: [approved value]                  │
     │ TYPOGRAPHY: [approved value]                  │
     │ COLOR: [approved value]                       │
     │ SPACING: [approved value]                     │
     │ LAYOUT: [approved value]                      │
     │ MOTION: [approved value]                      │
     ├──────────────────────────────────────────────┤
     │ SAFE CHOICES: [2-3 decisions matching norms]  │
     │ RISKS: [2-3 departures + rationale]           │
     ├──────────────────────────────────────────────┤
     │ AI SLOP CHECK: [flagged patterns, if any]     │
     └──────────────────────────────────────────────┘
     ```
   - User options: Approve all / Adjust [section] / Start over
   - Adjust [section] → revisit that dimension (1 question), then update summary
   - Start over → return to step 5 from AESTHETIC

7. **Coherence Preview on Playwright** (if available)
   - Each dimension already has its own preview from step 5. This step checks ALL dimensions together.
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

- Propose ONE dimension per message, wait for user response. NEVER batch all dimensions at once.
- Always separate SAFE choices from RISKS with rationale for each.
- Run AI slop check on every proposal. Flag generic patterns.
- Coherence nudges are gentle and one-time only. User decision is final.
- Blacklisted fonts must never appear in proposals.
- Overused fonts trigger a warning but are allowed if user insists.
- Brownfield projects: always offer to infer from existing code first.
- Two-way interaction with `/st:ui-design`: this command defines the system, `/st:ui-design` may suggest updates back.
- Follow `superteam:core-principles`. Load references: visual-first, questioning, decision-continuity.
