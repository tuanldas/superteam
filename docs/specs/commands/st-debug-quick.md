# `/st:debug-quick` - Quick Debug

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Debug nhanh cho bug đơn giản. Chạy trong main context (không agent riêng), không lưu session file, vẫn ghi knowledge base khi xong. Tự escalate sang `/st:debug` nếu bug phức tạp hơn dự kiến.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Kiến trúc | Skill (main context, không agent riêng) | Nhẹ, nhanh |
| State file | Không lưu trong quá trình debug | Đơn giản |
| Knowledge base | Ghi vào `.superteam/debug/knowledge-base.md` khi xong | Tích lũy dù bug đơn giản |
| Checkpoint | Không | Xong trong 1 session |
| Techniques | AI tự chọn, không liệt kê cứng | Đủ nhẹ cho bug đơn giản |
| Anti-shortcut | 4 phases bắt buộc + Iron Law | Discipline nhưng không nặng |
| Image input | Hai chiều (user gửi + AI suggest) | Giống /st:debug |
| Log detection | Auto-detect → đọc → đánh giá & lọc → chỉ dùng log liên quan | Cùng chất lượng thu thập |
| Escalate | Tự chuyển tiếp evidence sang /st:debug | Không mất data |
| Return | 2 loại: DEBUG COMPLETE, ESCALATED | Đơn giản |

## Flow

```
1. Input
   - User mô tả bug: "/st:debug-quick button không click được"
   - Hoặc không argument → hỏi "Bug gì?"
   - Image input: screenshot, console output
     → Phân tích image: extract error messages, UI state, console errors
    ↓
2. Auto-detect & đọc logs
   - Detect framework từ codebase → tìm log location:
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
   - Giữ log đã lọc làm evidence
    ↓
3. Complexity check
   - AI đánh giá bug:
     → Phức tạp: "Bug này có vẻ phức tạp. Recommend /st:debug
       để debug có hệ thống. Đồng ý?"
       → User đồng ý → chuyển /st:debug
       → User không → tiếp debug-quick
     → Đơn giản: tiếp
    ↓
4. Debug (4 phases, main context, không file)

   Phase 1: Root Cause Investigation
   - Đọc error + logs đã lọc
   - Reproduce
   - Check git changes
   - Trace data flow
   - AI có thể suggest: "Chụp screenshot console cho tôi xem"

   ┌─────────────────────────────────────────────┐
   │ IRON LAW: NO FIXES WITHOUT ROOT CAUSE       │
   │ INVESTIGATION FIRST                          │
   └─────────────────────────────────────────────┘

   Phase 2: Pattern Analysis
   - Tìm working examples, so sánh

   Phase 3: Hypothesis & Testing
   - 1 hypothesis, test minimal
   - Eliminated → hypothesis mới
   - 3 hypothesis fail → suggest escalate /st:debug
     → AI tự tạo debug session file từ evidence đã có
       (symptoms, eliminated hypotheses, evidence entries)
     → Tiếp tục investigation không mất data

   Phase 4: Implementation
   - Failing test → fix → verify → full suite
    ↓
5. Knowledge base
   - Append vào .superteam/debug/knowledge-base.md:
     slug, date, error patterns, root cause, fix, files changed
   - Tạo file + thư mục nếu chưa có
    ↓
6. Kết quả (2 loại)

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► DEBUG COMPLETE ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Root cause: [mô tả]
   Fix: [mô tả]
   Tests: [N] added, all passing
   Commit: "fix: [description]"

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► ESCALATED → /st:debug
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Session: .superteam/debug/{slug}.md
   Evidence transferred: [N] entries
   Hypotheses eliminated: [M]
   ▶ Tiếp tục investigation trong /st:debug
```

## Escalate sang `/st:debug`

Khi 3 hypothesis fail:
1. AI tự tạo `.superteam/debug/{slug}.md` từ evidence đã thu thập
2. Điền: Symptoms (từ input + logs), Eliminated (3 hypotheses), Evidence (findings)
3. Tiếp tục investigation trong `/st:debug` — không mất data, không hỏi lại

## So sánh với `/st:debug`

| | `/st:debug` | `/st:debug-quick` |
|---|---|---|
| Kiến trúc | Orchestrator + Agent + State | Skill (main context) |
| Session file | Có, persistent | Không (trừ khi escalate) |
| Knowledge base | Có, tự động | Có, tự động |
| Checkpoint | 4 loại (verify/action/decision/auto) | Không |
| Context reset | Tiếp tục được | Mất progress |
| Techniques | 12 kỹ thuật + selection matrix | AI tự chọn |
| Anti-shortcut | Full (Iron Law + red flags + rationalizations + biases + meta-debug + falsifiability) | Iron Law + 4 phases bắt buộc |
| Image | Hai chiều | Hai chiều |
| Log detection | Auto-detect → đánh giá & lọc | Auto-detect → đánh giá & lọc |
| Escalate | N/A | → `/st:debug` (tự chuyển evidence) |
| Bug phù hợp | Phức tạp, multi-component, cần nhiều session | Đơn giản, fix trong 1 session |
