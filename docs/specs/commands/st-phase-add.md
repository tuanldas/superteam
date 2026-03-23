# `/st:phase-add` - Thêm Phase vào Roadmap

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Thêm phase mới vào ROADMAP.md với smart positioning. AI phân tích dependencies giữa các phases để suggest vị trí tốt nhất (cuối hoặc giữa), giải thích lý do, user xác nhận. Bắt buộc link REQ-IDs, AI suggest success criteria. Nếu insert giữa, tự động renumber phases sau.

**Gộp `/st:phase-insert`:** Command này thay thế cả phase-add lẫn phase-insert. AI tự phân tích vị trí thay vì user phải chọn command khác.

**Yêu cầu:** ROADMAP.md phải tồn tại (chạy `/st:init` trước).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Infrastructure | Yêu cầu ROADMAP.md | Phase commands phụ thuộc roadmap |
| Positioning | AI smart suggest + user confirm | AI phân tích dependencies, không fix cứng cuối |
| Requirements | Bắt buộc link REQ-IDs | Mọi phase phải gắn với requirements |
| Success criteria | AI suggest 2-5, user confirm | Nhanh, nhất quán, user kiểm soát |
| Renumber | Tự động khi insert giữa | Giữ thứ tự liên tục |
| Gộp phase-insert | Có — 1 command xử lý mọi vị trí | Giảm commands, AI quyết định vị trí |

## ROADMAP.md Format (dùng chung cho mọi phase commands)

```markdown
# Roadmap

> Milestone: v1.0 — [mô tả milestone]

## Phase 1: Core Framework
- **Status:** ✅ completed
- **Requirements:** REQ-001, REQ-002, REQ-003
- **Success Criteria:**
  - [x] Plugin loads and registers commands
  - [x] Project detector identifies project type correctly
  - [x] Config reads/writes .superteam/config.json

## Phase 2: Documentation Commands
- **Status:** 🔄 in-progress
- **Requirements:** REQ-004, REQ-005
- **Success Criteria:**
  - [x] /st:readme generates README from codebase
  - [ ] /st:api-docs generates API documentation

## Phase 3: Workflow Engine
- **Status:** ⏳ planned
- **Requirements:** REQ-006, REQ-007, REQ-008
- **Success Criteria:**
  - [ ] Plan creation with adaptive granularity
  - [ ] Wave-based parallel execution
  - [ ] Pause/resume with handoff files
```

**Quy tắc format:**
- Phases đánh số thứ tự liên tục (1, 2, 3...)
- Status: `✅ completed` | `🔄 in-progress` | `⏳ planned`
- Requirements: danh sách REQ-IDs từ REQUIREMENTS.md, bắt buộc ≥ 1
- Success criteria: checkbox format (`- [ ]` / `- [x]`), 2-5 items
- Milestone header ở trên cùng (quản lý bởi milestone commands)
- Khi renumber: chỉ đổi số, không đổi nội dung

## Flow

```
/st:phase-add [description]
VD: "/st:phase-add authentication system"
    "/st:phase-add" → hỏi "Thêm phase gì?"

1. Check context
   - ROADMAP.md tồn tại?
     → Không: "Chưa có ROADMAP.md. Chạy /st:init trước."
       → Dừng
     → Có: load ROADMAP.md + REQUIREMENTS.md + PROJECT.md
   - Parse phases hiện có:
     → Số lượng, tên, REQ-IDs đã assigned, status
     → Dependencies giữa các phases (từ content + REQ relationships)
    ↓
2. Analyze position (smart positioning)
   - AI phân tích:
     → Phase mới phụ thuộc output gì từ phases trước?
     → Phases nào sẽ cần output của phase mới?
     → REQ-IDs liên quan nằm gần phases nào?
     → Complexity progression: đơn giản → phức tạp
   - AI suggest vị trí + giải thích:
     ┌──────────────────────────────────────┐
     │ VỊ TRÍ ĐỀ XUẤT                     │
     ├──────────────────────────────────────┤
     │ Phase [X]: authentication-system    │
     │                                      │
     │ Lý do đặt ở vị trí [X]:            │
     │ - Phase [X-1] "Core Framework" tạo │
     │   config system mà auth cần dùng    │
     │ - Phase [X] hiện tại "API Layer"    │
     │   sẽ cần auth middleware            │
     │ → Đặt trước API Layer để API có    │
     │   thể dùng auth ngay               │
     │                                      │
     │ Ảnh hưởng renumber:                 │
     │ - Phase [X] → Phase [X+1]          │
     │ - Phase [X+1] → Phase [X+2]        │
     │ - ...                               │
     │                                      │
     │ Hoặc: đặt cuối (Phase [N+1])        │
     │ nếu không muốn renumber             │
     └──────────────────────────────────────┘
   - User: approve vị trí / chọn vị trí khác / đặt cuối
    ↓
3. Link requirements
   - AI scan REQUIREMENTS.md:
     → REQ-IDs chưa assigned cho phase nào
     → REQ-IDs liên quan đến description
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ REQUIREMENTS MAPPING                 │
     ├──────────────────────────────────────┤
     │ Recommend link:                     │
     │   REQ-012: User authentication      │
     │   REQ-013: Session management       │
     │   REQ-015: Password reset           │
     │                                      │
     │ Unassigned (có thể liên quan):      │
     │   REQ-018: Rate limiting            │
     │                                      │
     │ Không có REQ phù hợp?               │
     │ → Tạo REQ mới trong REQUIREMENTS.md │
     └──────────────────────────────────────┘
   - User: approve / thêm / bớt REQ-IDs
   - Nếu không có REQ phù hợp:
     → "Mô tả requirement mới cho phase này?"
     → AI tạo REQ mới + assign REQ-ID
    ↓
4. Success criteria
   - AI suggest 2-5 criteria dựa trên:
     → Description + linked REQ-IDs
     → Grep-verifiable khi có thể
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ SUCCESS CRITERIA                     │
     ├──────────────────────────────────────┤
     │ 1. User can register and login      │
     │ 2. JWT tokens issued and validated  │
     │ 3. Password reset flow completes    │
     │ 4. Session expires after timeout    │
     └──────────────────────────────────────┘
   - User: approve / sửa / thêm / bớt (range 2-5)
    ↓
5. Validate
   - AI kiểm tra:
     → REQ-IDs không bị duplicate (không assigned cho phase khác rồi)
     → Tên phase unique trong roadmap
     → Số criteria trong range 2-5
     → Vị trí hợp lý (không insert trước phase đã completed)
   - Nếu có vấn đề → báo + suggest fix
    ↓
6. Write changes
   - Insert/append phase vào ROADMAP.md tại vị trí đã chọn
   - Nếu insert giữa: renumber tất cả phases sau
   - Status: ⏳ planned
   - Nếu tạo REQ mới: cập nhật REQUIREMENTS.md
   - Commit: "docs: add phase [X] - [name]"
     (nếu renumber: "docs: add phase [X] - [name], renumber [X]→[X+N]")
    ↓
7. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► PHASE ADDED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Phase [X]: [name]
   Position: [X] of [total] (renumbered [N] phases)
   Requirements: REQ-012, REQ-013, REQ-015
   Success criteria: 4
   ▶ "/st:phase-discuss [X] để thảo luận trước khi plan"
```

## So sánh

| | GSD (inferred) | Superpowers | Superteam |
|---|---|---|---|
| Phase management | Có | Không có | Có, full lifecycle |
| Add phase | Có (cuối) | Không | Smart positioning (cuối hoặc giữa) |
| Insert phase | Command riêng | Không | Gộp vào phase-add |
| REQ linking | Có | Không | Bắt buộc + auto-create REQ |
| Success criteria | 2-5 | Không | AI suggest 2-5 + user confirm |
| Position analysis | Không (user chỉ định) | Không | AI phân tích dependencies |
| Renumber | Có | Không | Tự động khi insert giữa |
| Validation | Coverage check | Không | Duplicate + unique + range + position |

## Cải thiện so với industry

1. **Smart positioning** — AI phân tích dependencies, suggest vị trí, giải thích lý do. Cả GSD và Superpowers đều không có
2. **Gộp add + insert** — 1 command thay vì 2, AI xử lý vị trí
3. **Bắt buộc REQ linking + auto-create** — đảm bảo integrity
4. **AI suggest criteria** — nhanh, nhất quán
5. **Position validation** — không cho insert trước phase đã completed
6. **ROADMAP format chuẩn** — define rõ, dùng chung
