---
name: shadcn-architecture
description: Scalable shadcn/ui architecture for Catering Nusantara. Governs which primitives exist vs. are needed for the public catalog and the admin CMS/Mini POS, enforces cva + cn() discipline, and mandates re-theming via src/index.css tokens — never by editing core ui/ files. Use when creating, extending, or choosing UI components.
---

# shadcn/ui — Reusable Component Architecture

Base: shadcn/ui (Radix), Tailwind v4 CSS-first (no tailwind.config.js). Style `radix-maia`, icon library HugeIcons, ui alias `@/components/ui/fragments/shadcn-ui` (see `components.json`).

## Rules

1. **Reuse before creating.** If a shadcn primitive exists in `src/components/ui/`, use it — never hand-roll styled divs when a primitive covers it.
2. **Never edit core `src/components/ui/` files.** Re-theme exclusively via tokens in `src/index.css` (`@theme inline`). Customization goes in wrapper components, not in the primitive.
3. **Variants via `cva` + `cn()`** (`class-variance-authority` + `tailwind-merge`, already installed). Extend a Button/Input with `cva({ variants: ... })` in your own component — do not modify the primitive's variants.
4. **Add primitives with the CLI:** `npx shadcn add <name>` from `frontend/` (reads `components.json`, drops files into the ui alias, auto-installs Radix deps).
5. **Component map (sitemap-driven):**
   - Public catalog: `card`, `badge`, `button`, `skeleton`, `tabs` (menu categories), `dialog` (package quick-view), `select` (portion/paket choice), `input`/`label` (order form).
   - Admin CMS/POS: `table` (orders list), `sheet` (quick order details), `drawer`, `checkbox` (menu_utama/menu_tambahan pickers), `separator`, `dropdown-menu`, `popover`, `sonner` (toasts).
   - **Forms are custom/user-owned** — never add the shadcn `form` wrapper or react-hook-form/zod. Bespoke forms live under `src/components/ui/core/block/` per user direction.
6. **Server data stays out of components** — fetch with React Query via `@/api/client.ts` (Ky); components receive data as props.
7. **Semantic tokens only** in every class: `bg-background`, `text-foreground`, `text-primary`, `border-border`, `shadow-*`, `rounded-*`. No raw colors/fonts.

## Folder conventions

- Primitives: `src/components/ui/fragments/shadcn-ui/` (generated, read-only)
- Composed blocks: `src/components/ui/core/block/<feature>/` (existing pattern: `auth/login-block`, `contact/contact-block`)
- Pages: `src/pages/<area>/<page>.tsx` (route-level only)

## Verify

- `npm run typecheck` + `npm run lint` pass; new primitives compile under strict TS (`noUnusedLocals`).
- `npm run lint:design` (impeccable detect) stays clean after component work.
