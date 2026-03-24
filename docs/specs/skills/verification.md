# Skill Spec: verification

> Status: DRAFT v2 | Created: 2026-03-24 | Revised: 2026-03-24 (user review)

---

## Frontmatter

```yaml
---
name: verification
description: >
  Use before marking any work as done, completed, or passing.
  Enforces goal-backward verification (outcomes over tasks), evidence-before-claims
  discipline, 4-level artifact analysis, and anti-shortcut rules.
---
```

---

## SKILL.md Content

````markdown
---
name: verification
description: >
  Use before marking any work as done, completed, or passing.
  Enforces goal-backward verification (outcomes over tasks), evidence-before-claims
  discipline, 4-level artifact analysis, and anti-shortcut rules.
---

# Verification

## Overview

Verification prevents false completion claims by enforcing evidence-based checking. It combines two complementary approaches: **goal-backward verification** (does the codebase actually achieve the outcome?) and **evidence-before-claims** (did you run the command before claiming it passes?).

**Two responsibilities:**
1. **Methodology** — goal-backward analysis, 4-level artifact verification, wiring checks.
2. **Discipline** — forbidden phrases, anti-rationalization, "run then claim" gate.

## Core Principles

Three principles. All three apply to every verification.

### 1. Evidence Before Claims

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.

Run the command. Read the FULL output. Check the exit code.
THEN — and only then — claim the result.

"Should work" is not evidence.
"I'm confident" is not evidence.
"Tests passed earlier" is not evidence.
FRESH command output is evidence.
```

### 2. Goal-Backward Verification

```
TASK COMPLETION ≠ GOAL ACHIEVEMENT.

A task "create chat component" can be marked complete when the component
is a placeholder. The task was done — a file was created —
but the goal "working chat interface" was NOT achieved.

Start from the GOAL. Work backwards to verify it's achieved.
Not: "Did I complete all tasks?" (task-forward)
But: "Can the user actually do the thing?" (goal-backward)
```

### 3. Do Not Trust Self-Reports

```
SUMMARIES, AGENT REPORTS, AND YOUR OWN INTUITION ARE NOT EVIDENCE.

You generated code → you THINK it works → you SAY it works.
That chain has zero verification in it.

Verify independently. Run commands. Read output. Check artifacts.
```

## The Iron Law

```
BEFORE ANY OF THESE ACTIONS:
  - Claiming work is done
  - Committing code
  - Creating a PR
  - Marking a task complete
  - Saying "tests pass"
  - Saying "build succeeds"
  - Saying "bug is fixed"

YOU MUST:
  1. IDENTIFY what command proves this claim
  2. RUN the command (fresh, complete, in this message)
  3. READ the full output and check exit code
  4. VERIFY the output confirms the claim
  5. ONLY THEN make the claim

Skip any step = lying, not verifying.

"FRESH" means:
  - Run AFTER your latest code change (not before)
  - Run IN THIS MESSAGE (not a previous message)
  - Run the COMPLETE command (not partial or cached output)
```

## Goal-Backward Method

When verifying a phase, feature, or milestone:

```
Step 1: TRUTHS — What must be TRUE for the goal to be achieved?
  → 3-7 observable truths (user can do X, system handles Y)

Step 2: ARTIFACTS — What must EXIST for those truths to hold?
  → Concrete files, functions, endpoints with paths

Step 3: WIRING — What must be CONNECTED for artifacts to function?
  → Imports, API calls, event handlers, data flow

Step 4: DATA — What must FLOW through that wiring?
  → Real data, not hardcoded/placeholder/empty
```

**Example:**

Goal: "User can log in with email/password"

| Level | Check | Finding |
|-------|-------|---------|
| Truth | User can submit login form and receive access token | — |
| Artifact | `src/auth/login.tsx` exists, `src/api/auth.ts` exists | Both exist ✓ |
| Wiring | Login form calls auth API, API calls database | Form has `onSubmit` but it only `console.log`s ✗ |
| Data | API returns real JWT, form stores it | N/A — wiring broken |

**Result:** Task "create login" was completed (files exist). Goal "user can log in" was NOT achieved (wiring broken at form→API).

## 4-Level Artifact Verification

Every artifact must pass all 4 levels:

| Level | Name | Check | What it catches |
|-------|------|-------|----------------|
| 1 | **Exists** | File present at expected path | Missing files |
| 2 | **Substantive** | Real implementation, not placeholder | Stubs, TODOs, empty returns |
| 3 | **Wired** | Imported AND used by other code | Orphaned files that connect to nothing |
| 4 | **Data-Flow** | Upstream produces real data, downstream consumes it | Hollow components — wired but showing empty/hardcoded data |

### Status Matrix

| Exists | Substantive | Wired | Data Flows | Status | Action |
|--------|------------|-------|------------|--------|--------|
| ✓ | ✓ | ✓ | ✓ | **VERIFIED** | Done |
| ✓ | ✓ | ✓ | ✗ | **HOLLOW** | Connect data source |
| ✓ | ✓ | ✗ | — | **ORPHANED** | Import and use it |
| ✓ | ✗ | — | — | **STUB** | Implement real logic |
| ✗ | — | — | — | **MISSING** | Create the artifact |

**80% of stubs hide in wiring.** Level 1 (exists) and Level 2 (substantive) pass easily. Level 3 (wired) and Level 4 (data-flow) are where most verification failures are found.

### Wiring Patterns to Check

See `wiring-patterns.md` for detailed patterns. Summary:

| Pattern | Check | Red Flag |
|---------|-------|----------|
| Component → API | fetch/axios call exists AND response consumed | `onSubmit` that only `console.log`s |
| API → Database | DB query exists AND result returned | Route that returns static/hardcoded response |
| Form → Handler | onSubmit has real logic (fetch/mutate/dispatch) | Handler only logs or is empty |
| State → Render | useState variable appears in JSX | State declared but never rendered |

### Anti-Patterns to Scan

Search the codebase for these indicators of incomplete work:

```
SCAN FOR:
  - TODO, FIXME, HACK, XXX comments
  - "not implemented", "placeholder", "stub"
  - Empty function bodies: {} or { return; } or { return null; }
  - console.log as sole implementation
  - Hardcoded data: mock data, sample data, "lorem ipsum"
  - Disabled tests: .skip, xit, xdescribe, @pytest.mark.skip
```

If any are found in code that should be complete: the artifact is STUB, not VERIFIED.

## Test Runner Detection

Use `superteam:project-awareness` framework detection to determine the correct verification command:

| Framework | Test Command | Build Command |
|-----------|-------------|---------------|
| React/Vue/Svelte (Vite) | `npx vitest run` | `npx vite build` |
| React (CRA/Next) | `npx jest` or `npm test` | `npm run build` |
| Express/NestJS | `npx jest` or `npx vitest run` | `npx tsc --noEmit` |
| Django | `python -m pytest` or `python manage.py test` | N/A |
| Laravel | `php artisan test` or `./vendor/bin/phpunit` | N/A |
| Go | `go test ./...` | `go build ./...` |
| Rust | `cargo test` | `cargo build` |
| Java/Spring | `./mvnw test` or `./gradlew test` | `./mvnw compile` |

If framework unknown: check `package.json` scripts, `Makefile`, `pyproject.toml`, or ask user.

## What Needs Human Verification

Some things cannot be verified by running commands. Flag these for user:

| Category | Examples | Why automated can't check |
|----------|----------|--------------------------|
| **Visual appearance** | Layout matches design, colors correct, responsive | Requires human eyes |
| **User flow completion** | Multi-step workflow works end-to-end | Requires human judgment on UX |
| **Real-time behavior** | WebSocket updates, animations, transitions | Timing-dependent |
| **External services** | Payment processing, email delivery, SMS | Requires real accounts/credentials |
| **Performance feel** | Page feels fast, interactions responsive | Subjective perception |
| **Error message clarity** | Messages are helpful, not technical jargon | Requires human evaluation |

**Format:** Present each item one at a time. User responds: pass / issue / skip / blocked.

## Anti-Shortcut System

### Forbidden Phrases — STOP

If you are about to say any of these, you are skipping verification:

| Phrase | What to do instead |
|--------|-------------------|
| "Should work now" | RUN the verification command. Then state the result. |
| "That should do it" | Did you run the tests? What was the output? |
| "Looks correct" | Looking ≠ verifying. Run the command. |
| "Tests should pass" | "Should" means you didn't run them. Run them. |
| "I'm confident this works" | Confidence ≠ evidence. Run verification. |
| "Great!" / "Perfect!" / "Done!" | Before verification, these are lies. After verification with evidence, they're fine. |
| "Just need to verify..." (then doesn't) | Actually verify. Right now. In this message. |
| "Build succeeds" (without running build) | Run the build. Show the output. |
| "Bug is fixed" (without testing original symptom) | Reproduce the original bug. Confirm it's gone. |
| "Agent completed successfully" | Verify independently. Agent self-reports are not evidence. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Tests passed earlier" | Earlier ≠ now. Code changed. Run fresh. |
| "I just wrote the code, I know it works" | You know what you INTENDED. Not what you BUILT. Verify. |
| "Linter passed, so it's fine" | Linter checks syntax and style. Not correctness. |
| "Partial check is enough" | Partial verification proves nothing about the unchecked parts. |
| "It's a small change, no need to verify" | Small changes cause big bugs. Verify. |
| "Agent said it succeeded" | Agents report their INTENT, not their OUTCOME. Verify independently. |
| "I've seen the output before" | Before your latest changes? Run it again. |
| "User didn't ask me to verify" | Verification is not optional. It's part of completion. |

## Re-Verification Protocol

When re-verifying previously checked work (e.g., after fixes):

1. **Focus on previously failed items.** Don't re-check everything — focus on gaps.
2. **Regression check on passed items.** Spot-check 2-3 previously-VERIFIED artifacts to ensure fixes didn't break them.
3. **New gaps from fixes.** Fixes can introduce new issues. Check artifacts touched by the fix.

## Quick Reference

```
IRON LAW:
  Run command → read output → check exit code → THEN claim.
  No step skipped. No exceptions.

GOAL-BACKWARD:
  1. TRUTHS: What must be true for goal achieved? (3-7)
  2. ARTIFACTS: What must exist? (files, functions, endpoints)
  3. WIRING: What must be connected? (imports, calls, handlers)
  4. DATA: What must flow? (real data, not hardcoded)

4-LEVEL STATUS:
  VERIFIED = exists + substantive + wired + data-flowing
  HOLLOW   = wired but data disconnected
  ORPHANED = exists + substantive but not connected
  STUB     = exists but placeholder/empty
  MISSING  = doesn't exist

WHERE STUBS HIDE:
  80% in wiring. Component→API, API→DB, Form→Handler, State→Render

FORBIDDEN:
  "Should work" / "Looks correct" / "Done!" — before running verification

HUMAN VERIFICATION:
  Visual, user flow, real-time, external services, performance feel

RE-VERIFICATION:
  Focus failed → regression check passed → check fix side-effects
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| "Tests pass" without running them | Run `npm test` / `pytest` / equivalent. Show output. |
| Marking task done when file exists but is a stub | Check Level 2 (substantive). Is there real logic or just a skeleton? |
| Component exists but isn't imported anywhere | Check Level 3 (wired). Grep for imports. Orphaned = not done. |
| API route returns hardcoded data | Check Level 4 (data-flow). Does it query real DB or return mock? |
| Trusting SUMMARY.md or agent report | Verify independently against actual codebase. Claims ≠ reality. |
| Saying "bug is fixed" without reproducing original bug | Test the original symptom. Confirm it's gone. Then claim. |
| Partial test run ("just the relevant tests") | Run full suite. Partial proves nothing about regressions. |
| "Looks good" after reading code | Reading ≠ running. Execute the verification command. |
| Skipping wiring checks because components "look complete" | 80% of stubs hide in wiring. Check Component→API→DB→Render chain. |
| Premature "Done!" before Level 4 check | VERIFIED requires all 4 levels. Data must actually flow. |

## Integration

**Used by:**
- `/st:phase-validate` — 4-layer verification (criteria, tests, integration, UAT)
- `/st:milestone-audit` — milestone completion verification
- Auto-triggered: before any completion claim, commit, or PR

**Skills that pair with verification:**
- `superteam:project-awareness` — framework detection for test runner commands and verification patterns
- `superteam:tdd-discipline` — TDD provides the tests that verification runs
- `superteam:scientific-debugging` — when verification reveals bugs, use debugging methodology
- `superteam:requesting-code-review` — review includes verification of findings before fixing
- `superteam:receiving-code-review` — verify fixes from code review feedback before marking resolved
- `superteam:wave-parallelism` — post-wave verification: orchestrator runs verification after all agents complete (not per-agent). Each agent self-checks; orchestrator spot-checks and runs test suite.
- `superteam:handoff-protocol` — verification state captured on pause

**Reference files:**
- `artifact-patterns.md` — framework-specific grep patterns for 4-level verification
- `wiring-patterns.md` — the 4 wiring patterns with red flags and grep commands
````

---

## `artifact-patterns.md` Content

````markdown
# Artifact Verification Patterns

Reference file for `superteam:verification`. Loaded when performing deep artifact analysis.

Framework-specific grep patterns for 4-level verification.

## React / Vue / Svelte Components

### Level 1: Exists
```bash
ls src/components/ComponentName.tsx  # or .vue, .svelte
```

### Level 2: Substantive
```bash
# Must have JSX return (not null, not empty div, not "TODO")
grep -n "return" src/components/ComponentName.tsx
# Check for placeholder content
grep -n "TODO\|placeholder\|not implemented\|lorem" src/components/ComponentName.tsx
# Line count > 15 suggests real implementation
wc -l src/components/ComponentName.tsx
```

### Level 3: Wired
```bash
# Imported somewhere
grep -rn "import.*ComponentName" src/
# Used in JSX
grep -rn "<ComponentName" src/
```

### Level 4: Data-Flow
```bash
# Has props or state that receive real data
grep -n "useState\|useQuery\|useFetch\|props\." src/components/ComponentName.tsx
# Data rendered in JSX (not hardcoded)
grep -n "{.*}" src/components/ComponentName.tsx  # template expressions
```

## API Routes / Endpoints

### Level 2: Substantive
```bash
# Has actual logic (not just "not implemented" response)
grep -n "not implemented\|TODO\|res.status(501)" src/api/route.ts
# Has database interaction or business logic
grep -n "prisma\|mongoose\|knex\|sequelize\|db\.\|repository\." src/api/route.ts
# Line count > 10 suggests real implementation
wc -l src/api/route.ts
```

### Level 3: Wired
```bash
# Registered in router
grep -rn "route\|router\.\(get\|post\|put\|delete\)" src/
# Called by frontend
grep -rn "fetch\|axios\|api\." src/components/ src/pages/
```

### Level 4: Data-Flow
```bash
# Returns data from DB (not static response)
grep -n "return.*await\|res.json.*await\|res.send.*await" src/api/route.ts
# Error handling exists
grep -n "catch\|try\|error\|throw" src/api/route.ts
```

## Database Models / Schemas

### Level 2: Substantive
```bash
# Has fields defined (not empty model)
grep -n "field\|column\|attribute\|@Column\|@Field" src/models/
# Has relationships
grep -n "hasMany\|belongsTo\|@Relation\|@ManyToOne\|ForeignKey" src/models/
```

### Level 3: Wired
```bash
# Used in API routes or services
grep -rn "import.*Model\|from.*models" src/api/ src/services/
# Migration exists and is applied
ls src/migrations/ db/migrations/
```

## Python (Django / FastAPI / Flask)

### Level 2: Substantive
```bash
# Has real logic (not pass, not raise NotImplementedError)
grep -n "pass$\|NotImplementedError\|TODO\|placeholder" src/views.py src/services/
# Has actual return or response
grep -n "return\|Response\|JsonResponse\|HTTPException" src/views.py
# Line count > 10 suggests real implementation
wc -l src/views.py src/services/*.py
```

### Level 3: Wired
```bash
# Registered in urls/routes
grep -rn "path\|url\|router\.\(get\|post\|add_api_route\)" src/urls.py src/routes.py
# Imported by other modules
grep -rn "from.*import\|import.*service\|import.*repository" src/
```

## Java / Kotlin (Spring Boot)

### Level 2: Substantive
```bash
# Has real logic (not throw UnsupportedOperationException, not TODO)
grep -n "UnsupportedOperationException\|TODO\|NotImplemented\|return null;" src/main/java/
# Has annotations indicating real endpoints
grep -n "@GetMapping\|@PostMapping\|@RequestMapping\|@Service\|@Repository" src/main/java/
# Line count > 15 suggests real implementation
wc -l src/main/java/**/*.java
```

### Level 3: Wired
```bash
# Injected/used by other classes
grep -rn "@Autowired\|@Inject\|private.*Service\|private.*Repository" src/main/java/
# Controller calls service, service calls repository
grep -rn "this\.\(service\|repository\)\." src/main/java/
```

## Go

### Level 2: Substantive
```bash
# Has real logic (not panic("not implemented"), not TODO)
grep -n "panic\|TODO\|not implemented" src/*.go
# Has actual return values
grep -n "return " src/*.go | grep -v "return nil\|return err"
```

### Level 3: Wired
```bash
# Imported by other packages
grep -rn "import.*packagename" src/
# Handler registered in router
grep -rn "HandleFunc\|Handle\|router\.\(GET\|POST\)" src/
```

## General Patterns

### Placeholder Detection
```bash
# Across entire project
grep -rn "TODO\|FIXME\|HACK\|XXX\|not implemented\|placeholder\|stub" src/
grep -rn "console\.log\|print(" src/ --include="*.ts" --include="*.tsx"  # log-only implementations
```

### Disabled Tests
```bash
grep -rn "\.skip\|xit\|xdescribe\|@pytest\.mark\.skip\|@unittest\.skip" tests/ src/
```
````

---

## `wiring-patterns.md` Content

````markdown
# Wiring Verification Patterns

Reference file for `superteam:verification`. Loaded when checking Level 3 (Wired) and Level 4 (Data-Flow).

80% of stubs hide in wiring. These 4 patterns catch them.

## Pattern 1: Component → API

**What to check:** Frontend component calls backend API AND consumes the response.

**Verified:**
```typescript
// Component makes API call
const response = await fetch('/api/users');
const users = await response.json();
// AND uses the data
return <UserList users={users} />;
```

**Red flags:**
```typescript
// onSubmit only logs (STUB)
const handleSubmit = () => {
  console.log('submitted');
};

// Fetch exists but response ignored (HOLLOW)
await fetch('/api/users');
return <UserList users={[]} />;  // hardcoded empty

// No fetch at all (ORPHANED — component exists but doesn't talk to API)
return <UserList users={mockData} />;
```

**Grep check:**
```bash
# Has fetch/axios AND setState/return with response
grep -A5 "fetch\|axios" src/components/ComponentName.tsx | grep "set\|return\|json()"
```

## Pattern 2: API → Database

**What to check:** API route queries database AND returns the result.

**Verified:**
```typescript
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

**Red flags:**
```typescript
// Returns static data (STUB)
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Test User' }]);
});

// Has DB query but returns hardcoded response (HOLLOW)
app.get('/api/users', async (req, res) => {
  await prisma.user.findMany(); // query executed but result discarded
  res.json({ message: 'success' });
});
```

**Grep check:**
```bash
# Has DB call AND res.json/res.send with result variable
grep -B5 -A5 "prisma\|mongoose\|knex\|db\." src/api/ | grep "res\.\(json\|send\)"
```

## Pattern 3: Form → Handler

**What to check:** Form's onSubmit has real logic — fetch, mutation, state update.

**Verified:**
```typescript
const handleSubmit = async (data) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const result = await response.json();
  setUser(result.user);
  router.push('/dashboard');
};
```

**Red flags:**
```typescript
// Empty handler (STUB)
const handleSubmit = () => {};

// Log-only handler (STUB)
const handleSubmit = (data) => {
  console.log('form data:', data);
};

// Alert-only handler (STUB)
const handleSubmit = () => {
  alert('Submitted!');
};
```

**Grep check:**
```bash
# onSubmit/handleSubmit has fetch/mutate/dispatch (not just log/alert)
grep -A10 "handleSubmit\|onSubmit" src/ | grep "fetch\|mutate\|dispatch\|axios"
```

## Pattern 4: State → Render

**What to check:** useState/useQuery variable actually appears in JSX output.

**Verified:**
```typescript
const [users, setUsers] = useState([]);
// ... fetch and setUsers ...
return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
```

**Red flags:**
```typescript
// State declared but never rendered (ORPHANED)
const [users, setUsers] = useState([]);
return <div>Users page</div>;  // users variable not in JSX

// State rendered but always empty (HOLLOW)
const [users] = useState([]);  // never populated
return <ul>{users.map(...)}</ul>;  // renders empty list forever
```

**Grep check:**
```bash
# useState variable name appears in return/JSX
grep -n "useState" src/components/Component.tsx  # find variable name
grep -n "{variableName" src/components/Component.tsx  # check if used in JSX
```

## Pattern 5: Handler → Service (Backend)

**What to check:** Request handler delegates to a service layer, not inline logic.

**Verified:**
```typescript
app.post('/api/orders', async (req, res) => {
  const order = await orderService.create(req.body);
  res.json(order);
});
```

**Red flags:**
```typescript
// Handler has all logic inline (no service layer — may be fine for simple cases, but verify intent)
// Handler calls service but ignores result
await orderService.create(req.body);
res.json({ message: 'ok' }); // result discarded
```

## Pattern 6: Service → Repository (Backend)

**What to check:** Service layer calls repository/data layer, not hardcoded data.

**Verified:**
```typescript
class OrderService {
  async create(data) {
    return await this.orderRepo.save(new Order(data));
  }
}
```

**Red flags:**
```typescript
// Service returns hardcoded data (STUB)
class OrderService {
  async create(data) { return { id: 1, ...data }; }
}

// Service has empty methods (STUB)
class OrderService {
  async create(data) {}
}
```

## Pattern 7: Module → Export

**What to check:** Module exports are actually used by consumers.

**Grep check:**
```bash
# Find what module exports
grep -n "export\|module\.exports\|__all__" src/module.ts
# Check if exports are imported anywhere
grep -rn "from.*module\|import.*module\|require.*module" src/
```

**Red flag:** Module exports 5 functions but only 1 is imported elsewhere. Are the other 4 dead code or not-yet-wired?

## Combining Patterns

For a complete feature, verify the FULL chain:

```
Frontend: Form → Handler → API Call → Response → State → Render
Backend:  Route Handler → Service → Repository → Database → Response

Each arrow is a wiring point.
Each wiring point can be broken (STUB, ORPHANED, HOLLOW).
Check every arrow, not just the endpoints.
```
````

---

## Design Decisions

1. **Dual approach: Goal-Backward + Evidence-Before-Claims** — GSD answers WHAT to verify, Superpowers answers WHEN and HOW NOT to cheat. Both needed.
2. **Iron Law from Superpowers** — Born from "24 failure memories" where trust was broken. The single most impactful behavioral rule.
3. **4-level artifact verification from GSD** — Exists→Substantive→Wired→Data-flow catches progressively subtler failures. Most skills only check Level 1.
4. **"80% of stubs hide in wiring"** — GSD's deepest insight. Wiring patterns in separate file for on-demand loading.
5. **Forbidden phrases** — Superpowers' most effective mechanism. Claude's premature satisfaction language is explicitly listed and blocked.
6. **Status matrix** — VERIFIED/HOLLOW/ORPHANED/STUB/MISSING provides precise vocabulary instead of "it's not quite done."
7. **Human verification category** — Some things can't be automated. Explicit list prevents Claude from claiming "verified" when only commands were run.
8. **Framework-specific patterns in reference files** — Keeps SKILL.md focused on methodology. Patterns loaded only during deep artifact analysis.
9. **Re-verification protocol** — Brief: focus failed, regression check passed, check fix side-effects. Details stay in command spec.
10. **Auto-triggered scope** — Not just for `/st:phase-validate`. Applies before ANY completion claim, commit, or PR. Always-on behavioral rule.
11. **Do Not Trust Self-Reports** — Claude trusting its own SUMMARY of what it built is the #1 verification failure mode. Explicit principle.
12. **Wiring patterns expanded to 7** — 4 frontend (Component→API, API→DB, Form→Handler, State→Render) + 3 backend (Handler→Service, Service→Repository, Module→Export). Full stack coverage.
13. **Multi-language artifact patterns** — React/Vue, Python/Django, Java/Spring, Go. Not just TypeScript.
14. **Test runner mapping table** — References project-awareness detection. Concrete commands per framework.
15. **"Fresh" defined explicitly** — After latest change, in this message, complete command. Prevents "I ran tests before my changes."
16. **Wave verification clarified** — Orchestrator verifies post-wave, not per-agent. Agents self-check; orchestrator spot-checks + test suite.

## Testing Plan

1. Claude writes code and says "tests pass" — did it actually run the tests?
2. Claude creates a component file — does it check Level 2 (not a stub)?
3. Component exists and is substantive — does Claude check Level 3 (imported and used)?
4. API route exists and has logic — does Claude check Level 4 (returns DB data, not hardcoded)?
5. Claude says "bug is fixed" — did it reproduce the original bug and confirm it's gone?
6. Claude says "Great, all done!" — was this BEFORE or AFTER running verification?
7. Agent reports "completed successfully" — does Claude verify independently or trust the report?
8. Phase has 5 success criteria — does Claude check all 5 or just the easy ones?
9. Claude runs partial test suite — does it acknowledge this is partial, not full verification?
10. Form component exists with onSubmit that only console.logs — does Claude flag as STUB?
11. Re-verification after fix — does Claude focus on failed items and regression check passed items?
12. Visual UI feature — does Claude flag for human verification instead of claiming "verified"?
