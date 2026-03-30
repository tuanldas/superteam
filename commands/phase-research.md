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

2. **Research (delegate to skill)**
   - Delegate to `superteam:research-methodology` Research Orchestration flow with:
     - `context_inputs`: `.superteam/ROADMAP.md` + `.superteam/PROJECT.md` + `.superteam/phases/[phase-name]/CONTEXT.md` (if exists) + codebase scan
     - `output_dir`: `.superteam/phases/[phase-name]/research/`
     - `research_context`: `"phase [X]: [name]"`
     - `commit_message`: `"docs: research phase [X] - [name]"`
   - If CONTEXT.md does not exist, warn user and recommend `/st:phase-discuss` first, but proceed if user wants

3. **Done**
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

- Research orchestration is owned by `superteam:research-methodology`. This command provides context and delegates.
- If CONTEXT.md exists (from phase-discuss), pass it as part of `context_inputs` for all agents.
- If CONTEXT.md does not exist, warn user and recommend running `/st:phase-discuss` first, but proceed if user wants.
- Follow `superteam:core-principles` for all work.
