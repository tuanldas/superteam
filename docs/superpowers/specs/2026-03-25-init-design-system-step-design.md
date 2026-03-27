# Thêm bước Design System vào `/st:init`

> Trạng thái: Draft

## Tổng quan

Thêm bước "Design System" vào flow `/st:init`, đặt sau bước Research (bước 5) và trước Define Requirements (bước 7). Bước này tạo `.superteam/DESIGN-SYSTEM.md` dựa trên context đã thu thập từ các bước trước, sử dụng adapted flow từ `/st:design-system` (bỏ các sub-steps trùng lặp).

## Bối cảnh

Hiện tại `/st:init` có 9 bước nhưng không cover UI/design. Các tính năng UI (`/st:ui-design`, `/st:design-system`, `ui-researcher`, `ui-auditor`) tồn tại như commands riêng biệt. Vấn đề: nhiều dự án (kể cả backend) cần design system ngay từ đầu (trang 404, coming soon, redirect...), nhưng init không nhắc đến.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Vị trí trong flow | Sau Research (bước 5), trước Requirements (bước 7) | Research cung cấp tech stack info; design system inform requirements và roadmap |
| Mức độ | Full flow của `/st:design-system` (adapted) | User muốn trải nghiệm đầy đủ, không rút gọn |
| Điều kiện chạy | Luôn hỏi user, bất kể loại project | Backend cũng có thể cần UI (404, coming soon, redirect) — auto-detect không bắt được |
| Khi user skip | Ghi lý do vào PROJECT.md, skip sang bước 7 | Các bước sau biết design system không có và tại sao |
| Adapted flow | Bỏ pre-checks, product context, research (đã có từ init) | Tránh hỏi trùng lặp, trải nghiệm mượt |
| Proposal style (init) | Từng dimension một (1 message/dimension), summary sau cùng | Batch 7 dimensions gây ngợp. Per-dimension giúp user focus và suy nghĩ kỹ từng phần. Standalone giữ batch vì use case khác (quick one-shot) |
| Tương thích standalone | Không thay đổi `/st:design-system` | Standalone đã có logic detect file tồn tại → hỏi update/start over |

## Thay đổi flow init (9 → 10 bước)

```
1. Config preferences          (giữ nguyên)
2. Setup + Auto-detect         (giữ nguyên)
3. Deep questioning            (giữ nguyên)
4. Write PROJECT.md            (giữ nguyên)
5. Research                    (giữ nguyên)
 ↓
6. Design System               ← MỚI
 ↓
7. Define requirements         (cũ: bước 6, thay đổi nhỏ)
8. Create roadmap              (cũ: bước 7, thay đổi nhỏ)
9. Spec review                 (cũ: bước 8, thay đổi nhỏ)
10. Done                       (cũ: bước 9, cập nhật bảng artifacts)
```

## Bước 6: Design System (chi tiết)

### Gate question

```
"Dự án này có cần design system không?
(Kể cả backend cũng có thể cần trang 404, coming soon, redirect...)"
  → Có: chạy design system flow
  → Không: ghi vào PROJECT.md, skip sang bước 7
```

### Khi user nói "Không"

- Thêm vào PROJECT.md:
  ```
  ## Design System
  Không cần — [lý do user nêu]
  ```
- Tiếp tục sang bước 7 (Define requirements)

### Khi user nói "Có" — 4 sub-steps

**6.1. Tổng hợp context tự động**
- Đọc context đã có: PROJECT.md, research findings (đặc biệt LANDSCAPE.md, STACK.md), auto-detect results
- Trích xuất: product type, target users, industry, tech stack (CSS framework, component library)
- Brownfield: scan codebase lấy fonts/colors/spacing đang dùng
  → Hiển thị: "Phát hiện: [fonts], [colors], [spacing]. Dùng làm baseline hay bắt đầu từ zero?"
  → Baseline: proposal builds on existing tokens
  → Zero: proposal ignores existing code, đề xuất hoàn toàn mới
- **Không hỏi thêm câu hỏi context** — tất cả đã có từ bước 2-5

**6.2. Đề xuất từng dimension một**

Đi từng dimension (primary flow, không phải drill-down). Mỗi dimension = 1 message riêng.

Thứ tự: AESTHETIC → DECORATION → TYPOGRAPHY → COLOR → SPACING → LAYOUT → MOTION

Format mỗi dimension:
```
[DIMENSION]: [recommendation]
  -- [rationale grounded in project context]

Recommend: [recommendation] — [why]. Confidence: High/Med/Low.

→ Approve / Adjust
```

- Approve → next dimension
- Adjust → drill-down inline (1 focused question: fonts: 3-5 candidates, colors: 2-3 palette options)
- Coherence check sau mỗi dimension vs đã approved:
  - Mismatch → nudge 1 lần, giải thích tại sao unusual, offer alternative
  - Luôn accept user decision, không block, không hỏi lại
- Adaptive: nếu answer trước đã imply dimension sau → skip hoặc pre-fill với confirmation
- Nếu init research có landscape data → dùng để inform recommendation
- Nếu không → dùng built-in design knowledge
- Áp dụng đầy đủ font rules (blacklist, overused warnings), AI slop anti-patterns từ `/st:design-system`

**6.3. Full summary + Preview**

Sau khi 7 dimensions approved → trình bày compact summary:

```
┌──────────────────────────────────────────────┐
│ DESIGN SYSTEM SUMMARY                        │
├──────────────────────────────────────────────┤
│ AESTHETIC: [approved value]                   │
│ DECORATION: [approved value]                  │
│ TYPOGRAPHY: [approved value]                  │
│ COLOR: [approved value]                       │
│ SPACING: [approved value]                     │
│ LAYOUT: [approved value]                      │
│ MOTION: [approved value]                      │
├──────────────────────────────────────────────┤
│ SAFE CHOICES: [2-3 decisions matching norms]  │
│ RISKS: [2-3 departures + rationale]           │
├──────────────────────────────────────────────┤
│ AI SLOP CHECK: [flagged patterns, if any]     │
└──────────────────────────────────────────────┘
```

- User options: Approve all / Adjust [section] / Start over
- Adjust [section] → revisit dimension đó (1 question), update summary
- Start over → quay lại 6.2 từ AESTHETIC
- Playwright preview nếu available:
  - Generate self-contained HTML preview page
  - Load proposed fonts, apply color palette
  - Realistic mockups theo project type (dashboard/marketing/admin)
  - Light/dark mode toggle, responsive
  - User feedback → adjust → regenerate loop
- Playwright unavailable → skip preview, chỉ text-based

**6.4. Lưu và commit**
- Save `.superteam/DESIGN-SYSTEM.md`
- Follow `superteam:atomic-commits`
- Commit: `design: create design system for [project]`

### So sánh sub-steps: Standalone vs Trong init

| Sub-step standalone | Trong init | Lý do |
|---|---|---|
| 1. Parse input | Bỏ | Init đã handle input |
| 2. Pre-checks | Bỏ | Init đã auto-detect, biết brownfield/greenfield |
| 3. Product context | Bỏ | Deep questioning (bước 3) đã cover |
| 4. Research | Bỏ/tái sử dụng | Init research (bước 5) đã có landscape data |
| 5. Proposal | **Giữ, adapted** (6.2) | Core value — đề xuất 7 dimensions. Init: từng dimension một (1 message/dimension). Standalone: batch tất cả |
| 6. Drill-downs | **Merged** vào 6.2 | Drill-down inline khi user adjust từng dimension, không tách step riêng |
| 7. Playwright preview | **Giữ** (6.3) | Core value — visual validation. Kết hợp với full summary |
| 8. Write file | **Giữ** (6.4) | Cần thiết — lưu artifact |
| 9. Done message | Bỏ | Init có done riêng (bước 10) |

## Ảnh hưởng đến các bước khác

### Bước 7 (Define requirements, cũ: bước 6)
- Nếu có DESIGN-SYSTEM.md → requirements có thể reference design tokens
  - Ví dụ: "REQ: support dark mode" vì design system đã define dark palette
- Nếu không có (user skip) → không ảnh hưởng

### Bước 8 (Create roadmap, cũ: bước 7)
- Roadmapper agent nhận thêm input: DESIGN-SYSTEM.md (nếu có)
- Các phase UI trong roadmap biết đã có design system → không cần tạo lại

### Bước 9 (Spec review, cũ: bước 8)
- Reviewer cross-check thêm DESIGN-SYSTEM.md (nếu có) với requirements và roadmap
- Kiểm tra: design tokens referenced trong requirements có tồn tại trong DESIGN-SYSTEM.md không

### Bước 10 (Done, cũ: bước 9)
- Cập nhật bảng artifacts:

```
| Artifact       | Location                      |
|----------------|-------------------------------|
| Config         | .superteam/config.json        |
| Project        | .superteam/PROJECT.md         |
| Research       | .superteam/research/          |
| Design System  | .superteam/DESIGN-SYSTEM.md   |  ← mới (nếu có)
| Requirements   | .superteam/REQUIREMENTS.md    |
| Roadmap        | .superteam/ROADMAP.md         |
```

- Nếu user skip design system → dòng Design System không hiển thị

## Output Artifacts (cập nhật)

```
my-project/
└── .superteam/
    ├── config.json
    ├── PROJECT.md
    ├── DESIGN-SYSTEM.md          ← mới (optional)
    ├── REQUIREMENTS.md
    ├── ROADMAP.md
    └── research/
        ├── STACK.md
        ├── LANDSCAPE.md
        ├── ARCHITECTURE.md
        ├── PITFALLS.md
        ├── [SECURITY.md]
        ├── [PERFORMANCE.md]
        ├── [ACCESSIBILITY.md]
        └── SUMMARY.md
```

## Tương thích với `/st:design-system` standalone

Không cần thay đổi `design-system.md`. Standalone đã có logic:
- Sub-step 2 (Pre-checks): kiểm tra `.superteam/DESIGN-SYSTEM.md` exists
  → Hỏi "Update, start over, or cancel?"
- Init tạo file → standalone tự detect → user chọn cập nhật

Hai flow bổ sung nhau tự nhiên.

## Files cần thay đổi

1. **`commands/init.md`** — Thêm bước 6, đánh số lại bước 6-9 thành 7-10, cập nhật output artifacts và done table
2. **`docs/specs/commands/st-init.md`** — Cập nhật spec tương ứng (flow, so sánh table, output artifacts)

## Không thay đổi

- `commands/design-system.md` — Giữ nguyên
- `docs/specs/commands/st-design-system.md` — Giữ nguyên
- Core modules (`detector.cjs`, `config.cjs`, `template.cjs`) — Không ảnh hưởng
- Hooks — Không ảnh hưởng
- Agents — Không ảnh hưởng
