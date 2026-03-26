# Scope Summary: Informed Scope Decisions in Init Flow

> Status: Approved (sau brainstorming)

## Boi canh

User feedback: step 7 (Define requirements) yeu cau user scope v1/v2/out nhung khong cung cap du thong tin de quyet dinh. Step 3 checkpoint chi hoi "v1 does what, does NOT do what" — thieu tong quan features, dependencies, effort, assumptions, success criteria.

Gap: giua step 3 (deep questioning) va step 7 (define requirements) khong co buoc nao tong hop toan bo picture cho user truoc khi hoi scope decisions.

## Quyet dinh thiet ke

| Quyet dinh | Ket qua | Ly do |
|---|---|---|
| Vi tri | Step 3 checkpoint (full) + step 7 (diff) | Step 3 co du context tu questioning; step 7 refine voi research data |
| Format | 10 sections (xem ben duoi) | Research chi ra 3 psychological gaps: consequence clarity, test of done, scenario grounding |
| AI role | Recommend + user adjust | "User as editor" hieu qua hon "user as author" |
| Step 7 | Chi hien thi diff | User da thay full picture o step 3, lap lai gay nhieu |
| Confidence | Med/Low (step 3), High/Med (step 7) | Step 3 chua co research; step 7 co them technical analysis |

## Scope Summary Format (10 sections)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SCOPE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

══ WHAT WE KNOW ══

WHO: [target users, usage context]
WHAT: [core problem / pain point]
EXIST: [what exists, technical constraints]
DONE: [success criteria]
CONSTRAINTS: [timeline, team size, etc.]

══ PROJECT OVERVIEW ══

[Narrative: 2-3 cau mo ta du an, van de, muc tieu]

MANG CHUC NANG         MO TA                              DO LON
─────────────────────────────────────────────────────────────────
[Mang A]                [Mo ta]                             [S/M/L/XL]
[Mang B]                [Mo ta]                             [S/M/L/XL]
─────────────────────────────────────────────────────────────────
                                               Total:     ~[size]

USERS        VAI TRO
─────────────────────────────────────────
[User A]     [Vai tro]
[User B]     [Vai tro]

══ CORE USER JOURNEY ══

[End-to-end flow: A → B → C → D]

Minimum complete path: [neu thieu bat ky buoc nao, user khong
hoan thanh flow co ban]

══ FEATURE MAP ══

  [Feature A]
    └─► [Feature B]
          ├─► [Feature C]
          │     ├─► [Feature D]
          │     └─► [Feature E]
          └─► [Feature F]

  [Feature X] ← cat ngang tat ca features
  [Feature Y] ← independent scope

══ EFFORT + TINH CHAT ══

  Feature              Effort   Tinh chat
  ─────────────────────────────────────────
  [Feature A]           [S]     Foundational
  [Feature B]           [M]     Additive
  ...

  Foundational = phai co tu dau, them sau ton gap doi effort
  Additive = bolt on bat ky luc nao, khong anh huong kien truc

══ RISKIEST ASSUMPTIONS ══

  | Feature          | Assumption                    | Status        |
  |------------------|-------------------------------|---------------|
  | [Feature A]      | [Gia dinh]                    | ✅ Validated   |
  | [Feature B]      | [Gia dinh]                    | ⚠️ Unvalidated |
  | [Feature C]      | [Gia dinh]                    | ❌ Unknown     |

  → v1 MUST validate cac ⚠️. Features dua tren ❌ thuoc v2+.
  → [Riskiest bet]: [mo ta]

══ SCOPE RECOMMENDATION ══

  Confidence: Med/Low

  MUST (v1 khong hoat dong neu thieu):
    ├─ [Feature] — [ly do must] [effort]
    └─ [Feature] — [depends on: X] [effort]

  SHOULD (v1 yeu neu thieu):
    └─ [Feature] — [value] [effort]

  COULD (nice-to-have):
    └─ [Feature] — [value] [effort]

══ V1 SUCCESS SIGNAL ══

  "[Mo ta hanh vi user observable khi v1 thanh cong]"

  ↳ Dieu nay cho biet: [insight]
  ↳ Khong can: [gi khong can de test dieu nay]
  ↳ Neu khong xay ra: van de la value, khong phai thieu features.

  Gut-check: moi Must-Have co trace ve moment nay khong?

══ WHAT V1 DELIBERATELY IGNORES ══

  ❌ [Feature X]
     Why OK:  [ly do an toan khi bo]
     Risk neu them: [rui ro neu co nhet vao v1]
     Khi nao them: [trigger cu the]

  ❌ [Feature Y]
     Why OK:  [ly do]
     Risk neu them: [rui ro]
     Khi nao them: [trigger]

══ TRADEOFFS ══

  1. [Feature A] [effort] — [mo ta tradeoff va recommendation]
  2. [Feature B] vs [Feature C] — [so sanh va recommendation]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Adjust scope nao truoc khi tiep tuc?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Thay doi Step 3

### Hien tai

Checkpoint sau 15 exchanges (hoac >= 4/5 areas covered):
- Present summary: WHO, WHAT, SCOPE, EXIST, DONE
- Hoi: "Is this correct and complete?"

### Sau thay doi

Checkpoint sau 15 exchanges (hoac >= 4/5 areas covered):
1. Present SCOPE SUMMARY (full format 10 sections)
   - AI tong hop tu tat ca answers + detection results
   - Recommend scope v1 voi reasoning
   - Confidence: Med/Low
2. User adjust:
   - Move features giua Must/Should/Could/Won't
   - Challenge assumptions
   - Adjust success signal
3. User approve → scope decisions luu vao PROJECT.md
   - Ghi ro: "Preliminary scope — se refine sau research"
4. User noi more/fix → quay lai questioning round

## Thay doi Step 7

### Hien tai

- Categorize features: table stakes vs differentiators
- User scopes: v1 / v2 / out of scope per category
- Generate REQUIREMENTS.md

### Sau thay doi

1. Load context moi: research findings + DESIGN-SYSTEM.md + PROJECT.md (co scope tu step 3)
2. Present SCOPE DIFF — chi hien thi thay doi so voi step 3:
   - Features thay doi tier (vd: "Comment: SHOULD → MUST vi research cho thay...")
   - Assumptions cap nhat status (vd: "⚠️ → ✅ research confirmed")
   - Risks moi tu research
   - Effort dieu chinh (vd: "Real-time sync: [L] → [XL] vi tech stack X")
   - Success signal refine neu can
   - Confidence: High/Med
3. User confirm/adjust → finalize REQUIREMENTS.md
   - Moi feature trong Must/Should tro thanh REQ-ID
   - Could/Won't ghi ro trong REQUIREMENTS.md section "Deferred"

## Khong thay doi

- Step 1-2 (Config, Setup + Auto-detect)
- Step 4 (Write PROJECT.md) — chi them scope data tu step 3
- Step 5 (Research)
- Step 6 (Design System)
- Step 8-10 (Roadmap, Spec review, Done)
- Format cua REQUIREMENTS.md (van dung REQ-IDs)
- Cac skills khac (questioning, research-methodology, etc.)

## Files can thay doi

1. **`commands/init.md`** — Sua step 3 checkpoint flow va step 7 flow
2. **`docs/specs/commands/st-init.md`** — Cap nhat spec tuong ung
