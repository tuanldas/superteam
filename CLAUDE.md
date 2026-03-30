# Superteam Plugin - Project Rules

## Skill Writing

Khi viết hoặc cập nhật skill (`skills/*/SKILL.md`):
- Dispatch một Agent opus riêng biệt
- Truyền đầy đủ nội dung `/superpowers:writing-skills` skill + spec/design doc vào agent prompt
- Agent tự chạy full RED-GREEN-REFACTOR trong context riêng
- Main conversation chỉ nhận kết quả tóm tắt
- KHÔNG làm trực tiếp trong main context

## Visual-First Rule

Khi viết skill hoặc spec có liên quan đến UI/design:
- Visual dimensions (font, color, spacing, layout, decoration) PHẢI có preview inline khi propose — KHÔNG chỉ describe bằng text
- Preview HTML PHẢI default light background (`#fff`/`#fafafa`). Chỉ dark khi design system đã confirmed dark mode
- Nếu spec có multi-step flow, visual dimensions phải có preview PER DIMENSION — không batch tất cả rồi preview 1 lần cuối

## Agents

- KHÔNG sử dụng `run_in_background: true` khi spawn agents. Luôn chạy foreground parallel (nhiều Agent() calls trong cùng một message).

## Versioning

Sau mỗi batch thay đổi (feature, refactor, fix), bump version trước khi commit cuối:
- `package.json`, `package-lock.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Patch (0.x.Y): bugfix, nhỏ. Minor (0.X.0): feature mới, thay đổi kiến trúc
