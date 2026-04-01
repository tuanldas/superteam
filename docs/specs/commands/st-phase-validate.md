# `/st:phase-validate` - Kiểm Tra Phase Hoàn Thành

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Xác nhận phase hoàn thành đúng qua 4 lớp verification: auto-check success criteria, test suite, cross-phase integration, UAT (user acceptance). Nếu 4 lớp pass → auto update ROADMAP status → completed. Output: VERIFICATION.md.

**Yêu cầu:** ROADMAP.md + phase đã execute (status 🔄 in-progress).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Verification | 4 lớp: criteria + tests + integration + UAT | Toàn diện, không bỏ sót |
| Auto-complete | Tự động nếu 4 lớp pass | Giảm thao tác thủ công |
| Output | VERIFICATION.md trong phases/[name]/ | Ghi lại kết quả validate |
| Failed criteria | Report + gợi ý fix | Không block, user quyết định |

## Flow

```
/st:phase-validate [phase number hoặc name]
VD: "/st:phase-validate 3"
    "/st:phase-validate authentication"
    "/st:phase-validate" → show list in-progress phases, hỏi chọn

1. Check context
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse phase: số, tên, status, success criteria
   - Phase status:
     → planned: "Phase chưa execute. Chạy /st:phase-execute trước."
     → in-progress: tiếp bình thường
     → completed: "Phase đã validated. Validate lại?"
   - Load: PLAN.md, CONTEXT.md (nếu có)
    ↓
2. Lớp 1: Auto-check success criteria
   - Với mỗi criterion từ ROADMAP.md:
     → Grep codebase cho artifacts/code liên quan
     → Chạy tests cụ thể (nếu có test cho criterion)
     → AI đánh giá: criterion ĐẠT hay CHƯA?
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ LỚP 1: SUCCESS CRITERIA             │
     ├──────────────────────────────────────┤
     │ ✅ User can register and login      │
     │    Evidence: auth.test.ts pass (12) │
     │                                      │
     │ ✅ JWT tokens issued correctly      │
     │    Evidence: token.test.ts pass (5) │
     │                                      │
     │ ❌ Password reset flow works        │
     │    Missing: no reset tests found    │
     │                                      │
     │ ✅ Session expires after timeout    │
     │    Evidence: session.test.ts pass   │
     │                                      │
     │ Result: 3/4 passed                  │
     └──────────────────────────────────────┘
    ↓
3. Lớp 2: Test suite
   - Chạy full test suite (npm test, pytest, cargo test...)
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ LỚP 2: TEST SUITE                   │
     ├──────────────────────────────────────┤
     │ Total: 142 tests                    │
     │ ✅ Passed: 140                      │
     │ ❌ Failed: 2                        │
     │                                      │
     │ Failures:                            │
     │   reset.test.ts:23 — timeout        │
     │   reset.test.ts:45 — assertion fail │
     │                                      │
     │ Result: FAIL (2 failures)           │
     └──────────────────────────────────────┘
    ↓
4. Lớp 3: Cross-phase integration
   - Spawn integration-checker agent:
     → Chạy full test suite (không chỉ phase tests)
     → Check regression: phases completed trước có bị break?
     → Check interfaces: API contracts, shared types, DB schema
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ LỚP 3: CROSS-PHASE INTEGRATION     │
     ├──────────────────────────────────────┤
     │ Phase 1 (Core): ✅ no regression   │
     │ Phase 2 (Docs): ✅ no regression   │
     │ Interfaces: ✅ consistent           │
     │                                      │
     │ Result: PASS                        │
     └──────────────────────────────────────┘
    ↓
5. Lớp 4: UAT (User Acceptance Testing)
   - AI hỏi user từng criterion:
     "1. User can register and login — đạt chưa?"
     → User: đạt / chưa + lý do (nếu chưa)
     "2. JWT tokens issued correctly — đạt chưa?"
     → User: đạt / chưa
     ...
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ LỚP 4: USER ACCEPTANCE              │
     ├──────────────────────────────────────┤
     │ ✅ User can register and login      │
     │ ✅ JWT tokens issued correctly      │
     │ ❌ Password reset flow works        │
     │    User: "Email không gửi được"     │
     │ ✅ Session expires after timeout    │
     │                                      │
     │ Result: 3/4 accepted                │
     └──────────────────────────────────────┘
    ↓
6. Summary + Decision
   ┌──────────────────────────────────────┐
   │ VALIDATION SUMMARY                   │
   ├──────────────────────────────────────┤
   │ Phase [X]: [name]                   │
   │                                      │
   │ Lớp 1 (Criteria):    3/4 ⚠         │
   │ Lớp 2 (Tests):       FAIL ❌       │
   │ Lớp 3 (Integration): PASS ✅       │
   │ Lớp 4 (UAT):         3/4 ⚠         │
   │                                      │
   │ Overall: NOT PASSED                  │
   │                                      │
   │ Issues:                              │
   │   1. Password reset flow incomplete  │
   │      → Suggest: thêm reset logic    │
   │   2. 2 test failures in reset.test  │
   │      → Suggest: fix tests           │
   └──────────────────────────────────────┘

   → ALL 4 PASS:
     - Auto update ROADMAP: 🔄 in-progress → ✅ completed
     - Check all criteria checkboxes trong ROADMAP.md
     - Commit: "docs: complete phase [X] - [name]"
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST ► PHASE VALIDATED ✓ — COMPLETED
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ▶ "/st:phase-execute [X+1] để bắt đầu phase tiếp"
     ▶ "/st:milestone-audit nếu đây là phase cuối"

   → CÓ FAIL:
     - Status giữ 🔄 in-progress
     - List issues + suggest fixes
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST ► PHASE VALIDATION: [N] ISSUES
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ▶ Fix issues rồi chạy /st:phase-validate [X] lại
     ▶ "/st:phase-execute [X] để fix và re-execute"
    ↓
7. Write VERIFICATION.md
   - Lưu tại: .superteam/phases/[name]/VERIFICATION.md
   - Nội dung: kết quả 4 lớp, issues, decisions
   - Commit: "docs: validate phase [X] - [name] ([pass/fail])"
```

## Per-phase directory (hoàn chỉnh)

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
    ├── PLAN.md                 ← /st:phase-plan
    └── VERIFICATION.md         ← /st:phase-validate
```

## So sánh

| | GSD verifier | Superpowers verification | Superteam |
|---|---|---|---|
| Layers | Goal-backward (1 lớp) | verification-before-completion (1 lớp) | 4 lớp (criteria + tests + integration + UAT) |
| Auto-check | Grep-verifiable | Run commands | Grep + tests + AI analysis |
| Integration | integration-checker agent | Không | integration-checker agent |
| UAT | Không | Không | Hỏi user từng criterion |
| Auto-complete | Không rõ | Không | Auto update ROADMAP nếu pass |
| Output | Không rõ | Không file | VERIFICATION.md |
| Failed handling | Không rõ | Không | List issues + suggest fixes |

## Cải thiện

1. **4 lớp verification** — toàn diện hơn cả GSD (1 lớp) và Superpowers (1 lớp)
2. **UAT layer** — user xác nhận từng criterion, không chỉ dựa vào auto-check
3. **Auto-complete** — tự update ROADMAP khi pass, giảm thao tác
4. **VERIFICATION.md** — ghi lại kết quả, có thể review sau
5. **Issue suggestions** — không chỉ report fail, còn suggest cách fix
