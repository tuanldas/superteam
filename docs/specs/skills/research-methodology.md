# Skill Spec: research-methodology

> Status: DRAFT v1 | Created: 2026-03-24

---

## Frontmatter

```yaml
---
name: research-methodology
description: >
  Use when conducting research before planning or implementation.
  Enforces structured investigation (4-area coverage), source triangulation,
  evidence-over-assumption discipline, and synthesis quality gates that
  prevent shallow or skipped research.
---
```

---

## SKILL.md Content

````markdown
---
name: research-methodology
description: >
  Use when conducting research before planning or implementation.
  Enforces structured investigation (4-area coverage), source triangulation,
  evidence-over-assumption discipline, and synthesis quality gates that
  prevent shallow or skipped research.
---

# Research Methodology

## Overview

Research Methodology prevents Claude from skipping research, doing shallow research, or treating research as a checkbox activity. It applies across contexts — from deep 4-agent phase research to lightweight 1-agent focused research. The methodology scales by depth, but the discipline is constant.

**Two responsibilities:**
1. **Methodology** — 4-area coverage model, depth calibration, source triangulation, evidence evaluation, synthesis protocol.
2. **Discipline** — anti-shortcut rules that resist Claude's defaults of skipping research, relying on training data alone, confirmation bias, and premature conclusions.

## Core Principle

```
RESEARCH BEFORE DECISIONS. EVIDENCE BEFORE ASSUMPTIONS.

Your training data is stale. Your "knowledge" is a guess.
The codebase has patterns you haven't read. The ecosystem has changed.
If you cannot cite a SOURCE for a claim, it is an assumption, not a finding.

Never recommend a technology, pattern, or approach without investigating alternatives.
Never skip research because the answer "seems obvious."
```

This is non-negotiable. No time pressure, no "I already know this," no user request overrides this.

## Roles

```
USER = Decision Maker.  Approves scope, reviews findings, makes final choices.
CLAUDE = Researcher.  Investigates, synthesizes, presents options with evidence.

NEVER present a single option as "the answer."
NEVER assume user wants what you'd recommend. Present trade-offs.
"I recommend X" is fine. "Here's X" without alternatives is not.
```

## Research Depth Calibration

This skill is used by commands at different depth levels. Match depth to context.

| Context | Depth | Areas | Agents | Output |
|---------|-------|-------|--------|--------|
| `/st:phase-research` | Deep | 4 areas, all required | 4 parallel + 1 synthesizer | 4 files + SUMMARY.md |
| `/st:init` | Deep | 4 areas + optional extras, 2 waves | 4+ parallel + 1 synthesizer | research/ directory |
| `/st:brainstorm` | Medium | 2 rounds (broad → focused) | AI direct (no subagents) | Inline findings |
| `/st:plan` (optional) | Light | 1 focused area | 1 researcher | 1-2 page inline |

**The methodology applies at ALL depths.** Even light research must triangulate sources and present alternatives. Deep research just does it more thoroughly.

## The Four Research Areas

Each area has a specific scope. Scope boundaries prevent agents from overlapping or producing contradictory recommendations.

### Area 1: Stack

Technologies, libraries, tools suitable for the task. Compare options, recommend with rationale.

**Covers:** Language/framework choices, library comparison, tool selection, version requirements.
**Does NOT cover:** How to organize code (Architecture), what competitors do (Landscape), what could go wrong (Pitfalls).
**Output criteria:** 2-3 options per key decision, comparison table with project-specific criteria, recommendation with evidence.

### Area 2: Landscape

Existing solutions, industry patterns, table stakes vs differentiators.

**Covers:** Competing implementations, reference architectures, industry norms, prior art.
**Does NOT cover:** Which specific tech to use (Stack), how to structure code (Architecture).
**Output criteria:** Comparison against project-specific criteria (not just feature lists), table stakes identified, differentiators highlighted.

### Area 3: Architecture

Code organization, patterns, data flow, component structure.

**Covers:** File structure, design patterns, data flow, component boundaries, API design.
**Does NOT cover:** Tech stack selection (Stack), competitor analysis (Landscape).
**Depends on:** Stack findings (architecture decisions need tech context).
**Output criteria:** Proposed structure with rationale, data flow diagram (textual), pattern choices with trade-offs.

### Area 4: Pitfalls

Common mistakes, anti-patterns, edge cases, security risks specific to the domain + chosen stack.

**Covers:** Known failure modes, security concerns, performance traps, migration risks, edge cases.
**Does NOT cover:** Architecture proposals (Architecture), tech selection (Stack).
**Depends on:** Stack + Architecture findings (pitfalls are specific to chosen tech and structure).
**Output criteria:** Specific pitfalls (not generic "be careful"), severity ranking, mitigation for each.

### Cross-Area Dependencies

```
Wave 1 (independent):  Stack + Landscape
    ↓ (Stack findings feed into Wave 2)
Wave 2 (dependent):    Architecture (needs Stack) + Pitfalls (needs Stack + Architecture)
```

This wave order is used by `/st:phase-research` and `/st:init`. Each wave completes before the next starts.

## Research Protocol

```
Phase 1: SCOPE DEFINITION
    ↓ (gate: research question is specific and bounded)
Phase 2: MULTI-SOURCE INVESTIGATION
    ↓ (gate: 3+ independent sources consulted per key claim)
Phase 3: EVIDENCE EVALUATION
    ↓ (gate: findings ranked by evidence quality)
Phase 4: SYNTHESIS & PRESENTATION
```

### Phase 1: Scope Definition

1. **Define the research question explicitly.** "What are we trying to learn?" in one sentence.
2. **Bound the scope.** What is in scope? What is explicitly out of scope?
3. **Identify the decision.** What does the user need to DECIDE after this research?
4. **Check existing knowledge.** Scan codebase for existing patterns, tech already in use.

**Gate:** Cannot proceed until the research question is specific enough to be answered. "Research authentication" is too broad. "Compare JWT vs session-based auth for this Express API with these constraints" is specific.

### Phase 2: Multi-Source Investigation

Three source categories. Minimum 2 of 3 required for key claims.

| Category | Sources | Strength |
|----------|---------|----------|
| **Web** | Official docs, tutorials, issue trackers, benchmarks, blog posts | Current, external |
| **Codebase** | Existing patterns, conventions, dependencies already in use | Proven in this project |
| **Ecosystem** | npm/pip/cargo stats, GitHub stars/issues, release cadence, community activity | Adoption signals |

For each finding: record the **source**, the **claim**, and the **confidence level**.

**Gate:** Cannot proceed with fewer than 3 independent data points for key claims. Single-source claims must be flagged as low confidence.

### Phase 3: Evidence Evaluation

1. **Rank findings** by evidence quality (see Evidence Standards below).
2. **Identify conflicts.** When sources disagree, do NOT resolve silently — present both sides with evidence quality.
3. **Separate facts from opinions.** FACTS are documented and verifiable. OPINIONS are blog posts, "best practices" without data, experience reports.
4. **Check staleness.** Documentation version matches project? Blog post date within 18 months? Package still actively maintained?

**Gate:** Every recommendation must cite at least one strong evidence source. Recommendations with only weak evidence must be flagged.

### Phase 4: Synthesis & Presentation

1. **Synthesize** findings into actionable recommendations.
2. **Present 2-3 options** for each key decision. Never just one.
3. **For each option:** pros, cons, when to use, evidence supporting it.
4. **Identify unknowns.** What remains UNKNOWN after research? Honest gaps.
5. **Conflict resolution:** When sources disagree, present both with evidence quality rating. User decides.

## Evidence Standards

| Strong evidence | Weak evidence |
|----------------|---------------|
| Official documentation (version-matched) | Blog post without benchmarks |
| Benchmarks with methodology | "In my experience..." |
| Existing codebase pattern (you read the code) | Training data memory ("I know that...") |
| Issue tracker with reproduction steps | Stack Overflow answer (may be outdated) |
| Package download stats + release dates | GitHub stars alone |
| Verified working example in codebase | "Should work" without testing |
| Changelog/release notes | Second-hand reports |

**Training data is ALWAYS weak evidence.** Your training data is a snapshot of the internet at a point in time. Verify externally before presenting as fact.

**Source staleness checks:**
- Documentation: version must match project's version
- Blog posts: older than 18 months → flag as potentially outdated
- Codebase patterns: current code is always strong evidence
- Package stats: check last release date, open issues count

## Cognitive Biases in Research

| Bias | Trap | Antidote |
|------|------|----------|
| **Confirmation** | Searching for evidence that supports your initial preference | Search for evidence AGAINST your top recommendation first |
| **Familiarity** | Recommending tools/patterns you "know" from training data | Include at least one option you haven't previously recommended |
| **Authority** | Treating popular opinion as truth ("React is best for...") | Evaluate on project-specific criteria, not general reputation |
| **Anchoring** | First technology found becomes the default, others compared to it | Evaluate each option independently before comparing |
| **Recency** | Newest library/version assumed best | Check stability, community size, production readiness |
| **Survivorship** | Only looking at successful projects using X | Search for failure stories, migration-away-from posts |

## Synthesis Protocol

When multiple research agents produce output (phase-research, init), the synthesizer must:

1. **Read all outputs completely.** Not just summaries or first paragraphs.
2. **Identify agreements.** Where all agents converge → high confidence.
3. **Surface conflicts.** Where agents disagree → present both sides with evidence.
4. **Cross-validate.** If Stack recommends X but Pitfalls warns about X → highlight the tension.
5. **Rank recommendations** by evidence strength, not by word count or confidence language.
6. **Produce SUMMARY.md** with: key findings, recommendations, conflicts, unknowns.

**Gate:** SUMMARY.md must address conflicts. If it mentions none, the synthesizer missed something — there are always trade-offs.

## Anti-Shortcut System

### Red Flags — STOP

These thoughts mean you are about to violate the methodology:

| Thought | What to do instead |
|---------|-------------------|
| "I already know the best approach" | Your training data is a guess. Verify against current sources. |
| "Research isn't needed for this" | The command already decided research is needed. Do it properly. |
| "Let me quickly mention a few options" | Quick = shallow. Follow the protocol. Investigate each option. |
| "X is the industry standard" | Says who? Cite the source. Industry standards change. |
| "Everyone uses X" | Popularity is not evidence of fitness. Check trade-offs for THIS project. |
| "Based on my knowledge..." | Your knowledge is training data. Find a current source. |
| "I'll research this later / in more detail" | Research happens NOW. This IS the research step. |
| "The user probably wants X" | Present options. User decides. Your job is to inform, not assume. |
| "This technology is better because it's newer" | Newer is not better. Compare on actual criteria. |
| "Let me skip Landscape, it's obvious" | No area is skippable at Deep depth. Even "obvious" domains have surprises. |

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Simple project doesn't need research" | The command determined research is needed. Depth varies, methodology doesn't. |
| "I'm an AI, I already know this domain" | You know what your training data said. The ecosystem may have changed. |
| "User is in a hurry" | Shallow research leads to wrong decisions. 20 min research saves days of rework. |
| "There's really only one good option" | Then research will confirm that quickly. If there's truly one option, proving it takes 5 minutes. |
| "Research is done, just need to write it up" | Writing IS research. Synthesis reveals gaps. If you can't write it clearly, you haven't understood it. |
| "The codebase already uses X, so we should keep using X" | Consistency has value, but verify X is still the right choice. Present the trade-off. |
| "I found a great article that covers everything" | One source is not research. Cross-reference with at least 2 more. |
| "The official docs say to do it this way" | Docs describe one way. Are there alternatives? What are the trade-offs? |

## Quick Reference

```
IRON LAW:
  RESEARCH BEFORE DECISIONS. EVIDENCE BEFORE ASSUMPTIONS.
  Training data is not evidence. Cite sources or flag as assumption.

FOUR AREAS:
  1. Stack: tech options, compare, recommend
  2. Landscape: existing solutions, table stakes vs differentiators
  3. Architecture: code org, patterns, data flow (needs Stack)
  4. Pitfalls: risks, anti-patterns, edge cases (needs Stack + Arch)

WAVE ORDER:
  Wave 1: Stack + Landscape (independent)
  Wave 2: Architecture + Pitfalls (depends on Stack)

PROTOCOL:
  1. Scope (bound the question)
     → gate: specific research question
  2. Investigate (3+ sources, 2+ categories)
     → gate: 3+ independent data points per key claim
  3. Evaluate (rank evidence, surface conflicts)
     → gate: every recommendation cites strong evidence
  4. Synthesize (options, trade-offs, unknowns)

DEPTH:
  Deep (phase-research, init): 4 areas, parallel agents, full output
  Medium (brainstorm): 2 rounds, inline
  Light (plan): 1 area, focused, 1-2 pages

SOURCES (min 2 of 3 categories):
  Web (docs, benchmarks, issues) | Codebase (patterns, deps) | Ecosystem (stats, releases)

NEVER:
  Single option without alternatives | Claims without sources |
  Skip areas at Deep depth | Trust training data alone |
  Resolve conflicts silently | Skip codebase scan
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Recommending a technology without checking alternatives | Always present 2-3 options with trade-offs. Even if one is clearly better, show why. |
| Citing training data as fact ("React 18 introduced...") | Verify via web search or docs. Training data may be wrong or outdated. |
| Skipping codebase scan | Existing patterns are the strongest evidence. The project already uses tools — check them first. |
| Research output is a knowledge dump, not actionable | Every finding must answer: "So what? What should the user DO with this?" |
| Resolving conflicts between sources silently | Surface conflicts explicitly. User decides. Research informs, doesn't decide. |
| All recommendations are the same technology/approach | Check for familiarity bias. Force yourself to evaluate at least one unfamiliar option. |
| Research is broad but shallow (mentions many things, investigates none) | Better to deeply investigate 3 options than shallowly mention 10. |
| Pitfalls section is generic ("watch out for performance") | Pitfalls must be specific to THIS stack, THIS architecture, THIS domain. |
| Landscape section only lists competitors without analysis | Compare on criteria relevant to the project, not just list names. |
| SUMMARY.md has no conflicts section | There are ALWAYS trade-offs. No conflicts = missed something. |

## Context Budget

| File | When to Load | Trigger |
|------|-------------|---------|
| `SKILL.md` | Always | Skill invocation (via init, phase-research, brainstorm, or plan) |
| `research-areas.md` | On demand | Deep research (phase-research, init). Skip for light/medium depth. |

**Rule:** Light research (`/st:plan`) resolves with `SKILL.md` alone. Deep research (`/st:phase-research`, `/st:init`) loads `research-areas.md` for detailed per-area guidance. Typical: 40% SKILL.md only, 60% + research-areas.

## Integration

**Used by:**
- `/st:init` — 2-wave research (Stack+Landscape → Architecture+Pitfalls + optional extras)
- `/st:phase-research` — 4 parallel researcher agents + synthesizer
- `/st:brainstorm` — 2-round inline research (broad → focused)
- `/st:plan` — optional focused research when AI recommends it

**Skills that pair with research-methodology:**
- `superteam:project-awareness` — provides framework detection for codebase-aware research
- `superteam:wave-parallelism` — parallel research agents follow wave protocol (Wave 1: Stack+Landscape, Wave 2: Architecture+Pitfalls)
- `superteam:verification` — research findings verified before feeding into plans
- `superteam:handoff-protocol` — research state (sources, findings, conflicts) captured on pause

**Agents:**
- `phase-researcher` — spawned by phase-research and init. Each instance covers one research area. Follows this skill's methodology.
- `research-synthesizer` — spawned after all researchers complete. Follows synthesis protocol from this skill.
````

---

## `research-areas.md` Content

````markdown
# Research Areas — Detailed Guidance

Reference file for `superteam:research-methodology`. Loaded during deep research (phase-research, init).

## When to Load This File

- `/st:phase-research` → always load
- `/st:init` research waves → always load
- `/st:brainstorm` → do NOT load (medium depth uses SKILL.md only)
- `/st:plan` → do NOT load (light depth uses SKILL.md only)

## Stack Research

### What to Search For
- Official documentation for candidate technologies
- Benchmark comparisons (with methodology disclosed)
- Issue trackers: open issues count, response time, breaking changes
- Release cadence: last release date, major version history
- Migration guides: ease of upgrading

### Comparison Criteria Template

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Maturity (years, major versions) | | | | |
| Community (contributors, SO answers) | | | | |
| Performance (benchmarks, if relevant) | | | | |
| DX (docs quality, error messages, tooling) | | | | |
| Bundle size (frontend) / footprint | | | | |
| Maintenance (last release, open issues) | | | | |
| Project fit (existing stack compatibility) | | | | |

**Weight** is project-specific. A prototype weights DX higher. A production API weights performance and maturity higher.

### Scope Boundaries
- DO: compare tech options, recommend with evidence
- DO NOT: recommend architecture patterns (Architecture area) or list competitors (Landscape area)

## Landscape Research

### How to Find Existing Solutions
- Search: "[domain] open source", "[domain] SaaS", "[domain] reference implementation"
- Check: GitHub topics, awesome-* lists, comparison sites
- Look for: "I migrated from X to Y" posts (reveal real trade-offs)

### Table Stakes vs Differentiator Framework

| Category | Meaning | How to identify |
|----------|---------|----------------|
| **Table stakes** | Must have. Users expect it. Not having it is a dealbreaker. | Every competitor has it. Users complain when missing. |
| **Differentiator** | Unique value. Reason to choose this over alternatives. | Few competitors have it. Users specifically praise it. |
| **Nice-to-have** | Useful but not critical. Won't make or break adoption. | Some competitors have it. Users don't mention it unprompted. |

### Scope Boundaries
- DO: analyze existing solutions, identify patterns, compare on project criteria
- DO NOT: choose specific tech (Stack area) or propose code structure (Architecture area)

## Architecture Research

### Patterns to Evaluate
- File/folder structure conventions for the chosen stack
- Data flow approaches (unidirectional, event-driven, request-response)
- Component boundaries and communication patterns
- State management approaches
- Error handling strategies
- API design patterns (REST, GraphQL, RPC)

### How to Use Stack Findings
- Stack choice constrains architecture options. React → component-based. Express → middleware-based.
- Don't re-evaluate stack decisions. Take them as input.
- Propose architecture that FITS the chosen stack, don't fight it.

### Scope Boundaries
- DO: propose structure, patterns, data flow based on Stack findings
- DO NOT: re-evaluate tech choices (Stack area) or analyze competitors (Landscape area)

## Pitfalls Research

### Where to Find Pitfalls
- Issue trackers: "bug", "breaking change", "migration" labels
- Blog posts: "X gotchas", "mistakes with X", "what I learned after..."
- Reddit/forums: "I migrated away from X because..."
- Security advisories: CVE databases, `npm audit`, `pip-audit`
- Performance traps: "X is slow when..." benchmarks under load

### Severity Ranking

| Severity | Meaning | Action |
|----------|---------|--------|
| **Critical** | Will cause data loss, security breach, or system failure | Must address before implementation. Block if no mitigation. |
| **High** | Will cause significant rework or user-facing bugs | Address in architecture design. Include in plan. |
| **Medium** | May cause issues under specific conditions | Document. Include mitigation in plan if feasible. |
| **Low** | Minor inconvenience, workaround exists | Document for awareness. |

### Scope Boundaries
- DO: identify risks, anti-patterns, edge cases specific to chosen Stack + Architecture
- DO NOT: propose alternative architecture (Architecture area) or different tech stack (Stack area)

## Optional Research Areas

Triggered by domain-specific needs. Not part of standard 4-area research.

| Area | When to Trigger | Focus |
|------|----------------|-------|
| **Security** | Auth, payments, PII handling, public-facing APIs | OWASP top 10, auth patterns, data encryption, compliance |
| **Performance** | Real-time features, high-traffic endpoints, large data | Load patterns, caching strategies, CDN, database optimization |
| **Accessibility** | Public web applications, regulated domains | WCAG compliance, screen reader patterns, keyboard navigation |

## Cross-Area Dependency Rules

```
Wave 1: Stack + Landscape
  - Run independently, no dependencies on each other
  - Stack produces: recommended tech, comparison tables
  - Landscape produces: competitor analysis, table stakes

Wave 2: Architecture + Pitfalls
  - Architecture READS Stack output (tech choices constrain patterns)
  - Pitfalls READS Stack + Architecture output (risks are tech + structure specific)
  - Architecture does NOT read Landscape (competitors don't dictate our structure)
  - Pitfalls MAY reference Landscape (competitor failures are relevant pitfalls)
```
````

---

## Design Decisions

1. **Two responsibilities mirror all other skills** — Methodology + Discipline pattern is consistent across scientific-debugging, tdd-discipline, verification. Research-methodology follows the same dual structure.
2. **4-area model from GSD, proven** — Stack/Landscape/Architecture/Pitfalls is already used by `/st:phase-research` and `/st:init`. The skill codifies the methodology that commands orchestrate.
3. **Depth calibration table** — Unlike other skills which apply uniformly, research-methodology is used at 4 different depth levels. Explicit calibration prevents over-researching a simple plan or under-researching a phase.
4. **Source triangulation requirement (3+ sources, 2+ categories)** — Claude's biggest research failure is relying on training data alone. Requiring multiple source categories forces web search and codebase scan.
5. **Evidence quality table** — Mirrors scientific-debugging's evidence standards. Makes abstract "good research" concrete. Training data explicitly classified as weak evidence.
6. **Confirmation bias as primary anti-shortcut target** — Claude's research confirmation bias is the #1 failure mode. "Search for evidence AGAINST your recommendation first" is the key antidote.
7. **Synthesis protocol is skill, not agent** — The synthesis methodology belongs in the skill (shared knowledge). The agent spec will reference this skill for HOW to synthesize.
8. **"Always present 2-3 options" rule** — Prevents Claude from presenting its first-found option as "the answer." Forces genuine comparison even when one option is clearly better.
9. **Scope boundaries per area** — Each research area has explicit "does NOT" boundaries. Prevents agents from stepping on each other's territory or producing contradictory recommendations.
10. **No conflicts = missed something** — Counter-intuitive but critical. Research that finds no trade-offs is shallow research. This gate forces the synthesizer to look harder.
11. **Separate reference file for area details** — SKILL.md stays under 400 lines with methodology and discipline. Detailed per-area guidance in research-areas.md, loaded only during deep research. Matches progressive disclosure pattern.
12. **Staleness awareness** — Claude's training data creates a unique research failure: confidently stating outdated information. Explicit staleness checks address this.
13. **Research protocol 4 phases parallel debugging 4 phases** — Scope/Investigate/Evaluate/Synthesize mirrors the pattern from scientific-debugging. Consistent mental model across skills.
14. **Survivorship bias listed explicitly** — Claude tends to only find success stories for a technology. Adding "search for failure stories, migration-away-from posts" counters this.

## Testing Plan

1. Ask Claude to research a technology choice — does it present 2-3 options with trade-offs, or just recommend one?
2. Claude researches a domain it "knows well" (e.g., React state management) — does it still search current sources or rely on training data?
3. Phase-research with 4 agents — do agents stay within their area scope boundaries (Stack agent doesn't recommend architecture)?
4. Research finds conflicting recommendations between Stack and Pitfalls — does SUMMARY.md surface the conflict or silently resolve it?
5. Light research (`/st:plan`) — does Claude calibrate depth appropriately (not running 4-area deep research for a simple task)?
6. User says "just use X, skip research" — does Claude present findings anyway or blindly comply?
7. Claude's top recommendation has weak evidence (blog post only) — does it flag the evidence quality or present with false confidence?
8. Landscape research for a well-known domain — does Claude compare on project-specific criteria or just list popular options?
9. Pitfalls section — are pitfalls specific to the chosen stack/architecture or generic ("watch out for performance")?
10. SUMMARY.md has no conflicts section — does the synthesis protocol catch this gap?
11. Codebase already uses Framework X — does research still evaluate alternatives or just default to "keep using X"?
12. Research produces 10 shallow options — does Claude narrow to 2-3 deeply investigated options instead?
13. Brainstorm 2-round research — does round 2 focus on gaps from round 1, or repeat the same search?
14. Research for brownfield project — does Claude prioritize codebase scan (existing patterns) as a source?
15. Claude finds a technology is newer and trendier — does it evaluate on actual criteria or default to "newer is better"?
