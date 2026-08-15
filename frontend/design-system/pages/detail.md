# Page Override — Paket Detail (sitemap #3.1)

Overrides MASTER.md for the package detail page only. Source of truth: the implementation contract in `frontend/docs/paket-detail-page-plan.md` (exec summary + §9–§25).

## Layout
- Desktop `lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]`: **CSS-native sticky gallery** left (`lg:sticky lg:top-24 lg:self-start` — NO measured JS offset), summary decision rail right. Full-width Menu & Fasilitas sections below, separated by top hairlines.
- Mobile: gallery → identity → price/terms → WhatsApp CTA → meta → description → menus → facilities.
- No cards-in-cards; editorial whitespace + hairline separators; photography drives the surface.

## Surface rules
- **Gallery:** Embla (reused `image-carousel.tsx`); vertical rail + prev/next + counter + fullscreen on desktop; swipe + dots + counter on mobile; all images open the single GlobalImageModal scoped to this package; carousel index stays in sync with the lightbox.
- **Summary:** Fraunces H1 (one `font-accent italic` word max), category eyebrow, Best Seller badge only when real, `Rp X / porsi` + `Min. N porsi`, OriginButton WhatsApp CTA (`wa.me/6287870306031`), text-only meta rows (Untuk / Kemasan / Kapasitas produksi).
- **Honesty:** null fields → rows/sections omitted; never `-`/`N/A`; empty gallery → branded empty media state (never another package's photo).
- **Motion:** grouped Framer reveals only (gallery = 1, summary = 3 groups, sections = subtle whileInView), luxury ease `[0.16,1,0.3,1]`, reduced-motion = opacity.
- **Chrome gate:** CTA band + footer deferred until the detail query settles; reset deterministically on id change (no timers).

## Data
- `GET /api/v1/paket/{paket}` (public) → `Paket` (contract-true nullable types) → `toDetailViewModel()` → declarative JSX. One query, key `["paket","detail",id]`; invalid id → no request, not-found shell.

## Motion
- No GSAP on this page. No per-element animation cascades.
