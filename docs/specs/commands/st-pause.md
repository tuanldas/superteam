# `/st:pause` - Pause & Handoff

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Pause bất kỳ workflow nào đang chạy (execute, debug, quick, ui-design...). Tạo 2 handoff files (JSON + Markdown), commit WIP. Handoff ghi lại state đầy đủ bao gồm mental state/context. Files bị xóa sau khi resume (one-shot).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Handoff format | 2 files: HANDOFF.json (machine) + HANDOFF.md (human) | Machine-readable cho resume + human-readable cho context |
| Mental state | Có — section context/notes ghi lại observations, concerns, vibe | Rất hữu ích khi resume sau nhiều ngày |
| Scope | Universal — mọi workflow (execute, debug, quick, ui-design...) | User không cần nhớ command nào hỗ trợ, luôn hoạt động |
| One-shot | Xóa sau resume | Tránh stale handoff gây confuse |
| WIP commit | Có | Bảo vệ code chưa xong |

## Flow

```
1. Input
   - User: "/st:pause" hoặc "/st:pause cần đi họp"
   - Optional message: lý do pause, notes cho lần resume
    ↓
2. Detect current state
   - Workflow đang chạy: execute / debug / quick / ui-design / plan / ...
   - Phase/task hiện tại (nếu có)
   - Files đã modified (git status)
   - Plans đang thực thi
   - Debug sessions đang active
   - Uncommitted changes
    ↓
3. Gather context
   - AI tổng hợp:
     → Completed: những gì đã xong (tasks, commits)
     → Remaining: những gì còn lại
     → Decisions: quyết định đã đưa ra + rationale
     → Blockers: vấn đề đang block (nếu có)
     → Context/mental state: observations, concerns,
       "đang nghi ngờ approach X", "user muốn đổi hướng Y"
     → Next action: bước tiếp theo khi resume
    ↓
4. Write handoff files

   .superteam/HANDOFF.json:
   {
     "version": 1,
     "timestamp": "ISO",
     "workflow": "execute | debug | quick | ui-design | plan | ...",
     "phase": "phase-name (nếu có)",
     "task": { "current": 3, "total": 8 },
     "completed_tasks": [
       { "name": "...", "commit": "abc123" }
     ],
     "remaining_tasks": ["..."],
     "blockers": [
       { "type": "technical | human_action | external", "description": "..." }
     ],
     "decisions": [
       { "decision": "...", "rationale": "..." }
     ],
     "uncommitted_files": ["..."],
     "next_action": "...",
     "context": "...",
     "user_message": "cần đi họp"
   }

   .superteam/HANDOFF.md:
   ---
   workflow: execute
   phase: add-auth
   task: 3/8
   status: paused
   timestamp: 2026-03-20T10:00:00Z
   ---

   ## Current State
   Đang thực thi phase "add-auth", task 3/8: "Setup JWT middleware"

   ## Completed Work
   - Task 1: Create User model (commit abc123)
   - Task 2: Setup bcrypt hashing (commit def456)

   ## Remaining Work
   - Task 3: Setup JWT middleware (IN PROGRESS)
   - Task 4-8: ...

   ## Decisions Made
   - Chọn JWT over session cookies — stateless, phù hợp API

   ## Blockers
   - Không có

   ## Context
   User muốn refresh token flow đơn giản, không cần revocation list.
   Approach hiện tại đang clean, tiếp tục hướng này.

   ## Next Action
   Hoàn thành JWT middleware: tạo file src/middleware/auth.ts
    ↓
5. Commit WIP
   - Stage uncommitted changes
   - Commit: "wip: [workflow] paused at [state description]"
    ↓
6. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► PAUSED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Workflow: [execute/debug/quick/...]
   Progress: [N]/[M] tasks
   Handoff: .superteam/HANDOFF.json + HANDOFF.md
   ▶ Chạy /st:resume để tiếp tục
```

## So sánh

| | GSD | Superpowers | gstack | Superteam |
|---|---|---|---|---|
| Pause | Có | Không | Browser only | Có |
| Scope | Phase execution only | N/A | Browser control | Universal (mọi workflow) |
| Handoff format | JSON + Markdown | N/A | Browser state | JSON + Markdown |
| Mental state | Có | N/A | N/A | Có |
| One-shot | Có | N/A | Không | Có |

## Cải thiện so với industry

1. **Universal scope** → mọi workflow, không chỉ execute
2. **Mental state** → ghi lại observations/concerns cho AI resume sau
3. **User message** → user ghi note lý do pause, context cho lần sau
