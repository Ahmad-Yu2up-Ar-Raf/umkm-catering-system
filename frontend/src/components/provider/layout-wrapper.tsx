import ReactLenis from "lenis/react"
import SiteFooter from "../ui/core/layout/nav/site-footer"
import SiteBorder from "../ui/core/layout/nav/site-border"
import { SiteHeader } from "../ui/core/layout/nav/site-header"
import { Outlet } from "react-router"

import { cn } from "@/lib/utils"
import { usePreloaderStore } from "@/store/preloader-store"
import ContactBlock from "../ui/core/block/home/contact/contact-block"
import { useIsMobile } from "@/hooks/use-mobile"

export function LayoutWrapper() {
  // Chrome (header + footer) is NOT mounted until the preloader finishes, so
  // the Hero — never the footer — is the first thing rendered after the curtain
  // lifts.
  const preloaderDone = usePreloaderStore((s) => s.done)
  const isMobile = useIsMobile()
  return (
    <ReactLenis root>
      {!isMobile && <SiteBorder />}
      {/* {preloaderDone && <SiteHeader />} */}
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
            "relative mx-auto flex h-full w-full flex-col content-center gap-10 overflow-x-hidden sm:gap-8 md:overflow-visible lg:gap-25"
          )}
        >
          <Outlet />
          {preloaderDone && <ContactBlock />}
          <div className="pointer-events-none absolute inset-0 -top-40 h-200 bg-linear-to-t from-background/0 via-background/0 to-background md:hidden md:h-50" />

          {/* <div className="pointer-events-none fixed inset-0 top-0 h-150 bg-linear-to-t from-background/0 via-background/0 to-background   md:h-50" /> */}
        </div>
      </div>
      {preloaderDone && (
        <>
          <SiteFooter />
        </>
      )}
    </ReactLenis>
  )
}
