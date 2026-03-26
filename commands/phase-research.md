---
description: "Deep research for a roadmap phase: dynamic research areas from catalog, parallel agents in dependency-based waves"
argument-hint: "[phase number or name]"
---

# Phase Research

Deep research for a roadmap phase using parallel agents + web search + codebase scan. Select research areas dynamically from catalog, group into dependency-based waves, spawn parallel agents per wave. Synthesize into SUMMARY.md. Feeds into phase-plan.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - ROADMAP.md must exist. If not, stop: "No ROADMAP.md found."
   - Parse phase from argument: match by number or name
   - If no argument: list planned/in-progress phases, ask user to pick
   - Parse phase details: number, name, REQ-IDs, success criteria
   - Check phase status:
     - completed: "This phase is already completed. Still want to research?"
     - in-progress/planned: proceed normally
   - Load: CONTEXT.md from phase-discuss (if exists), PROJECT.md
   - Scan codebase: related files, tech stack, patterns
   - Use `superteam:project-awareness` for codebase context

2. **Select research areas**
   - Load research area catalog (`superteam:research-methodology` → `research-catalog.md`)
   - Evaluate each area's trigger and brownfield conditions against phase context:
     - Phase description + REQ-IDs + success criteria
     - CONTEXT.md decisions (if available from phase-discuss)
     - Codebase tech stack + patterns
     - Constraints from PROJECT.md
   - If custom areas needed: propose with justification, ask user to confirm

3. **Build research plan and confirm**
   - Build dependency graph from selected areas' `needs` fields
   - Group into waves: `wave = max(wave[deps]) + 1`
   - Present research plan:
     ```
     RESEARCH PLAN — Phase [X]: [name]

     Wave [N] (parallel, [M] agents):
       ├─ [AREA]: [focus description]
       └─ [AREA]: [focus description]
     ...
     Total: [X] agents, [Y] waves
     Context: CONTEXT.md [available/not available]
     Adjust areas or proceed?
     ```
   - If `config.research_auto_approve` is true: display and proceed
     (EXCEPT: custom areas always pause for confirmation)
   - If false (default): wait for user to approve, adjust, or cancel

4. **Execute waves**
   - For each wave: make ALL Agent() calls in a SINGLE message (foreground parallel with tree view)
   - Each agent receives: phase context, CONTEXT.md decisions, prior wave outputs, specific focus area
   - Each agent follows `superteam:research-methodology` at Deep depth
   - **MANDATORY WAIT GATE** per wave: do NOT proceed until ALL agents completed
     AND you have READ their output files

5. **Synthesize**
   - After all waves complete, spawn synthesizer agent:
     - Read all output files from all waves
     - Compile key findings
     - Identify conflicts between recommendations
     - Write SUMMARY.md

6. **Present findings**
   ```
   RESEARCH SUMMARY
   Areas researched: [list of areas]

   Key recommendations:
     1. [recommendation]
     2. [recommendation]

   Conflicts found:
     [if any: describe + suggest resolution]
   ```
   - Wait for user review, answer follow-up questions if needed

7. **Save and commit**
   - Save files to: `.superteam/phases/[phase-name]/research/`
     - [dynamic — one file per selected research area]
     - SUMMARY.md
   - Follow `superteam:atomic-commits`
   - Commit: `docs: research phase [X] - [name]`

8. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > PHASE RESEARCHED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Phase [X]: [name]
   Areas: [N] ([list]) + SUMMARY
   Path: .superteam/phases/[name]/research/
   > "/st:phase-plan [X]" to create the plan
   ```

## Rules

- Follow `superteam:questioning` for all user interactions.
- Research areas are dynamic — AI selects from catalog based on phase context. User approves before spawning.
- Agents MUST run in parallel within each wave for efficiency.
- Synthesizer agent runs AFTER all waves complete — never before.
- If CONTEXT.md exists (from phase-discuss), use it as primary input for all agents.
- If CONTEXT.md does not exist, warn user and recommend running `/st:phase-discuss` first, but proceed if user wants.
- Research files go in `research/` subdirectory within the phase directory.
- Present summary to user BEFORE committing — allow follow-up questions.
- Each output file should be focused and actionable, not just a knowledge dump.
