# Catering Nusantara Back-End — Agent Context (OpenCode)

> Level-100 quick-start for AI agents working inside `backend/`. Read the modular docs (below) for deep context. This file is the fast-loading overview.

## Project Identity

**Catering Nusantara** — hybrid F&B platform for **Dapur Bunda Catering** (Bogor, since 2019, PIC: Ratna Kusuma).
One database, **two surfaces**:
- **Public Site** — read-only catalog (`paket`, `galeri`), anonymous, converts visitors to **WhatsApp** deep-link checkout.
- **Admin CMS + Mini POS** — Sanctum-authenticated; the ONLY surface writing to `pesanan`. Auto-calculates totals, generates `nomor_struk`, keeps order history.

**Golden rule:** WhatsApp stays the sales channel; the system eliminates manual arithmetic/record-keeping around it.

## Tech Stack

Laravel 13 / PHP 8.4 · Sanctum 4 (SPA tokens) · Breeze 2 · Pest 4 · Neon Database (serverless PostgreSQL) · Pint 1 · Scramble `^0.13` (OpenAPI/Scalar docs).

## Quick-Start Rules (non-negotiable)

1. **`total_harga` is SERVER-COMPUTED ONLY.** Never accept from request body. Formula: `(jumlah_paket × harga_paket_satuan) + biaya_tambahan`.
2. **`harga_paket_satuan` is a SNAPSHOT** copied at order creation — never re-query `paket.harga_per_porsi` on read.
3. **`nomor_struk` = server-generated** `STR-YYYYMMDD-XXXX` (daily sequential counter).
4. **Tumpeng Mini:** `harga_per_porsi = 25000`, `min_order = 10` (per-package pricing). NEVER store Rp250.000 raw.
5. **JSON arrays** (`menu_utama`, `menu_tambahan`, `fasilitas_termasuk`, `detail_tambahan`) → model `array` casts + FormRequest shape validation only. No junction tables.
6. **4 core tables only** (`users`, `paket`, `galeri`, `pesanan`). No new tables without approval (`testimoni`/`faq` NOT approved).
7. **Zero-Hallucination pipeline** with every feature (see docs/workflow.md): code → Pest GREEN → Bruno → Scramble.
8. Run `vendor/bin/pint --dirty --format agent` on changed PHP files before finalizing.

## Hard Stops

- ❌ No `total_harga` / `nomor_struk` from client.
- ❌ No unvalidated JSON array writes.
- ❌ No tables beyond the 4 core.
- ❌ No skipping tests / Pint.
- ❌ No deleting tests without approval.

## 📚 Documentation Map (read before coding)

| File | Purpose |
|------|---------|
| `docs/workflow.md` | Zero-Hallucination pipeline: Code → Pest → Bruno → Postman → Scramble + pre-flight checklist |
| `docs/architecture.md` | Folder structure, flat controllers (LOCKED), Enums/Requests/Resources/Services layers, routes, response envelope, code conventions |
| `docs/database.md` | Full DBML schema, JSON array rules, critical business rules (pricing, struk, Tumpeng Mini) |
| `docs/boost-guidelines.md` | Laravel Boost MCP tooling guidelines (auto-generated block, relocated here) |

## Cross-Reference (repo root)

- `../docs/architecture.md` — sitemap & monorepo-wide ERD
- `../frontend/docs/design.md` — design tokens (frontend)
- `../docs/git-workflow.md` — branch/PR/commit conventions
