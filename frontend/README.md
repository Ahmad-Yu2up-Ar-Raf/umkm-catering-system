# Catering Nusantara — Frontend

React + Vite single-page application for the Catering Nusantara platform: public catalog, WhatsApp-conversion pages, and the internal Admin CMS / Mini POS.

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
npm run dev        # Vite dev server
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
| `docs/architecture.md` | Component tree, state management, data flow |
| `docs/design.md` | UI/UX principles and the Suasana-based design tokens |

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Laravel backend API |
