# Superteam Plugin - Project Rules

## Skill Writing

Khi viết hoặc cập nhật skill (`skills/*/SKILL.md`):
- Dispatch một Agent opus riêng biệt
- Truyền đầy đủ nội dung `/superpowers:writing-skills` skill + spec/design doc vào agent prompt
- Agent tự chạy full RED-GREEN-REFACTOR trong context riêng
- Main conversation chỉ nhận kết quả tóm tắt
- KHÔNG làm trực tiếp trong main context
