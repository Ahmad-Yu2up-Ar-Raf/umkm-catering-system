# Frontend Architecture — Catering Nusantara

> Technical blueprint for the React + Vite app. Read `../AGENTS.md` (rules) and `design.md` (tokens) alongside this document.

---

## 1. Directory Map

```
frontend/src/
├── main.tsx                # App entry — mounts <App /> inside providers
├── App.tsx                 # App shell: ThemeProvider, Toaster, TooltipProvider, RouterProvider
├── index.css               # Tailwind v4 tokens (Suasana palette) + fonts + base styles
├── router/
│   └── index.tsx           # All routes + GuestGuard / AuthenticatedGuard
├── api/
│   └── client.ts           # Ky instance (VITE_API_BASE_URL, auth header injection)
├── services/               # (scaffolded) data-access / query hooks for the API
├── hooks/                  # (scaffolded) shared custom hooks
├── components/
│   ├── theme-provider.tsx  # next-themes based dark/light provider
│   ├── ui/                 # shadcn/ui fragments (button, tooltip, sonner…)
│   └── ui/core/block/      # composed feature blocks (auth/login, contact, …)
├── pages/                  # route-level pages (home, auth/login, admin/dashboard, contact)
├── store/
│   └── auth-store.ts       # zustand — auth token + user (UI session state)
├── lib/
│   └── utils.ts            # cn() helper (clsx + tailwind-merge) — the shadcn `utils` alias
└── types/
    └── auth-type.ts        # shared TypeScript types
```

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
src/api/client.ts (Ky)  ── HTTP ──►  Laravel backend (backend/routes/api.php)
   ▲
   └── response typed via src/types/
```

- Auth token is attached by the Ky instance (`api/client.ts`) via the zustand store.
- Mutations invalidate the matching query keys to refetch.

## 5. Routing & Guards

- `GuestGuard` — redirects authenticated users to `/dashboard`.
- `AuthenticatedGuard` — redirects anonymous users to `/login`.
- Public surface (catalog, contact, FAQ…) lives outside the guards; admin routes sit behind `AuthenticatedGuard`.
