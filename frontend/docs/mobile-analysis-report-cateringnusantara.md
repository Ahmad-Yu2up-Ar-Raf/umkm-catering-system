# Mobile Performance Analysis Report - Catering Nusantara
**Target Audience:** AI Developer Agent (Opencode)
**Objective:** Resolve critical performance bottlenecks (Score < 60) across all pages on Mobile viewports.

## 1. Homepage (`/`)
**Current Score:** 43/100 | **LCP:** 45.4s | **TBT:** 570ms | **Total Payload:** ~12.5 MB

### Critical Insights & Bottlenecks:
* **Enormous Network Payload:** The total page weight is an unacceptable 12.5 MB[cite: 37]. A single image (`banners/hero-banner-tumpeng.png`) is 3.2 MB, and the first-party payload is 7.7 MB[cite: 37].
* **LCP Lazy-Loading Violation:** The hero LCP image contains `loading="lazy"`, forcing the browser to delay fetching the most critical visual element[cite: 37].
* **Unused JavaScript & Main Thread Blocking:** Scripts from PostHog (`posthog.com`) and massive vendor bundles (`/assets/vendor-mo...`) are blocking the main thread for over 2.8 seconds[cite: 37].
* **Uncomposited Animations:** Tailwind CSS animations are triggering layout shifts. Animating properties other than `transform` or `opacity` is causing layout thrashing[cite: 37].

### Required Actions (Homepage):
1. **Cloudinary Optimization:** Ensure ALL Cloudinary image URLs include `q_auto,f_auto`. Replace `.png` extensions in the URL with automatic format delivery.
2. **Fix LCP Image Priority:** On the Hero image, strictly set `loading="eager"` (or omit the loading attribute) and add `fetchpriority="high"`.
3. **Defer Third-Party Scripts:** Move PostHog initialization to a Web Worker (using `@builder.io/partytown`) or strictly defer it until after page hydration.

---

## 2. Gallery Pages (`/galeri` & `/galeri/semua`)
**Current Score:** 56-58/100 | **LCP:** 23.6s - 25.0s | **TBT:** 150ms | **Total Payload:** ~8.6 MB

### Critical Insights & Bottlenecks:
* **Massive Unoptimized Images:** The image `corporate-lunch-box-overhead-lifestyle.png` is 4.05 MB[cite: 36]. Images are missing proper modern formats like WebP/AVIF[cite: 35, 36].
* **Render-Blocking CSS/JS:** The initial CSS bundle (`/assets/index-C15u...css`) and vendor JS are blocking the First Contentful Paint (FCP) by ~300ms[cite: 35, 36].
* **DOM Size & Depth:** The `/galeri` page is rendering too many DOM nodes concurrently instead of virtualizing the gallery grid[cite: 36].

### Required Actions (Gallery):
1. **Implement Next.js Image Component (or equivalent):** Use `<Image />` with `sizes` attributes properly configured (e.g., `sizes="(max-width: 640px) 100vw, 50vw"`). This forces Cloudinary to serve smaller resolutions for mobile viewports[cite: 35].
2. **Lazy Load Below-the-Fold Images:** ALL gallery images *except* the first 2-4 visible images must strictly use `loading="lazy"`. 
3. **Pagination / Infinite Scroll:** Do not render all gallery items at once. Implement intersection observers to load images only when they enter the viewport.

---

## 3. Package Detail Pages (`/paket` & `/paket/15`)
**Current Score:** 46/100 | **LCP:** 24.1s | **TBT:** 470ms

### Critical Insights & Bottlenecks:
* **Forced Synchronous Layout:** JavaScript is requesting geometric properties (like `offsetWidth`) right after styles are invalidated, causing forced reflows that take up to 258ms on the main thread[cite: 38].
* **Legacy JavaScript:** Polyfills and legacy JS are being served to modern browsers, wasting ~17 KB of critical parsing time[cite: 38].
* **Render-Blocking Fonts & Assets:** `fraunces.woff2` is being fetched late in the critical request chain, maxing out at 1,680ms[cite: 38].

### Required Actions (Package):
1. **Font Preloading:** Add `<link rel="preload" href="/assets/fraunces.woff2" as="font" type="font/woff2" crossorigin>` to the document head[cite: 38]. Ensure `font-display: swap` is used in CSS.
2. **Avoid Layout Thrashing:** Review React `useEffect` or Alpine.js hooks. Do not read DOM measurements (like `getBoundingClientRect()`) and write styles in the same synchronous frame.
3. **Bundle Modernization:** Ensure the bundler (Vite/Next) target is set to `esnext` or modern browsers to drop unnecessary polyfills.
