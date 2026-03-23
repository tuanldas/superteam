# `/st:worktree` - Git Worktree Management

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Quản lý git worktree cho feature work isolation. Hỗ trợ full lifecycle: create, list, switch, cleanup. Vừa là command trực tiếp cho user, vừa tích hợp vào commands khác (execute, plan gợi ý dùng worktree). Raw git commands cho full control và cross-session support. Tích hợp pause/resume qua HANDOFF per-worktree.

**Khi nào dùng:**
- Muốn isolate feature work khỏi main branch
- Làm song song nhiều features
- Execute plan trong môi trường sạch

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Kiểu command | Trực tiếp + tích hợp vào commands khác | User gọi khi cần, execute/plan gợi ý dùng |
| Thao tác | Full: create, list, switch, cleanup | Quản lý đầy đủ lifecycle |
| Implementation | Raw git commands | Full control, cross-session, hỗ trợ mọi thao tác |
| Directory | .superteam/worktrees/ | Consistent với cấu trúc .superteam/, tự gitignore |
| Branch naming | Convention + AI suggest, user override | feature/, fix/, refactor/ — nhất quán nhưng linh hoạt |
| Dependency install | Auto-detect (npm, pip, cargo, go, composer) | Setup sẵn, không cần thủ công |
| Test baseline | Chạy test sau create | Đảm bảo worktree bắt đầu clean |
| Pause/resume | HANDOFF per-worktree + worktrees.json registry | Mỗi worktree pause/resume độc lập, không conflict |
| Existing branch | Hỗ trợ checkout existing branch vào worktree | Không chỉ tạo mới |

## Flow

```
/st:worktree [subcommand] [args]

Subcommands: create | list | switch | cleanup
Không argument → hỏi muốn làm gì

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE: /st:worktree create [description]
   VD: "/st:worktree create dark mode feature"
       "/st:worktree" → hỏi → "tạo worktree cho gì?"

   1. Check context
      - Đang ở trong worktree rồi?
        → Cảnh báo: "Bạn đang trong worktree [name].
          Tạo worktree mới sẽ từ main branch. Tiếp tục?"
      - .superteam/ tồn tại? → load config (commitStyle, defaultBranch)
      - Uncommitted changes?
        → "Có [N] changes chưa commit. Commit trước hay stash?"
    ↓
   2. Branch naming
      - AI suggest dựa trên description:
        → "dark mode feature" → feature/dark-mode
        → "fix auth bug" → fix/auth-bug
        → "refactor API layer" → refactor/api-layer
      - Pattern: [type]/[kebab-case-name]
      - Types: feature, fix, refactor, chore, docs, test
      - Trình bày: "Branch: feature/dark-mode — đồng ý hay đổi tên?"
      - User: approve / override
    ↓
   3. Safety check
      - .superteam/worktrees/ trong .gitignore?
        → Không: tự động thêm vào .gitignore, commit
      - Directory .superteam/worktrees/ tồn tại?
        → Không: tạo
    ↓
   4. Create worktree
      - Base branch: defaultBranch từ config (hoặc main/master)
      - Tạo mới: git worktree add .superteam/worktrees/[name] -b [branch-name]
      - Existing branch: git worktree add .superteam/worktrees/[name] [branch-name]
      - cd vào worktree
    ↓
   5. Setup worktree
      - Copy .superteam/config.json vào worktree
      - Tạo .superteam/ directory trong worktree
      - Cập nhật .superteam/worktrees.json ở main project (registry)
    ↓
   6. Install dependencies (auto-detect)
      - package.json → npm install (skip nếu node_modules/ tồn tại)
      - requirements.txt / pyproject.toml → pip install / poetry install
      - Cargo.toml → cargo build
      - go.mod → go mod download
      - composer.json → composer install
      - Không detect được → skip
    ↓
   7. Test baseline
      - Auto-detect test command từ package.json scripts, Makefile...
      - Chạy test suite
      → Pass:
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         ST ► WORKTREE CREATED ✓
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Branch: feature/dark-mode
        Path: .superteam/worktrees/dark-mode
        Tests: 42 passed
        ▶ Ready to work!
      → Fail:
        "⚠ [N] tests failed trước khi bắt đầu.
         Tiếp tục hay investigate?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIST: /st:worktree list

   - git worktree list + enrich thông tin
   - Đọc .superteam/worktrees.json cho metadata
   - Trình bày:
     ┌──────────────────────────────────────────────┐
     │ WORKTREES                                    │
     ├──────────────────────────────────────────────┤
     │ ● dark-mode (active)                        │
     │   Branch: feature/dark-mode                 │
     │   Path: .superteam/worktrees/dark-mode      │
     │   Status: 3 modified files                  │
     │   Last commit: 2h ago — "add theme toggle"  │
     │                                              │
     │ ○ api-refactor (paused)                     │
     │   Branch: refactor/api-layer                │
     │   Path: .superteam/worktrees/api-refactor   │
     │   Status: clean                             │
     │   Last commit: 1d ago — "restructure routes"│
     │                                              │
     │ ○ main (bare)                               │
     │   Path: /project/root                       │
     │   Status: clean                             │
     └──────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SWITCH: /st:worktree switch [name]

   1. Nếu không argument → show list, hỏi chọn
   2. Uncommitted changes ở worktree hiện tại?
      → "Có changes chưa commit. Commit / stash / bỏ qua?"
   3. cd vào worktree đích
   4. Show status:
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ST ► SWITCHED TO dark-mode
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      Branch: feature/dark-mode
      Modified: 3 files
      Last commit: "add theme toggle" (2h ago)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLEANUP: /st:worktree cleanup [name | --all]

   1. Nếu không argument → show list, hỏi chọn
   2. Safety checks:
      - Uncommitted changes? → cảnh báo + xác nhận
      - Unmerged commits?
        → "Branch [name] có [N] commits chưa merge.
           Merge trước / Force delete / Cancel?"
   3. Cleanup:
      - git worktree remove [path]
      - git branch -d [branch] (nếu merged)
      - git branch -D [branch] (nếu user force confirm)
      - Xóa entry trong .superteam/worktrees.json
   4. --all: cleanup tất cả worktrees (trừ main)
      - Show list + confirm trước khi xóa
   5. Done:
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ST ► WORKTREE REMOVED ✓
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      Removed: dark-mode (feature/dark-mode)
```

## Worktree Registry

```json
// .superteam/worktrees.json (ở main project root)
{
  "worktrees": [
    {
      "name": "dark-mode",
      "branch": "feature/dark-mode",
      "path": ".superteam/worktrees/dark-mode",
      "status": "active",
      "created": "2026-03-20T10:00:00Z"
    },
    {
      "name": "api-refactor",
      "branch": "refactor/api-layer",
      "path": ".superteam/worktrees/api-refactor",
      "status": "paused",
      "created": "2026-03-19T14:30:00Z"
    }
  ]
}
```

- Cập nhật khi: create (add entry), cleanup (remove entry), pause (status → paused), resume (status → active)
- Status: `active` | `paused`
- Đọc bởi: `/st:worktree list`, `/st:resume`

## Tích hợp với commands khác

```
/st:execute:
  - Trước khi execute: "Recommend tạo worktree để isolate.
    Dùng /st:worktree create [task-name]?"
  - User: đồng ý → tạo worktree → execute trong đó
  - User: từ chối → execute trên branch hiện tại

/st:plan:
  - Trong plan output: "▶ /st:worktree create [plan-name]
    trước khi /st:execute"

/st:pause (trong worktree):
  - HANDOFF.json ghi vào .superteam/ CỦA WORKTREE đó
  - Mỗi worktree có HANDOFF riêng → không conflict
  - Cập nhật .superteam/worktrees.json ở main: status → "paused"

/st:resume:
  - Scan .superteam/worktrees.json ở main
  - Detect worktrees đang paused
  - "Có worktree dark-mode đang paused. Chuyển vào và resume?"
  - Auto cd vào worktree + load HANDOFF.json từ worktree đó
  - Cập nhật registry: status → "active"
```

## Per-worktree .superteam/

```
Khi CREATE worktree:
  - Tạo .superteam/ trong worktree
  - Copy config.json từ main
  - Worktree có .superteam/ riêng cho:
    → HANDOFF.json (khi pause)
    → plans/ (plan files cho work trong worktree)

Ở main project:
  - .superteam/worktrees.json (registry tổng)
  - .superteam/worktrees/ (directory chứa worktrees)
```

## So sánh

| | Superpowers | Claude Code Built-in | Superteam |
|---|---|---|---|
| Kiểu | Skill ẩn, gọi bởi skills khác | Tool trực tiếp khi user nói "worktree" | Command trực tiếp + tích hợp |
| Thao tác | Chỉ create | Create + remove | Create + list + switch + cleanup |
| Implementation | Raw git commands | Built-in tools (session-aware) | Raw git commands |
| Directory | .worktrees/ hoặc ~/.config/ | .claude/worktrees/ | .superteam/worktrees/ |
| Branch naming | Không convention | Random name | AI suggest + convention |
| Existing branch | Không | Không | Có |
| Dependency install | Auto-detect | Không | Auto-detect |
| Test baseline | Bắt buộc | Không | Bắt buộc |
| Cross-session | Không rõ | Không (session-scoped) | Có (worktrees.json registry) |
| Pause/resume | Không tích hợp | Không | HANDOFF per-worktree |
| Safety | Gitignore check | Refuse if dirty | Gitignore + dirty + unmerged warning |
| Registry | Không | Không | .superteam/worktrees.json |

## Cải thiện so với industry

1. **Full lifecycle** — create/list/switch/cleanup trong 1 command, cả Superpowers và Claude Code đều thiếu list/switch
2. **Cross-session** — worktrees.json registry + HANDOFF per-worktree, resume ở session mới tự tìm lại worktree
3. **AI branch naming** — convention-based suggest, user override. Cả hai đều không có
4. **Existing branch support** — checkout branch có sẵn vào worktree, cả hai đều chỉ tạo mới
5. **HANDOFF per-worktree** — mỗi worktree pause/resume độc lập, không conflict
6. **Tích hợp commands** — execute/plan proactive gợi ý, pause/resume aware
