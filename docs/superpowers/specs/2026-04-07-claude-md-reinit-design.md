# CLAUDE.md Reinit — Design Spec

## Goal

Viết lại CLAUDE.md từ đầu theo Comprehensive Template (Approach A), kết hợp best practices từ claude-md-improver skill. Mục tiêu: balance giữa "project briefing" (giúp Claude hiểu project nhanh) và "behavior guide" (conventions, gotchas).

## Current State

- CLAUDE.md hiện tại: ~77 dòng, score 40/100 (Grade D)
- Thiếu: Commands, Architecture, Key Files, Code Style, Testing
- Tốt: Rules/conventions đều chính xác, chỉ cần condensed

## Design

### Structure (7 sections, ~65 dòng)

```
# Superteam Plugin
  → 1-line description

## Commands
  → Table: npm test, single test file

## Architecture
  → Directory tree with purpose annotations

## Key Files
  → 6 critical files with 1-line description each

## Code Style
  → 4 conventions: CommonJS, MD definitions, frontmatter rules, skill structure

## Testing
  → Runner info, file pattern, no external framework

## Gotchas
  → 5 condensed rules (agents, preview, skill writing, research, core-principles)

## Versioning
  → 4 files to bump, patch vs minor
```

### What Changes vs Current

| Aspect | Current | New |
|--------|---------|-----|
| Commands | Missing | Added (npm test) |
| Architecture | Missing | Added (full tree) |
| Key Files | Missing | Added (6 files) |
| Code Style | Missing | Added (4 conventions) |
| Testing | Missing | Added |
| Core Principles Architecture | 30 lines, detailed | 1 line in Gotchas |
| Rule Hierarchy | 2 lines | Removed (lives in core-principles/SKILL.md) |
| Research Boundaries | 4 lines | 1 line in Gotchas |
| Visual-First Rule | 3 lines | 1 line in Gotchas |
| Skill Structure Exceptions | 6 lines | Removed (too specific, lives in skill files) |
| Skill Frontmatter Convention | 3 lines | 1 line in Code Style |
| Skill Writing | 6 lines | 1 line in Gotchas |
| Agents rule | 2 lines | 1 line in Gotchas |
| Versioning | 4 lines | Kept, slightly condensed |

### Rules Removed (with justification)

1. **Skill Structure Exceptions** — Quá specific cho từng skill, thuộc về skill files, không cần ở project level
2. **Rule Hierarchy** — Đã có trong `skills/core-principles/SKILL.md`, duplicate
3. **Core Principles Architecture** (chi tiết) — Chi tiết về khi nào thêm rule, cách thêm → thuộc về `core-principles/SKILL.md`, CLAUDE.md chỉ cần pointer

### Rules Kept (condensed)

Tất cả rules quan trọng vẫn được cover trong Gotchas hoặc Code Style, chỉ gọn hơn:
- `run_in_background` prohibition
- Preview location convention
- Skill writing via Agent opus
- Research boundaries
- Core-principles as single source of truth
- Versioning protocol

## Success Criteria

- Score >= 80/100 theo claude-md-improver rubric
- Tất cả rules hiện tại vẫn được cover (không mất thông tin)
- Claude có thể hiểu project structure ngay lập tức
- File <= 80 dòng
