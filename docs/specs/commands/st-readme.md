# `/st:readme` - Generate/Update README

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Generate hoặc update README.md từ codebase. Hỗ trợ RDD (README-Driven Development), dynamic sections theo project type, drift detection, và monorepo scoping.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Template | Chung + dynamic sections | 1 template duy nhất, AI thêm/bớt sections theo detection. Ít maintenance, flexible |
| Update mode | Manual trigger + drift warning hook | Hook nhắc nhở nhẹ, user quyết định. Không aggressive, không bỏ sót |
| RDD support | Có, detect tự động | Có code → từ codebase. Chưa có → từ PROJECT.md/REQUIREMENTS.md |
| Monorepo | User chọn scope | `/st:readme` (root), `/st:readme frontend` (workspace), `/st:readme --all` (tất cả) |
| Image input | Accept ảnh (screenshots, diagrams cho README) | Cross-cutting feature |

## Flow

```
1. Detect context
   - Đọc .superteam/config.json (type, frameworks, workspaces)
   - Đọc .superteam/PROJECT.md (mục đích, core value)
   - Scan codebase (package.json, cấu trúc thư mục, entry points)
   - Đọc README.md hiện tại (nếu có)
   - Image input: accept ảnh (screenshots, diagrams cho README)
    ↓
2. Detect mode
   a. Scope (monorepo):
      - Không argument → root README
      - `/st:readme frontend` → workspace cụ thể
      - `/st:readme --all` → root + tất cả workspaces

   b. Generate vs Update:
      - README.md chưa tồn tại → Generate mode
      - README.md đã tồn tại → Update mode

   c. RDD detect:
      - Có code trong project → generate từ codebase
      - Chưa có code, có PROJECT.md → RDD mode (từ planning docs)
    ↓
3a. Generate mode
   - Load template core:
     - Title + Description
     - Installation
     - Usage / Quick start
     - Project structure
     - Tech stack
     - Contributing
     - License

   - Dynamic sections dựa trên detection:
     → Frontend: + Screenshots/Demo, Browser support, Tech stack badges
     → API/Backend: + Endpoints overview, Auth, Environment variables
     → Library: + API reference, Examples, Compatibility
     → CLI: + Commands table, Options/flags, Shell completion
     → Monorepo: + Packages overview, Architecture diagram

   - RDD mode: generate từ PROJECT.md + REQUIREMENTS.md thay vì code
   - Trình bày draft cho user
   - User confirm / điều chỉnh
   - Ghi README.md
   - Commit: "docs: generate README"
    ↓
3b. Update mode
   - So sánh README hiện tại với codebase hiện tại
   - Detect drift:
     → Installation commands còn đúng không?
     → Dependencies thay đổi?
     → Có endpoints/features mới chưa document?
     → Version numbers còn đúng?
     → Code examples còn chạy được?
   - Trình bày danh sách changes:
     ┌─────────────────────────────────┐
     │ README DRIFT DETECTED           │
     ├─────────────────────────────────┤
     │ Outdated:  [N] sections         │
     │ Missing:   [N] sections         │
     │ Unchanged: [N] sections         │
     ├─────────────────────────────────┤
     │ [Chi tiết từng change đề xuất]  │
     └─────────────────────────────────┘
   - User chọn: apply tất cả / chọn từng cái / skip
   - Ghi README.md
   - Commit: "docs: update README"
    ↓
4. Done
```

## Drift Warning Hook

Tích hợp vào session hooks (context-monitor):

```
Mỗi khi commit:
  → Quick scan: README.md vs recent changes
  → Nếu detect drift:
    "⚠️ README có thể cần update. Chạy /st:readme để review."
  → Không block commit, chỉ cảnh báo
```

## So sánh

| | Superpowers | GSD | Industry (ReadmeAI) | Superteam |
|---|---|---|---|---|
| README generation | Không | Không | Có (từ codebase) | Có (codebase + RDD) |
| Project type aware | N/A | N/A | Không | Có (dynamic sections) |
| Update/drift detect | Không | Không | Không | Có (manual + hook warning) |
| Monorepo support | N/A | N/A | Partial | Có (scope selection) |
| RDD mode | Không | Không | Không | Có (từ PROJECT.md) |
| Image input | N/A | N/A | Không | Có |

## Cải thiện so với industry

1. **Project type aware** → dynamic sections, không tool nào hiện tại làm được
2. **RDD mode** → generate README trước khi code, từ planning docs
3. **Drift detection** → hook cảnh báo README lỗi thời, chỉ driftcheck làm tương tự
4. **Monorepo scope** → root / workspace / all, linh hoạt
5. **Tích hợp Superteam ecosystem** → dùng PROJECT.md, config.json, detection results
