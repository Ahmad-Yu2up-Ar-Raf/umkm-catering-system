<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Backend Database Spec · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [API Specs](./api-collection.md) · [Database Seeders](./database-seeders.md) · [Frontend Consumer](../../frontend/README.md)

# Database — Catering Nusantara Back-End

> Authoritative schema (from `../docs/architecture.md` §4, monorepo root) + JSON array rules + critical business rules.

## Database Provider: Neon Database

- **Provider:** [Neon Database](https://neon.tech) — Serverless PostgreSQL.
- **Purpose:** Primary backend database for the project (catering API: `users`, `paket`, `galeri`, `pesanan`).
- **Connection:** `.env.example` ships with `DB_CONNECTION=pgsql` and a Neon host; fill `DB_*` vars from your Neon connection string (`DB_SSLMODE=require`).
- **Agent Context:** The OpenCode agent is globally equipped with the **Neon MCP** to manage this database, run SQL queries, and inspect schemas when needed.

## Core Tables (5 — the original 4 + `paket_images`, approved with the Cloudinary gallery upgrade)

`testimoni` and `faq` remain future candidates — **NOT approved**. Do not create migrations for them.

```dbml
Table users {
  id int [pk, increment]
  nama varchar [not null]
  email varchar [unique, not null]
  password varchar [not null]
  role varchar [default: 'admin']
  created_at timestamp
  updated_at timestamp
}

Table paket {
  id int [pk, increment]
  nama_paket varchar [not null]
  kategori_paket varchar [not null]       // Nasi Box, Prasmanan, Snack, Tumpeng
  kategori_acara varchar                   // Pernikahan, Kantor, Ulang Tahun, Arisan, Umum
  menu_utama json                          // ARRAY of menu items
  menu_tambahan json                       // ARRAY of optional add-ons
  fasilitas_termasuk json                  // ARRAY of included facilities
  catatan_alergen text
  jenis_kemasan varchar
  min_order int [default: 1]
  harga_per_porsi decimal(12,2) [not null]
  kapasitas_produksi int
  deskripsi text
  thumbnail varchar                        // Cloudinary secure_url (1st gallery image)
  is_best_seller boolean [default: false]
  created_at timestamp
  updated_at timestamp
}

Table paket_images {
  id int [pk, increment]
  paket_id int [ref: > paket.id, not null] // cascade delete
  image_url varchar [not null]             // Cloudinary secure_url
  created_at timestamp
  updated_at timestamp
}

Table galeri {
  id int [pk, increment]
  nama_acara varchar [not null]
  deskripsi_acara text
  gambar_acara varchar [not null]
  tanggal_acara date
  created_at timestamp
  updated_at timestamp
}

Table pesanan {
  id int [pk, increment]
  nomor_struk varchar [unique, not null]   // STR-YYYYMMDD-XXXX
  nama_pemesan varchar [not null]
  no_telepon varchar [not null]
  paket_id int [ref: > paket.id, not null]
  jumlah_paket int [not null]
  harga_paket_satuan decimal(12,2) [not null]  // SNAPSHOT copied at order creation
  detail_tambahan json
  biaya_tambahan decimal(12,2) [default: 0]
  catatan text
  total_harga decimal(12,2) [not null]          // SERVER-ONLY, never from client
  status_pesanan varchar [default: 'pending']   // pending|confirmed|completed|cancelled
  created_at timestamp
  updated_at timestamp
}
```

## JSON Array Column Rules (CRITICAL)

Four columns are **JSON arrays**: `paket.menu_utama`, `paket.menu_tambahan`, `paket.fasilitas_termasuk`, `pesanan.detail_tambahan`.

1. **Model casts (mandatory):** every JSON column cast to `array` on its model:
   ```php
   protected function casts(): array
   {
       return [
           'menu_utama'     => 'array',
           'menu_tambahan'  => 'array',
           'fasilitas_termasuk' => 'array',
       ];
   }
   ```
2. **FormRequest validation (mandatory):** never accept a raw array without shape validation.
   ```php
   'menu_utama'    => ['required', 'array', 'min:1'],
   'menu_utama.*'  => ['string', 'max:255'],
   'menu_tambahan' => ['nullable', 'array'],
   'menu_tambahan.*' => ['string', 'max:255'],
   'fasilitas_termasuk' => ['nullable', 'array'],
   'detail_tambahan'    => ['nullable', 'array'],
   ```
3. **No junction tables.** Deliberate UMKM-scale decision (root `ARCHITECTURE.md` §4.2). JSON keeps catalog reads/writes single-row. There is NO cross-package querying need — do NOT normalize.
4. **Never trust `$request->input('menu_utama')` blindly** — must pass the FormRequest first.

## Critical Business Rules (Server-Side Only)

1. **`total_harga` MUST be computed server-side** in a Service (e.g. `PesananService`/`HargaService`), NEVER accepted from the request body.
   - Formula: `total_harga = (jumlah_paket * harga_paket_satuan) + biaya_tambahan`
2. **Price snapshot:** `harga_paket_satuan` is COPIED from `paket.harga_per_porsi` at order creation. Never re-query the package price on read. Price changes do NOT retroactively alter existing orders.
3. **`nomor_struk`:** server-generated only, format `STR-YYYYMMDD-XXXX` (sequential 4-digit counter per day, resets daily). Never accept from client. Implement in `StrukService`.
4. **Tumpeng Mini special case:** priced **per package** (Rp250.000 / 10 porsi). Store `harga_per_porsi = 25000` and let `min_order = 10` carry the "per paket" semantics. **NEVER store Rp250.000 raw in `harga_per_porsi`** — it would corrupt `total_harga`.
5. **`kapasitas_produksi`:** validate against capacity when accepting large orders (real client range: 20–1000 porsi).

## DB-Specific Forbidden Actions

- ❌ Never accept `total_harga` or `nomor_struk` from the client.
- ❌ Never write JSON array columns without FormRequest validation first.
- ❌ Never add tables/migrations beyond the 4 core without explicit approval.
- ❌ Never store raw per-package price (Rp250.000) in `harga_per_porsi`.
- ❌ Never re-query `paket.harga_per_porsi` when reading an existing order (snapshot rule).
