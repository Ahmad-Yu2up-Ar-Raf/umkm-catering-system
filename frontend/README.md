<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Frontend App Overview · **Monorepo Root:** `../`
>
> [Global Context](../docs/project-context.md) · [Monorepo Architecture](../docs/architecture.md) · [Backend API Specs](../backend/docs/api-collection.md) · [Frontend Architecture](./docs/architecture.md) · [Frontend Design](./docs/design.md) · [Frontend Agent Rules](./AGENTS.md)

# Catering Nusantara — Frontend

React + Vite single-page application for the Catering Nusantara platform: public catalog, WhatsApp-conversion pages, and the internal Admin CMS / Mini POS.

## Monorepo Awareness

- This app lives in `/frontend` and is consumed by **users**; the sibling directory `../backend` is a **Laravel REST API** serving all data.
- **For all API endpoints, request payloads, and responses, refer strictly to the backend API collection at `../backend/docs/api-collection.md`.**
- **Local development:** Vite on `http://localhost:5173` ↔ Laravel on `http://localhost:8000`. Set `VITE_API_URL=http://localhost:8000/api/v1/` in `frontend/.env` and `FRONTEND_URL=http://localhost:5173` in `backend/.env` (CORS).
- Business rationale: see `../docs/project-context.md`.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | **React 19** + **Vite 8** |
| Language | TypeScript |
| Styling | **Tailwind CSS v4** + **shadcn/ui** (Radix), tokens in `src/index.css` |
| Routing | **React Router** (see `src/router/index.tsx`) |
| Server state | **TanStack React Query** |
| HTTP client | **Ky** (`src/api/client.ts`) |
| UI state | **Zustand** (`src/store/auth-store.ts`) |
| Icons | HugeIcons (`@hugeicons/react`) |

## Scripts

```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # tsc -b && vite build (production)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run preview    # preview the production build
```

## Documentation

| File | Contents |
|---|---|
| `README.md` (this file) | App overview and scripts |
| `AGENTS.md` | Mandatory rules for AI agents working in this folder |
| `docs/architecture.md` | Component tree, state management, data flow, monorepo awareness |
| `docs/design.md` | UI/UX principles and the Suasana-based design tokens |

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the Laravel backend API, e.g. `http://localhost:8000/api/v1/` |
