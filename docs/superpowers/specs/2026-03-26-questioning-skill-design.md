# Questioning Skill Design

> Status: Approved (sau brainstorming)

## Boi canh

User feedback: init command (va cac commands khac) hoi don dap nhieu cau hoi trong mot tin nhan. Vi du: hoi Platform, Tech stack, V1 scope cung luc thay vi hoi tung cau mot roi dung cau tra loi lam nen tang cho cau hoi tiep theo.

## Quyet dinh thiet ke

| Quyet dinh | Ket qua | Ly do |
|---|---|---|
| Pham vi | Toan bo Superteam commands | Trai nghiem nhat quan, cung "giong noi" |
| Thich ung | Cau tra loi truoc quyet dinh cau hoi tiep | Tan dung context, hoi dung hon, it thua |
| Implementation | Shared skill + cap nhat toan bo commands | Single source of truth, thay doi 1 cho ap dung toan bo |
| Format | Luon khuyen nghi + ly do | Da co trong command-design-process.md, nay enforce chinh thuc |

## Design

### Shared Skill: `superteam:questioning`

**Vi tri:** `skills/questioning/SKILL.md`

**Quy tac cot loi:**
1. Mot cau hoi moi tin nhan — khong bao gio gom 2+ cau
2. Thich ung — cau tra loi truoc quyet dinh cau hoi tiep
3. Multiple choice uu tien khi options da biet
4. Luon khuyen nghi + ly do cho multiple choice
5. Phan biet ASK (1 cau/msg) vs PRESENT (batch OK) vs CONFIRM (1 cau/msg)

### Ba loai interaction

| Loai | Muc dich | Quy tac |
|------|----------|---------|
| **ASK** | Thu thap thong tin moi | 1 cau/message, thich ung |
| **PRESENT** | Trinh bay de review/approve | Batch content OK, ket thuc bang 1 cau "approve?" |
| **CONFIRM** | Gate yes/no | 1 cau/message |

Quy tac "mot cau hoi" ap dung cho ASK va CONFIRM. PRESENT duoc phep batch content vi thuc chat la 1 cau hoi duy nhat ("approve/adjust?").

### Anti-patterns

- Gom nhieu cau hoi trong 1 message
- Dump checklist cau hoi
- Hoi cau co the suy ra tu context/cau tra loi truoc
- Hoi kieu tham van rapid-fire
- Hoi "con gi nua khong?" ngay sau cau tra loi dau tien

### Format multiple choice

```
[Context — tai sao hoi cau nay]

- **Option A** — [mo ta]
- **Option B** — [mo ta]
- **Option C** — [mo ta]

Khuyen nghi: **Option B** — [ly do].
Khong chon Option A vi [ly do]. Khong chon Option C vi [ly do].
```

## Phan loai commands (audit)

### Nhom A: Can sua nang (6 commands)

| Command | Van de hien tai | Thay doi |
|---------|----------------|----------|
| `init` | Step 1: 5 config batch. Step 3: khong enforce | Rewrite Step 1 + them rule cung Step 3 |
| `quick` | "1-2 focused questions" cho phep batch | Sua thanh tung cau |
| `debug` | 5 symptom questions co the batch | Hoi tung symptom |
| `ui-design` | "2-3 questions" cho phep batch | Sua thanh tung cau |
| `plan` | Step 3 chua enforce | Them enforce follow-up |
| `team` | Step 3, 5 co the batch | Hoi tung cau |

### Nhom B: Sua nhe (6 commands)

phase-discuss, milestone-new, phase-validate, design-system, brainstorm, debug-quick
- Da gan dung, chi can them reference + minor wording

### Nhom C: Chi them reference (15 commands)

code-review, review-feedback, phase-plan, phase-execute, phase-add, phase-remove, phase-research, milestone-complete, milestone-archive, resume, readme, execute, worktree, api-docs, tdd
- Chi co PRESENT hoac CONFIRM, khong can sua logic

### Khong can thay doi (3 commands)

pause, phase-list, milestone-audit — khong hoi user

## Vi du truoc/sau

### Init Step 1 — Config Preferences

**Truoc:**
> 1. Granularity? (coarse/standard/fine)
> 2. Parallelization? (parallel/sequential)
> 3. Git tracking? (yes/no)
> 4. AI models?
> 5. Research confirmation?

**Sau:**
> Message 1: "Project size anh huong muc do chi tiet planning.
> - Coarse, Standard, Fine
> Khuyen nghi: Standard..."
>
> (User tra loi)
>
> Message 2: "Voi Standard, research agents cho output vua phai.
> - Parallel, Sequential
> Khuyen nghi: Parallel..."

### Init Step 3 — Deep Questioning

**Truoc:**
> 1. Platform: Web, mobile, hay desktop?
> 2. Tech stack: React, Flutter, Laravel?
> 3. V1 scope: tinh nang cot loi nhat?

**Sau:**
> Message 1: "Ban muon build gi?"
> (User: "App quan ly task cho team nho")
>
> Message 2: "Team nho la bao nhieu nguoi? Va ho dang dung gi?"
> (User: "5-10, dang dung Trello nhung thieu X")
>
> Message 3: "Tinh nang X cu the la gi ma Trello khong dap ung?"
