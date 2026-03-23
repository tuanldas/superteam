# `/st:tdd` - Test-Driven Development

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

TDD workflow thuần — Red-Green-Refactor cycle. Strict: viết code trước test → xóa, bắt đầu lại. Standalone command + được gọi bởi `/st:debug` và `/st:execute`. 5 testing anti-patterns với gate functions.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Scope | TDD workflow thuần — Red-Green-Refactor cycle | Focused, không bloat |
| Strict level | Strict — viết code trước → xóa, bắt đầu lại. Iron Law tuyệt đối | Proven từ Superpowers, discipline là giá trị cốt lõi |
| Anti-patterns | 5 anti-patterns của Superpowers với gate functions | Proven, đầy đủ |
| Interaction | Standalone + được gọi bởi `/st:debug`, `/st:execute` | Tránh duplicate TDD logic |
| Image input | Có — screenshot UI → viết test expected behavior | Hữu ích cho UI behavior tests |

## Flow

```
1. Input
   - User mô tả feature/bugfix: "/st:tdd thêm validate email"
   - Hoặc không argument → hỏi "Implement gì?"
   - Hoặc được gọi từ /st:debug (viết failing test)
     hoặc /st:execute (FINE granularity)
   - Image input: screenshot UI mong muốn → extract expected behavior
    ↓
2. Check context
   - Test framework tồn tại?
     → Có: detect framework (jest, vitest, pytest, phpunit...)
       + đọc conventions (naming, imports, assertion style)
     → Không: "Chưa có test framework. Cần setup trước.
       Dùng test framework nào?" → user chọn → setup nhanh
    ↓
3. Red-Green-Refactor Cycle

   ┌─────────────────────────────────────────────┐
   │ IRON LAW: NO PRODUCTION CODE WITHOUT A      │
   │ FAILING TEST FIRST                           │
   │                                              │
   │ Viết code trước test? XÓA. Bắt đầu lại.   │
   │ Không giữ làm reference. Không "adapt".     │
   │ Delete means delete.                         │
   └─────────────────────────────────────────────┘

   a. RED — Viết failing test
      - 1 test, 1 behavior
      - Tên rõ ràng mô tả behavior
      - Dùng real code, không mock (trừ khi unavoidable)
      - "and" trong tên test? → Split thành 2 tests
       ↓
   b. VERIFY RED — Chạy test, xác nhận FAIL
      - MANDATORY, không skip
      - Test phải fail (không phải error)
      - Fail vì feature chưa có (không phải typo)
      - Test pass ngay? → Test sai, sửa test
       ↓
   c. GREEN — Viết code TỐI THIỂU để pass
      - Simplest code to pass
      - Không thêm features
      - Không refactor code khác
      - Không "improve" beyond test
       ↓
   d. VERIFY GREEN — Chạy test, xác nhận PASS
      - MANDATORY
      - Test mới pass
      - Tests cũ vẫn pass
      - Output clean (no errors, no warnings)
      - Test fail? → Sửa code, KHÔNG sửa test
       ↓
   e. REFACTOR — Clean up
      - Chỉ sau khi green
      - Remove duplication
      - Improve names
      - Extract helpers
      - Giữ tests green
      - KHÔNG thêm behavior
       ↓
   f. REPEAT — Test tiếp cho behavior tiếp theo
      - Quay lại RED
      - Cho đến khi feature/bugfix hoàn chỉnh

   Anti-shortcut (active suốt quá trình):

   Red Flags — STOP và bắt đầu lại:
   - Code trước test
   - Test sau implementation
   - Test pass ngay lập tức
   - Không giải thích được tại sao test fail
   - "Tôi sẽ viết test sau"
   - "Chỉ lần này thôi"
   - "Đã manual test rồi"
   - "Giữ code làm reference"
   - "Xóa X tiếng code lãng phí quá"
   - "TDD dogmatic, tôi pragmatic"

   Rationalizations table:
   ┌────────────────────────────┬──────────────────────────────┐
   │ Lý do                     │ Thực tế                      │
   ├────────────────────────────┼──────────────────────────────┤
   │ "Quá đơn giản để test"    │ Code đơn giản vẫn break.     │
   │                            │ Test mất 30 giây.            │
   │ "Test sau cũng được"      │ Test pass ngay = prove nothing│
   │ "Đã manual test"          │ Ad-hoc ≠ systematic.         │
   │                            │ Không re-run được.           │
   │ "Xóa X tiếng lãng phí"   │ Sunk cost fallacy.           │
   │                            │ Giữ unverified code = debt.  │
   │ "Giữ làm reference"      │ Sẽ adapt nó. Đó là test-after│
   │ "Explore trước"           │ OK. Xong thì xóa, TDD lại.  │
   │ "Test khó = design unclear"│ Đúng. Khó test = khó dùng.  │
   │ "TDD chậm"               │ TDD nhanh hơn debug.         │
   │ "Manual test nhanh hơn"   │ Manual không prove edge cases│
   │ "Code cũ không có test"   │ Đang improve. Thêm test.     │
   └────────────────────────────┴──────────────────────────────┘
    ↓
4. Testing Anti-Patterns (gate functions)

   Anti-pattern 1: Testing mock behavior
   → Gate: "Am I testing real behavior or mock existence?"
   → Asserting on mock element? DELETE assertion, test real component

   Anti-pattern 2: Test-only methods in production
   → Gate: "Is this method only used by tests?"
   → Yes? Move to test utilities, NOT production class

   Anti-pattern 3: Mocking without understanding
   → Gate: "What side effects does real method have?
            Does this test depend on them?"
   → Understand dependencies first, mock minimally

   Anti-pattern 4: Incomplete mocks
   → Gate: "Does mock mirror real API completely?"
   → Mock COMPLETE data structure, not just fields you know

   Anti-pattern 5: Integration tests as afterthought
   → Gate: "Am I claiming complete without tests?"
   → Tests are part of implementation, not follow-up
    ↓
5. Verification checklist
   - [ ] Every new function/method has a test
   - [ ] Watched each test fail before implementing
   - [ ] Each test failed for expected reason
   - [ ] Wrote minimal code to pass each test
   - [ ] All tests pass
   - [ ] Output clean (no errors, warnings)
   - [ ] Tests use real code (mocks only if unavoidable)
   - [ ] Edge cases and errors covered
   - Không check hết? → Skipped TDD. Bắt đầu lại.
    ↓
6. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► TDD COMPLETE ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tests: [N] written, all passing
   Coverage: [functions/methods tested]
   Commit: "feat/fix: [description]"
```

## Interaction với commands khác

```
/st:execute (FINE granularity):
  → Mỗi task chạy Red-Green-Refactor cycle từ /st:tdd
  → Reference: "TDD cycle — xem /st:tdd workflow"

/st:debug Phase 4 (Implementation):
  → "Viết failing test reproduce bug" = RED step từ /st:tdd
  → Tiếp tục GREEN → REFACTOR

/st:debug-quick Phase 4:
  → Tương tự, reference /st:tdd cho failing test step
```

## So sánh

| | Superpowers | GSD | gstack | Superteam |
|---|---|---|---|---|
| TDD skill riêng | Có | Không | Không | Có |
| Strict level | Rất strict | N/A | N/A | Rất strict |
| Anti-patterns | 5 + gate functions | Không | Không | 5 + gate functions |
| Rationalizations | 11 mục | Không | Không | 11 mục |
| Image input | Không | Không | Không | Có |
| Interaction | Standalone | Inline trong plan | Inline trong qa | Standalone + debug/execute |
| Test framework setup | Không | Không | Có (trong qa) | Detect + quick setup |

## Cải thiện so với industry

1. **Standalone + integrated** → user gọi trực tiếp hoặc tự động trong execute/debug
2. **Image input** → screenshot UI → viết test expected behavior
3. **Test framework detection** → detect + quick setup nếu chưa có
4. **Anti-patterns với gate functions** → checkpoint trước mỗi mock/assertion
