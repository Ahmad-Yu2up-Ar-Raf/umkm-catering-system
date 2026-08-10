<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Feature Spec — "Katalog Paket" (Public Catalog) · **Monorepo Root:** `../../`
>
> Follows [Frontend Design](../frontend/docs/design.md) · [Frontend Architecture](../frontend/docs/architecture.md) · [Design System MASTER](../frontend/design-system/MASTER.md) · **Page Override: [`../frontend/design-system/pages/catalog.md`](../frontend/design-system/pages/catalog.md)** · [Backend API](../backend/docs/api-collection.md) · [Sitemap §2](../../docs/architecture.md)

# Executive Summary & Discovery

## 1.1 What was learned from the codebase scan

| Area | Finding |
|---|---|
| **Sitemap** | "Catering Packages" is page #3, **Required** (`docs/architecture.md` §2) — grid/cards of all packages, filterable by Package Category, Event Category, Price Range. Package Detail (#3.1) is a *separate* page we do NOT build here. |
| **Route** | `/paket` already registered in `src/router/index.tsx:32-35` behind `LayoutWrapper` (global `SiteHeader` + `SiteFooter` + `CTABlock`). No router change needed. |
| **Page shell** | `src/pages/paket-page.tsx` is a stub (`<div>PaketPage</div>`). It should only compose the block — no business logic. |
| **Legacy block** | `src/components/ui/core/block/paket/` contains: `components/paket-card.tsx`, `hooks/use-paket-query.ts`, `types/paket-types.ts`. |
| **❌ Current card is template-slop** | `paket-card.tsx` was copy-pasted from an unrelated e-commerce template. It imports `ProductsSchema` from `@/lib/validations/index.t`, `getCategoryColor/getCategoryIcon` from `@/lib/utils/products/category-utils`, and `CategoryProductsStatus` from `@/config/enums/CategoryProductsStatus` — **none of these exist in this project** (would fail typecheck). It also renders: fake rating (`4.5 / 455`), fake `20 Sold`, a decorative corner SVG, Heart/Cart buttons commented-out against `handleCart/handleWhishlist` (`@/lib/actions/*` — also nonexistent), and every link points to `to="/"`. It must be **replaced, not patched**. |
| **❌ Empty types** | `types/paket-types.ts` is 0 bytes. |
| **✅ Reusable hook** | `hooks/use-paket-query.ts` is a clean start: `useQuery`, `queryKey: ["paket", search, page, perPage]`, Ky via `@/api/client`, `keepPreviousData`, `staleTime: 5000`. It is missing `kategori_paket` and uses paged `useQuery` instead of infinite scroll — evolve it (§4). |
| **API client** | `src/api/client.ts` — single Ky instance (`VITE_API_URL` from `.env`), auto-injects Sanctum Bearer, 401 → clears session + redirects. Catalog uses **public routes (no auth)** — nothing to change. |
| **Design system** | Page override `design-system/pages/catalog.md` is binding: grid `1 → md:2 → lg:3` cols, hero = full-width warm photography + **one** short Fraunces heading + WhatsApp CTA, card `bg-card border-border rounded-lg shadow-sm`, **one GSAP reveal on hero only**. |
| **Utilities available** | `MediaItem` (`@unpic/react` lazy Image + loading spinner), shadcn fragments (`Card`, `Badge`, `Button`, `Input`, `Skeleton`), Hugeicons (`@hugeicons/core-free-icons` + `@hugeicons/react` — **lucide is NOT used**), `cn()`, `useReducedMotion()`, GSAP re-exported at `@/components/motion/gsap` (registered once), `OriginButton` CTA fragment, no existing IDR formatter. |
| **Backend contract (verified)** | `routes/api.php` → `GET /api/v1/paket` is **public**. `PaketController@index` accepts `search`, `kategori_paket`, `kategori_acara`, `page`, `perPage` (default 10). Response envelope: `{ status, message, data: PaketResource[], meta: { filters, pagination: { total, currentPage, perPage, lastPage, hasMore } } }`. **The backend already implements the category + search filtering → zero backend changes.** |
| **`kategori_paket` enum** | `PaketKategoriEnum`: `Nasi Box`, `Prasmanan`, `Snack`, `Tumpeng` (free-form strings in DB, cast client-side as label). |
| **Real seed data** | 5 client originals (verbatim from `PaketSeeder`): Paket Nasi Box Hemat (Rp22.000/porsi, min 20), Paket Prasmanan Pernikahan (Rp45.000/porsi, min 100), Paket Snack Box Arisan (Rp18.000/porsi, min 15), **Paket Tumpeng Mini (Rp25.000/porsi, min 10 → per-package = Rp250.000/paket)**, Paket Prasmanan Korporat. |
| **Assets** | Client photos live at `public/assets/images/products/…` (nasi-box-hemat, prasmanan-nikahan, snack-box-arisan, paket-gold-*). **Runtime thumbnails come from the API** (`thumbnail` + `images[]`, Cloudinary) — local art is the hard fallback when `thumbnail` is null. |

## 1.2 What was learned from the Dapur Solo reference (scraped live)

Element `#lunchbox-page-header` on `dapursolo.com/lunchbox` was inspected live (structure, classes, computed CSS):

```
<header id="lunchbox-page-header" class="lunchbox-page-header js-unwrapper">
  <nav class="lunchbox-nav">
    <ul class="lunchbox-nav-items">            <!-- display:flex; justify-content:center -->
      <li class="lunchbox-nav-item">
        <a href="#section-nasi-kotak" class="link js-scroll (in-viewport)" data-scroll-offset="#lunchbox-page-header">
          <img class="icon icon-inline" src="…/icon-ds-nasikotak.svg"> Nasi Kotak
        </a>
      </li> … 4 total: Signature Langgi · Nasi Kotak · Tumpeng Ayu · Tumpeng & Jajanan Pasar
    </ul>
  </nav>
</header>
```

| Property | Reference behavior | Computed CSS observed |
|---|---|---|
| Sticky | `position: sticky; top: 56px; z-index: 2; background: #fff` (56px = above-the-fold global nav offset) | `.lunchbox-page-header` |
| Item | icon (28px, brand-orange, `display:block`) + label | `.lunchbox-nav-item .link { font-size:10px; padding:8px 4px 4px; text-align:center; transition:0.2s ease-out }` |
| **Active** | `in-viewport` class → bold + amber underline with hairline brackets | `border-bottom:1px solid #eb7d23; box-shadow:#eb7d23 0 -1px inset, #eb7d23 0 1px inset; font-weight:700` |
| Inactive | light gray underline | `border-bottom:1px solid #d8d8d8; color:#494949; font-weight:400` |
| Hover/focus | amber underline, no text-decoration | `border-bottom-color:#eb7d23` |
| Scroll | `js-scroll` + `data-scroll-offset="#lunchbox-page-header"` → JS smooth scroll offset by header height | — |
| **Search** | **The reference has NO search in the header.** It is a WordPress marketing page; our search is an adaptation, not a copy. | — |
| Product sections | Per-category `<h1>` section → grid of cards: photo, name, price (`Rp 49.500,-`), "Pesan Yuk" CTA, and a modal popup with variant/Jumlah/Pesan. Price footnote: *harga berlaku untuk area …* | `.lunchbox-overview`, `#popup-lb-*` |

**Adaptation decisions (structure only — never the colors/motion):**
- The reference's orange/white WP look is **not** imported. All structural states map to Suasana tokens (`primary` amber replaces `#eb7d23`, `border-border` replaces `#d8d8d8`, cream `bg-background`).
- "Active" pattern — amber underline + inset hairline brackets on the active item — is the signature detail worth keeping. Cheap, honest, non-sloppy.
- Smooth-scroll-by-category is a *single-section* page pattern (all content on one page). Our page is *filter-driven* (server-side `kategori_paket`), so the nav switches the URL/filter instead of scrolling to DOM sections. The **signature interaction is the same** (persistent category nav + live filter), the mechanism differs. This is the correct adaptation: we have ≥250 server rows, not 12 static products.
- The reference's price footnote → our `min_order` caption on the card.

---

# UI/UX Specifications

Design intent: **super-minimalist**. One fixed category nav + one search pill + a calm product grid. Nothing else. No carousels, no wishlist/cart, no ratings, no infinite auto-scroll. Everything maps to `design-system/pages/catalog.md`.

## 2.1 Catalog hero (page entry, not a banner)

- Eyebrow: `text-[11px] uppercase tracking-[0.34em] text-primary` → `Katalog Paket` (matches `MenuHeader` eyebrow in `home/pilihan-menu`).
- H1, Fraunces, `<clamp(30px,3.8vw,54px)>`, `leading-[0.95] font-light tracking-[-0.02em]`:
  > `Dari dapur kami, untuk perayaan *Anda*.`
  - One italic accent word via `--font-accent` (brand rule — the single Instrument Serif word).
- Short sub-line (Space Grotesk, `text-muted-foreground`, 1–2 sentences): "Pilih dan pesan paket katering — nasi box, prasmanan, snack, hingga tumpeng. Konsultasi gratis via WhatsApp."
- **No fabricated numbers.** If we want a count, derive it live from `meta.pagination.total` ("…paket siap pesan") — never hardcode.
- **WhatsApp CTA:** `OriginButton` (`@/components/ui/fragments/custom-ui/button/cta-button`), `bg-primary`, `wa.me` link. This is the conversion goal of the whole page.
- Motion: **exactly one GSAP reveal** per `catalog.md` — hero elements `autoAlpha 0 → 1, y:24px → 0`, stagger `0.08s`, gated by `useReducedMotion()`. No ScrollTrigger, no pinning.

## 2.2 Sticky filter bar (the adapted `#lunchbox-page-header`)

- Wrapper: `sticky top-[<global-header offset>] z-40 bg-background/90 backdrop-blur-sm border-b border-border`.
  - Global `SiteHeader` height varies by breakpoint and auto-hides on scroll (`layout/nav/site-header.tsx`) → measure it: a tiny `useHeaderOffset()` hook reads `document.querySelector("header")?.offsetHeight` (mount + resize + route change) and feeds `style={{ top }}`. (Reference hard-codes `top:56px`; we measure because our chrome differs.)
- Inner: `mx-auto flex max-w-[…] flex-wrap items-center justify-center gap-x-6 gap-y-3 px-5 py-3 md:flex-nowrap`.

### 2.2a Category SVG nav (`category-nav.tsx`)

- Items: **Semua** (clears the filter) + the 4 backend enums: **Nasi Box · Prasmanan · Snack · Tumpeng** (from `PaketKategoriEnum`, hardcoded in a local `data/categories.ts`; do not derive from fetched rows — the enum is fixed).
- Layout: `flex flex-wrap items-center justify-center gap-2` — wraps to a second row on narrow screens (design rule §8: page-level "no horizontal scroll"; the reference's single-row scroll is not compatible with our 5 items on 375px and we keep §8).
- Item markup (mirrors reference structure, semantic tokens only):

```
<button type="button" aria-pressed={active}>(via Router Link to /paket?kategori=…)
  ✦ <div class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-300
        border-b-2 {active ? "border-primary" : "border-transparent"}">
      <HugeiconsIcon size-5 {active ? "text-primary" : "text-foreground/50"} />
      <span class="text-[11px] tracking-[0.08em] uppercase {active ? "text-primary font-semibold" : "text-foreground/60"}">
        {label}
      </span>
    </div>
</button>
```

- **Active** = `bg-primary/10` + `border-primary` underline + `text-primary` icon/label (maps the reference's amber underline + inset bracket; both are token-pure).
- **Inactive** = transparent underline + `text-foreground/50-60`.
- Hover: `hover:border-border` + `hover:text-foreground` (150–300ms transition only — no bounce).
- Touch target ≥ `44×44px` (padding px-3 py-2 + icon+label).
- **Icons (Hugeicons free set — verify exact names against `@hugeicons/core-free-icons` at implementation):** suggested map with safe fallbacks —
  - `Semua` → `LayoutGrid`, 
  - `Nasi Box` → `NoodleIcon`/`BoxIcon`, 
  - `Prasmanan` → `ChefHat`/`Dish01Icon`, 
  - `Snack` → `Donut`/`SnackIcon`, 
  - `Tumpeng` → `TakeawayMartin`/`StreetFood`.
  *(Confirmation script during build: `node -e "console.log(require('@hugeicons/core-free-icons').ICONS?…)` — if a name is missing, use the listed fallback. Never hand-draw SVGs when the package has one.)*

### 2.2b Integrated Search (`search-bar.tsx`)

- Reference has no search → this is our minimal addition, visually owned by the bar (right side of the wrapper, `md:ml-auto`).
- Visual: hairline pill — `relative flex h-9 items-center gap-2 rounded-full border border-border bg-muted/50 px-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/50`.
  - Leading `HugeiconsIcon SearchIcon` `size-4 text-muted-foreground`.
  - `<Input>` shadcn fragment, `h-auto border-0 bg-transparent shadow-none px-0`, `placeholder="Cari paket…"`, `aria-label="Cari paket"`.
- Behavior: local `<input>` value + **debounce 300ms** → writes `?search=` to URL (§4). Clear button (×) appears when dirty. Labels always visible on focus (design §6) — placeholder-only is a tokenized anti-pattern only when the label is missing; here the search is globally recognizable, keep placeholder per design catalog override's minimalism.

## 2.3 Product Card — refactored blueprint (`paket-card.tsx`)

Current draft identified problems (see §1.1) — **delete ~150 of its 224 lines**, keep none of the template machinery. Target ~60–80 lines.

```
<Card asChild>
  <Link to={`/paket/${p.id}`} class="group flex h-full flex-col overflow-hidden
       bg-card border-border rounded-lg shadow-sm transition-all duration-300
       hover:-translate-y-0.5 hover:shadow-md">
    ┌─ image ↵  relative aspect-[4/3] overflow-hidden bg-muted
    │    <MediaItem webViewLink={p.thumbnail ?? FALLBACK_IMG} loading="lazy"
    │               class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"/>
    │    if p.is_best_seller: <Badge class="absolute left-3 top-3 bg-primary/90 text-primary-foreground">Best Seller</Badge>
    ├─ body  flex flex-1 flex-col gap-2 p-4
    │    <h3 class="font-heading text-lg font-medium line-clamp-1">{p.nama_paket}</h3>
    │    if p.deskripsi: <p class="text-sm text-muted-foreground line-clamp-2">{p.deskripsi}</p>
    ├─ price (mt-auto)  space-y-1
    │    <p class="font-sans text-lg font-semibold text-foreground">{{formatIDR(p.harga_per_porsi)}}<span class="text-xs font-normal text-muted-foreground"> / porsi</span></p>
    │    if p.min_order > 1: <p class="text-xs text-muted-foreground">Min. {p.min_order} porsi</p>
    └─
  </Link>
</Card>
```

**Card rules (hard):**
1. **Price formatting** — `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })` → `Rp 22.000`. One helper, inline in the card file (`const fmtIDR = (n) => …`). Do NOT build a currency-util module for one consumer.
2. **`min_order` honesty (per `catalog.md` + backend rule):** `harga_per_porsi` is the *portion* price. Per-package items (Tumpeng Mini: `min_order: 10`, price = Rp25.000/porsi → Rp250.000/paket) — the card shows `Rp 25.000 / porsi · Min. 10 porsi`, which is true to the backend contract and unambiguous. Never invent a "per paket" price on the card.
3. **Text overflow** — `line-clamp-1` on title, `line-clamp-2` on description (`line-clamp-*` is preflighted in Tailwind v4). Card is `h-full` in a grid → equal-height rows.
4. **Image fallback** — `p.thumbnail` is the Cloudinary secure_url; when null/empty, fall back to a real local art file, e.g. `/assets/images/products/paket-nasi-box-hemat/paket-nasi-box-hemat-1.png`. `MediaItem` already lazy-loads + spinners while loading.
5. **Honest copy only** — no rating stars, no "Sold", no heart/cart. `is_best_seller` is the only decoration, driven by real data.
6. **Only category enumerated as icons:** the card does NOT need per-category icons — one `Best Seller` badge max. Minimalist means one decoration per surface.
7. Card link target `/paket/${p.id}` is a placeholder for the Package Detail page (sitemap #3.1, Phase 2/3) — do not point it at `/kontak` instead; the detail page is the required conversion step (Catalog → Detail → Calculator → WhatsApp per `docs/architecture.md` §3.1).

## 2.4 Grid, skeleton, empty, load-more (`paket-grid.tsx`)

- Grid: `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3` (per `catalog.md`).
- **Loading:** first fetch / filter change → 6 `Skeleton` cards (`h-64 rounded-lg`) matching the card shape.
- **Filter change while data exists** → `isPlaceholderData` keeps previous cards with `opacity-60` (feedback without layout jump).
- **Empty state:** honest, no illustration, min-width effort: `"Tidak ada paket untuk kategori “{kategori}”"` + `"Reset filter"` link (clears `?kategori&search`). No fake "Belum ada produk" copy.
- **Load more:** `fetchNextPage()` button (`OriginButton`/`Button variant="outline"`), text `"Muat lebih banyak"`, shown only while `hasNextPage`; `disabled` while `isFetchingNextPage` (spinner in button). Deliberate button, **not** an IntersectionObserver infinite-scroll — one fewer scroll-chain bug class on a Lenis-wrapped document (upgrade path noted in §4).

## 2.5 Responsive & motion summary

| Breakpoint | Filter bar | Grid | Notes |
|---|---|---|---|
| 375 | nav wraps to 2 rows; search full-width below | 1 col | ≥44px targets |
| 768 | single-row nav; search right | 2 cols | |
| 1024+ | single row + search | 3 cols | |
| 1440 | same, centered `max-w-7xl` | 3 cols | |

- Motion: only the §2.1 hero reveal. `useReducedMotion()` gate everywhere. No ScrollTrigger. ✓ `lint:design`.

---

# File & Component Architecture

Mirrors the home-block convention (`block/<section>` + `data/`, `hooks/`, `types/`, `components/`). All new code lives under the **existing** `src/components/ui/core/block/paket/` directory.

```
src/components/ui/core/block/paket/
├── paket-block.tsx            # ORCHESTRATOR (maps home-page's menu-block role)
│                              #   - renders CatalogHeader → FilterBar → PaketGrid
│                              #   - owns the ONE GSAP hero reveal (useGSAP + useReducedMotion)
│                              #   - named export: paket-block.tsx → export function PaketBlock()
│
├── data/
│   └── categories.ts          # KATEGORI_PAKET = [{ value:"" , label:"Semua", icon },
│                              #   { value:"Nasi Box", … }, Prasmanan, Snack, Tumpeng]
│                              #   + icon map (Hugeicons). Single source for the nav; mirrors PaketKategoriEnum.
│
├── hooks/
│   ├── use-paket-query.ts     # REFACTOR existing → useInfiniteQuery (service layer):
│   │                          #   queryKey: ["paket", kategori, search, perPage]
│   │                          #   queryFn: GET /paket (searchParams: kategori_paket, search, page, perPage)
│   │                          #   initialPageParam: 1
│   │                          #   getNextPageParam: (last) => last.meta.pagination.hasMore
│   │                          #        ? last.meta.pagination.currentPage + 1 : undefined
│   │                          #   staleTime: 5s · placeholderData: keepPreviousData
│   └── use-catalog-params.ts  # URL ⇄ hook (§4): read searchParams → {kategori, search, page?}
│                              # + setters (setCategory / setSearch debounced / clearFilters)
│
├── types/
│   └── paket-types.ts         # FILL IN: Paket (mirrors PaketResource), PaginationMeta,
│                              # PaketListResponse = { status, message, data, meta }
│
└── components/
    ├── catalog-header.tsx     # eyebrow + Fraunces H1 (accent word) + sub-line + WhatsApp CTA (OriginButton)
    ├── filter-bar.tsx         # sticky wrapper (useHeaderOffset) → composes CategoryNav + SearchBar
    ├── category-nav.tsx       # "Semua / Nasi Box / Prasmanan / Snack / Tumpeng" Icon Nav (2.2a)
    ├── search-bar.tsx         # debounced search pill (2.2b) — local value + URL write
    ├── paket-grid.tsx         # grid + skeleton + isPlaceholderData + empty state + Load-more button
    └── paket-card.tsx         # REFACTORED card (2.3) — replaces template-slop draft
```

**Page wiring** — `src/pages/paket-page.tsx` becomes: `<div className="mx-auto w-full max-w-7xl px-4 md:px-6"><PaketBlock /></div>` (map the `.container` rhythm used by other pages; keep it a thin shell, no logic). Route already exists (`router/index.tsx`), guards unchanged (public).

**Hooks location note:** repo convention currently keeps the query hook under the block (`block/paket/hooks/`), not `src/services/` (which is only scaffolded). Keep it there to match the existing tree; do NOT create `src/services/paket.ts` unless asked.

**What we do NOT create:** no `PriceFormatter` util (one-liner in card), no gallery/carousel, no dialog popup (reference has one — our conversion path is the Detail page, not a modal), no zustand store.

---

# State & API Strategy

## 4.1 URL query params are the single source of truth

Because the sitemap's filter model (Package Category + Event Category + Price Range) maps to the backend query contract, and we want **shareable/deep-linkable URLs**, all filter state lives in the URL — not React state, not zustand.

| Param | Values | Maps to | Backend field |
|---|---|---|---|
| `kategori` | `""` (Semua) \| `Nasi Box` \| `Prasmanan` \| `Snack` \| `Tumpeng` | `?kategori=Prasmanan` | `kategori_paket` |
| `search` | free text | `?search=ayam` | `search` (nama_paket / deskripsi LIKE) |
| `page` | int (back/forward of Load-more) | `?page=2` | `page` |
| *(event)* | `kategori_acara` — **deferred** (see §4.4) | — | `kategori_acara` |

Mechanism (`use-catalog-params.ts`), React Router v8 `useSearchParams`:

1. **Read** — `const [params] = useSearchParams(); const kategori = params.get("kategori") ?? ""; const search = params.get("search") ?? ""`. Values passed to `use-paket-query` → auto-refetch via queryKey.
2. **Category write** — nav items are `<Link to={kategori ? \`/paket?kategori=…\` : "/paket"}>`; also **reset `page`** whenever `kategori`/`search` changes (drop the `page` param → back to page 1). Use `setSearchParams` with `{ replace: false }` so back/forward restore filters.
3. **Search write (debounced)** — local `useState` in `search-bar` is the input's value; on change (`debounce 300ms`), set `setSearchParams(prev => { prev.set("search", v.trim() …) })` (strip empty). Prevents an API call per keystroke.
4. **Deep link** — `?kategori=Tumpeng&search=ayam` opens the catalog in that exact filtered state and still fetches nothing stale.
5. **Back/forward** — URL params are history-aware endpoints; React Query re-uses cached pages per (kategori, search) key.

## 4.2 TanStack Query integration (`use-paket-query.ts`)

- **`useInfiniteQuery`** over paged `useQuery`: `page` is derived from the pagination cursor, not UI state — the Load-more button calls `fetchNextPage()`; `hasNextPage` comes from `meta.pagination.hasMore`; `isFetchingNextPage` drives the button spinner.
- Query key includes every server-affecting var: `["paket", kategori, search, perPage]` → cached per filter combination (dedupe, instant back-nav).
- `staleTime: 5000` (as today) — no `refetchInterval` (spam guard, comment already in the hook).
- `placeholderData: keepPreviousData` — **placehoData on the whole pages cache**: `useInfiniteQuery` supports `placeholderData: (prev) => prev`; when `kategori`/`search` changes, previous user's pages remain rendered while `dataUpdatedAt` shifts → combine with `isPlaceholderData` for the `opacity-60` card treatment (§2.4).
- Flat-map pages: `data?.pages.flatMap(p => p.data)` — cards render from one `Paket[]` array.
- **Filters in the URL, query only reads a plain object** — done. `perPage` constant = `9` (3×3 grid per `catalog.md`). Do not expose a `perPage` param UI.
- On error: `error` state → minimal retry block (`"Gagal memuat katalog"` + `Button` retry). Ky throws `HTTPError` on non-2xx.

## 4.3 Types (`types/paket-types.ts`) — mirror the verified resource, no guesses

```ts
export interface Paket {
  id: number
  nama_paket: string
  kategori_paket: string      // enum: "Nasi Box" | "Prasmanan" | "Snack" | "Tumpeng"
  kategori_acara: string | null
  menu_utama: string[]
  menu_tambahan: string[]
  fasilitas_termasuk: string[]
  catatan_alergen: string | null
  jenis_kemasan: string | null
  min_order: number
  harga_per_porsi: string | number   // decimal:2 → string from JSON
  kapasitas_produksi: number | null
  deskripsi: string | null
  thumbnail: string | null           // Cloudinary secure_url
  images: string[] | null            // whenLoaded
  is_best_seller: boolean
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  total: number; currentPage: number; perPage: number; lastPage: number; hasMore: boolean
}
export interface PaketListResponse {
  status: boolean
  message: string
  data: Paket[]
  meta: { filters: Record<string, string>; pagination: PaginationMeta }
}
```

One deviation to verify at build: `harga_per_porsi` is `decimal:2` cast → serialized as string (e.g. `"22000.00"`). `fmtIDR` must `Number()` the value first.

## 4.4 Deferred items (scoped out, documented)

- **`kategori_acara` (Event Category)** sitemap filter — the backend accepts it and the enum exists (`Pernikahan, Kantor, Ulang Tahun, Arisan, Umum`), but the minimal MVP builds `kategori_paket` + `search` only. The `use-catalog-params` shape leaves `kategori_acara` as a one-line spread to add when asked. *(Not built now: YAGNI — the reference and the client card grid only need category.)*
- **Price Range** sitemap filter — no backend support (`api.php` reads no price params) → cannot ship without a backend change. Explicitly out of scope.
- **Package Detail page** (#3.1) — separate block/page; card Link target `to="/paket/{id}"` is intentional but the route is not registered in Phase 2 (that page owns the portion calculator + WhatsApp conversion; no false links — the detail page lands in a later phase, keep the route registration in that phase's diff).
- **Infinite auto-scroll** — replaced by Load-more button (§2.4). Upgrade to IntersectionObserver only if the client demands zero-click paging.

---

# Action Plan for Phase 2

Ordered checklist for the coding phase. Each item is a small, reviewable commit; verification gates run at the end.

**Step 0 — Preflight (already done in this spec)**
- [x] Verified backend contract (`routes/api.php`, `PaketController`, `PaketResource`) — no backend changes required.
- [x] Verified design gates: `design-system/pages/catalog.md` override, `catering-nusantara-design` taste dials (VARIANCE 5 / MOTION 4 / DENSITY 3), tokens from `src/index.css`.
- [x] Scraped + reverse-engineered the Dapur Solo sticky header (DOM + computed CSS captured in §1.2).

**Step 1 — Types & data**
1. [ ] Fill `types/paket-types.ts` with the §4.3 interfaces (verified against resource).
2. [ ] Create `data/categories.ts` — `KATEGORI_PAKET` + `kategoriIcon` map; **run the icon-existence check** against `@hugeicons/core-free-icons` and use fallbacks (ci).
3. [ ] Refactor `hooks/use-paket-query.ts` → `useInfiniteQuery` (§4.2); keep `staleTime: 5000`, `keepPreviousData`, comment about no `refetchInterval`.
4. [ ] Create `hooks/use-catalog-params.ts` (§4.1): read `kategori`/`search`, `setCategory`, `setSearch` (debounced 300ms), `clearFilters`. Keep it dependency-free beyond `react-router`.

**Step 2 — Card refactor (kill the template slop)**
5. [ ] Rewrite `components/paket-card.tsx` per §2.3: `Card asChild` + `<Link to={/paket/${id}}>`, `MediaItem` + fallback thumb, Fraunces title `line-clamp-1`, `line-clamp-2` description, `fmtIDR` (Intl) price + `/ porsi`, `min_order` caption, `Best Seller` badge, hover translate/shadow (300ms).
6. [ ] Delete all dead imports: `ProductsSchema`, `category-utils`, `CategoryProductsStatus`, `@/lib/actions/*`, Heart/Cart/Star, corner SVG, fake rating/`Sold`.

**Step 3 — Filter bar**
7. [ ] `components/category-nav.tsx` — Semua + 4 enums, active/inactive states per §2.2a, `aria-pressed`, `Link` to `?kategori=`.
8. [ ] `components/search-bar.tsx` — pill input per §2.2b, debounced URL write, clear button.
9. [ ] `components/filter-bar.tsx` — sticky wrapper; `useHeaderOffset()` (small local hook measuring the global `SiteHeader` — put it in `hooks/`; mirrors `useIsMobile` style) feeds `top`.

**Step 4 — Grid + header + orchestration**
10. [ ] `components/paket-grid.tsx` — grid cols 1/2/3, skeletons, `isPlaceholderData → opacity-60`, empty state + reset link, "Muat lebih banyak" button.
11. [ ] `components/catalog-header.tsx` — eyebrow + Fraunces H1 (one accent word) + sub-line + WhatsApp `OriginButton`.
12. [ ] `paket-block.tsx` — compose header + filter-bar + grid; the **ONE GSAP reveal** (`useGSAP` from `@/components/motion/gsap`, `useReducedMotion` gate, hero elements `autoAlpha/y` stagger 0.08). Named export `PaketBlock`.
13. [ ] Wire `pages/paket-page.tsx` → `<PaketBlock />` inside a centered `max-w-7xl` shell.

**Step 5 — Verification gates (hard, non-negotiable)**
14. [ ] `npm run typecheck` — zero errors (this catches the current card's dead imports immediately).
15. [ ] `npm run lint` — clean (noUnusedLocals).
16. [ ] `npm run lint:design` (`impeccable detect src/`) — **must return `[]`**.
17. [ ] Manual browser pass (user-owned): `/paket?kategori=Prasmanan` deep link, back/forward, mobile 375px nav wrap, reduced-motion toggle, skeleton → grid, load-more, Tumpeng Mini price caption ("/ porsi · Min. 10 porsi").

**Deliberate skips (say the word to add):** `kategori_acara` filter, price-range filter, infinite auto-scroll, Package Detail route/block.
