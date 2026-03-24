# Skill Spec: handoff-protocol

> Status: DRAFT v2 | Created: 2026-03-24 | Revised: 2026-03-24 (user review)

---

## Frontmatter

```yaml
---
name: handoff-protocol
description: >
  Use when pausing work mid-session or resuming from a previous session.
  Defines HANDOFF.json/HANDOFF.md schemas, capture/restore protocols,
  context quality standards, and one-shot lifecycle rules.
---
```

---

## SKILL.md Content

````markdown
---
name: handoff-protocol
description: >
  Use when pausing work mid-session or resuming from a previous session.
  Defines HANDOFF.json/HANDOFF.md schemas, capture/restore protocols,
  context quality standards, and one-shot lifecycle rules.
---

# Handoff Protocol

## Overview

Handoff Protocol defines how to serialize and restore complete workflow state across Claude Code sessions. It ensures that a fresh session can continue exactly where the previous one left off — with full context, decisions, and mental model intact.

**Two responsibilities:**
1. **Serialization** — capture workflow state into structured files (HANDOFF.json + HANDOFF.md).
2. **Restoration** — load, validate, and route back to the correct workflow with restored context.

## Core Principle

```
SERIALIZE COMPLETE WORKFLOW STATE.
WRITE AS IF BRIEFING A COLLEAGUE WHO HAS NEVER SEEN THIS PROJECT.

The next session has ZERO memory of this session.
Everything you don't write down is lost.
"Was working on auth" is not a handoff. It's a post-it note.
```

## Scope & Lifecycle

### Universal Scope

Handoff protocol applies to ALL workflows:
- `/st:execute` — task progress within a plan
- `/st:phase-execute` — phase progress within a milestone
- `/st:debug` — investigation state, eliminated hypotheses, evidence
- `/st:quick` — quick task progress
- `/st:tdd` — RED/GREEN/REFACTOR cycle position
- `/st:plan` — planning decisions and open questions
- Any other active workflow

The skill defines the FORMAT. Commands define the DETECTION (how to find current state for their specific workflow).

### One-Shot Lifecycle

```
CREATE on pause → CONSUME on resume → DELETE after successful resume

Handoff files are temporary. They exist ONLY between sessions.
Never keep them permanently. Never commit them to git.
Add to .gitignore: HANDOFF.json, HANDOFF.md
Stale handoffs confuse future sessions.
```

## HANDOFF.json Schema

Machine-readable file at `.superteam/HANDOFF.json`. Primary source for `/st:resume`.

```json
{
  "version": 1,
  "timestamp": "2026-03-24T14:30:00Z",
  "workflow": "execute|debug|quick|tdd|plan|phase-execute|...",
  "phase": "phase_number or null",
  "task": "current_task_number or null",
  "total_tasks": "count or null",
  "status": "paused",

  "completed_tasks": [
    {"id": 1, "name": "Setup auth module", "status": "done", "commit": "abc1234"},
    {"id": 2, "name": "JWT token generation", "status": "in_progress", "progress": "Token signing done, validation not started"}
  ],
  "remaining_tasks": [
    {"id": 3, "name": "Refresh token endpoint", "status": "not_started"},
    {"id": 4, "name": "Token revocation", "status": "not_started"}
  ],

  "blockers": [
    {
      "description": "Redis connection pooling unclear for token storage",
      "type": "technical",
      "workaround": "Can use in-memory store for dev, but need Redis for prod"
    }
  ],
  "human_actions_pending": [
    {
      "action": "Set up Redis instance on staging",
      "context": "Needed for refresh token storage before task 3",
      "blocking": true
    }
  ],
  "decisions": [
    {
      "decision": "Use jose library instead of jsonwebtoken",
      "rationale": "ESM support, smaller bundle, actively maintained"
    },
    {
      "decision": "Short-lived access tokens (15min) + refresh tokens",
      "rationale": "User explicitly wants NO revocation list"
    }
  ],

  "wave_state": {
    "current_wave": 2,
    "total_waves": 3,
    "completed_waves": [1],
    "agents_in_progress": [
      {"task_id": 4, "status": "running", "started_at": "2026-03-24T14:00:00Z"},
      {"task_id": 5, "status": "completed", "commit": "def5678"}
    ]
  },

  "uncommitted_files": ["src/auth/token.ts", "src/auth/refresh.ts"],
  "next_action": "Implement token validation in src/auth/token.ts:validateAccessToken(). The signing is done, need to add verification with jose.jwtVerify().",
  "context_notes": "Using jose library for JWT. Access tokens are 15min, refresh tokens 7 days. User wants simple refresh flow — no revocation list, no token rotation. Currently in GREEN phase of TDD cycle for token generation.",
  "user_message": "Need to stop for today, will continue tomorrow"
}
```

### Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `version` | Yes | Schema version (currently 1) |
| `timestamp` | Yes | ISO-8601 when pause occurred |
| `workflow` | Yes | Which workflow was active |
| `phase` | No | Phase number if in phase-based workflow |
| `task` | No | Current task number |
| `total_tasks` | No | Total task count for progress tracking |
| `status` | Yes | Always "paused" |
| `completed_tasks` | Yes | Array of completed + in-progress tasks with commit hashes |
| `remaining_tasks` | Yes | Array of not-yet-started tasks |
| `blockers` | Yes | Technical/external blockers (can be empty array) |
| `human_actions_pending` | Yes | Things user needs to do offline (can be empty array) |
| `decisions` | Yes | Decisions made with rationale (can be empty array) |
| `wave_state` | No | Wave execution state: current/total/completed waves, per-agent progress. Only for wave-parallelism workflows |
| `uncommitted_files` | Yes | Files with uncommitted changes |
| `next_action` | Yes | Specific, actionable first step when resuming |
| `context_notes` | Yes | Mental model, approach reasoning, observations |
| `user_message` | No | User's note about why they're pausing |

### `human_actions_pending` vs `blockers`

These are separate fields because they need different treatment:
- **Blockers** are problems that need solving (technical issues, unclear requirements).
- **Human actions** are tasks the user needs to do offline (setup infrastructure, get API keys, approve design). Surface these IMMEDIATELY on resume — they may already be resolved.

## HANDOFF.md Format

Human-readable file at `.superteam/HANDOFF.md`. Fallback when JSON parsing fails. Also useful for manual review.

**HANDOFF.md is a summary, not a mirror of HANDOFF.json.** Frontmatter contains key identifiers (workflow, phase, task). Body contains narrative sections. Fields like `wave_state` and per-task commit hashes live only in JSON.

```markdown
---
workflow: execute
phase: 3
task: 2
total_tasks: 4
status: paused
timestamp: 2026-03-24T14:30:00Z
---

## Current State
Implementing JWT auth module. Token signing (task 2) is partially done —
jose.SignJWT() works, now need jose.jwtVerify() for validation.
Currently in GREEN phase of TDD cycle.

## Completed Work
- [x] Task 1: Setup auth module (commit abc1234)
- [~] Task 2: JWT token generation (signing done, validation not started)

## Remaining Work
- [ ] Task 3: Refresh token endpoint
- [ ] Task 4: Token revocation

## Decisions Made
- **jose over jsonwebtoken** — ESM support, smaller bundle, actively maintained
- **15min access tokens + 7-day refresh tokens** — user wants NO revocation list
- **httpOnly cookie for refresh token** — more secure than response body

## Blockers
- Redis connection pooling unclear for token storage (workaround: in-memory for dev)

## Human Actions Pending
- [ ] Set up Redis instance on staging (blocking task 3)

## Context
Using jose library. Access tokens 15min, refresh 7 days. User wants simple flow —
no revocation, no rotation. Was considering httpOnly cookie vs response body for
refresh token storage, decided on cookie for security.

## Next Action
Implement token validation in src/auth/token.ts:validateAccessToken().
The signing is done. Add verification with jose.jwtVerify().
```

**Writing guideline:** Write as if briefing a colleague who has never seen this project and will continue your work. They should be able to read HANDOFF.md and start working within 2 minutes.

## Capture Protocol (Pause)

When capturing state for handoff:

### Step 1: Detect Active Workflow

Determine which workflow is active and its current state:
- Check for active plan execution (`.superteam/plans/` with in-progress tasks)
- Check for active debug session (`.superteam/debug/` with open sessions)
- Check for active quick task (`.superteam/quick/`)
- Check git status for uncommitted files
- Check conversation context for workflow type

### Step 2: Gather State (8 Categories)

```
CAPTURE CHECKLIST:
1. Workflow type and position (which command, which phase/task)
2. Completed work (tasks done, with commit hashes)
3. In-progress work (what's partially done, how far)
4. Remaining work (what's not started)
5. Decisions made (with rationale — prevents re-debating)
6. Blockers and workarounds tried
7. Human actions pending (separate from blockers)
8. Mental model / context (approach reasoning, observations, concerns)
```

### Step 3: Write Handoff Files

Write both `.superteam/HANDOFF.json` and `.superteam/HANDOFF.md`.

### Step 4: WIP Commit

```
git add [uncommitted work files only]
git commit -m "wip: [workflow] paused at [state description]"
```

**Handoff files (.superteam/HANDOFF.json, .superteam/HANDOFF.md) are NOT committed.** They should be in `.gitignore`. They are temporary local artifacts — not project history.

Only commit the actual work-in-progress code files. The WIP commit protects code; handoff files protect context. Different concerns, different storage.

### Quality Bar for `context_notes`

The `context_notes` field is the highest-value field in the handoff. It captures what would otherwise be permanently lost.

**Must include:**
- Current approach and WHY it was chosen
- Alternatives considered and WHY they were rejected
- User preferences expressed in conversation
- Observations and concerns about the code/architecture
- Current position in methodology (TDD phase, debugging phase, etc.)

**Must NOT be:**
- Just a task description ("working on auth")
- A copy of the plan ("implementing tasks 1-4")
- Generic ("making progress on the feature")

## Restore Protocol (Resume)

When restoring state from handoff:

### Step 1: Load Handoff Files

Priority order:
1. `.superteam/HANDOFF.json` — primary (structured, parseable)
2. `.superteam/HANDOFF.md` — fallback (human-readable, less structured)
3. **Reconstruct** — when no handoff files exist (see below)

### Schema Version Handling

Check `version` field in HANDOFF.json:
- **Current version (1):** proceed normally.
- **Unknown higher version:** attempt to load — newer schemas should be backwards-compatible. Warn user: "Handoff was created by a newer version. Some fields may not be recognized."
- **Missing version field:** treat as version 1 (legacy).

### Step 2: Validate State

Check that handoff state matches current reality:

```
VALIDATION CHECKLIST:
□ uncommitted_files — still match git status? (user may have committed/discarded)
□ Plan files — still exist in .superteam/plans/?
□ Debug sessions — still exist in .superteam/debug/?
□ Completed tasks — commits still in git log?
□ Blockers — still relevant? (user may have resolved offline)
□ human_actions_pending — done or still pending?
```

**If inconsistencies found:** Flag them. Don't silently ignore. Present to user:
"Handoff says `src/auth/token.ts` has uncommitted changes, but git status shows it's clean. Was this committed or discarded?"

### Step 3: Reconstruct (No Handoff Files)

When user forgot to pause, or handoff files were deleted:

```
RECONSTRUCT SCAN ORDER:
1. .superteam/plans/ — any plan with incomplete tasks?
2. .superteam/debug/ — any open debug sessions?
3. .superteam/quick/ — any active quick tasks?
4. git log — any WIP commits? (search "wip:" prefix)
5. git status — any uncommitted changes?
6. .superteam/config.json — project context
```

Reconstruct is best-effort. It will miss: decisions, context_notes, blockers, human_actions_pending. Inform user: "No handoff files found. Reconstructed state from artifacts — decisions and context from previous session are lost."

### Step 4: Present Options

Never auto-resume. Always present what was found and let user choose:

```
ST ► RESUME
─────────────────────────────
Found handoff from 2026-03-24T14:30:00Z (10 hours ago)
Workflow: execute (phase 3, task 2 of 4)

Completed: 1 task, 1 in-progress
Remaining: 2 tasks
Blockers: 1 (Redis connection)
Human actions: 1 pending (Redis staging setup)

Options:
  [1] Continue from where you left off
  [2] Review handoff details first
  [3] Start fresh (discard handoff)
─────────────────────────────
```

### Step 5: Cleanup

After successful resume:
```
Delete .superteam/HANDOFF.json
Delete .superteam/HANDOFF.md
```

One-shot lifecycle. Handoff files served their purpose.

## Anti-Shortcut System

### Red Flags — STOP

| Thought | What to do instead |
|---------|-------------------|
| "I'll remember this when I come back" | You won't. You'll be a fresh session with zero memory. Write it down. |
| "The context is obvious from the code" | Code shows WHAT, not WHY. Write the reasoning. |
| "Just save the task list, that's enough" | Task list is the LEAST valuable part. Mental model is the MOST. |
| "I'll write a quick note" | A quick note is "working on auth." Write a proper handoff. |
| "No need to capture decisions, they're in the spec" | Decisions made DURING implementation aren't in the spec. They're only in your context. |
| "Skip HANDOFF.md, JSON is enough" | Humans can't scan JSON. MD is the fallback AND the review format. |
| "I'll resume in a few minutes, don't need full handoff" | You don't know that. Context may reset. Always full handoff. |
| "The handoff files are useful history, keep them" | Stale handoffs confuse future sessions. One-shot lifecycle. Delete after resume. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll remember the approach when I see the code" | You're a new session. You won't recognize your own reasoning. |
| "Context notes are overhead, just save progress" | Progress without context = re-debating every decision. 5 min now saves 30 min later. |
| "The plan file has all the context" | Plans don't capture: user preferences, rejected alternatives, blockers, mental model. |
| "next_action: continue the feature" | A stranger can't act on this. Specific file, specific function, specific operation. |
| "Decisions are obvious, no need for rationale" | They're obvious NOW. Tomorrow they won't be. Write WHY, not just WHAT. |
| "Only pause for long breaks, not quick ones" | Any break can become a long one. Always capture state. |

## Emergency Pause Protocol

When context overflow is imminent or session is about to crash, there may not be time for the full 4-step capture. Use the emergency protocol:

```
EMERGENCY PAUSE (minimal viable handoff):
1. Write HANDOFF.json ONLY (skip HANDOFF.md — JSON is structured, higher priority)
2. Focus on 3 critical fields:
   - next_action (specific, actionable)
   - context_notes (approach, decisions, reasoning)
   - completed_tasks + remaining_tasks (progress)
3. WIP commit if possible, skip if no time
```

**Progressive serialization:** If you detect context usage is high (>80%), start writing `context_notes` incrementally as you work — don't wait until pause. Add observations, decisions, and approach reasoning to a running buffer that gets written to HANDOFF.json on pause.

**After emergency pause:** On resume, flag that this was an emergency handoff. Some fields may be incomplete. Validate more aggressively.

## Staleness Handling

Handoff files age. Old handoffs become unreliable as code changes around them.

| Age | Treatment |
|-----|-----------|
| < 24 hours | Normal resume. Validate state. |
| 24h - 7 days | Show age warning: "Handoff is {N} days old. Code may have changed. Extra validation recommended." |
| > 7 days | Recommend reconstruct over handoff: "Handoff is {N} days old. Recommend starting fresh with artifact reconstruction. Use handoff only for decisions and context_notes." |

When resuming a stale handoff (> 24h):
- Run `git log --since="{handoff_timestamp}"` to see what changed
- Check if any `files_modified` in handoff were touched by new commits
- Surface changes to user before continuing

## Anti-Patterns

| Anti-Pattern | Why it fails |
|---|---|
| Vague context ("was working on auth") | Next session doesn't know specifics. Wastes 10+ minutes rediscovering |
| Single-file handoff (JSON only or MD only) | JSON is hard for humans; MD is hard to parse. Need both |
| Keeping handoff files permanently | Stale handoffs confuse future sessions |
| Auto-resume without user confirmation | User may want to do something different |
| Handoff without WIP commit | Risk of lost work on branch switch or git operations |
| Decisions without rationale | Next session re-debates settled questions |
| Scope-limited pause (only some workflows) | User won't remember which commands support it |
| Ignoring uncommitted file drift | Files change between sessions. Must validate |
| Storing handoff in permanent git history | WIP commits and handoffs are temporary, not project history |
| `next_action` as summary instead of instruction | "Continue with auth" vs "Implement jose.jwtVerify() in src/auth/token.ts:42" |

## Quick Reference

```
CORE RULE:
  Serialize complete state. Write for a stranger.
  Everything you don't write down is lost.

LIFECYCLE:
  CREATE on pause → CONSUME on resume → DELETE after resume

FILES:
  .superteam/HANDOFF.json (machine, primary)
  .superteam/HANDOFF.md (human, fallback)

CAPTURE (8 categories):
  1. Workflow type + position
  2. Completed work (with commits)
  3. In-progress work (how far)
  4. Remaining work
  5. Decisions (with rationale!)
  6. Blockers + workarounds
  7. Human actions pending (separate!)
  8. Mental model / context

RESTORE PRIORITY:
  HANDOFF.json > HANDOFF.md > reconstruct from artifacts

VALIDATION:
  Check uncommitted files, plan files, debug sessions,
  completed commits, blockers, human actions

CLEANUP:
  Delete both handoff files after successful resume

EMERGENCY PAUSE:
  JSON only, 3 fields: next_action + context_notes + task progress
  Progressive: buffer context_notes when context > 80%

STALENESS:
  < 24h normal | 24h-7d warning | > 7d recommend reconstruct

CONTEXT QUALITY:
  Good: "Using jose for JWT, 15min access tokens, user wants NO revocation..."
  Bad: "Working on auth"

GIT:
  WIP commit: code files only
  Handoff files: .gitignore, never commit
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Writing "was working on X" as context | Include WHY, approach, alternatives rejected, user preferences |
| Forgetting `human_actions_pending` | Separate from blockers. Surface immediately on resume — may be resolved |
| Decisions without rationale | "jose over jsonwebtoken" is useless without "because ESM support, smaller bundle" |
| `next_action` is vague | Must be a specific, actionable instruction with file path and function name |
| Not validating state on resume | Files change between sessions. Check git status against handoff |
| Auto-routing to workflow without options | Always present options. User context may have changed |
| Keeping handoff files after resume | Delete both. One-shot lifecycle |
| Not making WIP commit | Uncommitted work can be lost. Always commit before pause |
| Reconstructing without informing user | "State reconstructed — decisions and context from previous session are lost" |
| Handoff only captures task list | Task list is the LEAST valuable part. Mental model is the MOST valuable |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation |

**Self-contained.** No reference files. HANDOFF.json schema and capture/restore protocols fit in SKILL.md. Note: HANDOFF.json and HANDOFF.md are runtime artifacts, not reference files.

## Integration

**Used by:**
- `/st:pause` — captures workflow state into handoff files
- `/st:resume` — restores workflow state from handoff files
- Any workflow that gets interrupted (context overflow, session crash)

**Skills that pair with handoff-protocol:**
- `superteam:project-awareness` — provides project context included in handoff
- `superteam:wave-parallelism` — wave execution state needs serialization when paused mid-wave
- `superteam:scientific-debugging` — debug session state (hypotheses, eliminated, evidence) serialized in handoff
- `superteam:tdd-discipline` — TDD cycle position (RED/GREEN/REFACTOR) captured in handoff
- `superteam:verification` — verification state (passed/failed criteria, gaps) captured on pause
````

---

## Design Decisions

1. **Dual-file approach** — JSON for machines, Markdown for humans. GSD pattern proven effective. Fallback when JSON parsing fails.
2. **`human_actions_pending` as separate field** — GSD's insight: these need different treatment from blockers. Surface immediately on resume.
3. **Universal scope** — Applies to ALL workflows. User shouldn't remember which commands support pause. Every workflow is pausable.
4. **One-shot lifecycle** — Create → consume → delete. Stale handoffs are worse than no handoffs.
5. **Context quality as centerpiece** — `context_notes` is the highest-value field. Good/bad examples make the quality bar concrete.
6. **Reconstruct protocol** — Graceful degradation when handoff files missing. Best-effort, with explicit warning about lost context.
7. **Validate on resume** — Files change between sessions. Don't trust handoff blindly — check against current git status.
8. **Never auto-resume** — Always present options. User's priorities may have changed overnight.
9. **WIP commit code only, handoff files in .gitignore** — Protects uncommitted code. Handoff files are local temporary artifacts, not project history.
10. **`next_action` must be actionable** — "Continue with auth" is useless. "Implement jose.jwtVerify() in src/auth/token.ts:42" is actionable.
11. **Emergency pause protocol** — Context overflow is sudden. Minimal viable handoff: JSON only, 3 critical fields. Progressive serialization when context > 80%.
12. **Staleness thresholds** — <24h normal, 24h-7d warning, >7d recommend reconstruct. Old handoffs lose reliability as code changes.
13. **Anti-Shortcut System** — All other skills have Red Flags + Rationalizations. Handoff needs same enforcement pattern. "I'll remember" is the #1 rationalization.
14. **Wave-specific fields** — `wave_state` captures per-agent progress, current/completed waves. Required for mid-wave pause/resume.
15. **HANDOFF.md is summary, not mirror** — MD has narrative sections for human scanning. Structured data (wave_state, commit hashes) lives only in JSON.
16. **Schema versioning with backwards compatibility** — Version 1 now. Future versions must be backwards-compatible. Unknown versions: attempt load + warn.

## Testing Plan

1. Pause during `/st:execute` mid-task — does HANDOFF.json capture task progress correctly?
2. Resume with valid handoff files — does Claude load and validate state?
3. Resume with no handoff files — does Claude attempt reconstruction and warn about lost context?
4. Between sessions, user manually commits a file listed in `uncommitted_files` — does validation catch the drift?
5. Between sessions, user resolves a human action — does resume surface it for confirmation?
6. Pause during `/st:debug` — does handoff capture eliminated hypotheses and evidence?
7. Pause during `/st:tdd` — does handoff capture RED/GREEN/REFACTOR position?
8. Context notes say "was working on auth" — does quality bar flag this as insufficient?
9. `next_action` is vague ("continue the feature") — does quality bar flag this?
10. Stale handoff from 7 days ago — does resume present options instead of auto-routing?
11. Resume after `/clear` — does Claude find and load handoff files?
12. Wave execution paused mid-wave — does handoff capture per-agent progress and wave state?
