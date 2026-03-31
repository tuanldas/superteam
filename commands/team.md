---
description: "Scrum team: create team, assign tasks, check status, disband — or natural language task routing"
argument-hint: "create [--size small/medium/large] | status | disband | <task description>"
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
| *(anything else)* | Natural language → route to Scrum Master |
| *(empty)* | Show help if no team active, show status if team active |

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
