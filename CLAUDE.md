# Superteam Plugin - Project Rules

## Skill Writing

Khi viết hoặc cập nhật skill (`skills/*/SKILL.md`):
- Dispatch một Agent opus riêng biệt
- Truyền đầy đủ nội dung `/superpowers:writing-skills` skill + spec/design doc vào agent prompt
- Agent tự chạy full RED-GREEN-REFACTOR trong context riêng
- Main conversation chỉ nhận kết quả tóm tắt
- KHÔNG làm trực tiếp trong main context

## Versioning

Sau mỗi batch thay đổi (feature, refactor, fix), bump version trước khi commit cuối:
- `package.json`, `package-lock.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Patch (0.x.Y): bugfix, nhỏ. Minor (0.X.0): feature mới, thay đổi kiến trúc
