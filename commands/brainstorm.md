---
description: "Brainstorm ideas: explore vague concepts, 2-round research, produce actionable spec"
argument-hint: "<idea description>"
---

# Brainstorm Ideas

Explore a vague idea and turn it into a clear, actionable spec. Two rounds of research (broad then focused), hybrid AI questioning, visual companion via Playwright MCP, spec review by subagent. Zero-infrastructure (works without `/st:init`).

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - Idea description from arguments. If empty, ask: "What do you want to brainstorm?"
   - Accept image input: mockup, diagram, screenshot, whiteboard notes

2. **Check context**
   - If `.superteam/` exists: load config, PROJECT.md, REQUIREMENTS.md, DESIGN-SYSTEM.md
   - If not: operate normally, just without project context
   - Scan codebase: tech stack, patterns, conventions, related files
   - Use `superteam:project-awareness` for context loading

3. **Scope assessment**
   - Evaluate: does the idea contain multiple independent subsystems?
     (e.g., "build a platform with chat, file storage, billing, analytics")
   - If too large:
     "This idea spans [N] independent subsystems. Recommend brainstorming each separately:
     1. [Sub-project A] - [description]
     2. [Sub-project B] - [description]
     3. [Sub-project C] - [description]
     Which one to start with?"
     - User picks one -> brainstorm that sub-project
     - Other sub-projects brainstormed later
   - If manageable: continue

4. **Visual companion offer**
   - "During brainstorming, I can show mockups, diagrams, and visual comparisons in a browser (via Playwright). Want to enable visual mode?"
   - User: yes -> enable visual mode
   - User: no -> text-only brainstorm
   - Per-question decision: AI decides each question/section whether to use browser or terminal:
     - Visual (mockup, layout, diagram, UI comparison): browser
     - Text (concept, tradeoff, scope, requirements): terminal

5. **Research round 1 (broad)**
   - Always runs, do not ask user
   - Follow `superteam:research-methodology` at Light depth
   - Web search: best practices, industry patterns, existing solutions for the idea's domain
   - Codebase scan: related patterns, existing code that can be reused
   - Present summarized findings:
     ```
     RESEARCH FINDINGS
     ─────────────────────────────────
     Industry:           [common patterns]
     Best practices:     [key insights]
     Existing solutions: [tools/libs]
     Codebase:           [related code]
     Risks:              [potential issues]
     ```

6. **AI synthesize + confirm**
   - Read: idea + context + research findings
   - Present understanding:
     ```
     UNDERSTANDING
     ─────────────────────────────────
     Idea:           [what AI understands]
     Goal:           [what it achieves]
     Scope:          [what is included]
     Out of scope:   [what is excluded]
     Target users:   [who uses this]
     Constraints:    [limitations]
     Gray areas:     [unclear points]
     ```
   - Ask: "Is this correct? Anything to add or change?"
   - User: confirm -> continue
   - User: correct -> update and re-confirm
   - Loop until user agrees

7. **Follow-up questions** (if gray areas remain)
   - Ask targeted questions, prefer multiple choice
   - AI recommends an option + reasoning + why other options are less suitable
   - Use visual companion for visual questions (if enabled)
   - Explain specialized terms with concrete examples when needed
   - Typically 2-5 questions depending on gray areas

8. **Research round 2 (focused)** (if needed)
   - AI evaluates: after user answers, is deeper research needed on specific topics?
   - If yes: "Based on your answers, researching [specific topic] further..."
     - Focused web search on specific aspect
     - Present round 2 findings
   - If not needed: skip

9. **Propose 2-3 approaches**
   - Based on research + context + user answers
   - Each approach includes:
     - Name + short description
     - Trade-offs (pros / cons)
     - When it fits best
   - AI recommends: "[Approach X] because [reason]. Not [Y] because [reason], not [Z] because [reason]."
   - Visual companion: show diagram/mockup if approaches have visual aspects (if enabled)
   - User: choose one approach or mix from multiple

10. **Present design** (section by section)
    - Sections vary by idea; may include:
      - Architecture / System overview
      - Components / Modules
      - Data flow / Data model
      - API / Interfaces
      - Error handling
      - Security considerations
      - Testing approach
    - Each section:
      - AI presents (scales with complexity: brief for simple, detailed for complex)
      - Visual companion for visual sections (if enabled)
      - User: approve / adjust
    - Scale section count by complexity:
      - Simple: 2-3 sections
      - Medium: 4-5 sections
      - Complex: 6-7 sections

11. **Write spec document**
    - Save to `.superteam/specs/[YYYY-MM-DD]-[topic].md`
    - Content: all decisions + design sections synthesized
    - Format: clear heading structure, readable standalone
    - Commit: `spec: [topic]`
    - Follow `superteam:atomic-commits`

12. **Spec review** (subagent)
    - Dispatch reviewer subagent to check:
      - Completeness: any TODO/placeholder remaining?
      - Consistency: internal contradictions?
      - Clarity: vague requirements?
      - Scope: focused enough for a single plan?
      - YAGNI: features not yet needed?
    - Result: Approved or Issues Found
    - If issues found:
      - AI fixes issues
      - Re-dispatch reviewer
      - Max 3 rounds
      - After 3 rounds still issues: ask user to decide

13. **User review spec**
    - "Spec written at [path]. Review and let me know what needs changes before moving to planning."
    - User: approve -> done
    - User: changes needed -> fix + re-run spec review (step 12)

14. **Done**
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ST > BRAINSTORM COMPLETE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Spec: .superteam/specs/[topic].md
    Next: /st:plan (or /st:phase-plan if in roadmap)
    ```

## When to Use / Not Use

**Use brainstorm when:**
- Idea is vague, scope unclear: "something with auth", "improve UX"
- Want to explore approaches before committing
- Need domain research before deciding

**Do NOT use when:**
- Scope and requirements already clear -> use `/st:plan` directly
- Working within a roadmap and know the phase -> use `/st:phase-plan`

## Rules

- Zero-infrastructure: works without `/st:init`. Project context enhances accuracy.
- Research round 1 ALWAYS runs. Do not ask, do not skip.
- Research round 2 is conditional: AI evaluates need after user answers.
- Scope detection is proactive: if idea is too large, propose splitting BEFORE deep-diving.
- Visual companion is opt-in at start, but per-question usage is AI-decided.
- Spec review runs max 3 rounds. Surface remaining issues to user after that.
- Output is a spec document, NOT a plan. Suggest `/st:plan` as next step.
- Image input accepted at any point in the flow.
- Follow `superteam:research-methodology` for both research rounds.
- Follow `superteam:core-principles`. Load references: visual-first, questioning, decision-continuity.
