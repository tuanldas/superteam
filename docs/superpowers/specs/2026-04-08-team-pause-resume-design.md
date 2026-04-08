# Team Pause/Resume Design

Cho phép user dừng team đang chạy bất kỳ lúc nào (graceful stop) và resume sau với nhiều tuỳ chọn.

## Requirements

- Dừng cả workflow (team run) lẫn freeze team state
- Graceful stop: ra lệnh bất kỳ lúc nào, dừng ở checkpoint gần nhất (sau step hiện tại xong)
- Resume chọn lọc: resume all, resume team only
- Commands riêng: `/st:team pause` + `/st:team resume`
- Team paused thì agent riêng lẻ vẫn dùng được — chỉ freeze orchestration

## Approach: Pause Flag + HANDOFF mở rộng

Tận dụng pattern HANDOFF hiện có (`/st:pause`), mở rộng cho team-specific state.

## State & Data Model

### `config.json` — thêm status values

```
status: "active" | "pausing" | "paused" | "disbanded"
```

- `"pausing"` — trạng thái trung gian: user đã ra lệnh pause, đang đợi step hiện tại xong
- `"paused"` — team đã dừng hoàn toàn, handoff files đã tạo

### `TEAM-HANDOFF.json` — tạo khi pause, xoá khi resume

Lưu tại `.superteam/team/TEAM-HANDOFF.json`:

```json
{
  "pausedAt": "2026-04-08T10:30:00Z",
  "workflow": "run",
  "currentPhase": 3,
  "currentStep": "execute",
  "completedSteps": ["research", "plan"],
  "pendingSteps": ["execute", "verify"],
  "agentAssignments": {
    "developer": { "task": "implement auth module", "progress": "in_progress" },
    "reviewer": { "task": null, "progress": "idle" }
  },
  "reason": "user requested pause"
}
```

### `TEAM-HANDOFF.md` — human-readable companion

Cùng nội dung dạng Markdown, lưu tại `.superteam/team/TEAM-HANDOFF.md`. Cho user đọc nhanh khi quay lại.

## Commands

### `/st:team pause`

1. Check team đang `"active"` — nếu không thì báo lỗi
2. Set `config.json` status → `"pausing"`
3. Nếu `team run` đang chạy → đợi step hiện tại xong (graceful stop)
4. Snapshot state vào `TEAM-HANDOFF.json` + `TEAM-HANDOFF.md`
5. Set `config.json` status → `"paused"`
6. Thông báo: "Team paused tại phase X, step Y. Chạy `/st:team resume` để tiếp tục."

**Edge cases:**
- Team active nhưng không có `run` đang chạy → skip graceful stop, pause ngay
- Đã paused rồi → báo "Team already paused"
- Team disbanded → báo lỗi

### `/st:team resume`

1. Check team đang `"paused"` — nếu không thì báo lỗi
2. Đọc `TEAM-HANDOFF.json` + `TEAM-HANDOFF.md`
3. Show trạng thái team khi pause: phase nào, step nào, ai đang làm gì
4. Hỏi user chọn:

| Option | Mô tả |
|--------|--------|
| **Resume all** | Unfreeze team + tiếp tục workflow từ chỗ cũ |
| **Resume team only** | Unfreeze team (status → `"active"`), không chạy lại workflow |

5. Thực hiện:
   - **Resume all**: status → `"active"`, khởi động `team run` từ step tiếp theo
   - **Resume team only**: status → `"active"`, thông báo dùng `/st:team run` để chạy tiếp
6. Xoá `TEAM-HANDOFF.json` + `TEAM-HANDOFF.md`

**Edge cases:**
- Handoff files bị mất/corrupt → fallback: đọc `CONTEXT.md` reconstruct state
- Codebase thay đổi kể từ pause → cảnh báo commits mới, hỏi review trước khi resume

## Tích hợp với `team run`

Thêm pause check vào orchestration loop:

```
for each phase:
  for each step in [research, ui-design, plan, execute, verify]:
    → CHECK: config.status === "pausing"?
      → YES: snapshot state → set "paused" → return
      → NO: continue step
```

## Status Flow

```
active → pausing → paused → (resume) → active
  ↓                                       ↑
  └──────── disbanded ←───────────────────┘
```

## Scope sửa đổi

| File | Thay đổi |
|------|----------|
| `core/team.cjs` | Thêm `isTeamPaused()`, `isTeamPausing()`, `setTeamStatus()` helpers |
| `commands/team.md` | Sửa `run` section thêm pause check; thêm `pause` + `resume` sub-commands |
| `.claude-plugin/plugin.json` | Không cần — `pause`/`resume` là sub-commands của `team` |

## Không thay đổi

- Agent definitions — không bị ảnh hưởng
- `/st:pause` và `/st:resume` — giữ nguyên, independent
- `core/config.cjs` — team config tách biệt
