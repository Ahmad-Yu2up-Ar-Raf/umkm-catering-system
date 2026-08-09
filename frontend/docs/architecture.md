<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Frontend Technical Spec · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [Backend API Specs](../../backend/docs/api-collection.md) · [Frontend Readme](../README.md) · [Frontend Agent Rules](../AGENTS.md)

# Frontend Architecture — Catering Nusantara

> Technical blueprint for the React + Vite app. Read `../AGENTS.md` (rules) and `design.md` (tokens) alongside this document.

---

## 0. Monorepo Awareness

- This UI is a **single-page application** (React + Vite) living in `/frontend`.
- The backend is a **Laravel application at `../backend`** (monorepo sibling) serving this app over a **REST API**.
- **For all API endpoints, request payloads, and responses, refer strictly to the backend API collection at `../backend/docs/api-collection.md`** — never duplicate API documentation in this folder.
- **Local development interaction:**
  - Vite dev server: `http://localhost:5173` (`npm run dev` in `/frontend`).
  - Laravel API: `http://localhost:8000` (`php artisan serve` in `/backend`).
  - Set `VITE_API_URL=http://localhost:8000/api/v1/` in `frontend/.env` and `FRONTEND_URL=http://localhost:5173` in `backend/.env` (CORS).
  - The frontend attaches the Sanctum Bearer token automatically (see `src/api/client.ts`); a 401 clears the session and redirects to `/login`.
- **Shared visual assets** live in `frontend/public/assets` (served at `/assets/...`) — `images/{banners,lifestyle,products,textures,patern}`, `ui/` (favicons/manifest/logo). This is the single canonical store; the old root `assets/` mirror was removed (see `AGENTS.md` §9).

---

## 1. Directory Map

```
frontend/src/
├── main.tsx                # App entry — mounts <App /> inside providers
├── App.tsx                 # App shell: ThemeProvider, Toaster, TooltipProvider, RouterProvider
├── index.css               # Tailwind v4 tokens (Suasana palette) + fonts + base styles
├── router/
│   ├── index.tsx           # All routes (createBrowserRouter)
│   └── guards.tsx          # GuestGuard / AuthenticatedGuard
├── api/
│   └── client.ts           # Ky instance (VITE_API_URL, Bearer token injection, 401 handling)
├── services/               # (scaffolded) data-access / query hooks for the API
├── hooks/                  # (scaffolded) shared custom hooks
├── components/
│   ├── theme-provider.tsx  # next-themes based dark/light provider
│   ├── ui/                 # shadcn/ui fragments (19 primitives — button, card, dialog, sheet,
│   │                       #   table, select, tabs, drawer, skeleton, badge, input, label,
│   │                       #   textarea, checkbox, separator, dropdown-menu, popover, sonner, tooltip)
│   └── ui/core/block/      # composed feature blocks (auth/login, contact, …)
├── pages/                  # route-level pages (home, auth/login, admin/dashboard, contact)
├── store/
│   └── auth-store.ts       # zustand — auth token + user (UI session state)
├── lib/
│   └── utils.ts            # cn() helper (clsx + tailwind-merge) — the shadcn `utils` alias
└── types/
    └── auth-type.ts        # shared TypeScript types
```

### 1.1 Tooling & Design System Files (outside `src/`)

| Path | Purpose |
|---|---|
| `~/.opencode/skills/` | Global agent skills (design engine): `impeccable`, `catering-nusantara-design`, `motion-orchestration`, `shadcn-architecture`, `hallmark` |
| `docs/design.md` | Design source of truth (Stitch-9-compatible tokens, fonts, rules) |
| `design-system/MASTER.md` + `design-system/pages/` | Persisted design system + page-level overrides (read before building a page) |
| `opencode.json` | Local MCP config (agent tooling) |

## 2. Component Composition Map

- **Pages** (`src/pages/`) — one folder per route; composed from blocks/fragments. No business logic.
- **Blocks** (`src/components/ui/core/block/`) — composed feature sections (login form, contact section) built from fragments.
- **Fragments** (`src/components/ui/fragments/shadcn-ui/`) — thin wrappers over shadcn/Radix primitives (button, tooltip, sonner). **Do not modify these directly — re-theme via `src/index.css`.**
- **Hooks** (`src/hooks/`) — shared custom hooks (scaffolded).
- **Services** (`src/services/`) — server data access: React Query hooks + API calls built on `src/api/client.ts` (scaffolded).

## 3. State Management Plan

| State | Where | Why |
|---|---|---|
| Auth session (token, user) | `store/auth-store.ts` (zustand + persist) | Lightweight, client-only UI/session state |
| Theme | `theme-provider.tsx` (next-themes) | UI preference, persisted in localStorage |
| Packages / prices / orders / gallery | React Query (services layer) | Server data: caching, invalidation, dedup |
| Form inputs, filters, dialog open/close | Local component state / zustand | Transient UI state |

**Rule:** server data is NEVER the source of truth in zustand. Queries go through the services layer. The order `total_harga` is always recomputed server-side; the frontend shows it only as UX preview.

## 4. Data Flow

```
Page/Block
   │  calls
   ▼
src/services/ (React Query hook)
   │  invokes
   ▼
src/api/client.ts (Ky)  ── HTTP (REST) ──►  Laravel backend (../backend, routes/api.php)
   ▲
   └── response typed via src/types/
```

- Contract source: `../backend/docs/api-collection.md` (and the generated `../backend/openapi.json`).
- Auth token is attached by the Ky instance (`api/client.ts`) via the zustand store.
- Mutations invalidate the matching query keys to refetch.

## 5. Routing & Guards

- Guards live in `src/router/guards.tsx` (extracted so `router/index.tsx` stays fast-refresh clean).
- `GuestGuard` — redirects authenticated users to `/dashboard`.
- `AuthenticatedGuard` — redirects anonymous users to `/login`.
- Public surface (catalog, contact, FAQ…) lives outside the guards; admin routes sit behind `AuthenticatedGuard`.
