---
name: research-methodology
description: >
  Use when conducting research before planning or implementation.
  Enforces structured investigation (dynamic area coverage from catalog),
  source triangulation, evidence-over-assumption discipline, and synthesis
  quality gates that prevent shallow or skipped research.
---

# Research Methodology

## Overview

Research Methodology prevents Claude from skipping research, doing shallow research, or treating research as a checkbox activity. It applies across contexts — from deep multi-agent phase research to lightweight 1-agent focused research. The methodology scales by depth, but the discipline is constant.

**Two responsibilities:**
1. **Methodology** — dynamic area coverage (from catalog), depth calibration, source triangulation, evidence evaluation, synthesis protocol.
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
| `/st:phase-research` | Deep | Dynamic areas from catalog | Parallel per wave + 1 synthesizer | Area files + SUMMARY.md |
| `/st:init` | Deep | Dynamic areas from catalog | Parallel per wave + 1 synthesizer | research/ directory |
| `/st:brainstorm` | Medium | 2 rounds (broad → focused) | AI direct (no subagents) | Inline findings |
| `/st:plan` (optional) | Light | 1 focused area | 1 researcher | 1-2 page inline |

**The methodology applies at ALL depths.** Even light research must triangulate sources and present alternatives. Deep research just does it more thoroughly.

## Research Areas

Research areas are selected dynamically from the catalog (`research-catalog.md`), not hardcoded. Each area has a specific scope to prevent agents from overlapping.

**Area selection:** Load `research-catalog.md` → evaluate trigger and brownfield conditions → select relevant areas → group into waves by dependency.

**Core areas** (evaluate for every project): STACK, LANDSCAPE, ARCHITECTURE, PITFALLS.
**Domain-specific areas** (include when relevant): SECURITY, PERFORMANCE, ACCESSIBILITY, DATA, INTEGRATION.
**Custom areas:** AI may propose with justification — always requires user confirmation.

For detailed per-area guidance (search strategies, comparison templates, scope boundaries), see `research-areas.md`.

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
| "Let me skip this area, it's obvious" | Selected areas are not skippable. Even "obvious" domains have surprises. |

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

AREAS (dynamic from catalog):
  Select areas based on trigger + brownfield conditions.
  Core: STACK, LANDSCAPE, ARCHITECTURE, PITFALLS
  Domain: SECURITY, PERFORMANCE, ACCESSIBILITY, DATA, INTEGRATION
  Custom: max 2, requires user confirmation, max 8 total

WAVE ORDER (dynamic from dependencies):
  wave = max(wave[deps]) + 1
  Areas with no deps → Wave 1. Spawn all per wave in one message.

PROTOCOL:
  1. Scope (bound the question)
     → gate: specific research question
  2. Investigate (3+ sources, 2+ categories)
     → gate: 3+ independent data points per key claim
  3. Evaluate (rank evidence, surface conflicts)
     → gate: every recommendation cites strong evidence
  4. Synthesize (options, trade-offs, unknowns)

DEPTH:
  Deep (phase-research, init): dynamic areas from catalog, parallel agents, full output
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
| `research-catalog.md` | When planning research | Area selection: triggers, dependencies, brownfield, guardrails |
| `research-areas.md` | On demand | Deep research execution guidance: search strategies, templates, scope |

**Rule:** Light research (`/st:plan`) resolves with `SKILL.md` alone. Deep research (`/st:phase-research`, `/st:init`) loads `research-catalog.md` for area selection and `research-areas.md` for execution guidance.

## Integration

**Used by:**
- `/st:init` — dynamic-wave research (areas selected from catalog, grouped by dependencies)
- `/st:phase-research` — dynamic research agents from catalog + synthesizer
- `/st:brainstorm` — 2-round inline research (broad → focused)
- `/st:plan` — optional focused research when AI recommends it

**Skills that pair with research-methodology:**
- `superteam:project-awareness` — provides framework detection for codebase-aware research
- `superteam:wave-parallelism` — parallel research agents follow wave protocol (dynamic waves from catalog dependencies)
- `superteam:verification` — research findings verified before feeding into plans
- `superteam:handoff-protocol` — research state (sources, findings, conflicts) captured on pause

**Agents:**
- `phase-researcher` — spawned by phase-research and init. Each instance covers one research area. Follows this skill's methodology.
- `research-synthesizer` — spawned after all researchers complete. Follows synthesis protocol from this skill.
