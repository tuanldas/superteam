# `/st:init` - Project Initialization

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Khởi tạo project đầy đủ: config → detect → questioning → research → design system → requirements → roadmap.
Thay thế hoàn toàn `/gsd:new-project`.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Flow style | Full flow (9 steps + spec review) | Project cần planning kỹ lưỡng |
| Config timing | Step 1 (đầu flow) | Cần biết config trước để configure research agents |
| Detection | Full auto-detect (type, frameworks, workspaces, brownfield) | Questioning được context hóa tốt hơn |
| Brownfield | Tích hợp trong init (spawn codebase-mapper) | Không gián đoạn flow, giữ context |
| Questioning | 15 lượt/vòng → tổng quan → user decide → loop | Tránh 2 cực (quá ít / quá nhiều), user có quyền tiếp tục |
| Research | 4 core + optional extras, 2 waves | Dependency order hợp lý, flexible theo domain |
| Reconciliation | Living doc - PROJECT.md auto-update | Gọn hơn reconciliation step riêng |
| Image input | Accept bất cứ lúc nào | Không giới hạn UX |
| Auto mode | Không | User interactive luôn |
| Global defaults | Không | Mỗi project hỏi riêng |
| Spec review | Reviewer kiểm tra tất cả artifacts, max 3 iterations | Đảm bảo chất lượng trước khi Done |
| Design System | Sau Research, trước Requirements. Luôn hỏi, adapted flow (bỏ bước trùng init) | Backend cũng cần UI (404, coming soon). Research cung cấp context, design system inform requirements |

## Flow

```
1. Config preferences
   - Granularity (coarse/standard/fine)
   - Parallelization (parallel/sequential)
   - Git tracking (commit planning docs hay không)
   - AI models cho agents
   - Tạo .superteam/config.json
   - Commit: "chore: add project config"
    ↓
2. Setup + Auto-detect
   - Kiểm tra .superteam/ đã tồn tại chưa
     → Có: "Project đã init. Muốn re-init?"
     → Chưa: tiếp
   - Kiểm tra git, init nếu chưa có
   - Auto-detect:
     → Scan file markers (package.json, composer.json, go.mod,
       Dockerfile, tsconfig.json, vite.config.*, next.config.*...)
     → Detect project type, frameworks, workspaces
     → Detect brownfield/greenfield
   - Nếu brownfield:
     → Spawn codebase-mapper agent ngay trong init
     → Kết quả mapping → context cho questioning
   - Trình bày detection results (chưa confirm, chỉ hiển thị context)
    ↓
3. Deep questioning (loop)

   a. Open-ended start
      - "Bạn muốn build gì?"
      - Follow-up dựa trên câu trả lời
      - Image input: accept ảnh bất cứ lúc nào
        (wireframe, whiteboard, architecture diagram...)

   b. Coverage checklist (internal, không hiển thị cho user)
      ☐ WHO   - User là ai, dùng trong context nào
      ☐ WHAT  - Core problem / pain point cần giải quyết
      ☐ SCOPE - Features, dependencies, effort signals, assumptions
      ☐ EXIST - Đã có gì rồi, constraints kỹ thuật
      ☐ DONE  - Thế nào là "xong"? Success criteria

      Mỗi area cần ít nhất 1 câu trả lời cụ thể mới check off.

   c. Detection-aware suggestions
      - Gợi ý dựa trên detection, không giới hạn
      - Gợi ý phần user chưa nghĩ tới
      VD: "Bạn nhắc tới API nhưng chưa nói về auth."
      VD: "Tôi thấy React nhưng chưa có test setup."

   d. Questioning techniques (từ research)
      - Follow the thread, không follow script
      - Challenge vagueness: "good" nghĩa là gì? "users" là ai?
      - Make abstract concrete: "Walk me through using this"
      - 4 loại câu hỏi: Motivation, Concreteness, Clarification, Success
      - KHÔNG: checklist walking, canned questions, interrogation,
        rushing, shallow acceptance, premature constraints

   e. Checkpoint sau 15 lượt (hoặc ≥ 4/5 areas covered)
      → Trình bày SCOPE SUMMARY (full format, 10 sections):
        1. WHAT WE KNOW — WHO, WHAT, EXIST, DONE, CONSTRAINTS
        2. PROJECT OVERVIEW — narrative + bảng mảng chức năng (effort) + bảng user roles
        3. CORE USER JOURNEY — flow end-to-end + minimum complete path
        4. FEATURE MAP — dependency tree
        5. EFFORT + TÍNH CHẤT — mỗi feature: effort (S/M/L/XL) + Foundational/Additive
        6. RISKIEST ASSUMPTIONS — mỗi feature: giả định + status (✅/⚠️/❌)
        7. SCOPE RECOMMENDATION — MoSCoW (Must/Should/Could) + AI reasoning. Confidence: Med/Low
        8. V1 SUCCESS SIGNAL — hành vi user observable khi v1 thành công
        9. WHAT V1 DELIBERATELY IGNORES — mỗi feature bỏ: why OK, risk nếu thêm, trigger khi nào thêm
        10. TRADEOFFS — key decisions + AI recommendation
      → Kết thúc: "Adjust scope nào trước khi tiếp tục?"
      → User adjust → sửa scope
      → User approve → lưu vào PROJECT.md (ghi "Preliminary scope — sẽ refine sau research")
      → User: "Cần thêm/sửa" → vòng questioning mới (15 lượt)
      → Lặp không giới hạn số vòng
    ↓
4. Write PROJECT.md (living doc)
   - Tổng hợp context từ detection + questioning + images
   - Requirements sơ bộ (Validated/Active/Out of Scope)
   - Brownfield: suy ra Validated từ existing code
   - Key Decisions
   - Assumptions (nếu có areas chưa cover)
   - Footer: "*Created: [date] after init*"
   - Commit: "docs: initialize project"

   Lưu ý: PROJECT.md là living doc
   - Các steps sau tự update khi phát hiện conflict
   - Mọi thay đổi ghi vào footer + commit message
    ↓
5. Research (2 waves + optional extras)

   Input: .superteam/PROJECT.md + codebase mapping (nếu brownfield)

   Wave 1 (parallel):
   ┌────────────────────────────────────────────┐
   │ STACK research                              │
   │ Scope: Công nghệ nên dùng                  │
   │ Output: Libraries + versions + rationale    │
   │ KHÔNG: đề xuất features, kiến trúc          │
   ├────────────────────────────────────────────┤
   │ LANDSCAPE research                          │
   │ Scope: Sản phẩm tương tự trên thị trường   │
   │ Output: Table stakes vs differentiators     │
   │ KHÔNG: quyết định build gì                  │
   └────────────────────────────────────────────┘

   Wave 2 (parallel, sau wave 1):
   ┌────────────────────────────────────────────┐
   │ ARCHITECTURE research                       │
   │ Scope: Cách cấu trúc hệ thống              │
   │ Input: PROJECT.md + STACK.md                │
   │ Output: Components, data flow, build order  │
   │ KHÔNG: chọn tech stack, chọn features       │
   ├────────────────────────────────────────────┤
   │ PITFALLS research                           │
   │ Scope: Sai lầm phổ biến trong domain        │
   │ Input: PROJECT.md + STACK.md + ARCH.md      │
   │ Output: Risks cụ thể + cách phòng tránh    │
   │ KHÔNG: đề xuất features hay kiến trúc mới  │
   └────────────────────────────────────────────┘

   Optional extras (AI tự quyết định dựa trên PROJECT.md):
   ┌────────────────────────────────────────────┐
   │ Ví dụ:                                      │
   │ - SECURITY (sensitive data, payments, auth) │
   │ - PERFORMANCE (real-time, high traffic)     │
   │ - ACCESSIBILITY (public-facing web app)     │
   └────────────────────────────────────────────┘

   → Synthesize tất cả → SUMMARY.md
   → Nếu phát hiện conflict với PROJECT.md → update PROJECT.md
   → Commit: "docs: complete research"
    ↓
6. Design System
   - Gate: "Dự án này có cần design system không?
     (Kể cả backend cũng có thể cần trang 404, coming soon, redirect...)"
     → Không: ghi vào PROJECT.md "## Design System\nKhông cần — [lý do]", skip
     → Có: chạy adapted flow (4 sub-steps)

   6.1 Tổng hợp context tự động
       - Đọc: PROJECT.md, research findings, auto-detect results
       - Trích xuất: product type, users, industry, tech stack
       - Brownfield: "Phát hiện [fonts/colors/spacing]. Baseline hay zero?"
       - Không hỏi thêm — context đã đủ từ bước 2-5

   6.2 Đề xuất 7 dimensions
       - AESTHETIC, DECORATION, TYPOGRAPHY, COLOR, SPACING, LAYOUT, MOTION
       - SAFE CHOICES vs RISKS + AI SLOP CHECK
       - Dùng research landscape data nếu có, built-in knowledge nếu không
       - Áp dụng font rules + AI slop anti-patterns từ /st:design-system

   6.3 Drill-downs + Playwright preview
       - Approve / Adjust / Different risks / Start over
       - Coherence check: nudge 1 lần, accept user decision
       - Playwright nếu có: HTML preview, mockups, light/dark
       - Không có Playwright: text-based

   6.4 Lưu
       - Save .superteam/DESIGN-SYSTEM.md
       - Commit: "design: create design system for [project]"
    ↓
7. Define requirements
   - Load DESIGN-SYSTEM.md nếu có (design tokens inform requirements)
   - Load research findings (LANDSCAPE.md cho feature reference)
   - Categorize features (table stakes / differentiators)
   - User scope v1/v2/out of scope per category
   - Generate REQUIREMENTS.md với REQ-IDs ([CATEGORY]-[NUMBER])
   - Trình bày full list, xin user approval
   - Nếu phát hiện conflict → update PROJECT.md
   - Commit: "docs: define v1 requirements"
    ↓
8. Create roadmap
   - Spawn roadmapper agent
   - Input: PROJECT.md + REQUIREMENTS.md + SUMMARY.md + DESIGN-SYSTEM.md (nếu có) + config
   - Map requirements → phases
   - Derive 2-5 success criteria per phase
   - Validate 100% requirement coverage
   - Generate ROADMAP.md
   - Trình bày cho user confirm/adjust
   - Loop cho đến user approve
   - Nếu phát hiện conflict → update PROJECT.md
   - Commit: "docs: create roadmap ([N] phases)"
    ↓
9. Spec review
   - Dispatch reviewer agent kiểm tra tất cả artifacts:
     → PROJECT.md: đầy đủ, không mơ hồ
     → REQUIREMENTS.md: REQ-IDs consistent, coverage đủ
     → ROADMAP.md: map 100% requirements, success criteria rõ
     → DESIGN-SYSTEM.md (nếu có): coherent, không conflict với requirements
     → Cross-check: requirements ↔ roadmap ↔ project không conflict
   - Nếu có issues → fix, re-dispatch (max 3 iterations)
   - Nếu vượt 3 iterations → surface cho user quyết định
   - Commit fix nếu có
    ↓
10. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► PROJECT INITIALIZED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   | Artifact       | Location                      |
   |----------------|-------------------------------|
   | Config         | .superteam/config.json        |
   | Project        | .superteam/PROJECT.md         |
   | Research       | .superteam/research/          |
   | Design System  | .superteam/DESIGN-SYSTEM.md   |
   | Requirements   | .superteam/REQUIREMENTS.md    |
   | Roadmap        | .superteam/ROADMAP.md         |

   [N] phases | [X] requirements | Ready to build ✓

   ▶ Next: /st:phase-discuss 1
```

## Output Artifacts

```
my-project/
└── .superteam/
    ├── config.json
    ├── PROJECT.md
    ├── DESIGN-SYSTEM.md       ← optional (step 6)
    ├── REQUIREMENTS.md
    ├── ROADMAP.md
    └── research/
        ├── STACK.md
        ├── LANDSCAPE.md
        ├── ARCHITECTURE.md
        ├── PITFALLS.md
        ├── [SECURITY.md]       ← optional
        ├── [PERFORMANCE.md]    ← optional
        ├── [ACCESSIBILITY.md]  ← optional
        └── SUMMARY.md
```

## So sánh: Superteam vs GSD vs Superpowers

| | Superpowers | GSD | Superteam |
|---|---|---|---|
| **Có init command** | Không | `/gsd:new-project` | `/st:init` |
| **Config timing** | N/A | Step 5 (giữa flow) | Step 1 (đầu flow) |
| **Detection** | Không | Chỉ brownfield/greenfield | Full auto-detect (type, frameworks, workspaces, brownfield) |
| **Brownfield handling** | Không | Exit init → map codebase → quay lại | Tích hợp trong init (không gián đoạn) |
| **Questioning style** | One at a time, multiple choice | Open-ended, follow the thread, không hard stop | Open-ended + coverage checklist + 15 lượt/vòng + checkpoint summary |
| **Questioning focus** | Purpose, constraints, success criteria | Dream extraction, motivation, concreteness | 5 areas (WHO, WHAT, SCOPE, EXIST, DONE) + detection-aware |
| **Questioning limit** | Không có | Không có | 15 lượt → tổng quan → user decide → loop |
| **Image input** | Visual companion (browser-based, opt-in) | Không | Accept ảnh bất cứ lúc nào (inline) |
| **Research** | Không | 4 dimensions cố định, 4 parallel agents | 4 core + optional extras, 2 waves (dependency order) |
| **Research dependency** | N/A | 4 agents song song (không dependency) | Wave 1 (STACK+LANDSCAPE) → Wave 2 (ARCH+PITFALLS cần STACK) |
| **Reconciliation** | Không | Không | Living doc - PROJECT.md auto-update mỗi step |
| **Requirements** | Không | Category-based, REQ-IDs, v1/v2, user scope | Tương tự GSD |
| **Roadmap** | Không | Roadmapper agent, user approve/adjust loop | Tương tự GSD |
| **Spec review** | Subagent reviewer cho design spec, max 3 iterations | Không có cho init | Reviewer kiểm tra tất cả artifacts, max 3 iterations |
| **Auto mode** | Không | Có (`--auto @doc.md`) | Không |
| **Global defaults** | Không | `~/.gsd/defaults.json` | Không |
| **Design System** | Không | Không | Tích hợp trong init (adapted flow, luôn hỏi) |
| **Atomic commits** | 1 commit (spec file) | Mỗi step commit riêng | Mỗi step commit riêng |

## Cải thiện so với GSD

1. **Detection thông minh hơn** → questioning được context hóa
2. **Brownfield không gián đoạn** → flow liền mạch
3. **Questioning có structure** → 15 lượt + checkpoint + loop, user luôn có quyền tiếp tục
4. **Research flexible** → optional dimensions theo domain
5. **Research dependency order** → ARCH cần STACK, PITFALLS cần cả hai
6. **Living doc** → PROJECT.md luôn up-to-date
7. **Spec review** → kiểm tra cross-artifact consistency trước khi Done
8. **Design system tích hợp** → init hỏi về design system, GSD không có

## Cải thiện so với Superpowers

1. **Full project init** → Superpowers không có init, chỉ có brainstorming cho features
2. **Research phase** → Superpowers không research domain
3. **Requirements + Roadmap** → Superpowers không tạo structured requirements hay roadmap
4. **Questioning có heuristic rõ** → 5 areas checklist + hard stop + checkpoint, Superpowers không có
5. **Design system trong init** → Superpowers không có design system step trong brainstorming
