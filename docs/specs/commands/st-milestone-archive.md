# `/st:milestone-archive` - Archive Milestone

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Dọn dẹp files sau khi milestone completed. Move phase directories + research vào milestones/v{X.Y}-phases/, xóa REQUIREMENTS.md gốc (backup đã có trong milestones/). Giữ: config.json, PROJECT.md, MILESTONES.md, ROADMAP.md (chứa history), plans/. Show danh sách trước, user xác nhận rồi mới thực hiện.

**Yêu cầu:** Milestone đã completed (có entry trong MILESTONES.md).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Prerequisite | Milestone đã completed (MILESTONES.md entry) | Phải complete trước mới archive |
| Cleanup scope | Full: phases/ + research/ + REQUIREMENTS.md gốc | Dọn sạch cho milestone mới |
| Archive target | .superteam/milestones/v{X.Y}-phases/ | Cùng nhóm với milestone docs |
| Confirm | Show danh sách + user xác nhận trước khi dọn | An toàn, tránh xóa nhầm |
| Giữ lại | config.json, PROJECT.md, MILESTONES.md, ROADMAP.md, plans/ | Living docs + config + history |
| ROADMAP.md | Giữ nguyên (chứa history nối thẳng) | Không xóa vì milestone mới sẽ nối thêm |
| plans/ | Giữ nguyên | Có thể reference across milestones |

## Flow

```
/st:milestone-archive [version]
VD: "/st:milestone-archive v1.0"
    "/st:milestone-archive" → detect milestone vừa completed

1. Check context
   - MILESTONES.md tồn tại?
     → Không: "Chưa có milestone nào completed.
        Chạy /st:milestone-complete trước." → Dừng
   - Xác định milestone cần archive:
     → Có argument: dùng version đó
     → Không argument: tìm milestone completed gần nhất
       chưa archive (không có *-phases/ directory)
   - Kiểm tra đã archive chưa:
     → .superteam/milestones/v{X.Y}-phases/ tồn tại?
     → Có: "Milestone v{X.Y} đã archive. Archive lại? (y/n)"
    ↓
2. Scan artifacts + show danh sách
   - Tìm tất cả files/directories liên quan:
     → phases/ directories (thuộc milestone)
     → research/ directory
     → REQUIREMENTS.md gốc
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ MILESTONE ARCHIVE                    │
     ├──────────────────────────────────────┤
     │ Milestone: v1.0 — MVP               │
     │                                      │
     │ Sẽ move vào                         │
     │ milestones/v1.0-phases/:            │
     │   📁 phases/core-framework/          │
     │   📁 phases/documentation/           │
     │   📁 phases/authentication/          │
     │   📁 phases/api-layer/              │
     │   📁 phases/testing/                │
     │   📁 research/                      │
     │                                      │
     │ Sẽ xóa (backup trong milestones/):  │
     │   📄 REQUIREMENTS.md                │
     │                                      │
     │ Sẽ giữ:                             │
     │   📄 config.json                    │
     │   📄 PROJECT.md                     │
     │   📄 MILESTONES.md                  │
     │   📄 ROADMAP.md (history)           │
     │   📁 milestones/                    │
     │   📁 plans/                         │
     │                                      │
     │ Tiếp tục? (y/n)                     │
     └──────────────────────────────────────┘
   - User: confirm → tiếp
   - User: cancel → dừng
    ↓
3. Execute archive
   - Tạo: .superteam/milestones/v{X.Y}-phases/
   - Move: phases/* → milestones/v{X.Y}-phases/
   - Move: research/ → milestones/v{X.Y}-phases/research/
   - Delete: REQUIREMENTS.md gốc
   - Commit: "chore: archive milestone v{X.Y} phase files"
    ↓
4. Verify clean state
   - Scan .superteam/ và trình bày:
     ┌──────────────────────────────────────┐
     │ CLEAN STATE                          │
     ├──────────────────────────────────────┤
     │ .superteam/                         │
     │   📄 config.json          ✓        │
     │   📄 PROJECT.md           ✓        │
     │   📄 MILESTONES.md        ✓        │
     │   📄 ROADMAP.md           ✓        │
     │   📁 milestones/          ✓        │
     │     📁 v1.0/                        │
     │       📄 ROADMAP.md                 │
     │       📄 REQUIREMENTS.md            │
     │       📄 v1.0-AUDIT.md              │
     │     📁 v1.0-phases/                 │
     │       📁 core-framework/            │
     │       📁 documentation/             │
     │       📁 authentication/            │
     │       📁 api-layer/                 │
     │       📁 testing/                   │
     │       📁 research/                  │
     │   📁 plans/               ✓        │
     │                                      │
     │ Sẵn sàng cho milestone mới ✓        │
     └──────────────────────────────────────┘
    ↓
5. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► MILESTONE ARCHIVED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Archived: v{X.Y} ([N] phase directories + research)
   Location: .superteam/milestones/v{X.Y}-phases/
   Cleaned: REQUIREMENTS.md

   ▶ "/st:milestone-new để tạo milestone tiếp"
```

## So sánh

| | GSD cleanup | Superpowers | Superteam |
|---|---|---|---|
| Trigger | Manual | Không có | Manual |
| Cleanup scope | Chỉ phase dirs | N/A | Full: phases + research + REQUIREMENTS gốc |
| Archive target | milestones/v{X.Y}-phases/ | N/A | milestones/v{X.Y}-phases/ |
| Confirm | Không rõ | N/A | Show danh sách chi tiết + user confirm |
| Clean state verify | Không | N/A | Scan + trình bày clean state |
| ROADMAP handling | Không rõ | N/A | Giữ nguyên (chứa history nối thẳng) |
| plans/ | Không rõ | N/A | Giữ nguyên (reusable) |

## Cải thiện so với industry

1. **Full cleanup** — không chỉ phase dirs, còn research + REQUIREMENTS gốc
2. **Show danh sách + confirm** — user biết chính xác gì sẽ move/xóa/giữ trước khi thực hiện
3. **Clean state verification** — scan và trình bày .superteam/ sau archive, confirm sạch
4. **Tách từ complete** — user chọn lúc nào cleanup, có thể reference phase files trước
5. **plans/ preserved** — plans có thể reference across milestones
