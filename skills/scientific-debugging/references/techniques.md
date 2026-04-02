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
Add targeted instrumentation BEFORE making any code changes. Understand what the code IS doing at runtime, not what you THINK it's doing. Do NOT rely on old logs — they may be from previous debug sessions or unrelated events.

**Protocol:**
1. **Place targeted logs** at suspected points. Each log must test a specific hypothesis — no scatter-shot.
2. **Reproduce the bug** to generate fresh output from YOUR instrumentation.
3. **Read YOUR logs only** — correlate output with hypotheses.
4. **Clean up** all instrumentation after collecting evidence (see Cleanup below).

**Where to instrument** (in priority order):
- Function entry/exit of suspect functions (input/output values)
- Boundary crossings (API calls, DB queries, service calls)
- State mutations (before/after values)
- Conditional branches (which path was taken)
- Error/catch blocks (exception details, silently swallowed errors)

**What to log:** `[DBG-NNN] File.function ENTRY|EXIT|STATE|BRANCH key=value`
- `[DBG-NNN]` — sequential ID per session, identifies output
- Location + event type — where and what happened
- Key data — only relevant values, NEVER sensitive data (passwords, tokens, PII)

**Marker convention:**
- End every instrumented line with a language-appropriate comment: `// DBG-AGENT` (JS/TS/Go/Java), `# DBG-AGENT` (Python/Ruby), `// DBG-AGENT` (PHP)
- Multi-line blocks: `// DBG-AGENT-START` ... `// DBG-AGENT-END`
- This marker enables reliable grep-based cleanup

**Framework patterns:**
- Node/Express: `console.log('[DBG-001] ...', { key: value }); // DBG-AGENT`
- Laravel: `Log::debug('[DBG-001] ...', ['key' => $value]); // DBG-AGENT`
- Django: `logger.debug('[DBG-001] ...', key, value)  # DBG-AGENT`
- React/Vue: `useEffect` or lifecycle hooks with `// DBG-AGENT` marker
- Unknown: ask user for preferred logging approach

**Anti-patterns:**
- Logging inside tight loops (log count/sample instead)
- Logging sensitive data (explicitly exclude password, token, PII fields)
- No context in log message (`console.log('here')` — useless)
- Instrumenting without a hypothesis (flooding without signal)
- Modifying application logic while instrumenting (observation only)

**Cleanup:**
1. After fix verified, remove ALL lines matching `DBG-AGENT` marker
2. Verify: `grep -rn "DBG-AGENT"` returns zero results
3. Run tests to confirm cleanup did not break anything
4. Cleanup is MANDATORY — debug session is not complete until instrumentation is removed

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
