# Master Testimoni — Product Requirements Document
> **Project:** Catering Nusantara · **Module:** Master Testimoni (Admin CMS)
> **Phase:** Planning & PRD — Research Only (No Production Code)
> **Monorepo Root:** `../../` · **PRD Location:** `frontend/docs/PRD-Master-Testimoni.md`
> **Status:** APPROVED — backend authorized (R1, D1, D2, D4 approved; D3, D5 deferred; D6 out of scope). See §15 Approval Record.
> **References:** `docs/project-context.md` · `docs/architecture.md` · `frontend/docs/architecture.md` · `frontend/docs/design.md` · `backend/docs/api-collection.md` · `backend/docs/database.md` · `frontend/docs/PLANNING_PESANAN.MD` · `frontend/AGENTS.md` (if present) · `AGENTS.md` (repo root)

---

## 1. Executive Summary

**Master Testimoni** is a new authenticated Admin CMS surface for managing customer testimonials: who ordered (`nama`), what they ordered (`pesanan` + `paket_id` relation), for which event (`acara`), where (`lokasi`), plus optional supporting photos (`gambar`, multi-image → Cloudinary `catering-nusantara/testimoni`).

No new architectural pattern is invented. The feature is a **composition of two proven benchmarks**:

| Concern | Benchmark | Why |
|---|---|---|
| Block/file skeleton, form shell, single-entity CRUD, validation, upload-at-submit, orphan sweep | **Master Galeri** (closest domain: named event + photo + category-ish metadata) | Smallest structural delta; 1:1 clone-then-rename |
| Data table, search bar, sort, pagination, row actions, bulk update/delete + action bar | **Master Pesanan** (exact requirement) | Requirement mandates Pesanan parity |
| Relational dropdown (`paket_id`) | **Master Pesanan** (`pesanan-form.tsx` Collapsible combobox + `usePaketSearch`/`usePaketDetail`) | Only existing paket-relation picker |
| Multi-image upload field | **Master Paket** (`paket-form.tsx` `ImagesUpload maxFiles={8}` + `resolveUploads` at submit) | Only existing multi-image pipeline |

**Route is pre-stubbed:** `frontend/src/router/index.tsx:89-91` already registers `path: "testimoni"` under `AppShell` (`/dashboard/testimoni`) pointing at `frontend/src/pages/admin/testimoni-page.tsx`, which renders a placeholder `TestimoniBlock` (`@/components/ui/core/block/testimoni/testimoni-block.tsx`). Phase 2 replaces the placeholder with the real Master block.

**One approval gates everything:** `testimoni` is currently an *explicitly unapproved* table (`docs/architecture.md` §4.3, `backend/docs/database.md:19`, `AGENTS.md` §3 — "do not create migrations beyond the 4 core tables without explicit instructions"). This PRD **is** the confirmation vehicle: no migration is written until the user approves this document.

---

## 2. Phase 0 Discovery Log (evidence)

### 2.1 Repository topology (verified by direct read)

```
catering/                  # monorepo root (/mnt/c/Dev/Web/catering)
├── AGENTS.md              # repo-wide agent rules (4 core tables, server-side totals, shadcn/RQ/Ky rules)
├── README.md · LICENSE.md
├── docs/                  # architecture.md (sitemap + 5-table DBML), project-context.md, api/, seo/, testing-documentation.md, useability.md, git-workflow.md
├── backend/               # Laravel (app/, routes/api.php, database/, docs/api-collection.md, docs/database.md, openapi.json, skills-lock.json, .agents/skills/)
└── frontend/              # React + Vite + TS (src/, docs/, skills-lock.json, .agents/skills/, package.json)
```

- Working tree is **dirty (uncommitted changes present)** — Phase 2 must not touch unrelated WIP (`git status` shows modified `.gitignore`s, `docs/architecture.md`, deleted `mediadrop` skill refs, deleted `bootstrap/` + `design-system/` docs). Scope discipline (§10) applies.
- Stack verified via `frontend/package.json`: `react@19`, `react-router@8`, `@tanstack/react-query@5`, `@tanstack/react-form@1`, `ky@2`, `zustand@5`, `tailwindcss@4` (+ `@tailwindcss/vite`), `radix-ui`, `framer-motion@12`, `gsap@3` (+ `@gsap/react`), `vaul` (Drawer), `sonner`, `react-mediadrop`, `zod` (locked skill; dependency resolved via skill, not listed as direct dep — confirm at implementation).

### 2.2 Skills inventory

- `frontend/skills-lock.json` (v1, 47 pinned skills): `shadcn`, `tailwindcss`, `zod`, `cloudinary-docs`, `cloudinary-react`, `cloudinary-transformations`, `cloudinary-next`, `gsap-core`, `gsap-react`, `gsap-performance`, `frontend-ui-engineering`, `vercel-react-best-practices`, `agent-browser`, `animate`, `micro-interaction`, `motion-framer`, `brandkit`, `design-taste-frontend`, `high-end-visual-design`, `minimalist-ui`, `redesign-existing-projects`, `full-output-enforcement`, `mediadrop`, `seo*` (24x). No `testimoni`-specific skill exists — none needed.
- `backend/skills-lock.json` (v1, 4 pinned skills): all Cloudinary (`cloudinary-docs/next/react/transformations`).
- `.agents/skills/` mirrors the lock files on both sides. No skill tool invocation was required for a planning-only turn; applicable implementation-phase skills are listed in §11.
- Global design-engine skills referenced by `frontend/docs/architecture.md` §1.1 (`~/.opencode/skills/`: `impeccable`, `catering-nusantara-design`, `motion-orchestration`, `shadcn-architecture`, `hallmark`) were **not** loaded — no UI code is generated in this phase; they apply at implementation (lint gate `npm run lint:design`).

### 2.3 Documentation read (full)

| Doc | Finding relevant to Testimoni |
|---|---|
| `docs/architecture.md` | Sitemap: Testimonials (public #5) is **Optional/static** ("Business Profile" sheet, not DB-backed); admin masters are #9–12. §4.3: `testimoni` + `faq` tables **outside scope — must not be created without explicit confirmation**. Data→page map: Testimonials currently static. |
| `docs/project-context.md` | Brand "Down to Earth", WhatsApp-first conversion, no stock photos, warm-cream/amber identity. Testimoni content must use real client names/photos. |
| `AGENTS.md` (root) | §§3/5: no new tables without instruction; JSON columns via Form Requests; `total_harga`/`nomor_struk` server-only; zustand ≠ server data; React Query + Ky; no hardcoded tokens; no core `ui/` edits. |
| `frontend/docs/architecture.md` | SPA map, `src/api/client.ts` (Ky + Sanctum Bearer + 401→`/login`), services-layer data flow, guards (`GuestGuard`/`AuthenticatedGuard`), block/fragment composition. |
| `frontend/docs/design.md` | Suasana OKLCH tokens via `src/index.css`, Fraunces/Space Grotesk/Instrument Serif, shadcn-first, admin table tokens (`border-border`, `bg-muted/50` header), Drawer/Dialog + `AnimatePresence`, `sonner` toasts. Implementation must pass `npm run lint:design`. |
| `frontend/docs/admin-overview-prd.md` | House PRD format reference (header refs → summary → benchmark → deep dive → plan). This file follows it. |
| `backend/docs/database.md` | 5-table DBML + JSON-array cast/rules + server-only money rules. Line 19: `testimoni`/`faq` **NOT approved**. |
| `backend/docs/api-collection.md` + `openapi.json` | Canonical endpoint/payload contract (consulted via benchmark report; Phase 2 must add the Testimoni section). |

### 2.4 Benchmark code-read (via explore subagent + direct verification reads)

| Artifact | Verified |
|---|---|
| `frontend/src/components/ui/core/block/admin/{galeri,paket,pesanan}/` | Inventories: galeri 18 files, paket 19, pesanan 22 (see §3). `admin/` currently holds only `galeri/ overview/ paket/ pesanan/ shared/` — no `testimoni/` yet. |
| `.../admin/pesanan/components/pesanan-form.tsx` (469 lines) | Direct-read head (1–80): `"use client"`, TanStack `useStore(form.store)` for `paket_id`, `usePaketSearch("")` + `usePaketDetail(paketId)`, Collapsible combobox, `PesananCalcPanel`, `FieldGroup` fragments. |
| `.../admin/paket/components/paket-form.tsx` (225 lines) | Direct-read head (1–60): submit hijack → `form.handleSubmit()`, `grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]`, `FieldGroup`, `Informasi Dasar` section. Multi-image: `field.ImagesUpload maxFiles={8}` + `field.ImageUpload` thumbnail; submit-phase parallel `resolveUploads` via `cloudinaryTransport`; orphan sweep `purgeCloudinaryImages`. |
| `frontend/src/router/index.tsx` | Direct-read full (96 lines): `testimoni` route **already registered** (`:89-91`) under `AuthenticatedGuard → AppShell → /dashboard`. Import at `:17`. |
| `frontend/src/pages/admin/testimoni-page.tsx` | Direct-read full (8 lines): thin wrapper over `@/components/ui/core/block/testimoni/testimoni-block` (placeholder, **outside** `admin/`). |
| `backend/routes/api.php` | Direct-read full (59 lines): public `paket/galeri/pesanan(store)`; `admin` group (`auth:sanctum`) with `paket` (search + bulk + `apiResource`), `galeri` (bulk + `apiResource`), `pesanan` (explicit routes + bulk + struk), `cloudinary/signature|destroy`. **No testimoni routes yet.** |
| `backend/app/Http/Controllers/CloudinaryController.php` | Direct-read full (108 lines): `signature()` resolves folder from `kategori_acara|category` via `resolveFolder()` allowlist (galeri 7 slugs → `catering-nusantara/galeri/{slug}`; paket 4 slugs → `catering-nusantara/products/{slug}`; fallback `galeri/lainnya`). **No testimoni branch — required change.** |
| `frontend/src/lib/cloudinary.ts` | Direct-read head (1–40): `CLOUDINARY_PRODUCTS_FOLDER`, cached signature (`getUploadSignature`), `purgeCloudinaryImages` fire-and-forget `DELETE admin/cloudinary`. |

---

## 3. Benchmark Patterns to Mirror (normative)

### 3.1 Canonical file skeleton (clone from Master Galeri, closest domain)

```
src/components/ui/core/block/admin/testimoni/
├── master-testimoni-block.tsx          # orchestrator (mirror master-galeri-block.tsx, 269 lines)
├── types/testimoni-types.ts            # Testimoni, list params, sort columns, bulk payloads
├── validations/testimoni-schema.ts     # zod create/update schemas (mirror galeri-schema.ts)
├── hooks/
│   ├── use-testimoni-query.ts          # useTestimoniList (React Query, paginated) + useTestimoniDetail
│   ├── use-testimoni-mutations.ts      # create/update/delete/bulk + useTestimoniForm (useAppForm)
│   └── use-debounced-value.ts          # re-export shared @/hooks/use-debounced-value (do NOT duplicate)
├── utils/
│   ├── testimoni-form-mapper.ts        # toFormDefaults / toCreatePayload / areFormValuesEqual + FILE_SENTINEL
│   └── testimoni-format.ts             # date/relative display helpers (mirror paket-format.ts if needed)
├── config/testimoni-enum-options.ts    # acara options (mirror galeri-enum-options.ts)
├── store/testimoni-upload-store.ts     # active-upload counter for footer status (mirror paket/galeri-upload-store)
└── components/
    ├── testimoni-table.tsx             # shadcn Table (mirror pesanan-table.tsx structure)
    ├── testimoni-toolbar.tsx           # SearchBar + filters + Tambah button (mirror pesanan-toolbar.tsx)
    ├── testimoni-table-action-bar.tsx  # bulk bar (mirror pesanan-table-action-bar.tsx)
    ├── testimoni-form.tsx              # shared form grid (mirror §3.3)
    ├── testimoni-form-actions.tsx      # submit/cancel actions
    ├── create-testimoni-drawer.tsx     # responsive shell (mirror §3.3)
    ├── update-testimoni-drawer.tsx     # same + key={target.id} remount
    ├── testimoni-delete-dialog.tsx     # shared DeleteDialog wrapper
    ├── testimoni-card-grid.tsx + testimoni-view-toggle.tsx  # OPTIONAL (only if grid view approved; galeri/paket have it, pesanan does not)
    └── testimoni-status-badge.tsx      # only if a status/enum field is later added (not in v1 scope)
```

Page: rewrite `src/pages/admin/testimoni-page.tsx` → `return <MasterTestimoniBlock />` (mirror `master-pesanan-page.tsx:4-6`). Delete or deprecate the placeholder `src/components/ui/core/block/testimoni/testimoni-block.tsx` (currently referenced by the page; must not remain as dead code).

### 3.2 Table / search / bulk (Master Pesanan parity — mandatory)

- **State (in `master-testimoni-block.tsx`):** `searchInput` + `useDebouncedValue(trim, 350)`, filter states, `sortBy/sortDir`, `page/perPage` (default 10), `selectedIds:number[]`. Every filter/search change resets `page=1`.
- **Query:** `useTestimoniList({ search, sortBy, sortDir, page, perPage, ...filters })` → envelope `{ data[], meta.pagination, meta.filters }` via `Controller::respondWithPagination`.
- **Toolbar:** `SearchBar` (nama/pesanan/acara/lokasi), optional `MultiSelectFilter`(s) if an enum filter is introduced, "Bersihkan filter" ghost, `Tambah Testimoni` (`PlusSignIcon`). No second filter is required in v1 (no enum column) — toolbar mirrors pesanan minus the two multi-selects.
- **Table:** shadcn `Table`, sticky checkbox column with indeterminate `onToggleAll`, sortable header dropdowns (Asc/Desc/Sembunyikan) + `hiddenCols` local state, row actions (Edit/Hapus), `DataTableSkeleton` loading, bordered error div, "Tidak ada testimoni ditemukan." empty state, shared `DataTablePagination`.
- **Columns (v1):** `☐ | Nama | Pesanan | Acara | Lokasi | Paket (relasi) | Gambar (count/thumb) | updated_at | ⋮`.
- **Bulk bar:** floats when `selectedIds.length > 0` over shared `DataTableActionBar`; bulk delete via shared `DeleteDialog`; bulk update **only if** a whitelisted field exists in v1 (see decision D4 §9 — default: bulk-delete only, single bulk-update field `acara` iff approved).

### 3.3 Form shell + layout (pesanan-form × paket-form)

- **Responsive shell (identical pattern):** `useIsMobile()` → mobile `Drawer` (`DrawerContent max-h-[95svh]`, `DrawerHeader/Footer`) vs desktop `Dialog` (`DialogContent max-h-[95vh] max-w-4xl lg:max-w-[80em]`, sr-only `DialogHeader`). Discard guard: dirty close → shared `DeleteDialog` "Buang perubahan?" using `areFormValuesEqual()` + `FILE_SENTINEL="__file_upload__"`. Update drawer remounts per row via `key={updateTarget.id}`.
- **Grid:** `grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]` — left: "Informasi Dasar" (wajib) + "Detail Tambahan" (opsional) sections with `border-t pt-8`; right sticky `aside`: **Paket summary panel** (mirrors `PesananCalcPanel` — shows selected paket thumbnail/nama/harga/min_order, `Skeleton` while loading) + **Media panel** (multi-image upload).
- **Fields + fragments:** all via TanStack Form `form.AppField` + shared fragments (`field.Input/TextArea/ImagesUpload`, etc.). Labels always visible (design.md §6.1); semantic tokens only.
- **Relational dropdown (`paket_id`):** reuse the pesanan Collapsible combobox verbatim — `usePaketSearch("")` options + `usePaketDetail(paketId)` summary, local search filter, `mergedPaketOptions` with `initialPaket` for edit, selecting resets dependent state. (Requires backend `GET /admin/paket/search` — already exists, `api.php:35-36`.)
- **Multi-image upload (`gambar`):** `form.AppField name="gambar"` → `<field.ImagesUpload label="Foto Testimoni" maxFiles={8} />`. Zero-network draft (Files in form state) → parallel `uploadDeferredImage` at submit via `cloudinaryTransport` scoped to the testimoni folder (§7). Orphan sweep `purgeCloudinaryImages` on discard/tile-remove. Store **canonical** URLs only (`toCanonicalCloudinaryUrl` — never transformed delivery URLs).
- **Validation:** `useAppForm({ validators: { onChange, onSubmit }, defaultValues, onSubmit })` with zod schemas mirroring Form Requests 1:1 and omitting server-only fields. Business guard outside zod only if needed (no min_order/capacity analogue for testimoni).

---

## 4. Backend Architecture

### 4.1 Migration — `testimonis` table ⚠️ REQUIRES APPROVAL (§9-R1)

Proposed migration `YYYY_MM_DD_HHMMSS_create_testimonis_table.php` (timestamp at implementation):

```php
Schema::create('testimonis', function (Blueprint $table) {
    $table->id();
    $table->string('nama');                       // required, max:255
    $table->string('pesanan');                    // required, max:255 (see D1 §9)
    $table->string('acara');                      // required, max:255 (see D4 §9)
    $table->string('lokasi');                     // required, max:255
    $table->foreignId('paket_id')                 // required FK
          ->constrained('paket')
          ->restrictOnDelete();                   // mirror pesanan guard: block delete while referenced (409)
    $table->json('gambar')->nullable();           // optional JSON array of canonical Cloudinary URLs (see D2 §9)
    $table->timestamps();
    $table->index(['acara']);
    $table->index(['paket_id']);
});
```

- Engine notes: PostgreSQL (Neon) `json` column; model casts `gambar => 'array'` (database.md JSON rules).
- `restrictOnDelete` on the **testimoni→paket** direction means deleting a *paket* referenced by testimoni must return `409` (same convention as `PaketController` delete guard `pesanan_count>0` — extend the guard to `testimoni_count>0`).
- Approval gate: creating this migration is the explicit act this PRD seeks approval for (overrides architecture §4.3 / database.md:19 for `testimoni` only; `faq` remains unapproved).

### 4.2 Model — `app/Models/Testimoni.php`

Mirror `Models/Galeri.php`: singular, `protected $table = 'testimonis'`, `HasFactory`, `#[Fillable]` (route-model binding default), casts `['gambar' => 'array']`, relation `paket(): BelongsTo`, query scopes for search/sort reuse (`scopeSearch`, whitelist `SORTABLE = ['nama','acara','lokasi','created_at','updated_at']`).

### 4.3 Form Requests — `app/Http/Requests/Admin/Testimoni/{StoreTestimoniRequest,UpdateTestimoniRequest}.php`

(Place under `Admin/` mirroring `Requests/Admin/Galeri/*`; fallback to `Requests/Testimoni/*` only if the team prefers the non-admin path.)

| Field | Store rules | Update rules |
|---|---|---|
| `nama` | `required\|string\|max:255` | `sometimes\|required\|string\|max:255` |
| `pesanan` | `required\|string\|max:255` | `sometimes\|required\|string\|max:255` |
| `acara` | `required\|string\|max:255` | `sometimes\|required\|string\|max:255` |
| `lokasi` | `required\|string\|max:255` | `sometimes\|required\|string\|max:255` |
| `paket_id` | `required\|integer\|exists:paket,id` | `sometimes\|required\|integer\|exists:paket,id` |
| `gambar` | `nullable\|array\|max:8` | `nullable\|array\|max:8` |
| `gambar.*` | `string\|url\|max:2048` (canonical http URL; File objects never reach the backend — uploads resolve client-side) | same |

Strictness notes: no `total_harga`-style server-computed field exists here — nothing to strip. `Rule::enum` not needed in v1 (no enum column).

### 4.4 Resource — `app/Http/Resources/TestimoniResource.php`

Mirror `GaleriResource`: `id, nama, pesanan, acara, lokasi, gambar (array), paket (whenLoaded: id, nama_paket, thumbnail, harga_per_porsi), created_at/updated_at (toDateString)`, plus `paket_id` scalar. No back-compat aliases needed (greenfield).

### 4.5 Controller — `app/Http/Controllers/Admin/TestimoniController.php`

Mirror `Admin/GaleriController` (index/store/update/destroy/bulkUpdate/bulkDelete), paginated via `Controller::respondWithPagination` envelope `{status,message,data[],meta:{filters,pagination}}`:

- `index`: `search` LIKE across `nama, pesanan, acara, lokasi`; whitelisted `sortBy/sortDir`; `->with('paket:id,nama_paket,thumbnail')` (avoid N+1); `->paginate(perPage)`.
- `store`/`update`: typed FormRequest → `Testimoni::create/update` → `201` on create with `TestimoniResource`. On `gambar` change, dispatch existing `PurgeCloudinaryAssets` pattern (as Paket update does) for removed URLs.
- `destroy`: delete row + best-effort Cloudinary purge of its `gambar` URLs.
- `bulkUpdate`: `{ids: [exists:testimonis,id], field: Rule::in([...]), value}` — v1 whitelist TBD by D4 (default: none → ship bulk-delete only).
- `bulkDelete`: `{ids.*: exists:testimonis,id}`.
- Paket delete guard: extend `PaketController::destroy` 409 check to include `testimoni_count`.

### 4.6 Routes — `routes/api.php` (`admin` group, `auth:sanctum`)

```php
Route::post('/testimoni/bulk-update', [TestimoniController::class, 'bulkUpdate'])->name('admin.testimoni.bulk-update');
Route::post('/testimoni/bulk-delete', [TestimoniController::class, 'bulkDelete'])->name('admin.testimoni.bulk-delete');
Route::apiResource('testimoni', TestimoniController::class)->names('admin.testimoni');
```

No public (`auth`-less) routes in v1 — public Testimonials page stays static until D5 (§9) is decided. Literal-path-before-resource ordering rule (`api.php:33-35` comment) does not apply (no wildcard collision), but keep bulk routes above `apiResource` by convention.

### 4.7 Factory & Seeder (localized Indonesian data)

- `database/factories/TestimoniFactory.php`: `Faker::create('id_ID')` (mirror `UserFactory:29`, `PesananSeeder:87,99` — do NOT rely on global `en_US` default in `config/app.php:85`). Pools: `nama` → `fake('id_ID')->name()`; `acara` → `randomElement(['Pernikahan','Kantor','Ulang Tahun','Arisan','Syukuran','Hampers'])`; `lokasi` → Bogor-area pool (`Bogor`, `Cibinong`, `Sentul`, `Cileungsi`, `Depok`, `Taman Sari`); `pesanan` → template pool (`"Nasi Box Hemat × 150"`, `"Prasmanan Pernikahan × 300"`, …); `gambar` → 0–3 existing Cloudinary-style URLs or empty (uploads are client-side; factory stores URL strings only).
- Relation realism (mandatory): seeder assigns `paket_id` from **existing** `paket` records (never random ints) — e.g. `Paket::inRandomOrder()->first()->id`, weighted so hero/best-seller paket collect more testimoni (mirror `PesananSeeder` 30–50 vs 3–10 weighting).
- `database/seeders/TestimoniSeeder.php` + registration in `DatabaseSeeder`. Docs: append seeder behavior to `backend/docs/database-seeders.md` (if that file exists at implementation; verify path).
- Contract docs: add Testimoni rows to `backend/docs/api-collection.md` + DBML block to `backend/docs/database.md` (marking `testimoni` approved-by-this-PRD).

---

## 5. Frontend Architecture

### 5.1 Routing

**No router change required.** `src/router/index.tsx:65-95` already nests `path: "testimoni" → <TestimoniPage />` under `AuthenticatedGuard → AppShell → /dashboard` (verified lines 89–91). Phase 2 only changes what `TestimoniPage` renders. Also verify `AppShell` sidebar nav includes the Testimoni entry (add `href: "/dashboard/testimoni"` alongside Paket/Galeri/Pesanan if missing — check `components/ui/core/layout/dashboard/` at implementation).

### 5.2 Directory changes

| Action | Path |
|---|---|
| CREATE (full skeleton §3.1) | `src/components/ui/core/block/admin/testimoni/**` |
| CREATE | `src/store/testimoni-upload-store.ts` (or colocate `store/` under block if galeri/paket stores are colocated — match whichever location the benchmark uses) |
| REWRITE (thin wrapper) | `src/pages/admin/testimoni-page.tsx` → `return <MasterTestimoniBlock />` |
| DELETE (after repoint) | `src/components/ui/core/block/testimoni/testimoni-block.tsx` placeholder + its directory if emptied |
| REUSE (import, never copy) | `src/api/client.ts`, `src/hooks/use-form.ts` (`useAppForm`), `src/hooks/use-debounced-value.ts`, `src/lib/cloudinary.ts`, `src/lib/audio-feedback.ts`, shared fragments (`field/*`, `table/*`, `dialog/delete-dialog`, `search-bar`, `multi-select-filter`), view-store pattern |
| ADD | `CLOUDINARY_TESTIMONI_FOLDER` export in `src/lib/cloudinary.ts` (§7) |

### 5.3 State management (repo rules apply)

- Server data: React Query only (`useTestimoniList` list key includes all filter/sort/page params; mutations invalidate `["testimoni"]`). Ky via `src/api/client.ts` (Bearer auto-attach, 401→`/login`).
- UI state: local `useState` in block (search, filters, sort, page, selection, drawer targets) + transient zustand only for upload counter / view-toggle (if grid view added).
- No financial preview panel exists (unlike pesanan calc) — the aside shows the **paket summary** (read-only relation context), which is UX-only and needs no server re-validation rule.

### 5.4 Validation (zod, mirrors Form Requests 1:1)

```ts
// validations/testimoni-schema.ts (sketch — written in Phase 2)
export const testimoniCreateSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(255),
  pesanan: z.string().trim().min(1, "Pesanan wajib diisi").max(255),
  acara: z.string().trim().min(1, "Acara wajib diisi").max(255),
  lokasi: z.string().trim().min(1, "Lokasi wajib diisi").max(255),
  paket_id: z.number().int().positive("Pilih paket terkait"),
  gambar: z.array(z.union([z.instanceof(File), z.string().url()])).max(8).optional().default([]),
});
export const testimoniUpdateSchema = testimoniCreateSchema.partial(); // mirrors sometimes|required
```

Image union refines `File` (draft) vs canonical http URL (committed) — same `z.union([File, string]).refine(isFile || isHttpUrl)` idiom as `paket-schema.ts:19-32`.

---

## 6. API Contract (v1, admin-only)

| Method & Path | Purpose | Notes |
|---|---|---|
| `GET /api/v1/admin/testimoni?search=&sortBy=&sortDir=&page=&perPage=` | Paginated list + filters | Envelope via `respondWithPagination`; `with paket` eager-load |
| `POST /api/v1/admin/testimoni` | Create | `201` + `TestimoniResource`; FormRequest validation |
| `GET /api/v1/admin/testimoni/{id}` | Detail | `with paket` |
| `PUT /api/v1/admin/testimoni/{id}` | Update | `sometimes\|required` rules; purge removed image URLs |
| `DELETE /api/v1/admin/testimoni/{id}` | Delete | Purge its `gambar` URLs (best-effort) |
| `POST /api/v1/admin/testimoni/bulk-update` | Bulk single-field update | Only if D4 approves a whitelisted field |
| `POST /api/v1/admin/testimoni/bulk-delete` | Bulk delete | `{ ids: number[] }` |

Frontend service: colocate fetch functions in `hooks/use-testimoni-query.ts` (Galeri style — no separate service file) unless a `paket-search`-style shared lookup is needed (it already exists; reuse `usePaketSearch`/`usePaketDetail` from the pesanan block or promote to shared if the team prefers).

---

## 7. Storage Integration (Cloudinary)

Target folder: **`catering-nusantara/testimoni`** (flat — no per-category subfolders in v1; testimoni has no category enum).

1. **Backend — `CloudinaryController::resolveFolder()`** (`app/Http/Controllers/CloudinaryController.php:45-68`): add an explicit testimoni branch. Recommended: accept `folder: 'testimoni'` (or `category: 'testimoni'`) in the signature request and return `catering-nusantara/testimoni` without slug mangling. Keep galeri/paket branches untouched. Verify `CloudinarySignatureRequest` permits the new key (update rules if whitelisted).
2. **Frontend — `src/lib/cloudinary.ts`**: add `export const CLOUDINARY_TESTIMONI_FOLDER = "catering-nusantara/testimoni"` and use `createCloudinaryTransportForFolder(CLOUDINARY_TESTIMONI_FOLDER)` (bypasses the cached product-folder signature — see `:56-100`) in `use-testimoni-mutations.ts` `resolveUploads`.
3. **Flow (unchanged mechanics):** signature (`POST admin/cloudinary/signature`) → XHR direct upload with progress/abort → canonical URL via `toCanonicalCloudinaryUrl` → submit payload carries URL strings only → discard/tile-remove triggers `purgeCloudinaryImages` (`DELETE admin/cloudinary`).
4. **Limits:** `maxFiles={8}` (paket parity), per-file type/size validation in `ImagesUpload` fragment (reuse existing), `gambar` nullable so zero-photo testimoni are valid.
5. Manual console check: folder `catering-nusantara > testimoni` must exist/accept uploads (URL provided in requirements — verify at implementation).

---

## 8. Field Matrix (normative)

| Field | Type (DB) | Required | Source / Notes |
|---|---|---|---|
| `nama` | `string` | ✅ mandatory | Nama pemberi testimoni (e.g. "Ibu Ratna") |
| `pesanan` | `string` | ✅ mandatory | Ringkasan pesanan bebas (e.g. "Nasi Box Hemat × 150"). ⚠️ See D1 — NOT a FK; the relational link is `paket_id` |
| `acara` | `string` | ✅ mandatory | Jenis acara bebas (e.g. "Pernikahan", "Arisan"). Free string in v1 (see D4 for enum option) |
| `lokasi` | `string` | ✅ mandatory | Lokasi acara (e.g. "Taman Sari, Bogor") |
| `paket_id` | `FK → paket.id` | ✅ mandatory | Relational dropdown (pesanan pattern); `restrictOnDelete` + 409 guard on paket delete |
| `gambar` | `json nullable` | ⚪ optional | Array of canonical Cloudinary URLs, max 8 (see D2) |

---

## 9. Open Decisions (resolve before/at Phase 2 kickoff)

| # | Decision | Recommendation | Impact if opposite |
|---|---|---|---|
| R1 | **Approve `testimonis` migration** (overrides architecture §4.3 / database.md:19) | Approve `testimoni` only; `faq` stays unapproved | No implementation possible |
| D1 | `pesanan` semantics: free-text snapshot vs FK to `pesanan` order row | **Free-text string** (order rows are Mini-POS-internal; testimoni authors are customers; snapshot survives order deletion) | FK would need nullable + cascade policy + order-lookup UI |
| D2 | `gambar` storage: JSON array on row vs `testimoni_images` side table (paket_images pattern) | **JSON array** per requirements (≤8 URLs, no per-image metadata, no cross-image queries) | Side table = extra model/migration/resource + gallery-sync logic |
| D3 | Public read API (`GET /api/v1/testimoni`) for the sitemap Testimonials page | **Defer** — v1 admin-only; public page stays static per current sitemap | Adds public controller/index + contract docs to Phase 2 |
| D4 | `acara` free string vs enum + bulk-update whitelist | **Free string v1; ship bulk-delete only** (bulk-update needs a whitelisted field) | Enum = new Enum class + FormRequest `Rule::enum` + filter UI + seeder pools |
| D5 | Grid/card view toggle (galeri/paket have it; pesanan does not) | **Defer** — table-only v1 (testimoni is text-dense; grid adds little) | Adds `testimoni-card-grid` + view-toggle + view-store |
| D6 | Rating/stars field (sitemap mentions "star ratings") | **Out of v1 scope** — unrequested; add later with explicit spec | Adds column + validation + star UI + seeder data |

---

## 10. Scope Boundaries (normative)

- **This turn:** PRD only. Zero implementation code written, modified, or executed.
- **Phase 2 must NOT:** refactor galeri/paket/pesanan blocks; touch unrelated WIP (see §2.1); add public testimoni endpoints (unless D3 approved); add rating/status/featured columns (unless specified); normalize `gambar` into a side table (unless D2 overturned); hardcode colors/fonts/hex in components; edit core `components/ui/*` primitives (re-theme via `src/index.css`); store financial-style computed fields client-side (n/a, but the rule stands); use stock photos in seed/demo content.
- **New folders/files outside §3.1/§5.2 require justification** in the Phase 2 plan.

---

## 11. Implementation Work Plan (Phase 2, after approval)

1. **Backend:** migration → model → requests (store/update) → resource → `Admin/TestimoniController` (index/store/show/update/destroy/bulk) → `api.php` routes → `CloudinaryController::resolveFolder` testimoni branch → `PaketController::destroy` 409-guard extension → factory (id_ID) + seeder + `DatabaseSeeder` registration → `api-collection.md` + `database.md` updates → `php artisan test` + endpoint smoke via Bruno collection.
2. **Frontend:** `admin/testimoni/` skeleton (§3.1) → types/schema/mapper/config → query/mutation hooks (+ upload store) → table/toolbar/action-bar → form + drawers + delete dialog → block orchestrator → page rewrite + placeholder deletion → sidebar nav check → `npm run typecheck && npm run lint && npm run lint:design`.
3. **Data:** run seeder (weighted `paket_id`), verify multi-image upload lands in `catering-nusantara/testimoni`, verify orphan sweep on discard.
4. **Skills to load in Phase 2:** `zod` (schema), `shadcn` (composition), `cloudinary-docs` (+ `cloudinary-react`/`cloudinary-transformations` as needed), `frontend-ui-engineering`/`vercel-react-best-practices` (quality), design pipeline (`catering-nusantara-design` → `hallmark` → `impeccable`) only if new visual surface beyond benchmark parity is introduced.

---

## 12. Acceptance Criteria (traceability)

- [ ] Phase 0 discovery documented (§2) — repo/skill/docs/benchmark evidence with file:line refs.
- [ ] `testimonis` migration approved (R1) and applied; fields exactly per §8 (`nama`, `pesanan`, `acara`, `lokasi` required; `gambar` optional JSON; `paket_id` FK with 409-guarded delete).
- [ ] REST endpoints per §6 with FormRequest validation (§4.3) and pagination envelope.
- [ ] Factory/seeder generate `id_ID` Indonesian data with realistic existing-`paket` relations.
- [ ] Route `/dashboard/testimoni` renders `MasterTestimoniBlock` (router already stubbed; page rewritten).
- [ ] UI lives under `src/components/ui/core/block/admin/testimoni` + page at `src/pages/admin/testimoni-page.tsx`; placeholder block removed.
- [ ] Table/search/bulk mirror Master Pesanan (§3.2); form uses Drawer-mobile/Dialog-desktop + relational paket dropdown + multi-image upload (§3.3).
- [ ] Uploads land in `catering-nusantara/testimoni` as canonical URLs; orphan sweep works.
- [ ] `npm run typecheck && npm run lint && npm run lint:design` green; no core `ui/` edits; no hardcoded tokens.
- [ ] No unrelated refactors; dirty-tree WIP untouched.

---

## 13. Assumptions, Limitations & Residual Risks

1. **Approval risk:** `testimoni` table is unapproved today — if R1 is rejected, Phase 2 cannot start (no fallback preserves the requirements).
2. **`pesanan` ambiguity:** requirements say "string/relation" while also demanding a `paket` FK. This PRD resolves it as free-text + `paket_id` FK (D1). If the intent was an order-row FK, the schema/requests/form all change.
3. **zod dependency:** `zod` is skill-locked but was not found as a direct dependency in `package.json` during discovery — confirm availability at Phase 2 kickoff (`package.json`/`node_modules`); add only if truly missing.
4. **Placeholder import path:** the current page imports `@/components/ui/core/block/testimoni/testimoni-block` (outside `admin/`); the target is `admin/testimoni/`. Deletion of the placeholder must be verified so no dead export remains.
5. **Sidebar nav:** `AppShell` sidebar entry for Testimoni was not verified in this turn (layout dir not deep-read) — Phase 2 must check and add if absent.
6. **Public Testimonials page:** sitemap lists it as static/optional; v1 leaves it static. If stakeholders expect the public page to go live off this table, D3 must be approved and scoped separately.
7. ** Dirty tree:** unrelated uncommitted changes exist — Phase 2 diffs must be isolated to Testimoni paths + the three surgical edits (`api.php`, `CloudinaryController`, paket 409 guard, page rewrite).
8. **Cloudinary folder:** existence/permissions of `catering-nusantara > testimoni` were not live-verified (planning phase, no network calls) — verify in Phase 2 before upload testing.

---

## 14. Suggested Next Steps

1. Review this PRD (`frontend/docs/PRD-Master-Testimoni.md`), especially **§8 (field matrix)** and **§9 (decisions R1, D1–D6)**.
2. Reply with **approval** (optionally with decision overrides, e.g. "approve with D4 enum" or "approve + include D3 public read").
3. On approval, Phase 2 (Implementation) begins with the backend work plan (§11.1) — no code will be written before your explicit go-ahead.

---

## 15. Approval Record (audit turn — backend authorized)

**Approved items:** R1 (create migration) · D1 (`pesanan` free-text) · D2 (`gambar` JSON array) · D4 (`acara` free string, bulk-delete only). **Deferred:** D3 (admin-only v1, no public routes) · D5 (table-only v1). **Out of scope:** D6 (no rating field).

**Audit corrections applied at implementation (deviations from §§4–7 as drafted):**
1. Table is **`testimoni` (singular)**, not `testimonis` — every existing table is singular (`paket`, `galeri`, `pesanan`); model sets `protected $table = 'testimoni'` explicitly.
2. FK uses bare `->constrained('paket')` (matches `create_pesanans_table`), not explicit `->restrictOnDelete()`; 409 protection is enforced at the API layer (`PaketController::destroy` + `bulkDelete`, both extended to `testimoni` dependents).
3. `PaketController::destroy` guard reads `$paket->pesanan()->exists()` (not a `pesanan_count` column); testimoni check added symmetrically via new `Paket::testimoni()` relation.
4. `TestimoniController` **includes `show()`** (unlike Admin GaleriController) so the registered `apiResource` show route resolves; **no `bulkUpdate`** per D4.
5. Cloudinary signature uses a flat `{ "folder": "testimoni" }` key (`Rule::in(['testimoni'])`) → `catering-nusantara/testimoni`, since existing `category`/`kategori_acara` keys are enum-constrained to paket/galeri values.
6. `TestimoniFactory` uses `Faker::create('id_ID')` explicitly (global default is `en_US`); `TestimoniSeeder` weights toward existing best-seller paket and registers last in `DatabaseSeeder`.
7. New `tests/Feature/TestimoniApiTest.php` (11 tests, correct flat-envelope assertions) — first bulk/409-tested resource in the suite.

**Backend files created:** migration `2026_09_13_000001_create_testimoni_table`, `Models/Testimoni`, `Requests/Admin/Testimoni/{Store,Update}TestimoniRequest`, `Resources/TestimoniResource`, `Controllers/Admin/TestimoniController`, `Factories/TestimoniFactory`, `Seeders/TestimoniSeeder`, `tests/Feature/TestimoniApiTest`.
**Backend files modified:** `routes/api.php`, `Models/Paket` (+`testimoni()` relation), `Controllers/PaketController` (destroy + bulkDelete 409), `Controllers/CloudinaryController` (folder branch), `Requests/Cloudinary/CloudinarySignatureRequest` (`folder` key), `Seeders/DatabaseSeeder`, `docs/api-collection.md`, `docs/database.md`.
**Frontend:** untouched (deferred to next phase).

---

## 16. Visibility Round + Full Frontend Implementation (execution turn)

**New requirement:** `visibility` enum (`public` | `private`, default `private`) + radio group in form + table filter + status badge + complete frontend, executed immediately.

**Backend delta (all under prior approvals + new visibility mandate):**
1. `App\Enums\TestimoniVisibilityEnum` (PHP 8 backed string enum) — single source of truth for `Rule::enum`, casts, filter whitelist.
2. Migration `2026_09_13_000002_add_visibility_to_testimoni_table` — plain `string` column, `default('private')`, indexed (deliberately NOT a native PG enum: galeri's native enum required raw-SQL ALTERs on PostgreSQL; strictness comes from `Rule::enum`).
3. `Testimoni` model: `+visibility` fillable, `'visibility' => TestimoniVisibilityEnum::class` cast.
4. Store/Update requests: `'visibility' => ['sometimes', Rule::enum(...)]` — omitted keys fall through to the DB default; explicit invalid values 422.
5. `TestimoniController@index`: `visibility` / `visibility[]` filter via whitelisted `normalizeVisibilityFilter()` (invalid values dropped, never 500); `visibility` added to sortable whitelist; echoed in `meta.filters`.
6. `TestimoniResource`: `'visibility' => $this->visibility?->value ?? 'private'`.
7. Factory/Seeder: `id_ID` faker, weighted `['private','private','public']`.
8. `TestimoniApiTest` +3 tests (default-private, accept/reject, filter incl. invalid-value tolerance) — 14 total.
9. Docs: `api-collection.md` (filter/sort/bullet), `database.md` DBML line.

**Frontend delta (`src/components/ui/core/block/admin/testimoni/`, 16 files):** types (incl. `TestimoniVisibility`), zod schema (mirrors FormRequests; `visibility` enum, `gambar` array max 8), visibility-options config, form-mapper, `use-testimoni-query` (`visibility[]` serialization), `use-testimoni-mutations` (CRUD + bulk-delete + fixed-folder submit-phase uploads + orphan sweep + toasts/sfx), `testimoni-table` (sortable incl. visibility, badge, photo count, preview modal), `testimoni-status-badge` (cva: emerald/Eye public vs amber/EyeOff private), `testimoni-toolbar` (SearchBar + visibility MultiSelectFilter + clear + Tambah), `testimoni-table-action-bar` (delete-only), delete-dialog, `testimoni-form` (pesanan-pattern paket combobox + visibility RadioGroup + ImagesUpload + paket summary aside), form-actions, create/update drawers (discard guard + orphan sweep), `master-testimoni-block` orchestrator, `store/testimoni-upload-store`.
**Integration:** page rewritten to `MasterTestimoniBlock`, placeholder `block/testimoni/` tree deleted, sidebar `Master Testimoni` nav added (`app-shared.tsx` + `Message01Icon`), `CLOUDINARY_TESTIMONI_FOLDER` export.
**Verification:** `tsc --noEmit` clean, `eslint` clean on all touched files, `impeccable detect` → `[]`. PHP checks skipped (no runtime in this environment).
