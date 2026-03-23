# `/st:api-docs` - Generate API Documentation

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Generate API documentation từ codebase. Output user chọn: OpenAPI spec + Postman Collection (có pre/post-request scripts) + Markdown docs. Hỗ trợ REST, GraphQL, gRPC. Endpoint detection: framework-native → fallback dual-agent (static + runtime analysis).

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Output format | User chọn multi-select: OpenAPI + Postman Collection + Markdown | Đầy đủ, user có quyền chọn format cần |
| Format config | Lần đầu hỏi, lưu config. `/st:api-docs-config` để thay đổi sau | Không hỏi lại mỗi lần, linh hoạt |
| Endpoint detection | Framework-native → fallback 2 agents parallel (static + runtime) → tổng hợp | Chính xác nhất, cover dead code + dynamic routes |
| Multi-API | Detect tất cả, generate file riêng per type | OpenAPI cho REST, SDL cho GraphQL, proto docs cho gRPC |
| Content | Reference + AI draft guides (getting started, auth, errors) | AI đủ context để draft, user review |
| Scripts | Pre-request + Post-request trong Postman Collection | Login → auto set token, workflow automation |
| Image input | Accept ảnh | Cross-cutting |

## Flow

```
1. Detect context
   - Đọc .superteam/config.json (type, frameworks, api_docs_formats)
   - Scan codebase: route files, controllers, middleware, models
   - Detect API types: REST? GraphQL? gRPC?
   - Detect existing docs (openapi.yaml, postman collection, docs/api.md)
   - Image input: accept ảnh nếu có
    ↓
2. Format selection (chỉ lần đầu)
   - Nếu chưa có api_docs_formats trong config:
     → "Bạn muốn export ra format nào?" (multi-select)
       ☐ OpenAPI spec (openapi.yaml)
       ☐ Postman Collection (postman-collection.json)
       ☐ Markdown docs (docs/api.md)
     → Lưu vào .superteam/config.json
   - Nếu đã có config → dùng luôn, không hỏi
   - Thay đổi sau: `/st:api-docs-config`
    ↓
3. Detect mode
   a. Generate vs Update:
      - Docs chưa tồn tại → Generate mode
      - Docs đã tồn tại → Update mode

   b. Scope (monorepo):
      - Không argument → detect tất cả APIs trong project
      - `/st:api-docs backend` → workspace cụ thể
    ↓
4. Discover endpoints
   a. Framework-native (nếu có):
      - Laravel → Scramble
      - FastAPI → built-in OpenAPI
      - NestJS → @nestjs/swagger
      - Django REST → drf-spectacular
      - Spring Boot → springdoc-openapi

   b. Fallback (nếu không có built-in):
      → Spawn 2 agents parallel:
      - Agent 1: Static analysis (routes, controllers, decorators)
      - Agent 2: Runtime analysis (sandbox, chạy app, capture traffic)
      → Tổng hợp:
        - Static only = possible dead code
        - Runtime only = dynamic routes
        - Cả hai = confirmed endpoints
    ↓
5. Generate docs (theo formats đã chọn)

   a. OpenAPI spec (nếu chọn):
      - Endpoints: method, path, params, request/response schemas
      - Authentication schemes
      - Error responses
      - Versioning info

   b. Postman Collection (nếu chọn):
      - Tất cả endpoints organized by folder
      - Pre-request scripts:
        → Lấy token từ environment variables
        → Set headers tự động
      - Post-request scripts:
        → Login response → set access_token vào env
        → Refresh response → update tokens
      - Environment template:
        → base_url, access_token, refresh_token
      - Test assertions per endpoint

   c. Markdown docs (nếu chọn):
      - Getting Started guide (AI draft)
      - Authentication guide (AI draft từ auth middleware)
      - Error Handling guide (AI draft từ error handlers)
      - API Reference (auto-generated từ endpoints)
      - Examples (curl, JS fetch, Python requests)

   d. Per API type:
      - REST → OpenAPI + Postman + Markdown
      - GraphQL → schema.graphql + Markdown (queries/mutations guide)
      - gRPC → proto docs + Markdown
    ↓
6. Trình bày draft
   ┌──────────────────────────────────┐
   │ API DOCS GENERATED               │
   ├──────────────────────────────────┤
   │ Endpoints: [N] discovered        │
   │ REST: [N] | GraphQL: [N]         │
   ├──────────────────────────────────┤
   │ Files:                           │
   │  - openapi.yaml        (nếu chọn)│
   │  - postman-collection.json  (")  │
   │  - docs/api.md              (")  │
   └──────────────────────────────────┘
   - User review / điều chỉnh
    ↓
7. Done
   - Ghi files
   - Commit: "docs: generate API documentation"

UPDATE MODE:
   - So sánh docs hiện tại với endpoints hiện tại
   - Detect: endpoints mới, endpoints xóa, params thay đổi,
     auth scheme thay đổi, response schema thay đổi
   - Trình bày diff cho user
   - User approve changes
   - Update files theo formats đã chọn
   - Commit: "docs: update API documentation"
```

## `/st:api-docs-config` - Thay đổi export format

```
1. Đọc config hiện tại
   - Hiển thị formats đang active
    ↓
2. User chọn lại (multi-select)
   ☐ OpenAPI spec
   ☐ Postman Collection
   ☐ Markdown docs
    ↓
3. Lưu vào .superteam/config.json
   - Lần chạy /st:api-docs tiếp theo sẽ dùng format mới
```

## So sánh

| | Superpowers | GSD | Industry (Swagger/Redoc) | Superteam |
|---|---|---|---|---|
| API docs generation | Không | Không | OpenAPI spec only | OpenAPI + Postman + Markdown (user chọn) |
| Endpoint detection | N/A | N/A | Manual hoặc framework-native | Framework-native → dual-agent fallback |
| Pre/Post-request scripts | N/A | N/A | Không (Postman riêng) | Có, trong Postman Collection |
| Multi-API type | N/A | N/A | REST only (OpenAPI) | REST + GraphQL + gRPC |
| AI-drafted guides | N/A | N/A | Không | Có (getting started, auth, errors) |
| Format config | N/A | N/A | Fixed | User chọn, lưu config, thay đổi bằng command |
| Update/drift detect | N/A | N/A | Manual | Detect endpoint changes, update selected files |
| Image input | N/A | N/A | Không | Có |

## Cải thiện so với industry

1. **Multi-format output** → user chọn format, không bị lock vào 1 tool
2. **Postman scripts** → pre/post-request automation, OpenAPI không có
3. **Dual-agent detection** → static + runtime tổng hợp, chính xác hơn single approach
4. **Multi-API** → REST + GraphQL + gRPC trong 1 command
5. **AI guides** → draft getting started, auth, error handling tự động
6. **Config-based format** → chọn 1 lần, thay đổi bằng `/st:api-docs-config`
