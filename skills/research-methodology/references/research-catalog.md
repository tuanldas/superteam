# Research Area Catalog

Reference file for `superteam:research-methodology`. Loaded when planning research areas for init or phase-research.

This catalog defines WHICH areas to research and HOW to group them into waves.
For per-area execution guidance (search strategies, templates, scope boundaries), see `research-areas.md`.

## When to Load This File

- `/st:init` research planning → always load
- `/st:phase-research` planning → always load
- `/st:brainstorm` → do NOT load (no parallel agents)
- `/st:plan` → do NOT load (light depth, no area selection)

## Core Areas

Consider for every project. Evaluate trigger and brownfield conditions.

| Area | Output | Needs | Trigger | Brownfield |
|------|--------|-------|---------|------------|
| STACK | STACK.md | — | Greenfield, or tech decisions needed | SKIP if stack locked. ADJUST to "evaluate gaps/upgrades" if stack flexible. |
| LANDSCAPE | LANDSCAPE.md | — | User-facing product, competitive market | SKIP if product launched and market position established. ADJUST to "evaluate positioning gaps" if pivoting or adding major features. |
| ARCHITECTURE | ARCHITECTURE.md | STACK | Multi-component system, non-trivial architecture | ADJUST to "evaluate existing architecture, identify tech debt, recommend targeted improvements." Use codebase-mapper output as primary input. |
| PITFALLS | PITFALLS.md | STACK, ARCHITECTURE | Complex domain, unfamiliar territory | KEEP. ADJUST to "audit existing patterns + risks in new work." |

## Domain-Specific Areas

Include when relevant. Same trigger/brownfield evaluation.

| Area | Output | Needs | Trigger | Brownfield |
|------|--------|-------|---------|------------|
| SECURITY | SECURITY.md | STACK | User auth, payments, sensitive data, compliance | KEEP. ADJUST to "audit existing + plan new." |
| PERFORMANCE | PERFORMANCE.md | ARCHITECTURE | Real-time, high traffic, data-intensive | ADJUST to "benchmark existing + identify bottlenecks." |
| ACCESSIBILITY | ACCESSIBILITY.md | — | Public-facing web app | ADJUST to "audit existing compliance + plan improvements." |
| DATA | DATA.md | STACK | Complex data model, multiple data sources | ADJUST to "evaluate existing schema + plan migrations." |
| INTEGRATION | INTEGRATION.md | STACK | Multiple external API dependencies | ADJUST to "audit existing integrations + plan new." |

## Custom Areas

AI may propose custom areas when project context demands research not covered by the catalog.

**Guardrails:**
- Max 2 custom areas per research session
- Custom areas are NEVER auto-included — always require user confirmation, even with `config.research_auto_approve: true`
- Each custom area MUST include justification in the research plan
- Total areas (catalog + custom) MUST NOT exceed 8
- YAGNI: when in doubt, don't propose custom areas

Custom area format:
```
[CUSTOM] AREA_NAME:
  desc: [what this area covers]
  output: [name].md
  needs: [dependencies from catalog or other custom areas]
  justification: [why this area is needed, citing PROJECT.md or phase context]
```

## Area Selection Protocol

1. Read context: PROJECT.md (init) or phase description + CONTEXT.md (phase-research)
2. Determine greenfield/brownfield status
3. For each catalog area:
   - Evaluate trigger condition against project context
   - If brownfield: apply brownfield condition (SKIP, ADJUST, or KEEP)
   - Record decision: INCLUDE (with focus adjustment if brownfield) or SKIP (with reason)
4. If custom areas seem needed: propose with justification, ask user to confirm
5. Compile final area list

## Wave Assignment

Group selected areas into waves using dependency graph:

```
for each area in selected_areas:
  if area.needs is empty or all needs are skipped:
    area.wave = 1
  else:
    area.wave = max(wave[dep] for dep in area.needs if dep is selected) + 1
```

Present wave structure to user before spawning.

## Agent Limits

- Max 5 research agents per wave (read-only agents)
- If more than 5 areas in one wave: split into sub-waves
- Total areas (catalog + custom) MUST NOT exceed 8
