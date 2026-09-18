# Catering Nusantara — Performance Execution Plan (Phase 1: Planning Only)

> **Goal:** 90–100 Lighthouse Green on PageSpeed Insights Mobile + Desktop for `https://cateringnusantara.vercel.app/` (fix Mobile 53 / 42.2 s LCP, 5.7 s FCP; Desktop 76 / 3.5 s LCP).
> **Type:** Planning only — NO `.tsx` / `.ts` / `.css` file was edited to produce this plan.
> **Date:** 2026-09-18
> **Working dir:** `/mnt/c/Dev/Web/catering/frontend`
> **Stack verified (this phase):** React 19.2 + TypeScript (strict) + Vite 8 + Tailwind v4 + shadcn/ui + Framer Motion 12.43 + GSAP 3.15 + `@gsap/react` 2.1.2 + Zustand 5 + TanStack Query 5 + TanStack Form + Ky + Lenis 1.3.25 + react-router 8.3 + `@unpic/react` 1.0.2 + `posthog-js` (env-gated, deferred). Live: Vercel SPA.
> **Preservation rule:** existing audit reports are untouched. This is a NEW consolidated file: `frontend/docs/PERFORMANCE_EXECUTION_PLAN.md`.

---

## 0. Assumptions — validated this phase

| # | Assumption | Verdict |
|---|---|---|
| A1 | "100% peak performance" = 90–100 Green on PSI Mobile + Desktop, fixing 42.2 s mobile LCP and 5.7 s FCP | **Confirmed as target.** Budgets below are calibrated to it (§4, P0). Field (CrUX) verification stays pending post-deploy per `performance` skill |
| A2 | Phase 1 = planning only — halt and wait for approval before code execution | **Honored.** Zero source edits; only this new doc is written |
| A3 | Output to `frontend/docs/PERFORMANCE_EXECUTION_PLAN.md`, not overwriting existing reports | **Honored.** The three source reports (§1.1) are read-only inputs |
| A4 | Vite + React 19 + Tailwind v4 + GSAP + Framer Motion already configured; images are local `/assets` (no Cloudinary transforms) | **Confirmed with one nuance:** `MediaItem` already wraps `@unpic/react` and injects `f_auto,q_auto` for `res.cloudinary.com` URLs, but **local `/assets` files get no transform** — so the Vite-side raster pipeline (§4, P1) is still required. `public/assets` is now **204 MB / 194 files / 34 PNG / 0 `.webp` / 0 `.avif`** (was 108 MB in Appendix A — asset weight has roughly doubled since) |

---

## 1. Deep-scan evidence (read fully before proposing)

### 1.1 Audit reports — all three read

| Report | Key facts carried into this plan |
|---|---|
| `docs/PERFORMANCE_AUDIT_ANIMATION_REPORT.md` (2026-09-13 + Appendix A Phase 2 root-cause fix) | Six compounding costs; preloader ~5.5 s → trimmed (pause 1.5→0.6 s, curtain 1.0→0.7 s); per-word blur → **container-level blur** (kept); ScrollTrigger fan-out + refresh storms → central `refreshRoute()` + home two-frame gate (kept); Lenis+pin+hash serialization (kept, correct); eager bundles/images → route splitting + image tiers (kept); Framer multipliers (`mode="wait"`, `layoutId`, per-card `whileInView`). **Do NOT re-propose reverted items:** central `refreshRoute` re-application inside the home hash gate, `mode="wait"`→`sync` crossfades (deferred pending user approval) |
| `docs/desktop-analysis-report-cateringnusantara.md` (76 score, 3.5 s LCP) | `hero-banner-tumpeng.png` 3.25 MB (~2.94 MB next-gen savings); render-blocking `index-CnT359nh.css` (~80 ms); GSAP forced sync layout (`gsap-*.js` reading geometry before styles settle); 823 DOM nodes; missing `<h1>`; SVG-only links without `aria-label` |
| `docs/mobile-analysis-report-cateringnusantara.md` (53 score, 14.5 MB payload, 42.2 s LCP) | 11.2 MB next-gen savings; top-5 PNGs all >1.1 MB with no responsive sizing; render-blocking CSS ~720 ms on mobile; same GSAP layout thrash amplified on slow CPUs; **`loading="lazy"` on the LCP image anti-pattern**; `CARA PEMESANAN` contrast failure; missing `<h1>`; SVG link names |

### 1.2 Skills registry — read and cross-referenced

`skills-lock.json` parsed (55 pinned skills). Full `SKILL.md` read for the 8 mandated skills:

| Skill | File read | Rule applied in this plan |
|---|---|---|
| `gsap-performance` | `.agents/skills/gsap-performance/SKILL.md` | Transform/opacity-only; `will-change` only on animating nodes; `stagger` over separate tweens; `quickTo` for followers; `scrub:1` smoothing; kill off-screen; debounced `refresh()` |
| `gsap-react` | `.agents/skills/gsap-react/SKILL.md` | `useGSAP` + `scope` + auto-cleanup (already correct — 0 raw `gsap+useEffect`); `contextSafe` for post-mount callbacks; never unscoped selectors; never SSR-execute GSAP |
| `gsap-core` | `.agents/skills/gsap-core/SKILL.md` | `autoAlpha` over `opacity`; transform aliases over raw strings; `matchMedia()` for ≥768 px pin + `prefers-reduced-motion`; `clearProps` after blur |
| `motion-framer` | `.agents/skills/motion-framer/SKILL.md` | Variants + `staggerChildren`; `viewport={{once:true}}`; `layoutId` sparingly; `MotionConfig reducedMotion="user"`; `LazyMotion domAnimation` (extend beyond `ordering-mobile-timeline`) |
| `animate` | `.agents/skills/animate/SKILL.md` | Cheapest-tool ladder (CSS transition > `@starting-style` > CSS animation > WAAPI > Motion lib); transform+opacity only; 150–250 ms UI durations |
| `micro-interaction` | `.agents/skills/micro-interaction/SKILL.md` | 100–250 ms micro budget; asymmetric enter/exit; `layout="position"` over full `layout`; reduced-motion guard |
| `performance` | `.agents/skills/performance/SKILL.md` | Field-plus-lab baseline first; budgets JS <300 KB compressed / CSS <100 KB / above-fold images <500 KB / fonts <100 KB / third-party <200 KB; `content-visibility:auto`; Speculation Rules prerender; View Transitions; `requestIdleCallback` |
| `vercel-react-best-practices` | `.agents/skills/vercel-react-best-practices/SKILL.md` (+ `AGENTS.md` rule catalog) | `bundle-dynamic-imports` (done for public+admin routes — verify, don't redo); `rendering-content-visibility` (`cv-auto` exists — extend); `client-passive-event-listeners`; `js-request-idle-callback` (hero decor gate exists — extend); `bundle-preload` on hover/focus; `bundle-defer-third-party` (PostHog already deferred — verify) |

Deliberately not activated: `cloudinary-*` (no Cloudinary transforms for local assets), `seo-*` (except the two a11y/SEO fixes in Obj4), `neon-*` (no DB work), `shadcn`/`tailwindcss` restyle (token-only changes).

### 1.3 Codebase — files inspected this phase

| File | State found (what is already fixed vs. still open) |
|---|---|
| `src/components/motion/word-reveal.tsx` | **Fixed in-tree:** container-level root blur tween + `clearProps:"filter,willChange"`, mobile radius cap `Math.min(blur,4)` via `matchMedia("(max-width:767px)")`, `trigger="scroll"` uses `once:true`. **Keep as-is** |
| `src/components/motion/blur-reveal.tsx` | **Fixed in-tree:** container `variants` blur (sequence-duration tween) + per-word opacity/y/`staggerChildren`, `useIsMobile` radius cap, `removeProperty("filter","will-change")` on complete, module-scope `MotionSpan`/`MotionP`. **Keep as-is** |
| `src/components/motion/preloader.tsx` | **Fixed in-tree:** pause `+=0.6`, curtain `0.7 expo.inOut`, `useGSAP({scope})`, reduced-motion bypass. Mobile bypass lives in `home-page.tsx` (`<1024px → preloaderDone:true`). **Keep as-is** |
| `src/components/motion/parallax-motion-background.tsx` | **Fixed in-tree:** image tiers (`eager/high` only when `revealTrigger==="mount"`, else `lazy`+`async`), central `refreshRoute()` debounce (no per-instance `setTimeout`), `scrub:1`, scoped `useGSAP`. **Remaining:** still a raw `<img>` — needs responsive next-gen sources (P1) |
| `src/components/motion/gsap.ts` | Single `registerPlugin(useGSAP, ScrollTrigger)` — correct. **Untouched list** |
| `src/router/index.tsx` + `src/router/public-routes.tsx` + `src/router/admin-pages.tsx` | **Splitting already done:** `PublicPaketPage`, `PublicPaketDetail`, `PublicGaleryPage`, `PublicGaleriCategoryPage` + all 5 admin pages are `React.lazy` + `Suspense(RouteFallback)`. Home stays eager (correct for LCP). **Remaining:** hover/focus preload (`bundle-preload`), bundle budgets enforcement (P3) |
| `src/components/ui/core/block/home/hero/hero-block.tsx` | **Fixed in-tree:** `decorReady` via `requestIdleCallback(timeout 700)` / 350 ms fallback; `Floating`+`Marque`+`ScrollIndicator` mount only after idle; marquee scrubs gated `matchMedia("(min-width:768px)")`; bands `160dvw`; visible `<h1>` present (line 229 — the desktop report's "missing h1" is **already resolved**); hero backdrop `revealTrigger="mount" play={preloaderDone}`. **Remaining:** 3.2 MB hero PNG + 4 floating PNGs + 2.2 MB marquee JPEG still raw `<img>`/CSS-`url()` with no `srcset` (P1); floating cards use `MediaItem` without `priority` (P1) |
| `hero/components/paralax-floating.tsx` | **Fixed in-tree:** `useInView(amount:0)` rAF gate, touch-device skip, `clearProps:"transform"` + transition restore after entry, `useId` registration. **Keep as-is** |
| `hero/components/scroll-indicator.tsx` | Entrance `blur 8→0` + `clearProps:"filter"`; idle dot loop desktop-only; scrub fade. **Keep as-is** (P2 optionally drops entrance blur on mobile) |
| `src/pages/home-page.tsx` | Two-frame hash gate (`refresh()` → `lenis.resize()` → `scrollToHash` → mask fade) correct as-is; preloader session gate + `<1024px` bypass; scroll-lock. **Do NOT centralize its synchronous `refresh()` into `refreshRoute()`** (needs sync measure inside rAF — Appendix A decision stands) |
| `src/components/provider/layout-wrapper.tsx` | `ReactLenis root`, chrome gating (`catalogEnded`/`detailReady`/`galeriReady`), `preloaderDone` header/footer gate. **Keep** |
| `src/components/provider/scroll-to-top.tsx` | Already routes through central `refreshRoute()` + native-first reset + hash guard. **Keep** |
| `src/lib/hash-scroll.ts` + `src/lib/refresh-route.ts` | Numeric Lenis destination + `.pin-spacer`-aware + `ScrollTrigger.update()`; rAF-collapsed single refresh. **Keep both verbatim** |
| `src/components/ui/fragments/custom-ui/media-item.tsx` | `@unpic/react` `Image` with `constrained`/`fullWidth`, `priority` (eager/high) vs lazy/auto, `decoding="async"`, IO-gated video, Cloudinary `f_auto,q_auto` injection. **Remaining:** local-asset path needs the P1 srcset pipeline; hero floating cards need `priority` audit (P1) |
| `vite.config.ts` | Only `react()` + `tailwindcss()` + `@` alias. **No `manualChunks`, no compression, no image optimizer, no bundle visualizer** → P3 work |
| `index.html` | Speculation Rules `prerender moderate` for `/paket`,`/galeri` present; inline `oklch` paint on `<html>`/`<body>` (no white flash); full SEO/OG/JSON-LD. **Remaining:** hero LCP `<link rel="preload" as="image" fetchpriority="high">` + font preload (P1/P3) |
| `src/index.css` | `cv-auto` utility (`content-visibility:auto; contain-intrinsic-size:auto 500px`) present; OKLCH tokens canonical. **Remaining:** extend `cv-auto` coverage (P6), optional critical-CSS split (P3) |
| `src/main.tsx` + `src/lib/posthog.ts` + `route-seo-resolver.tsx` | PostHog already dynamically imported (deferred pre-warm) + env-gated `init` + route pageview via dynamic import. **Verify, don't redo** (P3) |
| `package.json` | `@unpic/react` present (good — use it, don't add `next/image` thinking; this is Vite, there is no Next Image). No `vite-plugin-image-optimizer`, no `vite-plugin-compression`. Adding either is a dependency decision for Phase 2 approval |

### 1.4 Asset weights measured this phase (Linux `du`/`find` on `public/assets`)

- **Total: 204 MB** (194 files; 34 PNG; **0 `.webp`; 0 `.avif`**) — up from ~108 MB at Appendix A. The payload crisis is worse than either PSI report snapshot (14.5 MB transferred on `/`).
- Largest single files: `tumpeng-mini-6.mp4` 12.0 MB; `gallery/pernikahan/06.jpg` 8.9 MB; `gallery/korporat/06.jpg` 8.8 MB; `paket-prasmanan-korporat-1.png` 7.7 MB; `kraft-paper-box-macro-texture.png` 7.1 MB; `paket-prasmanan-nikahan-2.png` 6.7 MB.
- Above-fold suspects: `banners/hero-banner-tumpeng.png` **3.2 MB**; `patern/songket2.jpg` **2.2 MB** (marquee band, tiled at `160dvw`); `patern/songket.jpg` 200 KB.
- Implication: P1 (raster pipeline) is the critical path to the 42.2 s → <2.5 s mobile LCP fix. No animation change can compensate for megabytes of synchronous decode.

---

## 2. Root causes (ranked, Phase 1 synthesis)

1. **R1 — Megabyte raster payload with no next-gen or responsive variants (dominant).** 204 MB store, 0 `.webp`/`.avif`, no `srcset`/`sizes` discipline on local assets. Mobile downloads desktop-scale PNGs (hero 3.2 MB; catalog cards ~1.2–1.5 MB each); PSI flags 11.2 MB next-gen savings. LCP image additionally suffers `loading="lazy"` in at least one discovery chain (mobile report §2C) — every above-fold hero/first-card image must be eager/high, everything below the fold lazy/async.
2. **R2 — Render-blocking CSS + un-preloaded LCP.** Single `index-*.css` blocks first paint (80 ms desktop / ~720 ms mobile). No `<link rel="preload" as="image">` for the hero; Fontsource variable fonts (`Fraunces`, `Space Grotesk`, `Instrument Serif`) load without `preload`/`font-display` audit. (Fontsource ships `font-display:swap` by default — verify, don't assume.)
3. **R3 — GSAP forced synchronous layout.** `ScrollTrigger.refresh()` + `getBoundingClientRect()` + Lenis `resize()` interleave reads/writes across `scroll-to-top`, home hash gate, parallax/CTA hosts. Appendix A correctly kept the two-frame gate and `refreshRoute()`; the remaining fix is *sequencing hygiene* (batch reads → writes, `requestAnimationFrame` deferral, `gsap.matchMedia` gating), not another centralization.
4. **R4 — Main-thread mount burst (largely mitigated, guard against regression).** Idle-deferred decor, container blur, rAF gating, `160dvw` bands are in-tree. Risk is *new* above-fold work rejoining the burst (e.g., adding eager images, un-gated scrubs, per-word blur).
5. **R5 — Bundle without budgets or compression.** No `manualChunks`, no gzip/brotli plugin, no visualizer budget gate. Prior build notes index chunk 413 KB / gzip 145 KB — re-baseline in P0; enforce JS <300 KB compressed, CSS <100 KB, above-fold images <500 KB, fonts <100 KB, third-party <200 KB (per `performance` skill).
6. **R6 — A11y/SEO residue.** `<h1>` now present in hero (desktop-report item closed). Open: SVG-only interactive links without accessible names (desktop §3 / mobile §3 — grep shows most icon buttons labeled, but `site-footer` giant display `<h1>` + any `group`-wrapped SVG link need an audit pass); `CARA PEMESANAN` contrast <4.5:1 (mobile §3).

---

## 3. Objectives → step-by-step tasks (P0–P10)

> Rules for every task: preserve visual elegance (same eases `power3.out`/`expo.inOut`/`LUXURY_EASE`, same staggers, same end-states — optimized, not stripped); strict TS (`tsc --noEmit` clean); use `requestIdleCallback`, `matchMedia`, staggered timelines, composited props (transform/opacity); respect `AGENTS.md` (no schema change, no client-side `total_harga`, no hardcoded hex outside tokens, no shadcn core override, no off-sitemap routes). **Phase 2 executes only after written `APPROVED`.**

### P0 — Baseline (no code; lab + field reference)

| Item | Detail |
|---|---|
| File | None (measurement only) |
| Exact change | Record PSI Mobile + Desktop for `/`, `/paket`, `/galeri`, `/paket/:id`, `/#testimoni` (or `/#cara-pesan` if that is the canonical hash); DevTools Performance trace on Moto G4-class emulation (4× CPU throttle, Fast 3G) + desktop; note LCP/FCP/INP/CLS/TBT/Speed Index, long tasks >50 ms, `ScrollTrigger.refresh` duration, transferred bytes |
| Verify | `npm run build && npm run preview` then Chrome DevTools → Performance → trace; fallback `npx lighthouse https://cateringnusantara.vercel.app/ --preset=desktop --view` and `--preset=mobile` (or PSI web UI). Write numbers into `docs/PERFORMANCE_BASELINE_P0.md` (new file, Phase 2) |
| Skill | `performance` (field-plus-lab, hypotheses-not-regressions until measured) |

### P1 — Network & LCP: kill the megabyte payload (critical path)

| # | File | Exact change | Verify |
|---|---|---|---|
| P1.1 | build pipeline (`vite.config.ts` + `package.json` — dependency decision) | Add `vite-plugin-image-optimizer` (sharp-based, build-time only) with PNG/JPG quality guardrails + `vite-plugin-compression` (brotli+gzip) for text assets. Keep `react()` + `tailwindcss()` order; optimizer last. Do NOT add runtime image CDN deps | `npm run build` → `dist/assets` contains `.webp`/compressed siblings; `tsc --noEmit` clean |
| P1.2 | `public/assets/**` raster diet (no code, asset work) | Generate `.webp` (quality ~80 photos / ~lossless graphics-with-alpha only where needed) + `.avif` (quality ~60) siblings for the top-20 offenders (§1.4 + mobile report top-5: `hero-banner-tumpeng.png`, `paket-tumpeng-mini-2.png`, `paket-prasmanan-makanan1.png`, `paket-prasmanan-korporat-2.png`, `paket-tumpeng.png`) plus `songket2.jpg` → downscale source to ≤1600 px wide before encode (it tiles at `160dvw`). Target: hero ≤200 KB `.webp`, cards ≤120 KB each, marquee tile ≤150 KB. Keep originals as fallback only | `du -sh public/assets` before/after; `ls -lh` per file; PSI "next-gen savings" → ~0 |
| P1.3 | `src/components/motion/parallax-motion-background.tsx` (hero instance path) | Serve responsive next-gen hero: `<picture>` (or `@unpic` `srcset`) with `hero-640/1024/1920.webp` + `.avif` + PNG fallback; `sizes="100vw"`; keep `loading="eager" fetchPriority="high" decoding="async"` ONLY for `revealTrigger==="mount"`; all other instances stay `lazy`/`auto`. Keep scale 1.15→1 + `power3.out 1.2 s` end-state identical | DevTools Network (Fast 3G, Moto G4): hero transfer ≤200 KB; LCP element = hero image; `fetchpriority="high"` present on LCP only |
| P1.4 | `src/components/ui/core/block/home/hero/hero-block.tsx` floating cards | Audit the 4 `MediaItem` instances: confirm they stay **non-`priority`** (lazy) under the `decorReady` idle gate; give each an explicit `sizes="(max-width:640px) 40vw, (max-width:1024px) 25vw, 220px"` + `width/height` matching the card box so `@unpic` emits tight candidates. No visual change | Network: 0 floating-card bytes before `decorReady`; each card ≤120 KB after |
| P1.5 | LCP anti-pattern sweep (all routes) | Remove `loading="lazy"` from every above-fold image: hero backdrop (P1.3), first catalog card / first gallery featured image (`paket-grid.tsx`, `gallery-featured.tsx`, `detail-summary.tsx` lead image). Rule: **eager/high only for mount heroes + first-viewport lead; everything else `loading="lazy" decoding="async"`**. `MediaItem priority` prop is the switch — pass `priority` only where the element is the LCP | `grep -rn 'loading="lazy"' src --include='*.tsx'` reviewed per file; PSI "LCP request chain" warning cleared |
| P1.6 | `index.html` `<head>` | Add `<link rel="preload" as="image" fetchpriority="high" href="/assets/images/banners/hero-banner-tumpeng-1024.webp" imagesrcset="…640/1024/1920…" imagesizes="100vw" type="image/webp">` (exact filenames from P1.2). Keep speculation rules block; do not preload more than the LCP (each preload competes for bandwidth) | View-source: single image preload; Lab LCP −0.3–1 s typical |
| P1.7 | Marquee bands (`hero-block.tsx` `Marque`) | Replace `backgroundImage: url('…songket2.jpg')` with the optimized tile (P1.2, ≤150 KB `.webp`, `backgroundSize:auto 100%` unchanged) or an `<img>`-based band if `srcset` is needed. Keep `160dvw` width, ±10% drift, `scrub 0.5` ≥768 px | Network: marquee tile ≤150 KB; no visual drift delta (screenshot compare) |

### P2 — Animation & main thread: forced-sync-layout fix + mobile GPU guards

| # | File | Exact change | Verify |
|---|---|---|---|
| P2.1 | `src/lib/hash-scroll.ts` callers (`home-page.tsx`, `site-header.tsx` nav interceptor) | No logic change (numeric destination + `.pin-spacer` resolution + `ScrollTrigger.update()` stay). Hygiene only: ensure `scrollToHash` is never called synchronously inside a GSAP write — always from the frame-2 rAF (home gate) or the header click handler after `lenis` settles. Batch reads (`getBoundingClientRect`) before writes (`scrollTo`) — already the shape; add a code comment citing `gsap-performance` batching rule | Trace `/#cara-pesan` jump: single layout pass; no "Forced synchronous layout" warning in DevTools |
| P2.2 | `src/components/ui/core/block/home/ordering/ordering-block.tsx` (+ `scroll-rotating-visual.tsx`) | Gate idle float + spring scrub behind `(min-width:768px)` via existing `gsap.matchMedia` / `useIsMobile` (pin already ≥768). Mobile keeps the vertical timeline / static visual — no per-frame scrub cost. Keep desktop motion pixel-identical | Moto G scroll trace: zero scrub-driven long tasks; desktop unchanged (video compare) |
| P2.3 | `src/components/ui/core/block/home/hero/components/scroll-indicator.tsx` | Optional micro-guard: on `<768px`, skip the entrance `filter:blur(8px)` (use `autoAlpha`+`y` only) — the indicator is 22 px wide, blur buys nothing on phones. Desktop keeps blur. Keep `clearProps:"filter"` | Moto G trace during hero reveal: no `filter` layer on the cue |
| P2.4 | `src/components/motion/gsap.ts` | **No change** (single registration). Verify no file imports `gsap/ScrollTrigger` directly bypassing this module | `grep -rn "from 'gsap" src --include='*.ts*'` → only `motion/gsap.ts` |
| P2.5 | Explicit non-goal (documented) | Do NOT move the home two-frame gate's synchronous `ScrollTrigger.refresh()` into `refreshRoute()`; do NOT delete the per-host `+100 ms` timers debate again — `parallax-motion-background.tsx` + `cta-block.tsx` already route through the debounced helper and the home gate is correct as-is (Appendix A). Any new host must call `refreshRoute(lenis?)`, never raw `ScrollTrigger.refresh()` + `setTimeout` | `grep -rn "ScrollTrigger.refresh" src --include='*.tsx' --include='*.ts'` → only `home-page.tsx` (sync gate), `refresh-route.ts` (helper), `scroll-to-top.tsx` (via helper) |

### P3 — Render-blocking & bundle: critical CSS, budgets, third-party

| # | File | Exact change | Verify |
|---|---|---|---|
| P3.1 | `index.html` + `src/index.css` (Vite-idiomatic critical CSS) | Inline above-fold critical CSS (hero layout, preloader shell, header pill geometry — extracted from the built `index-*.css`, tokens only, no hex) in `<style>`; load the full stylesheet async via `<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">` + `<noscript>` fallback. Vite has no built-in critical-CSS extraction — this manual split is the documented Vite strategy (do not propose Next `next/head` optimization) | PSI "Eliminate render-blocking resources" cleared; FCP −80 ms desktop / −~700 ms mobile typical |
| P3.2 | `vite.config.ts` | Add `manualChunks`: `vendor-react` (react/react-dom/react-router), `vendor-motion` (gsap/@gsap/react/framer-motion/lenis), `vendor-data` (TanStack/ky/zustand), `vendor-ui` (radix/hugeicons/sonner). Keep route-level `lazy` (already done). Add `rollupOptions.output` + `vite-plugin-compression` (brotli). Add `npm run analyze` via `rollup-plugin-visualizer` (dev-only import, `visualizer()` plugin gated to `--analyze`) | `npm run build` → per-chunk sizes; budgets enforced (below) |
| P3.3 | Budgets (CI-adjacent, no CI config change without approval) | Enforce: JS <300 KB compressed total; CSS <100 KB; above-fold images <500 KB; fonts <100 KB; third-party <200 KB. Report `dist` sizes + gzip in the Phase 2 report appendix | `du -sh dist/assets/*` + `gzip -c dist/assets/*.js \| wc -c`; PSI payload <2–3 MB total |
| P3.4 | Fonts (`src/index.css` Fontsource imports) | Add `<link rel="preload" as="font" type="font/woff2" crossorigin href="…fraunces-variable…woff2">` for the hero heading weight only (exact filename from `@fontsource-variable/fraunces` dist); confirm `font-display:swap` (Fontsource default) — no FOUT regression. Defer `Instrument Serif italic` (accent words only) via existing CSS `@import` order (already non-blocking after critical split) | Network: 1 font preload; no invisible-text flash (filmstrip) |
| P3.5 | PostHog (`src/main.tsx`, `src/lib/posthog.ts`) | **Verify only:** dynamic `import("@/lib/posthog")` pre-warm + env-gated `init` + `capturePageview` via dynamic import already satisfy `bundle-defer-third-party`. If PSI still flags `posthog-*.js` unused-JS (~250 KB class with `use-form` + `index`), move the pre-warm into `requestIdleCallback(timeout 2000)` and confirm `VITE_POSTHOG_KEY` absent in the measured build | PSI "Reduce unused JavaScript" −~200 KB when key absent; analytics intact when key present |
| P3.6 | `use-form` chunk (PSI "unused JS" contributor) | Confirm form libs (`@tanstack/react-form`, `react-day-picker`) only load inside admin/order-dialog chunks (already lazy via admin splitting + dialog lazy if present). If the trace shows them in the landing chunk, move the order-dialog import to `React.lazy` + `Suspense` behind the CTA click (`bundle-conditional`) | Landing JS −~50–100 KB; dialog opens with skeleton, no UX loss |

### P4 — A11y & SEO residue (small, exact)

| # | File | Exact change | Verify |
|---|---|---|---|
| P4.1 | Hero `<h1>` | **Already present** (`hero-block.tsx:229`, visible editorial headline). Desktop-report item is CLOSED. Phase 2 only adds `aria-label`-neutral check: heading order `h1`→`h2` intact, no skipped levels | `npx lighthouse … --only-categories=accessibility,seo` → heading-structure clean |
| P4.2 | SVG-only links | Audit every interactive element whose only child is SVG (`site-footer` socials, nav icon buttons, carousel arrows, `group`-wrapped SVG divs per desktop §3): add `aria-label="…"` (Indonesian, e.g. `aria-label="Instagram Catering Nusantara"`) or `aria-hidden="true"` + visually-hidden text for decorative. Tokens/classes unchanged | `axe-core` / Lighthouse a11y → "Links do not have a discernible name" cleared; target 95→100 |
| P4.3 | `CARA PEMESANAN` contrast (`ordering-block.tsx` + mobile timeline) | Darken text or lighten scrim until WCAG AA ≥4.5:1 **using existing OKLCH tokens** (e.g. step `muted-foreground` → `foreground`, or add `bg-background/80` scrim behind the label — no hardcoded hex per `AGENTS.md` §5). Keep layout/type identical | Contrast checker ≥4.5:1 at 320 px width; Lighthouse "Background and foreground colors" cleared |

### P5 — Framer Motion diet (deferred-approval items isolated)

> `mode="wait"`→`sync` crossfades were **deliberately reverted** (visible overlap change — Appendix A). They are NOT in the execution batch. Phase 2 does only the approval-free subset:

| # | File | Exact change | Verify |
|---|---|---|---|
| P5.1 | `gallery-grid.tsx`, `gallery-category-section.tsx` | Per-card `whileInView({opacity,y})` → parent `variants` + `staggerChildren` (one observer per grid, not per card). Keep durations/eases. `viewport={{once:true}}` retained | Trace featured/grid scroll: observer count −N→1 per grid |
| P5.2 | `category-nav.tsx`, `catalog-layout-toggle.tsx`, `gallery-category-nav.tsx`, `navbar.tsx` pills | Full `layout` → `layout="position"`; keep `layoutId` names (shared-element continuity preserved, distortion removed). Screenshot before/after per pill | Visual diff: pill glide identical, no size warp |
| P5.3 | `LazyMotion domAnimation` | Extend beyond `ordering-mobile-timeline` to gallery grids + modal (strict `domAnimation` feature set — no exit/layout features lost that are in use). `MotionConfig reducedMotion="user"` stays authoritative | First-paint Framer feature cost down; `tsc` clean |

### P6 — Containment & idle discipline (progressive enhancement, near-zero risk)

| # | File | Exact change | Verify |
|---|---|---|---|
| P6.1 | `src/index.css` (`cv-auto` exists) | Apply `cv-auto` to rails/grids/testimonial list/gallery masonry roots (`paket-grid.tsx`, `gallery-grid.tsx`, `testimonial-block.tsx` list, `detail-recommendations.tsx`). `contain-intrinsic-size:auto 500px` prevents scrollbar jump | Scroll trace: off-screen layout/paint skipped; CLS stays 0 |
| P6.2 | Non-critical work audit | Move PostHog pre-warm, JSON-LD injection (static — keep), testimonial fetch prefetch, and any `setTimeout(…,0)` analytics into `requestIdleCallback` with `setTimeout` fallback (pattern already proven by hero `decorReady`) | INP/TBT down; no functional change |

---

## 4. Risk / UX mitigation table

| Change | Perf upside | UX risk | Mitigation |
|---|---|---|---|
| P1 raster pipeline (webp/avif + srcset) | **Highest** — 11 MB savings; 42 s → <2.5 s LCP path | Low — encode artifacts if quality too aggressive | Quality floors (photos webp ~80 / avif ~60); screenshot + zoom compare per hero/card; PNG fallback retained |
| P1.5 eager/high only for LCP | **Highest** — unblocks LCP discovery | Low — over-eagering re-creates the burst | Exactly one eager image per route (hero or lead); audit via Network `Priority` column |
| P3.1 critical-CSS split | High — −80 ms desktop / −~700 ms mobile FCP | Medium — FOUC if critical set is incomplete | Extract from built CSS; filmstrip compare; `<noscript>` fallback; tokens only |
| P3.2 manualChunks + compression | High — smaller parse/execute, faster TTI | Low — chunk duplication if mis-split | Visualizer review; `tsc` + `vite build` green; route tests |
| P2.2 mobile scrub gates | Medium on mobile scroll jank | Very low — mobile already uses vertical timeline | `matchMedia` (not UA); desktop pixel-identical |
| P4.3 contrast fix | A11y compliance (AA) | Very low — token step may read "heavier" | Token-only change; before/after swatch + device check |
| P5 Framer subset | Medium — fewer observers, less layout tracking | Low — variant hoisting can shift stagger feel | Keep durations/eases/stagger constants; video compare |
| P6 containment | Medium — skipped off-screen work | Very low | `contain-intrinsic-size` prevents jump; CLS monitored |
| Speculation prerender (already in-tree) | Perceived next-nav near-instant | Bandwidth cost of one prerender | Keep `moderate`; monitor hit rate; no change in Phase 2 |

**Overall risk: LOW-MEDIUM.** No API, schema, token, route-structure, or shadcn-core change. Motion keeps identical end-states/eases/staggers; only format/size/scheduling change. `prefers-reduced-motion` paths stay authoritative. React 19 specifics respected: no legacy `forwardRef` patterns, `Suspense` boundaries already concurrent-safe, `use()` not required; Vite 8 specifics: build-time image optimize + `manualChunks` + compression plugins (no Next Image concepts — there is no `next/image` in Vite).

---

## 5. Intentionally untouched (Phase 2 must not touch)

| Path | Reason |
|---|---|
| `src/components/ui/core/block/admin/**` + `src/pages/admin/**` | Out of scope (admin splitting already done — keep; never touch guards) |
| `backend/**` | No server change; `total_harga` server-computed + `nomor_struk STR-YYYYMMDD-XXXX` rules unaffected |
| `src/api/**`, `src/services/**`, `src/store/auth-store.ts`, TanStack Query + Ky data layer | Already correct; not a jank source |
| `src/components/ui/fragments/shadcn-ui/**` (shadcn core) | `AGENTS.md` §5 forbids direct override — theme via Tailwind tokens only |
| `src/components/motion/gsap.ts` | Single registration, correct |
| `src/hooks/use-reduced-motion.ts`, `use-mobile.ts`, `use-is-laptop.ts` | Correct `matchMedia` gates; become the gate for all new branches |
| `src/lib/refresh-route.ts`, `src/lib/hash-scroll.ts`, `home-page.tsx` two-frame gate | Appendix A decisions stand — correct as-is |
| `word-reveal.tsx`, `blur-reveal.tsx` (container blur + mobile caps), `preloader.tsx` (trimmed timeline), hero `decorReady` idle gate, `paralax-floating.tsx` rAF gate, `scroll-indicator.tsx` | Surviving P1–P9 + Appendix A work — keep verbatim; guard against regression only |
| `gallery-featured.tsx` + `global-image-modal.tsx` `mode="wait"` | Reverted deliberately — needs explicit user approval before any `sync` crossfade |
| Tailwind config / OKLCH design tokens | `design.md` palette canonical — no token change, no hardcoded hex |
| Routes / sitemap | No off-sitemap pages (`AGENTS.md` §2) |

---

## 6. Manual Test Checklist (Phase 2 exit gate)

- [ ] PSI Mobile ≥90 and Desktop ≥90 on `/` (record LCP/FCP/INP/CLS/TBT/SI + payload MB)
- [ ] PSI Mobile ≥90 on `/paket`, `/galeri`, one `/paket/:id` (LCP element is eager/high, no lazy-LCP warning)
- [ ] DevTools Network (Moto G4, Fast 3G): total `/` transfer <2–3 MB; hero ≤200 KB; 0 floating-card bytes before idle; marquee tile ≤150 KB
- [ ] DevTools Performance (4× throttle): zero long tasks >50 ms during hero reveal; no "Forced synchronous layout" warning on hash jump `/#cara-pesan` (or canonical hash)
- [ ] Cross-route hash landing (`/paket` → `/#testimoni` style): lands on section top, mask fades ≤500 ms, no pin-trap, no footer-first flash
- [ ] Preloader: desktop first-visit cinematic intact (eyebrow → title → streak → curtain, same eases); repeat visit skips via session flag; `<1024px` bypasses with zero flash
- [ ] Reduced motion (`prefers-reduced-motion`): preloader skipped, reveals render statically, no scrub/loop
- [ ] A11y: Lighthouse a11y 95→100 (SVG names, heading order, `CARA PEMESANAN` contrast ≥4.5:1 at 320 px)
- [ ] Visual parity: hero/cards/marquee/pills/modal screenshot + scroll video before/after — same end-states, eases, staggers
- [ ] `tsc --noEmit` clean; `vite build` green; chunk sizes logged vs. §3 budgets; CLS stays 0
- [ ] CrUX field verification scheduled post-deploy (pending real-user data per `performance` skill)

---

## 7. Verification performed (Phase 1)

- [x] All 3 reports read (§1.1 — quoted metrics, culprits, and agent instructions cross-checked against code)
- [x] All 8 mandated skills' `SKILL.md` read + `skills-lock.json` parsed (§1.2)
- [x] Codebase files in §1.3 read fully (motion primitives, router splitting, hero system, providers, libs, `vite.config.ts`, `index.html`, `src/index.css`, `package.json`)
- [x] React 19 + Vite specifics covered (§4 intro + P3.2 — concurrent-safe `Suspense`/`lazy`, no Next Image, build-time optimize)
- [x] GSAP contexts (`useGSAP` + `scope` + auto-cleanup, 0 raw `gsap+useEffect`) and Framer variants GC (`clearProps`/`removeProperty`, `once:true`, module-scope wrappers) confirmed scoped
- [x] Asset weights measured live (`du`/`find`: 204 MB, 194 files, 34 PNG, 0 webp/avif; hero 3.2 MB; songket2 2.2 MB)
- [x] Above-fold `loading="lazy"` anti-pattern, PostHog deferral, `<h1>` presence, `fetchPriority` usage grepped across `src`
- [x] Reverted items from Appendix A explicitly excluded from re-proposal (§2 P2.5, §4 table, §5)
- [x] This plan written to `frontend/docs/PERFORMANCE_EXECUTION_PLAN.md` with zero source edits (planning-only rule honored)

---

## Appendix — What changed since the source reports (so Phase 2 doesn't redo work)

- `public/assets` grew 108 MB → **204 MB**: raster pipeline is more urgent, not less.
- `<h1>` gap is **closed** (hero has a visible `h1`); remaining a11y work is SVG names + contrast only.
- Route splitting is **done** for public + admin; remaining bundle work is chunks/budgets/compression/preload, not `lazy` itself.
- PostHog deferral is **done** (dynamic import + env gate); remaining work is idle-scheduling + measurement with/without key.
- Speculation prerender + inline paint + `cv-auto` + container blur + idle decor + rAF gates are **done**; Phase 2 extends coverage, never re-architects.
- PSI `index-CnT359nh.css` filename will differ per build (content hash) — treat it as "the built CSS bundle" in Phase 2, not a literal filename.

*End of plan — Phase 2 begins only on written `APPROVED`. First execution order: P0 baseline → P1.1+P1.2 pipeline+diet → P1.3–P1.7 LCP → P3.1–P3.2 critical+chunks → P2+P4+P5+P6 → re-trace + report.*
