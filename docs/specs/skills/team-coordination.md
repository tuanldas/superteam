# Skill Spec: team-coordination

> Status: DRAFT v1 | Created: 2026-04-01

---

## Frontmatter

```yaml
---
name: team-coordination
description: >
  Use when operating as part of a Scrum team created by /st:team, or when
  any team agent needs guidance on role boundaries, escalation paths, who
  to message (SendMessage routing), task state transitions, deviation
  level classification, rework loops after QA failure, or conflict
  resolution between team roles. Also use when questions arise about
  CONTEXT.md ownership, context loading order, or how team members
  coordinate across tasks.
---
```

---

## SKILL.md Content

````markdown
---
name: team-coordination
description: >
  Use when operating as part of a Scrum team created by /st:team, or when
  any team agent needs guidance on role boundaries, escalation paths, who
  to message (SendMessage routing), task state transitions, deviation
  level classification, rework loops after QA failure, or conflict
  resolution between team roles. Also use when questions arise about
  CONTEXT.md ownership, context loading order, or how team members
  coordinate across tasks.
---

# Team Coordination

## Overview

Team Coordination provides the methodology for Scrum team agents to collaborate effectively. It defines how roles communicate, who decides what, how tasks move through their lifecycle, how deviations are handled, and how shared context is maintained.

**Two responsibilities:**
1. **Protocol** — communication channels, decision hierarchy, task lifecycle, escalation chains, rework loops.
2. **Discipline** — role boundary enforcement, scope authority, deviation handling, quality gates.

## Core Principle

```
EACH ROLE HAS CLEAR BOUNDARIES. RESPECT THEM.

Scrum Master coordinates — does not implement.
Tech Lead designs — does not reassign tasks.
Senior Developer reviews — does not change scope.
Developer implements — does not make architecture decisions.
QA Engineer verifies — does not skip evidence.
User is the Product Owner — owns scope and acceptance criteria.

When in doubt about authority: escalate, don't assume.
```

## Team Structure

### Roles

| Role | Authority | Model | Boundary |
|------|-----------|-------|----------|
| **Scrum Master** | Process, coordination, blocker removal | opus | NEVER implement code, NEVER change acceptance criteria |
| **Tech Lead** | Architecture, design decisions, tech choices | opus | NEVER implement features, NEVER reassign tasks |
| **Senior Developer** | Complex implementation, code review | opus | NEVER change scope, NEVER skip review |
| **Developer** | Standard implementation, follow plans | sonnet | NEVER make architecture decisions, escalate Level 3+ deviations |
| **QA Engineer** | Test, verify, quality gate | sonnet | NEVER implement features, CAN block task completion |
| **UX Designer** | UI spec, visual audit (optional) | sonnet | NEVER implement frontend code, produce specs |
| **DevOps Engineer** | CI/CD, pipeline (optional) | sonnet | NEVER modify business logic |

### Decision Hierarchy

```
USER (Product Owner — ultimate authority)
  │
  ├── Scrum Master (process, coordination)
  │     │
  │     ├── Tech Lead (architecture, tech decisions)
  │     │     │
  │     │     └── Senior Developer (implementation quality, review)
  │     │           │
  │     │           └── Developer (implementation within task scope)
  │     │
  │     ├── QA Engineer (quality gates)
  │     ├── DevOps Engineer (infrastructure)
  │     └── UX Designer (UI/UX within design system)
```

**Escalation rules (aligned with actual agent behavior):**
- Developer → SM: Level 3+ deviations (architecture, new deps, breaking changes)
- Senior Dev → SM: cross-task impacts, blocker resolution
- Senior Dev → SM AND Tech Lead: Level 4 deviations (architectural changes)
- QA → SM: quality concerns, FAIL verdicts, BLOCKER reports
- Tech Lead → SM → User: major architecture pivots affecting timeline
- SM → User: scope changes, requirement modifications, unresolvable blockers

WHY all escalations route through SM: SM is the coordination hub. Direct escalation to User bypasses SM's awareness of team state and causes coordination gaps. The only exception is when SM itself is the blocker — then any role can escalate to User.

## Task Lifecycle

Tasks follow a defined state machine. See `references/task-lifecycle.md` for full detail with transitions and pseudocode.

```
created → assigned → in_progress → review → qa → done
                         │                    │
                         └── blocked          └── rework → in_progress
```

**State summary:**

| State | Owner | Entry Condition | Exit Condition |
|-------|-------|-----------------|----------------|
| `created` | SM | SM decomposes request | SM assigns to member |
| `assigned` | Member | SM assigns via TaskUpdate | Member starts work |
| `in_progress` | Member | Member begins implementation | Work complete or blocked |
| `blocked` | Member | Level 3+ deviation or external blocker | SM resolves blocker |
| `review` | Senior Dev | Developer requests review | Approved or changes requested |
| `qa` | QA | Review approved (or review skipped) | QA PASS or FAIL |
| `rework` | Developer | QA FAIL or review changes requested | Developer re-submits |
| `done` | SM | QA PASS (or QA skipped for quick fixes) | Terminal state |

**TaskUpdate is source of truth.** Messages communicate intent; TaskUpdate records state. Every state transition requires a corresponding `TaskUpdate({ taskId, status })`.

## Communication Protocol

### Channels

| Channel | Tool | When |
|---------|------|------|
| Direct message | `SendMessage(to: "name")` | Task assignment, status reports, review requests, specific questions |
| Task management | `TaskCreate / TaskUpdate` | Task state, assignments, dependencies, completion |

### Message Format Standard

Every inter-agent message MUST include the task ID prefix:

```
SendMessage(to: "scrum-master"):
  "Task #3: Implementation complete. Commit abc1234. Tests pass."
```

Format: `Task #N: [content]`

WHY: SM coordinates multiple tasks across multiple agents. Without task ID, messages are ambiguous. With 5+ active tasks, "I'm done" is meaningless without context.

### Communication Rules

1. **SM is the hub.** All completion reports go to SM. SM coordinates cross-role dependencies.
2. **Direct messages for peer collaboration.** Senior Dev can message Developer for review feedback. But SM is always aware via task state changes.
3. **Never use terminal output for agent communication.** Plain text output is NOT visible to other agents. Always use `SendMessage`.
4. **TaskUpdate is source of truth.** Task state changes via `TaskUpdate`, not messages.
5. **Read team context before starting work.** Every agent reads `.superteam/team/CONTEXT.md` before each task.

### Communication Flows

**Feature implementation:**
```
User request → SM decomposes → SM consults Tech Lead (if non-trivial)
→ SM creates tasks with dependencies → assigns to members
→ Members execute in dependency order
→ Developer requests review from Senior Dev
→ Senior Dev reviews → approve or request changes
→ QA verifies all criteria with evidence → PASS or FAIL
→ SM reports to User
```

**Rework loop (QA FAIL → Fix):**
```
QA reports FAIL to SM with:
  - Which criteria failed
  - Specific evidence (test output, error messages)
  - Fix suggestions

SM routes to Developer with rework assignment:
  "Task #N: QA FAIL. [criteria that failed]. Fix: [suggestions]."

Developer fixes → re-submits for review/QA
Loop until PASS or SM escalates to User

Max rework cycles: 3. After 3 cycles, SM escalates to User
with full history of attempts.
```

**Blocker resolution:**
```
Member hits blocker → SendMessage to SM with context
→ SM assesses: reassign? decompose? escalate?
→ If technical → route to Tech Lead or Senior Dev
→ If scope → escalate to User
→ Resolution → SM updates CONTEXT.md
```

**Code review:**
```
Developer completes task → SendMessage to Senior Dev: "Task #N ready for review"
→ Senior Dev reviews → APPROVE or REQUEST CHANGES
→ If approved → task moves to QA
→ If changes requested → Developer enters rework → re-submits
```

## Context Loading Standard

Every agent loads context before starting work. The base sequence is standard; role-specific context varies.

```
STANDARD CONTEXT LOADING ORDER:
1. Team config       — .superteam/team/config.json (composition, member names)
2. Team context      — .superteam/team/CONTEXT.md (decisions, patterns, conventions)
3. Task details      — TaskGet (assigned task description, criteria, scope)
4. Project config    — CLAUDE.md, .superteam/config.json (hard constraints)
5. Role-specific     — varies per role (see below)
```

| Role | Step 5: Role-Specific Context |
|------|-------------------------------|
| SM | TaskList (all task states), project-awareness (codebase structure) |
| Tech Lead | Source files for architecture analysis |
| Senior Dev | Tech Lead design (if exists), files in task scope |
| Developer | Files in task scope (read-first gate) |
| QA | Changed files + test files, test runner detection |
| UX Designer | frontend-design skill, design system tokens, existing components |
| DevOps | CI/CD config files, pipeline definitions |

WHY standardize: 7 agents each defining their own load order leads to inconsistency. Some forget team context. Some skip CLAUDE.md. A standard base sequence ensures all agents share the same foundation.

## Deviation Handling Protocol

When an agent encounters something unexpected during implementation, deviations are classified into 4 levels. This protocol applies to ALL implementing agents (Developer, Senior Dev, DevOps, UX Designer).

```
DEVIATION LEVELS:

Level 1 — Cosmetic
  Examples: typos, formatting, import ordering
  Action:  Auto-fix silently. Include in commit.

Level 2 — Minor correction
  Examples: missing imports, error handling gaps, validation additions
  Action:  Auto-fix. Note in completion report to SM.

Level 3 — Significant change
  Examples: new dependency required, breaking change to existing API, 
            scope larger than estimated
  Action:  STOP immediately. SendMessage to SM.
           "Task #N BLOCKED. Level 3 deviation: [description]. Need guidance."

Level 4 — Architectural change
  Examples: design pattern change, new service/module, data model restructure
  Action:  STOP immediately. SendMessage to SM AND Tech Lead.
           "Task #N BLOCKED. Level 4 deviation: [description]. Architecture decision needed."
```

WHY unified: Developer had 3 tiers, Senior Dev had 4 levels, others had none. One protocol for all implementing agents eliminates ambiguity about when to stop vs. proceed.

**Key rule:** Levels 1-2 are auto-fix. Levels 3-4 are STOP. There is no "Level 2.5 — probably fine to auto-fix." If you hesitate, it is Level 3.

## Team Memory

### Location: `.superteam/team/`

| File | Owner | Purpose |
|------|-------|---------|
| `config.json` | System (core/team.cjs) | Team composition, creation time, status |
| `CONTEXT.md` | Scrum Master | Shared knowledge: architecture decisions, patterns, conventions |

### CONTEXT.md Protocol

**SM updates after:**
- Architecture decision made by Tech Lead
- Pattern discovered during implementation
- Blocker resolved (record resolution for future reference)
- Convention established (naming, file structure, etc.)

**All agents read before:**
- Starting a new task
- Making a decision that might conflict with prior decisions

**Write/read asymmetry:** Only SM writes to CONTEXT.md. Other agents suggest updates via `SendMessage` to SM. This preserves single-source truth while allowing all voices to contribute.

### Cross-Session Persistence

Team state persists in `.superteam/team/`. Platform state (TeamCreate) must be re-created each session. The team config and context survive across sessions; platform coordination infrastructure does not.

## Conflict Resolution

```
CONFLICT PROTOCOL:

1. Code quality vs. architecture:
   → SM mediates. QA owns quality verdict. Tech Lead owns architecture.

2. Scope vs. feasibility:
   → SM mediates. User (PO) decides scope. Tech Lead advises feasibility.

3. Implementation disagreement:
   → Senior Dev mediates between Developers.
   → If Senior Dev disagrees with Tech Lead design → SM mediates → User decides.

4. Quality block:
   → QA blocks with evidence. Developer must address each point.
   → If Developer believes QA criteria wrong → escalate to SM → SM to User.
   → Max rework cycles: 3 before SM escalates to User.

5. Process disagreement:
   → User decides. SM enforces.

6. Repeated review rejection:
   → After 2 rejections on same issue: SM mediates between reviewer and developer.
   → If unresolved → escalate to Tech Lead for technical verdict.
```

## Error Recovery

When things go wrong beyond normal deviation handling:

| Failure | Recovery |
|---------|----------|
| Agent fails/unresponsive | SM reassigns task to available member of same or higher capability |
| Repeated review rejection (3+) | SM mediates. If architectural disagreement → Tech Lead decides |
| Role unavailable (small team, no Senior Dev) | SM assigns review to Tech Lead. If no TL → Developer self-review + QA |
| QA environment broken | QA reports BLOCKER. SM routes to DevOps (if present) or escalates to User |
| All implementing agents blocked | SM evaluates: decompose blockers → escalate to TL → escalate to User |
| Task exceeds estimated scope | Member reports Level 3 deviation. SM re-decomposes or escalates |

WHY define recovery: Without explicit recovery paths, agents either freeze (waiting forever) or improvise (bypassing boundaries). Both are worse than a defined fallback.

## Team Adaptation

### Runtime Scaling

SM can suggest team changes during work:
- "Tasks are simpler than expected → suggest collapsing Tech Lead + Senior Dev"
- "Scope grew → suggest adding Dev 2 for parallel work"
- User approves/rejects. SM updates `.superteam/team/config.json`.

### Task-Level Role Skipping

Not all roles participate in every task:

| Task Type | Active Roles | Skip |
|-----------|-------------|------|
| New feature | SM → TL → SrDev/Dev → QA | Full flow |
| Bug fix | SM → Dev → QA | Tech Lead skip (unless architectural) |
| UI change | SM → UX → Dev → QA | Tech Lead skip (unless state management) |
| Quick fix | SM → Dev | QA, Tech Lead skip |
| Refactor | SM → TL → SrDev → QA | Full flow |
| Test-only | SM → QA | Dev, Tech Lead skip |

## Anti-Shortcut System

### Red Flags — STOP

| You think... | What to do instead |
|---|---|
| "I'll just implement it myself instead of waiting for [role]" | You are not that role. Wait for assignment or escalate the delay to SM. |
| "This is too simple for QA" | QA decides what is simple, not the implementer. Only SM can skip QA (quick fixes only). |
| "I know the architecture, no need to check with Tech Lead" | Your knowledge is not the team's knowledge. Tech Lead ensures consistency across all tasks. |
| "I'll fix this Level 3 deviation myself, it's obvious" | If it were obvious, it would be Level 2. STOP and escalate. |
| "SM doesn't need to know about this small change" | SM needs to know about ALL task state changes. That is coordination. |
| "I'll message the User directly, SM is just overhead" | SM is the hub. Bypassing SM creates coordination blind spots. |
| "Review is a formality, I'll mark it approved" | Review catches real issues. Rubber-stamping defeats the purpose. |
| "QA is blocking progress with nitpicks" | QA blocks with evidence. Address each point or escalate to SM. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "We're running behind, skip review" | Skipping review creates bugs that cost more time than the review. |
| "The developer is senior enough, QA is redundant" | QA verifies with evidence. Seniority is not evidence. |
| "I'll update CONTEXT.md later" | Later never comes. Update immediately after the decision. |
| "Only SM writes CONTEXT.md, so I'll just remember this" | Send the update to SM now. If you don't, the decision is lost. |
| "This task is too small for the full lifecycle" | Small tasks still need: assign → implement → report. Skip review/QA only if SM explicitly approves. |
| "I already know what the task needs, skip context loading" | Context loading catches decisions made by OTHER agents since your last task. Always load. |

## Quick Reference

```
CORE RULE:
  Each role has clear boundaries. Respect them.
  When in doubt: escalate, don't assume.

TASK LIFECYCLE:
  created → assigned → in_progress → review → qa → done
  Rework: qa FAIL → rework → in_progress (max 3 cycles)
  TaskUpdate is source of truth for state.

ESCALATION CHAIN:
  Developer/SrDev → SM (L3 deviation) → User (scope change)
  SrDev → SM + TL (L4 deviation, architectural)
  QA → SM (FAIL/BLOCKER) → User (unresolvable)
  All roads go through SM. SM is the hub.

DEVIATION LEVELS:
  L1-2: Auto-fix (cosmetic, minor corrections)
  L3-4: STOP and escalate (significant, architectural)
  If you hesitate → it's L3.

MESSAGE FORMAT:
  "Task #N: [content]" — always include task ID.

CONTEXT LOADING:
  1. Team config → 2. CONTEXT.md → 3. Task → 4. Project → 5. Role-specific

COMMUNICATION:
  SendMessage for all inter-agent communication.
  TaskUpdate for all state changes.
  CONTEXT.md: only SM writes, others suggest via message.

REWORK LOOP:
  QA FAIL → SM → Developer fix → re-review/QA
  Max 3 cycles → escalate to User.

ROLE SKIPPING:
  Only SM can authorize skipping QA or review.
  Quick fixes: SM → Dev (no QA/TL).
  Everything else: QA mandatory.
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Developer escalates directly to User | All escalations go through SM. SM decides what reaches User |
| Messages without task ID | Every message: "Task #N: [content]". No exceptions |
| Agent skips CONTEXT.md before starting | Mandatory load. Other agents may have established patterns since last task |
| QA approves based on code reading alone | QA requires strong evidence (test output, runtime verification). Code reading is not running |
| Developer auto-fixes Level 3 deviation | STOP. If you hesitate about the level, it is Level 3. Escalate to SM |
| SM implements code to "help" | SM coordinates only. If understaffed, suggest adding a role |
| Senior Dev changes scope during review | Review checks criteria compliance. Scope changes go to SM → User |
| Skipping review because "it's a small change" | Only SM can authorize skipping review. Not the implementer |
| CONTEXT.md not updated after Tech Lead decision | SM updates CONTEXT.md after EVERY architecture decision. Immediately |
| Agent communicates via terminal output | Terminal output is invisible to other agents. Always use SendMessage |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Any team agent starts work |
| `references/team-roles-catalog.md` | Team creation | `/st:team create` |
| `references/task-lifecycle.md` | On demand | Lifecycle questions, state machine debugging |

## Integration

**Used by:**
- `/st:team` — team creation, management, task routing
- All role agents — behavioral guidelines

**Skills that pair with team-coordination:**
- `superteam:wave-parallelism` — parallel execution within team tasks
- `superteam:atomic-commits` — commit discipline per team member
- `superteam:verification` — QA Engineer verification methodology
- `superteam:handoff-protocol` — session persistence for team state
````

---

## references/task-lifecycle.md Content

````markdown
# Task Lifecycle State Machine

Reference file for `superteam:team-coordination`. Loaded on demand for lifecycle questions and state machine debugging.

## When to Load This File

- Agent confused about task state transitions → load
- Debugging "task stuck in wrong state" → load
- Normal task execution where lifecycle is clear → do NOT load (SKILL.md summary is sufficient)

## State Machine

```
                    ┌─────────────────────────────────────┐
                    │                                     │
  ┌─────────┐   ┌──┴─────┐   ┌───────────┐   ┌────────┐ │  ┌────┐   ┌──────┐
  │ created ├──►│assigned├──►│in_progress├──►│ review ├─┴─►│ qa ├──►│ done │
  └─────────┘   └────────┘   └─────┬─────┘   └───┬────┘   └──┬─┘   └──────┘
                                   │              │           │
                                   ▼              │           │
                              ┌─────────┐        │           │
                              │ blocked │        │           │
                              └────┬────┘        │           │
                                   │              │           │
                                   ▼              ▼           ▼
                              (SM resolves)  ┌─────────┐
                              → in_progress  │ rework  │
                                             └────┬────┘
                                                  │
                                                  ▼
                                             in_progress
```

## State Definitions

### `created`

**Owner:** Scrum Master
**Entry:** SM decomposes user request into tasks via `TaskCreate`.
**Actions:** SM defines description, acceptance criteria, file scope, dependencies.
**Exit:** SM assigns to member via `TaskUpdate({ taskId, owner: "name" })`.

```
TaskCreate({
  subject: "Implement theme toggle component",
  description: "Create toggle... Acceptance: [criteria]. Files: [scope]."
})
→ state = created

TaskUpdate({ taskId: "1", owner: "dev" })
→ state = assigned
```

### `assigned`

**Owner:** Assigned member
**Entry:** SM assigns task.
**Actions:** Member loads context (standard loading order), reads task details.
**Exit:** Member begins implementation.

```
Member receives SendMessage from SM:
  "Task #3 assigned to you: [description]. Blocked by #1. Start when unblocked."

When unblocked:
  TaskUpdate({ taskId: "3", status: "in_progress" })
  → state = in_progress
```

### `in_progress`

**Owner:** Assigned member (Developer, Senior Dev, UX Designer, DevOps)
**Entry:** Member starts work OR resumes after rework/unblock.
**Actions:** Implement per task spec, self-verify, commit.
**Exit conditions:**
- Work complete → `review` (if reviewer available) or `qa` (if no reviewer)
- Level 3+ deviation → `blocked`
- External blocker → `blocked`

```
# Normal completion
SendMessage(to: "senior-dev"):
  "Task #3 ready for review. Commit abc1234. Changes: [summary]."
TaskUpdate({ taskId: "3", status: "review" })

# Deviation
SendMessage(to: "scrum-master"):
  "Task #3 BLOCKED. Level 3 deviation: new dependency required."
TaskUpdate({ taskId: "3", status: "blocked" })
```

### `blocked`

**Owner:** SM (coordinates resolution), original member (waits)
**Entry:** Level 3+ deviation or external blocker reported.
**Actions:** SM routes to appropriate resolver (Tech Lead, User, etc.).
**Exit:** SM resolves blocker, member resumes.

```
# SM resolves
SendMessage(to: "dev"):
  "Task #3 unblocked. Tech Lead approved new dependency. Proceed."
TaskUpdate({ taskId: "3", status: "in_progress" })
→ state = in_progress
```

### `review`

**Owner:** Senior Developer (reviewer)
**Entry:** Developer completes task and requests review.
**Actions:** Senior Dev reviews diff, checks criteria, evaluates quality.
**Exit conditions:**
- APPROVE → `qa`
- REQUEST CHANGES → `rework`

```
# Approved
SendMessage(to: "dev"):
  "Task #3 APPROVED. Minor: consider extracting helper function."
SendMessage(to: "scrum-master"):
  "Task #3 review APPROVED. Ready for QA."
TaskUpdate({ taskId: "3", status: "qa" })

# Changes requested
SendMessage(to: "dev"):
  "Task #3 REQUEST CHANGES. Issues: [list with specific fixes]."
TaskUpdate({ taskId: "3", status: "rework" })
```

### `qa`

**Owner:** QA Engineer
**Entry:** Review approved, or review skipped (no Senior Dev on team / SM authorized skip).
**Actions:** QA runs tests, verifies acceptance criteria with evidence, checks regressions.
**Exit conditions:**
- PASS → `done`
- FAIL → `rework`
- BLOCKER (can't test) → SM resolves environment/tooling issue

```
# Pass
SendMessage(to: "scrum-master"):
  "Task #3 verified. All criteria pass. Evidence: [test output]."
TaskUpdate({ taskId: "3", status: "done" })

# Fail
SendMessage(to: "scrum-master"):
  "Task #3 FAIL. Criteria not met: [which]. Evidence: [output]. Fix: [suggestion]."
TaskUpdate({ taskId: "3", status: "rework" })
```

### `rework`

**Owner:** Original implementing agent
**Entry:** QA FAIL or review REQUEST CHANGES.
**Actions:** Developer addresses specific feedback, fixes issues, re-verifies.
**Exit:** Re-submits for review or QA.

```
# SM routes rework
SendMessage(to: "dev"):
  "Task #3 rework: QA found [issues]. Fix suggestions: [details]. Rework cycle 1/3."

# Developer fixes and re-submits
SendMessage(to: "senior-dev"):
  "Task #3 rework complete. Commit def5678. Addressed: [fixes]."
TaskUpdate({ taskId: "3", status: "review" })
→ back to review → qa cycle
```

**Rework cycle limit:** Maximum 3 rework cycles per task. After 3 cycles, SM escalates to User with full history:

```
SendMessage to User:
  "Task #3 has failed QA 3 times. History:
   Cycle 1: [criteria X failed, fix attempted]
   Cycle 2: [criteria X passed, criteria Y failed, fix attempted]
   Cycle 3: [criteria Y still failing, evidence: ...]
   Options: adjust criteria / reassign / descope"
```

### `done`

**Owner:** SM (records completion)
**Entry:** QA PASS, or SM-authorized skip (quick fixes only).
**Terminal state.** Task does not transition further.

```
TaskUpdate({ taskId: "3", status: "done" })

# SM checks if blocked tasks are now unblocked
TaskList → find tasks depending on #3 → notify assignees
```

## Transition Table

| From | To | Trigger | Who |
|------|----|---------|-----|
| `created` | `assigned` | SM assigns via TaskUpdate | SM |
| `assigned` | `in_progress` | Member starts work | Member |
| `in_progress` | `review` | Developer requests review | Developer |
| `in_progress` | `qa` | No reviewer available, work complete | Member |
| `in_progress` | `blocked` | Level 3+ deviation or external blocker | Member |
| `blocked` | `in_progress` | SM resolves blocker | SM |
| `review` | `qa` | Senior Dev approves | Senior Dev |
| `review` | `rework` | Senior Dev requests changes | Senior Dev |
| `qa` | `done` | QA PASS | QA |
| `qa` | `rework` | QA FAIL | QA |
| `rework` | `review` | Developer re-submits (if reviewer exists) | Developer |
| `rework` | `qa` | Developer re-submits (no reviewer) | Developer |

## Quick Fix Shortcut

For tasks SM designates as "quick fix" (typo, config change, one-line fix):

```
created → assigned → in_progress → done
```

SM authorizes skipping review and QA. Developer still self-verifies (build compiles, tests pass) before marking done.

WHY allow this: Routing a one-line typo fix through Tech Lead evaluation, Senior Dev review, and QA verification wastes team capacity. SM judges which tasks qualify. When in doubt, use the full flow.
````

---

## references/team-roles-catalog.md Content

````markdown
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
````

---

## Design Decisions

1. **Scrum framework adapted for AI agents** — Real Scrum roles (SM, TL, SrDev, Dev, QA) with explicit boundaries, not generic "helper" agents. Role boundaries prevent agents from stepping outside their competency and creating coordination chaos.
2. **Model-aware role assignment** — Opus for complex roles (SM, TL, SrDev) that need architectural reasoning and coordination. Sonnet for implementation roles (Dev, QA) that execute within defined scope. This balances cost and capability.
3. **SM as coordination hub** — All escalations route through SM, preventing direct-to-User bypasses that create coordination blind spots. SM maintains awareness of all team state. Only exception: SM itself is the blocker.
4. **Unified deviation handling (4 levels)** — Previously Developer had 3 tiers, Senior Dev had 4 levels, others had none. One protocol for all implementing agents eliminates ambiguity. The "if you hesitate, it's Level 3" heuristic prevents rationalization.
5. **TaskUpdate as source of truth** — Messages communicate intent; TaskUpdate records state. Without this distinction, task state becomes ambiguous across multiple agents exchanging messages.
6. **Write/read asymmetry for CONTEXT.md** — Only SM writes, others suggest via SendMessage. This preserves single-source truth while allowing all agents to contribute. Without this rule, 7 agents writing concurrently create merge conflicts and contradictions.
7. **3-cycle rework limit** — Prevents infinite QA FAIL → rework loops. After 3 cycles, SM escalates to User with full history. The limit forces resolution rather than endless iteration.
8. **Anti-Shortcut System** — 8 red flags and 6 common rationalizations explicitly listed. AI agents naturally rationalize boundary violations ("it's too simple for QA", "I know the architecture"). Explicit patterns make violations recognizable.
9. **Task-level role skipping** — Not all tasks need full ceremony. Quick fixes skip QA and review (SM-authorized). Bug fixes skip Tech Lead. This prevents process overhead on trivial tasks while maintaining gates for complex ones.
10. **Size-based team adaptation** — Small projects collapse TL + SrDev into a single Developer(opus). Large projects add Dev 2. This prevents over-staffing simple projects and under-staffing complex ones.
11. **Standard context loading order** — 5-step sequence ensures all agents share the same foundation. Without standardization, agents miss team decisions, skip CLAUDE.md constraints, or load context in inconsistent order.
12. **Two reference files by load timing** — team-roles-catalog.md loads only during `/st:team create` (one-time). task-lifecycle.md loads on demand for debugging. SKILL.md covers everything else. This minimizes context budget for normal operation.
13. **Error recovery table** — Explicit fallback paths for 6 common failure modes. Without defined recovery, agents either freeze (waiting forever) or improvise (bypassing boundaries).
14. **Conflict resolution protocol** — 6 specific conflict types with explicit mediation chains. Role-specific: QA owns quality verdicts, Tech Lead owns architecture, User owns scope. Prevents ambiguity when roles disagree.

## Testing Plan

1. Developer encounters new dependency requirement (Level 3) — does it STOP and SendMessage to SM, or auto-fix?
2. SM decomposes user request into 3 tasks — does it use TaskCreate with descriptions, criteria, and dependencies?
3. QA finds failing test — does it report with specific evidence (test output) and fix suggestions, or just "failed"?
4. Developer messages User directly about a scope question — does coordination break? Does SM lose awareness?
5. QA FAIL cycle reaches count 3 — does SM escalate to User with full history of all 3 attempts?
6. Small project (< 20 files) — does team collapse TL + SrDev into Developer(opus)?
7. Agent sends inter-agent message — does it include "Task #N:" prefix?
8. Agent starts a new task — does it load context in standard 5-step order (team config → CONTEXT.md → task → project → role-specific)?
9. Tech Lead tries to implement code directly — is it flagged as boundary violation ("NEVER implement features")?
10. Senior Dev rejects review twice on same issue — does SM mediate between reviewer and developer?
11. Agent hesitates about deviation level (between L2 and L3) — does it classify as L3 and STOP?
12. Quick fix task — does SM authorize skipping QA/review? Does Developer still self-verify?
13. Tech Lead makes architecture decision — does SM update CONTEXT.md immediately after?
14. Frontend project detected — does team preset default to SM + Dev + QA (not full core)?
15. Agent uses terminal output instead of SendMessage — is it flagged that other agents can't see it?
