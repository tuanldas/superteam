<!-- CONTEXT: implementation-plan -->

# Skill Coverage Gap — Implementation Plan

**Date:** 2026-03-31
**Version target:** 0.8.0 (minor — new skill + agent + structural changes)
**Scope:** 6 work items, organized by priority

---

## Audit Summary

| Metric | Count |
|--------|-------|
| Skills hiện có | 14 |
| Skills planned chưa implement | 1 (questioning) |
| Agents hiện có | 20 |
| Agents missing | 1 (research-orchestrator) |
| Agents cần fix skill loading | 5 |
| Design docs approved chưa merge | 2 (context-priority, visual-first) |
| README outdated | Yes (liệt kê 11/14 skills) |

---

## Work Item 1: Implement `questioning` skill

**Priority:** P0 — Design đã approved, reference file đã có, 12+ commands cần update
**Effort:** Medium

### Context

- Design spec: `docs/superpowers/specs/2026-03-26-questioning-skill-design.md`
- Reference file đã tồn tại: `skills/core-principles/references/questioning.md`
- core-principles/SKILL.md đã reference Principle 2 → questioning.md
- 6 commands cần major update (Group A): init, quick, debug, ui-design, plan, team
- 6 commands cần minor update (Group B): phase-discuss, milestone-new, phase-validate, design-system, brainstorm, debug-quick
- 15 commands cần reference addition (Group C)

### Decision Required

**Option A — Standalone skill:** Tạo `skills/questioning/SKILL.md` riêng biệt, chứa full methodology. core-principles chỉ reference.
- Pro: Modular, có thể trigger độc lập
- Con: Duplicate nội dung với `core-principles/references/questioning.md`

**Option B — Giữ nguyên trong core-principles:** Questioning đã là Principle 2 trong core-principles. Chỉ cần update commands để load core-principles đúng cách + expand questioning.md.
- Pro: Không tăng context budget, questioning đã auto-inject qua core-principles
- Con: Không có standalone trigger

**Option C (Recommended) — Thin standalone + deep reference:** Tạo `skills/questioning/SKILL.md` nhưng chỉ chứa trigger rules và redirect đến `core-principles/references/questioning.md` cho methodology. Commands Group A/B update theo design spec.
- Pro: Có standalone trigger, không duplicate, context-efficient
- Con: Cần 2-hop loading cho full methodology

### Implementation Steps

1. Tạo `skills/questioning/SKILL.md` với frontmatter + core rules (one-question-per-message, ASK/PRESENT/CONFIRM types, adaptive flow)
2. Update 6 Group A commands: restructure questioning flow theo design spec before/after examples
3. Update 6 Group B commands: add questioning reference + minor flow adjustments
4. Add `superteam:questioning` reference to 15 Group C commands
5. Verify core-principles Principle 2 cross-references correctly

---

## Work Item 2: Create `research-orchestrator` agent

**Priority:** P0 — 5+ commands delegate to "Research Orchestration flow" nhưng không có agent chuyên biệt
**Effort:** Medium

### Context

- research-methodology/SKILL.md Section "Research Orchestration" mô tả 6-step deep research flow
- Hiện tại: commands spawn phase-researcher agents parallel → research-synthesizer tổng hợp
- Missing: Agent điều phối giữa 2 bước trên — quyết định research areas, spawn researchers theo waves, handle dependencies, feed kết quả vào synthesizer
- Affected commands: init (step 5), milestone-new (step 6), phase-research (step 2), plan (step 5), brainstorm (step 5-8)

### Implementation Steps

1. Tạo `agents/research-orchestrator.md` với responsibilities:
   - Nhận research scope từ command
   - Chọn research areas từ catalog (dynamic, dựa trên project context)
   - Spawn phase-researcher agents theo waves (wave-parallelism skill)
   - Collect results, handle failures/retries
   - Feed vào research-synthesizer
   - Return SUMMARY.md cho command
2. Load skills: research-methodology, wave-parallelism, project-awareness
3. Update commands (init, phase-research, plan, milestone-new, brainstorm) để delegate đến research-orchestrator thay vì tự orchestrate

---

## Work Item 3: Fix agent-skill loading gaps

**Priority:** P1 — Agents hoạt động nhưng thiếu knowledge base quan trọng
**Effort:** Small

### Gaps identified

| Agent | Missing Skill Load | Why Needed |
|-------|-------------------|------------|
| `codebase-mapper` | project-awareness | Cần biết project type/framework để scan đúng patterns |
| `ui-auditor` | frontend-design | Chứa WCAG rules, spacing values, typography standards — chính xác cái auditor cần để score |
| `ux-designer` | frontend-design, project-awareness | Cần design rules để tạo spec đúng standards, cần project context để chọn đúng framework patterns |
| `developer` | team-coordination (khi trong team context) | Cần biết role boundaries, escalation rules, communication protocol |
| `senior-developer` | team-coordination (khi trong team context) | Tương tự developer + review responsibilities |
| `devops-engineer` | team-coordination (khi trong team context) | Cần biết decision hierarchy, khi nào escalate |

### Implementation Steps

1. `codebase-mapper.md`: Add `Load superteam:project-awareness` vào Context Loading section
2. `ui-auditor.md`: Add `Load superteam:frontend-design` — đây là knowledge base chính cho scoring
3. `ux-designer.md`: Add `Load superteam:frontend-design` + `superteam:project-awareness`
4. `developer.md`, `senior-developer.md`, `devops-engineer.md`: Add conditional load `superteam:team-coordination` khi agent được spawn trong team context (check `.superteam/team/config.json` exists)

---

## Work Item 4: Merge approved designs into core-principles

**Priority:** P1 — 2 design docs đã approved, chưa implement
**Effort:** Medium

### 4a: Context Priority Three-Layer Defense

**Design doc:** `docs/specs/2026-03-30-context-priority-design.md`
**Implementation plan:** `docs/specs/plans/2026-03-30-context-priority.md` (4 tasks đã detail)

Tasks (copy từ existing plan):
1. **Layer 1 — Content Framing:** Update `research-methodology/SKILL.md` + `CLAUDE.md` — add output format rules banning prescriptive language in research files
2. **Layer 3 — Anti-Rationalization:** Expand anti-rationalization table trong `core-principles/SKILL.md` với 6 research-override scenarios
3. **Layer 2 — Rule Re-injection:** Add context priority reminders tại decision points trong `core-principles/SKILL.md`, `st-init.md`, `st-design-system.md`
4. **Cleanup:** Remove duplicate rules, verify consistency

### 4b: Visual-First Expansion

**Design doc:** `docs/superpowers/specs/2026-03-28-visual-first-expansion-design.md`

Changes to `core-principles/SKILL.md` Principle 1:
1. Rename "Visual-First Verification" → broader "When It Can Be Shown, Show It"
2. Expand signals list (beyond just design — include implementation results, comparisons, diagrams)
3. Add anti-patterns section
4. Update Quick Reference
5. Context budget: +400 tokens (~25-30 lines)

---

## Work Item 5: Update README.md

**Priority:** P2 — Documentation sync
**Effort:** Small

### Changes needed

1. Skills section: Update từ 11 → 15 skills (add frontend-design, team-coordination, questioning [new])
2. Agents section: Update từ 13 → 21 agents (add research-orchestrator [new] + missing agents)
3. Commands section: Verify 30 commands all listed (check team, review-feedback, etc.)
4. Version reference: Update nếu có

---

## Work Item 6: Version bump to 0.8.0

**Priority:** P2 — After all changes
**Effort:** Tiny

### Files to update

- `package.json`: version → "0.8.0"
- `package-lock.json`: version → "0.8.0"
- `.claude-plugin/plugin.json`: version → "0.8.0"
- `.claude-plugin/marketplace.json`: version → "0.8.0"

### Rationale

Minor version bump (0.7.2 → 0.8.0) vì:
- New skill (questioning)
- New agent (research-orchestrator)
- Structural changes (agent-skill loading, core-principles expansion)

---

## Execution Order

```
Phase 1 (Parallel — P0):
├── WI-1: questioning skill
└── WI-2: research-orchestrator agent

Phase 2 (Parallel — P1):
├── WI-3: Agent-skill loading fixes
└── WI-4: Core-principles merges (4a + 4b)

Phase 3 (Sequential — P2):
├── WI-5: README update
└── WI-6: Version bump + commit
```

Phase 1 items are independent, có thể dispatch parallel agents.
Phase 2 items are independent, có thể parallel.
Phase 3 phải sau Phase 1+2 vì cần biết final state.

---

## Notes

- Theo CLAUDE.md rules: skill writing PHẢI dispatch Agent opus riêng biệt với full `/superpowers:writing-skills` spec
- Mỗi agent nhận đầy đủ context (design docs + existing files) và tự chạy RED-GREEN-REFACTOR
- Main conversation chỉ nhận kết quả tóm tắt
