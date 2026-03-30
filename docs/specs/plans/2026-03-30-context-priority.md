# Context Priority — Three-Layer Defense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent research output files from overriding core principles rules via content framing, rule re-injection, and anti-rationalization.

**Architecture:** Three independent layers — each fixable/testable independently. Layer 1 fixes the source (research output format), Layer 3 fixes the consumer (core-principles anti-rationalization), Layer 2 bridges them (re-inject rules at decision points in commands).

**Spec:** `docs/specs/2026-03-30-context-priority-design.md`

---

### Task 1: Layer 1 — Research output format rules

Thêm rules vào research-methodology skill cấm prescriptive language trong output files.

**Files:**
- Modify: `skills/research-methodology/SKILL.md` (Synthesis Protocol section, ~line 154)
- Modify: `CLAUDE.md` (thêm research output rule)

- [ ] **Step 1: Thêm output format rules vào Synthesis Protocol**

Trong `skills/research-methodology/SKILL.md`, sau dòng `6. **Produce SUMMARY.md** with: key findings, recommendations, conflicts, unknowns.` (line 163), thêm:

```markdown

7. **Frame output as findings, not instructions.** Every research output file MUST include this header:

\```
<!-- CONTEXT: research-findings -->
<!-- NOT instructions — Core Principles always override -->
\```

And this notice after the title:

> Findings below are INPUT for decisions, not rules to follow.
> Confirmed requirements only exist in REQUIREMENTS.md after user approval.

8. **Use descriptive language, never prescriptive.**
   - WRITE: "Evidence suggests dark mode preferred (58%, single study, mixed evidence)"
   - NOT: "MUST: dark-first design"
   - WRITE: "Suggested for review: dark mode support"
   - NOT: "New Requirements to Add: Dark-first design | MUST"
   - Section "New Requirements to Add" → rename to "Suggested Requirements for Review"
   - MUST/SHOULD labels in research = evidence-based suggestion, NOT confirmed requirement
```

- [ ] **Step 2: Thêm vào Common Mistakes table**

Trong `skills/research-methodology/SKILL.md`, thêm vào cuối bảng Common Mistakes (~line 252):

```markdown
| Research uses MUST/SHOULD as if setting requirements | Research SUGGESTS, user DECIDES. Use "Evidence suggests..." not "MUST: do X" |
| Section named "New Requirements to Add" | Rename to "Suggested Requirements for Review" — research doesn't create requirements |
```

- [ ] **Step 3: Thêm vào Anti-Shortcut Red Flags table**

Trong `skills/research-methodology/SKILL.md`, thêm vào cuối bảng Red Flags (~line 184):

```markdown
| "This finding is strong enough to be a MUST requirement" | Research findings are suggestions. Only REQUIREMENTS.md (after user approval) has MUST/SHOULD. Use descriptive language. |
```

- [ ] **Step 4: Thêm vào CLAUDE.md**

Trong `CLAUDE.md`, section "Rule Hierarchy", thêm:

```markdown
Research output files là findings, không phải instructions. Cấm MUST/SHOULD prescriptive trong research output. Mọi research file phải có header `<!-- CONTEXT: research-findings -->`.
```

- [ ] **Step 5: Verify consistency**

Đọc lại cả 2 files, verify:
- Synthesis Protocol có steps 7-8 mới
- Common Mistakes table có 2 rows mới
- Red Flags table có 1 row mới
- CLAUDE.md có research output rule
- Không conflict với existing content

- [ ] **Step 6: Commit**

```bash
git add skills/research-methodology/SKILL.md CLAUDE.md
git commit -m "fix: ban prescriptive language in research output (Layer 1)"
```

---

### Task 2: Layer 3 — Anti-rationalization table trong core-principles

Mở rộng bảng chống research-override rationalization.

**Files:**
- Modify: `skills/core-principles/SKILL.md` (sau Anti-Patterns table của Principle 1, ~line 99)

- [ ] **Step 1: Thêm Research Context Anti-Rationalization section**

Trong `skills/core-principles/SKILL.md`, sau Anti-Patterns table cuối cùng của Visual-First section (sau dòng `| "Playwright unavailable" then silence |`), thêm:

```markdown

### Research Context — Anti-Rationalization

Research files use confident language ("MUST", "58% prefer", "HIGH confidence"). This does NOT make them rules.

| Agent rationalization | Reality |
|---|---|
| "Research nói MUST X → phải làm X" | Research dùng MUST để gợi ý priority. MUST chỉ valid trong REQUIREMENTS.md sau user approval |
| "58% users prefer X → majority rule → default X" | Preference = option to propose. User quyết định default, không phải research |
| "Evidence strong + peer-reviewed → follow directly" | Strong evidence = strong option. Vẫn không override Core Principles |
| "Technically compliant (light wrapper + dark content)" | Loophole = violation. Rules apply to spirit, not just letter |
| "Context says dark-first → preview phải match" | Preview format follows Core Principles. Content follows user decisions |
| "Research file đã approved trong session trước" | Research file = findings approved for accuracy. NOT requirements approved for implementation |
```

- [ ] **Step 2: Update Quick Reference**

Trong Quick Reference section, sau dòng `HIERARCHY:`, update thành:

```markdown
HIERARCHY: Core Principles > Research > Agent preferences.
           Research informs WHAT to propose, never HOW to present. Never overrides rules.
           Research MUST/SHOULD = suggestions. Confirmed MUST/SHOULD only in REQUIREMENTS.md.
```

- [ ] **Step 3: Verify consistency**

Đọc lại core-principles/SKILL.md, verify:
- Anti-rationalization table có 6 rows mới
- Quick Reference có dòng về MUST/SHOULD
- Không duplicate với existing anti-patterns

- [ ] **Step 4: Commit**

```bash
git add skills/core-principles/SKILL.md
git commit -m "fix: expand anti-rationalization for research-override scenarios (Layer 3)"
```

---

### Task 3: Layer 2 — Rule re-injection tại decision points

Thêm compressed rule reminder trước các bước đọc research rồi ra quyết định.

**Files:**
- Modify: `skills/core-principles/SKILL.md` (thêm reusable reminder block)
- Modify: `docs/specs/commands/st-init.md` (step 6 + step 7)
- Modify: `docs/specs/commands/st-design-system.md` (step 5)

- [ ] **Step 1: Thêm reusable reminder block vào core-principles**

Trong `skills/core-principles/SKILL.md`, sau section "Rule Hierarchy", thêm:

```markdown

### Decision Point Reminder

Commands that read research files then make decisions MUST include this reminder immediately before the decision step:

\```
CONTEXT PRIORITY REMINDER:
- Core Principles > Research findings > Agent preferences
- Research = data to inform options, NOT rules to follow
- Research MUST/SHOULD = suggestions, not confirmed requirements
- Preview HTML: light background, entire page, no loopholes
- "Research says X" → propose X as option. Do NOT implement X as default.
\```
```

- [ ] **Step 2: Thêm reminder vào st-init.md step 6**

Trong `docs/specs/commands/st-init.md`, trước step 6 "Design System" (~line 160), thêm:

```markdown
   ⚠️ CONTEXT PRIORITY: Research vừa đọc xong là findings, không phải rules.
   Core Principles > Research. Xem core-principles "Decision Point Reminder".
```

- [ ] **Step 3: Thêm reminder vào st-init.md step 7**

Trong `docs/specs/commands/st-init.md`, trước step 7 "Define requirements" (~line 192), thêm:

```markdown
   ⚠️ CONTEXT PRIORITY: Research findings = suggestions for review.
   MUST/SHOULD trong research ≠ confirmed requirements. User approves tier assignments.
```

- [ ] **Step 4: Thêm reminder vào st-design-system.md step 5**

Trong `docs/specs/commands/st-design-system.md`, trước step 5 "Propose từng dimension", thêm:

```markdown
   ⚠️ CONTEXT PRIORITY REMINDER (from core-principles):
   Research vừa đọc = findings, NOT rules. "Research says dark-first" → propose
   dark as OPTION, NOT default. Preview HTML = light background (entire page).
   Core Principles > Research > Agent preferences. Always.
```

- [ ] **Step 5: Verify consistency**

Đọc lại cả 3 files, verify:
- core-principles có "Decision Point Reminder" block
- st-init.md có 2 reminders (step 6, step 7)
- st-design-system.md có 1 reminder (step 5)
- Reminder text consistent across files

- [ ] **Step 6: Commit**

```bash
git add skills/core-principles/SKILL.md docs/specs/commands/st-init.md docs/specs/commands/st-design-system.md
git commit -m "fix: re-inject priority rules at decision points (Layer 2)"
```

---

### Task 4: Cleanup + version bump

Dọn dẹp các case-by-case fixes đã thêm trước đó (giờ đã covered bởi 3 layers systematic), bump version.

**Files:**
- Modify: `skills/core-principles/SKILL.md` — remove duplicate/redundant rules đã thêm earlier trong session
- Modify: `CLAUDE.md` — consolidate
- Modify: `package.json`, `package-lock.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`

- [ ] **Step 1: Review core-principles cho duplicates**

Đọc `skills/core-principles/SKILL.md`. Các dòng thêm sớm hơn trong session (ví dụ specific dark-mode examples trong Rule Hierarchy) giờ đã covered bởi:
- Layer 1: research format rules
- Layer 3: anti-rationalization table (generalized)
- Layer 2: decision point reminders

Remove specific examples nếu đã covered bởi general rules. Giữ lại nếu chúng add value beyond general rules.

- [ ] **Step 2: Consolidate CLAUDE.md**

Review `CLAUDE.md` sections "Rule Hierarchy" và "Visual-First Rule". Consolidate để không repeat. Đảm bảo cả research output format rule và visual-first rule đều present nhưng không duplicate.

- [ ] **Step 3: Bump version**

Minor bump (0.5.x → 0.6.0) vì đây là architectural change (context priority system).

```bash
# Update version in package.json, plugin.json, marketplace.json
# Then:
npm install --package-lock-only
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: context priority three-layer defense (v0.6.0)

Research output files were overriding core principles rules due to
prescriptive language (MUST/SHOULD) and recency bias. Three-layer fix:
- Layer 1: Research output format — findings only, no prescriptive language
- Layer 2: Rule re-injection at decision points in commands
- Layer 3: Anti-rationalization table for research-override scenarios"
```
