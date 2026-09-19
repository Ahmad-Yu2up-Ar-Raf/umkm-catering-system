# Desktop Performance Analysis Report - Catering Nusantara
**Target Audience:** AI Developer Agent (Opencode)
**Objective:** Standardize and optimize Desktop Core Web Vitals based on the shared codebase bottlenecks.

*Note: While Desktop CPUs and network connections typically yield higher baseline scores than Mobile, the architectural bottlenecks remain identical and will severely penalize the Desktop LCP and CLS if left unaddressed.*

## Global Desktop Architecture Bottlenecks

### 1. The Cloudinary Transformation Gap
The most critical failure point across the entire application is how images are fetched from the Cloudinary CDN. The desktop layouts render larger grid areas, which exacerbates the payload size.
* **The Issue:** Raw `.png` and `.jpg` files are being fetched without size bounding or format negotiation.
* **Best Practice Fix:** 
  The AI Agent must rewrite the image utility/loader to guarantee the following URL structure:
  `https://res.cloudinary.com/[cloud_name]/image/upload/f_auto,q_auto,w_[width]/v[version]/[public_id]`
  - `f_auto`: Automatically delivers AVIF or WebP based on the browser.
  - `q_auto`: Intelligent quality compression.
  - `w_[width]`: Never serve a 4000px image inside a 600px desktop grid column.

### 2. Next.js / React Hydration Overhead
* **The Issue:** The main thread is blocked by large React vendor chunks (`vendor-mo.js`). The desktop viewport is processing complex DOM trees (especially on the `/galeri/semua` route) simultaneously.
* **Best Practice Fix:**
  - **Dynamic Imports (`next/dynamic` or `React.lazy`):** Any component below the desktop viewport (like footers, heavy carousels, or Modals) MUST be dynamically imported.
  - **Third-Party Script Optimization:** SurveyJS and PostHog are severely penalizing the Time to Interactive (TTI). Use the `next/script` component with `strategy="lazyOnload"` or `strategy="worker"` for these tools.

### 3. Cumulative Layout Shift (CLS) on Desktop Grid
* **The Issue:** Because desktop uses a wider grid, images arriving late cause the rest of the layout to jump.
* **Best Practice Fix:** Every single `<img>` tag or Cloudinary component must have explicit `width` and `height` attributes defined in the HTML (or use Tailwind's `aspect-ratio` utility `aspect-video`, `aspect-square`) to reserve the exact layout space before the image downloads.

### 4. CSS Uncomposited Animations
* **The Issue:** Hover effects on desktop (like hovering over package cards) are triggering layout recalculations.
* **Best Practice Fix:** Audit Tailwind classes. Replace any animations that modify `margin`, `padding`, `width`, or `height` with `transform: translate()` and `transform: scale()`.
