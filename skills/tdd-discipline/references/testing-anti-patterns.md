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
