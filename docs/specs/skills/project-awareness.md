# Skill Spec: project-awareness

> Status: DRAFT v2 | Created: 2026-03-23 | Revised: 2026-03-23 (TCG review)

---

## Frontmatter

```yaml
---
name: project-awareness
description: >
  Use when any command needs project context — type, frameworks,
  workspaces, or config preferences. Provides adaptation principles
  per project type and monorepo scope resolution rules.
---
```

---

## SKILL.md Content

````markdown
---
name: project-awareness
description: >
  Use when any command needs project context — type, frameworks,
  workspaces, or config preferences. Provides adaptation principles
  per project type and monorepo scope resolution rules.
---

# Project Awareness

## Overview

Project Awareness gives every Superteam command accurate knowledge of what project it is operating in. It runs automatically at session start via the `session-start` hook.

**Two responsibilities:**
1. **Inject context** — present detection and config results in a structured block all commands consume.
2. **Adaptation principles** — high-level rules per project type. Commands translate these into specific behavior.

## Core Principle

```
CONTEXT BEFORE ACTION.

Every action must be informed by what this project IS.
When context is missing or uncertain — surface the gap. Never guess.
```

## Context Block Format

Session-start runs `detectProject(cwd)` and `loadConfig(cwd)`, then injects:

```
ST ► PROJECT CONTEXT
─────────────────────────────
Project:     {name}
Type:        {type} (confidence: {confidence})
Frameworks:  {frameworks}
Initialized: {Yes | No — suggest /st:init}

Workspaces:  (monorepo only)
  - {name} ({type}) @ {path} [{frameworks}]

Preferences: (when config exists)
  Branch: {defaultBranch}  Commits: {commitStyle}
  Granularity: {granularity}  Parallel: {on|off}
  Research: {on|off}  Plan check: {on|off}  Verifier: {on|off}
─────────────────────────────
```

**Rules:**
- Always show confidence score — commands use it to decide trust level.
- If no `.superteam/config.json`, omit Preferences and suggest `/st:init`.
- Monorepo workspaces always expanded with individual type and frameworks.
- Compact. Data only, no prose.

## Detection Signals (Summary)

How `detectProject(cwd)` determines type and confidence:

| Signal File/Pattern | Detected Type | Confidence |
|---|---|---|
| `next.config.*`, `nuxt.config.*`, `remix.config.*` | fullstack | 0.9 |
| `package.json` with react/vue/angular (no server framework) | frontend | 0.85 |
| `package.json` with express/fastify/nestjs (no UI framework) | backend | 0.85 |
| `pnpm-workspace.yaml`, `lerna.json`, workspaces in package.json | monorepo | 0.9 |
| `manage.py` + `settings.py` | backend (django) | 0.9 |
| `go.mod` | backend (go) | 0.8 |
| `composer.json` + `artisan` | backend (laravel) | 0.9 |
| `Gemfile` + `config/routes.rb` | backend (rails) | 0.9 |
| `pom.xml` + `@SpringBootApplication` | backend (spring) | 0.9 |
| `Cargo.toml` | backend (rust) | 0.8 |
| react + express detected, no workspace structure | ??? | 0.4 (ask user) |
| No recognizable signals | unknown | 0.1 |

> This table is a summary. Full logic lives in `core/detector.cjs`.
> When detection conflicts with expectations, check this table first.
> Currently supported stacks. More signals will be added as detector expands.

## Adaptation Principles

High-level principles per project type. Commands self-specialize from these.

### Frontend

Detected: type = `frontend`, or frameworks include react, vue, angular, svelte, solid, astro.

- **Component boundaries are the unit of work.** Plan, execute, review, test at component level — not page or feature level.
  - _Example: `/st:plan` creates tasks per component (Header, Sidebar, UserCard), not per page (HomePage, Settings)._
- **Visual output is a deliverable.** Commands touching UI must produce verifiable visual results, not just passing tests.
  - _Example: `/st:execute` for a UI task should include screenshot verification or Storybook check, not just "tests pass"._
- **Design system awareness.** Check for existing design tokens, component libraries, theme config before creating new UI.
  - _Example: `/st:plan` checks for tailwind.config, theme.ts, or design-tokens/ before proposing new color/spacing values._

### Backend

Detected: type = `backend`, or frameworks include express, fastify, nestjs, hono, laravel, django, flask, go.

- **API contract drives planning.** Breaking changes require explicit acknowledgment. Plan and review must flag contract changes.
  - _Example: `/st:plan` flags "⚠ BREAKING: removes `GET /users/:id` response field `legacy_name`" as separate task requiring review._
- **Framework-specific log locations.** Debug commands auto-detect where logs live per framework (e.g., storage/logs for Laravel, stdout for Express).
  - _Example: `/st:debug` for Laravel project checks `storage/logs/laravel.log` first, not stdout._
- **Migration safety.** Any database-touching command must check for pending migrations and warn.
  - _Example: `/st:execute` runs `npx prisma migrate status` (or equivalent) before any DB-related code change._

### Fullstack

Detected: type = `fullstack`, or frameworks include next, nuxt, remix, sveltekit.

- **Both frontend and backend principles apply.** Do not drop either set.
- **Client/server boundary is the critical seam.** Every plan and review must identify what runs where. Server components vs client components, API routes vs page routes.
  - _Example: `/st:plan` for a Next.js feature separates server action tasks from client component tasks explicitly._
- **Cross-boundary impact analysis.** One change can affect both sides. Commands must surface this.
  - _Example: `/st:code-review` flags when an API route change affects a client-side fetch without updating the consumer._
- **When principles conflict, server-side safety takes precedence.** Migrations, API contracts, and data integrity outweigh client-side granularity or visual concerns.

### Monorepo

Detected: type = `monorepo`, or workspaces array has 2+ entries.

- **Scope is always explicit.** Every command must know which workspace(s) it operates on.
- **Each workspace has its own type.** Frontend workspace gets frontend principles, backend gets backend.
- **Cross-workspace impact is first-class.** Changes in shared packages affect all consumers.
- **Root-level operations are distinct.** Root README, root config, root CI differ from workspace-level.

### Unknown

Detected: type = `unknown`, or confidence < 0.5.

- **Do not assume.** Do not apply type-specific behavior.
- **Ask the user.** Present what was detected and ask to clarify.
- **Suggest /st:init.** Interactive questioning resolves ambiguity.
- **Graceful degradation — what commands do without type:**

| Command Category | With type | Without type (unknown) |
|---|---|---|
| `/st:plan` | Type-aware tasks (component-level for frontend, etc.) | Generic file-level tasks. No type-specific grouping. |
| `/st:execute` | Type-specific pre-checks (migrations, design system, etc.) | Code changes only. Skips all pre-checks. |
| `/st:code-review` | Type-specific review criteria applied | Universal criteria only (logic, naming, tests). |
| `/st:debug` | Framework-specific log locations checked | stdout/stderr only. Asks user for log location. |
| `/st:api-docs` | Auto-detects API framework conventions | Asks user for API entry points. |

## Monorepo Scope Resolution

```
SCOPE RESOLUTION:
  1. Has workspace argument?  → use specified workspace
  2. cwd inside a workspace?  → use cwd workspace
  3. Root-level command?       → use root scope
  4. Otherwise                 → present workspace list, user selects
```

**Priority:** explicit argument > cwd detection > ask user.

When scoped to one workspace, still surface cross-workspace impact:
```
⚠ This change affects {workspace} but shared package {pkg}
  is also used by {other_workspaces}. Consider cross-workspace tests.
```

**Warning display rules:**
- 1-3 affected workspaces: list all by name.
- 4+ affected workspaces: collapse to "`{pkg}` is used by {N} other workspaces. Run `/st:plan --scope=all` to see full impact."
- If the changed file is in a workspace's internal directory (not a shared package): suppress cross-workspace warning.

## Confidence Handling

| Confidence | Tier | Behavior |
|---|---|---|
| >= 0.8 | High | Apply principles automatically. |
| 0.5-0.79 | Medium | Apply + surface: "Detected as {type} ({confidence}). Correct?" |
| < 0.5 | Low | Do NOT apply type-specific behavior. Ask user first. |

**Config vs detection conflict:** Config wins. User set type during `/st:init` deliberately. Surface discrepancy but use config.

**Incomplete detection:** Detector sees frameworks but cannot resolve type (e.g., react + express without workspace structure). Present what IS known, ask user to clarify. Do not default to fullstack without confirmation.

## Error Handling

### Session-start hook failure

If `detectProject()` or `loadConfig()` fails (timeout, permission error, parse error):

```
ST ► PROJECT CONTEXT
─────────────────────────────
Project:     {name from directory}
Type:        unknown (detection failed: {reason})
Frameworks:  —
Initialized: {Yes | No}

⚠ Detection incomplete. Run /st:init to set project type manually.
─────────────────────────────
```

**Rules:**
- NEVER start a session with zero context. Always inject at least the error block above.
- Log detection failure reason for debugging (`ST ► WARN: detectProject failed: {error}`).
- If only detection fails but config exists: use config. Surface warning but proceed normally.
- If both fail: inject error block, all commands run in "unknown" mode.

### Partial detection

If detector resolves some fields but not all (e.g., finds frameworks but cannot determine type):

- Inject what IS known. Leave unknown fields as `—`.
- Confidence auto-drops to < 0.5 (triggers "ask user" behavior).
- Do not block session. Partial context is better than no context.

## Quick Reference

```
EVERY SESSION:
  detect → config → inject context block
  Detection fails → inject error block, never zero context
  No .superteam/ → suggest /st:init

EVERY COMMAND:
  Read context block → check type → select principles
  Check confidence → decide trust level
  Monorepo → resolve scope (arg > cwd > ask)

CONFIDENCE:
  >= 0.8  auto-apply
  0.5-0.79  apply + confirm
  < 0.5  ask first

CONFIG vs DETECTION:
  Config exists → config wins
  No config → detection with confidence rules
  Config + detection conflict → use config, surface discrepancy

MONOREPO:
  Always resolve scope before action
  Each workspace inherits its type's principles
  Cross-workspace warning: <=3 list names, 4+ collapse
  Internal-only changes: suppress cross-workspace warning
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Applying frontend principles to backend-only project | Check detection.type before applying type-specific behavior |
| Running monorepo command without scope | Always resolve scope. arg > cwd > ask |
| Ignoring low confidence, proceeding with assumptions | Low confidence = ask user. Never assume |
| Overriding config.type with fresh detection | Config is user's explicit choice. Detection may reflect WIP |
| Assuming fullstack when seeing frontend + backend frameworks | Could be monorepo or separate concerns. Ask |
| Skipping context injection for "obvious" projects | Every session starts from zero. Always inject |
| Applying all principles to all commands equally | Filter by relevance. API docs command skips responsive design |
| Session starts with zero context after hook failure | Always inject error block. Never zero context |

## Integration

**Used by:** Every `/st:` command. The session-start hook injects the context block into conversation context. Commands read it as structured text from the session — no API call or variable needed.

**Technical dependencies:**
- `core/detector.cjs` — detection result (type, frameworks, workspaces, confidence)
- `core/config.cjs` — config loading and defaults
- `hooks/session-start` — orchestrates detection + config + injection

**Skills that reference project-awareness:**
- `superteam:scientific-debugging` — auto-detects log locations from framework, techniques.md uses project-type hints
- `superteam:tdd-discipline` — test framework detection based on project framework
- `superteam:requesting-code-review` — review criteria adapt per type, domain selection per project type
- `superteam:receiving-code-review` — YAGNI grep uses scope resolution for correct search boundary
- `superteam:wave-parallelism` — respects config.parallelization
- `superteam:verification` — criteria differ by type
- `superteam:handoff-protocol` — handoff includes project context
````

---

## Design Decisions

1. **High freedom** — principles, not exact rules. Commands self-specialize.
2. **No supporting files** — all content fits under 500 lines (~350 lines after review additions).
3. **Config wins over detection** — user set type deliberately during /st:init.
4. **Confidence tiers with numeric thresholds** — prevents "close enough" rationalization.
5. **Monorepo scope as dedicated section** — non-obvious decision tree.
6. **Description under 200 chars** — focuses on WHEN, no workflow summary.
7. **Constitution approach for confidence rules** — explicit thresholds, not suggestions.
8. **Concrete examples per principle** — anchors interpretation, prevents commands from ignoring or misreading principles.
9. **Detection signals table** — helps debug when detection is wrong, single reference point.
10. **Warning threshold for monorepo** — prevents warning fatigue in large monorepos.
11. **Graceful degradation table** — explicit baseline behavior for unknown type.
12. **Error handling with fallback** — session-start is single point of failure, must never produce zero context.

## Testing Plan (after Core Framework implementation)

1. Start session in React project without skill — does Claude know it's frontend?
2. Start session in monorepo without skill — does Claude scope commands correctly?
3. Confidence 0.6 without skill — does Claude ask or assume?
4. Same scenarios WITH skill — Claude should inject context, apply principles, handle confidence.
5. Config says backend, detection says fullstack — does Claude follow config?
6. Unknown project — does Claude suggest /st:init instead of guessing?
7. Detector timeout (monorepo 50+ packages) — does it inject error block?
8. Config file corrupt JSON — does it fallback to detection?
9. Permission denied on node_modules — does it partial detect?
10. Shared package used by 2 workspaces — warning lists all names?
11. Shared package used by 15 workspaces — warning collapses?
12. `/st:plan` with unknown type — creates generic tasks or crashes?
13. `/st:debug` with unknown type — asks log location or skips?
14. `/st:plan` frontend project — creates tasks per component or per page?
15. `/st:execute` backend with pending migration — warns?
