---
description: "Discuss a roadmap phase: clarify HOW (approach, assumptions, edge cases, risks) before planning"
argument-hint: "[phase number or name]"
---

# Phase Discuss

Clarify the HOW for a phase already defined in the roadmap. The phase already has WHAT (name, REQ-IDs, success criteria). This command clarifies: approach, assumptions, edge cases, risks, constraints. Output: CONTEXT.md that feeds into phase-research and phase-plan.

**Not brainstorm:** Brainstorm explores WHAT (vague idea to spec). Discuss clarifies HOW (existing phase to context for planning).

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Check context**
   - ROADMAP.md must exist. If not, stop: "No ROADMAP.md found. Run /st:plan-roadmap first."
   - Parse phase from argument: match by number or name
   - If no argument: list all phases with status, ask user to pick one
   - Parse phase details: number, name, REQ-IDs, success criteria
   - Check phase status:
     - completed: "This phase is already completed. Still want to discuss?"
     - in-progress: "This phase is in progress. Discuss to review approach?"
     - planned: proceed normally
   - Load: PROJECT.md, REQUIREMENTS.md, codebase context
   - Use `superteam:project-awareness` for codebase scanning

2. **Synthesize context**
   - Read: phase info + requirements + codebase + PROJECT.md
   - Present understanding:
     ```
     PHASE CONTEXT
     Phase [X]: [name]

     Goal: [AI summary]
     Requirements:
       REQ-xxx: [description]
       REQ-xxx: [description]

     Success criteria:
       1. [criterion]
       2. [criterion]

     Related codebase:
       - [relevant files/dirs]

     Proposed approach: [AI suggestion]

     Assumptions:
       1. [assumption]
       2. [assumption]

     Gray areas:
       1. [unclear point]
       2. [unclear point]
     ```
   - Wait for user: confirm / correct / add

3. **Ask gray areas** (if any exist)
   - Ask each question individually, prefer multiple choice
   - AI recommends an option with reasoning
   - Focus on: approach, edge cases, constraints, risks
   - Typically 2-5 questions

4. **Synthesize decisions**
   - Compile all context + answers:
     ```
     DECISIONS
     Approach: [chosen]
     Key decisions:
       1. [decision + rationale]
       2. [decision + rationale]
     Risks identified:
       1. [risk + mitigation]
     Constraints:
       1. [constraint]
     Out of scope:
       1. [exclusion]
     ```
   - Wait for user confirmation

5. **Write CONTEXT.md**
   - Create directory: `.superteam/phases/[phase-name]/`
   - Save to: `.superteam/phases/[phase-name]/CONTEXT.md`
   - Content: phase info + approach + decisions + risks + constraints
   - Follow `superteam:atomic-commits`
   - Commit: `docs: discuss phase [X] - [name]`

6. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > PHASE DISCUSSED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Phase [X]: [name]
   Decisions: [N] | Risks: [M]
   Context: .superteam/phases/[name]/CONTEXT.md
   > "/st:phase-research [X]" to research before planning
   > "/st:phase-plan [X]" to create plan directly
   ```

## Rules

- Scope is ONE specific phase. Do NOT spread into other phases.
- Phase MUST exist in ROADMAP.md. If not found, stop and report.
- Hybrid approach: AI synthesizes context first, THEN asks gray areas. Do not just dump questions.
- Always recommend an option when asking questions, with reasoning.
- CONTEXT.md is lightweight — decisions and constraints, not a novel.
- Suggest next step but let user decide (research or plan).
- Per-phase directory: `.superteam/phases/[phase-name]/` holds all phase artifacts.
- Follow `superteam:core-principles` for all work.
