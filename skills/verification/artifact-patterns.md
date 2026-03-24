# Artifact Verification Patterns

Reference file for `superteam:verification`. Loaded when performing deep artifact analysis.

Framework-specific grep patterns for 4-level verification.

## React / Vue / Svelte Components

### Level 1: Exists
```bash
ls src/components/ComponentName.tsx  # or .vue, .svelte
```

### Level 2: Substantive
```bash
# Must have JSX return (not null, not empty div, not "TODO")
grep -n "return" src/components/ComponentName.tsx
# Check for placeholder content
grep -n "TODO\|placeholder\|not implemented\|lorem" src/components/ComponentName.tsx
# Line count > 15 suggests real implementation
wc -l src/components/ComponentName.tsx
```

### Level 3: Wired
```bash
# Imported somewhere
grep -rn "import.*ComponentName" src/
# Used in JSX
grep -rn "<ComponentName" src/
```

### Level 4: Data-Flow
```bash
# Has props or state that receive real data
grep -n "useState\|useQuery\|useFetch\|props\." src/components/ComponentName.tsx
# Data rendered in JSX (not hardcoded)
grep -n "{.*}" src/components/ComponentName.tsx  # template expressions
```

## API Routes / Endpoints

### Level 2: Substantive
```bash
# Has actual logic (not just "not implemented" response)
grep -n "not implemented\|TODO\|res.status(501)" src/api/route.ts
# Has database interaction or business logic
grep -n "prisma\|mongoose\|knex\|sequelize\|db\.\|repository\." src/api/route.ts
# Line count > 10 suggests real implementation
wc -l src/api/route.ts
```

### Level 3: Wired
```bash
# Registered in router
grep -rn "route\|router\.\(get\|post\|put\|delete\)" src/
# Called by frontend
grep -rn "fetch\|axios\|api\." src/components/ src/pages/
```

### Level 4: Data-Flow
```bash
# Returns data from DB (not static response)
grep -n "return.*await\|res.json.*await\|res.send.*await" src/api/route.ts
# Error handling exists
grep -n "catch\|try\|error\|throw" src/api/route.ts
```

## Database Models / Schemas

### Level 2: Substantive
```bash
# Has fields defined (not empty model)
grep -n "field\|column\|attribute\|@Column\|@Field" src/models/
# Has relationships
grep -n "hasMany\|belongsTo\|@Relation\|@ManyToOne\|ForeignKey" src/models/
```

### Level 3: Wired
```bash
# Used in API routes or services
grep -rn "import.*Model\|from.*models" src/api/ src/services/
# Migration exists and is applied
ls src/migrations/ db/migrations/
```

## Python (Django / FastAPI / Flask)

### Level 2: Substantive
```bash
# Has real logic (not pass, not raise NotImplementedError)
grep -n "pass$\|NotImplementedError\|TODO\|placeholder" src/views.py src/services/
# Has actual return or response
grep -n "return\|Response\|JsonResponse\|HTTPException" src/views.py
# Line count > 10 suggests real implementation
wc -l src/views.py src/services/*.py
```

### Level 3: Wired
```bash
# Registered in urls/routes
grep -rn "path\|url\|router\.\(get\|post\|add_api_route\)" src/urls.py src/routes.py
# Imported by other modules
grep -rn "from.*import\|import.*service\|import.*repository" src/
```

## Java / Kotlin (Spring Boot)

### Level 2: Substantive
```bash
# Has real logic (not throw UnsupportedOperationException, not TODO)
grep -n "UnsupportedOperationException\|TODO\|NotImplemented\|return null;" src/main/java/
# Has annotations indicating real endpoints
grep -n "@GetMapping\|@PostMapping\|@RequestMapping\|@Service\|@Repository" src/main/java/
# Line count > 15 suggests real implementation
wc -l src/main/java/**/*.java
```

### Level 3: Wired
```bash
# Injected/used by other classes
grep -rn "@Autowired\|@Inject\|private.*Service\|private.*Repository" src/main/java/
# Controller calls service, service calls repository
grep -rn "this\.\(service\|repository\)\." src/main/java/
```

## Go

### Level 2: Substantive
```bash
# Has real logic (not panic("not implemented"), not TODO)
grep -n "panic\|TODO\|not implemented" src/*.go
# Has actual return values
grep -n "return " src/*.go | grep -v "return nil\|return err"
```

### Level 3: Wired
```bash
# Imported by other packages
grep -rn "import.*packagename" src/
# Handler registered in router
grep -rn "HandleFunc\|Handle\|router\.\(GET\|POST\)" src/
```

## General Patterns

### Placeholder Detection
```bash
# Across entire project
grep -rn "TODO\|FIXME\|HACK\|XXX\|not implemented\|placeholder\|stub" src/
grep -rn "console\.log\|print(" src/ --include="*.ts" --include="*.tsx"  # log-only implementations
```

### Disabled Tests
```bash
grep -rn "\.skip\|xit\|xdescribe\|@pytest\.mark\.skip\|@unittest\.skip" tests/ src/
```
