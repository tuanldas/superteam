# Superteam Plugin - Project Rules

## Core Principles Architecture

`skills/core-principles/` là single source of truth cho mọi cross-cutting rules. Kiến trúc:

```
skills/core-principles/
├── SKILL.md                              # Overview + pointers (auto-inject cho ALL commands/agents)
└── references/
    ├── visual-first.md                   # Principle 1: preview trước khi quyết định
    ├── questioning.md                    # Principle 2: one question/message, adaptive, ASK/PRESENT/CONFIRM
    ├── decision-continuity.md            # Principle 3: decisions.json persistence
    └── research-boundaries.md            # Research output rules: 3-layer defense, language rules, anti-rationalization
```

Khi cần thay đổi bất kỳ rule nào về visual-first, questioning, decision continuity, hoặc research boundaries → sửa reference file tương ứng. KHÔNG duplicate rules vào commands, agents, hay CLAUDE.md. Các nơi khác chỉ reference đến core-principles.

### Khi nào thêm rule vào Core Principles?

Rule thuộc core-principles khi thỏa **cả 2 điều kiện**:
1. **Cross-cutting** — áp dụng cho 3+ commands/agents trở lên, không chỉ riêng một workflow
2. **Behavioral** — quy định CÁCH làm việc (how to interact, how to present, how to decide), không phải domain knowledge

Nếu rule chỉ áp dụng cho 1-2 commands → đặt trong command đó. Nếu rule là knowledge reference (design values, debug steps, test patterns) → đặt trong skill chuyên biệt (frontend-design, scientific-debugging, tdd-discipline).

Khi thêm rule mới vào core-principles:
- Tạo reference file `references/<tên>.md` chứa chi tiết
- Thêm pointer ngắn trong `SKILL.md` (2-3 dòng overview + link đến reference)
- Cập nhật Context Budget table trong `SKILL.md`
- KHÔNG inline chi tiết vào `SKILL.md` — giữ SKILL.md dưới 120 dòng

## Rule Hierarchy

Core Principles > Research findings > Agent preferences. Chi tiết: `skills/core-principles/SKILL.md`.

## Research Boundaries

Research output là findings, không phải instructions. Chi tiết: `skills/core-principles/references/research-boundaries.md`.

Tóm tắt: auto-save research files = OK, auto-apply decisions = KHÔNG OK. Mọi quyết định kiến trúc/tech từ research phải present cho user chọn trước khi áp dụng.

## Visual-First Rule

Preview trước khi quyết định. Chi tiết: `skills/core-principles/references/visual-first.md`.

Preview HTML tạo tại `.superteam/preview/<name>.html`, default light background (`#fff`/`#fafafa`).

## Skill Structure Exceptions

`core-principles` không cần sections Quick Reference và Common Mistakes. Đây là meta-skill (cross-cutting principles), không phải workflow skill. Mỗi principle đã có quick summary inline và chi tiết trong `references/`.

## Skill Frontmatter Convention

SKILL.md frontmatter chỉ dùng 2 fields: `name` và `description`. Trigger info embedded trong `description` text — đây là convention có chủ đích vì Claude Code route skills bằng LLM đọc prose, không parse structured fields. KHÔNG thêm `trigger`, `keywords`, hay `tags` field.

## Skill Writing

Khi viết hoặc cập nhật skill (`skills/*/SKILL.md`):
- Dispatch một Agent opus riêng biệt
- Truyền đầy đủ nội dung `/superpowers:writing-skills` skill + spec/design doc vào agent prompt
- Agent tự chạy full RED-GREEN-REFACTOR trong context riêng
- Main conversation chỉ nhận kết quả tóm tắt
- KHÔNG làm trực tiếp trong main context

## Agents

- KHÔNG sử dụng `run_in_background: true` khi spawn agents. Luôn chạy foreground parallel (nhiều Agent() calls trong cùng một message).

## Versioning

Sau mỗi batch thay đổi (feature, refactor, fix), bump version trước khi commit cuối:
- `package.json`, `package-lock.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Patch (0.x.Y): bugfix, nhỏ. Minor (0.X.0): feature mới, thay đổi kiến trúc
