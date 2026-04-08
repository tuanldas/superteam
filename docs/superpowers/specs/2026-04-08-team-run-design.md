# `/st:team run` — Team Roadmap Orchestration

> Status: Draft

## Overview

Sub-command moi cho `/st:team`: SM tiep quan ROADMAP.md va dieu phoi tung phase voi checkpoints. Semi-autonomous — team tu chay nhung dung lai o cac diem quan trong de user approve.

## Quyet dinh thiet ke

| Quyet dinh | Ket qua | Ly do |
|---|---|---|
| Approach | SM-as-Orchestrator | Tan dung 100% pipeline co san, it code moi nhat |
| Autonomy level | Semi-autonomous | User giu quyen kiem soat o checkpoint, khong can micro-manage |
| Pipeline reuse | SM goi `/st:phase-plan` + `/st:phase-execute` | Wave engine da co dependency analysis, checkpoint verification, deviation handling. Khong duplicate |
| Checkpoint timing | Sau research, sau UI/UX (conditional), sau plan, khi blocker | Du chi tiet de user kiem soat huong di ma khong qua nhieu |
| Checkpoint actions | approve / adjust (KHONG co skip) | Moi step deu phai qua user. Neu phase khong can UI/UX thi SM tu detect va khong tao checkpoint |
| State storage | CONTEXT.md (section moi) | Khong tao file moi. CONTEXT.md da la noi SM ghi decisions/patterns |
| Backward compatible | Solo pipeline khong bi anh huong | `/st:phase-execute` van hoat dong binh thuong khi khong co team |

## Entry Point

Them vao bang routing trong `commands/team.md`:

| Pattern | Action |
|---------|--------|
| `run` | SM tiep quan roadmap, chay tung phase voi checkpoints |

**Preconditions:**
- Team phai active (da `/st:team create`)
- `ROADMAP.md` phai ton tai voi it nhat 1 phase pending

## SM Orchestration Flow

SM nhan structured instructions va chay loop cho moi phase:

```
SM doc ROADMAP.md -> xac dinh next phase (pending, prerequisites met)
|
+- STEP 1: Research
|   SM goi `/st:phase-research` (command dispatch phase-researcher agent)
|   SM review findings -> tong hop key points
|   -> CHECKPOINT: trinh user research findings
|   -> User: approve / adjust
|
+- STEP 2: UI/UX Design (conditional)
|   SM kiem tra phase can frontend khong:
|     - Phase description chua UI/frontend keywords
|     - detectUIFramework() = true
|   Neu co -> SM goi `/st:ui-design` (command dispatch ui-researcher agent)
|   -> CHECKPOINT: trinh user UI spec
|   -> User: approve / adjust
|
+- STEP 3: Plan
|   SM dispatch /st:phase-plan
|   TL review plan (neu TL trong team)
|   -> CHECKPOINT: trinh user plan (da qua TL review neu co)
|   -> User: approve / adjust
|
+- STEP 4: Execute
|   SM dispatch /st:phase-execute (wave engine)
|   QA verify sau moi wave (neu QA trong team)
|   Senior Dev review code (neu SrDev trong team)
|   Blocker L3+ -> CHECKPOINT: escalate len user
|
+- STEP 5: Verify & Advance
|   QA chay final verification
|   SM update ROADMAP status -> done
|   SM update CONTEXT.md voi decisions/patterns learned
|   -> Chuyen phase tiep, lap STEP 1
|
+- Khi het phases -> SM bao cao tong ket milestone
```

SM reuse pipeline co san nhung them team roles vao cac checkpoint. Neu team nho (khong co TL/SrDev), SM skip role do theo bang task-level role skipping trong `team-coordination` skill.

## Checkpoint Protocol

Moi checkpoint SM dung va trinh user theo format thong nhat:

```
+---------------------------------------------+
| ST > TEAM CHECKPOINT                        |
|---------------------------------------------|
| Phase: [N] - [name]                         |
| Step:  [Research / UI Design / Plan]        |
|---------------------------------------------|
| Summary:                                    |
|   [SM tong hop 3-5 bullet points]           |
|                                             |
| Team input:                                 |
|   TL: [y kien neu co]                       |
|   QA: [concerns neu co]                     |
|---------------------------------------------|
| [approve] [adjust]                          |
+---------------------------------------------+
```

**Checkpoint behaviors:**

| Action | Hanh vi |
|--------|---------|
| `approve` | SM tiep tuc step tiep theo |
| `adjust` | User dua feedback -> SM dieu chinh -> chay lai step do -> trinh lai |

**Blocker checkpoint** (trong luc execute):

```
+---------------------------------------------+
| ST > TEAM BLOCKER                           |
|---------------------------------------------|
| Phase: [N] - [name]                         |
| Task:  #[id] - [description]                |
| Level: [3/4]                                |
|---------------------------------------------|
| Issue: [mo ta blocker]                      |
| Impact: [anh huong neu khong giai quyet]    |
| SM recommendation: [de xuat giai phap]      |
|---------------------------------------------|
| [accept recommendation] [provide guidance]  |
+---------------------------------------------+
```

## Team Role Integration

Khi team active, SM thay doi cach su dung pipeline:

**Truoc execute - TL review plan (neu co TL):**
SM gui plan cho TL -> TL review architecture, dependencies, risks -> TL feedback gop vao checkpoint trinh user.

**Trong execute - Role mapping vao wave engine:**

| Wave engine step | Solo mode (hien tai) | Team mode |
|---|---|---|
| Task implementation | executor agent (opus) | Developer hoac Senior Dev (tuy complexity) |
| Checkpoint review | reviewer agent (generic) | Senior Dev review + QA verify |
| Blocker handling | orchestrator tu xu ly L1-L2 | SM route theo deviation protocol da co |

**Sau execute - QA final verification:**
QA chay verification toan phase (tests, acceptance criteria).
- PASS: SM update ROADMAP -> done
- FAIL: SM route rework theo task lifecycle da co (max 3 cycles)

**Khi team nho (khong co role):**
SM ap dung bang role skipping tu `team-coordination` skill. Vi du team chi co SM + Dev + QA -> khong co TL review plan, khong co SrDev review code.

**Diem then chot:** Khong sua `/st:phase-execute` hay `/st:phase-plan`. SM wrap chung bang team protocol. Pipeline solo van hoat dong binh thuong khi khong co team.

## State Management & Persistence

SM ghi trang thai vao `.superteam/team/CONTEXT.md` (da co, SM la owner duy nhat). Them section tracking:

```markdown
## Run Progress
Phase: 3 - Authentication
Step: execute (wave 2/4)
Started: 2026-04-08T10:00:00Z

## Phase History
- Phase 1 - Project Setup: done (2026-04-07)
- Phase 2 - Database Schema: done (2026-04-08)
```

**Pause & Resume:**

| Tinh huong | Hanh vi |
|---|---|
| User dong session giua chung | SM ghi progress vao CONTEXT.md truoc khi shutdown |
| `/st:team run` lan sau | SM doc CONTEXT.md -> phat hien dang giua phase -> hoi user "Tiep tuc phase [N] tu step [X]?" |
| `/st:team disband` | Run progress archived cung backlog nhu flow disband hien tai |

Tuong thich voi `/st:pause` va `/st:resume`: `/st:pause` tao handoff files rieng. SM ghi run progress vao CONTEXT.md la bo sung, khong conflict.

## Edge Cases & Error Handling

| Tinh huong | Hanh vi |
|---|---|
| ROADMAP.md khong ton tai | SM bao loi: "Khong tim thay ROADMAP.md. Chay `/st:init` truoc." |
| Tat ca phases da done | SM bao: "Tat ca phases da hoan thanh. Milestone ready for `/st:milestone-complete`." |
| Phase prerequisites chua met | SM skip phase do, tim phase tiep theo eligible. Neu khong co -> bao user blocker |
| Team member fail/unresponsive | SM reassign theo error recovery trong `team-coordination` skill |
| User muon dung giua chung | User noi "stop" hoac "pause" -> SM ghi progress vao CONTEXT.md, dung run loop |
| `/st:team run` khi dang run | SM bao: "Dang chay phase [N]. Dung `/st:team status` de xem progress." |
| Phase moi duoc them giua chung | SM doc lai ROADMAP.md moi lan chuyen phase -> tu detect phase moi |

Khong reinvent error handling — delegation protocol, rework loops, max 3 cycles, escalation chain deu da co trong `team-coordination`.

## Tich hop

**Files can sua:**
- `commands/team.md` — them sub-command `run` + routing
- `agents/scrum-master.md` — them run orchestration instructions (optional, co the chi dung command instructions)

**Files KHONG sua:**
- `commands/phase-plan.md` — giu nguyen
- `commands/phase-execute.md` — giu nguyen
- `core/team.cjs` — khong can them logic moi
- `skills/team-coordination/SKILL.md` — protocol da du

**Skills su dung:**
- `team-coordination` — role boundaries, task lifecycle, deviation handling
- `wave-parallelism` — execution within phase
- `verification` — QA methodology
