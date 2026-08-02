# Catering Nusantara — Backend

Laravel API for the Catering Nusantara platform. Serves the public catalog (`paket`, `galeri`) and the authenticated Admin CMS / Mini POS (`pesanan`) consumed by the React frontend.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | **Laravel 13** (PHP 8.4) |
| Auth | **Breeze** (scaffolding) + **Sanctum** (SPA API tokens) |
| Database | **Neon** — serverless PostgreSQL (`DB_CONNECTION=pgsql`) |
| Testing | **Pest 4** |
| Code style | **Pint** |
| API docs | **Scramble** (`openapi.json`) + Bruno collection in `docs/api/bruno` |

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# fill DB_* vars from your Neon connection string (DB_CONNECTION=pgsql, DB_SSLMODE=require)
php artisan migrate --seed
php artisan install:api   # Sanctum setup
php artisan serve
```

## Tests

```bash
php artisan test            # Pest suite (Feature API tests + Unit service tests)
vendor/bin/pint --dirty     # format changed PHP files before finalizing
```

## Key Business Rules (server-enforced)

- `total_harga` is **server-computed only**: `(jumlah_paket * harga_paket_satuan) + biaya_tambahan`. Never accepted from the client.
- `harga_paket_satuan` is a **snapshot** copied from `paket.harga_per_porsi` at order creation.
- `nomor_struk` is **server-generated** (`STR-YYYYMMDD-XXXX`, daily sequential counter).
- JSON array fields (`menu_utama`, `menu_tambahan`, `fasilitas_termasuk`, `detail_tambahan`) are validated via **Form Requests**.
- 4 core tables only (`users`, `paket`, `galeri`, `pesanan`). No new tables without approval.

## Project Structure

```
app/
├── Enums/          # Backed enums for constrained string fields
├── Http/Controllers/   # FLAT controllers (locked convention)
├── Http/Requests/      # FormRequest validation per resource
├── Http/Resources/     # API resource transformations
├── Models/
└── Services/       # HargaService, PesananService, StrukService (business logic)
database/
├── migrations/     # 4 core tables + Sanctum personal access tokens
├── factories/      # Paket/Galeri/Pesanan factories
└── seeders/        # PaketSeeder, DatabaseSeeder
routes/
├── api.php         # Public + authenticated API routes
└── auth.php        # Breeze auth routes
tests/
├── Feature/        # GaleriApiTest, PaketApiTest, PesananApiTest, Auth/*
└── Unit/           # HargaServiceTest, StrukServiceTest
```

## Documentation

| File | Contents |
|---|---|
| `AGENTS.md` | Mandatory rules for AI agents working in this folder |
| `docs/architecture.md` | Backend layering, conventions, response envelope |
| `docs/database.md` | Neon schema, JSON array rules, business rules |
| `docs/database-seeders.md` | Seeder data and fixtures |
| `docs/workflow.md` | Zero-Hallucination pipeline (Code → Pest → Bruno → Scramble) |
| `docs/boost-guidelines.md` | Laravel Boost MCP tooling guidelines |
| `openapi.json` | Generated OpenAPI spec (Scramble) |

Cross-reference: repo root `../README.md`, `../docs/architecture.md`, `../docs/project-context.md`.
