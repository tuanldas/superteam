# `/st:code-review` - Code Review (1 Reviewer Agent, 13 Domains)

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Code review layered: linting → 1 reviewer agent (13 domains) → tổng hợp report → fix with receiving logic (verify trước khi implement). Support 3 scope types: local diff, PR, specific files.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Architecture | Layered: linting → 1 reviewer agent (13 domains) → report → fix | Linting bắt style, reviewer bắt logic/design |
| Reviewer | 1 agent (Opus), 13 domains, mặc định check TẤT CẢ relevant domains | 1 agent có full context, select domains theo project type |
| Scope | Local diff / PR / specific files / --only | Mỗi use case khác nhau |
| Confidence | >= 80% mới report. Critical 90+ / Important 80+ | Giảm false positives |
| Linter | Detect có sẵn, nếu không → recommend setup | Không bỏ qua linting layer |
| Fix | Report + auto-fix offer, qua receiving logic | Verify issue tồn tại trước khi fix |
| Output | Report only, không post PR comment | User quyết định |
| Receiving mode | Tách command riêng: `/st:review-feedback` | Chủ đề khác, use case khác |
| Image input | Accept ảnh | Screenshot UI bug, visual regression |

## Flow

```
1. Detect scope
   - Không argument → local changes (git diff)
   - `/st:code-review #123` → PR (dùng gh CLI)
   - `/st:code-review src/auth/` → specific files/folder
   - `/st:code-review --only security,test` → chỉ agents chọn
   - Nếu không có changes → "Không có gì để review"
   - Image input: accept ảnh (screenshot UI bug, visual regression)
    ↓
2. Thu thập context
   - Code changes (diff)
   - .superteam/config.json
   - .superteam/REQUIREMENTS.md (cho Business Logic agent)
   - .superteam/DESIGN-SYSTEM.md (cho Accessibility agent)
   - Plan file liên quan (cho Code Quality agent - plan alignment)
   - Existing patterns trong codebase
    ↓
3. Layer 1: Linting
   - Detect linter có sẵn (ESLint, Prettier, Pint, Black...)
   → Có: chạy linter, auto-fix nếu được
   → Không có:
     "Project chưa có linter. Recommend setup [X].
      Muốn setup không?"
     → User đồng ý: setup, chạy
     → User từ chối: skip, tiếp layer 2
    ↓
4. Layer 2: Reviewer Agent — 13 Domains
   Spawn 1 reviewer agent (Opus). Agent tự select relevant domains theo project type.
   Override: --only domain1,domain2

   1.  Silent Failure      - Empty catch, swallowed errors, missing propagation
   2.  Business Logic      - Requirements compliance, validation rules, edge cases
   3.  Security            - OWASP top 10, secrets, injection, auth bypass
   4.  Error Handling      - Missing handlers, wrong status codes, leaked internals
   5.  Performance         - N+1 queries, unbounded queries, blocking, missing cache
   6.  API Contract        - Breaking changes, inconsistent formats, wrong methods
   7.  Test Coverage       - Missing tests, weak assertions, happy-path-only
   8.  Type Safety         - any usage, missing null checks, type assertion abuse
   9.  Accessibility       - ARIA, keyboard nav, semantic HTML, contrast
   10. Design System       - Token compliance, component reuse, responsive behavior
   11. Database & Data     - Migrations, constraints, indexes, orphaned records
   12. Dependencies        - Justified? Secure? Minimal import? Circular?
   13. Concurrency & Async - Race conditions, missing await, TOCTOU, deadlocks

   Confidence scoring >= 80% mới report
   Severity: Critical (90-100) / Important (80-89)
    ↓
5. Layer 3: Tổng hợp report
   ┌──────────────────────────────────────────┐
   │ CODE REVIEW REPORT                       │
   ├──────────────────────────────────────────┤
   │ Linting:     [N] fixed, [M] remaining    │
   │ Critical:    [N] issues (confidence 90+)  │
   │ Important:   [N] issues (confidence 80+)  │
   │ Suggestions: [N]                          │
   ├──────────────────────────────────────────┤
   │ By domain:                                │
   │  Silent Failure:      [N]                 │
   │  Business Logic:      [N]                 │
   │  Security:            [N]                 │
   │  Error Handling:      [N]                 │
   │  Performance:         [N]                 │
   │  API Contract:        [N]                 │
   │  Test Coverage:       [N]                 │
   │  Type Safety:         [N]                 │
   │  Accessibility:       [N]                 │
   │  Design System:       [N]                 │
   │  Database & Data:     [N]                 │
   │  Dependencies:        [N]                 │
   │  Concurrency & Async: [N]                 │
   ├──────────────────────────────────────────┤
   │ [Chi tiết từng issue:                     │
   │  file:line, agent, severity, confidence,  │
   │  description, suggested fix]              │
   ├──────────────────────────────────────────┤
   │ Strengths: [things done well]             │
   └──────────────────────────────────────────┘
    ↓
6. User action
   - "Fix all critical" → fix critical issues only
   - "Fix all" → fix tất cả
   - "Skip" → bỏ qua
   - Chọn từng issue để fix
    ↓
7. Fix with receiving logic
   - Spawn agents/parallel để fix
   - MỖI fix đều qua receiving logic:
     → Verify issue thực sự tồn tại trong code hiện tại
     → Check fix không break gì khác
     → Skip nếu issue là false positive
   - Chạy tests sau mỗi batch fix
   - Report:
     "Fixed [N] | Skipped [M] (lý do) | Tests: pass/fail"
   - Commit: "fix: code review - [summary]"
    ↓
8. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► CODE REVIEW COMPLETE ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Domains: 13 | Fixed: [N] | Skipped: [M] | Tests: ✓
```

## So sánh

| | Superpowers | PR Review Toolkit | Industry (CodeRabbit) | Superteam |
|---|---|---|---|---|
| Review agents | 1 general | 6 specialized | 1 AI + rules | 1 agent (13 domains) + linting |
| Agents parallel | Không | Có | N/A | Có (mặc định tất cả) |
| Confidence scoring | Không | >= 80% | Có | >= 80%, Critical 90+ / Important 80+ |
| Scope | Git SHA range | Git diff / PR | PR only | Local / PR / files / --only |
| Linter integration | Không | Không | Partial | Detect + recommend setup + auto-fix |
| Auto-fix | Không | Không | Suggestions | Fix with receiving logic |
| Business Logic | Không | Không | Không | Có (requirements compliance) |
| Accessibility | Không | Không | Không | Có (WCAG, ARIA, keyboard) |
| Architecture | Không | Không | Partial | Có (circular deps, SOLID) |
| Dependencies | Không | Không | Partial (Snyk) | Có (justified, maintained, secure) |
| Compatibility | Không | Không | Không | Có (breaking changes) |
| Comments/Docs | Không | comment-analyzer | Không | Có (lỗi thời, misleading) |
| Image input | Không | Không | Không | Có |
