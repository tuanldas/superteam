# `/st:review-feedback` - Xử Lý Feedback Từ Bên Ngoài

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Khi nhận feedback review từ bên ngoài (reviewer người, CI tool, PR comment), AI phân tích và verify từng item trước khi implement. Tránh blind-follow feedback sai.

## Flow

```
1. Input
   - User paste text feedback
   - Hoặc PR link (`/st:review-feedback #123`)
   - Hoặc screenshot review comments
   - Image input: accept ảnh
    ↓
2. Parse feedback
   - Tách thành từng item riêng biệt
   - Identify: file, line, nội dung feedback
    ↓
3. Verify từng item (parallel)
   - Grep codebase: issue có thực sự tồn tại?
   - Check context: feedback có đúng trong context này?
   - Evaluate: implement sẽ improve hay degrade code?
   - Kết quả per item:
     ✅ Valid → recommend implement
     ⚠️ Partial → implement nhưng cách khác
     ❌ Invalid → skip, giải thích lý do
     ❓ Unclear → cần clarify với reviewer
    ↓
4. Trình bày đánh giá
   ┌──────────────────────────────────────────┐
   │ FEEDBACK ANALYSIS                        │
   ├──────────────────────────────────────────┤
   │ ✅ Valid:    [N] items → recommend fix    │
   │ ⚠️ Partial: [N] items → fix khác cách   │
   │ ❌ Invalid:  [N] items → skip            │
   │ ❓ Unclear:  [N] items → cần clarify     │
   ├──────────────────────────────────────────┤
   │ [Chi tiết từng item + lý do đánh giá]    │
   └──────────────────────────────────────────┘
    ↓
5. User approve
   - Chọn items muốn fix
   - Override AI assessment nếu cần
    ↓
6. Fix approved items
   - Spawn agents/parallel
   - Chạy tests
   - Commit: "fix: address review feedback"
    ↓
7. Generate reply (optional)
   - "Muốn generate reply cho reviewer?"
   - AI draft response:
     - Items đã fix
     - Items skip + lý do
     - Items cần discuss thêm
```
