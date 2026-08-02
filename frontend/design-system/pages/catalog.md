# Page Override — Public Catalog (Paket)

Overrides MASTER.md for the package catalog page only.

## Layout
- Grid: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3` package cards.
- Hero: full-width, warm photography, one short heading (Merriweather) + WhatsApp CTA (`bg-primary`).
- Package card: `bg-card border-border rounded-lg shadow-sm`; name in Merriweather, price in Figtree `font-semibold`; per-portion note respects `min_order` (per-unit paket like Tumpeng Mini).

## Data
- Server data via React Query + Ky (`@/api/client.ts`) — never zustand, never raw fetch.
- Fields per backend `api-collection.md` (`menu_utama`, `menu_tambahan`, `fasilitas_termasuk`).

## Motion
- One GSAP reveal on hero (opacity/y 24px, stagger 0.08s) + ScrollTrigger on section headers. Nothing else.
