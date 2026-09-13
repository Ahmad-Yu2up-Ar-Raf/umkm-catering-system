import { Suspense, lazy } from "react"

// P5 perf: public catalog routes are code-split so the landing bundle stays
// lean — each chunk loads on navigation. Home stays eager (LCP). Admin stays
// eager (out of scope; keeps guards + dashboard atomic).
const PaketPage = lazy(() => import("@/pages/paket/paket-page"))
const PaketDetail = lazy(() => import("@/pages/paket/paket-detail"))
const GaleryPage = lazy(() => import("@/pages/gallery/galery-page"))
const GaleriCategoryPage = lazy(
  () => import("@/pages/gallery/galeri-category-page")
)

/** Minimal route fallback — the blocks render their own skeletons on mount. */
export function RouteFallback() {
  return <div aria-hidden="true" className="min-h-[60lvh] w-full" />
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const PublicPaketPage = () => withSuspense(<PaketPage />)
export const PublicPaketDetail = () => withSuspense(<PaketDetail />)
export const PublicGaleryPage = () => withSuspense(<GaleryPage />)
export const PublicGaleriCategoryPage = () => withSuspense(<GaleriCategoryPage />)
