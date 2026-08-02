<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Frontend Agent Rules · **Monorepo Root:** `../`
>
> [Global Context](../docs/project-context.md) · [Monorepo Architecture](../docs/architecture.md) · [Backend API Specs](../backend/docs/api-collection.md) · [Frontend Architecture](./docs/architecture.md)

# Agent Ruleset — Catering Nusantara Frontend

> Mandatory context for any AI coding agent before writing or modifying code under `frontend/`. This file is scoped to the React/Vite app; read `../AGENTS.md` (root ruleset) and `docs/design.md` first.

**API contract:** this app consumes the sibling Laravel backend (`../backend`) via REST. **For all API endpoints, request payloads, and responses, refer strictly to `../backend/docs/api-collection.md`** — never guess or duplicate endpoint definitions here.

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
- **Design gate:** before finishing any UI work, run `npm run lint:design` (`impeccable detect src/`) — it must stay clean. Never ship output that trips its rules (Inter/system fonts, purple gradients, card-in-card, gray-on-colored, bounce easing).
- **Forms are custom/user-owned:** do NOT use the shadcn `form` wrapper or react-hook-form/zod. Bespoke forms are built by the user under `src/components/ui/core/block/`.

## 5. Code Quality

- Run `npm run typecheck` and `npm run lint` before finishing. TypeScript is strict (`noUnusedLocals`).
- Keep components in `src/components/` (reusable) and pages in `src/pages/` (route-level). Business/API logic goes in `src/services/` + `src/api/`.
- The frontend is in the planning/development stage: page blocks may be stubs. Do not invent full features; follow the sitemap.

## 6. Cross-References

- Frontend architecture → `docs/architecture.md`
- Design tokens & principles → `docs/design.md`
- Repo root rules → `../AGENTS.md`
- Brand & business context (root) → `../docs/project-context.md`

## 7. Design Tooling & Local Skills

Project-local skills live in `.opencode/skills/` (self-contained, do not move):

| Skill | When to load |
|---|---|
| `catering-nusantara-design` | ANY UI/component/page work — brand tokens, taste dials, Impeccable loop |
| `motion-orchestration` | Animations (GSAP primary, Framer code-split for admin POS), `prefers-reduced-motion` |
| `shadcn-architecture` | Creating/extending components; which primitives exist vs. needed; `cva`/`cn()` |
| `impeccable` (installed) | `/impeccable shape/critique/polish/audit` design review commands |

- **Design contract:** `docs/design.md` (Stitch-9-compatible) + `design-system/MASTER.md` (page overrides in `design-system/pages/`). Read before building a page; page overrides beat Master.
- **Enforcement:** `npm run lint:design` (Impeccable detector, deterministic, no LLM) runs alongside `lint`/`typecheck`.
- **Playwright:** configured as a local MCP (`opencode.json`); E2E/visual specs in `playwright/` via `npm run test:e2e`.
- **WebGPU:** deliberately deferred (experience layer later). Do not add Three.js/WebGPU without explicit approval.

## 8. MANDATORY PRE-FLIGHT TOOLING CHECK

Before writing ANY UI/frontend code (component, page, block, style, or animation),
run this sequence. It is mandatory, not optional.

1. **Skill Discovery (always)**
   - Load every applicable LOCAL skill from `.opencode/skills/`:
     `catering-nusantara-design` (brand/tokens/taste dials),
     `motion-orchestration` (GSAP/Framer, reduced-motion),
     `shadcn-architecture` (primitives, cva/cn), `impeccable` (review commands).
   - Scan GLOBAL skills (`~/.config/opencode/skills/` + `~/.opencode/skills/`):
     `ui-ux-pro-max`, `design-taste-frontend`, `gsap-*`, `shadcn`,
     `design-preflight`, `frontend-design`, … and load any that match the task.
   - **Asset check (mandatory):** before designing any visual surface, confirm the needed
     photography exists in `../../assets/main`. If it is missing, low-res, or irrelevant,
     invoke the `image-explorer` HD fallback (§9) and pick imagery matching our warm
     OKLCH tokens — never ship a weak substitute.

2. **MCP Utilization (evaluate — do not guess)**
   - `codebase-memory-mcp` → check whether a similar component/hook already exists
     before creating a new one.
   - `firecrawl` / `scrapling` → scrape current docs/patterns when syntax or best
     practice is uncertain (follow `bootstrap/PROACTIVE_RESEARCH.md`).
   - `playwright` MCP / `agent-browser` / `npm run test:e2e` → after building any
     animation or visual component, verify it in a real browser, including the
     `prefers-reduced-motion` case.

3. **Design System Adherence (before generating components)**
   - Consult `docs/design.md` (tokens, fonts, rules) and `design-system/MASTER.md`
     (+ `design-system/pages/<page>.md` override when page-specific).
   - Respect the `npm run lint:design` gate (`impeccable detect`): no Inter/system
     fonts, no purple gradients, no card-in-card, no gray-on-colored, no bounce easing.
   - Semantic tokens only; never hardcode colors/fonts; never edit core `ui/` files.

## 9. Visual Assets (shared, do not duplicate)

ALL visual assets for this project (banners, product photos, lifestyle shots,
textures, UI graphics) live in `../../assets/main` at the monorepo root
(`C:\Dev\Web\catering\assets\main`). Subfolders: `banners/`, `lifestyle/`,
`products/`, `textures/`, `ui/`.

- Reference assets from that location — do NOT copy them into `frontend/public/`
  unless the user explicitly instructs it.
- Never use generic stock photos when client assets exist in `../../assets/main/products/`.

### HD Asset Fallback Pipeline (image-explorer)

When a layout demands an asset that is missing, low-res, or irrelevant in `assets/main`,
use the global `image-explorer` tool instead of shipping a weak substitute:

- **Path (WSL):** `\\wsl.localhost\Ubuntu\home\yusuf\.opencode\tools\image-explorer`
  (`~/.opencode/tools/image-explorer/` — interface: `search.js`)
- **Usage:** `node search.js --query="nasi tumpeng" [--platform=all|unsplash|pexels|pixabay] [--count=5] [--orientation=landscape] [--save --out=...]`
- **Rule:** prefer HD results matching our warm OKLCH cream/amber palette and "homey,
  down-to-earth" photography (see `docs/design.md` §10 benchmark). Use `--save` only when
  the user wants the file downloaded locally.
