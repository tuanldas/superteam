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
