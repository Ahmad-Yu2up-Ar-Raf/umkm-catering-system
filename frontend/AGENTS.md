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
- Fonts are fixed: **Space Grotesk Variable** (body/UI), **Fraunces Variable** (headings/display), and **Instrument Serif** (`--font-accent`, the single italic accent word per headline). Do not change or add font variables.
- ❌ Do NOT directly override core `src/components/ui/` (shadcn) files — re-theme via `src/index.css` tokens.
- **Design gate:** before finishing any UI work, run `npm run lint:design` (`impeccable detect src/`) — it must stay clean. Never ship output that trips its rules (Inter/system fonts, purple gradients, card-in-card, gray-on-colored, bounce easing).
- **Forms are custom/user-owned:** do NOT use the shadcn `form` wrapper or react-hook-form/zod. Bespoke forms are built by the user under `src/components/ui/core/block/`.

### Image delivery (Cloudinary + @unpic)

- The API (`thumbnail`, `images[]`, `gambar_acara`) returns **canonical original Cloudinary URLs** — never URLs with baked transformations (`w_*,h_*,f_auto,c_lfill` before `/v<version>/`). Never store or send transformed URLs as data.
- `MediaItem` (@unpic) is the only render path: use `layout="constrained"` (default, `width`/`height` props) for intentionally ratio-locked boxes (package cards, carousels) and `layout="fullWidth"` for surfaces that must keep the image's natural composition (gallery masonry, global lightbox). Pass `sizes` where the image footprint differs from a card.

## 5. Code Quality

- Run `npm run typecheck` and `npm run lint` before finishing. TypeScript is strict (`noUnusedLocals`).
- Keep components in `src/components/` (reusable) and pages in `src/pages/` (route-level). Business/API logic goes in `src/services/` + `src/api/`.
- The frontend is in the planning/development stage: page blocks may be stubs. Do not invent full features; follow the sitemap.

## 6. Cross-References

- Frontend architecture → `docs/architecture.md`
- Design tokens & principles → `docs/design.md`
- Repo root rules → `../AGENTS.md`
- Brand & business context (root) → `../docs/project-context.md`

## 7. Design Tooling & Skills (installed globally)

The design skills below are installed globally in `~/.opencode/skills/` (no repo-local copies).

| Skill | When to load |
|---|---|
| `catering-nusantara-design` | ANY UI/component/page work — brand tokens, taste dials, Impeccable loop |
| `motion-orchestration` | Animations (GSAP primary, Framer code-split for admin POS), `prefers-reduced-motion` |
| `shadcn-architecture` | Creating/extending components; which primitives exist vs. needed; `cva`/`cn()` |
| `impeccable` (installed) | `/impeccable shape/critique/polish/audit` design review commands |
| `hallmark` (installed) | New pages/landing layouts — anti-slop macrostructure selection, 57-gate slop test, `audit`/`redesign`/`study` verbs, pre-emit critique |

- **Design contract:** `docs/design.md` (Stitch-9-compatible) + `design-system/MASTER.md` (page overrides in `design-system/pages/`). Read before building a page; page overrides beat Master.
- **Enforcement:** `npm run lint:design` (Impeccable detector, deterministic, no LLM) runs alongside `lint`/`typecheck`.
- **Verification:** no automated browser testing. Code execution completed — the user will verify visually in the browser.
- **WebGPU:** deliberately deferred (experience layer later). Do not add Three.js/WebGPU without explicit approval.

## 8. MANDATORY PRE-FLIGHT TOOLING CHECK

Before writing ANY UI/frontend code (component, page, block, style, or animation),
run this sequence. It is mandatory, not optional.

1. **Skill Discovery (always)**
   - Load every applicable design/UI skill from `~/.opencode/skills/`:
     `catering-nusantara-design` (brand/tokens/taste dials),
     `motion-orchestration` (GSAP/Framer, reduced-motion),
     `shadcn-architecture` (primitives, cva/cn), `impeccable` (review commands),
     `hallmark` (macrostructure + anti-slop slop test).
   - Scan GLOBAL catalogs (`~/.opencode/skills/` — brand design engine + `~/.config/opencode/skills/` — general design/utility skills):
     `ui-ux-pro-max`, `design-taste-frontend`, `gsap-*`, `shadcn`,
     `design-preflight`, `frontend-design`, … and load any that match the task.
   - **Taste precedence (mandatory):** load the `catering-nusantara-design` skill
     BEFORE the global `design-taste-frontend` skill. The project pins (VARIANCE 5 /
     MOTION 4 / DENSITY 3) must strictly override the global taste baseline (8/6/4) to
     preserve the homey, down-to-earth Nusantara brand aesthetic.
   - **Asset check (mandatory):** before designing any visual surface, confirm the needed
     photography exists in `frontend/public/assets`. If it is missing, low-res, or irrelevant,
     invoke the `image-explorer` HD fallback (§9) and pick imagery matching our warm
     OKLCH tokens — never ship a weak substitute.

2. **MCP Utilization (evaluate — do not guess)**
   - `codebase-memory-mcp` → check whether a similar component/hook already exists
     before creating a new one.
   - `firecrawl` / `scrapling` → scrape current docs/patterns when syntax or best
     practice is uncertain (follow `bootstrap/PROACTIVE_RESEARCH.md`).
   - After building any animation or visual component, verify it visually in the
     browser (including the `prefers-reduced-motion` case). The user owns visual QA.

3. **Design System Adherence (before generating components)**
   - Consult `docs/design.md` (tokens, fonts, rules) and `design-system/MASTER.md`
     (+ `design-system/pages/<page>.md` override when page-specific).
   - Respect the `npm run lint:design` gate (`impeccable detect`): no Inter/system
     fonts, no purple gradients, no card-in-card, no gray-on-colored, no bounce easing.
   - Semantic tokens only; never hardcode colors/fonts; never edit core `ui/` files.
   - **Unified pipeline (`docs/design.md` §11):** run all three pillars on every UI surface —
     Taste dials pick the direction → Hallmark shapes the structure (macrostructure,
     57-gate slop test, pre-emit critique, honest copy — no fabricated metrics) → Impeccable
     verifies the code. Stamped pre-emit critique scores on page artifacts. The single
     `font-accent` italic accent word per headline is a deliberate brand exception.

## 9. Visual Assets (canonical: `public/assets`)

**Source of truth:** all visual assets (banners, product photos, lifestyle shots,
textures, UI graphics) live in `frontend/public/assets/` — the app's served asset store
(`/assets/...` at runtime). Subfolders: `images/{banners,lifestyle,products,textures,patern}`,
`ui/` (favicons/manifest/logo), `logo/`. The root-level `assets/` mirror was removed —
never recreate a second copy at the monorepo root.

**Runtime path:** the codebase references assets via absolute served URL — e.g.
`/assets/images/banners/hero-banner-tumpeng.png`, `/assets/ui/logo.png` — never via
`../../assets/...` paths in components. Vite serves `public/` at the root as-is.

- `frontend/public/assets` is the single source of truth AND the runtime store (git-committed
  so `npm run dev`/`build` serve it at the root). `npm run sync:assets` is now a no-op stub.
- Reference-style benchmark photos live in `frontend/design-system/references/benchmark-photos/`
  (not served).
- Never use generic stock photos when client assets exist in `public/assets/`.

### HD Asset Fallback Pipeline (image-explorer)

When a layout demands an asset that is missing, low-res, or irrelevant in `public/assets`,
use the global `image-explorer` tool instead of shipping a weak substitute:

- **Path (WSL):** `\\wsl.localhost\Ubuntu\home\yusuf\.opencode\tools\image-explorer`
  (`~/.opencode/tools/image-explorer/` — interface: `search.js`)
- **Usage:** `node search.js --query="nasi tumpeng" [--platform=all|unsplash|pexels|pixabay] [--count=5] [--orientation=landscape] [--save --out=...]`
- **Rule:** prefer HD results matching our warm OKLCH cream/amber palette and "homey,
  down-to-earth" photography (see `docs/design.md` §10 benchmark). Save fallback images
  into `frontend/public/assets/<subfolder>/` so the code references them at `/assets/...`.
