import ReactLenis from "lenis/react"
import SiteFooter from "../ui/core/layout/site-footer"
import SiteBorder from "../ui/core/layout/nav/site-border"
import { Outlet, useLocation } from "react-router"

import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import { useCatalogStore } from "@/store/catalog-store"
import CTABlock from "../ui/core/layout/cta-block"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollToTop } from "./scroll-to-top"
import { SiteHeader } from "../ui/core/layout/nav/site-header"

export function LayoutWrapper() {
  // Chrome (header + footer) is NOT mounted until the preloader finishes, so
  // the Hero — never the footer — is the first thing rendered after the curtain
  // lifts.
  const preloaderDone = usePreloaderStore((s) => s.done)
  const isMobile = useIsMobile()
  const { pathname } = useLocation()

  // On /paket, the CTA band + footer stay hidden until the infinite catalog
  // reaches its end (`useCatalogStore.ended`), so they never appear while the
  // grid is still scrollable. Everywhere else they render as usual.
  const catalogEnded = useCatalogStore((s) => s.ended)
  const showChrome = pathname !== "/paket" || catalogEnded

  return (
    <ReactLenis root>
      {/* Global scroll restoration — resets to the top on every route change
          (Lenis-aware, so the next page never renders at the old scroll depth). */}
      <ScrollToTop />
      {!isMobile && <SiteBorder />}
      {preloaderDone && <SiteHeader />}
      {/* Add padding-bottom on mobile to account for fixed navbar */}
      {/* Main content sits ABOVE the sticky footer's fixed inner (z-stacking),
          so the Hero — not the footer — is what the user sees after the
          preloader lifts. */}
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden bg-background md:overflow-visible"
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex h-full w-full flex-col content-center gap-10 overflow-x-hidden sm:gap-8 md:overflow-visible "
          )}
        >
          <Outlet />
          {preloaderDone && showChrome && <CTABlock />}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-30 bg-linear-to-t from-background/0 via-background/80 to-background md:hidden" />

          <div className="pointer-events-none fixed inset-0 top-0 hidden h-150 bg-linear-to-t from-background/0 via-background/0 to-background md:inline md:h-50" />
        </div>
      </div>
      {preloaderDone && showChrome && <SiteFooter />}
    </ReactLenis>
  )
}
