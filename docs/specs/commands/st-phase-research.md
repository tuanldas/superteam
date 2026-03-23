# `/st:phase-research` - Research Phase Implementation

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Deep research cho phase bằng parallel agents + web search + codebase scan. Spawn 4 researcher agents song song, mỗi agent cover 1 khía cạnh (stack, architecture, pitfalls, landscape). Kết quả tổng hợp vào SUMMARY.md. Feed vào phase-plan.

**Khác với research trong các commands khác:**
- `/st:brainstorm` research = broad overview, 1-2 rounds, AI trực tiếp
- `/st:plan` research = focused, optional, 1 researcher
- `/st:phase-research` = DEEP, 4 parallel agents, multiple output files

**Yêu cầu:** ROADMAP.md + phase tồn tại. Recommend chạy `/st:phase-discuss` trước (CONTEXT.md làm input cho research).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Depth | Deep: parallel agents + web search + codebase scan | Phase cần research kỹ trước plan |
| Agents | 4 parallel researcher agents | Cover đủ khía cạnh, tối ưu thời gian |
| Areas | Stack, Architecture, Pitfalls, Landscape | Pattern đã proven từ GSD |
| Output | 4 files + SUMMARY.md trong phases/[name]/research/ | Structured, reusable |
| Context input | CONTEXT.md từ phase-discuss (nếu có) | Research chính xác hơn |
| Next step | Gợi ý phase-plan, user quyết định | Nhất quán |

## Research Areas

| Area | File | Agent focus |
|---|---|---|
| Stack | STACK.md | Tech, libs, tools phù hợp cho phase. So sánh options, recommend. |
| Architecture | ARCHITECTURE.md | Cách organize code, patterns, file structure, data flow. |
| Pitfalls | PITFALLS.md | Vấn đề thường gặp, anti-patterns, edge cases, security risks. |
| Landscape | LANDSCAPE.md | Solutions hiện có, industry patterns, tham khảo implementations. |
| Summary | SUMMARY.md | Tổng hợp key findings từ 4 areas, recommendations. |

## Flow

```
/st:phase-research [phase number hoặc name]
VD: "/st:phase-research 3"
    "/st:phase-research authentication"
    "/st:phase-research" → show list planned phases, hỏi chọn

1. Check context
   - ROADMAP.md tồn tại? → Không: dừng
   - Parse phase: số, tên, REQ-IDs, success criteria
   - Phase status:
     → completed: "Phase đã hoàn thành. Vẫn muốn research?"
     → in-progress/planned: tiếp bình thường
   - Load: CONTEXT.md (nếu có từ phase-discuss), PROJECT.md
   - Scan codebase: files liên quan, tech stack, patterns
    ↓
2. Prepare research context
   - AI tổng hợp input cho agents:
     → Phase description + REQ-IDs + success criteria
     → CONTEXT.md decisions (nếu có)
     → Codebase tech stack + patterns
     → Constraints từ PROJECT.md
   - Trình bày:
     ┌──────────────────────────────────────┐
     │ RESEARCH SCOPE                       │
     ├──────────────────────────────────────┤
     │ Phase [X]: [name]                   │
     │ Focus areas:                         │
     │   1. Stack: [tech options to explore]│
     │   2. Architecture: [patterns needed] │
     │   3. Pitfalls: [risk areas]         │
     │   4. Landscape: [domains to scan]   │
     │                                      │
     │ Context: CONTEXT.md [có/không]       │
     │ Bắt đầu research?                   │
     └──────────────────────────────────────┘
   - User: approve / adjust focus areas
    ↓
3. Spawn 4 researcher agents (parallel)
   - Mỗi agent nhận:
     → Phase context (description, REQs, criteria)
     → CONTEXT.md decisions (nếu có)
     → Codebase info
     → Focus area cụ thể
   - Agents chạy song song:
     → Web search cho domain knowledge
     → Codebase scan cho existing patterns
     → Viết output file trực tiếp
   - Progress:
     "🔍 Researching... [stack ✓] [architecture ⏳] [pitfalls ⏳] [landscape ✓]"
    ↓
4. Synthesize
   - Spawn synthesizer agent (sau khi 4 agents xong):
     → Đọc 4 output files
     → Tổng hợp key findings
     → Identify conflicts giữa recommendations
     → Viết SUMMARY.md
    ↓
5. Present findings
   ┌──────────────────────────────────────┐
   │ RESEARCH SUMMARY                     │
   ├──────────────────────────────────────┤
   │ Stack: [key recommendation]          │
   │ Architecture: [key pattern]          │
   │ Pitfalls: [top risks]               │
   │ Landscape: [relevant solutions]      │
   │                                      │
   │ Key recommendations:                 │
   │   1. [recommendation]               │
   │   2. [recommendation]               │
   │                                      │
   │ Conflicts found:                     │
   │   [nếu có: mô tả + suggest resolve] │
   └──────────────────────────────────────┘
   - User: review, hỏi thêm nếu cần
    ↓
6. Save & commit
   - Files tại: .superteam/phases/[name]/research/
     ├── STACK.md
     ├── ARCHITECTURE.md
     ├── PITFALLS.md
     ├── LANDSCAPE.md
     └── SUMMARY.md
   - Commit: "docs: research phase [X] - [name]"
    ↓
7. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► PHASE RESEARCHED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Phase [X]: [name]
   Files: 5 (STACK, ARCHITECTURE, PITFALLS, LANDSCAPE, SUMMARY)
   Path: .superteam/phases/[name]/research/
   ▶ "/st:phase-plan [X] để tạo plan"
```

## Per-phase directory (cập nhật)

```
.superteam/phases/
└── authentication-system/
    ├── CONTEXT.md              ← /st:phase-discuss
    ├── research/               ← /st:phase-research
    │   ├── STACK.md
    │   ├── ARCHITECTURE.md
    │   ├── PITFALLS.md
    │   ├── LANDSCAPE.md
    │   └── SUMMARY.md
    └── PLAN.md                 ← /st:phase-plan (sau)
```

## So sánh

| | GSD phase-researcher | Superpowers | Superteam |
|---|---|---|---|
| Depth | Deep, parallel agents | Không có | Deep, parallel agents + web/codebase |
| Areas | 4 (stack, landscape, arch, pitfalls) | Không | 4 (giống GSD) |
| Web search | Có | Không | Có |
| Codebase scan | Có | Không | Có |
| Synthesizer | Có (riêng) | Không | Có (riêng) |
| Context input | Từ discuss-phase | Không | CONTEXT.md từ phase-discuss |
| Output | .planning/research/ | Không | .superteam/phases/[name]/research/ |
| User review | Không rõ | Không | Present summary, user review |

## Cải thiện

1. **Web search + codebase scan kết hợp** — agents vừa search web vừa scan code, toàn diện hơn
2. **User review findings** — present summary trước khi save, cho phép hỏi thêm
3. **Per-phase directory** — research files tổ chức theo phase, không chung 1 chỗ
4. **CONTEXT.md as input** — research chính xác hơn nhờ discuss context
5. **Progress indicator** — user biết agents nào đã xong
