<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Pre-Build Architectural & Design System Specification — `/galeri` (Galeri Page) · **Monorepo Root:** `../../../`
>
> [Global Context](../../../docs/project-context.md) · [Monorepo Architecture](../../../docs/architecture.md) · [Backend API Specs](../../../backend/docs/api-collection.md) · [Frontend Design](../design.md) · [Design System MASTER](../../design-system/MASTER.md)

# Galeri Page — Architectural & Design System Specification

> **Status:** PLANNING COMPLETE — no application code written in this session.
> **Route:** `/galeri` (already registered in `src/router/index.tsx`, element `GaleryPage`).
> **Reference deconstructed:** `https://tiskacatering.com/galeri` (scraped live via Firecrawl).
> **Build target:** next session, following the phased checklist in §6.

---

## 1. Reference Deconstruction — `tiskacatering.com/galeri`

### 1.1 Information hierarchy (observed in shipped markup)

```
<nav>            breadcrumb: "Portofolio"
<h1>             "Galeri" + editorial serif accent word: "perayaan"
<p>              subheading: "Momen-momen yang kami rayakan bersama pelanggan —
                 pernikahan, acara korporat, hingga bingkisan istimewa."
[hero image]      full-width warm culinary photography
[category clusters]  Pernikahan · Korporat · Di balik layar · Buffet · Perayaan · Hampers
[lightbox]        full-screen expand (⤢ glyph) on every tile
[closing band]    "Let's Celebrate Love" + WhatsApp CTA ("Send your love now")
```

### 1.2 Category breakdown (6 in reference)

| Category | Caption tone (honest, editorial) |
|---|---|
| Pernikahan | "Resepsi pernikahan yang anggun" / "Perjamuan panjang penuh kehangatan" |
| Korporat | "Gathering korporat berkelas" |
| Di balik layar | "Ketelatenan di balik dapur" / "Tim yang menyiapkan dengan hati" |
| Buffet | "Sentuhan akhir di setiap sajian" / "Prasmanan yang menggugah selera" |
| Perayaan | "Momen kebersamaan yang hangat" |
| Hampers | "Bingkisan istimewa untuk berbagi" |

### 1.3 Media showcase patterns

- **Featured hero imagery** — large, warm, single dominant photograph above the fold.
- **Per-category clusters** — each category is a heading + 2 tiles (not a uniform masonry).
- **Lightbox** — every tile carries an expand trigger (`⤢`); expansion is full-screen, minimal chrome, caption + category label.
- **Framing** — full-bleed `object-cover`, no visible borders; captions sit ON the image over a bottom gradient scrim.
- **Visual tone** — warm luxury / artisanal minimalism: cream + warm brown + deep ink, high-end culinary narrative, no stock-photo "corporate" feel. This is the exact tone our Suasana OKLCH tokens already express.

### 1.4 What we deliberately do NOT copy

- Tiska's images are Unsplash stock — **we must never ship stock** (AGENTS §9): every asset must resolve to `frontend/public/assets/images/...` (audit in §4.3).
- Tiska's page is a one-page scroll of static clusters with no filtering. We add the **interactive category filter** (Phase 3 brief) driven by URL params, matching the `/paket` interaction grammar — this keeps `/galeri` structurally distinct from `/` (marquee + featured) and `/paket` (sticky grid) per the Hallmark "structural variety" rule.

---

## 2. Design System Alignment Report

### 2.1 Token mapping (semantic tokens only — from `src/index.css`, never raw hex/OKLCH)

| Role | Token(s) | Example usage |
|---|---|---|
| Page background | `bg-background` | warm cream `oklch(0.9582 0.0152 90.2357)` |
| Featured/hero section wash | `bg-secondary/60` (+ radial `color-mix(in oklab, var(--color-background))` wash) | exactly as `moment-block.tsx` |
| Text — primary | `text-foreground` | warm dark brown |
| Text — secondary | `text-muted-foreground` | meta rows, sub-headings |
| Brand accent | `text-primary` / `bg-primary` | eyebrow labels, accent word, WhatsApp CTA, active pill |
| Caption micro-labels on media | `text-accent` (uppercase, letter-spaced) | category micro-label on featured/cards (matches `moment-featured.tsx`) |
| Media scrim | `bg-gradient-to-b from-transparent via-foreground/40 to-foreground/90` | warm-brown vignette — token-driven, no raw colors |
| Borders / frames | `border-border` / `ring-border`, hover `ring-primary/50` | card rings |
| Surfaces | `bg-card` / `bg-popover` | lightbox dialog surface |
| Destructive | `--destructive` (unused on this page — reserved) | — |

### 2.2 Typography scale

| Element | Classes | Notes |
|---|---|---|
| Eyebrow | `text-[11px] tracking-[0.34em] uppercase` + `text-primary`, with `h-px w-10 bg-primary` dash | identical to `moment-header.tsx` |
| H1 | `font-heading text-[clamp(34px,5vw,64px)] leading-[0.95] font-light tracking-[-0.02em]` | Fraunces; **one** Instrument Serif accent word: `font-accent italic text-primary` — "perayaan" |
| Sub | `text-base md:text-lg text-muted-foreground max-w-xl` | Space Grotesk body |
| Card title | `font-heading text-base lg:text-lg font-light tracking-tight` | mirrors `moment-marquee` caption scale |
| Meta row | `text-[11px] tracking-[0.08em] uppercase text-background/85` (on media) or `text-muted-foreground` (in lightbox) | Space Grotesk |
| Micro-label on media | `text-[9px] tracking-[0.22em] text-accent uppercase` | matches `moment-marquee.tsx` |

### 2.3 Spacing & layout rules

- **No `space-y-*`** — use `flex flex-col gap-*` (AGENTS/design §6).
- Breakpoints 375 / 768 / 1024 / 1440, mobile-first.
- Page container: `container mx-auto w-full` (`max-w-5xl` per `@utility container` in `index.css`).
- Touch targets ≥ 44px (`min-h-11` on pills, `size-11` on lightbox nav).
- Featured: `aspect-[3/2]` → `sm:aspect-[2/1]` → `lg:h-[min(50vh,520px)]` (exact `moment-featured` anatomy).
- Card tiles: `aspect-[4/3]` (marquee anatomy) and `aspect-[3/4]` for editorial variety in the filtered grid.
- Radius: `rounded-2xl` for media tiles, `rounded-full` only for pills/close glyph (anti-slop default: avoid gratuitous `rounded-full` containers).

### 2.4 Reuse map (build on these — do not re-invent)

| Need | Reuse |
|---|---|
| Lazy media + loading spinner | `src/components/ui/fragments/custom-ui/media-item.tsx` (`MediaItem` — already `loading="lazy"` via @unpic) |
| Pill glide (active `layoutId` morph, tween `[0.16,1,0.3,1]`, never spring) | pattern in `paket/components/category-nav.tsx` (+ `GLIDE_TWEEN`) |
| Sticky filter bar below chrome | `paket/components/filter-bar.tsx` + `paket/hooks/use-header-offset.ts` (reuse hook as-is) |
| URL-as-filter-state | `paket/hooks/use-catalog-params.ts` → adapt to `use-gallery-params.ts` |
| Featured crossfade + ken-burns + caption stagger | `home/momen/components/moment-featured.tsx` (adapt; add event-meta strip) |
| Marquee-card anatomy (scrim, ⤢ glyph, hover zoom) | `home/momen/components/moment-marquee.tsx` |
| Headline reveal | `src/components/motion/blur-reveal.tsx` (`BlurReveal`) or `word-reveal.tsx` (`WordReveal` with `trigger="scroll"`/`mount`) |
| Full-screen media viewer | `src/components/ui/fragments/shadcn-ui/dialog.tsx` (Radix — focus trap, ESC, scroll-lock built in) |
| CTA button | `src/components/ui/fragments/custom-ui/button/cta-button.tsx` (`OriginButton`) + WhatsApp `wa.me` link |
| Loading shimmer | `src/components/ui/fragments/shadcn-ui/skeleton.tsx` |
| Badge / Tooltip / Button variants | `fragments/shadcn-ui/{badge,tooltip,button}.tsx` |
| Reduced motion | `src/hooks/use-reduced-motion.ts` + `MotionConfig reducedMotion="user"` (pattern in `moment-block.tsx`) |

---

## 3. Component Architecture Blueprint — `/galeri`

### 3.1 Page flow (user journey)

1. Arrive → editorial hero (eyebrow + H1 + sub + WhatsApp CTA).
2. Signature **featured event** — auto-advancing crossfade display with event meta (category · date · venue · guests) + "Lihat" expand.
3. **Sticky category pill bar** (`?kategori=` URL-driven, back/forward aware).
4. **"Semua"** → stacked **category cluster rails** (marquee-card anatomy, one heading per rail). **Single category** → that cluster expands to a responsive **grid** with aspect variety.
5. Any tile (or featured) opens the **lightbox** — full-screen dialog, prev/next, keyboard nav, caption + category + meta.
6. Page ends → global `CTABlock` + `SiteFooter` (already rendered by `LayoutWrapper` for non-`/paket` routes — no work needed).

### 3.2 Proposed file tree

```
src/pages/
└── galery-page.tsx                     # rename → gallery-page.tsx (cosmetic; update router import)
                                        #   compose <GalleryBlock /> + optional useSeo()

src/components/ui/core/block/galeri/
├── galeri-block.tsx                    # composer: data source switch (static → query), URL params,
│                                       #   MotionConfig reducedMotion="user", section structure
├── galeri-data.ts                      # GALLERY_CATEGORIES, GALLERY_ITEMS, FEATURED_ITEMS (static, §4.3)
├── components/
│   ├── gallery-hero.tsx                # eyebrow + H1 ("Galeri *perayaan*") + sub + WhatsApp CTA
│   ├── gallery-featured.tsx            # adapted MomentFeatured + GalleryEventMeta strip + expand trigger
│   ├── gallery-category-nav.tsx        # adapted CategoryNav (layoutId "galeri-category-active")
│   ├── gallery-filter-bar.tsx          # sticky bar (useHeaderOffset); pill nav + count
│   ├── gallery-rails.tsx               # "Semua" view: one rail per category (marquee-card anatomy)
│   ├── gallery-grid.tsx                # filtered view: responsive grid, Skeleton/empty/error states
│   ├── gallery-card.tsx                # tile: MediaItem zoom, scrim, micro-label, meta peek, ⤢ glyph
│   └── gallery-lightbox.tsx            # Radix Dialog full-screen viewer (+ prev/next + keyboard)
├── hooks/
│   └── use-gallery-params.ts           # ?kategori= URL state (adapted useCatalogParams)
└── types/
    └── gallery-types.ts                # GalleryItem / GalleryCategory / GalleryEventMeta (§4.1)

# Phase D (query wiring):
src/services/galeri/
└── use-galeri-query.ts                 # React Query + Ky hook (mirror use-paket-query)

# Phase E (page override doc):
design-system/pages/galeri.md           # page-level override (pattern: design-system/pages/catalog.md)
```

### 3.3 Component specs

**`gallery-hero.tsx`** — one GSAP/BlurReveal reveal (the page's only full hero moment, matching `paket-block` "one reveal" rule). Eyebrow "Portofolio" + H1 `Galeri *perayaan*` + editorial sub + `OriginButton` WhatsApp CTA. Right whitespace (desktop only) reuses `ScrollRotatingVisual` with `/assets/images/about/tumpeng-from-top.png` (same as `catalog-header.tsx`).

**`gallery-featured.tsx`** — clone of `moment-featured.tsx` mechanics (crossfade `0.9s`, ken-burns scale-in → settle over `AUTO_ADVANCE_MS = 6000`, caption stagger, pagination pills, `revertOnUpdate: false`). Extensions:
- Meta strip under the title: `Pernikahan · 15 Jun 2024 · Bogor · 300 tamu` (Space Grotesk, `text-background/85`, icons optional).
- Category `Badge` (top-left) + "Lihat" expand trigger (top-right, mirrors ⤢ glyph) that opens the lightbox at this event.
- Driven by `FEATURED_ITEMS` (5–6 signature events, one per category) — **never auto-advance while the lightbox is open**.

**`gallery-category-nav.tsx`** — copy `category-nav.tsx`; `layoutId="galeri-category-active"`, `GLIDE_TWEEN` (`type: "tween"`, `[0.16,1,0.3,1]`, 0.5s), `initial={false}`, disabled (duration 0) under reduced motion. Categories + icons defined in `galeri-data.ts` (§4.2).

**`gallery-filter-bar.tsx`** — mirrors `filter-bar.tsx`: `style={{ top: useHeaderOffset() }}`, `sticky z-40 border-b border-border bg-background/90 backdrop-blur-sm`. Contains the pill nav + a result count (`text-muted-foreground`, e.g. "14 momen") on the right (replaces the /paket search box — a gallery has no search in v1).

**`gallery-rails.tsx` ("Semua")** — one section per category: small Fraunces heading + a horizontally scrollable rail of `gallery-card` tiles with edge masks (`[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]`, no JS carousel — native `overflow-x-auto snap-x` + `snap-start` tiles; the embla `Carousel` wrapper stays available if we want drag physics later). Tiles are `w-[220px] sm:w-[260px] aspect-[4/3]`.

**`gallery-grid.tsx` (filtered)** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with **structural variety inside the grid** (anti 3-equal-card): first tile `lg:col-span-2 aspect-[4/3]`, regular tiles alternate `aspect-[4/3]` and `aspect-[3/4]`; `gap-4`. States: `Skeleton` tiles while loading, honest empty state ("Belum ada momen untuk kategori ini") when filtered set is empty.

**`gallery-card.tsx`** — marquee-card anatomy (from `moment-marquee.tsx`): `MediaItem` with `imageClassName="transition-transform duration-[900ms] ease-out group-hover/card:scale-110"`, bottom scrim `via-foreground/40 to-foreground/90`, `text-accent` micro-label (category), `font-heading` one-line title, hover meta-peek (`opacity-0 group-hover/card:opacity-100` date · venue · guests), top-right `⤢` glyph (`opacity-0 group-hover/card:opacity-100`, `aria-hidden`). Entire card is a `button` → opens lightbox.

**`gallery-lightbox.tsx`** — Radix `Dialog` (primitives already themed): full-bleed `DialogContent` (`max-w-none h-dvh w-screen p-0 bg-popover`), close via `DialogClose` (existing ghost button) + ESC, focus trap + scroll-lock built-in. Body: `MediaItem` `object-contain` (never crop in the viewer), footer bar with `nama_acara` (Fraunces), `deskripsi_acara`, category `Badge`, `GalleryEventMeta` row, and position ("3 / 18"). Prev/Next buttons (`size-11 rounded-full border-border`) + ArrowLeft/ArrowRight keyboard listener. State lives in `galeri-block.tsx` (local `useState` — transient UI state, not zustand, not URL in v1). Scope = the currently filtered set (rail/grid order). Reduced motion: instant fade (Dialog CSS classes already animate `data-open`).

---

## 4. Data & Types

### 4.1 TypeScript interfaces (`types/gallery-types.ts`)

```ts
import type { IconSvgElement } from "@hugeicons/react"

/** URL value for ?kategori= — "" = "Semua" (param omitted). Matches the
 *  category set in §4.2, NOT the backend KategoriAcaraEnum (see §4.4). */
export type GalleryCategoryId =
  | ""
  | "pernikahan"
  | "korporat"
  | "prasmanan"
  | "tumpeng-syukuran"
  | "perayaan"
  | "hampers"
  | "di-balik-dapur"

export interface GalleryCategory {
  /** URL slug value; "" = "Semua". */
  id: GalleryCategoryId
  /** Pill label, e.g. "Pernikahan". */
  label: string
  /** HugeIcons icon — MUST be verified against @hugeicons/core-free-icons v4.2.3. */
  icon: IconSvgElement
  /** One-line editorial descriptor for rail headings. */
  description: string
}

/** Meta strip on the featured display, cards (peek), and lightbox footer. */
export interface GalleryEventMeta {
  /** ISO date ("2024-06-15") or free text ("Juni 2024"). Optional. */
  tanggal?: string
  /** Venue / city, e.g. "Bogor". Optional — never fabricate. */
  venue?: string
  /** Number of guests served. Optional — never fabricate. */
  jumlahTamu?: number
}

/** One gallery entry.
 *  Presentation fields are camelCase (service layer normalizes).
 *  Wire fields map from the backend GaleriResource — see §4.4 mapping table. */
export interface GalleryItem {
  id: string
  /** Category slug — groups items into clusters. */
  category: GalleryCategoryId
  /** Event name, e.g. "Resepsi pernikahan yang hangat" (wire: nama_acara). */
  nama_acara: string
  /** One-to-two line editorial caption (wire: deskripsi_acara). */
  deskripsi_acara?: string
  /** Public asset path served from /assets/images/... (wire: gambar_acara). */
  gambar_acara: string
  /** Event meta strip. */
  meta: GalleryEventMeta
  /** Optional second media for the hover cross-swap (mirrors PaketCard). */
  hover_gambar_acara?: string
}
```

### 4.2 Categories (`galeri-data.ts`)

| id | label | description |
|---|---|---|
| `""` | Semua | Semua momen perayaan |
| `"pernikahan"` | Pernikahan | Resepsi yang anggun dan hangat |
| `"korporat"` | Korporat | Gathering dan acara kantor |
| `"prasmanan"` | Prasmanan | Sajian prasmanan lengkap |
| `"tumpeng-syukuran"` | Tumpeng & Syukuran | Tumpeng untuk syukuran |
| `"perayaan"` | Perayaan | Ulang tahun, arisan, dan lainnya |
| `"hampers"` | Hampers | Bingkisan istimewa |
| `"di-balik-dapur"` | Di Balik Dapur | Ketelatenan di dapur |

> Icons: reuse **verified** `LayoutGridIcon` (Semua), `ChefHatIcon` (Prasmanan), `PyramidIcon` (Tumpeng). For Pernikahan / Korporat / Perayaan / Hampers / Di Balik Dapur, candidate names MUST be checked against `@hugeicons/core-free-icons` v4.2.3 during Phase 1 (build step) — no guessing.

### 4.3 Asset strategy — static phase (all paths verified existing)

> Rule (AGENTS §9): every mock image resolves to `frontend/public/assets/images/...`. No stock, no Unsplash, no remote URLs. Dynamic Cloudinary/API feeds land in Phase D without touching components (data source is a single `galeri-data.ts`/`use-galeri-query.ts` seam).

| Item | Category | Asset path (exists today) |
|---|---|---|
| Resepsi pernikahan yang hangat | pernikahan | `lifestyle/wedding-buffet-lifestyle-shot.png` ★ |
| Prasmanan resepsi | pernikahan | `products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-1.png` (+2, +3) |
| Lunch box rapat & training | korporat | `lifestyle/corporate-lunch-box-overhead-lifestyle.png` ★ |
| Prasmanan acara kantor | korporat | `products/paket-prasmanan-korporat/paket-prasmanan-korporat-1.png` (+2) |
| Suasana kantor | korporat | `lifestyle/kantor-2.png`, `lifestyle/kantor-3.png` |
| Tumpeng syukuran keluarga | tumpeng-syukuran | `products/paket-tumpeng/tumpeng-1.jpg` ★, `tumpeng-2.jpg` |
| Tumpeng mini ulang tahun | perayaan | `products/paket-tumpeng-mini/tumpeng-mini-1.jpg` … `tumpeng-mini-5.jpg` |
| Sajian prasmanan lengkap | prasmanan | `products/paket-prasmanan-korporat/paket-prasmanan-korporat-2.png` |
| Sajian prasmanan nikahan | prasmanan | `products/paket-prasmanan-nikahan/paket-prasmanan-nikahan-3.png` |
| Bingkisan istimewa untuk berbagi | hampers | `lifestyle/paket-combo-1.png` ★ |
| Snack box arisan | hampers | `products/paket-snack-box-arisan/paket-snack-box-arisan-1.png` (+2) |
| Penyajian yang telaten | di-balik-dapur | `lifestyle/kantor-3.png` ★ |
| Plating ayam bakar | di-balik-dapur | `products/paket-gold-ayam-bakar/paket-gold-ayam-bakar-1.jpg` |
| Persiapan hidangan | di-balik-dapur | `products/paket-gold-ayam-serundeng/paket-gold-ayam-serundeng-2.jpg` |

★ = `FEATURED_ITEMS` candidates (5–6 signature events, one per category, driving `gallery-featured`).

> Video note: `products/paket-tumpeng-mini/paket-tumpeng-mini-6.mp4` exists — `MediaItem` already supports `mediaType="video"`. Video-in-lightbox is **deferred** (v1 is photo-only) but the type + viewer accept it later.

### 4.4 Wire contract (Phase D — React Query + Ky)

Backend (`../backend`):

- Route: `GET /api/v1/galeri` → `GaleriController@index` (public; already in `routes/api.php`).
- Resource `GaleriResource`: `{ id, nama_acara, deskripsi_acara, gambar_acara, tanggal_acara, created_at, updated_at }`.

Mapping to `GalleryItem`:

| API (snake_case) | GalleryItem | Notes |
|---|---|---|
| `id` | `id` | |
| `nama_acara` | `nama_acara` | |
| `deskripsi_acara` | `deskripsi_acara` | |
| `gambar_acara` | `gambar_acara` | |
| `tanggal_acara` | `meta.tanggal` | |
| — | `category` | derived — see contract decision below |
| — | `meta.venue` / `meta.jumlahTamu` | not in backend resource yet — optional enrichment, never fabricated |

**Contract decision (flagged):** the backend `galeri` table has **no `kategori_acara` column** (only `paket` does), yet `Galeri` casts `kategori_acara` to `KategoriAcaraEnum` (`Pernikahan`, `Kantor`, `Ulang Tahun`, `Arisan`, `Umum`). The gallery slugs (§4.2) do NOT equal that enum. Options, to be confirmed with the backend owner before Phase D:
1. Add `kategori_acara` to `galeri` migration + resource, and align the frontend category set to the enum (Pernikahan · Kantor · Ulang Tahun · Arisan · Umum — loses the "Di Balik Dapur" storytelling category), or
2. Keep frontend-only categories for the static phase and map enum → slug (e.g. `Kantor`→`korporat`, `Ulang Tahun`→`perayaan`) once the column ships.
**v1 (static) is unaffected.** This decision is deferred to Phase D, documented here so no one guesses.

---

## 5. Performance & Motion Guidelines

- **One signature moment per viewport** (design.md §7): the featured crossfade + ken-burns on hero. Everything else is 150–300ms declarative transitions over transform/opacity.
- **Pill glide**: tween `[0.16, 1, 0.3, 1]` 0.5s — never a spring, never overshoot (grammar locked in `category-nav.tsx`).
- **Lenis**: already global via `ReactLenis root` in `layout-wrapper.tsx`. The sticky filter bar must use `useHeaderOffset()` (Lenis does not affect `getBoundingClientRect`). **No additional Lenis work.**
- **`prefers-reduced-motion`**: `useReducedMotion()` gates the featured timeline (static active frame — clone of `moment-featured` reduced branch); `MotionConfig reducedMotion="user"` on the block for all declarative reveals; pill glide snaps (`duration: 0`); rails/`snap-x` remain but no animations.
- **Lazy loading**: `MediaItem` already sets `loading="lazy"` (via @unpic). Lightbox preloads the *next* adjacent image (`fetchPriority` on the active one) so prev/next is instant.
- **Skeletons**: `Skeleton` tiles matching card aspect ratios during first fetch; `keepPreviousData` (mirror `use-paket-query`) so filter changes never flash skeletons.
- **No layout thrash**: never animate width/height; hover zoom is `transform: scale` only; remove `will-change` after tween (pattern in `BlurReveal`).
- **IntersectionObserver** for rail edge-fade + tile reveals is unnecessary in v1 — rails are native scroll, cards use hover-only micro-interactions (cheapest correct default).

---

## 6. Step-by-Step Implementation Plan (next session)

### Phase 1 — Foundation & contract (no UI)
- [ ] `mkdir -p src/components/ui/core/block/galeri/{components,hooks,types}`
- [ ] `types/gallery-types.ts` (§4.1)
- [ ] `galeri-data.ts` — `GALLERY_CATEGORIES`, `GALLERY_ITEMS` (≥16 items, §4.3 table), `FEATURED_ITEMS`
- [ ] Rename `src/pages/galery-page.tsx` → `gallery-page.tsx`; update `router/index.tsx` import + element name (`GalleryPage`). (`ponytail:` cosmetic — file is currently a one-line stub.)
- [ ] `design-system/pages/galeri.md` page override (pattern: `catalog.md`) — lock hero/category/grid/lightbox rules above
- [ ] Verify every HugeIcons category icon name exists in `@hugeicons/core-free-icons` v4.2.3

### Phase 2 — Hero + featured signature
- [ ] `gallery-hero.tsx` (eyebrow · H1 `Galeri *perayaan*` via `WordReveal`/`BlurReveal` · sub · `OriginButton` WhatsApp · desktop `ScrollRotatingVisual`)
- [ ] `gallery-featured.tsx` (adapt `moment-featured` crossfade/ken-burns; add `Badge` + `GalleryEventMeta` strip + expand trigger)
- [ ] `galeri-block.tsx` skeleton: hero → featured, `MotionConfig reducedMotion="user"`, section id `galeri`
- [ ] Wire into `gallery-page.tsx`; manual smoke check

### Phase 3 — Filter + showcase
- [ ] `use-gallery-params.ts` (`?kategori=`, functional `setSearchParams`, `preventScrollReset` — clone of `use-catalog-params`)
- [ ] `gallery-category-nav.tsx` (layoutId glide) + `gallery-filter-bar.tsx` (sticky, `useHeaderOffset`, result count)
- [ ] `gallery-card.tsx` (marquee-card anatomy: zoom, scrim, micro-label, meta-peek, ⤢)
- [ ] `gallery-rails.tsx` ("Semua" view) + `gallery-grid.tsx` (filtered view, `Skeleton`, empty state)
- [ ] Compose into `galeri-block`; verify reduced-motion (glide snaps), keyboard focus, touch targets ≥44px

### Phase 4 — Lightbox
- [ ] `gallery-lightbox.tsx` (Radix `Dialog`, `object-contain`, caption + badge + meta + position, prev/next + ArrowLeft/Right + ESC, adjacent-image preload)
- [ ] Wire open-state (local `useState` in block; scope = current filtered set) from cards + featured expand
- [ ] Responsive QA: 375 / 768 / 1024 / 1440; iOS `100dvh` for the viewer

### Phase 5 — Query wiring + integration
- [ ] `src/services/galeri/use-galeri-query.ts` (React Query + Ky, `keepPreviousData`; static `galeri-data.ts` remains the fallback seam while the API/`kategori_acara` contract decision in §4.4 is pending)
- [ ] Error / refetch states on the grid
- [ ] Optional (confirm with owner): point the home `moment-header.tsx` CTA "Lihat galeri lengkap" at `/galeri` via `react-router Link` (currently `href="#momentum"`)
- [ ] `useSeo({ title: "Galeri — Catering Nusantara", description, path: "/galeri" })` on the page (consistent with the app's per-route SEO hook)

### Phase 6 — Verification gates (MANDATORY before ship)
- [ ] `npm run typecheck` — clean (strict, `noUnusedLocals`)
- [ ] `npm run lint` — clean
- [ ] `npm run lint:design` (impeccable detect) — must stay `[]` (no Inter/system fonts, no purple gradients, no card-in-card, no gray-on-colored, no bounce easing)
- [ ] WCAG AA contrast; visible focus; keyboard nav (pills, lightbox prev/next/ESC)
- [ ] `prefers-reduced-motion` pass (featured static, glide snaps, no marquee)
- [ ] Responsive pass 375/768/1024/1440; no horizontal page scroll
- [ ] Honest copy — no fabricated dates/venues/guest counts (unverified meta renders as `—`)
- [ ] Browser visual QA (user-owned, per AGENTS §8)

---

## 7. Deferred / Scoped Out (documented ceilings)

- **Video in lightbox** — `MediaItem` supports `video`; add when the owner requests it (`paket-tumpeng-mini-6.mp4` ready).
- **Deep-linkable lightbox (`?item=…`)** — Dialog stays local state in v1; URL param add when sharing a specific moment becomes a requirement.
- **Drag-physics rails (embla `Carousel`)** — native `overflow-x-auto snap-x` first; upgrade if swipe feel needs it.
- **Cloudinary/API feeds** — blocked on the `kategori_acara` contract decision (§4.4); static data seam makes the swap a service-layer change only.
- **Count-up stats / masonry JS** — out of scope; the page intentionally avoids heavy scroll choreography (perf-first, one signature moment).

---

## 8. Files to touch (summary)

| File | Action |
|---|---|
| `src/pages/galery-page.tsx` | rename → `gallery-page.tsx`, compose `GalleryBlock` |
| `src/router/index.tsx` | update import/element name |
| `src/components/ui/core/block/galeri/**` | new (tree §3.2) |
| `src/services/galeri/use-galeri-query.ts` | new (Phase D) |
| `design-system/pages/galeri.md` | new (page override) |
| `src/components/ui/core/block/home/momen/components/moment-header.tsx` | optional: CTA → `/galeri` (Phase 5) |
