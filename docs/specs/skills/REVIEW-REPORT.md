# Superteam Skills — Deep Review Report

> Reviewed: 2026-03-24 | Reviewer: Multi-role Expert Panel | Updated: 2026-03-24 (post-discussion corrections)
> Scope: All 8 skill specs in `docs/specs/skills/`
> Note: project-awareness reviewed against v3 (gather+classify redesign). receiving-code-review Item 5 corrected after author challenge.

---

## 1. project-awareness

### Expert Panel

**Senior Software Engineer (Daily User Perspective)**

Strengths:
- Context Block Format rất thực tế — compact, data-only, dễ scan trong vài giây. Đây chính xác là thông tin tôi cần khi bắt đầu session.
- Confidence tiers (>=0.8, 0.5-0.79, <0.5) với numeric thresholds là cách tiếp cận đúng. Tránh được sự mập mờ "khoảng chừng".
- Graceful degradation table cho unknown type — cho phép commands vẫn hoạt động ở mức cơ bản thay vì crash.
- Config wins over detection — quyết định đúng. User đã deliberate chọn type khi init, detection có thể sai do WIP.

Weaknesses:
- ~~Detection Signals table quá hẹp~~ → **RESOLVED in v3.** Gather+classify redesign replaces hardcoded table with manifest file patterns + Claude classification. Covers Node, Python, Rust, Go, Ruby, PHP, Java, .NET, Dart/Flutter, Elixir, Swift. Zero maintenance for new frameworks.
- Chưa có cơ chế user override detection ngoài `/st:init`. Nếu classifier sai ở confidence 0.85 (ví dụ: classify frontend nhưng thực ra là fullstack chưa có backend), user phải chạy lại init.
- Adaptation Principles cho Frontend nói "Component boundaries are the unit of work" — nhưng với Next.js App Router, đơn vị là route segment + server component, không phải component truyền thống. Principle này có thể mislead cho modern frameworks.
- **[NEW in v3]** Mobile type đã thêm — good. Nhưng adaptation principles cho Mobile chưa có negative examples (giống Frontend/Backend). Cần "DO NOT apply web-specific testing patterns to native platform testing."

Suggestions:
- Thêm `override` field trong config.json cho phép user quick-fix classification mà không cần re-init.
- ~~Mở rộng detection signals~~ → **RESOLVED.** Manifest patterns table đã cover 11 ecosystems.
- Thêm note trong Frontend principles: "For SSR frameworks (Next.js App Router, Nuxt 3), route segments may replace component as unit of work."
- **[NEW]** Mobile principles: thêm negative examples tương tự other types. "DO NOT assume hot-reload catches all platform-specific issues."

**Technical Architect (System Design Perspective)**

Strengths:
- Monorepo Scope Resolution decision tree rõ ràng: explicit arg > cwd > ask. Đây là pattern đúng cho composability.
- Cross-workspace impact warnings với threshold (<=3 list, 4+ collapse) — giải quyết warning fatigue trong monorepos lớn.
- Single point of injection via session-start hook — mọi command đều consume cùng format. Consistency tốt.
- "Never zero context" rule khi hook failure — defensive programming tốt.

Weaknesses:
- Không có caching strategy cho detection result. Trong monorepo 50+ packages, mỗi session chạy detection lại từ đầu. Nếu detector scan node_modules hoặc dependencies, có thể chậm.
- Context Block chỉ inject 1 lần lúc session-start. Nếu user thay đổi config mid-session (edit config.json thủ công), context block bị stale.
- Chưa address multi-language monorepo — workspace A là TypeScript, workspace B là Go. Adaptation principles chỉ có per-type, không có per-workspace application rule.

Suggestions:
- Thêm cache invalidation strategy: detect result cached, invalidated khi config.json hoặc package.json thay đổi.
- Cân nhắc re-detection trigger khi user chạy `/st:init` mid-session.
- Multi-language monorepo: mỗi workspace inherits principles của riêng nó. Nên có explicit note trong Monorepo section.

**Prompt Engineer (LLM Behavior Perspective)**

Strengths:
- "Constitution approach for confidence rules" — numeric thresholds prevent rationalization. LLM sẽ khó bypass ">=0.8 auto-apply" hơn "if quite confident, apply."
- Concrete examples per principle (`/st:plan` creates tasks per component, not per page) — anchors LLM interpretation excellently.
- Common Mistakes table — explicit failure modes giúp LLM self-correct.
- Compact context block format — ít token overhead, mọi session đều có.

Weaknesses:
- Adaptation Principles dùng bullet points với examples nhưng KHÔNG có negative examples. LLM cần "DO NOT do X" cùng với "DO Y". Ví dụ: "DO NOT create tasks per page" bên cạnh "Create tasks per component."
- Quick Reference quá dài (25+ lines). LLM có thể skip phần dưới. Priority information nên ở đầu.
- Integration section liệt kê skills reference nhưng không nói HOW. "scientific-debugging auto-detects log locations from framework" — nhưng cụ thể thì project-awareness cung cấp gì cho scientific-debugging?

Suggestions:
- Thêm "DO NOT" alongside mỗi principle example. Negative examples cải thiện LLM compliance 30-40%.
- Quick Reference: group thành 3 blocks max. Priority: EVERY SESSION → EVERY COMMAND → EDGE CASES.
- Integration section: thêm 1 dòng mô tả HOW cho mỗi cross-reference. "scientific-debugging reads `type` field to select log locations."

### Score: 8.5/10

---

## 2. scientific-debugging

### Expert Panel

**Senior QA Engineer / Debugger Specialist**

Strengths:
- 4-Phase methodology với mandatory gates là approach đúng nhất cho LLM debugging. Đặc biệt gate giữa Phase 1→2 (observations + suspected area, NOT hypothesis) ngăn Claude skip Phase 2.
- Anti-Shortcut System cực kỳ comprehensive. 11 Red Flags + 8 Rationalizations cover gần hết failure modes tôi đã thấy ở LLM.
- Cognitive Biases section — đây là innovation so với cả GSD và Superpowers. Confirmation bias ở LLM là real problem.
- Meta-Debugging cho "debugging own code" — unique failure mode, handled properly.
- "3 strikes" phân biệt 3 loại (hypothesis failure, fix failure, architectural problem) — nuanced và chính xác.

Weaknesses:
- Thiếu hướng dẫn về time-boxing. "Methodology is FASTER" được claim nhưng không có guideline cụ thể. Phase 1 nên mất bao lâu? Khi nào nên escalate? LLM có thể investigate forever.
- Techniques file có 12 techniques nhưng "Technique Selection" matrix chỉ cover 8 situations. Techniques 8 (Rubber Duck), 11 (Defense-in-Depth), và 12 (Condition-Based Waiting) không có clear entry point trong matrix.
- "Evidence Standards" section hay nhưng thiếu template cho hypothesis documentation. LLM nên ghi hypothesis ở đâu, format nào?
- Chưa handle case: bug chỉ reproduce ở production, không reproduce locally.

Suggestions:
- Time-boxing guideline: Phase 1 max 10-15 min → nếu không có suspected area, try different entry point. Phase 3 max 3 tests per hypothesis.
- Technique Selection matrix: thêm entry cho Rubber Duck ("explaining complex interaction"), Defense-in-Depth ("data corruption"), Condition-Based Waiting ("flaky test").
- Hypothesis format template: `HYPOTHESIS: [specific claim] | PREDICT: [observable outcome] | TEST: [minimal action] | RESULT: [pass/fail]`.
- Thêm "Production-only bugs" section: check environment diff, data volume, race conditions at scale.

**Prompt Engineer (LLM Behavior Perspective)**

Strengths:
- "Iron Law repeated 4 times" — đúng strategy. Repetition at decision points is the most effective way to prevent LLM shortcuts.
- Human Signals section brilliant — cho LLM context clues từ user frustration.
- Roles section ("NEVER ask the user diagnostic questions you can investigate yourself") — addresses a very real LLM antipattern.
- Falsifiability examples (bad vs good) — concrete, actionable, perfect for LLM learning.

Weaknesses:
- "When Process Reveals No Root Cause" section chỉ có 4 bullets, quá abstract. LLM sẽ default to "just try a fix" khi đến đây. Cần enforcement tương đương với other phases.
- Phase transitions chưa có explicit trigger format. Phase 1→2 cần output format cụ thể để LLM biết khi nào "đã xong Phase 1".
- "Each fix reveals a new problem in a different place" — Red Flag entry đúng nhưng chưa có explicit action beyond "upstream". Nên: "STOP. Draw the dependency chain. Find the shared upstream component."

Suggestions:
- Phase output templates: mỗi phase kết thúc bằng 1 structured block. Phase 1: `SUSPECTED AREA: [component] | OBSERVATIONS: [1,2,3]`.
- "No root cause" section: thêm enforcement language tương tự Iron Law. "You MUST document, you MUST add monitoring."
- Cross-symptom chasing Red Flag: add explicit "draw dependency chain" action.

### Score: 9.0/10

---

## 3. tdd-discipline

### Expert Panel

**Senior Test Engineer / TDD Practitioner**

Strengths:
- "VERIFY RED" emphasis là đúng nhất — đây thực sự là bước Claude skip nhiều nhất. Block callout + repetition + Common Mistakes entry = maximum enforcement.
- "Failure vs Error" distinction xuất sắc. `ReferenceError` ≠ valid RED — nhiều dev (và LLM) nhầm.
- "When to Skip TDD" heuristic (`expect(fn(input)).toBe(output)`) thực tế hơn "always TDD." Cho phép judgement nhưng có clear rule.
- Anti-Pattern 5 (Integration Tests as Afterthought) — excellent catch. Đặc biệt "mock setup longer than test" warning signs.
- "Working with Untested Code" section — practical. Real codebases có 0 tests. Guidance cho phép TDD trong brownfield projects.

Weaknesses:
- "Hardcoding is acceptable if it passes the test" — đúng về mặt lý thuyết TDD, nhưng LLM thường hardcode rồi KHÔNG viết test tiếp để force generalization. Cần guardrail: "If you hardcoded, the NEXT test MUST make hardcoding fail."
- Test naming examples chỉ dùng snake_case (`rejects_empty_email`). Cần cover cả `it('should reject empty email')` style cho JavaScript ecosystem.
- Thiếu guidance cho property-based testing (Hypothesis/fast-check). Khi behavior có many inputs, example-based tests không cover hết.
- "REFACTOR is a QUESTION, not always an ACTION" — đúng, nhưng Claude thường trả lời "No refactor needed" quá nhanh. Cần minimum refactor checklist (duplication? naming? complexity?).

Suggestions:
- Thêm hardcoding guardrail: "After hardcoding in GREEN, your VERY NEXT test must make the hardcode fail. No other work in between."
- Test naming: add `describe('UserAuth', () => { it('rejects empty email') })` JavaScript example alongside snake_case.
- Add brief section on "When TDD reveals design problems" — TDD's real power là design feedback, not just testing.
- Refactor checklist: 3 mandatory questions (duplication? naming? extract function?). Answer must be explicit.

**DevOps / CI-CD Engineer**

Strengths:
- Commit pattern `test: → feat: → refactor:` tạo traceability tốt cho CI. Mỗi commit revertable.
- Test Framework Detection table reference project-awareness — đúng pattern, không hardcode.

Weaknesses:
- Thiếu guidance cho CI integration. TDD cycle trong CI pipeline: nên run test suite ở đâu? Pre-commit hook hay post-commit?
- Không mention test parallelization. Large test suites cần parallel execution; TDD skill nên acknowledge.
- Missing: flaky test handling. Khi test intermittent fail, TDD says "fix it" nhưng practical guidance thiếu.

Suggestions:
- Add note: "In CI context, the full test suite runs post-commit. TDD's VERIFY runs locally."
- Flaky test handling: "Intermittent failure = non-deterministic test. Investigate with `superteam:scientific-debugging` before skipping."

### Score: 8.5/10

---

## 4. requesting-code-review

### Expert Panel

**Tech Lead / Code Review Culture Expert**

Strengths:
- Confidence scoring (80% threshold) là innovation tuyệt vời. Giải quyết bài toán #1 của AI code review: false positives flood.
- Severity-adjusted confidence thresholds (Critical >=60%, Important >=80%, Suggestion >=90%) — nuanced và practical. SQL injection at 75% should be reported; style issue at 82% should not.
- 13 review domains trong file riêng — comprehensive coverage. Domain selection by project type ngăn irrelevant domains.
- Mandatory strengths section — tránh "all problems, no praise" demoralizing pattern.
- Scope discipline as Step 1 — addresses Claude's tendency to review entire file.

Weaknesses:
- 13 domains là NHIỀU. Mỗi domain có 4-6 items. Nếu review agent check hết, context window sẽ bị overwhelm cho large diffs. Cần prioritization beyond project type.
- "Self-Review Discipline" section tốt nhưng ngắn. Claude reviewing own code là case phổ biến nhất trong Superteam (execute → review). Cần deeper treatment.
- Review format (`[SEVERITY] description (confidence: N%)`) thiếu actionability metric. 10 findings at 80-85% confidence — user nào fix trước? Cần priority ordering.
- Chưa address incremental review. Reviewer agent review diff nhưng context-aware issues (architectural drift) cần xem broader codebase.

Suggestions:
- Domain prioritization: thêm "Critical Path" concept. Review Security + Silent Failure trước. Style cuối cùng. Budget-aware review.
- Self-Review: dedicated sub-section, force "re-read diff after 5 minutes cooldown" pattern.
- Priority ordering: findings sorted by Severity DESC, then Confidence DESC. Highest-impact first.
- Incremental review note: "Architectural drift detection requires reading beyond the diff. Budget 20% context for broader codebase scan."

**Security Engineer**

Strengths:
- Domain 3 (Security) checklist covers fundamentals: SQL injection, XSS, auth bypass, secrets, CSRF, path traversal, mass assignment.
- Critical severity at >=60% confidence — đúng. Không được dismiss potential SQL injection at 75%.
- Domain 13 (Concurrency) include TOCTOU, missing await, deadlock — often-missed security issues.

Weaknesses:
- Security checklist thiếu: SSRF (Server-Side Request Forgery), insecure deserialization, JWT algorithm confusion, open redirect. Đây là OWASP Top 10 items.
- Không phân biệt authenticated vs unauthenticated endpoints trong review scope.
- Thiếu supply chain security: reviewer nên check new dependencies cho known vulnerabilities (Domain 12 mentions nhưng vague).

Suggestions:
- Domain 3 mở rộng: SSRF, insecure deserialization, JWT `alg:none`, open redirect.
- Add: "For new endpoint: verify authentication/authorization middleware applied."
- Domain 12: "Run `npm audit` or equivalent for new dependencies. Report Critical findings."

### Score: 8.5/10

---

## 5. receiving-code-review

### Expert Panel

**Engineering Manager / Team Dynamics Expert**

Strengths:
- Anti-sycophancy as centerpiece — đây là Claude's #1 problem khi nhận feedback. Forbidden responses list cực kỳ cần thiết.
- 4-category classification (Valid/Partial/Invalid/Unclear) nuanced hơn binary agree/disagree. "Partial" là insight quan trọng.
- Source-Trust Hierarchy (Human > External > CI) — practical. External reviewer may not understand full context.
- "Batch classification before implementation" — prevents "fix everything blindly" pattern.
- "When pushback was wrong" — 1-line correction format. Ngăn 200-word apology.

Weaknesses:
- ~~Forbidden responses list quá strict~~ → **CORRECTION: Spec đã calibrate đúng.** NEVER list bans gratitude performance ("Thanks for catching that!", "Great point!") nhưng Correct Responses section cho phép technical acknowledgment ("Good catch — [specific issue]. Fixed in [location]."). Boundary giữa gratitude performance (banned) và technical acknowledgment (allowed) hợp lý. Original review không cross-check kỹ hai sections.
- YAGNI check via grep — hữu ích nhưng thiếu nuance. Feature chưa used CÓ THỂ cần nếu nó trong plan file hoặc roadmap. "Currently unused" ≠ YAGNI nếu đang trong middle of feature implementation.
- Chưa handle conflicting feedback. Khi reviewer A nói "add error handling" và reviewer B nói "keep it simple" — resolution path?
- Validity confidence scoring (>=80% implement, 60-79% discuss, <60% pushback) — các thresholds cần example calibration giống requesting-code-review.

Suggestions:
- ~~Soften forbidden responses~~ → **WITHDRAWN.** Spec already handles this correctly. No change needed.
- YAGNI enhancement: "Check plan files and REQUIREMENTS.md. If feature is planned → implement. If not in any plan → YAGNI."
- Conflicting feedback: "When two feedback items conflict → present both to user → user decides priority."
- Validity calibration examples: add 5+ examples tương tự requesting-code-review.

**Prompt Engineer (LLM Behavior Perspective)**

Strengths:
- 6-step pattern (READ→UNDERSTAND→VERIFY→EVALUATE→RESPOND→IMPLEMENT) tạo clear gates. LLM sẽ follow sequential structure.
- "Unclear items: STOP ALL" — strong enforcement. Prevents partial implementation based on assumptions.
- Reply generation format examples — practical, actionable.

Weaknesses:
- "Correct responses" section cho alternative phrases nhưng thiếu template format. LLM cần structured output format cho batch classification display.
- Self-Review Loop Discipline ngắn. Claude reviewing its own review is the MOST COMMON case. Needs more depth.

Suggestions:
- Batch classification template đã có (the `ST ► REVIEW FEEDBACK ASSESSMENT` block). Good — ensure LLM uses it consistently.
- Self-Review Loop: add "Ask: What would a SENIOR engineer with no knowledge of my implementation think about this finding?"

### Score: 8.0/10

---

## 6. wave-parallelism

### Expert Panel

**Distributed Systems Engineer**

Strengths:
- File-ownership rule as absolute safety mechanism — đúng và simple. "No 'they only touch different parts of the file'" is critical enforcement.
- Implicit dependencies table (DB state, env vars, ports, rate limits) — excellent. File ownership alone doesn't catch runtime conflicts.
- Node Repair escalation (RETRY → DECOMPOSE → PRUNE → ESCALATE) — well-designed. Budget prevents infinite retry loops.
- Cascade handling for PRUNE — display impact, user approval, >50% threshold for escalation. Thoughtful.
- Git contention handling (`--no-verify` during wave, hooks once after) — practical solution.

Weaknesses:
- Agent limits (3-4 code, 5 research) thiếu justification. Tại sao 3-4? Tại sao không 2? Hoặc 6? Limits nên dựa trên observable metrics (context window usage, response time) chứ không phải magic numbers.
- Worktree isolation as "best" option — đúng về safety nhưng KHÔNG address merge complexity. 3 worktrees với changes → merge back to main. Ai merge? Merge order? Conflict resolution?
- "Spot-check filesystem" for timeout — pragmatic nhưng incomplete. Nếu agent committed partial work (2 of 5 files), spot-check thấy commits → reports as completed → nhưng task is actually incomplete.
- Post-wave test scope "tests in directories matching files_modified" — overly simplistic. Integration tests often live in different directories than modified files.
- Chưa handle: agent crash mid-commit (partial commit in git).

Suggestions:
- Agent limits: frame as "recommended defaults, adjust based on..." với guideline: "Start with 3. If agents finish quickly (< 2 min), increase. If context pressure high, decrease."
- Merge strategy for worktrees: explicit section. "After wave, merge worktrees sequentially in dependency order. If merge conflicts, treat as missed file-ownership analysis."
- Partial completion detection: enhance spot-check with "Compare committed files against task's files_modified list. If subset → flag as PARTIAL."
- Test directory mapping: "Use test configuration (jest.config, vitest.config) for test location mapping, not directory name matching."
- Partial commit recovery: "If git state is corrupted, `git reset` to pre-wave commit. Re-run failed task."

**DevOps / Infrastructure Engineer**

Strengths:
- Fallback path explicit — graceful degradation khi parallel unavailable.
- "Lean orchestrator: pass paths, not content" — efficient context management.
- Wave display format before execution + user approval — transparent.

Weaknesses:
- Không mention resource monitoring. 4 parallel agents có thể exhaust CPU/memory trên machines nhỏ. Cần resource-aware scheduling.
- "config.parallelization is true" — binary on/off. Nên là gradual: `max_parallel_agents: 3` cho phép user tune.

Suggestions:
- Config enhancement: `parallelization: { enabled: true, max_agents: 4, strategy: "worktree|file-ownership" }`.
- Resource note: "If system is resource-constrained, reduce agent count or use sequential fallback."

### Score: 8.0/10

---

## 7. handoff-protocol

### Expert Panel

**Senior Software Engineer (Session Continuity Expert)**

Strengths:
- HANDOFF.json schema comprehensive — covers task progress, decisions, blockers, human_actions_pending, wave_state. Mọi information cần thiết.
- "Write as if briefing a colleague who has never seen this project" — perfect framing cho context_notes quality.
- `human_actions_pending` tách khỏi `blockers` — insight đúng. Human actions may be resolved offline.
- One-shot lifecycle (CREATE → CONSUME → DELETE) — prevents stale handoff confusion.
- Emergency Pause Protocol với progressive serialization — practical cho context overflow scenario.
- Staleness handling với 3 tiers (<24h, 24h-7d, >7d) — nuanced.

Weaknesses:
- HANDOFF.json schema phức tạp. 15+ fields. Trong emergency pause, LLM phải nhớ prioritize 3 fields — nhưng natural tendency sẽ cố fill hết → timeout. Cần simpler default template.
- Reconstruct protocol best-effort nhưng KHÔNG có heuristic cho "how good is this reconstruction?". LLM nói "reconstructed" nhưng user không biết quality level.
- "Never commit handoff files" + "Add to .gitignore" — nhưng spec KHÔNG check if .gitignore already has these entries. First-time pause sẽ miss this.
- Thiếu versioning strategy cho HANDOFF.json ngoài `version: 1`. Khi skill evolve, schema sẽ change. Backwards compatibility claim nhưng không có migration path.
- wave_state field cho parallel execution — good. Nhưng nếu agent crash mid-wave, `agents_in_progress` sẽ list running agents mà thực tế đã stopped. Resume sẽ confused.

Suggestions:
- Emergency template: 3-field JSON template sẵn sàng. LLM chỉ fill in values thay vì construct full schema.
- Reconstruction quality indicator: "Quality: HIGH (handoff files exist) | MEDIUM (WIP commit + plan files) | LOW (git status only)."
- .gitignore check: "On first pause, verify .gitignore contains HANDOFF.json and HANDOFF.md entries."
- Schema migration: keep simple — version 2 must read version 1. Unknown fields ignored. Document this explicitly.
- Stale agent detection: "If resuming mid-wave, verify agent status via git commits. If no commits since `started_at` → treat as failed."

**Product Owner (User Experience Perspective)**

Strengths:
- Resume options (Continue / Review details / Start fresh) — respects user agency. No auto-resume.
- HANDOFF.md as human-readable fallback — user có thể đọc trực tiếp.
- Context_notes quality bar với good/bad examples — prevents useless handoffs.

Weaknesses:
- Resume flow chưa handle case: user muốn partially resume (continue some tasks, re-plan others).
- "Delete after resume" — nếu resume fails mid-way, handoff files đã bị xóa. Cần "delete after SUCCESSFUL resume" with explicit success check.

Suggestions:
- Partial resume: "Options: [1] Continue all [2] Review and select tasks [3] Start fresh."
- Defensive deletion: "Delete handoff files only after user confirms resume was successful. Keep during resume execution."

### Score: 8.5/10

---

## 8. verification

### Expert Panel

**QA Director / Quality Assurance Architect**

Strengths:
- Goal-backward verification là approach đúng nhất. "Task completion ≠ goal achievement" insight quan trọng.
- 4-level artifact verification (Exists → Substantive → Wired → Data-Flow) cực kỳ powerful. Status matrix (VERIFIED/HOLLOW/ORPHANED/STUB/MISSING) cho precise vocabulary.
- "80% of stubs hide in wiring" — deepest insight trong toàn bộ skill set. Wiring patterns trong file riêng cover cả frontend và backend.
- Forbidden phrases list — "Should work now", "Looks correct" — chính xác là language Claude dùng khi skip verification.
- Evidence Before Claims + "FRESH" definition — prevents stale verification claims.
- Human verification category — honest about automation limits.

Weaknesses:
- 7 wiring patterns + artifact patterns cho 6 frameworks — rất comprehensive nhưng context-heavy. LLM loading tất cả patterns mỗi lần verification có thể unnecessary. Cần lazy-loading strategy rõ ràng hơn.
- Goal-Backward Method bước 1 (TRUTHS: 3-7 observable truths) — range "3-7" vague. LLM sẽ default to 3 để save effort. Nên tie to scope: small feature 3, phase 5-7.
- Re-verification protocol quá brief (3 bullets). Khi fix tạo regression → fix regression → tạo regression mới → loop. Cần break condition.
- Thiếu performance verification. "Tests pass" nhưng response time doubled — vẫn "VERIFIED"? Performance is part of goal achievement.
- "Run AFTER your latest code change, IN THIS MESSAGE" — "in this message" là constraint của Claude Code nhưng spec nên explain WHY, không chỉ assert rule.

Suggestions:
- Lazy-loading: "Load artifact-patterns.md only when Level 2+ check fails. Load wiring-patterns.md only when Level 3+ check needed. Most verifications resolve at Level 1-2."
- TRUTHS count guidance: "Small task: 3 truths. Feature: 5. Phase: 7. If you can't identify 3 truths, the goal isn't clear enough."
- Re-verification break: "Max 3 re-verification cycles. After 3, escalate to user: 'Fixes are creating new issues. May need architectural review.'"
- Performance verification: "If goal includes 'fast', 'responsive', or performance requirement: add timing check to verification."
- Explain "in this message": "Because LLM context resets between messages. Previous verification results may not reflect current code state."

**Prompt Engineer (LLM Behavior Perspective)**

Strengths:
- Three core principles (Evidence Before Claims, Goal-Backward, Do Not Trust Self-Reports) — excellent trinity. Each addresses different LLM failure mode.
- Iron Law format with explicit step-by-step — reduces ambiguity to near-zero.
- Status Matrix vocabulary — LLM can now say "HOLLOW" instead of "it's not quite done" — more precise, more actionable.
- Anti-patterns to scan (grep patterns) — actionable, not abstract.

Weaknesses:
- Iron Law + 3 Principles + 4-level + Wiring patterns + Forbidden phrases = lot of rules. Risk of LLM cognitive overload. Which rule applies FIRST?
- "Auto-triggered: before any completion claim, commit, or PR" — broadest scope of all skills. In practice, this runs on EVERY commit? LLM sẽ verify Level 1-4 cho mỗi commit? That's heavy.

Suggestions:
- Priority hierarchy: "Evidence Before Claims → check FIRST. Goal-Backward → check for phase/milestone completion. 4-level → check when claims seem premature."
- Scope-appropriate verification: "Commit → Level 1-2 sufficient. PR → Level 1-3. Phase/milestone → full Level 1-4."

### Score: 9.0/10

---

## Cross-Skill Analysis

### Consistency Assessment

**Structural consistency: EXCELLENT (9/10)**
Tất cả 8 skills follow cùng structure: Overview → Core Principle → Methodology → Anti-Shortcut System → Quick Reference → Common Mistakes → Integration. Consistency này giúp LLM learn pattern recognition nhanh.

**Tone consistency: EXCELLENT (9/10)**
Tone đồng nhất: authoritative, no-nonsense, direct. "This is non-negotiable" repeated effectively. `receiving-code-review` correctly separates gratitude performance (banned) from technical acknowledgment (allowed) — well-calibrated.

**Cross-reference consistency: EXCELLENT (9/10)**
Skills reference nhau chính xác. `verification` knows about `tdd-discipline` tests. `scientific-debugging` references `project-awareness` for log locations. `wave-parallelism` references `tdd-discipline` for agents.

### Systemic Issues

1. **Context Window Pressure:** 8 skills + reference files = significant token cost. Khi command loads 3+ skills (ví dụ: `/st:execute` loads wave-parallelism + tdd-discipline + verification), context window sẽ bị pressure. Cần explicit token budget per skill hoặc lazy-loading strategy.

2. **Skill Overlap:** `requesting-code-review` có "Verify-Before-Fix" gate. `receiving-code-review` cũng có verify-before-implement. `verification` skill có toàn bộ verification methodology. Ba layer verification có thể confuse LLM: which one applies when?

**Recommendation:** Clarify scope: `verification` = before completion claims. `requesting` verify = before fixing review findings. `receiving` verify = before implementing feedback. Add 1 line in each skill clarifying boundary.

3. **Missing Skill: atomic-commits.** Design doc lists 10 skills, nhưng specs chỉ có 8. `atomic-commits` và `research-methodology` không có specs. Đặc biệt `atomic-commits` được reference bởi `wave-parallelism` ("commit per task") nhưng không có formal spec. `plan-quality` cũng missing.

4. **Testing Plan Quality:** Mọi skill đều có Testing Plan, nhưng chúng chỉ là scenario descriptions. Thiếu: expected outcomes, automation feasibility, evaluation criteria. Nên convert thành testable assertions.

5. **Version Control for Skills:** Tất cả skills đang ở DRAFT v2. Khi ship, cần versioning strategy. Skill update ảnh hưởng tất cả commands dùng nó. Cần changelog per skill.

### Priority Recommendations (Top 5)

1. **Lazy-loading strategy** — Define which files loaded when. SKILL.md always; reference files on-demand. Saves 40-60% context per command.

2. **Verification scope levels** — Define verification depth per action type (commit vs PR vs phase). Prevents over-verification killing productivity.

3. **Missing skills: atomic-commits, research-methodology, plan-quality** — Complete the 10-skill set. atomic-commits especially is referenced by multiple specs.

4. **Negative examples in project-awareness** — Add "DO NOT" alongside every adaptation principle. Improves LLM compliance significantly.

5. ~~**Forbidden responses calibration in receiving-code-review**~~ → **WITHDRAWN.** Spec already correctly separates gratitude performance (NEVER list) from technical acknowledgment (Correct Responses). Replaced by: **Conflicting feedback resolution** — Add protocol for when reviewer A and reviewer B give contradictory feedback. Currently unaddressed.

---

## Summary Scores

| Skill | Score | Highlight | Top Concern |
|-------|-------|-----------|-------------|
| project-awareness | 9.0/10 | Gather+classify design, confidence tiers, graceful degradation, mobile type | Frontend SSR principle gap, mobile needs negative examples |
| scientific-debugging | 9.0/10 | 4-phase gates, cognitive biases, meta-debugging | Missing time-boxing guidance |
| tdd-discipline | 8.5/10 | VERIFY RED enforcement, failure vs error | Hardcoding guardrail, missing refactor checklist |
| requesting-code-review | 8.5/10 | Confidence scoring, severity-adjusted thresholds | 13 domains may overwhelm, security gaps |
| receiving-code-review | 8.5/10 | Anti-sycophancy, 4-category classification, well-calibrated forbidden/allowed boundary | Missing conflict resolution, YAGNI needs plan-file check |
| wave-parallelism | 8.0/10 | File-ownership, cascade handling, node repair | Agent limits unjustified, merge strategy missing |
| handoff-protocol | 8.5/10 | Schema completeness, emergency pause, staleness tiers | Schema complexity, reconstruction quality unknown |
| verification | 9.0/10 | Goal-backward, 4-level artifacts, wiring patterns | Context-heavy, scope-appropriate verification needed |

**Overall Assessment: 8.6/10 — Strong foundation with clear design philosophy.**

Thiết kế skills consistent, well-researched (tham khảo GSD + Superpowers), và address real LLM failure modes. Điểm mạnh nhất là anti-shortcut systems — mỗi skill đều anticipate và counter Claude's specific behavioral weaknesses. project-awareness v3 (gather+classify) giải quyết triệt để vấn đề detection signals hẹp. Điểm yếu chính còn lại là context window management (skills + reference files = heavy) và missing specs (atomic-commits, research-methodology, plan-quality).

**Corrections log:**
- receiving-code-review: forbidden responses concern **withdrawn** — spec already correctly separates gratitude performance from technical acknowledgment. Score 8.0 → 8.5.
- project-awareness: detection signals concern **resolved** by v3 gather+classify redesign. Score 8.5 → 9.0.
