---
description: "Initialize project: config, auto-detect, deep questioning, research, design system, requirements, roadmap"
---

# Project Initialization

Full project setup: configure preferences, auto-detect tech stack, deep questioning to understand the project, research domain, define design system, define requirements, create roadmap.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Configure preferences**
   - Ask user for:
     - Granularity preference (coarse / standard / fine)
     - Parallelization (parallel / sequential)
     - Git tracking for planning docs (yes / no)
     - AI models for agents (if applicable)
     - Research confirmation (confirm / auto-approve) — default: confirm
   - Write `.superteam/config.json`
   - Commit: `chore: add project config`
   - Follow `superteam:atomic-commits`

2. **Setup + Auto-detect**
   - Check if `.superteam/` already exists
     - Exists: ask "Project already initialized. Re-init?"
     - Not exists: continue
   - Check git, init if needed
   - Auto-detect by scanning file markers:
     - package.json, composer.json, go.mod, Dockerfile, tsconfig.json,
       vite.config.*, next.config.*, Cargo.toml, pyproject.toml, etc.
     - Detect: project type, frameworks, workspaces
     - Detect: brownfield vs greenfield
   - If brownfield: spawn codebase-mapper agent within init flow
     - Mapping results become context for questioning
   - Present detection results (display only, no confirmation yet)

3. **Deep questioning (loop)**
   - Start open-ended: "What are you building?"
   - Follow up based on answers. Accept image input anytime (wireframe, whiteboard, architecture diagram).
   - Maintain an internal coverage checklist (do NOT show to user):
     - WHO: Who are the users, usage context
     - WHAT: Core problem / pain point
     - SCOPE: Clear boundaries (v1 does what, does NOT do what)
     - EXIST: What exists already, technical constraints
     - DONE: What does "done" look like? Success criteria
   - Each area needs at least 1 specific answer to check off.
   - Make detection-aware suggestions:
     - Suggest things user hasn't thought about based on detection
     - Example: "You mentioned API but haven't discussed auth."
     - Example: "I see React but no test setup."
   - Questioning techniques:
     - Follow the thread, do NOT follow a script
     - Challenge vagueness: what does "good" mean? who are "users"?
     - Make abstract concrete: "Walk me through using this"
     - 4 question types: Motivation, Concreteness, Clarification, Success
     - NEVER: checklist walking, canned questions, interrogation, rushing, shallow acceptance, premature constraints
   - Checkpoint after 15 exchanges (or >= 4/5 areas covered):
     - Present summary: "Here is what I understand..."
       - WHO: [summary]
       - WHAT: [summary]
       - SCOPE: [summary]
       - EXIST: [summary]
       - DONE: [summary]
       - Uncovered areas: [list]
     - Ask: "Is this correct and complete? Anything to fix or add?"
     - User says enough: continue flow
     - User says more/fix: new questioning round (15 exchanges), loop unlimited

4. **Write PROJECT.md (living document)**
   - Synthesize context from detection + questioning + images
   - Include: preliminary requirements (Validated / Active / Out of Scope)
   - Brownfield: infer Validated requirements from existing code
   - Include: Key Decisions, Assumptions (for uncovered areas)
   - Footer: "*Created: [date] after init*"
   - Save to `.superteam/PROJECT.md`
   - Commit: `docs: initialize project`
   - PROJECT.md is a living doc: later steps auto-update when conflicts found

5. **Research (dynamic waves)**
   - Input: `.superteam/PROJECT.md` + codebase mapping (if brownfield)
   - Follow `superteam:research-methodology`

   **Step 1 — Select research areas:**
   - Read PROJECT.md: extract domain, tech decisions, constraints, greenfield/brownfield status
   - Load research area catalog (`superteam:research-methodology` → `research-catalog.md`)
   - For each catalog area: evaluate trigger AND brownfield conditions:
     - Greenfield: include area if trigger matches
     - Brownfield: check brownfield condition — SKIP, ADJUST focus, or KEEP as-is
   - If custom areas seem needed: propose separately with justification,
     ask user to confirm (custom areas are never auto-included)

   **Step 2 — Build research plan and confirm:**
   - Build dependency graph from selected areas' `needs` fields
   - Group into waves: `wave = max(wave[deps]) + 1`
   - Present research plan:
     ```
     RESEARCH PLAN
     Based on PROJECT.md analysis:

     Wave [N] (parallel, [M] agents):
       ├─ [AREA]: [focus description]
       └─ [AREA]: [focus description]
     ...
     Total: [X] agents, [Y] waves
     Adjust areas or proceed?
     ```
   - If `config.research_auto_approve` is true: display plan and proceed immediately
     (EXCEPT: if custom areas proposed, always pause for confirmation)
   - If false (default): wait for user to approve, adjust areas, or skip research

   **Step 3 — Execute waves:**
   - For each wave: make ALL Agent() calls in a SINGLE message (foreground parallel with tree view)
   - Each agent receives: project context, relevant prior wave outputs, specific focus area
   - Each agent follows `superteam:research-methodology` at Deep depth
   - **MANDATORY WAIT GATE** per wave: do NOT proceed until ALL agents
     have completed AND you have READ their output files
   - After all waves: synthesize into SUMMARY.md
   - If conflicts with PROJECT.md found: update PROJECT.md
   - Save research to `.superteam/research/`
   - Commit: `docs: complete research`

6. **Define design system**
   - Gate question: "Dự án này có cần design system không? (Kể cả backend cũng có thể cần trang 404, coming soon, redirect...)"
     - User says No: add to PROJECT.md section `## Design System\nKhông cần — [lý do user nêu]`, skip to step 7
     - User says Yes: run adapted design system flow (sub-steps below)

   **6.1. Auto-synthesize context**
   - Read accumulated context: PROJECT.md, research findings (especially LANDSCAPE.md, STACK.md), auto-detect results
   - Extract: product type, target users, industry, tech stack (CSS framework, component library)
   - Brownfield: scan codebase for existing fonts/colors/spacing in use
     → Display: "Phát hiện: [fonts], [colors], [spacing]. Dùng làm baseline hay bắt đầu từ zero?"
     → Baseline: proposal builds on existing tokens
     → Zero: proposal ignores existing code, proposes entirely new system
   - Do not ask additional context questions — all context already gathered from steps 2-5

   **6.2. Propose full 7 dimensions**
   - Based on accumulated context → create complete proposal:
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
   - If init research has landscape data → use to inform proposal
   - If not → use built-in design knowledge
   - Apply full font rules (blacklist, overused warnings) and AI slop anti-patterns from `/st:design-system`

   **6.3. Drill-downs + Preview**
   - User options: Approve, Adjust [section], Different risks, Start over
   - Each drill-down is 1 focused question (fonts: 3-5 candidates, colors: 2-3 palette options)
   - Coherence check after each change:
     - Mismatch → nudge once, explain why unusual, offer alternative
     - Always accept user decision, never block, never ask again
   - Playwright preview if available:
     - Generate self-contained HTML preview page
     - Load proposed fonts, apply color palette
     - Realistic mockups by project type (dashboard/marketing/admin)
     - Light/dark mode toggle, responsive
     - User feedback → adjust → regenerate loop
   - Playwright unavailable → skip preview, text-based only

   **6.4. Save and commit**
   - Save `.superteam/DESIGN-SYSTEM.md`
   - Follow `superteam:atomic-commits`
   - Commit: `design: create design system for [project]`

7. **Define requirements**
   - Load DESIGN-SYSTEM.md if exists (design tokens may inform requirements)
   - Load research findings (LANDSCAPE.md for feature reference)
   - Categorize features: table stakes vs differentiators
   - User scopes: v1 / v2 / out of scope per category
   - Generate `REQUIREMENTS.md` with REQ-IDs format: `[CATEGORY]-[NUMBER]`
   - Present full list to user for approval
   - If conflicts with PROJECT.md: update PROJECT.md
   - Save to `.superteam/REQUIREMENTS.md`
   - Commit: `docs: define v1 requirements`

8. **Create roadmap**
   - Spawn roadmapper agent
   - Input: PROJECT.md + REQUIREMENTS.md + SUMMARY.md + DESIGN-SYSTEM.md (if exists) + config
   - Map requirements to phases
   - Derive 2-5 success criteria per phase
   - Validate 100% requirement coverage
   - Generate `ROADMAP.md`
   - Present to user for confirm/adjust. Loop until approved.
   - If conflicts with PROJECT.md: update PROJECT.md
   - Save to `.superteam/ROADMAP.md`
   - Commit: `docs: create roadmap ([N] phases)`

9. **Spec review**
   - Dispatch reviewer agent to check all artifacts:
     - PROJECT.md: complete, unambiguous
     - REQUIREMENTS.md: REQ-IDs consistent, coverage sufficient
     - ROADMAP.md: maps 100% requirements, success criteria clear
     - DESIGN-SYSTEM.md (if exists): coherent, no conflicts with requirements
     - Cross-check: requirements <-> roadmap <-> project have no conflicts
   - If issues found: fix and re-dispatch (max 3 iterations)
   - If still issues after 3 iterations: surface to user for decision
   - Commit fixes if any

10. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > PROJECT INITIALIZED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   | Artifact       | Location                      |
   |----------------|-------------------------------|
   | Config         | .superteam/config.json        |
   | Project        | .superteam/PROJECT.md         |
   | Research       | .superteam/research/          |
   | Design System  | .superteam/DESIGN-SYSTEM.md   |
   | Requirements   | .superteam/REQUIREMENTS.md    |
   | Roadmap        | .superteam/ROADMAP.md         |

   [N] phases | [X] requirements | Ready to build

   Next: /st:phase-discuss 1
   ```
   - Design System row: only show if DESIGN-SYSTEM.md was created (user chose "Có" in step 6)

## Output Artifacts

```
project/
  .superteam/
    config.json
    PROJECT.md
    DESIGN-SYSTEM.md              [optional — created if user chose "Có" in step 6]
    REQUIREMENTS.md
    ROADMAP.md
    research/
      [dynamic — files depend on selected research areas]
      SUMMARY.md
```

## Rules

- This is an INTERACTIVE command. Never run in auto mode.
- Each step commits separately. Follow `superteam:atomic-commits`.
- PROJECT.md is a living document. Update it whenever conflicts are discovered in later steps.
- Research areas are dynamic — AI selects from catalog based on PROJECT.md context. User approves before spawning.
- Research waves respect dependency order from catalog. Each wave completes before the next starts.
- Each research agent has a strict scope boundary (per research-areas.md). Do NOT let agents cross boundaries.
- Questioning uses 15 exchanges per round with checkpoint summaries. User decides whether to continue.
- Image input accepted at any point in the flow.
- Config is step 1 because research agents need config to run properly.
- Brownfield detection is integrated into init flow (no flow interruption).
