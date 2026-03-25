---
description: "Git worktree management: create, list, switch, cleanup for feature work isolation"
argument-hint: "[create|list|switch|cleanup] [args]"
---

# Git Worktree Management

Manage git worktrees for feature work isolation. Full lifecycle: create, list, switch, cleanup. Integrates with pause/resume via per-worktree HANDOFF files.

**Arguments:** "$ARGUMENTS"

## Workflow

Parse subcommand from arguments: `create`, `list`, `switch`, `cleanup`.
If no subcommand provided, ask: "What would you like to do? (create / list / switch / cleanup)"

---

### CREATE: `/st:worktree create [description]`

1. **Check context**
   - Already inside a worktree? Warn: "You are in worktree [name]. New worktree will branch from main. Continue?"
   - Load `.superteam/config.json` (commitStyle, defaultBranch) if exists
   - Uncommitted changes? Ask: "[N] uncommitted changes found. Commit first or stash?"
   - Use `superteam:project-awareness` to load project context

2. **Branch naming**
   - Suggest branch name from description:
     - "dark mode feature" -> `feature/dark-mode`
     - "fix auth bug" -> `fix/auth-bug`
     - "refactor API layer" -> `refactor/api-layer`
   - Pattern: `[type]/[kebab-case-name]`
   - Types: `feature`, `fix`, `refactor`, `chore`, `docs`, `test`
   - Present: "Branch: feature/dark-mode -- approve or rename?"
   - User approves or overrides

3. **Safety check**
   - `.superteam/worktrees/` in `.gitignore`? If not: add it, commit
   - `.superteam/worktrees/` directory exists? If not: create it

4. **Create worktree**
   - Base branch: `defaultBranch` from config (or main/master)
   - New branch: `git worktree add .superteam/worktrees/[name] -b [branch-name]`
   - Existing branch: `git worktree add .superteam/worktrees/[name] [branch-name]`

5. **Setup worktree**
   - Copy `.superteam/config.json` into the worktree
   - Create `.superteam/` directory in worktree
   - Update `.superteam/worktrees.json` registry in main project

6. **Install dependencies** (auto-detect)
   - `package.json` -> `npm install`
   - `requirements.txt` / `pyproject.toml` -> `pip install` / `poetry install`
   - `Cargo.toml` -> `cargo build`
   - `go.mod` -> `go mod download`
   - `composer.json` -> `composer install`
   - None detected -> skip

7. **Test baseline**
   - Auto-detect test command from package.json scripts, Makefile, etc.
   - Run test suite
   - Pass:
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST > WORKTREE CREATED
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Branch: [branch-name]
     Path: .superteam/worktrees/[name]
     Tests: [N] passed
     > Ready to work!
     ```
   - Fail: "[N] tests failed before starting. Continue or investigate?"

---

### LIST: `/st:worktree list`

1. Run `git worktree list` and enrich with metadata from `.superteam/worktrees.json`
2. Display:
   ```
   ┌──────────────────────────────────────────────┐
   │ WORKTREES                                    │
   ├──────────────────────────────────────────────┤
   │ * [name] (active)                            │
   │   Branch: [branch]                           │
   │   Path: .superteam/worktrees/[name]          │
   │   Status: [N] modified files                 │
   │   Last commit: [time] -- "[message]"         │
   │                                              │
   │ - [name] (paused)                            │
   │   Branch: [branch]                           │
   │   Path: .superteam/worktrees/[name]          │
   │   Status: clean                              │
   │   Last commit: [time] -- "[message]"         │
   │                                              │
   │ - main (bare)                                │
   │   Path: [project root]                       │
   │   Status: clean                              │
   └──────────────────────────────────────────────┘
   ```

---

### SWITCH: `/st:worktree switch [name]`

1. If no argument: show list and ask user to choose
2. Check uncommitted changes in current worktree:
   - "Uncommitted changes found. Commit / stash / ignore?"
3. Change directory to target worktree
4. Display:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > SWITCHED TO [name]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Branch: [branch]
   Modified: [N] files
   Last commit: "[message]" ([time] ago)
   ```

---

### CLEANUP: `/st:worktree cleanup [name | --all]`

1. If no argument: show list and ask user to choose
2. **Safety checks:**
   - Uncommitted changes? Warn and confirm
   - Unmerged commits? "Branch [name] has [N] unmerged commits. Merge first / Force delete / Cancel?"
3. **Execute cleanup:**
   - `git worktree remove [path]`
   - `git branch -d [branch]` (if merged)
   - `git branch -D [branch]` (if user force-confirmed)
   - Remove entry from `.superteam/worktrees.json`
4. `--all`: cleanup all worktrees (except main). Show full list and confirm before proceeding.
5. Done:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > WORKTREE REMOVED
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Removed: [name] ([branch])
   ```

## Rules

- Always ensure `.superteam/worktrees/` is in `.gitignore` before creating worktrees.
- Use AI-suggested branch naming with `[type]/[kebab-case]` convention. Let user override.
- Support both new branch creation and checking out existing branches.
- Auto-detect and install dependencies after creating a worktree.
- Run test baseline after creation to confirm a clean starting state.
- Maintain `.superteam/worktrees.json` registry for cross-session tracking.
- Warn about uncommitted changes and unmerged commits before destructive operations.
- Each worktree gets its own `.superteam/` directory for independent pause/resume via `superteam:handoff-protocol`.
- Integrate with `/st:pause` and `/st:resume` -- per-worktree HANDOFF files, no conflicts.
