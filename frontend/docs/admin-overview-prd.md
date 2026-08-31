# Admin Overview — Product Requirements Document
> **Project:** Catering Nusantara · **Module:** Admin Overview / Dashboard (Default Landing for Authenticated Admin)
> **Phase:** Planning & PRD — Research Only (No Production Code)
> **Monorepo Root:** `../../` · **PRD Location:** `frontend/docs/admin-overview-prd.md`
> **References:** `docs/project-context.md` · `docs/architecture.md` · `frontend/docs/architecture.md` · `frontend/docs/design.md` · `backend/docs/architecture.md` · `backend/docs/api-collection.md` · `backend/docs/database.md` · `frontend/docs/feature-order-calculation-plan.md`

---

## 1. Executive Summary

The Admin Overview is the **default dashboard** an admin sees immediately after `POST /api/v1/auth/login` succeeds and the SPA redirects to `/admin` (currently `DashboardPage` → `OverviewBlock`). Unlike the public site (catalog → detail → calculator → WhatsApp), the admin surface is **Mini POS + CMS**. The overview must answer at a glance: *is the kitchen busy today, is money flowing, what is pending, and what sells best?*

Today `frontend/src/components/ui/core/block/admin/overview/overview-block.tsx` is a **rough boilerplate** copied from the KlikAntri benchmark. It already renders (`SectionCards` + `ChartActivityTrends` + `ChartDistribution`) and has a live clock, but its `DataCard` mapping, Types (`totalDokter`, `totalAntrian`), chart configs (`antrianStatusChartConfig`), and API hook (`FetchOverview`) are **still clinic-domain (dokter/pasien/antrian/poli)**. This PRD re-specifies the entire surface for **catering domain** while **strictly preserving the benchmark's architectural skeleton** (file tree, styling, state).

**Benchmark parity rule:** No new folder pattern is invented. Every file in `frontend/src/components/ui/core/block/admin/overview` and `backend/app/Http/Controllers/OverviewController.php` must mirror the KlikAntri benchmark 1:1, only the *domain nouns and metrics* change.

---

## 2. Benchmark Analysis (External — Canonical Reference)

### 2.1 Frontend Benchmark
**Source:** `https://github.com/Ahmad-Yu2up-Ar-Raf/klikantri-appointment-app/tree/main/Front-End/Web/src/components/ui/core/block/overview`

**Verified hierarchy (exactly as cloned into Catering Nusantara):**
```
overview/
├── overview-block.tsx              # Orchestrator: FetchOverview() → isLoading/isError → mapping → SectionCards + Charts
├── components/
│   ├── section-card.tsx            # Generic DataCard grid (2 cols → @5xl:4 cols), Card + Hugeicons icon + value
│   ├── chart-activity-trends.tsx   # AreaChart (recharts) stacked antrian+pasien, timeRange Select (all/90d/30d/7d), totals summary
│   └── chart-distribution.tsx      # PieChart (donut) with distributionColors, empty state, legend, center total label
├── config/
│   └── analytics-chart-config.ts   # ChartConfig objects (antrianStatusChartConfig, dokterStatusChartConfig, genderChartConfig)
├── hooks/
│   └── use-overview-query.ts       # (benchmark name: FetchOverview) — TanStack Query wrapper over GET /overview
└── types/
    └── overview-type.ts            # OverviewResponse { reports: Reports } + nested CountsByDate, TopDokter, status counts
```

**Styling approach:** Tailwind + `shadcn/ui` (`Card`, `ChartContainer`, `Select`), `recharts` for charts, `Hugeicons` for icons, `cn()` for conditional classes, `@container` queries for responsive grids (`@5xl/main:grid-cols-4`, `@container/card`). Dark mode via `dark:` variants (`text-neutral-900 dark:text-neutral-100`). No inline `style` except CSS variables `var(--chart-1)`.

**State management:** Single `FetchOverview()` TanStack Query hook. `overview-block.tsx` is the only state owner — no Zustand. `useMonitorClock()` for live clock is outside the query and never blocks rendering. Loading = centered `Spinner`; error = `text-muted-foreground` with message.

### 2.2 Backend Benchmark
**Source:** `https://github.com/Ahmad-Yu2up-Ar-Raf/klikantri-appointment-app/blob/main/Back-End/app/Http/Controllers/OverviewController.php` (138 lines, 118 LOC)

**Key patterns:**
- **Single endpoint:** `GET /overview` (admin, `auth:sanctum` + cache). In Catering Nusantara this becomes `GET /api/v1/admin/overview` (see §7).
- **Cache wrapping:** Entire aggregation wrapped in `Cache::remember('overview_reports', 10, fn() => ...)` — 10-second TTL, serves 100 concurrent dashboard hits from memory. Comment explicitly states intent.
- **Aggregation style:** `Model::count()` for totals, `select('col', DB::raw('count(*) as count'))->groupBy('col')->pluck('count','col')` for distribution maps (status, gender), `withCount('relation')->orderBy(...)->take(5)->get()` for Top-N, and per-date aggregation via `DATE(created_at)` + `pluck('count','date')` merged via `collect(array_merge(keys))->unique()->sort()` into `countsByDate`.
- **Response shape:** `return response()->json(['reports' => $reports])` — envelope `{ reports: { ... } }` (not `{ data: ... }`). Inside: flat totals + maps + `countsByDate: [{date, dokter, pasien, antrian}, ...]` + `topDokter: [{nama, antrian_count}]`.
- **Empty methods:** `create/store/show/edit/update/destroy` are scaffolded but empty — the controller is **read-only**.
- **Controller is flat:** `App\Http\Controllers\OverviewController` (LOCKED per `backend/docs/architecture.md` — no `Api/V1` subfolder, versioning via `Route::prefix('v1')`).

---

## 3. Local Codebase Deep Dive (Current State)

### 3.1 Frontend — `frontend/src/components/ui/core/block/admin/overview`

| Path | Current State | Action in Execution Phase |
|---|---|---|
| `overview-block.tsx` (168 lines) | Boilerplate functional but **clinic-nouned**: maps `reports.totalDokter/totalAntrian/totalPasien/totalPoli`, uses `Stethoscope02FreeIcons`, `Timer02FreeIcons`, `HospitalLocationIcon`, and `antrianStatusChartConfig`. Already has correct structure: `FetchOverview()` → `isLoading→Spinner`, `isError→text`, `data.reports` mapping, `SectionCards`, `ChartActivityTrends` + `ChartDistribution` grid, `useMonitorClock` header. | **Rewrite**: Keep file skeleton, replace 4 DataCards, chart data mappers, and icons with catering nouns. Keep `SectionCards`, `ChartDistribution`, `ChartActivityTrends`, `useMonitorClock` usage. |
| `components/section-card.tsx` (119 lines) | **Done, reusable as-is.** Generic `DataCard {title, description, value, icon, label, className}` → responsive `@container/card` grid, `Spinner`-ready. | **No change** (or minimal: ensure `value: number | string` for currency). |
| `components/chart-distribution.tsx` (199 lines) | **Done, reusable as-is.** Generic donut PieChart, `distributionColors`, `ChartConfig` prop, empty state with `Chart01FreeIcons`. | **No change** except new `ChartConfig` objects are passed in (e.g., `pesananStatusChartConfig`). |
| `components/chart-activity-trends.tsx` (299 lines) | **Done, reusable as-is.** AreaChart stacked `antrian+pasien`, `Select` for time range (`all/90d/30d/7d`), totals in `CardAction`, empty state. Hardcoded `chartConfig` for `antrian/pasien` inside file — matches `CountsByDate {date, pasien, antrian}`. | **Adapt**: Replace `chartConfig` and `CountsByDate` fields to `pesanan/pendapatan` variant. Extract config to `analytics-chart-config.ts` (already the pattern for distribution). |
| `config/analytics-chart-config.ts` (57 lines) | Defines `antrianStatusChartConfig`, `dokterStatusChartConfig`, `genderChartConfig` + helpers. Uses `var(--chart-1)` palette. | **Rewrite**: Replace with `pesananStatusChartConfig`, `kategoriPaketChartConfig`, `pendapatanChartConfig` (or keep one generic). Keep `distributionColors` and helper shape. |
| `types/overview-type.ts` (45 lines) | Clinic types (`totalDokter`, `AntrianstatusCount`, `CountsByDate {date, pasien, antrian}`). | **Rewrite**: Catering types (see §6). Keep `OverviewResponse {reports: Reports}` envelope. |
| `hooks/use-overview-query.ts` | **Not yet inspected but expected** to be `FetchOverview` mirroring benchmark's `useQuery(['overview'])` over `GET /admin/overview` via `Ky` + `src/api/client.ts`. If missing/stubbed, create it exactly like `use-paket-query.ts` / `use-struk-query.ts` (TanStack Query v5, `keepPreviousData`, `staleTime`). | **Create/Rewrite**: Single hook `useOverviewQuery()` / `FetchOverview()` fetching `GET /api/v1/admin/overview`. |
| `pages/admin/dashboard-page.tsx` (8 lines) | Correctly mounts `<OverviewBlock />`. No logic. | **No change**. |
| `frontend/src/hooks/use-monitor-clock.ts` | Used in `overview-block.tsx` for `jam`/`tanggal` header. | **Keep** — no change. |

**Integration point already exists:** `frontend/src/pages/admin/dashboard-page.tsx` → `OverviewBlock` is the default admin route. The frontend router (`src/router/index.tsx`) guards it with `auth:sanctum` (mirrors backend `admin` prefix). No new page/route is needed.

### 3.2 Backend — `backend/` (Laravel 13, PHP 8.4, Sanctum 4, Pest 4)

| Path | Current State | Action in Execution Phase |
|---|---|---|
| `routes/api.php` (51 lines) | Has `Route::prefix('admin')->middleware('auth:sanctum')` group. No `/admin/overview` route yet. Has `/admin/pesanan`, `/admin/paket/search`, `/admin/paket`, `/admin/galeri`, `/admin/cloudinary`. | **Add** `Route::get('/overview', [OverviewController::class, 'index'])->name('overview.index');` **inside** the `admin` group, before `apiResource('paket')` (order irrelevant here, but keep it near the top of the admin block for discoverability, mirroring benchmark's `GET /overview`). |
| `app/Http/Controllers/PaketController.php` (331 lines) | Existing search/index/show/store/update/destroy with `normalizeEnumFilter`, `PurgeCloudinaryAssets`, `with('images')->withCount('pesanan')`. | **No change** — but `OverviewController` will `use App\Models\Paket` and leverage `Paket::bestSeller()` scope if available. |
| `app/Http/Controllers/PesananController.php` | Exists, uses `PesananService`, `HargaService`, `StrukService`, `PesananResource`. | **No change** — but `OverviewController` will query `Pesanan` directly for aggregates (counts, revenue, status groups). |
| `app/Http/Controllers/Controller.php` (24 lines) | Base controller with `respondWithPagination`. Not needed for overview (no pagination), but available. | **No change**. |
| `app/Enums/StatusPesananEnum.php` | Backed enum `pending/confirmed/completed/cancelled` — needed for `PesananStatusCount` grouping. | **No change** — query via `DB::raw` and `groupBy('status_pesanan')`. |
| `app/Models/{Paket,Pesanan,Galeri,User}` | Existing, with `casts()`, `fillable`, relations (`paket->pesanan`, `paket->images`). | **No change** — `OverviewController` uses them read-only. |
| `app/Http/Resources/{PaketResource,PesananResource,GaleriResource}` | Existing serializers. Not used by overview (overview returns aggregates, not resource collections). | **No change**. |
| No `OverviewController.php` yet | Missing — this is the primary backend file to create. | **Create** `backend/app/Http/Controllers/OverviewController.php` mirroring benchmark's structure (flat namespace, `Cache::remember`, 10s TTL, `response()->json(['reports' => $reports])`). |
| No `Overview` pest tests | Missing. | Optional in PRD phase; execution phase should add `tests/Feature/OverviewApiTest.php` if `WORKFLOW.md` mandates. |

**Existing docs that will be updated in execution phase:** `backend/docs/api-collection.md` (add `GET /admin/overview` to endpoint map, `§5 Key Payload Rules` unchanged, `§6 Request/Response Shapes` add overview envelope), `backend/docs/database.md` (no schema change — read-only aggregates).

---

## 4. Data Modeling — What the Admin Overview MUST Display

Derived from `docs/project-context.md` (UMKM, WhatsApp-first, 5 packages), `docs/architecture.md` §4 (ERD), `backend/docs/database.md` (Neon, `total_harga`, `status_pesanan`, `is_best_seller`), and benchmark parity.

**Principle:** Every metric must be *actionable for a one-kitchen UMKM*, not vanity analytics. The overview answers three questions: **What is pending? What is earning? What is popular?**

### 4.1 Stat Cards (Top Row — 4-Card Grid via `SectionCards`)

| # | Title (Card) | Description | Domain Source | Value Type | Icon (Hugeicons) | Benchmark Analog |
|---|---|---|---|---|---|---|
| 1 | **Total Paket** | Jumlah paket aktif | `Paket::count()` | `number` | `PackageIcon` / `SpoonAndForkIcon` | `totalDokter` |
| 2 | **Total Pesanan** | Total riwayat pesanan | `Pesanan::count()` | `number` | `ShoppingBag02Icon` / `ClipboardIcon` | `totalAntrian` |
| 3 | **Pesanan Pending** | Perlu konfirmasi (action queue) | `Pesanan::where('status_pesanan','pending')->count()` | `number` | `Clock01Icon` / `Timer01FreeIcons` | `totalPasien` |
| 4 | **Galeri Acara** | Dokumentasi event | `Galeri::count()` | `number` | `Image01Icon` / `HospitalLocationIcon` | `totalPoli` |

*Why these four:* They are the direct sitemap entities (Dashboard page §9 says "Total menus, total categories, side-dish summary" — re-interpreted for the 4 core tables). `Pesanan Pending` is the only card that is an *action queue*, preventing the dashboard from being purely vanity counts. Alternative `Pendapatan Hari Ini` was considered but moved to a *highlight* in the trends chart instead, to preserve the 4-card grid that the benchmark's `@container/card` layout expects.

**Optional 5th/6th cards** (if benchmark parity is relaxed): `Pendapatan Hari Ini` (`Pesanan::whereDate(...)->sum('total_harga')`), `Best Seller Count` (`Paket::where('is_best_seller', true)->count()`). Keep the grid at 4 for strict parity; add them only if the design system allows `@5xl/main:grid-cols-6`.

### 4.2 Distribution Charts (Middle Row — Donut PieCharts via `ChartDistribution`)

| Chart | Title | Description | Source Query | Config Key | Benchmark Analog |
|---|---|---|---|---|---|
| A | **Status Pesanan** | Distribusi status hari ini | `Pesanan::select('status_pesanan', DB::raw('count(*) as count'))->groupBy('status_pesanan')->pluck('count','status_pesanan')` → `{pending, confirmed, completed, cancelled}` | `pesananStatusChartConfig` | `AntrianstatusCount` |
| B | **Kategori Paket** | Distribusi paket per kategori | `Paket::select('kategori_paket', DB::raw('count(*) as count'))->groupBy('kategori_paket')->pluck('count','kategori_paket')` → `{Nasi Box, Prasmanan, Snack, Tumpeng}` | `kategoriPaketChartConfig` | `JenisKelaminPasienCount` |
| C | **Kategori Acara** | Distribusi paket per acara | `Paket::select('kategori_acara', ...)->groupBy('kategori_acara')->pluck('count','kategori_acara')` | `kategoriAcaraChartConfig` | `JenisKelaminDokterCount` |
| D | **Status Galeri** *(optional)* | Galeri per event category if needed | `Galeri::select(...)->groupBy(...)` | — | `DokterstatusCount` |

In `overview-block.tsx`, render **2** of these at a time (mirroring benchmark's `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` with 1 `ChartActivityTrends` spanning 3 cols + 1 `ChartDistribution`). For the PRD, the default is **Status Pesanan** (most actionable). The other two can be uncommented as in the benchmark's commented blocks.

### 4.3 Activity Trends (Full-Width AreaChart via `ChartActivityTrends`)

**Title:** `Tren Pesanan & Pendapatan`
**Description:** `Pesanan dan pendapatan harian`

**Source query (mirrors benchmark's `countsByDate` but catering-typed):**
```php
$paketCounts    = Paket::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))->groupBy(DB::raw('DATE(created_at)'))->pluck('count','date');
$pesananCounts  = Pesanan::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))->groupBy(DB::raw('DATE(created_at)'))->pluck('count','date');
$pendapatanByDate = Pesanan::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_harga) as total'))->groupBy(DB::raw('DATE(created_at)'))->pluck('total','date');
$allDates = collect(array_merge($paketCounts->keys()->toArray(), $pesananCounts->keys()->toArray(), $pendapatanByDate->keys()->toArray()))->unique()->sort();
$countsByDate = $allDates->map(fn($date) => ['date'=>$date, 'pesanan'=>$pesananCounts->get($date,0), 'pendapatan'=>(int)$pendapatanByDate->get($date,0)])->values();
```
**Frontend `CountsByDate` shape:** `{ date: string, pesanan: number, pendapatan: number }` (benchmark was `{ date, pasien, antrian, dokter }`). The chart's `chartConfig` becomes `{ pesanan: {label:"Pesanan", color:"var(--chart-1)"}, pendapatan: {label:"Pendapatan", color:"var(--chart-2)"} }`, and `timeRange` stays `all/90d/30d/7d` (copied verbatim). Totals in `CardAction` show `totals.pesanan` + `totals.pendapatan` (formatted via `formatRupiah`).

### 4.4 Top-N Highlight (Optional — Mirrors `topDokter`)

| Field | Source | Description |
|---|---|---|
| **Top Paket (Terlaris)** | `Paket::withCount('pesanan')->orderBy('pesanan_count','desc')->take(5)->get()` (or `where('is_best_seller', true)` as curated alternative) | List of 5 best-selling packages for a small "Terlaris" list below the charts. Reuses `PaketResource` shape (`id`, `nama_paket`, `thumbnail`, `pesanan_count`). |

*Decision:* Keep `Top Paket` as a **data point in the JSON** even if the initial `overview-block.tsx` does not render it — the benchmark always returns `topDokter` alongside counts. The frontend can later consume it without another backend change.

### 4.5 Live Clock Header (Already Done)

`useMonitorClock()` returning `{ jam, tanggal }` in `overview-block.tsx` `header` is preserved. Dark mode classes `text-neutral-900 dark:text-neutral-100`, `text-primary`, `text-muted-foreground` stay. This is the only non-query UI in the block and is working.

### 4.6 Explicit Non-Goals for the Overview (UMKM Scope Discipline)

- No **customer growth** chart (no `users` time series needed — UMKM has one admin).
- No **popular menu items** time series beyond `Top Paket` (the 5 seed packages have fixed `menu_utama` JSON).
- No **pending deliveries** map (no delivery tracking table; delivery is WhatsApp-confirmed).
- No **inventory/stock** (no stock table; capacity is `kapasitas_produksi` per paket, not a consumable stock).

---

## 5. API Contract — `GET /api/v1/admin/overview` (Proposed)

**This contract is the execution-phase source of truth. It mirrors `backend/docs/api-collection.md` §5–§6 and `backend/docs/architecture.md` §5 envelope.**

### 5.1 Endpoint Definition

```
GET /api/v1/admin/overview
Middleware: auth:sanctum
Controller: App\Http\Controllers\OverviewController@index
Cache: Cache::remember('overview_reports', 10, fn() => ...)
No query params. No pagination.
```

### 5.2 Request

```
GET /api/v1/admin/overview HTTP/1.1
Authorization: Bearer <sanctum-token>
Accept: application/json
```

### 5.3 Success Response — `200 OK`

```json
{
  "reports": {
    "totalPaket": 5,
    "totalPesanan": 42,
    "totalPesananPending": 3,
    "totalGaleri": 12,

    "pesananStatusCount": {
      "pending": 3,
      "confirmed": 12,
      "completed": 24,
      "cancelled": 3
    },
    "paketKategoriCount": {
      "Nasi Box": 1,
      "Prasmanan": 2,
      "Snack": 1,
      "Tumpeng": 1
    },
    "paketAcaraCount": {
      "Pernikahan": 2,
      "Kantor": 1,
      "Ulang Tahun": 1,
      "Arisan": 1,
      "Umum": 1
    },

    "topPaket": [
      {
        "id": 1,
        "nama_paket": "Nasi Box Hemat",
        "thumbnail": "https://res.cloudinary.com/.../nasi-box-hemat.jpg",
        "pesanan_count": 18,
        "is_best_seller": true
      }
    ],

    "countsByDate": [
      {
        "date": "2026-08-10",
        "pesanan": 2,
        "pendapatan": 450000
      },
      {
        "date": "2026-08-11",
        "pesanan": 5,
        "pendapatan": 1200000
      }
    ]
  }
}
```

**Type guarantees:**
- All counts are `number` (0 when empty, never `null`).
- All distribution maps are `Record<string, number>` (empty `{}` when no rows, never `null`).
- `countsByDate` is `array` ordered by `date ASC` (ISO `YYYY-MM-DD` strings, **not** `Date` objects — frontend parses with `new Date(item.date)` as the benchmark does).
- `pendapatan` is `number` (integer rupiah, `SUM(total_harga)` cast to int; `0` when no pesanan that day).
- `topPaket` is `array` of 0–5 objects (empty `[]` when no paket).

### 5.4 Error Responses

| Status | Condition | Body |
|---|---|---|
| `401` | Missing/invalid Bearer token | `{ "message": "Unauthenticated." }` (Sanctum default) |
| `500` | Unexpected DB/cache failure | `{ "message": "Failed to load overview reports." }` (try/catch in controller, log via `Log::error`) |

### 5.5 Caching & Invalidation

- `Cache::remember('overview_reports', 10, ...)` — 10 seconds, matching benchmark.
- No manual `Cache::forget` on `PaketController@store/update/destroy` or `PesananController@store/update/destroy` is required for the PRD (the 10s TTL is short enough that the dashboard self-heals). Execution phase may optionally add `Cache::forget('overview_reports')` in those controllers if `docs/architecture.md` or the team requests instant invalidation.

### 5.6 Benchmark Response Parity Table

| KlikAntri `reports` key | Catering `reports` key | Notes |
|---|---|---|
| `totalDokter` | `totalPaket` | Same `Model::count()` pattern |
| `totalAntrian` | `totalPesanan` | Same |
| `totalPasien` | `totalPesananPending` | Narrowed to actionable subset |
| `totalPoli` | `totalGaleri` | Same |
| `AntrianstatusCount` | `pesananStatusCount` | `status` → `status_pesanan`, casing normalized to camelCase `pesananStatusCount` for consistency (benchmark uses `AntrianstatusCount` pascal — catering normalizes). |
| `JenisKelaminPasienCount` | `paketKategoriCount` | `jenis_kelamin` → `kategori_paket` |
| `JenisKelaminDokterCount` | `paketAcaraCount` | `jenis_kelamin` (doctor) → `kategori_acara` |
| `DokterstatusCount` | *(omitted)* | No `status` on Paket; omitted rather than invented. |
| `topDokter` | `topPaket` | `withCount('antrian')` → `withCount('pesanan')`, `nama` → `nama_paket`, includes `thumbnail`, `is_best_seller`. |
| `countsByDate: {date, dokter, pasien, antrian}` | `countsByDate: {date, pesanan, pendapatan}` | `dokter` dropped (no daily dokter creation), `pasien` → `pesanan`, `antrian` → `pesanan` (same), added `pendapatan` (SUM). Benchmark's `dokterCounts/pasienCounts/antrianCounts` merge becomes `paketCounts/pesananCounts/pendapatanByDate`. |
| `countsByDate` merge via `array_merge(keys)->unique()->sort()` | **Identical** | Reused verbatim. |

---

## 6. Frontend Component Tree & Data Model (Execution Spec)

### 6.1 File Tree to Be Created/Modified (Strict Benchmark Parity)

**No new top-level folders.** All files live under the existing `frontend/src/components/ui/core/block/admin/overview` (mirroring KlikAntri's `.../block/overview`).

```
frontend/src/components/ui/core/block/admin/overview/
├── overview-block.tsx                 # MODIFY — replace clinic DataCards (4), chart mappers, icons, chartConfig refs
├── components/
│   ├── section-card.tsx               # KEEP — generic, no change (value: number|string already supports currency)
│   ├── chart-distribution.tsx         # KEEP — generic, no change (receives new ChartConfig via props)
│   └── chart-activity-trends.tsx      # MODIFY — replace internal chartConfig (antrian/pasien) with pesanan/pendapatan variant; keep timeRange logic, Select, empty state
├── config/
│   └── analytics-chart-config.ts      # MODIFY — replace antrianStatusChartConfig/dokterStatusChartConfig/genderChartConfig with pesananStatusChartConfig/kategoriPaketChartConfig/paketAcaraChartConfig (+ pendapatanChartConfig if needed)
├── hooks/
│   └── use-overview-query.ts          # CREATE (or rewrite stub) — TanStack Query wrapper: FetchOverview() / useOverviewQuery() → GET /api/v1/admin/overview
└── types/
    └── overview-type.ts               # MODIFY — replace Reports with catering shape (see §6.2)
```

**New files NOT to be created in this phase** (deferred to execution phase, but spec'd here for completeness):
- `frontend/src/services/overview-service.ts` — optional; benchmark inlines `api.get()` inside the hook. Catering may keep the inline pattern (like `pesanan-service.ts` vs inline in `use-paket-search.ts`) — execution phase decides, but either is parity-compliant as long as it uses `src/api/client.ts` (`Ky` + `auth:sanctum` + `afterResponse` 401).

**Files strictly NOT to be created/modified in execution phase:**
- `frontend/src/components/ui/core/block/admin/overview/components/` new chart types — reuse the two existing chart components.
- `frontend/src/pages/admin/dashboard-page.tsx` — already correct (`<OverviewBlock />`).
- `frontend/src/router/index.tsx` — no route change.
- `src/components/ui/fragments/shadcn-ui/card.tsx` / `chart.tsx` — shared primitives, no change.

### 6.2 Type Definitions (Exact — `types/overview-type.ts`)

```ts
// frontend/src/components/ui/core/block/admin/overview/types/overview-type.ts
export interface OverviewResponse {
  reports: Reports
}

export interface Reports {
  totalPaket: number
  totalPesanan: number
  totalPesananPending: number
  totalGaleri: number

  pesananStatusCount: PesananStatusCount
  paketKategoriCount: PaketKategoriCount
  paketAcaraCount: PaketAcaraCount

  topPaket: TopPaket[]
  countsByDate: CountsByDate[]
}

export interface PesananStatusCount {
  pending: number
  confirmed: number
  completed: number
  cancelled: number
}

export type PaketKategoriCount = Record<string, number> // Nasi Box | Prasmanan | Snack | Tumpeng
export type PaketAcaraCount = Record<string, number>   // Pernikahan | Kantor | Ulang Tahun | Arisan | Umum

export interface CountsByDate {
  date: string // YYYY-MM-DD (benchmark used Date, catering uses string for JSON safety)
  pesanan: number
  pendapatan: number // integer rupiah, SUM(total_harga)
}

export interface TopPaket {
  id: number
  nama_paket: string
  thumbnail: string | null
  pesanan_count: number
  is_best_seller: boolean
}
```

**Why `date: string` not `Date`:** The benchmark's `CountsByDate { date: Date, pasien, antrian }` relies on `DATE(created_at)` string keys from `pluck('count','date')` which are strings in JSON. `pesanan/types/pesanan-types.ts` already uses `created_at: string`. Using `string` avoids a `new Date()` hydration mismatch and matches `ChartActivityTrends`'s `tickFormatter` which does `new Date(value)`.

### 6.3 Hook Contract (`hooks/use-overview-query.ts`)

```ts
// Mirrors use-paket-query.ts / use-struk-query.ts (TanStack Query v5)
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { OverviewResponse } from "../types/overview-type"

export function FetchOverview() {
  return useQuery<OverviewResponse>({
    queryKey: ["admin", "overview"],
    queryFn: async () => api.get("admin/overview").json<OverviewResponse>(),
    placeholderData: keepPreviousData,
    staleTime: 10_000, // matches Cache::remember 10s
  })
}
// Alias for teams preferring useOverviewQuery naming:
export const useOverviewQuery = FetchOverview
```

### 6.4 `overview-block.tsx` DataCard Mapping (Exact — Replace Lines 49–81)

```ts
const dataCards: DataCard[] = [
  { title: "Total Paket",      description: "Jumlah paket aktif",      value: reports.totalPaket,          icon: PackageIcon,        label: "Paket" },
  { title: "Total Pesanan",    description: "Total riwayat pesanan",  value: reports.totalPesanan,        icon: ShoppingBag02Icon, label: "Pesanan" },
  { title: "Pesanan Pending",  description: "Perlu konfirmasi",       value: reports.totalPesananPending, icon: Clock01Icon,        label: "Pending" },
  { title: "Galeri Acara",     description: "Dokumentasi event",      value: reports.totalGaleri,         icon: Image01Icon,        label: "Galeri" },
]
```

Icons imported from `@hugeicons/core-free-icons` (already used in `overview-block.tsx` as `UserIcon`, `Queue01Icon`, etc.; swap to catering-relevant set: `PackageIcon`, `ShoppingBag02Icon`, `Clock01Icon`, `Image01Icon` — all exist in Hugeicons).

Chart mappers (replace lines 82–88):
```ts
const pesananStatusData = Object.entries(reports.pesananStatusCount || {}).map(([name, count]) => ({ name, count }))
const paketKategoriData = Object.entries(reports.paketKategoriCount || {}).map(([name, count]) => ({ name, count }))
```

Render grid (replace lines 119–163, keep `@container/main` and header with `useMonitorClock`):
```tsx
<div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
  <ChartActivityTrends className="col-span-3" data={countsByDate} title="Tren Pesanan & Pendapatan" description="Pesanan dan pendapatan harian" />
  <ChartDistribution data={pesananStatusData} chartConfig={pesananStatusChartConfig} title="Status Pesanan" description="Distribusi status hari ini" nameKey="Pesanan" emptyMessage="status pesanan" />
  {/* Optional second row (uncomment as needed, matches benchmark's 2 commented charts): */}
  {/* <ChartDistribution data={paketKategoriData} chartConfig={kategoriPaketChartConfig} title="Kategori Paket" ... /> */}
  {/* <ChartDistribution data={paketAcaraData}    chartConfig={paketAcaraChartConfig}    title="Kategori Acara" ... /> */}
</div>
```

### 6.5 Chart Config (`config/analytics-chart-config.ts`)

```ts
export const pesananStatusChartConfig: ChartConfig = {
  count: { label: "Jumlah" },
  pending:   { label: "Pending",   color: "var(--chart-3)" }, // amber
  confirmed: { label: "Dikonfirmasi", color: "var(--chart-1)" }, // primary
  completed: { label: "Selesai",   color: "var(--chart-2)" }, // success
  cancelled: { label: "Dibatalkan",color: "var(--chart-5)" }, // destructive
}
export const kategoriPaketChartConfig: ChartConfig = {
  count: { label: "Jumlah" },
  "Nasi Box":  { label: "Nasi Box",  color: "var(--chart-1)" },
  "Prasmanan": { label: "Prasmanan", color: "var(--chart-2)" },
  "Snack":     { label: "Snack",     color: "var(--chart-3)" },
  "Tumpeng":   { label: "Tumpeng",   color: "var(--chart-4)" },
}
export const paketAcaraChartConfig: ChartConfig = {
  count: { label: "Jumlah" },
  "Pernikahan":  { label: "Pernikahan",  color: "var(--chart-1)" },
  "Kantor":      { label: "Kantor",      color: "var(--chart-2)" },
  "Ulang Tahun": { label: "Ulang Tahun", color: "var(--chart-3)" },
  "Arisan":      { label: "Arisan",      color: "var(--chart-4)" },
  "Umum":        { label: "Umum",        color: "var(--chart-5)" },
}
```

Keep `distributionColors` and helper `getPesananStatusLabel` (mirrors `getAntrianStatusLabel`).

### 6.6 Styling & Layout Preservation

- Keep `section.space-y-4.px-10.py-6` → `@container/main.flex.flex-col.gap-6` → `header.m-auto.flex.w-full.flex-col.border-b.px-0.pb-7` → `SectionCards` (`grid @5xl:grid-cols-4`) → `grid gap-4 *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4`.
- Keep `chart-activity-trends.tsx` internal `Select` (`all/90d/30d/7d`) and `CardAction` totals — just swap labels from `Antrian/Pasien` to `Pesanan/Pendapatan`.
- No new Tailwind tokens — reuse `chart-1`..`chart-5` from `src/index.css` (warm cream/amber OKLCH theme already in place).

---

## 7. Backend Integration Spec (Execution Phase)

### 7.1 Controller — `backend/app/Http/Controllers/OverviewController.php`

**Namespace:** `App\Http\Controllers` (flat, LOCKED — see `backend/docs/architecture.md`).

**Scaffold:**
```php
<?php
namespace App\Http\Controllers;

use App\Models\Galeri;
use App\Models\Paket;
use App\Models\Pesanan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OverviewController extends Controller
{
    public function index()
    {
        $reports = Cache::remember('overview_reports', 10, function () {
            // Totals
            // Distributions (pluck groupBy)
            // Top Paket (withCount pesanan)
            // countsByDate (DATE(created_at) merge)
            // return array_merge(...)
        });
        return response()->json(['reports' => $reports]);
    }
    // create/store/show/edit/update/destroy remain empty (read-only controller)
}
```

**Full query set (copy-paste ready, benchmark-faithful):**
- See §4.3 for per-date `paketCounts/pesananCounts/pendapatanByDate` and §4.1 for totals. Use `DB::raw('DATE(created_at) as date')` and `pluck` exactly as the benchmark does — no Eloquent `->get()->groupBy()` in PHP (DB does the work).
- `topPaket` uses `Paket::withCount('pesanan')->orderBy('pesanan_count','desc')->take(5)->get()` and maps to `{id, nama_paket, thumbnail, pesanan_count, is_best_seller}` (or `PaketResource::collection` with `only` if the team prefers Resources, but benchmark returns raw `->get()` — either is acceptable if documented).

### 7.2 Route — `backend/routes/api.php`

```php
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/overview', [OverviewController::class, 'index'])->name('overview.index');
    // ... existing Route::get('/paket/search'), apiResource('paket'), etc. (order does not matter for /overview)
});
```

**Verification:** `php artisan route:list --path=overview` must show `GET api/v1/admin/overview`.

### 7.3 Docs Updates (Execution Phase Must Do)

- `backend/docs/api-collection.md`: Add row `| GET | /admin/overview | Overview report (totals + distributions + trends) |` to `§4.2 Admin & Mini POS` table; add `§5.X Cache note` and `§6.X Response shape` example (copy from §5.3 of this PRD).
- `backend/docs/architecture.md`: Add `Route::get('/overview', ...)->name('overview.index')` to `§5 Route Conventions` code block.

---

## 8. Non-Functional & Cross-Cutting

- **Auth:** `auth:sanctum` only; `401` on missing token (no role gate beyond `auth`). If `role` middleware is added later, it lives in `routes/api.php`, not in the controller.
- **Caching:** 10-second `Cache::remember` matching benchmark. Do not add cache tags or `Cache::forget` in this PRD; execution phase may add `Cache::forget('overview_reports')` in `PaketController@store/update/destroy` and `PesananController@store/update/destroy` if the team wants instant invalidation (document as optional).
- **Performance:** All queries are `count(*)`/`groupBy`/`pluck` — no `->get()` loops in PHP (except the final 5-row `topPaket`). `countByDate` merges three `pluck` results, not three full collections.
- **i18n:** UI strings in `overview-block.tsx` are Bahasa Indonesia (`Selamat Datang`, `Berikut ini rangkuman`, `Gagal memuat data overview.`) — keep them; do not translate to English.
- **Design tokens:** Warm cream/amber OKLCH from `frontend/docs/design.md` is already applied via `chart-1`..`chart-5` CSS variables; no new colors.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `thumbnail` may be `null` on older seed rows | `TopPaket.thumbnail` is `string\|null`; frontend handles via `MediaItem` fallback (like `pesanan-calc-panel.tsx` already does with `Image01Icon`). |
| `pesananStatusCount` keys are dynamic (only statuses with rows appear) | Backend always returns all 4 keys via `pluck` + frontend `Object.entries(...||{})` with `0` fallback for missing keys in `chartData` (e.g., `reports.pesananStatusCount.pending ?? 0`). Alternatively, seed all 4 keys with `0` in the controller via `$defaults = array_fill_keys(['pending','confirmed','completed','cancelled'],0); array_merge`. |
| `countsByDate` sparse (no rows on quiet days) | `allDates` is the union of all three plucks — days with no `pesanan` still appear with `pesanan:0, pendapatan:0` (or are omitted if `paketCounts` empty too; frontend `ChartActivityTrends` handles empty `data` via empty state). |
| Cache stampede under `php artisan serve` single-thread | 10-second TTL is short; benchmark explicitly notes this is intentional for a UMKM dashboard under serverless Neon. For production queue workers, keep the same TTL. |

---

## 10. Execution Order (Gated, After PRD Approval)

| Phase | Deliverable | Files |
|---|---|---|
| **E1 — Backend** | `OverviewController.php` + `GET /admin/overview` route + `api-collection.md` update | `backend/app/Http/Controllers/OverviewController.php`, `backend/routes/api.php` |
| **E2 — Data layer** | `types/overview-type.ts` + `hooks/use-overview-query.ts` (+ optional `services/overview-service.ts`) | `frontend/src/components/ui/core/block/admin/overview/types/*`, `hooks/*` |
| **E3 — Config & UI** | `analytics-chart-config.ts` (catering configs) + `overview-block.tsx` (DataCards + chart mappers + icons) | `frontend/src/components/ui/core/block/admin/overview/config/*`, `overview-block.tsx`, `chart-activity-trends.tsx` (swap config) |
| **E4 — QA gates** | `npm run typecheck && npm run lint && npm run lint:design` + browser pass | — |

---

## 11. Appendix — Raw Benchmark Snippets (For Traceability)

**Frontend benchmark `overview-block.tsx` (KlikAntri) — structure mirrored:**
> `FetchOverview() → isLoading→Spinner, isError→text, reports→DataCard[] (4 cards) → SectionCards → grid(ChartActivityTrends col-span-3 + ChartDistribution)` plus `useMonitorClock` header. All boolean gates and class names copied verbatim into Catering Nusantara.

**Backend benchmark `OverviewController.php` (KlikAntri) — verbatim logic mirrored:**
> `Cache::remember('overview_reports', 10, fn() => { $totals=[...count()]; $statusCounts=Model::select(...groupBy->pluck); $topDokter=withCount->orderBy->take(5)->get(); $dokterCounts/antrianCounts/pasienCounts=select(DATE...)->pluck; $allDates=collect(array_merge(keys))->unique()->sort(); $counts=map(date=>[...get(...,0)]); return array_merge($totals,[...countsByDate=>...]) })`

These snippets are the **architectural parity proof** — no new pattern was invented for Catering Nusantara beyond domain noun translation.

---

## 12. PRD Authorship

- **Sources inspected:** 6 local files under `frontend/src/components/ui/core/block/admin/overview` + `backend/routes/api.php` + `docs/project-context.md` + `docs/architecture.md` + `backend/docs/architecture.md` + `backend/docs/database.md` + 2 external GitHub benchmark pages (overview folder tree + `OverviewController.php` raw).
- **Benchmarks fetched:** `https://github.com/Ahmad-Yu2up-Ar-Raf/klikantri-appointment-app/tree/main/Front-End/Web/src/components/ui/core/block/overview` and `https://github.com/Ahmad-Yu2up-Ar-Raf/klikantri-appointment-app/blob/main/Back-End/app/Http/Controllers/OverviewController.php`.
- **Phase limit respected:** No `.ts/.tsx/.php` source file was created or modified; only this PRD Markdown was written.
