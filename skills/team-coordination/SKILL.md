---
name: team-coordination
description: >
  Use when operating as part of a Scrum team created by /st:team.
  Enforces role boundaries, decision hierarchy, communication protocol,
  conflict resolution, and team memory management.
---

# Team Coordination

## Overview

Team Coordination provides the methodology for Scrum team agents to collaborate effectively. It defines how roles communicate, who decides what, how conflicts are resolved, and how shared context is maintained.

**Two responsibilities:**
1. **Protocol** — communication channels, decision hierarchy, handoff procedures, escalation chains.
2. **Discipline** — role boundary enforcement, scope authority, quality gates, anti-patterns that prevent role confusion.

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
| **QA Engineer** | Test, verify, quality gate | sonnet | NEVER implement features, CAN block merge |
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

**Escalation rules:**
- Developer → Senior Dev: architecture changes, pattern changes, new dependencies
- Senior Dev → Scrum Master: cross-task impacts, blocker resolution
- Scrum Master → User: scope changes, requirement modifications, unresolvable blockers
- QA → Scrum Master: quality concerns that block progress
- Tech Lead → User: major architecture pivots that affect timeline

## Communication Protocol

### Channels

| Channel | Tool | When |
|---------|------|------|
| Direct message | `SendMessage(to: "name")` | Task assignment, status reports, review requests, specific questions |
| Broadcast | `SendMessage(to: "*")` | Scrum Master announcements, shared decisions |
| Task list | `TaskCreate / TaskUpdate` | Task state, assignments, dependencies, completion |

### Rules

1. **Scrum Master is the hub.** All completion reports go to SM. SM coordinates cross-role dependencies.
2. **Direct messages for peer collaboration.** Senior Dev can DM Developer for review feedback. QA can DM Developer for clarification. But SM is always aware via task state.
3. **Never use terminal output for agent communication.** Plain text output is NOT visible to other agents. Always use `SendMessage`.
4. **Task list is source of truth.** `TaskUpdate` with status changes, not messages, determines task state.
5. **Read team context before starting work.** Every agent reads `.superteam/team/CONTEXT.md` before each task.

### Communication Flows

**Feature implementation:**
```
User request → SM decomposes → Tech Lead evaluates architecture
→ SM creates tasks with dependencies → assigns to members
→ Members execute in dependency order
→ Senior Dev reviews Developer code
→ QA verifies all → SM reports to User
```

**Blocker resolution:**
```
Member hits blocker → SendMessage to SM with context
→ SM assesses: reassign? decompose? escalate?
→ If architecture → route to Tech Lead
→ If scope → escalate to User
→ Resolution → SM updates team via broadcast
```

**Code review:**
```
Developer completes task → SendMessage to Senior Dev: "ready for review"
→ Senior Dev reviews → approve or request changes
→ If approved → Developer marks task done → QA picks up verification
→ If changes requested → Developer fixes → re-submit
```

## Team Memory

### Location: `.superteam/team/`

| File | Owner | Purpose |
|------|-------|---------|
| `config.json` | System (core/team.cjs) | Team composition, creation time, status |
| `CONTEXT.md` | Scrum Master | Shared knowledge: architecture decisions, patterns, conventions |
| `backlog.md` | Scrum Master | Tasks not yet decomposed or assigned |

### CONTEXT.md Protocol

**Scrum Master updates after:**
- Architecture decision made by Tech Lead
- Pattern discovered during implementation
- Blocker resolved (record resolution for future reference)
- Convention established (naming, file structure, etc.)

**All agents read before:**
- Starting a new task
- Making a decision that might conflict with prior decisions

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
   → If Developer believes QA criteria wrong → escalate to User via SM.

5. Process disagreement:
   → User decides. SM enforces.
```

## Team Adaptation

### Runtime Scaling

Scrum Master can suggest team changes during work:
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

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Role doing another role's work | System prompt boundaries. NEVER clauses are hard constraints. |
| Skipping QA verification | QA is mandatory for all tasks except quick fixes. |
| Developer making architecture decisions | Escalate to Tech Lead. Developer follows, doesn't design. |
| SM implementing code to "help" | SM coordinates only. If understaffed, suggest adding role. |
| Ignoring CONTEXT.md | Read before every task. Stale context causes conflicting decisions. |
| Over-communicating (message per line of code) | SendMessage for milestones: task start, blocker, completion, review. |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Any team agent starts work |
| `team-roles-catalog.md` | Team creation | `/st:team create` |

## Integration

**Used by:**
- `/st:team` — team creation, management, task routing
- All role agents — behavioral guidelines

**Skills that pair with team-coordination:**
- `superteam:wave-parallelism` — parallel execution within team tasks
- `superteam:atomic-commits` — commit discipline per team member
- `superteam:verification` — QA Engineer verification methodology
- `superteam:handoff-protocol` — session persistence for team state
