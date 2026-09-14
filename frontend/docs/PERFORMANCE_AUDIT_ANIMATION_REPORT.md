# Catering Nusantara — Animation Performance Audit & Optimization Plan

> **Scope:** public routes `/`, `/paket`, `/galeri`, `/paket/:id`, `/galeri/:id` + cross-route anchors `/#profil`, `/#testimoni`
> **Type:** Planning & Analysis only — no code changed
> **Date:** 2026-09-13
> **Stack verified:** Vite 8 + React 19.2 + Tailwind v4 + `gsap@3.15` + `@gsap/react@2.1.2` + `framer-motion@12.43` + `lenis@1.3.25` + `react-router@8.3` + TanStack Query 5 + Ky

---

## 1. Files and directories inspected

### 1.1 Config / docs / registry

| Path | Why |
|---|---|
| `frontend/package.json` | Confirmed animation + routing versions listed above |
| `frontend/vite.config.ts` | Only `react()` + `tailwindcss()` plugins, `@` alias — no code-splitting, no `manualChunks`, no compression plugin |
| `frontend/skills-lock.json` | Skill registry (55 skills); pins `gsap-core`, `gsap-react`, `gsap-performance`, `animate`, `micro-interaction`, `motion-framer`, `performance`, `vercel-react-best-practices` |
| `frontend/.agents/skills/` | Read full `SKILL.md` for the 8 skills above |
| `frontend/src/App.tsx` | `QueryClientProvider` + `RouterProvider` + `GlobalImageModal`; single global `QueryClient` (staleTime 5 min, correct) |
| `frontend/src/main.tsx` | `StrictMode > ThemeProvider > App` only — no animation init here (correct) |
| `frontend/src/router/index.tsx` | All routes eager-imported; `LayoutWrapper` wraps all public routes; no `lazy()` |
| `frontend/docs/architecture.md` | SPA map, React Query + Ky + zustand rules |
| `frontend/docs/design.md` | Suasana OKLCH tokens, §7 motion budget (150–300 ms, one moment/viewport), §10 Tiska motion grammar (word-mask reveal, curtain, divider, count-up, marquee, pill header) |
| `frontend/src/index.css` | Token source; checked for `will-change` / blur utilities |
| `PRODUCT.md`, `frontend/README.md` | Business context only |

### 1.2 Routing / scroll system (the ~5 s suspect zone)

| Path | Finding |
|---|---|
| `src/components/provider/layout-wrapper.tsx` | Sole `<ReactLenis root>` provider; `ScrollToTop` + `RouteSeoResolver`; chrome gating (`catalogEnded`, `detailReady`, `galeriReady`); header/footer withheld until `preloaderDone` |
| `src/components/provider/scroll-to-top.tsx` | On `pathname` change: native `scrollTo(0,0)` + `lenis.scrollTo(0,{immediate:true,force:true})`, then rAF `ScrollTrigger.refresh()` + re-assert top |
| `src/lib/hash-scroll.ts` | `scrollToHash(hash,lenis)`: live `getBoundingClientRect().top + scrollY - 96`, numeric Lenis destination `{immediate:true,force:true}`, then `ScrollTrigger.update()`; `.pin-spacer`-aware |
| `src/components/ui/core/layout/nav/site-header.tsx` | `/#profil`, `/#testimoni` links; `useLenis()` + `scrollToHash` interceptor; `<AnimatePresence>` mobile menu |
| `src/components/ui/core/layout/nav/components/navbar.tsx` | Framer `useScroll` + `layoutId="hovered"` pill |
| `src/pages/home-page.tsx` | Preloader gate + scroll-lock + two-frame hash teleport (`refresh()` → `lenis.resize()` → `scrollToHash` → mask fade). No tweens in this file |
| `src/components/motion/gsap.ts` | Single `gsap.registerPlugin(useGSAP, ScrollTrigger)` — correct, no double registration |
| `src/hooks/use-reduced-motion.ts`, `use-is-laptop.ts`, `use-mobile.ts` | Pure `matchMedia`, no animation cost |

### 1.3 Motion primitives

| Path | Finding |
|---|---|
| `src/components/motion/word-reveal.tsx` | GSAP `useGSAP` + scoped `rootRef`; `blur` mode animates `opacity/y/filter:blur()` per `[data-word]` with `clearProps:"filter"`; `trigger="scroll"` uses `once:true` ScrollTrigger |
| `src/components/motion/blur-reveal.tsx` | Framer `motion.span` per word; `initial {opacity:0,y:15,scale,filter:blur(8px)}` → `animate`/`whileInView`; `will-change-[transform,filter,opacity]` during tween, `removeProperty("filter","will-change")` on complete; `LUXURY_EASE [0.16,1,0.3,1]` |
| `src/components/motion/parallax-motion-background.tsx` | `useGSAP` scoped; scrub `yPercent` (`scrub:1`) + one-shot `scale 1.15→1`/`opacity`; extra `setTimeout(refresh,100)` per instance |
| `src/components/motion/preloader.tsx` | ~5.5 s GSAP timeline (delay 0.4 + eyebrow 1.0 + title 0.9 + streak 1.1 + pause 1.5 + exits 0.6×3 + curtain 1.0); portaled `z-[9999]`; `useGSAP({scope:rootRef})` without deps (mount-once, correct) |

### 1.4 Route blocks (where cost actually lives)

| Route | Page shell | Block(s) read |
|---|---|---|
| `/` | `src/pages/home-page.tsx` (orchestration only) | `hero/hero-block.tsx`, `hero/components/paralax-floating.tsx`, `hero/components/scroll-indicator.tsx`, `ordering/ordering-block.tsx` (+ `ordering-mobile-timeline.tsx`), `mengapa/mengapa-block.tsx`, `testimonial/testimonial-block.tsx`, `faq/faq-block.tsx` (+ `category-tabs.tsx`, `faq-accordion.tsx`), `about/about-block.tsx` |
| `/paket` | `src/pages/paket/paket-page.tsx` (11 lines, zero animation) | `block/paket/paket-block.tsx`, `paket-grid.tsx` (IntersectionObserver 400 px margin), `category-nav.tsx` (`layoutId`), `catalog-layout-toggle.tsx` (`layoutId`), `cta-button.tsx` (motion + ResizeObserver) |
| `/galeri` | `src/pages/gallery/galery-page.tsx` (19 lines, zero animation) | `block/galeri/galeri-block.tsx`, `gallery-hero.tsx`, `gallery-featured.tsx` (`AnimatePresence mode="wait"`), `gallery-category-section.tsx` (variants `whileInView="show"`), `gallery-grid.tsx` (per-card `whileInView {opacity,y}`), `gallery-category-nav.tsx` (`layoutId`) |
| `/paket/:id`, `/galeri/:id` | `paket-detail.tsx`, `galeri-category-page.tsx` (thin wrappers) | `detail/detail-block.tsx`, `detail-summary.tsx`, `detail-menu.tsx`, `detail-facilities.tsx`, `detail-recommendations.tsx`, `package-reviews.tsx`, `galeri-category-block.tsx`, `global-image-modal.tsx` (nested `AnimatePresence mode="wait"` + per-slide `filter:blur(6px)`) |
| Shared | — | `ui/core/layout/cta-block.tsx` (own `setTimeout(refresh,100)`), `ui/core/visual/scroll-rotating-visual.tsx` (`useScroll`+`useSpring`), `ui/fragments/custom-ui/media-item.tsx` (per-item IntersectionObserver for video) |

Grep evidence: `framer-motion|AnimatePresence|whileInView` = 87 hits across ~25 public files; `ScrollTrigger` = 43 hits; raw `gsap+useEffect` / `gsap.context` = **0 hits** (all tweens already use `useGSAP` via the `motion/gsap` wrapper, ~14 files / 66 hits). `filter:blur` hotspots: `word-reveal`, `blur-reveal`, `galeri-block` featured (`blur(8px)`), `global-image-modal` (`blur(6px)` per slide + `backdrop-blur-sm/md`).

---

## 2. Skills discovered, selected, activated

From `frontend/.agents/skills/` + `skills-lock.json` (full `SKILL.md` read, not just names):

| Skill | Status | Insight applied |
|---|---|---|
| `gsap-performance` | **Activated (primary)** | Transform/opacity-only rule; `will-change` only on animating nodes; `stagger` over separate tweens; `quickTo` for followers; `scrub:1` smoothing; kill off-screen; debounced `refresh()` |
| `gsap-react` | **Activated (primary)** | `useGSAP` + `scope` + auto-cleanup already correct here; `contextSafe` for post-mount callbacks; never unscoped selectors; never SSR-execute GSAP |
| `gsap-core` | **Activated (primary)** | `autoAlpha` over `opacity`; transform aliases (`x/y/scale/rotation`) over raw strings; `matchMedia()` for ≥768 px pin + `prefers-reduced-motion`; `clearProps` after blur |
| `performance` | **Activated (primary)** | Field-plus-lab baseline before edits; budgets (JS <300 KB compressed, images above-fold <500 KB); `content-visibility:auto` for long lists; Speculation Rules prerender; View Transitions for route fades; `requestIdleCallback` for non-critical work |
| `vercel-react-best-practices` | **Activated (supporting)** | `bundle-dynamic-imports` (heavy blocks), `rendering-content-visibility`, `rerender-memo` / split hooks, `client-passive-event-listeners`, `js-request-idle-callback`, `rendering-usetransition-loading` for route waits |
| `micro-interaction` | **Activated (supporting)** | 100–250 ms micro budget; asymmetric enter/exit; `AnimatePresence mode="popLayout"` for toasts/lists; `layout="position"` over full `layout`; reduced-motion guard |
| `animate` | **Activated (supporting)** | Cheapest-tool ladder (CSS transition > `@starting-style` > CSS animation > WAAPI > Motion lib); transform+opacity only; full `transform` string under load; 150–250 ms UI durations; transitions (not keyframes) for rapidly-fired elements |
| `motion-framer` | **Activated (supporting)** | Variants + `staggerChildren`; `viewport={{once:true}}`; `layoutId` sparingly (global tracking cost); `MotionConfig reducedMotion="user"` already present; `LazyMotion domAnimation` already used in `ordering-mobile-timeline` (extend it) |

Skills **discovered but deliberately not activated**: `cloudinary-*` (no Cloudinary in this repo — local `/assets`), `seo-*` (unrelated to jank), `neon-*` (no DB work), `shadcn`/`tailwindcss` (no component restyle in this plan), `agent-browser` (no live runnable page in this phase).

---

## 3. Current-state summary (why mobile lags, why routes feel ~5 s)

**No single bug — six compounding costs. React Router itself is not slow; the work stacked on top of every navigation is.**

1. **Preloader timeline dominates first paint (~5.5 s perceived freeze).** `preloader.tsx` runs delay 0.4 + eyebrow 1.0 + title stagger + streak 1.1 + pause 1.5 + three 0.6 exits + curtain 1.0 `expo.inOut`. Body is `overflow:hidden` + content clipped `fixed inset-0` until `onComplete`. Desktop first visit therefore *cannot* feel faster than ~5 s by design; any route change that re-arms chrome gating feels like a second freeze.
2. **Per-word blur is the mobile GPU killer.** `BlurReveal`/`WordReveal blur` creates one `motion.span`/tween **per word** each animating `filter: blur(6–12px)` + `y` + `opacity` with `will-change-[transform,filter,opacity]`. Blur is a paint-chain property (not composited like transform/opacity). A hero H1 + eyebrow + subtitle + CTA = 30–60 simultaneous blur layers on a phone GPU → frame drops. Cleanup (`clearProps`/`removeProperty`) exists but only *after* the jank already happened.
3. **ScrollTrigger fan-out + refresh storms.** Every section owns triggers: hero marquee (2 scrubs) + parallax (scrub + reveal) + ordering pin (`PIN_END 3000`, `scrub:0.8`, `onUpdate` class toggles) + per-`WordReveal trigger="scroll"` + per-Framer `whileInView`. Cross-route landings fire `ScrollTrigger.refresh()` in *four* places (`scroll-to-top`, `home-page` frame 1, `parallax-motion-background` +100 ms, `cta-block` +100 ms). Each `refresh()` re-measures the whole document including the inflated pin spacer; on mobile this is 100–300 ms of main-thread layout per call, serialized before the hash jump.
4. **Lenis + pin + hash sequencing serializes the visible delay.** `home-page` two-frame gate → `refresh()` → `lenis.resize()` → frame 2 `scrollToHash` (numeric) → `ScrollTrigger.update()` → 500 ms mask fade. Correct engineering (fixes the pin-spacer short-land), but the user sees: blank mask → jump → fade. Combined with (1) and (3) the `/paket → /#testimoni` path reads as "up to 5 s".
5. **Route bundles are eager, images are eager.** `router/index.tsx` statically imports all 5 public pages + all admin pages; no `React.lazy`. `ParallaxMotionBackground` uses `loading="eager" fetchPriority="high"` on *every* instance (hero + kontak + CTA), so a route change competes with 3+ full-bleed decodes. `Floating` mounts 4 `MediaItem` cards immediately. No `content-visibility` on rails/grids; no speculation prerender.
6. **Framer overhead multipliers.** `AnimatePresence mode="wait"` in `gallery-featured` and `global-image-modal` serializes exit→enter (adds ~300 ms per featured rotation feel); `layoutId` pills (`navbar hovered`, `catalog-layout-toggle`, `category-nav`, `galeri-category-nav`, `faq-category-active-line`, `accordion-active-line`) keep global layout tracking alive; dozens of independent `whileInView` observers fire instead of one variant tree with `staggerChildren`. Only one file uses `LazyMotion`; the rest pay full `framer-motion` feature cost on first paint.

Desktop hero stutter = (2) + (5): blur words + eager hero decode + marquee scrubs starting on the same frames as the curtain lift.

---

## 4. Assumptions, ambiguities, documentation/code conflicts

| # | Item | Type |
|---|---|---|
| A1 | No runnable lab trace exists in this phase — findings are **static hypotheses** ranked by code evidence, not measured regressions. Each carries a verify command in §6. | Limitation |
| A2 | "5 seconds" is user-reported, not profiled. The preloader timeline (~5.5 s) matches it on desktop first visit; cross-route hash delay is likely 0.8–2 s + perceived wait, not a full 5 s router stall. Confirm with `performance_start_trace` / DevTools. | Ambiguity |
| A3 | `docs/design.md §7` mandates 150–300 ms micro budget + one moment/viewport, but `§10` Tiska grammar + shipped code run 0.6–1.2 s reveals, 3000 px pins, infinite floats/marquees. Code follows §10, violating §7. Decision needed: §10 is the signature, §7 the guardrail — cap concurrent signatures (see P3). | Conflict |
| A4 | `AGENTS.md` forbids new tables/schema — irrelevant here; no backend change proposed. | Assumption (safe) |
| A5 | Images assumed local `/assets` (verified in hero/parallax/media paths) — no CDN transform available; optimization is `vite-plugin-image-optimizer` / `srcset` / lazy, not Cloudinary. | Assumption |
| A6 | `useGSAP` cleanup assumed correct (verified: 0 raw `gsap+useEffect`, all scoped). Residual risk is *volume* of triggers, not leaks. | Assumption |
| A7 | Admin folder excluded entirely per scope — its two `layoutId` toggles noted but untouched. | Boundary |
| A8 | Lenis version `1.3.25` + `lenis/react` `useLenis`/`ReactLenis root` assumed stable; no upgrade proposed. | Assumption |

---

## 5. Impact and risk assessment

| Change | Perf upside | UX risk | Mitigation |
|---|---|---|---|
| Preloader: shorten pause 1.5→0.6 s, curtain 1.0→0.7 s, skip on repeat visit (already session-gated) | **Highest** — removes ~1.5–2 s perceived freeze | Medium — less "cinematic" | Keep full sequence only on first desktop visit; A/B the pause length; visual identical otherwise |
| Blur radius cap on mobile (`blur 12→4`, or opacity/y-only <768 px via `gsap.matchMedia`) | **Highest on mobile** — blur cost scales with radius² × layer count | Low — 4 px blur reads identical at phone viewing distance | Keep desktop blur; gate by `matchMedia`, not UA |
| Route-level `React.lazy` + `Suspense` for `/paket`, `/galeri`, `/:id` blocks; `LazyMotion domAnimation` everywhere | High — cuts initial JS, defers Framer features | Low — skeleton already exists (`RailsSkeleton`) | Keep hero eager; lazy below-fold + detail blocks only |
| Single `ScrollTrigger.refresh()` per navigation (remove per-instance +100 ms timeouts; one debounced host refresh) | High — removes 200–600 ms layout storms | Low — needs reorder test on pin routes | Central `refreshRoute()` helper with `requestIdleCallback` fallback |
| `AnimatePresence mode="wait"` → `mode="sync"` + crossfade for featured/modal; `layout` → `layout="position"` | Medium — removes 300 ms serialization + layout distortion | Low | Keep durations/eases identical |
| `content-visibility:auto` + `contain-intrinsic-size` on rails/grids/testimonials | Medium — skips off-screen layout/paint | Very low | Pure CSS, progressive enhancement |
| Eager→lazy images except hero LCP; `decoding="async"`; hero `fetchpriority="high"` only | Medium — frees main thread during reveal | Low | Keep hero eager; everything else lazy |
| Kill pin + idle float + marquee scrubs on `<768px` (already pinned only ≥768; extend to floats/scrubs) | Medium on mobile | Very low — mobile already uses vertical timeline | `gsap.matchMedia` + existing `useIsMobile` |
| Speculation Rules prerender `moderate` for `/paket`, `/galeri` | Medium perceived — next nav near-instant | Low — bandwidth cost of one prerender | `eagerness:moderate`, measure hit rate |

**Overall risk: LOW-MEDIUM.** No API, schema, token, or route-structure change. All motion keeps identical end-states, eases (`power3.out`, `LUXURY_EASE`), and staggers; only duration/radius/scheduling change. `prefers-reduced-motion` paths already exist and stay authoritative.

---

## 6. Step-by-step optimization plan

> Rule for every step: keep end-state pixels identical; change only *how*/*when* the pixels get there. Verify with the command in parentheses.

- [ ] **P0 — Baseline (no code).** Record DevTools Performance trace for `/`, `/paket`, `/galeri`, `/paket/:id`, cross-route `/#testimoni` on Moto G4-class emulation + desktop; note LCP/INP/CLS, long tasks, `ScrollTrigger.refresh` duration. (`performance_start_trace` + `performance_analyze_insight`; fallback: Chrome DevTools → Performance → 4× CPU throttle.)
- [ ] **P1 — Cap the curtain.** `preloader.tsx`: pause `+=1.5`→`+=0.6`, curtain `1.0`→`0.7`, eyebrow/title keep eases. Mobile bypass already exists — keep. (Re-trace `/` first visit; target −1.5 s.)
- [ ] **P2 — Mobile blur diet.** `word-reveal.tsx` + `blur-reveal.tsx`: wrap in `gsap.matchMedia` / `useIsMobile` — `<768px` uses `blur ≤4` or opacity/y-only; desktop keeps 8–12. Keep `clearProps`/`removeProperty` cleanup. (Moto G trace; target 60 fps during H1 reveal.)
- [ ] **P3 — One signature at a time.** `hero-block.tsx`: sequence H1 → subtitle → CTA → floating cards → marquee with a single timeline; never run blur words + bg zoom + 4 card reveals on the same frame. Stagger already 0.2 — enforce non-overlap of the heaviest two. (Frame graph; target zero long tasks >50 ms during reveal.)
- [ ] **P4 — Debounce refresh.** New `lib/refresh-route.ts`: single debounced `ScrollTrigger.refresh()` + `lenis.resize()`; delete `+100 ms` timeouts in `parallax-motion-background.tsx` and `cta-block.tsx`; keep `scroll-to-top.tsx` + `home-page.tsx` as the only callers. (Trace `/#cara-pesan` jump; target one layout pass.)
- [ ] **P5 — Split routes.** `router/index.tsx`: `React.lazy` for `PaketPage`, `GaleryPage`, `PaketDetail`, `GaleriCategoryPage` + `Suspense` fallback skeletons; preload on link hover/focus (`bundle-preload` rule). Admin imports stay eager (out of scope, avoids touching guards). (Lighthouse TTI; target −15–30% JS.)
- [ ] **P6 — Framer diet.** Replace `AnimatePresence mode="wait"` with crossfade (`mode="sync"`, matched 0.25 s fades) in `gallery-featured.tsx`, `global-image-modal.tsx`; `layout`→`layout="position"` in pills/toggles; hoist `LUXURY_EASE` (already shared) + use variants/`staggerChildren` for grids instead of per-card `whileInView`; extend `LazyMotion domAnimation` beyond `ordering-mobile-timeline`. (Trace featured rotation + modal nav.)
- [ ] **P7 — Images.** Only hero keeps `eager/high`; all other `ParallaxMotionBackground` + `MediaItem` → `loading="lazy" decoding="async"`; add `content-visibility:auto; contain-intrinsic-size: 0 500px` to rails/grids/testimonial list. (LCP + total weight; target above-fold <500 KB.)
- [ ] **P8 — Kill mobile scrub.** `hero-block.tsx` marquee scrubs + `ordering-block` idle float + `scroll-rotating-visual` springs: gate behind `(min-width:768px)` / `useIsMobile`; mobile keeps static or CSS `animation` (compositor thread). (Moto G scroll trace.)
- [ ] **P9 — Prerender next nav.** Add Speculation Rules (`prerender moderate` for `/paket`, `/galeri`) in `index.html`; re-measure click-to-paint. (Perceived route time; watch bandwidth.)
- [ ] **P10 — Re-trace + report.** Repeat P0 matrix; publish before/after LCP/INP/CLS + trace deltas in this file's appendix. Field verification (CrUX) pending post-deploy.

---

## 7. Files to refactor vs. intentionally untouched

### 7.1 Will be refactored (public surface only)

| File | Planned change |
|---|---|
| `src/components/motion/preloader.tsx` | Shorten pause + curtain; keep eases/sequence |
| `src/components/motion/word-reveal.tsx` | Mobile blur cap via `matchMedia`; keep desktop grain |
| `src/components/motion/blur-reveal.tsx` | Same as above; keep cleanup + `LUXURY_EASE` |
| `src/components/motion/parallax-motion-background.tsx` | Remove per-instance `refresh(100)`; mobile scrub gate; lazy non-hero images |
| `src/router/index.tsx` | `React.lazy` + `Suspense` for paket/galeri routes |
| `src/pages/home-page.tsx` | Adopt central `refreshRoute()`; keep two-frame teleport logic |
| `src/components/provider/scroll-to-top.tsx` | Adopt central `refreshRoute()` |
| `src/lib/hash-scroll.ts` | No logic change; only callee of refresh changes |
| `src/components/ui/core/block/home/hero/hero-block.tsx` | Single master timeline ordering; mobile scrub gate |
| `src/components/ui/core/block/home/ordering/ordering-block.tsx` | Debounced refresh; idle-float mobile gate (pin already ≥768) |
| `src/components/ui/core/layout/cta-block.tsx` | Remove `+100 ms` refresh |
| `src/components/ui/core/block/galeri/galeri-block.tsx` | Featured crossfade; rail `content-visibility` |
| `src/components/ui/core/block/galeri/components/gallery-featured.tsx` | `mode="wait"`→`sync` crossfade |
| `src/components/ui/core/block/galeri/components/gallery-grid.tsx` | Variants + `staggerChildren`; lazy images |
| `src/components/ui/core/block/galeri/components/gallery-category-section.tsx` | Same variants treatment |
| `src/components/ui/core/block/galeri/components/gallery-category-nav.tsx` | `layout`→`layout="position"` |
| `src/components/ui/core/block/paket/components/category-nav.tsx` | Same |
| `src/components/ui/core/block/paket/components/catalog-layout-toggle.tsx` | Same |
| `src/components/ui/core/block/paket/components/paket-grid.tsx` | `content-visibility`; keep IO pre-load margin |
| `src/components/ui/core/visual/global-image-modal.tsx` | Nested `AnimatePresence` → single crossfade; blur 6→4 on mobile |
| `src/components/ui/core/layout/nav/components/navbar.tsx` | `layoutId="hovered"` → CSS hover where possible |
| `src/components/ui/core/visual/scroll-rotating-visual.tsx` | Mobile spring gate |
| `index.html` | Speculation Rules block |
| `src/index.css` | `content-visibility` utilities only (tokens untouched) |

### 7.2 Intentionally untouched

| Path | Reason |
|---|---|
| `src/components/ui/core/block/admin/**` (all 5 pages + toggles) | Explicit OUT OF SCOPE; animations rare there |
| `backend/**` | No server change needed; `total_harga`/`nomor_struk` rules unaffected |
| `src/api/client.ts`, `src/services/**`, `src/store/auth-store.ts` | Data layer already correct (Query + Ky + zustand); not a jank source |
| `src/components/ui/fragments/shadcn-ui/**` | Shadcn core must not be overridden (AGENTS.md §5); theming via CSS only |
| `src/components/motion/gsap.ts` | Registration already single + correct |
| `src/hooks/use-reduced-motion.ts` | Accessibility path correct; becomes the gate for all new branches |
| `tailwind.config` / design tokens | No token change; `design.md` palette stays canonical |

---

## 8. Verification performed (this phase)

- [x] Re-read `docs/architecture.md`, `docs/design.md`, `package.json`, `vite.config.ts`, `router/index.tsx`, `App.tsx` after analysis — versions and route map above match the code.
- [x] Confirmed GSAP setup: single `registerPlugin` in `motion/gsap.ts`; zero unscoped selectors; zero raw `gsap.context` (grep = 0).
- [x] Confirmed no admin file was read for findings beyond counting filenames (scope respected).
- [x] This report saved to `frontend/docs/PERFORMANCE_AUDIT_ANIMATION_REPORT.md` (this file).

## 9. Residual risks

- Static-only analysis: real device traces may reorder the P1–P9 priority. P0 exists to correct that.
- Pin-spacer math (`PIN_END 3000`, `.pin-spacer` resolution) is load-bearing for `/#cara-pesan` — any refresh debounce must be tested against mid-pin arrival.
- `layoutId` → CSS swaps change shared-element continuity subtly; keep screenshot before/after per pill.
- Speculation prerender costs bandwidth; monitor prediction hit rate before enabling on metered mobile.

---

*End of report — next step is P0 baseline traces, then P1–P4 in one refactor PR (curtain + blur + refresh), P5–P9 in a second (splitting + Framer + images + prerender).*

---

## Appendix A — Phase 2 root-cause fix (2026-09-13, ASUS TUF freeze)

P1–P9 reduced paint cost but freezes persisted on capable hardware, proving
the bottleneck was a **synchronous mount storm**, not just expensive paint:
`public/assets` totals **108 MB**; the hero alone mounts a 3.2 MB eager
banner + 4× ~1.5 MB floating PNGs + a 2.2 MB marquee JPEG in the same frame
window as the preloader lift, ~200+ per-word motion nodes page-wide, and
perpetual rAF/mousemove taxes. Multi-second stalls on a gaming laptop are a
main-thread block signature — decode + mount + measure colliding at once.

Structural fixes (visual language unchanged — same eases, staggers, end states):

- **Container-level blur** (`motion/blur-reveal.tsx`, `motion/word-reveal.tsx`):
  ONE `filter: blur()` tween on the reveal root (spanning the word sequence)
  instead of one per word; words keep individual opacity/y staggers. N blur
  layers → 1 per reveal. Mobile radius cap (≤4px) retained.
- **Idle-deferred hero decor** (`block/home/hero/hero-block.tsx`): `Floating`
  (4 PNGs), `Marque`, `ScrollIndicator` mount via `requestIdleCallback`
  (700 ms timeout, 350 ms fallback) after `preloaderDone`; H1/CTA reveal
  immediately. Burst split across idle beats.
- **rAF gating** (`paralax-floating.tsx`): parallax loop skips frames while the
  hero is off-screen (`useInView amount: 0`) and on touch devices (existing).
- **Pointer-tax throttle** (`hooks/use-mouse-position-ref.ts`): container rect
  cached, refreshed ≤1×/frame + on scroll/resize — never inside pointer
  handlers. (`cta-button.tsx` magnet listener skipped on `hover: none`.)
- **Raster diet** (`hero-block.tsx` marquee): bands `240dvw` → `160dvw`
  (same relative drift, ~1/3 less repaint per scrub tick).
- **Image tiers** (`parallax-motion-background.tsx`): `eager/high` only for
  `revealTrigger="mount"` heroes; all other instances `lazy` + `async`.
- **Prerender** (`index.html`): speculation-rules `moderate` for
  `/paket`, `/galeri`.

Surviving P1–P9 work found in-tree and kept: preloader trim, blur caps,
`cv-auto` containment, marquee ≥768px gate, user-owned route splitting
(`router/admin-pages`, `Public*` pages). Fully-reverted items intentionally
NOT re-applied: central `refreshRoute` (home two-frame gate is correct as-is;
per-host +100 ms timers are 100–300 ms, not the freeze), `mode="wait"`→`sync`
crossfades (visible overlap change — deferred pending user approval).

Verified: `tsc --noEmit` clean, per-file eslint clean on all 8 touched
files, full lint unchanged at 46 pre-existing errors, `vite build` green
(index chunk 413 KB gzip 145 KB, down from ~1 MB via route splitting).
