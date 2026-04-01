# `/st:team` - Quản Lý Scrum Team

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Quản lý Scrum team gồm AI agents. Tạo team theo project context (type + size), giao việc qua natural language routing đến Scrum Master, theo dõi status, giải tán gracefully. Team composition adaptive theo project type + size, user luôn có quyền override.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Team model | Scrum (SM + TL + Dev + QA) | Proven methodology, rõ role boundaries, tự nhiên cho multi-agent |
| Composition | Adaptive: project type → preset, size → scale | Không one-size-fits-all; frontend project không cần DevOps mặc định |
| Size detection | Multi-signal: flag > config > artifact count > file count > default | Fallback chain đảm bảo luôn có estimate, user override ưu tiên cao nhất |
| Team creation | Recommend rồi user confirm | User quyết định final, AI chỉ gợi ý dựa trên context |
| Agent spawning | SM first, others after | SM là coordinator, cần ready trước để nhận và phân phối tasks |
| Natural language routing | Mọi text không match sub-command → route đến SM | User không cần biết task thuộc ai, SM decompose + assign |
| Communication | `SendMessage` với task ID prefix | Traceable, không mất context giữa agents |
| State management | `TaskList`/`TaskUpdate` là source of truth | Platform-native, không tự build state system riêng |
| Team memory | `.superteam/team/` persist qua disband | Knowledge retention: architecture decisions, patterns không mất |
| Max team size | 8 agents | Communication overhead tăng O(n²), 8 là sweet spot giữa capability và coordination cost |
| Backward compatibility | Không ảnh hưởng `/st:execute`, `/st:plan` | Team là optional layer, không break existing solo workflows |
| Disband | Graceful: notify all → archive → cleanup | Không mất pending tasks (save backlog), không mất knowledge (keep CONTEXT.md) |
| Extend signals | Auto-detect UI framework → UX, CI/CD → DevOps | Smart suggestion nhưng không auto-add; user confirm |
| Decision hierarchy | User > SM > TL > SrDev > Dev | Rõ ràng ai quyết gì, tránh conflict giữa agents |

## Flow

### create

```
1. Check existing team
   - Đọc .superteam/team/config.json
   - Active? → "Team already active. /st:team status hoặc disband"
   - Không? → tiếp
    ↓
2. Detect project context
   - Scan: package.json, composer.json, go.mod, Cargo.toml...
   - Identify: project type, frameworks, workspaces
    ↓
3. Estimate project size
   - Priority chain:
     1. --size flag (user override)
     2. .superteam/config.json → team.size
     3. PROJECT.md / ROADMAP.md phase count
     4. Source file count
     5. Default: medium
   - Greenfield (0 files)? → hỏi user ONE question với recommendation
    ↓
4. Assemble team composition
   - Load team-roles-catalog.md preset theo project type
   - Apply size adaptation:
     Small: collapse TL + SrDev → 1 Dev (opus)
     Medium: preset as-is
     Large: add Dev 2
   - Check extend signals:
     UI framework → suggest UX Designer
     CI/CD config → suggest DevOps Engineer
    ↓
5. Present recommendation
   ┌─────────────────────────────────────────┐
   │ ST > TEAM COMPOSITION                   │
   │─────────────────────────────────────────│
   │ Project: [name] ([type], [size])        │
   │ Core: SM + TL + SrDev + Dev + QA       │
   │ Suggested extend: + UX Designer         │
   │ Total: [N] agents                       │
   │ Adjust or proceed?                      │
   └─────────────────────────────────────────┘
   - User: approve / add / remove / change size
    ↓
6. Create team via platform
   - TeamCreate(team_name, description)
   - Save config.json (members, status, timestamps)
   - Write CONTEXT.md (project info, empty sections for decisions/patterns)
    ↓
7. Spawn agents
   - Scrum Master FIRST (team lead)
   - All other members after SM ready
   - Each agent: name, team_name, role, initial instructions
    ↓
8. Report
   ┌─────────────────────────────────────────┐
   │ ST > TEAM CREATED                       │
   │ Members: [N] active                     │
   │ Giao việc: /st:team <mô tả task>       │
   │ Xem status: /st:team status             │
   └─────────────────────────────────────────┘
```

### status

```
1. Check active team
   - Không active? → "No active team. /st:team create"
    ↓
2. Gather data
   - config.json → member info
   - TaskList → task states
    ↓
3. Display dashboard
   ┌─────────────────────────────────────────┐
   │ ST > TEAM STATUS: [team-name]           │
   │ Members: [name] ● active / ○ idle       │
   │ Tasks: #N [✓/→/ ] [desc] ([owner])     │
   │ Progress: [done]/[total]                │
   └─────────────────────────────────────────┘
```

### disband

```
1. Check active team
   - Không active? → "No active team to disband."
    ↓
2. Confirm with user
   - "Disband [name]? ([N] members, [M] tasks in progress)"
    ↓
3. Graceful shutdown
   - SendMessage(to: "*", shutdown_request)
   - Wait for responses
    ↓
4. Archive state
   - config.json: status → "disbanded"
   - Pending tasks → backlog.md
   - CONTEXT.md preserved (knowledge retention)
    ↓
5. Cleanup
   - TeamDelete
    ↓
6. Report
   ┌─────────────────────────────────────────┐
   │ ST > TEAM DISBANDED                     │
   │ Tasks completed: [N]/[total]            │
   │ Remaining: [M] (saved to backlog)       │
   │ Memory preserved at .superteam/team/    │
   └─────────────────────────────────────────┘
```

### Natural language routing

```
1. Check active team
   - Không active? → "No active team. /st:team create"
    ↓
2. Route to Scrum Master
   - SendMessage(to: "scrum-master", "User request: [arguments]")
   - SM decomposes → creates tasks → assigns to members
    ↓
3. User monitors via /st:team status
```

## Tích hợp

### Team-Coordination Skill

`/st:team` tạo team, `team-coordination` skill định nghĩa cách team hoạt động:

| `/st:team` (command) | `team-coordination` (skill) |
|---|---|
| Create/disband team | Task lifecycle state machine |
| Spawn/stop agents | Communication protocol (SendMessage + task ID) |
| Status dashboard | Deviation handling (4 levels) |
| Natural language routing | Decision hierarchy |
| Size/composition logic | Context loading standard (5 steps) |

### Agent Files

| Role | Agent | Model | Khi nào |
|---|---|---|---|
| Scrum Master | `scrum-master.md` | opus | Luôn có (coordinator) |
| Tech Lead | `tech-lead.md` | opus | Medium+ projects |
| Senior Developer | `senior-developer.md` | opus | Medium+ projects |
| Developer | `developer.md` | sonnet | Luôn có (core impl) |
| QA Engineer | `qa-engineer.md` | sonnet | Luôn có (verification) |
| UX Designer | `ux-designer.md` | sonnet | UI framework detected |
| DevOps Engineer | `devops-engineer.md` | sonnet | CI/CD detected |

### Core Library

`core/team.cjs` cung cấp:
- `assembleTeam()` — composition logic
- `getRecommendedRoles()` — project type → preset mapping
- `estimateProjectSize()` — multi-signal detection
- `detectCICD()` / `detectUIFramework()` — extend signal detection
- `saveTeamConfig()` / `loadTeamConfig()` / `isTeamActive()` — state management

### Persistence

```
.superteam/team/
├── config.json     # Team state (members, status, timestamps)
├── CONTEXT.md      # Accumulated knowledge (survives disband)
└── backlog.md      # Pending tasks from disband (if any)
```

## So sánh

| | GitHub Copilot Workspace | Devin | Cursor Composer | GSD Teams | Superteam |
|---|---|---|---|---|---|
| Multi-agent | Không | 1 agent | Không | Không native | Scrum team (2-8 agents) |
| Role separation | N/A | N/A | N/A | N/A | SM/TL/Dev/QA/UX/DevOps |
| Adaptive composition | N/A | N/A | N/A | N/A | Project type + size → preset |
| Natural language routing | Có (single agent) | Có (single agent) | Có (single agent) | Không | User → SM → decompose → assign |
| Communication protocol | N/A | N/A | N/A | N/A | SendMessage + task ID prefix |
| Decision hierarchy | N/A | N/A | N/A | N/A | User > SM > TL > SrDev > Dev |
| Knowledge retention | Session-only | Session-only | Session-only | Phase artifacts | CONTEXT.md persists qua disband |
| Deviation handling | Stop | Auto-fix all | Auto-fix all | 4 levels | 4 levels (auto 1-3, stop 4) |
| Task lifecycle | Không formal | Internal | Không formal | Plan-based | State machine (6 states + rework) |
| Graceful shutdown | N/A | N/A | N/A | N/A | Notify → archive → backlog → cleanup |

## Cải thiện so với industry

1. **Multi-agent Scrum** → role separation thay vì 1 agent làm tất cả, giảm context pollution
2. **Adaptive composition** → team size và roles adjust theo project, không over-provision
3. **Natural language routing** → user mô tả task, SM decompose, không cần biết internal routing
4. **Knowledge retention** → CONTEXT.md survive disband, team mới benefit từ knowledge cũ
5. **Graceful disband** → pending tasks saved to backlog, không mất work-in-progress
6. **Decision hierarchy** → clear escalation path, tránh agent conflict
7. **Extend signals** → auto-detect UI/CI cần, suggest specialist roles
