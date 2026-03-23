# `/st:quick` - Quick Execute

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Thực thi task nhanh: gộp plan + execute thành 1 bước. AI tự tạo mini plan 1-3 tasks rồi thực thi luôn, không cần user approve plan. Skip optional agents mặc định, bật lại bằng composable flags. Vẫn giữ atomic commits và tracking.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Scope | Gộp plan + execute thành 1 bước, skip optional agents | Nhanh, ít ceremony |
| Plan | AI tự tạo mini plan 1-3 tasks, không cần user approve | Tốc độ, user đã biết muốn gì |
| Commits | Adaptive — 1 task = single commit, 2-3 tasks = atomic | Cân bằng tốc độ và traceability |
| Tracking | Full — `.superteam/quick/{id}-{slug}/` với PLAN.md + SUMMARY.md | Có history, dọn dẹp khi archive |
| Flags | 3 composable: `--discuss`, `--research`, `--full` | Tuneable quality |
| Image input | Có | Screenshot/wireframe → implement theo |

## Flow

```
1. Input
   - User mô tả task: "/st:quick thêm dark mode toggle"
   - Hoặc không argument → hỏi "Task gì?"
   - Flags: --discuss, --research, --full (composable)
   - Image input: screenshot, wireframe
    ↓
2. Check context
   - .superteam/ tồn tại? → load config, PROJECT.md
   - Scan codebase: files liên quan, patterns, conventions
    ↓
3. Discussion phase (chỉ với --discuss)
   - Identify 2-4 gray areas / assumptions
   - Hỏi user qua 1-2 câu hỏi focused
   - Ghi vào CONTEXT.md
    ↓
4. Research phase (chỉ với --research)
   - Spawn focused researcher agent
   - Research ngắn gọn (1-2 pages)
   - Ghi vào RESEARCH.md
    ↓
5. Create task directory
   - mkdir .superteam/quick/{id}-{slug}/
   - Generate id: auto-increment
   - Generate slug: từ task description
    ↓
6. Auto-plan (1-3 tasks, không cần user approve)
   - AI tạo mini plan:
     → Mỗi task có: action, files, acceptance criteria
     → Target 1-3 tasks (không quá 3)
   - Ghi vào PLAN.md
   - Plan-checker (chỉ với --full, max 2 iterations)
    ↓
7. Execute
   - Thực thi từng task trong plan
   - Atomic commits:
     → 1 task → single commit
     → 2-3 tasks → mỗi task 1 commit riêng
   - Deviation rules:
     → Auto-fix bugs (không cần hỏi)
     → Auto-add missing critical functionality
     → ASK về architectural changes
   - Ghi SUMMARY.md khi xong
    ↓
8. Verification (chỉ với --full)
   - Spawn verifier agent
   - Check task đạt goal
    ↓
9. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► QUICK COMPLETE ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tasks: [N] | Commits: [M]
   Files changed: [list]
```

## Flags

| Flag | Bật thêm | Mặc định |
|------|----------|----------|
| `--discuss` | Discussion phase (gray areas, assumptions) | Skip |
| `--research` | Research agent trước khi plan | Skip |
| `--full` | Plan-checker (max 2 iterations) + verifier | Skip |

Flags composable: `/st:quick --discuss --full thêm dark mode`

## Khi nào dùng `/st:quick` vs `/st:plan` + `/st:execute`

| | `/st:quick` | `/st:plan` + `/st:execute` |
|---|---|---|
| Task size | Nhỏ (1-3 tasks) | Trung bình → lớn |
| Plan approval | Không cần | User review + approve |
| Research | Optional (flag) | AI recommend theo complexity |
| Granularity | Luôn COARSE (1-3 tasks) | Adaptive (COARSE/STANDARD/FINE) |
| UI Design gate | Không | Có |
| Plan-checker | Optional (flag) | Luôn có (3 iterations) |
| Verifier | Optional (flag) | Luôn có |

## So sánh

| | GSD quick | Superpowers | gstack | Superteam |
|---|---|---|---|---|
| Quick mode | Có | Không | Không | Có |
| Plan | 1-3 tasks, no approve | Cần pre-written plan | N/A | 1-3 tasks, no approve |
| Flags | 3 composable | N/A | N/A | 3 composable |
| Tracking | Full directory + STATE.md | Không | Không | Full directory + SUMMARY.md |
| Commits | Atomic | Atomic | Atomic | Adaptive (1→single, 2-3→atomic) |
| Image input | Không | Không | Không | Có |

## Cải thiện so với industry

1. **Image input** → screenshot/wireframe cho quick UI tasks
2. **Adaptive commits** → 1 task không cần overhead atomic, 2-3 tasks mới atomic
3. **Composable flags** → tuneable quality giống GSD nhưng thêm image support
