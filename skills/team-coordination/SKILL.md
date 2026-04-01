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
