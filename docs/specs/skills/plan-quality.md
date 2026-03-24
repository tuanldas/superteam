# Skill Spec: plan-quality

> Status: DRAFT v1 | Created: 2026-03-24

---

## Frontmatter

```yaml
---
name: plan-quality
description: >
  Use when creating any implementation plan (task or phase).
  Enforces goal-backward plan design, quality gates before execution,
  anti-vagueness rules, and plan-checker agent verification loop.
---
```

---

## SKILL.md Content

````markdown
---
name: plan-quality
description: >
  Use when creating any implementation plan (task or phase).
  Enforces goal-backward plan design, quality gates before execution,
  anti-vagueness rules, and plan-checker agent verification loop.
---

# Plan Quality

## Overview

Plan Quality ensures every implementation plan is concrete enough to execute without guesswork and complete enough to achieve its goal. It is the methodology used during plan creation — not during execution (that is `verification`) and not for parallelism (that is `wave-parallelism`).

**Two responsibilities:**
1. **Methodology** — goal-backward plan design, quality criteria checklist, must-haves derivation, plan-checker agent verification loop.
2. **Discipline** — anti-vagueness rules that resist Claude's default "optimistic, under-specified" planning behavior.

## Core Principle

```
EVERY PLAN STEP MUST BE EXECUTABLE WITHOUT ASKING QUESTIONS.

If a step says "implement the feature" — it's not a plan, it's a wish.
If a step doesn't name exact files — the planner didn't think it through.
If a step has no acceptance criteria — how do you know it's done?

A plan is a CONTRACT with the executor.
Vague contracts produce vague results.
```

This is non-negotiable. No complexity level, no time pressure, no "obvious" task overrides this.

## When Plan Quality Applies

**Always applies to:**
- `/st:plan` output (task-level plans)
- `/st:phase-plan` output (phase-level plans)
- Any plan passed to `/st:execute` or `/st:phase-execute`

**Does NOT apply to:**
- Exploratory brainstorming (ideas, not plans)
- Research summaries (information, not instructions)
- User's own plan documents (unless user asks for quality check)

## Goal-Backward Plan Design

Plans are designed BACKWARDS from the desired outcome, not FORWARDS from "what should we do first."

```
Step 1: GOAL — What is the desired end state?
  → One sentence: "User can X" / "System does Y" / "Feature Z works"

Step 2: MUST-HAVES — What must be TRUE for goal to be achieved?
  → 3-7 observable truths (not tasks, not code — TRUTHS)

Step 3: ARTIFACTS — What must EXIST for must-haves to hold?
  → Concrete files, functions, endpoints, configs with exact paths

Step 4: TASKS — What steps produce those artifacts?
  → Every task traces back to a must-have
  → Any must-have without a task = gap in plan
```

**Why backward, not forward?**

Forward planning asks "what should we do?" and produces activity-oriented plans ("set up project", "create files", "add logic"). These plans feel productive but often miss the goal.

Backward planning asks "what must be true?" and produces outcome-oriented plans. Every task exists because a must-have requires it.

**Example:**

| Direction | Plan for "add dark mode" |
|-----------|--------------------------|
| Forward (bad) | 1. Research dark mode. 2. Create theme file. 3. Add toggle. 4. Update components. 5. Test. |
| Backward (good) | Goal: User can toggle dark/light mode. Must-haves: (a) toggle persists across sessions, (b) all components respect theme, (c) system preference detected on first visit, (d) no flash of wrong theme. Artifacts: theme.ts, ThemeToggle.tsx, useTheme hook, CSS variables. Tasks: each producing specific artifacts with verification. |

The forward plan sounds reasonable but "update components" is unbounded. The backward plan names every artifact and traces each to a must-have.

## Must-Haves Derivation

How to derive must-haves depends on plan type:

**For `/st:plan` (task-level):**
```
AI derives must-haves from goal:

Goal: "Add dark mode to the app"
Must-haves:
  1. User can toggle between dark and light mode
  2. Theme preference persists across sessions
  3. System color scheme preference detected on first visit
  4. All existing components render correctly in both themes
  5. No flash of wrong theme on page load
```

**For `/st:phase-plan` (phase-level):**
```
Must-haves = success criteria from ROADMAP.md phase:

Phase 3: Authentication System
Success criteria (= must-haves):
  1. User can register with email/password
  2. User can login and receive JWT token
  3. Password reset flow sends email and works
  4. Session expires after configured timeout
```

**Rules:**
- Must-haves are TRUTHS, not tasks. "User can login" not "Create login endpoint."
- 3-7 per plan. Fewer = underspecified. More = split the plan.
- Each must-have should be independently verifiable.
- Must-haves become the verification checklist for `superteam:verification` post-execution.

## Plan Quality Checklist

Every plan must pass ALL items before execution. This is the checklist the plan-checker agent uses.

```
PLAN QUALITY GATES:

□ GOAL STATED — One sentence, observable outcome
□ MUST-HAVES DERIVED — 3-7 truths that prove goal achieved
□ EVERY MUST-HAVE COVERED — Each has ≥1 task addressing it
□ NO ORPHAN TASKS — Every task traces to a must-have
□ EXACT FILE PATHS — Every task names files to create/modify/test
□ READ-FIRST FILES — Every modify-task lists files to read before editing
□ ACCEPTANCE CRITERIA — Every task has grep-verifiable conditions
□ EXPECTED OUTPUT — Tasks with runtime behavior have command + expected result
□ DEPENDENCIES DECLARED — Task ordering is explicit, not implied
□ GRANULARITY APPROPRIATE — Steps match complexity (COARSE/STANDARD/FINE)
□ NO VAGUE STEPS — Zero instances of banned phrases without specifics
□ CONCRETE VALUES — Config values, API paths, function signatures specified
□ TDD INTEGRATION — Logic tasks include test steps per granularity level
```

## Task Anatomy

Every task in a plan must contain these fields. Missing fields = plan fails quality gate.

```
### Task N: [Specific Component Name]

Files:
  - Create: exact/path/to/file.ts
  - Modify: exact/path/to/existing.ts (lines ~XX-YY if known)
  - Test: tests/exact/path/to/test.ts
  - Read-first: exact/path/to/dependency.ts (understand before editing)

Steps:
  - [ ] Step 1: [concrete action with concrete values]
  - [ ] Step 2: [verification step with command + expected output]

Acceptance criteria:
  - grep "export function X" src/path/file.ts → match
  - npm test -- --filter="X" → 0 failures

Dependencies: Task [M] (needs X to exist)
Must-have: [which must-have this task addresses]
```

**Required fields by granularity:**

| Field | COARSE | STANDARD | FINE |
|-------|--------|----------|------|
| Files (create/modify) | Required | Required | Required |
| Read-first | Optional | Required | Required |
| Test files | Optional | Required | Required |
| Acceptance criteria (grep) | Required | Required | Required |
| Expected output (runtime) | Optional | Required | Required |
| TDD steps (red-green) | Skip | Logic tasks only | All tasks |
| Dependencies | Required | Required | Required |
| Must-have trace | Required | Required | Required |

## Anti-Vagueness Rules

These are the specific vague patterns Claude produces in plans and the concrete replacements required.

| Banned Phrase | Why It Fails | Replace With |
|---------------|-------------|-------------|
| "Implement the feature" | No specifics. What feature? Which files? | "Create `src/auth/login.ts` with `loginUser(email, password): Promise<Token>`" |
| "Add validation" | Which fields? What rules? What error messages? | "Add email format check: reject if not matching `/^[^@]+@[^@]+$/`, return `{error: 'Invalid email format'}`" |
| "Handle errors" | Which errors? How? What response? | "Catch `DatabaseConnectionError` → return 503 with `{error: 'Service unavailable', retry_after: 30}`" |
| "Set up the project" | What setup? Which tools? What config? | "Create `vite.config.ts` with React plugin, path alias `@/` → `src/`" |
| "Update components" | Which components? What changes? | "Modify `src/components/Header.tsx`: add `useTheme()` hook, apply `className={theme.header}`" |
| "Test it" | What test? What assertion? | "Write test: `loginUser('bad@email', 'pass')` → throws `InvalidCredentialsError`" |
| "Configure [tool]" | Which settings? What values? | "Set `tsconfig.json` `compilerOptions.strict: true`, `paths: { '@/*': ['src/*'] }`" |
| "Integrate with [service]" | What endpoint? What data? What auth? | "POST to `/api/v2/users` with `{name, email}`, Bearer token in header, expect 201 with `{id, created_at}`" |
| "Refactor [code]" | What change? Why? What's the target state? | "Extract `validateInput()` from `handleSubmit()` in `form.ts:45-67` into `src/utils/validate.ts`" |
| "Clean up" | What cleanup? Which files? | "Remove unused imports in `api.ts` (lines 3, 7, 12), rename `temp` → `userSession`" |

**Detection rule:** If a step can be interpreted 3+ different ways by different developers, it is vague. Rewrite until there is only one interpretation.

## Granularity Guidelines

Plan-quality does not choose granularity (the planner agent does), but it enforces minimum quality per level.

| Granularity | When | Task Count | Minimum Quality |
|-------------|------|-----------|-----------------|
| COARSE | Simple: rename, config, styling | 1-3 | File paths + acceptance criteria + must-have trace |
| STANDARD | Medium: new component, API endpoint | 5-8 | + read-first + expected output + TDD for logic |
| FINE | Complex: auth, migration, payment | 10-20 | + TDD every task + code snippets + verification between steps |

**User override:** "Chi tiết hơn" (more detail) → increase granularity. "Gọn hơn" (less detail) → decrease. Plan quality gates still apply at any level.

## Plan-Checker Agent Protocol

After the planner agent produces a plan, the plan-checker agent verifies quality.

```
PLAN-CHECKER PROTOCOL:

1. DISPATCH plan-checker agent with:
   - Plan file path
   - Goal statement
   - Must-haves list
   - Quality checklist (from this skill)

2. CHECKER evaluates against checklist:
   - Each gate: PASS / FAIL with evidence
   - Vagueness scan: flag any banned phrases
   - Must-have coverage: matrix showing which tasks cover which must-haves
   - Orphan task detection: tasks not linked to any must-have

3. CHECKER returns:
   - Status: APPROVED / ISSUES FOUND
   - Issues (if any): specific, actionable (not "add more detail")
   - Must-have coverage matrix
   - Recommendations

4. IF ISSUES FOUND:
   - Planner fixes issues (same agent, preserves context)
   - Re-dispatch checker
   - Max 3 iterations
   - After 3: surface remaining issues to user

5. CONFIG GATE:
   - workflow.plan_check: true → run checker (default)
   - workflow.plan_check: false → skip checker, planner self-checks
```

**Checker calibration:** Only flag issues that would cause real problems during execution. An implementer building the wrong thing or getting stuck is an issue. Minor wording preferences are not. Approve unless there are serious gaps.

## Anti-Shortcut System

### Red Flags — STOP

These thoughts mean you are about to produce a low-quality plan:

| Thought | What to do instead |
|---------|-------------------|
| "The implementation is obvious, I don't need a detailed plan" | Obvious implementations have non-obvious edge cases. Write the plan. |
| "I'll figure out the details during execution" | Execution is not planning. Details belong in the plan. |
| "This step is self-explanatory" | To you, not to the executor. Name the files, values, and criteria. |
| "I already know how to do this" | Knowledge is not a plan. Write it down. |
| "The plan is getting too long" | Long plan > vague plan. Completeness over brevity. |
| "I'll add acceptance criteria later" | You won't. Write them now. They take 10 seconds. |
| "This is just boilerplate, no need to specify" | Boilerplate varies by framework. Specify the exact boilerplate. |
| "The user will understand what I mean" | The executor might be a subagent with zero context. Be explicit. |
| "One big task is fine, I'll break it down in execution" | Big tasks hide complexity. Break it down now. |
| "Let me start coding, I'll plan as I go" | That's not planning. `/st:plan` exists for a reason. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Plans change during execution anyway" | Starting with a good plan means smaller changes. Starting with a vague plan means rewriting everything. |
| "Over-planning wastes time" | Under-planning wastes MORE time: wrong direction, rework, missed requirements. |
| "The codebase is simple, I don't need all this" | Simple codebases become complex. Plans document decisions for future readers. |
| "Must-haves are obvious" | If they're obvious, writing them takes 30 seconds. If they're not, you just proved why you need them. |
| "I'll add file paths when I get to that task" | File paths during planning forces you to think about structure. File paths during execution forces you to context-switch. |
| "Acceptance criteria slow me down" | Acceptance criteria ARE the plan. Without them, how do you know you're done? |
| "This is a one-person project, no need for formal plans" | The executor might be a subagent. Or future-you with no context. Plans are for anyone who executes. |

## Quick Reference

```
CORE RULE:
  Every plan step must be executable without asking questions.
  Goal-backward: goal → must-haves → artifacts → tasks.

GOAL-BACKWARD:
  1. GOAL: one sentence, observable outcome
  2. MUST-HAVES: 3-7 truths (not tasks)
  3. ARTIFACTS: concrete files/functions/endpoints
  4. TASKS: steps producing those artifacts

QUALITY GATES (plan-checker verifies):
  □ Goal stated
  □ Must-haves derived (3-7)
  □ Every must-have covered by ≥1 task
  □ No orphan tasks
  □ Exact file paths in every task
  □ Read-first files listed
  □ Acceptance criteria (grep-verifiable)
  □ Expected output (runtime)
  □ Dependencies declared
  □ No vague steps (banned phrases check)
  □ Concrete values specified
  □ TDD per granularity

TASK ANATOMY:
  Files: create / modify / test / read-first
  Steps: concrete action + verification
  Criteria: grep-verifiable + expected output
  Dependencies + must-have trace

MUST-HAVES:
  /st:plan → AI derives from goal (3-7 truths)
  /st:phase-plan → success criteria from ROADMAP.md

PLAN-CHECKER:
  Dispatch after planner. Max 3 iterations.
  Config: workflow.plan_check (default true)
  Calibration: flag real problems, not style

BANNED: "implement", "add validation", "handle errors",
        "set up", "update components", "test it",
        "configure", "integrate", "refactor", "clean up"
        — without specifics.
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping goal-backward, going straight to tasks | Always start from goal. Derive must-haves before writing any tasks. |
| Must-haves that are tasks, not truths | "Create login endpoint" is a task. "User can login" is a truth. Must-haves are truths. |
| Vague steps that pass because planner "knows what they mean" | Executor may be a subagent with zero context. Apply banned-phrase check. |
| No acceptance criteria ("I'll verify at the end") | Every task needs criteria. Without them, "done" is undefined. |
| Missing read-first files | Modifying a file without reading it first leads to wrong assumptions. Always list. |
| Plan with 1 giant task instead of multiple focused tasks | Each task should produce 1-3 files. If more, split. |
| Must-have not covered by any task | Gap in plan. Add task or expand existing one. |
| Orphan task not linked to must-have | Either the task is unnecessary (remove) or a must-have is missing (add). |
| Skipping plan-checker "because plan is simple" | Config controls this, not planner judgment. If `workflow.plan_check` is true, run checker. |
| Forward-planning masquerading as backward | Writing goal + must-haves AFTER writing tasks is not goal-backward. Must-haves must drive task creation, not rationalize it. |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation via `/st:plan` or `/st:phase-plan` |
| `plan-checker-prompt.md` | On demand | When dispatching plan-checker agent |

**Rule:** Most plan creation needs only `SKILL.md`. Load `plan-checker-prompt.md` only when dispatching the checker agent. It is a prompt template, not prerequisite knowledge.

## Integration

**Used by:**
- `/st:plan` — plan quality methodology applied during plan creation (steps 5-8)
- `/st:phase-plan` — same engine, phase context adds must-haves from success criteria

**Skills that pair with plan-quality:**
- `superteam:project-awareness` — provides codebase context, framework detection, config including `workflow.plan_check`
- `superteam:wave-parallelism` — dependency analysis and wave assignment happen after plan quality is verified
- `superteam:tdd-discipline` — plan-quality enforces TDD step inclusion per granularity level
- `superteam:verification` — must-haves from plan become verification checklist post-execution
- `superteam:handoff-protocol` — plan state (checked/unchecked tasks) captured in handoff

**Agent:** `plan-checker` agent uses the quality checklist and must-have coverage matrix from this skill.
````

---

## `plan-checker-prompt.md` Content

````markdown
# Plan Checker — Agent Prompt Template

Reference file for `superteam:plan-quality`. Loaded when dispatching plan-checker agent.

## Purpose

You are verifying plan quality. Your job is to find gaps that would cause problems during execution — NOT to impose style preferences.

## Inputs

You receive:
- **Plan file path** — the plan to check
- **Goal statement** — the desired outcome
- **Must-haves list** — truths that must hold when plan completes
- **Quality checklist** — from plan-quality SKILL.md

## Evaluation Process

### 1. Must-Have Coverage Matrix

For each must-have, identify which task(s) address it:

| Must-Have | Covered by Task(s) | Status |
|-----------|-------------------|--------|
| [must-have 1] | Task 2, Task 5 | ✅ Covered |
| [must-have 2] | — | ❌ GAP |
| [must-have 3] | Task 7 | ✅ Covered |

Any must-have with no covering task = ISSUE.

### 2. Quality Gate Check

For each gate in the checklist, evaluate PASS or FAIL with evidence:

```
□ GOAL STATED → PASS: "User can toggle dark/light mode"
□ MUST-HAVES → PASS: 5 truths listed
□ EXACT FILE PATHS → FAIL: Task 3 says "update components" without naming files
...
```

### 3. Vagueness Scan

Check every task step against banned phrases:
- "implement", "add validation", "handle errors", "set up", "update components", "test it", "configure", "integrate", "refactor", "clean up"

Flag any instance that lacks specifics.

### 4. Orphan Task Detection

For each task, verify it traces to at least one must-have. Tasks without must-have trace = potential scope creep.

## Output Format

```
STATUS: APPROVED / ISSUES FOUND

MUST-HAVE COVERAGE:
  [matrix as above]

GATE RESULTS:
  [PASS/FAIL per gate with evidence]

ISSUES (if any):
  1. [Specific, actionable issue]
  2. [Specific, actionable issue]

RECOMMENDATIONS (optional):
  - [Suggestions that aren't blockers]
```

## Calibration

- **Flag:** Issues that would cause the executor to build the wrong thing or get stuck.
- **Skip:** Wording preferences, style choices, alternative approaches.
- **Approve** unless there are serious gaps. Plans don't need to be perfect — they need to be executable.

Err toward APPROVED with minor recommendations rather than ISSUES FOUND for cosmetic problems. The goal is a plan the executor can follow, not a plan that's aesthetically perfect.
````

---

## Design Decisions

1. **Goal-backward as core methodology** — GSD's must_haves concept and `/st:plan` flow (steps 5-8) both implement outcome-first design. Made this the central organizing principle rather than a checklist item.
2. **Two responsibilities: methodology + discipline** — Follows the pattern from tdd-discipline and wave-parallelism. Methodology teaches the right approach; discipline blocks Claude's shortcuts.
3. **Anti-vagueness as the primary discipline** — Claude's #1 planning failure is vague steps. The banned-phrases table with concrete replacements is the most actionable enforcement tool.
4. **Banned phrases with concrete replacements** — Not just "don't be vague" but showing exactly what concrete looks like. Claude learns better from good/bad pairs (same pattern as tdd-discipline's anti-patterns).
5. **Must-haves as truths, not tasks** — Explicit distinction prevents the common failure of writing tasks first and calling them must-haves. Mirrors verification skill's goal-backward approach.
6. **Plan-checker as separate agent, not self-check** — Self-checking produces "I reviewed my own plan and it looks good." A fresh agent with the quality checklist catches gaps the planner missed.
7. **Max 3 iterations from GSD + Superpowers** — Both plugins converged on 3. Diminishing returns after that; escalate to user.
8. **Config toggle `workflow.plan_check`** — From master design doc. Allows skipping checker for quick tasks while keeping it default-on.
9. **Granularity-aware quality gates** — COARSE plans don't need TDD steps or read-first files. Quality gates scale with granularity. Prevents over-specifying simple tasks.
10. **plan-checker-prompt.md as separate file** — Follows tdd-discipline pattern (testing-anti-patterns.md as separate). Keeps SKILL.md focused on methodology; checker prompt is a dispatch template loaded only when needed.
11. **Must-have coverage matrix** — GSD's plan-checker verifies each success criterion has a task. Formalized as a matrix so gaps are immediately visible.
12. **Task anatomy as required schema** — Making it a schema with required fields per granularity turns guidance into a gate. Every task must have Files, Steps, Acceptance criteria, Dependencies, Must-have trace.
13. **Forward vs backward planning example** — Concrete dark-mode example shows the difference. Without it, "goal-backward" is abstract.
14. **Integration with verification skill** — Must-haves from plan-quality become the verification checklist for the verification skill. Explicit cross-reference ensures the loop closes.
15. **"Executable without asking questions" as core principle** — More actionable than "be specific." If the executor would need to ask a question, the step is incomplete.

## Testing Plan

1. Give Claude a feature request — does it derive must-haves BEFORE writing tasks, or write tasks first?
2. Plan has a step "implement the feature" — does Claude rewrite it with specifics?
3. Plan has must-haves but one has no corresponding task — does Claude detect the gap?
4. Plan has a task not linked to any must-have — does Claude flag it as orphan?
5. Claude writes a plan with vague banned phrases — does it self-correct before submitting to checker?
6. Plan-checker finds issues — does planner fix and re-dispatch within 3 iterations?
7. `workflow.plan_check` is false — does Claude skip the checker agent?
8. COARSE granularity plan — does Claude require file paths + acceptance criteria but NOT TDD steps?
9. FINE granularity plan — does Claude include TDD cycle steps for every task?
10. `/st:phase-plan` — does Claude use success criteria from ROADMAP.md as must-haves (not derive new ones)?
11. `/st:plan` for simple task — does Claude derive must-haves from goal (3-7 truths)?
12. Task has no acceptance criteria — does plan-checker flag it?
13. Task modifies file but no read-first listed — does plan-checker flag it?
14. Claude rationalizes "the plan is obvious, I'll skip must-haves" — does discipline section block this?
15. Plan with 1 giant task (15+ files) — does Claude split it?
16. User says "gọn hơn" (less detail) — does Claude reduce granularity while maintaining quality gates?
17. Plan-checker exceeds 3 iterations — does Claude escalate to user?
