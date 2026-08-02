# Database Seeders — Initial Data (Dapur Bunda Catering)

> Source of truth for the 5 initial product packages seeded into the `paket` table.
> Data verified from the client sheet — [Analisa Kebutuhan User](https://docs.google.com/spreadsheets/d/1UYbfbsZ_asf-wG8vFCRsTVzjUWqlxUxA5CXYM7_JsKM/edit?gid=716699607#gid=716699607).
> Schema reference: `DATABASE.md`. Pipeline reference: `WORKFLOW.md`.

---

## 1. Overview & Scope

- **Tables seeded:** `paket` (5 packages). `users` (admin test user) via `DatabaseSeeder`.
- **Image strategy:** Direct CDN URLs harvested via the global `image-explorer` CLI (Unsplash / Pexels / Pixabay) — **no local downloads**. The `gambar` column stores a clean, stable HD URL.
- **Idempotency:** `PaketSeeder` uses `updateOrCreate(nama_paket)` — re-running is safe.
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
| `gambar` | string (URL) | `image-explorer` harvest |
| `is_best_seller` | boolean | Sheet "Best Seller" |

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

## 5. Image URL Reference

Harvested via `image-explorer --query="<q>" --count=1 --orientation=landscape`. URLs are **clean** (session tracking params removed) and **HD**:

| # | Query | Source | `gambar` URL | License / Attribution |
|---|-------|--------|--------------|----------------------|
| 1 | `indonesian nasi box ayam goreng` | Unsplash | `https://images.unsplash.com/photo-1666239308347-4292ea2ff777?w=1920&q=80&fm=jpg&fit=crop` | Unsplash License · [@mufidpwt](https://unsplash.com/@mufidpwt) |
| 2 | `indonesian wedding buffet rendang` | Unsplash | `https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80&fm=jpg&fit=crop` | Unsplash License · [@saile_ilyas](https://unsplash.com/@saile_ilyas) |
| 3 | `kue basah tradisional Indonesia snack box` | Unsplash | `https://images.unsplash.com/photo-1738225734433-9fb17ed770a4?w=1920&q=80&fm=jpg&fit=crop` | Unsplash License · [@fabiobiirahmananta](https://unsplash.com/@fabiobiirahmananta) |
| 4 | `nasi tumpeng kuning mini` | Pexels | `https://images.pexels.com/photos/36956925/pexels-photo-36956925.jpeg?auto=compress&cs=tinysrgb&w=1600` | Pexels License · [Firman Marek_Brew](https://www.pexels.com/photo/traditional-indonesian-tumpeng-rice-dish-presentation-36956925/) |
| 5 | `western fusion corporate buffet catering` | Pexels | `https://images.pexels.com/photos/34321370/pexels-photo-34321370.jpeg?auto=compress&cs=tinysrgb&w=1600` | Pexels License · [photo 34321370](https://www.pexels.com/photo/elegant-appetizer-presentation-at-outdoor-event-34321370/) |

**URL cleaning rules:**
- Unsplash: strip session params (`ixid`, `ixlib`), normalize to `?w=1920&q=80&fm=jpg&fit=crop`
- Pexels: strip size-clamping params (`h=650&w=940`), use original CDN file + `?auto=compress&cs=tinysrgb&w=1600`

## 6. PaketSeeder Code Blueprint

**File:** `database/seeders/PaketSeeder.php` (created)

```php
<?php

namespace Database\Seeders;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use App\Models\Paket;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PaketSeeder extends Seeder
{
    use WithoutModelEvents;

    private function paket(): array
    {
        return [
            [
                'nama_paket' => 'Paket Nasi Box Hemat',
                'kategori_paket' => PaketKategoriEnum::NasiBox,
                'kategori_acara' => KategoriAcaraEnum::Kantor,
                'menu_utama' => ['Ayam Goreng', 'Tempe Orek', 'Sayur Sop'],
                'menu_tambahan' => ['Kerupuk'],
                'fasilitas_termasuk' => ['Nasi putih', 'Air mineral gelas'],
                'catatan_alergen' => 'Ayam segar harian, tanpa MSG tambahan',
                'jenis_kemasan' => 'Box kertas food grade',
                'min_order' => 20,
                'harga_per_porsi' => 22000,
                'kapasitas_produksi' => 300,
                'deskripsi' => 'Menu harian ekonomis untuk kebutuhan kantor/rapat, praktis dan mengenyangkan',
                'gambar' => 'https://images.unsplash.com/photo-1666239308347-4292ea2ff777?w=1920&q=80&fm=jpg&fit=crop',
                'is_best_seller' => true,
                'created_at' => Carbon::create(2019, 1, 1),
            ],
            // ... 4 more packages (see file)
        ];
    }

    public function run(): void
    {
        foreach ($this->paket() as $data) {
            // Enums must be persisted as their backing string value.
            $data['kategori_paket'] = $data['kategori_paket']->value;
            $data['kategori_acara'] = $data['kategori_acara']->value;

            Paket::updateOrCreate(
                ['nama_paket' => $data['nama_paket']],
                $data,
            );
        }
    }
}
```

**Key decisions:**
- `updateOrCreate(nama_paket)` → idempotent re-seeding
- Enum objects in the definition, converted via `->value` in `run()` (never persist raw enum objects)
- Native PHP arrays for JSON columns → model `casts()` encodes
- Explicit `created_at` = "Active Since" month

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

```bash
# Seed everything (user + 5 paket)
php artisan db:seed

# Seed just packages
php artisan db:seed --class=PaketSeeder

# Fresh migrate + seed (CI / local reset)
php artisan migrate:fresh --seed

# Verify row count
php artisan tinker --execute 'echo \App\Models\Paket::count();'

# Verify JSON columns decode as arrays
php artisan tinker --execute 'dump(\App\Models\Paket::first()->menu_utama);'
```

**Expected:** `Paket::count()` → `5`. Re-running `db:seed` twice does NOT create duplicates.

## 10. Business-Rule Checklist (enforced)

- ✅ `total_harga` / `nomor_struk` → server-computed in Services, never in seeder or client
- ✅ **Tumpeng Mini:** `harga_per_porsi = 25000`, `min_order = 10` — per-package price (Rp250.000/10 porsi) documented in `deskripsi`, never stored raw
- ✅ JSON arrays validated & cast (no junction tables)
- ✅ `kategori_paket` / `kategori_acara` backed by enums + `Rule::enum()`
- ✅ No tables added beyond the 4 core
- ✅ `gambar` = stable HD CDN URLs (no session params, no local files)
