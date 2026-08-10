# 2. Architecture & System Design

# Architecture & System Design

## System Architecture Overview

Monorepo with two isolated applications sharing one MySQL database. No Inertia — the frontend is a fully decoupled React SPA consuming Laravel REST API via Sanctum tokens.

## Two-Surface Architecture

This is NOT multi-tenant. There is exactly ONE admin and unlimited anonymous visitors.

### Surface 1: Public Site (Read-Only Catalog)

- **Access:** No authentication required
- **Data:** SELECT-only on `paket` and `galeri` tables
- **Goal:** Browse → Calculator → WhatsApp checkout
- **Pages:** Beranda, Tentang Kami, Paket Katering, Detail Paket, Galeri, Cara Pemesanan, Kontak, FAQ

### Surface 2: Admin CMS + Mini POS

- **Access:** Sanctum SPA token auth (email + password)
- **Data:** CRUD on `paket`, `galeri`; INSERT/SELECT on `pesanan`
- **Goal:** Manage menus, record orders with auto-calculation, view history
- **Pages:** Dashboard, Kelola Produk, Pencatatan Pesanan

## User Flows

### Customer Flow

```
Website → Beranda → Katalog Paket → Filter & Pilih → Detail Paket → Kalkulator Porsi → WhatsApp Checkout
```

Output: Customer sends WhatsApp message with package details + estimated price (manual input for admin)

### Admin Flow

```
Login → Dashboard → (Kelola Produk | Pencatatan Pesanan)
                                       ↓
                          Input order from WhatsApp chat
                                       ↓
                          System auto-calculates total
                                       ↓
                          Generate invoice / struk
```

## Database Schema

### Core Tables (4 total)

**users** — Admin authentication

| Column | Type | Notes |
| --- | --- | --- |
| id | INT PK AI |  |
| nama | VARCHAR(255) |  |
| email | VARCHAR(255) UNIQUE | Login credential |
| password | VARCHAR(255) | Bcrypt hashed |
| role | VARCHAR(50) | Default 'admin' |
| timestamps |  |  |

**paket** — Menu packages (20+ items)

| Column | Type | Notes |
| --- | --- | --- |
| id | INT PK AI |  |
| nama_paket | VARCHAR(255) | Package name |
| kategori_paket | VARCHAR(100) | Nasi Box, Prasmanan, Snack, Tumpeng |
| kategori_acara | VARCHAR(100) | Pernikahan, Kantor, Ulang Tahun, etc |
| menu_utama | JSON | Array of menu items |
| menu_tambahan | JSON | Optional add-ons |
| fasilitas_termasuk | JSON | Included services |
| catatan_alergen | TEXT | Allergen info |
| jenis_kemasan | VARCHAR(100) | Box, Piring, Tumpeng |
| min_order | INT | Default 1 |
| harga_per_porsi | DECIMAL(12,2) | Price per portion (NOT per package!) |
| kapasitas_produksi | INT | Max daily capacity |
| deskripsi | TEXT |  |
| gambar | VARCHAR(255) | Image path |
| is_best_seller | BOOLEAN | For homepage feature |
| timestamps |  |  |

> **⚠️ Tumpeng Mini Rule:** Priced at Rp250,000/package (10 portions). Store Rp25,000 as `harga_per_porsi`. `min_order=10` carries "per package" semantics. Never store Rp250,000 raw.
> 

**galeri** — Event photo gallery

| Column | Type | Notes |
| --- | --- | --- |
| id | INT PK AI |  |
| nama_acara | VARCHAR(255) | Event name |
| deskripsi_acara | TEXT |  |
| gambar_acara | VARCHAR(255) | Photo path |
| tanggal_acara | DATE |  |
| timestamps |  |  |

**pesanan** — Orders / Invoices

| Column | Type | Notes |
| --- | --- | --- |
| id | INT PK AI |  |
| nomor_struk | VARCHAR(50) UNIQUE | STR-YYYYMMDD-XXXX |
| nama_pemesan | VARCHAR(255) | Customer name |
| no_telepon | VARCHAR(20) |  |
| paket_id | INT FK | References [paket.id](http://paket.id) |
| jumlah_paket | INT |  |
| harga_paket_satuan | DECIMAL(12,2) | Snapshot at order creation |
| detail_tambahan | JSON | Extra items |
| biaya_tambahan | DECIMAL(12,2) | Default 0 |
| catatan | TEXT |  |
| total_harga | DECIMAL(12,2) | Server-calculated |
| status_pesanan | VARCHAR(50) | pending/confirmed/completed/cancelled |
| timestamps |  |  |

## Critical Business Rules

1. **Total Harga:** MUST be calculated server-side. Formula: `(jumlah_paket × harga_paket_satuan) + biaya_tambahan`. NEVER accept from client.
2. **Price Snapshot:** `harga_paket_satuan` is copied FROM `paket.harga_per_porsi` at order creation. Price changes don't retroactively affect existing orders.
3. **Nomor Struk:** Auto-generated `STR-YYYYMMDD-XXXX` (daily sequential counter). Server-only.
4. **JSON Validation:** All JSON fields MUST use Laravel Form Requests with type/shape validation.

## Monorepo Directory Structure

```
catering-nusantara/
├── Back-End/
│   ├── app/Http/Controllers/Api/V1/  # PaketController, GaleriController, PesananController, DashboardController
│   ├── app/Http/Controllers/Auth/     # Breeze auth
│   ├── app/Http/Requests/             # Form Request validation
│   ├── app/Models/                    # User, Paket, Galeri, Pesanan
│   ├── app/Services/                  # HargaService, StrukService
│   ├── database/migrations/
│   ├── database/seeders/
│   ├── routes/api.php                 # Main API routes
│   └── routes/auth.php                # Auth routes
├── Front-End/
│   ├── src/api/                       # Ky HTTP client
│   ├── src/components/ui/             # shadcn/ui primitives
│   ├── src/components/features/       # Domain components
│   ├── src/hooks/                     # Custom hooks
│   ├── src/pages/public/              # Home, Catalog, About, Contact, FAQ
│   ├── src/pages/admin/               # Dashboard, Kelola Produk, Pesanan
│   ├── src/router/
│   ├── src/store/                     # Zustand (UI only)
│   └── src/types/                     # TypeScript types
├── ARCHITECTURE.md
├── DESIGN.md
├── AGENTS.md
├── README.md
└── GIT-WORKFLOW.md
```

## Security Architecture

| Concern | Implementation |
| --- | --- |
| Authentication | Laravel Sanctum token-based SPA auth |
| Token Storage | Zustand in-memory (NOT localStorage for production) |
| Rate Limiting | `throttle:api` on public endpoints |
| Input Validation | Laravel Form Requests with JSON shape validation |
| CORS | Whitelist frontend origin only |
| SQL Injection | Prevented by Eloquent ORM |
| File Uploads | Validate type (jpg/png/webp) + max 2MB. Store in storage/app/public |
| Password | Bcrypt hashing (Laravel default) |

## Testing Strategy

| Layer | Tool | Scope |
| --- | --- | --- |
| Unit Tests | Pest | Services (HargaService, StrukService) |
| Feature Tests | Pest | API endpoints, auth, validation |
| Component Tests | Vitest + Testing Library | React components, hooks |
| E2E (future) | Playwright | Critical user flows |

## Deployment Considerations

- **Dev setup:** Laravel Artisan serve + Vite dev server. Frontend proxies API requests.
- **Production:** Laravel served via PHP-FPM + Nginx. Frontend built as static files served via Nginx or CDN.
- **Environment variables needed:** `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `APP_KEY`, `WHATSAPP_NUMBER`, `VITE_API_BASE_URL`