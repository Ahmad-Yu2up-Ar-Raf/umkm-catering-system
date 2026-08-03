# Catering Nusantara — Web Platform

**Client:** Catering Nusantara, Bogor — operating since 2024 (PIC: Eva Rudianti)
**Team:** Ahmad Yusuf Ar-Rafi · Denniz Rizki Attila · Thoriq Azhar Raditya

> Hybrid F&B platform: a public catalog optimized for WhatsApp conversion, paired with an internal Admin CMS + Mini POS — built on a single JSON-enriched database schema.

Project documentation is split across several files so that both humans and AI coding agents can navigate it easily. **Starting from the root, follow the links down; from any nested file, climb back up via its "Context Anchor & Monorepo Topology" block.**

| File | Contents |
|---|---|
| `README.md` (this file) | Project overview, tech stack, setup guide, and master index |
| [`docs/project-context.md`](./docs/project-context.md) | Business "brain": brand, audience, problem, model, metrics |
| [`docs/architecture.md`](./docs/architecture.md) | Monorepo topology, sitemap, userflow, ERD |
| [`AGENTS.md`](./AGENTS.md) | Mandatory ruleset for AI coding agents (OpenCode) before writing code |
| [`docs/git-workflow.md`](./docs/git-workflow.md) | Team branch, PR, and commit conventions |

### Frontend (`/frontend`)

| File | Contents |
|---|---|
| [`frontend/README.md`](./frontend/README.md) | Frontend overview, scripts, monorepo awareness |
| [`frontend/AGENTS.md`](./frontend/AGENTS.md) | Frontend agent rules (React/Vite/shadcn) |
| [`frontend/docs/architecture.md`](./frontend/docs/architecture.md) | Component tree, state management, data flow |
| [`frontend/docs/design.md`](./frontend/docs/design.md) | Design tokens (Suasana palette) — single design spec |

### Backend (`/backend`)

| File | Contents |
|---|---|
| [`backend/README.md`](./backend/README.md) | Backend overview, setup, business rules |
| [`backend/AGENTS.md`](./backend/AGENTS.md) | Backend agent rules (Laravel/Neon) |
| [`backend/docs/api-collection.md`](./backend/docs/api-collection.md) | **API contract** — endpoints, payloads, auth (single source of truth) |
| [`backend/docs/architecture.md`](./backend/docs/architecture.md) | Backend layering & conventions |
| [`backend/docs/database.md`](./backend/docs/database.md) | Neon schema, JSON arrays, business rules |
| [`backend/docs/database-seeders.md`](./backend/docs/database-seeders.md) | Seeder data & fixtures |
| [`backend/docs/workflow.md`](./backend/docs/workflow.md) | Zero-Hallucination pipeline (Code → Pest → Bruno → Scramble) |
| [`backend/openapi.json`](./backend/openapi.json) | Generated OpenAPI spec (Scramble) |
| [`docs/api/bruno/`](./docs/api/bruno/) | Bruno collection for endpoint testing |

---

## 1. Project Overview & Tech Stack

The system serves two distinct roles from the same data model: **selling** to anonymous public visitors, and **operating** the order/invoice pipeline for internal admins. See `docs/architecture.md` for the full sitemap and userflow.

| Layer | Technology Choice |
|---|---|
| Back-End | **Laravel (PHP)**, **Breeze** (auth scaffolding), **Sanctum** (SPA API tokens) |
| Front-End | **React + Vite**, **Shadcn/UI** (Radix-based), **Tailwind CSS**, **Zustand** (UI state), **Ky** (HTTP client), **Tanstack React Query** (server state), **React Router** |
| Database | **Neon (serverless PostgreSQL)** — 4 core tables: `users`, `paket`, `galeri`, `pesanan` (see `docs/architecture.md`) |

> The front-end stack expanded significantly in this revision compared to the initial draft (originally plain React + Tailwind + Vite) — see `AGENTS.md` §4 for the usage rules of each library.

---

## 2. Setup Guide

### Prerequisites
- PHP ≥ 8.2, Composer
- Node.js ≥ 18, npm/yarn
- Neon PostgreSQL (serverless) — or a local PostgreSQL for development

### Back-End (Laravel)
```bash
git clone <repo-url> catering-nusantara
cd catering-nusantara/backend
composer install
cp .env.example .env
php artisan key:generate
# fill the DB_* vars from your Neon connection string (DB_CONNECTION=pgsql)
php artisan migrate --seed
php artisan install:api   # setup Sanctum
php artisan serve
```

### Front-End (React + Vite)
```bash
cd catering-nusantara/frontend
npm install
npx shadcn@latest init    # setup shadcn/ui + Tailwind
cp .env.example .env
# set VITE_API_URL to the Laravel backend API base URL (e.g. http://localhost:8000/api/v1/)
npm run dev
```

### Environment Variables (minimum)
| Variable | Purpose |
|---|---|
| `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Neon PostgreSQL connection |
| `APP_KEY` | Laravel encryption key |
| `WHATSAPP_NUMBER` | Target number for public checkout deep-link |
| `VITE_API_URL` | API base URL for the front-end, e.g. `http://localhost:8000/api/v1/` |

---

## 3. Reference Links

- Sitemap: [Relume project](https://www.relume.ai/app/project/P3496312_NPf8rfzVlwseLRNnLnOpo4Z32_-BkP4-kQ4NIDoJ_uU#mode=sitemap)
- ERD: [dbdiagram.io](https://dbdiagram.io/d/ERD-Sistem-Pendataan-Siswa-691d7e1e228c5bbc1a7f6b20)
- Userflow: [Mermaid](https://mermaid.ai/d/4951d72c-6112-4428-ba6f-690fe664705b) (source: `UMKM_Userflow.mmd`)
- Wireframe: [Figma Make](https://www.figma.com/make/ysaD60e2reJhGDHVtIKL8K/Website-Sitemap-and-Wireframe)
- Visual design reference: [suasana.vercel.app](https://suasana.vercel.app)

---

## 4. Contributors

| Name | Role |
|---|---|
| Ahmad Yusuf Ar-Rafi | Back-End, Front-End |
| Denniz Rizki Attila | Back-End |
| Thoriq Azhar Raditya | Front-End |
