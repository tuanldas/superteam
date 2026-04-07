---
description: "Initialize project: config, auto-detect, deep questioning, research, design system, requirements, roadmap"
---

# Project Initialization

Full project setup: configure preferences, auto-detect tech stack, deep questioning to understand the project, research domain, define design system, define requirements, create roadmap.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Configure preferences**
   - Ask each preference ONE AT A TIME, adaptive. Follow `core-principles/references/questioning.md` rules.
   - Preferences to cover (order and phrasing adapt based on answers):
     - Granularity preference (coarse / standard / fine)
     - Parallelization (parallel / sequential)
     - Git tracking for planning docs (yes / no)
     - AI models for agents (if applicable)
     - Research confirmation (confirm / auto-approve) — default: confirm
   - Each question includes AI recommendation + reasoning.
   - If a previous answer makes a preference obvious, skip it or set default with explanation.
   - Write `.superteam/config.json`
   - Commit: `chore: add project config`
   - Follow `superteam:atomic-commits`

2. **Setup + Auto-detect**
   - Check if `.superteam/` already exists
     - Exists: ask "Project already initialized. Re-init?"
     - Not exists: continue
   - Check git, init if needed
   - **Setup .gitignore** — append superteam patterns to root `.gitignore` (create if not exists). Only add patterns not already present:
     ```
     # Superteam generated files
     .superteam/preview/
     .superteam/.plugin-version
     .playwright-mcp/
     ```
   - Auto-detect by scanning file markers:
     - package.json, composer.json, go.mod, Dockerfile, tsconfig.json,
       vite.config.*, next.config.*, Cargo.toml, pyproject.toml, etc.
     - Detect: project type, frameworks, workspaces
     - Detect: brownfield vs greenfield
   - If brownfield: spawn codebase-mapper agent within init flow
     - Mapping results become context for questioning
   - Present detection results (display only, no confirmation yet)

3. **Deep questioning (loop)**
   - Start open-ended: "What are you building?" — plain text question, NO choices/options in AskUserQuestion. Let user describe freely.
   - Do NOT categorize (Web app, Mobile, API, etc.) — let user tell you in their own words.
   - Follow up based on answers. Accept image input anytime (wireframe, whiteboard, architecture diagram).
   - Maintain an internal coverage checklist (do NOT show to user):
     - WHO: Who are the users, usage context
     - WHAT: Core problem / pain point
     - SCOPE: Features, dependencies, effort signals, assumptions
     - EXIST: What exists already, technical constraints
     - DONE: What does "done" look like? Success criteria
   - Each area needs at least 1 specific answer to check off.
   - Make detection-aware suggestions:
     - Suggest things user hasn't thought about based on detection
     - Example: "You mentioned API but haven't discussed auth."
     - Example: "I see React but no test setup."
   - Questioning techniques:
     - Follow `core-principles/references/questioning.md` — ONE question per message, adaptive
     - Follow the thread, do NOT follow a script
     - Challenge vagueness: what does "good" mean? who are "users"?
     - Make abstract concrete: "Walk me through using this"
     - 4 question types: Motivation, Concreteness, Clarification, Success
     - NEVER: checklist walking, canned questions, interrogation, rushing, shallow acceptance, premature constraints, multiple questions in one message
   - Checkpoint after 15 exchanges (or >= 4/5 areas covered):
     - Present SCOPE SUMMARY (full format, 10 sections):
       1. WHAT WE KNOW — WHO, WHAT, EXIST, DONE, CONSTRAINTS from answers
       2. PROJECT OVERVIEW — narrative (2-3 sentences) + functional areas table (effort S/M/L/XL) + user roles table
       3. CORE USER JOURNEY — end-to-end flow + minimum complete path
       4. FEATURE MAP — dependency tree (what requires what)
       5. EFFORT + TINH CHAT — each feature: effort + Foundational/Additive
       6. RISKIEST ASSUMPTIONS — per feature: assumption + status (Validated/Unvalidated/Unknown). Features on Unknown → v2+.
       7. SCOPE RECOMMENDATION — MoSCoW (Must/Should/Could) with AI reasoning. Confidence: Med/Low.
       8. V1 SUCCESS SIGNAL — one observable user behavior that proves v1 works. Gut-check: every Must traces to this moment.
       9. WHAT V1 DELIBERATELY IGNORES — each excluded feature: why OK, risk if included, trigger to add later. Replaces flat "Won't" list.
       10. TRADEOFFS — key decisions with AI recommendation
     - End with: "Adjust scope nao truoc khi tiep tuc?"
     - User adjusts: move features between tiers, challenge assumptions, refine success signal
     - User approves: scope decisions saved to PROJECT.md with note "Preliminary scope — se refine sau research"
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
   - Spawn research-orchestrator agent with:
     - `context_inputs`: `.superteam/PROJECT.md` + codebase mapping (if brownfield)
     - `output_dir`: `.superteam/research/`
     - `research_context`: `"init"`
     - `commit_message`: `"docs: complete research"`
   - Research output = tài liệu tham khảo. KHÔNG auto-apply bất kỳ quyết định nào.
   - If conflicts with PROJECT.md found during research: flag cho step 5.5, KHÔNG tự update.

5.5. **Architectural Decision Review**
   - Mục đích: Tách rõ **findings** (auto-save) vs **decisions** (cần user confirm).
   - Đọc SUMMARY.md + tất cả research output files.
   - Trích xuất mọi **quyết định kiến trúc/tech** mà research agents recommend. Ví dụ:
     - Project structure (monorepo vs single-repo vs polyrepo)
     - Tech stack (framework, ORM, database, hosting, payment gateway)
     - Architecture patterns (API style, state management, auth approach)
   - Present TỪNG quyết định cho user dưới dạng choice (2-3 options), tương tự design system dimensions:
     ```
     ──────────────────────────────────────────────
      ARCHITECTURAL DECISIONS (from research)
     ──────────────────────────────────────────────
      Decision 1/N: Project Structure
      Research recommends: Turborepo monorepo — [lý do tóm tắt]

      Options:
        1. Turborepo monorepo (apps/web + packages/db + packages/api)
        2. Single Next.js app (tất cả trong 1 project)
        3. Other — describe

      AI recommendation: [option] — [why]. Confidence: High/Med/Low.
     ──────────────────────────────────────────────
     ```
   - User chọn từng decision → ghi vào `.superteam/decisions.json`
   - Nếu research có conflict với PROJECT.md: present conflict + options cho user.
   - Sau khi tất cả decisions confirmed → update PROJECT.md tech stack section.
   - Commit: `docs: confirm architectural decisions`
   - **Rule:** Roadmap (step 8) và Requirements (step 7) chỉ được reference tech/architecture đã confirmed ở step này.

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

   **6.2. Propose each dimension one at a time**
   - **ONE dimension per message. Wait for user response before proposing the next.**
   - **NEVER batch multiple dimensions into one message. NEVER present a "full proposal" upfront.**
     This is the user's chance to choose fonts, colors, spacing etc. according to their taste.
     Skipping this interaction removes their agency over the design.
   - Order: AESTHETIC → DECORATION → TYPOGRAPHY → COLOR → SPACING → LAYOUT → MOTION

   **VISUAL-FIRST REQUIRED for EVERY dimension proposal:**
   Read `core-principles/references/visual-first.md` before proposing the first dimension.
   For EACH dimension, follow this sequence (NOT text-only):
     ```
     1. Create HTML at .superteam/preview/<dimension>.html showing 2-4 options as side-by-side visual cards
     2. Serve: python3 -m http.server [port] -d .superteam/preview
     3. browser_navigate → browser_take_screenshot
     4. Present screenshot + text labels + recommendation:
        [DIMENSION]: Recommend [option] — [why]. Confidence: High/Med/Low.
     5. Ask: "Which do you prefer?" → user sees options visually BEFORE choosing
     ```
   Text-only proposals for design dimensions = VIOLATION. "Clean & Minimal" means nothing until the user SEES it rendered.
   If Playwright unavailable: provide URL for manual viewing + flag reduced confidence.
   - If user approves → next dimension
   - If user adjusts → drill-down inline (1 focused question: fonts: 3-5 candidates, colors: 2-3 palette options)
   - Coherence check after each dimension vs previously approved dimensions:
     - Mismatch → nudge once, explain why unusual, offer alternative
     - Always accept user decision, never block, never ask again
   - Adaptive: if user's answer on one dimension already implies another → skip or pre-fill with confirmation
   - After each dimension approved → record in `.superteam/decisions.json` (follow `core-principles/references/decision-continuity.md`)
   - If init research has landscape data → use to inform each recommendation
   - If not → use built-in design knowledge
   - Apply full font rules (blacklist, overused warnings) and AI slop anti-patterns from `/st:design-system`

   **6.3. Full summary + Preview**
   - Summary and preview MUST use approved values from DECISIONS block verbatim — do NOT re-generate or re-propose
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
   - Start over → return to 6.2 from AESTHETIC
   - Playwright preview if available:
     - Generate self-contained HTML preview page
     - Load approved fonts, apply approved color palette
     - Realistic mockups by project type (dashboard/marketing/admin)
     - Light/dark mode toggle, responsive
     - User feedback → adjust → regenerate loop
   - Playwright unavailable → skip preview, text-based only

   **6.4. Save and commit**
   - Cross-check: DESIGN-SYSTEM.md content MUST match DECISIONS block values
   - Save `.superteam/DESIGN-SYSTEM.md`
   - Follow `superteam:atomic-commits`
   - Commit: `design: create design system for [project]`

7. **Define requirements (scope refine + generate)**
   - Load new context: research findings + confirmed decisions (step 5.5) + DESIGN-SYSTEM.md (if exists) + PROJECT.md
   - Tech/architecture references in requirements MUST match confirmed decisions from step 5.5. Do NOT introduce tech choices that user hasn't confirmed.
   - Present SCOPE DIFF — only changes vs step 3:
     - Features changed tier (e.g., "Comment: SHOULD → MUST because research showed...")
     - Assumptions updated status (e.g., "⚠️ → ✅ research confirmed")
     - New risks from research
     - Effort adjusted (e.g., "Real-time sync: [L] → [XL] because tech stack X")
     - Success signal refined if needed
     - Confidence: High/Med
   - If no changes from research: state "Research confirmed step 3 scope. No changes."
   - User confirm/adjust → finalize scope
   - Generate `REQUIREMENTS.md` with REQ-IDs format: `[CATEGORY]-[NUMBER]`
     - Each Must/Should feature becomes a REQ-ID
     - Could/Won't features listed in "Deferred" section with reasoning
   - Present full list to user for approval
   - If conflicts with PROJECT.md: update PROJECT.md
   - Save to `.superteam/REQUIREMENTS.md`
   - Commit: `docs: define v1 requirements`

8. **Create roadmap**
   - Spawn roadmapper agent
   - Input: PROJECT.md + REQUIREMENTS.md + SUMMARY.md + DESIGN-SYSTEM.md (if exists) + confirmed decisions (step 5.5) + config
   - Phase names and descriptions MUST use confirmed tech/architecture from step 5.5 — not raw research recommendations.
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
     - Cross-check: requirements <→ roadmap <→ project have no conflicts
   - If issues found: fix and re-dispatch (max 3 iterations)
   - If still issues after 3 iterations: surface to user for decision
   - Commit fixes if any

10. **Generate CLAUDE.md**
   - Check if `CLAUDE.md` already exists at project root
     - **Not exists:** generate and save automatically
     - **Exists:** ask "CLAUDE.md đã tồn tại. Bạn muốn tái cấu trúc không?"
       - No → skip, keep existing CLAUDE.md
       - Yes → ask "Ghi đè hoàn toàn hay merge (giữ rules/gotchas cũ, cập nhật sections auto-generate)?"
         - **Overwrite:** generate new CLAUDE.md, replace old entirely
         - **Merge:** read existing CLAUDE.md, preserve custom sections (Gotchas, custom rules user wrote manually), regenerate auto-detectable sections (Commands, Architecture, Key Files, Code Style, Testing)
   - **Data sources for generation:**
     - Detection results (type, frameworks, workspaces) from step 2
     - PROJECT.md (project name, description) from step 4
     - `decisions.json` (tech stack, architecture decisions) from step 5.5
     - DESIGN-SYSTEM.md (if exists) from step 6
     - Manifest files (scripts → commands, test runner) from step 2
     - Directory scan (architecture tree, key files)
   - **Template — Comprehensive format:**
     ```markdown
     # {Project Name}

     {1-line description from PROJECT.md}

     ## Commands

     | Command | Description |
     |---------|-------------|
     | `{from manifest scripts}` | {description} |

     ## Architecture

     ```
     {project tree with purpose annotations, from directory scan}
     ```

     ## Key Files

     - `{entry points, configs}` — {purpose}

     ## Code Style

     - {language/framework conventions from detection + decisions}

     ## Testing

     - `{test command}` — {test runner from manifest}

     ## Gotchas

     - {framework-specific known gotchas from detection}
     - {key decisions from decisions.json that affect daily work}
     ```
   - Commit: `docs: generate CLAUDE.md`

11. **Done**
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
   | CLAUDE.md      | ./CLAUDE.md                   |

   [N] phases | [X] requirements | Ready to build

   Next: /st:phase-discuss 1
   ```
   - Design System row: only show if DESIGN-SYSTEM.md was created (user chose "Có" in step 6)
   - CLAUDE.md row: only show if CLAUDE.md was generated or updated in step 10

## Output Artifacts

```
project/
  CLAUDE.md                       [auto-generated from all gathered data in step 10]
  .superteam/
    config.json
    decisions.json                [architectural decisions confirmed by user in step 5.5]
    PROJECT.md
    DESIGN-SYSTEM.md              [optional — created if user chose "Có" in step 6]
    REQUIREMENTS.md
    ROADMAP.md
    research/
      RESEARCH-PLAN.md
      [dynamic — files depend on selected research areas]
      SUMMARY.md
```

## Rules

- This is an INTERACTIVE command. Never run in auto mode.
- Each step commits separately. Follow `superteam:atomic-commits`.
- PROJECT.md is a living document. Update it whenever conflicts are discovered in later steps.
- Research orchestration is owned by research-orchestrator agent (which follows `superteam:research-methodology`). Step 5 provides context and spawns the agent.
- Questioning uses 15 exchanges per round with checkpoint summaries. User decides whether to continue.
- Image input accepted at any point in the flow.
- Config is step 1 because research agents need config to run properly.
- Brownfield detection is integrated into init flow (no flow interruption).
- Follow `superteam:core-principles`. Load references: visual-first, questioning, decision-continuity.
