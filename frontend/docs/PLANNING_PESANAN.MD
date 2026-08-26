# PRD & Technical Execution Plan — Master Data Pesanan (Admin Order Management)

> **Project:** Catering Nusantara · **Module:** Admin CMS / Mini POS — `Pesanan`
> **Phase:** Planning (PRD) — Phase 2+ implementation gated behind explicit approval
> **Scope owner:** Owner-exclusive admin dashboard
> **References:** `docs/architecture.md`, `frontend/docs/design.md`, `backend/docs/api-collection.md`, `docs/feature-order-calculation-plan.md`

---

## 1. Executive Summary & Feature Scope

### 1.1 Objective

Deliver the **Master Data Pesanan** admin module: a table-only management surface where the
owner creates orders manually (walk-in / phone orders = Mini POS flow), monitors order
status, edits mutable fields (`status_pesanan`, `catatan`), deletes orders, and prints a
branded invoice PDF per order.

The module mirrors the proven `master-paket-block` architecture (toolbar → table →
pagination → drawers/dialogs) and reuses the Cashier POS benchmark
(`order-calculation-dialog.tsx`) for the split-pane create/update experience.

### 1.2 Hard Constraints (from root AGENTS.md §3–§5)

| Constraint | Enforcement |
| :--- | :--- |
| **Table-only display** | No card/grid view toggle for Pesanan. Single `DataTable`. |
| **No image upload** | No Cloudinary hooks, no `FormImageUpload` anywhere in this module. |
| **Server-side money** | `total_harga`, `nomor_struk`, `harga_paket_satuan` are NEVER accepted from the client. Frontend totals are **UX-only previews**; Laravel recomputes on store. |
| **Price snapshot** | `harga_paket_satuan` is copied from `paket.harga_per_porsi` at creation time by `PesananService.createOrder()` — never re-looked-up on read. |
| **Struk format** | `STR-YYYYMMDD-XXXX` generated server-side by `StrukService`. |
| **Role access** | All `/admin/*` routes behind Sanctum auth (`auth:sanctum`) — owner-only dashboard. |
| **Sitemap compliance** | Route `/admin/master-pesanan` already declared in `frontend/src/router/index.tsx`; page block is currently a stub (`master-pesanan-page.tsx`). |

### 1.3 Success Criteria

1. Owner can list, search, multi-filter by status, paginate, and sort orders server-side.
2. Owner can create an order through a split-pane POS drawer with live (preview-only)
   total calculation that matches the server formula `(jumlah_paket × harga_paket_satuan) + biaya_tambahan`.
3. Owner can change `status_pesanan` / `catatan` post-creation; financial fields are read-only.
4. Owner can delete an order after explicit confirmation.
5. Owner can open a live PDF invoice preview (blob URL) and download/print it, styled with
   Catering Nusantara brand tokens via `pdfcn`.
6. `npm run typecheck && npm run lint && npm run lint:design` all pass.

---

## 2. Complete Data Architecture & Schemas

### 2.1 Database Schema (existing — `2026_08_01_040805_create_pesanans_table.php`)

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | bigint PK | |
| `nomor_struk` | string unique | `STR-YYYYMMDD-XXXX`, server-generated (`StrukService`) |
| `nama_pemesan` | string(255) | |
| `no_telepon` | string(20) | |
| `paket_id` | FK → `paket.id` | cascade behavior per migration |
| `jumlah_paket` | integer | respects `paket.min_order` and `kapasitas_produksi` (validated in `HargaService`) |
| `harga_paket_satuan` | decimal(12,2) | **snapshot** of `paket.harga_per_porsi` at creation |
| `detail_tambahan` | json nullable | array of strings, each ≤ 255 chars |
| `biaya_tambahan` | decimal(12,2) default 0 | flat additional cost |
| `catatan` | text nullable | mutable post-creation |
| `total_harga` | decimal(12,2) | server-computed: `(jumlah_paket * harga_paket_satuan) + biaya_tambahan` |
| `status_pesanan` | enum | `pending` \| `confirmed` \| `completed` \| `cancelled` (cast `StatusPesananEnum`) |
| timestamps | datetime | |

### 2.2 Backend API Endpoints Breakdown

Base: `${VITE_API_URL}` (e.g. `http://host/api/v1/`), all authenticated via `Authorization: Bearer <token>` (Ky hook in `src/api/client.ts`).

#### Existing (verified against `routes/api.php` + `PesananController.php`)

| Method | Endpoint | Controller@method | Notes |
| :--- | :--- | :--- | :--- |
| GET | `admin/pesanan` | `index` | Paginated (`page`, `perPage` default 15). Accepts `status_pesanan` (single value today). Sorted `latest()`. Wraps `respondWithPagination`. |
| POST | `admin/pesanan` | `store` | Body validated by `PesananStoreRequest`; `PesananService::createOrder` snapshots price, computes total, generates struk. Returns `201`. |
| GET | `admin/pesanan/{pesanan}` | `show` | Single `PesananResource` incl. loaded `paket`. |
| PUT | `admin/pesanan/{pesanan}` | `update` | `PesananUpdateRequest`: **only** `status_pesanan` + `catatan`. Financials immutable. |
| GET | `admin/pesanan/{pesanan}/struk` | `struk` | Flat receipt payload (see §2.4.4). |

#### Gaps requiring backend work in Phase 2

| # | Gap | Why needed | Proposed fix |
| :--- | :--- | :--- | :--- |
| B-1 | **`GET admin/paket/search` missing** | The POS drawer's paket combobox needs a lightweight searchable list (`id`, `nama_paket`, `min_order`, `harga_per_porsi`, `kapasitas_produksi`) — full `PaketResource` payloads (menus arrays) are wasteful for a selector. | New `PaketController@search` + route **before** `Route::apiResource('paket', …)` so `/paket/search` isn't swallowed by `{paket}` binding. |
| B-2 | **index lacks `search`, `sort_by`, `sort_dir`, multi-status** | Toolbar spec requires debounced text search + sortable columns + multi-select status filter (`whereIn`). Today: single `status` equality + fixed `latest()`. | Extend `PesananController@index` (whitelist sort columns; `whereIn` statuses; `LIKE` across `nomor_struk`, `nama_pemesan`, `no_telepon`). |
| B-3 | **DELETE route missing** | Spec requires delete confirmation flow. `apiResource` was likely registered without `destroy` or the method is absent. | Add `destroy()` + `Route::delete('admin/pesanan/{pesanan}')`. |

##### B-1 — `PaketController@search` (new)

```php
/**
 * Lightweight package lookup for the POS combobox.
 * Registered BEFORE Route::apiResource('paket', ...) in routes/api.php.
 */
public function search(Request $request)
{
    $q = trim((string) $request->query('q', ''));

    $items = Paket::query()
        ->when($q !== '', function ($query) use ($q) {
            $query->where('nama_paket', 'like', "%{$q}%");
        })
        ->orderBy('nama_paket')
        ->limit(20)
        ->get(['id', 'nama_paket', 'min_order', 'harga_per_porsi', 'kapasitas_produksi']);

    return response()->json([
        'status' => true,
        'message' => 'Data retrieved successfully',
        'data' => $items,
    ]);
}
```

Route registration order (`routes/api.php`, admin group):

```php
// MUST precede Route::apiResource('paket', ...) so '/paket/search'
// resolves as a literal path, not the '{paket}' wildcard.
Route::get('paket/search', [PaketController::class, 'search'])
    ->name('admin.paket.search');

Route::apiResource('paket', PaketController::class)->names('admin.paket');

Route::delete('pesanan/{pesanan}', [PesananController::class, 'destroy'])
    ->name('admin.pesanan.destroy');
```

##### B-2 — Extended `PesananController@index`

```php
private const SORTABLE = ['created_at', 'total_harga', 'nomor_struk', 'nama_pemesan'];

public function index(Request $request)
{
    $statuses = collect((array) $request->input('status_pesanan'))
        ->flatten()
        ->filter(fn ($v) => in_array($v, ['pending', 'confirmed', 'completed', 'cancelled'], true))
        ->values();

    $sortBy = in_array($request->input('sort_by'), self::SORTABLE, true)
        ? $request->input('sort_by') : 'created_at';
    $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
    $search = trim((string) $request->input('search', ''));

    $query = Pesanan::query()->with('paket');

    if ($statuses->isNotEmpty()) {
        $query->whereIn('status_pesanan', $statuses->all());
    }
    if ($search !== '') {
        $query->where(function ($q) use ($search) {
            $q->where('nomor_struk', 'like', "%{$search}%")
                ->orWhere('nama_pemesan', 'like', "%{$search}%")
                ->orWhere('no_telepon', 'like', "%{$search}%");
        });
    }

    $paginate = $query
        ->orderBy($sortBy, $sortDir)
        ->paginate($request->integer('perPage', 15), ['*'], 'page', $request->integer('page', 1));

    $filters = array_filter([
        'status_pesanan' => $statuses->isNotEmpty() ? $statuses->all() : null,
        'search' => $search !== '' ? $search : null,
    ], fn ($v) => ! is_null($v));

    return response()->json($this->respondWithPagination(
        $paginate->through(fn (Pesanan $item) => new PesananResource($item)),
        'Data retrieved successfully',
        $filters
    ));
}
```

##### B-3 — `PesananController@destroy`

```php
public function destroy(Pesanan $pesanan)
{
    $pesanan->delete();

    return response()->json([
        'status' => true,
        'message' => 'Pesanan deleted successfully',
    ]);
}
```

### 2.3 Laravel Validation Contracts (source of truth for Zod mapping)

`PesananStoreRequest::rules()` (verbatim):

```php
'nama_pemesan'     => ['required', 'string', 'max:255'],
'no_telepon'       => ['required', 'string', 'max:20'],
'paket_id'         => ['required', 'integer', Rule::exists('paket', 'id')],
'jumlah_paket'     => ['required', 'integer', 'min:1'],
'detail_tambahan'  => ['nullable', 'array'],
'detail_tambahan.*'=> ['string', 'max:255'],
'biaya_tambahan'   => ['nullable', 'numeric', 'min:0'],
'catatan'          => ['nullable', 'string'],
```

`PesananUpdateRequest::rules()` (verbatim):

```php
'status_pesanan' => ['sometimes', 'required', Rule::enum(StatusPesananEnum::class)],
'catatan'        => ['sometimes', 'nullable', 'string'],
```

Additional server-side business rules enforced in `PesananService` / `HargaService`
(NOT expressible in request validation — mirrored as submit-time guards in the frontend form):

- `jumlah_paket >= paket.min_order` → error `Jumlah di bawah minimum pemesanan paket ini`.
- `kapasitas_produksi === null || jumlah_paket <= kapasitas_produksi` → capacity error.
- `total_harga = (jumlah_paket * harga_paket_satuan) + biaya_tambahan` computed server-side.

### 2.4 Exact TypeScript Interfaces

New file `frontend/src/components/ui/core/block/admin/pesanan/types/pesanan-types.ts`:

```ts
import type { Paket } from "../../paket/types/paket-types"

/* ------------------------------------------------------------------ *
 * Enums (mirror App\Enums\StatusPesananEnum)
 * ------------------------------------------------------------------ */

export const PESANAN_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const

export type StatusPesanan = (typeof PESANAN_STATUSES)[number]

export const STATUS_LABELS: Record<StatusPesanan, string> = {
  pending: "Pending",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

/* ------------------------------------------------------------------ *
 * Lightweight paket shape returned by GET admin/paket/search (B-1)
 * ------------------------------------------------------------------ */

export interface PaketSearchOption {
  id: number
  nama_paket: string
  min_order: number | null
  harga_per_porsi: string
  kapasitas_produksi: number | null
}

/* ------------------------------------------------------------------ *
 * Core entity (mirror PesananResource)
 * ------------------------------------------------------------------ */

/** Numeric decimals arrive as strings from Laravel casts (decimal:2). */
export interface Pesanan {
  id: number
  nomor_struk: string
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  /** Present because every list/show response eager-loads `paket`. */
  paket: Paket | null
  jumlah_paket: number
  /** Price snapshot at order time — NOT current paket price. */
  harga_paket_satuan: string
  detail_tambahan: string[] | null
  biaya_tambahan: string
  catatan: string | null
  /** Server-computed. Read-only everywhere in the UI. */
  total_harga: string
  status_pesanan: StatusPesanan
  created_at: string
  updated_at: string
}

/* ------------------------------------------------------------------ *
 * Query params (mirror extended index contract, B-2)
 * ------------------------------------------------------------------ */

export const PESANAN_SORTABLE_COLUMNS = [
  "created_at",
  "total_harga",
  "nomor_struk",
  "nama_pemesan",
] as const

export type PesananSortColumn = (typeof PESANAN_SORTABLE_COLUMNS)[number]
export type SortDir = "asc" | "desc"

export interface PesananListQueryParams {
  page: number
  perPage: number
  /** Multi-select status filter — serialized as repeated query keys. */
  status_pesanan?: StatusPesanan[]
  search?: string
  sort_by?: PesananSortColumn
  sort_dir?: SortDir
}

/* ------------------------------------------------------------------ *
 * Response envelope (mirror Controller::respondWithPagination)
 * ------------------------------------------------------------------ */

export interface PesananPagination {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

export interface PesananListResponse {
  status: boolean
  message: string
  data: Pesanan[]
  meta: {
    filters: {
      status_pesanan?: StatusPesanan[]
      search?: string
    }
    pagination: PesananPagination
  }
}

export interface PesananSingleResponse {
  status: boolean
  message: string
  data: Pesanan
}

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

/** POST admin/pesanan body — NO total_harga / nomor_struk / harga_paket_satuan. */
export interface PesananCreatePayload {
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  jumlah_paket: number
  detail_tambahan: string[]
  biaya_tambahan: number
  catatan?: string | null
}

/** PUT admin/pesanan/{id} body — status/catatan ONLY. */
export interface PesananUpdatePayload {
  status_pesanan?: StatusPesanan
  catatan?: string | null
}

/* ------------------------------------------------------------------ *
 * Struk payload (mirror PesananController::struk)
 * ------------------------------------------------------------------ */

export interface StrukPayload {
  nomor_struk: string
  nama_pemesan: string
  no_telepon: string
  paket: string | null
  jumlah_paket: number
  harga_paket_satuan: string
  detail_tambahan: string[] | null
  biaya_tambahan: string
  total_harga: string
  status_pesanan: StatusPesanan
  created_at: string
}

export interface StrukResponse {
  status: boolean
  message: string
  data: StrukPayload
}
```

### 2.5 Zod Validation Schemas

New file `frontend/src/components/ui/core/block/admin/pesanan/schemas/pesanan-schema.ts` —
every rule maps 1:1 to the Laravel contracts in §2.3:

```ts
import { z } from "zod"
import { PESANAN_STATUSES } from "../types/pesanan-types"

/**
 * Mirrors PesananStoreRequest exactly:
 * required|string|max:255 / required|string|max:20 / required|integer|exists /
 * required|integer|min:1 / nullable|array of string max:255 / nullable|numeric|min:0.
 *
 * Server-only fields (total_harga, nomor_struk, harga_paket_satuan) are
 * deliberately ABSENT — sending them would violate AGENTS.md §3.
 */
export const pesananCreateSchema = z.object({
  nama_pemesan: z
    .string({ required_error: "Nama pemesan wajib diisi." })
    .trim()
    .min(1, "Nama pemesan wajib diisi.")
    .max(255, "Nama pemesan maksimal 255 karakter."),
  no_telepon: z
    .string({ required_error: "Nomor telepon wajib diisi." })
    .trim()
    .min(1, "Nomor telepon wajib diisi.")
    .max(20, "Nomor telepon maksimal 20 karakter."),
  paket_id: z
    .number({ required_error: "Pilih paket terlebih dahulu.", invalid_type_error: "Pilih paket terlebih dahulu." })
    .int("Paket tidak valid.")
    .positive("Pilih paket terlebih dahulu."),
  jumlah_paket: z
    .number({ required_error: "Jumlah paket wajib diisi.", invalid_type_error: "Jumlah paket harus angka." })
    .int("Jumlah paket harus bilangan bulat.")
    .min(1, "Jumlah paket minimal 1."),
  detail_tambahan: z
    .array(z.string().trim().min(1).max(255, "Item tambahan maksimal 255 karakter."))
    .max(50, "Maksimal 50 item tambahan.")
    .default([]),
  biaya_tambahan: z
    .number({ invalid_type_error: "Biaya tambahan harus angka." })
    .min(0, "Biaya tambahan tidak boleh negatif.")
    .default(0),
  catatan: z.string().nullish(),
})

export type PesananCreateFormValues = z.infer<typeof pesananCreateSchema>

/**
 * Mirrors PesananUpdateRequest: sometimes|required enum + sometimes|nullable string.
 */
export const pesananUpdateSchema = z.object({
  status_pesanan: z.enum(PESANAN_STATUSES, {
    required_error: "Status pesanan wajib dipilih.",
  }),
  catatan: z.string().nullish(),
})

export type PesananUpdateFormValues = z.infer<typeof pesananUpdateSchema>

/**
 * Submit-time business guards mirroring HargaService (min_order, capacity).
 * These live OUTSIDE the Zod schema because they depend on the selected
 * paket record; invoked from the form's onSubmit before mutation dispatch.
 */
export interface MinOrderViolation {
  field: "jumlah_paket"
  message: string
}

export function validateAgainstPaket(
  values: Pick<PesananCreateFormValues, "jumlah_paket">,
  paket: { min_order: number | null; kapasitas_produksi: number | null } | null
): MinOrderViolation | null {
  if (!paket) return null

  if (paket.min_order !== null && values.jumlah_paket < paket.min_order) {
    return {
      field: "jumlah_paket",
      message: `Minimum pemesanan untuk paket ini adalah ${paket.min_order}.`,
    }
  }
  if (
    paket.kapasitas_produksi !== null &&
    values.jumlah_paket > paket.kapasitas_produksi
  ) {
    return {
      field: "jumlah_paket",
      message: `Kapasitas produksi paket ini maksimal ${paket.kapasitas_produksi}.`,
    }
  }
  return null
}
```

---

## 3. Frontend Component File Tree

```
frontend/src/
├── components/
│   ├── pdf/                                        # pdfcn engine layer (NEW)
│   │   ├── invoice-theme.ts                        # Brand theme: OKLCH tokens → Takumi hex
│   │   ├── invoice-pesanan-document.tsx            # Document/Page/Table/KeyValue composition
│   │   └── invoice-preview-dialog.tsx              # Client-side blob preview + download/print
│   │
│   └── ui/core/block/admin/pesanan/                # Module block (NEW — stub today)
│       ├── master-pesanan-block.tsx                # Orchestrator (mirrors master-paket-block)
│       ├── components/
│       │   ├── pesanan-toolbar.tsx                 # SearchBar + MultiSelectFilter(status) + clear + add
│       │   ├── pesanan-table.tsx                   # Sortable DataTable + RowActions (edit/delete/struk)
│       │   ├── pesanan-status-badge.tsx            # Semantic badge per status
│       │   ├── create-pesanan-drawer.tsx           # Split-pane POS shell (desktop Dialog / mobile Sheet)
│       │   ├── update-pesanan-drawer.tsx           # Status + catatan editor (financials read-only)
│       │   ├── pesanan-delete-dialog.tsx           # Destructive confirmation modal
│       │   └── struk-trigger-button.tsx            # Row action → opens InvoicePreviewDialog
│       ├── constants/
│       │   └── pesanan-enum-options.ts             # MultiSelectFilter options for statuses
│       ├── hooks/
│       │   ├── use-pesanan-query.ts                # usePesananList (TanStack Query + Ky)
│       │   ├── use-pesanan-mutations.ts            # create/update/delete + cache invalidation
│       │   ├── use-paket-search.ts                 # Debounced GET admin/paket/search for combobox
│       │   └── use-pesanan-form.ts                 # useAppForm factory + mappers (§4.4)
│       ├── schemas/
│       │   └── pesanan-schema.ts                   # §2.5
│       ├── types/
│       │   └── pesanan-types.ts                    # §2.4
│       └── utils/
│           └── pesanan-calculator.ts               # UX-only preview math + IDR formatter
│
├── pages/admin/
│   └── master-pesanan-page.tsx                     # EXISTS (stub) — mounts <MasterPesananBlock/>
│
└── services/
    └── pesanan-service.ts                          # NEW — all Ky calls in one module
```

Reused as-is (no duplication):

- `shared/multi-select-filter.tsx` — status multi-select.
- `fragments/custom-ui/table/data-table-pagination.tsx`, `data-table-skeleton.tsx`.
- `fragments/custom-ui/typograhy/header.tsx` (`HeaderDashboard`).
- `fragments/custom-ui/form/form-*` — Input, CurrencyInput, TagInput, TextArea, Select;
  plus `form-combobox.tsx` registered into `use-form.ts` fieldComponents:

```ts
// src/hooks/use-form.ts — additive change only
import { FormCombobox } from "@/components/ui/fragments/custom-ui/form/form-combobox"

const fieldComponents = {
  Input: FormInput,
  TextArea: FormTextArea,
  DateInput: FormDateInput,
  CheckboxGroup: FormCheckboxGroup,
  Select: FormSelect,
  Checkbox: FormCheckbox,
  TagInput: FormTagInput,
  ImageUpload: FormImageUpload,
  ImagesUpload: FormImagesUpload,
  CurrencyInput: FormCurrencyInput,
  Combobox: FormCombobox, // NEW
} as const
```

- `paket/hooks/use-debounced-value` imported cross-block (`../paket/hooks/use-debounced-value`)
  until promoted to `shared/`.

### 3.1 Service Layer

New file `frontend/src/services/pesanan-service.ts` — the ONLY place Ky is touched:

```ts
import { api } from "@/api/client"
import type {
  PesananCreatePayload,
  PesananListQueryParams,
  PesananListResponse,
  PesananSingleResponse,
  PesananUpdatePayload,
  StrukResponse,
} from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

const BASE = "admin/pesanan"

function buildSearchParams(params: PesananListQueryParams): URLSearchParams {
  const sp = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })
  for (const s of params.status_pesanan ?? []) sp.append("status_pesanan[]", s)
  if (params.search) sp.set("search", params.search)
  if (params.sort_by) sp.set("sort_by", params.sort_by)
  if (params.sort_dir) sp.set("sort_dir", params.sort_dir)
  return sp
}

export const pesananService = {
  async list(params: PesananListQueryParams): Promise<PesananListResponse> {
    return api.get(BASE, { searchParams: buildSearchParams(params) }).json()
  },

  async create(payload: PesananCreatePayload): Promise<PesananSingleResponse> {
    return api.post(BASE, { json: payload }).json()
  },

  async update(id: number, payload: PesananUpdatePayload): Promise<PesananSingleResponse> {
    return api.put(`${BASE}/${id}`, { json: payload }).json()
  },

  async remove(id: number): Promise<{ status: boolean; message: string }> {
    return api.delete(`${BASE}/${id}`).json()
  },

  async struk(id: number): Promise<StrukResponse> {
    return api.get(`${BASE}/${id}/struk`).json()
  },
}
```

Paket search service (B-1 consumer):

```ts
// appended to src/services/paket-service.ts (or inline in use-paket-search.ts)
export interface PaketSearchResponse {
  status: boolean
  message: string
  data: {
    id: number
    nama_paket: string
    min_order: number | null
    harga_per_porsi: string
    kapasitas_produksi: number | null
  }[]
}
```

---

## 4. Cashier POS Split-Pane Drawer Implementation Plan

### 4.1 Shell Layout

Desktop: centered `DialogContent` `max-w-5xl`, two panes
`grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]`. Mobile (<lg): single-column scroll,
calculation panel collapses below inputs. Dirty-tracking close guard replicates
`order-calculation-dialog.tsx`: intercept close, if `form.state.isDirty` show
`DeleteDialog`-style discard confirmation ("Buang perubahan?").

```
┌─────────────────────────────────────────────────────────────────────┐
│ DialogTitle: Pesanan Baru                    [POS header]           │
├───────────────────────────────────┬─────────────────────────────────┤
│ LEFT PANE (scrollable form)       │ RIGHT PANE (sticky summary)     │
│  • PaketCombobox  (async search)  │  Ringkasan                      │
│  • Nama Pemesan   (Input)         │  ─────────────────────          │
│  • No Telepon     (Input)         │  Paket        Nasi Tumpeng      │
│  • Jumlah Paket   (Input number)  │  Harga/satuan Rp 350.000        │
│  • Detail Tambahan(TagInput)      │  Jumlah       × 3               │
│  • Biaya Tambahan (CurrencyInput) │  Biaya tamb.  Rp 25.000         │
│  • Catatan        (TextArea)      │  ═══════════════════════        │
│                                   │  TOTAL        Rp 1.075.000      │
│                                   │  (live, UX-only preview)        │
├───────────────────────────────────┴─────────────────────────────────┤
│                              [Batal]  [Simpan Pesanan]              │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Right Pane Without Global Re-Renders — Field-Level Subscriptions

The summary subscribes to **individual value slices** via `useStore(form.store, selector)`
so keystrokes in unrelated fields never re-render the pane (TanStack Form v1 fine-grained
reactivity). Calculation helper (`utils/pesanan-calculator.ts`):

```ts
export interface OrderPreview {
  subtotal: number
  biayaTambahan: number
  total: number
}

/**
 * UX-ONLY preview. Mirrors HargaService::totalHarga so the cashier sees what
 * the server will compute. The authoritative total is ALWAYS the server's
 * response (AGENTS.md §3 — never trust frontend numbers financially).
 */
export function calculateOrder(
  jumlahPaket: number,
  hargaSatuan: number,
  biayaTambahan: number
): OrderPreview {
  const subtotal = jumlahPaket * hargaSatuan
  return { subtotal, biayaTambahan, total: subtotal + biayaTambahan }
}

export const formatRupiah = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
```

Summary component (subscribes per-field):

```tsx
import { useStore } from "@tanstack/react-store"
import type { PesananCreateDrawerFormApi } from "../hooks/use-pesanan-form"
import { calculateOrder, formatRupiah } from "../utils/pesanan-calculator"

interface CalcPanelProps {
  form: PesananCreateDrawerFormApi
  selectedPaket: { nama_paket: string; harga_per_porsi: string } | null
}

export function PesananCalcPanel({ form, selectedPaket }: CalcPanelProps) {
  // Each hook re-renders THIS component only when its slice changes.
  const jumlah = useStore(form.store, (s) => s.values.jumlah_paket)
  const biaya = useStore(form.store, (s) => s.values.biaya_tambahan)

  const hargaSatuan = Number(selectedPaket?.harga_per_porsi ?? 0)
  const preview = calculateOrder(jumlah, hargaSatuan, biaya)

  return (
    <aside className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h3 className="font-heading text-sm font-semibold text-foreground">
        Ringkasan Pesanan
      </h3>
      <div className="flex flex-col gap-2 border-b border-border pb-3 text-sm">
        <Row label="Paket" value={selectedPaket?.nama_paket ?? "—"} />
        <Row label="Harga/satuan" value={formatRupiah(hargaSatuan)} />
        {/* jumlah_paket is a snapshot price line, NOT per-portion */}
        <Row label={`Jumlah`} value={`× ${Number.isFinite(jumlah) ? jumlah : 0}`} />
        <Row label="Subtotal" value={formatRupiah(preview.subtotal)} />
        <Row label="Biaya tambahan" value={formatRupiah(preview.biayaTambahan)} />
      </div>
      <div className="flex items-baseline justify-between pt-1">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-heading text-xl font-bold text-primary">
          {formatRupiah(preview.total)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Total final dihitung ulang oleh server saat disimpan.
      </p>
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
```

### 4.3 Async Paket Selector

`hooks/use-paket-search.ts`: debounced (300 ms) TanStack Query over
`GET admin/paket/search?q=` feeding the registered `FormCombobox` field
(`form-combobox.tsx` handles `useFieldContext`, validation-state styling, and local
option filtering). On selection, `onChange` stores the full option object in component
state (`selectedPaket`) for the calc panel + `validateAgainstPaket` guard; only
`paket_id` enters form values.

```ts
import { useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { PaketSearchOption } from "../types/pesanan-types"

export function usePaketSearch(query: string) {
  return useQuery({
    queryKey: ["paket-search", query],
    queryFn: async () => {
      const res = await api
        .get("admin/paket/search", { searchParams: { q: query } })
        .json<{
          status: boolean
          message: string
          data: PaketSearchOption[]
        }>()
      return res.data
    },
    staleTime: 30_000,
  })
}
```

### 4.4 Form Ownership & Mapping Layer

`hooks/use-pesanan-form.ts` owns the `useAppForm` instance (same ownership model as
`order-calculation-dialog.tsx`: the shell owns the form, children receive it as prop).
Mapping functions exclude ALL image/file normalization — none exists in this domain:

```ts
import { useAppForm } from "@/hooks/use-form"
import { toast } from "sonner"
import {
  pesananCreateSchema,
  validateAgainstPaket,
  type PesananCreateFormValues,
} from "../schemas/pesanan-schema"
import type { PaketSearchOption } from "../types/pesanan-types"

const EMPTY: PesananCreateFormValues = {
  nama_pemesan: "",
  no_telepon: "",
  paket_id: Number.NaN, // forces "pilih paket" until combobox commits
  jumlah_paket: 1,
  detail_tambahan: [],
  biaya_tambahan: 0,
  catatan: null,
}

/** Raw form values → wire payload. No image/file logic in this domain. */
export function toPesananCreatePayload(
  values: PesananCreateFormValues
): {
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  jumlah_paket: number
  detail_tambahan: string[]
  biaya_tambahan: number
  catatan: string | null
} {
  return {
    nama_pemesan: values.nama_pemesan.trim(),
    no_telepon: values.no_telepon.trim(),
    paket_id: values.paket_id,
    jumlah_paket: values.jumlah_paket,
    detail_tambahan: values.detail_tambahan ?? [],
    biaya_tambahan: values.biaya_tambahan ?? 0,
    catatan: values.catatan?.trim() || null,
  }
}

export function usePesananCreateForm(options: {
  onSuccess: () => void
}) {
  return useAppForm({
    defaultValues: EMPTY,
    validators: { onSubmit: pesananCreateSchema },
    onSubmit: async ({ value, formApi }) => {
      // Business guards mirror HargaService — run AFTER schema passes.
      void formApi
      void validateAgainstPaket // resolved against selectedPaket inside the drawer
      options.onSuccess()
    },
  })
}

/** Edit drawer defaults derive straight from the PesananResource row. */
export function toFormDefaults(pesanan: {
  status_pesanan: string
  catatan: string | null
}): { status_pesanan: string; catatan: string | null } {
  return {
    status_pesanan: pesanan.status_pesanan,
    catatan: pesanan.catatan,
  }
}
```

Submit wiring inside `create-pesanan-drawer.tsx` (complete flow):

```tsx
const onSubmit = async ({ value }: { value: PesananCreateFormValues }) => {
  if (!selectedPaket) {
    form.setFieldMeta("paket_id", (meta) => ({
      ...meta,
      errors: ["Pilih paket terlebih dahulu."],
    }))
    return
  }
  const violation = validateAgainstPaket(value, selectedPaket)
  if (violation) {
    form.setFieldMeta(violation.field, (meta) => ({
      ...meta,
      errors: [violation.message],
    }))
    return
  }

  await createPesanan(toPesananCreatePayload(value), {
    onSuccess: () => {
      toast.success("Pesanan dibuat", {
        description: `Nomor struk ${res.data.nomor_struk} berhasil disimpan.`,
      })
      form.reset()
      onClose()
    },
    onError: (error) => {
      toast.error("Gagal menyimpan pesanan", {
        description: error.message ?? "Periksa kembali data pesanan.",
      })
    },
  })
}
```

### 4.5 Update Drawer Constraints

- Fields rendered: `Select` (status) + `TextArea` (catatan) — nothing else.
- Financial summary shown **read-only** (snapshot `harga_paket_satuan`, stored `total_harga`)
  with caption "Harga mengikuti snapshot saat pesanan dibuat".
- Payload strictly `PesananUpdatePayload` — server rejects anything else anyway.

---

## 5. `pdfcn` PDF Invoice Engine Integration Strategy

### 5.1 What `pdfcn` Is

`pdfcn` is a shadcn-style component registry for PDF generation built on the **Takumi**
rendering engine (WASM — renders in-browser AND server-side). Components are vendored into
the repo by the shadcn CLI, themable via a provider, and composed from React-PDF-style
primitives (`Document`, `Page`, `View`, `Text`, `StyleSheet`). Because our app is a Vite SPA
(no Next.js server), generation runs **fully client-side**: React tree → Takumi →
`Uint8Array` PDF bytes → `Blob` → object URL for `<iframe>` preview + download anchor.
Zero network round-trip for invoices; works offline once fonts are cached.

### 5.2 Installation (Step-by-Step)

Run from `frontend/`:

```bash
# 1. Engine + helpers (WASM renderer + Google Fonts loader)
npm install takumi-pdf @takumi-rs/helpers

# 2. Vendor primitives + themed building blocks via shadcn CLI
npx shadcn@latest add "@pdfcn/takumi/pdf-primitives"
npx shadcn@latest add "@pdfcn/takumi/theme-provider"
npx shadcn@latest add "@pdfcn/takumi/text"
npx shadcn@latest add "@pdfcn/takumi/heading"
npx shadcn@latest add "@pdfcn/takumi/table"
npx shadcn@latest add "@pdfcn/takumi/key-value"
npx shadcn@latest add "@pdfcn/takumi/page-header"
npx shadcn@latest add "@pdfcn/takumi/page-footer"
npx shadcn@latest add "@pdfcn/takumi/divider"
npx shadcn@latest add "@pdfcn/takumi/invoice-minimal"

# 3. Verify vendored files landed under src/components/pdf/ (per components.json aliases)
npm run typecheck
```

> If a registry slug differs at implementation time, resolve names with
> `npx shadcn@latest search pdfcn` first — slugs above follow the published
> `@pdfcn/takumi/*` namespace documented at pdfcn.dev/docs.

### 5.3 Theme Configuration — Brand Tokens → Takumi Hex

Takumi consumes concrete colors/fonts, not CSS variables, so `invoice-theme.ts` maps the
OKLCH token values from `src/index.css` (single source of truth kept in sync manually —
add a comment linking both files):

```ts
// src/components/pdf/invoice-theme.ts
// Hex mirrors src/index.css OKLCH tokens. Update BOTH when design.md changes.
export const invoiceTheme = {
  colors: {
    background: "#F4F1E8",      // --background oklch(0.9582 0.0152 90.2357)
    foreground: "#3A352E",      // dark warm brown derived from --foreground ramp
    primary: "#8C5A2B",         // --primary oklch(0.5628 0.0778 65.5444)
    primaryForeground: "#FAF7EF",
    muted: "#EAE6DA",
    mutedForeground: "#7A7365",
    border: "#DDD6C6",
    destructive: "#A93B32",     // --destructive warm red
  },
  typography: {
    heading: { family: "Fraunces", weight: 700 },      // --font-heading
    body: { family: "Space Grotesk", size: 10.5 },     // --font-sans
    accent: { family: "Instrument Serif", italic: true }, // --font-accent (tagline only)
  },
  page: {
    size: "A4" as const,
    margin: { top: 48, bottom: 56, left: 48, right: 48 },
  },
} as const
```

Fonts are fetched once and cached module-scope:

```ts
import { googleFonts } from "@takumi-rs/helpers"

let fontsCache: Awaited<ReturnType<typeof googleFonts>> | null = null

export async function loadInvoiceFonts() {
  if (!fontsCache) {
    fontsCache = await googleFonts(["Fraunces", "Space Grotesk", "Instrument Serif"])
  }
  return fontsCache
}
```

### 5.4 Invoice Block Composition

`src/components/pdf/invoice-pesanan-document.tsx` — complete structure bound to the
**server-authoritative** struk payload (never client-computed numbers):

```tsx
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@/components/pdf/primitives" // vendored by CLI (path per alias config)
import { Heading } from "@/components/pdf/heading"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/pdf/table"
import { KeyValue } from "@/components/pdf/key-value"
import { PageHeader } from "@/components/pdf/page-header"
import { PageFooter } from "@/components/pdf/page-footer"
import { Divider } from "@/components/pdf/divider"
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider"
import { invoiceTheme } from "./invoice-theme"
import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  billTo: { fontSize: 11 },
  muted: { color: invoiceTheme.colors.mutedForeground, fontSize: 9.5 },
})

function rupiah(n: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n))
}

export function InvoicePesananDocument({ data }: { data: StrukPayload }) {
  const tanggal = new Date(data.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <PdfcnThemeProvider theme={invoiceTheme}>
      <Document title={`Invoice ${data.nomor_struk}`}>
        <Page size="A4" margin={invoiceTheme.page.margin}>
          <PageHeader
            title="Catering Nusantara"
            subtitle={tanggal}
            accentColor={invoiceTheme.colors.primary}
          />

          {/* Bill To */}
          <View style={styles.section}>
            <Text style={styles.muted}>Ditagihkan kepada</Text>
            <Text style={styles.billTo}>{data.nama_pemesan}</Text>
            <Text style={styles.muted}>{data.no_telepon}</Text>
          </View>

          {/* Items */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell align="left">Paket</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="right">Harga Satuan</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell align="left">{data.paket ?? "-"}</TableCell>
                <TableCell align="center">{data.jumlah_paket}</TableCell>
                <TableCell align="right">{rupiah(data.harga_paket_satuan)}</TableCell>
                <TableCell align="right">
                  {rupiah(data.jumlah_paket * Number(data.harga_paket_satuan))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Extras */}
          {data.detail_tambahan && data.detail_tambahan.length > 0 && (
            <View style={styles.section}>
              <KeyValue
                items={data.detail_tambahan.map((item, i) => ({
                  key: `Tambahan ${i + 1}`,
                  value: item,
                }))}
              />
            </View>
          )}

          <Divider />

          {/* Totals — straight from server payload */}
          <KeyValue
            align="right"
            width="55%"
            items={[
              { key: "Biaya Tambahan", value: rupiah(data.biaya_tambahan) },
              {
                key: "Total Harga",
                value: rupiah(data.total_harga),
                emphasis: true,
                color: invoiceTheme.colors.primary,
              },
              { key: "Status", value: data.status_pesanan.toUpperCase() },
            ]}
          />

          {data.catatan && (
            <View style={styles.section}>
              <Text style={styles.muted}>Catatan</Text>
              <Text>{data.catatan}</Text>
            </View>
          )}

          <PageFooter
            left="Terima kasih — Catering Nusantara"
            right={`${data.nomor_struk}`}
          />
        </Page>
      </Document>
    </PdfcnThemeProvider>
  )
}
```

### 5.5 Interactive Client-Side Live Preview Modal + Download

`src/components/pdf/invoice-preview-dialog.tsx`:

```tsx
import { useCallback, useEffect, useState } from "react"
import { render } from "takumi-pdf"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { InvoicePesananDocument } from "./invoice-pesanan-document"
import { loadInvoiceFonts } from "./invoice-theme"
import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

interface Props {
  data: StrukPayload
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePreviewDialog({ data, open, onOpenChange }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const fonts = await loadInvoiceFonts()
      const bytes: Uint8Array = await render(<InvoicePesananDocument data={data} />, {
        fonts,
      })
      setBlobUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat pratinjau invoice")
    } finally {
      setGenerating(false)
    }
  }, [data])

  useEffect(() => {
    if (open) void generate()
  }, [open, generate])

  // Revoke object URLs to avoid memory leaks across opens.
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  const download = () => {
    if (!blobUrl) return
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = `Invoice-${data.nomor_struk}.pdf`
    a.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl shadow-xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="font-heading">Invoice {data.nomor_struk}</DialogTitle>
          <DialogDescription>
            Pratinjau struk untuk {data.nama_pemesan}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2">
          <Button size="sm" variant="outline" onClick={() => void generate()} disabled={generating}>
            {generating ? "Menyiapkan…" : "Segarkan"}
          </Button>
          <Button size="sm" variant="outline" onClick={download} disabled={!blobUrl}>
            Unduh PDF
          </Button>
          <Button
            size="sm"
            onClick={() => blobUrl && window.open(blobUrl, "_blank")}
            disabled={!blobUrl}
          >
            Cetak
          </Button>
        </div>

        <div className="min-h-0 flex-1 bg-background">
          {error ? (
            <p className="p-4 text-sm text-destructive">{error}</p>
          ) : blobUrl ? (
            <iframe src={blobUrl} title={`Invoice ${data.nomor_struk}`} className="h-full w-full border-0" />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Menyiapkan pratinjau…</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

Data source for the dialog: fetch fresh via `pesananService.struk(id)` (React Query key
`["struk", id]`) when the row action fires — guarantees the PDF always renders
server-authoritative numbers, even if the table row is stale.

---

## 6. Data Table, Filters & Dialogs

### 6.1 State Model (`master-pesanan-block.tsx`)

Mirrors `master-paket-block.tsx` exactly (minus view-mode toggle):

| State | Initial | Reset triggers |
| :--- | :--- | :--- |
| `searchInput` → debounced `search` (350 ms) | `""` | clear-all, manual |
| `statuses: StatusPesanan[]` | `[]` | filter chip removal, clear-all |
| `sortBy` / `sortDir` | `"created_at"` / `"desc"` | column header menu |
| `page` / `perPage` | `1` / `10` | any filter/sort change → page 1 |
| `createOpen`, `updateTarget`, `deleteTarget`, `strukTarget` | closed/null | dialogs |

Query key: `["pesanan-list", { page, perPage, statuses, search, sortBy, sortDir }]`;
mutations invalidate `["pesanan-list"]` and `["struk"]`.

### 6.2 Toolbar

`pesanan-toolbar.tsx` composes:

1. `SearchBar` (placeholder: "Cari nomor struk, nama pemesan, atau no. telepon…").
2. `MultiSelectFilter` (shared primitive) fed from
   `constants/pesanan-enum-options.ts`:

```ts
import { PESANAN_STATUSES, STATUS_LABELS } from "../types/pesanan-types"

export const STATUS_FILTER_OPTIONS = PESANAN_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))
```

3. Active-filter chips + `onClearFilters`.
4. Primary action `Tambah Pesanan` → `setCreateOpen(true)`.

Multi-select serializes to repeated `status_pesanan[]` params (§3.1 `buildSearchParams`).

### 6.3 Table Columns (`pesanan-table.tsx`)

Sortable headers use the same DropdownMenu-header pattern as `PaketTable`; only whitelisted
columns expose sort (matches backend `SORTABLE`):

| Column | Field | Render | Sort |
| :--- | :--- | :--- | :--- |
| Nomor Struk | `nomor_struk` | mono font, copy-on-click | ✓ |
| Pemesan | `nama_pemesan` + `no_telepon` stacked | text + muted sub-line | ✓ |
| Paket | `paket.nama_paket` | text | ✗ |
| Jumlah | `jumlah_paket` | right-aligned | ✗ |
| Total | `total_harga` | `formatRupiah` (display only) | ✓ |
| Status | `status_pesanan` | `PesananStatusBadge` semantic variants | ✗ |
| Dibuat | `created_at` | `id-ID` date | ✓ |
| Aksi | — | `RowActions`: Ubah / Struk / Hapus | ✗ |

`pesanan-status-badge.tsx` maps statuses to semantic tokens (never raw hex):
`pending → bg-warning/15 text-warning`, `confirmed → bg-primary/15 text-primary`,
`completed → bg-success/15 text-success`, `cancelled → bg-destructive/15 text-destructive`
(variants added to the badge recipe via `cva`, following `shadcn-architecture` conventions).

Empty/loading/error states replicate the paket block verbatim (`DataTableSkeleton`,
bordered empty-state copy in Bahasa Indonesia, destructive error banner).

### 6.4 Delete Confirmation Flow (`pesanan-delete-dialog.tsx`)

1. Row action sets `deleteTarget` → AlertDialog opens with order summary
   (nomor struk + pemesan) in the description.
2. Copy: title "Hapus Pesanan Ini?" · body warns deletion is permanent and the struk
   becomes unretrievable · confirm button destructive variant labeled "Ya, Hapus".
3. Confirm → `usePesananDeleteMutation` → success toast → invalidate list → close.
4. Cancel/backdrop/Esc → clears target only. No cascade warnings needed beyond paket FK
   behavior defined in migration.

Mutation hooks (`use-pesanan-mutations.ts`) follow the `usePaketDeleteMutation` shape:
Ky call via `pesananService`, `onMutate` optimistic-free (simplest correct path),
`onSuccess` → `queryClient.invalidateQueries({ queryKey: ["pesanan-list"] })`,
`onError` → Sonner error toast with server message.

---

## 7. Execution Order (Phases 2→N, each gated)

| Phase | Deliverable | Files |
| :--- | :--- | :--- |
| **P2 — Backend** | B-1/B-2/B-3: search endpoint, index extensions, destroy + routes; update `backend/docs/api-collection.md` | `PaketController.php`, `PesananController.php`, `routes/api.php` |
| **P3 — Data layer** | Types, service, query/mutation/search hooks | `types/pesanan-types.ts`, `services/pesanan-service.ts`, `hooks/use-*` |
| **P4 — Table & toolbar** | Block orchestrator, toolbar, table, badge, delete dialog | `master-pesanan-block.tsx`, `components/*` |
| **P5 — POS drawers** | Split-pane create drawer + update drawer (+ Combobox registration in `use-form.ts`) | `create-pesanan-drawer.tsx`, `update-pesanan-drawer.tsx` |
| **P6 — PDF engine** | pdfcn vendor install, theme, document, preview dialog wired to struk row action | `src/components/pdf/*` |
| **P7 — QA gates** | `npm run typecheck && npm run lint && npm run lint:design`; manual browser pass incl. reduced-motion check | — |

## 8. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| Takumi/WASM bundle weight (~1–2 MB lazy chunk) | Dynamic `import()` only inside `InvoicePreviewDialog`; table route unaffected. |
| Decimal strings vs numbers drift in calc panel | Single coercion point: `Number(harga_paket_satuan)` inside `calculateOrder` callers; formatter accepts both. |
| Ghost-reset regression on new form | Already solved globally by `withGlobalBehaviors` in `use-form.ts` — schema reused across onChange/onBlur/onSubmit. |
| `paket/search` swallowed by `{paket}` route binding | Explicit route-ordering rule in P2 (literal before wildcard) + integration test via api-collection. |
| Stale invoice numbers | Preview always refetches `/struk` (React Query) instead of trusting the row object. |
