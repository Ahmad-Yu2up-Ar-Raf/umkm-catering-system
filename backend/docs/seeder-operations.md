<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Backend Seeder & Cloudinary Operations · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [API Specs](./api-collection.md) · [Database Spec](./database.md) · [Seeder Data Spec](./database-seeders.md) · [Frontend Consumer](../../frontend/README.md)

# Seeder & Cloudinary Operations (Catering Nusantara)

Runbook for the **`PaketSeeder`** — the script that turns the local product photography in
`frontend/public/assets/images/products` into 15 `paket` records with Cloudinary-hosted
images (`paket.thumbnail` + `paket_images`).

**How it works in one paragraph:** the seeder (1) **purges** every asset already uploaded
under the Cloudinary `catering-nusantara/products/` namespace, (2) scans the 15 product
folders, (3) uploads 2–3 images per folder via Laravel's native `Http` client (HTTP Basic
Auth — no SDK), (4) writes `paket.thumbnail` = the 1st upload's **canonical original URL**
(rebuilt from the upload response's `public_id` + `version` + `format`) and stores that
same URL **first** in `paket_images`, and (5) uses `updateOrCreate(nama_paket)` so re-runs
are idempotent.

> **Canonical vs. delivery:** the database only ever stores the ORIGINAL Cloudinary asset
> reference — never a baked transformation like `w_640,h_480,f_auto,c_lfill`. Responsive
> delivery (width `srcset`, `f_auto`, aspect-fit) is applied at **render time** by the
> frontend's @unpic image component. If you ever see a transformation inside a stored URL
> (e.g. `/image/upload/w_640,h_480,f_auto,c_lfill/v…/`), the DB rows were written by a
> process that confused delivery URLs with asset identity — re-run the seeder (§2/§4.1) to
> repair them.

> All commands run from the **`backend/`** directory with your PHP CLI (e.g. Laravel Herd's
> `php.exe` on Windows). The public catalog and gallery consume the outcome via
> `GET /api/v1/paket` (see `api-collection.md`).

---

## 1. Fresh Start / Moving to a New PC

Run this single command to rebuild **everything** from scratch:

```bash
php artisan migrate:fresh --seed
```

What happens, step by step:

1. **Drops all tables** (`paket`, `paket_images`, `galeri`, `pesanan`, `users`, …).
2. **Re-runs every migration** (including `paket.thumbnail` + `paket_images`).
3. **Runs `DatabaseSeeder`** → creates the admin test user, then `PaketSeeder`:
   - **Purges Cloudinary:** `DELETE /v1_1/{cloud}/resources/image/upload?prefix=catering-nusantara/products/`
     (Admin API, paginated via `next_cursor`) — removes every asset from previous runs so the
     cloud starts clean.
   - **Scans + uploads:** all 15 product folders, 2–3 images each (≤ `MAX_IMAGES_PER_FOLDER`).
   - **Seeds:** `15` paket rows + `39` `paket_images` rows (thumbnail is the 1st gallery image).

**Moving to a new PC:** clone the repo, install dependencies (`composer install`), copy
`backend/.env` (it must contain the `CLOUDINARY_*` keys and `DB_CONNECTION=sqlite`), then run
the command above. Nothing else is needed — the frontend image folders are part of the repo
(`frontend/public/assets/images/products`), and the Cloudinary prefix is purged automatically.

> ⚠️ `migrate:fresh` **destroys** all local database data. This is intended — the seeder
> rebuilds everything. Do not run it against a database with data you need.

## 2. Re-Seed Packages Only (keep existing database tables)

When you only changed product data/images or Cloudinary became out of sync with the DB:

```bash
php artisan db:seed --class=PaketSeeder
```

This keeps all tables intact, purges the Cloudinary prefix, and refreshes the 15 paket +
39 image records. `updateOrCreate(nama_paket)` means names that no longer exist are removed
by the purge-and-reinsert cycle; unknown folders fail loudly (see §4).

Repeating the seed twice yields identical results (idempotent).

## 3. Changing the Per-Folder Image Limits

The upload limits are the two `public const` at the **top of the `PaketSeeder` class**:

**File:** `backend/database/seeders/PaketSeeder.php`
**Lines:** `32` (`MIN_IMAGES_PER_FOLDER`) and `34` (`MAX_IMAGES_PER_FOLDER`) — directly under
the `class PaketSeeder` declaration.

```php
public const MIN_IMAGES_PER_FOLDER = 2;   // folders with fewer images are skipped
public const MAX_IMAGES_PER_FOLDER = 3;   // folders with more are truncated to the first N
```

- **MIN** — a folder with fewer image files than this is **skipped** with a warning (a product
  needs at least its thumbnail).
- **MAX** — a folder with more image files is **truncated** to the first N (sorted by filename).

After editing, re-run `php artisan db:seed --class=PaketSeeder` (§2) — the purge happens
automatically, so Cloudinary never keeps stale surplus images.

## 4. Verification

```bash
# Row counts (15 paket, 39 gallery images)
php artisan tinker --execute 'echo \App\Models\Paket::count();'          # 15
php artisan tinker --execute 'echo \App\Models\PaketImage::count();'     # 39

# Thumbnail is ALWAYS the first gallery image of its paket
# (expected: 15 matching rows, 0 mismatches)
php artisan tinker --execute '
    $bad = \App\Models\Paket::all()->filter(fn ($p) =>
        $p->thumbnail !== $p->images()->orderBy("id")->first()?->image_url
    );
    echo "mismatches: ".$bad->count();
'
```

## 5. Canonical Image URLs & Repairing Transformed Values

The seeder enforces **asset identity = canonical original URL**:

```
https://res.cloudinary.com/<cloud>/image/upload/v<version>/catering-nusantara/products/<slug>/<public-id>.<format>
```

The upload response's `secure_url` is already canonical, but `PaketSeeder`/`GaleriSeeder`
**rebuild** it from `public_id` + `version` + `format` so a transformation can never be
persisted — even if the account's upload settings ever change. Stored-values must never
look like:

```
…/image/upload/w_640,h_480,f_auto,c_lfill/v<version>/…     ❌ (delivery URL stored as identity)
```

> These `w_*,h_*,f_auto,c_lfill` shapes are @unpic srcset candidates generated at render
> time. If the DB was seeded by a process that copied such URLs, the images render as
> fixed low-resolution crops (portrait/landscape sources forced into one 4:3 box). Re-seed
> to repair — both seeders purge the Cloudinary namespace and rewrite every row with fresh
> canonical URLs (see §2 and §4.1 below).

```bash
# Verify: production URLs must contain NO transformation segment before /v<version>/
php artisan tinker --execute '
    echo "paket poisoned: ".\App\Models\Paket::where("thumbnail", "like", "%/upload/%w\\_%")->count();
    echo "galeri poisoned: ".\App\Models\Galeri::where("gambar_acara", "like", "%/upload/%w\\_%")->count();
'
```

Delivery optimization is the **frontend's** job (MediaItem + @unpic: responsive `srcset`,
`f_auto`, natural-aspect `fullWidth` layout for gallery masonry and the lightbox).

## 6. Troubleshooting & Notes

- **Cloudinary purge fails with** `"Parameter all=true cannot coexist with other criteria"`:
  the seeder uses prefix + `next_cursor` pagination — never combine `all=true` with `prefix`.
- **New product folder, no seed data:** the seeder throws
  `No seed data defined for folder '<slug>'`. Add the slug to `ORIGINALS` (client spec data)
  or `INFERRED` (curated data) in `PaketSeeder` — products are never fabricated with Faker.
- **Credentials / network:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET` must be set in `backend/.env`. The seeder needs outbound HTTPS.
- **Rate limits:** standard plans allow ~500 API calls/hour. A full seed is ~40 calls
  (1 purge + 39 uploads) ≈ 8% of the cap. Increase the MAX constant if you must, but stay
  well under the hourly budget.
- **Docs:** the authoritative data spec for the 5 client packages lives in
  `backend/docs/database-seeders.md`.