# `/st:ui-design` - UI Design Full Pipeline

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Full pipeline: UI-SPEC (design contract) → mockup preview trên Playwright → user feedback (interactive click) → generate production code → verification (visual + CSS + responsive + accessibility). Fill gap lớn nhất industry: không ai nối cả pipeline thành 1 command.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Scope | Full pipeline: UI-SPEC → mockup → code → verify | Fill gap lớn nhất: không ai nối cả pipeline |
| Design system | Check DESIGN-SYSTEM.md → nếu không có, gợi ý /st:design-system | Project-level consistency, không define lại mỗi page |
| Design system library | Detect + confirm (Tailwind, MUI, shadcn...) | Tận dụng auto-detect, user override nếu cần |
| Feedback loop | Interactive click (mặc định) + screenshot/text bất cứ lúc nào | Chính xác nhất, linh hoạt |
| Verification | Visual compare + CSS check + responsive 4 breakpoints + a11y | Cover tất cả: layout + values + responsive + accessibility |
| Accessibility | Tự động check (WCAG AA: contrast, ARIA, keyboard) | Check sớm sửa dễ, gần như free |
| Image input | Accept ảnh bất cứ lúc nào | Reference, wireframe, inspiration |

## Flow

```
1. Detect context
   - Đọc .superteam/config.json (frameworks, frontend workspace)
   - .superteam/PROJECT.md (core value, target users)
   - .superteam/REQUIREMENTS.md (UI-related requirements)
   - Detect existing UI code (brownfield)
   - Image input: accept ảnh bất cứ lúc nào
    ↓
2. Design system check
   - .superteam/DESIGN-SYSTEM.md tồn tại?
     → Có: load colors, fonts, spacing, components
     → Không: gợi ý chạy /st:design-system
       → User đồng ý: chạy /st:design-system trước
       → User từ chối: xác định tạm cho lần này (không lưu project-level)
   - Detect design system library (Tailwind, MUI, shadcn...)
   - User confirm hoặc override
    ↓
3. Questioning (nhẹ, 2-3 câu)
   - "Bạn muốn design trang/component nào?"
   - "Có reference/inspiration nào không?"
   - Image input: wireframe vẽ tay, screenshot reference...
    ↓
4. Generate UI-SPEC (design contract)
   - Color: dùng từ DESIGN-SYSTEM.md (hoặc tạm nếu không có)
   - Typography: font, sizes, weights per role
   - Spacing: token-based scale (4px multiples)
   - Components: sử dụng components từ design system detected
   - Copywriting: CTA text, empty states, error messages
   - Commit: "design: UI-SPEC for [page/component]"
    ↓
5. Generate mockup + preview
   - Tạo HTML/CSS prototype dùng design system thực tế
   - Mở trên Playwright MCP
   - User xem trực tiếp trên browser
    ↓
6. Iteration loop
   a. User feedback (nhiều cách):
      - Click element trên browser → Playwright capture selector + CSS
        → AI biết chính xác cần sửa gì
      - Gửi screenshot annotated
      - Mô tả bằng text

   b. AI update mockup → refresh preview

   c. Lặp cho đến user satisfied
    ↓
7. Generate production code
   - Convert mockup → production components
   - Dùng đúng design system (React + shadcn, Vue + Vuetify...)
   - Responsive: mobile-first approach
   - Accessible: ARIA labels, contrast, keyboard nav
    ↓
8. Verification (tự động)
   - Chạy app (dev server)

   a. Visual compare:
      - Screenshot mockup vs real app
      - Highlight differences

   b. CSS property check:
      - Extract actual CSS values (spacing, colors, font-size)
      - Compare với UI-SPEC
      - Report mismatches

   c. Responsive check:
      - Resize 320px → screenshot (mobile)
      - Resize 768px → screenshot (tablet)
      - Resize 1024px → screenshot (desktop)
      - Resize 1440px → screenshot (wide)

   d. Accessibility check:
      - Contrast ratio (WCAG AA: 4.5:1 text, 3:1 large text)
      - ARIA roles/labels
      - Keyboard navigation (tab order)
      - Accessibility tree analysis

   - Trình bày report:
     ┌──────────────────────────────────┐
     │ UI VERIFICATION                  │
     ├──────────────────────────────────┤
     │ Visual match:    ✓/✗             │
     │ CSS accuracy:    [N]/[N] correct │
     │ Responsive:      [breakpoints]   │
     │ Accessibility:   [score]         │
     ├──────────────────────────────────┤
     │ Issues: [list]                   │
     └──────────────────────────────────┘

   - Nếu có issues → auto-fix → re-verify
   - Nếu clean → tiếp
    ↓
9. Export
   - Lưu UI-SPEC: .superteam/designs/[name]-spec.md
   - Lưu mockup: .superteam/designs/[name].html
   - Screenshot: .superteam/designs/[name]-[breakpoint].png
   - Verification report: .superteam/designs/[name]-report.md
   - Commit: "design: [page/component] verified"
    ↓
10. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► UI DESIGN COMPLETE ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Visual: ✓ | CSS: ✓ | Responsive: ✓ | A11y: ✓
```

## Dependency: `/st:design-system`

`/st:ui-design` check `.superteam/DESIGN-SYSTEM.md` trước khi bắt đầu.
- Có: dùng luôn
- Không: gợi ý `/st:design-system`, hoặc user chọn tạm cho lần này

Xem chi tiết: [st-design-system.md](st-design-system.md)

## So sánh

| | Superpowers | GSD | Industry (v0/Figma) | Superteam |
|---|---|---|---|---|
| Design contract | Không | UI-SPEC.md (text-only) | Không | UI-SPEC + visual preview |
| Design system | Không | 6-dimension contract (per phase) | shadcn default | Project-level DESIGN-SYSTEM.md |
| Mockup preview | Visual companion (static HTML) | Không | v0: live preview | Playwright MCP (real browser) |
| User feedback | Click HTML options | Text-only | v0: text chat | Interactive click + screenshot + text |
| Code generation | Không | Sau planning | v0: instant | Từ approved mockup |
| Verification | Không | UI-REVIEW (text audit) | Không | Visual + CSS + Responsive + A11y |
| Responsive check | Không | Không | Không | 4 breakpoints tự động |
| A11y check | Không | Không | Không | WCAG AA tự động |
| Full pipeline | Không | Partial (spec → plan) | Partial (prompt → code) | UI-SPEC → mockup → code → verify |

## Cải thiện so với industry

1. **Full pipeline** → UI-SPEC → mockup → code → verify, không ai có
2. **Interactive feedback** → click element trên real browser, Playwright capture
3. **Design system project-level** → consistent across pages, không define lại
4. **Verification 4 chiều** → visual + CSS + responsive + a11y
5. **Responsive tự động** → 4 breakpoints, screenshot mỗi breakpoint
6. **A11y proactive** → check trong design phase, không đợi code review
