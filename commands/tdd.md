---
description: "TDD workflow: strict Red-Green-Refactor cycle with anti-pattern gates"
argument-hint: "[feature or bugfix description]"
---

# Test-Driven Development

Strict Red-Green-Refactor cycle. No production code without a failing test first. Write code before test? Delete it, start over.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Feature/bugfix description from arguments. If empty, ask: "What to implement?"
   - May be invoked standalone or called by `/st:debug`, `/st:execute` (FINE granularity)
   - Accept image input (screenshot UI expected behavior)

2. **Check test context**
   - Test framework exists?
     - Yes: detect framework (jest, vitest, pytest, phpunit, etc.) + read conventions (naming, imports, assertion style)
     - No: ask "No test framework found. Which framework?" then quick-setup

3. **Red-Green-Refactor cycle**

   Repeat until feature/bugfix is complete:

   a. **RED** -- Write one failing test
      - 1 test, 1 behavior
      - Clear name describing the behavior
      - Use real code, not mocks (unless unavoidable)
      - "and" in test name? Split into 2 tests

   b. **VERIFY RED** -- Run test, confirm it FAILS
      - MANDATORY, never skip
      - Must fail (not error) because the feature is missing (not a typo)
      - Test passes immediately? Test is wrong -- fix the test

   c. **GREEN** -- Write MINIMAL code to pass
      - Simplest code that passes
      - No extra features, no refactoring, no improvements beyond the test

   d. **VERIFY GREEN** -- Run test, confirm it PASSES
      - MANDATORY
      - New test passes + all existing tests pass
      - Clean output (no errors, no warnings)
      - Test fails? Fix the code, NOT the test

   e. **REFACTOR** -- Clean up (only after green)
      - Remove duplication, improve names, extract helpers
      - Keep all tests green
      - Do NOT add new behavior

   f. **REPEAT** -- Next behavior, back to RED

4. **Anti-pattern gates** (active throughout)

   Before every mock/assertion, check these gates:

   | Anti-pattern | Gate question | Action |
   |---|---|---|
   | Testing mock behavior | "Am I testing real behavior or mock existence?" | Delete assertion, test real component |
   | Test-only methods in production | "Is this method only used by tests?" | Move to test utilities, not production |
   | Mocking without understanding | "What side effects does the real method have?" | Understand first, mock minimally |
   | Incomplete mocks | "Does mock mirror real API completely?" | Mock complete data structure |
   | Integration tests as afterthought | "Am I claiming complete without tests?" | Tests are part of implementation |

5. **Verification checklist**
   - [ ] Every new function/method has a test
   - [ ] Watched each test fail before implementing
   - [ ] Each test failed for the expected reason
   - [ ] Wrote minimal code to pass each test
   - [ ] All tests pass
   - [ ] Clean output (no errors, no warnings)
   - [ ] Tests use real code (mocks only if unavoidable)
   - [ ] Edge cases and errors covered
   - Any item unchecked? You skipped TDD. Start over.

6. **Done**
   - Follow `superteam:atomic-commits` for the commit
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > TDD COMPLETE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tests: [N] written, all passing
   Coverage: [functions/methods tested]
   Commit: "feat/fix: [description]"
   ```

## Iron Law

```
┌─────────────────────────────────────────────┐
│ NO PRODUCTION CODE WITHOUT A FAILING TEST   │
│ FIRST.                                      │
│                                             │
│ Wrote code before the test? DELETE it.      │
│ Start over. No keeping as reference.        │
│ No "adapting". Delete means delete.         │
└─────────────────────────────────────────────┘
```

## Rules

- Follow `superteam:tdd-discipline` strictly.
- One test, one behavior. Never test two things at once.
- VERIFY RED and VERIFY GREEN are mandatory steps. Never skip running tests.
- Fix failing GREEN by changing code, NEVER by changing the test.
- Refactor only after green. Never add behavior during refactor.
- Mocks are a last resort. Prefer real code.
- If invoked by `/st:debug`: start at RED with a failing test that reproduces the bug, then GREEN, REFACTOR.
- If invoked by `/st:execute` (FINE granularity): run full Red-Green-Refactor per task.
- Follow `superteam:core-principles` for all work.

## Rationalizations to reject

| Excuse | Reality |
|---|---|
| "Too simple to test" | Simple code still breaks. Test takes 30 seconds. |
| "I'll test later" | Test passes immediately = proves nothing. |
| "Already manual tested" | Ad-hoc is not systematic. Cannot re-run. |
| "Deleting X hours of work is wasteful" | Sunk cost fallacy. Unverified code = debt. |
| "Keep as reference" | You will adapt it. That is test-after. |
| "Explore first" | OK. When done, delete everything, TDD from scratch. |
| "Hard to test = unclear design" | Correct. Hard to test = hard to use. |
| "TDD is slow" | TDD is faster than debugging. |
| "Manual test is faster" | Manual does not prove edge cases. |
| "Old code has no tests" | You are improving. Add tests now. |
