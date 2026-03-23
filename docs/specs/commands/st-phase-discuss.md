# `/st:phase-discuss` - Thảo Luận Phase Context

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Làm rõ HOW cho phase đã có trong roadmap. Phase đã biết WHAT (tên, REQ-IDs, success criteria), discuss làm rõ: approach, assumptions, edge cases, risks, constraints. AI tổng hợp context + hỏi gray areas. Output: CONTEXT.md feed vào phase-research và phase-plan.

**Khác với `/st:brainstorm`:**
- Brainstorm = khám phá WHAT (ý tưởng mơ hồ → spec)
- Discuss = làm rõ HOW (phase đã có → context cho planning)

**Yêu cầu:** ROADMAP.md phải tồn tại, phase phải tồn tại trong roadmap.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Mục đích | Làm rõ HOW, không khám phá WHAT | Phase đã có scope từ roadmap |
| Questioning | Hybrid: AI tổng hợp + hỏi gray areas | Nhất quán với pattern Superteam |
| Output | CONTEXT.md trong .superteam/phases/[name]/ | Nhẹ, feed vào research/plan |
| Next step | Gợi ý, user quyết định | Nhất quán với brainstorm |
| Scope | 1 phase cụ thể | Focused, không lan sang phases khác |

## Flow

```
/st:phase-discuss [phase number hoặc name]
VD: "/st:phase-discuss 3"
    "/st:phase-discuss authentication"
    "/st:phase-discuss" → show list, hỏi chọn

1. Check context
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse phase: số, tên, REQ-IDs, success criteria
   - Phase status:
     → completed: "Phase này đã hoàn thành. Vẫn muốn discuss?"
     → in-progress: "Phase đang thực hiện. Discuss để review approach?"
     → planned: tiếp bình thường
   - Load: PROJECT.md, REQUIREMENTS.md, codebase context
    ↓
2. AI tổng hợp context
   - AI đọc: phase info + requirements + codebase + PROJECT.md
   - Trình bày hiểu biết:
     ┌──────────────────────────────────────┐
     │ PHASE CONTEXT                        │
     ├──────────────────────────────────────┤
     │ Phase [X]: [name]                   │
     │                                      │
     │ Mục tiêu: [AI tóm tắt]             │
     │ Requirements:                        │
     │   REQ-012: User authentication      │
     │   REQ-013: Session management       │
     │                                      │
     │ Success criteria:                    │
     │   1. User can register and login    │
     │   2. JWT tokens issued correctly    │
     │   3. Password reset flow works      │
     │                                      │
     │ Codebase liên quan:                 │
     │   - src/middleware/ (existing auth)  │
     │   - src/models/user.ts              │
     │                                      │
     │ Approach dự kiến: [AI đề xuất]      │
     │                                      │
     │ Assumptions:                         │
     │   1. [assumption 1]                 │
     │   2. [assumption 2]                 │
     │                                      │
     │ Gray areas:                          │
     │   1. [điểm chưa rõ 1]              │
     │   2. [điểm chưa rõ 2]              │
     └──────────────────────────────────────┘
   - User: confirm / sửa / bổ sung
    ↓
3. Hỏi gray areas (nếu có)
   - Hỏi từng câu, multiple choice ưu tiên
   - AI recommend + lý do
   - Focus: approach, edge cases, constraints, risks
   - Thường 2-5 câu hỏi
    ↓
4. Tổng hợp decisions
   - AI tổng hợp tất cả context + answers:
     ┌──────────────────────────────────────┐
     │ DECISIONS                            │
     ├──────────────────────────────────────┤
     │ Approach: [đã chọn]                │
     │ Key decisions:                       │
     │   1. [decision + lý do]             │
     │   2. [decision + lý do]             │
     │ Risks identified:                    │
     │   1. [risk + mitigation]            │
     │ Constraints:                         │
     │   1. [constraint]                   │
     │ Out of scope:                        │
     │   1. [không làm gì]                 │
     └──────────────────────────────────────┘
   - User: confirm
    ↓
5. Write CONTEXT.md
   - Lưu tại: .superteam/phases/[phase-name]/CONTEXT.md
   - Nội dung: phase info + approach + decisions + risks + constraints
   - Commit: "docs: discuss phase [X] - [name]"
    ↓
6. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► PHASE DISCUSSED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Phase [X]: [name]
   Decisions: [N] | Risks: [M]
   Context: .superteam/phases/[name]/CONTEXT.md
   ▶ "/st:phase-research [X] để research trước khi plan"
   ▶ "/st:phase-plan [X] để tạo plan trực tiếp"
```

## Per-phase directory

```
.superteam/phases/
└── authentication-system/
    ├── CONTEXT.md        ← tạo bởi /st:phase-discuss
    ├── RESEARCH.md       ← tạo bởi /st:phase-research (sau)
    └── PLAN.md           ← tạo bởi /st:phase-plan (sau)
```

Mỗi phase có directory riêng chứa artifacts xuyên suốt lifecycle.

## So sánh

| | GSD discuss-phase | Superpowers | Superteam |
|---|---|---|---|
| Mục đích | Deep questioning trước plan | Không có | Làm rõ HOW + context |
| Questioning | Hỏi trực tiếp | Không | Hybrid: AI tổng hợp + hỏi gray areas |
| Output | CONTEXT.md | Không | CONTEXT.md trong phases/[name]/ |
| Assumptions | 2-4 gray areas | Không | AI detect + user confirm |
| Risks | Không rõ | Không | Identify + mitigation |
| Codebase scan | Không rõ | Không | Scan files liên quan |
| Per-phase dir | Không (chung .planning/) | Không | Có, mỗi phase riêng |

## Cải thiện

1. **Hybrid questioning** — AI chủ động tổng hợp, không chỉ hỏi như GSD
2. **Per-phase directory** — artifacts tổ chức rõ ràng theo phase
3. **Risk identification** — detect risks + suggest mitigation
4. **Codebase-aware** — scan code liên quan, không chỉ dựa vào mô tả
