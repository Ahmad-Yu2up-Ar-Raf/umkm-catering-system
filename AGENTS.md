<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Repo-wide Agent Rules · **Monorepo Root:** `.`
>
> [Global Business Context](./docs/project-context.md) · [Monorepo Architecture](./docs/architecture.md) · [Backend API Specs](./backend/docs/api-collection.md) · [Frontend Architecture](./frontend/docs/architecture.md)

# Agent Ruleset — Catering Nusantara (for OpenCode)

> This instruction is mandatory context for any AI coding agent before writing or modifying code in this repository. Also read `docs/architecture.md` and `frontend/docs/design.md` for full details — this document only contains execution rules.

---

## 1. Project Context (Summary)

Hybrid catering application: public catalog (conversion to WhatsApp) + internal Admin CMS/Mini POS. Two-part monorepo: `backend/` (Laravel) and `frontend/` (React + Vite). Database: 4 core tables — `users`, `paket`, `galeri`, `pesanan` — see `docs/architecture.md` for the full schema.

---

## 2. Monorepo Structure Rules

- Do not move or restructure the `backend/` or `frontend/` folders without explicit instructions.
- Backend code lives ONLY in `backend/`, frontend code ONLY in `frontend/`. Do not put business logic in the frontend that belongs in the backend (see the price-calculation rules below).
- Every new feature must follow the official sitemap in `docs/architecture.md` §2 — do not add pages that are not on the sitemap without confirmation.

---

## 3. Back-End Code Rules (Laravel)

- **Authentication:** use Laravel Breeze for basic auth scaffolding and Sanctum for the API tokens consumed by the React frontend (SPA auth pattern) — not cross-domain session cookies unless the deployment architecture is confirmed to be on the same domain.
- **JSON validation:** the fields `menu_utama`, `menu_tambahan`, `fasilitas_termasuk` on the `paket` table, and `detail_tambahan` on `pesanan`, MUST be validated through Laravel Form Requests — never accept raw arrays without shape/type validation.
- **`total_harga` calculation:** MUST be computed on the server (service class or model observer), and MUST NOT accept `total_harga` from the request body and store it directly. Formula: `(jumlah_paket * harga_paket_satuan) + biaya_tambahan`, where `harga_paket_satuan` is copied from `paket.harga_per_porsi` at the time the order is created (not re-looked-up on read).
- **`nomor_struk`:** generate on the server in the format `STR-YYYYMMDD-XXXX`, never accept it from the client.
- **Do not create new tables/migrations** beyond the 4 core tables without explicit instructions — see `docs/architecture.md` §4.3 for the list of optional tables that are NOT yet approved (`testimoni`, `faq`).
- **Per-unit packages (Tumpeng Mini):** note that some packages are priced per-package (not per individual portion) — do not assume `harga_per_porsi` always equals the price shown to the user without checking `min_order` (see `docs/architecture.md` §4.1).

---

## 4. Front-End Code Rules (React + Vite)

- **UI components:** use primitives from **shadcn/ui** (Radix-based) according to the component map in `frontend/docs/design.md` §6. Do not build custom components from scratch when a shadcn/ui equivalent already exists.
- **State management:** `zustand` ONLY for lightweight local/global UI state (e.g. dialog status, active filters) — NOT for server data (prices, package list, order history).
- **Server data:** use **Tanstack React Query** for all data fetching from the backend (caching, invalidation), combined with **Ky** as the HTTP client (not raw `fetch` or axios).
- **Routing:** use **React Router** according to the official sitemap in `docs/architecture.md` §2 — including the About Us, How to Order, Contact, and FAQ pages which are static in content but still need their own routes.
- **Portion Calculator & Auto-Calculation System (Admin):** the real-time display in the frontend is UX ONLY (instant preview) — the final saved result must still go through server-side re-validation. Never trust frontend numbers as the financial source of truth.
- **Styling:** use the color & font tokens from `frontend/docs/design.md` §2-3 via the Tailwind config. Do not hardcode hex colors directly in components.

---

## 5. Explicit Prohibitions

- ❌ Do not change the database schema (`docs/architecture.md` §4) without explicit team instructions.
- ❌ Do not calculate/store `total_harga` client-side as a final value.
- ❌ Do not hardcode colors/fonts outside the tokens defined in `frontend/docs/design.md`.
- ❌ Do not directly override the core `components/ui/` (shadcn) files — re-theme via the Tailwind config.
- ❌ Do not add pages/routes outside the official sitemap without confirmation.
- ❌ Do not use generic stock photos for product content when the client's original photo assets are available (see `frontend/docs/design.md` §5).

---

## 6. Cross-References

- Data structure & architectural rationale → `docs/architecture.md`
- Colors, fonts, UI components → `frontend/docs/design.md`
- Project overview & local setup → `README.md`
