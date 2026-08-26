<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Backend API Specs (single source of truth) · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [Frontend Consumer](../../frontend/README.md) · [Frontend Architecture](../../frontend/docs/architecture.md) · [Backend Workflow](./workflow.md)

# API Collection — Catering Nusantara Backend

> The **canonical** reference for every endpoint, payload, and response in the Catering Nusantara REST API. The React frontend (`../frontend`) is the primary consumer — it **references** this document and never duplicates it. Generated artifacts (OpenAPI/Scramble) and the Bruno collection back this document up; when in doubt, the **Laravel routes in `backend/routes/api.php` are the ground truth**.

**Authoritative sources (in priority order):**
1. `../../backend/routes/api.php` — actual routes, middleware, names.
2. This document — endpoint map, auth model, conventions.
3. `../../backend/openapi.json` — generated OpenAPI spec (Scramble; exact request/response schemas).
4. `../../docs/api/bruno/` — Bruno collection (hand-run request examples per endpoint).

---

## 1. Base URL & Versioning

- **Local dev:** `http://localhost:8000` (Laravel `php artisan serve`).
- **API prefix:** `/api/v1` — every route below is relative to this prefix.
- **Full base:** `http://localhost:8000/api/v1/`
- The frontend sets this via `VITE_API_URL` in `frontend/.env` (see `frontend/src/api/client.ts`).

## 2. Authentication Model

- **Mechanism:** Laravel **Sanctum** personal-access **Bearer tokens**. The frontend stores the token (zustand `auth-store`) and sends it on every request:
  `Authorization: Bearer <token>`
- **Login:** `POST /api/v1/auth/login` (guest-only) → returns a fresh token + user. Login failures are rate-limited (throttle).
- **Logout:** `POST /api/v1/auth/logout` (requires `auth:sanctum`) → revokes the current token.
- **401 handling:** the frontend clears the session and redirects to `/login` (see `frontend/src/api/client.ts` `afterResponse` hook).
- **Guards:** public catalog routes have **no auth**; all `admin/*` and `pesanan/*` routes require `auth:sanctum`.

## 3. CORS (backend → frontend)

- `backend/config/cors.php`: `paths = ['*']`, `allowed_methods = ['*']`, `supports_credentials = true`.
- `allowed_origins = [env('FRONTEND_URL', 'http://localhost:3000')]`.
- **For local Vite dev, set `FRONTEND_URL=http://localhost:5173`** in `backend/.env` so the browser allows requests from the Vite origin.
- Sanctum `stateful` domains are configured via `SANCTUM_STATEFUL_DOMAINS` (defaults include `localhost`, `localhost:3000`, `127.0.0.1`). The current frontend uses Bearer tokens, so stateful/cookie handling is optional — keep the header-based flow.

## 4. Endpoint Map

### 4.1 Public catalog (no auth)

| Method | Path (under `/api/v1`) | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Login (guest), returns Sanctum token + user |
| `POST` | `/auth/logout` | Logout (auth), revokes token |
| `GET` | `/paket` | List packages (catalog cards) |
| `GET` | `/paket/best-seller` | Best-seller packages (homepage) |
| `GET` | `/paket/{paket}` | Package detail |
| `GET` | `/galeri` | List event-gallery entries |

### 4.2 Admin & Mini POS (auth: `Bearer` token)

All under `/api/v1/admin`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/paket/search?q=` | Lightweight package lookup for the POS combobox (`id`, `nama_paket`, `min_order`, `harga_per_porsi`, `kapasitas_produksi`; limit 20). Registered **before** the resource route so `/search` is never captured by `{paket}`. |
| `GET` | `/admin/paket` | List packages (admin CRUD) |
| `POST` | `/admin/paket` | Create package |
| `GET` | `/admin/paket/{paket}` | Show package |
| `PUT` | `/admin/paket/{paket}` | Update package |
| `DELETE` | `/admin/paket/{paket}` | Delete package |
| `GET` | `/admin/galeri` | List gallery (admin) |
| `POST` | `/admin/galeri` | Create gallery entry |
| `GET` | `/admin/galeri/{galeri}` | Show gallery entry |
| `DELETE` | `/admin/galeri/{galeri}` | Delete gallery entry |
| `GET` | `/admin/pesanan` | List orders — supports `page`, `perPage` (default 15), repeated `status_pesanan[]` (whitelisted: `pending`/`confirmed`/`completed`/`cancelled`), `search` (LIKE across `nomor_struk`, `nama_pemesan`, `no_telepon`), `sort_by` (whitelist: `created_at`, `total_harga`, `nomor_struk`, `nama_pemesan`), `sort_dir` (`asc`\|`desc`) |
| `POST` | `/admin/pesanan` | Create order |
| `GET` | `/admin/pesanan/{pesanan}` | Show order |
| `PUT` | `/admin/pesanan/{pesanan}` | Update order (status/catatan only) |
| `DELETE` | `/admin/pesanan/{pesanan}` | Delete order (permanent; struk becomes unretrievable) |
| `GET` | `/admin/pesanan/{pesanan}/struk` | Order receipt (`nomor_struk`) |
| `POST` | `/admin/cloudinary/signature` | Signed upload params for direct browser upload to Cloudinary |
| `DELETE` | `/admin/cloudinary` | Bulk-delete Cloudinary assets by canonical URLs (rollback/orphan sweep) |

> Note: a `register` Bruno request exists but there is **no public register API** — account creation goes through Laravel Breeze web routes (`routes/auth.php`), not this API.

## 5. Key Payload Rules (server-enforced — do NOT skip)

- **`total_harga`** is computed **server-side only** — never send it. Formula: `(jumlah_paket * harga_paket_satuan) + biaya_tambahan`.
- **`harga_paket_satuan`** is a **snapshot** copied from `paket.harga_per_porsi` at order creation — do not send it from the client.
- **`nomor_struk`** is **server-generated** (`STR-YYYYMMDD-XXXX`) — never send it.
- **JSON array fields** (`menu_utama`, `menu_tambahan`, `fasilitas_termasuk` on `paket`; `detail_tambahan` on `pesanan`) are validated via **Form Requests** — send as JSON arrays, not raw strings.
- **`images`** on `paket` (admin create/update): required array of canonical Cloudinary URL strings (1–8, each a valid URL). Files are uploaded **directly to Cloudinary by the browser** (signed via `POST /admin/cloudinary/signature`) before the payload is sent, so the API only ever sees URLs. URLs are stored under the project prefix `catering-nusantara/products/` — the same namespace the PaketSeeder uses. On update: URLs no longer present are removed (DB rows synchronously; Cloudinary asset deletion is dispatched as a queued job `DeleteCloudinaryAssets` **after the response**, so storage latency never blocks the request); new URLs become new `paket_images` rows. Omit the field to keep the existing gallery untouched.
- **`thumbnail`** on `paket`: required primary cover image URL. When set and not already inside `images`, the backend also records it as a `paket_images` row so the cover always belongs to the gallery.
- **Deletion job:** `DeleteCloudinaryAssets` runs best-effort, pooled (`Http::pool`, concurrency 5) destruction of removed assets — dispatched with `afterResponse()` on update/delete. It repairs orphans even if individual Cloudinary calls fail (failures are logged, never thrown). For a truly async worker on production, switch `QUEUE_CONNECTION` to `database` and run `php artisan queue:work`.
- **Delete guard:** `DELETE /api/v1/admin/paket/{id}` returns `409` when the paket still has orders (`pesanan` rows referencing it) — delete is blocked to protect order history.
- **Tumpeng Mini** is priced per package: `harga_per_porsi` = Rp25.000 with `min_order` = 10. Never send Rp250.000 as `harga_per_porsi`.

## 6. Request/Response Shapes

Exact schemas live in the generated spec — **do not duplicate them here**:
- OpenAPI: `../../backend/openapi.json`
- Bruno runnable examples: `../../docs/api/bruno/`

Both stay in sync with `routes/api.php` and the `app/Http/Resources/` transformers. If you add or change an endpoint, update `routes/api.php`, the Form Requests/Resources, then regenerate the OpenAPI spec and refresh the Bruno collection per the workflow in `backend/docs/workflow.md`.
