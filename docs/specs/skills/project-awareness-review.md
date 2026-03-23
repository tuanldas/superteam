# Review & Đề xuất chỉnh sửa: project-awareness skill

> Reviewer: TCG | Ngày: 2026-03-23 | Spec version: DRAFT

---

## Tổng quan đánh giá

Spec **project-awareness** có nền tảng tốt — triết lý "Context Before Action", confidence tiers với ngưỡng số, config wins over detection đều là quyết định đúng. Dưới đây là 5 đề xuất chỉnh sửa cụ thể để team review.

---

## Đề xuất 1: Thêm ví dụ cụ thể cho Adaptation Principles

### Vấn đề

Các principle hiện tại quá trừu tượng. Ví dụ: "Component boundaries are the unit of work" — khi `/st:plan` chạy cho React project, principle này dịch ra hành vi cụ thể gì? Spec nói "Commands self-specialize from these" nhưng đặt toàn bộ gánh nặng interpretation lên từng command spec, dẫn đến risk: mỗi command interpret khác nhau hoặc bỏ qua hoàn toàn.

### Đề xuất

Thêm 1-2 ví dụ concrete cho mỗi principle. Không cần dài, chỉ cần đủ để anchor interpretation.

**Vị trí:** Ngay sau mỗi principle bullet point.

**Nội dung thêm vào section Frontend (dòng 87-89):**

```markdown
### Frontend

Detected: type = `frontend`, or frameworks include react, vue, angular, svelte, solid, astro.

- **Component boundaries are the unit of work.** Plan, execute, review, test at component level — not page or feature level.
  - _Example: `/st:plan` creates tasks per component (Header, Sidebar, UserCard), not per page (HomePage, Settings)._
- **Visual output is a deliverable.** Commands touching UI must produce verifiable visual results, not just passing tests.
  - _Example: `/st:execute` for a UI task should include screenshot verification or Storybook check, not just "tests pass"._
- **Design system awareness.** Check for existing design tokens, component libraries, theme config before creating new UI.
  - _Example: `/st:plan` checks for tailwind.config, theme.ts, or design-tokens/ before proposing new color/spacing values._
```

**Tương tự cho Backend (dòng 95-97):**

```markdown
- **API contract drives planning.** Breaking changes require explicit acknowledgment.
  - _Example: `/st:plan` flags "⚠ BREAKING: removes `GET /users/:id` response field `legacy_name`" as separate task requiring review._
- **Migration safety.** Any database-touching command must check for pending migrations and warn.
  - _Example: `/st:execute` runs `npx prisma migrate status` (or equivalent) before any DB-related code change._
```

---

## Đề xuất 2: Thêm bảng Detection Signals tóm tắt

### Vấn đề

Spec nói `detectProject(cwd)` nhưng không mô tả detector tìm gì. Khi detection sai, user không biết tại sao. Dù chi tiết nằm ở `core/detector.cjs`, skill nên có bảng tóm tắt để commands và users đều hiểu logic.

### Đề xuất

Thêm section mới **"Detection Signals"** ngay sau "Context Block Format" (sau dòng 77).

```markdown
## Detection Signals (Summary)

How `detectProject(cwd)` determines type and confidence:

| Signal File/Pattern | Detected Type | Confidence |
|---|---|---|
| `next.config.*`, `nuxt.config.*`, `remix.config.*` | fullstack | 0.9 |
| `package.json` with react/vue/angular (no server framework) | frontend | 0.85 |
| `package.json` with express/fastify/nestjs (no UI framework) | backend | 0.85 |
| `pnpm-workspace.yaml`, `lerna.json`, workspaces in package.json | monorepo | 0.9 |
| `manage.py` + `settings.py` | backend (django) | 0.9 |
| `go.mod` | backend (go) | 0.8 |
| `composer.json` + `artisan` | backend (laravel) | 0.9 |
| react + express detected, no workspace structure | ??? | 0.4 (ask user) |
| No recognizable signals | unknown | 0.1 |

> This table is a summary. Full logic lives in `core/detector.cjs`.
> When detection conflicts with expectations, check this table first.
```

---

## Đề xuất 3: Cross-workspace warning cần threshold

### Vấn đề

Hiện tại mỗi thay đổi trong monorepo đều hiện warning:
```
⚠ This change affects {workspace} but shared package {pkg}
  is also used by {other_workspaces}. Consider cross-workspace tests.
```

Nếu shared package được dùng bởi 10+ workspaces, warning sẽ rất dài và user sẽ bắt đầu ignore nó (warning fatigue).

### Đề xuất

Sửa phần "Monorepo Scope Resolution" (dòng 137-141), thêm quy tắc collapse:

```markdown
When scoped to one workspace, still surface cross-workspace impact:
```
⚠ This change affects {workspace} but shared package {pkg}
  is also used by {other_workspaces}. Consider cross-workspace tests.
```

**Warning display rules:**
- 1-3 affected workspaces: list all by name.
- 4+ affected workspaces: collapse to "{pkg} is used by {N} other workspaces. Run `/st:plan --scope=all` to see full impact."
- If the changed file is in a workspace's internal directory (not a shared package): suppress cross-workspace warning.
```

---

## Đề xuất 4: Mô tả rõ "graceful degradation" cho Unknown type

### Vấn đề

Phần "Unknown" (dòng 118-123) nói "Degrade gracefully. Commands still work — they skip type-specific behavior" nhưng không nói cụ thể command nào skip gì. Khi Claude gặp unknown type, nó không biết baseline behavior là gì.

### Đề xuất

Thay thế bullet "Degrade gracefully" bằng bảng cụ thể:

```markdown
### Unknown

Detected: type = `unknown`, or confidence < 0.5.

- **Do not assume.** Do not apply type-specific behavior.
- **Ask the user.** Present what was detected and ask to clarify.
- **Suggest /st:init.** Interactive questioning resolves ambiguity.
- **Graceful degradation — what commands do:**

| Command Category | With type | Without type (unknown) |
|---|---|---|
| `/st:plan` | Creates type-aware tasks (component-level for frontend, etc.) | Creates generic file-level tasks. No type-specific grouping. |
| `/st:execute` | Runs type-specific checks (migrations, design system, etc.) | Runs code changes only. Skips all pre-checks. |
| `/st:code-review` | Applies type-specific review criteria | Applies universal criteria only (logic, naming, tests). |
| `/st:debug` | Checks framework-specific log locations | Checks stdout/stderr only. Asks user for log location. |
| `/st:api-docs` | Auto-detects API framework conventions | Asks user for API entry points. |
```

---

## Đề xuất 5: Thêm Fallback cho Session-start Hook Failure

### Vấn đề

Session-start hook là single point of failure. Nếu hook fail (monorepo quá lớn, detector timeout, permission issue), toàn bộ session không có context block. Không có dòng nào trong spec nói về trường hợp này.

### Đề xuất

Thêm section mới **"Error Handling"** ngay trước "Quick Reference" (trước dòng 155):

```markdown
## Error Handling

### Session-start hook failure

If `detectProject()` or `loadConfig()` fails (timeout, permission error, parse error):

```
ST ► PROJECT CONTEXT
─────────────────────────────
Project:     {name from directory}
Type:        unknown (detection failed: {reason})
Frameworks:  —
Initialized: {Yes | No}

⚠ Detection incomplete. Run /st:init to set project type manually.
─────────────────────────────
```

**Rules:**
- NEVER start a session with zero context. Always inject at least the error block above.
- Log detection failure reason for debugging (`ST ► WARN: detectProject failed: {error}`).
- If only detection fails but config exists: use config. Surface warning but proceed normally.
- If both fail: inject error block, all commands run in "unknown" mode.

### Partial detection

If detector resolves some fields but not all (e.g., finds frameworks but cannot determine type):

- Inject what IS known. Leave unknown fields as `—`.
- Confidence auto-drops to < 0.5 (triggers "ask user" behavior).
- Do not block session. Partial context is better than no context.
```

---

## Đề xuất phụ: Thêm test scenario cho các đề xuất trên

Nếu team đồng ý các đề xuất, nên bổ sung Testing Plan:

```markdown
### Kịch bản bổ sung:

**Error handling:**
1. Detector timeout (monorepo 50+ packages) — có inject error block không?
2. Config file corrupt JSON — có fallback về detection không?
3. Permission denied trên node_modules — có partial detect không?

**Warning threshold:**
4. Shared package dùng bởi 2 workspaces — warning hiện đủ tên?
5. Shared package dùng bởi 15 workspaces — warning có collapse không?

**Graceful degradation:**
6. `/st:plan` với unknown type — tạo generic tasks hay crash?
7. `/st:debug` với unknown type — hỏi log location hay bỏ qua?

**Adaptation examples:**
8. `/st:plan` frontend project — tạo task per component hay per page?
9. `/st:execute` backend với pending migration — có cảnh báo không?
```

---

## Tóm tắt ưu tiên

| # | Đề xuất | Mức ưu tiên | Lý do |
|---|---|---|---|
| 1 | Ví dụ cụ thể cho Adaptation Principles | **Cao** | Không có ví dụ → commands interpret sai hoặc bỏ qua |
| 2 | Bảng Detection Signals | Trung bình | Giúp debug, nhưng detector code là source of truth |
| 3 | Cross-workspace warning threshold | Trung bình | Warning fatigue trong monorepo lớn |
| 4 | Graceful degradation table | **Cao** | Unknown type phổ biến ở project mới, cần behavior rõ |
| 5 | Session-start error handling | **Cao** | Single point of failure không có fallback = session chết |
