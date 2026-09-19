# File: mobile-analysis-report-cateringnusantara.md
# Mobile Performance Analysis & Remediation Report - Catering Nusantara
**Target Audience:** OpenCode Autonomous AI Agent / Lead Engineer
**Objective:** Resolve critical sub-90 performance bottlenecks, targeting a 100/100 Lighthouse score across all mobile viewports.
**Current State:** Critical Failure. Average scores hover around 60. The `/galeri` route scores 60, and the `/paket` route drops to a severe 46.

## 1. Executive Summary: The Mobile Bottleneck
Mobile CPUs and GPUs lack the processing power to handle the simultaneous execution of complex React hydration, massive raw image decoding, and staggered animation sequences. The current architecture forces the mobile browser to download up to 12.5 MB of data while concurrently running expensive DOM calculations. To achieve a 100/100 score, the AI agent must shift from a "load everything" approach to strict **lazy-evaluation and prioritized asset delivery**.

## 2. Route-by-Route Deep Analysis & Action Plan

### A. Homepage (`/`) - Score: ~60 (Previous 43)
**Critical Insights:**
*   **The LCP Paradox:** The hero image (`hero-banner-tumpeng.png`) previously exceeded 3.2 MB and was incorrectly marked with `loading="lazy"`[cite: 54]. This fundamentally breaks the Largest Contentful Paint (LCP) metric.
*   **Main Thread Asphyxiation:** Third-party scripts (e.g., PostHog) and massive React vendor chunks block the main thread for over 2.8 seconds during initial load[cite: 54].
*   **GPU Compositing Crash:** Heavy animation libraries (GSAP/Framer) are applying CSS `filter: blur()` and complex transforms to multiple elements simultaneously. On mobile, this causes severe frame drops and layout thrashing.

**Mandatory AI Agent Actions:**
1.  **Strict LCP Preloading:** The AI must implement `<link rel="preload" href="..." as="image">` in the `<head>` specifically for the mobile-sized hero image.
2.  **Implement `<picture>` Tags:** Replace the `<img>` tag in the hero section with a `<picture>` element providing WebP/AVIF sources tailored for `<768px` screens.
3.  **Animation Gating (MatchMedia):** Implement `gsap.matchMedia()`. For screens `<768px`, strip away `filter: blur()` entirely. Fall back to simple `opacity` and `transform: translateY` to prevent mobile GPU thermal throttling.

### B. Gallery Page (`/galeri` & `/galeri/semua`) - Score: 60
**Critical Insights:**
*   **DOM Node Explosion:** The gallery is rendering the entire dataset into the DOM concurrently. Mobile browsers struggle to calculate layout and paint for more than 1,500 DOM nodes.
*   **Unoptimized Payloads:** Individual gallery assets previously reached up to 4.05 MB (`corporate-lunch-box...png`)[cite: 54]. Loading dozens of these destroys mobile bandwidth.

**Mandatory AI Agent Actions:**
1.  **Virtualization / Pagination:** The AI must implement `react-window` or an Intersection Observer to only mount gallery `<Card>` components when they are within 200px of the viewport.
2.  **Cloudinary `f_auto,q_auto` Enforcement:** Ensure the image utility function maps all gallery URLs to `w_400,c_fill,q_auto,f_auto` to ensure mobile devices only download ~30kb WebP images instead of massive PNGs.
3.  **CSS Containment:** Apply `content-visibility: auto; contain-intrinsic-size: 300px;` to all gallery grid items. This tells the mobile browser to skip rendering calculations for items off-screen.

### C. Package Pages (`/paket` & `/paket/15`) - Score: 46
**Critical Insights:**
*   **Synchronous Layout Thrashing:** JavaScript (React `useLayoutEffect` or Alpine hooks) is reading geometric properties (e.g., `getBoundingClientRect()`) immediately after writing styles[cite: 54]. This triggers forced reflows costing ~258ms per frame.
*   **Render-Blocking Typography:** Custom fonts (`fraunces.woff2`) block text rendering, causing a "Flash of Invisible Text" (FOIT) that delays First Contentful Paint (FCP)[cite: 54].

**Mandatory AI Agent Actions:**
1.  **Font Optimization:** Add `<link rel="preload" href="/assets/fraunces.woff2" as="font" type="font/woff2" crossorigin>` to `index.html`. Ensure CSS utilizes `font-display: swap`.
2.  **Debounce Resize/Scroll Events:** The AI must wrap any scroll or resize listeners in a debounce utility (requestAnimationFrame). Never read/write to the DOM in the same synchronous pass.
3.  **Defer Below-the-Fold Packages:** Any package pricing tables or detailed lists below the initial screen must be wrapped in a lazy-loaded component (`React.lazy`).

---
