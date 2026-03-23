# `/st:execute` - Thực Thi Plan

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Thực thi plan theo waves (parallel). Wave-based execution + node repair (4 strategies) + deviation rules (4 levels) + checkpoint review (test + quick review) + blocker handling (→ /st:plan --replan).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Parallelism | Wave-based (parallel trong wave, sequential giữa waves) | Tối ưu speed, respect dependencies |
| Error recovery | Node repair: RETRY/DECOMPOSE/PRUNE/ESCALATE (budget 2) | Tự xử lý trước khi hỏi user |
| Deviation rules | 4 levels giống GSD (auto-fix 1-3, stop+ask 4) | Proven pattern, xử lý unplanned work |
| Review | Test + quick review sau mỗi wave | Cân bằng chất lượng và tốc độ |
| Commits | Task-atomic (mỗi task 1 commit) | Clean git history |
| Blocker | → /st:plan --replan (AI assess + user decide) | User có đủ info quyết định |
| Resumability | Skip completed steps (checkbox tracking) | Re-run tiếp từ chỗ dừng |

## Flow

```
1. Tìm plan
   - Có argument (file path)? → Load plan đó
   - Không argument?
     → Scan .superteam/plans/ tìm plans chưa xong
     → 1 plan → load luôn
     → Nhiều plans → user chọn
     → 0 plans → "Không có plan. Chạy /st:plan trước"
    ↓
2. Đọc plan + detect progress
   - Parse checkboxes: - [x] done, - [ ] pending
   - Tìm step đầu tiên chưa xong
   - Hiển thị: "Plan [name]: [done]/[total] steps.
     Tiếp tục từ step [N]?"
    ↓
3. Critical review gate
   - Đọc plan, kiểm tra: có câu hỏi hay concern nào không?
   - Nếu có → raise với user trước khi execute
   - Nếu không → tiếp
    ↓
4. Dependency analysis + wave assignment
   - Parse tất cả steps chưa xong
   - Phân tích conflict:
     → Cùng sửa 1 file → sequential
     → Khác file, không phụ thuộc → parallel
   - Xếp waves:
     Wave 1: [tasks không conflict]
     Wave 2: [tasks phụ thuộc wave 1]
     ...
   - Hiển thị execution plan:
     "Tổng [N] steps, [M] waves"
    ↓
5. Execute theo waves
   - Mỗi wave: spawn executor agents parallel
   - Mỗi task:
     → Read-first gate: đọc files bắt buộc trước
     → Execute action
     → Verify: acceptance criteria (grep) + expected output (runtime)
     → Task-atomic commit: "feat: [step description]"

   Deviation rules:
   - Level 1 (Bug): auto-fix
   - Level 2 (Missing critical): auto-fix (error handling, validation, auth)
   - Level 3 (Blocking): auto-fix (missing deps, wrong types, broken imports)
   - Level 4 (Architectural): STOP + hỏi user

   Node repair khi task fail:
   - RETRY: thử lại với adjustment (budget: 2 attempts)
   - DECOMPOSE: tách task thành sub-tasks nhỏ hơn
   - PRUNE: skip task, ghi justification
   - ESCALATE: hỏi user (budget hết hoặc cần architectural decision)
    ↓
6. Checkpoint review (giữa các waves)
   - Chạy test suite liên quan (mặc định, luôn chạy)
   - Spawn reviewer agent (quick review)
   - Verify key artifacts từ wave trước tồn tại
   - Nếu test fail hoặc review issues → fix trước khi tiếp wave
   - Nếu clean → tiếp wave tiếp
    ↓
7. Blocker handling (nếu gặp vấn đề nghiêm trọng)
   → Gọi /st:plan --replan
   ┌──────────────────────────────────────┐
   │ BLOCKER DETECTED                     │
   ├──────────────────────────────────────┤
   │ Vấn đề: [mô tả]                     │
   │ Impact: [tasks ảnh hưởng]            │
   │ Khuyến nghị + lý do                  │
   └──────────────────────────────────────┘
   → User: Replan / Bỏ qua / Xử lý riêng
    ↓
8. Hoàn thành
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► EXECUTION COMPLETE ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tasks: [done]/[total] | Waves: [M]
   Commits: [N] | Tests: ✓
   Deviations: [N] auto-fixed
   Node repairs: [N] (retry/decompose/prune)

   ▶ "/st:code-review để review toàn bộ"
```

## So sánh

| | Superpowers executing | Superpowers subagent | GSD execute-phase | Superteam |
|---|---|---|---|---|
| Parallelism | Không | Không | Wave-based | Wave-based |
| Context isolation | Không (1 agent) | Fresh per task | Fresh per agent | Fresh per wave agent |
| Review | Plan verification | Two-stage per task | Spot-check per wave | Test + quick review per wave |
| Error recovery | Stop + ask | Re-dispatch/decompose | Node repair 4 strategies | Node repair 4 strategies |
| Deviation rules | Không | Không | 4 levels | 4 levels (giống GSD) |
| Atomic commits | Không explicit | Không explicit | Per task | Per task |
| Resumability | Manual restart | Manual restart | Skip completed plans | Skip completed steps (checkbox) |
| Blocker handling | Stop | BLOCKED status | Escalate | /st:plan --replan (AI assess) |
| Critical review gate | Không | Không | Không | Có (trước execute) |

## Cải thiện so với industry

1. **Critical review gate** → check plan trước khi execute, tránh wasted execution
2. **Node repair** → RETRY/DECOMPOSE/PRUNE/ESCALATE, không dừng ngay mỗi lần fail
3. **Deviation rules** → auto-fix bugs/security/blocking, chỉ dừng cho architectural
4. **Checkpoint = test + review** → mặc định luôn chạy test giữa waves
5. **Blocker → replan** → /st:plan --replan với AI assess + user decide
6. **Resumable** → checkbox tracking, re-run tiếp từ chỗ dừng
