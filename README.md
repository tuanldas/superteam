# Superteam

Claude Code plugin with customizable agents, skills, and commands tailored to different project types. Auto-detects your project and applies appropriate workflows.

Replaces [Superpowers](https://github.com/obra/superpowers) and [GSD](https://github.com/get-shit-done).

## Install

```bash
claude plugin add superteam
```

Or from local directory:

```bash
claude plugin add /path/to/superteam
```

### Add as Marketplace

To add Superteam as a marketplace source (enables `claude plugin add st@superteam`):

```bash
# From GitHub
claude /plugin  →  Add Marketplace  →  tuanldas/superteam

# From local directory
claude /plugin  →  Add Marketplace  →  /path/to/superteam
```

Requires Node.js >= 18. Zero external dependencies.

## Commands

All commands use the `/st:` prefix.

### Core Workflow

| Command | Description |
|---------|-------------|
| `/st:init` | Initialize project: detect, question, research, requirements, roadmap |
| `/st:plan` | Create implementation plan for a task |
| `/st:execute` | Execute a plan with atomic commits |
| `/st:quick` | Execute a simple task, skip optional steps |
| `/st:brainstorm` | Explore ideas before planning |

### Development

| Command | Description |
|---------|-------------|
| `/st:tdd` | Test-driven development workflow |
| `/st:debug` | Systematic debugging with persistent state |
| `/st:debug-quick` | Quick debug, escalates to `/st:debug` if needed |
| `/st:code-review` | Code review with subagent |
| `/st:review-feedback` | Respond to code review feedback |
| `/st:worktree` | Create isolated git worktree |

### Documentation

| Command | Description |
|---------|-------------|
| `/st:readme` | Generate/update README |
| `/st:api-docs` | Generate API documentation |
| `/st:ui-design` | UI mockup/preview via Playwright MCP |
| `/st:design-system` | Manage design system tokens |

### Phase Management

| Command | Description |
|---------|-------------|
| `/st:phase-add` | Add phase to roadmap |
| `/st:phase-remove` | Remove phase from roadmap |
| `/st:phase-list` | List all phases |
| `/st:phase-discuss` | Discuss context before planning |
| `/st:phase-research` | Deep research with parallel agents |
| `/st:phase-plan` | Create detailed phase plan |
| `/st:phase-execute` | Execute phase with wave parallelism |
| `/st:phase-validate` | Validate phase completion |

### Milestone Management

| Command | Description |
|---------|-------------|
| `/st:milestone-new` | Create new milestone |
| `/st:milestone-audit` | Audit milestone completion |
| `/st:milestone-complete` | Complete and archive milestone |
| `/st:milestone-archive` | Clean up phase files |

### Session

| Command | Description |
|---------|-------------|
| `/st:pause` | Save context for later (handoff files + WIP commit) |
| `/st:resume` | Restore context from previous session |

## Skills

Skills are cross-cutting methodologies shared across commands. They enforce discipline, not just provide guidance.

| Skill | Used by |
|-------|---------|
| `project-awareness` | All commands (via session-start) |
| `atomic-commits` | execute, quick, tdd, phase-execute |
| `research-methodology` | init, phase-research, brainstorm |
| `scientific-debugging` | debug, debug-quick |
| `tdd-discipline` | tdd |
| `requesting-code-review` | code-review |
| `receiving-code-review` | review-feedback |
| `wave-parallelism` | execute, phase-execute |
| `handoff-protocol` | pause, resume |
| `plan-quality` | plan, phase-plan |
| `verification` | phase-validate, milestone-audit |

## Agents

13 specialized subagents for parallel and focused work:

`reviewer` `planner` `executor` `debugger` `verifier` `phase-researcher` `research-synthesizer` `codebase-mapper` `integration-checker` `plan-checker` `ui-researcher` `ui-auditor` `test-auditor`

## Project Detection

Superteam auto-detects your project type on session start:

| Detection | Markers |
|-----------|---------|
| Frontend | react, vue, @angular/core, svelte |
| Backend | express, fastify, @nestjs/core, koa, hono |
| Fullstack | next, nuxt, remix |
| PHP | composer.json, artisan |
| Go | go.mod |
| Python | pyproject.toml, requirements.txt |
| Rust | Cargo.toml |
| Monorepo | package.json workspaces, pnpm-workspace.yaml, lerna.json |

## Project Config

After `/st:init`, config lives at `.superteam/config.json`:

```json
{
  "name": "my-project",
  "type": "fullstack",
  "preferences": {
    "defaultBranch": "main",
    "commitStyle": "conventional"
  },
  "granularity": "standard",
  "parallelization": true,
  "model_profile": "balanced",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true
  }
}
```

## Architecture

```
superteam/
├── .claude-plugin/plugin.json   # Plugin manifest
├── package.json
├── core/
│   ├── detector.cjs             # Project type + scope detection
│   ├── config.cjs               # Config load/save/validate
│   └── template.cjs             # Template engine
├── hooks/
│   ├── hooks.json               # Hook registration
│   ├── session-start.cjs        # Inject project context
│   ├── context-monitor.cjs      # (v0.2.0)
│   └── statusline.cjs           # (v0.2.0)
├── commands/st/                  # 27 commands (Markdown prompts)
├── skills/                       # 10 skills (Markdown prompts)
├── agents/                       # 13 agent definitions
├── templates/                    # 7 document templates
└── tests/                        # node --test
```

Pure Node.js (CommonJS), zero external dependencies, `node --test` for testing.

## Development

```bash
# Run tests
npm test

# Run specific test
node --test tests/detector.test.cjs
```

## License

MIT
