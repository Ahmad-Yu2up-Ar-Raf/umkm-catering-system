# Agent Ruleset — Catering Nusantara Frontend

> Mandatory context for any AI coding agent before writing or modifying code under `frontend/`. This file is scoped to the React/Vite app; read `../AGENTS.md` (root ruleset) and `docs/design.md` first.

---

## 1. Stack (non-negotiable)

- **React 19** + **TypeScript** + **Vite 8**. No class components; use hooks and function components.
- **Tailwind CSS v4** — there is NO `tailwind.config.js`. All design tokens (colors, radius, fonts, shadows) live in `src/index.css` as CSS variables (`@theme inline`).
- **shadcn/ui** (Radix-based). Existing primitives live in `src/components/ui/` — reuse them. Do NOT hand-roll styled components when a shadcn equivalent exists.
- **Import aliases** (from `components.json`): `@/components`, `@/lib/utils`, `@/hooks`, `@/types`, `@/api`, `@/store`, `@/pages`, `@/services`, `@/router`.

## 2. State Management

- **Zustand** ONLY for lightweight local/global UI state (dialog status, theme, active filters) — NOT for server data.
- **Server data** (packages, prices, orders, gallery) MUST be fetched with **TanStack React Query** through **Ky** (`src/api/client.ts`). Never use raw `fetch` or axios. Never treat server data as zustand state.

## 3. Routing

- Use **React Router**. All routes are declared in `src/router/index.tsx`, guarded by `GuestGuard` / `AuthenticatedGuard`.
- Do NOT add routes outside the sitemap in `../docs/architecture.md` §2 without confirmation.

## 4. Styling Rules

- Use semantic Tailwind tokens (`bg-background`, `text-foreground`, `text-primary`, `bg-card`, `border-border`, `shadow-*`, `rounded-*`) from the token map in `docs/design.md`.
- ❌ NEVER hardcode hex/OKLCH colors or raw font names in components. Tokens only.
- Fonts are fixed: **Figtree Variable** (body/UI) and **Merriweather Variable** (headings). Do not change or add font variables.
- ❌ Do NOT directly override core `src/components/ui/` (shadcn) files — re-theme via `src/index.css` tokens.

## 5. Code Quality

- Run `npm run typecheck` and `npm run lint` before finishing. TypeScript is strict (`noUnusedLocals`).
- Keep components in `src/components/` (reusable) and pages in `src/pages/` (route-level). Business/API logic goes in `src/services/` + `src/api/`.
- The frontend is in the planning/development stage: page blocks may be stubs. Do not invent full features; follow the sitemap.

## 6. Cross-References

- Frontend architecture → `docs/architecture.md`
- Design tokens & principles → `docs/design.md`
- Repo root rules → `../AGENTS.md`
- Brand & business context (root) → `../docs/project-context.md`
