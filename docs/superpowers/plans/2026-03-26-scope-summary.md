# Scope Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Scope Summary format (10 sections) to init step 3 checkpoint and refine flow in step 7

**Architecture:** Update 2 markdown files — command definition (`commands/init.md`) and spec (`docs/specs/commands/st-init.md`). Step 3 gets full scope summary at checkpoint. Step 7 gets scope diff flow.

**Tech Stack:** Markdown only (command definitions)

---

### Task 1: Update step 3 checkpoint in `commands/init.md`

**Files:**
- Modify: `commands/init.md:44-72`

- [ ] **Step 1: Replace the SCOPE coverage area description**

In `commands/init.md`, replace line 47:

```
     - SCOPE: Clear boundaries (v1 does what, does NOT do what)
```

With:

```
     - SCOPE: Features, dependencies, effort signals, assumptions
```

- [ ] **Step 2: Replace the checkpoint section**

In `commands/init.md`, replace lines 62-72:

```
   - Checkpoint after 15 exchanges (or >= 4/5 areas covered):
     - Present summary: "Here is what I understand..."
       - WHO: [summary]
       - WHAT: [summary]
       - SCOPE: [summary]
       - EXIST: [summary]
       - DONE: [summary]
       - Uncovered areas: [list]
     - Ask: "Is this correct and complete? Anything to fix or add?"
     - User says enough: continue flow
     - User says more/fix: new questioning round (15 exchanges), loop unlimited
```

With:

```
   - Checkpoint after 15 exchanges (or >= 4/5 areas covered):
     - Present SCOPE SUMMARY (full format, 10 sections):
       1. WHAT WE KNOW — WHO, WHAT, EXIST, DONE, CONSTRAINTS from answers
       2. PROJECT OVERVIEW — narrative (2-3 sentences) + functional areas table (effort S/M/L/XL) + user roles table
       3. CORE USER JOURNEY — end-to-end flow + minimum complete path
       4. FEATURE MAP — dependency tree (what requires what)
       5. EFFORT + TINH CHAT — each feature: effort + Foundational/Additive
       6. RISKIEST ASSUMPTIONS — per feature: assumption + status (Validated/Unvalidated/Unknown). Features on Unknown → v2+.
       7. SCOPE RECOMMENDATION — MoSCoW (Must/Should/Could) with AI reasoning. Confidence: Med/Low.
       8. V1 SUCCESS SIGNAL — one observable user behavior that proves v1 works. Gut-check: every Must traces to this moment.
       9. WHAT V1 DELIBERATELY IGNORES — each excluded feature: why OK, risk if included, trigger to add later. Replaces flat "Won't" list.
       10. TRADEOFFS — key decisions with AI recommendation
     - End with: "Adjust scope nao truoc khi tiep tuc?"
     - User adjusts: move features between tiers, challenge assumptions, refine success signal
     - User approves: scope decisions saved to PROJECT.md with note "Preliminary scope — se refine sau research"
     - User says more/fix: new questioning round (15 exchanges), loop unlimited
```

- [ ] **Step 3: Commit**

```bash
git add commands/init.md
git commit -m "feat: add scope summary format to init step 3 checkpoint"
```

---

### Task 2: Update step 7 in `commands/init.md`

**Files:**
- Modify: `commands/init.md:187-196`

- [ ] **Step 1: Replace step 7 content**

In `commands/init.md`, replace lines 187-196:

```
7. **Define requirements**
   - Load DESIGN-SYSTEM.md if exists (design tokens may inform requirements)
   - Load research findings (LANDSCAPE.md for feature reference)
   - Categorize features: table stakes vs differentiators
   - User scopes: v1 / v2 / out of scope per category
   - Generate `REQUIREMENTS.md` with REQ-IDs format: `[CATEGORY]-[NUMBER]`
   - Present full list to user for approval
   - If conflicts with PROJECT.md: update PROJECT.md
   - Save to `.superteam/REQUIREMENTS.md`
   - Commit: `docs: define v1 requirements`
```

With:

```
7. **Define requirements (scope refine + generate)**
   - Load new context: research findings + DESIGN-SYSTEM.md (if exists) + PROJECT.md (with preliminary scope from step 3)
   - Present SCOPE DIFF — only changes vs step 3:
     - Features changed tier (e.g., "Comment: SHOULD → MUST because research showed...")
     - Assumptions updated status (e.g., "⚠️ → ✅ research confirmed")
     - New risks from research
     - Effort adjusted (e.g., "Real-time sync: [L] → [XL] because tech stack X")
     - Success signal refined if needed
     - Confidence: High/Med
   - If no changes from research: state "Research confirmed step 3 scope. No changes."
   - User confirm/adjust → finalize scope
   - Generate `REQUIREMENTS.md` with REQ-IDs format: `[CATEGORY]-[NUMBER]`
     - Each Must/Should feature becomes a REQ-ID
     - Could/Won't features listed in "Deferred" section with reasoning
   - Present full list to user for approval
   - If conflicts with PROJECT.md: update PROJECT.md
   - Save to `.superteam/REQUIREMENTS.md`
   - Commit: `docs: define v1 requirements`
```

- [ ] **Step 2: Commit**

```bash
git add commands/init.md
git commit -m "feat: add scope diff flow to init step 7"
```

---

### Task 3: Update step 3 in spec `docs/specs/commands/st-init.md`

**Files:**
- Modify: `docs/specs/commands/st-init.md:84-95`

- [ ] **Step 1: Replace step 3e checkpoint in spec**

In `docs/specs/commands/st-init.md`, replace lines 84-95:

```
   e. Checkpoint sau 15 lượt (hoặc ≥ 4/5 areas covered)
      → Trình bày tổng quan: "Đây là những gì tôi hiểu..."
        - WHO: [tóm tắt]
        - WHAT: [tóm tắt]
        - SCOPE: [tóm tắt]
        - EXIST: [tóm tắt]
        - DONE: [tóm tắt]
        - Areas chưa cover: [liệt kê]
      → Hỏi: "Đã đúng và đủ chưa? Cần sửa/thêm gì?"
      → User: "Đủ rồi" → tiếp flow
      → User: "Cần thêm/sửa" → vòng questioning mới (15 lượt)
      → Lặp không giới hạn số vòng
```

With:

```
   e. Checkpoint sau 15 lượt (hoặc ≥ 4/5 areas covered)
      → Trình bày SCOPE SUMMARY (full format, 10 sections):
        1. WHAT WE KNOW — WHO, WHAT, EXIST, DONE, CONSTRAINTS
        2. PROJECT OVERVIEW — narrative + bảng mảng chức năng (effort) + bảng user roles
        3. CORE USER JOURNEY — flow end-to-end + minimum complete path
        4. FEATURE MAP — dependency tree
        5. EFFORT + TÍNH CHẤT — mỗi feature: effort (S/M/L/XL) + Foundational/Additive
        6. RISKIEST ASSUMPTIONS — mỗi feature: giả định + status (✅/⚠️/❌)
        7. SCOPE RECOMMENDATION — MoSCoW (Must/Should/Could) + AI reasoning. Confidence: Med/Low
        8. V1 SUCCESS SIGNAL — hành vi user observable khi v1 thành công
        9. WHAT V1 DELIBERATELY IGNORES — mỗi feature bỏ: why OK, risk nếu thêm, trigger khi nào thêm
        10. TRADEOFFS — key decisions + AI recommendation
      → Kết thúc: "Adjust scope nào trước khi tiếp tục?"
      → User adjust → sửa scope
      → User approve → lưu vào PROJECT.md (ghi "Preliminary scope — sẽ refine sau research")
      → User: "Cần thêm/sửa" → vòng questioning mới (15 lượt)
      → Lặp không giới hạn số vòng
```

- [ ] **Step 2: Update SCOPE coverage area description**

In `docs/specs/commands/st-init.md`, replace line 64:

```
      ☐ SCOPE - Ranh giới rõ ràng (v1 làm gì, KHÔNG làm gì)
```

With:

```
      ☐ SCOPE - Features, dependencies, effort signals, assumptions
```

- [ ] **Step 3: Commit**

```bash
git add docs/specs/commands/st-init.md
git commit -m "docs: update init spec with scope summary checkpoint"
```

---

### Task 4: Update step 7 in spec `docs/specs/commands/st-init.md`

**Files:**
- Modify: `docs/specs/commands/st-init.md:182-190`

- [ ] **Step 1: Replace step 7 in spec**

In `docs/specs/commands/st-init.md`, replace lines 182-190:

```
7. Define requirements
   - Load DESIGN-SYSTEM.md nếu có (design tokens inform requirements)
   - Load research findings (LANDSCAPE.md cho feature reference)
   - Categorize features (table stakes / differentiators)
   - User scope v1/v2/out of scope per category
   - Generate REQUIREMENTS.md với REQ-IDs ([CATEGORY]-[NUMBER])
   - Trình bày full list, xin user approval
   - Nếu phát hiện conflict → update PROJECT.md
   - Commit: "docs: define v1 requirements"
```

With:

```
7. Define requirements (scope refine + generate)
   - Load context mới: research findings + DESIGN-SYSTEM.md (nếu có) + PROJECT.md (có scope từ step 3)
   - Trình bày SCOPE DIFF — chỉ thay đổi so với step 3:
     → Features đổi tier (vd: "Comment: SHOULD → MUST vì research cho thấy...")
     → Assumptions cập nhật status (vd: "⚠️ → ✅ research confirmed")
     → Risks mới từ research
     → Effort điều chỉnh (vd: "Real-time sync: [L] → [XL] vì tech stack X")
     → Success signal refine nếu cần
     → Confidence: High/Med
   - Nếu không có thay đổi: "Research xác nhận scope step 3. Không thay đổi."
   - User confirm/adjust → finalize scope
   - Generate REQUIREMENTS.md với REQ-IDs ([CATEGORY]-[NUMBER])
     → Mỗi Must/Should → REQ-ID
     → Could/Won't → section "Deferred" kèm lý do
   - Trình bày full list, xin user approval
   - Nếu phát hiện conflict → update PROJECT.md
   - Commit: "docs: define v1 requirements"
```

- [ ] **Step 2: Commit**

```bash
git add docs/specs/commands/st-init.md
git commit -m "docs: update init spec step 7 with scope diff flow"
```

---

### Task 5: Update design decision table in spec

**Files:**
- Modify: `docs/specs/commands/st-init.md:18`

- [ ] **Step 1: Add scope summary decision to table**

In `docs/specs/commands/st-init.md`, after line 25 (the Design System row), add a new row:

```
| Scope Summary | Step 3 full (10 sections) + step 7 diff | Step 3 có đủ context từ questioning; step 7 refine với research. AI recommend, user adjust. |
```

- [ ] **Step 2: Commit**

```bash
git add docs/specs/commands/st-init.md
git commit -m "docs: add scope summary design decision to init spec"
```
