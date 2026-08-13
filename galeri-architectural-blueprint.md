<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Full-Stack Architectural Blueprint — `/galeri` (Galeri Perayaan) rebuild · **Monorepo Root:** `.`
>
> [Global Context](./docs/project-context.md) · [Monorepo Architecture](./docs/architecture.md) · [Backend API Specs](./backend/docs/api-collection.md) · [Backend DB Spec](./backend/docs/database.md) · [Seeder Runbook](./backend/docs/seeder-operations.md) · [Frontend Design](./frontend/docs/design.md) · [Frontend Spec (v1, superseded)](./frontend/docs/specs/galeri-page-spec.md)

# GALERI ARCHITECTURAL BLUEPRINT — Full-Stack Rebuild (v2)

> **Status:** RESEARCH & PLANNING COMPLETE — no migrations, seeders, or UI code written in this phase.
> **Mandate:** Fix the v1 failure: categorize + seed the backend gallery, replace the localized/clunky modal with a global Zustand-driven lightbox, redesign the hero as an editorial Tiska-style surface, and unify background/spacing tokens across the page.

---

## 1. CURRENT STATE DIAGNOSIS

### 1.1 Backend (`backend/`) — what went wrong

| # | Finding | Evidence | Impact |
|---|---|---|---|
| B1 | **Galeri has NO event category.** `galeri` table = `id, nama_acara, deskripsi_acara, gambar_acara, tanggal_acara, timestamps` only. | `database/migrations/2026_08_01_040804_create_galeris_table.php` | The gallery cannot be clustered/filtered by event type — the core of the Tiska-style page. |
| B2 | **Dead enum cast.** `Galeri` model casts `kategori_acara` → `KategoriAcaraEnum`, but that **column does not exist** on the table. | `app/Models/Galeri.php` (`casts()`), vs. migration | Silent Laravel error path; any write touching the cast fails or is ignored. The v1 frontend papered over this with local slugs. |
| B3 | **No category filter on the API.** `GaleriController@index` supports `search` only; `PaketController@index` already shows the correct pattern (`kategori_paket` + `kategori_acara` + pagination meta). | `app/Http/Controllers/GaleriController.php` | Frontend must filter client-side; API cannot serve `?kategori=`. |
| B4 | **No `GaleriSeeder`, no Cloudinary `galeri` namespace, no gallery assets.** `PaketSeeder` (19.7 KB) fully owns the upload pipeline; `database-seeders.md` + `seeder-operations.md` cover paket only. Cloudinary has `catering-nusantara/products/<slug>` (17 folders **verified live**), zero `catering-nusantara/galeri/*`. | `database/seeders/` ls; Cloudinary MCP `search-folders` | Nothing to display: `GET /galeri` returns an empty list. |
| B5 | **Resource & validation out of date.** `GaleriResource` returns only the 5 core fields; `GaleriStoreRequest`/`GaleriUpdateRequest` validate only those. | `app/Http/Resources/GaleriResource.php`, `app/Http/Requests/Galeri/*` | New fields (category, venue, guests, featured) cannot be written or returned. |

### 1.2 Frontend (`frontend/`) — what went wrong

| # | Finding | Evidence | Impact |
|---|---|---|---|
| F1 | **Localized, clunky modal.** The v1 lightbox is a per-page Radix `Dialog` owned by block-local `useState` in `galeri-block.tsx`; every surface must wire `onSelect`/`openFrom` plumbing through card → rails/grid → block. | `galeri-block.tsx`, `gallery-lightbox.tsx` | Cannot be reused by the home `MomentBlock`, product images, or future surfaces; heavy prop drilling. |
| F2 | **Inconsistent backgrounds.** Page mixes `bg-background` (hero) → `bg-secondary/60` band (featured) → `bg-background/90` (sticky bar) → `bg-popover` (lightbox/footer) with no unifying rule. | `galeri-block.tsx`, `gallery-filter-bar.tsx`, `gallery-lightbox.tsx` | Patchwork feel; violates the "one calm surface" Suasana principle. |
| F3 | **Hero is a cheap clone of the Paket hero.** Same `ScrollRotatingVisual` tumpeng, same left-aligned grid, same eyebrow/CTA layout as `catalog-header.tsx`. | `gallery-hero.tsx` vs `paket/catalog-header.tsx` | Zero editorial identity for `/galeri`; reads as a copy-paste. |
| F4 | **Static data only.** `useGaleriQuery` returns hardcoded `GALLERY_ITEMS` with local slugs (`pernikahan`, `korporat`, …) that do not match any backend enum. | `src/services/galeri/use-galeri-query.ts`, `galeri-data.ts` | Cannot consume the categorized API when it lands; slugs will be orphaned. |
| F5 | **Grid/layout debt.** Rails + grid have duplicated aspect logic, tile widths hard-coded in the card (`w-[220px] sm:w-[260px]`), and the featured "wash band" fights the flat background. | `gallery-card.tsx`, `gallery-grid.tsx`, `gallery-rails.tsx` | Fragile responsiveness and visual noise. |

### 1.3 Root causes (one sentence)

The v1 build optimized for speed over architecture: it invented a **local data model + local modal + local hero** instead of extending the **proven Paket vertical** (enum → migration → seeder → Cloudinary → resource → React Query → shared UI) that the monorepo already standardizes.

---

## 2. BACKEND SCHEMA & API PLAN

### 2.1 Category enum decision

Reuse `KategoriAcaraEnum` (Pernikahan · Kantor · Ulang Tahun · Arisan · Umum) **or** create a gallery-native enum?

**Recommendation: new `GaleriKategoriEnum`**, decoupled from paket, because gallery storytelling categories (Di Balik Dapur, Hampers) do not exist in `KategoriAcaraEnum`, and reusing it would leak "Kantor/Arisan" terminology into a portfolio surface.

```php
// backend/app/Enums/GaleriKategoriEnum.php
namespace App\Enums;

enum GaleriKategoriEnum: string
{
    case Pernikahan = 'Pernikahan';
    case Korporat = 'Korporat';            // covers KategoriAcaraEnum::Kantor
    case TumpengSyukuran = 'Tumpeng & Syukuran';
    case Perayaan = 'Perayaan';            // covers Ulang Tahun + Arisan
    case Hampers = 'Hampers';
    case DiBalikDapur = 'Di Balik Dapur';
    case Lainnya = 'Lainnya';              // the "Custom" fallback — never blocks admin input
}
```

> Cross-mapping table (documented in the seeder, not code): `Kantor→Korporat`, `Ulang Tahun→Perayaan`, `Arisan→Perayaan`. This keeps a future "link paket → galeri" story possible.

### 2.2 Migration (new file — never edit the shipped one)

```php
// backend/database/migrations/2026_08_XX_add_kategori_and_meta_to_galeri_table.php
Schema::table('galeri', function (Blueprint $table) {
    $table->enum('kategori_acara', ['Pernikahan','Korporat','Tumpeng & Syukuran','Perayaan','Hampers','Di Balik Dapur','Lainnya'])
        ->default('Lainnya')
        ->after('nama_acara');
    $table->string('lokasi')->nullable()->after('tanggal_acara');   // venue / city
    $table->unsignedInteger('jumlah_tamu')->nullable()->after('lokasi');
    $table->boolean('is_featured')->default(false)->after('jumlah_tamu');
    $table->index('kategori_acara');
    $table->index('is_featured');
});
```

> `enum` on PostgreSQL = native PG enum (Laravel handles the `CREATE TYPE`); fine on Neon. Rollback adds `down()` dropping the columns/indexes.

### 2.3 Model, Resource, Controller, Requests

- **`app/Models/Galeri.php`** — add to `#[Fillable]`: `kategori_acara, lokasi, jumlah_tamu, is_featured`; add to `casts()`: `'kategori_acara' => GaleriKategoriEnum::class`, `'jumlah_tamu' => 'integer'`, `'is_featured' => 'boolean'`; add scopes:
  ```php
  public function scopeFeatured(Builder $q): Builder { return $q->where('is_featured', true); }
  public function scopeKategori(Builder $q, GaleriKategoriEnum $k): Builder { return $q->where('kategori_acara', $k); }
  ```
- **`GaleriResource`** — add `kategori_acara` (`?->value ?? raw`), `lokasi`, `jumlah_tamu`, `is_featured`.
- **`GaleriController@index`** — mirror `PaketController`:
  ```php
  $kategori = $request->input('kategori_acara');
  // after search block:
  if ($kategori) { $query->where('kategori_acara', $kategori); }
  // $filters += ['kategori_acara' => $kategori];
  ```
  Add optional `?featured=1` → `$query->featured()` for the hero.
- **`GaleriStoreRequest` / `GaleriUpdateRequest`** — add rules: `kategori_acara` `['sometimes','required', Rule::enum(GaleriKategoriEnum::class)]`, `lokasi` nullable string, `jumlah_tamu` nullable integer|min:0, `is_featured` boolean.
- **`routes/api.php`** — no new routes needed (`GET /galeri` + admin `apiResource` already exist).

> API shape after change: `{ id, nama_acara, deskripsi_acara, gambar_acara, tanggal_acara, kategori_acara, lokasi, jumlah_tamu, is_featured, created_at, updated_at }`.

---

## 3. DATABASE SEEDING & CLOUDINARY PLAN

### 3.1 Asset acquisition workflow (`image-explorer`)

Tool: `~/.opencode/tools/image-explorer/search.js` (verified — supports `--query`, `--platform=all|unsplash|pexels|pixabay`, `--count`, `--orientation`, `--save --out`).

Per-category staging plan — each query targets a warm, editorial, food-forward visual:

| Category slug | Queries (run each) | Count | Orientation |
|---|---|---|---|
| `pernikahan` | "indonesian wedding reception buffet", "elegant wedding catering table", "nasi tumpeng wedding" | 4–5 | landscape |
| `korporat` | "corporate catering lunch box", "office event buffet catering", "business lunch catering" | 4–5 | landscape |
| `tumpeng-syukuran` | "nasi tumpeng traditional indonesian", "tumpeng syukuran", "nasi kuning cone" | 4–5 | landscape |
| `perayaan` | "birthday catering small party", "arisan snack box", "family celebration food" | 3–4 | landscape |
| `hampers` | "food gift hamper box", "catering hampers", "traditional snack gift box" | 3–4 | landscape |
| `di-balik-dapur` | "chef plating gourmet dish", "catering kitchen preparation", "indonesian food cooking" | 3–4 | landscape |

Commands (one per category, `--save` writes into the repo):

```bash
node ~/.opencode/tools/image-explorer/search.js \
  --query="nasi tumpeng traditional indonesian" \
  --platform=all --count=5 --orientation=landscape \
  --save --out=frontend/public/assets/images/galeri/tumpeng-syukuran
```

Rules:
1. **Review before commit** — keep only sharp, warm-tone, non-watermarked shots (explorer returns provider URLs + local copies). Delete rejects.
2. **Deterministic filenames** — the seeder sorts by filename, so rename selected files `01.jpg, 02.jpg, …` per folder (same contract as `PaketSeeder.imagePaths()`).
3. **Honest labeling** — these are **demo/placeholder events**, not client events. Seed copy is written as generic editorial captions ("Tumpeng syukuran keluarga"), and the seeder doc flags that real client photography must replace them before public launch (same stance as `HOMEPAGE_BUILD.md` placeholders).

### 3.2 `GaleriSeeder` (new — clone the `PaketSeeder` machinery)

File: `backend/database/seeders/GaleriSeeder.php`. Structure (verbatim patterns from `PaketSeeder` — purge → upload → upsert):

```php
use WithoutModelEvents;

public const MIN_IMAGES_PER_CATEGORY = 2;
public const MAX_IMAGES_PER_CATEGORY = 6;
private const CLOUDINARY_PREFIX = 'catering-nusantara/galeri';

// Category slug (folder under frontend/public/assets/images/galeri/)
// → curated event metadata. No Faker — every row is hand-authored.
private const ORIGINALS = [
    'pernikahan' => [/* 4–5 events: nama_acara, deskripsi_acara, kategori_acara => GaleriKategoriEnum::Pernikahan, lokasi, is_featured */],
    'korporat' => [...],
    'tumpeng-syukuran' => [...],
    'perayaan' => [...],
    'hampers' => [...],
    'di-balik-dapur' => [...],
];

public function run(): void
{
    $root = base_path('../frontend/public/assets/images/galeri');
    $this->purgeCloudinaryAssets();                       // DELETE catering-nusantara/galeri/ + next_cursor
    foreach ($this->categoryFolders($root) as $slug) {
        $urls = $this->imagePaths($root/$slug)            // sorted, capped
            ->map(fn ($p) => $this->uploadToCloudinary($p, $slug));  // folder: catering-nusantara/galeri/<slug>
        // zip ORIGINALS[$slug] entries with the uploaded urls, updateOrCreate(['nama_acara']), set gambar_acara, is_featured
    }
}
```

Key differences from `PaketSeeder`:
- **One event per image** (gallery entries are single-image), so `ORIGINALS` per category must list N event rows to zip against the N uploaded URLs — **or** simplify v1 to one event per folder image with `nama_acara` derived from a per-category name prefix + index (then re-curated later). Blueprint choice: **explicit `ORIGINALS` rows** (richer copy, honest control), zipped positionally after the upload order sort.
- **`is_featured`** marks the 5–6 signature events → drives the hero featured set.
- Wire into `DatabaseSeeder` after `PaketSeeder::class`.

### 3.3 Neon + Cloudinary execution flow

1. `php artisan migrate` (new columns) — or `migrate:fresh --seed` for a clean slate (destructive; runbook §1).
2. `php artisan db:seed --class=GaleriSeeder` — purge `catering-nusantara/galeri/` → upload ~25–30 assets → insert rows into Neon (`galeri`).
3. Verify (tinker): `Galeri::count()` ≈ 25–30; every `gambar_acara` starts `https://res.cloudinary.com/`; `kategori_acara` values ⊆ enum; `is_featured` = 5–6 rows.
4. Cloudinary verification (Admin API or MCP): `search-folders` shows `catering-nusantara/galeri/<slug>` siblings of `products/`.

> **Neon MCP note:** this session had no Neon MCP wired into the tool runtime; schema facts above were read from migrations/models (source of truth). During execution, run schema/seed verification through the Neon MCP (`query`/`explain`) per `backend/docs/database.md` §"Agent Context".

---

## 4. FRONTEND ARCHITECTURE — GLOBAL ZUSTAND IMAGE MODAL

### 4.1 Why Zustand over Context (the pivot)

The reference (`suasana-exploration-app/src/components/provider/context-provider.tsx`) is the **anti-pattern**: a `ModalContext.Provider` wrapping the whole tree, `openImage(src)` in context, body-scroll-lock effect, one `AnimatePresence` modal at the provider root. Problems it creates: re-renders every consumer on any context change, provider must wrap every surface that opens a modal, `useModal` throws if used outside the provider, and state lives in `useState` in a provider component.

**Zustand wins here** (already in the stack, `src/store/`): any component calls `useImageModalStore.getState().open(...)` with zero prop drilling or provider boundaries; selectors (`useImageModalStore(s => s.isOpen)`) re-render only subscribers; the modal is mounted once, anywhere.

### 4.2 Store — `src/store/image-modal-store.ts`

```ts
import { create } from "zustand"

/** Payload contract — anything that can be shown fullscreen. */
export interface ImageModalItem {
  src: string
  title?: string
  caption?: string
  category?: string
}

interface ImageModalState {
  isOpen: boolean
  items: ImageModalItem[]
  index: number
  /** Open a gallery (lightbox scope); 2nd arg = start index. */
  open: (items: ImageModalItem[], index?: number) => void
  /** Open a single image. */
  openSingle: (item: ImageModalItem) => void
  close: () => void
  next: () => void
  prev: () => void
  setIndex: (index: number) => void
}

export const useImageModalStore = create<ImageModalState>((set, get) => ({
  isOpen: false,
  items: [],
  index: 0,
  open: (items, index = 0) => set({ isOpen: true, items, index }),
  openSingle: (item) => set({ isOpen: true, items: [item], index: 0 }),
  close: () => set({ isOpen: false }),
  next: () => {
    const { items, index } = get()
    if (items.length < 2) return
    set({ index: (index + 1) % items.length })
  },
  prev: () => {
    const { items, index } = get()
    if (items.length < 2) return
    set({ index: (index - 1 + items.length) % items.length })
  },
  setIndex: (index) => set({ index }),
}))
```

### 4.3 Component — `src/components/ui/core/visual/global-image-modal.tsx`

Mounted **once** in `src/App.tsx` (inside providers, after `<RouterProvider/>`) so it works on public AND admin surfaces:

```tsx
"use client"
// AnimatePresence + motion; MediaItem; Button (shadcn); HugeIcons (ArrowLeft02/Right02, Cancel01)
export function GlobalImageModal() {
  const isOpen = useImageModalStore((s) => s.isOpen)
  const items = useImageModalStore((s) => s.items)
  const index = useImageModalStore((s) => s.index)
  const next = useImageModalStore((s) => s.next)   // + prev, close
  const reduced = useReducedMotion()
  // body scroll lock + keyboard (Escape/←/→) in one effect keyed on isOpen
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="global-image-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          role="dialog" aria-modal="true" aria-label="Pratinjau gambar"
          className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-foreground/80 backdrop-blur-md"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { scale: 0.95, y: 20 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[16/9] h-auto max-h-[80svh] w-full max-w-[100dvw] overflow-hidden sm:max-w-[85dvw] md:max-w-[80dvw]"
          >
            <MediaItem webViewLink={items[index].src} imageClassName="object-contain" className="h-full w-full" />
            {/* caption bar: title · category · position (index+1 / items.length) */}
            {/* close (top-right), prev (left), next (right) round ghost buttons */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

Spec compliance (user's exact constraints): `AnimatePresence` ✓ · `backdrop-blur-md` ✓ · `cursor-zoom-out` (overlay; inner stops propagation) ✓ · scale `0.95→1` + `y 20→0` exit/enter ✓ · `max-h-[80svh]` ✓ · `aspect-[16/9]` ✓ · responsive `max-w` (100dvw → 85dvw → 80dvw) ✓ · `prefers-reduced-motion` → opacity-only ✓.

### 4.4 Consumers (wiring)

- **Gallery card/featured**: `onClick → useImageModalStore.getState().open(scope.map(toModalItem), index)` where `toModalItem: (item) => ({ src: item.gambar_acara, title: item.nama_acara, caption: item.deskripsi_acara, category: kategoriLabel })`.
- **Delete** `gallery-lightbox.tsx` + the block-local `lightbox` state + `openFrom` plumbing.
- **Future reuse for free**: home `MomentBlock` tiles, product `paket-card` thumbnails, `about` images — same two-line call.

---

## 5. UI/UX REFACTOR PLAN FOR `/galeri`

### 5.1 Editorial hero (Tiska-style — replace the Paket clone)

Layout: **centered column**, flat `bg-background` (no wash band, no `ScrollRotatingVisual`).

```
      ┌──────────────────────────────────────┐
      │           PORTOFOLIO  (eyebrow)      │  text-[11px] tracking-[0.34em] uppercase text-primary
      │                                      │
      │     Galeri *perayaan*   (Fraunces)   │  font-heading text-[clamp(34px,5vw,64px)] leading-[0.95]
      │                          accent:     │  font-light — one Instrument Serif italic word in text-primary
      │     Momen-momen yang kami rayakan…   │  text-muted-foreground max-w-xl mx-auto
      │              ─── hairline ───        │  h-px w-24 bg-primary/40 (gold hairline, Tiska §10.1)
      │   [Konsultasi via WhatsApp]          │  OriginButton, centered
      └──────────────────────────────────────┘
```

- Eyebrow dash pattern from `moment-header.tsx`; H1 reveal via **`WordReveal` masked slide-up** (Tiska §10.1 #1, `trigger="mount"`, one accent word) — this is the page's ONE signature motion; everything below is declarative.
- Remove `ScrollRotatingVisual` + the `lg:grid-cols-[minmax(0,1fr)_auto]` split — pure editorial center, no clutter.
- Featured crossfade sits directly below on the SAME background, `container`-bounded, `ring-border` only.

### 5.2 Background token unification (kills F2)

| Surface | Token (before → after) |
|---|---|
| Page | `bg-background` → **`bg-background`** (unchanged, now the ONLY page color) |
| Featured band | `bg-secondary/60` → **removed** (image sits on page bg) |
| Sticky filter bar | `bg-background/90 backdrop-blur-sm border-b border-border` → **kept** (matches `/paket` exactly) |
| Tiles | transparent + `ring-border`, hover `ring-primary/50` → **kept** |
| Lightbox overlay | `bg-popover` dialog → **`bg-foreground/80 backdrop-blur-md`** (global modal §4.3) |
| CTA/footer | global `CTABlock`/`SiteFooter` → **unchanged** (LayoutWrapper) |

### 5.3 Showcase structure (kills F5)

- **Grid (single category):** `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`, tiles **uniform `aspect-[4/3]`**, first tile `lg:col-span-2` (editorial anchor), `w-full` (move size out of the card; card accepts `className`).
- **Rails ("Semua"):** native `overflow-x-auto snap-x` + `[mask-image:…]` edge fade (keep), cards `w-[220px] sm:w-[260px] aspect-[4/3]`.
- **Card:** MediaItem zoom `scale-110`, warm scrim `from-transparent via-foreground/40 to-foreground/90`, `text-accent` micro-label, title, hover meta-peek, `⤢` glyph — all unchanged in anatomy, **only** the size classes move to the parent so grid/rail both work from one card.
- `getCategoryById` label now derives from the **API `kategori_acara`** (mapped to `GalleryItem.category` in the service layer).

### 5.4 Data layer (kills F4)

- `useGaleriQuery` — swap static `queryFn` for `api.get("galeri", { searchParams: { perPage: "100" } })`, map `GaleriResource` → `GalleryItem`; keep `?kategori_acara=` server filter via `useGalleryParams`.
- `FEATURED_ITEMS` — from `is_featured` rows (`query.data.filter(i => i.is_featured)`), fallback to first N.
- Category pills — static mirror of `GaleriKategoriEnum` (like `KATEGORI_PAKET`), `?kategori_acara=` param.

---

## 6. EXECUTION ROADMAP (sequential)

### Phase A — Backend schema & API
- [ ] Create `app/Enums/GaleriKategoriEnum.php` (§2.1)
- [ ] Migration: add `kategori_acara` (enum), `lokasi`, `jumlah_tamu`, `is_featured` + indexes (§2.2)
- [ ] `Galeri` model: fillable, casts, `scopeFeatured`/`scopeKategori` (§2.3)
- [ ] `GaleriResource`: expose new fields
- [ ] `GaleriController@index`: `kategori_acara` + `featured` filters (mirror `PaketController`)
- [ ] `GaleriStore/UpdateRequest`: `Rule::enum`, new field validation
- [ ] `php artisan migrate` on Neon; verify via Neon MCP

### Phase B — Assets & seed
- [ ] Run `image-explorer` queries per category → stage in `frontend/public/assets/images/galeri/<slug>/` (§3.1)
- [ ] Review, dedupe, rename deterministically (`01.jpg…`)
- [ ] `GaleriSeeder`: purge `catering-nusantara/galeri/`, upload loop, `ORIGINALS` map, `updateOrCreate`, `is_featured`
- [ ] Wire `GaleriSeeder::class` into `DatabaseSeeder`
- [ ] `php artisan db:seed --class=GaleriSeeder`; verify counts + URLs (tinker / Neon MCP / Cloudinary folders)
- [ ] Update `backend/docs/database-seeders.md` + `seeder-operations.md` for the galeri runbook

### Phase C — Global Zustand modal
- [ ] `src/store/image-modal-store.ts` (§4.2)
- [ ] `src/components/ui/core/visual/global-image-modal.tsx` (§4.3) + mount in `App.tsx`
- [ ] Delete `gallery-lightbox.tsx` + block-local lightbox state; wire cards/featured to the store (§4.4)

### Phase D — `/galeri` refactor
- [ ] Rewrite `gallery-hero.tsx` (centered editorial, `WordReveal`, no Paket clone) (§5.1)
- [ ] Remove `bg-secondary/60` band; unify backgrounds (§5.2)
- [ ] Refactor `gallery-card` (parent-driven size), `gallery-grid` (uniform aspects), `gallery-rails` (keep)
- [ ] `useGaleriQuery` → real API + mapping; `useGalleryParams` → `kategori_acara`

### Phase E — Integration & verification gates (MANDATORY)
- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean on feature files (repo-wide pre-existing debt tracked separately)
- [ ] `npm run lint:design` (`impeccable detect src/`) — must stay `[]`
- [ ] Manual QA: 375/768/1024/1440; modal ESC/←/→/scroll-lock; `prefers-reduced-motion`; honest copy (no fabricated client claims — demo captions flagged)
- [ ] Home `MomentBlock` integration via the global modal (stretch, cheap)

---

## 7. DEFERRED / OPEN (documented ceilings)

- **Real client photography** — current plan seeds curated demo/stock imagery (user-approved via image-explorer). Replace before public launch; the seeder + DB shape is identical.
- **Neon MCP availability** — not in this session's runtime; execution uses migrations as truth + Neon MCP when wired (`backend/docs/database.md`).
- **`galeri.video_acara` / video in modal** — not requested; `MediaItem` already supports `video` when the field ships.
- **Pagination on `/galeri`** — ~30 rows need none; keep `perPage=100` and revisit at scale.
