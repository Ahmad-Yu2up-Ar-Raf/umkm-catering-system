# PLANNING_MASTER_PAKET_REPORT.md — Master Data Management "Paket" (Phase 1)

> **Phase:** 1 (Planning & Deep Research) — no production code written.
> **Scope:** Hidden admin MDM CRUD for `paket` under `/dashboard/paket`.
> **Date:** 2026-08-20
> **Author:** Senior Full-Stack Engineer (AI agent)

---

## 1. Executive Summary

Catering Nusantara needs a hidden, admin-only "Master Paket" workspace: full CRUD over the `paket` table (+ its `paket_images` gallery) served by the Laravel backend at `/api/v1/admin/paket`. The deliverable is a composed feature block living at `frontend/src/components/ui/core/block/admin/paket/` (the page `src/pages/admin/master-paket-page.tsx` already imports `master-paket-block`, which is currently a 12-line header stub).

The feature ships:

- **Admin list** — server-side pagination (page + perPage), real-time search, dropdown filters for the two enum columns (`kategori_paket`, `kategori_acara`), and a **Table ⇄ Card-grid** view toggle.
- **Create/Update** — responsive shells: bottom-sheet `Drawer` (vaul) on mobile, full-height side `Sheet` on desktop; one shared TanStack Form (`useAppForm`) for both.
- **Zod validation** on every submit/change/blur phase (existing `useAppForm` global behavior).
- **Cloudinary image pipeline** — a primary thumbnail + multi-image gallery, direct-to-Cloudinary upload (server-signed), old-image cleanup on update/delete.
- **Delete** — confirmation `Dialog` before the `DELETE` mutation.

### Key Phase-1 findings (read before planning anything else)

1. **The form stack is TanStack Form, not React Hook Form.** The requirement's "predefined custom wrapper components for React Hook Form" maps to the repo's actual convention: `useAppForm` at `frontend/src/hooks/use-form.ts` wraps TanStack `createFormHook` with registered field components (`Input`, `TextArea`, `DateInput`, `CheckboxGroup`). This is reinforced by `frontend/AGENTS.md` §4 and `design-system/pages/admin.md`: *"do NOT use the shadcn `form` wrapper/react-hook-form/zod stack."* **Decision:** use `useAppForm` + the existing custom field wrappers; do **not** introduce react-hook-form. Zod IS used — `zod@4.4.3` is installed and passed directly to TanStack `validators` (see `login-schema.ts`, `order-schema.ts`).
2. **Missing form primitives.** No `FormSelect`, `FormImageUpload`, `FormImagesUpload`, single `FormCheckbox`, or array/tag input exist. They must be added as new custom-UI fragments (benchmarked against Suasana's `form-select.tsx` / `form-image-upload.tsx` / `form-images-upload.tsx`).
3. **Backend persists `paket` but NOT `paket_images`.** `PaketController@store/update` only `create()`/`update()` the request payload and never writes the `paket_images` rows; `PaketResource` exposes `images` but it is always empty on writes. Phase 2 must extend `store/update/destroy` to sync image rows and delete Cloudinary assets. See §7.
4. **The current `use-master-paket-query.ts` is a catalog-style `useInfiniteQuery`** (copied from the public `/paket` list). The admin list needs a **server-paginated** `useQuery` (`page`, `perPage`, search, filters) instead. `types/pagination-type.ts` (`Meta`) already matches the backend's `respondWithPagination` envelope.
5. **No alert-dialog / row-actions / data-table-pagination fragments exist** locally. The klikantri benchmark uses `fragments/custom/...` for `DeleteDialog`, `RowActions`, `DataTablePagination` — these must be created (planned as reusable fragments, since `/dashboard/galeri` and `/dashboard/pesanan` will reuse them).
6. **Design gate applies.** Every surfaced file must pass `npm run lint:design` (impeccable detect): semantic tokens only, Space Grotesk/Fraunces/Instrument Serif, `MediaItem` (@unpic) as the only image render path, no card-in-card, no purple gradients/bounce easing, ≥44px touch targets, 375/768/1024/1440 responsive.

---

## 2. System Architecture & Data Flow

```
┌────────────────────────── frontend (React + Vite) ──────────────────────────┐
│  AppShell (sidebar)                                                        │
│   └── MasterPaketPage → MasterPaketBlock                                    │
│        ├── PaketToolbar  (search + 2 enum filters + view toggle + add btn)  │
│        ├── usePaketQuery (React Query, page/perPage/search/filters)         │
│        │   └── GET /api/v1/admin/paket  (Bearer token via ky, client.ts)    │
│        ├── paket-table  OR  paket-card-grid  (toggle)                       │
│        ├── DataTablePagination (page controls from meta.pagination)         │
│        ├── CreatePaketDrawer / UpdatePaketDrawer                            │
│        │   └── PaketForm (useAppForm + Zod)                                │
│        │        └── FormImageUpload(thumbnail) + FormImagesUpload(gallery)  │
│        │            └── direct upload → https://api.cloudinary.com/.../upload  │
│        │                (signature from POST /admin/cloudinary/signature)   │
│        └── PaketDeleteDialog → DELETE /api/v1/admin/paket/{id}              │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                 │ REST (JSON)
┌───────────────────────────────▼─────────────────────────────────────────────┐
│  Laravel backend :8000/api/v1                                              │
│   ├── GET/POST /admin/paket, PUT/DELETE /admin/paket/{id}  (auth:sanctum)  │
│   │   → PaketController → PaketResource → paket + paket_images rows        │
│   ├── POST /admin/cloudinary/signature   (NEW — signed upload params)       │
│   └── (storage cleanup on update/destroy via Cloudinary SDK)                │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                        ┌────────▼────────┐         ┌────────────────────┐
                        │ Neon PostgreSQL  │         │ Cloudinary         │
                        │ paket, paket_…  │         │ /catering/paket/…  │
                        └─────────────────┘         └────────────────────┘
```

**Flow rules (non-negotiable, from repo docs/AGENTS):**

- Server data is fetched through **TanStack Query** via the Ky instance (`src/api/client.ts`) — never zustand, never raw `fetch`.
- Auth is the Sanctum Bearer token auto-injected by `client.ts`; a 401 logs out and redirects to `/login`.
- `total_harga` / `nomor_struk` server-computed rules are unrelated here (paket has none) but `harga_per_porsi` semantic holds: store the per-portion quotient (Tumpeng Mini: 25000, min_order 10).
- The API contract lives in `backend/docs/api-collection.md` + `routes/api.php`. New endpoints must be added there and the OpenAPI/Bruno regenerated (see §7).

---

## 3. Directory & File Tree

### 3.1 Frontend — `frontend/src/`

```
src/
├── components/
│   ├── ui/
│   │   ├── fragments/
│   │   │   ├── custom-ui/                        # ★ NEW reusable fragments (pattern: Suasana)
│   │   │   │   ├── form/
│   │   │   │   │   ├── form-select.tsx           # NEW — shadcn Select wrapper (Suasana form-select)
│   │   │   │   │   ├── form-checkbox.tsx         # NEW — single boolean Checkbox (is_best_seller)
│   │   │   │   │   ├── form-image-upload.tsx     # NEW — single preview upload (thumbnail)
│   │   │   │   │   ├── form-images-upload.tsx    # NEW — multi-card gallery upload
│   │   │   │   │   └── form-tag-input.tsx        # NEW — add/remove chips for menu/fasilitas arrays (see §6 alt)
│   │   │   │   ├── table/
│   │   │   │   │   ├── row-actions.tsx           # NEW — edit/delete dropdown (Klikantri RowActions)
│   │   │   │   │   └── data-table-pagination.tsx # NEW — page/perPage controls (Klikantri pagination)
│   │   │   │   └── dialog/
│   │   │   │       └── delete-dialog.tsx         # NEW — "Are you sure?" Dialog + pending state
│   │   │   └── (existing: shadcn-ui/* — NEVER edit core files)
│   │   └── core/block/admin/paket/               # ★ FEATURE BLOCK (this feature)
│   │       ├── master-paket-block.tsx            # MODIFY — wire toolbar/list/toggle/dialogs (currently stub)
│   │       ├── components/
│   │       │   ├── paket-toolbar.tsx             # NEW — search + selects + view toggle + add button
│   │       │   ├── paket-view-toggle.tsx         # NEW — Table ⇄ Grid pill toggle
│   │       │   ├── paket-table.tsx               # NEW — Table w/ Avatar+name col 1, badge cells, RowActions
│   │       │   ├── paket-card-grid.tsx           # NEW — admin card grid (compact, non-storefront)
│   │       │   ├── create-paket-drawer.tsx       # NEW — responsive Sheet/Drawer shell (create)
│   │       │   ├── update-paket-drawer.tsx       # NEW — responsive Sheet/Drawer shell (update, seeded)
│   │       │   ├── paket-form.tsx                # NEW — shared form, all fields + uploads
│   │       │   └── paket-delete-dialog.tsx       # NEW — thin wrapper over delete-dialog with paket copy
│   │       ├── hooks/
│   │       │   ├── use-paket-query.ts            # MODIFY/RENAME from use-master-paket-query.ts → paginated list
│   │       │   └── use-paket-mutations.ts        # NEW — create/update/delete useMutation (Klikantri pattern)
│   │       ├── types/
│   │       │   └── paket-types.ts                # NEW — AdminPaket + list envelope (re-use block/paket types)
│   │       ├── validations/
│   │       │   └── paket-schema.ts               # NEW — Zod factory create/update (Suasana destination-validations)
│   │       ├── config/
│   │       │   └── paket-enum-options.ts         # NEW — dropdown option lists for both enums
│   │       └── utils/
│   │           ├── paket-form-mapper.ts          # NEW — form values ↔ API payload (+ image diff)
│   │           └── paket-image-utils.ts          # NEW — File-vs-URL classification, public-id extraction
├── hooks/
│   └── use-form.ts                               # MODIFY — register the 4 NEW field components
├── store/
│   └── paket-admin-view-store.ts                 # NEW — persisted view-mode zustand (pattern: paket-layout-store)
├── services/                                     # (query hooks may also live here; block-local hooks are the
│                                                 #  established pattern → keep hooks in the block, see §5)
└── types/
    └── pagination-type.ts                        # EXISTS — Meta envelope (no change)
```

### 3.2 Backend — `backend/`

```
backend/
├── routes/api.php                                # MODIFY — add admin cloudinary routes
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── PaketController.php               # MODIFY — persist/sync images on store/update/destroy
│   │   │   └── CloudinaryController.php          # NEW — signature (POST) / bulk-delete (DELETE)
│   │   ├── Requests/Paket/
│   │   │   ├── PaketStoreRequest.php             # MODIFY — accept `images` (array of urls)
│   │   │   └── PaketUpdateRequest.php            # MODIFY — accept `images`
│   │   ├── Requests/Cloudinary/                  # NEW — CloudinarySignatureRequest, CloudinaryDeleteRequest
│   │   └── Resources/PaketResource.php           # MODIFY — expose images incl. `paket_images.id` (for diffing)
│   ├── Models/Paket.php                          # NO structural change (images() relation exists)
│   ├── Services/CloudinaryService.php            # NEW — sign, upload-verify, destroy, destroyMany, extractPublicId
│   └── Enums/…                                   # EXISTS — PaketKategoriEnum, KategoriAcaraEnum
├── database/migrations/                          # EXISTS — paket + paket_images tables (cascade-on-delete FK) 
└── docs/api-collection.md                        # MODIFY — document new cloudinary endpoints + images field
```

---

## 4. State Management & UI Behavior

### 4.1 server-vs-ui state split (rule)

| Concern | Home | Notes |
|---|---|---|
| Paket list, pagination meta | **React Query** (`useQuery`, key `["admin","paket",search,kategoriPaket,kategoriAcara,page,perPage]`) | `staleTime ~5s`, `placeholderData: keepPreviousData` (dim old rows while refetching — matches catalog pattern) |
| Search text (input value) | local `useState` + React 19 `useDeferredValue` | deferred value drives the query key → real-time refetch w/o extra deps; no debounce hook needed |
| Filters + page + perPage | local `useState` in block | on filter/page change, `setPage(1)` first (Klikantri convention) |
| View mode (table/grid) | **zustand + persist** (`paket-admin-view-store`) | mirrors `paket-layout-store.ts` (localStorage `paket-admin-view-mode`); survives refresh |
| Drawer open/close, editing paket, delete target | local state in block | transient UI (per AGENTS) |

### 4.2 Table ⇄ Grid toggle

- `PaketViewToggle`: pill group (Framer `layoutId` sliding background — copy `CatalogLayoutToggle` easing `[0.16,1,0.3,1]`), icons `GridSquare01Icon` (table → "Tabel") and `DashboardSquare01Icon`/`Square01Icon` (grid → "Grid") from @hugeicons. Reads/writes `paket-admin-view-store`.
- Table view: shadcn `Table`; col 1 = `Avatar` (containing `MediaItem` `layout="constrained"` w/ square crop) + `nama_paket` + `kategori_paket` Badge; then harga, min_order, best-seller badge, pesanan_count, created_at; last column sticky `RowActions`.
- Grid view: card grid (2/3/4 cols, responsive), each card: thumbnail (`MediaItem`), name, badges, price, min-order, edit/delete icon buttons. Reuse `formatCurrency` helper (block/paket has one? — if not, add tiny formatter in `utils/`, see §7 notes).

### 4.3 Responsive Drawer/Sheet

- `useIsMobile()` (`src/hooks/use-mobile.ts`, 768px) switches the shell:
  - **Mobile** → vaul `Drawer` (bottom-up): `DrawerContent` flex column, scrollable body, sticky footer with Batalkan/Simpan, drag-to-close.
  - **Desktop** → radix `Sheet`: side panel full height, `SheetContent` `overflow-y-auto` body + sticky `SheetFooter`.
- Both shells host the **same** `PaketForm` (shared component; scroll ownership stays in the shell — the pattern already proven by `OrderCalculationDialog`/`OrderForm` in `block/detail`).
- `CreatePaketDrawer`/`UpdatePaketDrawer` accept controlled `open`/`onOpenChange` (block owns state); reset form on close.

### 4.4 Server-side pagination

- `usePaketQuery` returns `{ data: Paket[], pagination }` (unwrapped from `respondWithPagination` envelope `meta.pagination`: total, currentPage, perPage, lastPage, hasMore).
- `DataTablePagination` fragment: "Prev/Next" buttons + perPage `Select` (10/25/50/100) + total count summary. Disabled while `isFetching`; `position="bottom"` variant (Klikantri). **No page numbers beyond prev/next is fine at UMKM scale** — keeps the component tiny.

### 4.5 Delete confirmation

- Row action → sets `deleteTarget` + opens `PaketDeleteDialog` (shadcn `Dialog` — no AlertDialog primitive exists).
- Copy: title "Hapus paket {nama_paket}?", body "Are you sure you want to delete this package? This action cannot be undone. Existing orders referencing it will be orphaned." (see §7 risk), destructive confirm button w/ `Spinner` while `isPending`; cancel/close clears target.
- Confirm → `useDeletePaketMutation.mutate(id)` → onSuccess: close dialog, clear target, invalidate `["admin","paket"]` (and public `["paket",...]` keys so the storefront reflects the change).

---

## 5. Form & Cloudinary Strategy

### 5.1 Form scaffold

`paket-form.tsx` uses `useAppForm({ validators: { onSubmit: schema }, defaultValues })`; `useAppForm` automatically reuses the schema for `onChange`/`onBlur` (ghost-reset fix already built in) and injects the global invalid toast + first-error focus. Fields:

| Form field | Component | Mapping (→ payload) |
|---|---|---|
| nama_paket | `field.Input` | string |
| kategori_paket | `field.Select` (NEW) | enum string — required |
| kategori_acara | `field.Select` (NEW, optional w/ "—" placeholder) | enum string \| null |
| harga_per_porsi | `field.Input` type number/`inputMode="numeric"` | number |
| min_order | `field.Input` number | number (default 1) |
| kapasitas_produksi | `field.Input` number (optional) | number \| null |
| is_best_seller | `field.Checkbox` (NEW) | boolean |
| menu_utama | `field.TagInput` (NEW) or `field.TextArea` (1/line) — see 5.3 | string[] (min 1) |
| menu_tambahan | same | string[] \| null |
| fasilitas_termasuk | same | string[] \| null |
| jenis_kemasan | `field.Input` (optional) | string \| null |
| catatan_alergen | `field.TextArea` (optional) | string \| null |
| deskripsi | `field.TextArea` (optional) | string \| null |
| thumbnail | `field.ImageUpload` (NEW) | `File \| string(url) \| null` |
| images | `field.ImagesUpload` (NEW) | `Array<File \| string(url)>` |

Schema factory `createPaketSchema(extra?)` / `updatePaketSchema` in `validations/paket-schema.ts`:

```ts
// mirrors Suasana destination-validations discipline
const fileOrUrl = z.union([z.string().url("URL tidak valid"), z.instanceof(File)])
const fileOrUrlNullable = fileOrUrl.nullable().optional()

const base = z.object({
  nama_paket: z.string().trim().min(1, "Nama paket wajib diisi"),
  kategori_paket: z.enum(["Nasi Box","Prasmanan","Snack","Tumpeng"]),
  kategori_acara: z.enum(["Pernikahan","Kantor","Ulang Tahun","Arisan","Umum"]).nullable().optional(),
  harga_per_porsi: z.number({message:"Harga wajib diisi"}).nonnegative("Tidak boleh minus"),
  min_order: z.number().int().min(1).optional(),
  kapasitas_produksi: z.number().int().min(1).nullable().optional(),
  menu_utama: z.array(z.string().trim()).min(1, "Minimal 1 menu utama"),
  menu_tambahan: z.array(z.string().trim()).nullable().optional(),
  fasilitas_termasuk: z.array(z.string().trim()).nullable().optional(),
  jenis_kemasan: z.string().max(255).nullable().optional(),
  catatan_alergen: z.string().nullable().optional(),
  deskripsi: z.string().nullable().optional(),
  is_best_seller: z.boolean().optional(),
  thumbnail: fileOrUrlNullable,
  images: z.array(fileOrUrl).max(8).optional(),
})
export const createPaketSchema = base
export const updatePaketSchema = base.partial().extend({ id: z.number() })
```

Server-side mirroring stays authoritative: Laravel `PaketStoreRequest`/`PaketUpdateRequest` re-validate (enum Rule, arrays, numeric) — frontend validation is UX, never trust-boundary.

### 5.2 Cloudinary pipeline (direct, signed, categorized)

Environment: `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` in `backend/.env`; `VITE_CLOUDINARY_CLOUD_NAME` (or returned cloudName) in `frontend/.env`.

1. **Upload (client → Cloudinary).** New backend endpoint `POST /api/v1/admin/cloudinary/signature` (auth:sanctum) generates a signed upload bundle: `[{signature, timestamp, apiKey, cloudName, folder}]` where `folder = "catering/paket/{kategori_paket}"` (URL-safe slug). The frontend `useCloudinaryUpload` hook (ported from Suasana) POSTs each `File` as FormData (file, api_key, timestamp, signature, folder) via XHR to `https://api.cloudinary.com/v1_1/{cloud}/image/upload` with progress events → returns `secure_url` + `public_id`.
   - Continuous transforms per repo AGENTS: **store canonical full URLs** (`secure_url`, no `w_`/`f_auto` baked in). Render only via `MediaItem`/@unpic.
2. **Submit order.** After every `File` resolves to a URL, the form's `onSubmit` builds the API payload with plain URL strings (`thumbnail`, `images[]`), then fires the create/update mutation. Uploads are **not** tracked in server state; the API sees URLs only.
3. **Update diffing (`paket-form-mapper.ts`).**
   - Snapshot existing `images` URLs + current `thumbnail` from the paket being edited.
   - `kept = existing.filter(u => retained set includes u)` (client marks deletions by removing a card; existing URLs stay strings, new picks are `File`).
   - **If no `File` remains and retained set ⊇ existing** → no image change → send payload without touching storage; server keeps rows untouched (bypass path from the requirement).
   - **If change:** new `File`s → upload first; send final `thumbnail` + `images` URL arrays. Server (authoritative) diffs DB against the new array: deletes removed rows and destroys their Cloudinary assets; inserts new rows; updates `paket.thumbnail`.
   - Failure safety: if the paket mutation fails after uploads succeeded, best-effort cleanup of just-uploaded `public_id`s (fire-and-forget DELETE to the delete endpoint).
4. **Delete.** `destroy` cascade deletes `paket_images` rows (FK `cascadeOnDelete` already set) **and** destroys the paket's thumbnail + image `public_id`s via the Cloudinary SDK.

### 5.3 Menu / fasilitas arrays — pragmatic pick

Recommend the **tag/chip input** (`FormTagInput`): text input + "Tambah" + removable pills; form value is `string[]`, zero parsing on submit, better drawer UX than a textarea. `FormTextArea`-per-line is the 1-file fallback if tag input is deemed too much scope — the schema/mapper is identical (`split("\n")`).

### 5.4 Image rendering rule

All thumbnails/gallery previews render via `MediaItem` (`layout="constrained"` for square thumbs, `layout="fullWidth"` for any full-bleed surfaces), `alt` required, `sizes` set per surface. Never raw `<img>` or URL string query parameters with baked transformations.

---

## 6. Backend API Contract Changes (§7 of the plan — exact deltas)

Reference: `backend/routes/api.php`, `backend/app/Http/Controllers/PaketController.php`, `backend/docs/api-collection.md`.

### Existing endpoints (already routed, auth:sanctum) — used as-is by the frontend

| Method | Path | Status |
|---|---|---|
| GET | `/api/v1/admin/paket?search&kategori_paket&kategori_acara&page&perPage` | ✅ works (index filters + respondWithPagination) |
| POST | `/api/v1/admin/paket` | ⚠️ works, **missing images persistence** |
| GET | `/api/v1/admin/paket/{id}` | ✅ works |
| PUT | `/api/v1/admin/paket/{id}` | ⚠️ works, **missing image sync** |
| DELETE | `/api/v1/admin/paket/{id}` | ⚠️ works, **missing Cloudinary cleanup** |

### New endpoints

| Method | Path | Purpose | Request body |
|---|---|---|---|
| POST | `/api/v1/admin/cloudinary/signature` | Signed upload params for direct client upload | `{ category?: string }` → `{ signature, timestamp, apiKey, cloudName, folder }` |
| DELETE | `/api/v1/admin/cloudinary` | Bulk storage cleanup (rollback / orphan sweep; optional if server owns destruction on update) | `{ urls: string[] }` |

### Form-Request changes

- `PaketStoreRequest` / `PaketUpdateRequest`: add `images => ['sometimes','array','max:8']` + `images.* => ['required','url','max:2048']`; `thumbnail` stays `string|nullable` URL.
- New `CloudinarySignatureRequest` (`category` optional, enum-scoped) and `CloudinaryDeleteRequest` (`urls` array of valid URLs).

### Controller changes (`PaketService` recommended, or inline for UMKM scope)

- `store($request)` → create paket; create `PaketImage` rows for each `images` URL (and for `thumbnail` when it is not already in `images`); set `paket.thumbnail`.
- `update($request, $paket)` → diff DB `images` vs new `images` list:
  - `removed = existingUrls - newUrls` → `PaketImage::whereIn('image_url', removed)->delete()` + `CloudinaryService::destroyMany(removed)`.
  - `added = newUrls - existingUrls` → insert `PaketImage` rows.
  - update `thumbnail` (if changed, optionally destroy the old thumbnail's public_id when it is no longer referenced by any paket/paket_images row).
- `destroy($paket)` → collect `thumbnail` + all `images` URLs → `CloudinaryService::destroyMany(...)` before/after `$paket->delete()` (rows cascade).
- `CloudinaryService` (uses `cloudinary-labs/cloudinary-laravel` or direct REST with api_key/api_secret): `sign(params)`, `destroy(publicId)`, `destroyMany(publicIds)`, `extractPublicIdFromUrl(url)` (regex from Suasana).

### Docs to update

- `backend/docs/api-collection.md` — add the 2 endpoints + `images` field on paquet payloads; regenerate OpenAPI/Bruno per `backend/docs/workflow.md`.

### Deletion risk note

`pesanan.paket_id` references `paket` (no FK cascade defined on pesanan). Deleting a paket that has orders orphans those orders. **Flow with the admin:** either (a) block delete when `pesanan_count > 0` (recommended, cheapest — inject `withCount('pesanan')` already present), or (b) soft-delete. Recommended: **block + toast** in Phase 2; flag for client confirmation.

---

## 7. Actionable Todo List → Phase 2 (Build)

Milestone M0 — Backend contract first (frontend can't ship without it):

1. Add `CLOUDINARY_*` env vars to `backend/.env` + install `cloudinary-labs/cloudinary-laravel`.
2. Create `CloudinaryService` (sign, destroy, destroyMany, extractPublicIdFromUrl).
3. Add `CloudinaryController` + form requests + routes (`POST /admin/cloudinary/signature`, `DELETE /admin/cloudinary`).
4. Extend `PaketStoreRequest`/`PaketUpdateRequest` with `images` array-of-URLs validation.
5. Extend `PaketController::store/update/destroy` to persist/sync/destroy image rows + assets.
6. Update `PaketResource` to include `paket_images.id` (for client-side diff stability) alongside URLs.
7. Update `backend/docs/api-collection.md` + regenerate OpenAPI + Bruno requests.

Milestone M1 — Form/upload fragments (reusable):

8. Port `use-file-upload`-style state into `hooks/` or keep inside fragments (`useFileUpload` pattern from Suasana).
9. Port `useCloudinaryUpload` hook (XHR progress, signed params) adapted to the Ky-less direct upload (plain XHR to cloudinary).
10. Create `form-select.tsx`, `form-checkbox.tsx`, `form-tag-input.tsx`, `form-image-upload.tsx`, `form-images-upload.tsx` in `fragments/custom-ui/form/`; register all in `src/hooks/use-form.ts`.
11. Create `delete-dialog.tsx`, `row-actions.tsx`, `data-table-pagination.tsx` in `fragments/custom-ui/{dialog,table}/`.

Milestone M2 — Block data layer:

12. Write `types/paket-types.ts` (AdminPaket from PaketResource wire shape + envelope reuse).
13. Write `config/paket-enum-options.ts` (options for both enums — values from backend enums).
14. Rewrite `hooks/use-paket-query.ts` (paginated `useQuery`), delete old `use-master-paket-query.ts`.
15. Write `hooks/use-paket-mutations.ts` (create/update/delete `useMutation` + `toast.promise` + invalidations incl. public `["paket"]`).
16. Write `validations/paket-schema.ts` (create/update factories).
17. Write `utils/paket-image-utils.ts` + `utils/paket-form-mapper.ts` (diff logic, payload mapping).
18. Write `store/paket-admin-view-store.ts`.

Milestone M3 — UI composition:

19. Build `paket-view-toggle.tsx` + wire into `paket-toolbar.tsx` (search with `useDeferredValue`, filter selects, add button).
20. Build `paket-table.tsx` (Avatar+MediaItem col1, badges, RowActions) and `paket-card-grid.tsx`.
21. Build `paket-form.tsx` (all fields per §5.1).
22. Build `create-paket-drawer.tsx` + `update-paket-drawer.tsx` (responsive Sheet/Drawer shells, seeded defaults, success-close/reset).
23. Build `paket-delete-dialog.tsx` + block wiring into `master-paket-block.tsx` (header, toolbar, list, pagination, dialogs, loading/empty/error states).
24. Add `formatCurrency` util if missing (block/paket catalog may expose one to reuse).

Milestone M4 — Compliance & QA:

25. `npm run typecheck` && `npm run lint` && `npm run lint:design` (impeccable detect must stay clean).
26. Load project skills per pre-flight gate before Phase 2 code: `catering-nusantara-design`, `shadcn-architecture`, `motion-orchestration`, `impeccable`, `design-preflight`; read `docs/design.md` + `design-system/pages/admin.md` (already used here).
27. Verify responsive 375/768/1024/1440 + reduced-motion; touch targets ≥44px; semantic tokens only; `MediaItem` for all images.
28. Verify with agent-browser/playwright once available: create → appears in list; update with no image change bypasses upload; replace images deletes old; delete blocked when orders exist / confirm dialog.

---

## 8. Open Decisions for the Client/Team (Phase 1 gate)

1. **Form stack confirmation** — proceed with TanStack Form `useAppForm` (repo convention), not react-hook-form? (This report assumes yes; react-hook-form is explicitly banned by `frontend/AGENTS.md` and `design-system/pages/admin.md`.)
2. **Thumbnail semantics** — is the thumbnail always the *first* gallery image (backend derives it) or an *independent* upload the admin pins explicitly? Plan assumes independent single-file field (requirement says "multiple images and a primary thumbnail").
3. **Delete-with-orders policy** — block-and-notify (recommended) vs cascade vs soft-delete.
4. **Cloudinary signing** — signed signature endpoint (benchmark-proven, planned) vs unsigned upload preset (simpler; folder lock-in via preset). 
5. **Menu/fasilitas input** — tag/chip input (planned) vs textarea-per-line (1-file fallback).

---

*End of Phase 1 report. No production code was written.*
