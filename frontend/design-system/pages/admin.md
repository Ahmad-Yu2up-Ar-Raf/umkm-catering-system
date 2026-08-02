# Page Override — Admin CMS / Mini POS

Overrides MASTER.md for admin surfaces (dashboard, orders, paket CRUD).

## Layout
- Sidebar nav (collapses to `Sheet`/`Drawer` on mobile) + content region.
- Orders: `Table` with `bg-muted/50` header, hairline `border-border`, status badges.
- Mini POS: numeric-heavy, `tabular-nums`, dense but touch-friendly (≥44px targets).

## Components (shadcn additions)
`table`, `sheet`, `drawer`, `dialog`, `select`, `checkbox`, `dropdown-menu`, `popover`, `separator`, `sonner` toasts.

> Forms are a **custom, user-owned surface** — do NOT use the shadcn `form` wrapper/react-hook-form stack. Build bespoke form components under `src/components/ui/core/block/` as directed by the user.

## Motion
- Mount/unmount via Framer Motion `AnimatePresence` (code-split chunk — admin only).
- NO motion on trust-critical actions (save order) — instant feedback.

## Data
- Orders list via React Query; mutations invalidate query keys; `total_harga` and `nomor_struk` are SERVER-computed (frontend preview is UX-only, never the source of truth).
