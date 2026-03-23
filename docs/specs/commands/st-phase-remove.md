# `/st:phase-remove` - Xóa Phase khỏi Roadmap

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Xóa phase khỏi ROADMAP.md. Bắt buộc reassign REQ-IDs sang phase khác trước khi xóa (đảm bảo 100% coverage). AI detect dependencies và cảnh báo nếu phases khác phụ thuộc. Cho phép xóa mọi status nhưng cảnh báo mạnh với completed/in-progress. Tự động renumber phases sau khi xóa.

**Yêu cầu:** ROADMAP.md phải tồn tại.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Infrastructure | Yêu cầu ROADMAP.md | Phase commands phụ thuộc roadmap |
| REQ handling | Bắt buộc reassign trước khi xóa | Đảm bảo 100% requirement coverage |
| Safety | Cảnh báo mạnh nhưng cho xóa mọi status | User có quyền quyết định, nhưng phải aware |
| Dependencies | AI detect + cảnh báo | Tránh break roadmap logic |
| Renumber | Tự động sau khi xóa | Giữ thứ tự liên tục |

## Flow

```
/st:phase-remove [phase number hoặc name]
VD: "/st:phase-remove 3"
    "/st:phase-remove authentication"
    "/st:phase-remove" → show list, hỏi chọn

1. Check context
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse phases hiện có
   - Identify phase cần xóa (by number hoặc name)
   - Nếu không argument → show list phases, hỏi chọn
    ↓
2. Show phase details
   ┌──────────────────────────────────────┐
   │ PHASE SẼ XÓA                        │
   ├──────────────────────────────────────┤
   │ Phase [X]: [name]                   │
   │ Status: [status]                    │
   │ Requirements: REQ-012, REQ-013      │
   │ Success criteria: [N] items         │
   │ [Nếu có plan files: list]           │
   └──────────────────────────────────────┘
    ↓
3. Status warning (nếu không phải planned)
   → completed:
     "⚠ CẢNH BÁO: Phase này ĐÃ HOÀN THÀNH.
      Xóa sẽ không undo code đã viết.
      Bạn chắc chắn muốn xóa? (y/n)"
   → in-progress:
     "⚠ CẢNH BÁO: Phase này ĐANG THỰC HIỆN.
      Có thể có WIP code và plan files.
      Bạn chắc chắn muốn xóa? (y/n)"
   → planned: không cảnh báo đặc biệt
    ↓
4. Dependency check
   - AI phân tích: phases nào phụ thuộc output của phase bị xóa?
   → Có dependencies:
     ┌──────────────────────────────────────┐
     │ ⚠ DEPENDENCY WARNING                │
     ├──────────────────────────────────────┤
     │ Phases sau phụ thuộc phase [X]:     │
     │                                      │
     │ Phase [Y]: [name]                   │
     │   → Cần [output] từ phase [X]      │
     │                                      │
     │ Phase [Z]: [name]                   │
     │   → REQ-015 liên quan đến REQ-012  │
     │                                      │
     │ Recommend: review lại phases trên   │
     │ sau khi xóa.                        │
     │ Tiếp tục xóa? (y/n)                │
     └──────────────────────────────────────┘
   → Không dependencies: tiếp tục
    ↓
5. Reassign requirements (bắt buộc)
   - AI suggest phase phù hợp cho mỗi REQ-ID:
     ┌──────────────────────────────────────┐
     │ REASSIGN REQUIREMENTS                │
     ├──────────────────────────────────────┤
     │ REQ-012: User authentication        │
     │   → Suggest: Phase [Y] (API Layer) │
     │                                      │
     │ REQ-013: Session management         │
     │   → Suggest: Phase [Y] (API Layer) │
     │                                      │
     │ REQ-015: Password reset             │
     │   → Suggest: Phase [Z] (User Mgmt) │
     └──────────────────────────────────────┘
   - User: approve / thay đổi assignment
   - Tất cả REQ-IDs phải được reassign → mới cho tiếp
    ↓
6. Execute removal
   - Xóa phase section khỏi ROADMAP.md
   - Renumber tất cả phases sau: [X+1]→[X], [X+2]→[X+1]...
   - Cập nhật REQ-ID assignments trong ROADMAP.md
   - Xóa plan files liên quan (nếu có): .superteam/plans/[phase-name].md
   - Commit: "docs: remove phase [X] - [name], renumber [X+1]→[N]"
    ↓
7. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► PHASE REMOVED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Removed: Phase [X] - [name]
   REQs reassigned: [N] requirements
   Renumbered: Phase [X+1]→[N] → [X]→[N-1]
   Total phases: [N-1]
```

## So sánh

| | GSD (inferred) | Superpowers | Superteam |
|---|---|---|---|
| Remove phase | Có | Không | Có + safety layers |
| REQ reassign | Không rõ | Không | Bắt buộc trước khi xóa |
| Status protection | Không rõ | Không | Cảnh báo completed/in-progress |
| Dependency check | Không | Không | AI detect + cảnh báo |
| Renumber | Có | Không | Tự động |
| Plan cleanup | Không rõ | Không | Xóa plan files liên quan |

## Cải thiện

1. **Bắt buộc REQ reassign** — đảm bảo 100% coverage luôn được giữ
2. **AI dependency detection** — cảnh báo phases bị ảnh hưởng
3. **Status-aware warning** — cảnh báo mạnh cho completed/in-progress
4. **Plan cleanup** — dọn plan files liên quan
