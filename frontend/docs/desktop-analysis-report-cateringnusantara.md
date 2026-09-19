# File: desktop-analysis-report-cateringnusantara.md
# Desktop Performance Analysis & Remediation Report - Catering Nusantara
**Target Audience:** OpenCode Autonomous AI Agent / Lead Engineer
**Objective:** Harden the Desktop architecture to maintain and lock the 96/100 peak performance while resolving underlying fragility and layout shifts.
**Current State:** Peak score of 96 on `/`, but structurally fragile. High risk of regression due to unoptimized grid rendering and third-party script bloat.

## 1. Executive Summary: The Desktop Fragility
While desktop environments benefit from high-tier CPUs and gigabit network connections, a score of 96 is a false positive if the underlying architecture relies on brute force. The current codebase suffers from missing layout boundaries (causing CLS), massive vendor bundles, and inefficient raster delivery[cite: 53]. If a desktop user simulates a "Fast 3G" connection or uses a lower-end laptop, the score will immediately collapse. 

## 2. Desktop-Specific Architectural Fixes

### A. The Cloudinary Transformation Gap & Responsive Grids
Desktop layouts utilize multi-column grids (e.g., 3-column or 4-column layouts on `/paket` and `/galeri`). 
*   **The Flaw:** Raw images are being fetched without size bounding[cite: 53]. While a desktop screen is 1920px wide, an image inside a 3-column grid only needs to be ~450px wide. 
*   **The AI Action:** The AI Agent must rewrite the `<Image>` component to inject dynamic Cloudinary parameters based on the container size.
    *   *Implementation:* `https://res.cloudinary.com/[id]/image/upload/f_auto,q_auto,w_600/v1/[img]`
    *   *Requirement:* Ensure all `<img>` tags utilize the `srcSet` attribute to explicitly define desktop-tier resolutions (`1024w`, `1440w`, `1920w`) so the browser can negotiate the optimal file.

### B. Cumulative Layout Shift (CLS) Eradication
Because desktop connections pull multiple images concurrently for grid layouts, unequal loading times cause subsequent content (like footers or text blocks) to violently shift downward once the images render.
*   **The Flaw:** Images lack hardcoded dimensional reservations[cite: 53].
*   **The AI Action:** 
    *   Every single image container must utilize Tailwind's aspect ratio utilities (e.g., `aspect-video`, `aspect-[4/3]`, `aspect-square`).
    *   Inject explicit `width` and `height` properties matching the intrinsic ratio directly into the HTML `<img>` tag to force the browser to pre-allocate exact pixel blocks before the network request finishes.

### C. Vite/Next.js Code Splitting & Vendor Bloat
Desktop environments process the entire JavaScript payload much faster, but parsing heavy vendor libraries (like GSAP, React-DOM, and analytics) still penalizes the Time to Interactive (TTI).
*   **The Flaw:** All UI components, including heavy Modals, SurveyJS, and Carousels, are bundled into the primary `vendor` chunk[cite: 53].
*   **The AI Action:**
    *   **Manual Chunking:** In `vite.config.ts`, the AI must configure `manualChunks` to split `gsap`, `framer-motion`, and `react-vendor` into isolated `.js` files.
    *   **Component Lazy Loading:** The AI must wrap the Footer, heavy Modal overlays, and off-screen sections in `React.lazy()` or Next.js `dynamic()`.

### D. ScrollTrigger & CSS Animation Compositing
Desktop users experience the site with a mouse, making hover states and scroll-linked animations highly scrutinized.
*   **The Flaw:** Hover effects on package cards are triggering layout recalculations (animating `margin`, `padding`, or `border-width`), which run synchronously on the CPU[cite: 53].
*   **The AI Action:**
    *   Audit all Tailwind `hover:` classes. Strip any property that alters the document flow.
    *   Strictly enforce `transform: scale(1.05)` and `translate` for hover states. 
    *   For GSAP `ScrollTrigger`, the AI must ensure `ScrollTrigger.refresh()` is not thrashing on window resize, which commonly occurs when desktop users snap windows. Implement a 200ms debounce on all resize events.
