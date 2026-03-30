# Visual-First Expansion — Design Spec

**Status:** Draft
**Date:** 2026-03-28
**Scope:** Mở rộng Principle 1 trong `skills/core-principles/SKILL.md`

## Overview

Mở rộng Principle 1 từ "Visual-First Verification" (chỉ cover verification sau implementation) thành "Visual-First" — 1 rule chung áp dụng cho MỌI tình huống content có thể show visual: design decisions, verification, so sánh, diagram, mockup, hay bất kỳ output nào user sẽ NHÌN thay vì ĐỌC.

## Problem

Hiện tại Principle 1 chỉ trigger khi "outcome is visual" (sau code). Trong thực tế, user phải chủ động yêu cầu "cho tôi xem" mỗi lần cần visual preview cho design decisions (aesthetic, color, layout, motion...). Không có rule nào bắt buộc AI tự động show preview trước khi user quyết định.

## Design Decisions

| # | Decision | Choice | Reasoning |
|---|----------|--------|-----------|
| 1 | Tách 1A/1B hay gộp chung | Gộp chung 1 rule | User muốn áp dụng mọi context, không chỉ design + verification. 1 rule đủ mạnh, đủ rộng |
| 2 | Thêm Principle mới hay mở rộng Principle 1 | Mở rộng Principle 1 | Cùng triết lý "visual-first", giữ 2 principles, compact hơn |
| 3 | Tạo skill riêng hay sửa core-principles | Sửa core-principles | Đã auto-inject mọi session, 30 commands + 20 agents đã reference, enforcement mạnh nhất |
| 4 | Preview infrastructure | Playwright MCP + local HTTP server | Superteam đã chọn Playwright MCP thay vì custom WebSocket server (như Superpowers). Dùng infrastructure có sẵn |
| 5 | Context budget | Thêm ~25-30 dòng | Core-principles inject mọi session. Giữ compact, không phá budget. Hiện ~126 dòng, thêm lên ~155 dòng |

## Changes

### Principle 1: Visual-First (mở rộng)

**Core statement thay đổi:**

```
Cũ: WHEN THE OUTCOME IS VISUAL, VERIFY VISUALLY.
Mới: WHEN IT CAN BE SHOWN, SHOW IT.
```

**Cấu trúc mới:**

```markdown
## Principle 1: Visual-First

WHEN IT CAN BE SHOWN, SHOW IT.

Text tells you what SHOULD look like.
A preview tells you what ACTUALLY looks like.

Default: visual preview > text description for any visual content.

### Signal

Nội dung sẽ được hiểu rõ hơn khi NHÌN so với khi ĐỌC:
- Design choices (color, font, layout, aesthetic, motion, decoration)
- Implementation results (UI, pages, components, CSS changes)
- So sánh / lựa chọn (A vs B options, before/after)
- Diagrams (architecture, data flow)
- Bất kỳ output nào user sẽ NHÌN thay vì ĐỌC

### Action

1. Tạo self-contained HTML (no framework dependencies)
2. Serve qua local HTTP server (`python3 -m http.server`)
3. Playwright navigate + screenshot
4. Trình bày screenshot trong conversation

### Fallback Chain

1. Playwright available → full preview (preferred)
2. Playwright unavailable → provide URL cho user mở thủ công + text mô tả
3. Không serve được → text-only + flag "Visual preview skipped — reduced confidence"

NEVER silently skip visual preview.

### Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Mô tả visual bằng text khi có thể show | Tạo HTML preview |
| Liệt kê options bằng text table cho design choices | Tạo side-by-side visual cards |
| "Code compiles" = verified | Screenshot rendered result |
| Grep CSS class = "looks correct" | Render and screenshot |
| Skip preview vì "simple change" | Simple changes break layouts — always preview |
| Playwright unavailable → im lặng | State it, provide URL, flag confidence |
```

### Quick Reference (cập nhật)

```markdown
1. VISUAL-FIRST
   Can be shown? → Show it. Before deciding AND after building.
   Action: HTML → local server → Playwright screenshot
   Fallback: URL thủ công → text + reduced confidence
   Never: text-only khi có thể preview, silent skip
```

## Impact on Other Files

### Files thay đổi

| File | Thay đổi |
|------|----------|
| `skills/core-principles/SKILL.md` | Mở rộng Principle 1, cập nhật Quick Reference |

### Files KHÔNG thay đổi

| File | Lý do |
|------|-------|
| `hooks/session-start.cjs` | Logic inject không đổi — vẫn strip frontmatter + meta, inject core content |
| `commands/brainstorm.md` | Đã reference core-principles, sẽ tự động pick up rule mới |
| `commands/design-system.md` | Đã reference core-principles |
| `commands/init.md` | Đã reference core-principles |
| `commands/ui-design.md` | Đã reference core-principles |
| Core modules | Không liên quan |

## Context Budget Analysis

| Metric | Trước | Sau | Delta |
|--------|-------|-----|-------|
| SKILL.md total lines | 155 | ~185 | +30 |
| Injected lines (sau strip) | ~126 | ~155 | +29 |
| Estimated tokens injected | ~1,800 | ~2,200 | +400 |

+400 tokens mỗi session là chấp nhận được cho một cross-cutting principle áp dụng toàn bộ workflow.

## Verification

Sau khi sửa, verify bằng:
1. `npm test` — existing tests pass
2. Chạy `node hooks/session-start.cjs` — confirm injected content có phần mở rộng
3. RED-GREEN-REFACTOR theo writing-skills TDD process (dispatch Opus agent)
