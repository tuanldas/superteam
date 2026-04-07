# CLAUDE.md Reinit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite CLAUDE.md from scratch following Comprehensive Template best practices — balancing project briefing with behavior guide.

**Architecture:** Single file rewrite. Replace current 77-line rules-only CLAUDE.md with ~65-line comprehensive version covering Commands, Architecture, Key Files, Code Style, Testing, Gotchas, and Versioning.

**Tech Stack:** Markdown

---

### Task 1: Write new CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace CLAUDE.md with new content**

```markdown
# Superteam Plugin

Claude Code plugin: customizable agents, skills, and commands.

## Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (Node.js built-in runner) |
| `node --test tests/<file>.test.cjs` | Run single test file |

## Architecture

```
superteam/
├── agents/          # 22 agent definitions (.md) — specialized roles (developer, reviewer, planner...)
├── commands/        # 28 command definitions (.md) — user-facing workflows (/debug, /plan, /execute...)
├── skills/          # 14 skill directories — reusable knowledge & behavior (SKILL.md + references/)
├── core/            # JS modules (.cjs) — runtime logic (config, decisions, detector, team, template, utils)
├── hooks/           # Session hooks (session-start.cjs, hooks.json)
├── templates/       # Project scaffolding templates (project.md, roadmap.md, config.json...)
├── tests/           # Node.js built-in test runner (*.test.cjs)
├── docs/            # Specs and plans
└── .claude-plugin/  # Plugin metadata (plugin.json, marketplace.json)
```

## Key Files

- `.claude-plugin/plugin.json` — Plugin entry point, defines agents/commands/skills/hooks
- `core/detector.cjs` — Detects project context (tech stack, frameworks)
- `core/config.cjs` — Plugin configuration management
- `core/decisions.cjs` — Decision persistence (decisions.json)
- `core/template.cjs` — Template rendering engine
- `hooks/session-start.cjs` — Session initialization hook

## Code Style

- CommonJS (`.cjs`) — all core modules use `require()`/`module.exports`
- Agent/command/skill definitions are Markdown files, not code
- Skill frontmatter: only `name` and `description` fields — no `trigger`, `keywords`, `tags`
- Skill structure: `SKILL.md` + optional `references/` subdirectory

## Testing

- `npm test` — Node.js built-in test runner (`node --test`)
- Test files: `tests/*.test.cjs`
- No external test framework (no Jest, Mocha, Vitest)

## Gotchas

- KHÔNG dùng `run_in_background: true` khi spawn agents — luôn chạy foreground parallel
- Preview HTML tạo tại `.superteam/preview/<name>.html`, default light background
- Skill writing: dispatch Agent opus riêng biệt với `/superpowers:writing-skills`, KHÔNG viết trực tiếp trong main context
- Research output = findings, không phải instructions. Auto-save OK, auto-apply decisions = KHÔNG OK
- `skills/core-principles/` là single source of truth cho cross-cutting rules — KHÔNG duplicate vào commands/agents/CLAUDE.md

## Versioning

Bump tất cả 4 files trước commit cuối: `package.json`, `package-lock.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Patch (x.x.Y): bugfix. Minor (x.Y.0): feature mới, thay đổi kiến trúc
```

- [ ] **Step 2: Verify file content**

Run: `wc -l CLAUDE.md`
Expected: ~60-70 lines

- [ ] **Step 3: Run tests to ensure nothing is broken**

Run: `npm test`
Expected: All tests pass (CLAUDE.md change should not affect tests)

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "refactor: rewrite CLAUDE.md with comprehensive template"
```
