# `/st:phase-plan` - Tạo Plan Chi Tiết cho Phase

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Tạo implementation plan cho phase trong roadmap. Reuse engine từ `/st:plan` (adaptive granularity, wave system, plan-checker, goal-backward verification) nhưng thêm phase context: load CONTEXT.md + RESEARCH.md, must_haves = success criteria từ phase, auto-link vào roadmap.

**Khác với `/st:plan`:**
- `/st:plan` = task đơn lẻ, zero-infrastructure, AI generate must_haves
- `/st:phase-plan` = phase trong roadmap, load artifacts từ discuss/research, must_haves = success criteria

**Yêu cầu:** ROADMAP.md + phase tồn tại. Recommend: phase-discuss → phase-research → phase-plan.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Engine | Reuse st:plan (granularity, waves, checker, verify) | Không duplicate logic, nhất quán |
| Context input | CONTEXT.md + RESEARCH.md (nếu có) | Research làm plan chính xác hơn |
| must_haves | = success criteria từ phase | Plan phải đạt goal của phase |
| Plan-checker | Verify plan covers TẤT CẢ success criteria | Đảm bảo không thiếu |
| Output | PLAN.md trong .superteam/phases/[name]/ | Cùng directory với CONTEXT + RESEARCH |
| Roadmap update | Auto update status → 🔄 in-progress khi execute | Sync roadmap |

## Flow

```
/st:phase-plan [phase number hoặc name]
VD: "/st:phase-plan 3"
    "/st:phase-plan authentication"
    "/st:phase-plan" → show list planned phases, hỏi chọn

1. Check context
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse phase: số, tên, REQ-IDs, success criteria
   - Phase status:
     → completed: "Phase đã hoàn thành. Tạo plan mới?"
     → in-progress: "Phase đang thực hiện. Replan?"
     → planned: tiếp bình thường
   - Load artifacts (nếu có):
     → .superteam/phases/[name]/CONTEXT.md (từ discuss)
     → .superteam/phases/[name]/research/SUMMARY.md (từ research)
     → .superteam/phases/[name]/research/*.md (detail files)
   - Nếu không có CONTEXT.md:
     "Chưa chạy /st:phase-discuss. Recommend discuss trước.
      Tiếp tục plan trực tiếp?"
   - Load: PROJECT.md, config, codebase
    ↓
2. Understand + Confirm (reuse st:plan step 2.5)
   - AI đọc: phase info + CONTEXT.md + RESEARCH + codebase
   - Trình bày hiểu biết:
     ┌──────────────────────────────────────┐
     │ HIỂU BIẾT VỀ PHASE                  │
     ├──────────────────────────────────────┤
     │ Phase [X]: [name]                   │
     │ Approach: [từ CONTEXT.md]           │
     │ Key decisions: [từ CONTEXT.md]      │
     │ Tech stack: [từ RESEARCH]           │
     │ Risks: [từ RESEARCH]               │
     │ Scope: [bao gồm / loại trừ]        │
     │ Files ảnh hưởng: [list]             │
     │                                      │
     │ Success criteria (= must_haves):     │
     │   1. User can register and login    │
     │   2. JWT tokens issued correctly    │
     │   3. Password reset flow works      │
     │   4. Session expires after timeout  │
     └──────────────────────────────────────┘
   - User: confirm / sửa
    ↓
3. UI Design gate (reuse st:plan step 2.7)
   - AI detect: phase có UI changes?
   → Có: gợi ý /st:ui-design trước
   → Không: skip
    ↓
4. Codebase-aware analysis (reuse st:plan step 4)
   - Scan existing patterns
   - Identify files cần tạo/sửa
   - Detect dependencies giữa files
    ↓
5. Spawn planner agent (reuse st:plan step 5)
   - Adaptive granularity: COARSE / STANDARD / FINE
   - Mỗi task có: action, files, read-first, acceptance criteria,
     expected output, dependencies
   - TDD integration theo granularity
   - INPUT BỔ SUNG cho agent:
     → CONTEXT.md decisions
     → RESEARCH recommendations
     → Success criteria as must_haves
    ↓
6. Dependency analysis + wave assignment (reuse st:plan step 6)
   - Conflict detection → sequential/parallel
   - Wave assignment
    ↓
7. Spawn plan-checker agent (reuse st:plan step 7)
   - Verify plan đạt goal
   - BỔ SUNG: check plan covers TẤT CẢ success criteria
     → Mỗi criterion phải có ≥ 1 task address nó
     → Nếu thiếu → flag + suggest thêm tasks
   - Max 3 iterations fix
    ↓
8. Goal-backward verification (reuse st:plan step 8)
   - must_haves = success criteria từ phase
   - Truths + Artifacts check
   - Verify plan tasks cover tất cả must_haves
    ↓
9. Trình bày plan (reuse st:plan step 9)
   ┌──────────────────────────────────────┐
   │ PLAN: Phase [X] - [name]            │
   ├──────────────────────────────────────┤
   │ Granularity: [COARSE/STANDARD/FINE] │
   │ Tasks: [N] | Waves: [M]            │
   │ Context: CONTEXT.md [✓/✗]          │
   │ Research: RESEARCH [✓/✗]           │
   │                                      │
   │ Must-haves (= success criteria):    │
   │   ✓ criterion 1 → covered by task X│
   │   ✓ criterion 2 → covered by task Y│
   │   ✓ criterion 3 → covered by task Z│
   │                                      │
   │ Wave 1: [tasks] (parallel)          │
   │ Wave 2: [tasks] (after wave 1)      │
   │                                      │
   │ [Chi tiết từng task]                │
   └──────────────────────────────────────┘
   - User: approve / adjust granularity / adjust tasks
    ↓
10. Lưu plan
    - .superteam/phases/[name]/PLAN.md
    - Checkbox steps, wave annotations, acceptance criteria
    - Commit: "plan: phase [X] - [name]"
    ↓
11. Done
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST ► PHASE PLAN CREATED ✓
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Phase [X]: [name]
    Tasks: [N] | Waves: [M] | Granularity: [level]
    Must-haves: [all covered ✓]
    Plan: .superteam/phases/[name]/PLAN.md
    ▶ "/st:phase-execute [X] để thực thi"
```

## Per-phase directory (cập nhật)

```
.superteam/phases/
└── authentication-system/
    ├── CONTEXT.md              ← /st:phase-discuss
    ├── research/               ← /st:phase-research
    │   ├── STACK.md
    │   ├── ARCHITECTURE.md
    │   ├── PITFALLS.md
    │   ├── LANDSCAPE.md
    │   └── SUMMARY.md
    └── PLAN.md                 ← /st:phase-plan
```

## Reuse từ /st:plan

| Step | st:plan | phase-plan | Khác biệt |
|---|---|---|---|
| Check context | Zero-infra | Yêu cầu ROADMAP.md | Load phase artifacts |
| Understand | AI tổng hợp từ codebase | + CONTEXT.md + RESEARCH | Thêm input |
| UI gate | Detect UI change | Giống | — |
| Research | Optional, AI recommend | Đã có từ phase-research | Skip, dùng existing |
| Planner | Adaptive granularity | Giống + phase context | Thêm input |
| Checker | Verify goal | + Verify success criteria | Thêm check |
| Goal verify | AI generate must_haves | must_haves = criteria | Từ roadmap |
| Output | .superteam/plans/[task].md | .superteam/phases/[name]/PLAN.md | Khác location |
| Phase link | Optional (step 10) | Auto (đã trong roadmap) | Không cần hỏi |

## So sánh

| | GSD phase-plan | Superpowers write-plan | Superteam |
|---|---|---|---|
| Engine | Riêng | Spec-based | Reuse st:plan + phase context |
| Context input | .planning/ artifacts | Spec file | CONTEXT.md + RESEARCH |
| must_haves | Có | Không | = success criteria |
| Granularity | Cố định 2-3 tasks | Cố định fine | Adaptive |
| Wave system | Có | Không | Có |
| Plan-checker | 3 iterations | 3 iterations | 3 iterations + criteria check |
| UI gate | UI-SPEC gate | Không | Detect + gợi ý /st:ui-design |
| Per-phase dir | .planning/ chung | Không | .superteam/phases/[name]/ |

## Cải thiện

1. **Reuse engine** — không duplicate logic, nhất quán với st:plan
2. **must_haves = success criteria** — plan bắt buộc cover mọi criteria
3. **Phase artifacts as input** — CONTEXT + RESEARCH làm plan chính xác hơn
4. **Plan-checker verify criteria** — mỗi criterion phải có task address
5. **Per-phase directory** — artifacts tổ chức rõ ràng
