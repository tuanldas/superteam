---
description: "Generate or update README.md from codebase with project-type-aware sections and drift detection"
argument-hint: "[workspace-name | --all]"
---

# README Generate / Update

Generate or update README.md from the codebase. Supports README-Driven Development (RDD), dynamic sections based on project type, drift detection, and monorepo scoping.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Detect context**
   - Read `.superteam/config.json` (type, frameworks, workspaces)
   - Read `.superteam/PROJECT.md` (purpose, core value)
   - Scan codebase: package.json, directory structure, entry points
   - Read existing README.md (if any)
   - Accept image input (screenshots, diagrams to include in README)
   - Use `superteam:project-awareness` to load project context

2. **Detect mode**
   - **Scope** (monorepo):
     - No argument: root README
     - Workspace name (e.g., `frontend`): that workspace's README
     - `--all`: root + all workspaces
   - **Generate vs Update**:
     - README.md does not exist: Generate mode
     - README.md exists: Update mode
   - **RDD detect**:
     - Code exists in project: generate from codebase
     - No code yet but PROJECT.md exists: RDD mode (generate from planning docs)

3. **Generate mode** (no existing README)
   - Build from core template:
     - Title + Description
     - Installation
     - Usage / Quick start
     - Project structure
     - Tech stack
     - Contributing
     - License
   - Add dynamic sections based on project type detection:
     - **Frontend**: Screenshots/Demo, Browser support, Tech stack badges
     - **API/Backend**: Endpoints overview, Auth, Environment variables
     - **Library**: API reference, Examples, Compatibility
     - **CLI**: Commands table, Options/flags, Shell completion
     - **Monorepo**: Packages overview, Architecture diagram
   - RDD mode: generate from PROJECT.md + REQUIREMENTS.md instead of code
   - Present draft to user for review
   - User confirms or adjusts
   - Write README.md
   - Commit: `docs: generate README`

4. **Update mode** (existing README)
   - Compare current README against current codebase
   - Detect drift:
     - Installation commands still correct?
     - Dependencies changed?
     - New endpoints/features not documented?
     - Version numbers still correct?
     - Code examples still valid?
   - Present changes:
     ```
     ┌─────────────────────────────────┐
     │ README DRIFT DETECTED           │
     ├─────────────────────────────────┤
     │ Outdated:  [N] sections         │
     │ Missing:   [N] sections         │
     │ Unchanged: [N] sections         │
     ├─────────────────────────────────┤
     │ [Details of each proposed change]│
     └─────────────────────────────────┘
     ```
   - User chooses: apply all / select individually / skip
   - Write README.md
   - Commit: `docs: update README`

5. **Done**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > README [GENERATED | UPDATED]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Mode: [generate | update | RDD]
   Sections: [N] total ([M] dynamic)
   Scope: [root | workspace-name | all]
   ```

## Rules

- Always detect project type and add appropriate dynamic sections. Do not use a one-size-fits-all template.
- In update mode, always show drift details and let user choose what to apply. Never silently overwrite.
- Support RDD: when no code exists yet, generate README from PROJECT.md and REQUIREMENTS.md.
- For monorepo projects, respect the scope argument. Default to root README only.
- Accept image input for screenshots and diagrams.
- Present draft to user before writing in generate mode.
- Commit changes with appropriate message (`docs: generate README` or `docs: update README`).
- Follow `superteam:core-principles`. Load references: visual-first, questioning.
