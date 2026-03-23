# `/st:phase-list` - Liệt Kê Phases

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Hiển thị danh sách tất cả phases trong ROADMAP.md với status, requirements, và progress. Hỗ trợ filter theo status. Command đọc-only, không thay đổi gì.

**Yêu cầu:** ROADMAP.md phải tồn tại.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Thông tin | Full: status + REQs + criteria progress | Overview đầy đủ trong 1 lệnh |
| Filter | Optional filter theo status | Hữu ích khi nhiều phases |
| Sort | Theo thứ tự trong ROADMAP (số phase) | Giữ đúng thứ tự logic |

## Flow

```
/st:phase-list [--planned | --in-progress | --completed]
VD: "/st:phase-list"              → tất cả
    "/st:phase-list --planned"    → chỉ planned
    "/st:phase-list --in-progress" → chỉ đang làm

1. Check context
   - ROADMAP.md tồn tại?
     → Không: "Chưa có ROADMAP.md. Chạy /st:init trước."
     → Có: parse tất cả phases
    ↓
2. Parse phases
   - Đọc mỗi phase: số, tên, status, REQ-IDs, success criteria
   - Tính progress: criteria đã check / tổng
   - Apply filter nếu có flag
    ↓
3. Trình bày
   ┌──────────────────────────────────────────────────┐
   │ ROADMAP — Milestone: v1.0                        │
   │ Total: [N] phases | ✅ [X] | 🔄 [Y] | ⏳ [Z]   │
   ├──────────────────────────────────────────────────┤
   │                                                  │
   │ ✅ Phase 1: Core Framework                       │
   │    REQs: REQ-001, REQ-002, REQ-003              │
   │    Progress: 3/3 criteria ██████████ 100%        │
   │                                                  │
   │ 🔄 Phase 2: Documentation Commands              │
   │    REQs: REQ-004, REQ-005                       │
   │    Progress: 1/2 criteria █████░░░░░ 50%         │
   │                                                  │
   │ ⏳ Phase 3: Authentication System                │
   │    REQs: REQ-012, REQ-013, REQ-015              │
   │    Progress: 0/4 criteria ░░░░░░░░░░ 0%          │
   │                                                  │
   │ ⏳ Phase 4: API Layer                            │
   │    REQs: REQ-006, REQ-007, REQ-008              │
   │    Progress: 0/3 criteria ░░░░░░░░░░ 0%          │
   │                                                  │
   ├──────────────────────────────────────────────────┤
   │ ▶ "/st:phase-discuss [N]" để bắt đầu phase      │
   │ ▶ "/st:phase-add" để thêm phase mới             │
   └──────────────────────────────────────────────────┘
```

## So sánh

| | GSD | Superpowers | Superteam |
|---|---|---|---|
| Phase listing | Có (trong progress) | Không | Có, command riêng |
| Progress bar | Không rõ | Không | Visual progress bar |
| Filter | Không rõ | Không | Filter theo status |
| REQ display | Không rõ | Không | Hiển thị REQ-IDs |
| Next action | Không rõ | Không | Gợi ý command tiếp |

## Cải thiện

1. **Visual progress bar** — dễ scan nhanh tình trạng mỗi phase
2. **Filter theo status** — focus vào những gì cần quan tâm
3. **Summary header** — tổng quan nhanh (bao nhiêu completed/in-progress/planned)
4. **Next action suggest** — gợi ý command phù hợp
