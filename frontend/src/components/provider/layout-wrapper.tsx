import ReactLenis from "lenis/react"
import SiteFooter from "../ui/core/layout/site-footer"
import SiteBorder from "../ui/core/layout/nav/site-border"
import { Outlet, useLocation } from "react-router"

import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import { useCatalogStore } from "@/store/catalog-store"
import { useDetailStore } from "@/store/detail-store"
import { useGaleriStore } from "@/store/galeri-store"
import CTABlock from "../ui/core/layout/cta-block"
import { useIsMobile } from "@/hooks/use-mobile"
import { LenisGsapSync } from "./lenis-gsap-sync"
import { ScrollToTop } from "./scroll-to-top"
import { RouteSeoResolver } from "./route-seo-resolver"
import { SiteHeader } from "../ui/core/layout/nav/site-header"

export function LayoutWrapper() {
  const preloaderDone = usePreloaderStore((s) => s.done)
  const isMobile = useIsMobile()
  const { pathname } = useLocation()

  const catalogEnded = useCatalogStore((s) => s.ended)
  const detailReady = useDetailStore((s) => s.ready)
  const galeriReady = useGaleriStore((s) => s.ready)

  const segments = pathname.split("/").filter(Boolean)
  const isCatalogPaket = segments[0] === "paket" && segments.length === 1
  const isDetailPaket = segments[0] === "paket" && segments.length > 1

  const showChrome = isDetailPaket
    ? detailReady
    : isCatalogPaket
      ? catalogEnded
      : pathname.startsWith("/galeri")
        ? galeriReady
        : true

  // Penentu kondisi route homepage
  const isHome = pathname === "/"

  return (
    <ReactLenis root options={{ autoRaf: false }}>
      <LenisGsapSync />
      <div className="bg-background">
        <ScrollToTop />
        <RouteSeoResolver />
        {!isMobile && <SiteBorder />}
        {preloaderDone && <SiteHeader />}

        <div
          className={cn(
            "relative z-10 w-full overflow-x-hidden bg-background md:overflow-visible",
            !isHome && "overflow-visible"
          )}
        >
          <div
            className={cn(
              "relative mx-auto flex h-full w-full flex-col content-center gap-10 sm:gap-8 md:overflow-visible"
            )}
          >
            <Outlet />
            {preloaderDone && showChrome && <CTABlock />}
          </div>
        </div>

        {/*
          Dinamis Fade Overlay:
          - Halaman "/" (Home) : Overlay di BAWAH (bottom-0) dengan gradien bottom-up.
          - Halaman selain "/" : Overlay di ATAS (top-0) dengan gradien top-down.
        */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none fixed inset-x-0 z-20 transition-all duration-300",
            isHome
              ? "top-0 h-24 bg-linear-to-b from-background via-background/80 to-transparent md:h-28"
              : "bottom-0 h-32 bg-linear-to-t from-background via-background/80 to-transparent md:h-40"
          )}
        />

        {preloaderDone && showChrome && <SiteFooter />}
      </div>
    </ReactLenis>
  )
}
