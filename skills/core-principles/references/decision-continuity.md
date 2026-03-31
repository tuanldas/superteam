# Principle 3: Decision Continuity

## Core Principle

**Confirmed decisions are permanent. Use file-based persistence so decisions survive context truncation and transfer across agents.**

Once a user confirms a decision (through approval, selection, or explicit yes/ok), that decision is locked in. Never re-ask it within a conversation. Never silently override it. Never show different values in previews.

## Why File-Based Persistence Matters

In-context DECISIONS blocks work for short conversations, but break under real conditions:
- Context windows are finite. Long conversations truncate earlier decisions.
- Subagents spawned to handle tasks don't inherit the parent agent's context.
- Browser navigation or tool errors can reset memory.
- Users don't re-read old messages; decisions feel "forgotten" if not available.

Solution: Write decisions to `.superteam/decisions.json` after each confirmation. This becomes the source of truth. In-context DECISIONS block is a cache for performance.

## Decisions File Schema

Location: `.superteam/decisions.json` in the project root.

```json
{
  "version": 1,
  "decisions": [
    {
      "key": "aesthetic",
      "value": "Brutally Minimal",
      "rationale": "User prefers clean, no-decoration approach for professional context",
      "decided_at": "2026-03-31T10:00:00Z",
      "source": "init"
    },
    {
      "key": "color.primary",
      "value": "#1a1a2e",
      "rationale": "High contrast, accessible for vision-impaired users",
      "decided_at": "2026-03-31T10:15:00Z",
      "source": "user_confirmed"
    },
    {
      "key": "typography.body",
      "value": "Inter, sans-serif, 16px",
      "rationale": "Modern, readable on all screens, matches design system",
      "decided_at": "2026-03-31T10:30:00Z",
      "source": "user_selected"
    }
  ]
}
```

**Fields:**
- `key`: Unique identifier for the decision (e.g., "aesthetic", "color.primary", "audience"). Use dot notation for hierarchical decisions.
- `value`: The decided value (string, number, boolean, or compact JSON for complex values)
- `rationale`: Why this decision was made. Short (1-2 sentences). Helps future agents understand context.
- `decided_at`: ISO 8601 timestamp when the decision was confirmed
- `source`: How the decision was made. Options:
  - `init` = initial setup/configuration
  - `user_confirmed` = user approved a proposal
  - `user_selected` = user chose from visual/text options
  - `user_described` = user described intent, agent extracted decision
  - `user_modified` = user changed a previously confirmed decision
  - `derived` = inferred from other decisions

## Workflow: Read → Use → Write

### 1. Before Proposing Any Value

Check if it's already been decided:

```
1. Read .superteam/decisions.json
2. Look for key matching what you're about to propose
3. If found → use the decided value
4. Say: "Using [value] (confirmed earlier)"
5. Do NOT re-ask, do NOT offer alternatives
```

Example:

```
Current task: Proposing color scheme
Read decisions.json → found { key: "aesthetic", value: "Brutally Minimal" }
→ Use Brutally Minimal in all previews
→ Say "Using Brutally Minimal aesthetic (confirmed earlier)"
→ Do NOT show alternative aesthetics
```

### 2. After User Confirms a Decision

Write immediately to decisions.json:

```
1. User approves: "Yes" / "Looks good" / selects option / explicit confirmation
2. Extract decision: key, value, rationale, timestamp, source
3. Append to decisions.json
4. Update in-context DECISIONS block (cache)
5. Acknowledge: "Recorded: [key] = [value]"
```

Example:

```
User says: "I like option B — the sans-serif typography is cleaner."
You extracted: key="typography.body", value="Inter, sans-serif, 16px"
Write to decisions.json:
  { key: "typography.body", value: "Inter, sans-serif, 16px",
    rationale: "User prefers sans-serif for cleaner look",
    decided_at: "2026-03-31T10:30:00Z", source: "user_selected" }
Say: "Recorded: typography.body = Inter, sans-serif, 16px"
```

### 3. Subagent Handoff

When spawning a subagent to continue work:

**Pass the file path, not the decisions:**

```
Main agent spawns subagent with prompt:
"Decisions are stored in .superteam/decisions.json.
Read this file FIRST before proposing any values.
If a value is already decided, use it and reference the confirmation."

Subagent workflow:
1. Read .superteam/decisions.json
2. Extract all decided values
3. Before proposing any value, check if it's in the file
4. Use decided values in all work
5. After each confirmation, append to decisions.json
```

Why pass the path? Subagents don't inherit the main agent's context. The file is the single source of truth.

## In-Context DECISIONS Block

Keep a running DECISIONS block in your response context for fast lookups:

```
DECISIONS (internal, running, backed by .superteam/decisions.json):
  aesthetic: Brutally Minimal — user approved
  color.primary: #1a1a2e — user approved
  typography.body: Inter, sans-serif, 16px — user approved
```

This is a **cache**, not the source of truth. If context is truncated:
1. Read .superteam/decisions.json
2. Rebuild DECISIONS block
3. Continue work

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Re-ask a confirmed decision with new options | Read decisions.json → use decided value → cite confirmation |
| Preview shows different values than confirmed | Extract values from decisions.json → use verbatim in preview |
| Label confirmed values as "proposed" | Label "approved" or "confirmed" — status matters to users |
| "I couldn't find the previous confirmation" | Always read/maintain decisions.json |
| Later step silently overrides earlier decision | Earlier confirmation takes precedence; cite it |
| Drill-down question resets parent decision | Answer drill-down within confirmed scope; don't re-negotiate parent |
| Offer "alternatives" alongside confirmed values | Confirmed = final unless user explicitly requests changes |
| Forget to write decision to file after confirmation | Always append to decisions.json immediately |
| Read decisions from context instead of file | Always read from file; context is a cache |
| Subagent doesn't inherit decisions | Pass decisions.json path to subagent; they read from file |

## Managing Decision Changes

If user wants to CHANGE a confirmed decision:

```
User says: "Actually, I want dark mode instead of light mode."

1. Read decisions.json → found previous decision
2. Acknowledge the change: "Updating aesthetic from [old] to [new]"
3. Remove or mark the old decision as superseded
4. Append new decision with source="user_modified"
5. Update all previews to use new value
6. Say: "Updated. Now using [new value]."
```

Users can always change decisions. Honor the new choice. Don't defend the old one.

## Example Conversation Flow

```
Agent: "What aesthetic appeals to you?"
User: "Something minimal and clean. No decoration."

Agent: Records to decisions.json:
  { key: "aesthetic", value: "Brutally Minimal",
    source: "user_described" }

Later: Agent proposes color options
Agent: Reads decisions.json first → finds aesthetic is "Brutally Minimal"
Agent: "Using Brutally Minimal aesthetic (confirmed earlier). Here are color options for a minimal style:"
       [shows preview with minimal color palette]

User: "The dark teal looks good. Use that."

Agent: Records to decisions.json:
  { key: "color.primary", value: "#1a4d5c",
    source: "user_selected" }

Later: Subagent spawned to build components
Main Agent: Passes `.superteam/decisions.json` path to subagent
Subagent: Reads file → extracts aesthetic: "Brutally Minimal", color: "#1a4d5c"
Subagent: Builds components using these confirmed values
Subagent: After completing task, appends any new decisions to file
```

## Integration with Principle 1 (Visual-First)

See `visual-first.md` for full context. Before creating a visual preview:

1. Read decisions.json
2. Extract any already-decided values (colors, typography, layout, etc.)
3. Use those values in preview (don't show alternatives)
4. Label in preview as "approved"
5. After user confirms new visual choices, write to decisions.json

Example:

```
Task: Design navigation bar
Read decisions.json → aesthetic: "Brutally Minimal", color.primary: "#1a4d5c"
Create preview using these confirmed values
Show preview to user
After user approves specific nav style, write to decisions.json:
  { key: "nav.layout", value: "horizontal-minimal", ... }
```

## Integration with Principle 2 (Questioning)

See `questioning.md` for full context. During questioning, check decisions.json:

```
Question: "What primary color should we use?"
Read decisions.json first → found color.primary already decided
→ Don't ask the question. Use the value.
→ Say: "Using [color] (confirmed earlier)"
→ Move to next unknown.
```

Use file-based decisions to skip already-answered questions and focus on unknowns.

## Troubleshooting

**Problem:** decisions.json doesn't exist yet.
**Solution:** Create it with empty decisions array on first write.

**Problem:** decisions.json is corrupted or invalid JSON.
**Solution:** Start fresh with a new file. Log what was attempted. Continue.

**Problem:** Subagent completed but didn't update decisions.json.
**Solution:** Parent agent reads file after subagent completes. If new decisions exist, integrate them. If missing, ask subagent to write.

**Problem:** Two concurrent agents writing to decisions.json.
**Solution:** Each write appends to the array (don't overwrite the file). Merging is append-only. If conflicts, last-write-wins; log the timestamp.
