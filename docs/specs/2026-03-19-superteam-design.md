# Superteam - Design Document

> Plugin system cho Claude Code: bộ agents, skills, commands tùy chỉnh theo từng loại dự án.

## 1. Tổng quan

### Mục tiêu
Xây dựng một hệ thống plugin cho Claude Code với các bộ agent, skill có thể tùy chỉnh theo từng loại dự án. Hệ thống tự động nhận biết loại project và apply workflow phù hợp. Mục tiêu thay thế hoàn toàn Superpowers và GSD.

### Bối cảnh
Sau khi tham khảo và sử dụng các plugins Superpowers (obra/superpowers) và GSD (get-shit-done), nhận thấy:
- Quy trình và skills không khớp với workflow thực tế
- Thiếu các skills chuyên biệt (README generator, API docs...)
- Cần khả năng tùy chỉnh workflow theo loại dự án (frontend thêm bước design trên Playwright MCP)
- Cần dễ dàng thêm skills mới khi phát hiện nhu cầu

### Quyết định kiến trúc
- **Approach:** Modular Plugin (Approach 3) - Claude Code plugin với skills tổ chức theo domain modules
- **Tech stack:** Pure Node.js (CommonJS) - không cần build step
- **Distribution:** npm + Claude Code marketplace
- **Tên:** superteam (prefix `/st:`)
- **npm package:** superteam (chưa bị chiếm)

### Tham khảo từ plugins hiện có
- **Superpowers:** Cấu trúc plugin (`.claude-plugin/`, skills, commands, hooks). Thuần Markdown prompt engineering.
- **GSD:** Node.js tooling layer (workflows, templates, research agents, phase/milestone management). Commands → workflows → templates pattern.

### Đã loại bỏ
- ~~State management (.superteam/state.json)~~ - không cần, Claude tự suy ra từ codebase. Workflow progress track bằng checkbox trong plan file. Dùng handoff pattern khi pause/resume.
- ~~Skill pack management (bật/tắt)~~ - không cần.
- ~~`/st:changelog`~~ - dùng tools có sẵn (standard-version, release-please).
- ~~Workflow layer (workflows/)~~ - logic orchestration nằm trực tiếp trong commands. Skills chỉ dùng cho cross-cutting patterns.

---

## 2. Feature List

Tất cả features nằm trong phase đầu tiên. Tổng: **36 features**.

### Core Framework (6)

| # | Tính năng | Mô tả |
|---|---|---|
| 1 | Plugin system | Đăng ký skills/commands/agents, load/unload |
| 2 | Project detection | Auto-detect loại project từ codebase + questioning để user bổ sung, luôn xác nhận |
| 3 | Scope detection | Trong monorepo, tự nhận biết command apply cho phần nào |
| 4 | Config system | Project-level config (.superteam/config.json) |
| 5 | Template engine | Load templates, inject variables từ detection + config |
| 6 | Session hooks | session-start, context-monitor, status-line |

### Skills / Commands (28)

| # | Tính năng | Mô tả |
|---|---|---|
| 8 | `/st:init` | Full init: detect → questioning → research → requirements → roadmap |
| 9 | `/st:readme` | Generate/update README từ codebase |
| 10 | `/st:api-docs` | Generate API documentation |
| 11 | `/st:ui-design` | Mockup/preview qua Playwright MCP |
| 12 | `/st:code-review` | Review code với subagent |
| 13 | `/st:plan` | Tạo plan cho task đơn lẻ (không cần roadmap) |
| 14 | `/st:execute` | Thực thi plan đơn lẻ |
| 15 | `/st:debug` | Systematic debugging workflow (full, persistent state) |
| 15.1 | `/st:debug-quick` | Quick debug cho bug đơn giản, escalate sang /st:debug nếu cần |
| 16 | `/st:tdd` | TDD workflow |
| 17 | `/st:quick` | Thực thi task nhanh, skip optional steps, vẫn atomic commits |
| 18 | `/st:pause` | Tạo handoff files (JSON + Markdown), commit WIP |
| 19 | `/st:resume` | Đọc handoff + scan artifacts, gợi ý next action |
| 20 | `/st:brainstorm` | Thảo luận ý tưởng, khám phá requirements trước khi plan |
| 21 | `/st:worktree` | Tạo git worktree isolated cho feature work |
| 22 | `/st:phase-add` | Thêm phase vào roadmap (smart positioning, gộp phase-insert) |
| 23 | `/st:phase-remove` | Xóa phase khỏi roadmap |
| ~~24~~ | ~~`/st:phase-insert`~~ | ~~Gộp vào `/st:phase-add`~~ |
| 25 | `/st:phase-list` | Liệt kê tất cả phases |
| 26 | `/st:phase-discuss` | Thảo luận context trước khi plan phase |
| 27 | `/st:phase-research` | Nghiên cứu cách implement phase |
| 28 | `/st:phase-plan` | Tạo plan chi tiết cho phase |
| 29 | `/st:phase-execute` | Thực thi phase |
| 30 | `/st:phase-validate` | Kiểm tra phase đã hoàn thành đúng |
| 31 | `/st:milestone-new` | Tạo milestone mới |
| 32 | `/st:milestone-audit` | Kiểm tra milestone hoàn thành chưa |
| 33 | `/st:milestone-complete` | Đánh dấu milestone xong, archive |
| 34 | `/st:milestone-archive` | Dọn dẹp files phase đã xong |

### Distribution (2)

| # | Tính năng | Mô tả |
|---|---|---|
| 35 | npm publish | Publish package lên npm |
| 36 | Claude Code marketplace | Đăng ký plugin trên marketplace |

---

## 3. Cấu trúc dự án

```
superteam/
├── .claude-plugin/
│   └── plugin.json              ← metadata cho Claude Code marketplace
├── package.json                 ← npm package config
├── hooks/
│   ├── hooks.json               ← hook registration
│   ├── session-start            ← inject context khi bắt đầu session
│   ├── context-monitor.cjs      ← theo dõi context usage
│   └── status-line.cjs          ← hiển thị trạng thái
├── core/
│   ├── detector.cjs             ← auto-detect project type + scope
│   ├── config.cjs               ← đọc/ghi .superteam/config.json
│   └── template.cjs             ← load + render templates
├── agents/
│   ├── reviewer.md              ← code review subagent
│   ├── planner.md               ← planning subagent
│   ├── executor.md              ← thực thi plan, atomic commits
│   ├── debugger.md              ← debug theo scientific method
│   ├── verifier.md              ← kiểm tra phase đạt goal chưa
│   ├── phase-researcher.md      ← research trước khi plan phase
│   ├── codebase-mapper.md       ← phân tích codebase
│   ├── integration-checker.md   ← kiểm tra cross-phase integration
│   ├── plan-checker.md          ← verify plan quality trước execute
│   ├── ui-researcher.md         ← tạo UI spec cho frontend phases
│   ├── ui-auditor.md            ← audit UI đã implement
│   ├── test-auditor.md          ← generate tests, verify coverage
│   └── research-synthesizer.md  ← tổng hợp kết quả research
├── commands/st/
│   ├── init.md
│   ├── readme.md
│   ├── api-docs.md
│   ├── ui-design.md
│   ├── code-review.md
│   ├── plan.md
│   ├── execute.md
│   ├── debug.md
│   ├── debug-quick.md
│   ├── tdd.md
│   ├── quick.md
│   ├── pause.md
│   ├── resume.md
│   ├── brainstorm.md
│   ├── worktree.md
│   ├── phase-add.md
│   ├── phase-remove.md
│   ├── phase-list.md
│   ├── phase-discuss.md
│   ├── phase-research.md
│   ├── phase-plan.md
│   ├── phase-execute.md
│   ├── phase-validate.md
│   ├── milestone-new.md
│   ├── milestone-audit.md
│   ├── milestone-complete.md
│   └── milestone-archive.md
├── skills/                      ← cross-cutting patterns, flat namespace
│   ├── project-awareness/SKILL.md       ← detect + inject project context
│   ├── scientific-debugging/SKILL.md    ← debugging methodology
│   ├── tdd-discipline/SKILL.md          ← red-green-refactor
│   ├── requesting-code-review/SKILL.md  ← dispatch reviewer, tiêu chí, severity
│   ├── receiving-code-review/SKILL.md   ← chống sycophantic, verify trước implement
│   ├── wave-parallelism/SKILL.md        ← parallel execution pattern
│   ├── handoff-protocol/SKILL.md        ← pause/resume protocol
│   └── verification/SKILL.md            ← goal-backward checking
└── templates/
    ├── readme.md
    ├── api-docs.md
    ├── config.json
    ├── project.md
    ├── requirements.md
    ├── roadmap.md
    └── handoff.json
```

### Per-project files (tạo khi `/st:init`)

```
my-project/
└── .superteam/
    ├── config.json
    ├── PROJECT.md              ← living doc, updated bởi các steps sau
    ├── REQUIREMENTS.md
    ├── ROADMAP.md
    ├── HANDOFF.json            ← tạo khi /st:pause, xóa khi /st:resume
    ├── research/
    │   ├── STACK.md
    │   ├── LANDSCAPE.md
    │   ├── ARCHITECTURE.md
    │   ├── PITFALLS.md
    │   └── SUMMARY.md
    └── plans/
        └── feature-name.md    ← plan files (checkbox tracking)
```

---

## 4. Core Engine

### 4.1 Project Detector (`core/detector.cjs`)

**Input:** project root path

**Output:**
```json
{
  "type": "frontend | backend | fullstack | monorepo | unknown",
  "frameworks": ["react", "express"],
  "workspaces": [
    { "name": "frontend", "path": "./frontend", "type": "frontend", "frameworks": ["react"] },
    { "name": "backend", "path": "./backend", "type": "backend", "frameworks": ["express"] }
  ],
  "confidence": 0.0 - 1.0
}
```

**Cách detect:** scan các file marker:
- `package.json` → đọc dependencies (react? express? next?)
- `composer.json` → PHP/Laravel
- `go.mod` → Go
- `Dockerfile`, `docker-compose.yml` → container setup
- `tsconfig.json`, `vite.config.*`, `next.config.*` → frontend framework cụ thể

Detector chạy trong step 2 của `/st:init`. Kết quả hiển thị cho user nhưng chưa confirm - dùng làm context cho deep questioning (step 3).

### 4.2 Config (`core/config.cjs`)

```json
// .superteam/config.json
{
  "name": "my-project",
  "type": "fullstack",
  "workspaces": {
    "frontend": "./frontend",
    "backend": "./backend"
  },
  "preferences": {
    "defaultBranch": "main",
    "commitStyle": "conventional"
  },
  "granularity": "coarse|standard|fine",
  "parallelization": true,
  "commit_docs": true,
  "model_profile": "balanced",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true
  }
}
```

### 4.3 Template Engine (`core/template.cjs`)

Load template từ `templates/`, inject variables từ detection + config. Ví dụ template `readme.md` có placeholders `{{projectName}}`, `{{description}}`, engine thay thế trước khi Claude sử dụng.

---

## 5. Commands Design ✅

Chi tiết flow cho từng command được tách vào files riêng tại `docs/specs/commands/`.

### Image Input Support (Cross-cutting)

Nhiều commands hỗ trợ image input (screenshot, diagram, wireframe...):

| Command | Image dùng cho |
|---|---|
| `/st:debug` | Screenshot lỗi, console output, UI bug |
| `/st:ui-design` | Reference, inspiration, wireframe vẽ tay |
| `/st:code-review` | Screenshot UI bug, visual regression |
| `/st:brainstorm` | Mockup, wireframe, diagram ý tưởng |
| `/st:init` | Architecture diagram, whiteboard notes |
| `/st:plan` | Wireframe, flow diagram cho task |

### Command Files

| # | Command | File | Trạng thái |
|---|---|---|---|
| 5.1 | `/st:init` | [st-init.md](commands/st-init.md) | ✅ Approved |
| 5.2 | `/st:readme` | [st-readme.md](commands/st-readme.md) | ✅ Approved |
| 5.3 | `/st:api-docs` | [st-api-docs.md](commands/st-api-docs.md) | ✅ Approved |
| 5.3.1 | `/st:api-docs-config` | [st-api-docs.md](commands/st-api-docs.md) | ✅ Approved (trong cùng file) |
| 5.4 | `/st:ui-design` | [st-ui-design.md](commands/st-ui-design.md) | ✅ Approved |
| 5.4.1 | `/st:design-system` | [st-design-system.md](commands/st-design-system.md) | ✅ Approved |
| 5.5 | `/st:code-review` | [st-code-review.md](commands/st-code-review.md) | ✅ Approved |
| 5.5.1 | `/st:review-feedback` | [st-review-feedback.md](commands/st-review-feedback.md) | ✅ Approved |
| 5.6 | `/st:plan` | [st-plan.md](commands/st-plan.md) | ✅ Approved |
| 5.7 | `/st:execute` | [st-execute.md](commands/st-execute.md) | ✅ Approved |
| 5.8 | `/st:debug` | [st-debug.md](commands/st-debug.md) | ✅ Approved |
| 5.8.1 | `/st:debug-quick` | [st-debug-quick.md](commands/st-debug-quick.md) | ✅ Approved |
| 5.9 | `/st:tdd` | [st-tdd.md](commands/st-tdd.md) | ✅ Approved |
| 5.10 | `/st:quick` | [st-quick.md](commands/st-quick.md) | ✅ Approved |
| 5.11 | `/st:pause` | [st-pause.md](commands/st-pause.md) | ✅ Approved |
| 5.12 | `/st:resume` | [st-resume.md](commands/st-resume.md) | ✅ Approved |
| 5.13 | `/st:brainstorm` | [st-brainstorm.md](commands/st-brainstorm.md) | ✅ Approved |
| 5.14 | `/st:worktree` | [st-worktree.md](commands/st-worktree.md) | ✅ Approved |
| 5.15 | `/st:phase-add` | [st-phase-add.md](commands/st-phase-add.md) | ✅ Approved |
| 5.16 | `/st:phase-remove` | [st-phase-remove.md](commands/st-phase-remove.md) | ✅ Approved |
| 5.17 | `/st:phase-insert` | ~~Gộp vào `/st:phase-add`~~ | ✅ Merged |
| 5.18 | `/st:phase-list` | [st-phase-list.md](commands/st-phase-list.md) | ✅ Approved |
| 5.19 | `/st:phase-discuss` | [st-phase-discuss.md](commands/st-phase-discuss.md) | ✅ Approved |
| 5.20 | `/st:phase-research` | [st-phase-research.md](commands/st-phase-research.md) | ✅ Approved |
| 5.21 | `/st:phase-plan` | [st-phase-plan.md](commands/st-phase-plan.md) | ✅ Approved |
| 5.22 | `/st:phase-execute` | [st-phase-execute.md](commands/st-phase-execute.md) | ✅ Approved |
| 5.23 | `/st:phase-validate` | [st-phase-validate.md](commands/st-phase-validate.md) | ✅ Approved |
| 5.24 | `/st:milestone-new` | [st-milestone-new.md](commands/st-milestone-new.md) | ✅ Approved |
| 5.25 | `/st:milestone-audit` | [st-milestone-audit.md](commands/st-milestone-audit.md) | ✅ Approved |
| 5.26 | `/st:milestone-complete` | [st-milestone-complete.md](commands/st-milestone-complete.md) | ✅ Approved |
| 5.27 | `/st:milestone-archive` | [st-milestone-archive.md](commands/st-milestone-archive.md) | ✅ Approved |

### Quy trình thiết kế

Xem [command-design-process.md](command-design-process.md) - mỗi command đều qua brainstorming skill.

---

## 6. Skills Design (10 skills) — Cross-cutting patterns

Skills là **pattern/methodology tái sử dụng**, không map 1:1 với commands. Mỗi skill có thể được nhiều commands load, hoặc auto-triggered khi phù hợp. Flat namespace trong `skills/`.

### Kiến trúc

```
User gõ /st:execute
  → commands/st/execute.md        (entry point + full orchestration logic)
    → load skill: atomic-commits   (cross-cutting pattern)
    → load skill: wave-parallelism (cross-cutting pattern)
    → spawn agent: executor        (subagent persona)
    → render template: ...         (file generation)
```

### Danh sách skills

| # | Skill | File | Dùng bởi commands | Auto-trigger? | Trạng thái |
|---|---|---|---|---|---|
| 6.1 | project-awareness | `skills/project-awareness/SKILL.md` | init, mọi command qua session-start | ✅ Mỗi session | ✅ Done |
| 6.2 | atomic-commits | `skills/atomic-commits/SKILL.md` | execute, quick, tdd, phase-execute | ✅ Khi viết code | ✅ Done |
| 6.3 | research-methodology | `skills/research-methodology/SKILL.md` | init, phase-research, brainstorm | ❌ | ✅ Done |
| 6.4 | scientific-debugging | `skills/scientific-debugging/SKILL.md` | debug, debug-quick | ✅ Khi gặp bug | ✅ Done |
| 6.5 | tdd-discipline | `skills/tdd-discipline/SKILL.md` | tdd | ✅ Khi viết test | ✅ Done |
| 6.6a | requesting-code-review | `skills/requesting-code-review/SKILL.md` | code-review | ✅ Khi review | ✅ Done |
| 6.6b | receiving-code-review | `skills/receiving-code-review/SKILL.md` | review-feedback | ✅ Khi nhận review | ✅ Done |
| 6.7 | wave-parallelism | `skills/wave-parallelism/SKILL.md` | execute, phase-execute | ❌ | ✅ Done |
| 6.8 | handoff-protocol | `skills/handoff-protocol/SKILL.md` | pause, resume | ❌ | ✅ Done |
| 6.9 | plan-quality | `skills/plan-quality/SKILL.md` | plan, phase-plan | ✅ Khi tạo plan | ✅ Done |
| 6.10 | verification | `skills/verification/SKILL.md` | phase-validate, milestone-audit | ✅ Trước khi mark done | ✅ Done |

### Quyết định kiến trúc

- **Bỏ layer workflows** — logic orchestration nằm trực tiếp trong commands (self-contained)
- **Skills không phải bản sao commands** — skills là pattern/methodology được nhiều commands chia sẻ
- **Flat namespace** — không phân nhóm theo domain, dễ tìm và load
- **Tham khảo:** Superpowers dùng skills làm đơn vị chính (14 skills, auto-triggered). GSD không dùng skills ở plugin level (chỉ per-project). Superteam kết hợp: commands là entry point, skills là cross-cutting patterns.

> TODO: Thiết kế chi tiết prompt cho từng skill

---

## 7. Templates Design (7 templates)

Templates với placeholders, được template engine render với variables từ detection + config.

| # | Template | File | Trạng thái |
|---|---|---|---|
| 7.1 | README | `templates/readme.md` | ⬜ TODO |
| 7.2 | API docs | `templates/api-docs.md` | ⬜ TODO |
| 7.3 | Config | `templates/config.json` | ⬜ TODO |
| 7.4 | Project | `templates/project.md` | ⬜ TODO |
| 7.5 | Requirements | `templates/requirements.md` | ⬜ TODO |
| 7.6 | Roadmap | `templates/roadmap.md` | ⬜ TODO |
| 7.7 | Handoff | `templates/handoff.json` | ⬜ TODO |

> TODO: Thiết kế chi tiết nội dung và placeholders cho từng template

---

## 8. Agents Design (13 agents)

| # | Agent | File | Chức năng | Trạng thái |
|---|---|---|---|---|
| 8.1 | reviewer | `agents/reviewer.md` | Code review | ✅ Done |
| 8.2 | planner | `agents/planner.md` | Tạo plan | ✅ Done |
| 8.3 | executor | `agents/executor.md` | Thực thi plan, atomic commits | ✅ Done |
| 8.4 | debugger | `agents/debugger.md` | Debug theo scientific method | ✅ Done |
| 8.5 | verifier | `agents/verifier.md` | Kiểm tra phase đạt goal | ✅ Done |
| 8.6 | phase-researcher | `agents/phase-researcher.md` | Research trước khi plan | ✅ Done |
| 8.7 | codebase-mapper | `agents/codebase-mapper.md` | Phân tích codebase | ✅ Done |
| 8.8 | integration-checker | `agents/integration-checker.md` | Kiểm tra cross-phase integration | ✅ Done |
| 8.9 | plan-checker | `agents/plan-checker.md` | Verify plan quality | ✅ Done |
| 8.10 | ui-researcher | `agents/ui-researcher.md` | Tạo UI spec cho frontend | ✅ Done |
| 8.11 | ui-auditor | `agents/ui-auditor.md` | Audit UI đã implement | ✅ Done |
| 8.12 | test-auditor | `agents/test-auditor.md` | Generate tests, verify coverage | ✅ Done |
| 8.13 | research-synthesizer | `agents/research-synthesizer.md` | Tổng hợp kết quả research | ✅ Done |

> TODO: Chi tiết prompt, trigger, model cho từng agent

---

## 9. Hooks Design (3 hooks)

| # | Hook | File | Chức năng | Trạng thái |
|---|---|---|---|---|
| 9.1 | session-start | `hooks/session-start` | Inject context khi bắt đầu session | ⬜ TODO |
| 9.2 | context-monitor | `hooks/context-monitor.cjs` | Theo dõi context usage | ⬜ TODO |
| 9.3 | status-line | `hooks/status-line.cjs` | Hiển thị trạng thái project | ⬜ TODO |

> TODO: Chi tiết implementation

---

## 10. Distribution

| # | Channel | Mô tả | Trạng thái |
|---|---|---|---|
| 10.1 | npm | Publish package `superteam` lên npm | ⬜ TODO |
| 10.2 | Claude Code marketplace | Đăng ký plugin qua `.claude-plugin/plugin.json` | ⬜ TODO |

> TODO: Chi tiết setup
