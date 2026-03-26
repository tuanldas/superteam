# Team Roles Catalog

Reference file for `superteam:team-coordination`. Loaded during `/st:team create` to determine team composition.

## When to Load This File

- `/st:team create` → always load
- Other commands → do NOT load (team already assembled)

## Core Roles

Always evaluated. Present unless size-based collapsing applies.

| Role | Agent File | Model | Description | Composes Capabilities From |
|------|-----------|-------|-------------|---------------------------|
| Scrum Master | scrum-master.md | opus | Orchestrate, decompose, assign, remove blockers | planner (decomposition), integration-checker (cross-role deps) |
| Tech Lead | tech-lead.md | opus | Architecture, design decisions, tech choices | planner (design), plan-checker (quality gate), codebase-mapper (analysis) |
| Senior Developer | senior-developer.md | opus | Complex implementation, code review, mentor | executor (opus), reviewer (multi-domain), debugger (escalation) |
| Developer | developer.md | sonnet | Standard implementation, follow plans | executor (sonnet), verifier (light self-check) |
| QA Engineer | qa-engineer.md | sonnet | Test, verify, quality gate | test-auditor (coverage), verifier (goal-backward), integration-checker (regression) |

## Optional Roles

Include when detection signals are present.

| Role | Agent File | Model | Trigger Signal | Detection Method |
|------|-----------|-------|---------------|-----------------|
| UX Designer | ux-designer.md | sonnet | UI framework detected | `frameworks` contains: react, vue, @angular/core, svelte, next, nuxt, remix |
| DevOps Engineer | devops-engineer.md | sonnet | CI/CD config detected | Files exist: `.github/workflows/`, `Dockerfile`, `docker-compose.yml`, `.gitlab-ci.yml`, `Jenkinsfile` |
| Developer 2 | developer.md | sonnet | Large project or monorepo | Source files ≥ 100, or project type = monorepo |

## Team Presets by Project Type

| Project Type | Default Core Roles | Notes |
|---|---|---|
| **frontend** | SM + Dev + QA | No Tech Lead/Senior Dev default (usually simpler architecture) |
| **backend** | SM + TL + SrDev + Dev + QA | Full core — API/service architecture benefits from TL + SrDev |
| **fullstack** | SM + TL + SrDev + Dev + QA | Full core — both frontend + backend complexity |
| **monorepo** | SM + TL + SrDev + Dev + QA | Full core — cross-workspace coordination needs TL |
| **php** | SM + TL + SrDev + Dev + QA | Full core — Laravel multi-module benefits from TL |
| **go** | SM + TL + SrDev + Dev + QA | Full core — microservice architecture |
| **python** | SM + Dev + QA | Simpler architecture, Dev handles tech decisions |
| **rust** | SM + TL + SrDev + Dev + QA | Full core always — ownership/lifetimes/architecture critical |
| **unknown** | SM + Dev + QA | Minimal — not enough context for architecture roles |

## Size-Based Adaptation

Project size is estimated via multi-signal detection (see `core/team.cjs`).

| Size | File Count | Adaptation |
|------|-----------|------------|
| **Small** | < 20 source files | Collapse Tech Lead + Senior Dev → Developer (opus model). Result: SM + Dev(opus) + Dev(sonnet) + QA, or SM + Dev + QA if preset had no TL/SrDev |
| **Medium** | 20–100 source files | No changes. Use preset as-is. |
| **Large** | 100+ source files | Add Dev 2 for parallel work. Consider DevOps if CI/CD present. |

**Greenfield projects** (0 source files): Size estimated from PROJECT.md/ROADMAP.md phase count, or user-specified, or default medium.

## Size Detection Priority

1. **User override** — `--size` flag on `/st:team create`
2. **Config** — `.superteam/config.json` `team.size` field
3. **Project artifacts** — phase/feature/milestone count in PROJECT.md or ROADMAP.md
4. **Source file count** — recursive count excluding node_modules, vendor, dist, etc.
5. **Default** — medium (full core roles)

If user says "don't know" → default medium. Scrum Master can suggest scaling up/down during work.

## Agent Naming Convention

| Role | Agent Name | Multiple |
|------|-----------|----------|
| Scrum Master | `scrum-master` | Never |
| Tech Lead | `tech-lead` | Never |
| Senior Developer | `senior-dev` | Never |
| Developer (first) | `dev` | — |
| Developer (second) | `dev-2` | When large/monorepo |
| QA Engineer | `qa` | Never |
| UX Designer | `ux-designer` | Never |
| DevOps Engineer | `devops-engineer` | Never |

Names are used for `SendMessage(to: "name")` and `TaskUpdate(owner: "name")`.

## User Override

The catalog is a recommendation. User can always:
- Add roles not in the preset
- Remove roles from the recommendation
- Change model for any role (via config `team.model_overrides`)
- Force a specific size (`/st:team create --size large`)

Override happens during the interactive `/st:team create` flow before team is spawned.
