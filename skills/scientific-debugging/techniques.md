# Investigation Techniques

Reference file for `superteam:scientific-debugging`. Loaded when entering Phase 1.

## Technique Selection

| Situation | Start with |
|-----------|-----------|
| Error with stack trace | Root-Cause Tracing |
| "It worked before" | Git Bisect or Differential |
| Intermittent failure | Observability First + Condition-Based Waiting |
| Multi-component system | Boundary instrumentation + Binary Search |
| No error, wrong output | Working Backwards |
| Complex state bug | Minimal Reproduction |
| Constructed paths/URLs don't match | Follow the Indirection |
| Completely stuck | Rubber Duck or Comment-Out-Everything |

## Project-Type Hints

Use with `superteam:project-awareness` context to pick starting techniques:

| Project Type | Common Bug Patterns | Preferred Starting Techniques |
|---|---|---|
| Frontend | State bugs, rendering, event handling | Minimal Reproduction, Observability First |
| Backend | Data flow, concurrency, API contracts | Root-Cause Tracing, Defense-in-Depth |
| Fullstack | Client/server boundary, hydration, SSR | Boundary Instrumentation, Differential |
| Monorepo | Dependency resolution, version mismatch | Follow the Indirection, Differential |

## The 12 Techniques

### 1. Binary Search / Divide and Conquer
Cut the problem space in half repeatedly. Comment out half the code, check if bug persists. Narrow to the half that contains the bug. Repeat.

### 2. Working Backwards
Start from the wrong output. What function produced it? What input did that function receive? Trace backwards through the call chain until you find where actual data diverges from expected.

### 3. Git Bisect
Binary search through git history to find the commit that introduced the bug. Use `git bisect start`, mark known good and bad commits, let git narrow it down.

### 4. Differential Debugging
Compare broken state against working state. Two forms:
- **Time-based:** What changed between when it worked and when it broke? (`git diff`, dependency updates, env changes)
- **Environment-based:** Works in dev but not prod? Compare configs, versions, data.

### 5. Minimal Reproduction
Strip away everything until you have the smallest code that reproduces the bug. Remove features, simplify data, eliminate dependencies. The minimal repro often reveals the cause directly.

### 6. Observability First
Add logging/instrumentation BEFORE making any code changes. Understand what the code IS doing at runtime, not what you THINK it's doing. Log at entry/exit of suspect functions with input/output values.

### 7. Comment-Out-Everything
Comment out all suspect code. Uncomment one piece at a time. When the bug returns, you found the piece that causes it. Brute-force but effective when other techniques fail.

### 8. Rubber Duck Debugging
Explain the entire problem in complete detail — what the code should do, what it actually does, what you've tried. The act of articulating often reveals the gap in understanding.

### 9. Follow the Indirection
When code constructs paths, URLs, keys, or identifiers dynamically, verify the constructed value matches at BOTH producer and consumer. Log the actual value. Common source of "it should work" bugs.

### 10. Root-Cause Tracing
Trace backward through the call stack from symptom to origin:
1. Observe the symptom (wrong value, error, crash)
2. Find the immediate cause (what line produced this?)
3. Ask "what called this with these inputs?"
4. Keep tracing up the chain
5. Find the original trigger (the FIRST place data went wrong)

Stop when you find the FIRST divergence from expected behavior, not the last.

### 11. Defense-in-Depth
Add validation at every layer to pinpoint where data corrupts:
- Entry point (API/CLI input)
- Business logic (function pre/post-conditions)
- Environment (config, env vars, external services)
- Debug instrumentation (temporary assertions)

When all layers validate, the bug is between two adjacent layers.

### 12. Condition-Based Waiting
Replace arbitrary timeouts (`sleep 5`) with condition-based polling. If a test is intermittent:
- Identify what condition must be true
- Poll for that condition with a reasonable timeout
- Fail explicitly when the condition is not met within timeout

This eliminates timing-dependent bugs and makes failures deterministic.

## Combining Techniques

Techniques compose. Common combinations:
- **Observability First → Binary Search** — instrument, then narrow
- **Differential → Root-Cause Tracing** — find what changed, then trace why it matters
- **Minimal Reproduction → Rubber Duck** — simplify, then explain
- **Git Bisect → Differential** — find the commit, then analyze what changed

Start with the technique that matches your situation. Switch if it's not producing evidence within 10-15 minutes.
