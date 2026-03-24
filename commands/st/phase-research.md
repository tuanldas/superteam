---
description: "Deep research for a roadmap phase: spawn 4 parallel researcher agents covering stack, architecture, pitfalls, landscape"
argument-hint: "[phase number or name]"
---

# Phase Research

Deep research for a roadmap phase using parallel agents + web search + codebase scan. Spawn 4 researcher agents in parallel, each covering one aspect (Stack, Architecture, Pitfalls, Landscape). Synthesize into SUMMARY.md. Feeds into phase-plan.

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

2. **Prepare research scope**
   - Compile input for agents:
     - Phase description + REQ-IDs + success criteria
     - CONTEXT.md decisions (if available)
     - Codebase tech stack + patterns
     - Constraints from PROJECT.md
   - Present scope:
     ```
     RESEARCH SCOPE
     Phase [X]: [name]
     Focus areas:
       1. Stack: [tech options to explore]
       2. Architecture: [patterns needed]
       3. Pitfalls: [risk areas]
       4. Landscape: [domains to scan]

     Context: CONTEXT.md [available/not available]
     Start research?
     ```
   - Wait for user: approve or adjust focus areas

3. **Wave 1: Spawn Stack + Landscape agents** (parallel, background)
   - Follow `superteam:research-methodology` at Deep depth
   - Each agent receives: phase context, CONTEXT.md decisions, codebase info, specific focus area
   - Wave 1 agents (independent, no cross-dependency):
     | Agent | Output File | Focus |
     |-------|------------|-------|
     | Stack | STACK.md | Tech, libs, tools suited for the phase. Compare options, recommend. |
     | Landscape | LANDSCAPE.md | Existing solutions, industry patterns, reference implementations. |

   **CRITICAL — While-Waiting Protocol (from `superteam:wave-parallelism`):**
   After dispatching Wave 1 agents, do NOT go silent AND do NOT skip ahead:
   - Show estimated time: "Wave 1 running (typically 3-7 min). ctrl+o to see agent details."
   - Do visible prep work while waiting:
     a. Scan codebase deeper: count files, identify key modules, detect patterns
     b. Report findings: "Found [N] source files across [M] directories. Key modules: [list]"
     c. Pre-read files that Wave 2 agents will need
     d. Prepare Wave 2 context: "Preparing Architecture + Pitfalls context for Wave 2..."
     e. Show progress when an agent completes: "✓ STACK.md complete! Waiting for LANDSCAPE.md..."
   - NEVER leave the user with silence. If prep work finishes before agents, show a waiting indicator with elapsed time.

   **MANDATORY WAIT GATE:** Do NOT proceed to Wave 2 until BOTH Wave 1 agents have completed AND you have READ their output files (STACK.md, LANDSCAPE.md). Your own knowledge is NOT a substitute for agent research output.

4. **Wave 2: Spawn Architecture + Pitfalls agents** (parallel, background)
   - Run AFTER Wave 1 completes (Wave 2 depends on Stack findings)
   - Wave 2 agents:
     | Agent | Output File | Focus |
     |-------|------------|-------|
     | Architecture | ARCHITECTURE.md | Code organization, patterns, file structure, data flow. |
     | Pitfalls | PITFALLS.md | Common problems, anti-patterns, edge cases, security risks. |
   - Apply same While-Waiting Protocol: show Wave 1 summary, preview key findings while Wave 2 runs
   - **MANDATORY WAIT GATE:** Do NOT proceed to Synthesize until BOTH Wave 2 agents have completed AND you have READ their output files (ARCHITECTURE.md, PITFALLS.md).

5. **Synthesize**
   - After all 4 agents complete, spawn synthesizer agent:
     - Read all 4 output files
     - Compile key findings
     - Identify conflicts between recommendations
     - Write SUMMARY.md

6. **Present findings**
   ```
   RESEARCH SUMMARY
   Stack: [key recommendation]
   Architecture: [key pattern]
   Pitfalls: [top risks]
   Landscape: [relevant solutions]

   Key recommendations:
     1. [recommendation]
     2. [recommendation]

   Conflicts found:
     [if any: describe + suggest resolution]
   ```
   - Wait for user review, answer follow-up questions if needed

7. **Save and commit**
   - Save files to: `.superteam/phases/[phase-name]/research/`
     - STACK.md
     - ARCHITECTURE.md
     - PITFALLS.md
     - LANDSCAPE.md
     - SUMMARY.md
   - Follow `superteam:atomic-commits`
   - Commit: `docs: research phase [X] - [name]`

8. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > PHASE RESEARCHED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Phase [X]: [name]
   Files: 5 (STACK, ARCHITECTURE, PITFALLS, LANDSCAPE, SUMMARY)
   Path: .superteam/phases/[name]/research/
   > "/st:phase-plan [X]" to create the plan
   ```

## Rules

- Always spawn exactly 4 researcher agents covering: Stack, Architecture, Pitfalls, Landscape.
- Agents MUST run in parallel for efficiency.
- Synthesizer agent runs AFTER all 4 complete — never before.
- If CONTEXT.md exists (from phase-discuss), use it as primary input for all agents.
- If CONTEXT.md does not exist, warn user and recommend running `/st:phase-discuss` first, but proceed if user wants.
- Research files go in `research/` subdirectory within the phase directory.
- Present summary to user BEFORE committing — allow follow-up questions.
- Each output file should be focused and actionable, not just a knowledge dump.
