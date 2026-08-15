<!-- Context Anchor & Monorepo Topology -->

> **Scope:** Feature Plan — "Paket Detail" (Package Detail Page, sitemap #3.1) · **Monorepo Root:** `../../`
>
> Companion docs: [Design (single source)](../docs/design.md) · [Frontend Architecture](../frontend/docs/architecture.md) · [Design System MASTER](../frontend/design-system/MASTER.md) · [Catalog Spec](../frontend/docs/katalog-spec.md) · [Backend API](../backend/docs/api-collection.md) · [Backend DB](../backend/docs/database.md) · [Sitemap §2](../../docs/architecture.md)
>
> **Status: FINAL IMPLEMENTATION CONTRACT — validated planning pass. No production code changes until implementation phase.**

---

# Paket Detail Page — Implementation Contract (validated)

## 1. Executive Summary

The Paket Detail page (`/paket/:id`) is the conversion step between the catalog (`/paket`) and the WhatsApp inquiry — the customer flow per `docs/architecture.md` §3.1:
`Catalog → Detail → WhatsApp`. The current page is a **hard-broken copy of the Sundress e-commerce "explore/[id]" page** and must be **replaced, not patched**.

The target is a **premium editorial detail page** that reads as the natural next level of `/paket` and `/galeri`:

| Pillar           | Decision (short)                                                                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Route**        | Keep `/paket/:id` (numeric `id` — backend route-model binds by primary key; no slug column exists).                                                                                                                                                   |
| **Data**         | `GET /api/v1/paket/{paket}` (`PaketController@show` → `PaketResource`). Single `useQuery`; no list reuse.                                                                                                                                             |
| **Gate**         | `src/store/detail-store.ts` (`ready`) + **explicit reset-on-id** effect; `LayoutWrapper` defers CTA band + footer until the current-id query settles. No timers.                                                                                       |
| **Layout**       | Desktop `lg:grid-cols-[1.1fr_1fr]`: **CSS-native sticky** gallery left (`lg:sticky lg:top-24 lg:self-start`, NO JS-measured offset), summary rail right; full-width Menu & Fasilitas sections below. Mobile: gallery → identity → price → CTA → sections. |
| **Gallery**      | Reuse Embla `image-carousel.tsx` + `paket-images-carousel.tsx` (controlled refactor); every image opens **GlobalImageModal** (single global lightbox, real store API documented in §12).                                                               |
| **CTA**          | One primary conversion: **WhatsApp** — canonical `https://wa.me/6287870306031` (verified identical in `faq-data.ts`, `catalog-header.tsx`, `site-footer.tsx`) with a prefilled, honest inquiry message. No cart/wishlist/ratings — none exist in the data or business model. |
| **Loading**      | 1:1 skeleton mirroring the final split (gallery + summary rail + section blocks); chrome gated until settle. 404/invalid id → dedicated not-found shell; API error → retry state (terminal states un-gate chrome).                                    |
| **Motion**       | **Grouped** (not per-node) reveals: gallery surface (one), summary identity group, price/terms group, CTA/meta group, subtle per-section whileInView. Framer only — **no GSAP**. Reduced-motion aware.                                                   |
| **Icons**        | Hugeicons only. **Remove all lucide-react.**                                                                                                                                                                                                          |
| **Dependencies** | None added. `embla-carousel-react`, `framer-motion`, `react-router`, TanStack Query all already installed.                                                                             |

---

## 2. Current State

### 2.1 Route + page shell — already wired

`src/router/index.tsx`:

```tsx
{
  path: "/paket",
  children: [
    { index: true, element: <PaketPage /> },
    { path: ":id", element: <PaketDetail /> },
  ],
},
```

`src/pages/paket/paket-detail.tsx` reads `useParams<{id}>`, redirects to `/paket` when `id` is absent, and renders `PaketDetailBlock id={id}`. Both exist. **The route is already registered** (commit `de30f8f`; contradicts the deferral note in `katalog-spec.md` §4.4 — the route landed anyway).

### 2.2 Current detail directory (audited)

```
src/components/ui/core/block/detail/
├── detail-block.tsx                  # ⛔ Sundress copy — BROKEN, replace wholesale
├── components/
│   ├── image-carousel.tsx            # Embla carousel core — KEEP + refactor (see §11)
│   └── paket-images-carousel.tsx     # Breakpoint wrapper — KEEP + refactor (see §11)
├── hooks/use-detail-query.ts         # KEEP + refactor (key, id guard, 404 typing)
└── types/detail-types.ts             # KEEP (envelope correct)
```

### 2.3 `detail-block.tsx` is dead code — replace, not patch

Verified broken (fails typecheck + runtime):
- **Nonexistent imports:** `@/lib/validations/index.t`, `@/config/enums/ProductsStatus`, `@/config/enums/CategoryProductsStatus`, `@/lib/utils/products/*`, `@/lib/actions/*`, `@/hooks/use-worldMax`, `@/hooks/use-initials`, `@inertiajs/react`, `lucide-react`.
- **Undefined variables:** the entire body reads `product`, `seller`, etc. — nothing is in scope.
- Renders Sundress-only concepts (ratings, VAT, cart/wishlist, shipping/returns accordions, vendor row) with **no Catering counterpart**.

**Verdict: DELETE the body; only the abstract split-viewport concept survives.** Component tree is rebuilt from scratch (§17).

### 2.4 Types & query hook (current)

- `types/detail-types.ts` — `PaketDetailResponse { status, message, data: Paket }` matches the wire envelope. **KEEP.**
- `types/paket-types.ts` — has contract mismatches and **over-promises nullability** (fixed in §7).
- `hooks/use-detail-query.ts` — functional but weaknesses (tri-element key, no id guard/enabled, 404 as generic `HTTPError`). Refactored in §8.

---

## 3. Existing Prototype Audit (`detail-block.tsx`)

| Prototype element                              | Sundress behavior                          | Catering verdict                                                                    |
| ---------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Back link nav (breadcrumb)                     | `Link href="/"` + ChevronLeft              | **Adapt** → `Link to="/paket"` + Hugeicon back arrow                                |
| 2-col `lg:grid-cols-2` grid                    | gallery \| details                         | **Keep structure** (Catering tokens/gaps)                                           |
| Image gallery                                  | Sundress `PaketImagesSlider` (Embla)       | **Reuse existing** Catering `paket-images-carousel.tsx` (port, then refactor §11)   |
| Rating badge (stars, `fill-yellow-400`)        | e-commerce ratings                         | **DELETE** — no rating data in `PaketResource`                                      |
| `<h1>` product name                            | Sundress `font-extrabold tracking-tighter` | **Re-skin** → Fraunces `font-heading font-light tracking-[-0.02em]` (brand grammar) |
| Price "incl. VAT + shipping"                   | e-commerce                                 | **DELETE** → honest `Rp X / porsi` + `Min. N porsi` terms                           |
| Add to Cart / Wishlist                         | `handleCart`/`handleWhishlist`             | **DELETE** — no cart in the business model (conversion = WhatsApp)                  |
| Tag badges (category/status/Free Shipping/New) | fakery                                     | **Adapt** → real badges only: `kategori_paket` + `kategori_acara` + `Best Seller`   |
| Accordion: Product Info / Shipping / Returns   | prop detail                                | **DELETE** — replace with editorial menu/terms sections (§9)                        |
| Seller row                                     | vendor store                               | **DELETE** — no vendor concept                                                      |
| StarRating component                           | —                                          | **DELETE**                                                                          |

---

## 4. Sundress Reference Audit

Source: `github.com/Ahmad-Yu2up-Ar-Raf/sundress-ecommerce-web` → `resources/js/pages/explore/[id].tsx` → `ProductDetailPage` (the copied `detail-block.tsx`) + a "Customers also bought" carousel + `<Head title>`.

**Worth carrying over (structure only):** split viewport (gallery + decision block); decision-block ordering (identity → price → CTA → supporting info); syncing thumbnail rail; fullscreen expand.

**Must NOT copy:** lucide icons, Inertia props flow, cart/wishlist actions, ratings, VAT/shipping/returns copy, vendor row, "bought together" carousel, typography, colors.

### Sundress → Catering mapping

| Sundress                                | Catering equivalent                                                               |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| `lucide-react`                          | `@hugeicons/react` + `@hugeicons/core-free-icons`                                 |
| `@inertiajs/react` (route/page props)   | `react-router` (`useParams`, `useNavigate`, `Link`)                               |
| `ProductsSchema` / `Vendor` / `@/types` | `Paket` (`block/paket/types/paket-types.ts`)                                      |
| `@/config/enums/*`, `ProductsStatus`    | `PaketKategoriEnum` + `PaketKategoriOptions` (labels/icons/colors only — **NOT images**, see §11.3) |
| `handleCart` / `handleWhishlist`        | none — primary CTA = WhatsApp (§13)                                               |
| Sundress image carousel                 | existing `detail/components/image-carousel.tsx` + `paket-images-carousel.tsx`     |
| Sundress "similar products" carousel    | **omit** (not in sitemap)                                                         |
| `<Head>` (Inertia)                      | `useSeo()` hook (`src/hooks/use-seo.ts`)                                          |
| Accordion (Product/Shipping/Returns)    | editorial sections (no accordions)                                                |
| Seller row + Avatar                     | **omit**                                                                          |

---

## 5. Catering Design System Audit (the vocabulary the detail page inherits)

Verified against `docs/design.md`, `MASTER.md`, `catalog.md`, `galeri.md` and shipped code:

| Asset               | Pattern (observed)                                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Eyebrow**         | `text-[11px] tracking-[0.34em] uppercase text-primary`, optional hairline flanks (`h-px w-8 bg-primary/60`) — `catalog-header.tsx`, `gallery-hero.tsx`                                                                                        |
| **Display H1**      | Fraunces `font-heading font-light tracking-[-0.02em] leading-[0.95]` with `clamp()`; **one** Instrument Serif italic accent word max (`font-accent italic text-primary`)                                                                      |
| **Card title**      | `font-heading font-semibold tracking-tight`, `line-clamp-1` (`paket-card.tsx`)                                                                                                                                                                |
| **Price**           | Space Grotesk `font-sans font-semibold`; `Intl.NumberFormat("id-ID", {style:"currency", currency:"IDR", maximumFractionDigits:0})` is **local to the consumer** (repo convention — no shared currency util)                                   |
| **Meta caption**    | `text-xs text-muted-foreground`, `/ porsi`, `Min. N porsi` honesty rule                                                                                                                                                                      |
| **Badges**          | shadcn `Badge`; category via `getCategoryIcon`/`getCategoryColor` (per-category `badgeColor`); `Best Seller` = existing `paket-card.tsx` pattern                                                                                              |
| **Card/base**       | `bg-card border-border rounded-2xl ring-1 ring-border`; hover `-translate-y-1.5 hover:shadow-xl` — **no card-in-card**                                                                                                                        |
| **Skeleton**        | shadcn `Skeleton` + `animate-pulse`, geometry mirrors real surface (`paket-grid.tsx`, `galeri-block.tsx`)                                                                                                                                    |
| **Motion grammar**  | luxury ease `[0.16,1,0.3,1]`; blur-fade reveals `opacity/y 22–24/blur 6–10`, `duration 0.6–0.7`; **one signature moment per surface**; all gated by `useReducedMotion()` / `MotionConfig reducedMotion="user"` (galeri precedent); blur cleared on complete |
| **CTA**             | `OriginButton` (magnetic + origin fill) — `catalog-header.tsx` pattern: `intensity={0.8} range={120}` + `window.open(WHATSAPP_URL, "_blank","noopener")`                                                                                       |
| **Not-found shell** | editorial: eyebrow → Fraunces H1 (accent word) → muted sub → outline Button — `galeri-category-block.tsx` (pattern, not copy)                                                                                                                |
| **Image treatment** | `MediaItem` (`@unpic/react`, lazy, spinner, `object-cover`); hover zoom/pause; lightbox = **GlobalImageModal** (single instance + store)                                                                                                      |
| **Containers**      | `container m-auto w-full`; section spacing `pt-10/16 pb-24/32`; warm cream scrims via `from-background/80 via-background/30 to-background`                                                                                                     |
| **Tokens only**     | ❌ no hex/OKLCH/font names in components (current prototype violates — `fill-yellow-400` etc.)                                                                                                                                                |
| **Sticky precedent**| CSS-native sticky only: `FilterBar`/`GalleryFilterBar` use `sticky top-[measured]` for the *bar*; for moving panels prefer plain `lg:sticky lg:top-* lg:self-start` (NO JS-derived offset — see §10.2 Sticky bug note) |

**Nusantara character:** typography (Fraunces + single `font-accent italic` word), warm cream/amber OKLCH tokens, natural client photography, soft `rounded-2xl`, generous rhythm. **No** batik/gold renders, **no** decorative SVG flourishes, **no** glassmorphism — photography and copy carry the identity.

---

## 6. Backend / API Audit (final contract)

### Endpoint
`GET /api/v1/paket/{paket}` — public, no auth. Route-model binding on **`id`**. Verified in `backend/routes/api.php` + `PaketController@show` (loads `images`).

### Response shape (`PaketResource`) — classification per §7

| Field | Wire type | `REQUIRED`/`CONDITIONAL`/`DERIVED`/`INTERNAL` | Notes |
|---|---|---|---|
| `id` | number | required | route param |
| `nama_paket` | string | required | title |
| `kategori_paket` | string | required | enum → `Nasi Box` \| `Prasmanan` \| `Snack` \| `Tumpeng` |
| `kategori_acara` | string \| null | conditional | enum → `Pernikahan` \| `Kantor` \| `Ulang Tahun` \| `Arisan` \| `Umum` |
| `menu_utama` | string[] | required | `min:1` on create |
| `menu_tambahan` | string[] \| null | conditional | nullable array |
| `fasilitas_termasuk` | string[] \| null | conditional | nullable array |
| `catatan_alergen` | string \| null | conditional | free text |
| `jenis_kemasan` | string \| null | conditional | e.g. "Box kertas food grade" |
| `min_order` | number | required | default 1 |
| `harga_per_porsi` | **string** | required | `decimal:2` → `"22000.00"`; `Number()` before formatting |
| `kapasitas_produksi` | number \| null | conditional | client range 20–1000 |
| `deskripsi` | **string \| null** | conditional | nullable on wire — VM normalizes |
| `thumbnail` | **string \| null** | conditional | null → fallback gallery (§11.3) |
| `images` | string[] | conditional | always loaded by show; may be `[]`; usually contains URL equal to `thumbnail` |
| `is_best_seller` | boolean | conditional | |
| `created_at` / `updated_at` | datetime strings | **internal** | not customer-facing |

**No slug column exists** → route stays numeric `/:id`.

**No backend changes required.** Seeded reality: 15 packages × 2–3 Cloudinary images; `thumbnail` = first upload; `menu_utama` non-empty everywhere; optional fields vary across rows. **Do NOT rely on seed completeness for the type contract** (§7).

---

## 7. Type Contract Strategy

### 7.1 Decision (explicit)

> **API-facing types mirror the real wire contract (nullable where the backend is nullable). Fallback/normalization happens in the view model (§14) — never by faking non-null in the shared type just because today's seed data happens to be complete.**

This reverses the earlier draft that kept `deskripsi: string` and `thumbnail: string`. The shared API type is honest; the VM applies `?? ""` / fallback. Consequence: every existing consumer that renders `deskripsi`/`jenis_kemasan` renders a `string | null` child — JSX children accept `null`, so the catalog (`paket-card.tsx`) continues to typecheck unchanged; the optional-field UI rule (§7.3) decides what appears.

### 7.2 Corrected `Paket` type (`block/paket/types/paket-types.ts`)

```ts
export interface Paket {
  id: number
  nama_paket: string
  kategori_paket: string
  kategori_acara: string | null          // was: string
  menu_utama: string[]
  menu_tambahan: string[] | null          // was: string[] (nullable on wire)
  fasilitas_termasuk: string[] | null     // was: string[] (nullable on wire)
  catatan_alergen: string | null          // was: string
  jenis_kemasan: string | null            // was: string
  min_order: number
  harga_per_porsi: string                 // decimal:2 → string; format via Number()
  kapasitas_produksi: number | null       // was: number
  deskripsi: string | null                // was: string — CONTRACT-TRUE
  thumbnail: string | null                // was: string — CONTRACT-TRUE
  images: string[]                        // may be []
  is_best_seller: boolean
  created_at: string                      // was: Date
  updated_at: string                      // was: Date
}
```
`PaketListResponse` / `Meta` unchanged.

### 7.3 Null / optional rule ("-", "N/A", "Unknown" are forbidden)

- **Section omits itself** when its source data is absent (mirrors `GalleryCard.metaText` filtering).
- The only contextual fallback is a warm "Keterangan belum tersedia" for the *description*, the one place a visitor expects prose.
- `min_order` shows only when meaningful (always show — business rule); `kategori_acara`/`jenis_kemasan`/`kapasitas_produksi`/`fasilitas`/`menu_tambahan`/`alergen` hide when absent.
- Never render empty badges, empty lists, or `RUB 0`-style fake values.

---

## 8. Routing Strategy

- **Path:** `/paket/:id` (numeric) — registered; targeted by `PaketCard` (`to={`/paket/${paket.id}`}`).
- **ID validation:** block/hook gates on `/^\d+$/.test(id)`; invalid → **not-found shell, no request** (`enabled:false` in the hook: `enabled: valid`).
- **404 (valid id, missing row):** JSON 404 → `HTTPError` with `response.status === 404` → not-found shell. Classify in the hook/block: `isNotFound = error instanceof HTTPError && error.response.status === 404`.
- **Other errors:** retry state (mirror `PaketGrid`).
- **SEO:** `useSeo` called at the top of `PaketDetailBlock` with derived args — default title during loading, real values once `data` exists (see §24).

---

## 9. Information Architecture

Visitor questions → sections:

1. What is this package? → identity group (eyebrow/badge, H1, best-seller)
2. Who is it for? → `kategori_acara` + description
3. How does it look? → gallery (sticky desktop)
4. How much / how many guests? → price + per-portion + min order + capacity
5. What is included? → `fasilitas_termasuk`
6. What menu? → `menu_utama` + `menu_tambahan`
7. What's different? → description + best-seller + kemasan + alergen
8. Next step? → WhatsApp CTA (in the summary rail, above the fold)

**Desktop (lg+):**
```
grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10
├── LEFT — gallery (CSS sticky, §10.2)
└── RIGHT — summary rail
    ├── [identity] eyebrow + H1 + best-seller badge
    ├── [price/terms] Rp X / porsi · Min. N porsi
    ├── [CTA] WhatsApp (OriginButton)
    ├── [meta] kategori_acara · jenis_kemasan · kapasitas_produksi (conditional rows)
    └── [description lead] (clamped, "Selengkapnya" anchor)
── then, full width below the split:
Section 2: Menu & Isi Paket — Menu Utama (always) + Menu Tambahan (conditional)
Section 3: Fasilitas & Ketentuan — fasilitas + catatan alergen (conditional)
```

**Mobile (< lg):** gallery → identity → price/terms → WhatsApp CTA → meta → description → menus → facilities. CTA right after price = above the fold past the gallery.

---

## 10. Desktop & Mobile Layout Strategy

### 10.1 Container & rhythm
`container m-auto w-full`; inner `px-5 sm:px-10`; section spacing `pt-12 md:pt-16` / `pb-24 md:pb-32`.

### 10.2 Desktop gallery sticky — **CSS-native, NOT JS-measured**

```tsx
<aside className="lg:sticky lg:top-24 lg:self-start">
```
- **No `useHeaderOffset()`** for this panel. The sticky requirement is "stays in view with comfortable clearance", not "aligned exactly under the chrome". JS-measured offsets caused the earlier Gallery sticky bug (sticky activating too early under a changing auto-hide header). A fixed token `lg:top-24` (96px) is deterministic and immune to header height variance.
- Element height must stay under the viewport: gallery surface capped `lg:max-h-[min(38em,80svh)]` (carousel's own `md:h-[35em]` baseline, clamped so thumbs remain visible).
- Breakpoints:
  - `< 1024`: sticky **off** (normal flow, single column).
  - `1024` = `lg:` — sticky ON, `top-24`.
  - `1280` / `1440`: same `lg:top-24` (tokens scale; no extra code).
  - Large desktop: gallery width driven by the `1.1fr` column — capped by `container`; no full-bleed.
- Right rail scrolls; sticky ends when the rail's (undefined) column ends — i.e. it floats only as long as the gallery can stay in its own grid cell (native sticky behavior, no JS).

### 10.3 Desktop
- Grid `lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10`.
- Gallery: main `aspect-[4/3] sm:aspect-[16/10] rounded-2xl`, vertical thumb rail left, `SliderPrevButton`/`SliderNextButton` edge pills, counter `SliderSnapDisplay`, fullscreen button.
- Price `font-sans font-semibold text-3xl md:text-4xl`; terms `text-xs text-muted-foreground`.

### 10.4 Mobile / tablet
- Gallery first (horizontal Embla), dots + counter, touch ≥44px, no thumb rail.
- Identity → price → WhatsApp CTA immediately after gallery.
- Sections stacked; no horizontal page scroll.

---

## 11. Image Gallery Interaction (first-class media experience)

### 11.1 Audit of the current components

**`components/image-carousel.tsx`** — ported Embla core. Exports: `Carousel`, `SliderContainer`, `Slider`, `SliderPrevButton`, `SliderNextButton`, `SliderProgress`, `SliderSnapDisplay`, `SliderDotButton`, `CarouselIndicator`, `ThumbsSlider`, `useCarousel`. Context exposes `emblaApi`, `emblaThumbsApi`, `prevBtnDisabled`, `nextBtnDisabled`, `onPrevButtonClick`, `onNextButtonClick`, `selectedIndex`, `scrollSnaps`, `onDotButtonClick`, `scrollProgress`, `selectedSnap`, `snapCount`, `onThumbClick`, `carouselId`, `orientation`, `direction`, `handleKeyDown` (ArrowL/R for horizontal, ArrowU/D for vertical), `slidesArr`/`setSlidesArr`.

Strengths: solid Embla wiring, thumbs sync + auto-scroll, dots/counter/progress, keyboard handler, `isScale` tween (unused by us — the gallery uses plain axis), Framer snap-display counter (`AnimatePresence`).

Issues for Catering gates:
| # | Issue | Fix |
|---|---|---|
| 1 | Hardcoded `bg-gray-500`, `bg-black`, `dark:bg-white` | semantic tokens (`bg-muted`, `bg-foreground/30`, `bg-card/80`, `bg-primary`) |
| 2 | Desktop wrapper uses `direction:"rtl"` + vertical axis (confusing orientation, thumbs on wrong edge) | vertical axis, **no rtl**; thumbs rail left, main right |
| 3 | Wrapper renders no prev/next | render `SliderPrevButton`/`SliderNextButton` (glass `size-11` pills like `GlobalImageModal`) — desktop only; mobile = swipe + dots |
| 4 | No lightbox hook | main-image click + fullscreen button → `useImageModalStore.open(galleryScope, currentIndex)` (§12) |
| 5 | `MediaItem` hardcodes `alt={webViewLink}` | add optional `alt` prop to `MediaItem` (default = current behavior); detail passes `paket.nama_paket`, `alt=""` for decorative thumbs |
| 6 | Magic `w-18`/`h-18`/`h-[400px]` thumb sizes | tokenized `w-16 md:w-20`, thumb `aspect-[3/4]` |
| 7 | No dedupe against `thumbnail` | gallery built in VM: `dedupe([thumbnail, ...images])` |
| 8 | Missing counter `aria-live`, thumb labels | `SliderSnapDisplay` renamed/wrapped with `aria-live="polite"`; thumb `aria-label="Slide N"`; buttons `aria-label` ("Sebelumnya"/"Berikutnya"/"Perbesar") |

**`components/paket-images-carousel.tsx`** — the responsive switch (mobile horizontal / desktop vertical). Refactor to: accept a `gallery: string[]` + `alt` prop (instead of deriving from children), own `currentIndex` + report it up or emit `onIndexChange`, render controls/counter/fullscreen, call the modal store. Rename export to `PaketImagesCarousel` (tree-shakeable named export; keep a default alias if preferred).

### 11.2 Desktop interaction spec
- Main image (largest slot) + vertical thumb rail (left). Thumb click → `scrollTo`. Active thumb = `border-primary opacity-100` (existing ThumbsSlider pattern).
- Prev/Next buttons flank the main image; disabled at ends (`prevBtnDisabled`/`nextBtnDisabled` from context).
- Counter `1 / N` (SnapDisplay) `aria-live="polite"`, top-right or overlay.
- Fullscreen button (top-right) opens the modal at the current index.
- Keyboard: the context's `handleKeyDown` gives ArrowUp/ArrowDown on the vertical axis; buttons are fully focusable.

### 11.3 Mobile interaction spec
- Horizontal swipe (Embla native), dots (`SliderDotButton`) + counter.
- No thumb rail. Prev/Next rendered **only if useful** → decision: **omit on mobile** (dots + swipe cover it; avoids cramped touch targets).
- Fullscreen button stays (44px target).
- Touch targets ≥44×44 for every control.

### 11.4 Image fallback — **category-image claim REJECTED (assets don't exist)**
`public/assets/images/categories/` **does not exist on disk**; `PaketKategoriOptions[*].image` paths are dead references. The prior plan's "use the category image" fallback would 404.

New fallback tiers (no new assets, no backend change):
1. **Gallery empty** (thumb + images both missing) → render **one static slide** with a guaranteed-present brand asset: `/assets/images/banners/hero-banner-tumpeng.png` (shipped + used by Hero/CTA — confirmed on disk).
2. **Load failure** on any slide → swap that slide's `src` to the same brand asset (handled in the gallery wrapper's `onError`, since `MediaItem` has no `onError` prop — small wrapper addition; falls back to state-driven replace).
3. **Empty-state panel** (applications where even the brand asset 404s — defensive): a rounded `bg-muted` panel with the category label + "Foto paket segera hadir" via `VisionMobileTech`-style Hugeicon. Honest, accessible, no broken `<img>`.
The fallback slide still opens the modal (single item, `next/prev` no-op) — optional; simplest is to **not** wire a fallback-only slide to the modal.

---

## 12. Global Image Modal Integration (real API documented)

**Do not create a second lightbox.** Verified store (`src/store/image-modal-store.ts`):

```ts
export interface ImageModalItem { src: string; title?: string; caption?: string; category?: string }

// state
isOpen: boolean; items: ImageModalItem[]; index: number

open(items, index = 0)   // open a scope, starting at index
openSingle(item)          // open one item (next/prev become no-ops)
close()                   // close (also via backdrop/ESC)
next() / prev()           // wrap-around; no-ops when < 2 items or closed
setIndex(index)           // direct index set (sync escape hatch)
```
Mount: `<GlobalImageModal />` once in `App.tsx` (verified). Behavior: largest-fit sizing from measured natural dims, `object-contain`, caption band, scroll-lock, ESC / ← / → keyboard.

### The gallery → modal contract (package-scoped)
```ts
// gallery VM output (per §14)
const modalScope: ImageModalItem[] = gallery.map(g => ({
  src: g,
  title: paket.nama_paket,
  category: kategoriLabel,          // e.g. "Prasmanan"
  caption: kategoriAcara ?? undefined, // honest meta only; omit when absent
}))

// open from the gallery at the carousel's current index:
useImageModalStore.getState().open(modalScope, currentIndex)
```
- **Scope == THIS package only** — `thumbnail + images` deduped, no unrelated assets. Verified `open` accepts scope + index.
- **Index synchronization contract** (requirement §3#12):
  - Carousel → modal: pass the carousel's `selectedIndex` as `open`'s 2nd arg.
  - Modal → carousel: while `isOpen`, a tiny effect in the gallery subscribes `useImageModalStore((s) => s.index)` and calls `embla.scrollTo(s.index)`; on close the carousel is already at the modal's last-viewed slide. (The modal's `next/prev` update the store index; `setIndex` exists but is not needed — the subscription covers it.)
  - Single-image scope: `next/prev` no-ops (store guarantees), opening passes index 0.
- Escape/close returns to the carousel at the same index (state single-sourced in the store).
- No changes to `GlobalImageModal` or the store needed.

---

## 13. Action / CTA Strategy (canonical WhatsApp source)

### 13.1 Canonical WhatsApp source — VERIFIED

**The single confirmed business number is `6287870306031`.** Grep over the project:

| Location | Value |
|---|---|
| `src/components/ui/core/block/home/faq/faq-data.ts:27` | `export const WHATSAPP_URL = "https://wa.me/6287870306031"` |
| `src/components/ui/core/block/paket/components/catalog-header.tsx:9` | `const WHATSAPP_URL = "https://wa.me/6287870306031"` |
| `src/components/ui/core/layout/site-footer.tsx:37` | `{ name: "Hubungi WhatsApp", to: "https://wa.me/6287870306031" }` |
| `ordering-data.ts` | text-only step "Konfirmasi via WhatsApp" — no URL |

No other number exists anywhere in the codebase. The project **already duplicates the constant locally 3×**; it is consistent (no conflicting number has ever been introduced — earlier draft text in this plan had a wrong number once; now corrected + verified).

**Decision for this task:** introduce **no 4th number and no new duplication**. The detail block uses `https://wa.me/6287870306031` exactly as the other three do. **Consolidation is out of scope** (3 existing copies + a shared config is a separate refactor) — noted in Risks §30 as follow-up.

### 13.2 CTA composition
- **Primary:** `OriginButton` (intensity 0.8 / range 120, exactly `catalog-header.tsx`):
  `Pesan via WhatsApp` + Hugeicon arrow, `window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(message)}`, "_blank", "noopener")`.
- **Message** (honest, no fabricated numbers):
  `Halo Catering Nusantara, saya ingin memesan paket {nama_paket} ({harga}/porsi, min. {min_order} porsi). Mohon info ketersediaannya.`
- **Secondary:** "Kembali ke katalog" ghost link to `/paket`.
- **Deferred (documented, not MVP):** lightweight portion-count preview (qty picker → richer WA message with `qty × harga_per_porsi` estimate). UX-only — the server owns `total_harga`; this is sitemap's "Kalkulator Porsi" future work (§30).

---

## 14. Loading Skeleton Strategy (1:1, refined)

`DetailSkeleton` using shadcn `Skeleton` + `animate-pulse`, geometry mirrors the real page exactly (one responsive skeleton — same grid classes collapse for mobile):

```
container
├── grid lg:grid-cols-[1.1fr_1fr] gap-10 (lg:) / flex-col (mobile)
│   LEFT  (gallery)                       RIGHT (summary rail)
│   ├── Skeleton aspect-[4/3] rounded-2xl  ├── Skeleton h-3 w-28 rounded-full      (eyebrow)
│   ├── (lg only) rail:                    ├── Skeleton h-9 w-3/4                  (title)
│   │   3× Skeleton w-16 aspect-[3/4]      ├── Skeleton h-6 w-32 mt-2              (badge row)
│   └── (mobile only) dots:                ├── Skeleton h-12 w-56 mt-6             (price)
│       3× Skeleton size-2 rounded-full    ├── Skeleton h-11 w-full mt-4
│                                          │    rounded-[100px]                     (CTA pill)
│                                          ├── Skeleton h-4 w-full mt-8 ×2        (description lead)
│                                          └── Skeleton h-20 w-full mt-8           (meta block)
BELOW (full width):
├── Skeleton h-7 w-48 mt-10                      (section heading)
├── Skeleton h-16 w-full max-w-3xl rounded-xl ×2 (menu lists)
└── Skeleton h-16 w-full max-w-3xl rounded-xl ×1 (facilities)
```
- Includes gallery counter/dots footprints (mobile) and thumb rail (desktop).
- Rendered only while `isLoading` (no cached data); back-nav cache hit renders content instantly (skeleton flash-free).
- **Layout shift minimized:** same aspect boxes, same column widths, `Skeleton` preserves box model.

---

## 15. Error / Empty / Not-Found States

| State | Trigger | UI | Chrome gate |
|---|---|---|---|
| **Loading** | `query.isLoading` (no cache) | §14 skeleton | **off** |
| **Invalid id** | `!/^\d+$/.test(id)` (`enabled:false`) | not-found shell | **on** (terminal, no request) |
| **404** | `HTTPError` status 404 | not-found shell | **on** (terminal) |
| **API error** | other `isError` | `Gagal memuat paket` + `Button variant="outline"` retry (`refetch`) | **on** (terminal) |
| **Optional/null data** | any `… | null` | section omitted (never `-`) | — |
| **No images** | thumb + images empty | brand-asset fallback slide (§11.4) | — |

**Not-found shell** (pattern from `galeri-category-block.tsx`, not its copy):
```
<section container py-28 text-center>
  <p eyebrow>Katalog Paket</p>
  <h1 font-heading clamp(36px,5vw,64px)>Paket tidak <span font-accent italic>ditemukan</span></h1>
  <p muted>Paket yang Anda cari tidak tersedia. Jelajahi katalog kami sebagai gantinya.</p>
  <Button outline onClick={navigate("/paket")}>Lihat katalog paket</Button>
</section>
```
**Error shell:** same structure, H1 "Gagal memuat paket", retry button.

---

## 16. Global CTA / Footer Gating — Reset Semantics

### 16.1 The problem (two sides)
1. Today `layout-wrapper.tsx` shows chrome immediately on `/paket/:id`:
```ts
const showChrome =
  pathname === "/paket" ? catalogEnded
  : pathname.startsWith("/galeri") ? galeriReady
  : true                                    // ← /paket/:id lands here → CTA/footer flash during loading
```
2. Cross-route: `/paket/1` settles → `ready=true` → navigate `/paket/2` → the NEW id's query is loading, but the stale `ready=true` would flash CTA/footer before the new page settles **unless the gate resets deterministically**.

### 16.2 Store + reset semantics (`src/store/detail-store.ts` — new)

```ts
type DetailState = { ready: boolean; setReady: (ready: boolean) => void }
export const useDetailStore = create<DetailState>((set) => ({ ready: false, setReady: (ready) => set({ ready }) }))
```

### 16.3 Deterministic lifecycle (the contract)

In `PaketDetailBlock`, **two effects**, not one:

```ts
const { id } = props
const query = useDetailQuery(id)              // key ["paket","detail",id]; enabled: /^\d+$/.test(id)
const setReady = useDetailStore(s => s.setReady)

// (1) RESET — chrome hidden the instant the route/id changes (mount included).
useEffect(() => { setReady(false) }, [id, setReady])

// (2) UNGATE — only when the CURRENT id's query has settled.
//     isLoading=false covers: success, error, 404, invalid-id (enabled:false),
//     and cache hits (back-nav) — all terminal/there-is-content states.
const settled = !query.isLoading
useEffect(() => { setReady(settled) }, [settled, setReady])
```

State-by-state table:

| Scenario | `query.isLoading` | Effect (1) | Effect (2) | Final `ready` | Why correct |
|---|---|---|---|---|---|
| Initial mount, valid id, fetching | true | false | skip | **false** | skeleton visible, chrome off |
| Settle success | false | — | true | **true** | content visible → chrome ok |
| 404 / API error | false | — | true | **true** | terminal page → footer escape hatch |
| Invalid id (`enabled:false`) | false | false | true (same commit) | **true** | terminal not-found, no request |
| `/paket/1` → `/paket/2`, 2 not cached | true | false | skip | **false** | skeleton, chrome off |
| `/paket/2` cache-hit (back-nav) | false | false | true (same commit) | **true** | content instantly visible |
| Background refetch on cache hit | false | — | true | **true** | content visible, keep chrome |

- Both effects run in the same commit; the reset effect runs first, so a same-commit ungate is safe (final value wins).
- **No timers, no delays** — pure route/query state.
- Stale flags off-route are harmless: `LayoutWrapper` consults the store **only** on `pathname.startsWith("/paket/")`; navigating to `/paket`, `/galeri`, or home switches the branch (mirrors how `catalog/gallery` flags already behave).

### 16.4 LayoutWrapper change

```ts
const detailReady = useDetailStore(s => s.ready)
const isDetail = pathname.startsWith("/paket/")
const showChrome = isDetail ? detailReady
  : pathname === "/paket" ? catalogEnded
  : pathname.startsWith("/galeri") ? galeriReady
  : true
```

---

## 17. Component Architecture (final)

```
src/pages/paket/paket-detail.tsx        # thin shell: useParams → <PaketDetailBlock id={(id)} /> (+ required-id redirect)
└── block/detail/detail-block.tsx       # ORCHESTRATOR (rewritten): query + gate effects + state router + grouped reveal
    ├── use-detail-query (hook, refactored)   # key ["paket","detail",id]; enabled:valid; exposes isNotFound
    ├── <DetailSkeleton />                    # §14
    ├── <DetailNotFound />                    # §15
    ├── <DetailError onRetry />               # §15
    └── <DetailContent paket>
        ├── <DetailGallery gallery, alt, onOpenModal(index)/onIndexChange>
        │      # wraps PaketImagesCarousel (refactored) + modal scope + index sync
        ├── <DetailSummary paket>            # identity / price-terms / CTA / meta (3 motion groups inside)
        ├── <DetailMenu paket>               # menu_utama + menu_tambahan (conditional)
        └── <DetailFacilities paket>         # fasilitas + catatan_alergen (conditional)
```
- `detail-block.tsx`: chrome-gate effects, state routing, grouped reveal, `useSeo`. No business logic in JSX.
- Summary's three motion groups (#1 identity, #2 price/terms, #3 CTA/meta) are explicit `motion.div`s with `data-*` handles — grouped, not per-node (§21).
- Mirrors the paket block convention: orchestrator + `components/` + `hooks/` + `types/`.

---

## 18. Reusable Components (borrow — do not re-create)

| Need | Reuse | Notes |
|---|---|---|
| Price/terms | local `formatIDR` (Intl, id-ID) | repo convention: one-liner per consumer, no shared module |
| Category badge | `getCategoryIcon` / `getCategoryColor` / `getCategoryLabel` (`paket-kategori-utils.ts.ts`) | colors/icons only — **not** `PaketKategoriOptions.image` (broken path) |
| CTA | `OriginButton` | exact `catalog-header.tsx` props |
| Images | `MediaItem` | + optional `alt` prop (custom-ui fragment — edit allowed) |
| Skeleton | shadcn `Skeleton` | |
| Buttons/Badge/Separator | shadcn fragments | |
| Motion | `MotionConfig`, `useReducedMotion`, luxury-ease constants, (optional) `BlurReveal` | no GSAP |
| Lightbox | `GlobalImageModal` + `useImageModalStore` | real API §12 |
| Sticky | CSS-native `lg:sticky lg:top-24 lg:self-start` | NO `useHeaderOffset` for the panel (§10.2) |
| SEO | `useSeo` | |
| Scroll reset | global `ScrollToTop` | |

---

## 19. Shadcn / Radix Components

Verified available: `accordion, avatar, badge, button, card, carousel, checkbox, collapsible, dialog, drawer, dropdown-menu, field, input, label, popover, select, separator, sheet, sidebar, skeleton, sonner, spinner, table, tabs, textarea, tooltip`.

Detail needs exactly: **`Badge`, `Button` (+ `buttonVariants`), `Separator`, `Skeleton`**. No dialog/accordion — editorial scroll; don't add interaction friction.

---

## 20. Icon Strategy

- All icons from `@hugeicons/core-free-icons` via `@hugeicons/react`. **Zero lucide.**
- Needed: back arrow (exists in `KATEGORI_PAKET` family — verify exact name at build with the icon-check script), expand/fullscreen — mirror `gallery-featured`'s cheap `⤢` text glyph or pick a Hugeicon, `WhatsappIcon` (used in `site-header.tsx`), category icons from `PaketKategoriEnum`/`KATEGORI_PAKET`.
- Meta rows ship **text-only**; icons only where they earn space (category badge, CTA arrow). "One decoration per surface."

---

## 21. Animation Strategy — Grouped, Premium, Minimal

### 21.1 Gallery reveal (requirement §5)
Single coordinated `motion.div` **wrapping the entire gallery surface** (carousel + thumbs + counter + controls — one node, not per-slide):

```tsx
const GROUP = { opacity: 0, y: 24, filter: "blur(10px)" }
const SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" }
<motion.div
  initial={reduced ? { opacity: 0 } : GROUP}
  animate={reduced ? { opacity: 1 } : SHOWN}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  onAnimationComplete={() => el.style.filter = ""}   // clear blur
> …gallery… </motion.div>
```
- opacity `0→1`, blur `10→0`, translateY `24→0`, luxury ease, **no bounce, no scale** (brief §5: "elegant easing, no exaggerated scale").

### 21.2 Summary rail — grouped groups, tight stagger
Three `motion.div` groups (identity / price-terms / CTA-meta) with a **parent** stagger 0.08–0.1, same tween as above — each group animated as one node. **Explicitly NOT** per-icon, per-badge, per-line, or per-menu-item animation.

### 21.3 Lower sections
One subtle `whileInView` per section (Menu, Facilities): `{ opacity: 0 → 1, y: 16 → 0 }`, 0.6s, luxury ease, `viewport={{ once: true }}`. No blur below the fold (perf).

### 21.4 Reduced motion & rules
- `MotionConfig reducedMotion="user"` at the block root (galeri precedent) collapses transforms/filter to opacity.
- **Framer Motion only.** GSAP is **intentionally not used** (no scroll-driven/timeline interaction exists here; brief §19 — don't add GSAP just because it's installed). GSAP stays for scroll-pinned sections elsewhere (hero/ordering).
- One signature moment per surface (design.md §7); sections declare, never cascade.

---

## 22. Performance Strategy

- **One request** (`useQuery`, `staleTime` from App default 5 min, `retry:1`, no polling) — mirrors `use-paket-query.ts` (no `refetchInterval`).
- **Images:** `MediaItem` lazy; main `width/height` 1600×1200, thumbs 320×240 via @unpic responsive `sizes`; Cloudinary CDN.
- **Skeleton only on empty cache** — back-nav instant.
- **Motion:** blur only during the 0.7s reveal, `filter` cleared on complete (galeri/`BlurReveal` pattern); `will-change` only while tweening; **no scroll listeners** (sticky is CSS).
- **Rerenders:** carousel index local to `DetailGallery`; store holds no server data; memoized view model; single data flow.
- **Code-split:** not needed (consistent with current router).

---

## 23. Accessibility Strategy

| Area | Plan |
|---|---|
| Semantics | one `h1` (paket name); `h2` per section; `aria-labelledby` on sections; breadcrumb (if rendered) in `<nav aria-label="Breadcrumb">` |
| Images | `MediaItem` gains optional `alt` (default keeps `src`); detail passes `alt={nama_paket}` on main + thumbs, `alt=""` (`aria-hidden`) on decorative thumbs |
| Carousel | keyboard already wired (`handleKeyDown`: U/D vertical, L/R horizontal) — keep after refactor; `SliderPrevButton`/`SliderNextButton` labeled `aria-label="Sebelumnya"/"Berikutnya"`; counter `aria-live="polite"`; ThumbsSlider buttons `aria-label="Slide N"` + `aria-current` on active; dots already labeled |
| Fullscreen | accessible trigger (`aria-label` e.g. "Perbesar gambar"), focusable, Enter/Space works (OriginButton/Button) |
| Lightbox | already compliant (dialog, ESC, arrows, scroll-lock) — reuse as-is; focus returns naturally on close |
| Focus-visible | `focus-visible:ring-2 ring-ring` on all controls (tokens) |
| Touch | all interactive targets ≥44×44 (CTA `h-12` pill, icon buttons `size-11`) |
| Reduced motion | §21.4; `MotionConfig reducedMotion="user"` |
| Contrast | semantic tokens only; muted text on background ≥ AA (site standard) |

---

## 24. SEO Strategy

- `useSeo` (existing hook) called at the top of `PaketDetailBlock` with derived values:
  - Loading / default: `title: "Paket Catering | Catering Nusantara"`, `path: /paket/{id}`.
  - Data: `title: `${nama_paket} | Catering Nusantara``, `description: `${deskripsi?.slice(0,160)}`` (fall back to category line when null).
  - Not-found: `title: "Paket tidak ditemukan | Catering Nusantara"`.
- Heading structure = semantic outline (h1 → h2 sections).
- `index.html` static baseline stays; the hook swaps title/description/OG/canonical per route (docs/seo/README.md placeholder domain unchanged).
- Alt text = package name (image SEO).

---

## 25. Data View Model (single transformation layer)

`block/detail/utils/detail-view-model.ts` — one pure function, keeps JSX declarative:

```ts
export interface DetailViewModel {
  gallery: string[]                      // dedupe([thumbnail ?? null, ...(images ?? [])]).filter(Boolean)
  galleryFallback: string                // brand asset (or empty-statepanel marker)
  priceLabel: string                     // formatIDR(Number(harga_per_porsi))  — guard NaN/0 → "—"
  terms: string[]                        // ["Min. 10 porsi"] + conditional ["Kemasan …"]
  categoryLabel: string                  // getCategoryLabel(kategori_paket)
  categoryIcon / categoryColor           // via existing utils
  eventLabel?: string                    // kategori_acara ?? undefined (omit row when absent)
  capacityLabel?: string                 // kapasitas_produksi → "Kapasitas produksi: N porsi"
  menuMain: string[]                     // menu_utama
  menuExtra: string[] | null             // menu_tambahan (raw — conditional render upstream)
  facilities: string[] | null
  allergenNote: string | null
  bestSeller: boolean
  description: string | null
  waMessage: string                      // built from nama_paket, priceLabel, min_order (§13.2)
}
export function toDetailViewModel(paket: Paket): DetailViewModel { … }
```
- All formatting/output decisions live here; components only consume the VM (`paket` prop is not passed raw into presentational components — only the VM + `id` are).
- Keeps "API typed → VM normalized → declarative UI" and keeps business logic out of JSX (brief §14).

---

## 26. File Change Plan (validation pass adds 2 files)

### CREATE
| File | Why |
|---|---|
| `src/store/detail-store.ts` | chrome gate store (§16) |
| `frontend/docs/paket-detail-page-plan.md` | this contract (updated) |
| `design-system/pages/detail.md` | page override (mirror `catalog.md` brevity) — generated during Phase 1 |
| `block/detail/components/detail-gallery.tsx` | gallery surface: carousel wiring + modal scope + index sync + fallback (§11–12) |
| `block/detail/components/detail-summary.tsx` | identity/price-terms/CTA/meta groups (§9) |
| `block/detail/components/detail-menu.tsx` | Menu Utama + Tambahan |
| `block/detail/components/detail-facilities.tsx` | fasilitas + alergen |
| `block/detail/components/detail-skeleton.tsx` | 1:1 skeleton (§14) |
| `block/detail/components/detail-not-found.tsx` | 404/invalid (§15) |
| `block/detail/components/detail-error.tsx` | retry (§15) |
| `block/detail/utils/detail-view-model.ts` | single transform layer (§25) |

### MODIFY
| File | Why |
|---|---|
| `block/detail/detail-block.tsx` | **rewrite** (orchestrator + gate effects + grouped reveal + `useSeo`) |
| `block/detail/hooks/use-detail-query.ts` | key `["paket","detail",id]`, `enabled` id-guard, `isNotFound` classification |
| `block/detail/components/image-carousel.tsx` | tokens-only, alt passthrough, no-rtl vertical, a11y labels (§11.1) |
| `block/detail/components/paket-images-carousel.tsx` | gallery prop + alt, controls, counter, fullscreen, modal hook, dedupe, fallback (§11.2–11.4); export `PaketImagesCarousel` |
| `block/paket/types/paket-types.ts` | §7.2 nullability + timestamp strings (contract-true) |
| `src/pages/paket/paket-detail.tsx` | pass `id`, keep required-id redirect, thin shell |
| `src/components/provider/layout-wrapper.tsx` | detail branch in `showChrome` (§16.4) |
| `src/components/ui/fragments/custom-ui/media-item.tsx` | add optional `alt` prop (custom-ui fragment — allowed; default keeps `src` alt to avoid breaking existing callers) |

### DELETE
None (the prototype body is replaced in place; nothing else is dead).

### KEEP
`types/detail-types.ts`, `MediaItem`, `GlobalImageModal` + store, `useSeo`, `useHeaderOffset` (unused by detail — kept for catalog), `PaketKategoriOptions`/utils (icons/colors only), shadcn fragments, motion primitives, `PaketCard` link.

---

## 27. Dependencies / Library Compatibility

| Sundress prototype | Exists? | Verdict |
|---|---|---|
| `lucide-react` | ❌ | **Remove** → Hugeicons |
| `@inertiajs/react` | ❌ | **Remove** → react-router |
| embla-carousel | ✅ `embla-carousel-react` v8 | **Keep** (reuse in `image-carousel.tsx`) |
| framer-motion | ✅ | **Keep** (grouped reveals) |
| TanStack Query | ✅ | **Keep** |
| shadcn/Radix | ✅ | **Keep** |
| `@/lib/actions/*`, `@/config/enums/*`, `@/lib/utils/products/*`, `@/lib/validations/index.t` | ❌ | **Remove** (Sundress-only) |
| `@/hooks/use-worldMax`, `use-initials` | ❌ | **Remove** |
| `Avatar`, `Accordion`, `Tabs` | exist/unused | **Not needed** |
| New packages | — | **None** |

---

## 28. Implementation Phases

1. **Phase 0 — Discovery** ✅ (this contract)
2. **Phase 1 — Architecture:** `detail-store.ts` + `layout-wrapper` branch + `design-system/pages/detail.md`. Gate: `typecheck`.
3. **Phase 2 — Types & data:** `paket-types.ts` (nullability), `use-detail-query.ts` (key/enabled/404), `detail-view-model.ts`. Gate: `typecheck`.
4. **Phase 3 — State shell:** rewrite `detail-block.tsx` — skeleton/not-found/error/content routing + gate effects. Gate: `typecheck && lint && lint:design`.
5. **Phase 4 — Gallery:** carousel refactor (tokens, no-rtl, alt, a11y) + `paket-images-carousel.tsx` (controls/counter/fullscreen/dedupe/fallback) + `detail-gallery.tsx` + GlobalImageModal wiring + index sync. Gate: `typecheck && lint:design`.
6. **Phase 5 — Content:** `detail-summary` (identity/price/CTA/meta), `detail-menu`, `detail-facilities`. Gate: `typecheck && lint && lint:design`.
7. **Phase 6 — Motion + responsive:** grouped reveals (galery group / summary groups / section whileInView), sticky gallery, mobile/375/768/1024/1280/1440 checks. Gate: `lint:design` + manual.
8. **Phase 7 — A11y + SEO:** alt props, aria labels, `useSeo` wiring, keyboard/contrast pass. Gate: manual + `lint:design`.
9. **Phase 8 — Performance:** image sizes, cache, blur cleanup, no scroll listeners. Gate: manual (network/scroll).
10. **Phase 9 — Verification:** `typecheck`, `lint`, `lint:design` (must be `[]`), manual browser pass incl. cross-detail nav chrome test, reduced motion, Tumpeng Mini terms, fallback gallery.

---

## 29. Verification Checklist (acceptance)

- [ ] `/paket/:id` shows skeleton with chrome hidden; on settle CTA/footer appear (no timers).
- [ ] **Cross-detail nav** `/paket/1` → `/paket/2`: chrome does NOT flash during the new loading (gate reset passes §16.3 table).
- [ ] Invalid id `/paket/abc` → not-found shell + chrome (no request fired).
- [ ] 404 `/paket/99999` → not-found shell + chrome; API 500 → retry; retry recovers.
- [ ] Gallery desktop: vertical thumb rail sync, prev/next, counter, fullscreen; mobile: swipe + dots, no cramped rail.
- [ ] Gallery → modal opens at current index; modal scope = this package only; modal prev/next wrap; close returns carousel at same index.
- [ ] Empty gallery → brand-asset fallback slide (no broken images, still accessible).
- [ ] WhatsApp CTA: canonical `wa.me/6287870306031`, prefilled honest message, new tab with `noopener`.
- [ ] Price honesty: `Rp 25.000 / porsi · Min. 10 porsi` (Tumpeng Mini); no invented totals as authoritative.
- [ ] All 15 API fields classified (§6/§7) — no meaningful data omitted, no `-`/`N/A`.
- [ ] `typecheck`, `lint`, `lint:design` clean; no lucide; tokens only; no new deps; no backend changes.
- [ ] Sticky gallery CSS-native (`lg:sticky lg:top-24 lg:self-start`) — no early-activation bug, off on mobile.
- [ ] Responsive 375/768/1024/1280/1440; touches ≥44px; reduced-motion = opacity-only.
- [ ] `useSeo` title/description set after data loads.

---

## 30. Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Gallery Embla orientation (`rtl` vertical) | removed (`no rtl`) — verify in-browser at Phase 4 |
| Image URLs failing (Cloudinary/seeding) | brand-asset fallback (§11.4); empty-state panel defensive |
| `harga_per_porsi` 0/NaN (hand-entered admin rows) | `formatIDR` guard → `"—"`, terms row hidden |
| Convert-to-decimal string drift (`"22000.00"`) | `Number()` in VM only |
| Stale chrome gate across detail routes | §16.3 reset effect (deterministic, path-scoped) — flagged explicitly |
| **WhatsApp duplication (3 local copies)** | **verified identical number**; detail adds **no 4th number/value** — same const, same value; consolidation to a shared config = follow-up refactor, out of scope |
| Skeleton flash vs 1:1 | single responsive skeleton; cache hits skip skeleton |
| "Kalkulator Porsi" expectation (sitemap §3.1) | deferred — MVP = WhatsApp CTA with truthful message; calculator (UX-only preview) when client asks, server still owns totals |
| Missing `categories/` asset dir (`PaketKategoriOptions.image` dead) | **do not rely on it** (admin/POS still references it — separate bug already on the books); detail uses §11.4 fallback |
| `MediaItem.alt` addition | additive optional prop, default unchanged → zero breakage |

---

## 31. Final Recommended Architecture

```
/paket/:id (numeric)
    → paket-detail.tsx (thin shell: id param, required-id redirect)
        → detail-block.tsx  ORCHESTRATOR
            • use-detail-query (1 request, enabled on valid id, 404 classified)
            • gate effects: reset-on-id + settle-un-gate → useDetailStore.ready (§16.3)
            • useSeo (loading/real/not-found titles)
            • state router: DetailSkeleton | DetailNotFound | DetailError | DetailContent
            • grouped Framer reveal (§21) — MotionConfig reducedMotion="user"
            ├── DetailGallery   Embla (refactored) + CSS-sticky + GlobalImageModal scope + index sync + fallback
            ├── DetailSummary   identity group → price/terms group → CTA(group) + meta
            ├── DetailMenu      menu_utama + menu_tambahan (conditional)
            └── DetailFacilities fasilitas + alergen (conditional)

LayoutWrapper.showChrome += `isDetail ? detailReady` (§16.4).

Data: GET /api/v1/paket/{paket} (public, no auth) → PaketResource (15 fields, honest nullability)
    → use-detail-query → toDetailViewModel (single transform, §25) → declarative JSX.
Canonical WhatsApp: https://wa.me/6287870306031 (§13.1, verified 3× in code).
No backend changes. No new npm deps. No second lightbox. Framer only.
```

**Bottom line:** every existing Catering mechanism is reused — Embla carousel, GlobalImageModal store, MotionConfig/BlurReveal grammar, OriginButton CTA, shadcn primitives, chrome gating, not-found pattern, honest copy. The only Sundress code discarded is the broken `detail-block.tsx` body. The result is "the next level of the Paket catalog", never a copied e-commerce page.

---

## 32. Final Planning Check (answers to the validation pass)

1. **API contract?** §6 + §7 — `GET /api/v1/paket/{paket}` → 15 fields, honest nullability (`deskripsi`/`thumbnail` nullable, arrays nullable), `harga_per_porsi` string.
2. **Above the fold?** §9/§10 — gallery + identity + price/terms + WhatsApp CTA (+ meta on desktop).
3. **Below the fold?** description lead → menus → facilities → allergy note.
4. **Gallery desktop?** §11.2 — vertical rail + prev/next + counter + fullscreen + keyboard.
5. **Gallery mobile?** §11.3 — swipe + dots + counter, no rail, no crammed controls.
6. **Fullscreen preview?** §12 — single `GlobalImageModal`, store `open(scope, index)`.
7. **Next/Prev inside modal?** §12 — store `next/prev` wrap-around; no-ops for single item.
8. **Null data?** §7.3 — hide rows/sections; contextual description fallback only; no `-`/`N/A`.
9. **Loading?** §14 — 1:1 skeleton; §16 gate off.
10. **404?** §15 — not-found shell; chrome on (terminal).
11. **API error?** §15 — retry state; chrome on (terminal).
12. **CTA/Footer visible when?** §16 — after the current-id query settles; never under skeleton.
13. **Chrome reset between `/paket/:id`?** §16.3 — reset-on-id effect + settle-un-gate; path-scoped; no timers.
14. **Reused components?** §18 — Embla carousels, MediaItem, GlobalImageModal+store, OriginButton, Badge/Button/Separator/Skeleton, MotionConfig, useSeo, not-found pattern.
15. **Sundress discarded?** §3/§4/§27 — detail-block body, lucide, Inertia, cart/wishlist/ratings/accordions/seller; nothing Sundress-only survives.
16. **Framer used where?** §21 — grouped mount reveal (gallery + 3 summary groups) + subtle section whileInView.
17. **GSAP deliberately NOT used where?** §21.4 — the entire detail page (no scroll-driven interaction exists).
18. **Skeleton geometry?** §14 — gallery box + rail/dots + rail text blocks + section blocks, 1 responsive skeleton.
19. **Responsive strategy?** §10 — `lg:` split + CSS sticky; mobile single column; §10.3 targets.
20. **Accessibility strategy?** §23 — alt, keyboard, aria labels, aria-live counter, focus-visible, 44px, reduced motion.

---

*End of implementation contract. Stop — do not modify production code in this pass.*
