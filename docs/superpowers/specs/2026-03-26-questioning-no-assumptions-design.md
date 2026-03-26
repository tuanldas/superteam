# Questioning Skill: No Assumptions & Exploration Phase

> Status: Approved (sau brainstorming + TDD testing)

## Boi canh

User gap van de: AI tu dua options qua som khi chua hieu user muon gi. Vi du: sau 2 cau hoi vague ("tool to help team work better" + "waste time on repetitive tasks"), AI da list "status reporting, code reviews, deployment steps, data entry" — assume team la technical (khong co facts ho tro) va constrain user's thinking.

## Van de goc

SKILL.md cu co rule "Prefer multiple choice when options are known" nhung khong dinh nghia ro "known" nghia la gi. AI rationalize: "I know some common options" = "options are known." Thieu gate giua exploration va narrowing.

## Approach

Surgical update — sua 5 section trong SKILL.md hien tai, khong them section moi, khong doi cau truc file.

## Thay doi cu the

| Section | Thay doi | Ly do |
|---------|----------|-------|
| Core Principle | +2 rules: fact-based only, CONFIRM if uncertain | Ngăn AI assume |
| ASK Rules | +Exploration/Narrowing phases | Gate ro rang: open-ended truoc, options sau khi co facts |
| Multiple Choice Format | +known facts citation, +confidence level | Buoc AI trace options ve facts |
| Anti-Patterns | +2 rows: examples-as-options, assumptions-as-facts | Capture chinh xac rationalizations tu baseline testing |
| Adaptive Questioning | +2 NEVER rules: no assume domain, no guess-based options | Plug loopholes trong adaptive flow |
| Quick Reference | Cap nhat phan anh thay doi | Consistency |
| Deep Questioning Example | +bad example (examples-as-options) va good example voi explanation | Minh hoa cu the van de va cach fix |

## TDD Results

### RED (Baseline — SKILL.md cu)

| Test | Scenario | Ket qua |
|------|----------|---------|
| 1 | First message, zero context | PASS — "What are you building?" |
| 2 | Vague answer "something for my team" | PASS — challenges vagueness |
| 3 | After 2 vague exchanges | FAIL — "Which tasks? e.g., status reporting, code reviews, deployment steps, data entry?" |

### GREEN (Sau thay doi)

| Test | Scenario | Ket qua |
|------|----------|---------|
| 1 | First message, zero context | PASS — "What are you building?" |
| 2 | Vague answer "something for my team" | PASS — challenges vagueness |
| 3 | After 2 vague exchanges | PASS — "Can you walk me through a typical day? What tasks keep coming up?" |

### REFACTOR

| Test | Scenario | Ket qua |
|------|----------|---------|
| 4 | Detection results (React, TS, Docker) + vague answer | PASS — khong dung detection lam co de offer options |

## Khong thay doi

- File structure (van 1 file SKILL.md, khong them reference files)
- PRESENT Rules, CONFIRM Rules (khong lien quan)
- Config Preferences example (da dung narrowing phase dung cach)
- Integration section
- Context Budget section
