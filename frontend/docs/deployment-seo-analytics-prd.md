<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Frontend Deployment + SEO + Analytics PRD · **Monorepo Root:** `../../`
>
> [Global Context](../../docs/project-context.md) · [Monorepo Architecture](../../docs/architecture.md) · [Frontend Architecture](./architecture.md) · [Design Tokens](./design.md) · [Backend API Specs](../../backend/docs/api-collection.md)

# PRD — Frontend Deployment, SEO Architecture & Analytics Integration

| Field | Value |
|---|---|
| Status | **PLANNING — approved for Phase 1 execution, no code mutated yet** |
| Target domain | `https://cateringnusantara.vercel.app` |
| Deploy root | `frontend/` (monorepo sibling: `backend/` = Laravel API at `catering.smkpesat.sch.id`) |
| Stack | Vite 8 · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · React Router 8 · TanStack Query/Form · Zustand · Zod · Ky · GSAP · Framer Motion · Lenis · Unpic |
| Analytics | PostHog US Cloud (Project `605827`) · GA4 (property to be created) |
| Owner accounts | `yusufzolldyck@gmail.com` / GitHub `Ahmad-Yu2up-Ar-Raf` |
| Evidence date | 2026-09-13 (repo scan: `package.json`, `vite.config.ts`, `index.html`, `src/router/*`, `src/hooks/use-seo.ts`, `public/robots.txt`, `public/sitemap.xml`, `docs/architecture.md`, `docs/seo/7 SEO Competitive Landscape`) |

> **Scope limit of this document:** planning + audit only. Phase 1 code changes
> (`vercel.json`, sitemap rewrite, asset fixes, admin lazy-split, `posthog-js`
> install) are specified here but **not yet executed**. Phase 2 (static routes,
> prerendering/SSR, GBP setup) is explicitly deferred — see §8.

---

## 1. Executive Summary & Readiness Verdict

The SPA is **~75% production-ready**. The homepage SEO foundation is genuinely
good: canonical, OG/Twitter tags, `LocalBusiness`/`FoodEstablishment` JSON-LD,
valid `robots.txt` with sitemap pointer, a custom per-route head writer
(`applySeo` + `RouteSeoResolver`), speculation-rules prerender for `/paket` +
`/galeri`, and code-split public routes. Strict TS (`strict`,
`noUnusedLocals`) with `tsc -b && vite build` is a solid Vercel gate.

**Readiness verdict: NOT YET DEPLOYABLE — 6 fixable blockers, no architectural rewrite needed.**

1. **Sitemap/route drift (Critical).** `public/sitemap.xml` lists 11 URLs under
   `/menu*`, `/profil`, `/cara-pemesanan`, `/kontak`, `/faq` — none exist in
   the router. Real routes (`/paket`, `/paket/:id`, `/galeri/:kategori`,
   `/login`) are missing from the sitemap. Submitting this sitemap = mass 404s
   in Search Console.
2. **Broken asset refs (High).** `index.html` favicon/manifest/logo paths point
   at `/assets/ui/*`, which does not exist on disk (real dir:
   `public/assets/logo/`). Four category images in `paket-kategori-enum.ts`
   point at a nonexistent `categories/` dir. JSON-LD `image` points at missing
   `assets/ui/logo.png`.
3. **No analytics SDKs.** `posthog-js`, `@vercel/analytics`, and
   `react-helmet-async` are all absent from `package.json` (verified
   2026-09-13). The custom `useSeo` hook works but per-route structured data
   and deferred analytics need new code.
4. **Admin bundle leak (Medium).** All admin pages + `recharts` are eagerly
   imported in `src/router/index.tsx`, so public visitors download admin JS.
   `@react-pdf/renderer` is a dead dependency (zero imports; `takumi-pdf` is
   the live lazy path).
5. **Dirty working tree.** ~30 modified files on `main...origin/main` at audit
   time. Vercel must deploy from a clean commit, never this tree.
6. **Env risk.** `.env` / `.env.example` point `VITE_API_URL` at LAN IPs and
   `src/api/client.ts` falls back to a hardcoded LAN IP — production ships a
   LAN URL if Vercel env is unset.

**Heuristic SEO health score (lab-only, no CrUX/GSC field data): ~58/100.**
+20 available from sitemap + assets + per-route schema fixes; +10 from
bundle/font fixes; the remainder is content depth (keyword pages) over months.

---

## 2. SEO Deep Audit

Method: `seo-audit` process (render → crawl → delegate → score → action plan),
`seo-technical` categories (crawlability, indexability, JS rendering, CWV),
`seo-local` dimensions, `seo-schema` type status (June 2026), `seo-sitemap`
limits. All findings are file-anchored.

### Critical

| # | Finding | Evidence | Impact | Fix (Phase 1) |
|---|---|---|---|---|
| C1 | Sitemap URLs 404 | `public/sitemap.xml:9-56` (`/menu`, `/menu/*` ×4, `/profil`, `/cara-pemesanan`, `/kontak`, `/faq`) vs `src/router/index.tsx:21-98` (real: `/`, `/paket`, `/paket/:id`, `/galeri`, `/galeri/:kategori`, `/login`, `/dashboard/*`) | Index bloat + crawl-budget waste; GSC exclusion errors on first submit | Rewrite sitemap to real routes (§5.2) |
| C2 | Sitemap missing real routes | `/paket`, `/paket/:id`, `/galeri/:kategori`, `/login` absent from sitemap | Key transactional pages undiscoverable via sitemap | Same rewrite |
| C3 | CSR-only SEO ceiling | Per-route meta is JS-injected (`src/hooks/use-seo.ts:31-63`); only homepage tags are in `index.html` | Per Dec-2025 Google JS-SEO guidance: canonical conflicts, `noindex`-in-raw-HTML, and JS-injected Product/Article markup face delayed processing | Strengthen head writer + per-route JSON-LD (§6.3); prerendering deferred to Phase 2 |

### High

| # | Finding | Evidence | Impact | Fix (Phase 1) |
|---|---|---|---|---|
| H1 | Favicon/manifest/logo 404s | `index.html:9-22` → `/assets/ui/*` (no such dir); `public/assets/logo/site.webmanifest:11-20` → `/assets/ui/web-app-manifest-*` (files live under `/assets/logo/`) | Wasted crawl budget, broken PWA installability, broken unfurls | Repoint to `assets/logo/*` |
| H2 | JSON-LD `image` missing | `index.html:78` → `…/assets/ui/logo.png` (no `logo.png` on disk) | Rich-result image ineligible | Point at existing banner or add logo |
| H3 | Category images 404 | `src/components/ui/core/block/paket/config/paket-kategori-enum.ts:38,47,56,65` → `/assets/images/categories/*.png` (no `categories/` dir; disk has `banners/ about/ lifestyle/ ordering/ patern/ textures/ products/`) | Broken catalog imagery if rendered | Repoint or add assets |
| H4 | No per-route structured data | Only homepage has JSON-LD; no `BreadcrumbList`, `Product`/`Offer`, gallery `ImageObject` | No rich results beyond homepage | Add per-route JSON-LD (§6.3) |
| H5 | Dead/partial SEO entries | `route-seo-resolver.tsx:44-48` defines `/kontak` (no such route); `:26` matches `/paket/\d+` while router uses `:id` slugs | Non-numeric slugs fall back to generic copy; dead entry confuses maintainers | Slug-safe matcher + `noindex` support |
| H6 | Official-sitemap pages lack routes | `docs/architecture.md` §2 requires About, How to Order, Contact, FAQ, Testimonials as pages; router has none (they are home-page sections, `home-page.tsx:204-210`) | Competitor-owned keyword pages (Niezer `/catering-bogor/`, Jagarasa blog) uncontested by us | **Deferred to Phase 2** (needs copy + routes) |

### Medium — Core Web Vitals risks

| # | Finding | Evidence | Target | Fix |
|---|---|---|---|---|
| M1 | Fonts block LCP text | Fontsource via CSS `@import` (`src/index.css:6-9`); no `display=swap` handling visible; no `<link rel=preload>` in `index.html` | LCP ≤ 2.5s | `preload` + `display=swap` handling (§5.4) |
| M2 | Admin JS ships to public | Eager admin imports `router/index.tsx:4,10-13` pull `recharts` into landing bundle | Reduce landing JS | `React.lazy` admin routes (§5.4) |
| M3 | Motion globals | Framer Motion imported directly in ~30 files (1 uses `LazyMotion`); Lenis wraps all routes incl. admin (`layout-wrapper.tsx:53`); `ScrollTrigger.refresh()` on every home mount | INP ≤ 200ms | Lean-motion path for below-fold blocks (Phase 2) |
| M4 | Image leaks | Unpic core good (`media-item.tsx`); 2 raw `<img>` bypasses (parallax hero, scroll visual); relative path bug (`auth-layout.tsx:99` missing leading `/`); video `preload="auto"` | CLS ≤ 0.1, LCP | Unpic-ify 2 files, fix path, `preload="metadata"` |

### Low / hygiene

- `usability-test-page.tsx` is orphan (unreferenced in router) — exclude or delete.
- `public/sitemap.xml` uses `<priority>`/`<changefreq>` — Google ignores both; keep `<lastmod>` with real dates only.
- `og:locale id_ID`, `og:type website`, `twitter:card summary_large_image` correct; add `og:image:width/height/alt` with the image fix.
- Do **not** add `FAQPage` markup for rich results (retired May 2026); use `QAPage` only for genuine Q&A pages. Never recommend `HowTo` (retired 2023).
- ESLint has no a11y/perf rules — rely on `tsc` gate + Lighthouse CI.

---

## 3. Vercel Deployment Architecture

**Target:** `cateringnusantara.vercel.app` · account `yusufzolldyck@gmail.com`.
Monorepo root `C:\Dev\Web\catering`; **deploy root = `frontend`**.

### 3.1 Dashboard settings (Settings → General / Build)

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` (= `tsc -b && vite build`) |
| Output Directory | `dist` |
| Install Command | `npm ci` (default) |
| Node.js Version | 22.x (Vite 8 requires Node ≥ 20.19; pin 22 LTS) |

### 3.2 Environment variables (Production + Preview)

| Var | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://<backend-public-host>/api/v1/` | **Required.** Never ship the LAN default. `src/api/client.ts` fallback is a hardcoded LAN IP — must be overridden in every Vercel env |
| `VITE_BUSINESS_NUMBER` | `6287870306031` | WhatsApp CTAs |
| `VITE_APP_NAME` | `Nusantara` | |
| `VITE_POSTHOG_KEY` | `phc_ssE5XMyPsNRbCwLzCrqGSdMXXg5xecSJVrnmA8BwQQok` | Public-safe key; env-gated init (§4.1) |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` | US Cloud |
| `VITE_GA_ID` | `G-XXXXXXXXXX` | After GA4 property creation (§4.2) |
| `VITE_SITE_URL` | `https://cateringnusantara.vercel.app` | Canonical/OG base; replaces hardcoded `BASE_URL` in `use-seo.ts:4` |

### 3.3 `frontend/vercel.json` (to CREATE in Phase 1)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/((?!assets|favicon.ico|robots.txt|sitemap.xml|site.webmanifest).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

Rationale: rewrite excludes static files so deep links (`/paket/12`,
`/galeri/foo`) serve the SPA without shadowing `robots.txt`/`sitemap.xml`.
No HSTS until custom domain + HTTPS verified (never preload `vercel.app`).
No `vercel.json` exists in the repo today (glob-verified).

### 3.4 Pre-deploy gates (execution order)

1. Triage + commit the dirty tree (~30 modified files) — deploy from a clean commit only.
2. `npm run typecheck` + `npm run lint` green.
3. Local `npm run build` green; confirm code-split chunks for `/paket`, `/galeri`, admin.
4. Create Vercel project with Root = `frontend`; set all §3.2 vars.
5. Deploy Preview → verify routes, API CORS (`FRONTEND_URL=https://<preview>.vercel.app` in `backend/.env`), clean console.
6. Promote to Production. Confirm backend `catering.smkpesat.sch.id` serves HTTPS (mixed-content check).

---

## 4. Analytics Integration Roadmap

Constraints (per `bundle-defer-third-party`, `rendering-script-defer-async`):
**zero analytics on the critical path** — deferred init, route-aware manual
pageviews, env-gated (no-op when keys absent).

### 4.1 PostHog (credentials on file)

- Project `605827` · key `phc_ssE5XMyPsNRbCwLzCrqGSdMXXg5xecSJVrnmA8BwQQok` · host `https://us.i.posthog.com`.
- Phase 1 steps:
  1. `npm i posthog-js`.
  2. Create `src/lib/posthog.ts` — `posthog.init(VITE_POSTHOG_KEY, { api_host: VITE_POSTHOG_HOST, autocapture: true, capture_pageview: false, capture_pageleave: true, persistence: 'localStorage' })` with missing-env no-op guard. (Key is public-safe by design; gating prevents init against wrong envs.)
  3. Deferred init in `src/main.tsx` via dynamic `import()` after mount.
  4. Manual SPA pageviews: `useLocation`-driven `posthog.capture('$pageview')` inside `RouteSeoResolver` or a dedicated `AnalyticsListener` (manual mode avoids double-count).
  5. Launch event set (≤4): `whatsapp_cta_click` (package id + placement), `paket_detail_view`, `catalog_filter`, `galeri_view`. No PII in props (phone numbers stay in `wa.me` links).
  6. Verify in PostHog Live Events (US region) on Preview before Production.

### 4.2 Google Analytics 4 (property does not exist yet)

1. Create GA4 property for `cateringnusantara.vercel.app` → obtain `G-XXXXXXXXXX` → set `VITE_GA_ID`.
2. Load `gtag.js` deferred (`async`, injected post-hydration — never render-blocking).
3. Mirror the SPA hook: `gtag('config', ID, { page_path })` on route change; consent default `denied` until banner decision (basic consent mode; full CMP is post-launch).
4. Link GA4 ↔ Search Console after domain verification (required for the "complete search engine visibility" objective).

### 4.3 Verification

Preview → PostHog Debug/Live Events shows `$pageview` per route → GA4
Realtime shows pageviews → re-verify on Production.

---

## 5. Advanced SEO Strategy

### 5.1 Keyword map (from `docs/seo/7 SEO Competitive Landscape — Catering Bogor`)

Market: Jagarasa owns organic (`cateringbogor.or.id` + blog network);
Zahwa wins local pack with 4 reviews (optimization > volume — an open gap).

| Cluster | Intent | Landing route |
|---|---|---|
| `catering bogor` (head) | commercial | `/` (H1, NAP, reviews, geo) |
| `catering tumpeng bogor` / `tumpeng mini bogor` | transactional, weakest competition | `/paket` filtered view + 1 flagship `/paket/:id` |
| `snack box bogor`, `nasi box bogor` | transactional | `/paket` category anchors |
| `catering kantor bogor` (corporate) | B2B, unowned | Phase 2 static page |
| `catering ulang tahun bogor` | event | Phase 2 static page |
| `catering murah bogor`, `catering halal bogor` | price/trust | Price transparency + trust signals on `/` + detail |
| Sub-markets: Cibinong, Sentul, Cileungsi, Depok border | local | `areaServed` expansion + location copy (no doorways; >60% unique rule) |

Also cover the `katering` (K) spelling variant in copy.

### 5.2 Sitemap rebuild (Phase 1)

Real routes only, `<lastmod>` with real dates, no `<priority>`/`<changefreq>`:

- `/`, `/paket`, `/galeri`, `/galeri/:kategori` (known slugs), flagship `/paket/:id` (top packages only at launch; full dynamic sitemap post-launch), static pages as they ship in Phase 2.
- Keep `/dashboard*`, `/login` out (already `robots.txt`-disallowed; add `noindex` too).

### 5.3 Routing SEO — SPA-sound, no framework migration

- Keep CSR + strengthen `applySeo`/`RouteSeoResolver`: slug-safe matcher for `/paket/:id` (replace `\d+`), drop-or-ship the dead `/kontak` entry, add per-route `image` + `noindex` support (admin/login `noindex, nofollow`; public `index, follow`).
- Per-route JSON-LD alongside meta: `BreadcrumbList` (detail/gallery), `Product` + `Offer` (`priceCurrency: IDR`, price from API snapshot) on `/paket/:id`, `ImageObject` on gallery. Extend homepage `LocalBusiness` with `geo` (5+ decimals, pending client confirmation — currently omitted), `openingHoursSpecification`, `aggregateRating` (real reviews only).
- Internal linking hub-and-spoke (`/` → category anchors → detail → WhatsApp CTA); every public page ≤ 3 clicks from `/`.
- Phase 2 prerendering (`vite-plugin-prerender` or Vercel pre-render for `/`, `/paket`, `/galeri`) — launch ships with correct client-side heads + valid sitemap, sufficient for indexing to begin.

### 5.4 Off-site / local (parallel track, mostly Phase 2)

Verify/complete Google Business Profile (primary category: Caterer),
byte-identical NAP vs `index.html` JSON-LD, Bing Places + Apple Maps (Bing
powers ChatGPT/Copilot sourcing), review cadence (18-day minimum — velocity
beats volume), Tier-1 citations, Chamber/BBB signals.

---

## 6. Explicit Action Plan — 11 Phase 1 File Changes

| # | File | Action |
|---|---|---|
| 1 | `frontend/vercel.json` | CREATE — rewrites + cache/security headers (§3.3) |
| 2 | `frontend/public/sitemap.xml` | REWRITE — real routes, real `<lastmod>`, drop priority/changefreq |
| 3 | `frontend/index.html` | FIX favicon/manifest/logo → `assets/logo/*`; fix JSON-LD `image`; add `og:image:width/height/alt`; font `preload` + `display=swap` |
| 4 | `frontend/src/router/index.tsx` | `React.lazy` + `Suspense` for admin routes (stop recharts leak) |
| 5 | `frontend/package.json` | ADD `posthog-js`; REMOVE `@react-pdf/renderer` |
| 6 | `frontend/src/lib/posthog.ts` | CREATE — env-gated init |
| 7 | `frontend/src/main.tsx` + `route-seo-resolver.tsx` | Deferred analytics init + SPA pageviews (PostHog + GA4) |
| 8 | `frontend/src/hooks/use-seo.ts` + `route-seo-resolver.tsx` | Slug matcher fix, `noindex` + per-route image support |
| 9 | `…/paket/config/paket-kategori-enum.ts` + `auth-layout.tsx` | Fix image paths (categories dir, leading `/`) |
| 10 | `…/fragments/custom-ui/media-item.tsx` (+ 2 raw-`<img>` files) | Video `preload="metadata"`; Unpic-ify bypasses |
| 11 | Vercel dashboard + GA4 + backend CORS | CONFIG — env vars (§3.2), GA4 property, `FRONTEND_URL` |

Plus step 0: triage + commit the dirty tree before any of the above deploys.

---

## 7. Open Questions for Owner

1. Approve scope as split (Phase 1 = deploy unblockers + analytics + SEO-head fixes; Phase 2 = static routes + prerender + GBP)?
2. Confirm `geo` coordinates + opening hours for the `LocalBusiness` upgrade?
3. Confirm the public backend host for `VITE_API_URL` (is `catering.smkpesat.sch.id` the API origin)?
4. GA4 account confirmation under `yusufzolldyck@gmail.com`?

*Next prompt on approval: execute Phase 1 items 0–11 with `typecheck` + `lint` + local `build` verification and a Vercel Preview checklist.*
