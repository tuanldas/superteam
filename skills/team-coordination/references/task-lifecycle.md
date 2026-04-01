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
