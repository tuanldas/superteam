# Dynamic Research Waves

**Date:** 2026-03-25
**Status:** Approved
**Scope:** `commands/init.md`, `commands/phase-research.md`, `skills/research-methodology/`, `core/config.cjs`

## Problem

The init and phase-research commands hardcode exactly 2 waves with 4 fixed research areas (STACK, LANDSCAPE, ARCHITECTURE, PITFALLS). This is rigid:
- Internal tools don't need LANDSCAPE research
- Brownfield projects don't need STACK research (tech stack already locked)
- Some projects need SECURITY as mandatory, not optional
- The dependency graph between areas isn't always the same

## Solution

Replace hardcoded research structure with dynamic planning:
1. AI analyzes project context (PROJECT.md or phase context)
2. Selects relevant areas from a guided catalog
3. Groups into waves using dependency analysis
4. Presents research plan for user approval
5. Executes waves with foreground parallel spawning

## Research Area Catalog

Stored at `skills/research-methodology/research-catalog.md`.

### Core Areas

| Area | Output | Needs | Trigger | Brownfield |
|------|--------|-------|---------|------------|
| STACK | STACK.md | — | Greenfield, or tech decisions needed | SKIP if stack locked. ADJUST to "evaluate gaps/upgrades" if flexible. |
| LANDSCAPE | LANDSCAPE.md | — | User-facing product, competitive market | SKIP if product launched. ADJUST to "evaluate positioning gaps" if pivoting. |
| ARCHITECTURE | ARCHITECTURE.md | STACK | Multi-component system, non-trivial architecture | ADJUST to "evaluate existing, identify tech debt, recommend improvements." |
| PITFALLS | PITFALLS.md | STACK, ARCHITECTURE | Complex domain, unfamiliar territory | KEEP. ADJUST to "audit existing patterns + risks in new work." |

### Domain-Specific Areas

| Area | Output | Needs | Trigger | Brownfield |
|------|--------|-------|---------|------------|
| SECURITY | SECURITY.md | STACK | User auth, payments, sensitive data, compliance | KEEP. ADJUST to "audit existing + plan new." |
| PERFORMANCE | PERFORMANCE.md | ARCHITECTURE | Real-time, high traffic, data-intensive | ADJUST to "benchmark existing + identify bottlenecks." |
| ACCESSIBILITY | ACCESSIBILITY.md | — | Public-facing web app | ADJUST to "audit existing compliance + plan improvements." |
| DATA | DATA.md | STACK | Complex data model, multiple data sources | ADJUST to "evaluate existing schema + plan migrations." |
| INTEGRATION | INTEGRATION.md | STACK | Multiple external API dependencies | ADJUST to "audit existing integrations + plan new." |

### Custom Areas

AI may propose custom areas not in the catalog.

**Guardrails:**
- Max 2 custom areas per research session
- Custom areas are NEVER auto-included — always require user confirmation, even with `research_auto_approve: true`
- Each custom area MUST include justification
- Total areas (catalog + custom) MUST NOT exceed 8
- YAGNI: when in doubt, don't propose custom areas

## Research Planning Flow

### Step 1 — Select research areas

- Read context: PROJECT.md (init) or ROADMAP.md phase + CONTEXT.md (phase-research)
- Load catalog from `superteam:research-methodology` → `research-catalog.md`
- For each catalog area: evaluate trigger AND brownfield conditions
  - Greenfield: include if trigger matches
  - Brownfield: SKIP, ADJUST, or KEEP per catalog definition
- If custom areas seem needed: propose separately with justification, ask user to confirm

### Step 2 — Build research plan and confirm

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
- If `config.research_auto_approve` is true: display and proceed immediately
  (EXCEPT: custom areas always pause for user confirmation)
- If false (default): wait for user to approve, adjust, or skip

### Step 3 — Execute waves

- For each wave: make ALL Agent() calls in a SINGLE message (foreground parallel with tree view)
- Each agent receives: project context, prior wave outputs, specific focus area
- Each agent follows `superteam:research-methodology` at Deep depth
- **MANDATORY WAIT GATE** per wave: do NOT proceed until ALL agents completed AND output files READ
- After all waves: synthesize into SUMMARY.md

## Wave Assignment Algorithm

```
for each area in selected_areas:
  if area.needs is empty or all needs are skipped:
    area.wave = 1
  else:
    area.wave = max(wave[dep] for dep in area.needs if dep is selected) + 1
```

## Config Addition

New field in `.superteam/config.json`:

```json
{
  "research_auto_approve": false
}
```

- `false` (default): show research plan, wait for user approval
- `true`: show research plan (for transparency), proceed immediately. Custom areas still require confirmation.

## Files Changed

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `skills/research-methodology/research-catalog.md` | NEW | Catalog: 9 areas + custom, dependencies, triggers, brownfield, guardrails |
| 2 | `skills/research-methodology/SKILL.md` | EDIT | Add catalog to context budget table |
| 3 | `commands/init.md` section 5 | REWRITE | Hardcoded 2 waves → 3-step dynamic flow |
| 4 | `commands/init.md` step 1 | EDIT | Add research confirmation preference |
| 5 | `commands/init.md` artifacts + rules | EDIT | Dynamic file list, update rules |
| 6 | `commands/phase-research.md` steps 2-4 | REWRITE | Hardcoded 2 waves → dynamic flow |
| 7 | `commands/phase-research.md` rules | EDIT | Update rules for dynamic |
| 8 | `core/config.cjs` | EDIT | Add `research_auto_approve: false` default + validation |

## Examples

### Example 1: Greenfield SaaS Product

```
RESEARCH PLAN
Based on PROJECT.md analysis:

Wave 1 (parallel, 2 agents):
  ├─ STACK: React vs Vue vs Svelte for SPA dashboard
  └─ LANDSCAPE: competitor dashboard products

Wave 2 (parallel, needs Wave 1, 2 agents):
  ├─ ARCHITECTURE: component structure, state management, API design
  └─ SECURITY: OAuth2, RBAC, data encryption

Wave 3 (needs Wave 2, 1 agent):
  └─ PITFALLS: SPA + auth anti-patterns, common dashboard mistakes

Total: 5 agents, 3 waves
```

### Example 2: Brownfield Internal Tool

```
RESEARCH PLAN
Based on PROJECT.md analysis (brownfield):

Wave 1 (parallel, 1 agent):
  └─ ARCHITECTURE: evaluate existing Express API, identify tech debt in auth module

(STACK skipped: tech stack locked — Express + PostgreSQL)
(LANDSCAPE skipped: internal tool, no competitive market)

Total: 1 agent, 1 wave
```

### Example 3: Greenfield with Custom Area

```
AI proposes custom area:
  "PROJECT.md mentions EU users and GDPR compliance.
   I'd like to add a custom research area:
   - COMPLIANCE: GDPR data handling, consent management, data residency
   Include this? [yes/no]"

→ User confirms → included in plan as Wave 2 alongside SECURITY
```
