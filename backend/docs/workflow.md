<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Backend Workflow Spec · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [API Specs](./api-collection.md) · [Frontend Consumer](../../frontend/README.md)

# Zero-Hallucination Workflow — Catering Nusantara Back-End

> The mandatory pipeline for EVERY feature. Do not skip steps, do not reorder. This is what "done" means.

## The Pipeline

### Step 1 — Write the Laravel code
Order of construction:
1. **Migration** (`database/migrations/`) — one table per concern
2. **Model** (`app/Models/`) — `$fillable`, `casts()` (incl. JSON arrays), relationships, query scopes
3. **Factory** (`database/factories/`) — faker data + states for edge cases
4. **FormRequest** (`app/Http/Requests/{Domain}/`) — validation rules (see ARCHITECTURE.md)
5. **Service** (`app/Services/`) — ONLY if business logic exists (pricing, struk, orchestration)
6. **Resource** (`app/Http/Resources/`) — response shape with `whenLoaded()`
7. **Controller** (`app/Http/Controllers/`) — thin: request → service → resource
8. **Routes** (`routes/api.php`) — `prefix('v1')`, named routes

Then run:
```bash
vendor/bin/pint --dirty --format agent
```

### Step 2 — Write & run Pest tests (GATE: must be GREEN)
- Feature tests for every endpoint: success path, validation failures, auth guards, business rules.
- Unit tests for services: `HargaService` (incl. Tumpeng Mini edge case), `StrukService` (format + daily counter).
- Factories with faker; use model states for edge cases.
- Gate: `php artisan test --compact` MUST pass before ANY further step.

```bash
php artisan test --compact              # full suite
php artisan test --compact --filter=PesananApiTest   # single file
```

### Step 3 — Create/update Bruno `.bru` files
Path: `api-collections/catering-api/` (already scaffolded: `auth/*`, `paket/{list,show,create,update,delete}`, `pesanan/create`, `environments/local.bru`).
- Mirror EVERY endpoint with a `.bru` file.
- Use realistic dummy JSON bodies (matching FormRequest expectations).
- Verify the collection opens in Bruno (`bruno.json` present).

### Step 4 — (Optional) Postman cloud sync
Push successful test structures to the Postman workspace via the Postman MCP.
- Requires: workspace + collection ID from the user.
- Skip if not configured — never block on this step.

### Step 5 — Generate OpenAPI docs
`dedoc/scramble` is ALREADY installed (`^0.13.36`). Regenerate the spec:

```bash
php artisan scramble:export            # writes openapi.json at project root
```

- Scalar renders the spec live at `/docs/api` when the server runs.
- Commit `openapi.json` alongside feature changes.

---

## Pre-flight Checklist (before ANY feature work)

- [ ] `composer install` / deps up to date
- [ ] `php artisan migrate:fresh --seed` works
- [ ] `routes/auth.php` restored & Breeze endpoints functional (register/login/logout/reset)
- [ ] `routes/api.php` free of stale imports (klikantri leftovers removed)
- [ ] `php artisan test --compact` GREEN on the baseline suite
- [ ] `vendor/bin/pint` passes on changed files
- [ ] `dedoc/scramble` installed (done — `^0.13.36`)
- [ ] Bruno collection (`api-collections/catering-api/`) loads

---

## Definition of Done (every feature)
- [ ] Migration + Model + Factory + Request + Service + Resource + Controller + Routes written
- [ ] Pest feature tests GREEN (`php artisan test --compact`)
- [ ] Bruno `.bru` file created/updated with dummy JSON
- [ ] `openapi.json` regenerated (`php artisan scramble:export`) & committed
- [ ] `vendor/bin/pint --dirty --format agent` run
- [ ] Routes named, `prefix('v1')` respected
