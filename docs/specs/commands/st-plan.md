# `/st:plan` - Tạo Plan cho Task

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Tạo implementation plan cho task đơn lẻ hoặc feature. Zero-infrastructure (hoạt động không cần `/st:init`). Adaptive granularity, optional research, wave-based parallel, goal-backward verification, mid-execution replanning, UI design gate.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Infrastructure | Không bắt buộc init, gợi ý nếu chưa có | Linh hoạt: plan nhanh hoặc plan trong project đầy đủ |
| Questioning | AI tổng hợp hiểu biết → trình bày → user confirm | AI chủ động, không hỏi từng câu |
| UI Design gate | Detect task chạm giao diện → gợi ý /st:ui-design | Frontend cần design trước code |
| Research | Optional, AI recommend theo complexity | Simple skip, complex recommend |
| Granularity | Adaptive: COARSE/STANDARD/FINE theo complexity | User override nếu cần |
| TDD | Adaptive: FINE=TDD cycle, STANDARD=logic only, COARSE=skip | Không overkill cho task đơn giản |
| Verification | Grep-verifiable + expected output | Check tĩnh + runtime |
| Parallel | Wave system + dependency analysis | Tối ưu execution time |
| Plan review | Plan-checker agent, max 3 iterations | Đảm bảo chất lượng |
| Goal verify | must_haves (goal-backward) | Đảm bảo plan đạt mục tiêu |
| Replan | Blocker → AI đánh giá + khuyến nghị → user quyết định | User có đủ info để quyết |
| Phase linking | Optional, nếu có ROADMAP.md | Gắn vào roadmap hoặc độc lập |
| Image input | Accept bất cứ lúc nào | Wireframe, flow diagram, screenshot |

## Flow

```
1. Input
   - User mô tả task: "/st:plan thêm dark mode"
   - Hoặc không argument → hỏi "Bạn muốn plan gì?"
   - Image input: wireframe, flow diagram, screenshot
   - Flag: --replan (replan từ blocker mid-execution)
    ↓
2. Check context
   - .superteam/ tồn tại?
     → Có: load config, PROJECT.md, REQUIREMENTS.md, DESIGN-SYSTEM.md
     → Không: "Chưa init project. Plan vẫn hoạt động nhưng
       chính xác hơn nếu chạy /st:init trước. Tiếp tục?"
       → User: tiếp / init trước
   - Scan codebase: files liên quan, patterns, conventions
    ↓
2.5 Understand + Confirm
   - AI đọc yêu cầu + context (codebase, PROJECT.md nếu có)
   - AI tổng hợp hiểu biết:
     ┌──────────────────────────────────────┐
     │ HIỂU BIẾT VỀ YÊU CẦU               │
     ├──────────────────────────────────────┤
     │ Task: [mô tả AI hiểu]              │
     │ Scope: [bao gồm gì]                │
     │ Không bao gồm: [loại trừ gì]       │
     │ Files ảnh hưởng: [list]             │
     │ Approach dự kiến: [cách làm]        │
     │ Câu hỏi (nếu có): [điểm chưa rõ]  │
     └──────────────────────────────────────┘
   - Hỏi user: "Đúng không? Cần bổ sung/sửa gì?"
   - User: confirm → tiếp
   - User: sửa → AI cập nhật, confirm lại
   - Loop cho đến user đồng ý
    ↓
2.7 UI Design gate (nếu frontend)
   - AI detect: task này thay đổi giao diện không?
     (new page, new component, layout change, UI redesign...)
   → Có UI change:
     "Task này ảnh hưởng giao diện. Recommend chạy /st:ui-design
      trước khi plan code. Đồng ý?"
     → User đồng ý: chạy /st:ui-design → quay lại plan với mockup
     → User từ chối: tiếp plan trực tiếp
   → Không UI change: skip
    ↓
3. Research decision (optional, AI recommend)
   - AI đánh giá complexity:
     → Simple (rename, config, styling) → skip research
     → Medium (new component, API endpoint) → suggest nhẹ
     → Complex (auth, payment, migration) → recommend research
   - Trình bày: "Task này liên quan đến [domain].
     Recommend research trước khi plan. Đồng ý?"
   - User: đồng ý → spawn researcher agent (focused, 1-2 pages)
   - User: skip → tiếp plan trực tiếp
    ↓
4. Codebase-aware analysis
   - Scan existing patterns (API endpoint pattern, component structure,
     naming conventions...)
   - Identify files cần tạo/sửa
   - Detect dependencies giữa files
   - Nếu --replan: load plan cũ + blocker context
    ↓
5. Spawn planner agent
   - Adaptive granularity:
     → Đánh giá complexity (files affected, loại thay đổi, risk)
     → Simple → COARSE (1-3 steps)
     → Medium → STANDARD (5-8 steps)
     → Complex → FINE (10-20 steps, TDD cycle)

   - Mỗi task có:
     → Action: mô tả cụ thể (concrete values)
     → Files: exact paths (create/modify/test)
     → Read-first: files phải đọc trước khi sửa
     → Acceptance criteria: grep-verifiable conditions
     → Expected output: runtime verification (command + result)
     → Dependencies: task nào cần xong trước

   - TDD integration (theo granularity):
     → FINE: TDD cycle mỗi task (test → fail → implement → pass)
     → STANDARD: TDD cho logic tasks, skip cho config/styling
     → COARSE: verify cuối, không TDD cycle
    ↓
6. Dependency analysis + wave assignment
   - Phân tích conflict:
     → Cùng sửa 1 file → sequential
     → Khác file, không phụ thuộc → parallel
   - Xếp waves cho parallel execution
    ↓
7. Spawn plan-checker agent
   - Verify plan đạt goal
   - Check: missing steps, dependency gaps, acceptance criteria
   - Max 3 iterations fix
    ↓
8. Goal-backward verification (must_haves)
   - Từ goal → "Nếu plan hoàn thành, những gì PHẢI đúng?"
   - Truths: "User có thể login", "API trả về 200"
   - Artifacts: "auth.ts exists", "test files pass"
   - Check: plan tasks cover tất cả must_haves?
    ↓
9. Trình bày plan
   ┌──────────────────────────────────────┐
   │ PLAN: [task name]                    │
   ├──────────────────────────────────────┤
   │ Granularity: [COARSE/STANDARD/FINE]  │
   │ Tasks: [N] | Waves: [M]             │
   │ Research: [done/skipped]             │
   │ Must-haves: [list]                  │
   ├──────────────────────────────────────┤
   │ Wave 1: [tasks] (parallel)          │
   │ Wave 2: [tasks] (after wave 1)      │
   ├──────────────────────────────────────┤
   │ [Chi tiết từng task]                 │
   └──────────────────────────────────────┘

   - User review:
     → Approve
     → "Chi tiết hơn" → increase granularity
     → "Gọn hơn" → decrease granularity
     → Adjust specific tasks
    ↓
10. Phase linking (nếu có ROADMAP.md)
   - "Gắn plan này vào phase nào?"
     → Phase [X] / Không gắn
   - Nếu gắn: update ROADMAP.md
    ↓
11. Lưu plan
   - .superteam/plans/[task-name].md
   - Checkbox steps, wave annotations, acceptance criteria
   - Commit: "plan: [task name]"
    ↓
12. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► PLAN CREATED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tasks: [N] | Waves: [M] | Granularity: [level]
   ▶ "/st:execute để thực thi"
```

## Blocker Handling (`/st:plan --replan`)

```
Khi executor gặp vấn đề → gọi /st:plan --replan:

   ┌──────────────────────────────────────┐
   │ BLOCKER DETECTED                     │
   ├──────────────────────────────────────┤
   │ Vấn đề: [mô tả chi tiết]            │
   │ Phát hiện tại: Task [N]              │
   │                                      │
   │ Impact assessment:                   │
   │ - Task [N+1]: [ảnh hưởng/không]     │
   │ - Task [N+2]: [ảnh hưởng/không]     │
   │                                      │
   │ Khuyến nghị: [Replan / Bỏ qua]      │
   │ Lý do: [giải thích]                 │
   └──────────────────────────────────────┘

   → User: "Replan" → replan tasks còn lại, trình bày plan mới
   → User: "Bỏ qua" → skip vấn đề, tiếp tục
   → User: "Xử lý riêng" → thêm task mới vào plan
```

## So sánh

| | Superpowers | GSD plan-phase | GSD quick | Superteam |
|---|---|---|---|---|
| Infrastructure | Spec + worktree | Full .planning/ | ROADMAP.md | Không bắt buộc |
| Questioning | Không | discuss-phase (deep) | --discuss (light) | AI tổng hợp → user confirm |
| UI Design gate | Không | UI-SPEC gate | Không | Detect UI change → gợi ý /st:ui-design |
| Research | Không | Full researcher | Optional flag | AI recommend theo complexity |
| Granularity | Cố định fine | Cố định 2-3 tasks | 1-3 tasks | Adaptive (AI + user override) |
| TDD | Mọi task | Separate type | Inherited | Adaptive (fine=TDD, coarse=không) |
| Code in plan | Complete inline | Concrete values | Concrete values | Concrete values + expected output |
| Parallel | Không | Wave system | Không | Wave system + dependency |
| Plan review | 3 iterations | 3 iterations | Optional 2 | 3 iterations |
| Goal verify | Per-step | must_haves | Optional | must_haves |
| Criteria | Expected output | Grep-verifiable | Grep-verifiable | Grep + expected output |
| Codebase scan | Manual file mapping | read_first | read_first | Auto-scan patterns |
| Replan | Không | --gaps (separate) | Không | --replan (assess → user decide) |
| Phase linking | Không | Built-in | Không | Optional |
| Image input | Không | Không | Không | Có |

## Cải thiện so với industry

1. **Zero-infrastructure** → hoạt động không cần init, GSD cần ROADMAP.md
2. **AI tổng hợp + confirm** → chủ động hơn questioning từng câu
3. **UI Design gate** → detect frontend change, gợi ý design trước
4. **Adaptive granularity** → AI adjust, user override, không one-size-fits-all
5. **Optional research** → AI recommend, không bắt buộc
6. **Mid-execution replan** → blocker handling với AI assess + user decide
7. **Grep + runtime verify** → kết hợp 2 loại verification
