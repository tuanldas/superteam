# Superteam Plugin — Test Plan

## Automated Tests (71 tests)

```bash
npm test
```

Covers: detector, config, template, session-start hook, plugin structure, commands, skills, agents, templates, cross-module integration.

## Manual Test: Plugin Load

```bash
# Validate manifest
claude plugin validate /Users/tuanldas/Desktop/Codes/tuanldas/superteam

# Load plugin for a session
claude --plugin-dir /Users/tuanldas/Desktop/Codes/tuanldas/superteam
```

### Checklist

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 1 | Session starts without errors | No crash, context injected | |
| 2 | Context shows "Superteam Project Context" | Visible in session start | |
| 3 | Context suggests `/st:init` | Because .superteam/ doesn't exist | |
| 4 | `/st:` tab-complete shows commands | 29 commands listed | |
| 5 | `/st:quick hello world` runs | Creates mini plan, executes | |
| 6 | `/st:plan add a feature` runs | Planner agent spawned, plan created | |
| 7 | `/st:debug` on a test failure | Debugger agent spawned, investigation starts | |
| 8 | `/st:phase-list` without ROADMAP.md | Graceful error: "No ROADMAP.md found" | |
| 9 | Skills visible in system | `superteam:tdd-discipline` etc. discoverable | |
| 10 | Agents spawn correctly | Agent runs in isolated context | |

## Manual Test: Project Detection

```bash
# Test in a React project
cd /path/to/react-project
claude --plugin-dir /Users/tuanldas/Desktop/Codes/tuanldas/superteam
# Expected: context shows "Type: frontend", "Frameworks: react"

# Test in a Node/Express project
cd /path/to/express-project
claude --plugin-dir /Users/tuanldas/Desktop/Codes/tuanldas/superteam
# Expected: context shows "Type: backend", "Frameworks: express"

# Test in empty directory
cd $(mktemp -d)
claude --plugin-dir /Users/tuanldas/Desktop/Codes/tuanldas/superteam
# Expected: context shows "Type: unknown", suggests /st:init
```

## Manual Test: Init Flow

```bash
claude --plugin-dir /Users/tuanldas/Desktop/Codes/tuanldas/superteam
# Then: /st:init
```

| # | Step | Expected |
|---|------|----------|
| 1 | Detects project type | Shows detection result |
| 2 | Asks clarifying questions | Interactive questioning |
| 3 | Creates .superteam/config.json | Config file generated |
| 4 | Suggests next steps | Lists available commands |

## Manual Test: Plan → Execute Flow

```bash
claude --plugin-dir /Users/tuanldas/Desktop/Codes/tuanldas/superteam
# Then: /st:plan add a simple utility function
```

| # | Step | Expected |
|---|------|----------|
| 1 | Planner agent spawns | Goal-backward plan created |
| 2 | Plan-checker agent verifies | Quality gates checked |
| 3 | Plan presented to user | With must-haves, waves, tasks |
| 4 | `/st:execute` | Executor follows plan, atomic commits |
| 5 | Post-execution | Summary with commits, files changed |

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Run command without .superteam/ | Graceful fallback, suggest /st:init |
| 2 | Session-start in monorepo | Workspaces detected |
| 3 | Hook crashes (corrupt file) | Valid JSON fallback, no crash |
| 4 | Missing ROADMAP.md for phase commands | Clear error message |
| 5 | Large codebase (1000+ files) | Detector doesn't hang |
