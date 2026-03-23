# Skill Spec: tdd-discipline

> Status: DRAFT v2 | Created: 2026-03-23 | Revised: 2026-03-23 (user review)

---

## Frontmatter

```yaml
---
name: tdd-discipline
description: >
  Use when implementing any feature or bugfix that has testable behavior.
  Enforces Red-Green-Refactor with mandatory verification gates,
  prevents code-before-test shortcuts, and catches testing anti-patterns.
---
```

---

## SKILL.md Content

````markdown
---
name: tdd-discipline
description: >
  Use when implementing any feature or bugfix that has testable behavior.
  Enforces Red-Green-Refactor with mandatory verification gates,
  prevents code-before-test shortcuts, and catches testing anti-patterns.
---

# TDD Discipline

## Overview

TDD Discipline enforces the Red-Green-Refactor cycle as a design methodology, not just a testing practice. Writing tests first forces you to think about behavior before implementation, producing better-designed, more maintainable code.

**Two responsibilities:**
1. **Methodology** — Red-Green-Refactor with mandatory verification gates between steps.
2. **Discipline** — anti-shortcut rules that resist Claude's default "implement first, test later" behavior.

## Core Principle

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.

If you wrote code before the test — DELETE IT.
Not "keep as reference." Not "adapt it." Not "look at it while writing the test."
DELETE. Start fresh with the test.

If you didn't watch the test fail, you don't know if it tests the right thing.
```

This is non-negotiable. No time pressure, no "trivial" change, no "obvious" implementation overrides this.

## When to Use TDD

**Use TDD for:**
- Business logic with defined input/output
- API endpoints with contracts
- Data transformations and validation rules
- Algorithms and state machines
- Utility functions with clear behavior
- Bug fixes (write test that reproduces the bug first)

**Skip TDD for:**
- UI layout and styling (visual, not behavioral)
- Config file changes
- Glue code (wiring modules together, no logic)
- One-off scripts
- Simple CRUD with no business logic
- Exploratory prototyping (throw away after)

**The heuristic:** Can you write `expect(fn(input)).toBe(output)` before writing `fn`? If yes → TDD. If the expected behavior is unclear or purely visual → skip.

**When in doubt → use TDD.** The cost of unnecessary TDD is low (extra test). The cost of skipping TDD is high (untested behavior, bugs, poor design).

## Test Framework Detection

Use `superteam:project-awareness` context block to determine test framework:

| Project Framework | Expected Test Framework | Config File |
|---|---|---|
| React/Vue/Svelte (Vite) | vitest | vite.config.* |
| React (CRA/Next) | jest | jest.config.* or package.json jest field |
| Angular | jasmine/karma or jest | angular.json |
| Express/Fastify/NestJS | jest or vitest | same as above |
| Django | pytest or unittest | pytest.ini, setup.cfg, pyproject.toml |
| Laravel | phpunit | phpunit.xml |
| Go | go test (built-in) | *_test.go convention |
| Rust | cargo test (built-in) | #[cfg(test)] convention |

If no test framework detected: ask user before proceeding. Do not guess.

## Red-Green-Refactor Cycle

```
ONE behavior at a time:

  RED:    Write ONE failing test
  VERIFY: Run it. Watch it FAIL.
    ↓
  GREEN:  Write MINIMAL code to pass
  VERIFY: Run it. Watch it PASS. All other tests still pass.
    ↓
  REFACTOR: Clean up. No new behavior.
  VERIFY: Run all tests. Still pass.
    ↓
  REPEAT: Next behavior.
```

### RED — Write One Failing Test

Write a test for ONE behavior. Not all behaviors. Not all edge cases. ONE.

**Good test:**
- Clear name describing behavior: `rejects_empty_email`, `returns_403_for_unauthorized_user`
- Tests observable behavior (public API, return value, side effect)
- Uses real code, not mocks (unless external dependency)
- Fails because the feature is MISSING, not because of a syntax error

**Bad test:**
- Vague name: `test1`, `testEmailValidation`, `it_works`
- Tests implementation details (internal method calls, private state)
- Mocks everything (you're testing your mocks, not your code)
- Tests multiple behaviors in one test (use "and" in name = split the test)

### VERIFY RED — MANDATORY

```
STOP. Run the test. Watch it fail.

This is the step Claude skips most often.
If you skip this, the entire TDD cycle is compromised.
```

Before proceeding to GREEN, confirm ALL of these:
1. Test actually ran (not skipped, not ignored)
2. Test failed (not errored — failure ≠ error)
3. Failure message describes the missing behavior
4. Test fails because the feature is MISSING, not because of bad test code

**Failure vs Error:**
- **Failure:** Test ran, assertion didn't match. `Expected 5, got undefined.` → GOOD. Feature is missing.
- **Error:** Test couldn't run. `ReferenceError: validateEmail is not defined.` → BAD. Fix the test setup (import, path, etc.) before proceeding.

A test that errors is NOT a valid RED. Fix the error first, then confirm it fails for the right reason.

**If the test passes immediately:** Something is wrong. Either:
- The behavior already exists (check — then write a different test)
- The test doesn't test what you think (review assertion)
- The test is trivially true (always passes regardless)

DO NOT proceed to GREEN with a passing test. That is not TDD.

### GREEN — Write Minimal Code

Write the SIMPLEST code that makes the test pass. Nothing more.

**Rules:**
- Solve ONLY the failing test. No other behavior.
- No configuration options. No extensibility. No "what if."
- If tempted to add something the test doesn't require: STOP. That's a YAGNI violation. Write a test for it first.
- Hardcoding is acceptable if it passes the test. The next test will force generalization.

### VERIFY GREEN — MANDATORY

Run the test suite. Confirm:
1. The new test passes
2. All existing tests still pass (no regressions)
3. Output is clean (no warnings, no deprecation notices you introduced)

**If the new test still fails:** Debug the implementation. Do not add more code "just in case." Understand WHY it fails — use `superteam:scientific-debugging` methodology if the cause is not immediately clear.

**If existing tests break:** Your implementation has side effects. Fix the implementation to not break other tests, or split the change.

### REFACTOR — Clean Up

Only after GREEN. Never add new behavior during refactor.

**REFACTOR is a QUESTION, not always an ACTION.**
After GREEN, ask: "Is there duplication, unclear naming, or structural debt?"
- Yes → refactor, then VERIFY.
- No → proceed to next RED. Skipping refactor when code is clean is NOT a violation.
- "I'll refactor later" → This IS a violation. Ask NOW, not later.

**Allowed:** Remove duplication, improve names, extract helpers, simplify logic, restructure code.
**Not allowed:** Add features, handle new edge cases, change behavior.

Run all tests after refactoring. If any fail, undo the refactor — the refactor introduced a regression.

### Commit After Cycle

After each complete RED-GREEN-REFACTOR cycle:
- `test: [describe behavior tested]` — if test-only commit is appropriate
- `feat: [describe feature]` or `fix: [describe bugfix]` — for test + implementation together
- `refactor: [describe cleanup]` — if refactor is substantial enough for separate commit

Typical cycle produces 1-2 commits. Each must be independently revertable.

## Verification Gates

Gates that MUST be checked before proceeding. These exist because Claude systematically skips them.

### Gate: Before Writing Production Code
```
□ Did I write a test first?
□ Did I run it and watch it FAIL?
□ Is the failure because the feature is MISSING (not a syntax error)?
```
If any answer is NO → stop and fix before writing production code.

### Gate: Before Declaring Test Passes
```
□ Did I actually run the test suite?
□ Did ALL tests pass (not just the new one)?
□ Is the output clean?
```

### Gate: Before Using a Mock
```
□ Is this an external dependency I cannot control? (DB, API, filesystem)
□ Do I understand the real behavior I'm mocking?
□ Am I testing MY code's behavior, not the mock's?
□ Could I use a real instance instead? (in-memory DB, test server)
```
If using mocks extensively, see `testing-anti-patterns.md`.

### Gate: Before Declaring Done
```
□ Every behavior has a test
□ Every test was RED before GREEN
□ No production code exists without a corresponding test
□ Tests describe behavior, not implementation
□ Refactoring complete
□ All tests pass
□ Commit(s) created
```

## Anti-Shortcut System

### Red Flags — STOP

These thoughts mean you are about to violate TDD:

| Thought | What to do instead |
|---------|-------------------|
| "Let me implement this first, then add tests" | DELETE. Write test first. |
| "The test is obvious, I'll add it after" | If it's obvious, writing it first takes 30 seconds. Do it. |
| "This test passes immediately" | Something is wrong. Investigate before proceeding. |
| "I can't explain why the test fails" | You don't understand the behavior. Investigate before implementing. |
| "I'll write tests later" | You won't. And tests-after prove nothing. |
| "Just this once, I'll skip the test" | "Just this once" is how every bad habit starts. |
| "I already tested this manually" | Manual testing is ad-hoc, non-repeatable, and leaves no record. |
| "Let me keep this code as reference" | Keeping code = not deleting. Delete means delete. |
| "Deleting X minutes of work is wasteful" | Sunk cost. The test will guide you to write it better. |
| "TDD is too dogmatic for this situation" | TDD IS pragmatic. Dogmatic is "no tests" or "tests after." |
| "This is different because..." | No, it isn't. Write the test first. |
| "Let me write all the tests first, then implement" | Batch-writing defeats incremental design. ONE test, ONE implementation, repeat. |
| "The implementation is trivial, test would be overkill" | If it's trivial, the test is also trivial. Write it. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Tests after achieve the same coverage" | Tests-after answer "what does this code do?" Tests-first answer "what SHOULD it do?" Different questions, different quality. |
| "I'll write tests after to save time" | Tests-after take MORE time: you must reverse-engineer the behavior you just implemented. |
| "Already tested manually, it works" | Manual tests are non-repeatable, undocumented, and can't catch regressions. |
| "This change is too small for TDD" | Small changes are WHERE bugs hide. And small tests take seconds to write. |
| "Mocking is too complex for this" | If mocking is complex, the code is too coupled. TDD is telling you something. |
| "The framework doesn't support easy testing" | Framework limitation ≠ skip testing. Find the testing pattern for your framework. |
| "I know this works because I've done it before" | Different codebase, different context, different dependencies. Prove it. |
| "Test infrastructure isn't set up yet" | Set it up. It's a one-time cost. Use `/st:tdd` to auto-detect and configure. |
| "The client needs this urgently" | Urgent = must work first time. TDD delivers first-time quality. |
| "Tests slow down development" | Tests slow down the first 10 minutes. They save hours of debugging later. |
| "I'll just verify it works in the browser" | Browser testing doesn't prevent regressions. Automated tests do. |

### Why Order Matters

**"I'll write tests after"** — Tests that pass immediately prove nothing. You didn't see them fail, so you don't know they test the right thing. They're assertions about what the code DOES, not what it SHOULD DO.

**"Already manually tested"** — Manual testing is ad-hoc and non-repeatable. It has no record, can't be re-run, and doesn't catch regressions. It proves "worked once" not "works."

**"Deleting code is wasteful"** — Sunk cost fallacy. Code written before the test is biased by implementation assumptions. The test will guide you to write it differently — often better. The 5 minutes you "waste" deleting saves 30 minutes of debugging wrong assumptions.

**"TDD is dogmatic"** — TDD is the MOST pragmatic approach. It produces working code with verified behavior in the shortest total time. "Move fast and break things" is dogmatic. TDD is empirical.

**"It's about the spirit, not the ritual"** — The ritual IS the spirit. Writing the test first forces you to think about behavior. The act of watching it fail confirms it tests the right thing. Skip the ritual and you skip the thinking.

## Good Tests Standards

Tests should be:

| Quality | Meaning | Anti-pattern |
|---------|---------|-------------|
| **Behavioral** | Test what the code DOES, not HOW it does it | Asserting on internal method calls, private state |
| **Focused** | One concept per test | "and" in test name → split into two tests |
| **Named clearly** | Name describes the behavior | `test1`, `testHelper`, `it_works` |
| **Independent** | No test depends on another test's state | Shared mutable state between tests |
| **Deterministic** | Same input = same result, every time | Tests depending on time, random, network |

## When Stuck

| Problem | Solution |
|---------|---------|
| Don't know how to test this | Write the test as you WISH the API worked. The test defines the design. |
| Test is too complicated | The code under test is too complicated. Simplify the design first. |
| Must mock everything | Code is too coupled. Inject dependencies. Use interfaces. |
| Test setup is huge | Extract test helpers. Create factories. Share fixtures. |
| Can't isolate the unit | The unit has too many responsibilities. Split it. |

## Working with Untested Code

When adding features to code without existing tests:

1. **Do NOT write tests for all existing code first.** That's a separate task.
2. **Write test for YOUR new behavior only.** TDD applies to what you're adding.
3. **If your code depends on untested code:** write a thin integration test that covers the interaction path.
4. **If existing code breaks your test:** investigate (use `superteam:scientific-debugging`), don't blindly refactor existing code.

When fixing bugs in untested code:
1. Write test that reproduces the bug (RED).
2. Fix the bug (GREEN).
3. Add 1-2 tests for closely related behavior that's clearly untested (REFACTOR/bonus).
4. Do NOT attempt to reach 100% coverage in one session.

## Quick Reference

```
IRON LAW:
  NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.
  Code before test → DELETE. No exceptions.

CYCLE:
  RED:      Write ONE test for ONE behavior
  VERIFY:   Run it. Must FAIL. (Claude skips this most)
  GREEN:    Write MINIMAL code to pass
  VERIFY:   Run it. Must PASS. All tests pass.
  REFACTOR: Clean up. No new behavior.
  VERIFY:   Run all tests. Still pass.
  COMMIT:   test/feat/fix/refactor as appropriate
  REPEAT:   Next behavior.

GATES:
  Before production code: test written + verified RED
  Before declaring pass: actually ran suite
  Before mock: 4 gate questions (see Gates section)
  Before done: 7-item checklist

WHEN TO TDD:
  Can write expect(fn(input)).toBe(output)? → YES
  Visual/config/glue/prototype? → SKIP
  Doubt? → USE TDD

COMMIT PATTERN:
  test: ... → feat/fix: ... → refactor: ... (optional)
  Each independently revertable
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Writing all tests first, then implementing | ONE test → ONE implementation → repeat. Batch defeats the purpose. |
| Skipping VERIFY RED | ALWAYS run the test before implementing. Watch it fail. Non-negotiable. |
| Over-implementing in GREEN | Only solve the failing test. YAGNI. Write another test for more behavior. |
| Testing implementation details | Assert on return values, side effects, public API. Not on internal calls or private state. |
| Keeping code written before test "as reference" | Delete means delete. Fresh test → fresh implementation. |
| Mocking without understanding real behavior | Gate: "Do I know what the real dependency does?" If no → read it first. |
| Skipping REFACTOR question | After GREEN, always ASK "Can I simplify?" Answer can be no — but you must ask NOW, not "later." |
| Adding behavior during REFACTOR | REFACTOR changes structure, not behavior. If tests fail after refactor, undo. |
| Using TDD for visual layout | TDD for behavior, visual testing for layout. Don't force-fit. |

## Integration

**Used by:**
- `/st:tdd` — standalone TDD workflow with framework setup, image input
- `/st:debug` — Phase 4: write failing test that reproduces the bug
- `/st:execute` — FINE granularity tasks use TDD cycle

**Skills that pair with tdd-discipline:**
- `superteam:project-awareness` — framework detection for test framework setup
- `superteam:scientific-debugging` — Phase 4 references "write failing test first"
- `superteam:requesting-code-review` — test coverage domain references TDD standards for test quality
- `superteam:receiving-code-review` — implementing review fixes follows TDD cycle
- `superteam:wave-parallelism` — parallel executor agents follow TDD cycle for implementation tasks
- `superteam:verification` — post-implementation verification standards

**Testing anti-patterns:** See `testing-anti-patterns.md` for 5 anti-patterns with gate functions and code examples.
````

---

## `testing-anti-patterns.md` Content

````markdown
# Testing Anti-Patterns

Reference file for `superteam:tdd-discipline`. Loaded when writing mocks or test utilities.

## How TDD Prevents These Anti-Patterns

When you write the test FIRST:
- You define expected behavior BEFORE implementation → you test real behavior, not implementation details.
- You see the test fail → you know it's testing something real.
- You write minimal implementation → less coupling, less need for mocks.
- You refactor with confidence → tests catch regressions immediately.

When you skip TDD, these anti-patterns flourish.

## Anti-Pattern 1: Testing Mock Behavior

**Problem:** You assert that a mock was called with specific arguments. You're testing your mock setup, not your code.

**Bad:**
```typescript
test('sends email', () => {
  const mockMailer = { send: jest.fn() };
  notifyUser(mockMailer, 'hello');
  expect(mockMailer.send).toHaveBeenCalledWith('hello');
});
// This tests that YOUR code calls send(). It doesn't test that an email is sent.
```

**Good:**
```typescript
test('sends email with correct content', () => {
  const inbox = new TestInbox();
  notifyUser(inbox, 'hello');
  expect(inbox.lastMessage().body).toBe('hello');
  // Tests actual behavior: did a message arrive with correct content?
});
```

**Gate: Before asserting on a mock call:**
"Am I testing MY code's behavior, or verifying that I set up the mock correctly?"

## Anti-Pattern 2: Test-Only Methods in Production

**Problem:** Adding methods to production code solely to make testing easier. These pollute the public API.

**Bad:**
```typescript
class UserService {
  getInternalCache() { return this._cache; } // Only used in tests!
}
```

**Good:**
Test through the public API. If you can't, the design needs to change — extract the internal concern into its own testable unit.

**Gate: Before adding a method to a production class:**
"Would this method exist if there were no tests? Is it part of the public API?"

## Anti-Pattern 3: Mocking Without Understanding

**Problem:** Mocking a dependency without understanding its real behavior. Your mock may not reflect reality.

**Bad:**
```typescript
const mockDb = { query: jest.fn().mockReturnValue([]) };
// Does the real DB return [] for no results? Or null? Or throw?
```

**Good:**
Read the real dependency's behavior first. Mock it accurately. Or better — use a real in-memory instance.

**Gate: Before mocking any method:**
"Can I describe what the real method does, including edge cases and error behavior?"

## Anti-Pattern 4: Incomplete Mocks

**Problem:** Mock only the happy path. Real dependencies have error states, edge cases, timeouts.

**Warning signs:**
- Mock always returns success
- No test for error/timeout/empty cases
- Mock returns hardcoded data that doesn't match real schema

**Fix:** For each mock, write tests for: success, failure, empty, timeout, invalid data.

**Gate: Before creating mock responses:**
"Have I covered error states, not just the happy path?"

## Anti-Pattern 5: Integration Tests as Afterthought

**Problem:** Writing only unit tests with mocks, then adding integration tests "later" (which often means never).

**Fix:** Start with an integration test that describes the full behavior. Then write unit tests for individual components. The integration test is the RED test that drove the feature.

**When mocks become too complex — warning signs:**
- Mock setup is longer than the test
- Mocks need mocks (nested mocking)
- Changing production code requires changing 5+ mocks
- You spend more time debugging mocks than actual code

When you see these signs: the code is too coupled. Refactor the production code, don't add more mocks.
````

---

## Design Decisions

1. **VERIFY RED as the central enforcement** — Research confirms this is what Claude skips most. Emphasized with block callout, repeated in Quick Reference, listed in Common Mistakes.
2. **"When to Skip" heuristic from GSD** — More practical than Superpowers' "always." The `expect(fn).toBe()` test is concrete and actionable.
3. **Gate functions extended** — Superpowers only has gates for anti-patterns. Added gates for the main cycle (before GREEN, before REFACTOR, before done) since Claude skips these too.
4. **"Batch-writing tests" as explicit red flag** — Neither GSD nor Superpowers calls this out, but it's one of Claude's most common TDD violations.
5. **"Why Order Matters" section** — 5 extended arguments from Superpowers. Needed because Claude rationalizes test-after with every rationalization listed.
6. **Commit pattern from GSD** — `test()` → `feat()` → `refactor()` provides traceability and independent revertability.
7. **Testing anti-patterns as separate file** — Keeps SKILL.md focused. Only loaded when working with mocks.
8. **Code examples in anti-patterns** — Good/Bad TypeScript examples from Superpowers are effective teaching tools. Kept because Claude learns better from examples than rules.
9. **"When Stuck" troubleshooting** — From Superpowers. Practical unblocker for common TDD obstacles.
10. **"Delete means delete" repeated** — Stated in Core Principle and Red Flags. Claude's strongest resistance is to deleting code it already wrote.
11. **Test framework detection table** — References project-awareness for framework detection, provides mapping to expected test framework per project type.
12. **REFACTOR as question, not action** — Clarifies that skipping refactor when code is clean is valid. Only "I'll refactor later" is a violation.
13. **Working with Untested Code** — Practical guidance for real-world codebases with zero tests. Prevents Claude from attempting 100% coverage as prerequisite.
14. **Failure vs Error distinction** — Claude often treats errors as valid RED. Explicit examples clarify: error = fix test setup first, failure = valid RED.
15. **Cross-skill testing scenarios** — Tests integration with scientific-debugging Phase 4 and execute FINE granularity.

## Testing Plan

1. Give Claude a feature to implement — does it write test first or code first?
2. After writing test, does Claude run it before implementing? (VERIFY RED)
3. In GREEN phase, does Claude write minimal code or over-implement?
4. Claude writes code before test "by accident" — does it delete or keep?
5. Give Claude a "trivial" change — does it skip TDD or apply the heuristic?
6. Bug fix request — does Claude write failing test reproducing the bug first?
7. Multiple behaviors to implement — does Claude batch tests or go one at a time?
8. Test passes immediately after writing — does Claude investigate or proceed?
9. Claude needs to mock a dependency — does it check gate questions first?
10. User says "skip the test, just implement it" — does Claude push back or comply?
11. REFACTOR phase — does Claude add new behavior or only restructure?
12. UI styling task — does Claude apply TDD or correctly skip it?
13. Bug found via `/st:debug` → Phase 4 triggers TDD — does Claude write failing test reproducing the bug, not just any test?
14. `/st:execute` FINE granularity — does each task follow RED-GREEN-REFACTOR, or batch-write tests?
15. Existing codebase has zero tests — does Claude set up test framework first, or skip TDD entirely?
