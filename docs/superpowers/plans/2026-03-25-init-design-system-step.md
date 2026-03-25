# Init Design System Step - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Design System" step (step 6) to the `/st:init` flow, between Research and Define Requirements.

**Architecture:** Two markdown prompt files need editing — `commands/init.md` (the actual command Claude executes) and `docs/specs/commands/st-init.md` (the approved design spec). The new step is an adapted version of `/st:design-system` that skips redundant sub-steps already covered by init steps 1-5.

**Tech Stack:** Markdown prompt engineering (Claude Code plugin commands)

---

### Task 1: Add Design System step to init command

**Files:**
- Modify: `commands/init.md:1-2` (update description)
- Modify: `commands/init.md:122-200` (insert step 6, renumber 6-9 → 7-10, update artifacts/done)

- [ ] **Step 1: Update the frontmatter description**

In `commands/init.md`, change line 2:

```markdown
description: "Initialize project: config, auto-detect, deep questioning, research, design system, requirements, roadmap"
```

- [ ] **Step 2: Update the intro paragraph**

In `commands/init.md`, change line 7:

```markdown
Full project setup: configure preferences, auto-detect tech stack, deep questioning to understand the project, research domain, define design system, define requirements, create roadmap.
```

- [ ] **Step 3: Insert step 6 (Design System) after step 5 (Research)**

After line 121 (`   - Commit: `docs: complete research``), insert:

```markdown

6. **Design System**
   - Gate question: "Dự án này có cần design system không? (Kể cả backend cũng có thể cần trang 404, coming soon, redirect...)"
     - User nói Không: thêm vào PROJECT.md section `## Design System\nKhông cần — [lý do user nêu]`, skip sang bước 7
     - User nói Có: chạy adapted design system flow (sub-steps bên dưới)

   **6.1. Tổng hợp context tự động**
   - Đọc context đã có: PROJECT.md, research findings (đặc biệt LANDSCAPE.md, STACK.md), auto-detect results
   - Trích xuất: product type, target users, industry, tech stack (CSS framework, component library)
   - Brownfield: scan codebase lấy fonts/colors/spacing đang dùng
     → Hiển thị: "Phát hiện: [fonts], [colors], [spacing]. Dùng làm baseline hay bắt đầu từ zero?"
     → Baseline: proposal builds on existing tokens
     → Zero: proposal ignores existing code, đề xuất hoàn toàn mới
   - Không hỏi thêm câu hỏi context — tất cả đã có từ bước 2-5

   **6.2. Đề xuất đầy đủ 7 dimensions**
   - Dựa trên accumulated context → tạo proposal hoàn chỉnh:
     ```
     ┌──────────────────────────────────────────────┐
     │ DESIGN SYSTEM PROPOSAL                       │
     ├──────────────────────────────────────────────┤
     │ AESTHETIC: [direction] -- [rationale]         │
     │ DECORATION: [level] -- [rationale]            │
     │ TYPOGRAPHY: [fonts + scale] -- [rationale]    │
     │ COLOR: [palette + hex] -- [rationale]         │
     │ SPACING: [base + density] -- [rationale]      │
     │ LAYOUT: [approach + grid] -- [rationale]      │
     │ MOTION: [approach + easing] -- [rationale]    │
     ├──────────────────────────────────────────────┤
     │ SAFE CHOICES (category baseline):             │
     │ - [2-3 decisions matching conventions]        │
     │                                               │
     │ RISKS (product gets its own face):            │
     │ - [2-3 departures, each with rationale]       │
     ├──────────────────────────────────────────────┤
     │ AI SLOP CHECK: [flagged patterns, if any]     │
     └──────────────────────────────────────────────┘
     ```
   - If init research has landscape data → use to inform proposal
   - If not → use built-in design knowledge
   - Apply full font rules (blacklist, overused warnings) and AI slop anti-patterns from `/st:design-system`

   **6.3. Drill-downs + Preview**
   - User options: Approve, Adjust [section], Different risks, Start over
   - Each drill-down is 1 focused question (fonts: 3-5 candidates, colors: 2-3 palette options)
   - Coherence check after each change:
     - Mismatch → nudge once, explain why unusual, offer alternative
     - Always accept user decision, never block, never ask again
   - Playwright preview if available:
     - Generate self-contained HTML preview page
     - Load proposed fonts, apply color palette
     - Realistic mockups by project type (dashboard/marketing/admin)
     - Light/dark mode toggle, responsive
     - User feedback → adjust → regenerate loop
   - Playwright unavailable → skip preview, text-based only

   **6.4. Lưu và commit**
   - Save `.superteam/DESIGN-SYSTEM.md`
   - Follow `superteam:atomic-commits`
   - Commit: `design: create design system for [project]`
```

- [ ] **Step 4: Renumber step 6 (Define requirements) → step 7**

Change `6. **Define requirements**` to `7. **Define requirements**`.

Add at the start of step 7: `   - Load DESIGN-SYSTEM.md if exists (design tokens may inform requirements)`

- [ ] **Step 5: Renumber step 7 (Create roadmap) → step 8**

Change `7. **Create roadmap**` to `8. **Create roadmap**`.

Change the roadmapper input line to:
```markdown
   - Input: PROJECT.md + REQUIREMENTS.md + SUMMARY.md + DESIGN-SYSTEM.md (if exists) + config
```

- [ ] **Step 6: Renumber step 8 (Spec review) → step 9**

Change `8. **Spec review**` to `9. **Spec review**`.

Add to the reviewer checklist:
```markdown
     - DESIGN-SYSTEM.md (if exists): coherent, no conflicts with requirements
```

- [ ] **Step 7: Renumber step 9 (Done) → step 10, update artifacts table**

Change `9. **Done**` to `10. **Done**`.

Update the artifacts table to:
```
   | Artifact       | Location                      |
   |----------------|-------------------------------|
   | Config         | .superteam/config.json        |
   | Project        | .superteam/PROJECT.md         |
   | Research       | .superteam/research/          |
   | Design System  | .superteam/DESIGN-SYSTEM.md   |
   | Requirements   | .superteam/REQUIREMENTS.md    |
   | Roadmap        | .superteam/ROADMAP.md         |
```

Note: Design System row only shows if user chose "Có" in step 6. Add comment: `   - Design System row: only show if DESIGN-SYSTEM.md was created (user chose "Có" in step 6)`

- [ ] **Step 8: Update Output Artifacts section**

Update the Output Artifacts block to include DESIGN-SYSTEM.md:
```
project/
  .superteam/
    config.json
    PROJECT.md
    DESIGN-SYSTEM.md              [optional — created if user chose "Có" in step 6]
    REQUIREMENTS.md
    ROADMAP.md
    research/
      [dynamic — files depend on selected research areas]
      SUMMARY.md
```

- [ ] **Step 9: Verify the complete file is consistent**

Read `commands/init.md` end-to-end. Verify:
- Steps are numbered 1-10 sequentially
- Step 6 references context from steps 2-5
- Steps 7-9 conditionally reference DESIGN-SYSTEM.md
- Step 10 done table includes Design System row
- Output Artifacts includes DESIGN-SYSTEM.md
- Rules section still applies (no changes needed)

- [ ] **Step 10: Commit**

```bash
git add commands/init.md
git commit -m "feat: add Design System step to init flow (step 6)"
```

---

### Task 2: Update init design spec

**Files:**
- Modify: `docs/specs/commands/st-init.md:1-260` (update flow, comparison table, output artifacts)

- [ ] **Step 1: Update Tổng quan**

Change line 7:
```markdown
Khởi tạo project đầy đủ: config → detect → questioning → research → design system → requirements → roadmap.
```

- [ ] **Step 2: Update Quyết định thiết kế table**

Change line 14 from `Full flow (8 steps + spec review)` to `Full flow (9 steps + spec review)`.

Add new row after Spec review row:
```markdown
| Design System | Sau Research, trước Requirements. Luôn hỏi, adapted flow (bỏ bước trùng init) | Backend cũng cần UI (404, coming soon). Research cung cấp context, design system inform requirements |
```

- [ ] **Step 3: Insert step 6 in Flow section**

After the Research section (after line 151 `→ Commit: "docs: complete research"`), insert:

```markdown
    ↓
6. Design System
   - Gate: "Dự án này có cần design system không?
     (Kể cả backend cũng có thể cần trang 404, coming soon, redirect...)"
     → Không: ghi vào PROJECT.md "## Design System\nKhông cần — [lý do]", skip
     → Có: chạy adapted flow (4 sub-steps)

   6.1 Tổng hợp context tự động
       - Đọc: PROJECT.md, research findings, auto-detect results
       - Trích xuất: product type, users, industry, tech stack
       - Brownfield: "Phát hiện [fonts/colors/spacing]. Baseline hay zero?"
       - Không hỏi thêm — context đã đủ từ bước 2-5

   6.2 Đề xuất 7 dimensions
       - AESTHETIC, DECORATION, TYPOGRAPHY, COLOR, SPACING, LAYOUT, MOTION
       - SAFE CHOICES vs RISKS + AI SLOP CHECK
       - Dùng research landscape data nếu có, built-in knowledge nếu không
       - Áp dụng font rules + AI slop anti-patterns từ /st:design-system

   6.3 Drill-downs + Playwright preview
       - Approve / Adjust / Different risks / Start over
       - Coherence check: nudge 1 lần, accept user decision
       - Playwright nếu có: HTML preview, mockups, light/dark
       - Không có Playwright: text-based

   6.4 Lưu
       - Save .superteam/DESIGN-SYSTEM.md
       - Commit: "design: create design system for [project]"
```

- [ ] **Step 4: Renumber steps 6-8 → 7-10**

Change `6. Define requirements` → `7. Define requirements`
Change `7. Create roadmap` → `8. Create roadmap`

Update roadmap input:
```markdown
   - Input: PROJECT.md + REQUIREMENTS.md + SUMMARY.md + DESIGN-SYSTEM.md (nếu có) + config
```

Change `7.5 Spec review` → `9. Spec review`

Add to reviewer checklist:
```markdown
     → DESIGN-SYSTEM.md (nếu có): coherent, không conflict với requirements
```

Change `8. Done` → `10. Done`

- [ ] **Step 5: Update Done table in spec**

Update the artifacts table in the Done section:
```
   | Artifact       | Location                      |
   |----------------|-------------------------------|
   | Config         | .superteam/config.json        |
   | Project        | .superteam/PROJECT.md         |
   | Research       | .superteam/research/          |
   | Design System  | .superteam/DESIGN-SYSTEM.md   |
   | Requirements   | .superteam/REQUIREMENTS.md    |
   | Roadmap        | .superteam/ROADMAP.md         |
```

- [ ] **Step 6: Update Output Artifacts section**

Add `DESIGN-SYSTEM.md` to the file tree:
```
my-project/
└── .superteam/
    ├── config.json
    ├── PROJECT.md
    ├── DESIGN-SYSTEM.md       ← optional (step 6)
    ├── REQUIREMENTS.md
    ├── ROADMAP.md
    └── research/
        ...
```

- [ ] **Step 7: Update comparison table**

Add new row to the So sánh table:
```markdown
| **Design System** | Không | Không | Tích hợp trong init (adapted flow, luôn hỏi) |
```

- [ ] **Step 8: Add to Cải thiện sections**

Add to "Cải thiện so với GSD":
```markdown
8. **Design system tích hợp** → init hỏi về design system, GSD không có
```

Add to "Cải thiện so với Superpowers":
```markdown
5. **Design system trong init** → Superpowers không có design system step trong brainstorming
```

- [ ] **Step 9: Verify spec consistency**

Read `docs/specs/commands/st-init.md` end-to-end. Verify:
- Flow steps numbered 1-10 sequentially
- Comparison table includes Design System row
- Output Artifacts includes DESIGN-SYSTEM.md
- Cải thiện sections reference new step

- [ ] **Step 10: Commit**

```bash
git add docs/specs/commands/st-init.md
git commit -m "docs: update init spec with Design System step"
```
