# Changelog

## [1.2.0] - 2026-04-08

### Added
- `/st:team run` — SM orchestrates roadmap phases with team checkpoints
  - 5-step pipeline: Research → UI/UX Design → Plan → Execute → Verify
  - Semi-autonomous: team runs independently, pauses at checkpoints for user approval
  - Checkpoints after research, UI/UX design (conditional), plan, and on blocker L3+
  - Team role integration: TL reviews plans, SrDev reviews code, QA verifies
  - State tracking in CONTEXT.md with pause/resume support
  - Small team adaptation (auto-skips missing roles)
- Scrum Master run-mode awareness in agent definition

## [1.1.0] - 2026-04-07

### Added
- Auto-generate CLAUDE.md during `/st:init`
- Auto-setup .gitignore for generated files during init

### Changed
- Rewrite CLAUDE.md template with comprehensive project documentation

## [1.0.6] - 2026-04-06

### Fixed
- Remove duplicate sections in research-methodology SKILL.md

### Added
- Impact Analysis section to research synthesis output
