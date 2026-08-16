<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Backend Seeders Spec · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [API Specs](./api-collection.md) · [Database Spec](./database.md) · [Frontend Consumer](../../frontend/README.md)

# Database Seeders — Initial Data (Catering Nusantara)

> Source of truth for the product packages seeded into `paket` + `paket_images`.
> The 5 original packages come from the client sheet — [Analisa Kebutuhan User](https://docs.google.com/spreadsheets/d/1UYbfbsZ_asf-wG8vFCRsTVzjUWqlxUxA5CXYM7_JsKM/edit?gid=716699607#gid=716699607). New product folders are Faker-generated.
> Schema reference: `DATABASE.md`. Pipeline reference: `WORKFLOW.md`.

---

## 1. Overview & Scope

- **Tables seeded:** `paket` + `paket_images`. One folder under `frontend/public/assets/images/products` = one package (exactly 15 folders on disk). `users` (admin test user) via `DatabaseSeeder`.
- **Image strategy:** Local product photography is uploaded to **Cloudinary** during seeding via Laravel's native `Http` client (`POST /v1_1/{cloud}/image/upload`, HTTP **Basic Auth** with `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`) — **zero SDK dependencies**. **2–3 images per folder** (min 2, max 3; a folder with exactly 2 uses both). The 1st upload's **canonical original URL** → `paket.thumbnail`; **all** uploaded canonical URLs → `paket_images.image_url`.
- **Canonical storage (no baked transformations):** the seeder stores the ORIGINAL Cloudinary asset reference — rebuilt from the upload response's `public_id` + `version` + `format` (`https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>.<format>`). Delivery transformations (responsive width, `f_auto`, aspect-fit) happen at **render time in the frontend** (@unpic), never in the stored URL. A value like `w_640,h_480,f_auto,c_lfill` is a *delivery* URL and must never appear in the DB.
- **Clean slate:** the seeder first **purges** every asset under `catering-nusantara/products/` (Admin API delete-by-prefix, paginated via `next_cursor`) so re-seeding never duplicates or accumulates stale assets.
- **Data source:** no Faker. The 5 documented packages below keep their exact client data; the other 10 folders use hand-curated inference (names/descriptions/prices derived from each folder's name and photography).
- **Cloudinary layout:** images upload to folder `catering-nusantara/products/{folder-slug}` — never the Cloudinary root.
- **Idempotency:** `PaketSeeder` uses `updateOrCreate(nama_paket)` and wipes each paket's `paket_images` before re-inserting — re-running is safe.
- **Enums used:** `PaketKategoriEnum` (Nasi Box / Prasmanan / Snack / Tumpeng), `KategoriAcaraEnum` (Pernikahan / Kantor / Ulang Tahun / Arisan / Umum).

## 2. Schema Alignment

Seeder writes the exact columns of `database/migrations/2026_08_01_040803_create_pakets_table.php`:

| Column | Type | Source |
|--------|------|--------|
| `nama_paket` | string | Sheet "Nama Paket" |
| `kategori_paket` | string (enum) | Sheet "Kategori" |
| `kategori_acara` | string (enum) | Sheet "Tipe Acara" (primary event) |
| `menu_utama` | json | Sheet "Menu Utama" |
| `menu_tambahan` | json | Sheet "Lauk/Side" |
| `fasilitas_termasuk` | json | Sheet "Termasuk" |
| `catatan_alergen` | text | Sheet "Bahan/Keterangan" |
| `jenis_kemasan` | string | Sheet "Kemasan" |
| `min_order` | int | Sheet "Min. Order" |
| `harga_per_porsi` | decimal(12,2) | Sheet "Harga/Porsi" |
| `kapasitas_produksi` | int | Sheet "Kapasitas Produksi" |
| `deskripsi` | text | Sheet "Deskripsi" |
| `thumbnail` | string (Cloudinary canonical original URL) | 1st uploaded image |
| `is_best_seller` | boolean | Sheet "Best Seller" |

`paket_images`: `paket_id` (FK → `paket.id`, cascade on delete), `image_url` (Cloudinary canonical original URL — never a transformed/delivery URL).

## 3. Full Package Data Table

| # | Nama Paket | Kategori | Acara | Harga/Porsi | Min Order | Kapasitas | Best Seller | Active Since |
|---|-----------|----------|-------|-------------|-----------|-----------|-------------|--------------|
| 1 | Paket Nasi Box Hemat | Nasi Box | Kantor | Rp22.000 | 20 | 300 | ✅ | Jan 2019 |
| 2 | Paket Prasmanan Pernikahan | Prasmanan | Pernikahan | Rp45.000 | 100 | 1000 | ✅ | Mar 2019 |
| 3 | Paket Snack Box Arisan | Snack | Arisan | Rp18.000 | 15 | 200 | ❌ | Jun 2020 |
| 4 | Paket Tumpeng Mini | Tumpeng | Ulang Tahun | Rp25.000 | 10 | 20 pkt | ✅ | Feb 2021 |
| 5 | Paket Prasmanan Korporat | Prasmanan | Kantor | Rp55.000 | 50 | 500 | ❌ | Sep 2022 |

### #1 Paket Nasi Box Hemat
- **Menu Utama:** Ayam Goreng, Tempe Orek, Sayur Sop
- **Lauk/Side:** Kerupuk
- **Termasuk:** Nasi putih, air mineral gelas
- **Bahan/Keterangan:** Ayam segar harian, tanpa MSG tambahan
- **Kemasan:** Box kertas food grade
- **Deskripsi:** Menu harian ekonomis untuk kebutuhan kantor/rapat, praktis dan mengenyangkan

### #2 Paket Prasmanan Pernikahan
- **Menu Utama:** Rendang, Ayam Bakar, Ikan Asam Manis, Sayur Lodeh
- **Lauk/Side:** Puding, Es Buah
- **Termasuk:** Nasi putih, kerupuk, sambal, buah potong
- **Bahan/Keterangan:** Daging sapi & ayam pilihan, disesuaikan permintaan halal/alergen
- **Kemasan:** Chafing dish + alat saji lengkap
- **Deskripsi:** Paket lengkap untuk resepsi pernikahan, termasuk penataan meja prasmanan

### #3 Paket Snack Box Arisan
- **Menu Utama:** Kue Basah
- **Lauk/Side:** Risoles, Lumpia, Kue Lapis, Pastel
- **Termasuk:** Air mineral botol kecil
- **Bahan/Keterangan:** Bahan segar, digoreng mendadak (bukan stok beku)
- **Kemasan:** Box mika/kardus kecil
- **Deskripsi:** Cocok untuk acara santai seperti arisan atau pengajian, isi 4 jenis kue basah

### #4 Paket Tumpeng Mini
- **Menu Utama:** Ayam Suwir, Telur Balado, Tempe Kering
- **Lauk/Side:** Kerupuk, Acar
- **Termasuk:** Nasi kuning, sambal goreng ati
- **Bahan/Keterangan:** Tanpa pengawet, dimasak hari yang sama
- **Kemasan:** Tampah + daun pisang
- **Deskripsi:** Tumpeng ukuran mini untuk perayaan kecil di rumah/kantor, tampilan tetap menarik. **Harga Rp250.000 per paket (10 porsi).**

### #5 Paket Prasmanan Korporat
- **Menu Utama:** Chicken Cordon Bleu, Beef Teriyaki, Capcay
- **Lauk/Side:** Puding Coklat
- **Termasuk:** Nasi putih/goreng, air mineral gelas
- **Bahan/Keterangan:** Menu fusion, bisa request vegetarian
- **Kemasan:** Chafing dish + alat saji lengkap
- **Deskripsi:** Menu lebih modern untuk gathering/seminar perusahaan, tampilan lebih formal

## 4. JSON Array Column Structures

| Paket | menu_utama | menu_tambahan | fasilitas_termasuk |
|-------|-----------|---------------|-------------------|
| Nasi Box Hemat | `["Ayam Goreng","Tempe Orek","Sayur Sop"]` | `["Kerupuk"]` | `["Nasi putih","Air mineral gelas"]` |
| Prasmanan Pernikahan | `["Rendang","Ayam Bakar","Ikan Asam Manis","Sayur Lodeh"]` | `["Puding","Es Buah"]` | `["Nasi putih","Kerupuk","Sambal","Buah potong"]` |
| Snack Box Arisan | `["Kue Basah"]` | `["Risoles","Lumpia","Kue Lapis","Pastel"]` | `["Air mineral botol kecil"]` |
| Tumpeng Mini | `["Ayam Suwir","Telur Balado","Tempe Kering"]` | `["Kerupuk","Acar"]` | `["Nasi kuning","Sambal goreng ati"]` |
| Prasmanan Korporat | `["Chicken Cordon Bleu","Beef Teriyaki","Capcay"]` | `["Puding Coklat"]` | `["Nasi putih/goreng","Air mineral gelas"]` |

**Rules applied:** stored as native PHP arrays in the seeder → model `casts()` handles JSON encoding. All validated per `DATABASE.md` §4 (required array, string items).

## 5. Cloudinary Image Strategy

Every product folder under `frontend/public/assets/images/products` is uploaded to Cloudinary during seeding:

- **Endpoint:** `POST https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload`
- **Auth:** HTTP Basic Auth — `api_key` as username, `api_secret` as password (no signature needed).
- **Transport:** Laravel `Http::attach('file', fopen($path, 'r'), basename($path))` (multipart).
- **Organized in:** `folder => 'catering-nusantara/products/{folder-slug}'`.
- **Limit:** **2–3** image files (`.jpg`/`.jpeg`/`.png`/`.webp`) per folder, sorted by name — min 2 (skip the folder otherwise), max 3.
- **Persisted:** 1st upload **canonical original URL** → `paket.thumbnail`; **all** uploads → `paket_images.image_url`. The seeder rebuilds the canonical URL from the upload response metadata (`public_id` + `version` + `format`) so no delivery transformation can leak into the database.
- **Cleanup:** before uploading, the seeder purges the whole `catering-nusantara/products/` prefix via `DELETE /v1_1/{cloud}/resources/image/upload?prefix=...` (Admin API, paginated with `next_cursor`) — a clean slate on every run.

Example of a stored `thumbnail` / `image_url`:

```
https://res.cloudinary.com/df94cviif/image/upload/v1786345393/catering-nusantara/products/paket-tumpeng-mini/kttthrx6iwbf9igqrprm.png
```

> **Note:** the previous Unsplash/Pexels harvest strategy was replaced by this local-asset → Cloudinary pipeline (client photography is the brand standard — no generic stock photos).

## 6. PaketSeeder Logic (dynamic — folder-driven)

**File:** `database/seeders/PaketSeeder.php` (rewritten)

```php
$root = base_path('../frontend/public/assets/images/products'); // == C:\...\frontend\public\assets\images\products

purgeCloudinaryAssets();                              // clean slate: delete prefix before upload

foreach (productFolders($root) as $slug) {            // one folder = one package (15 total)
    $images = imagePaths($folder);                    // 2–3 .jpg/.jpeg/.png/.webp, sorted
    $urls   = $images->map(fn ($p) => uploadToCloudinary($p, $slug)); // Http + Basic Auth → secure_url

    $data = paketData($slug);                         // ORIGINALS | INFERRED (no Faker)
    $data['thumbnail'] = $urls->first();              // 1st upload → thumbnail

    $paket = Paket::updateOrCreate(['nama_paket' => $data['nama_paket']], $data);

    $paket->images()->delete();                       // idempotency
    $urls->each(fn ($url) => PaketImage::create(['paket_id' => $paket->id, 'image_url' => $url]));
}
```

**Key decisions:**
- `base_path('../frontend/...')` resolves the exact Windows directory from the monorepo layout (works under native Windows PHP and WSL).
- `purgeCloudinaryAssets()` deletes every asset under `catering-nusantara/products/` via the Admin API prefix delete (paginated with `next_cursor`) before any upload — re-seeding always starts clean.
- `ORIGINALS` (the 5 client packages, keyed by folder slug) are verbatim from this doc; `INFERRED` (the other 10) are hand-curated from folder name + photography — **no Faker**.
- Folder with <2 images → skipped with a warning; otherwise 2–3 images are used and all are stored in `paket_images`.
- `updateOrCreate(nama_paket)` + per-paket `images()->delete()` → idempotent re-seeding.

## 7. DatabaseSeeder Wiring

**File:** `database/seeders/DatabaseSeeder.php` (modified)

```php
public function run(): void
{
    User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);

    $this->call([
        PaketSeeder::class,
    ]);
}
```

## 8. Factory Reference (test data)

**File:** `database/factories/PaketFactory.php` (exists)

```php
public function definition(): array
{
    return [
        'nama_paket' => fake()->unique()->words(3, true),
        'kategori_paket' => fake()->randomElement(PaketKategoriEnum::class)->value,
        'kategori_acara' => fake()->randomElement(KategoriAcaraEnum::class)->value,
        'menu_utama' => fake()->unique()->words(3),
        // ...
    ];
}

public function tumpengMini(): static { /* harga_per_porsi=25000, min_order=10 */ }
public function bestSeller(): static { /* is_best_seller=true */ }
```

Factory = fake test data. Seeder = real client data. They never overlap.

## 9. Run & Verify

> **Ops runbook:** everyday commands (fresh start, re-seed, changing image limits) live in
> [`seeder-operations.md`](./seeder-operations.md).

```bash
# Seed everything (user + paket + gallery)
php artisan db:seed

# Seed just packages
php artisan db:seed --class=PaketSeeder

# Fresh migrate + seed (CI / local reset)
php artisan migrate:fresh --seed

# Verify row counts
php artisan tinker --execute 'echo \App\Models\Paket::count();'          # 15
php artisan tinker --execute 'echo \App\Models\PaketImage::count();'     # 39 (2–3 per paket)

# Verify JSON columns decode as arrays
php artisan tinker --execute 'dump(\App\Models\Paket::first()->menu_utama);'
```

**Expected:** `Paket::count()` → `15` (one per image folder), `PaketImage::count()` → `39` (2–3 per paket), every `thumbnail`/`image_url` is a **canonical** Cloudinary URL — i.e. starts `https://res.cloudinary.com/` and contains **NO transformation segment** (`w_*`, `h_*`, `c_fill`, `c_lfill`, `f_auto` BEFORE the `/v<version>/` part). The seeder purges the Cloudinary prefix first, so the asset count in Cloudinary equals the `paket_images` row count. Re-running `db:seed` twice does NOT duplicate `paket`, `paket_images`, or Cloudinary assets.

```bash
# Confirm NO delivery transformations are stored (expect 0 rows)
php artisan tinker --execute '
    echo \App\Models\Paket::where("thumbnail", "like", "%/upload/%w_%")->orWhere("thumbnail", "like", "%/upload/%h_%")->count();
'
```

## 10. Business-Rule Checklist (enforced)

- ✅ `total_harga` / `nomor_struk` → server-computed in Services, never in seeder or client
- ✅ **Tumpeng Mini:** `harga_per_porsi = 25000`, `min_order = 10` — per-package price (Rp250.000/10 porsi) documented in `deskripsi`, never stored raw
- ✅ JSON arrays validated & cast (no junction tables)
- ✅ `kategori_paket` / `kategori_acara` backed by enums + `Rule::enum()`
- ✅ Single approved gallery table added: `paket_images` (FK `paket_id` cascade delete) — `testimoni`/`faq` still rejected
- ✅ Seeder purges the Cloudinary `catering-nusantara/products/` prefix before upload — no stale assets or duplicates accumulate
- ✅ `thumbnail`/`image_url` = Cloudinary secure URLs (real client photography, no stock photos)
