# Review Domains

Reference file for `superteam:requesting-code-review`. Loaded by review agents.

Each domain has a focused checklist of what Claude typically MISSES. These are not exhaustive — they highlight blind spots.

## Domain Selection by Project Type

Use `superteam:project-awareness` context to select relevant domains:

| Project Type | Always Check | Check if Relevant | Skip |
|---|---|---|---|
| Frontend | 1,2,3,4,8,9,10,12 | 5 (with evidence only) | 6,11 (unless API client) |
| Backend | 1,2,3,4,5,6,7,8,11,12,13 | — | 9,10 |
| Fullstack | All 13 | — | — |
| Monorepo | Per-workspace type | Cross-workspace: 12 | — |
| Unknown | 1,2,3,4,7,8,12 | Rest if evidence found | — |

When project-awareness type = `unknown`: use conservative set. Do not skip domains you're unsure about — but do not force irrelevant domains either.

## 1. Silent Failure

Issues where errors are swallowed or ignored.

- Empty `catch` blocks (catch and do nothing)
- `catch` → log → continue (error logged but execution continues as if nothing happened)
- Missing error propagation (async function catches error but doesn't reject/throw)
- Swallowed promise rejections (no `.catch()` or `try/catch` on await)
- Default values hiding failures (returning `[]` instead of throwing when data fetch fails)

## 2. Business Logic

Correctness of business rules and requirements.

- Compare against `REQUIREMENTS.md` — is every requirement implemented?
- Form validation rules match spec (required fields, formats, ranges)
- Edge cases in business rules (zero, negative, empty, null, max values)
- State transitions are valid (can't go from "shipped" back to "draft")
- Currency/date/timezone handling follows requirements

## 3. Security

Vulnerabilities and security anti-patterns.

- SQL/NoSQL injection (string concatenation in queries)
- XSS (unescaped user input in HTML/templates)
- Auth/authz bypass (missing middleware, wrong permission check)
- Secrets in code (API keys, passwords, tokens hardcoded)
- CSRF protection on state-changing endpoints
- Path traversal in file operations
- Mass assignment (accepting all request fields into model)

## 4. Error Handling

How errors are caught, reported, and recovered from.

- API calls without error handling
- Missing HTTP error status codes (returning 200 for errors)
- Generic error messages hiding root cause ("Something went wrong")
- No retry logic on transient failures (network, rate limits)
- Error responses leaking internal details (stack traces, SQL queries)

## 5. Performance

Performance issues with evidence, not speculation.

- N+1 queries (loop with DB call inside)
- Missing database indexes on filtered/sorted columns
- Unbounded queries (no LIMIT, no pagination)
- Large payload without pagination or streaming
- Synchronous blocking in async context
- Missing caching for expensive repeated operations

**Note:** Only report with evidence. "This might be slow" at 50% confidence = do not report.

## 6. API Contract

API design and contract consistency.

- Breaking changes without versioning
- Inconsistent response formats across endpoints
- Missing fields documented in API spec
- Wrong HTTP methods (GET with side effects, POST for retrieval)
- Missing pagination on list endpoints
- Inconsistent error response format

## 7. Test Coverage

Test quality and coverage gaps.

- Changed code without corresponding test changes
- Happy path only — missing error/edge case tests
- Tests that don't actually assert anything meaningful
- Tests coupled to implementation details (will break on refactor)
- Missing integration test for new API endpoint
- Reference `superteam:tdd-discipline` for test quality standards

## 8. Type Safety

Type-related issues (TypeScript, Python type hints, Go types).

- `any` type usage (TypeScript)
- Missing null checks on nullable values
- Type assertions (`as`) hiding real type errors
- Inconsistent types between function signature and usage
- Missing return type annotations on public functions

## 9. Accessibility

UI accessibility issues.

- Interactive elements without ARIA labels
- Missing keyboard navigation (click-only handlers)
- Non-semantic HTML (`div` instead of `button`, `span` instead of `a`)
- Color contrast below WCAG AA (4.5:1 for text)
- Missing alt text on images
- Focus management on dynamic content (modals, dropdowns)

## 10. Design System Compliance

Consistency with project design system.

- Check `DESIGN-SYSTEM.md` if it exists
- Hardcoded colors/spacing instead of design tokens
- Custom components duplicating existing design system components
- Inconsistent spacing/typography with rest of application
- Missing responsive behavior documented in design system

## 11. Database & Data

Data integrity and database concerns.

- Missing database migration for schema changes
- No rollback strategy for migration
- Missing foreign key constraints
- Data validation only at application level (not at DB level)
- Missing indexes for new query patterns
- Orphaned records possibility (delete without cascade)

## 12. Dependencies & Imports

Dependency management and import hygiene.

- New dependency added without justification
- Dependency with known security vulnerability
- Importing entire library when only one function needed
- Circular imports/dependencies
- Dev dependency used in production code
- Unused imports left after refactoring

## 13. Concurrency & Async

Race conditions and concurrent access issues.

- Shared mutable state without synchronization (mutex, lock, atomic)
- Time-of-check to time-of-use (TOCTOU) bugs
- Missing `await` on async functions (fire-and-forget without intent)
- Database operations that assume sequential execution (read-modify-write without transaction)
- Event handlers that can fire multiple times simultaneously
- Cache invalidation without considering concurrent updates
- Promise.all without error handling (one rejection crashes all)
- Deadlock potential in nested lock acquisition
