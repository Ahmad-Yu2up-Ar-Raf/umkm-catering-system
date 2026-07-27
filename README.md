# Catering Nusantara — Web Platform

**Client:** Dapur Bunda Catering (Bogor, est. 2019) · **Repo Owner:** Team Nusantara (Ahmad Yusuf Ar-Rafi, Denniz Rizki Attila, Thoriq Azhar Raditya)

> A hybrid F&B platform: a conversion-optimized public catalog on the front end, and a secure CMS + Mini POS on the back end — unified by a single, JSON-augmented relational schema.

---

## 1. Project Overview & Tech Stack Hypothesis

This is not a static brochure site. The ERD (V3) and dual-role user flow both point to a system that has to do two structurally different jobs from one data model: **sell** to anonymous public visitors, and **operate** a real order/invoice pipeline for an internal admin. That duality is the core architectural driver of every decision below.

**Stack hypothesis** (based on schema complexity and team allocation):

| Layer | Choice | Why it fits this ERD |
|---|---|---|
| Back-End | **Laravel (PHP)** | Native Eloquent JSON casting maps cleanly onto `menu_utama`, `menu_tambahan`, `fasilitas_termasuk`, `detail_tambahan` without extra ORM tooling. Built-in auth middleware matches the `Sistem Validasi Middleware` node in the admin flow. |
| Front-End | **React + Vite + Tailwind CSS** | Component-driven catalog (filterable package grid, portion calculator, WA checkout) benefits from React's state management; Tailwind matches the wireframe's warm, non-corporate visual language. |
| Database | **MySQL/MariaDB** (per ERD) | Relational core for integrity-critical entities (`users`, `pesanan` → `paket` FK), JSON columns for variable-shape catalog attributes. |
| Auth | Laravel session/middleware, single `role` field on `users` (default `admin`) | Matches "Role 2: Alur Admin" — this is an internal-staff system, not a multi-tenant marketplace. |

Team allocation from the brainstorming doc: **Back-End** — Deniz, Yusuf · **Front-End** — Thoriq, Yusuf.

---

## 2. Core Architecture Analysis

### 2.1 `pesanan` (Orders) — Secure Total Calculation

The order table is deliberately **not** a thin pointer to `paket`. It denormalizes the pricing inputs at time of order:

```
total_harga = (jumlah_paket × harga_paket_satuan) + biaya_tambahan
```

- `harga_paket_satuan` is **copied** from `paket.harga_per_porsi` into `pesanan` at creation time, not looked up live on every read.
- `biaya_tambahan` and `detail_tambahan` (JSON array of custom add-on objects) capture ad hoc extras — e.g., "20 Nasi Box + Ekstra Telur Balado" — without needing a new table per possible add-on type.

**Why this matters architecturally:** if the admin later changes `harga_per_porsi` on `paket` (prices adjust seasonally), every historical `pesanan` row remains mathematically correct and auditable, because it never re-derives its total from current catalog state. This is the single most important integrity guarantee in the schema — it prevents retroactive corruption of past invoices, which is a common failure mode in naive "join and multiply at read time" designs.

The calculation itself should be enforced **server-side** (a model observer or service class on `pesanan` creation/update), never trusted from client input — the front-end "Sistem Hitung Otomatis" is a UX convenience, not the source of truth.

### 2.2 JSON Arrays vs. Junction Tables — Justification

Classic relational design would normalize `menu_utama`, `menu_tambahan`, `fasilitas_termasuk`, and `detail_tambahan` into junction tables (`paket_menu_item`, `pesanan_tambahan`, etc.). This schema deliberately does not do that. Trade-off analysis:

| Criteria | Junction Tables | JSON Columns (chosen) |
|---|---|---|
| Query complexity for catalog display | Requires N joins per package card | Single row read, zero joins |
| Write complexity for admin CRUD | Multi-table transaction per edit | Single-row `UPDATE` |
| Schema flexibility (new attribute types) | Migration required | No migration — just a new key |
| Referential integrity on sub-items | Enforced by FK | Enforced at application layer |
| Fit for this domain | Over-engineered | **Menu contents change per package, not shared across packages — there's no real relational reuse to normalize for.** |

The deciding factor: `menu_utama`/`menu_tambahan` are **package-specific descriptive text**, not shared entities referenced by multiple packages with their own attributes (like a real "Ingredient" master table would be). There is no cross-package query requirement in the user flow ("show me all packages containing Rendang") that would justify the join cost. JSON is the correct normalization level here, not a shortcut.

### 2.3 Data Constraints Worth Enforcing at the Application Layer

Since JSON columns bypass FK/CHECK enforcement, the following should be validated in Laravel Form Requests, not assumed from the DB:

- `menu_utama`, `menu_tambahan`, `fasilitas_termasuk` → arrays of non-empty strings.
- `detail_tambahan` → array of objects with a consistent shape (e.g., `{nama, qty, harga_satuan}`) — recommend a small PHP DTO/cast class rather than raw array access.
- `nomor_struk` → format `STR-YYYYMMDD-XXXX`, generated server-side, never client-supplied, to guarantee uniqueness under concurrent order entry.

---

## 3. System Workflows

Two independent flows share one platform (see `Nusantara-Userflow.pdf`):

### Role 1 — Public Customer Flow (conversion path)
```
Beranda → Katalog Paket Katering → Filter & Pilih Paket → Detail Paket
       → Gunakan Kalkulator Porsi → Selesai: Pesan via WhatsApp
```
No authentication, no write access to `pesanan` — this flow is read-only against `paket` and `galeri`. The portion calculator is a pure front-end computation against `harga_per_porsi` and `min_order`; it never touches the order table. The WhatsApp handoff is the actual conversion event — the system's job here is to **make the WA message as pre-qualified and specific as possible** (package, quantity, estimated total).

### Role 2 — Admin/Internal Flow (operational path)
```
Akses URL Admin → Halaman Login → [Sistem Validasi Middleware]
   ├─ Gagal → back to Login
   └─ Sukses → Dashboard Utama
        ├─ Aktivitas A: Menu Kelola Produk → Tambah/Edit Menu & Rating → Simpan ke Database
        └─ Aktivitas B: Menu Pencatatan Pesanan
             ← Terima Chat WA dari Pelanggan
             → Input Menu & Lauk Tambahan
             → Sistem Hitung Otomatis Total Harga
             → Sistem Simpan Riwayat
             → Selesai: Buat Struk / Invoice Digital
```

**Critical transition:** the public flow's output (a WhatsApp message with package + quantity) becomes the **manual input** to Activity B on the admin side. This is intentional — the client's actual sales channel is WhatsApp, not an online checkout — so the system's role is to eliminate the manual arithmetic and record-keeping around that channel, not to replace it. The admin flow is where `pesanan` rows are actually created; the public flow never writes to that table.

---

## 4. Database Schema (DBML)

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
  kategori_paket varchar [not null]        // Nasi Box, Prasmanan, Snack, Tumpeng
  kategori_acara varchar                    // Wedding, Corporate, Gathering, Birthday
  menu_utama json                           // main dishes, array of strings
  menu_tambahan json                        // snacks/desserts, array of strings
  fasilitas_termasuk json                   // inclusions, array of strings
  catatan_alergen text
  jenis_kemasan varchar
  min_order int [default: 1]
  harga_per_porsi decimal(12,2) [not null]
  kapasitas_produksi int
  deskripsi text
  gambar varchar
  is_best_seller boolean [default: false]
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
  nomor_struk varchar [unique, not null]    // STR-YYYYMMDD-XXXX
  nama_pemesan varchar [not null]
  no_telepon varchar [not null]
  paket_id int [ref: > paket.id, not null]
  jumlah_paket int [not null]
  harga_paket_satuan decimal(12,2) [not null]  // snapshot at order time
  detail_tambahan json                          // custom add-ons, array of objects
  biaya_tambahan decimal(12,2) [default: 0]
  catatan text
  total_harga decimal(12,2) [not null]          // (jumlah_paket * harga_paket_satuan) + biaya_tambahan
  status_pesanan varchar [default: 'pending']   // pending, processing, completed
  created_at timestamp
  updated_at timestamp
}
```

Full interactive ERD: [dbdiagram.io link](https://dbdiagram.io/d/6a6709b3067336e1defd6250)

---

## 5. Setup & Installation

### Prerequisites
- PHP ≥ 8.2, Composer
- Node.js ≥ 18, npm/yarn
- MySQL/MariaDB ≥ 8.0

### Back-End (Laravel)
```bash
git clone <repo-url> catering-nusantara
cd catering-nusantara/backend
composer install
cp .env.example .env
php artisan key:generate
# configure DB_* variables in .env
php artisan migrate --seed
php artisan serve
```

### Front-End (React + Vite)
```bash
cd catering-nusantara/frontend
npm install
cp .env.example .env
# set VITE_API_BASE_URL to the Laravel back-end URL
npm run dev
```

### Brand Tokens (Tailwind config)
```js
// tailwind.config.js
colors: {
  'brand-green': '#2d5a27',
  'brand-cream': '#f5f5dc',
}
```

### Environment Variables (minimum)
| Variable | Purpose |
|---|---|
| `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | MySQL connection |
| `APP_KEY` | Laravel encryption key |
| `WHATSAPP_NUMBER` | Target number for public checkout deep-links |
| `VITE_API_BASE_URL` | Front-end → API base URL |

### Reference Links
- Sitemap: [Relume project](https://www.relume.ai/app/project/P3496312_NPf8rfzVlwseLRNnLnOpo4Z32_-BkP4-kQ4NIDoJ_uU#mode=sitemap)
- ERD: [dbdiagram.io](https://dbdiagram.io/d/6a6709b3067336e1defd6250)
- User Flow: [Mermaid](https://mermaid.ai/d/4951d72c-6112-4428-ba6f-690fe664705b)
- Wireframe: [Figma Make](https://www.figma.com/make/ysaD60e2reJhGDHVtIKL8K/Website-Sitemap-and-Wireframe)

---

## Contributors

| Name | Role |
|---|---|
| Ahmad Yusuf Ar-Rafi | Back-End, Front-End |
| Denniz Rizki Attila | Back-End |
| Thoriq Azhar Raditya | Front-End |