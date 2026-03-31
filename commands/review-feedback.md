---
description: "Process external review feedback: verify each item before implementing, avoid blind-following bad feedback"
argument-hint: "[PR number or pasted feedback text]"
---

# Process Review Feedback

When receiving review feedback from external sources (human reviewer, CI tool, PR comments), analyze and verify each item before implementing. Prevent blind-following of incorrect feedback.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Parse input**
   - User pastes text feedback, OR
   - PR link: `/st:review-feedback #123` (fetch comments via gh CLI), OR
   - Screenshot of review comments
   - Accept image input

2. **Parse feedback**
   - Split into individual items
   - Identify per item: file, line number, feedback content

3. **Verify each item** (parallel)
   - Grep codebase: does the issue actually exist?
   - Check context: is the feedback correct in this context?
   - Evaluate: will implementing this improve or degrade the code?
   - Follow `superteam:receiving-code-review` principles
   - Classify each item:
     - VALID: issue exists, fix will improve code. Recommend implement.
     - PARTIAL: issue exists but fix should differ from suggestion. Implement differently.
     - INVALID: issue does not exist or fix would degrade code. Skip with explanation.
     - UNCLEAR: insufficient context to evaluate. Needs clarification from reviewer.

4. **Present assessment**
   ```
   ┌──────────────────────────────────────────┐
   │ FEEDBACK ANALYSIS                        │
   ├──────────────────────────────────────────┤
   │ VALID:    [N] items -- recommend fix      │
   │ PARTIAL:  [N] items -- fix differently    │
   │ INVALID:  [N] items -- skip               │
   │ UNCLEAR:  [N] items -- need clarification │
   ├──────────────────────────────────────────┤
   │ [Detail per item + reasoning]             │
   └──────────────────────────────────────────┘
   ```

5. **User approval**
   - User selects which items to fix
   - User may override AI assessment on any item

6. **Fix approved items**
   - Implement fixes (spawn agents if multiple independent fixes)
   - Run tests after fixes
   - Follow `superteam:atomic-commits`
   - Commit: `fix: address review feedback`

7. **Generate reply** (optional)
   - Ask: "Generate a reply for the reviewer?"
   - AI drafts response covering:
     - Items fixed (with brief description)
     - Items skipped (with reasoning)
     - Items needing further discussion

8. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > REVIEW FEEDBACK COMPLETE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Items: [N] total
   Fixed: [X] | Skipped: [Y] | Clarify: [Z]
   Commit: "fix: address review feedback"
   ```

## Rules

- NEVER implement feedback blindly. Verify every item against the codebase first.
- Every item must be classified (VALID/PARTIAL/INVALID/UNCLEAR) with reasoning before implementation.
- User has final say on which items to implement, regardless of AI assessment.
- When fetching PR comments, use `gh` CLI to read the PR.
- Run full test suite after implementing fixes.
- Reply generation is optional -- only generate when user requests it.
- PARTIAL items: explain how your proposed fix differs from the reviewer's suggestion and why.
- Follow `superteam:core-principles`. Load references: questioning.
