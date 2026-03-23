# Skill Spec: project-awareness

> Trang thai: DRAFT v2 | Ngay tao: 2026-03-23 | Chinh sua: 2026-03-23 (TCG review)

---

## Frontmatter

```yaml
---
name: project-awareness
description: >
  Use when any command needs project context — type, frameworks,
  workspaces, or config preferences. Provides adaptation principles
  per project type and monorepo scope resolution rules.
---
```

> **Luu y:** Frontmatter va noi dung SKILL.md thuc te luon viet bang tieng Anh. File nay la ban dich tieng Viet de review.

---

## Noi dung SKILL.md (ban dich tieng Viet)

### Tong quan

Project Awareness cung cap cho moi lenh Superteam kien thuc chinh xac ve du an dang lam viec. Tu dong chay khi bat dau session qua hook `session-start`.

**Hai nhiem vu:**
1. **Inject context** — trinh bay ket qua detection va config dang structured block de moi command doc.
2. **Nguyen tac thich ung** — quy tac cap cao theo tung loai project. Commands tu chuyen hoa thanh hanh vi cu the.

### Nguyen tac cot loi

```
CONTEXT TRUOC HANH DONG.

Moi hanh dong phai dua tren hieu biet ve du an la GI.
Khi thieu context hoac khong chac chan — bao cho user. Khong doan.
```

### Dinh dang Context Block

Session-start chay `detectProject(cwd)` va `loadConfig(cwd)`, sau do inject:

```
ST ► PROJECT CONTEXT
─────────────────────────────
Project:     {ten}
Type:        {loai} (confidence: {do_tin_cay})
Frameworks:  {frameworks}
Initialized: {Yes | No — goi y /st:init}

Workspaces:  (chi monorepo)
  - {ten} ({loai}) @ {duong_dan} [{frameworks}]

Preferences: (khi co config)
  Branch: {defaultBranch}  Commits: {commitStyle}
  Granularity: {granularity}  Parallel: {on|off}
  Research: {on|off}  Plan check: {on|off}  Verifier: {on|off}
─────────────────────────────
```

**Quy tac:**
- Luon hien thi confidence score — commands dung no de quyet dinh muc do tin cay.
- Neu khong co `.superteam/config.json`, bo phan Preferences va goi y `/st:init`.
- Monorepo workspaces luon duoc mo rong voi type va frameworks rieng.
- Gon gon. Chi data, khong van xuoi.

### Tin hieu Detection (Tom tat)

Cach `detectProject(cwd)` xac dinh type va confidence:

| Tin hieu File/Pattern | Type phat hien | Confidence |
|---|---|---|
| `next.config.*`, `nuxt.config.*`, `remix.config.*` | fullstack | 0.9 |
| `package.json` co react/vue/angular (khong co server framework) | frontend | 0.85 |
| `package.json` co express/fastify/nestjs (khong co UI framework) | backend | 0.85 |
| `pnpm-workspace.yaml`, `lerna.json`, workspaces trong package.json | monorepo | 0.9 |
| `manage.py` + `settings.py` | backend (django) | 0.9 |
| `go.mod` | backend (go) | 0.8 |
| `composer.json` + `artisan` | backend (laravel) | 0.9 |
| `Gemfile` + `config/routes.rb` | backend (rails) | 0.9 |
| `pom.xml` + `@SpringBootApplication` | backend (spring) | 0.9 |
| `Cargo.toml` | backend (rust) | 0.8 |
| react + express phat hien, khong co cau truc workspace | ??? | 0.4 (hoi user) |
| Khong co tin hieu nhan dien duoc | unknown | 0.1 |

> Bang nay la tom tat. Logic day du nam trong `core/detector.cjs`.
> Khi detection xung dot voi ky vong, kiem tra bang nay truoc.
> Cac stacks hien dang ho tro. Them tin hieu khi detector mo rong.

### Nguyen tac thich ung

Nguyen tac cap cao theo tung loai project. Commands tu chuyen hoa thanh hanh vi cu the.

#### Frontend

Nhan biet: type = `frontend`, hoac frameworks bao gom react, vue, angular, svelte, solid, astro.

- **Ranh gioi component la don vi cong viec.** Plan, execute, review, test o cap component — khong phai cap page hay feature.
  - _Vi du: `/st:plan` tao task theo component (Header, Sidebar, UserCard), khong theo page (HomePage, Settings)._
- **Output truc quan la san pham.** Commands lien quan UI phai tao ket qua truc quan co the kiem chung, khong chi tests pass.
  - _Vi du: `/st:execute` cho task UI nen bao gom kiem tra screenshot hoac Storybook, khong chi "tests pass"._
- **Nhan thuc design system.** Kiem tra design tokens, component libraries, theme config hien co truoc khi tao UI moi.
  - _Vi du: `/st:plan` kiem tra tailwind.config, theme.ts, hoac design-tokens/ truoc khi de xuat gia tri color/spacing moi._

#### Backend

Nhan biet: type = `backend`, hoac frameworks bao gom express, fastify, nestjs, hono, laravel, django, flask, go.

- **API contract dinh huong ke hoach.** Thay doi breaking can xac nhan ro rang. Plan va review phai danh dau thay doi contract.
  - _Vi du: `/st:plan` danh dau "⚠ BREAKING: xoa field `legacy_name` khoi response `GET /users/:id`" la task rieng can review._
- **Vi tri log theo framework.** Debug commands tu dong phat hien noi log nam theo framework.
  - _Vi du: `/st:debug` cho Laravel kiem tra `storage/logs/laravel.log` truoc, khong phai stdout._
- **An toan migration.** Bat ky command nao lien quan database phai kiem tra pending migrations va canh bao.
  - _Vi du: `/st:execute` chay `npx prisma migrate status` (hoac tuong duong) truoc khi thay doi code lien quan DB._

#### Fullstack

Nhan biet: type = `fullstack`, hoac frameworks bao gom next, nuxt, remix, sveltekit.

- **Ca nguyen tac frontend va backend deu ap dung.** Khong bo bo nao.
- **Ranh gioi client/server la diem noi quan trong.** Moi plan va review phai xac dinh cai gi chay o dau.
  - _Vi du: `/st:plan` cho Next.js tach task server action va task client component ro rang._
- **Phan tich tac dong xuyen ranh gioi.** Mot thay doi co the anh huong ca hai phia.
  - _Vi du: `/st:code-review` canh bao khi thay doi API route anh huong client-side fetch ma khong cap nhat consumer._
- **Khi nguyen tac xung dot, an toan phia server uu tien.** Migrations, API contracts, va data integrity quan trong hon client-side granularity hay visual concerns.

#### Monorepo

Nhan biet: type = `monorepo`, hoac mang workspaces co 2+ entries.

- **Scope luon phai ro rang.** Moi command phai biet dang lam viec tren workspace(s) nao.
- **Moi workspace co type rieng.** Frontend workspace nhan nguyen tac frontend, backend nhan nguyen tac backend.
- **Tac dong xuyen workspace la uu tien.** Thay doi trong shared packages anh huong tat ca consumers.
- **Thao tac root-level khac biet.** Root README, root config, root CI khac voi workspace-level.

#### Unknown (Khong xac dinh)

Nhan biet: type = `unknown`, hoac confidence < 0.5.

- **Khong gia dinh.** Khong ap dung hanh vi dac thu theo type.
- **Hoi user.** Trinh bay nhung gi da detect va yeu cau lam ro.
- **Goi y /st:init.** Hoi dap tuong tac giai quyet su mo ho.
- **Giam cap duyen dang — commands lam gi khi khong co type:**

| Nhom Command | Khi co type | Khi khong co type (unknown) |
|---|---|---|
| `/st:plan` | Task theo type (component-level cho frontend, v.v.) | Task generic theo file. Khong nhom theo type. |
| `/st:execute` | Pre-checks theo type (migrations, design system, v.v.) | Chi thay doi code. Bo qua pre-checks. |
| `/st:code-review` | Tieu chi review theo type | Chi tieu chi chung (logic, naming, tests). |
| `/st:debug` | Kiem tra vi tri log theo framework | Chi stdout/stderr. Hoi user vi tri log. |
| `/st:api-docs` | Tu dong phat hien API framework conventions | Hoi user ve API entry points. |

### Xac dinh scope trong Monorepo

```
XAC DINH SCOPE:
  1. Co argument workspace?         → dung workspace chi dinh
  2. cwd nam trong workspace?       → dung workspace cua cwd
  3. La command cap root?            → dung root scope
  4. Truong hop khac                 → hien danh sach, user chon
```

**Do uu tien:** argument ro rang > phat hien cwd > hoi user.

Khi da scope vao 1 workspace, van hien thi tac dong xuyen workspace:
```
⚠ Thay doi nay anh huong {workspace} nhung shared package {pkg}
  cung duoc dung boi {other_workspaces}. Can nhac chay tests xuyen workspace.
```

**Quy tac hien thi warning:**
- 1-3 workspaces bi anh huong: liet ke tat ca theo ten.
- 4+ workspaces: rut gon thanh "`{pkg}` duoc dung boi {N} workspaces khac. Chay `/st:plan --scope=all` de xem toan bo tac dong."
- Neu file thay doi nam trong thu muc noi bo cua workspace (khong phai shared package): khong hien warning xuyen workspace.

### Xu ly Confidence

| Confidence | Muc | Hanh vi |
|---|---|---|
| >= 0.8 | Cao | Tu dong ap dung nguyen tac. |
| 0.5-0.79 | Trung binh | Ap dung + hien thi: "Phat hien la {type} ({confidence}). Dung khong?" |
| < 0.5 | Thap | KHONG ap dung hanh vi dac thu. Hoi user truoc. |

**Config vs detection xung dot:** Config thang. User da set type trong `/st:init` mot cach co y. Hien thi su khac biet nhung dung config.

**Detection khong day du:** Detector thay frameworks nhung khong the xac dinh type (VD: react + express ma khong co cau truc workspace). Trinh bay nhung gi DA biet, hoi user lam ro. Khong mac dinh la fullstack khi chua xac nhan.

### Xu ly loi

#### Session-start hook that bai

Neu `detectProject()` hoac `loadConfig()` that bai (timeout, loi permission, loi parse):

```
ST ► PROJECT CONTEXT
─────────────────────────────
Project:     {ten tu directory}
Type:        unknown (detection failed: {ly_do})
Frameworks:  —
Initialized: {Yes | No}

⚠ Detection khong hoan tat. Chay /st:init de set type thu cong.
─────────────────────────────
```

**Quy tac:**
- KHONG BAO GIO bat dau session voi zero context. Luon inject it nhat error block phia tren.
- Log ly do that bai de debug (`ST ► WARN: detectProject failed: {error}`).
- Neu chi detection that bai nhung config ton tai: dung config. Hien warning nhung tiep tuc binh thuong.
- Neu ca hai that bai: inject error block, moi commands chay o che do "unknown".

#### Detection khong day du

Neu detector giai quyet duoc mot so fields nhung khong phai tat ca (VD: tim thay frameworks nhung khong the xac dinh type):

- Inject nhung gi DA biet. De fields khong biet la `—`.
- Confidence tu dong giam xuong < 0.5 (kich hoat hanh vi "hoi user").
- Khong block session. Context khong day du van tot hon khong co context.

### Tham khao nhanh

```
MOI SESSION:
  detect → config → inject context block
  Detection that bai → inject error block, khong bao gio zero context
  Khong co .superteam/ → goi y /st:init

MOI COMMAND:
  Doc context block → kiem tra type → chon nguyen tac
  Kiem tra confidence → quyet dinh muc tin cay
  Monorepo → xac dinh scope (arg > cwd > hoi)

CONFIDENCE:
  >= 0.8  tu dong ap dung
  0.5-0.79  ap dung + xac nhan
  < 0.5  hoi truoc

CONFIG vs DETECTION:
  Co config → config thang
  Khong co config → detection voi quy tac confidence
  Config + detection xung dot → dung config, hien su khac biet

MONOREPO:
  Luon xac dinh scope truoc khi hanh dong
  Moi workspace ke thua nguyen tac cua type no
  Warning xuyen workspace: <=3 liet ke ten, 4+ rut gon
  Thay doi noi bo: khong hien warning xuyen workspace
```

### Loi thuong gap

| Loi | Cach sua |
|---|---|
| Ap dung nguyen tac frontend cho du an chi co backend | Kiem tra detection.type truoc khi ap dung hanh vi dac thu |
| Chay lenh monorepo khong co scope | Luon xac dinh scope. arg > cwd > hoi |
| Bo qua confidence thap, tiep tuc voi gia dinh | Confidence thap = hoi user. Khong bao gio gia dinh |
| Ghi de config.type bang detection moi | Config la lua chon ro rang cua user. Detection co the phan anh code WIP |
| Gia dinh fullstack khi thay ca frontend + backend frameworks | Co the la monorepo hoac concerns rieng biet. Hoi |
| Bo qua context injection cho du an "hien nhien" | Moi session bat dau tu so khong. Luon inject |
| Ap dung tat ca nguyen tac cho tat ca commands nhu nhau | Loc theo lien quan. Lenh API docs khong can responsive design |
| Session bat dau voi zero context sau khi hook that bai | Luon inject error block. Khong bao gio zero context |

### Tich hop

**Su dung boi:** Moi lenh `/st:`. Hook session-start inject context block vao conversation context. Commands doc no nhu structured text tu session — khong can API call hay variable.

**Phu thuoc ky thuat:**
- `core/detector.cjs` — ket qua detection (type, frameworks, workspaces, confidence)
- `core/config.cjs` — tai config va gia tri mac dinh
- `hooks/session-start` — dieu phoi detection + config + injection

**Skills tham chieu project-awareness:**
- `superteam:code-review-standards` — tieu chi review thich ung theo type
- `superteam:wave-parallelism` — ton trong config.parallelization
- `superteam:plan-quality` — granularity thich ung theo do phuc tap du an
- `superteam:verification` — tieu chi khac nhau theo type
- `superteam:handoff-protocol` — handoff bao gom project context

---

## Quyet dinh thiet ke

1. **Tu do cao** — nguyen tac, khong phai quy tac chinh xac. Commands tu chuyen hoa.
2. **Khong co supporting files** — tat ca noi dung nam duoi 500 dong (~350 dong sau review).
3. **Config thang detection** — user da set type mot cach co y trong /st:init.
4. **Confidence tiers voi nguong so** — ngan chan viec hop ly hoa "gan dung la du".
5. **Monorepo scope co phan rieng** — decision tree khong hien nhien.
6. **Description duoi 200 ky tu** — tap trung vao KHI NAO, khong tom tat workflow.
7. **Tiep can Constitution** — nguong ro rang, khong phai goi y.
8. **Vi du cu the theo tung nguyen tac** — neo giu cach interpret, ngan commands bo qua hoac hieu sai.
9. **Bang Detection Signals** — giup debug khi detection sai, diem tham chieu duy nhat.
10. **Nguong warning cho monorepo** — ngan chan warning fatigue trong monorepo lon.
11. **Bang graceful degradation** — hanh vi baseline ro rang cho unknown type.
12. **Xu ly loi voi fallback** — session-start la single point of failure, khong bao gio tao zero context.

## Ke hoach Testing (sau khi implement Core Framework)

1. Bat dau session trong du an React khong co skill — Claude co biet la frontend khong?
2. Bat dau session trong monorepo khong co skill — Claude co scope commands dung khong?
3. Confidence 0.6 khong co skill — Claude hoi hay gia dinh?
4. Cung kich ban VOI skill — Claude nen inject context, ap dung nguyen tac, xu ly confidence.
5. Config noi backend, detection noi fullstack — Claude co theo config khong?
6. Du an unknown — Claude co goi y /st:init thay vi doan khong?
7. Detector timeout (monorepo 50+ packages) — co inject error block khong?
8. Config file JSON hong — co fallback ve detection khong?
9. Permission denied tren node_modules — co partial detect khong?
10. Shared package dung boi 2 workspaces — warning hien du ten?
11. Shared package dung boi 15 workspaces — warning co rut gon khong?
12. `/st:plan` voi unknown type — tao generic tasks hay crash?
13. `/st:debug` voi unknown type — hoi log location hay bo qua?
14. `/st:plan` frontend project — tao task per component hay per page?
15. `/st:execute` backend voi pending migration — co canh bao khong?
