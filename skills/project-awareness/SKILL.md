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

Session-start runs `detectProject(cwd)` to gather signals, then Claude classifies and injects:

```
ST ► PROJECT CONTEXT
─────────────────────────────
Project:     {name}
Manifests:   {file (ecosystem): dep1, dep2, ...}
Config:      {config files found}
Structure:   {top-level directories}

Type:        {type} (confidence: {score})
Frameworks:  {frameworks}
Reasoning:   {one-line classification reasoning}
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
- Always show raw data (Manifests, Config, Structure) — commands and user can verify classification.
- Always show confidence score — commands use it to decide trust level.
- Always show reasoning — one line, explains why this type was chosen.
- If no `.superteam/config.json`, omit Preferences and suggest `/st:init`.
- Monorepo workspaces always expanded with individual type and frameworks.
- Compact. Data only, no prose beyond reasoning line.

## Detection System

`detectProject(cwd)` gathers raw project signals. Claude classifies from this data.

### How It Works

```
1. GATHER  — scan cwd for manifest files, config files, directory structure
2. INJECT  — present raw data in context block
3. CLASSIFY — Claude determines type, frameworks, confidence from gathered data
```

Detector is a data gatherer only. All classification intelligence lives in Claude.

### Manifest File Patterns

Detector scans cwd for these files to identify ecosystem and dependencies:

| Ecosystem | Manifest Files |
|---|---|
| Node/JS | `package.json`, `deno.json`, `bun.lockb` |
| Python | `pyproject.toml`, `requirements.txt`, `Pipfile`, `setup.py`, `setup.cfg` |
| Rust | `Cargo.toml` |
| Go | `go.mod` |
| Ruby | `Gemfile` |
| PHP | `composer.json` |
| Java/Kotlin | `pom.xml`, `build.gradle`, `build.gradle.kts` |
| .NET | `*.csproj`, `*.sln` |
| Dart/Flutter | `pubspec.yaml` |
| Elixir | `mix.exs` |
| Swift | `Package.swift` |

> This list covers manifest file patterns, not frameworks. New ecosystems = add one row. Frameworks are identified by reading dependency names inside these files — no framework-specific rules needed.

### Additional Signals

Beyond manifests, detector also gathers:
- **Config files** — framework configs in root (`next.config.*`, `vite.config.*`, `angular.json`, `alembic.ini`, etc.)
- **Directory structure** — top-level directories (`src/`, `app/`, `lib/`, `tests/`, `migrations/`, `ios/`, `android/`, etc.)
- **Workspace indicators** — `pnpm-workspace.yaml`, `lerna.json`, `workspaces` field in `package.json`

### Classification Prompt

After gathering, detector injects raw data and this instruction into context:

```
From the manifests, config files, and directory structure above,
determine:
- type: frontend | backend | fullstack | mobile | monorepo | unknown
- frameworks: list of detected frameworks
- confidence: 0.0 - 1.0

Rules:
- Base your classification on dependency names and config files.
- If signals point clearly to one type: confidence >= 0.8.
- If signals are ambiguous (e.g. frontend + backend deps, no fullstack framework): confidence < 0.5, ask user.
- Workspace indicators override other type signals → type = monorepo.
- State your reasoning in one line.
```

### Why This Design

- **Zero maintenance for new frameworks.** Claude already knows what FastAPI, Phoenix, SvelteKit are. No classification map to update.
- **Handles edge cases naturally.** Ambiguous projects get low confidence and a question, not a wrong answer from a rigid rule.
- **Single list to maintain.** Only the manifest file patterns table needs updating when new ecosystems emerge (rare).

## Adaptation Principles

High-level principles per project type. Commands self-specialize from these.

### Frontend

Detected: type = `frontend`, or frameworks include react, vue, angular, svelte, solid, astro.

- **Component boundaries are the unit of work.** Plan, execute, review, test at component level — not page or feature level.
  - _Example: `/st:plan` creates tasks per component (Header, Sidebar, UserCard), not per page (HomePage, Settings)._
  - _DO NOT: create a single task "build the homepage" that spans 5 components._
- **Visual output is a deliverable.** Commands touching UI must produce verifiable visual results, not just passing tests.
  - _Example: `/st:execute` for a UI task should include screenshot verification or Storybook check, not just "tests pass"._
  - _DO NOT: claim a UI component is "done" with only unit tests and no visual verification._
- **Design system awareness.** Check for existing design tokens, component libraries, theme config before creating new UI.
  - _Example: `/st:plan` checks for tailwind.config, theme.ts, or design-tokens/ before proposing new color/spacing values._
  - _DO NOT: hardcode `#3b82f6` when the project has `--color-primary` in its design tokens._

### Backend

Detected: type = `backend`, or frameworks include express, fastify, nestjs, hono, laravel, django, flask, go.

- **API contract drives planning.** Breaking changes require explicit acknowledgment. Plan and review must flag contract changes.
  - _Example: `/st:plan` flags "⚠ BREAKING: removes `GET /users/:id` response field `legacy_name`" as separate task requiring review._
  - _DO NOT: silently change a response shape without flagging it as a breaking change._
- **Framework-specific log locations.** Debug commands auto-detect where logs live per framework (e.g., storage/logs for Laravel, stdout for Express).
  - _Example: `/st:debug` for Laravel project checks `storage/logs/laravel.log` first, not stdout._
  - _DO NOT: always default to stdout — check the framework's conventional log location first._
- **Migration safety.** Any database-touching command must check for pending migrations and warn.
  - _Example: `/st:execute` runs `npx prisma migrate status` (or equivalent) before any DB-related code change._
  - _DO NOT: write code that depends on a new column without creating the migration first._

### Fullstack

Detected: type = `fullstack`, or frameworks include next, nuxt, remix, sveltekit.

- **Both frontend and backend principles apply.** Do not drop either set.
  - _DO NOT: skip migration safety checks because the task "looks frontend-only" — check for server-side impact._
- **Client/server boundary is the critical seam.** Every plan and review must identify what runs where. Server components vs client components, API routes vs page routes.
  - _Example: `/st:plan` for a Next.js feature separates server action tasks from client component tasks explicitly._
  - _DO NOT: create a single task that mixes server action logic and client component rendering._
- **Cross-boundary impact analysis.** One change can affect both sides. Commands must surface this.
  - _Example: `/st:code-review` flags when an API route change affects a client-side fetch without updating the consumer._
  - _DO NOT: change an API response shape without checking all frontend consumers._
- **When principles conflict, server-side safety takes precedence.** Migrations, API contracts, and data integrity outweigh client-side granularity or visual concerns.

### Monorepo

Detected: type = `monorepo`, or workspaces array has 2+ entries.

- **Scope is always explicit.** Every command must know which workspace(s) it operates on.
  - _DO NOT: run a command without knowing which workspace it targets — resolve scope first._
- **Each workspace has its own type.** Frontend workspace gets frontend principles, backend gets backend.
  - _DO NOT: apply frontend principles to a backend workspace just because the monorepo root has React deps._
- **Cross-workspace impact is first-class.** Changes in shared packages affect all consumers.
  - _DO NOT: modify a shared package without checking its consumer list._
- **Root-level operations are distinct.** Root README, root config, root CI differ from workspace-level.

### Mobile

Detected: type = `mobile`, or frameworks include flutter, react-native, kotlin-multiplatform, swiftui.

- **Platform target is explicit.** Every plan and review must state which platforms: iOS, Android, or both. Never assume "both" without checking project config.
  - _Example: `/st:plan` for Flutter checks `pubspec.yaml` platforms and `ios/`/`android/` directories to confirm targets._
  - _DO NOT: assume "both platforms" without verifying — project may only target one._
- **Device-specific testing is a deliverable.** Changes touching UI or platform APIs must include device/emulator verification, not just unit tests.
  - _Example: `/st:execute` for a React Native feature includes "verify on iOS simulator" as explicit step._
  - _DO NOT: claim a mobile UI change is verified with only Jest snapshot tests._
- **Native bridge is the critical seam.** Platform channels, native modules, FFI — these are where bugs hide. Plan and review must flag cross-boundary calls.
  - _Example: `/st:code-review` flags new MethodChannel/Platform.select usage as high-risk, requires both platform implementations reviewed._
  - _DO NOT: add a new platform channel call without verifying the native side implementation exists._

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

### Tiers

| Confidence | Tier | Behavior |
|---|---|---|
| >= 0.8 | High | Apply principles automatically. |
| 0.5-0.79 | Medium | Apply + surface: "Detected as {type} ({confidence}). Correct?" |
| < 0.5 | Low | Do NOT apply type-specific behavior. Ask user first. |

### Classification Confidence Guidelines

When classifying from raw data, assign confidence based on signal clarity:

| Signals | Confidence |
|---|---|
| Known framework in deps + matching config file + matching directory structure | >= 0.9 |
| Known framework in deps + one additional signal (config or structure) | 0.8 - 0.89 |
| Known framework in deps only, no additional signals | 0.7 - 0.79 |
| Manifest found but no recognized framework in deps | 0.5 - 0.59 |
| Mixed signals — frontend + backend deps, no fullstack framework, no workspace | < 0.5 |
| No manifest found | 0.1 |

### Conflict Rules

- **Config vs classification conflict:** Config wins. User set type during `/st:init` deliberately. Surface discrepancy but use config.
- **Multiple ecosystems detected:** Does not automatically mean monorepo. Check for workspace indicators first. If none, confidence < 0.5, ask user.
- **Incomplete detection:** Manifest found but unreadable (permission, parse error). Inject what IS known. Confidence auto-drops to < 0.5.

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
  gather signals → classify → inject context block
  Gathering fails → inject error block, never zero context
  No .superteam/ → suggest /st:init

EVERY COMMAND:
  Read context block → check type → select principles
  Check confidence → decide trust level
  Monorepo → resolve scope (arg > cwd > ask)

TYPES:
  frontend | backend | fullstack | mobile | monorepo | unknown

CONFIDENCE:
  >= 0.8  auto-apply
  0.5-0.79  apply + confirm
  < 0.5  ask first

CONFIG vs CLASSIFICATION:
  Config exists → config wins
  No config → classification with confidence rules
  Config + classification conflict → use config, surface discrepancy

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
| Overriding config.type with fresh classification | Config is user's explicit choice. Classification may reflect WIP |
| Assuming fullstack when seeing frontend + backend deps | Could be monorepo or separate concerns. Ask |
| Applying desktop/web principles to mobile project | Check for mobile type. Platform targets, device testing, native bridges differ |
| Skipping context injection for "obvious" projects | Every session starts from zero. Always inject |
| Applying all principles to all commands equally | Filter by relevance. API docs command skips responsive design |
| Session starts with zero context after hook failure | Always inject error block. Never zero context |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Session start (auto-injected by hook) |

**Self-contained.** No reference files. All detection rules, adaptation principles, and confidence handling fit in SKILL.md. Loaded once at session start — not reloaded per command.

## Integration

**Used by:** Every `/st:` command. The session-start hook injects the context block into conversation context. Commands read it as structured text from the session — no API call or variable needed.

**Technical dependencies:**
- `core/detector.cjs` — gathers raw signals (manifests, config files, directory structure). Does NOT classify.
- `core/config.cjs` — config loading and defaults
- `hooks/session-start` — orchestrates gathering + classification prompt + context block injection

**Skills that reference project-awareness:**
- `superteam:scientific-debugging` — auto-detects log locations from framework, techniques.md uses project-type hints
- `superteam:tdd-discipline` — test framework detection based on project framework
- `superteam:requesting-code-review` — review criteria adapt per type, domain selection per project type
- `superteam:receiving-code-review` — YAGNI grep uses scope resolution for correct search boundary
- `superteam:wave-parallelism` — respects config.parallelization, uses workspace scope for dependency analysis, framework detection for test runner
- `superteam:verification` — criteria differ by type
- `superteam:handoff-protocol` — handoff includes project context
