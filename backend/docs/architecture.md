<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Backend Technical Spec · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [API Specs](./api-collection.md) · [Frontend Consumer](../../frontend/README.md) · [Frontend Architecture](../../frontend/docs/architecture.md)

# Architecture — Catering Nusantara Back-End

> Structural standards, layering, and conventions. See DATABASE.md for schema/business rules, WORKFLOW.md for the pipeline.

## Infrastructure Directory Tree (THE STANDARD)

```
backend/
├── app/
│   ├── Enums/                       # Backed enums for constrained string fields
│   │   ├── PaketKategoriEnum.php    #   Nasi Box, Prasmanan, Snack, Tumpeng
│   │   ├── KategoriAcaraEnum.php    #   Pernikahan, Kantor, Ulang Tahun, Arisan, Umum
│   │   └── StatusPesananEnum.php    #   pending, confirmed, completed, cancelled
│   ├── Http/
│   │   ├── Controllers/             # FLAT namespace App\Http\Controllers\* (LOCKED)
│   │   │   ├── Auth/                #   Breeze
│   │   │   ├── PaketController.php
│   │   │   ├── GaleriController.php
│   │   │   └── PesananController.php
│   │   ├── Middleware/
│   │   ├── Requests/                # 1 file per action, grouped by domain
│   │   │   ├── Auth/
│   │   │   ├── Paket/   {PaketStoreRequest, PaketUpdateRequest}
│   │   │   ├── Galeri/  {GaleriStoreRequest, GaleriUpdateRequest}
│   │   │   └── Pesanan/ {PesananStoreRequest}
│   │   └── Resources/
│   │       ├── PaketResource.php
│   │       ├── GaleriResource.php
│   │       └── PesananResource.php
│   ├── Models/                      # User, Paket, Galeri, Pesanan
│   ├── Services/                    # Business logic — KEEP CONTROLLERS SLIM
│   │   ├── HargaService.php         #   total_harga calc + price snapshot
│   │   ├── StrukService.php         #   STR-YYYYMMDD-XXXX generator
│   │   └── PesananService.php       #   order orchestration
│   └── Providers/
├── database/
│   ├── migrations/
│   ├── factories/                   # PaketFactory, GaleriFactory, PesananFactory
│   └── seeders/                     # DatabaseSeeder + PaketSeeder (real client data)
├── routes/
│   ├── api.php                      # v1 domain routes (versioned via prefix)
│   └── auth.php                     # Breeze auth routes (RESTORED)
├── tests/
│   ├── Feature/                     # PaketApiTest, GaleriApiTest, PesananApiTest
│   └── Unit/                        # HargaServiceTest, StrukServiceTest
├── AGENTS.md                        # quick-start (agent context)
├── WORKFLOW.md                      # pipeline + pre-flight (this documentation set)
├── ARCHITECTURE.md
├── DATABASE.md
└── BOOST-GUIDELINES.md              # Laravel Boost tooling (auto-generated block)
```

## Layering Responsibilities

| Layer | Location | Owns | MUST NOT |
|-------|----------|------|----------|
| **Enum** | `app/Enums/` | All constrained string values, `Rule::enum()` validation | Business logic |
| **FormRequest** | `app/Http/Requests/{Domain}/` | Input validation (incl. JSON array shape) | DB writes, responses |
| **Service** | `app/Services/` | Business logic: price calc, snapshot, struk generation, orchestration | HTTP concerns |
| **Resource** | `app/Http/Resources/` | Response serialization, `whenLoaded()` | Validation, logic |
| **Controller** | `app/Http/Controllers/` | Thin glue: validate → call service → return resource | Raw logic, raw arrays |

**Controller location (LOCKED):** flat `app/Http/Controllers\*` — NO `Api/V1` subfolder. Versioning handled purely via `Route::prefix('v1')`.

## Response Envelope Standard

Every JSON response uses the benchmark envelope (from klikantri-appointment-app):

```json
{ "status": true, "message": "Data retrieved successfully", "data": { ... } }
```

- `status`: boolean (true = success, false = error)
- `message`: human-readable string
- `data`: payload (object, array, or paginated result)

## Route Conventions

```php
Route::prefix('v1')->group(function () {
    // Public (no auth)
    Route::get('/paket', [PaketController::class, 'index'])->name('paket.index');
    Route::get('/paket/{paket}', [PaketController::class, 'show'])->name('paket.show');
    Route::get('/paket/best-seller', [PaketController::class, 'bestSeller'])->name('paket.best-seller');
    Route::get('/galeri', [GaleriController::class, 'index'])->name('galeri.index');

    // Admin (auth:sanctum + role guard)
    Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
        Route::apiResource('paket', PaketController::class);
        Route::apiResource('galeri', GaleriController::class)->except('update');
        Route::get('/pesanan', [PesananController::class, 'index'])->name('pesanan.index');
        Route::post('/pesanan', [PesananController::class, 'store'])->name('pesanan.store');
        Route::get('/pesanan/{pesanan}', [PesananController::class, 'show'])->name('pesanan.show');
        Route::put('/pesanan/{pesanan}', [PesananController::class, 'update'])->name('pesanan.update');
        Route::get('/pesanan/{pesanan}/struk', [PesananController::class, 'struk'])->name('pesanan.struk');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
    });
});
```

Rules:
- **Named routes always.** Use `route()` for URL generation.
- API versioning via `Route::prefix('v1')` ONLY.
- Auth routes live in `routes/auth.php` (Breeze). `routes/api.php` holds domain routes.
- Middleware: `guest` for auth entry points, `auth:sanctum` for admin.

## Code Conventions (Benchmark-sourced — klikantri)

- **FormRequests:** `authorize()` returns `true` unless role-gated; typed `rules()`. Use `Rule::enum(Enum::class)` for enum columns, `exists:table,column` for FKs, `after_or_equal:today` for future dates.
- **Resources:** `whenLoaded('relation', fn() => ...)` to avoid N+1; eager-load with `with()` on lists.
- **Enums:** PHP 8 backed enums, `TitleCase` case keys, `->value` when persisting, `Rule::enum()` when validating.
- **Models:** explicit `casts()`, `$fillable`, scopes for reusable query fragments (e.g. `scopeForWebsite()`).
- **Search/filtering:** shallow in controller or model scope; bound parameters only — no raw string interpolation.
- **Formatting:** `vendor/bin/pint --dirty --format agent` before finalizing.
- **composer scripts:** `composer test` = `config:clear` + `php artisan test`.

## Tech Stack

| Layer | Version |
|-------|---------|
| PHP | 8.4 |
| Laravel | 13.x |
| Sanctum | 4.x (SPA tokens) |
| Breeze | 2.x (auth scaffolding) |
| Pest | 4.x |
| Pint | 1.x |
| Scramble | ^0.13.36 (OpenAPI docs) |
| Neon Database | Serverless PostgreSQL (primary DB) |
