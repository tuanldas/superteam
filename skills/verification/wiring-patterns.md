# Wiring Verification Patterns

Reference file for `superteam:verification`. Loaded when checking Level 3 (Wired) and Level 4 (Data-Flow).

80% of stubs hide in wiring. These 4 patterns catch them.

## Pattern 1: Component → API

**What to check:** Frontend component calls backend API AND consumes the response.

**Verified:**
```typescript
// Component makes API call
const response = await fetch('/api/users');
const users = await response.json();
// AND uses the data
return <UserList users={users} />;
```

**Red flags:**
```typescript
// onSubmit only logs (STUB)
const handleSubmit = () => {
  console.log('submitted');
};

// Fetch exists but response ignored (HOLLOW)
await fetch('/api/users');
return <UserList users={[]} />;  // hardcoded empty

// No fetch at all (ORPHANED — component exists but doesn't talk to API)
return <UserList users={mockData} />;
```

**Grep check:**
```bash
# Has fetch/axios AND setState/return with response
grep -A5 "fetch\|axios" src/components/ComponentName.tsx | grep "set\|return\|json()"
```

## Pattern 2: API → Database

**What to check:** API route queries database AND returns the result.

**Verified:**
```typescript
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

**Red flags:**
```typescript
// Returns static data (STUB)
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Test User' }]);
});

// Has DB query but returns hardcoded response (HOLLOW)
app.get('/api/users', async (req, res) => {
  await prisma.user.findMany(); // query executed but result discarded
  res.json({ message: 'success' });
});
```

**Grep check:**
```bash
# Has DB call AND res.json/res.send with result variable
grep -B5 -A5 "prisma\|mongoose\|knex\|db\." src/api/ | grep "res\.\(json\|send\)"
```

## Pattern 3: Form → Handler

**What to check:** Form's onSubmit has real logic — fetch, mutation, state update.

**Verified:**
```typescript
const handleSubmit = async (data) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const result = await response.json();
  setUser(result.user);
  router.push('/dashboard');
};
```

**Red flags:**
```typescript
// Empty handler (STUB)
const handleSubmit = () => {};

// Log-only handler (STUB)
const handleSubmit = (data) => {
  console.log('form data:', data);
};

// Alert-only handler (STUB)
const handleSubmit = () => {
  alert('Submitted!');
};
```

**Grep check:**
```bash
# onSubmit/handleSubmit has fetch/mutate/dispatch (not just log/alert)
grep -A10 "handleSubmit\|onSubmit" src/ | grep "fetch\|mutate\|dispatch\|axios"
```

## Pattern 4: State → Render

**What to check:** useState/useQuery variable actually appears in JSX output.

**Verified:**
```typescript
const [users, setUsers] = useState([]);
// ... fetch and setUsers ...
return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
```

**Red flags:**
```typescript
// State declared but never rendered (ORPHANED)
const [users, setUsers] = useState([]);
return <div>Users page</div>;  // users variable not in JSX

// State rendered but always empty (HOLLOW)
const [users] = useState([]);  // never populated
return <ul>{users.map(...)}</ul>;  // renders empty list forever
```

**Grep check:**
```bash
# useState variable name appears in return/JSX
grep -n "useState" src/components/Component.tsx  # find variable name
grep -n "{variableName" src/components/Component.tsx  # check if used in JSX
```

## Pattern 5: Handler → Service (Backend)

**What to check:** Request handler delegates to a service layer, not inline logic.

**Verified:**
```typescript
app.post('/api/orders', async (req, res) => {
  const order = await orderService.create(req.body);
  res.json(order);
});
```

**Red flags:**
```typescript
// Handler has all logic inline (no service layer — may be fine for simple cases, but verify intent)
// Handler calls service but ignores result
await orderService.create(req.body);
res.json({ message: 'ok' }); // result discarded
```

## Pattern 6: Service → Repository (Backend)

**What to check:** Service layer calls repository/data layer, not hardcoded data.

**Verified:**
```typescript
class OrderService {
  async create(data) {
    return await this.orderRepo.save(new Order(data));
  }
}
```

**Red flags:**
```typescript
// Service returns hardcoded data (STUB)
class OrderService {
  async create(data) { return { id: 1, ...data }; }
}

// Service has empty methods (STUB)
class OrderService {
  async create(data) {}
}
```

## Pattern 7: Module → Export

**What to check:** Module exports are actually used by consumers.

**Grep check:**
```bash
# Find what module exports
grep -n "export\|module\.exports\|__all__" src/module.ts
# Check if exports are imported anywhere
grep -rn "from.*module\|import.*module\|require.*module" src/
```

**Red flag:** Module exports 5 functions but only 1 is imported elsewhere. Are the other 4 dead code or not-yet-wired?

## Combining Patterns

For a complete feature, verify the FULL chain:

```
Frontend: Form → Handler → API Call → Response → State → Render
Backend:  Route Handler → Service → Repository → Database → Response

Each arrow is a wiring point.
Each wiring point can be broken (STUB, ORPHANED, HOLLOW).
Check every arrow, not just the endpoints.
```
