# `/st:milestone-audit` - Kiểm Tra Milestone

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Kiểm tra toàn bộ milestone qua 3 lớp: phase completion, requirements coverage (3-source cross-reference), và integration check. Output: AUDIT.md trong milestones/. Khi passed → suggest `/st:milestone-complete`. Khi có gaps → suggest cụ thể commands để fix từng gap.

**Yêu cầu:** ROADMAP.md + ít nhất 1 phase completed.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Prerequisite | ROADMAP.md + ≥1 phase completed | Phải có gì đó để audit |
| Verification layers | 3 lớp: phases + REQ coverage + integration | Toàn diện nhưng không overkill (không Nyquist) |
| REQ coverage | 3-source cross-ref: REQUIREMENTS.md × ROADMAP.md × VERIFICATION.md | Phát hiện orphan, incomplete, unverified REQs |
| Integration | Spawn integration-checker agent | Regression across all phases |
| Output | .superteam/milestones/v{X.Y}-AUDIT.md | Gắn với version, prerequisite cho milestone-complete |
| Routing | Suggest cụ thể command cho mỗi gap | Actionable, user biết làm gì tiếp |

## Flow

```
/st:milestone-audit
Không cần argument (audit milestone hiện tại từ ROADMAP.md)

1. Check context
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse milestone hiện tại: version, description, tất cả phases
   - Có phases completed? → Không: "Chưa có phase nào completed.
     Chạy /st:phase-validate trước." → Dừng
   - Trình bày overview:
     ┌──────────────────────────────────────┐
     │ MILESTONE AUDIT                      │
     ├──────────────────────────────────────┤
     │ Milestone: v1.0 — MVP               │
     │ Phases: 5 total                     │
     │   ✅ completed: 3                   │
     │   🔄 in-progress: 1                 │
     │   ⏳ planned: 1                      │
     └──────────────────────────────────────┘
    ↓
2. Lớp 1: Phase completion
   - Với mỗi phase trong milestone:
     → Status = ✅ completed? Check VERIFICATION.md tồn tại?
     → Status = 🔄 in-progress? → Flag as gap
     → Status = ⏳ planned? → Flag as gap
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ LỚP 1: PHASE COMPLETION             │
     ├──────────────────────────────────────┤
     │ ✅ Phase 1: Core Framework          │
     │    VERIFICATION.md: có ✓            │
     │    All criteria: passed ✓           │
     │                                      │
     │ ✅ Phase 2: Documentation           │
     │    VERIFICATION.md: có ✓            │
     │    All criteria: passed ✓           │
     │                                      │
     │ ✅ Phase 3: Authentication          │
     │    VERIFICATION.md: có ✓            │
     │    All criteria: passed ✓           │
     │                                      │
     │ 🔄 Phase 4: API Layer              │
     │    ⚠ CHƯA COMPLETED                 │
     │    VERIFICATION.md: không có        │
     │                                      │
     │ ⏳ Phase 5: Testing                  │
     │    ⚠ CHƯA BẮT ĐẦU                  │
     │                                      │
     │ Result: 3/5 phases completed        │
     └──────────────────────────────────────┘
    ↓
3. Lớp 2: Requirements coverage (3-source cross-reference)
   - Source 1: REQUIREMENTS.md → list tất cả REQ-IDs
   - Source 2: ROADMAP.md → mỗi REQ-ID assigned cho phase nào
   - Source 3: VERIFICATION.md của mỗi phase → REQ-ID nào đã verified
   - Cross-reference:
     → COVERED: REQ có cả 3 sources (assigned + phase completed + verified)
     → INCOMPLETE: REQ assigned cho phase nhưng phase chưa completed
     → UNVERIFIED: REQ assigned, phase completed, nhưng không có trong VERIFICATION.md
     → ORPHAN: REQ có trong REQUIREMENTS.md nhưng không assigned cho phase nào
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ LỚP 2: REQUIREMENTS COVERAGE        │
     ├──────────────────────────────────────┤
     │ Total REQs: 15                      │
     │                                      │
     │ ✅ COVERED (10):                    │
     │    REQ-001..REQ-010                 │
     │                                      │
     │ ⚠ INCOMPLETE (3):                   │
     │    REQ-011: Phase 4 (in-progress)   │
     │    REQ-012: Phase 4 (in-progress)   │
     │    REQ-013: Phase 5 (planned)       │
     │                                      │
     │ ❌ UNVERIFIED (1):                  │
     │    REQ-014: Phase 2 completed nhưng │
     │    không có trong VERIFICATION.md   │
     │                                      │
     │ ❌ ORPHAN (1):                      │
     │    REQ-015: Không gán cho phase nào │
     │                                      │
     │ Coverage: 10/15 (67%)               │
     └──────────────────────────────────────┘
    ↓
4. Lớp 3: Integration check
   - Spawn integration-checker agent:
     → Chạy full test suite
     → Check regression across all completed phases
     → Check interfaces (API contracts, types, DB schema)
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ LỚP 3: INTEGRATION                  │
     ├──────────────────────────────────────┤
     │ Test suite: 245 pass, 0 fail ✓     │
     │ Regression: no issues ✓             │
     │ Interfaces: consistent ✓            │
     │                                      │
     │ Result: PASS                        │
     └──────────────────────────────────────┘
    ↓
5. Audit summary + routing
   ┌──────────────────────────────────────┐
   │ AUDIT SUMMARY                        │
   ├──────────────────────────────────────┤
   │ Milestone: v1.0 — MVP               │
   │                                      │
   │ Lớp 1 (Phases):      3/5 ⚠         │
   │ Lớp 2 (Coverage):    67% ⚠         │
   │ Lớp 3 (Integration): PASS ✅       │
   │                                      │
   │ Overall: NOT READY                   │
   │                                      │
   │ Gaps:                                │
   │   1. Phase 4 chưa completed         │
   │      → /st:phase-execute 4          │
   │      → /st:phase-validate 4         │
   │   2. Phase 5 chưa bắt đầu          │
   │      → /st:phase-discuss 5          │
   │   3. REQ-014 unverified             │
   │      → /st:phase-validate 2         │
   │   4. REQ-015 orphan                 │
   │      → /st:phase-add hoặc re-scope │
   └──────────────────────────────────────┘

   → ALL 3 PASS (100% phases + 100% coverage + integration):
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST ► MILESTONE AUDIT: PASSED ✓
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ▶ "/st:milestone-complete để hoàn thành milestone"

   → CÓ GAPS:
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ST ► MILESTONE AUDIT: [N] GAPS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ▶ Fix gaps rồi chạy /st:milestone-audit lại
    ↓
6. Write AUDIT.md
   - Tạo directory .superteam/milestones/ nếu chưa có
   - Lưu tại: .superteam/milestones/v{X.Y}-AUDIT.md
   - Nội dung: 3 lớp results, gaps, recommendations
   - Commit: "docs: audit milestone v{X.Y} ([passed/N gaps])"
```

## So sánh

| | GSD audit-milestone | Superpowers | Superteam |
|---|---|---|---|
| Steps | 7 | Không có | 6 |
| Layers | 3-source + Nyquist | N/A | 3 lớp (phases + coverage + integration) |
| Nyquist | Có | N/A | Không (GSD-specific) |
| REQ cross-reference | REQUIREMENTS + VERIFICATION + SUMMARY | N/A | 3-source: REQUIREMENTS × ROADMAP × VERIFICATION |
| Integration | integration-checker agent | N/A | integration-checker agent |
| Output | YAML frontmatter report | N/A | Markdown AUDIT.md trong milestones/ |
| Routing | Không rõ | N/A | Suggest cụ thể command cho mỗi gap |
| State dependency | STATE.md | N/A | ROADMAP.md header |

## Cải thiện so với industry

1. **3 lớp rõ ràng** — phases + REQ coverage + integration, không Nyquist (GSD-specific)
2. **3-source cross-reference** — phát hiện orphan, incomplete, unverified REQs
3. **Actionable routing** — mỗi gap kèm command cụ thể để fix
4. **AUDIT.md trong milestones/** — gắn với version, prerequisite cho milestone-complete
5. **Không cần STATE.md** — parse từ ROADMAP.md header
