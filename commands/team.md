---
description: "Scrum team: create team, run roadmap, assign tasks, check status, disband — or natural language task routing"
argument-hint: "create [--size small/medium/large] | run | status | disband | <task description>"
---

# Team Management

Manage a Scrum development team. Create team, assign work, monitor progress, disband.

**Arguments:** "$ARGUMENTS"

## Sub-Command Routing

Parse arguments to determine action:

| Pattern | Action |
|---------|--------|
| `create` or `create --size <size>` | Create a new team |
| `status` | Show team status |
| `disband` | Graceful shutdown |
| `run` | Orchestrate roadmap phases with team |
| *(empty)* | Show help if no team active, show status if team active |
| *(anything else)* | Natural language → route to Scrum Master |

**Routing disambiguation:** Match sub-commands (`create`, `status`, `disband`, `run`) as exact first-word match ONLY. If the first word is `create` but followed by a task description (e.g., "create a login page"), route to Scrum Master — do NOT trigger the `create` sub-command. Similarly, if the first word is `run` but followed by a task description (e.g., "run the tests"), route to Scrum Master — do NOT trigger the `run` sub-command.

---

## create — Create a New Team

1. **Check existing team**
   - Read `.superteam/team/config.json`
   - If team is active: "Team already active. Use `/st:team status` or `/st:team disband` first."
   - If not: proceed

2. **Detect project context**
   - Run `detectProject(cwd)` logic: scan for package.json, composer.json, go.mod, etc.
   - Identify project type, frameworks, workspaces
   - Use `superteam:project-awareness` context block

3. **Estimate project size**
   - Parse `--size` flag from arguments if provided
   - Multi-signal detection priority:
     1. `--size` flag (user override)
     2. `.superteam/config.json` → `team.size`
     3. PROJECT.md / ROADMAP.md phase count (5+ → large, 3-4 → medium, 1-2 → small)
     4. Source file count (< 20 → small, 20-100 → medium, 100+ → large)
     5. Default: medium
   - If greenfield (0 files, no artifacts, no config):
     Ask user ONE question: "New project detected, not enough data to estimate size. What scale?"
     Options: [Small] [Medium] [Large] [Not sure → default medium]
     Include AI recommendation based on any available context.

4. **Assemble team composition**
   - Load `superteam:team-coordination` skill context
   - Reference `references/team-roles-catalog.md` for project type → roles mapping
   - Apply size adaptation:
     - Small: collapse Tech Lead + Senior Dev if both present
     - Medium: use preset as-is
     - Large: add Dev 2
   - Check extend signals:
     - UI framework detected → suggest UX Designer
     - CI/CD config detected → suggest DevOps Engineer

5. **Present recommendation**
   ```
   ┌─────────────────────────────────────────┐
   │ ST > TEAM COMPOSITION                   │
   │─────────────────────────────────────────│
   │ Project: [name] ([type], [size])        │
   │                                         │
   │ Core:                                   │
   │  ✓ Scrum Master    orchestrate          │
   │  ✓ Tech Lead       architecture         │
   │  ✓ Senior Dev      complex code+review  │
   │  ✓ Developer       implementation       │
   │  ✓ QA Engineer     test+verify          │
   │                                         │
   │ Suggested extend:                       │
   │  + UX Designer     (react detected)     │
   │                                         │
   │ Total: [N] agents                       │
   │ Adjust or proceed?                      │
   └─────────────────────────────────────────┘
   ```
   - User can: approve, add roles, remove roles, change size

6. **Create team via platform**
   - `TeamCreate(team_name: "[project]-team", description: "Scrum team for [project]")`
   - Save `.superteam/team/config.json`:
     ```json
     {
       "team_name": "[project]-team",
       "project_type": "[type]",
       "size": "[size]",
       "status": "active",
       "created_at": "[ISO timestamp]",
       "members": [
         { "role": "scrum-master", "name": "scrum-master", "model": "opus" },
         ...
       ]
     }
     ```
   - Write `.superteam/team/CONTEXT.md`:
     ```markdown
     # Team Context

     ## Project
     Type: [type] | Size: [size] | Frameworks: [list]

     ## Architecture Decisions
     (none yet)

     ## Patterns
     (discovered during work)

     ## Blockers
     (none)
     ```

7. **Spawn team agents**
   - For each member, spawn using Agent tool:
     ```
     Agent(
       name: "[member.name]",
       team_name: "[team_name]",
       subagent_type: "[member.role]",
       prompt: "You are [role] on team [team_name]. Read .superteam/team/config.json
                and .superteam/team/CONTEXT.md. Follow superteam:team-coordination skill.
                Check TaskList for assigned tasks. Wait for Scrum Master instructions."
     )
     ```
   - Scrum Master is spawned FIRST as team lead
   - Other members spawned after SM is ready

8. **Report**
   ```
   ┌─────────────────────────────────────────┐
   │ ST > TEAM CREATED                       │
   │─────────────────────────────────────────│
   │ Name: [team-name]                       │
   │ Members: [N] active                     │
   │                                         │
   │ Giao việc: /st:team <mô tả task>       │
   │ Xem status: /st:team status             │
   │ Giải tán: /st:team disband              │
   └─────────────────────────────────────────┘
   ```

---

## status — Show Team Status

1. **Check active team**
   - Read `.superteam/team/config.json`
   - If no active team: "No active team. Run `/st:team create` first."

2. **Gather status**
   - `TaskList` for all tasks and states
   - Read team config for member info

3. **Display**
   ```
   ┌─────────────────────────────────────────┐
   │ ST > TEAM STATUS: [team-name]           │
   │─────────────────────────────────────────│
   │ Members:                                │
   │  [name]  ● active  [current activity]   │
   │  [name]  ○ idle    [waiting for]        │
   │  ...                                    │
   │                                         │
   │ Tasks:                                  │
   │  #N [✓] [description]      ([owner])    │
   │  #N [→] [description]      ([owner])    │
   │  #N [ ] [description]      (blocked)    │
   │                                         │
   │ Progress: [done]/[total] complete       │
   └─────────────────────────────────────────┘
   ```

---

## disband — Graceful Shutdown

1. **Check active team**
   - If no active team: "No active team to disband."

2. **Confirm with user**
   - "Disband team [name]? ([N] members, [M] tasks in progress)"
   - Wait for confirmation

3. **Graceful shutdown**
   - `SendMessage(to: "*", message: { type: "shutdown_request" })`
   - Wait for all shutdown responses

4. **Archive state**
   - Update `.superteam/team/config.json`: `status: "disbanded"`
   - Save pending tasks to `.superteam/team/backlog.md`
   - CONTEXT.md preserved (accumulated knowledge)

5. **Cleanup platform state**
   - `TeamDelete`

6. **Report**
   ```
   ┌─────────────────────────────────────────┐
   │ ST > TEAM DISBANDED                     │
   │─────────────────────────────────────────│
   │ Tasks completed: [N]/[total]            │
   │ Tasks remaining: [M] (saved to backlog) │
   │ Team memory preserved at .superteam/team│
   └─────────────────────────────────────────┘
   ```

---

## run — Orchestrate Roadmap Phases

SM takes over the roadmap and orchestrates each phase through the full pipeline with team checkpoints. Semi-autonomous: team runs independently but pauses at key points for user approval.

**Preconditions:**
1. Team must be active. If not: "No active team. Run `/st:team create` first."
2. ROADMAP.md must exist. If not: "No ROADMAP.md found. Run `/st:init` first."
3. At least 1 phase with status pending or planned. If all done: "All phases completed. Milestone ready for `/st:milestone-complete`."
4. If CONTEXT.md has `## Run Progress` from a previous session (no active run in current session): "Previous run paused at phase [N], step [X]. Resume?"

### Flow Overview

```
For each phase (pending, prerequisites met):
  STEP 1: Research     → /st:phase-research  → CHECKPOINT
  STEP 2: UI/UX Design → /st:ui-design       → CHECKPOINT (conditional)
  STEP 3: Plan         → /st:phase-plan      → CHECKPOINT
  STEP 4: Execute      → /st:phase-execute   → CHECKPOINT (on blocker only)
  STEP 5: Verify       → update ROADMAP      → next phase
```

### Step 1: Research

1. SM reads ROADMAP.md, identifies next phase (pending, prerequisites met)
2. SM checks prerequisites: all preceding phases must be completed or in-progress
   - If a prerequisite is not met and no other phase is eligible: CHECKPOINT — report blocker to user
3. SM dispatches `/st:phase-research [phase]`
4. SM reviews research findings, summarizes key points
5. **CHECKPOINT** — present findings to user

### Step 2: UI/UX Design (conditional)

SM evaluates whether phase needs UI/UX design:
- Phase description contains UI/frontend keywords (component, page, layout, form, dashboard, etc.)
- AND project has UI framework detected (`detectUIFramework()` = true)

If both conditions met:
1. SM dispatches `/st:ui-design [phase]`
2. SM reviews UI spec
3. **CHECKPOINT** — present UI spec to user

If conditions not met: skip to Step 3 (SM decides, not user — no checkpoint needed).

### Step 3: Plan

1. SM dispatches `/st:phase-plan [phase]`
2. If Tech Lead is on team: SM sends plan to TL for architecture review
   ```
   SendMessage(to: "tech-lead"):
     "Phase [N] plan ready for review. Check architecture, dependencies, risks."
   ```
3. SM collects TL feedback (if any)
4. **CHECKPOINT** — present plan + TL review to user

### Step 4: Execute

1. SM dispatches `/st:phase-execute [phase]`
2. During execution, team roles participate at wave checkpoints:
   - If Senior Dev on team: Senior Dev reviews code at each wave checkpoint
   - If QA on team: QA verifies at each wave checkpoint
3. If blocker Level 3+: **CHECKPOINT** — escalate to user
4. Normal deviation handling (L1-L2 auto-fix) follows existing pipeline

### Step 5: Verify & Advance

1. If QA on team: QA runs final verification on entire phase
2. SM checks success criteria from ROADMAP.md
3. If all criteria pass:
   - SM updates ROADMAP phase status → done
   - SM updates `.superteam/team/CONTEXT.md` with:
     - Architecture decisions made during phase
     - Patterns discovered
     - Phase completion timestamp
   - SM advances to next phase → back to Step 1
4. If criteria fail:
   - SM routes rework following task lifecycle (max 3 rework cycles per phase)
   - After rework, re-verify
   - After 3 failed cycles: CHECKPOINT — escalate to user

### Run Complete

When all phases are done, SM presents summary:
```
┌─────────────────────────────────────────┐
│ ST > MILESTONE COMPLETE                 │
│─────────────────────────────────────────│
│ Phases completed: [N]/[N]               │
│ Duration: [start] → [end]              │
│ Key decisions: [from CONTEXT.md]        │
│                                         │
│ > /st:milestone-complete to archive     │
└─────────────────────────────────────────┘
```

### Checkpoint Protocol

Every checkpoint uses this format:

```
┌─────────────────────────────────────────┐
│ ST > TEAM CHECKPOINT                    │
│─────────────────────────────────────────│
│ Phase: [N] — [name]                     │
│ Step:  [Research / UI Design / Plan]    │
│─────────────────────────────────────────│
│ Summary:                                │
│   • [key point 1]                       │
│   • [key point 2]                       │
│   • [key point 3]                       │
│                                         │
│ Team input:                             │
│   TL: [opinion if TL on team]           │
│   QA: [concerns if QA on team]          │
│─────────────────────────────────────────│
│ [approve] [adjust]                      │
└─────────────────────────────────────────┘
```

**Checkpoint actions (NO skip option):**

| Action | Behavior |
|--------|----------|
| `approve` | SM continues to next step |
| `adjust` | User provides feedback → SM adjusts → reruns the step → presents again |

**Blocker checkpoint** (during execute, Level 3+):

```
┌─────────────────────────────────────────┐
│ ST > TEAM BLOCKER                       │
│─────────────────────────────────────────│
│ Phase: [N] — [name]                     │
│ Task:  #[id] — [description]            │
│ Level: [3/4]                            │
│─────────────────────────────────────────│
│ Issue: [blocker description]            │
│ Impact: [consequences if unresolved]    │
│ SM recommendation: [proposed solution]  │
│─────────────────────────────────────────│
│ [accept recommendation] [provide guidance]│
└─────────────────────────────────────────┘
```

### Team Role Integration in Execute

When team is active, the execute pipeline uses team roles instead of generic executors:

| Wave Engine Step | Solo Mode | Team Mode |
|---|---|---|
| Task implementation | executor agent (opus) | Developer or Senior Dev (by complexity) |
| Checkpoint review | reviewer agent (generic) | Senior Dev review + QA verify |
| Blocker handling | orchestrator auto-fix L1-L2 | SM routes via deviation protocol |

**Role adaptation for small teams:**
Apply the task-level role skipping table from `superteam:team-coordination`. If a role is missing:
- No Tech Lead → SM skips TL review, presents plan directly to user
- No Senior Dev → Developer self-reviews, QA is primary quality gate
- No QA → Developer self-verifies (build + tests pass)

### State Management

SM tracks run progress in `.superteam/team/CONTEXT.md` (existing file, SM is sole writer):

```markdown
## Run Progress
Phase: [N] — [name]
Step: [research/ui-design/plan/execute/verify]
Started: [ISO timestamp]

## Phase History
- Phase 1 — [name]: done ([date])
- Phase 2 — [name]: done ([date])
```

**Pause & Resume:**

| Scenario | Behavior |
|---|---|
| Session closes mid-run | SM writes progress to CONTEXT.md before shutdown |
| Next `/st:team run` | SM reads CONTEXT.md → detects in-progress phase → asks "Resume phase [N] from step [X]?" |
| `/st:team disband` | Run progress archived with backlog per existing disband flow |

Compatible with `/st:pause` and `/st:resume` — SM progress in CONTEXT.md complements handoff files, no conflict.

### Edge Cases

| Scenario | Behavior |
|---|---|
| ROADMAP.md not found | Error: "No ROADMAP.md. Run `/st:init` first." |
| All phases done | "All phases completed. Milestone ready for `/st:milestone-complete`." |
| Prerequisites not met | SM skips to next eligible phase. If none → report blocker to user |
| Team member unresponsive | SM reassigns per `team-coordination` error recovery |
| User says "stop" or "pause" | SM saves progress to CONTEXT.md, stops run loop |
| `/st:team run` while run is active in current session | "Already running phase [N]. Use `/st:team status` to check progress." |
| Phase added mid-run via `/st:phase-add` | SM re-reads ROADMAP.md each phase transition → auto-detects new phases |

---

## Natural Language Routing

When arguments don't match any sub-command:

1. **Check active team**
   - If no team: "No active team. Run `/st:team create` first."

2. **Route to Scrum Master**
   - `SendMessage(to: "scrum-master", message: "User request: [arguments]")`
   - Scrum Master decomposes, creates tasks, assigns to members

3. **User monitors via** `/st:team status`

---

## Rules

- Team composition is recommended, not forced. User can always override.
- Size detection uses multiple signals. Never rely on file count alone.
- Scrum Master is always the first agent spawned and last to shut down.
- Team memory (`.superteam/team/`) persists across disbands for knowledge retention.
- Backward compatible: this command does not affect existing `/st:execute`, `/st:plan`, etc.
- Follow `superteam:team-coordination` for all team interaction protocols.
- Maximum team size: 8 agents (to prevent communication overhead).
- Follow `superteam:core-principles`. Load references: questioning.
- During `run` mode, SM follows checkpoint protocol strictly — never auto-approve on user's behalf. Every checkpoint requires explicit user response.
