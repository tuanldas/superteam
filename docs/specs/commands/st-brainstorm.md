# `/st:brainstorm` - Brainstorm Ideas

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Khám phá ý tưởng mơ hồ và biến thành spec rõ ràng. Dùng khi user có ý tưởng nhưng chưa rõ scope, requirements, hoặc cách tiếp cận. Zero-infrastructure (hoạt động không cần `/st:init`). Tích hợp research 2 rounds, visual companion qua Playwright MCP, AI hybrid questioning, spec review bằng subagent.

**Khi nào dùng:**
- Ý tưởng mới, chưa rõ scope: "làm gì đó với auth", "cải thiện UX"
- Muốn khám phá approaches trước khi plan
- Cần research domain trước khi quyết định

**Không dùng khi:**
- Đã rõ scope và requirements → dùng `/st:plan` trực tiếp
- Đang trong roadmap và biết rõ phase cần làm → dùng `/st:phase-plan`

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Mục đích | Ý tưởng mơ hồ → spec rõ ràng | Phân biệt với st:plan (đã rõ scope) |
| Infrastructure | Zero — không cần /st:init | Linh hoạt: brainstorm bất cứ lúc nào |
| Questioning | Hybrid: AI tổng hợp + hỏi bổ sung gray areas | Nhanh hơn 1-câu-1-lượt, kỹ hơn chỉ-confirm |
| Research | Luôn chạy, 2 rounds (broad → focused) | Round 1 = domain overview, Round 2 = deep dive sau khi hiểu rõ hơn |
| Visual | Playwright MCP companion, per-question decision | Có sẵn trong stack từ st:ui-design, không cần custom server |
| Scope | Auto-detect lớn → đề xuất tách sub-projects | Tránh spec quá lớn, mỗi sub-project cycle riêng |
| Output | Spec doc tại .superteam/specs/ + commit | Persistent, versioned, feeds vào /st:plan |
| Spec review | Subagent reviewer, max 3 vòng | Đảm bảo chất lượng spec trước khi planning |
| Image input | Mọi loại: mockup, diagram, screenshot, whiteboard | Ý tưởng có thể đến từ nhiều nguồn |
| Next step | Gợi ý, không tự động chain | User quyết định /st:plan hay /st:phase-plan |

## Flow

```
1. Input
   - User: "/st:brainstorm thêm real-time notifications"
   - Hoặc không argument → "Bạn muốn brainstorm về gì?"
   - Image input: mockup, diagram, screenshot, whiteboard notes
    ↓
2. Check context
   - .superteam/ tồn tại?
     → Có: load config, PROJECT.md, REQUIREMENTS.md, DESIGN-SYSTEM.md
     → Không: hoạt động bình thường, chỉ thiếu project context
   - Scan codebase: tech stack, patterns, conventions, files liên quan
    ↓
3. Scope assessment
   - AI đánh giá: ý tưởng có nhiều subsystems độc lập không?
     (VD: "làm platform với chat, file storage, billing, analytics")
   → Quá lớn:
     "Ý tưởng này gồm [N] subsystems độc lập. Recommend tách
      thành sub-projects, brainstorm từng cái:
      1. [Sub-project A] — [mô tả]
      2. [Sub-project B] — [mô tả]
      3. [Sub-project C] — [mô tả]
      Bắt đầu với cái nào?"
     → User chọn → brainstorm sub-project đó
     → Các sub-project khác brainstorm sau
   → Vừa: tiếp tục
    ↓
4. Visual companion offer
   - "Trong brainstorm có thể cần show mockup, diagram, so sánh
     visual trên browser (qua Playwright). Bạn có muốn dùng không?"
   → Có: enable visual mode
   → Không: text-only brainstorm
   - Per-question decision: AI quyết định mỗi câu hỏi/section
     dùng browser hay terminal:
     → Visual (mockup, layout, diagram, so sánh UI): browser
     → Text (concept, tradeoff, scope, requirements): terminal
    ↓
5. Research round 1 (broad)
   - Luôn chạy, không hỏi user
   - Web search: best practices, industry patterns, existing solutions
     cho domain của ý tưởng
   - Codebase scan: patterns liên quan, code có sẵn có thể reuse
   - Output: tóm tắt findings (không show raw results)
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ RESEARCH FINDINGS                    │
     ├──────────────────────────────────────┤
     │ Industry: [patterns phổ biến]       │
     │ Best practices: [key insights]      │
     │ Existing solutions: [tools/libs]    │
     │ Codebase: [code liên quan]          │
     │ Risks: [potential issues]           │
     └──────────────────────────────────────┘
    ↓
6. AI tổng hợp + confirm
   - AI đọc: ý tưởng + context + research findings
   - Trình bày hiểu biết:
     ┌──────────────────────────────────────┐
     │ HIỂU BIẾT VỀ Ý TƯỞNG               │
     ├──────────────────────────────────────┤
     │ Ý tưởng: [mô tả AI hiểu]          │
     │ Mục tiêu: [đạt được gì]            │
     │ Scope: [bao gồm gì]               │
     │ Không bao gồm: [loại trừ]          │
     │ Target users: [ai dùng]            │
     │ Constraints: [giới hạn]            │
     │ Gray areas: [điểm chưa rõ]         │
     └──────────────────────────────────────┘
   - Hỏi user: "Đúng không? Cần bổ sung/sửa gì?"
   - User: confirm → tiếp
   - User: sửa → AI cập nhật, confirm lại
   - Loop cho đến user đồng ý
    ↓
7. Hỏi bổ sung (nếu có gray areas)
   - Hỏi từng câu, multiple choice ưu tiên
   - AI recommend option + lý do + tại sao không chọn options khác
   - Visual companion cho câu hỏi visual (if enabled)
   - Giải thích thuật ngữ đặc biệt + ví dụ cụ thể khi cần
   - Số câu hỏi: tùy gray areas, thường 2-5 câu
    ↓
8. Research round 2 (focused, nếu cần)
   - AI đánh giá: sau khi hiểu rõ hơn từ user answers,
     có cần tìm hiểu sâu thêm không?
   → Cần: "Dựa trên answers, cần research thêm về [topic cụ thể].
     Đang tìm hiểu..."
     → Web search focused vào specific aspect
     → Trình bày: tóm tắt findings round 2
   → Không cần: skip, tiếp tục
    ↓
9. Propose 2-3 approaches
   - Dựa trên research + context + user answers
   - Mỗi approach:
     → Tên + mô tả ngắn
     → Trade-offs (ưu/nhược)
     → Phù hợp khi nào
   - AI recommend: "[Approach X] vì [lý do].
     Không chọn [Y] vì [lý do], [Z] vì [lý do]."
   - Visual companion: show diagram/mockup nếu approaches
     có khía cạnh visual (if enabled)
   - User: chọn approach hoặc mix từ nhiều approaches
    ↓
10. Present design (section by section)
    - Sections tùy theo ý tưởng, có thể gồm:
      → Architecture / System overview
      → Components / Modules
      → Data flow / Data model
      → API / Interfaces
      → Error handling
      → Security considerations
      → Testing approach
    - Mỗi section:
      → AI trình bày (vài câu → 200-300 words tùy complexity)
      → Visual companion cho section visual (if enabled)
      → User: approve / sửa
    - Scale theo complexity:
      → Đơn giản: 2-3 sections
      → Trung bình: 4-5 sections
      → Phức tạp: 6-7 sections
    ↓
11. Write spec doc
    - Lưu tại: .superteam/specs/[YYYY-MM-DD]-[topic].md
    - Nội dung: tổng hợp tất cả decisions + design sections
    - Format: heading structure rõ ràng, có thể đọc độc lập
    - Commit: "spec: [topic]"
    ↓
12. Spec review (subagent)
    - Dispatch reviewer subagent kiểm tra:
      → Completeness: còn TODO/placeholder không?
      → Consistency: mâu thuẫn nội bộ?
      → Clarity: yêu cầu mơ hồ?
      → Scope: focused cho 1 plan không?
      → YAGNI: tính năng chưa cần?
    - Kết quả: Approved hoặc Issues Found
    - Issues Found:
      → AI fix issues
      → Re-dispatch reviewer
      → Max 3 vòng
      → Sau 3 vòng vẫn issues → hỏi user quyết định
    ↓
13. User review spec
    - "Spec đã viết tại [path]. Review và cho biết cần sửa gì
       trước khi chuyển sang planning."
    - User: approve → done
    - User: sửa → fix + re-run spec review (step 12)
    ↓
14. Done
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST ► BRAINSTORM COMPLETE ✓
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Spec: .superteam/specs/[topic].md
    ▶ "/st:plan để tạo implementation plan"
    ▶ "/st:phase-plan nếu đang trong roadmap"
```

## So sánh

| | Superpowers | GSD | Superteam |
|---|---|---|---|
| Mục đích | Mọi task đều qua (HARD GATE) | discuss-phase riêng | Chỉ khi ý tưởng mơ hồ |
| Questioning | 1 câu/lượt (chậm) | Không rõ chi tiết | Hybrid: tổng hợp + hỏi bổ sung |
| Research | Không có trong brainstorm | Tách riêng phase-research | Tích hợp 2 rounds (broad → focused) |
| Visual | Custom Node.js server (WebSocket) | Không | Playwright MCP (có sẵn) |
| Scope detection | Manual decomposition | Không built-in | AI auto-detect + đề xuất tách |
| Output | Spec doc + git commit | CONTEXT.md | Spec doc tại .superteam/specs/ |
| Spec review | Subagent, 3 vòng | Không | Subagent, 3 vòng |
| Image input | Không | Không | Mọi loại |
| Next step | Auto chain writing-plans | Vào plan-phase | Gợi ý, user quyết định |
| Infrastructure | Cần git worktree | Cần ROADMAP.md | Zero-infrastructure |

## Cải thiện so với industry

1. **Hybrid questioning** — nhanh hơn Superpowers (1 câu/lượt), kỹ hơn GSD (chỉ discuss nhẹ)
2. **Research tích hợp 2 rounds** — Superpowers không có research, GSD tách riêng thành phase khác
3. **Playwright MCP visual** — không cần custom server như Superpowers, dùng infra có sẵn
4. **AI auto-detect scope** — proactive phát hiện ý tưởng quá lớn và đề xuất tách
5. **Zero-infrastructure** — không cần init hay ROADMAP.md, brainstorm bất cứ lúc nào
6. **Image input** — cả Superpowers và GSD đều không hỗ trợ
7. **Gợi ý next step** — không bắt buộc chain như Superpowers, user tự quyết định
