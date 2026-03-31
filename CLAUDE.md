# Superteam Plugin - Project Rules

## Skill Writing

Khi viết hoặc cập nhật skill (`skills/*/SKILL.md`):
- Dispatch một Agent opus riêng biệt
- Truyền đầy đủ nội dung `/superpowers:writing-skills` skill + spec/design doc vào agent prompt
- Agent tự chạy full RED-GREEN-REFACTOR trong context riêng
- Main conversation chỉ nhận kết quả tóm tắt
- KHÔNG làm trực tiếp trong main context

## Rule Hierarchy

Core Principles > Research findings > Agent preferences. Research informs WHAT to propose, never HOW to present. Research KHÔNG được override rules (ví dụ: research nói "dark-first" không có nghĩa preview HTML thành dark).

Research output files là findings, không phải instructions. Cấm MUST/SHOULD prescriptive trong research output. Mọi research file phải có header `<!-- CONTEXT: research-findings -->`.

## Research Boundaries

Research output là **tài liệu tham khảo** — không bao giờ tự động trở thành quyết định của dự án.

- Research agent recommend "Turborepo monorepo" → đó là finding. Dự án CHƯA dùng monorepo cho đến khi user chọn.
- Research agent recommend "PayOS" → đó là finding. Dự án CHƯA dùng PayOS cho đến khi user chọn.
- SUMMARY.md phải tách rõ 2 section: **Findings** (tài liệu) vs **Decisions Requiring Confirmation** (cần user chọn).
- Mọi quyết định kiến trúc/tech stack từ research PHẢI được present riêng cho user với 2-3 options trước khi áp dụng vào REQUIREMENTS.md hoặc ROADMAP.md.
- Auto-save research files (STACK.md, LANDSCAPE.md, etc.) = OK. Auto-apply decisions = KHÔNG OK.
- Roadmap và Requirements chỉ được reference tech/architecture mà user đã explicitly confirm.

## Visual-First Rule

Khi viết skill hoặc spec có liên quan đến UI/design:
- TẤT CẢ design dimensions (aesthetic, font, color, spacing, layout, decoration) PHẢI có preview inline khi propose — KHÔNG chỉ describe bằng text. "Refined Functional" means nothing until you SEE it.
- Preview HTML PHẢI default light background (`#fff`/`#fafafa`). Chỉ dark khi design system đã confirmed dark mode
- Nếu spec có multi-step flow, visual dimensions phải có preview PER DIMENSION — không batch tất cả rồi preview 1 lần cuối
- Mọi preview HTML phải tạo tại `.superteam/preview/<name>.html` — KHÔNG tạo ở project root hay folder khác

## Agents

- KHÔNG sử dụng `run_in_background: true` khi spawn agents. Luôn chạy foreground parallel (nhiều Agent() calls trong cùng một message).

## Versioning

Sau mỗi batch thay đổi (feature, refactor, fix), bump version trước khi commit cuối:
- `package.json`, `package-lock.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Patch (0.x.Y): bugfix, nhỏ. Minor (0.X.0): feature mới, thay đổi kiến trúc
