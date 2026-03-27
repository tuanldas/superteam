# Command Design Process

Quy trình thiết kế flow cho mỗi command trong Superteam.

## Quy trình

Mỗi command (27 commands) đều đi qua các bước sau:

### 1. Research (dùng brainstorming skill)
- Best practices cho domain của command
- Xem GSD + Superpowers đang làm thế nào (đọc workflow files)
- Tham khảo tools/workflows nổi tiếng trong industry
- Image input support (nếu phù hợp)

### 2. Đề xuất flow + hỏi user
- Đưa ra draft flow dựa trên research
- Hỏi thêm thông tin từ user nếu cần
- **Tuân thủ `superteam:core-principles`** questioning rules cho mọi tương tác với user:
  - MỘT câu hỏi mỗi tin nhắn, thích ứng theo câu trả lời trước
  - Phân biệt ASK (1 câu/msg) vs PRESENT (batch OK) vs CONFIRM (1 câu/msg)
- Khi hỏi multiple choice: AI phải có **khuyến nghị** (recommend option nào), **lý do** tại sao chọn option đó, và **tại sao không** chọn các options còn lại
- Giải thích cách các bên tham khảo (GSD, Superpowers, gstack...) đang làm khi relevant
- Khi có thuật ngữ đặc biệt: giải thích ý nghĩa + ví dụ cụ thể dễ hiểu
- **Mỗi command mới phải có** `Follow superteam:core-principles` trong Rules section (đã bao gồm questioning rules)

### 3. So sánh với GSD/Superpowers
- Khác gì, tốt hơn ở đâu, thiếu gì

### 4. Xác nhận với user
- Chốt flow cuối cùng
- Cập nhật design doc (docs/specs/2026-03-19-superteam-design.md)

## Danh sách commands (27)

### Cần thiết kế lại (8 - đã có draft nhưng chưa qua research)
1. `/st:init`
2. `/st:readme`
3. `/st:api-docs`
4. `/st:ui-design`
5. `/st:code-review`
6. `/st:plan`
7. `/st:execute`
8. `/st:debug`

### Chưa thiết kế (19)
9. `/st:tdd`
10. `/st:quick`
11. `/st:pause`
12. `/st:resume`
13. `/st:brainstorm`
14. `/st:worktree`
15. `/st:phase-add`
16. `/st:phase-remove`
17. `/st:phase-insert`
18. `/st:phase-list`
19. `/st:phase-discuss`
20. `/st:phase-research`
21. `/st:phase-plan`
22. `/st:phase-execute`
23. `/st:phase-validate`
24. `/st:milestone-new`
25. `/st:milestone-audit`
26. `/st:milestone-complete`
27. `/st:milestone-archive`

## Tiến độ

| # | Command | Trạng thái |
|---|---|---|
| 1 | `/st:init` | ✅ Approved |
| 2 | `/st:readme` | ✅ Approved |
| 3 | `/st:api-docs` + `/st:api-docs-config` | ✅ Approved |
| 4 | `/st:ui-design` | ✅ Approved |
| 4.1 | `/st:design-system` | ✅ Approved |
| 5 | `/st:code-review` + `/st:review-feedback` | ✅ Approved |
| 6 | `/st:plan` | ✅ Approved |
| 7 | `/st:execute` | ✅ Approved |
| 8 | `/st:debug` | ✅ Approved |
| 8.1 | `/st:debug-quick` | ✅ Approved |
| 9 | `/st:tdd` | ✅ Approved |
| 10 | `/st:quick` | ✅ Approved |
| 11 | `/st:pause` | ✅ Approved |
| 12 | `/st:resume` | ✅ Approved |
| 13 | `/st:brainstorm` | ✅ Approved |
| 14 | `/st:worktree` | ✅ Approved |
| 15 | `/st:phase-add` | ✅ Approved |
| 16 | `/st:phase-remove` | ✅ Approved |
| 17 | `/st:phase-insert` | ✅ Merged vào phase-add |
| 18 | `/st:phase-list` | ✅ Approved |
| 19 | `/st:phase-discuss` | ✅ Approved |
| 20 | `/st:phase-research` | ✅ Approved |
| 21 | `/st:phase-plan` | ✅ Approved |
| 22 | `/st:phase-execute` | ✅ Approved |
| 23 | `/st:phase-validate` | ✅ Approved |
| 24 | `/st:milestone-new` | ✅ Approved |
| 25 | `/st:milestone-audit` | ✅ Approved |
| 26 | `/st:milestone-complete` | ✅ Approved |
| 27 | `/st:milestone-archive` | ✅ Approved |
