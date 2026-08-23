# PHASE 1 REPORT: MASTER DATA GALERI ARCHITECTURE & PLAN

---

## 1. Executive Summary
The **Master Data Galeri** feature empowers business owners to manage photo galleries and visual assets displayed on the public website. Following the exact architectural and design patterns established by **Master Paket**, this feature provides a robust dual-view interface (Table vs. Card Grid), responsive Drawer/Dialog forms for creation and updating, a dedicated deletion confirmation dialog, and precise Cloudinary storage routing with automatic cleanup of replaced or deleted assets.

---

## 2. Research & Benchmark Findings (from Master Paket)
- **State Management & Orchestration**: Master blocks use `MasterPaketBlock` structure with local `useState` for search (debounced via `useDebouncedValue`), filtering (`MultiSelectFilter`), sorting, pagination, and Zustand stores (`usePaketViewStore`) for view mode persistence (`grid` vs `table`).
- **Responsive Shells**: Creation and update forms use conditional rendering based on `useIsMobile()`, rendering a shadcn `Drawer` (`DrawerContent`) on mobile and a centered `Dialog` (`DialogContent` with `sm:max-w-2xl`) on desktop.
- **Uncommitted Upload Cleanup**: Active upload tracking via stores (`usePaketUploadStore`) and cleanup functions (`purgeUncommittedPaketImages`) ensure abandoned form sessions do not leave orphaned assets in Cloudinary.

---

## 3. Architecture Blueprint

### Frontend Structure (`src/components/ui/core/block/admin/galeri/`)
- `master-galeri-block.tsx`: Main orchestrator container.
- `components/galeri-table.tsx`: Table view with avatar/thumbnail preview, columns for Title, Category, Images count, and Created Date.
- `components/galeri-card-grid.tsx`: Card grid view for visual browsing.
- `components/galeri-toolbar.tsx`: Search bar, multi-select category filter, view mode toggle, and "Tambah Galeri" button.
- `components/create-galeri-drawer.tsx`: Responsive create shell with draft protection and uncommitted upload purging.
- `components/update-galeri-drawer.tsx`: Responsive update shell pre-filled with entity data.
- `components/galeri-form.tsx`: TanStack Form + Zod validation schema implementation.
- `components/galeri-form-actions.tsx`: Submit/Cancel action buttons with loading spinners.
- `components/galeri-delete-dialog.tsx`: Specialized deletion warning dialog.
- `hooks/use-galeri-query.ts`: TanStack Query list fetcher.
- `hooks/use-galeri-mutations.ts`: Create, update, and delete mutations.
- `store/galeri-admin-view-store.ts`: Zustand store for view mode persistence.

### Backend Structure (`backend/app/`)
- **Migration:** `database/migrations/xxxx_xx_xx_create_galleries_table.php`
- **Model:** `app/Models/Gallery.php`
- **Controller:** `app/Http/Controllers/Api/Admin/GalleryController.php`
- **Request Validation:**
  - `app/Http/Requests/Admin/GalleryStoreRequest.php`
  - `app/Http/Requests/Admin/GalleryUpdateRequest.php`
- **Cleanup Job:** `app/Jobs/PurgeCloudinaryAssets.php`

---

## 4. API Design & Database Schema

### Database Schema (`galleries`)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigIncrements / UUID | Primary Key | Unique Identifier |
| `nama_galeri` | String | Not Null, Index | Gallery title |
| `slug` | String | Unique | URL slug |
| `thumbnail` | String | Not Null | Primary preview image URL |
| `images` | JSON / Array | Nullable | Additional gallery images |
| `kategori` | String | Not Null | Category classification ('korporat', 'pernikahan', 'ulang-tahun', 'lainnya') |
| `deskripsi` | Text | Nullable | Gallery notes or description |
| `created_at`, `updated_at` | Timestamps | — | Audit trail |

### API Routes (`routes/api.php`)
- `GET /api/admin/galleries` — List galleries with filters & pagination
- `POST /api/admin/galleries` — Create gallery record
- `GET /api/admin/galleries/{id}` — Get single gallery detail
- `PUT /api/admin/galleries/{id}` — Update gallery record
- `DELETE /api/admin/galleries/{id}` — Delete gallery record (triggers Cloudinary purge)

---

## 5. Cloudinary Storage Strategy & Dynamic Folder Routing

1. **Dynamic Folder Naming:**
   - Base path: `catering-nusantara/galeri/`
   - Subfolder based on category:
     - `korporat` $\rightarrow$ `catering-nusantara/galeri/korporat`
     - `pernikahan` $\rightarrow$ `catering-nusantara/galeri/pernikahan`
     - `ulang-tahun` $\rightarrow$ `catering-nusantara/galeri/ulang-tahun`
     - Default / `lainnya` $\rightarrow$ `catering-nusantara/galeri/lainnya`
2. **Asset Cleanup & Replacement:**
   - **On Update:** Replaced thumbnail or images are dispatched to `PurgeCloudinaryAssets` job.
   - **On Delete:** Entire gallery assets are cleaned up from Cloudinary storage.
   - **On Discard:** Uncommitted uploads in cancelled forms are purged immediately.

---

## 6. Task Breakdown (TODOs for Phase 2)
1. [ ] Create database migration and `Gallery` model.
2. [ ] Implement `GalleryController`, form requests, and Cloudinary purge integration.
3. [ ] Set up frontend types, Zod schemas, and Zustand view store.
4. [ ] Build TanStack Query hooks (`use-galeri-query.ts`, `use-galeri-mutations.ts`).
5. [ ] Build UI components (`GaleriTable`, `GaleriCardGrid`, `GaleriToolbar`, Create/Update Drawers).
6. [ ] Assemble `MasterGaleriBlock` and verify all CRUD and storage workflows.
