# `/st:debug` - Systematic Debugging (Full)

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Debug có hệ thống cho bug phức tạp. Persistent state (debug session files), knowledge base, checkpoint system, auto-detect logs, 12 investigation techniques, full anti-shortcut discipline.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Kiến trúc | Orchestrator + Agent + State Files | Persistent, context-reset safe |
| Session file | 5 sections (Current Focus, Symptoms, Eliminated, Evidence, Resolution) | Proven từ GSD, quy tắc OVERWRITE/APPEND/IMMUTABLE rõ ràng |
| Knowledge base | `.superteam/debug/knowledge-base.md`, tự động lưu khi resolve | Tích lũy kinh nghiệm, tăng tốc debug lần sau |
| Checkpoint | 4 loại: human-verify, human-action, decision, auto-checkpoint | Auto-checkpoint khi context sắp đầy |
| Techniques | 12 techniques (9 GSD + 3 Superpowers, loại trùng) | Phủ rộng mọi tình huống |
| Anti-shortcut | Full: Iron Law + red flags + rationalizations + cognitive biases + meta-debugging + falsifiability | Chống cả "hành động bừa" và "suy nghĩ sai" |
| Image input | Hai chiều: user gửi + AI suggest chụp thêm | Đặc biệt hữu ích cho UI bugs |
| Log detection | Auto-detect log location → đọc → đánh giá & lọc → chỉ dùng log liên quan | Log là nguồn thông tin giàu nhất, nhiều agent bỏ qua |
| Complexity suggest | AI đánh giá → suggest `/st:debug-quick` nếu đơn giản | User vẫn quyết định |
| Return format | 4 loại: ROOT CAUSE FOUND, DEBUG COMPLETE, CHECKPOINT REACHED, INCONCLUSIVE | Đầy đủ cho mọi kết quả |
| Quick mode | Có `/st:debug-quick` riêng cho bug đơn giản | Không over-engineering cho bug nhỏ |

## Flow

```
1. Input
   - User mô tả bug: "/st:debug API trả về 500"
   - Hoặc không argument → hỏi "Mô tả bug?"
   - Image input: screenshot lỗi, console output, UI bug
     → Phân tích image: extract error messages, UI state, console errors
    ↓
2. Check context
   - .superteam/ tồn tại? → load config, PROJECT.md
   - Check active debug sessions (.superteam/debug/*.md)
     → Có session cũ + không argument: hiển thị sessions, hỏi resume/mới
     → Có session cũ + có argument: tạo session mới
     → Không session: tiếp tục
    ↓
3. Complexity assessment
   - AI đánh giá bug complexity:
     → Đơn giản (typo, null check, config sai...):
       "Bug này có vẻ đơn giản. Dùng /st:debug-quick không?"
       → User: đồng ý → chuyển /st:debug-quick
       → User: không → tiếp /st:debug
     → Phức tạp: tiếp /st:debug
    ↓
4. Tạo debug session file
   - Generate slug từ mô tả
   - Tạo .superteam/debug/{slug}.md
     status: gathering
     trigger: verbatim input
   - Update file TRƯỚC mỗi hành động
    ↓
5. Thu thập symptoms
   5.1 Auto-detect & đọc logs
   - Detect framework từ codebase → biết log location:
     → Laravel: storage/logs/laravel.log
     → Node/Express: console output, debug.log
     → Django: django.log, stderr
     → Spring: logs/spring.log
     → Docker: docker logs <container>
     → PM2: ~/.pm2/logs/
     → nginx: /var/log/nginx/error.log
     → systemd: journalctl -u <service>
   - Đọc log gần nhất (filter by timestamp gần thời điểm bug)
   - Đánh giá & lọc:
     → Loại bỏ: log không liên quan (routine info, health check,
       scheduled jobs...)
     → Giữ lại: errors, warnings, stack traces, entries liên quan
       đến component/endpoint/function đang debug
     → Xếp priority: error > warning > info có pattern bất thường
   - Chỉ đưa log đã lọc vào Evidence (APPEND)

   5.2 Hỏi user (hoặc extract từ input/image)
   - Expected behavior
   - Actual behavior
   - Error messages
   - Reproduction steps
   - Khi nào bắt đầu lỗi
   - Update file sau MỖI câu trả lời
   - AI có thể suggest: "Chụp screenshot console cho tôi xem"
   - status → investigating
    ↓
6. Spawn debugger agent
   - Load debug session file + knowledge base
   - Agent nhận full context

   a. Phase 0: Knowledge base lookup
      - Extract keywords từ Symptoms
      - Match với knowledge-base.md (2+ keyword overlap)
      - Nếu match → đưa vào hypothesis đầu tiên (suggest, không auto-fix)

   b. Phase 1: Root Cause Investigation
      - Đọc error messages, stack traces (HOÀN TOÀN, không skim)
      - Reproduce consistently
      - Check recent changes (git diff, git log)
      - Gather evidence ở mỗi component boundary
      - Trace data flow (backward tracing)
      - APPEND Evidence sau mỗi finding

      ┌─────────────────────────────────────────────┐
      │ IRON LAW: NO FIXES WITHOUT ROOT CAUSE       │
      │ INVESTIGATION FIRST                          │
      │                                              │
      │ Nếu chưa xong Phase 1 → KHÔNG ĐƯỢC fix     │
      └─────────────────────────────────────────────┘

   c. Phase 2: Pattern Analysis
      - Tìm working examples trong codebase
      - So sánh working vs broken
      - Liệt kê mọi khác biệt
      - Hiểu dependencies

   d. Phase 3: Hypothesis & Testing
      - Đặt 1 hypothesis CỤ THỂ, FALSIFIABLE
        → "Có thể do X" ✗
        → "Nếu X là nguyên nhân, khi Y phải thấy Z" ✓
      - Test MINIMAL — 1 biến mỗi lần
      - Confirmed → Phase 4
      - Eliminated → APPEND Eliminated, quay Phase 2
      - Sau 3 hypothesis loại → meta-debugging: reassess approach

   e. Phase 4: Implementation
      - Viết failing test (reproduce bug)
      - Implement fix NHỎ NHẤT
      - Verify: test pass + full suite không regression
      - Nếu 3+ fix fail → STOP, question architecture

   f. Document
      - Update Resolution: root_cause, fix, verification, files_changed

   Investigation techniques (AI chọn phù hợp):
   ┌───────────────────┬──────────────────────────────┐
   │ Technique         │ Khi nào dùng                 │
   ├───────────────────┼──────────────────────────────┤
   │ Binary search     │ Biết nó hoạt động trước đó   │
   │ Working backwards │ Có output sai, trace ngược   │
   │ Git bisect        │ Regression, biết commit OK   │
   │ Differential      │ Chạy ở env A, fail ở env B   │
   │ Minimal repro     │ Bug phức tạp, nhiều biến     │
   │ Observability     │ Thiếu data, cần thêm logging │
   │ Comment-out-all   │ Không biết bắt đầu từ đâu   │
   │ Rubber duck       │ Logic phức tạp               │
   │ Root-cause trace  │ Bug sâu trong call stack     │
   │ Defense-in-depth  │ Sau khi fix, validate layers │
   │ Condition-waiting │ Flaky test, timing issue      │
   └───────────────────┴──────────────────────────────┘

   Anti-shortcut (active suốt quá trình):
   - Red Flags: 9 suy nghĩ phải STOP
   - Rationalizations: 8 "lý do hay" vs thực tế
   - Cognitive biases: confirmation, anchoring, recency, sunk cost
   - Meta-debugging: tự đánh giá approach sau mỗi elimination
   - Falsifiability: mỗi hypothesis phải có cách disprove
    ↓
7. Checkpoint handling
   - human-verify: cần user confirm kết quả
   - human-action: cần user làm gì Claude không làm được
   - decision: cần user chọn hướng
   - auto-checkpoint: AI detect context sắp đầy
     → Tự lưu state vào file
     → Suggest: "Context sắp đầy, /clear rồi chạy /st:debug để tiếp"
   - Orchestrator spawn agent mới với debug file + response
    ↓
8. Human verification
   - Agent fix xong → return CHECKPOINT (human-verify)
   - User confirm "fixed" hoặc "vẫn lỗi"
   - Vẫn lỗi → status → investigating, quay lại investigation
    ↓
9. Archive + Knowledge base
   - Move file → .superteam/debug/resolved/
   - Append vào knowledge-base.md:
     slug, date, error patterns, root cause, fix, files changed
   - Commit code fix
   - Commit planning docs
    ↓
10. Kết quả (4 loại)

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► ROOT CAUSE FOUND
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Root cause: [mô tả + evidence]
   Files: [list]
   Suggested fix: [hướng fix, không implement]

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► DEBUG COMPLETE ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Root cause: [mô tả]
   Fix: [mô tả]
   Tests: [N] added, all passing
   Session: .superteam/debug/resolved/{slug}.md
   Commit: [hash]

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► CHECKPOINT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Type: [human-verify | human-action | decision | auto]
   Progress: [N] evidence, [M] eliminated
   Need: [mô tả cần gì từ user]

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► INVESTIGATION INCONCLUSIVE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Checked: [list]
   Eliminated: [list]
   Remaining: [list]
   Recommendation: [next steps]
```

## Debug Session File Format

```markdown
---
status: gathering | investigating | fixing | verifying | awaiting_human_verify | resolved
trigger: "[verbatim user input]"
created: [ISO timestamp]
updated: [ISO timestamp]
---

## Current Focus
<!-- OVERWRITE mỗi lần update - phản ánh NOW -->

hypothesis: [current theory]
test: [how testing it]
expecting: [what result means]
next_action: [immediate next step]

## Symptoms
<!-- IMMUTABLE sau khi thu thập xong -->

expected: [what should happen]
actual: [what actually happens]
errors: [error messages]
reproduction: [how to trigger]
started: [when broke / always broken]

## Eliminated
<!-- APPEND only - không thử lại hypothesis đã loại -->

- hypothesis: [theory that was wrong]
  evidence: [what disproved it]
  timestamp: [when eliminated]

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: [when found]
  checked: [what examined]
  found: [what observed]
  implication: [what this means]

## Resolution
<!-- OVERWRITE khi hiểu thêm -->

root_cause: [empty until found]
fix: [empty until applied]
verification: [empty until verified]
files_changed: []
```

### Update Rules

| Section | Rule | Khi nào |
|---------|------|---------|
| Frontmatter.status | OVERWRITE | Mỗi phase transition |
| Frontmatter.updated | OVERWRITE | Mỗi lần update file |
| Current Focus | OVERWRITE | Trước mỗi hành động |
| Symptoms | IMMUTABLE | Sau khi thu thập xong |
| Eliminated | APPEND | Khi hypothesis bị loại |
| Evidence | APPEND | Sau mỗi finding |
| Resolution | OVERWRITE | Khi hiểu sâu hơn |

**Quy tắc vàng:** Update file TRƯỚC khi hành động. Nếu context reset giữa chừng, file cho biết đang làm gì.

## Knowledge Base Format

```markdown
# Superteam Debug Knowledge Base

---

## {slug} — {one-line description}
- **Date:** {ISO date}
- **Error patterns:** {comma-separated keywords từ Symptoms.errors + Symptoms.actual}
- **Root cause:** {Resolution.root_cause}
- **Fix:** {Resolution.fix}
- **Files changed:** {Resolution.files_changed}
---
```

**Matching logic:** Keyword overlap (case-insensitive, 2+ word overlap = candidate match). Match là hypothesis candidate, không phải confirmed diagnosis.

## Checkpoint Types

| Type | Khi nào | Ví dụ |
|------|---------|-------|
| human-verify | Cần user confirm kết quả | "Fix xong, bạn test lại xem?" |
| human-action | Cần user làm gì Claude không làm được | "Login vào AWS console check CloudWatch" |
| decision | Cần user chọn hướng | "Bug ở DB hoặc cache, điều tra cái nào?" |
| auto-checkpoint | AI detect context sắp đầy | Tự lưu state, suggest /clear + resume |

## Resume sau context reset

```
1. Parse frontmatter → biết status
2. Đọc Current Focus → biết đang làm gì
3. Đọc Eliminated → biết KHÔNG thử lại gì
4. Đọc Evidence → biết đã phát hiện gì
5. Tiếp tục từ next_action
```

## So sánh

| | Superpowers | GSD | Superteam |
|---|---|---|---|
| Commands | 1 skill | 1 command | 2 commands (debug + debug-quick) |
| Kiến trúc | Skill only | Orchestrator + Agent + State | Cả hai: skill (quick) + full system (debug) |
| Log detection | Không | Không | Auto-detect → đánh giá & lọc |
| Knowledge base | Không | Có | Có (cả 2 commands đều ghi) |
| Checkpoint | Không | 3 loại | 4 loại (+auto-checkpoint) |
| Anti-shortcut | Rất mạnh | Trung bình | Kết hợp cả hai (mạnh nhất) |
| Techniques | 3 | 9 | 12 (kết hợp, loại trùng) |
| Image input | Không | Không | Hai chiều |
| Escalate path | Không | Không | debug-quick → debug (tự chuyển evidence) |

## Cải thiện so với industry

1. **2 commands** → adaptive: nhẹ cho bug đơn giản, đầy đủ cho bug phức tạp
2. **Auto-detect logs** → chủ động tìm log theo framework, đánh giá & lọc trước khi dùng
3. **Auto-checkpoint** → tự lưu state khi context sắp đầy, không mất progress
4. **12 techniques** → kết hợp GSD (9) + Superpowers (3), phủ rộng mọi tình huống
5. **Full anti-shortcut** → kết hợp Iron Law + red flags + rationalizations + cognitive biases + meta-debugging + falsifiability
6. **Image hai chiều** → user gửi + AI suggest chụp thêm
7. **Escalate path** → debug-quick tự chuyển evidence sang debug khi cần
8. **Knowledge base chung** → cả debug và debug-quick đều ghi, tích lũy kinh nghiệm
