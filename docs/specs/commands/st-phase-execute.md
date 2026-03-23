# `/st:phase-execute` - Thực Thi Phase

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Thực thi plan của phase trong roadmap. Reuse engine từ `/st:execute` (wave execution, node repair, deviation rules, atomic commits) nhưng thêm phase lifecycle: load phase artifacts, update ROADMAP status, verify success criteria, cross-phase integration check, trigger phase-validate.

**Khác với `/st:execute`:**
- `/st:execute` = task đơn lẻ, load plan từ `.superteam/plans/`
- `/st:phase-execute` = phase trong roadmap, load từ `.superteam/phases/[name]/`, lifecycle hooks trước và sau

**Yêu cầu:** ROADMAP.md + PLAN.md trong phases/[name]/ (chạy `/st:phase-plan` trước).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Engine | Reuse st:execute (waves, repair, deviation, commits) | Không duplicate, nhất quán |
| Plan location | .superteam/phases/[name]/PLAN.md | Cùng directory với CONTEXT + RESEARCH |
| Context enrichment | Load CONTEXT.md + RESEARCH.md cho executors | Agents có đủ context |
| Roadmap update | Auto: planned → in-progress → (completed sau validate) | Sync roadmap tự động |
| Prerequisite check | Verify phases trước đã completed/in-progress | Đảm bảo thứ tự |
| Post-execution | Criteria check + integration check + gợi ý validate | Phase lifecycle hoàn chỉnh |

## Flow

```
/st:phase-execute [phase number hoặc name]
VD: "/st:phase-execute 3"
    "/st:phase-execute authentication"
    "/st:phase-execute" → show list phases có PLAN.md, hỏi chọn

━━━━━━━━━ PRE-EXECUTION (phase-specific) ━━━━━━━━━

1. Check context
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse phase: số, tên, status, success criteria
   - PLAN.md tồn tại trong phases/[name]/?
     → Không: "Chưa có plan. Chạy /st:phase-plan [X] trước."
   - Phase status:
     → completed: "Phase đã hoàn thành. Execute lại?"
     → in-progress: "Phase đang thực hiện. Resume từ checkpoint?"
     → planned: tiếp bình thường
    ↓
2. Prerequisite check
   - Phases trước (1..X-1): có phase nào planned (chưa bắt đầu)?
   → Có:
     "⚠ Phase [Y] chưa bắt đầu nhưng đứng trước phase [X].
      Dependencies có thể chưa sẵn sàng.
      Tiếp tục? / Chạy phase [Y] trước?"
   → Tất cả completed/in-progress: OK
    ↓
3. Load phase artifacts
   - PLAN.md (bắt buộc)
   - CONTEXT.md (nếu có — decisions, approach, constraints)
   - RESEARCH.md / SUMMARY.md (nếu có — tech recommendations, pitfalls)
   - Success criteria từ ROADMAP.md (dùng cho post-execution check)
    ↓
4. Update ROADMAP status
   - Phase status: ⏳ planned → 🔄 in-progress
   - Commit: "docs: start phase [X] - [name]"

━━━━━━━━━ EXECUTION (reuse st:execute engine) ━━━━━━━━━

5. Critical review gate (reuse st:execute)
   - AI đọc plan, review tính khả thi
   - Flag potential issues
    ↓
6. Wave assignment (reuse st:execute)
   - Dependency analysis → parallel/sequential
   - Assign tasks to waves
    ↓
7. Wave execution (reuse st:execute)
   - Spawn executor agents per task
   - INPUT BỔ SUNG cho agents:
     → CONTEXT.md decisions (VD: "dùng JWT, không sessions")
     → RESEARCH recommendations (VD: "tránh lib X")
     → Success criteria reference
   - Atomic commits per task
   - Checkbox tracking trong PLAN.md
    ↓
8. Checkpoint review (reuse st:execute)
   - Giữa các waves: chạy tests + quick review
   - Node repair nếu cần: RETRY / DECOMPOSE / PRUNE / ESCALATE
    ↓
9. Deviation handling (reuse st:execute)
   - 4 levels: auto-fix (1-3), stop+ask (4)
   - Blocker → /st:plan --replan hoặc /st:phase-plan --replan

━━━━━━━━━ POST-EXECUTION (phase-specific) ━━━━━━━━━

10. Success criteria check
    - Verify mỗi criterion từ ROADMAP.md:
      ┌──────────────────────────────────────┐
      │ SUCCESS CRITERIA CHECK               │
      ├──────────────────────────────────────┤
      │ ✅ User can register and login      │
      │    → Verified: auth tests pass      │
      │                                      │
      │ ✅ JWT tokens issued correctly      │
      │    → Verified: token.test.ts pass   │
      │                                      │
      │ ❌ Password reset flow works        │
      │    → NOT verified: no reset tests   │
      │                                      │
      │ ✅ Session expires after timeout    │
      │    → Verified: expiry test pass     │
      │                                      │
      │ Result: 3/4 criteria met            │
      └──────────────────────────────────────┘
    - Nếu có criteria chưa met:
      "Còn [N] criteria chưa đạt. Tiếp tục fix hay
       chuyển sang validate để review chi tiết?"
    ↓
11. Cross-phase integration check
    - Spawn integration-checker agent:
      → Run full test suite (không chỉ phase tests)
      → Check: phases đã completed có bị regression không?
      → Check: interfaces giữa phases có consistent không?
    - Trình bày kết quả:
      → All pass: "Không regression ✓"
      → Có issues: list + suggest fix
    ↓
12. Update ROADMAP
    - Nếu tất cả criteria met + integration pass:
      → Status vẫn 🔄 in-progress (chờ phase-validate confirm)
      → Check criteria checkboxes trong ROADMAP.md
    - Nếu có criteria chưa met:
      → Status giữ 🔄 in-progress
    ↓
13. Done
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST ► PHASE EXECUTED ✓
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Phase [X]: [name]
    Tasks: [N] completed | Waves: [M]
    Criteria: [X]/[Y] met
    Integration: [pass/issues]
    ▶ "/st:phase-validate [X] để xác nhận hoàn thành"
    ▶ "/st:phase-execute [X+1] để bắt đầu phase tiếp"
```

## Reuse từ /st:execute

| Step | st:execute | phase-execute | Khác biệt |
|---|---|---|---|
| Plan discovery | .superteam/plans/ | .superteam/phases/[name]/PLAN.md | Khác location |
| Pre-check | Không | Prerequisite phases + load artifacts | Phase lifecycle |
| Roadmap update | Không | planned → in-progress | Phase lifecycle |
| Review gate | Giống | Giống | — |
| Wave system | Giống | Giống + enriched context | Thêm CONTEXT/RESEARCH |
| Node repair | Giống | Giống | — |
| Deviation | Giống | Giống | — |
| Post-check | Generic summary | Criteria check + integration check | Phase lifecycle |
| Next action | /st:code-review | /st:phase-validate hoặc next phase | Phase lifecycle |

## So sánh

| | GSD execute-phase | Superpowers executing-plans | Superteam |
|---|---|---|---|
| Engine | Riêng | Không phân biệt phase/standalone | Reuse st:execute + lifecycle |
| Prerequisite check | Không rõ | Không | Check phases trước |
| Roadmap update | Có | Không (no roadmap) | Auto update status |
| Context enrichment | .planning/ artifacts | Plan file only | CONTEXT.md + RESEARCH.md |
| Criteria check | must_haves | Không | Verify mỗi criterion |
| Integration check | integration-checker agent | Không | integration-checker agent |
| Validation trigger | Có (verifier) | verification-before-completion | Gợi ý phase-validate |

## Cải thiện

1. **Prerequisite check** — verify phases trước đã sẵn sàng
2. **Context enrichment** — executor agents có CONTEXT + RESEARCH, GSD chỉ có .planning/
3. **Per-criterion verification** — check từng criterion cụ thể, không chỉ must_haves chung
4. **Integration check** — regression test cho completed phases
5. **Roadmap auto-sync** — status update tự động
