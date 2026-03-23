# `/st:resume` - Resume from Handoff

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Resume workflow đã pause. Đọc handoff files, hiển thị status, cho user chọn hành động. Hoạt động cả khi không có handoff files (hybrid reconstruct). Xóa handoff files sau resume thành công.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Reconstruct | Hybrid — ưu tiên handoff files, offer reconstruct nếu không có | Linh hoạt, không bắt buộc đã pause |
| Routing | Show options — status + nhiều lựa chọn | User quyết định, không auto-route |
| Cleanup | Xóa HANDOFF.json + HANDOFF.md sau resume thành công | Tránh stale handoff |

## Flow

```
1. Input
   - User: "/st:resume"
    ↓
2. Check handoff files
   - .superteam/HANDOFF.json tồn tại?
     → Có: load structured data
     → Không: .superteam/HANDOFF.md tồn tại?
       → Có: parse YAML frontmatter + content
       → Không: offer reconstruct
         "Không tìm thấy handoff. Muốn tôi scan project
          để xác định trạng thái?"
         → User đồng ý: scan .superteam/, git log, plan files,
           debug sessions → reconstruct state
         → User từ chối: "OK, dùng /st:pause lần sau"
    ↓
3. Validate state
   - Uncommitted files trong HANDOFF.json còn match git status?
   - Plan files còn tồn tại?
   - Debug sessions còn active?
   - Nếu inconsistency → cảnh báo user
    ↓
4. Present status

   ┌──────────────────────────────────────────────┐
   │ ST ► RESUME                                  │
   ├──────────────────────────────────────────────┤
   │ Workflow: [execute]                          │
   │ Phase: [add-auth]                            │
   │ Progress: ███████░░░░░ 3/8 tasks             │
   │ Paused: 2026-03-20T10:00:00Z (2 hours ago)  │
   │ Next: Setup JWT middleware                    │
   ├──────────────────────────────────────────────┤
   │ Context: User muốn refresh token flow đơn    │
   │ giản, không cần revocation list              │
   ├──────────────────────────────────────────────┤
   │ Blockers: Không có                           │
   └──────────────────────────────────────────────┘
    ↓
5. Show options

   Lựa chọn:
   1) Tiếp tục [workflow] từ task [N]
   2) Xem chi tiết handoff (HANDOFF.md)
   3) Bắt đầu task khác (giữ handoff cho sau)
   4) Hủy handoff (xóa files, bắt đầu mới)

   → User chọn → thực hiện
    ↓
6. Execute choice
   - Option 1: Route tới đúng workflow
     → execute → tiếp /st:execute từ task N
     → debug → tiếp /st:debug (load debug session)
     → quick → tiếp /st:quick (load plan)
     → ui-design → tiếp /st:ui-design
   - Xóa HANDOFF.json + HANDOFF.md
    ↓
7. Done (nếu chọn option 1)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► RESUMED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Continuing: [workflow] from task [N]/[M]
```

## Reconstruct (khi không có handoff files)

```
Scan order:
1. .superteam/plans/ → plan files có tasks chưa checked
2. .superteam/debug/ → active debug sessions (status ≠ resolved)
3. .superteam/quick/ → quick tasks chưa có SUMMARY.md
4. git log → recent WIP commits
5. git status → uncommitted changes

Trình bày findings → user chọn resume cái nào
```

## So sánh

| | GSD | Superpowers | gstack | Superteam |
|---|---|---|---|---|
| Resume | Có | Không | Browser only | Có |
| Reconstruct | Có (từ artifacts) | N/A | N/A | Hybrid (offer nếu thiếu) |
| Routing | Auto + quick resume | N/A | Auto | Show options, user chọn |
| Cleanup | Xóa sau resume | N/A | Không | Xóa sau resume |

## Cải thiện so với industry

1. **Hybrid reconstruct** → hoạt động cả khi quên pause
2. **Show options** → user quyết định: tiếp, xem detail, task khác, hủy
3. **Universal scope** → resume bất kỳ workflow nào
4. **State validation** → check consistency trước khi resume
