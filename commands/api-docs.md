---
description: "Generate API documentation: OpenAPI spec, Postman Collection, and/or Markdown docs from codebase"
argument-hint: "[workspace] [--config]"
---

# Generate API Documentation

Generate API documentation from the codebase. Supports multiple output formats (OpenAPI, Postman Collection, Markdown), multiple API types (REST, GraphQL, gRPC), and smart endpoint detection.

**Arguments:** "$ARGUMENTS"

## Workflow

1. **Detect context**
   - Load `.superteam/config.json` (type, frameworks, `api_docs_formats`)
   - Scan codebase: route files, controllers, middleware, models
   - Detect API types: REST? GraphQL? gRPC?
   - Detect existing docs (openapi.yaml, postman collection, docs/api.md)
   - Accept image input if provided

2. **Format selection** (first run only)
   - If `--config` flag: force re-selection regardless of saved config
   - If `api_docs_formats` not in config, ask user to multi-select:
     - OpenAPI spec (openapi.yaml)
     - Postman Collection (postman-collection.json)
     - Markdown docs (docs/api.md)
   - Save selection to `.superteam/config.json`
   - If config already exists: use saved formats, do not ask

3. **Detect mode**
   - Generate vs Update:
     - Docs do not exist: Generate mode
     - Docs already exist: Update mode
   - Scope (monorepo):
     - No argument: detect all APIs in project
     - Workspace argument (e.g., `/st:api-docs backend`): specific workspace only

4. **Discover endpoints**
   a. Framework-native (if available):
      - Laravel: Scramble
      - FastAPI: built-in OpenAPI
      - NestJS: @nestjs/swagger
      - Django REST: drf-spectacular
      - Spring Boot: springdoc-openapi

   b. Fallback (no built-in support):
      - Spawn 2 agents in parallel:
        - Agent 1: Static analysis (routes, controllers, decorators)
        - Agent 2: Runtime analysis (sandbox, run app, capture traffic)
      - Merge results:
        - Static only = possible dead code
        - Runtime only = dynamic routes
        - Both = confirmed endpoints

5. **Generate docs** (per selected format)

   a. **OpenAPI spec** (if selected):
      - Endpoints: method, path, params, request/response schemas
      - Authentication schemes
      - Error responses, versioning info

   b. **Postman Collection** (if selected):
      - All endpoints organized by folder
      - Pre-request scripts: token from env vars, auto-set headers
      - Post-request scripts: login response sets access_token, refresh updates tokens
      - Environment template: base_url, access_token, refresh_token
      - Test assertions per endpoint

   c. **Markdown docs** (if selected):
      - Getting Started guide (AI-drafted)
      - Authentication guide (AI-drafted from auth middleware)
      - Error Handling guide (AI-drafted from error handlers)
      - API Reference (auto-generated from endpoints)
      - Examples (curl, JS fetch, Python requests)

   d. **Per API type:**
      - REST: OpenAPI + Postman + Markdown
      - GraphQL: schema.graphql + Markdown (queries/mutations guide)
      - gRPC: proto docs + Markdown

6. **Present draft**
   ```
   ┌──────────────────────────────────┐
   │ API DOCS GENERATED               │
   ├──────────────────────────────────┤
   │ Endpoints: [N] discovered        │
   │ REST: [N] | GraphQL: [N]         │
   ├──────────────────────────────────┤
   │ Files:                           │
   │  - openapi.yaml                  │
   │  - postman-collection.json       │
   │  - docs/api.md                   │
   └──────────────────────────────────┘
   ```
   - User reviews and adjusts

7. **Done**
   - Write files
   - Follow `superteam:atomic-commits`
   - Generate mode commit: `docs: generate API documentation`
   - Update mode commit: `docs: update API documentation`

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST > API DOCS COMPLETE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Endpoints: [N] documented
   Formats: [list of generated formats]
   Files: [list of output files]
   ```

## Update Mode

When docs already exist:
- Compare current docs against current endpoints
- Detect: new endpoints, removed endpoints, changed params, auth scheme changes, response schema changes
- Present diff to user
- User approves changes
- Update files per selected formats

## Rules

- Follow `superteam:questioning` for all user interactions.
- Ask format selection only once. Save to config, reuse on subsequent runs.
- Use `--config` flag to change formats after initial selection.
- Framework-native detection takes priority over fallback agents.
- Postman Collection MUST include pre/post-request scripts for auth workflows.
- Markdown docs MUST include AI-drafted guides (getting started, auth, errors), not just raw reference.
- In update mode, always show diff before writing changes.
- Follow `superteam:project-awareness` for codebase context.
