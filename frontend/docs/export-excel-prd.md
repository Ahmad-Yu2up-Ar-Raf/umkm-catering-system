# PRD — Export to Excel (Pesanan, Paket, Galeri, Testimoni)

> Status: DRAFT for review — no app code changed in this phase.
> Scope: admin master tables only. Read/projection feature, no schema change.
> Stack: Laravel 13 + Sanctum + PostgreSQL / React 19 + TS + shadcn/ui + TanStack Query + Ky + sonner.

## 0. Triage note (why this file exists)

Previous planning turn returned the architecture inline in chat but never
persisted a physical `.md` artifact, so there was nothing reviewable under
`frontend/docs/`. This file closes that gap. It also hardens two
under-specified constraints from that turn:

1. **Full dataset, safely** — the old plan said "bypass pagination" without
   pinning the exact mechanism. This PRD mandates `cursor()` + `StreamedResponse`
   via `openspout/openspout v4` (never `Model::all()` / unbounded `paginate()`),
   reusing each controller's existing `index()` query builder so filters/sorts
   stay identical between table view and Excel output.
2. **UI/UX feedback** — the old plan named loading/toast loosely. This PRD pins
   the exact insertion lines, the shared `useExportExcel` hook shape, id-keyed
   sonner calls (`toast.loading/success/error`), and the Ky blob-download flow
   (mirroring the proven PDF-invoice pattern in `master-pesanan-block.tsx`).

## 1. Goals / non-goals

Goals:

- One-click `Export` next to each `Tambah/*` button exports **100% of rows**
  matching current filters/sorts (pagination bypassed), all columns.
- `.xlsx` opens cleanly: bold frozen header row, sane column widths,
  correct number/date formats, Cloudinary URLs as plain text in dedicated
  columns (never embedded bytes).
- Button shows loading/disabled state; sonner toasts for loading/success/error.

Non-goals: CSV/PDF export, scheduled/queued exports, new routes/pages,
schema/migration changes, client-side `total_harga` recompute, embedding
image binaries into cells.

## 2. Constraints (from AGENTS.md + docs, verified)

- No schema change, no new tables, no new sitemap routes (export = table action).
- `total_harga = (jumlah_paket * harga_paket_satuan) + biaya_tambahan` is
  server truth (`HargaService::totalHarga`); `nomor_struk = STR-YYYYMMDD-XXXX`
  is server-generated (`StrukService::generate`). Excel echoes stored values.
- shadcn/ui `Button` reuse; Tailwind semantic tokens only; `zustand` = UI state
  only; server data = TanStack Query + Ky (`src/api/client.ts`: Bearer,
  30 s timeout, 401 → `/login`).
- Verified absences: no excel lib in `backend/composer.json:11-16` or
  `frontend/package.json:16-54`; no `/export` route in `backend/routes/api.php`;
  no `xlsx|exceljs` hits in `frontend/src/**`.

## 3. Backend architecture

### 3.1 Library

`composer require openspout/openspout:^4` (streaming writer, constant memory,
header styling + freeze pane + column widths + number formats). Rejected:
`maatwebsite/excel` (extra layer over full PhpSpreadsheet, loads collections
into memory by default), hand-rolled CSV renamed to `.xls` (breaks the
explicit `.xlsx` + styling requirement).

### 3.2 Routes (`backend/routes/api.php`, admin group L37-68)

```php
Route::get('/paket/export',   [PaketController::class, 'export'])->name('admin.paket.export');
Route::get('/galeri/export',  [AdminGaleriController::class, 'export'])->name('admin.galeri.export');
Route::get('/testimoni/export',[AdminTestimoniController::class, 'export'])->name('admin.testimoni.export');
Route::get('/pesanan/export', [PesananController::class, 'export'])->name('pesanan.export');
```

Rules: all inside `auth:sanctum` admin prefix; each literal `/export` line
placed **before** its `apiResource`/wildcard (same rule as existing
`paket/search` comment at L39-40); pesanan export before `pesanan/{pesanan}`.

### 3.3 Query reuse — pagination bypass (the core constraint)

Anti-pattern (forbidden): `->paginate($request->integer('perPage', N))`
with a large `perPage`, or `Model::all()` — both load the full set into
memory and inherit the current uncapped-`perPage` risk
(`PesananController@index:71-73`, `PaketController@index:67`, admin galeri/testimoni equivalents).

Required pattern per controller:

1. Extract the existing `index()` filter/sort builder into a private method,
   e.g. `buildListQuery(Request $request): Builder` (statuses whitelists in
   `PesananController:18-20,37-50`, search LIKE `:63-69`, sortable whitelist
   `:16,47-50`; paket search + `normalizeEnumFilter` + `with('images')/
   withCount/withAvg`; galeri kategori/featured; testimoni `scopeSearch` +
   visibility whitelist). `index()` and `export()` both call it — filters in
   Excel always match the table view.
2. `export()` executes with `->orderBy($sortBy,$sortDir)->cursor()` (or
   `chunk(500)` if eager loads complicate cursors) inside
   `response()->streamDownload(...)`. Eager-load only what columns need
   (`pesanan.paket`, `paket.images`, `testimoni.paket`) to avoid N+1 without
   over-fetching. Never pass `page/perPage` through.

### 3.4 Response

- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="{module}-YYYYMMDD-HHmm.xlsx"`
- `Cache-Control: no-store`. Auth failures stay JSON 401 (Ky interceptor
  handles redirect); validation errors on filter params stay JSON 422 —
  never a half-written spreadsheet with error JSON inside.

### 3.5 Workbook styling (OpenSpout, all 4 sheets)

- Row 1: bold, filled background, frozen pane, auto-filter.
- Column widths: precomputed per module (URL columns widest, e.g. 60 chars;
  text 30–40; numbers/dates 15–20) — OpenSpout has no true auto-fit on stream,
  so fixed widths tuned once per module satisfy "auto-sized for readability"
  without buffering the whole sheet.
- Formats: `harga/total` as numbers (`#,##0`), `tanggal_*` as dates,
  `id/counts/rating` as integers, everything else text (prevents Excel
  coercing phone numbers like `08…` into numbers).
- 1:N `paket_images` joined into single `images_urls` cell with `"; "`
  separator (keeps one row per package). JSON arrays (`menu_utama`,
  `menu_tambahan`, `fasilitas_termasuk`, `detail_tambahan`) joined the same way.

### 3.6 Column maps (all columns, image URLs dedicated)

- **pesanan** (no image col): `nomor_struk | nama_pemesan | no_telepon |
  paket_nama | jumlah_paket | harga_paket_satuan | biaya_tambahan |
  total_harga (stored) | status_pesanan | metode_pembayaran | tanggal_acara |
  alamat | menu_tambahan (joined) | detail_tambahan (joined) | catatan | created_at`
- **paket**: `nama_paket | kategori_paket | kategori_acara | harga_per_porsi |
  min_order | kapasitas_produksi | thumbnail_url (dedicated) |
  images_urls (dedicated, joined) | menu_utama | menu_tambahan |
  fasilitas_termasuk | deskripsi | is_best_seller | terjual_count | created_at`
- **galeri**: `nama_acara | kategori_acara | deskripsi_acara |
  gambar_acara_url (dedicated) | tanggal_acara | lokasi | jumlah_tamu |
  is_featured | created_at`
- **testimoni** (no image col — `gambar` dropped `2026_09_15_000005`):
  `nama | pesanan | acara | lokasi | paket_nama | rating | visibility |
  tanggal_acara | created_at`

### 3.7 New backend files

- `app/Http/Controllers/Admin/Concerns/BuildsExportQuery.php` (or per-controller
  private builders) — shared filter/sort extraction.
- `app/Services/Export/{PesananExport,PaketExport,GaleriExport,TestimoniExport}.php`
  — headers, widths, formats, row mappers.
- `export()` methods (or thin `*ExportController`s) + 4 routes + `composer.json`
  dep + `backend/docs/api-collection.md` entries.

## 4. Frontend architecture

### 4.1 Injection points (exact — rescan verified)

| Module | Toolbar actions div | Tambah button | Master wiring |
|---|---|---|---|
| paket | `paket/components/paket-toolbar.tsx:77` | `L79-82` `Tambah Paket` (sibling of `PaketViewToggle` L78) | `master-paket-block.tsx:62` state, `L160` onAdd, `L247` drawer, `L232-244` pagination |
| pesanan | `pesanan/components/pesanan-toolbar.tsx:60` | `L72-75` `Tambah Pesanan` | `master-pesanan-block.tsx:78` state, `L300` onAdd, `L364` drawer, `L349-361` pagination |
| galeri | `galeri/components/galeri-toolbar.tsx:62` | `L64-67` `Tambah Galeri` (sibling of `GaleriViewToggle` L63) | `master-galeri-block.tsx:58` state, `L145` onAdd, `L225` drawer, `L210-222` pagination |
| testimoni | `testimoni/components/testimoni-toolbar.tsx:61` | `L62-65` `Tambah Testimoni` (table-only, no view toggle) | `master-testimoni-block.tsx:54` state, `L143` onAdd, `L202` drawer, `L187-199` pagination |

Each toolbar gains props `onExport: () => void; isExporting: boolean` and renders,
immediately before the Tambah button:

```tsx
<Button variant="outline" size="sm" onClick={onExport} disabled={isExporting}>
  {isExporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <DownloadIcon className="mr-2 size-4" />}
  {isExporting ? "Mengekspor…" : "Export"}
</Button>
```

shadcn `Button` (`fragments/shadcn-ui/button.tsx`), Hugeicons download icon
(same pattern as `PlusSignIcon` in toolbars), no hex colors.

### 4.2 Shared hook — `src/hooks/use-export-excel.ts` (new, one file for all 4)

```ts
export type ExportFetcher = (params: Record<string, string | string[]>) => Promise<Blob>;
export function useExportExcel(opts: { filename: string; fetchBlob: ExportFetcher }) {
  const [isExporting, setIsExporting] = useState(false);
  const run = async (params) => {
    if (isExporting) return;
    const id = toast.loading("Menyiapkan file Excel…");
    setIsExporting(true);
    try {
      const blob = await opts.fetchBlob(params);
      if (!blob.size) throw new Error("empty");
      const url = URL.createObjectURL(new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const a = document.createElement("a");
      a.href = url; a.download = opts.filename; document.body.appendChild(a); a.click();
      a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.success("Export Excel berhasil", { id });
    } catch {
      toast.error("Export Excel gagal — coba lagi", { id });
    } finally { setIsExporting(false); }
  };
  return { isExporting, run };
}
```

Sonner is already the toast system (`sonner.tsx`, `Toaster` in `App.tsx`);
CRUD toasts live in each `hooks/use-*-mutations.ts` (id-keyed pattern to copy);
`toast.loading` precedent exists in `master-pesanan-block.tsx:155`.

### 4.3 Ky blob fetching (per module, current filters forwarded)

```ts
// pesanan: extend src/services/pesanan-service.ts
exportBlob: (p) => api.get("admin/pesanan/export", { searchParams: buildSearchParams(p), timeout: 120_000 }).blob(),
// paket/galeri/testimoni: same shape, direct api.get("admin/{module}/export", …).blob()
```

Guards: `if (isExporting) return` (double-click), `response.blob()` (Ky, keeps
Bearer + 401 interceptor from `src/api/client.ts:26-42`), per-request
`timeout: 120_000` (global stays 30 s), `a.download` filename
`{module}-export-YYYYMMDD-HHmm.xlsx` (prefer server `Content-Disposition`
when present). Master passes its live filter/sort state (same object already
feeding `use*List` queryKeys, minus `page/perPage`) into `run(params)`.

### 4.4 TypeScript

```ts
type ExportParams = { search?: string; sort_by?: string; sort_dir?: "asc"|"desc";
  status_pesanan?: string[]; metode_pembayaran?: string[];
  kategori_paket?: string[]; kategori_acara?: string[]; visibility?: string[]; };
```

No `any`; empty-blob + non-OK responses throw to the error toast path.

## 5. Step-by-step implementation plan

**Phase A — backend (per module, same order):**

1. `composer require openspout/openspout:^4`.
2. Extract `buildListQuery()` from `index()` (pesanan → `PesananController:31-73`;
   paket/galeri/testimoni equivalents); keep `index()` behavior byte-identical.
3. Write `App\Services\Export\{Module}Export` (headers/widths/formats/row map §3.6).
4. Add `export()` streaming `cursor()` + `streamDownload` (§3.3–3.4).
5. Register route before wildcards (§3.2); document in `api-collection.md`.
6. Manual: `curl -H "Authorization: Bearer …" ".../admin/{m}/export?search=x" -o t.xlsx`
   → open, verify styling + full count (`SELECT COUNT(*)`) + URLs clickable.

**Phase B — frontend (per module):**

1. Add `exportBlob` fetcher (§4.3).
2. Add toolbar props + Export button (§4.1) left of Tambah.
3. Wire `useExportExcel` in master block, pass live filters (minus paging).
4. Manual: filter table → Export → row count matches filtered total; toasts +
   disabled state observed; 401/500 paths show error toast.

## 6. Acceptance checklist (implementation phase)

- [ ] 4 export endpoints stream full filtered sets; row counts match DB counts.
- [ ] Headers bold+frozen+filtered; widths legible; numbers/dates formatted.
- [ ] Image URLs in dedicated columns, plain text, open in browser.
- [ ] Export buttons sit directly left of all 4 Tambah buttons; loading spinner +
      disabled state; sonner loading→success/error toasts.
- [ ] No migration, no model fillable change, no shadcn core override, no new page.
- [ ] `total_harga`/`nomor_struk` echoed from server, never recomputed client-side.

## 7. Risks / limits

- OpenSpout streaming has no true auto-fit: widths are tuned constants (§3.5).
  Full auto-fit later = switch to PhpSpreadsheet (memory cost).
- Very large tables (>100k rows) may exceed even streaming + 120 s client
  timeout → then add queued export + signed download (out of scope now).
- `perPage` remains uncapped in list endpoints; export path must never read it.
