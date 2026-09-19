/**
 * STEP 4 transition fix: hover/focus/touch chunk prefetch.
 *
 * React.lazy() resolves through the bundler module cache, so a hover-time
 * dynamic import of the SAME specifier makes the later navigation render
 * instantly instead of waiting on a cold chunk fetch (the bulk of the
 * reported ~3s transitions on slow networks; API data follows with 5-min
 * staleTime caching). Fire-and-forget: un-awaited and rejection-swallowing
 * (an offline hover must never throw into the nav).
 *
 * Kept in its own module (not public-routes.tsx) so no file mixes component
 * and non-component exports (react-refresh/only-export-components).
 */
function prefetch(specifier: () => Promise<unknown>): void {
  try {
    const result = specifier()
    if (result && typeof (result as Promise<unknown>).catch === "function") {
      ;(result as Promise<unknown>).catch(() => {})
    }
  } catch {
    /* no-op — prefetch is best-effort */
  }
}

export const preloadPaketChunk = (): void =>
  prefetch(() => import("@/pages/paket/paket-page"))
export const preloadPaketDetailChunk = (): void =>
  prefetch(() => import("@/pages/paket/paket-detail"))
export const preloadGaleriChunk = (): void =>
  prefetch(() => import("@/pages/gallery/galery-page"))
export const preloadGaleriCategoryChunk = (): void =>
  prefetch(() => import("@/pages/gallery/galeri-category-page"))

/** Map a nav href to its chunk preloader (prefix match covers /:id slugs). */
export function preloadRouteChunk(href: string): void {
  if (href.startsWith("/paket/")) {
    preloadPaketDetailChunk()
    return
  }
  if (href.startsWith("/paket")) {
    preloadPaketChunk()
    return
  }
  if (href.startsWith("/galeri")) {
    preloadGaleriChunk()
    preloadGaleriCategoryChunk()
  }
}
