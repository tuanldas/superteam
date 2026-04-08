# Team Pause/Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/st:team pause` and `/st:team resume` sub-commands so users can gracefully stop a running team and resume later with selective options.

**Architecture:** Extend `core/team.cjs` with pause state helpers (`isTeamPaused`, `isTeamPausing`, `setTeamStatus`). Add `pause` and `resume` sub-commands to `commands/team.md`. The `run` sub-command's orchestration loop checks for `"pausing"` status before each step. State is persisted via `TEAM-HANDOFF.json` + `TEAM-HANDOFF.md` in `.superteam/team/`.

**Tech Stack:** Node.js (CommonJS), Markdown command definitions, Node.js built-in test runner

---

### Task 1: Add pause state helpers to `core/team.cjs`

**Files:**
- Modify: `core/team.cjs:152-159` (after `isTeamActive`, before `getTeamName`)
- Modify: `core/team.cjs:414-432` (exports)
- Test: `tests/team.test.cjs`

- [ ] **Step 1: Write failing tests for `isTeamPaused`**

Add to `tests/team.test.cjs` after the `isTeamActive` describe block (after line 110):

```js
// ---------------------------------------------------------------------------
// isTeamPaused
// ---------------------------------------------------------------------------

describe('isTeamPaused', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns false when no config exists', () => {
    assert.strictEqual(isTeamPaused(tmpDir), false);
  });

  it('returns true when status is paused', () => {
    saveTeamConfig(tmpDir, { status: 'paused' });
    assert.strictEqual(isTeamPaused(tmpDir), true);
  });

  it('returns false when status is active', () => {
    saveTeamConfig(tmpDir, { status: 'active' });
    assert.strictEqual(isTeamPaused(tmpDir), false);
  });
});
```

Update the import at the top of `tests/team.test.cjs` to include `isTeamPaused`:

```js
const {
  loadTeamConfig,
  saveTeamConfig,
  isTeamActive,
  isTeamPaused,
  // ... rest unchanged
} = require('../core/team.cjs');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/team.test.cjs`
Expected: FAIL — `isTeamPaused` is not exported

- [ ] **Step 3: Implement `isTeamPaused`**

In `core/team.cjs`, add after the `isTeamActive` function (after line 159):

```js
/**
 * Check if a team is currently paused.
 */
function isTeamPaused(rootDir) {
  const config = loadTeamConfig(rootDir);
  return config !== null && config.status === 'paused';
}
```

Add `isTeamPaused` to the `module.exports` object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/team.test.cjs`
Expected: PASS — all tests including new `isTeamPaused` tests

- [ ] **Step 5: Write failing tests for `isTeamPausing`**

Add to `tests/team.test.cjs` after the `isTeamPaused` describe block:

```js
// ---------------------------------------------------------------------------
// isTeamPausing
// ---------------------------------------------------------------------------

describe('isTeamPausing', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns false when no config exists', () => {
    assert.strictEqual(isTeamPausing(tmpDir), false);
  });

  it('returns true when status is pausing', () => {
    saveTeamConfig(tmpDir, { status: 'pausing' });
    assert.strictEqual(isTeamPausing(tmpDir), true);
  });

  it('returns false when status is paused', () => {
    saveTeamConfig(tmpDir, { status: 'paused' });
    assert.strictEqual(isTeamPausing(tmpDir), false);
  });
});
```

Update the import to include `isTeamPausing`.

- [ ] **Step 6: Run test to verify it fails**

Run: `node --test tests/team.test.cjs`
Expected: FAIL — `isTeamPausing` is not exported

- [ ] **Step 7: Implement `isTeamPausing`**

In `core/team.cjs`, add after `isTeamPaused`:

```js
/**
 * Check if a team pause has been requested (waiting for current step to finish).
 */
function isTeamPausing(rootDir) {
  const config = loadTeamConfig(rootDir);
  return config !== null && config.status === 'pausing';
}
```

Add `isTeamPausing` to exports.

- [ ] **Step 8: Run test to verify it passes**

Run: `node --test tests/team.test.cjs`
Expected: PASS

- [ ] **Step 9: Write failing tests for `setTeamStatus`**

Add to `tests/team.test.cjs`:

```js
// ---------------------------------------------------------------------------
// setTeamStatus
// ---------------------------------------------------------------------------

describe('setTeamStatus', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('updates status from active to pausing', () => {
    saveTeamConfig(tmpDir, { team_name: 'test', status: 'active', members: [] });
    setTeamStatus(tmpDir, 'pausing');
    const config = loadTeamConfig(tmpDir);
    assert.strictEqual(config.status, 'pausing');
    assert.strictEqual(config.team_name, 'test');
  });

  it('updates status from pausing to paused', () => {
    saveTeamConfig(tmpDir, { team_name: 'test', status: 'pausing', members: [] });
    setTeamStatus(tmpDir, 'paused');
    const config = loadTeamConfig(tmpDir);
    assert.strictEqual(config.status, 'paused');
  });

  it('updates status from paused to active', () => {
    saveTeamConfig(tmpDir, { team_name: 'test', status: 'paused', members: [] });
    setTeamStatus(tmpDir, 'active');
    const config = loadTeamConfig(tmpDir);
    assert.strictEqual(config.status, 'active');
  });

  it('returns false when no config exists', () => {
    const dir = makeTmpDir();
    try {
      assert.strictEqual(setTeamStatus(dir, 'paused'), false);
    } finally {
      rmTmpDir(dir);
    }
  });
});
```

Update the import to include `setTeamStatus`.

- [ ] **Step 10: Run test to verify it fails**

Run: `node --test tests/team.test.cjs`
Expected: FAIL — `setTeamStatus` is not exported

- [ ] **Step 11: Implement `setTeamStatus`**

In `core/team.cjs`, add after `isTeamPausing`:

```js
/**
 * Update team status in config.json. Preserves all other fields.
 * Returns true if updated, false if no config found.
 *
 * @param {string} rootDir
 * @param {'active'|'pausing'|'paused'|'disbanded'} newStatus
 * @returns {boolean}
 */
function setTeamStatus(rootDir, newStatus) {
  const config = loadTeamConfig(rootDir);
  if (!config) return false;
  config.status = newStatus;
  saveTeamConfig(rootDir, config);
  return true;
}
```

Add `setTeamStatus` to exports.

- [ ] **Step 12: Run test to verify it passes**

Run: `node --test tests/team.test.cjs`
Expected: PASS

- [ ] **Step 13: Commit**

```bash
git add core/team.cjs tests/team.test.cjs
git commit -m "feat(team): add isTeamPaused, isTeamPausing, setTeamStatus helpers"
```

---

### Task 2: Add HANDOFF file helpers to `core/team.cjs`

**Files:**
- Modify: `core/team.cjs` (new functions after `setTeamStatus`)
- Test: `tests/team.test.cjs`

- [ ] **Step 1: Write failing tests for `saveTeamHandoff` and `loadTeamHandoff`**

Add to `tests/team.test.cjs`:

```js
// ---------------------------------------------------------------------------
// saveTeamHandoff / loadTeamHandoff
// ---------------------------------------------------------------------------

describe('saveTeamHandoff + loadTeamHandoff', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns null when no handoff exists', () => {
    assert.strictEqual(loadTeamHandoff(tmpDir), null);
  });

  it('round-trips handoff data', () => {
    const handoff = {
      pausedAt: '2026-04-08T10:30:00Z',
      workflow: 'run',
      currentPhase: 3,
      currentStep: 'execute',
      completedSteps: ['research', 'plan'],
      pendingSteps: ['execute', 'verify'],
      agentAssignments: {
        developer: { task: 'implement auth', progress: 'in_progress' },
      },
      reason: 'user requested pause',
    };
    saveTeamHandoff(tmpDir, handoff);
    const loaded = loadTeamHandoff(tmpDir);
    assert.deepStrictEqual(loaded, handoff);
  });

  it('creates TEAM-HANDOFF.md alongside JSON', () => {
    const handoff = {
      pausedAt: '2026-04-08T10:30:00Z',
      workflow: 'run',
      currentPhase: 2,
      currentStep: 'plan',
      completedSteps: ['research'],
      pendingSteps: ['plan', 'execute', 'verify'],
      agentAssignments: {},
      reason: 'user requested pause',
    };
    saveTeamHandoff(tmpDir, handoff);
    const mdPath = path.join(tmpDir, '.superteam', 'team', 'TEAM-HANDOFF.md');
    assert.ok(fs.existsSync(mdPath));
    const content = fs.readFileSync(mdPath, 'utf-8');
    assert.ok(content.includes('Phase 2'));
    assert.ok(content.includes('plan'));
  });
});
```

Update the import to include `saveTeamHandoff, loadTeamHandoff`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/team.test.cjs`
Expected: FAIL — functions not exported

- [ ] **Step 3: Implement `saveTeamHandoff` and `loadTeamHandoff`**

In `core/team.cjs`, add after `setTeamStatus`:

```js
/**
 * Path to TEAM-HANDOFF.json.
 */
function teamHandoffPath(rootDir) {
  return path.join(teamDir(rootDir), 'TEAM-HANDOFF.json');
}

/**
 * Path to TEAM-HANDOFF.md.
 */
function teamHandoffMdPath(rootDir) {
  return path.join(teamDir(rootDir), 'TEAM-HANDOFF.md');
}

/**
 * Save team handoff state (JSON + human-readable Markdown).
 *
 * @param {string} rootDir
 * @param {Object} handoff - Handoff data object
 */
function saveTeamHandoff(rootDir, handoff) {
  const dir = teamDir(rootDir);
  fs.mkdirSync(dir, { recursive: true });

  // JSON
  fs.writeFileSync(
    teamHandoffPath(rootDir),
    JSON.stringify(handoff, null, 2) + '\n',
    'utf-8',
  );

  // Markdown
  const assignments = handoff.agentAssignments || {};
  const agentLines = Object.entries(assignments)
    .map(([name, info]) => `- **${name}**: ${info.task || 'idle'} (${info.progress})`)
    .join('\n');

  const md = [
    '# Team Handoff',
    '',
    `**Paused at:** ${handoff.pausedAt}`,
    `**Workflow:** ${handoff.workflow}`,
    `**Reason:** ${handoff.reason}`,
    '',
    '## Progress',
    '',
    `**Phase ${handoff.currentPhase}** — step: ${handoff.currentStep}`,
    '',
    `- Completed: ${handoff.completedSteps.join(', ') || 'none'}`,
    `- Pending: ${handoff.pendingSteps.join(', ') || 'none'}`,
    '',
    '## Agent Assignments',
    '',
    agentLines || '(no agents assigned)',
    '',
    '## Resume',
    '',
    'Run `/st:team resume` to continue.',
    '',
  ].join('\n');

  fs.writeFileSync(teamHandoffMdPath(rootDir), md, 'utf-8');
}

/**
 * Load team handoff state. Returns null if not found.
 */
function loadTeamHandoff(rootDir) {
  return readJsonSafe(teamHandoffPath(rootDir));
}
```

Add `saveTeamHandoff, loadTeamHandoff` to exports.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/team.test.cjs`
Expected: PASS

- [ ] **Step 5: Write failing test for `clearTeamHandoff`**

Add to `tests/team.test.cjs`:

```js
// ---------------------------------------------------------------------------
// clearTeamHandoff
// ---------------------------------------------------------------------------

describe('clearTeamHandoff', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('removes both handoff files', () => {
    saveTeamHandoff(tmpDir, {
      pausedAt: '2026-04-08T10:30:00Z',
      workflow: 'run',
      currentPhase: 1,
      currentStep: 'research',
      completedSteps: [],
      pendingSteps: ['research'],
      agentAssignments: {},
      reason: 'test',
    });
    const jsonPath = path.join(tmpDir, '.superteam', 'team', 'TEAM-HANDOFF.json');
    const mdPath = path.join(tmpDir, '.superteam', 'team', 'TEAM-HANDOFF.md');
    assert.ok(fs.existsSync(jsonPath));
    assert.ok(fs.existsSync(mdPath));

    clearTeamHandoff(tmpDir);

    assert.ok(!fs.existsSync(jsonPath));
    assert.ok(!fs.existsSync(mdPath));
  });

  it('does not throw when files do not exist', () => {
    assert.doesNotThrow(() => clearTeamHandoff(tmpDir));
  });
});
```

Update import to include `clearTeamHandoff`.

- [ ] **Step 6: Run test to verify it fails**

Run: `node --test tests/team.test.cjs`
Expected: FAIL — `clearTeamHandoff` not exported

- [ ] **Step 7: Implement `clearTeamHandoff`**

In `core/team.cjs`, add after `loadTeamHandoff`:

```js
/**
 * Remove TEAM-HANDOFF.json and TEAM-HANDOFF.md.
 */
function clearTeamHandoff(rootDir) {
  for (const filePath of [teamHandoffPath(rootDir), teamHandoffMdPath(rootDir)]) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // File doesn't exist, fine
    }
  }
}
```

Add `clearTeamHandoff` to exports.

- [ ] **Step 8: Run test to verify it passes**

Run: `node --test tests/team.test.cjs`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add core/team.cjs tests/team.test.cjs
git commit -m "feat(team): add saveTeamHandoff, loadTeamHandoff, clearTeamHandoff"
```

---

### Task 3: Update `buildTeamContext` to include paused state

**Files:**
- Modify: `core/team.cjs:396-408` (`buildTeamContext`)
- Test: `tests/team.test.cjs`

- [ ] **Step 1: Write failing test**

Add to the existing `buildTeamContext` describe block in `tests/team.test.cjs`:

```js
  it('returns context string with paused indicator when team is paused', () => {
    saveTeamConfig(tmpDir, {
      team_name: 'test-team',
      status: 'paused',
      members: [
        { role: 'scrum-master', name: 'scrum-master' },
        { role: 'developer', name: 'dev' },
      ],
    });
    const context = buildTeamContext(tmpDir);
    assert.ok(context !== null);
    assert.ok(context.includes('paused'));
    assert.ok(context.includes('test-team'));
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/team.test.cjs`
Expected: FAIL — `buildTeamContext` returns null for paused teams (only checks `status === 'active'`)

- [ ] **Step 3: Update `buildTeamContext`**

In `core/team.cjs`, replace the `buildTeamContext` function:

```js
/**
 * Build context string for team agents on session start.
 */
function buildTeamContext(rootDir) {
  const config = loadTeamConfig(rootDir);
  if (!config || config.status === 'disbanded') {
    return null;
  }

  // Skip if no team created yet
  if (!config.status) return null;

  const memberCount = config.members ? config.members.length : 0;
  const roles = config.members
    ? config.members.map(m => m.name).join(', ')
    : 'none';

  const statusLabel = config.status === 'active' ? '' : ` [${config.status}]`;
  return `Active team: ${config.team_name}${statusLabel} (${memberCount} members: ${roles})`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/team.test.cjs`
Expected: PASS — including existing tests (active team context still works, `null` for no config)

- [ ] **Step 5: Commit**

```bash
git add core/team.cjs tests/team.test.cjs
git commit -m "feat(team): buildTeamContext shows paused state"
```

---

### Task 4: Add `pause` sub-command to `commands/team.md`

**Files:**
- Modify: `commands/team.md:14-25` (routing table)
- Modify: `commands/team.md` (add new section after `run`)

- [ ] **Step 1: Update routing table**

In `commands/team.md`, update the sub-command routing table to include `pause` and `resume`:

```markdown
| Pattern | Action |
|---------|--------|
| `create` or `create --size <size>` | Create a new team |
| `status` | Show team status |
| `disband` | Graceful shutdown |
| `run` | Orchestrate roadmap phases with team |
| `pause` | Graceful pause — freeze team + stop workflow |
| `resume` | Resume paused team with options |
| *(empty)* | Show help if no team active, show status if team active |
| *(anything else)* | Natural language → route to Scrum Master |
```

Also update the routing disambiguation note to include `pause` and `resume`:

```markdown
**Routing disambiguation:** Match sub-commands (`create`, `status`, `disband`, `run`, `pause`, `resume`) as exact first-word match ONLY. If the first word is `create` but followed by a task description (e.g., "create a login page"), route to Scrum Master — do NOT trigger the `create` sub-command. Similarly, if the first word is `run` but followed by a task description (e.g., "run the tests"), route to Scrum Master — do NOT trigger the `run` sub-command.
```

- [ ] **Step 2: Add `pause` sub-command section**

Add after the `run` section (before `## Natural Language Routing`):

```markdown
---

## pause — Graceful Team Pause

Freeze the team and stop any running workflow at the nearest checkpoint.

1. **Check team status**
   - Read `.superteam/team/config.json`
   - If status is `"paused"`: "Team already paused. Use `/st:team resume` to continue."
   - If status is `"pausing"`: "Pause already requested. Waiting for current step to finish."
   - If status is `"disbanded"` or no config: "No active team. Run `/st:team create` first."
   - If status is `"active"`: proceed

2. **Set pausing flag**
   - Update `config.json` status → `"pausing"`
   - This signals the `run` orchestration loop to stop after the current step

3. **Check if workflow is running**
   - Read `.superteam/team/CONTEXT.md` for `## Run Progress` section
   - If run progress exists with an in-progress phase:
     - The orchestration loop will detect `"pausing"` and stop at the next checkpoint
     - Wait for the current step to complete, then snapshot state
   - If no run in progress:
     - Skip graceful stop — pause immediately

4. **Snapshot team state**
   - Build handoff data from CONTEXT.md run progress:
     ```json
     {
       "pausedAt": "[ISO timestamp]",
       "workflow": "run",
       "currentPhase": [phase number from CONTEXT.md],
       "currentStep": "[step from CONTEXT.md]",
       "completedSteps": [steps done for current phase],
       "pendingSteps": [steps remaining for current phase],
       "agentAssignments": [from TaskList if available],
       "reason": "user requested pause"
     }
     ```
   - Save to `.superteam/team/TEAM-HANDOFF.json` + `TEAM-HANDOFF.md`
   - If no run was in progress, save minimal handoff (no workflow/phase info)

5. **Set paused status**
   - Update `config.json` status → `"paused"`

6. **Report**
   ```
   ┌─────────────────────────────────────────┐
   │ ST > TEAM PAUSED                        │
   │─────────────────────────────────────────│
   │ Team: [team-name]                       │
   │ Phase: [N] — [name] (step: [step])      │
   │ Agents: available for individual use     │
   │                                         │
   │ Resume: /st:team resume                 │
   └─────────────────────────────────────────┘
   ```
```

- [ ] **Step 3: Commit**

```bash
git add commands/team.md
git commit -m "feat(team): add pause sub-command to team.md"
```

---

### Task 5: Add `resume` sub-command to `commands/team.md`

**Files:**
- Modify: `commands/team.md` (add new section after `pause`)

- [ ] **Step 1: Add `resume` sub-command section**

Add after the `pause` section:

```markdown
---

## resume — Resume Paused Team

Resume a paused team with selective options.

1. **Check team status**
   - Read `.superteam/team/config.json`
   - If status is not `"paused"`: "Team is not paused. Current status: [status]."
   - If status is `"paused"`: proceed

2. **Load handoff state**
   - Read `.superteam/team/TEAM-HANDOFF.json`
   - If handoff exists: display summary
   - If handoff missing: fallback to `.superteam/team/CONTEXT.md` for state reconstruction

3. **Check for codebase changes**
   - Compare current HEAD commit with `pausedAt` timestamp
   - If new commits since pause:
     ```
     ⚠ [N] commits since team was paused.
     Review changes before resuming? [yes / skip]
     ```
   - If "yes": show `git log --oneline` since pause timestamp

4. **Present resume options**
   ```
   ┌─────────────────────────────────────────┐
   │ ST > RESUME TEAM                        │
   │─────────────────────────────────────────│
   │ Paused: [timestamp] ([duration] ago)    │
   │ Phase: [N] — [name]                     │
   │ Step: [current step]                    │
   │ Completed: [steps]                      │
   │ Pending: [steps]                        │
   │─────────────────────────────────────────│
   │ Options:                                │
   │  [1] Resume all — unfreeze + continue   │
   │  [2] Resume team only — unfreeze only   │
   └─────────────────────────────────────────┘
   ```

5. **Execute chosen option**
   - **Resume all:**
     1. Set `config.json` status → `"active"`
     2. Clear handoff files (delete `TEAM-HANDOFF.json` + `TEAM-HANDOFF.md`)
     3. Invoke `team run` — the existing run resumption logic in CONTEXT.md will pick up where it left off
   - **Resume team only:**
     1. Set `config.json` status → `"active"`
     2. Clear handoff files
     3. Report: "Team active. Run `/st:team run` to continue workflow, or use agents individually."
```

- [ ] **Step 2: Commit**

```bash
git add commands/team.md
git commit -m "feat(team): add resume sub-command to team.md"
```

---

### Task 6: Add pause check to `team run` orchestration

**Files:**
- Modify: `commands/team.md` (run section)

- [ ] **Step 1: Add pause check instruction to run flow**

In `commands/team.md`, in the `## run — Orchestrate Roadmap Phases` section, add a new subsection after `### Flow Overview` and before `### Step 1: Research`:

```markdown
### Pause Check (every step boundary)

Before starting each step (Research, UI/UX Design, Plan, Execute, Verify), SM MUST:

1. Read `.superteam/team/config.json`
2. If `status === "pausing"`:
   - Snapshot current run progress to `TEAM-HANDOFF.json` + `TEAM-HANDOFF.md`:
     - `currentPhase`: current phase number
     - `currentStep`: the step that was ABOUT to start (not the one that just finished)
     - `completedSteps`: steps already done for this phase
     - `pendingSteps`: steps remaining including current
     - `agentAssignments`: current TaskList assignments
   - Set `config.json` status → `"paused"`
   - Display pause confirmation and STOP the run loop:
     ```
     ┌─────────────────────────────────────────┐
     │ ST > TEAM PAUSED (graceful stop)        │
     │─────────────────────────────────────────│
     │ Stopped before: [step name]             │
     │ Phase: [N] — [name]                     │
     │ Completed steps: [list]                 │
     │                                         │
     │ Resume: /st:team resume                 │
     └─────────────────────────────────────────┘
     ```
   - Return — do NOT continue to the next step
3. If `status !== "pausing"`: continue normally
```

- [ ] **Step 2: Update the Edge Cases table in the run section**

Add a row to the existing edge cases table:

```markdown
| `/st:team pause` during run | SM detects `"pausing"` at next step boundary → graceful stop |
```

- [ ] **Step 3: Update the Pause & Resume table in State Management**

Replace the existing Pause & Resume table with:

```markdown
**Pause & Resume:**

| Scenario | Behavior |
|---|---|
| `/st:team pause` during run | SM detects `"pausing"` at next step boundary → saves TEAM-HANDOFF → sets `"paused"` → stops |
| `/st:team resume` → Resume all | SM reads TEAM-HANDOFF → sets `"active"` → continues from saved step |
| `/st:team resume` → Resume team only | Sets `"active"` → clears handoff → user runs `/st:team run` manually |
| Session closes mid-run | SM writes progress to CONTEXT.md before shutdown (unchanged) |
| Next `/st:team run` after pause | SM reads CONTEXT.md → detects in-progress phase → asks "Resume phase [N] from step [X]?" |
```

- [ ] **Step 4: Commit**

```bash
git add commands/team.md
git commit -m "feat(team): add pause check to run orchestration loop"
```

---

### Task 7: Update argument-hint and description

**Files:**
- Modify: `commands/team.md:1-4` (frontmatter)

- [ ] **Step 1: Update frontmatter**

Replace the frontmatter:

```yaml
---
description: "Scrum team: create team, run roadmap, pause/resume, assign tasks, check status, disband — or natural language task routing"
argument-hint: "create [--size small/medium/large] | run | pause | resume | status | disband | <task description>"
---
```

- [ ] **Step 2: Run all tests to verify nothing broke**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add commands/team.md
git commit -m "feat(team): update frontmatter with pause/resume sub-commands"
```

---

### Task 8: Integration test — pause/resume helpers round-trip

**Files:**
- Test: `tests/team-features.test.cjs`

- [ ] **Step 1: Write integration test for full pause/resume cycle**

Add to `tests/team-features.test.cjs`:

```js
// ---------------------------------------------------------------------------
// Pause/Resume cycle
// ---------------------------------------------------------------------------

describe('team pause/resume cycle', () => {
  let tmpDir;
  before(() => { tmpDir = taoThuMucTam(); });
  after(() => { xoaThuMucTam(tmpDir); });

  it('full cycle: active → pausing → paused → active', () => {
    // Start with active team
    saveTeamConfig(tmpDir, {
      team_name: 'cycle-test',
      status: 'active',
      members: [{ role: 'scrum-master', name: 'scrum-master', model: 'opus' }],
    });
    assert.strictEqual(isTeamActive(tmpDir), true);
    assert.strictEqual(isTeamPaused(tmpDir), false);

    // User requests pause → pausing
    setTeamStatus(tmpDir, 'pausing');
    assert.strictEqual(isTeamPausing(tmpDir), true);
    assert.strictEqual(isTeamActive(tmpDir), false);

    // Graceful stop complete → save handoff → paused
    const handoff = {
      pausedAt: new Date().toISOString(),
      workflow: 'run',
      currentPhase: 2,
      currentStep: 'execute',
      completedSteps: ['research', 'plan'],
      pendingSteps: ['execute', 'verify'],
      agentAssignments: {},
      reason: 'user requested pause',
    };
    saveTeamHandoff(tmpDir, handoff);
    setTeamStatus(tmpDir, 'paused');
    assert.strictEqual(isTeamPaused(tmpDir), true);

    // Verify handoff persisted
    const loaded = loadTeamHandoff(tmpDir);
    assert.strictEqual(loaded.currentPhase, 2);
    assert.strictEqual(loaded.currentStep, 'execute');

    // Resume → active
    setTeamStatus(tmpDir, 'active');
    clearTeamHandoff(tmpDir);
    assert.strictEqual(isTeamActive(tmpDir), true);
    assert.strictEqual(loadTeamHandoff(tmpDir), null);
  });

  it('buildTeamContext reflects paused state', () => {
    saveTeamConfig(tmpDir, {
      team_name: 'ctx-test',
      status: 'paused',
      members: [{ role: 'developer', name: 'dev', model: 'sonnet' }],
    });
    const ctx = buildTeamContext(tmpDir);
    assert.ok(ctx.includes('paused'));
    assert.ok(ctx.includes('ctx-test'));
  });
});
```

Update the import at the top of `tests/team-features.test.cjs` to include the new functions:

```js
const {
  loadTeamConfig,
  saveTeamConfig,
  isTeamActive,
  isTeamPaused,
  isTeamPausing,
  setTeamStatus,
  saveTeamHandoff,
  loadTeamHandoff,
  clearTeamHandoff,
  buildTeamContext,
  // ... keep existing imports
} = require('../core/team.cjs');
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test tests/team-features.test.cjs`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add tests/team-features.test.cjs
git commit -m "test(team): add pause/resume integration tests"
```
