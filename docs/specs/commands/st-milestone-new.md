# `/st:milestone-new` - Tạo Milestone Mới

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Tạo milestone mới cho dự án. Parse version từ ROADMAP.md header, AI suggest version mới (minor/major), nối milestone mới vào cuối ROADMAP.md. Reuse flow từ `/st:init` (questioning → research → requirements → roadmap) nhưng nhẹ hơn: questioning ngắn 5-10 lượt, research optional. Nếu milestone hiện tại chưa completed → cảnh báo nhưng cho phép user quyết định.

**Yêu cầu:** `.superteam/` phải tồn tại (chạy `/st:init` trước).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Prerequisite | Cảnh báo nhưng cho phép | User quyết định, linh hoạt |
| Reuse init | Reuse steps 3-7 (questioning → research → requirements → roadmap → review) | Không duplicate logic, nhất quán |
| Versioning | AI suggest + user chọn (minor/major/custom) | Linh hoạt |
| ROADMAP.md cũ | Append — nối thẳng, không collapse | Đơn giản, thấy toàn bộ history. File dài → milestone-archive dọn sau |
| Research | Optional — AI recommend dựa trên scope | Tiết kiệm token khi không cần |
| Questioning | Ngắn 5-10 lượt, chỉ WHAT + SCOPE + DONE | Project đã có context |
| REQUIREMENTS.md | Tạo mới, REQ-IDs tiếp tục từ milestone trước | Scope per milestone, không trùng IDs |
| Input | Optional argument | Nhất quán với các commands khác |

## Flow

```
/st:milestone-new [description]
VD: "/st:milestone-new API v2 + mobile support"
    "/st:milestone-new" → hỏi "Milestone mới nhắm mục tiêu gì?"

1. Check context
   - .superteam/ tồn tại?
     → Không: "Chưa init project. Chạy /st:init trước." → Dừng
     → Có: tiếp
   - ROADMAP.md tồn tại?
     → Có: parse milestone header `> Milestone: v{X.Y} — [description]`
       → Còn phases chưa completed?
         ┌──────────────────────────────────────┐
         │ ⚠ MILESTONE CHƯA HOÀN THÀNH         │
         ├──────────────────────────────────────┤
         │ Milestone: v1.0 — MVP               │
         │ Phases chưa xong:                    │
         │   🔄 Phase 4: API Layer             │
         │   ⏳ Phase 5: Testing               │
         │                                      │
         │ Bạn có thể:                         │
         │   1. Chạy /st:milestone-complete     │
         │      trước (recommend)               │
         │   2. Tạo milestone mới anyway        │
         │      (phases cũ giữ nguyên)          │
         └──────────────────────────────────────┘
         → User chọn tiếp → tiếp flow
         → User chọn complete → dừng
       → Tất cả completed: OK, tiếp
     → Không có ROADMAP.md: first milestone, version = v1.0 → tiếp
    ↓
2. Determine version
   - Parse version hiện tại từ ROADMAP.md header (hoặc v0.0 nếu first)
   - Parse last phase number
   - AI suggest version mới:
     ┌──────────────────────────────────────┐
     │ VERSION                              │
     ├──────────────────────────────────────┤
     │ Milestone trước: v1.0               │
     │ Phases: 5 (3 completed, 2 pending)  │
     │                                      │
     │ Version mới:                        │
     │   ● v1.1 (recommend — iterative)   │
     │   ○ v2.0 (major — breaking changes)│
     │   ○ Custom: ___                     │
     │                                      │
     │ Phase numbering tiếp từ: Phase 6    │
     └──────────────────────────────────────┘
   - User chọn version
    ↓
3. Nối milestone mới vào ROADMAP.md
   - Nếu có milestone cũ:
     → Thêm `---` separator
     → Thêm milestone header mới `> Milestone: v{X.Y} — [description]`
     → Phases cũ giữ nguyên, không collapse
     → Nếu REQUIREMENTS.md cũ tồn tại:
       rename → REQUIREMENTS-v{old}.md (backup)
   - Nếu first milestone:
     → Tạo ROADMAP.md mới với milestone header
   - Commit: "docs: start milestone v{X.Y}"
    ↓
4. Questioning loop (reuse /st:init step 3 — nhẹ hơn)
   - "Milestone mới nhắm mục tiêu gì?"
   - Vòng lặp:
     a. Hỏi 5-10 câu (WHAT, SCOPE, DONE — skip WHO, EXIST)
        → Hỏi từng câu một
        → Image input: accept bất cứ lúc nào
     b. Tổng hợp → trình bày cho user:
        ┌──────────────────────────────────────┐
        │ TÓM TẮT MILESTONE                   │
        ├──────────────────────────────────────┤
        │ Goals:                               │
        │   - Mobile API cho iOS/Android       │
        │   - Push notifications               │
        │   - Offline mode                     │
        │                                      │
        │ Scope:                               │
        │   - Chỉ REST API, chưa GraphQL      │
        │   - iOS first, Android sau           │
        │                                      │
        │ Done khi:                            │
        │   - App demo chạy được trên iOS     │
        │   - API docs cho mobile team         │
        │                                      │
        │ Đủ chưa? (accept / thảo luận thêm) │
        └──────────────────────────────────────┘
     c. User accept → tiếp step 5
        User muốn thảo luận thêm → quay lại (a)
    ↓
5. Update PROJECT.md (reuse /st:init step 4)
   - Thêm section "Milestone v{X.Y}" vào PROJECT.md
   - Ghi: goals, scope, relationship với milestone trước
   - Commit: "docs: update project for milestone v{X.Y}"
    ↓
6. Research decision (reuse /st:init step 5 — optional)
   - AI đánh giá: milestone mới cần research không?
     → Cùng domain/stack: "Không cần research lại."
     → Domain mới: "Recommend research [domain]. Chạy?"
   - User: đồng ý → spawn researchers (reuse init wave pattern)
   - User: skip → tiếp
    ↓
7. Define requirements + Create roadmap (reuse /st:init steps 6-7)
   - Generate REQUIREMENTS.md mới cho milestone
     → REQ-IDs tiếp tục từ milestone trước (VD: REQ-016, REQ-017...)
     → User review + approve
   - Spawn roadmapper agent
     → Phase numbering tiếp tục (VD: Phase 6, 7, 8...)
     → Map REQ-IDs → phases
     → Validate 100% coverage
     → User review + approve
   - Commit: "docs: define v{X.Y} requirements + roadmap ([N] phases)"
    ↓
8. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► MILESTONE CREATED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   | Artifact       | Location                      |
   |----------------|-------------------------------|
   | Project        | .superteam/PROJECT.md         |
   | Requirements   | .superteam/REQUIREMENTS.md    |
   | Roadmap        | .superteam/ROADMAP.md         |

   Milestone: v{X.Y} — [description]
   Phases: [N] (Phase [start]–[end])
   Requirements: [M] REQ-IDs

   ▶ "/st:phase-discuss [start] để bắt đầu"
```

## So sánh

| | GSD new-milestone | Superpowers | Superteam |
|---|---|---|---|
| Steps | 11 (nặng) | Không có | 8 (gọn hơn) |
| Version source | STATE.md | N/A | ROADMAP.md header |
| State file | Bắt buộc STATE.md | N/A | Không cần |
| Reuse init | Không — flow riêng | N/A | Reuse init steps 3-7 |
| Research | Bắt buộc 4 researchers | N/A | Optional (AI recommend) |
| Questioning | Không rõ | N/A | 5-10 lượt loop, 3 areas (WHAT, SCOPE, DONE) |
| ROADMAP cũ | Collapse trong details | N/A | Nối thẳng, không collapse |
| REQUIREMENTS | Tạo mới | N/A | Tạo mới, REQ-IDs tiếp tục |
| Prerequisite | Check STATE.md | N/A | Cảnh báo + cho phép |
| Phase numbering | Tiếp tục | N/A | Tiếp tục |
| Image input | Không | N/A | Có |

## Cải thiện so với industry

1. **Không cần STATE.md** — parse version từ ROADMAP.md, single source of truth
2. **Reuse init flow** — nhất quán, không duplicate logic
3. **Research optional** — AI recommend, tiết kiệm token khi cùng domain/stack
4. **Questioning loop** — 5-10 lượt + tổng hợp + checkpoint, user quyết định đủ chưa
5. **Prerequisite linh hoạt** — cảnh báo nhưng cho phép, user quyết định
6. **Gọn hơn GSD** — 8 steps thay vì 11
7. **Image input** — accept wireframe, diagram bất cứ lúc nào
