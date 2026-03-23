# `/st:code-review` - Code Review (12 Specialized Agents)

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Code review layered: linting → 12 specialized agents parallel → tổng hợp report → fix with receiving logic (verify trước khi implement). Support 3 scope types: local diff, PR, specific files.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Architecture | Layered: linting → 12 agents → report → fix | Linting bắt style, agents bắt logic/design |
| Agents | 12 specialized, parallel, mặc định chạy TẤT CẢ | AI detect chọn agent không đáng tin cậy, chạy hết an toàn hơn |
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
4. Layer 2: 12 Specialized agents (parallel)
   Mặc định chạy TẤT CẢ trên code changes.
   Override: --only agent1,agent2

   1.  Code Quality       - Error handling, naming, DRY, YAGNI, plan alignment
   2.  Clean Code         - SRP, magic numbers, dead code, over-engineering, code smells
   3.  Security           - OWASP top 10, secrets, SQL injection, XSS, CSRF, input validation
   4.  Silent Failure     - Empty catch, catch-and-continue, missing logs, swallowed errors
   5.  Test Analyzer      - Behavioral coverage, critical gaps, edge cases, test quality
   6.  Performance        - N+1, memory leaks, re-renders, bundle size, blocking main thread
   7.  Comment/Docs       - Comments lỗi thời, misleading, "what" vs "why", thiếu docs
   8.  Architecture       - Circular deps, god class, SOLID, module structure, patterns
   9.  Dependency         - Package justified? maintained? secure? lightweight alternatives?
   10. Compatibility      - Breaking changes, API contract, backward compat, deprecation
   11. Accessibility      - ARIA, contrast ratio, keyboard nav, screen reader, semantic HTML
   12. Business Logic     - Requirements compliance, form validation, edge cases nghiệp vụ

   Mỗi agent: confidence scoring >= 80% mới report
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
   │  Code Quality:      [N]                   │
   │  Clean Code:        [N]                   │
   │  Security:          [N]                   │
   │  Silent Failures:   [N]                   │
   │  Testing:           [N]                   │
   │  Performance:       [N]                   │
   │  Comments/Docs:     [N]                   │
   │  Architecture:      [N]                   │
   │  Dependencies:      [N]                   │
   │  Compatibility:     [N]                   │
   │  Accessibility:     [N]                   │
   │  Business Logic:    [N]                   │
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
   Agents: 12 | Fixed: [N] | Skipped: [M] | Tests: ✓
```

## So sánh

| | Superpowers | PR Review Toolkit | Industry (CodeRabbit) | Superteam |
|---|---|---|---|---|
| Review agents | 1 general | 6 specialized | 1 AI + rules | 12 specialized + linting |
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
