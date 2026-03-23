# `/st:milestone-complete` - Đánh Dấu Milestone Hoàn Thành

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Hoàn thành milestone hiện tại: pre-flight check (AUDIT passed), gather stats, archive docs (copy ROADMAP + REQUIREMENTS vào milestones/), tạo MILESTONES.md entry với retrospective (AI draft, user confirm), update PROJECT.md, git tag. Files gốc giữ nguyên — `/st:milestone-archive` dọn sau.

**Yêu cầu:** AUDIT.md phải tồn tại và PASSED.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Prerequisite | Bắt buộc AUDIT passed | Quality gate, đảm bảo milestone thực sự xong |
| Archive docs | Copy ROADMAP + REQUIREMENTS vào milestones/v{X.Y}/ | Backup an toàn, cùng folder với AUDIT |
| MILESTONES.md | Create on first, prepend on subsequent (newest first) | Single history file |
| Retrospective | Inline trong MILESTONES.md entry | Gọn, co-located với accomplishments |
| PROJECT.md | AI suggest updates, user confirm | Nhẹ hơn GSD 7-point review nhưng vẫn hữu ích |
| Git tag | v{X.Y} annotated tag | Standard practice |
| Phase directories | Giữ nguyên (milestone-archive dọn sau) | Tách concern: complete ≠ cleanup |

## Flow

```
/st:milestone-complete
Không cần argument (complete milestone hiện tại)

1. Pre-flight check
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse milestone hiện tại: version, description
   - AUDIT.md tồn tại? (.superteam/milestones/v{X.Y}-AUDIT.md)
     → Không:
       ┌──────────────────────────────────────┐
       │ ⚠ CHƯA AUDIT                         │
       ├──────────────────────────────────────┤
       │ Chưa có AUDIT.md cho milestone v1.0 │
       │ → Chạy /st:milestone-audit trước    │
       └──────────────────────────────────────┘
       → Dừng
     → Có nhưng có gaps:
       ┌──────────────────────────────────────┐
       │ ⚠ AUDIT CÓ GAPS                      │
       ├──────────────────────────────────────┤
       │ Audit v1.0 có 3 gaps chưa fix.      │
       │ → Fix gaps rồi chạy                 │
       │   /st:milestone-audit lại           │
       └──────────────────────────────────────┘
       → Dừng
     → Có và PASSED: tiếp
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ MILESTONE COMPLETION                 │
     ├──────────────────────────────────────┤
     │ Milestone: v1.0 — MVP               │
     │ Phases: 5 (all completed ✓)         │
     │ Requirements: 15 (100% covered ✓)   │
     │ Audit: PASSED ✓                     │
     │                                      │
     │ Tiếp tục complete? (y/n)            │
     └──────────────────────────────────────┘
    ↓
2. Gather stats
   - Parse từ ROADMAP.md + AUDIT.md + REQUIREMENTS.md + git log:
     → Total phases, total REQs
     → Total commits (git log --oneline cho milestone)
     → Start date (first phase commit)
     → End date (hôm nay)
     → Key accomplishments (từ phase names + success criteria)
    ↓
3. Archive docs
   - Copy vào .superteam/milestones/v{X.Y}/:
     → ROADMAP.md → milestones/v{X.Y}/ROADMAP.md
     → REQUIREMENTS.md → milestones/v{X.Y}/REQUIREMENTS.md
     (AUDIT.md đã ở đó từ milestone-audit)
   - Files gốc giữ nguyên (milestone-archive dọn sau)
   - Commit: "docs: archive milestone v{X.Y} docs"
    ↓
4. Write MILESTONES.md entry + retrospective
   - File: .superteam/MILESTONES.md
   - Nếu chưa tồn tại: tạo mới với header
   - Nếu đã tồn tại: prepend entry mới (newest first)
   - AI draft entry + retrospective:
     ┌──────────────────────────────────────┐
     │ MILESTONES.md ENTRY                  │
     ├──────────────────────────────────────┤
     │ ## v1.0 — MVP                       │
     │ - Duration: 2026-01-15 → 2026-03-20│
     │ - Phases: 5 (Phase 1–5)            │
     │ - Requirements: 15 fulfilled        │
     │ - Commits: 87                       │
     │                                      │
     │ ### Accomplishments                  │
     │ - Core Framework: plugin system     │
     │ - Documentation: README + API docs  │
     │ - Authentication: JWT + sessions    │
     │ - API Layer: REST endpoints         │
     │ - Testing: 95% coverage             │
     │                                      │
     │ ### Retrospective                    │
     │ - Went well:                        │
     │   1. Phased approach giữ focus      │
     │   2. Research phase tránh sai lầm   │
     │ - Could improve:                    │
     │   1. Phase 4 mất lâu hơn dự kiến   │
     │   2. Test coverage muộn             │
     │ - Lessons:                          │
     │   1. Nên test sớm hơn              │
     │                                      │
     │ Đúng chưa? Sửa/bổ sung?            │
     └──────────────────────────────────────┘
   - User: confirm / sửa
   - Commit: "docs: complete milestone v{X.Y}"
    ↓
5. Update PROJECT.md
   - AI review PROJECT.md, suggest updates:
     → Requirements đã fulfilled → move sang Validated
     → Assumptions đã confirm/invalidate
     → Scope có thay đổi không
   - Trình bày cho user:
     ┌──────────────────────────────────────┐
     │ PROJECT.md UPDATES                   │
     ├──────────────────────────────────────┤
     │ Suggest:                            │
     │   1. Requirements REQ-001..015      │
     │      → move sang Validated          │
     │   2. Assumption #3: "JWT đủ cho     │
     │      auth" → Confirmed              │
     │   3. Scope: API stable, ready for   │
     │      mobile milestone               │
     │                                      │
     │ Approve / sửa / skip?              │
     └──────────────────────────────────────┘
   - User: approve / sửa / skip
   - Nếu có changes: commit "docs: update project after v{X.Y}"
    ↓
6. Git tag
   - Tạo annotated tag:
     git tag -a v{X.Y} -m "Milestone v{X.Y}: [description]"
   - Trình bày: "Tag v{X.Y} đã tạo. Push với: git push origin v{X.Y}"
    ↓
7. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► MILESTONE COMPLETED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   | Artifact        | Location                          |
   |-----------------|-----------------------------------|
   | Archive         | .superteam/milestones/v{X.Y}/     |
   | History         | .superteam/MILESTONES.md          |
   | Git tag         | v{X.Y}                            |

   Milestone: v{X.Y} — [description]
   Duration: [start] → [end]
   Phases: [N] | REQs: [M] | Commits: [C]

   ▶ "/st:milestone-archive để dọn dẹp phase files"
   ▶ "/st:milestone-new để tạo milestone tiếp"
```

## So sánh

| | GSD complete-milestone | Superpowers | Superteam |
|---|---|---|---|
| Steps | 13 (rất nặng) | Không có | 7 (gọn hơn) |
| Prerequisite | Check audit exists | N/A | Bắt buộc audit PASSED |
| Archive | ROADMAP + REQUIREMENTS | N/A | ROADMAP + REQUIREMENTS (copy, giữ gốc) |
| MILESTONES.md | Tạo entry | N/A | Create/prepend, newest first |
| Retrospective | File riêng RETROSPECTIVE.md | N/A | Inline trong MILESTONES.md |
| PROJECT.md | 7-point evolution review | N/A | AI suggest + user confirm (nhẹ hơn) |
| Git tag | Có | N/A | Có |
| Phase archival | Trong complete | N/A | Tách ra milestone-archive |
| Branch handling | Có | N/A | Không (user tự quyết định) |
| ROADMAP reorganize | Collapse trong details | N/A | Không cần (nối thẳng) |
| State update | STATE.md | N/A | Không cần |

## Cải thiện so với industry

1. **Gọn hơn GSD** — 7 steps thay vì 13, bỏ STATE.md, branch handling, ROADMAP reorganize
2. **Quality gate** — bắt buộc audit PASSED, GSD chỉ check exists
3. **Inline retrospective** — gọn hơn file riêng, co-located với milestone entry
4. **Tách complete vs archive** — separation of concerns, user chọn lúc nào cleanup
5. **AI suggest PROJECT.md** — nhẹ hơn GSD 7-point review nhưng vẫn giữ PROJECT.md cập nhật
6. **Newest-first MILESTONES.md** — đọc nhanh milestone gần nhất
